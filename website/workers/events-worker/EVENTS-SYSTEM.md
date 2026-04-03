# Helm Events Finder - System Documentation

## What This Is

An automated competition/event aggregation system that collects upcoming powerlifting meets, bodybuilding shows, and running races from free public data sources, stores them in Cloudflare KV, and serves them via a public API.

The marketing site has an events page at [website/events.html](../../events.html) where users can filter by type and country.

## Current Status - April 2026

What is done:

- The Cloudflare Worker is built and deployed as `helm-events`.
- A real KV namespace has been created and bound:
  - `EVENTS_KV = b50fc998715d4975a7674bc4ed232ac6`
- The worker route is configured in [wrangler.toml](./wrangler.toml):
  - `helmfit.com/api/*`
- The cron is configured:
  - `0 6 * * 1` (every Monday at 06:00 UTC)
- The events page exists in [website/events.html](../../events.html).
- The main website navigation has been updated to include `Events`.
- The local page supports `?api=...` overrides for testing against any API host.

Recent fixes completed:

- Powerlifting America now uses the correct domain and is collecting again.
- British Powerlifting now scrapes the current listing pages instead of the old `/calendar/` route.
- UKBFF parsing was fixed:
  - upcoming event extraction is stable
  - folded ICS `SUMMARY` and `LOCATION` lines are parsed correctly
  - venue/address/city parsing is much cleaner
- Parkrun country mapping was corrected against the live source payload, so UK and US events are no longer mixed together.
- The frontend filter logic was fixed so stale requests do not overwrite the latest selected filter state.

What is not finished yet:

- `helmfit.com` is not publicly resolving / serving the website yet.
- The website itself has not been deployed/published yet.
- Because the site is not live on the same domain, the deployed route `https://helmfit.com/api/events` is not currently usable from a normal browser session.

Practical consequence:

- The code is in a commit-ready state.
- The remaining work to make the system work online is deployment/domain work, not major application code work.

## Why Cloudflare Workers + KV

We evaluated AWS Lambda + DynamoDB (the existing backend stack) and Cloudflare Workers + KV. We chose Cloudflare because:

- The website and API fit naturally on the same edge platform
- The Worker can handle both the weekly collector and the public API
- KV is simple and fast for precomputed event lists
- The cost profile is effectively zero at this scale
- No separate API Gateway / IAM / Lambda deployment is needed for this feature

## Architecture

```text
Weekly Cron (Monday 6am UTC)
  |
  v
Cloudflare Worker (`helm-events`)
  |
  |-- API / feed fetchers
  |   |-- USPA
  |   |-- Powerlifting America
  |   |-- IFBB
  |   |-- RPS
  |   `-- Parkrun
  |
  `-- HTML scrapers
      |-- USAPL
      |-- NPC
      |-- IFBB Pro
      |-- British Powerlifting
      `-- UKBFF
  |
  v normalize + deduplicate + filter past events + sort by date
  |
  v
Cloudflare KV (`EVENTS_KV`)
  |-- events:powerlifting:US
  |-- events:powerlifting:GB
  |-- events:bodybuilding:US
  |-- events:bodybuilding:GB
  |-- events:running:US
  |-- events:running:GB
  |-- events:all:US
  |-- events:all:GB
  `-- meta:last-fetch
  |
  v
Public API: GET /api/events
  |
  v
website/events.html
```

## Data Sources

### Structured APIs / feeds

| Source | Sport | URL / Pattern | Format | Coverage | Notes |
|---|---|---|---|---|---|
| USPA | Powerlifting | `uspa.net/wp-json/tribe/events/v1/events` | JSON | US | WordPress "The Events Calendar" API |
| Powerlifting America | Powerlifting | `powerlifting-america.com/wp-json/tribe/events/v1/events` | JSON | US | Same format as USPA |
| IFBB | Bodybuilding | `ifbb.com/wp-json/tribe/events/v1/events` | JSON | Global | Amateur bodybuilding coverage |
| RPS | Powerlifting | `meets.revolutionpowerlifting.com/feed/` | RSS | US | Revolution Powerlifting Syndicate |
| Parkrun | Running | `images.parkrun.com/events.json` | GeoJSON | Global | Filtered to US/GB in this system |

### HTML / page scrapers

| Source | Sport | URL / Pattern | Country | Notes |
|---|---|---|---|---|
| USAPL | Powerlifting | `usapowerlifting.com/calendar/` | US | No API |
| NPC | Bodybuilding | `npcnewsonline.com/schedule/` | US | No API |
| IFBB Pro | Bodybuilding | IFBB Pro schedule page | US / Global | No stable public API |
| British Powerlifting | Powerlifting | `britishpowerlifting.org/upcoming-championships/` + `.../upcoming-events-competitions/` | GB | Rewritten to current site structure |
| UKBFF | Bodybuilding | `ukbff.co.uk/events` | GB | Squarespace events page + per-event ICS |

### Not Yet Integrated

| Source | Sport | Why Deferred |
|---|---|---|
| RunSignUp | Running | Requires API key registration |
| ACTIVE.com | Running / Multi-sport | Requires API key registration |

## Coverage Summary

| Country | Powerlifting | Bodybuilding | Running |
|---|---|---|---|
| US | Excellent (USPA + Powerlifting America + RPS + USAPL) | Good (IFBB + NPC + IFBB Pro) | Good (Parkrun) |
| GB | Good (British Powerlifting) | Good (IFBB + UKBFF) | Excellent (Parkrun) |
| Europe | Partial (IFBB only) | Good (IFBB) | Partial (Parkrun, but not exposed yet outside US/GB) |

## KV Storage Design

Events are stored as prebuilt arrays grouped by type and country:

```text
events:powerlifting:US
events:powerlifting:GB
events:bodybuilding:US
events:bodybuilding:GB
events:running:US
events:running:GB
events:all:US
events:all:GB
meta:last-fetch
```

`meta:last-fetch` currently stores:

```json
{
  "timestamp": "2026-04-03T15:04:29.494Z",
  "totalEvents": 1983,
  "sourceCounts": {
    "uspa": 125,
    "plamerica": 89,
    "ifbb": 59
  },
  "byCountry": {
    "US": 1410,
    "GB": 573
  }
}
```

## Event Schema

Each event object stored in KV looks like this:

```json
{
  "eventId": "a1b2c3d4e5f6g7h8",
  "source": "uspa",
  "type": "powerlifting",
  "name": "USPA Texas State Championship",
  "startDate": "2026-05-15",
  "endDate": "2026-05-16",
  "venue": "Austin Convention Center",
  "address": "500 E Cesar Chavez St",
  "city": "Austin",
  "state": "TX",
  "country": "US",
  "lat": 30.2632,
  "lon": -97.7394,
  "url": "https://uspa.net/events/texas-state-2026",
  "description": ""
}
```

`eventId` is a SHA-256 hash of `source|name|startDate`.

## API Specification

```text
GET /api/events
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | string | `all` | `powerlifting`, `bodybuilding`, `running`, or `all` |
| `country` | string | `US` | ISO 3166-1 alpha-2: `US`, `GB` |
| `lat` | number | - | Latitude for proximity filtering |
| `lon` | number | - | Longitude for proximity filtering |
| `radius` | number | `100` | Miles, only used with `lat` + `lon` |
| `limit` | number | `100` | Max results, capped at `500` |

Example response:

```json
{
  "events": [...],
  "count": 42,
  "total": 159,
  "filters": {
    "type": "powerlifting",
    "country": "US",
    "limit": 100
  },
  "meta": {
    "lastFetch": "2026-04-03T15:04:29.494Z",
    "totalEvents": 1983
  }
}
```

Notes:

- No authentication required
- CORS is enabled
- Radius filtering only works for events that already have coordinates

## File Structure

```text
website/
  workers/
    events-worker/
      wrangler.toml
      package.json
      src/
        index.js
        collector.js
        api.js
        fetchers/
          tribe-events.js
          rps.js
          parkrun.js
          usapl.js
          npc.js
          ifbbpro.js
          britishpl.js
          ukbff.js
        lib/
          normalize.js
          geo.js
          cors.js
  events.html
  assets/js/events.js
```

## Scraper / Fetcher Resilience

Each source is isolated and failure-tolerant:

- wrapped in `try/catch`
- run via `Promise.allSettled`
- uses request timeouts
- uses explicit `User-Agent: HelmFitnessApp/1.0 (events-collector)`
- returns `[]` on failure instead of crashing the whole collector

When a source fails:

- the collector still completes
- that source contributes zero events for that run
- coverage is reduced until the fetcher is fixed

This already paid off during development:

- Powerlifting America had to be corrected to a working domain
- British Powerlifting had to be rewritten against new listing pages
- UKBFF needed a parser fix for folded ICS fields
- Parkrun country mapping had drifted from the live source payload

## Geo Filtering

The API supports optional radius filtering via `lat`, `lon`, and `radius`.

Current implementation:

- no geocoding service is implemented
- only sources that already provide coordinates can participate in radius queries
- events without coordinates still appear in normal type/country queries

## Cost

At the current scale, this should stay effectively within Cloudflare free-tier usage.

Main cost drivers:

- one weekly collector run
- low-volume public API reads
- KV reads for precomputed event arrays
- small KV write volume once per weekly refresh

## Deployment Status And Remaining Work

### Already Completed

1. Worker dependencies installed.
2. Wrangler auth completed.
3. KV namespace created and bound.
4. Worker deployed successfully.
5. Route configured:
   - `helmfit.com/api/*`
6. Local testing completed for:
   - scheduled collection
   - API responses
   - website filter UI
7. Main website nav updated to include `Events`.

### Remaining To Get It Working Online

1. Make `helmfit.com` publicly resolve and serve the website.
   - This is the main blocker right now.
   - Until the domain/site is live, `https://helmfit.com/api/events` is not reachable from a normal browser session.

2. Deploy/publish the website itself.
   - The events page is already built.
   - It expects same-origin `/api/events` once the site is live on the domain.

3. Verify the live route after DNS/site deployment.
   - `https://helmfit.com/api/events?country=US&limit=1`
   - `https://helmfit.com/events.html`

4. Run one post-launch sanity check.
   - confirm cron still writes KV
   - confirm `US` and `GB` filters work
   - confirm `powerlifting`, `bodybuilding`, and `running` all return data

### Optional Before Public Launch

1. Expose a temporary `workers.dev` URL if you want a public API host before the main site is live.
2. Add basic alerting/log capture for source failures.
3. Clean up minor remaining HTML entities in some source titles if desired.

## Local Testing Notes

### Test with a local worker

Run the worker:

```bash
cd website/workers/events-worker
npx wrangler dev --test-scheduled --port 8787
```

Trigger collection:

```bash
curl "http://localhost:8787/__scheduled?cron=0+6+*+*+1"
```

Serve the website:

```bash
cd website
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/events.html?api=http://localhost:8787
```

Important:

- every time `wrangler dev` restarts, the local KV store resets
- after each restart you must trigger `/__scheduled` again before local events will appear

### Test the website locally without a local worker

That only works if you have a publicly reachable API host.

Once `helmfit.com` is live, you can test the local static site against the live API with:

```text
http://localhost:8000/events.html?api=https://helmfit.com
```

## Future Enhancements

1. Add RunSignUp API.
2. Add ACTIVE.com API.
3. Expand beyond `US` / `GB`.
4. Add scraper failure alerting.
5. Add in-app integration in the React Native app.
6. Add user/organizer event submissions.
