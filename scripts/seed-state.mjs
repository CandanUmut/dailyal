// Prints a saved-progress JSON for a simulated learner, to load into localStorage key "fahm-v1" in tests and critic reviews.
// Usage: node scripts/seed-state.mjs [known=300] [lang=tr]  (needs public/data/items.json from the data build)
import { readFileSync } from 'node:fs';
const known = +(process.argv[2] || 300), lang = process.argv[3] || 'tr';
const items = JSON.parse(readFileSync('public/data/items.json', 'utf8'));
const t = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const r = {};
items.slice(0, known).forEach((x, i) => { r[x.id] = { b: 1 + (i % 4), due: t + 1 + (i % 9) - (i % 7 === 0 ? 2 : 0), n: 3, m: i % 11 === 0 ? 1 : 0, f: t - 25, c: 1 }; });
const hist = {}; for (let d = t - 29; d < t; d++) if (d % 5) hist[d] = [12 + (d % 9), 1 + (d % 3), d % 2, 1, 2, 1];
const heard = { '1:2': { n: 3, last: t - 3, due: t + 4, ok: 3, tot: 3 }, '112:1': { n: 2, last: t - 2, due: t + 1, ok: 1, tot: 2 } };
console.log(JSON.stringify({ v: 1, r, heard, day: { d: t, nw: 0, done: 0, heard: 0 }, set: { newPerDay: 8, theme: 'auto', lang, reciter: 'Alafasy_128kbps', en: 32 }, my: [1, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114], units: { 1: { meet: t - 25, follow: t - 20 }, 112: { meet: t - 15, follow: t - 10 }, 108: { meet: t - 6 } }, placed: Date.now() - 29 * 864e5, hist, updated: Date.now() }));
