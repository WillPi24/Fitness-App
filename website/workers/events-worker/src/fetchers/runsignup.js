/**
 * Fetcher for organized US races (marathons, halfs, ultras, 10Ks, trails)
 * via the public RunSignup REST API: https://runsignup.com/Rest/races
 *
 * Why RunSignup:
 *   - Public REST API, no auth required for basic search
 *   - Most major US race promoters register here
 *   - Stable JSON shape; pagination via page/results_per_page
 *   - Each race exposes its sub-events with explicit distances, so we can
 *     filter out 1-mile fun runs and keep 5K+ races
 *
 * What we filter out:
 *   - Canceled events (name starts with "!!! Event Canceled" etc.)
 *   - Private / draft races
 *   - HYROX events (covered authoritatively via roxradar.js)
 *   - Races with no event sub-types of >= 5K (drops 1-mile fun runs that
 *     have no longer companion distance)
 */

import { normalizeEvent } from '../lib/normalize.js';

const API_BASE = 'https://runsignup.com/Rest/races';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;
const RESULTS_PER_PAGE = 100;
const MAX_PAGES = 5; // 5 * 100 = 500 races/cron, well within free-tier API politeness
const FETCH_WINDOW_DAYS = 365;

const SKIP_NAME_PATTERNS = [
  /^\s*!+\s*Event Canceled/i,
  /\bcanceled\b/i,
  /\bcancelled\b/i,
  /\bHYROX\b/i,
];

export async function fetchRunSignup() {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const end = new Date(today.getTime() + FETCH_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const events = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const races = await fetchPage(page, start, end);
    if (!races || races.length === 0) break;

    for (const wrapper of races) {
      const race = wrapper.race || wrapper;
      const normalized = await tryNormalize(race);
      if (normalized) events.push(normalized);
    }

    if (races.length < RESULTS_PER_PAGE) break; // last page
  }

  console.log(`[runsignup] emitted ${events.length} races`);
  return events;
}

async function fetchPage(page, start, end) {
  const url =
    `${API_BASE}?format=json&country_code=US` +
    `&start_date=${start}&end_date=${end}` +
    `&results_per_page=${RESULTS_PER_PAGE}&page=${page}` +
    `&events=T`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error(`[runsignup] page ${page} returned ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    return data.races || [];
  } catch (err) {
    console.error(`[runsignup] page ${page} fetch failed:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function tryNormalize(race) {
  if (!race || typeof race !== 'object') return null;
  if (race.is_draft_race === 'T' || race.is_private_race === 'T') return null;
  const name = (race.name || '').trim();
  if (!name) return null;
  if (SKIP_NAME_PATTERNS.some((re) => re.test(name))) return null;
  if (!hasMeaningfulDistance(race.events)) return null;

  return await normalizeEvent({
    source: 'runsignup',
    type: 'races',
    country: 'US',
    name,
    startDate: parseUSDate(race.next_date),
    endDate: parseUSDate(race.next_end_date) || parseUSDate(race.next_date),
    venue: race.address?.street || null,
    city: race.address?.city || null,
    state: race.address?.state || null,
    lat: race.address?.latitude != null ? race.address.latitude : null,
    lon: race.address?.longitude != null ? race.address.longitude : null,
    url: race.url || race.external_race_url || null,
    description: stripDescription(race.description),
  });
}

/**
 * RunSignup dates come back as MM/DD/YYYY. Convert to YYYY-MM-DD.
 * normalizeDate() can handle this format too, but we do it explicitly for
 * clarity (the API uses two-digit zero-padded segments consistently).
 */
export function parseUSDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, mo, d, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * A race makes the cut if it offers any sub-event of distance >= 5K.
 * Drops 1-mile fun runs and shorter, which aren't really "race" events.
 */
export function hasMeaningfulDistance(events) {
  if (!Array.isArray(events) || events.length === 0) return false;
  for (const ev of events) {
    if (isAtLeast5K(ev.distance)) return true;
  }
  return false;
}

export function isAtLeast5K(distanceStr) {
  if (!distanceStr) return false;
  const s = String(distanceStr).toLowerCase().trim();
  // Direct K matches
  const kMatch = s.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) return parseFloat(kMatch[1]) >= 5;
  // Miles: 5K is 3.107 miles
  const milesMatch = s.match(/(\d+(?:\.\d+)?)\s*mi/);
  if (milesMatch) return parseFloat(milesMatch[1]) >= 3.1;
  return false;
}

function stripDescription(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}
