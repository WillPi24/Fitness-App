/**
 * Scraper for UKBFF (UK Bodybuilding & Fitness Federation) events.
 * https://www.ukbff.co.uk/events
 * Squarespace site -- events are rendered in structured markup.
 * For individual events, we attempt to fetch iCal data for structured dates.
 */

import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const EVENTS_URL = 'https://www.ukbff.co.uk/events';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

export async function fetchUKBFF() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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

    // Try JSON-LD first
    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        const normalized = await normalizeEvent({
          source: 'ukbff',
          type: 'bodybuilding',
          name: ev.name || '',
          startDate: ev.startDate || '',
          endDate: ev.endDate || '',
          venue: ev.location?.name || '',
          city: ev.location?.address?.addressLocality || '',
          country: 'GB',
          url: ev.url || EVENTS_URL,
          description: ev.description || '',
        });
        events.push(normalized);
      }
      return events;
    }

    // Squarespace event parsing
    const parsedEvents = await parseSquarespaceEvents(html);

    // For each event with a URL, try to get iCal data for better date info
    for (const ev of parsedEvents) {
      let enriched = ev;

      if (ev.url) {
        try {
          const icalData = await fetchIcal(ev.url);
          if (icalData) {
            enriched = { ...ev, ...icalData };
          }
        } catch {
          // iCal fetch failed -- use what we have
        }
      }

      const normalized = await normalizeEvent({
        source: 'ukbff',
        type: 'bodybuilding',
        ...enriched,
        country: 'GB',
      });
      events.push(normalized);
    }

    // Regex fallback
    if (events.length === 0) {
      const regexEvents = extractEventsRegex(html);
      for (const ev of regexEvents) {
        const normalized = await normalizeEvent({
          source: 'ukbff',
          type: 'bodybuilding',
          ...ev,
          country: 'GB',
        });
        events.push(normalized);
      }
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
 * Parse Squarespace event listing. Squarespace typically renders events with
 * structured classes like .eventlist-event, .eventlist-title, etc.
 */
async function parseSquarespaceEvents(html) {
  const events = [];
  const articlePattern = /<article class="eventlist-event eventlist-event--upcoming[\s\S]*?<\/article>/gi;

  let match;
  while ((match = articlePattern.exec(html)) !== null) {
    const article = match[0];
    const name = cleanText(
      extractMatch(article, /<h1 class="eventlist-title">\s*<a [^>]*>([\s\S]*?)<\/a>/i) ||
      extractMatch(article, /alt="([^"]+)"/i)
    );
    const startDate = normalizeDate(
      extractMatch(article, /<time class="event-date" datetime="([^"]+)"/i) ||
      cleanText(extractMatch(article, /<li class="eventlist-meta-item eventlist-meta-date[\s\S]*?<time[^>]*>([\s\S]*?)<\/time>/i))
    );
    const url = absoluteUrl(
      extractMatch(article, /<h1 class="eventlist-title">\s*<a href="([^"]+)"/i) ||
      extractMatch(article, /<a href="([^"]+\?format=ical)"[^>]*class="eventlist-meta-export-ical"/i)
    );
    const venue = cleanVenue(
      extractMatch(article, /<li class="eventlist-meta-item eventlist-meta-address[\s\S]*?>([\s\S]*?)<\/li>/i)
    );
    const location = parseGoogleCalendarLocation(
      extractMatch(article, /<a href="([^"]*google\.com\/calendar\/event\?[^"]*)"/i)
    );

    if (!name || !startDate) continue;

    events.push({
      name,
      startDate,
      url,
      venue: venue || location.venue || '',
      address: location.address || '',
      city: location.city || '',
    });
  }

  return events;
}

/**
 * Fetch iCal data for an individual Squarespace event page.
 * Squarespace exposes iCal at {event-url}?format=ical
 */
async function fetchIcal(eventUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const icalUrl = eventUrl.includes('?')
      ? `${eventUrl}&format=ical`
      : `${eventUrl}?format=ical`;

    const resp = await fetch(icalUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) return null;

    const text = await resp.text();
    return parseIcal(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse a simple iCal VEVENT. We only need a few fields.
 */
function parseIcal(icalText) {
  const result = {};

  const dtstart = extractIcalProp(icalText, 'DTSTART');
  if (dtstart) result.startDate = normalizeIcalDate(dtstart);

  const dtend = extractIcalProp(icalText, 'DTEND');
  if (dtend) result.endDate = normalizeIcalDate(dtend);

  const location = extractIcalProp(icalText, 'LOCATION');
  if (location) {
    const parsedLocation = parseStructuredLocation(decodeIcalText(location));
    if (parsedLocation.venue) result.venue = parsedLocation.venue;
    if (parsedLocation.address) result.address = parsedLocation.address;
    if (parsedLocation.city) result.city = parsedLocation.city;
  }

  const summary = extractIcalProp(icalText, 'SUMMARY');
  if (summary) result.name = decodeIcalText(summary);

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract a property value from iCal text.
 * Handles properties with parameters like DTSTART;VALUE=DATE:20260315
 */
function extractIcalProp(text, prop) {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const regex = new RegExp(`^${prop}(?:;[^:\\r\\n]+)*:([^\\r\\n]*)$`, 'mi');
  const match = unfolded.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Convert iCal date formats to YYYY-MM-DD.
 * Handles: 20260315, 20260315T100000, 20260315T100000Z
 */
function normalizeIcalDate(icalDate) {
  const clean = icalDate.replace(/[^0-9T]/g, '');
  if (clean.length >= 8) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return normalizeDate(icalDate);
}

/**
 * Regex fallback for extracting events from raw HTML text.
 */
function extractEventsRegex(html) {
  const events = [];
  const text = stripHtml(html);

  // UK date format: "DD Month YYYY"
  const pattern =
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*[-\u2013\u2014:.]?\s*([A-Z][^\n]{5,80})/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    events.push({
      name: match[2].trim(),
      startDate: match[1],
    });
  }

  return events;
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

function decodeIcalText(value) {
  return (value || '')
    .replace(/\\n/g, ', ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/&amp\\?;/g, '&')
    .trim();
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
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(part) ||
    /^[A-Z]{1,2}\d[A-Z\d]?$/i.test(part);
}
