/**
 * Event collector -- orchestrates all fetchers, deduplicates, filters, sorts,
 * and writes results to KV.
 */

import { fetchTribeEvents } from './fetchers/tribe-events.js';
import { fetchRPS } from './fetchers/rps.js';
import { fetchParkrun } from './fetchers/parkrun.js';
import { fetchUSAPL } from './fetchers/usapl.js';
import { fetchNPC } from './fetchers/npc.js';
import { fetchIFBBPro } from './fetchers/ifbbpro.js';
import { fetchBritishPL } from './fetchers/britishpl.js';
import { fetchUKBFF } from './fetchers/ukbff.js';
import { fetchFrontDouble } from './fetchers/frontdouble.js';
import { fetchRoxRadar } from './fetchers/roxradar.js';
import { fetchProPhysiques } from './fetchers/prophysiques.js';
import { fetchRunSignup } from './fetchers/runsignup.js';
import { fetchRunningCalendar } from './fetchers/runningcalendar.js';

// Country buckets we always write KV keys for (so the API never 404s on these).
// Other countries (FR, DE, JP, etc.) get buckets too if any event lands there.
const DEFAULT_COUNTRIES = ['US', 'GB'];
// Event types we support
const TYPES = ['powerlifting', 'bodybuilding', 'races', 'hyrox', 'parkrun'];

/**
 * Run all fetchers, deduplicate, filter, sort, and write to KV.
 */
export async function collectEvents(env) {
  console.log('[collector] Starting event collection...');

  const results = await Promise.allSettled([
    // Tribe Events Calendar API sources
    fetchTribeEvents('https://www.uspa.net', 'uspa', 'powerlifting', 'US'),
    fetchTribeEvents('https://powerlifting-america.com', 'plamerica', 'powerlifting', 'US'),
    fetchTribeEvents('https://www.ifbb.com', 'ifbb', 'bodybuilding'),

    // HTML scrapers
    fetchUSAPL(),
    fetchNPC(),
    fetchIFBBPro(),
    fetchBritishPL(),
    fetchUKBFF(),
    fetchFrontDouble(),
    fetchRoxRadar(),
    fetchProPhysiques(),
    fetchRunSignup(),
    fetchRunningCalendar(),

    // RSS feed
    fetchRPS(),

    // GeoJSON
    fetchParkrun(),
  ]);

  // Collect all events from successful fetches
  let allEvents = [];
  const sourceCounts = {};

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const event of result.value) {
        allEvents.push(event);
        sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
      }
    } else if (result.status === 'rejected') {
      console.error('[collector] Fetcher failed:', result.reason?.message || result.reason);
    }
  }

  console.log(`[collector] Raw events collected: ${allEvents.length}`);
  console.log('[collector] By source:', JSON.stringify(sourceCounts));

  // Deduplicate by eventId
  const seen = new Set();
  allEvents = allEvents.filter((event) => {
    if (!event.eventId || seen.has(event.eventId)) return false;
    seen.add(event.eventId);
    return true;
  });

  console.log(`[collector] After dedup: ${allEvents.length}`);

  // Filter out past events (keep events with startDate >= today)
  const today = new Date().toISOString().slice(0, 10);
  allEvents = allEvents.filter((event) => {
    if (!event.startDate) return false;
    return event.startDate >= today;
  });

  console.log(`[collector] After filtering past events: ${allEvents.length}`);

  // Sort by startDate ascending
  allEvents.sort((a, b) => {
    if (a.startDate < b.startDate) return -1;
    if (a.startDate > b.startDate) return 1;
    return 0;
  });

  // Group by type and country, then write to KV.
  // Always write buckets for DEFAULT_COUNTRIES (US/GB) so the API never 404s
  // on those, plus any other country that actually has events this run
  // (e.g. HYROX races in FR/DE/JP). Also write a "WORLD" bucket per type
  // containing every event of that type globally — used by the events page's
  // "Worldwide" filter for global event series like HYROX.
  const seenCountries = new Set(allEvents.map((e) => e.country).filter(Boolean));
  const allCountries = new Set([...DEFAULT_COUNTRIES, ...seenCountries]);
  const kvWrites = [];

  for (const country of allCountries) {
    const countryEvents = allEvents.filter((e) => e.country === country);

    kvWrites.push(
      env.EVENTS_KV.put(
        `events:all:${country}`,
        JSON.stringify(countryEvents),
        { expirationTtl: 604800 } // 7 days
      )
    );

    for (const type of TYPES) {
      const typed = countryEvents.filter((e) => e.type === type);
      kvWrites.push(
        env.EVENTS_KV.put(
          `events:${type}:${country}`,
          JSON.stringify(typed),
          { expirationTtl: 604800 }
        )
      );
    }
  }

  // WORLD buckets: every event of a given type, regardless of country.
  kvWrites.push(
    env.EVENTS_KV.put(
      `events:all:WORLD`,
      JSON.stringify(allEvents),
      { expirationTtl: 604800 }
    )
  );
  for (const type of TYPES) {
    const typed = allEvents.filter((e) => e.type === type);
    kvWrites.push(
      env.EVENTS_KV.put(
        `events:${type}:WORLD`,
        JSON.stringify(typed),
        { expirationTtl: 604800 }
      )
    );
  }

  // Write metadata. byCountry covers every country we wrote a bucket for.
  kvWrites.push(
    env.EVENTS_KV.put(
      'meta:last-fetch',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalEvents: allEvents.length,
        sourceCounts,
        byCountry: Object.fromEntries(
          [...allCountries].map((c) => [c, allEvents.filter((e) => e.country === c).length])
        ),
      }),
      { expirationTtl: 604800 }
    )
  );

  await Promise.all(kvWrites);

  console.log(`[collector] Wrote ${kvWrites.length} KV keys. Done.`);
}
