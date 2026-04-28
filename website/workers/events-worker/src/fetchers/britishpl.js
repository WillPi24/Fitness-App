/**
 * Scraper for British Powerlifting upcoming championships and events.
 *
 * Strategy:
 *   1. HTMLRewriter against the listing pages (primary)
 *   2. Regex fallback against the same HTML if HTMLRewriter yields zero cards
 *      (defends against minor markup changes; either path is enough on its own)
 *
 * The Tribe Events Calendar JSON endpoint at /wp-json/tribe/events/v1/events
 * was retired by BP and is now a 404 -- previously called every cron and added
 * ~15s of latency for nothing.
 */

import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const BASE_URL = 'https://www.britishpowerlifting.org';
const LISTING_URLS = [
  `${BASE_URL}/upcoming-championships/`,
  `${BASE_URL}/upcoming-events-competitions/`,
];
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;

export async function fetchBritishPL() {
  const all = [];
  for (const url of LISTING_URLS) {
    try {
      const events = await scrapeListingPage(url);
      all.push(...events);
    } catch (err) {
      console.error(`[britishpl] Page error for ${url}:`, err.message);
    }
  }
  console.log(`[britishpl] Total events: ${all.length}`);
  return all;
}

async function scrapeListingPage(url) {
  const html = await fetchHtml(url);
  if (!html) return [];

  let cards = await parseWithHtmlRewriter(html);
  if (cards.length === 0) {
    console.warn(`[britishpl] HTMLRewriter found 0 cards on ${url}, trying regex fallback`);
    cards = parseWithRegex(html);
  }
  console.log(`[britishpl] ${url}: ${cards.length} candidate cards`);

  const events = [];
  for (const card of cards) {
    const name = stripHtml(card.name).trim();
    const dateRaw = stripHtml(card.dateRaw).trim();
    if (!name || !dateRaw) continue;

    const { startDate, endDate } = parseBritishDateRange(dateRaw);
    if (!startDate) continue;

    const normalized = await normalizeEvent({
      source: 'britishpl',
      type: 'powerlifting',
      country: 'GB',
      name,
      startDate,
      endDate,
      url: card.url.startsWith('http') ? card.url : `${BASE_URL}${card.url}`,
    });
    events.push(normalized);
  }
  return events;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error(`[britishpl] ${url} returned ${resp.status}`);
      return null;
    }
    return await resp.text();
  } catch (err) {
    console.error(`[britishpl] Fetch failed for ${url}:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * HTMLRewriter pass over a listing page. Each event is wrapped in
 *   <a class="content_row_card" href="...">
 *     <h5>Event Title</h5>
 *     <p class="dates">2 May, 2026</p>     OR  14 May - 17 May, 2026
 *     <p class="event-level">Divisional</p>
 *   </a>
 * The handlers maintain a single `current` accumulator across the rewrite;
 * `onEndTag` flushes it when the wrapping anchor closes.
 */
async function parseWithHtmlRewriter(html) {
  const events = [];
  let current = null;
  let captureTitle = false;
  let captureDate = false;

  const rewriter = new HTMLRewriter()
    .on('a.content_row_card', {
      element(el) {
        current = {
          name: '',
          dateRaw: '',
          url: el.getAttribute('href') || '',
        };
        el.onEndTag(() => {
          if (current) {
            events.push(current);
            current = null;
          }
        });
      },
    })
    .on('a.content_row_card h5', {
      element() {
        if (current) captureTitle = true;
      },
      text(text) {
        if (captureTitle && current) {
          current.name += text.text;
          if (text.lastInTextNode) captureTitle = false;
        }
      },
    })
    .on('a.content_row_card p.dates', {
      element() {
        if (current) captureDate = true;
      },
      text(text) {
        if (captureDate && current) {
          current.dateRaw += text.text;
          if (text.lastInTextNode) captureDate = false;
        }
      },
    });

  await rewriter.transform(new Response(html)).text();
  return events;
}

/**
 * Pure-regex fallback. Same selector logic as the HTMLRewriter pass; runs only
 * if the rewriter returns zero cards. Tolerates whitespace and inline HTML
 * inside titles / dates because cards.* are stripped/trimmed by the caller.
 */
export function parseWithRegex(html) {
  const events = [];
  const cardPattern =
    /<a[^>]+href="([^"]+)"[^>]+class="content_row_card"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = cardPattern.exec(html)) !== null) {
    const [, href, cardHtml] = match;
    const titleMatch = cardHtml.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
    const dateMatch = cardHtml.match(/<p[^>]+class="dates"[^>]*>([\s\S]*?)<\/p>/i);
    if (!titleMatch || !dateMatch) continue;
    events.push({
      name: titleMatch[1],
      dateRaw: dateMatch[1],
      url: href,
    });
  }
  return events;
}

/**
 * Parse the British date strings the listing pages render.
 * Exported so the snapshot regression script can assert against it.
 *
 *   "2 May, 2026"               -> single date
 *   "14 May - 17 May, 2026"     -> same-month range, month repeated
 *   "14 - 17 May, 2026"         -> same-month range, month not repeated (legacy)
 *   "30 Aug - 1 Sep, 2026"      -> cross-month range
 */
export function parseBritishDateRange(raw) {
  const cleaned = raw
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const fullRange = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s*-\s*(\d{1,2})\s+([A-Za-z]{3,9}),?\s*(\d{4})$/
  );
  if (fullRange) {
    const [, startDay, startMonth, endDay, endMonth, year] = fullRange;
    return {
      startDate: normalizeDate(`${startDay} ${startMonth} ${year}`),
      endDate: normalizeDate(`${endDay} ${endMonth} ${year}`),
    };
  }

  const sameMonthRange = cleaned.match(
    /^(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-z]{3,9}),?\s*(\d{4})$/
  );
  if (sameMonthRange) {
    const [, startDay, endDay, month, year] = sameMonthRange;
    return {
      startDate: normalizeDate(`${startDay} ${month} ${year}`),
      endDate: normalizeDate(`${endDay} ${month} ${year}`),
    };
  }

  const singleDate = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3,9}),?\s*(\d{4})$/);
  if (singleDate) {
    const [, day, month, year] = singleDate;
    const date = normalizeDate(`${day} ${month} ${year}`);
    return { startDate: date, endDate: date };
  }

  return {
    startDate: normalizeDate(cleaned),
    endDate: normalizeDate(cleaned),
  };
}
