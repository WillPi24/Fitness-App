/**
 * Fetcher for organized UK races (10Ks, halfs, marathons, ultras, trails)
 * via runningcalendar.co.uk.
 *
 * Why this source:
 *   - Single comprehensive UK calendar — ~1,000+ events for 2026
 *   - Server-rendered HTML, no WAF blocking (unlike Let's Do This)
 *   - Uses hCalendar microformat (vevent / summary / dtstart / url / location)
 *     which is trivial to parse
 *   - Tags discriminate Run/Walk vs Multisport/Duathlon/Tower-Stair so we
 *     can keep just running events
 *
 * Skips:
 *   - Tags other than "Run/Walk" (multisport, duathlon, tower/stair)
 *   - Events with "parkrun" in the title (covered by the parkrun pill)
 */

import { normalizeEvent, MONTHS } from '../lib/normalize.js';

const BASE_URL = 'https://www.runningcalendar.co.uk';
// runningcalendar.co.uk's CDN appears to serve a different (empty / challenge)
// response to non-browser User-Agents. We tried HelmFitnessApp/1.0 first — it
// returned 200 but with HTML containing zero event cards. A standard desktop
// Mozilla UA gets the real content. This is a single-site exception to the
// project-wide HelmFitnessApp UA convention.
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 HelmFitnessApp/1.0';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_PAGES = 12;
const PER_PAGE_GUESS = 100; // observed; used to detect the last page early

export async function fetchRunningCalendar() {
  const year = new Date().getUTCFullYear();
  const events = [];
  const seenIds = new Set();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchPage(year, page);
    if (!html) break;

    const cards = parseCards(html);
    if (cards.length === 0) break;

    for (const card of cards) {
      if (seenIds.has(card.dataId)) continue;
      seenIds.add(card.dataId);

      if (shouldSkip(card)) continue;

      const startDate = parseLongDate(card.dateText);
      if (!startDate) continue;

      events.push(
        await normalizeEvent({
          source: 'runningcalendar',
          type: 'races',
          country: 'GB',
          name: card.name,
          startDate,
          endDate: startDate,
          city: card.city,
          venue: card.venue,
          url: card.url.startsWith('http') ? card.url : `${BASE_URL}${card.url}`,
        })
      );
    }

    if (cards.length < PER_PAGE_GUESS) break; // last page
  }

  console.log(`[runningcalendar] emitted ${events.length} races`);
  return events;
}

async function fetchPage(year, page) {
  const url = `${BASE_URL}/calendar/${year}/?page=${page}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error(`[runningcalendar] ${url} returned ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    return html;
  } catch (err) {
    console.error(`[runningcalendar] page ${page} fetch failed:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Each event is wrapped in <li class="calendar__event ..." data-id="...">.
 *
 * The site conditionally adds the `vevent` hCalendar class based on the
 * requesting client (CF Worker IPs get the class stripped, browsers get it).
 * We don't depend on `vevent`, `summary description`, `url calendar__event__link`,
 * or `dtstart dtend` — we anchor only on `calendar__event` for the wrapper and
 * on stable structural patterns inside (href containing `/event/`, the date
 * `<span>` near the calendar icon, etc.).
 */
export function parseCards(html) {
  const out = [];
  // Wrapper: <li class="calendar__event[ ...other classes]" data-id="N">
  const liRe = /<li\s+class="calendar__event[^"]*"\s+data-id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRe.exec(html)) !== null) {
    const dataId = m[1];
    const inner = m[2];

    // Title + URL: any anchor whose href starts with /event/
    const linkMatch = inner.match(/<a[^>]*\bhref="(\/event\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkMatch) continue;
    const url = linkMatch[1];
    const name = decodeEntities(linkMatch[2].replace(/<[^>]+>/g, '').trim());
    if (!name) continue;

    // Date: span with class containing dtstart (alone or as "dtstart dtend")
    const dateMatch =
      inner.match(/<span[^>]*\bclass="[^"]*\bdtstart\b[^"]*"[^>]*>([^<]+)<\/span>/) ||
      inner.match(/<div[^>]*\bclass="date"[^>]*>[\s\S]*?<\/i>([^<]+?)<\/div>/);
    const dateText = dateMatch ? dateMatch[1].trim() : '';
    if (!dateText) continue;

    // Location: <div class="location">... pulls the trailing text node
    const locMatch = inner.match(/<div[^>]*\bclass="location"[^>]*>[\s\S]*?<\/i>([^<]+)<\/div>/);
    const locationRaw = locMatch ? decodeEntities(locMatch[1].trim()) : '';
    const { venue, city } = splitLocation(locationRaw);

    // Tag: <span class="tag">...</span>
    const tagMatch =
      inner.match(/<span[^>]*\bclass="tag"[^>]*>[\s\S]*?<\/i>([^<]+)<\/span>/) ||
      inner.match(/<span[^>]*\bclass="tag"[^>]*>([^<]+)<\/span>/);
    const tag = tagMatch ? tagMatch[1].trim() : '';

    out.push({ dataId, name, url, dateText, venue, city, tag });
  }
  return out;
}

function shouldSkip(card) {
  if (card.tag && !/^Run\/Walk$/i.test(card.tag)) return true; // skip multisport/duathlon/etc.
  if (/\bparkrun\b/i.test(card.name)) return true; // covered separately
  return false;
}

/**
 * "Thursday, 1 January 2026" -> "2026-01-01"
 * "1 January 2026"           -> "2026-01-01"  (no day-of-week prefix)
 */
export function parseLongDate(s) {
  if (!s) return null;
  // Strip leading day-of-week + comma if present.
  const stripped = s.replace(/^[A-Za-z]+,\s*/, '').trim();
  const m = stripped.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const [, day, monthName, year] = m;
  const monthNum = MONTHS[monthName.toLowerCase()];
  if (!monthNum) return null;
  return `${year}-${String(monthNum).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * "Hyde Park, London, UK" -> { venue: "Hyde Park", city: "London" }
 * "Edinburgh"             -> { venue: "Edinburgh", city: "Edinburgh" }
 */
function splitLocation(raw) {
  if (!raw) return { venue: '', city: '' };
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  // Drop trailing "UK" / "United Kingdom"
  while (parts.length > 0 && /^(uk|united kingdom|england|scotland|wales|northern ireland)$/i.test(parts[parts.length - 1])) {
    parts.pop();
  }
  if (parts.length === 0) return { venue: raw, city: raw };
  if (parts.length === 1) return { venue: parts[0], city: parts[0] };
  return { venue: parts[0], city: parts[parts.length - 1] };
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}
