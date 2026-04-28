#!/usr/bin/env node
/**
 * Snapshot regression test for the frontdouble UK bodybuilding aggregator.
 *
 *   node scripts/test-frontdouble.mjs
 *
 * Runs the pure-JS parser pieces (year detection, month sectioning, line
 * parsing) against a captured fixture so we can assert specific real shows
 * are extracted correctly. The full fetcher uses fetch() over the network,
 * which we don't exercise here.
 *
 * Re-capture the fixture with:
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://frontdouble.com/uk-bodybuilding-show-calendar/ \
 *     -o test-fixtures/frontdouble-calendar.html
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  detectYear,
  parseMonthSections,
  parseLine,
} from '../src/fetchers/frontdouble.js';
import { MONTHS } from '../src/lib/normalize.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');
const html = readFileSync(join(fixtures, 'frontdouble-calendar.html'), 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ok  ${msg}`);
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

// Build a flat list of (month, line, parsed) so the assertions are simple.
const year = detectYear(html);
const sections = parseMonthSections(html);
const events = [];
for (const section of sections) {
  const monthNum = MONTHS[section.month.toLowerCase()];
  for (const line of section.lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    events.push({
      month: section.month,
      monthNum,
      line,
      ...parsed,
    });
  }
}

console.log('== year detection ==');
assert(year === 2026, `detectYear -> ${year} (expect 2026)`);

console.log('== section coverage ==');
assert(sections.length >= 8, `${sections.length} month sections (expect >= 8)`);
assert(
  sections.some((s) => s.month.toLowerCase() === 'june'),
  `June section present`
);

console.log('== overall events ==');
assert(events.length >= 30, `parsed ${events.length} events (expect >= 30)`);

console.log('== specific shows ==');
const nabbaNW = events.find(
  (e) => /NABBA North West/i.test(e.title) && e.month.toLowerCase() === 'june'
);
assert(!!nabbaNW, 'NABBA North West present in June');
if (nabbaNW) {
  assert(nabbaNW.startDay === 6, `NABBA North West day is 6 (got ${nabbaNW.startDay})`);
  assert(/Floral Pavilion/i.test(nabbaNW.venue), `NABBA North West venue contains "Floral Pavilion" (got "${nabbaNW.venue}")`);
  assert(nabbaNW.monthNum === 6, `NABBA North West monthNum is 6 (got ${nabbaNW.monthNum})`);
}

const nabbaBritain = events.find(
  (e) => /NABBA Britain/i.test(e.title) && e.month.toLowerCase() === 'june'
);
assert(!!nabbaBritain, 'NABBA Britain Finals present in June');
if (nabbaBritain) {
  assert(nabbaBritain.startDay === 13, `NABBA Britain day is 13 (got ${nabbaBritain.startDay})`);
}

console.log('== UKBFF skip filter ==');
// Note: the parser DOES extract UKBFF lines. The skipping happens inside
// fetchFrontDouble itself. Confirm at least one UKBFF line was parsed (so
// we know the calendar contains them) and we'll trust the runtime skip.
const ukbffLines = events.filter((e) => /^UKBFF\b/i.test(e.title));
assert(ukbffLines.length >= 1, `aggregator contains UKBFF entries (${ukbffLines.length}) — runtime skip must drop these`);

console.log('== day variants ==');
// "13 – Gas Mark 10 Classic" — plain day
const gasMark = events.find((e) => /Gas Mark 10/i.test(e.title));
assert(!!gasMark && gasMark.startDay === 13, 'plain "13 – ..." parses');

// Date range "6–7" with en-dash and no spaces
const wff = events.find((e) => /WFF Open European/i.test(e.title));
assert(!!wff && wff.startDay === 6 && wff.endDay === 7, `"6–7" range parses to startDay=6, endDay=7`);

console.log('== parseLine direct cases ==');
const a = parseLine('6 – NABBA North West – Floral Pavilion, New Brighton, Wirral');
assert(a && a.startDay === 6 && /NABBA North West/.test(a.title) && /Floral Pavilion/.test(a.venue), 'en-dash separator');

const b = parseLine('6–7 – WFF Open European Championships – Middleton Arena, Manchester');
assert(b && b.startDay === 6 && b.endDay === 7, 'en-dash range');

const c = parseLine('13th - Some Show - A Venue, Town');
assert(c && c.startDay === 13 && c.title === 'Some Show', 'th suffix + hyphen separator');

const d = parseLine('30 — Cross Show — Some Place');
assert(d && d.startDay === 30, 'em-dash separator');

const e = parseLine('not a date row');
assert(e === null, 'bad input returns null');

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log(`All assertions passed. (${events.length} events parsed across ${sections.length} months)`);
}
