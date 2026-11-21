// Packs raw Açık Kuran API responses (RAW_DIR, not committed) into compact files in data/acikkuran/.
// Licence of the packed data: CC BY-NC-SA 4.0, source acikkuran.com. Nothing is reworded: texts are copied as given,
// only HTML tags in root meanings are turned into plain line breaks.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RAW = process.env.RAW_DIR || 'data-raw/acikkuran', OUT = 'data/acikkuran';
mkdirSync(OUT, { recursive: true });
const read = (f) => JSON.parse(readFileSync(join(RAW, f), 'utf8'));
const plain = (h) => (h == null ? null : String(h).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n').trim());

const surahs = read('surahs.json').data;
writeFileSync(join(OUT, 'surahs.json'), JSON.stringify(surahs.map(({ id, name, name_en, name_original, name_translation_tr, name_translation_en, verse_count, page_number }) => ({ id, name, name_en, name_original, name_translation_tr, name_translation_en, verse_count, page_number }))));

for (const a of [11, 32, 15, 27, 113]) {
  const dir = join(RAW, `translation-${a}`); if (!existsSync(dir)) continue;
  const out = {}; let author = null;
  for (const f of readdirSync(dir)) for (const v of read(join(`translation-${a}`, f)).data.verses) {
    out[`${v.surah_id}:${v.verse_number}`] = v.translation?.text ?? null; author ||= v.translation?.author;
    if (v.translation?.footnotes?.length) (out._notes ||= {})[`${v.surah_id}:${v.verse_number}`] = v.translation.footnotes.map((n) => n.text ?? n);
  }
  out._author = author;
  writeFileSync(join(OUT, `translation-${a}.json`), JSON.stringify(out));
  console.log('translation', a, Object.keys(out).length - 2);
}

const words = {}, roots = {};
const wdir = join(RAW, 'words');
let verses = 0;
for (const s of readdirSync(wdir)) for (const f of readdirSync(join(wdir, s))) {
  const v = f.replace('.json', ''); verses++;
  for (const w of read(join('words', s, f)).data) {
    words[`${s}:${v}:${w.sort_number}`] = { tr: w.translation_tr ?? null, en: w.translation_en ?? null, ar: w.arabic, rt: w.root?.arabic ?? null };
    const r = w.root;
    if (r && !roots[r.arabic]) roots[r.arabic] = { latin: r.latin, tr: plain(r.mean), en: plain(r.mean_en), count: r.count };
  }
}
writeFileSync(join(OUT, 'words.json'), JSON.stringify(words));
writeFileSync(join(OUT, 'roots.json'), JSON.stringify(roots));
writeFileSync(join(OUT, 'LICENSE.md'), `Data in this folder comes from Açık Kuran (https://acikkuran.com, API https://api.acikkuran.com),\nan open-source, non-profit project, and is shared under CC BY-NC-SA 4.0\n(https://creativecommons.org/licenses/by-nc-sa/4.0/). Texts are unchanged; HTML tags in root meanings were turned into line breaks.\nPacked by scripts/data/pack-acikkuran.mjs.\n`);
console.log(`verses ${verses}, words ${Object.keys(words).length}, roots ${Object.keys(roots).length}`);
