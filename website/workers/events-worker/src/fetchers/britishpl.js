/**
 * Scraper for British Powerlifting (GBPF) calendar.
 * https://www.britishpowerlifting.org/calendar/
 * British Powerlifting uses a WordPress-based site.
 */

import { fetchTribeEvents } from './tribe-events.js';
import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const BASE_URL = 'https://www.britishpowerlifting.org';
const CALENDAR_URL = 'https://www.britishpowerlifting.org/calendar/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

export async function fetchBritishPL() {
  try {
    // Strategy 1: Try Tribe Events Calendar API
    const tribeEvents = await fetchTribeEvents(BASE_URL, 'britishpl', 'powerlifting');
    if (tribeEvents.length > 0) {
      // Override country to GB for all events
      return tribeEvents.map((e) => ({ ...e, country: 'GB' }));
    }

    // Strategy 2: Scrape the calendar page
    return await scrapeCalendar();
  } catch (err) {
    console.error('[britishpl] Fetch error:', err.message);
    return [];
  }
}

async function scrapeCalendar() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(CALENDAR_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[britishpl] Page returned ${resp.status}`);
      return [];
    }

    const html = await resp.text();
    const events = [];

    // Try JSON-LD
    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        const normalized = await normalizeEvent({
          source: 'britishpl',
          type: 'powerlifting',
          name: ev.name || '',
          startDate: ev.startDate || '',
          endDate: ev.endDate || '',
          venue: ev.location?.name || '',
          city: ev.location?.address?.addressLocality || '',
          state: ev.location?.address?.addressRegion || '',
          country: 'GB',
          url: ev.url || CALENDAR_URL,
          description: ev.description || '',
        });
        events.push(normalized);
      }
      return events;
    }

    // HTMLRewriter parsing
    const parsedEvents = await parseCalendarHtml(html);
    for (const ev of parsedEvents) {
      const normalized = await normalizeEvent({
        source: 'britishpl',
        type: 'powerlifting',
        ...ev,
        country: 'GB',
      });
      events.push(normalized);
    }

    // Regex fallback
    if (events.length === 0) {
      const regexEvents = extractEventsRegex(html);
      for (const ev of regexEvents) {
        const normalized = await normalizeEvent({
          source: 'britishpl',
          type: 'powerlifting',
          ...ev,
          country: 'GB',
        });
        events.push(normalized);
      }
    }

    return events;
  } catch (err) {
    console.error('[britishpl] Scrape error:', err.message);
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

async function parseCalendarHtml(html) {
  const events = [];
  let current = null;
  let captureTitle = false;
  let captureDate = false;
  let captureVenue = false;

  const res = new Response(html);
  const parsed = new HTMLRewriter()
    .on('.tribe-events-calendar-list__event, .tribe-common-g-row, .type-tribe_events, .event-item, article[class*="event"]', {
      element() {
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', venue: '', city: '' };
      },
    })
    .on('.tribe-events-calendar-list__event-title a, .tribe-events-list-event-title a, h2 a, h3 a', {
      element(el) {
        if (!current) return;
        const href = el.getAttribute('href');
        if (href) current.url = href;
        captureTitle = true;
      },
      text(text) {
        if (captureTitle && current) {
          current.name += text.text;
          if (text.lastInTextNode) captureTitle = false;
        }
      },
    })
    .on('[datetime], time, .tribe-event-schedule-details', {
      element(el) {
        if (!current) return;
        const dt = el.getAttribute('datetime');
        if (dt && !current.startDate) {
          current.startDate = dt;
        }
        captureDate = true;
      },
      text(text) {
        if (captureDate && current && !current.startDate) {
          const d = normalizeDate(text.text.trim());
          if (d) current.startDate = d;
        }
        if (text.lastInTextNode) captureDate = false;
      },
    })
    .on('.tribe-events-calendar-list__event-venue, .tribe-venue, .event-venue', {
      element() {
        captureVenue = true;
      },
      text(text) {
        if (captureVenue && current) {
          current.venue += text.text;
          if (text.lastInTextNode) captureVenue = false;
        }
      },
    })
    .transform(res);

  await parsed.text();

  if (current && current.name) {
    events.push(current);
  }

  return events.filter((e) => e.name.trim());
}

function extractEventsRegex(html) {
  const events = [];
  // Look for date patterns near event names
  // UK date format: "DD Month YYYY" or "D Month YYYY"
  const text = stripHtml(html);
  const pattern =
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*[-\u2013\u2014:.]?\s*([A-Z][^\n]{5,80})/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    events.push({
      name: match[2].trim(),
      startDate: match[1],
    });
  }

  // Also try "Month DD, YYYY" format
  const usPattern =
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\s*[-\u2013\u2014:.]?\s*([A-Z][^\n]{5,80})/gi;
  while ((match = usPattern.exec(text)) !== null) {
    events.push({
      name: match[2].trim(),
      startDate: match[1],
    });
  }

  return events;
}
