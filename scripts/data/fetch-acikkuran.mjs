// Downloads word-by-word data and two translations from the Açık Kuran API (CC BY-NC-SA 4.0, acikkuran.com).
// The API key is NOT in this file: send it as Authorization: Bearer <key> via ACIKKURAN_KEY,
// or run where a network proxy injects it. Raw responses go to RAW_DIR (not committed).
// Resumable: files that already exist are skipped. Respects the 60 requests/minute limit.
//
//   RAW_DIR=/path/to/raw node scripts/data/fetch-acikkuran.mjs
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const API = 'https://api.acikkuran.com/v1';
const RAW = process.env.RAW_DIR || 'data-raw/acikkuran';
const KEY = process.env.ACIKKURAN_KEY || 'proxy-injected';
const AUTHORS = (process.env.AUTHORS || '32,11').split(',').map(Number); // 32 Sahih International (en), 11 Diyanet İşleri (tr)
const GAP_MS = 1050;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => access(p).then(() => true, () => false);
let last = 0;

async function get(path) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const wait = last + GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    let res;
    try { res = await fetch(API + path, { headers: { Authorization: `Bearer ${KEY}` } }); }
    catch (e) { console.error('network', path, e.message); await sleep(5000 * attempt); continue; }
    if (res.status === 429) { const s = +(res.headers.get('retry-after') || 30); console.error('429, waiting', s); await sleep(s * 1000 + 500); continue; }
    if (res.status >= 500) { console.error(res.status, path); await sleep(5000 * attempt); continue; }
    const body = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${path} ${JSON.stringify(body)}`);
    return body;
  }
  throw new Error('gave up ' + path);
}

async function save(file, path) {
  if (await exists(file)) return false;
  const body = await get(path);
  await writeFile(file, JSON.stringify(body));
  return true;
}

const surahsFile = join(RAW, 'surahs.json');
await mkdir(RAW, { recursive: true });
await save(surahsFile, '/surahs');
await save(join(RAW, 'authors.json'), '/authors');
const surahs = JSON.parse(await readFile(surahsFile, 'utf8')).data;

for (const a of AUTHORS) {
  const dir = join(RAW, `translation-${a}`); await mkdir(dir, { recursive: true });
  for (const s of surahs) await save(join(dir, `${s.id}.json`), `/surahs/${s.id}?author=${a}`);
  console.log('translation done', a);
}

let n = 0;
for (const s of surahs) {
  const dir = join(RAW, 'words', String(s.id)); await mkdir(dir, { recursive: true });
  for (let v = 1; v <= s.verse_count; v++) if (await save(join(dir, `${v}.json`), `/surahs/${s.id}/verses/${v}/words`)) n++;
  console.log(`surah ${s.id} done (${n} fetched this run)`);
}
console.log('ALL DONE');
