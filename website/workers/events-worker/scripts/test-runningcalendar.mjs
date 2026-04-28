#!/usr/bin/env node
/**
 * Snapshot regression test for the runningcalendar.co.uk fetcher.
 *
 *   node scripts/test-runningcalendar.mjs
 *
 * Re-capture the fixture (page 1 of the year):
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://www.runningcalendar.co.uk/calendar/2026/ \
 *     -o test-fixtures/runningcalendar-2026.html
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCards, parseLongDate } from '../src/fetchers/runningcalendar.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');
const html = readFileSync(join(fixtures, 'runningcalendar-2026.html'), 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log(`  ok  ${msg}`);
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

console.log('== card parsing ==');
const cards = parseCards(html);
assert(cards.length >= 80, `parsed ${cards.length} cards (expect >= 80)`);

console.log('== specific cards ==');
const serpentine = cards.find((c) => /Serpentine/i.test(c.name));
assert(!!serpentine, 'found Serpentine New Year\'s Day 10K');
if (serpentine) {
  assert(serpentine.dateText === 'Thursday, 1 January 2026', `Serpentine date text correct (got "${serpentine.dateText}")`);
  assert(serpentine.tag === 'Run/Walk', `Serpentine tag = Run/Walk (got "${serpentine.tag}")`);
  assert(/Hyde Park/i.test(serpentine.venue), `Serpentine venue contains Hyde Park (got "${serpentine.venue}")`);
  assert(serpentine.city === 'London', `Serpentine city = London (got "${serpentine.city}")`);
}

const wolfMoon = cards.find((c) => /Wolf Moon/i.test(c.name));
assert(!!wolfMoon, 'found Wolf Moon Trail Half Marathon');

console.log('== tag filtering signal ==');
const tags = new Set(cards.map((c) => c.tag).filter(Boolean));
console.log('  unique tags:', [...tags]);
assert(tags.has('Run/Walk'), 'at least one Run/Walk tagged card');

console.log('== parseLongDate ==');
assert(parseLongDate('Thursday, 1 January 2026') === '2026-01-01', 'with day-of-week');
assert(parseLongDate('1 January 2026') === '2026-01-01', 'without day-of-week');
assert(parseLongDate('15 March 2026') === '2026-03-15', 'mid-month');
assert(parseLongDate('25 December 2026') === '2026-12-25', 'end of year');
assert(parseLongDate('') === null, 'empty');
assert(parseLongDate('not a date') === null, 'invalid');

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log(`All assertions passed. (${cards.length} cards)`);
}
