/**
 * Fetcher for parkrun events from their public GeoJSON endpoint.
 * parkrun events happen every Saturday -- we set the date to the next Saturday.
 */

import { normalizeEvent } from '../lib/normalize.js';

const EVENTS_URL = 'https://images.parkrun.com/events.json';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

// Map current parkrun country hostnames to ISO 3166-1 alpha-2.
const PARKRUN_HOST_COUNTRY_MAP = {
  'www.parkrun.org.uk': 'GB',
  'www.parkrun.us': 'US',
};

// Fallbacks if the `countries` object is missing from the payload.
const FALLBACK_COUNTRY_HOSTS = {
  97: 'www.parkrun.org.uk',
  98: 'www.parkrun.us',
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
      const countryInfo =
        data.countries?.[String(props.countrycode)] ||
        data.countries?.[props.countrycode] ||
        null;
      const countryHost = countryInfo?.url || FALLBACK_COUNTRY_HOSTS[props.countrycode] || '';
      const countryCode = PARKRUN_HOST_COUNTRY_MAP[countryHost] || null;

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
          ? `https://${countryHost}/${props.eventname}`
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
