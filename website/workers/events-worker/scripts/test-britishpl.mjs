#!/usr/bin/env node
/**
 * Snapshot regression test for the British Powerlifting fetcher.
 *
 *   node scripts/test-britishpl.mjs
 *
 * The full fetcher uses HTMLRewriter (Cloudflare Workers global), which is not
 * available in Node. This script asserts the regex fallback path and the date
 * parser against a captured fixture -- both are pure JS and exercise the same
 * structural assumptions as the HTMLRewriter pass. If the BP markup drifts in
 * a way that breaks the fallback, the HTMLRewriter is almost certainly broken
 * too, so this is a useful canary.
 *
 * Re-capture the fixtures with:
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://www.britishpowerlifting.org/upcoming-championships/ \
 *     -o test-fixtures/britishpl-championships.html
 *   curl -sL -A "HelmFitnessApp/1.0 (events-collector)" \
 *     https://www.britishpowerlifting.org/upcoming-events-competitions/ \
 *     -o test-fixtures/britishpl-events.html
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseWithRegex, parseBritishDateRange } from '../src/fetchers/britishpl.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, '..', 'test-fixtures');

const championships = readFileSync(join(fixtures, 'britishpl-championships.html'), 'utf8');
const events = readFileSync(join(fixtures, 'britishpl-events.html'), 'utf8');

let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ok  ${msg}`);
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

console.log('== parseWithRegex(championships) ==');
const champCards = parseWithRegex(championships);
assert(champCards.length >= 5, `extracted ${champCards.length} cards (expect >= 5)`);
const cumbria = champCards.find((c) => /Cumbria Champs 2025/i.test(c.name));
assert(!!cumbria, 'found "Cumbria Champs 2025"');
if (cumbria) {
  assert(/championship\/cumbria-champs-2025/.test(cumbria.url), 'cumbria url contains slug');
  assert(/2 May, 2026/.test(cumbria.dateRaw.replace(/\s+/g, ' ')), 'cumbria dateRaw is "2 May, 2026"');
}

console.log('== parseWithRegex(events) ==');
const evtCards = parseWithRegex(events);
assert(evtCards.length >= 2, `extracted ${evtCards.length} cards (expect >= 2)`);
const subJrs = evtCards.find((c) => /Sub[- ]?Juniors? .* Juniors/i.test(c.name));
assert(!!subJrs, 'found "British Sub-Juniors & Juniors" card');
const sbdOpen = evtCards.find((c) => /SBD British Open Championships/i.test(c.name));
assert(!!sbdOpen, 'found "SBD British Open Championships" card');

console.log('== parseBritishDateRange ==');
const single = parseBritishDateRange('2 May, 2026');
assert(single.startDate === '2026-05-02' && single.endDate === '2026-05-02', `single "2 May, 2026" -> 2026-05-02`);

const sameMonth = parseBritishDateRange('14 May - 17 May, 2026');
assert(
  sameMonth.startDate === '2026-05-14' && sameMonth.endDate === '2026-05-17',
  `same-month "14 May - 17 May, 2026" -> 2026-05-14..2026-05-17`
);

const crossMonth = parseBritishDateRange('30 Aug - 1 Sep, 2026');
assert(
  crossMonth.startDate === '2026-08-30' && crossMonth.endDate === '2026-09-01',
  `cross-month "30 Aug - 1 Sep, 2026" -> 2026-08-30..2026-09-01`
);

const enDash = parseBritishDateRange('14 May – 17 May, 2026');
assert(
  enDash.startDate === '2026-05-14' && enDash.endDate === '2026-05-17',
  `en-dash "14 May – 17 May, 2026" parses correctly`
);

console.log('');
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
} else {
  console.log('All assertions passed.');
}
