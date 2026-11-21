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
const trTR = akTr(11), trEN = akTr(32), trElm = akTr(15), trAtes = akTr(27), trHaleem = akTr(113);
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
const NEG_EN = /\b(not|n't|never|nor|no)\b/i, NEG_TR = /(değil|\b\w+(m[ae]z|m[ae]d[ıi]|m[ae]y[ıi]n|m[ae]s[ıi]n|m[ae]m[ıi]ş)\b)/i;
const PAST_TR = /(d|t)[ıiuü](lar|ler)?$/i;
const prevWord = (W) => words.get(`${W.s}:${W.v}:${W.w - 1}`);
/** The gloss carries a negation from the context (a preceding negative particle, or 'not' in the English gloss). */
const negated = (W, g) => prevWord(W)?.pos === 'NEG' || NEG_EN.test(g.en || '');
function baseScore(W, lem) {
  let s = W.items.length === 1 ? 1 : 0;
  if (W.pos === 'V') { s += W.f.asp === 'PERF' ? 3 : W.f.asp === 'IMPF' ? 1 : -2; if (W.f.per === '3MS') s += 2; if (W.f.pass) s -= 2; if (W.f.pfx) s -= 1; if (W.f.asp === 'PERF' && W.f.per === '3MS' && W.f.sfx) s -= 1; }
  else { if (!W.f.pfx) s += 1; if (!W.f.sfx) s += 1; if (W.f.kase === 'NOM') s += 1; }
  return s;
}
const mostCommon = (arr) => { const m = new Map(); for (const x of arr) if (x) m.set(x, (m.get(x) || 0) + 1); let best = null, n = 0; for (const [k, c] of m) if (c > n) { best = k; n = c; } return best ? { text: best, n, of: arr.filter(Boolean).length } : null; };
const verseLen = new Map(verses.map((V) => [V.key, V.cw.length]));
const top500 = new Set(ranked.slice(0, 500));

const items = ranked.map((id, rank) => {
  const kind = id.slice(0, id.indexOf(':')), code = id.slice(id.indexOf(':') + 1), list = occ.get(id);
  const it = { id, k: kind, n: count.get(id), r: rank + 1 };
  if (kind === 'l') { it.ar = lemmaForm.get(id); it.root = lemmaRoot.get(id) || null; it.pos = lemmaPos.get(id); }
  else if (kind === 'p') { it.ar = PREFIX_FORM[code]; it.pos = 'PFX'; }
  else { it.ar = PRONOUN_FORM[code]; it.pos = 'PRON'; it.person = code; }
  // Meaning (fixed after the Phase 1 review): Açık Kuran glosses a word in its context, so the same dictionary form
  // appears as "does not guide", "We sent", "do not kill". We pick the gloss from places where the word is in its
  // base form: verbs in the past tense, 3rd person masculine singular ("he did"), active, not after a negation;
  // nouns without prefixes or endings. Then the most common gloss in that pool.
  if (kind === 'l') {
    const scored = list.map((W) => ({ W, g: gloss(W), sc: baseScore(W, code) })).filter((x) => x.g && !negated(x.W, x.g));
    const best = Math.max(-9, ...scored.map((x) => x.sc));
    const pool = scored.filter((x) => x.sc === best);
    // For past-tense verbs, prefer a Turkish gloss that is itself a plain past form (…dı/di/du/dü/tı/ti…), not a relative clause.
    const isPastVerb = pool.length && pool[0].W.pos === 'V' && pool[0].W.f.asp === 'PERF';
    const trPool = isPastVerb && pool.some((x) => PAST_TR.test(x.g.tr || '')) ? pool.filter((x) => PAST_TR.test(x.g.tr || '')) : pool;
    const tr = mostCommon(trPool.map((x) => x.g.tr)), en = mostCommon(pool.map((x) => x.g.en));
    if (tr || en) it.gl = { tr: tr?.text ?? null, en: en?.text ?? null, base: best };
    // Other meanings: from near-base places only, counted.
    // Function words (split by role) have no base form: count their meanings across all places.
    const near = code.includes('#') ? scored : scored.filter((x) => x.sc >= best - 1);
    const senses = (lang) => { const m = new Map(); for (const x of near) { const g = x.g[lang]; if (g) m.set(g, (m.get(g) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]).slice(0, 4); };
    const st = senses('tr'), se = senses('en'); if (st.length > 1 || se.length > 1) it.senses = { tr: st, en: se };
  }
  // Examples: up to 3 short verses, preferring ones made of common words.
  const seen = new Set(), ex = [];
  const cands = list.map((W) => ({ W, vk: `${W.s}:${W.v}`, score: 0 })).filter((c) => !seen.has(c.vk) && seen.add(c.vk));
  for (const c of cands) { const V = verseMap.get(c.vk); c.score = V.cw.filter((W) => W.items.every((i) => top500.has(i))).length / V.cw.length - verseLen.get(c.vk) / 200; }
  cands.sort((a, b) => b.score - a.score);
  for (const c of cands.slice(0, 3)) ex.push(`${c.W.s}:${c.W.v}:${c.W.w}`);
  it.ex = ex;
  const heard = list.filter((W) => W.s === 1 || W.s >= 78).slice(0, 2).map((W) => `${W.s}:${W.v}:${W.w}`);
  if (heard.length) it.ex30 = heard;
  return it;
});

// ---------- Roots ----------
const roots = {}, rootMeans = {};
for (const it of items) if (it.root) {
  const R = roots[it.root] || (roots[it.root] = { ar: [...lemmaRootAr(it.root)].join(' '), n: 0, items: [] });
  R.n += it.n; R.items.push(it.r - 1);
  const a = akRoots[R.ar.replace(/ /g, '')] || akRoots[R.ar.replace(/ /g, '').replace(/ء/g, 'أ')]; if (a && R.akCount == null) { rootMeans[it.root] = { tr: a.tr, en: a.en }; R.akCount = a.count; R.mean = 1; const tw = /Türkçe['’]ye girmiş türevler\s*:\s*([^\n]+)/i.exec(a.tr || ''); if (tw) R.tw = tw[1].trim().replace(/[,\s]+$/, ''); }
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
    w: V.cw.map((W) => { const g = gloss(W); return [W.items.map((i) => idx.get(i)), g?.tr ?? null, g?.en ?? null, W.root ?? null, W.pos === 'V' ? [W.f.asp, W.f.per, W.f.pass].join('|') : W.pos]; }),
    tr: trTR[V.key] ?? null,
    en: trEN[V.key] ?? null,
    // Per-verse alternatives (Diyanet joins some verses into one text): Elmalılı (sadeleştirilmiş), Süleyman Ateş, Abdel Haleem.
    t15: trElm[V.key] ?? null,
    t27: trAtes[V.key] ?? null,
    e113: trHaleem[V.key] ?? null,
    ruku: rukuStarts.includes(V.key) ? 1 : 0,
  }));
  j(`s/${s}.json`, vs);
}

const flagged = items.slice(0, 1000).filter((x) => x.gl && (NEG_TR.test(x.gl.tr || '') || NEG_EN.test(x.gl.en || ''))).map((x) => `${x.r} ${x.ar} | ${x.gl.tr} | ${x.gl.en}`);
console.log(`meaning check: ${flagged.length} of the top 1000 still look negated`);
// ---------- Phrases (Phase 2): the most repeated runs of 3–7 words, from the Tanzil text as aligned above ----------
// Spelling variants (e.g. ءَامَنُوا۟ / ءَامَنُوٓا۟) are merged by a key without marks; the most common written form is shown.
const bare = (w) => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');
const grams = new Map();
for (const V of verses) for (let n = 3; n <= 7; n++) for (let i = 0; i + n <= V.t.length; i++) {
  const key = V.t.slice(i, i + n).map(bare).join(' '), e = grams.get(key) || { n: 0, len: n, forms: new Map(), at: [] };
  e.n++; const f = V.t.slice(i, i + n).join(' '); e.forms.set(f, (e.forms.get(f) || 0) + 1); if (e.at.length < 3) e.at.push(`${V.s}:${V.v}:${i + 1}`); grams.set(key, e);
}
let phr = [...grams].filter(([, e]) => e.n >= 5);
phr = phr.filter(([k, e]) => !phr.some(([k2, e2]) => e2.len > e.len && k2.includes(k) && e2.n >= e.n * 0.8));
phr.sort((a, b) => b[1].n * b[1].len - a[1].n * a[1].len);
const phrases = phr.slice(0, 300).map(([, e], i) => {
  const ar = [...e.forms].sort((a, b) => b[1] - a[1])[0][0], [s, v, w] = e.at[0].split(':').map(Number);
  const ws = verseMap.get(`${s}:${v}`).cw.slice(w - 1, w - 1 + e.len), g = ws.map((W) => gloss(W));
  return { id: `ph:${i + 1}`, ar, n: e.n, len: e.len, at: e.at, gl: g.every(Boolean) ? { tr: g.map((x) => x.tr).filter(Boolean).join(' · '), en: g.map((x) => x.en).filter(Boolean).join(' · ') } : null };
});
j('phrases.json', phrases);
console.log(`phrases ${phrases.length} (repeated 5+ times; ${phrases.filter((p) => p.gl).length} with word meanings)`);
const withGloss = items.filter((x) => x.gl).length, wordsWithAk = Object.keys(akWords).length;
console.log(`items ${items.length} (${withGloss} with a meaning); roots ${Object.keys(roots).length}; Açık Kuran words ${wordsWithAk}/77429; translations tr ${Object.keys(trTR).length}, en ${Object.keys(trEN).length}`);
writeFileSync('data/build-report.txt', `alignment problems: ${problems.length}\n${problems.join('\n')}\nmeanings that still look negated (top 1000): ${flagged.length}\n${flagged.join('\n')}\nitems ${items.length}, with meaning ${withGloss}\nAçık Kuran words ${wordsWithAk}/77429\n`);
if (problems.length) process.exitCode = 1;
