#!/usr/bin/env node
/**
 * Snapshot regression test for the RunSignup races fetcher.
 *
 *   node scripts/test-runsignup.mjs
 *
 * Re-capture the fixture with:
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     "https://runsignup.com/Rest/races?format=json&country_code=US&start_date=$(date +%Y-%m-%d)&end_date=$(date -d '+1 year' +%Y-%m-%d)&results_per_page=20&page=1&events=T&include_extra_features=T" \
 *     -o test-fixtures/runsignup-races.json
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  parseUSDate,
  hasMeaningfulDistance,
  isAtLeast5K,
} from '../src/fetchers/runsignup.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');
const data = JSON.parse(readFileSync(join(fixtures, 'runsignup-races.json'), 'utf8'));

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log(`  ok  ${msg}`);
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log('== fixture sanity ==');
assert(Array.isArray(data.races), 'fixture has races array');
assert(data.races.length >= 10, `at least 10 races in fixture (got ${data.races.length})`);

console.log('== parseUSDate ==');
assert(parseUSDate('06/06/2026') === '2026-06-06', '06/06/2026 -> 2026-06-06');
assert(parseUSDate('6/6/2026') === '2026-06-06', '6/6/2026 -> 2026-06-06');
assert(parseUSDate('') === null, 'empty -> null');
assert(parseUSDate(null) === null, 'null -> null');
assert(parseUSDate('not-a-date') === null, 'invalid -> null');

console.log('== isAtLeast5K ==');
assert(isAtLeast5K('5K') === true, '5K');
assert(isAtLeast5K('10K') === true, '10K');
assert(isAtLeast5K('1K') === false, '1K');
assert(isAtLeast5K('1 Miles') === false, '1 Miles');
assert(isAtLeast5K('3.1 Miles') === true, '3.1 Miles (= 5K)');
assert(isAtLeast5K('13.1 Miles') === true, '13.1 Miles (half)');
assert(isAtLeast5K('26.2 Miles') === true, '26.2 Miles (full)');
assert(isAtLeast5K('') === false, 'empty');
assert(isAtLeast5K(null) === false, 'null');

console.log('== distance filter applied to fixture ==');
let kept = 0, skipped = 0;
const skippedBecauseShort = [];
for (const wrapper of data.races) {
  const r = wrapper.race || wrapper;
  if (hasMeaningfulDistance(r.events)) kept++;
  else {
    skipped++;
    skippedBecauseShort.push(r.name?.slice(0, 40));
  }
}
console.log(`  kept ${kept} / skipped ${skipped} (of ${data.races.length})`);
assert(kept >= 5, `at least 5 races pass the >= 5K filter (got ${kept})`);

console.log('== canceled-race name filter ==');
const canceled = data.races.find((w) => /Event Canceled/i.test((w.race || w).name || ''));
assert(!!canceled, 'fixture contains a canceled race (gives our skip filter something to do)');

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log('All assertions passed.');
}
