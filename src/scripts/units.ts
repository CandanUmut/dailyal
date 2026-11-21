// Surah units (round 2): the curriculum is the surahs you pray. Each unit has 5 steps and is done when you can
// follow the surah by ear (a whole-surah check without the text). Order: Al-Fatiha, then My surahs, then the rest of
// Juz 30, easiest first (the share of words you know, and shortness). See docs/design/DESIGN-v2.md §2.
import { state, MY_DEFAULT } from './store';
import { surahs, vreq, items } from './data';
import { knownIdx, verseShare } from './coverage';
import { t } from './i18n';
import { base, dayNum } from './util';

export type Step = 'meet' | 'words' | 'verses' | 'listen' | 'follow';
export const STEPS: Step[] = ['meet', 'words', 'verses', 'listen', 'follow'];
const SHORT = 8;

/** Passages of a surah for the ladder (2–3 verses, within sections) and, for short surahs, the whole surah. */
export async function passagesOf(n: number) {
  const { surah } = await import('./data');
  const [ss, vr, k, vs] = await Promise.all([surahs(), vreq(), knownIdx(), surah(n)]);
  const S = ss[n - 1], share = (a: number, b: number) => { let s = 0; for (let v = a; v <= b; v++) s += verseShare(vr[S.start + v - 1], k); return s / (b - a + 1); };
  const out: { s: number; a: number; b: number; share: number; whole: boolean }[] = [];
  const starts = vs.filter((v) => v.ruku).map((v) => v.n).concat(S.ayas + 1);
  for (let si = 0; si + 1 < starts.length; si++) {
    const A = starts[si], B = starts[si + 1] - 1, len = B - A + 1, parts = Math.max(1, Math.round(len / 3)), size = len / parts;
    for (let i = 0; i < parts; i++) { const a = A + Math.round(i * size), b = A + Math.round((i + 1) * size) - 1; if (b - a + 1 < S.ayas || S.ayas <= 3) out.push({ s: n, a, b, share: share(a, b), whole: false }); }
  }
  if (S.ayas <= SHORT && S.ayas > 3) out.push({ s: n, a: 1, b: S.ayas, share: share(1, S.ayas), whole: true });
  return out;
}

/** Items (dictionary forms, prefixes, pronouns) that occur in a surah, most frequent in the Quran first. */
export async function unitItems(n: number) {
  const [ss, vr, all] = await Promise.all([surahs(), vreq(), items()]), S = ss[n - 1], set = new Set<number>();
  for (let i = S.start; i < S.start + S.ayas; i++) for (const w of vr[i]) for (const x of w) set.add(x);
  return [...set].sort((a, b) => a - b).map((x) => all[x]);
}

export async function unitOrder() {
  const [ss, vr, k] = await Promise.all([surahs(), vreq(), knownIdx()]);
  const ease = (n: number) => { const S = ss[n - 1]; let s = 0; for (let i = S.start; i < S.start + S.ayas; i++) s += verseShare(vr[i], k); return s / S.ayas - S.ayas / 40; };
  const my = (state.my.length ? state.my : MY_DEFAULT).filter((n) => n !== 1).sort((a, b) => ease(b) - ease(a));
  const rest = Array.from({ length: 37 }, (_, i) => 78 + i).filter((n) => !my.includes(n)).sort((a, b) => ease(b) - ease(a));
  return [1, ...my, ...rest];
}

export async function unitStatus(n: number) {
  const ss = await surahs(), S = ss[n - 1], u = state.units[n] || {};
  const its = await unitItems(n), started = its.filter((x) => state.r[x.id]).length;
  let heardV = 0; for (let v = 1; v <= S.ayas; v++) if (state.heard[`${n}:${v}`]) heardV++;
  const ps = (await passagesOf(n)).filter((p) => !p.whole), heardP = ps.filter((p) => state.heard[`P${p.s}:${p.a}-${p.b}`]).length;
  const done: Record<Step, boolean> = { meet: !!u.meet, words: started === its.length, verses: heardV === S.ayas, listen: heardP === ps.length, follow: !!u.follow };
  const next = STEPS.find((s) => !done[s]) || null;
  return { n, S, done, next, counts: { words: [started, its.length], verses: [heardV, S.ayas], listen: [heardP, ps.length] } };
}

/** Where a step happens. */
export function stepUrl(n: number, step: Step, firstUnheardVerse = 1) {
  if (step === 'meet') return `${base()}unit/?s=${n}`;
  if (step === 'words') return `${base()}words/?unit=${n}`;
  if (step === 'verses') return `${base()}listen/?v=${n}:${firstUnheardVerse}&unit=1`;
  if (step === 'listen') return `${base()}listen/ladder/?unit=${n}`;
  return `${base()}unit/?s=${n}&follow=1`;
}
export const stepName = (s: Step) => t(('st_' + s) as 'st_meet');
export function markMeet(n: number) { (state.units[n] ||= {}).meet = dayNum(); }
export function markFollow(n: number) { (state.units[n] ||= {}).follow = dayNum(); }
