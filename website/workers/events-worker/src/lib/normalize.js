/**
 * Event normalization utilities.
 * Uses Web Crypto (crypto.subtle) -- no Node.js APIs.
 */

const COUNTRY_MAP = {
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  us: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  gb: 'GB',
  'great britain': 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  australia: 'AU',
  au: 'AU',
  canada: 'CA',
  ca: 'CA',
  'new zealand': 'NZ',
  nz: 'NZ',
  ireland: 'IE',
  ie: 'IE',
  france: 'FR',
  fr: 'FR',
  germany: 'DE',
  de: 'DE',
  'south africa': 'ZA',
  za: 'ZA',
};

/**
 * Map a country name/code to an ISO 3166-1 alpha-2 code.
 * Returns the uppercased input if no mapping is found and it is 2 chars.
 */
export function normalizeCountry(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];
  // Already a 2-letter code
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

/**
 * Normalize a date string to YYYY-MM-DD.
 * Handles ISO strings, US-style dates, and common variants.
 */
export function normalizeDate(raw) {
  if (!raw) return null;
  const s = raw.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO datetime -- take the date part
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);

  // MM/DD/YYYY or M/D/YYYY
  const usMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MM-YYYY
  const euMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (euMatch) {
    const [, d, m, y] = euMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "Month DD, YYYY" or "Month DD YYYY"
  const longMatch = s.match(
    /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/
  );
  if (longMatch) {
    const [, monthStr, day, year] = longMatch;
    const monthNum = monthNameToNumber(monthStr);
    if (monthNum) {
      return `${year}-${String(monthNum).padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // "DD Month YYYY"
  const euLongMatch = s.match(
    /^(\d{1,2})\s+(\w+)\s+(\d{4})$/
  );
  if (euLongMatch) {
    const [, day, monthStr, year] = euLongMatch;
    const monthNum = monthNameToNumber(monthStr);
    if (monthNum) {
      return `${year}-${String(monthNum).padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Fallback: try Date constructor
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

export const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function monthNameToNumber(name) {
  return MONTHS[name.toLowerCase()] || null;
}

/**
 * Strip HTML tags and decode common HTML entities.
 */
export function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a deterministic event ID from source + name + date using SHA-256.
 * Returns a hex string.
 */
export async function generateEventId(source, name, date) {
  const input = `${source}|${name}|${date}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Build a normalized event object from raw scraped data.
 * @param {object} raw - must include at least: source, name, startDate
 * @returns {object} normalized event
 */
export async function normalizeEvent(raw) {
  const startDate = normalizeDate(raw.startDate);
  const endDate = normalizeDate(raw.endDate) || startDate;
  const country = normalizeCountry(raw.country);
  const eventId = await generateEventId(raw.source, raw.name, startDate);

  return {
    eventId,
    source: raw.source,
    type: raw.type || null,
    name: (raw.name || '').trim(),
    startDate,
    endDate,
    venue: (raw.venue || '').trim() || null,
    address: (raw.address || '').trim() || null,
    city: (raw.city || '').trim() || null,
    state: (raw.state || '').trim() || null,
    country,
    lat: raw.lat != null ? parseFloat(raw.lat) : null,
    lon: raw.lon != null ? parseFloat(raw.lon) : null,
    url: (raw.url || '').trim() || null,
    description: stripHtml(raw.description || ''),
  };
}
