/**
 * Scraper for HYROX events via RoxRadar (https://www.roxradar.com/).
 *
 * RoxRadar is a community-maintained HYROX calendar. We use it instead of
 * scraping hyrox.com directly because hyrox.com 403s our Worker UA. RoxRadar
 * is server-rendered Webflow with rich data-* attributes, so parsing is
 * straightforward.
 *
 * Each event is a <div class="map-item"> with attributes:
 *   data-start, data-end       e.g. "April 29, 2026", "May 4, 2026"
 *   data-lat, data-lng
 *   data-region                e.g. "Europe & UK", "North America"
 *   data-status                e.g. "On Sale", "Coming Soon"
 *   data-hyrox-code            opaque, sometimes ambiguous (BIR = Birmingham UK
 *                              OR Berlin Tempelhof). Don't rely on it.
 *
 * Country is derived from the event slug via SLUG_COUNTRY (below). Slugs are
 * stable across years (`hyrox-cardiff-2026`, `hyrox-cardiff-2026-s9`) so the
 * lookup is safe. Unknown slugs are logged and skipped — that's the signal
 * to update the table when HYROX adds new cities.
 */

import { normalizeEvent, normalizeDate } from '../lib/normalize.js';

const PAGE_URL = 'https://www.roxradar.com/';
const EVENT_BASE_URL = 'https://www.roxradar.com';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * City slug → ISO 3166-1 alpha-2 country code.
 * Keys are the slug fragment after stripping `hyrox-` and `-2026[-sN]`.
 * Add new entries when the live calendar surfaces unmapped cities.
 */
const SLUG_COUNTRY = {
  // GB
  'cardiff': 'GB',
  'birmingham': 'GB',
  'london': 'GB',
  // US
  'new-york': 'US',
  'washington': 'US',
  'salt-lake-city': 'US',
  'boston': 'US',
  'tampa': 'US',
  'denver': 'US',
  'dallas': 'US',
  'anaheim': 'US',
  'nashville': 'US',
  // CA
  'ottawa': 'CA',
  'toronto': 'CA',
  'vancouver': 'CA',
  // FR
  'paris': 'FR',
  'paris-grand-palais': 'FR',
  'lyon': 'FR',
  'bordeaux': 'FR',
  'nice': 'FR',
  // DE
  'tempelhof': 'DE',
  'karlsruhe': 'DE',
  'hamburg': 'DE',
  'dusseldorf': 'DE',
  'frankfurt': 'DE',
  // ES
  'barcelona': 'ES',
  'tenerife': 'ES',
  'valencia': 'ES',
  // IT
  'rimini': 'IT',
  'rome': 'IT',
  'milan': 'IT',
  // NL
  'heerenveen': 'NL',
  'maastricht': 'NL',
  'utrecht': 'NL',
  // BE
  'gent': 'BE',
  // CH
  'geneva': 'CH',
  // PL
  'gdansk': 'PL',
  'poznan': 'PL',
  // PT
  'lisbon': 'PT',
  // FI
  'helsinki': 'FI',
  // NO
  'oslo': 'NO',
  // SE
  'world-championships-stockholm': 'SE',
  // IE
  'dublin': 'IE',
  // LV
  'riga': 'LV',
  // TR
  'istanbul': 'TR',
  // ZA
  'johannesburg': 'ZA',
  'cape-town': 'ZA',
  // KR
  'incheon': 'KR',
  'seoul': 'KR',
  // CN
  'shanghai': 'CN',
  'hangzhou': 'CN',
  'chengdu': 'CN',
  'shenzhen': 'CN',
  'beijing': 'CN',
  'sanya': 'CN',
  'guangzhou': 'CN',
  // HK
  'hong-kong': 'HK',
  // JP
  'chiba': 'JP',
  // TH
  'bangkok': 'TH',
  // ID
  'jakarta': 'ID',
  // IN
  'new-delhi': 'IN',
  'mumbai': 'IN',
  // AU
  'sydney': 'AU',
  'perth': 'AU',
  // MX
  'puebla': 'MX',
  'acapulco': 'MX',
  'mexico-city': 'MX',
  // BR
  'sao-paulo': 'BR',
  'rio-de-janeiro': 'BR',
  // AR
  'buenos-aires': 'AR',
};

export async function fetchRoxRadar() {
  const html = await fetchHtml(PAGE_URL);
  if (!html) return [];

  const items = parseMapItems(html);
  console.log(`[roxradar] parsed ${items.length} map-items`);

  const events = [];
  const seenSlugs = new Set();
  const unmappedSlugs = new Set();

  for (const item of items) {
    if (!item.slug) continue;
    if (seenSlugs.has(item.slug)) continue;
    seenSlugs.add(item.slug);

    const country = lookupCountry(item.slug);
    if (!country) {
      unmappedSlugs.add(item.slug);
      continue;
    }

    const startDate = normalizeDate(item.dataStart);
    const endDate = normalizeDate(item.dataEnd) || startDate;
    if (!startDate) continue;

    const cityName = item.cityDisplay || prettifyCity(slugCity(item.slug));
    const name = `HYROX ${cityName}`;

    events.push(
      await normalizeEvent({
        source: 'roxradar',
        type: 'hyrox',
        country,
        name,
        startDate,
        endDate,
        venue: cityName,
        city: cityName,
        lat: item.lat,
        lon: item.lng,
        url: `${EVENT_BASE_URL}/events/${item.slug}`,
      })
    );
  }

  if (unmappedSlugs.size > 0) {
    console.warn(
      `[roxradar] ${unmappedSlugs.size} unmapped slugs (add to SLUG_COUNTRY): ${[...unmappedSlugs].join(', ')}`
    );
  }
  console.log(`[roxradar] emitted ${events.length} events`);
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
      console.error(`[roxradar] ${url} returned ${resp.status}`);
      return null;
    }
    return await resp.text();
  } catch (err) {
    console.error(`[roxradar] fetch failed:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Walk the page and yield one record per <div class="map-item">.
 * Each record bundles the data-* attrs from the opening div plus the slug
 * and city display name harvested from the inner anchor + name-wrap.
 */
export function parseMapItems(html) {
  const out = [];
  const openTagRe = /<div\s+([^>]*?\bclass="map-item"[^>]*)>/g;
  const positions = [];
  let m;
  while ((m = openTagRe.exec(html)) !== null) {
    positions.push({ index: m.index, attrs: m[1], tagEnd: openTagRe.lastIndex });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].tagEnd;
    const end = i + 1 < positions.length ? positions[i + 1].index : html.length;
    const chunk = html.slice(start, end);

    const attrs = parseAttrs(positions[i].attrs);
    const slugMatch = chunk.match(/href="\/events\/([a-z0-9-]+)"/);
    if (!slugMatch) continue;

    // The visible name-wrap renders "<div>HYROX</div><div>City</div>"; a
    // hidden duplicate exists with class w-condition-invisible — skip it.
    const visibleNameRe = /<div class="event-name-wrap"(?![^>]*w-condition-invisible)[^>]*>\s*<div[^>]*>([^<]*)<\/div>\s*<div[^>]*>([^<]+)<\/div>/i;
    const nameMatch = chunk.match(visibleNameRe);
    const cityDisplay = nameMatch ? nameMatch[2].trim() : null;

    out.push({
      slug: slugMatch[1],
      cityDisplay,
      dataStart: attrs['data-start'],
      dataEnd: attrs['data-end'],
      region: attrs['data-region'],
      status: attrs['data-status'],
      hyroxCode: attrs['data-hyrox-code'],
      lat: parseFloat(attrs['data-lat']) || null,
      lng: parseFloat(attrs['data-lng']) || null,
    });
  }
  return out;
}

function parseAttrs(attrString) {
  const map = {};
  const re = /([a-zA-Z\-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(attrString)) !== null) {
    map[m[1].toLowerCase()] = m[2].replace(/&amp;/g, '&');
  }
  return map;
}

/**
 * Strip "hyrox-" prefix and "-2026" / "-2026-sN" suffix from the slug.
 *   "hyrox-cardiff-2026"           -> "cardiff"
 *   "hyrox-istanbul-2026-s9"       -> "istanbul"
 *   "hyrox-paris-grand-palais-2026"-> "paris-grand-palais"
 */
export function slugCity(slug) {
  return slug.replace(/^hyrox-/, '').replace(/-20\d{2}(?:-s\d+)?$/, '');
}

export function lookupCountry(slug) {
  const city = slugCity(slug);
  return SLUG_COUNTRY[city] || null;
}

function prettifyCity(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
