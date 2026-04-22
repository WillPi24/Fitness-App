import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const inputHtml = resolve('Helm - Privacy Policy.html');
const outputPdf = resolve('Helm - Privacy Policy.pdf');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(inputHtml).href, { waitUntil: 'networkidle0' });
await page.pdf({
  path: outputPdf,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
});
await browser.close();

console.log(`Generated: ${outputPdf}`);
