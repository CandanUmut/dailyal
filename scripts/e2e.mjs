// End-to-end check on a phone-sized screen (390x844), light and dark, English and Turkish.
// Run `npm run build` first. Usage: node scripts/e2e.mjs [screenshot dir]
// Fails on any page error, console error, sideways overflow, or tap target under 48px; plays placement, Listen and Words by tapping.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = process.argv[2] || 'e2e-shots';
mkdirSync(OUT, { recursive: true });
const PORT = 4339, ROOT = `http://localhost:${PORT}/dailyal/`;
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(ROOT)).ok) break; } catch { /* not up yet */ } await wait(250); }

const errors = [];
const browser = await chromium.launch();
async function page(scheme, locale) {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: scheme, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale });
  p.on('pageerror', (e) => errors.push(`${scheme} ${p.url()}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/everyayah|Failed to load resource/.test(m.text())) errors.push(`${scheme} ${p.url()} console: ${m.text()}`); });
  await p.route('https://everyayah.com/**', (r) => r.abort()); // no audio in tests
  return p;
}
async function checkPage(p, scheme, name) {
  await p.waitForTimeout(600);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (over > 0) errors.push(`${scheme} ${name}: page scrolls sideways by ${over}px`);
  const small = await p.evaluate(() => [...document.querySelectorAll('main a, main button, nav a, main select, main label.btn')].filter((e) => { const b = e.getBoundingClientRect(); const st = getComputedStyle(e); return b.width && b.height && (b.height < 47.5 || b.width < 47.5) && st.display !== 'inline' && st.visibility !== 'hidden'; }).map((e) => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)));
  if (small.length) errors.push(`${scheme} ${name}: tap targets under 48px: ${small.slice(0, 5).join(' | ')}`);
}
const routes = ['', 'words/', 'words/?id=l%3Arab~', 'listen/?v=1:2', 'surahs/', 'surahs/read/?n=112', 'library/', 'library/roots/', 'library/roots/?r=rHm', 'library/pronouns/', 'library/how/', 'library/role/?r=NEG', 'library/role/?r=P', 'words/parts/', 'words/?deck=phrases', 'place/', 'settings/', 'about/'];
for (const [scheme, locale] of [['light', 'en-GB'], ['dark', 'tr-TR']]) {
  const p = await page(scheme, locale);
  for (const r of routes) {
    await p.goto(ROOT + r); await checkPage(p, scheme, r || 'today');
    await p.screenshot({ path: `${OUT}/${scheme}-${(r || 'today').replace(/[/?=%:~]+/g, '_').replace(/_$/, '')}.png`, fullPage: true });
  }
  await p.close();
}

/* Flows, a fresh learner on an English phone, by tapping. */
const p = await page('light', 'en-GB');
await p.goto(ROOT + 'place/'); await p.waitForTimeout(500);
for (let i = 0; i < 12; i++) { await p.tap('[data-a=show]'); if (i === 0) await p.screenshot({ path: `${OUT}/flow-place.png`, fullPage: true }); await p.tap(i % 3 ? '[data-a=yes]' : '[data-a=no]'); }
await p.tap('[data-a=stop]'); const placeText = await p.textContent('main');
await p.goto(ROOT + 'listen/?v=112:1'); await p.waitForTimeout(600);
await p.tap('.q .w >> nth=1'); await p.screenshot({ path: `${OUT}/flow-listen-1.png`, fullPage: true });
await p.tap('[data-a=next]');
for (let i = 0; i < 4 && (await p.$('[data-a=fill]')); i++) { await p.tap('[data-a=fill] >> nth=0'); if (i === 0) await p.screenshot({ path: `${OUT}/flow-listen-2.png`, fullPage: true }); await p.tap('[data-a=next]'); }
await p.tap('[data-a=play]'); await p.waitForSelector('[data-a=check]'); await p.tap('[data-a=check] >> nth=0'); await p.tap('[data-a=self][data-v="2"]'); await p.tap('[data-a=self][data-v="3"]'); await p.screenshot({ path: `${OUT}/flow-listen-3.png`, fullPage: true });
await p.goto(ROOT + 'words/'); await p.waitForTimeout(600);
await p.tap('[data-a=start]'); await p.tap('[data-a=show]'); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/flow-words.png`, fullPage: true });
for (let i = 0; i < 10; i++) { await p.tap(`[data-a=grade][data-v="${i % 3}"]`); if (await p.$('[data-a=show]')) await p.tap('[data-a=show]'); else break; }
await p.goto(ROOT + 'words/?deck=phrases'); await p.waitForTimeout(600); await p.tap('[data-a=start]'); await p.tap('[data-a=show]'); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/flow-phrase.png`, fullPage: true }); await p.tap('[data-a=grade][data-v="2"]');
await p.goto(ROOT + 'words/parts/'); await p.waitForTimeout(800); await p.tap('[data-a=pick] >> nth=0'); await p.screenshot({ path: `${OUT}/flow-parts.png`, fullPage: true });
await p.goto(ROOT + 'surahs/read/?n=112'); await p.waitForTimeout(600); await p.tap('[data-a=hide]'); await p.tap('[data-a=all]'); await p.waitForSelector('[data-a=gist]'); await p.tap('[data-a=gist] >> nth=0'); await p.screenshot({ path: `${OUT}/flow-whole.png`, fullPage: true });
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('fahm-v1')));
await p.goto(ROOT); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/flow-today-after.png`, fullPage: true });
console.log(`placement: "${placeText.replace(/\s+/g, ' ').slice(0, 80)}"; items started ${Object.keys(st.r).length}; heard ${JSON.stringify(st.heard)}; answered today ${st.day.done}`);
await browser.close(); server.kill();
console.log(errors.length ? `\n${errors.length} problem(s):\n` + errors.join('\n') : '\nNo errors, no sideways scrolling, all tap targets >= 48px.');
process.exit(errors.length ? 1 : 0);
