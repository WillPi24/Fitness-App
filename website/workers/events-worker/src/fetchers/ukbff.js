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
  let current = null;
  let captureTitle = false;
  let captureDate = false;
  let captureLocation = false;

  const res = new Response(html);
  const parsed = new HTMLRewriter()
    // Squarespace event containers
    .on('.eventlist-event, .sqs-event, article[class*="event"], [data-type="events"] article', {
      element() {
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', venue: '', city: '' };
      },
    })
    // Event title
    .on('.eventlist-title a, .eventlist-title, h1.eventlist-title a, h2 a[href*="event"]', {
      element(el) {
        if (!current) return;
        const href = el.getAttribute('href');
        if (href) {
          // Make absolute URL if relative
          current.url = href.startsWith('http')
            ? href
            : `https://www.ukbff.co.uk${href}`;
        }
        captureTitle = true;
      },
      text(text) {
        if (captureTitle && current) {
          current.name += text.text;
          if (text.lastInTextNode) captureTitle = false;
        }
      },
    })
    // Event date (Squarespace uses time elements with datetime attributes)
    .on('.event-date, .eventlist-meta-date, time.event-date, time[datetime], .eventlist-datetag', {
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
    // Squarespace date tag parts (day/month/year rendered separately)
    .on('.eventlist-datetag-startdate .eventlist-datetag-startdate--month, .eventlist-datetag-startdate--day, .eventlist-datetag-startdate--year', {
      element() {
        captureDate = true;
      },
      text(text) {
        if (captureDate && current) {
          // Accumulate date parts
          if (!current._dateParts) current._dateParts = '';
          current._dateParts += ' ' + text.text.trim();
          if (text.lastInTextNode) captureDate = false;
        }
      },
    })
    // Event location
    .on('.eventlist-meta-address, .event-location, .eventlist-meta-address-line', {
      element() {
        captureLocation = true;
      },
      text(text) {
        if (captureLocation && current) {
          if (!current.venue) current.venue = '';
          current.venue += text.text;
          if (text.lastInTextNode) captureLocation = false;
        }
      },
    })
    .transform(res);

  await parsed.text();

  if (current && current.name) {
    events.push(current);
  }

  // Post-process: convert accumulated date parts to proper dates
  for (const ev of events) {
    if (!ev.startDate && ev._dateParts) {
      const d = normalizeDate(ev._dateParts.trim());
      if (d) ev.startDate = d;
    }
    delete ev._dateParts;
  }

  return events.filter((e) => e.name.trim());
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
  if (location) result.venue = location.replace(/\\,/g, ',').replace(/\\n/g, ', ');

  const summary = extractIcalProp(icalText, 'SUMMARY');
  if (summary) result.name = summary;

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract a property value from iCal text.
 * Handles properties with parameters like DTSTART;VALUE=DATE:20260315
 */
function extractIcalProp(text, prop) {
  // Match PROP:value or PROP;params:value
  const regex = new RegExp(`^${prop}[;:](.*)$`, 'mi');
  const match = text.match(regex);
  if (!match) return null;

  let value = match[1];
  // If there were parameters (semicolon), extract value after the last colon
  if (match[0].includes(';')) {
    const colonIdx = value.indexOf(':');
    if (colonIdx !== -1) {
      value = value.slice(colonIdx + 1);
    }
  }

  // Handle line folding (lines starting with space or tab are continuations)
  const foldPattern = new RegExp(`^${prop}[;:][^\r\n]*(?:\r?\n[ \t][^\r\n]*)*`, 'mi');
  const foldMatch = text.match(foldPattern);
  if (foldMatch) {
    value = foldMatch[0]
      .replace(new RegExp(`^${prop}[;:][^:\r\n]*:?`), '')
      .replace(/\r?\n[ \t]/g, '');
  }

  return value.trim();
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
