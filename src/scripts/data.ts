// Loads the generated data files (public/data/, built by scripts/data/build-data.mjs). Cached per page.
import { base } from './util';

export type Item = { id: string; k: 'l' | 'p' | 'pr'; n: number; r: number; ar: string; root?: string | null; pos: string; person?: string; gl?: { tr: string | null; en: string | null; pure: boolean }; senses?: { tr: [string, number][]; en: [string, number][] }; ex: string[] };
export type Surah = { n: number; ar: string; tname: string; en: string; tr: string; trMean: string | null; enMean: string | null; ayas: number; type: string; order: number; rukus: number; start: number };
/** A word in a verse: [item indexes, Turkish meaning here, English meaning here, root] */
export type Word = [number[], string | null, string | null, string | null];
/** b/bt: the verse opens the surah with the Basmala, bt is Tanzil's text of it (it differs in 95 and 97). */
export type Verse = { n: number; b: 0 | 1; bt?: string; t: string[]; w: Word[]; tr: string | null; en: string | null; ruku: 0 | 1 };
export type Root = { ar: string; n: number; items: number[]; akCount?: number; mean?: 1 };

const cache: Record<string, Promise<unknown>> = {};
const load = <T>(f: string): Promise<T> => (cache[f] ||= fetch(base() + 'data/' + f).then((r) => { if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); })) as Promise<T>;
export const items = () => load<Item[]>('items.json');
export const surahs = () => load<Surah[]>('surahs.json');
export const vreq = () => load<number[][][]>('vreq.json');
export const surah = (n: number) => load<Verse[]>(`s/${n}.json`);
export const roots = () => load<Record<string, Root>>('roots.json');
export const rootMeans = () => load<Record<string, { tr: string | null; en: string | null }>>('rootmeans.json');
export const translationsEn = (id: number) => (id === 32 ? null : load<Record<string, string>>(`en-${id}.json`));

let byId: Map<string, Item> | null = null;
export async function itemById() { if (!byId) byId = new Map((await items()).map((x) => [x.id, x])); return byId; }

/** Global verse index (0-based) from surah and verse, using Tanzil's surah start offsets. */
export async function vIndex(s: number, v: number) { return (await surahs())[s - 1].start + v - 1; }
export async function vKey(i: number) { const ss = await surahs(); let s = ss.length - 1; while (ss[s].start > i) s--; return { s: s + 1, v: i - ss[s].start + 1 }; }
