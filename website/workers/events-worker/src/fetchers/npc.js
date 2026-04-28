/**
 * NPC fetcher — currently a no-op stub.
 *
 * The previous source (npcnewsonline.com/schedule/) is a Tribe Events
 * Calendar with an empty event database for 2026. The natural replacement
 * (bevfrancis.com/npcnortheast/) is behind an Imperva Incapsula bot wall
 * that returns a 212-byte JS challenge to the Worker — unscrapeable without
 * a headless browser.
 *
 * In the meantime, NPC events surface on the events page via the
 * ProPhysiques aggregator (`fetchers/prophysiques.js`). NPC-prefixed event
 * names like "NPC San Diego Championships" appear there directly.
 *
 * Reactivate this fetcher when an NPC source becomes available that:
 *   - returns server-rendered HTML to a non-browser User-Agent
 *   - exposes future-dated 2026+ events
 *   - is not behind Incapsula / Cloudflare WAF for our Worker IP range
 */

export async function fetchNPC() {
  // Intentional no-op. See file header.
  return [];
}
