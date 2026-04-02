/**
 * Scraper for NPC News Online bodybuilding schedule.
 * https://npcnewsonline.com/schedule/
 */

import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const SCHEDULE_URL = 'https://npcnewsonline.com/schedule/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

export async function fetchNPC() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(SCHEDULE_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[npc] Page returned ${resp.status}`);
      return [];
    }

    const html = await resp.text();
    const events = [];

    // Strategy 1: JSON-LD structured data
    const jsonLdEvents = extractJsonLd(html);
    if (jsonLdEvents.length > 0) {
      for (const ev of jsonLdEvents) {
        const normalized = await normalizeEvent({
          source: 'npc',
          type: 'bodybuilding',
          name: ev.name || '',
          startDate: ev.startDate || '',
          endDate: ev.endDate || '',
          venue: ev.location?.name || '',
          city: ev.location?.address?.addressLocality || '',
          state: ev.location?.address?.addressRegion || '',
          country: 'US',
          url: ev.url || SCHEDULE_URL,
          description: ev.description || '',
        });
        events.push(normalized);
      }
      return events;
    }

    // Strategy 2: HTMLRewriter for schedule tables and lists
    const parsedEvents = await parseSchedulePage(html);
    for (const ev of parsedEvents) {
      const normalized = await normalizeEvent({
        source: 'npc',
        type: 'bodybuilding',
        ...ev,
        country: 'US',
      });
      events.push(normalized);
    }

    // Strategy 3: Regex fallback for schedule-like content
    if (events.length === 0) {
      const regexEvents = extractFromText(html);
      for (const ev of regexEvents) {
        const normalized = await normalizeEvent({
          source: 'npc',
          type: 'bodybuilding',
          ...ev,
          country: 'US',
        });
        events.push(normalized);
      }
    }

    return events;
  } catch (err) {
    console.error('[npc] Fetch error:', err.message);
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
 * Parse the NPC schedule page. NPC typically lists events in a table or
 * structured list with date, name, and location columns.
 */
async function parseSchedulePage(html) {
  const events = [];
  let inRow = false;
  let cellIndex = 0;
  let current = null;
  let captureText = false;

  const res = new Response(html);
  const parsed = new HTMLRewriter()
    // Table rows (schedule is often a table)
    .on('tr, .schedule-item, .event-item, [class*="schedule"], [class*="event-row"]', {
      element() {
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', city: '', state: '' };
        cellIndex = 0;
        inRow = true;
      },
    })
    // Table cells
    .on('td, th', {
      element() {
        if (inRow) {
          captureText = true;
        }
      },
      text(text) {
        if (!captureText || !current) return;
        const t = text.text.trim();
        if (!t) return;

        // Try to detect what kind of data this cell contains
        const dateTest = normalizeDate(t);
        if (dateTest && !current.startDate) {
          current.startDate = dateTest;
        } else if (!current.name && t.length > 3 && !dateTest) {
          current.name += t;
        } else if (current.name && !current.city) {
          // Might be location
          current.city = t;
        }

        if (text.lastInTextNode) {
          cellIndex++;
          captureText = false;
        }
      },
    })
    // Links in schedule entries
    .on('tr a, .schedule-item a, .event-item a', {
      element(el) {
        if (current) {
          const href = el.getAttribute('href');
          if (href && href.startsWith('http')) current.url = href;
        }
      },
    })
    // Also look for common list-based layouts
    .on('article, .entry-content li, .post-content li', {
      element() {
        // Only use this if we haven't found table-based events
        if (events.length > 0) return;
        if (current && current.name) {
          events.push(current);
        }
        current = { name: '', startDate: '', url: '', city: '', state: '' };
      },
    })
    .transform(res);

  await parsed.text();

  if (current && current.name) {
    events.push(current);
  }

  return events.filter((e) => e.name.trim());
}

/**
 * Regex fallback: look for date + event name patterns.
 */
function extractFromText(html) {
  const events = [];
  const text = stripHtml(html);

  // Pattern: "Month DD, YYYY - Event Name" or "Month DD, YYYY Event Name"
  const pattern =
    /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\s*[-\u2013\u2014]?\s*([A-Z][^\n]{5,80})/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    events.push({
      name: match[2].trim(),
      startDate: match[1],
    });
  }

  return events;
}
