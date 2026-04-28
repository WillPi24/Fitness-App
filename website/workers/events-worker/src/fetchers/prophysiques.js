/**
 * Aggregator scraper for US bodybuilding shows.
 *
 * Source: https://www.prophysiques.com/2026-usa-bodybuilding-shows-competitions-calendar
 *
 * ProPhysiques curates a community calendar covering every active US
 * bodybuilding federation (NPC, NPC Worldwide, IFBB Pro League, WNBF, OCB,
 * NANBF, INBA/PNBA, ANBF, NFF, WBFF, Musclemania, MuscleContest joint
 * NPC/IFBB shows, etc.). We use it instead of writing per-federation
 * scrapers because each federation runs incompatible platforms, several
 * are behind WAFs (WNBF) or use JS-rendered listings (OCB), and we'd be
 * playing whack-a-mole every time a fed redesigns.
 *
 * IFBB Pro League events are SKIPPED here because we have an authoritative
 * `ifbbpro.js` fetcher already; ProPhysiques entries would duplicate.
 *
 * Trade-off: aggregator updates are manual, so brand-new federation shows
 * may lag a few days behind the federation's own announcement. Acceptable
 * for v1; mitigated by `meta.sourceCounts.prophysiques` being passively
 * visible on every API response.
 *
 * Markup quirks the parser handles:
 *   - Month markers come as either <h2><b>Month</b></h2> or
 *     <p><strong>Month</strong></p> — page builder inconsistency.
 *   - The first month's events appear BEFORE the first month marker (the
 *     calendar implicitly starts in the earliest month). We seed
 *     `currentMonth` from the first explicit marker we encounter; events
 *     before that get attributed to the previous month by chronological
 *     inference (start day numbers are monotonic within a month, then
 *     reset). For now we drop pre-marker orphans rather than guess.
 *   - Lines have 4 fields separated by " - " (en-dash, em-dash, or hyphen
 *     all accepted), or 5 fields when the event is multi-day:
 *       "5th Thu - 8th Sun - IFBB Pro League - Columbus, OH - Arnold Classic"
 *       "21st Sat - WNBF - Erie H Meyer Civic Center, Gulf Shores, AL - WNBF Sands of Strength"
 *     Field layout: <day> [- <endDay>] - <federation> - <venue, location> - <event name>
 */

import { normalizeEvent, MONTHS } from '../lib/normalize.js';

const PAGE_URL = 'https://www.prophysiques.com/2026-usa-bodybuilding-shows-competitions-calendar';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;

// Federations covered authoritatively elsewhere — skip to avoid duplicates.
const SKIP_FED_PATTERNS = [
  /^IFBB Pro(?:\s+League)?$/i, // covered by ifbbpro.js
  /HYROX/i,                    // not a bodybuilding event
  /parkrun/i,                  // defensive, shouldn't appear
];

export async function fetchProPhysiques() {
  const html = await fetchHtml(PAGE_URL);
  if (!html) return [];

  const year = detectYear(html);
  if (!year) {
    console.error('[prophysiques] could not detect calendar year, aborting');
    return [];
  }

  const sections = parseMonthSections(html);
  console.log(`[prophysiques] ${sections.length} month sections for ${year}`);

  const events = [];
  for (const section of sections) {
    const monthNum = MONTHS[section.month.toLowerCase()];
    if (!monthNum) continue;
    for (const line of section.lines) {
      const parsed = parseLine(line);
      if (!parsed) continue;
      if (shouldSkip(parsed.federation)) continue;

      const startDate = isoDate(year, monthNum, parsed.startDay);
      const endDate = parsed.endDay
        ? isoDate(year, monthNum, parsed.endDay)
        : startDate;
      if (!startDate) continue;

      const { venue, city } = splitVenue(parsed.venue);

      events.push(
        await normalizeEvent({
          source: 'prophysiques',
          type: 'bodybuilding',
          country: 'US',
          name: parsed.name,
          startDate,
          endDate,
          venue,
          city,
          url: PAGE_URL,
        })
      );
    }
  }

  console.log(`[prophysiques] emitted ${events.length} events`);
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
      console.error(`[prophysiques] ${url} returned ${resp.status}`);
      return null;
    }
    return await resp.text();
  } catch (err) {
    console.error(`[prophysiques] fetch failed:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pull the calendar year from the page <title> or og:title (both contain
 * "2026 USA BODYBUILDING COMPETITION SHOW CALENDAR").
 */
export function detectYear(html) {
  const candidates = [
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1],
    html.match(/uk-bodybuilding-show-calendar[^"'>]*?(\d{4})/i)?.[1],
    html.match(/usa-bodybuilding[^"'>]*?(\d{4})/i)?.[1],
  ].filter(Boolean);

  for (const candidate of candidates) {
    const m = candidate.match(/\b(20\d{2})\b/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/**
 * Walk the entire HTML in document order. Track currentMonth from any
 * <h1..h6> or <p><strong>/<b> element whose text starts with a month
 * name. Collect every <p> whose stripped text starts with a digit as an
 * event-shaped line under the active month.
 *
 * Robust to the ProPhysiques markup quirk where month markers alternate
 * between <h2> and <p><strong>.
 */
export function parseMonthSections(html) {
  const sections = [];
  let currentMonth = null;
  let currentLines = [];

  const tokenRe = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let tk;
  while ((tk = tokenRe.exec(html)) !== null) {
    const tag = (tk[1] || 'p').toLowerCase();
    const inner = tk[2] !== undefined ? tk[2] : tk[3];
    const text = stripAll(inner);
    if (!text) continue;

    if (looksLikeMonthMarker(tag, text)) {
      if (currentMonth && currentLines.length > 0) {
        sections.push({ month: currentMonth, lines: currentLines });
      }
      currentMonth = text.match(/^([A-Za-z]+)/)[1];
      currentLines = [];
      continue;
    }

    // Event-shaped line: starts with digit and contains at least 3 dash separators.
    if (/^\d/.test(text) && countDashes(text) >= 3) {
      if (currentMonth) currentLines.push(text);
    }
  }

  if (currentMonth && currentLines.length > 0) {
    sections.push({ month: currentMonth, lines: currentLines });
  }
  return sections;
}

function looksLikeMonthMarker(tag, text) {
  const monthRe = /^(January|February|March|April|May|June|July|August|September|October|November|December)\b/i;
  if (!monthRe.test(text)) return false;
  if (text.length > 30) return false;
  // h-tag is always a marker. <p> is a marker only when it's a short bare month name.
  if (tag.startsWith('h')) return true;
  // For <p>, require very short text (e.g., "April" alone, no surrounding prose)
  return text.length <= 14;
}

function countDashes(text) {
  return (text.match(/[-–—]/g) || []).length;
}

/**
 * Parse one event line.
 *
 * Single-day:  "21st Sat - WNBF - Venue, City, ST - WNBF Sands of Strength"
 * Multi-day:   "5th Thu - 8th Sun - IFBB Pro League - Columbus, OH - Arnold Classic USA"
 *
 * Returns { startDay, endDay?, federation, venue, name } or null.
 */
export function parseLine(line) {
  const parts = line.split(/\s+[-–—]\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 4) return null;

  let i = 0;
  const startMatch = parts[i].match(/^(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (!startMatch) return null;
  const startDay = parseInt(startMatch[1], 10);
  i++;

  let endDay = null;
  const endMatch = parts[i].match(/^(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (endMatch) {
    endDay = parseInt(endMatch[1], 10);
    i++;
  }

  if (parts.length - i < 3) return null;
  const federation = parts[i++].trim();
  const venue = parts[i++].trim();
  const name = parts.slice(i).join(' - ').trim();

  if (!federation || !venue || !name) return null;
  return { startDay, endDay, federation, venue, name };
}

function shouldSkip(federation) {
  for (const re of SKIP_FED_PATTERNS) if (re.test(federation)) return true;
  return false;
}

function isoDate(year, month, day) {
  if (!year || !month || !day) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * "Erie H Meyer Civic Center, Gulf Shores, AL"
 *   -> { venue: "Erie H Meyer Civic Center", city: "Gulf Shores" }
 * "Venue TBC, Columbus, OH"
 *   -> { venue: "Venue TBC", city: "Columbus" }
 * "Bristol"
 *   -> { venue: "Bristol", city: "Bristol" }
 */
function splitVenue(raw) {
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { venue: '', city: '' };
  if (parts.length === 1) return { venue: parts[0], city: parts[0] };
  // city is the second-to-last segment when last looks like a US state code (2 letters all-caps)
  const last = parts[parts.length - 1];
  if (/^[A-Z]{2}$/.test(last) && parts.length >= 2) {
    return { venue: parts[0], city: parts[parts.length - 2] };
  }
  return { venue: parts[0], city: parts[parts.length - 1] };
}

function stripAll(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
