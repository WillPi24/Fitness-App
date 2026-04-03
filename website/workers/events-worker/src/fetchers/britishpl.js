/**
 * Scraper for British Powerlifting upcoming championships and events.
 * The old /calendar route currently redirects to a news post, while the real
 * event listings live on dedicated page-builder pages.
 */

import { fetchTribeEvents } from './tribe-events.js';
import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const BASE_URL = 'https://www.britishpowerlifting.org';
const LISTING_URLS = [
  'https://www.britishpowerlifting.org/upcoming-championships/',
  'https://www.britishpowerlifting.org/upcoming-events-competitions/',
];
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;

export async function fetchBritishPL() {
  try {
    // Strategy 1: Try Tribe Events Calendar API
    const tribeEvents = await fetchTribeEvents(BASE_URL, 'britishpl', 'powerlifting', 'GB');
    if (tribeEvents.length > 0) {
      return tribeEvents.map((e) => ({ ...e, country: 'GB' }));
    }

    // Strategy 2: Scrape the real listing pages
    return await scrapeListingPages();
  } catch (err) {
    console.error('[britishpl] Fetch error:', err.message);
    return [];
  }
}

async function scrapeListingPages() {
  const allEvents = [];

  for (const url of LISTING_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });

      if (!resp.ok) {
        console.error(`[britishpl] Page returned ${resp.status}: ${url}`);
        continue;
      }

      const html = await resp.text();
      const parsedEvents = extractContentRowCards(html);

      for (const ev of parsedEvents) {
        const normalized = await normalizeEvent({
          source: 'britishpl',
          type: 'powerlifting',
          ...ev,
          country: 'GB',
        });
        allEvents.push(normalized);
      }
    } catch (err) {
      console.error(`[britishpl] Scrape error for ${url}:`, err.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  return allEvents;
}

function extractContentRowCards(html) {
  const events = [];
  const cardPattern = /<a[^>]+href="([^"]+)"[^>]+class="content_row_card"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = cardPattern.exec(html)) !== null) {
    const [, href, cardHtml] = match;
    const titleMatch = cardHtml.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
    const dateMatch = cardHtml.match(/<p[^>]+class="dates"[^>]*>([\s\S]*?)<\/p>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const dateRange = dateMatch ? stripHtml(dateMatch[1]) : '';
    const parsedDates = parseBritishDateRange(dateRange);

    if (!title || !parsedDates.startDate) {
      continue;
    }

    events.push({
      name: title,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
    });
  }

  return events;
}

function parseBritishDateRange(raw) {
  const cleaned = raw.replace(/\s+/g, ' ').trim();

  const fullRange = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s*-\s*(\d{1,2})\s+([A-Za-z]{3,9}),\s*(\d{4})$/
  );
  if (fullRange) {
    const [, startDay, startMonth, endDay, endMonth, year] = fullRange;
    return {
      startDate: normalizeDate(`${startDay} ${startMonth} ${year}`),
      endDate: normalizeDate(`${endDay} ${endMonth} ${year}`),
    };
  }

  const sameMonthRange = cleaned.match(
    /^(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-z]{3,9}),\s*(\d{4})$/
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
