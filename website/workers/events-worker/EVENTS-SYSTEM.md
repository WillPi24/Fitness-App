# Helm Events Finder — System Documentation

## What This Is

An automated competition/event aggregation system that collects upcoming powerlifting meets, bodybuilding shows, and running races from 10 free data sources, stores them in Cloudflare KV, and serves them via a public API. The website has a search page where users can filter events by type, country, and location.

This is a key differentiator for Helm — no fitness app currently does this well.

## Why Cloudflare Workers + KV

We evaluated AWS Lambda + DynamoDB (the existing backend stack) and Cloudflare Workers + KV. We chose Cloudflare because:

- **The website is already on Cloudflare Pages** — everything stays in one platform
- **Completely free** — Workers free tier gives 100,000 requests/day, KV gives 100,000 reads/day and 1,000 writes/day. The events system uses a fraction of this.
- **No AWS deployment needed** — the AWS backend hasn't been deployed yet, and this feature doesn't need Cognito auth or the existing DynamoDB table
- **Simpler architecture** — one Worker handles both the weekly cron (data collection) and the API (serving events). No API Gateway, no IAM roles, no SAM template.
- **Global edge** — KV is replicated globally, so reads are fast from anywhere

## Architecture

```
Weekly Cron (Monday 6am UTC)
  │
  ▼
Cloudflare Worker (events-collector)
  │
  ├── API Fetchers (reliable, structured JSON, no maintenance)
  │   ├── USPA ──────────────────┐
  │   ├── Powerlifting America ──┤  WordPress "The Events Calendar" REST API
  │   ├── IFBB ──────────────────┘  (same JSON format, one shared fetcher)
  │   ├── RPS (RSS 2.0 feed, manual XML parsing)
  │   └── Parkrun (static GeoJSON with GPS coordinates)
  │
  └── HTML Scrapers (5 specific pages, isolated, try/catch per source)
      ├── USAPL (usapowerlifting.com/calendar/)
      ├── NPC (npcnewsonline.com/schedule/)
      ├── IFBB Pro (ifbbpro.com schedule)
      ├── British Powerlifting (britishpowerlifting.org/calendar/)
      └── UKBFF (ukbff.co.uk/events + per-event iCal)
  │
  ▼ normalize + deduplicate + filter past events + sort by date
  │
  ▼
Cloudflare KV (helm-events namespace)
  Keys: events:{type}:{country} → JSON array of events
  Key:  meta:last-fetch → timestamp + per-source success/failure
  │
  ▼
Public API: GET /api/events?type=powerlifting&country=US&lat=51.5&lon=-0.12&radius=50
  │
  ▼
website/events.html — search page with filter pills + event cards
```

## Data Sources — Detailed Breakdown

### Layer 1: Real APIs (no scraping, very reliable, no maintenance)

| Source | Sport | URL | Format | Coverage | Notes |
|--------|-------|-----|--------|----------|-------|
| **USPA** | Powerlifting | `uspa.net/wp-json/tribe/events/v1/events` | JSON REST API | US | Hundreds of meets. No auth. Paginated. |
| **Powerlifting America** | Powerlifting | `powerlifting-america.com/wp-json/tribe/events/v1/events` | JSON REST API | US | 89+ upcoming events. Same format as USPA. |
| **IFBB** | Bodybuilding | `ifbb.com/wp-json/tribe/events/v1/events` | JSON REST API | Global | 59 upcoming amateur bodybuilding events. Europe, Asia, Africa, Americas. |
| **RPS** | Powerlifting | `meets.revolutionpowerlifting.com/feed/` | RSS 2.0 XML | US | Revolution Powerlifting Syndicate meets. |
| **Parkrun** | Running | `images.parkrun.com/events.json` | GeoJSON | Global (21 countries) | 2,869 weekly events. Has exact GPS coordinates. Filtered to US/GB. |

All three WordPress sources (USPA, Powerlifting America, IFBB) use the identical "The Events Calendar" plugin, so one shared fetcher function (`tribe-events.js`) handles all three.

### Layer 2: HTML Scrapers (5 specific pages, for gaps in API coverage)

| Source | Sport | URL | Country | Why Scraped |
|--------|-------|-----|---------|-------------|
| **USAPL** | Powerlifting | `usapowerlifting.com/calendar/` | US | Biggest US PL federation, no API |
| **NPC** | Bodybuilding | `npcnewsonline.com/schedule/` | US | Dominant US amateur bodybuilding, no API |
| **IFBB Pro** | Bodybuilding | IFBB Pro schedule page | US/Global | Professional bodybuilding, no API |
| **British Powerlifting** | Powerlifting | `britishpowerlifting.org/calendar/` | GB | THE UK powerlifting federation, no API |
| **UKBFF** | Bodybuilding | `ukbff.co.uk/events` | GB | UK bodybuilding federation, Squarespace site |

Scrapers use Cloudflare's built-in **HTMLRewriter** (not cheerio — too large for Workers' 1MB bundle limit). Each scraper is isolated in its own file. If one fails, it doesn't affect the other 9 sources. Failed sources are logged in the `meta:last-fetch` KV entry.

### Not Yet Integrated (future, needs free API keys)

| Source | Sport | Why Deferred |
|--------|-------|-------------|
| **RunSignUp** | Running | Excellent US running API, but requires API key registration at runsignup.com/API/ApiKeys |
| **ACTIVE.com** | Running/Multi | Global events with GPS coordinates, requires API key at developer.active.com |

These can be added later with minimal code changes — the fetcher pattern is already established.

## Coverage Summary

| Country | Powerlifting | Bodybuilding | Running |
|---------|-------------|--------------|---------|
| **US** | Excellent (USPA + PL America + RPS + USAPL) | Good (IFBB + NPC + IFBB Pro) | Good (Parkrun, more with RunSignUp later) |
| **UK** | Good (British Powerlifting) | Good (IFBB + UKBFF) | Excellent (Parkrun) |
| **Europe** | Partial (IFBB only) | Good (IFBB) | Good (Parkrun) |

## KV Storage Design

Cloudflare KV is a global key-value store. Events are stored as pre-built JSON arrays grouped by type and country:

```
events:powerlifting:US  → [{...}, {...}, ...]    # All upcoming US powerlifting meets
events:powerlifting:GB  → [{...}, {...}, ...]    # All upcoming UK powerlifting meets
events:bodybuilding:US  → [{...}, {...}, ...]
events:bodybuilding:GB  → [{...}, {...}, ...]
events:running:US       → [{...}, {...}, ...]
events:running:GB       → [{...}, {...}, ...]
events:all:US           → [{...}, {...}, ...]    # All types combined
events:all:GB           → [{...}, {...}, ...]
meta:last-fetch         → { timestamp, sources: { uspa: {ok, count}, ... } }
```

This design means API reads are a single KV GET — no database queries, no filtering at read time (except optional geo-filtering and date freshness checks). Writes happen once per week during the cron job.

## Event Schema

Each event object stored in KV:

```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "source": "uspa",
  "type": "powerlifting",
  "name": "USPA Texas State Championship",
  "date": "2026-05-15",
  "endDate": "2026-05-16",
  "venue": "Austin Convention Center",
  "city": "Austin",
  "state": "TX",
  "country": "US",
  "lat": 30.2632,
  "lon": -97.7394,
  "federation": "USPA",
  "url": "https://uspa.net/events/texas-state-2026"
}
```

The `id` is a SHA-256 hash of `source|name|date`, used for deduplication across weekly runs.

## API Specification

```
GET /api/events
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `all` | `powerlifting`, `bodybuilding`, `running`, or `all` |
| `country` | string | `US` | ISO 3166-1 alpha-2: `US`, `GB` |
| `lat` | number | — | Latitude for proximity filtering |
| `lon` | number | — | Longitude for proximity filtering |
| `radius` | number | `100` | Miles (only used with lat/lon) |
| `limit` | number | `50` | Max results (capped at 200) |

**Response:**
```json
{
  "events": [...],
  "count": 42
}
```

No authentication required — events are public data. CORS enabled for all origins.

## File Structure

```
website/
  workers/
    events-worker/
      wrangler.toml              # Cloudflare Worker config (cron schedule, KV binding)
      package.json               # Dev dependency: wrangler
      src/
        index.js                 # Entry: routes scheduled→collector, /api/events→API
        collector.js             # Orchestrates all fetchers, writes to KV
        api.js                   # Reads KV, filters, returns JSON
        fetchers/
          tribe-events.js        # Shared: USPA + PL America + IFBB (WordPress REST API)
          rps.js                 # RSS feed parser
          parkrun.js             # GeoJSON parser
          usapl.js               # HTML scraper (HTMLRewriter)
          npc.js                 # HTML scraper
          ifbbpro.js             # HTML scraper
          britishpl.js           # HTML scraper
          ukbff.js               # HTML scraper + iCal parser
        lib/
          normalize.js           # Event normalization + SHA-256 ID generation
          geo.js                 # Haversine distance calculation
          cors.js                # CORS headers
  events.html                    # Search page
  assets/js/events.js            # Client-side filter + rendering
```

## Scraper Resilience

Each scraper:
- Wrapped in `try/catch` — returns empty array on failure, never crashes the collector
- Uses `AbortController` with 10-second timeout per HTTP request
- Sets `User-Agent: HelmFitnessApp/1.0 (events-collector)`
- Run via `Promise.allSettled` — one failing source doesn't affect the other 9
- Multiple parsing strategies per scraper (JSON-LD first, HTMLRewriter second, regex fallback)

When a scraper fails:
- The failure is logged in `meta:last-fetch` KV entry
- Previously cached events for that source remain in KV (the collector only adds/updates, never deletes)
- Users still see events from the last successful fetch

**Expected maintenance:** Federation websites redesign maybe once a year. When a scraper breaks, check `meta:last-fetch` to see which source failed, then update the CSS selectors/parsing logic in the relevant fetcher file. Typically 30-60 minutes of work per breakage.

## Geocoding

Events from some sources (especially scrapers) may not have GPS coordinates. The system uses **OpenStreetMap Nominatim** (free, no API key) to geocode addresses:

- Called only for events missing `lat`/`lon`
- Rate limited to 1 request per 1.1 seconds (Nominatim policy)
- Optional — events without coordinates still appear in type/country queries, just excluded from radius-based filtering
- ~50-100 geocode calls per weekly run

## Cost

**$0 per month.** Everything is within Cloudflare's free tier:

| Resource | Usage | Free Tier Limit |
|----------|-------|----------------|
| Worker requests (API) | ~100-1,000/day | 100,000/day |
| Worker invocations (cron) | 1/week | Unlimited |
| KV reads | ~100-1,000/day | 100,000/day |
| KV writes | ~10-20/week | 1,000/day |
| KV storage | ~1-5 MB | 1 GB |

## Next Steps to Deploy

### Prerequisites
1. Cloudflare account (already have for Pages hosting)
2. Node.js installed
3. Install Wrangler CLI: `npm install -g wrangler`

### Deployment Steps

```bash
# 1. Login to Cloudflare
wrangler login

# 2. Navigate to the worker directory
cd website/workers/events-worker

# 3. Install dev dependencies
npm install

# 4. Create the KV namespace (one-time)
npx wrangler kv:namespace create "EVENTS_KV"
# This outputs: { binding = "EVENTS_KV", id = "abc123..." }
# Copy the id value

# 5. Update wrangler.toml with the namespace ID
# Replace YOUR_KV_NAMESPACE_ID with the actual ID from step 4

# 6. Deploy the worker
npx wrangler deploy

# 7. Test the collector manually (triggers the cron)
npx wrangler dev
# Then in another terminal:
curl "http://localhost:8787/api/events?type=powerlifting&country=US"

# 8. Set up routing in Cloudflare dashboard
# Go to your helmfit.com domain → Workers Routes
# Add route: helmfit.com/api/* → helm-events worker
```

### After Deployment

1. **Verify data collection** — check KV in the Cloudflare dashboard to see if events are populated
2. **Test the events page** — open helmfit.com/events.html and verify events load
3. **Monitor** — check `meta:last-fetch` in KV to see which sources succeeded/failed
4. **Add Events link to nav** — update nav bar across all website pages to include Events

### Future Enhancements

1. **Add RunSignUp API** — register for free key at runsignup.com/API/ApiKeys, add the fetcher
2. **Add ACTIVE.com API** — register at developer.active.com, add the fetcher
3. **More countries** — add AU, IE, DE, NZ by expanding parkrun filtering and adding federation scrapers
4. **Email alerts** — set up a Cloudflare Worker to email on scraper failures (or use a webhook to Slack/Discord)
5. **In-app integration** — add an Events screen in the React Native app that calls the same API
6. **User submissions** — add a form on the events page for users/organizers to submit events not caught by the automated system
