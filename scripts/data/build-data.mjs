// Builds the app's data files in public/data/ from the sources in data/sources/ (all used unchanged):
//  - Tanzil Quran text (CC BY 3.0) and metadata
//  - Quranic Arabic Corpus morphology v0.4 (GNU GPL)
//  - Açık Kuran word-by-word meanings, roots and translations (CC BY-NC-SA 4.0), read from data/acikkuran/ (see pack-acikkuran.mjs)
// Prints an alignment report and fails if the Tanzil text and the corpus do not line up word for word.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { readCorpus, PREFIX_FORM, PRONOUN_FORM } from './morph.mjs';

const SRC = 'data/sources', AK = 'data/acikkuran', OUT = 'public/data';
const BASMALA_WORDS = 4;
const JOINED = [['بَعْدَ', 'مَا'], ['إِلْ', 'يَاسِينَ']];

// ---------- Tanzil ----------
const text = new Map();
for (const line of readFileSync(`${SRC}/tanzil-quran-uthmani.txt`, 'utf8').split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const [s, v, t] = line.split('|'); text.set(`${s}:${v}`, t);
}
const meta = readFileSync(`${SRC}/tanzil-quran-data.js`, 'utf8');
const suraRows = [...meta.slice(meta.indexOf('QuranData.Sura'), meta.indexOf('];', meta.indexOf('QuranData.Sura'))).matchAll(/\[(\d+), (\d+), (\d+), (\d+), '([^']+)', "([^"]+)", '([^']+)', '(\w+)'\]/g)]
  .map((m) => ({ start: +m[1], ayas: +m[2], order: +m[3], rukus: +m[4], ar: m[5], tname: m[6], en: m[7], type: m[8] }));
if (suraRows.length !== 114) throw new Error('Tanzil metadata: expected 114 surahs, got ' + suraRows.length);
const rukuStarts = [...meta.slice(meta.indexOf('QuranData.Ruku'), meta.indexOf('];', meta.indexOf('QuranData.Ruku'))).matchAll(/\[(\d+), (\d+)\]/g)].map((m) => `${m[1]}:${m[2]}`);

// ---------- Corpus ----------
const { words, lemmaForm, lemmaRoot, lemmaPos } = readCorpus(`${SRC}/quranic-corpus-morphology-0.4.txt`);
const tags = JSON.parse(readFileSync(`${SRC}/qac-tagset.json`, 'utf8')).tags;

// ---------- Açık Kuran (optional while downloading) ----------
const akWords = existsSync(`${AK}/words.json`) ? JSON.parse(readFileSync(`${AK}/words.json`, 'utf8')) : {};
const akRoots = existsSync(`${AK}/roots.json`) ? JSON.parse(readFileSync(`${AK}/roots.json`, 'utf8')) : {};
const akTr = (a) => (existsSync(`${AK}/translation-${a}.json`) ? JSON.parse(readFileSync(`${AK}/translation-${a}.json`, 'utf8')) : {});
const trTR = akTr(11), trEN = akTr(32);
const akSurahs = existsSync(`${AK}/surahs.json`) ? JSON.parse(readFileSync(`${AK}/surahs.json`, 'utf8')) : [];

// ---------- Verses and alignment ----------
const verses = []; // global order
const problems = [];
for (let s = 1; s <= 114; s++) for (let v = 1; v <= suraRows[s - 1].ayas; v++) {
  const key = `${s}:${v}`, t = text.get(key).split(' ');
  const corpusWords = []; for (let w = 1; words.has(`${key}:${w}`); w++) corpusWords.push(words.get(`${key}:${w}`));
  let basmala = null, tw = t;
  if (v === 1 && s !== 1 && s !== 9 && t.length === corpusWords.length + BASMALA_WORDS) { basmala = t.slice(0, BASMALA_WORDS).join(' '); tw = t.slice(BASMALA_WORDS); }
  // The corpus counts بَعْدَ مَا (2:181, 8:6, 13:37) and إِلْ يَاسِينَ (37:130) as one word; Tanzil writes two.
  // Join the two tokens for display (the text itself is unchanged, the space is kept).
  if (tw.length === corpusWords.length + 1) for (const [a, b] of JOINED) { const i = tw.findIndex((x, k) => x === a && tw[k + 1] === b); if (i >= 0) { tw = [...tw.slice(0, i), a + ' ' + b, ...tw.slice(i + 2)]; break; } }
  if (tw.length !== corpusWords.length) problems.push(`${key}: Tanzil ${tw.length} words, corpus ${corpusWords.length}`);
  verses.push({ s, v, key, t: tw, basmala, cw: corpusWords });
}
const verseMap = new Map(verses.map((V) => [V.key, V]));
// Açık Kuran must have the same number of words as the corpus in every verse it covers.
const akCount = new Map(); for (const k of Object.keys(akWords)) { const vk = k.slice(0, k.lastIndexOf(':')); akCount.set(vk, (akCount.get(vk) || 0) + 1); }
for (const [vk, n] of akCount) if (n !== verseMap.get(vk).cw.length) problems.push(`${vk}: Açık Kuran ${n} words, corpus ${verseMap.get(vk).cw.length}`);
console.log(`verses ${verses.length}; alignment problems ${problems.length}`); if (problems.length) { console.log(problems.slice(0, 20).join('\n')); }

// ---------- Items (what a learner must know), ranked by frequency ----------
const count = new Map(), occ = new Map();
for (const V of verses) for (const W of V.cw) for (const i of W.items) { count.set(i, (count.get(i) || 0) + 1); (occ.get(i) || occ.set(i, []).get(i)).push(W); }
const ranked = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : 1));
const idx = new Map(ranked.map((id, i) => [id, i]));

const gloss = (W) => akWords[`${W.s}:${W.v}:${W.w}`];
const mostCommon = (arr) => { const m = new Map(); for (const x of arr) if (x) m.set(x, (m.get(x) || 0) + 1); let best = null, n = 0; for (const [k, c] of m) if (c > n) { best = k; n = c; } return best ? { text: best, n, of: arr.filter(Boolean).length } : null; };
const verseLen = new Map(verses.map((V) => [V.key, V.cw.length]));
const top500 = new Set(ranked.slice(0, 500));

const items = ranked.map((id, rank) => {
  const kind = id.slice(0, id.indexOf(':')), code = id.slice(id.indexOf(':') + 1), list = occ.get(id);
  const it = { id, k: kind, n: count.get(id), r: rank + 1 };
  if (kind === 'l') { it.ar = lemmaForm.get(id); it.root = lemmaRoot.get(id) || null; it.pos = lemmaPos.get(id); }
  else if (kind === 'p') { it.ar = PREFIX_FORM[code]; it.pos = 'PFX'; }
  else { it.ar = PRONOUN_FORM[code]; it.pos = 'PRON'; it.person = code; }
  // Meaning: the most common Açık Kuran gloss among words that are just this item (no prefix, no suffix).
  if (kind === 'l') {
    const pure = list.filter((W) => W.items.length === 1);
    const pool = pure.length >= 2 ? pure : list;
    const tr = mostCommon(pool.map((W) => gloss(W)?.tr)), en = mostCommon(pool.map((W) => gloss(W)?.en));
    if (tr || en) it.gl = { tr: tr?.text ?? null, en: en?.text ?? null, pure: pool === pure };
    // Top senses across all places, with counts (the review found one meaning per word misleading).
    const senses = (lang) => { const m = new Map(); for (const W of pure.length ? pure : list) { const g = gloss(W)?.[lang]; if (g) m.set(g, (m.get(g) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]).slice(0, 4); };
    const st = senses('tr'), se = senses('en'); if (st.length > 1 || se.length > 1) it.senses = { tr: st, en: se };
  }
  // Examples: up to 3 short verses, preferring ones made of common words.
  const seen = new Set(), ex = [];
  const cands = list.map((W) => ({ W, vk: `${W.s}:${W.v}`, score: 0 })).filter((c) => !seen.has(c.vk) && seen.add(c.vk));
  for (const c of cands) { const V = verseMap.get(c.vk); c.score = V.cw.filter((W) => W.items.every((i) => top500.has(i))).length / V.cw.length - verseLen.get(c.vk) / 200; }
  cands.sort((a, b) => b.score - a.score);
  for (const c of cands.slice(0, 3)) ex.push(`${c.W.s}:${c.W.v}:${c.W.w}`);
  it.ex = ex;
  return it;
});

// ---------- Roots ----------
const roots = {}, rootMeans = {};
for (const it of items) if (it.root) {
  const R = roots[it.root] || (roots[it.root] = { ar: [...lemmaRootAr(it.root)].join(' '), n: 0, items: [] });
  R.n += it.n; R.items.push(it.r - 1);
  const a = akRoots[R.ar.replace(/ /g, '')] || akRoots[R.ar.replace(/ /g, '').replace(/ء/g, 'أ')]; if (a && R.akCount == null) { rootMeans[it.root] = { tr: a.tr, en: a.en }; R.akCount = a.count; R.mean = 1; }
}
function lemmaRootAr(bw) { return [...bw].map((c) => ({ "'": 'ء', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ', A: 'ا', b: 'ب', p: 'ة', t: 'ت', v: 'ث', j: 'ج', H: 'ح', x: 'خ', d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', $: 'ش', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ', E: 'ع', g: 'غ', f: 'ف', q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', Y: 'ى', y: 'ي' })[c] ?? c); }

// ---------- Write ----------
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(`${OUT}/s`, { recursive: true });
const j = (f, o) => writeFileSync(`${OUT}/${f}`, JSON.stringify(o));

j('items.json', items);
j('roots.json', roots);
j('rootmeans.json', rootMeans);
j('tags.json', tags);
const akByN = new Map(akSurahs.map((x) => [x.id, x]));
j('surahs.json', suraRows.map((r, i) => { const a = akByN.get(i + 1) || {}; return { n: i + 1, ar: r.ar, tname: r.tname, en: r.en, tr: a.name || r.tname, trMean: a.name_translation_tr || null, enMean: a.name_translation_en || r.en, ayas: r.ayas, type: r.type, order: r.order, rukus: r.rukus, start: r.start }; }));

// Per-verse requirements for Listen selection: item indexes per word (verses in global order, Tanzil "start" offsets).
j('vreq.json', verses.map((V) => V.cw.map((W) => W.items.map((i) => idx.get(i)))));

for (let s = 1; s <= 114; s++) {
  const vs = verses.filter((V) => V.s === s).map((V) => ({
    n: V.v,
    b: V.basmala ? 1 : 0,
    ...(V.basmala ? { bt: V.basmala } : {}),
    t: V.t,
    w: V.cw.map((W) => { const g = gloss(W); return [W.items.map((i) => idx.get(i)), g?.tr ?? null, g?.en ?? null, W.root ?? null]; }),
    tr: trTR[V.key] ?? null,
    en: trEN[V.key] ?? null,
    ruku: rukuStarts.includes(V.key) ? 1 : 0,
  }));
  j(`s/${s}.json`, vs);
}

const withGloss = items.filter((x) => x.gl).length, wordsWithAk = Object.keys(akWords).length;
console.log(`items ${items.length} (${withGloss} with a meaning); roots ${Object.keys(roots).length}; Açık Kuran words ${wordsWithAk}/77429; translations tr ${Object.keys(trTR).length}, en ${Object.keys(trEN).length}`);
writeFileSync('data/build-report.txt', `alignment problems: ${problems.length}\n${problems.join('\n')}\nitems ${items.length}, with meaning ${withGloss}\nAçık Kuran words ${wordsWithAk}/77429\n`);
if (problems.length) process.exitCode = 1;
