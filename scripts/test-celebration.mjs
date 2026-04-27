#!/usr/bin/env node
// Headless browser test for the Full Sail celebration animation preview.
// Verifies structure + animation behaviour and captures screenshots.
//
// Usage:  node scripts/test-celebration.mjs
// Output: ./test-output/celebration/*.png + console PASS/FAIL report

import puppeteer from 'puppeteer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PREVIEW = path.join(ROOT, 'preview-celebration.html');
const OUT_DIR = path.join(ROOT, 'test-output', 'celebration');

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 880, deviceScaleFactor: 2 });

  const url = pathToFileURL(PREVIEW).href;
  await page.goto(url, { waitUntil: 'networkidle0' });

  // ---------- Structure ----------
  const structure = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    return {
      hasScrim:     !!q('.scrim'),
      hasStage:     !!q('.stage'),
      hasLogoWrap:  !!q('.logo-wrap'),
      hasLogoSvg:   !!q('.logo-svg'),
      hasWheel:     !!q('.wheel'),
      hasHeadline:  !!q('.headline'),
      hasSubhead:   !!q('.subhead'),
      hasCta:       !!q('.cta'),
      headlineText: q('.headline')?.textContent?.trim(),
      subheadText:  q('.subhead')?.textContent?.trim(),
      ctaText:      q('.cta')?.textContent?.trim(),
      wheelSpokes:  document.querySelectorAll('.wheel line').length,
      hubCircles:   document.querySelectorAll('.wheel circle').length,
    };
  });

  record('Scrim element exists',           structure.hasScrim);
  record('Stage element exists',           structure.hasStage);
  record('Logo wrapper exists',            structure.hasLogoWrap);
  record('Logo SVG exists',                structure.hasLogoSvg);
  record('Wheel group exists',             structure.hasWheel);
  record('Headline says "Welcome aboard"', structure.headlineText === 'Welcome aboard', `got "${structure.headlineText}"`);
  record('Subhead says "Full Sail unlocked"', structure.subheadText === 'Full Sail unlocked');
  record('CTA says "Get started"',         structure.ctaText === 'Get started');
  record('Wheel has 8 spokes',             structure.wheelSpokes === 8, `found ${structure.wheelSpokes}`);
  record('Wheel hub has solid + hollow circles', structure.hubCircles === 2, `found ${structure.hubCircles}`);

  // ---------- Geometry: logo centred and full-size after entrance ----------
  // Wait for entrance: 200ms delay + 700ms duration = 900ms total
  await new Promise((r) => setTimeout(r, 1300));

  const geometry = await page.evaluate(() => {
    const rectOf = (sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return {
      stage: rectOf('.stage'),
      logo: rectOf('.logo-wrap'),
      logoOpacity: parseFloat(window.getComputedStyle(document.querySelector('.logo-wrap')).opacity),
      headlineOpacity: parseFloat(window.getComputedStyle(document.querySelector('.headline')).opacity),
    };
  });

  const stageCx = (geometry.stage.left + geometry.stage.right) / 2;
  const stageCy = (geometry.stage.top + geometry.stage.bottom) / 2;
  const logoCx = (geometry.logo.left + geometry.logo.right) / 2;
  const logoCy = (geometry.logo.top + geometry.logo.bottom) / 2;
  record('Logo horizontally centred in stage', Math.abs(logoCx - stageCx) < 5, `logo-cx=${logoCx.toFixed(0)} stage-cx=${stageCx.toFixed(0)}`);
  record('Logo vertically centred in stage', Math.abs(logoCy - stageCy) < 5, `logo-cy=${logoCy.toFixed(0)} stage-cy=${stageCy.toFixed(0)}`);
  record('Logo is fully visible after entrance', geometry.logoOpacity > 0.95, `opacity=${geometry.logoOpacity.toFixed(2)}`);
  record('Logo is hero-sized (>= 180px wide)', geometry.logo.width >= 180, `logo width=${geometry.logo.width.toFixed(0)}px`);
  record('Headline visible after entrance', geometry.headlineOpacity > 0.95, `opacity=${geometry.headlineOpacity.toFixed(2)}`);

  // ---------- Animation liveness ----------
  await new Promise((r) => setTimeout(r, 400));
  const ctaOpacity = await page.evaluate(() => parseFloat(window.getComputedStyle(document.querySelector('.cta')).opacity));
  record('CTA visible by 1.7s', ctaOpacity > 0.9, `opacity=${ctaOpacity.toFixed(2)}`);

  // Wheel transform changes over time
  const wheelSpinning = await page.evaluate(async () => {
    const el = document.querySelector('.wheel');
    const t1 = window.getComputedStyle(el).transform;
    await new Promise((r) => setTimeout(r, 800));
    const t2 = window.getComputedStyle(el).transform;
    return { changed: t1 !== t2, t1, t2 };
  });
  record('Wheel actively spinning', wheelSpinning.changed, wheelSpinning.changed ? 'transform updated' : 'no change');

  // ---------- Screenshots ----------
  console.log('\nCapturing screenshots…');

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 't0-start.png') });

  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, 't1-logo-entering.png') });

  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUT_DIR, 't2-text-visible.png') });

  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, 't3-fully-settled.png') });

  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(OUT_DIR, 't4-mid-loop.png') });

  // Reduce-motion variant
  await page.click('#reduceMotion');
  await page.click('#play');
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, 't5-reduce-motion.png') });

  // Dark mode variant
  await page.click('#reduceMotion');
  await page.click('#darkToggle');
  await page.click('#play');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 't6-dark-mode.png') });

  await browser.close();

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  console.log(`Screenshots: ${OUT_DIR}`);
  if (failed > 0) {
    console.log('\nFAILURES:');
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  - ${r.name}${r.detail ? ': ' + r.detail : ''}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
