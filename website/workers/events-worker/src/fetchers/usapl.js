/**
 * Scraper for USAPL (USA Powerlifting) calendar.
 * Uses HTMLRewriter to parse event data from the WordPress events calendar page.
 */

import { normalizeEvent, normalizeDate } from '../lib/normalize.js';

const CALENDAR_URL = 'https://www.usapowerlifting.com/calendar/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

/**
 * Parse USAPL calendar page for events.
 * USAPL uses The Events Calendar WordPress plugin which renders events as
 * structured HTML with tribe-events classes.
 */
export async function fetchUSAPL() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(CALENDAR_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[usapl] Page returned ${resp.status}`);
      return [];
    }

    const html = await resp.text();
    const events = [];

    // Strategy 1: Try to find JSON-LD structured data (many event sites include this)
    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        const normalized = await normalizeEvent({
          source: 'usapl',
          type: 'powerlifting',
          name: ev.name || '',
          startDate: ev.startDate || '',
          endDate: ev.endDate || '',
          venue: ev.location?.name || '',
          address: ev.location?.address?.streetAddress || '',
          city: ev.location?.address?.addressLocality || '',
          state: ev.location?.address?.addressRegion || '',
          country: ev.location?.address?.addressCountry || 'US',
          url: ev.url || CALENDAR_URL,
          description: ev.description || '',
        });
        events.push(normalized);
      }
      return events;
    }

    // Strategy 2: Parse HTML using HTMLRewriter for Tribe Events Calendar markup
    const parsedEvents = await parseWithHtmlRewriter(html);
    for (const ev of parsedEvents) {
      const normalized = await normalizeEvent({
        source: 'usapl',
        type: 'powerlifting',
        ...ev,
        country: ev.country || 'US',
      });
      events.push(normalized);
    }

    // Strategy 3: Regex fallback -- look for event-like patterns in the raw HTML
    if (events.length === 0) {
      const regexEvents = extractEventsRegex(html);
      for (const ev of regexEvents) {
        const normalized = await normalizeEvent({
          source: 'usapl',
          type: 'powerlifting',
          ...ev,
          country: 'US',
        });
        events.push(normalized);
      }
    }

    return events;
  } catch (err) {
    console.error('[usapl] Fetch error:', err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extract events from JSON-LD script tags.
 */
function extractJsonLd(html) {
  const events = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Event') {
          events.push(item);
        }
        // Some sites wrap events in @graph
        if (item['@graph']) {
          for (const node of item['@graph']) {
            if (node['@type'] === 'Event') {
              events.push(node);
            }
          }
        }
      }
    } catch {
      // Invalid JSON -- skip
    }
  }
  return events;
}

/**
 * Use HTMLRewriter to parse Tribe Events Calendar markup.
 */
async function parseWithHtmlRewriter(html) {
  const events = [];
  let current = null;
  let captureTitle = false;
  let captureDate = false;
  let captureVenue = false;

  const res = new Response(html);
  const parsed = new HTMLRewriter()
    // Tribe Events list items
    .on('.tribe-events-calendar-list__event, .tribe-common-g-row, .type-tribe_events, [class*="tribe-events-l"]', {
      element() {
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', venue: '', city: '', state: '' };
      },
    })
    // Event title links
    .on('.tribe-events-calendar-list__event-title a, .tribe-events-list-event-title a, .tribe-event-url, h2.tribe-events-list-event-title a, h3 a[href*="event"]', {
      element(el) {
        if (current) {
          const href = el.getAttribute('href');
          if (href) current.url = href;
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
    // Event date via datetime attribute
    .on('[datetime], time, .tribe-events-calendar-list__event-datetime, .tribe-event-schedule-details', {
      element(el) {
        if (current) {
          const dt = el.getAttribute('datetime');
          if (dt && !current.startDate) {
            current.startDate = dt;
          }
          captureDate = true;
        }
      },
      text(text) {
        if (captureDate && current && !current.startDate) {
          const dateStr = text.text.trim();
          const parsed = normalizeDate(dateStr);
          if (parsed) current.startDate = parsed;
        }
        if (text.lastInTextNode) captureDate = false;
      },
    })
    // Venue information
    .on('.tribe-events-calendar-list__event-venue, .tribe-venue, .tribe-venue-name', {
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

  // Push last event
  if (current && current.name) {
    events.push(current);
  }

  return events.filter((e) => e.name.trim());
}

/**
 * Regex fallback: extract event-like patterns from raw HTML.
 */
function extractEventsRegex(html) {
  const events = [];
  // Look for headings followed by dates
  const eventPattern =
    /<(?:h[1-4]|a)[^>]*>([^<]{5,100})<\/(?:h[1-4]|a)>[\s\S]{0,500}?(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b)/gi;
  let match;
  while ((match = eventPattern.exec(html)) !== null) {
    const name = match[1].replace(/<[^>]*>/g, '').trim();
    const dateStr = match[2];
    if (name && dateStr) {
      events.push({ name, startDate: dateStr });
    }
  }
  return events;
}
