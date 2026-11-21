// Which translation to show, and which to use for the listening check.
import { state } from './store';
import { lang } from './i18n';
import { TRANSLATORS, isRange, type Verse } from './data';

export const trId = () => String(lang() === 'tr' ? state.set.tr || 15 : state.set.en || 32);
export const trName = (id = trId()) => TRANSLATORS[id]?.name || '';
const textOf = (v: Verse, id: string) => (v[TRANSLATORS[id].field] as string | null | undefined) || null;
/** The reader's chosen translation of this verse (falls back to the other language if missing). */
export const trText = (v: Verse) => textOf(v, trId()) || v.en || v.tr || '';
/**
 * For the listening check every verse needs its own text. If the chosen translation joins verses ("(2-4) …"),
 * use a per-verse translation in the same language instead, and say which one.
 */
export function checkTr(v: Verse): { id: string; text: string } {
  const id = trId(), own = textOf(v, id);
  if (own && !isRange(own)) return { id, text: own };
  for (const alt of lang() === 'tr' ? ['15', '27'] : ['32', '113']) { const x = textOf(v, alt); if (x && !isRange(x)) return { id: alt, text: x }; }
  return { id, text: (own || '').replace(/^\(\d+\s*-\s*\d+\)\s*/, '') };
}
const norm = (s: string) => s.toLocaleLowerCase().replace(/^\(\d+\s*-\s*\d+\)\s*/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2);
/** Word-overlap similarity (Jaccard) between two translations: near-twins (like 109:2 and 109:4) are not fair options. */
export function similar(a: string, b: string) { const A = new Set(norm(a)), B = new Set(norm(b)); let i = 0; for (const x of A) if (B.has(x)) i++; return A.size + B.size - i ? i / (A.size + B.size - i) : 1; }

/** One translator for a whole question (Phase 3 review: options mixed Elmalılı and Diyanet under one label).
 *  Uses the reader's translation if none of these verses is a joined range in it, else a per-verse one for all. */
export function checkSet(vs: Verse[]): { id: string; texts: string[] } {
  const id = trId();
  if (vs.every((v) => { const x = textOf(v, id); return x && !isRange(x); })) return { id, texts: vs.map((v) => textOf(v, id)!) };
  for (const alt of lang() === 'tr' ? ['15', '27'] : ['32', '113']) if (vs.every((v) => { const x = textOf(v, alt); return x && !isRange(x); })) return { id: alt, texts: vs.map((v) => textOf(v, alt)!) };
  return { id, texts: vs.map((v) => (textOf(v, id) || '').replace(/^\(\d+\s*-\s*\d+\)\s*/, '')) };
}
/** For showing translations under each verse: a joined range ("(1-5) …") is shown once, under the last verse it covers. */
export function rangeOnce(vs: Verse[]): Map<number, string> {
  const out = new Map<number, string>();
  vs.forEach((v, i) => { const x = trText(v), next = vs[i + 1]; if (isRange(x) && next && trText(next) === x) return; out.set(v.n, x); });
  return out;
}
