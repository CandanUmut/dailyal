// What the learner can follow: per verse, per surah, overall. Counted on whole words:
// a word counts only when every item in it (prefix, dictionary form, pronoun) is known.
import { state, isKnown, MY_DEFAULT } from './store';
import { items, vreq, surahs, type Item } from './data';
import { dayNum } from './util';

export async function knownIdx() { const all = await items(); const k = new Uint8Array(all.length); all.forEach((x, i) => { if (isKnown(x.id)) k[i] = 1; }); return k; }
export const wordKnown = (w: number[], k: Uint8Array) => w.length > 0 && w.every((i) => k[i] === 1);
export const verseShare = (v: number[][], k: Uint8Array) => { const ws = v.filter((w) => w.length); return ws.length ? ws.filter((w) => wordKnown(w, k)).length / ws.length : 0; };

export async function overview() {
  const [vr, ss, k] = await Promise.all([vreq(), surahs(), knownIdx()]);
  let words = 0, kw = 0, full = 0;
  const per = ss.map(() => ({ w: 0, k: 0 }));
  ss.forEach((s, si) => { for (let i = s.start; i < s.start + s.ayas; i++) { const v = vr[i]; let vk = 0, vw = 0; for (const w of v) { if (!w.length) continue; vw++; if (wordKnown(w, k)) vk++; } words += vw; kw += vk; per[si].w += vw; per[si].k += vk; if (vw && vk === vw) full++; } });
  return { share: words ? kw / words : 0, full, total: vr.length, perSurah: per.map((p) => (p.w ? p.k / p.w : 0)) };
}

/** Items in My surahs, used to lift their words in the new-word order. */
export async function mySurahItems() {
  const [vr, ss, all] = await Promise.all([vreq(), surahs(), items()]);
  const set = new Set<string>();
  for (const n of state.my.length ? state.my : MY_DEFAULT) { const s = ss[n - 1]; for (let i = s.start; i < s.start + s.ayas; i++) for (const w of vr[i]) for (const x of w) set.add(all[x].id); }
  return set;
}

/**
 * The verse to listen to now. Rules (docs/PLAN.md): due re-listens first (narrow listening: 1, 3, 7 days);
 * then a verse from My surahs or anywhere that you can follow (>= 90% known words), shorter first;
 * a beginner with no such verse gets the best-known verse from My surahs.
 */
export async function pickVerse(exclude = new Set<string>()) {
  const [vr, ss, k] = await Promise.all([vreq(), surahs(), knownIdx()]);
  const t = dayNum(), my = new Set(state.my.length ? state.my : MY_DEFAULT);
  const due = Object.entries(state.heard).filter(([key, h]) => h.due <= t && h.last < t && !exclude.has(key)).sort((a, b) => a[1].due - b[1].due);
  if (due.length) { const [s, v] = due[0][0].split(':').map(Number); return { s, v, why: 'again' as const }; }
  let best: { s: number; v: number; score: number; share: number } | null = null;
  ss.forEach((s, si) => {
    for (let i = s.start; i < s.start + s.ayas; i++) {
      const key = `${si + 1}:${i - s.start + 1}`;
      if (state.heard[key] || exclude.has(key)) continue;
      const share = verseShare(vr[i], k), len = vr[i].length;
      if (len < 3) continue;
      const score = (share >= 0.9 ? 2 : 0) + share + (my.has(si + 1) ? 0.6 : 0) - len / 60;
      if (!best || score > best.score) best = { s: si + 1, v: i - s.start + 1, score, share };
    }
  });
  const b = best as { s: number; v: number; score: number; share: number } | null;
  return b ? { s: b.s, v: b.v, why: b.share >= 0.9 ? ('follow' as const) : ('stretch' as const) } : { s: 1, v: 1, why: 'stretch' as const };
}

export function strip(per: number[]) {
  const w = 358 / per.length;
  return `<svg class="strip" viewBox="0 0 358 64" preserveAspectRatio="none" role="img" aria-hidden="true"><line x1="0" y1="63.5" x2="358" y2="63.5" stroke="var(--rule-strong)"/>${per.map((p, i) => `<rect x="${(i * w + 0.4).toFixed(2)}" y="${(63 - p * 56).toFixed(1)}" width="${(w - 0.8).toFixed(2)}" height="${(p * 56).toFixed(1)}" fill="var(--ink)"/>`).join('')}</svg>`;
}
export const itemLabel = (x: Item) => x.ar;
