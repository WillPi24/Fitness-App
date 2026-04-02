/**
 * Fetcher for Revolution Powerlifting Syndicate events via RSS feed.
 * Parses RSS 2.0 XML manually -- no library needed.
 */

import { normalizeEvent, normalizeDate, stripHtml } from '../lib/normalize.js';

const FEED_URL = 'https://meets.revolutionpowerlifting.com/feed/';
const USER_AGENT = 'HelmFitnessApp/1.0 (events-collector)';

/**
 * Extract text content between XML tags.
 */
function extractTag(xml, tag) {
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  // Handle CDATA sections
  const cdataPattern = new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`);
  const cdataMatch = xml.match(cdataPattern);
  if (cdataMatch) return cdataMatch[1].trim();

  const start = xml.indexOf(openTag);
  if (start === -1) return '';
  const end = xml.indexOf(closeTag, start);
  if (end === -1) return '';
  return xml.slice(start + openTag.length, end).trim();
}

/**
 * Try to extract a date from the event description or title.
 * RPS posts often contain dates in the content.
 */
function extractDateFromText(text) {
  // Look for patterns like "January 15, 2026" or "Jan 15, 2026"
  const longDate = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/i
  );
  if (longDate) {
    return normalizeDate(`${longDate[1]} ${longDate[2]}, ${longDate[3]}`);
  }

  // MM/DD/YYYY
  const usDate = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (usDate) {
    return normalizeDate(`${usDate[1]}/${usDate[2]}/${usDate[3]}`);
  }

  return null;
}

export async function fetchRPS() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(FEED_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    if (!resp.ok) {
      console.error(`[rps] Feed returned ${resp.status}`);
      return [];
    }

    const xml = await resp.text();

    // Split into <item> blocks
    const items = [];
    let rest = xml;
    while (true) {
      const itemStart = rest.indexOf('<item>');
      if (itemStart === -1) break;
      const itemEnd = rest.indexOf('</item>', itemStart);
      if (itemEnd === -1) break;
      items.push(rest.slice(itemStart, itemEnd + 7));
      rest = rest.slice(itemEnd + 7);
    }

    const events = [];
    for (const item of items) {
      const title = stripHtml(extractTag(item, 'title'));
      const link = extractTag(item, 'link');
      const pubDate = extractTag(item, 'pubDate');
      const description = extractTag(item, 'description');

      // Try to find an event date in title or description
      const eventDate =
        extractDateFromText(title) ||
        extractDateFromText(stripHtml(description)) ||
        normalizeDate(pubDate);

      if (!title) continue;

      const normalized = await normalizeEvent({
        source: 'rps',
        type: 'powerlifting',
        name: title,
        startDate: eventDate || '',
        url: link,
        description,
        country: 'US',
      });

      events.push(normalized);
    }

    return events;
  } catch (err) {
    console.error('[rps] Fetch error:', err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
