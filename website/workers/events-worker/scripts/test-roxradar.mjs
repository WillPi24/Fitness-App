#!/usr/bin/env node
/**
 * Snapshot regression test for the RoxRadar HYROX scraper.
 *
 *   node scripts/test-roxradar.mjs
 *
 * Asserts the pure-JS parser against a captured RoxRadar fixture. Specifically
 * verifies that key cities (Cardiff, London, NYC, Boston) are extracted with
 * correct dates and country mappings.
 *
 * Re-capture the fixture with:
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://www.roxradar.com/ -o test-fixtures/roxradar.html
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseMapItems, slugCity, lookupCountry } from '../src/fetchers/roxradar.js';
import { normalizeDate } from '../src/lib/normalize.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');
const html = readFileSync(join(fixtures, 'roxradar.html'), 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ok  ${msg}`);
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

const items = parseMapItems(html);

console.log('== overall ==');
assert(items.length >= 50, `parsed ${items.length} map-items (expect >= 50)`);

console.log('== specific events ==');
const cardiff = items.find((e) => e.slug === 'hyrox-cardiff-2026');
assert(!!cardiff, 'found hyrox-cardiff-2026');
if (cardiff) {
  assert(normalizeDate(cardiff.dataStart) === '2026-04-29', `Cardiff start date 2026-04-29 (got ${normalizeDate(cardiff.dataStart)})`);
  assert(normalizeDate(cardiff.dataEnd) === '2026-05-04', `Cardiff end date 2026-05-04 (got ${normalizeDate(cardiff.dataEnd)})`);
  assert(cardiff.cityDisplay === 'Cardiff', `Cardiff display name (got "${cardiff.cityDisplay}")`);
  assert(lookupCountry(cardiff.slug) === 'GB', `Cardiff country GB (got ${lookupCountry(cardiff.slug)})`);
}

const london = items.find((e) => e.slug === 'hyrox-london-2026');
assert(!!london, 'found hyrox-london-2026');
if (london) assert(lookupCountry(london.slug) === 'GB', 'London → GB');

const nyc = items.find((e) => e.slug === 'hyrox-new-york-2026');
assert(!!nyc, 'found hyrox-new-york-2026');
if (nyc) assert(lookupCountry(nyc.slug) === 'US', 'New York → US');

const boston = items.find((e) => e.slug === 'hyrox-boston-2026');
assert(!!boston, 'found hyrox-boston-2026');
if (boston) assert(lookupCountry(boston.slug) === 'US', 'Boston → US');

const stockholm = items.find((e) => e.slug === 'hyrox-world-championships-stockholm-2026');
assert(!!stockholm, 'found World Championships Stockholm');
if (stockholm) assert(lookupCountry(stockholm.slug) === 'SE', 'Stockholm → SE');

console.log('== slug parsing ==');
assert(slugCity('hyrox-cardiff-2026') === 'cardiff', 'simple slug');
assert(slugCity('hyrox-istanbul-2026-s9') === 'istanbul', 'season-suffixed slug');
assert(slugCity('hyrox-paris-grand-palais-2026') === 'paris-grand-palais', 'multi-segment slug');
assert(slugCity('hyrox-world-championships-stockholm-2026') === 'world-championships-stockholm', 'long slug');

console.log('== country mapping coverage ==');
const unmapped = items.filter((i) => !lookupCountry(i.slug));
console.log(`  ${unmapped.length} unmapped slugs`);
if (unmapped.length > 0) {
  console.log('  unmapped:', unmapped.map((i) => i.slug).join(', '));
}
assert(unmapped.length <= 5, `<=5 unmapped slugs (got ${unmapped.length})`);

console.log('== UK + US coverage ==');
const ukItems = items.filter((i) => lookupCountry(i.slug) === 'GB');
const usItems = items.filter((i) => lookupCountry(i.slug) === 'US');
assert(ukItems.length >= 3, `at least 3 UK events (got ${ukItems.length})`);
assert(usItems.length >= 8, `at least 8 US events (got ${usItems.length})`);

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log(`All assertions passed. (${items.length} events parsed)`);
}
