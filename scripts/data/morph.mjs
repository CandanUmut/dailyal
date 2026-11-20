// Reads the Quranic Arabic Corpus v0.4 file (unchanged, in data/sources/) and turns every word into
// the "items" a learner must know to understand it. See docs/research/frequency.md for the method.
import { readFileSync } from 'node:fs';

// Buckwalter as used by the corpus -> Arabic. Same table as the corpus documentation (mustafa0x/quran-morphology bw-to-ar.py).
const BW = { "'": 'ء', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ', A: 'ا', b: 'ب', p: 'ة', t: 'ت', v: 'ث', j: 'ج', H: 'ح', x: 'خ', d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', $: 'ش', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ', E: 'ع', g: 'غ', _: 'ـ', f: 'ف', q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', Y: 'ى', y: 'ي', F: 'ً', N: 'ٌ', K: 'ٍ', a: 'َ', u: 'ُ', i: 'ِ', '~': 'ّ', o: 'ْ', '^': 'ٓ', '#': 'ٔ', '`': 'ٰ', '{': 'ٱ', ':': 'ۜ', '@': '۟', '"': '۠', '[': 'ۢ', ';': 'ۣ', ',': 'ۥ', '.': 'ۦ', '!': 'ۨ', '-': '۪', '+': '۫', '%': '۬', ']': 'ۭ' };
export const ar = (s) => [...s].map((c) => BW[c] ?? c).join('');

// Prefixes are grouped by the letter you hear, not by grammatical function: that is what a listener must recognise.
const PREFIX = { 'Al+': 'al', 'bi+': 'bi', 'ka+': 'ka', 'ta+': 'ta', 'sa+': 'sa', 'ya+': 'ya', 'ha+': 'ha' };
const prefixId = (f) => { if (PREFIX[f]) return PREFIX[f]; const m = /^(w|f|l|A):/.exec(f); return m ? { w: 'wa', f: 'fa', l: 'la', A: 'a' }[m[1]] : null; };
export const PREFIX_FORM = { al: 'ٱل', wa: 'وَ', fa: 'فَ', bi: 'بِ', la: 'لِ / لَ', ka: 'كَ', a: 'أَ', sa: 'سَ', ya: 'يَا', ha: 'هَا', ta: 'تَ' };

// Pronoun suffixes on nouns and particles are possessive or object pronouns: always learned.
// On verbs, the first suffix is usually the subject ending (taught as conjugation, not vocabulary);
// suffixes that start with h or k, or niy, are object pronouns and are learned.
// One item per person: the separate pronoun (هُوَ) and the attached one (ـهُ) mean the same thing.
// Duals are not split by gender. Forms are the standard paradigm; still to be checked against a cited grammar (gap G8 in docs/CONTENT_GAPS.md).
const person = (p) => (p.endsWith('D') ? p[0] + 'D' : p);
export const PRONOUN_FORM = { '1S': 'أَنَا · ـِي، ـنِي', '1P': 'نَحْنُ · ـنَا', '2MS': 'أَنْتَ · ـكَ', '2FS': 'أَنْتِ · ـكِ', '2D': 'أَنْتُمَا · ـكُمَا', '2MP': 'أَنْتُمْ · ـكُمْ', '2FP': 'أَنْتُنَّ · ـكُنَّ', '3MS': 'هُوَ · ـهُ', '3FS': 'هِيَ · ـهَا', '3D': 'هُمَا · ـهُمَا', '3MP': 'هُمْ · ـهُمْ', '3FP': 'هُنَّ · ـهُنَّ' };
const isObjectOnVerb = (bw) => /^(h|k)/.test(bw) || /^niy/.test(bw);

/** @returns {{ words: Map<string, {s:number,v:number,w:number,items:string[],root:string|null,pos:string,parts:string[]}>, lemmaForm: Map<string,string>, lemmaRoot: Map<string,string|null>, lemmaPos: Map<string,string> }} */
export function readCorpus(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const words = new Map(), lemmaForm = new Map(), lemmaRoot = new Map(), lemmaPos = new Map();
  for (const line of lines) {
    if (!line.startsWith('(')) continue;
    const [loc, form, tag, feat] = line.split('\t');
    const [s, v, w] = loc.slice(1, -1).split(':').map(Number);
    const key = `${s}:${v}:${w}`;
    let W = words.get(key);
    if (!W) words.set(key, (W = { s, v, w, items: [], root: null, pos: '', parts: [], stemPos: '' }));
    W.parts.push(ar(form));
    const f = feat.split('|');
    if (f[0] === 'PREFIX') {
      const id = prefixId(f[1]);
      if (id) W.items.push('p:' + id);
    } else if (f[0] === 'SUFFIX') {
      const m = /^PRON:(\w+)/.exec(f[1]);
      if (m && (W.stemPos !== 'V' || isObjectOnVerb(form))) W.items.push('pr:' + person(m[1]));
    } else {
      const lem = f.find((x) => x.startsWith('LEM:'))?.slice(4);
      const root = f.find((x) => x.startsWith('ROOT:'))?.slice(5) ?? null;
      W.stemPos = tag; W.pos = tag;
      if (root) W.root = root;
      if (lem) {
        const id = 'l:' + lem;
        W.items.push(id);
        if (!lemmaForm.has(id)) { lemmaForm.set(id, ar(lem)); lemmaRoot.set(id, root); lemmaPos.set(id, tag); }
      } else if (tag === 'PRON') {
        const p = f.find((x) => /^[123][MF]?[SDP]$/.test(x));
        if (p) W.items.push('pr:' + person(p));
      } // INL (the opening letters such as الٓمٓ) carry no item: they are recited, not translated.
    }
  }
  for (const W of words.values()) W.items = [...new Set(W.items)];
  return { words, lemmaForm, lemmaRoot, lemmaPos };
}
