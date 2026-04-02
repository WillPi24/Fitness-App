/**
 * Scraper for IFBB Professional League schedule.
 * Tries the Tribe Events API first (WordPress plugin), falls back to HTML scraping.
 */

import { fetchTribeEvents } from './tribe-events.js';
import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const BASE_URL = 'https://www.ifbbpro.com';
const SCHEDULE_URL = 'https://www.ifbbpro.com/schedule/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

export async function fetchIFBBPro() {
  try {
    // Strategy 1: Try the Tribe Events Calendar API (IFBB Pro uses WordPress)
    const tribeEvents = await fetchTribeEvents(BASE_URL, 'ifbbpro', 'bodybuilding');
    if (tribeEvents.length > 0) {
      return tribeEvents;
    }

    // Strategy 2: Scrape the schedule page
    return await scrapeSchedulePage();
  } catch (err) {
    console.error('[ifbbpro] Fetch error:', err.message);
    return [];
  }
}

async function scrapeSchedulePage() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(SCHEDULE_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[ifbbpro] Page returned ${resp.status}`);
      return [];
    }

    const html = await resp.text();
    const events = [];

    // Try JSON-LD first
    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        const normalized = await normalizeEvent({
          source: 'ifbbpro',
          type: 'bodybuilding',
          name: ev.name || '',
          startDate: ev.startDate || '',
          endDate: ev.endDate || '',
          venue: ev.location?.name || '',
          city: ev.location?.address?.addressLocality || '',
          state: ev.location?.address?.addressRegion || '',
          country: ev.location?.address?.addressCountry || 'US',
          url: ev.url || SCHEDULE_URL,
          description: ev.description || '',
        });
        events.push(normalized);
      }
      return events;
    }

    // HTMLRewriter parsing
    const parsedEvents = await parseScheduleHtml(html);
    for (const ev of parsedEvents) {
      const normalized = await normalizeEvent({
        source: 'ifbbpro',
        type: 'bodybuilding',
        ...ev,
        country: ev.country || 'US',
      });
      events.push(normalized);
    }

    return events;
  } catch (err) {
    console.error('[ifbbpro] Scrape error:', err.message);
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

async function parseScheduleHtml(html) {
  const events = [];
  let current = null;
  let captureTitle = false;
  let captureDate = false;
  let captureLocation = false;

  const res = new Response(html);
  const parsed = new HTMLRewriter()
    // Schedule items (IFBB Pro often uses tables or structured divs)
    .on('tr, .schedule-item, .event-item, article, .tribe-events-calendar-list__event, [class*="schedule-row"]', {
      element() {
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', city: '', state: '' };
      },
    })
    // Links that might be event titles
    .on('a', {
      element(el) {
        if (!current) return;
        const href = el.getAttribute('href') || '';
        // Heuristic: links to event detail pages
        if (
          href.includes('/event') ||
          href.includes('/schedule') ||
          href.includes('/contest')
        ) {
          if (!current.url) current.url = href;
          captureTitle = true;
        }
      },
      text(text) {
        if (captureTitle && current) {
          current.name += text.text;
          if (text.lastInTextNode) captureTitle = false;
        }
      },
    })
    // Date elements
    .on('[datetime], time, .event-date, .schedule-date, td:first-child', {
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
    // Location info
    .on('.event-location, .schedule-location, .venue, td:nth-child(3)', {
      element() {
        captureLocation = true;
      },
      text(text) {
        if (captureLocation && current) {
          current.city += text.text;
          if (text.lastInTextNode) captureLocation = false;
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
