#!/usr/bin/env node
/**
 * Snapshot regression test for the ProPhysiques USA bodybuilding aggregator.
 *
 *   node scripts/test-prophysiques.mjs
 *
 * Re-capture the fixture with:
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://www.prophysiques.com/2026-usa-bodybuilding-shows-competitions-calendar \
 *     -o test-fixtures/prophysiques-usa.html
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  detectYear,
  parseMonthSections,
  parseLine,
} from '../src/fetchers/prophysiques.js';
import { MONTHS } from '../src/lib/normalize.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');
const html = readFileSync(join(fixtures, 'prophysiques-usa.html'), 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log(`  ok  ${msg}`);
  else { console.error(`  FAIL  ${msg}`); failed++; }
}

const year = detectYear(html);
const sections = parseMonthSections(html);
const events = [];
for (const section of sections) {
  const monthNum = MONTHS[section.month.toLowerCase()];
  for (const line of section.lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    events.push({ month: section.month, monthNum, line, ...parsed });
  }
}

console.log('== year detection ==');
assert(year === 2026, `detectYear -> ${year} (expect 2026)`);

console.log('== section coverage ==');
assert(sections.length >= 4, `${sections.length} month sections (expect >= 4)`);

console.log('== overall events ==');
assert(events.length >= 30, `parsed ${events.length} events (expect >= 30)`);

console.log('== federation diversity ==');
const federations = new Set(events.map((e) => e.federation));
assert(federations.size >= 5, `${federations.size} unique federations (expect >= 5)`);
console.log('  feds present:', [...federations].sort().join(', '));

console.log('== specific federations present ==');
const wnbf = events.find((e) => /^WNBF$/.test(e.federation));
assert(!!wnbf, 'at least one WNBF event');
const ocb = events.find((e) => /OCB/i.test(e.federation));
const nanbf = events.find((e) => /NANBF/i.test(e.federation));
const npc = events.find((e) => /MuscleContest|^NPC\b/i.test(e.federation));
assert(!!nanbf, 'at least one NANBF event');
assert(!!npc, 'at least one NPC / MuscleContest event');
// OCB may or may not be on this page in any given snapshot
console.log(`  WNBF: ${!!wnbf}, OCB: ${!!ocb}, NANBF: ${!!nanbf}, NPC: ${!!npc}`);

console.log('== specific known events ==');
const sands = events.find((e) => /Sands of Strength/i.test(e.name));
assert(!!sands, 'WNBF Sands of Strength present');
if (sands) {
  assert(sands.startDay === 21, `Sands of Strength day=21 (got ${sands.startDay})`);
  assert(sands.federation === 'WNBF', `Sands federation=WNBF (got ${sands.federation})`);
}

console.log('== IFBB Pro skip filter ==');
// parseMonthSections doesn't filter; the runtime fetcher does. Just confirm
// IFBB Pro lines exist on the page (so the skip is meaningful).
const ifbbProLines = events.filter((e) => /^IFBB Pro/i.test(e.federation));
assert(ifbbProLines.length >= 1, `aggregator contains IFBB Pro entries (${ifbbProLines.length}) — runtime skip must drop these`);

console.log('== parseLine direct cases ==');
const a = parseLine('21st Sat - WNBF - Erie H Meyer Civic Center, Gulf Shores, AL - WNBF Sands of Strength');
assert(a && a.startDay === 21 && a.federation === 'WNBF' && /Sands of Strength/.test(a.name), 'single-day line');
const b = parseLine('5th Thu - 8th Sun - IFBB Pro League - Venue TBC, Columbus, OH - Arnold Classic USA (Pro)');
assert(b && b.startDay === 5 && b.endDay === 8 && /Arnold Classic/.test(b.name), 'multi-day line');
const c = parseLine('not a date');
assert(c === null, 'bad input returns null');

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log(`All assertions passed. (${events.length} events parsed across ${sections.length} months)`);
}
