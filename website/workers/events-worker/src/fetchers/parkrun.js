/**
 * Fetcher for parkrun events from their public GeoJSON endpoint.
 * parkrun events happen every Saturday -- we set the date to the next Saturday.
 */

import { normalizeEvent } from '../lib/normalize.js';

const EVENTS_URL = 'https://images.parkrun.com/events.json';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

// parkrun countrycode to ISO 3166-1 alpha-2
const PARKRUN_COUNTRY_MAP = {
  97: 'US',
  3: 'GB',
  4: 'AU',
  14: 'NZ',
  23: 'IE',
  31: 'ZA',
  32: 'CA',
  65: 'FR',
  82: 'DE',
};

// Only collect events for these countries
const ALLOWED_COUNTRIES = new Set(['US', 'GB']);

/**
 * Get the next Saturday from today in YYYY-MM-DD format.
 */
function nextSaturday() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  const daysUntilSat = (6 - day + 7) % 7 || 7; // if today is Sat, next Sat
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntilSat);
  return next.toISOString().slice(0, 10);
}

export async function fetchParkrun() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(EVENTS_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[parkrun] API returned ${resp.status}`);
      return [];
    }

    const data = await resp.json();
    const features = data.events?.features || data.features || [];
    const saturday = nextSaturday();
    const events = [];

    for (const feature of features) {
      const props = feature.properties || {};
      const countryCode = PARKRUN_COUNTRY_MAP[props.countrycode];

      if (!countryCode || !ALLOWED_COUNTRIES.has(countryCode)) continue;

      const coords = feature.geometry?.coordinates || [];
      const lon = coords[0];
      const lat = coords[1];

      const normalized = await normalizeEvent({
        source: 'parkrun',
        type: 'running',
        name: props.EventLongName || props.eventname || 'parkrun',
        startDate: saturday,
        endDate: saturday,
        city: props.eventname || '',
        country: countryCode,
        lat: lat != null ? lat : null,
        lon: lon != null ? lon : null,
        url: props.eventname
          ? `https://www.parkrun.${countryCode === 'US' ? 'us' : countryCode.toLowerCase()}/${props.eventname}`
          : null,
        description: `Weekly parkrun 5k at ${props.EventLongName || props.eventname || 'unknown location'}`,
      });

      events.push(normalized);
    }

    return events;
  } catch (err) {
    console.error('[parkrun] Fetch error:', err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
