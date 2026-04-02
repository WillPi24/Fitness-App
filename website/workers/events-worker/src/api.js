/**
 * API handler for GET /api/events
 *
 * Query parameters:
 *   type     - 'powerlifting' | 'bodybuilding' | 'running' | 'all' (default: 'all')
 *   country  - ISO 3166-1 alpha-2 code (default: 'US')
 *   lat      - latitude for geo filtering
 *   lon      - longitude for geo filtering
 *   radius   - radius in miles for geo filtering (default: 100)
 *   limit    - max number of events to return (default: 100, max: 500)
 */

import { corsHeaders } from './lib/cors.js';
import { haversineFilter } from './lib/geo.js';

const VALID_TYPES = new Set(['powerlifting', 'bodybuilding', 'running', 'all']);
const VALID_COUNTRIES = new Set(['US', 'GB']);
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const DEFAULT_RADIUS = 100;

export async function handleEventsRequest(request, env) {
  const url = new URL(request.url);
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
    ...corsHeaders(),
  };

  // Parse query params
  const type = (url.searchParams.get('type') || 'all').toLowerCase();
  const country = (url.searchParams.get('country') || 'US').toUpperCase();
  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');
  const radiusParam = url.searchParams.get('radius');
  const limitParam = url.searchParams.get('limit');

  // Validate type
  if (!VALID_TYPES.has(type)) {
    return new Response(
      JSON.stringify({ error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(', ')}` }),
      { status: 400, headers }
    );
  }

  // Validate country
  if (!VALID_COUNTRIES.has(country)) {
    return new Response(
      JSON.stringify({ error: `Invalid country. Must be one of: ${[...VALID_COUNTRIES].join(', ')}` }),
      { status: 400, headers }
    );
  }

  // Parse limit
  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  }

  // Read from KV
  const kvKey = `events:${type}:${country}`;
  const raw = await env.EVENTS_KV.get(kvKey);

  if (!raw) {
    return new Response(
      JSON.stringify({ events: [], count: 0, meta: { key: kvKey, cached: false } }),
      { status: 200, headers }
    );
  }

  let events;
  try {
    events = JSON.parse(raw);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to parse cached event data' }),
      { status: 500, headers }
    );
  }

  // Filter to future events only (in case cache has stale data)
  const today = new Date().toISOString().slice(0, 10);
  events = events.filter((e) => e.startDate && e.startDate >= today);

  // Geo filtering
  if (latParam && lonParam) {
    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    const radius = radiusParam ? parseFloat(radiusParam) : DEFAULT_RADIUS;

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid lat/lon coordinates' }),
        { status: 400, headers }
      );
    }

    if (isNaN(radius) || radius <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid radius' }),
        { status: 400, headers }
      );
    }

    events = haversineFilter(events, lat, lon, radius);
  }

  // Apply limit
  const total = events.length;
  events = events.slice(0, limit);

  // Fetch metadata
  let meta = null;
  try {
    const metaRaw = await env.EVENTS_KV.get('meta:last-fetch');
    if (metaRaw) meta = JSON.parse(metaRaw);
  } catch {
    // ignore
  }

  return new Response(
    JSON.stringify({
      events,
      count: events.length,
      total,
      filters: {
        type,
        country,
        ...(latParam && lonParam
          ? { lat: parseFloat(latParam), lon: parseFloat(lonParam), radius: radiusParam ? parseFloat(radiusParam) : DEFAULT_RADIUS }
          : {}),
        limit,
      },
      meta: meta
        ? { lastFetch: meta.timestamp, totalEvents: meta.totalEvents }
        : null,
    }),
    { status: 200, headers }
  );
}
