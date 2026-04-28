/**
 * Aggregator scraper for UK bodybuilding shows.
 *
 * Source: https://frontdouble.com/uk-bodybuilding-show-calendar/
 *
 * frontdouble curates a community calendar covering every UK federation
 * (NABBA, PCA, BNBF, 2Bros, IBFA, WFF, WNBF, UKUP, IBFA, UKDFBA, etc.) in
 * a single page. We use it instead of writing 5+ federation-specific
 * scrapers because:
 *   - the federations themselves run incompatible platforms (Shopify, Wix,
 *     Webflow, image-tile poster pages, image OCR territory)
 *   - the aggregator is plain text and trivially regex-parseable
 *   - one fetcher stays in sync with new federations they cover
 *
 * UKBFF entries are skipped here because we have an authoritative UKBFF
 * fetcher already; we let that win on attribution.
 *
 * Trade-off: aggregator updates are manual, so brand-new federation shows
 * may lag a few days behind the federation's own announcement. Acceptable
 * for v1; falling back to direct federation scrapers is the natural
 * follow-up.
 */

import { normalizeEvent, MONTHS } from '../lib/normalize.js';

const PAGE_URL = 'https://frontdouble.com/uk-bodybuilding-show-calendar/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;

// Skip aggregator entries we already cover authoritatively.
const SKIP_TITLE_PREFIXES = [/^UKBFF\b/i];

// Defensive: skip non-bodybuilding noise if it ever ends up on the calendar.
const SKIP_TITLE_KEYWORDS = [/\bHYROX\b/i, /\bparkrun\b/i];

export async function fetchFrontDouble() {
  const html = await fetchHtml(PAGE_URL);
  if (!html) return [];

  const year = detectYear(html);
  if (!year) {
    console.error('[frontdouble] could not detect calendar year, aborting');
    return [];
  }

  const sections = parseMonthSections(html);
  console.log(`[frontdouble] found ${sections.length} month sections for ${year}`);

  const events = [];
  for (const section of sections) {
    const monthNum = MONTHS[section.month.toLowerCase()];
    if (!monthNum) continue;

    for (const line of section.lines) {
      const parsed = parseLine(line);
      if (!parsed) continue;
      if (shouldSkip(parsed.title)) continue;

      const startDate = isoDate(year, monthNum, parsed.startDay);
      const endDate = parsed.endDay
        ? isoDate(year, monthNum, parsed.endDay)
        : startDate;
      if (!startDate) continue;

      const { venue, city } = splitVenue(parsed.venue);

      events.push(
        await normalizeEvent({
          source: 'frontdouble',
          type: 'bodybuilding',
          country: 'GB',
          name: parsed.title,
          startDate,
          endDate,
          venue,
          city,
          url: PAGE_URL,
        })
      );
    }
  }

  console.log(`[frontdouble] emitted ${events.length} events`);
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
      console.error(`[frontdouble] ${url} returned ${resp.status}`);
      return null;
    }
    return await resp.text();
  } catch (err) {
    console.error(`[frontdouble] fetch failed:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pull the calendar year out of either the page <title> or the og:title.
 * Both contain "UK Bodybuilding Shows 2026 | ..." style text.
 */
export function detectYear(html) {
  const candidates = [
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1],
    html.match(/uk-bodybuilding-show-calendar[^"'>]*?(\d{4})/i)?.[1],
  ].filter(Boolean);

  for (const candidate of candidates) {
    const m = candidate.match(/\b(20\d{2})\b/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/**
 * Walk the page and group <p> blocks under each <h2> month heading.
 * frontdouble uses Gutenberg's <h2 class="wp-block-heading"> + sibling <p>
 * containing all events for that month, separated by <br> tags.
 */
export function parseMonthSections(html) {
  // Split content on <h2> tags. Pair month headings with the <p> blocks
  // that follow before the next <h2>.
  const headingPattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const headings = [];
  let m;
  while ((m = headingPattern.exec(html)) !== null) {
    const monthText = stripTags(m[1]).trim();
    const monthMatch = monthText.match(/^([A-Za-z]+)/);
    if (!monthMatch) continue;
    if (!MONTHS[monthMatch[1].toLowerCase()]) continue;
    headings.push({ month: monthMatch[1], start: m.index, end: m.index + m[0].length });
  }

  const sections = [];
  for (let i = 0; i < headings.length; i++) {
    const section = headings[i];
    const next = headings[i + 1];
    const sliceEnd = next ? next.start : html.length;
    const body = html.slice(section.end, sliceEnd);
    const lines = extractLines(body);
    if (lines.length > 0) {
      sections.push({ month: section.month, lines });
    }
  }
  return sections;
}

/**
 * Pull every event line out of the <p> blocks following a heading.
 * Events are separated by <br> within a single <p>, so we collapse
 * <br> variants to newlines, strip remaining tags, and split.
 */
function extractLines(body) {
  const lines = [];
  const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pPattern.exec(body)) !== null) {
    const inner = m[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''); // strip stray inline tags
    for (const raw of inner.split('\n')) {
      const cleaned = decodeEntities(raw).replace(/\s+/g, ' ').trim();
      if (!cleaned) continue;
      // drop "UK bodybuilding results" link footers and other non-event prose
      if (!/^\d/.test(cleaned)) continue;
      lines.push(cleaned);
    }
  }
  return lines;
}

/**
 * Parse one event line into { startDay, endDay?, title, venue }.
 * Examples:
 *   "6 – NABBA North West – Floral Pavilion, New Brighton, Wirral"
 *   "6–7 – WFF Open European Championships – Middleton Arena, Manchester"
 *   "13th – Gas Mark 10 Classic – Victoria Hall, Stoke-on-Trent"
 *   "30 - 1 - Cross-Month Show - Some Venue"   (rare; treated as start day only)
 *
 * Day-range separators may be en-dash, em-dash, or hyphen. The major
 * day/title/venue separator is the same set of characters surrounded by
 * spaces, so we split on " - " variants once we've consumed the day cluster.
 */
export function parseLine(line) {
  const dashSep = '\\s+[\\u2013\\u2014\\-]\\s+'; // " - " with any dash, surrounded by spaces
  const dayCluster = '(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*[\\u2013\\u2014\\-]\\s*(\\d{1,2})(?:st|nd|rd|th)?)?';
  const re = new RegExp(`^${dayCluster}${dashSep}(.+?)${dashSep}(.+?)\\s*$`);
  const m = line.match(re);
  if (!m) return null;
  const [, startDay, endDay, title, venue] = m;
  const trimmedTitle = title.trim();
  const trimmedVenue = venue.trim();
  if (!trimmedTitle || !trimmedVenue) return null;
  return {
    startDay: parseInt(startDay, 10),
    endDay: endDay ? parseInt(endDay, 10) : null,
    title: trimmedTitle,
    venue: trimmedVenue,
  };
}

function shouldSkip(title) {
  for (const re of SKIP_TITLE_PREFIXES) if (re.test(title)) return true;
  for (const re of SKIP_TITLE_KEYWORDS) if (re.test(title)) return true;
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
 * "Floral Pavilion, New Brighton, Wirral" -> { venue: "Floral Pavilion", city: "Wirral" }
 * "Bristol" -> { venue: "Bristol", city: "Bristol" }
 */
function splitVenue(raw) {
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { venue: '', city: '' };
  if (parts.length === 1) return { venue: parts[0], city: parts[0] };
  return { venue: parts[0], city: parts[parts.length - 1] };
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}
