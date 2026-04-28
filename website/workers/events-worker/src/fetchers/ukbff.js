/**
 * Scraper for UKBFF (UK Bodybuilding & Fitness Federation) events.
 * https://www.ukbff.co.uk/events  -- Squarespace site.
 *
 * Strategy:
 *   1. JSON-LD (rare on Squarespace event lists, but reliable when present)
 *   2. Squarespace article markup -- title from <h1><a>, ISO date from
 *      <time datetime>, venue from .eventlist-meta-address, address/city from
 *      the embedded Google Calendar "Add to calendar" link
 *
 * The previous version merged in per-event iCal data; that path produced
 * truncated/garbled SUMMARY and LOCATION values in production (likely a CF
 * Worker line-folding edge case) and added 1 extra HTTPS fetch per event.
 * The article wrapper alone has everything we need.
 */

import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const EVENTS_URL = 'https://www.ukbff.co.uk/events';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 10000;

export async function fetchUKBFF() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(EVENTS_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[ukbff] Page returned ${resp.status}`);
      return [];
    }

    const html = await resp.text();
    const events = [];

    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        events.push(
          await normalizeEvent({
            source: 'ukbff',
            type: 'bodybuilding',
            country: 'GB',
            name: ev.name || '',
            startDate: ev.startDate || '',
            endDate: ev.endDate || '',
            venue: ev.location?.name || '',
            city: ev.location?.address?.addressLocality || '',
            url: ev.url || EVENTS_URL,
            description: ev.description || '',
          })
        );
      }
      console.log(`[ukbff] JSON-LD events: ${events.length}`);
      return events;
    }

    const cards = parseSquarespaceArticles(html);
    console.log(`[ukbff] Squarespace articles: ${cards.length}`);

    for (const card of cards) {
      events.push(
        await normalizeEvent({
          source: 'ukbff',
          type: 'bodybuilding',
          country: 'GB',
          ...card,
        })
      );
    }

    return events;
  } catch (err) {
    console.error('[ukbff] Fetch error:', err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function extractJsonLd(html) {
  const events = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Event') events.push(item);
        if (item['@graph']) {
          for (const node of item['@graph']) {
            if (node['@type'] === 'Event') events.push(node);
          }
        }
      }
    } catch {
      // skip
    }
  }
  return events;
}

/**
 * Extract events from Squarespace event list articles. Each event is wrapped
 * in <article class="eventlist-event eventlist-event--upcoming ...">.
 */
function parseSquarespaceArticles(html) {
  const articles = [];
  const articlePattern =
    /<article class="eventlist-event eventlist-event--upcoming[\s\S]*?<\/article>/gi;
  let m;
  while ((m = articlePattern.exec(html)) !== null) {
    const card = parseArticle(m[0]);
    if (card) articles.push(card);
  }
  return articles;
}

function parseArticle(article) {
  const name = cleanText(
    extractMatch(article, /<h1 class="eventlist-title">\s*<a [^>]*>([\s\S]*?)<\/a>/i) ||
      extractMatch(article, /<h1[^>]*class="[^"]*eventlist-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
  );

  // ISO date from datetime attribute -- the only reliable source on Squarespace.
  // Try the canonical .event-date class first, then fall back to ANY time[datetime]
  // inside the article.
  const startDate = normalizeDate(
    extractMatch(article, /<time class="event-date" datetime="([^"]+)"/i) ||
      extractMatch(article, /<time[^>]*\bdatetime="([^"]+)"/i)
  );

  const url = absoluteUrl(
    extractMatch(article, /<h1 class="eventlist-title">\s*<a href="([^"]+)"/i)
  );

  if (!name || !startDate) return null;

  const venue = cleanVenue(
    extractMatch(article, /<li class="eventlist-meta-item eventlist-meta-address[\s\S]*?>([\s\S]*?)<\/li>/i)
  );

  const location = parseGoogleCalendarLocation(
    extractMatch(article, /<a href="([^"]*google\.com\/calendar\/event\?[^"]*)"/i)
  );

  return {
    name,
    startDate,
    url,
    venue: venue || location.venue || '',
    address: location.address || '',
    city: location.city || '',
  };
}

function extractMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : '';
}

function cleanText(text) {
  return stripHtml(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanVenue(text) {
  return cleanText(text).replace(/\(map\)\s*$/i, '').trim();
}

function absoluteUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://www.ukbff.co.uk${url}`;
}

function parseGoogleCalendarLocation(rawUrl) {
  if (!rawUrl) return {};
  try {
    const decodedHref = rawUrl.replace(/&amp;/g, '&');
    const url = new URL(decodedHref);
    const location = url.searchParams.get('location');
    if (!location) return {};
    return parseStructuredLocation(decodeURIComponent(location));
  } catch {
    return {};
  }
}

function parseStructuredLocation(rawLocation) {
  const parts = cleanText(rawLocation)
    .split(',')
    .map((part) => cleanText(part))
    .filter(Boolean);
  const usefulParts = parts.filter((part) => !/^united kingdom$/i.test(part));
  const venue = usefulParts[0] || '';
  const addressParts = usefulParts.slice(1);

  let city = '';
  for (let i = addressParts.length - 1; i >= 0; i -= 1) {
    const part = addressParts[i];
    if (/^(england|scotland|wales|northern ireland)$/i.test(part)) continue;
    const cityWithPostcode = part.match(/^(.*\S)\s+([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i);
    if (cityWithPostcode) {
      city = cityWithPostcode[1];
      break;
    }
    if (looksLikeUkPostcode(part)) continue;
    city = part;
    break;
  }

  return {
    venue,
    address: addressParts.join(', '),
    city,
  };
}

function looksLikeUkPostcode(part) {
  return (
    /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(part) ||
    /^[A-Z]{1,2}\d[A-Z\d]?$/i.test(part)
  );
}
