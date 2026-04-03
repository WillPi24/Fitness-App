/**
 * Shared fetcher for sites using WordPress "The Events Calendar" plugin.
 * Works for USPA, Powerlifting America, IFBB, and similar sites that expose
 * the /wp-json/tribe/events/v1/events endpoint.
 */

import { normalizeEvent } from '../lib/normalize.js';

const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const PER_PAGE = 50;
const MAX_PAGES = 10; // safety cap
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Fetch events from a Tribe Events Calendar REST API.
 * @param {string} baseUrl - site root, e.g. 'https://www.uspa.net'
 * @param {string} source  - identifier, e.g. 'uspa'
 * @param {string} eventType - 'powerlifting' | 'bodybuilding' | 'running'
 * @param {string | null} defaultCountry - fallback ISO country code when venue country is missing
 * @returns {Promise<Array>} normalized events
 */
export async function fetchTribeEvents(baseUrl, source, eventType, defaultCountry = null) {
  const allEvents = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= MAX_PAGES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const endpoint = `${baseUrl}/wp-json/tribe/events/v1/events?page=${page}&per_page=${PER_PAGE}&start_date=now`;
      const resp = await fetch(endpoint, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });

      if (!resp.ok) {
        // Some sites return 404 when there are no more pages
        break;
      }

      const responseText = await resp.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(`[${source}] Tribe endpoint returned non-JSON on page ${page}`);
        break;
      }
      const events = data.events || [];

      if (events.length === 0) break;

      for (const ev of events) {
        const venue = ev.venue || {};
        const normalized = await normalizeEvent({
          source,
          type: eventType,
          name: ev.title || '',
          startDate: ev.start_date || ev.utc_start_date || '',
          endDate: ev.end_date || ev.utc_end_date || '',
          venue: venue.venue || '',
          address: venue.address || '',
          city: venue.city || '',
          state: venue.state || venue.province || venue.stateprovince || '',
          country: venue.country || defaultCountry || '',
          lat: venue.geo_lat || null,
          lon: venue.geo_lng || null,
          url: ev.url || '',
          description: ev.description || '',
        });
        allEvents.push(normalized);
      }

      // Check pagination
      const totalPages = data.total_pages || 1;
      hasMore = page < totalPages;
      page++;
    } catch (err) {
      // Network error or timeout -- stop paginating
      console.error(`[${source}] Tribe fetch error on page ${page}:`, err.message);
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  return allEvents;
}
