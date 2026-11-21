// Progress, kept in this browser only. Export/import in Settings.
import { dayNum, toast } from './util';
export const KEY = 'fahm-v1';
/** A review record: box b (0 = learning), due day, number of reviews n, misses m. */
/** f: the day it was first seen; c: confirmed = recalled correctly on a later day than f (only then does it count as known). */
export type Rec = { b: number; due: number; n: number; m?: number; p?: 1; f?: number; c?: 1 };
/** A listened verse: times heard, last day, next day to hear again, listening-check results [ok, total]. */
export type Heard = { n: number; last: number; due: number; ok: number; tot: number };
export type State = {
  v: 1;
  r: Record<string, Rec>;
  heard: Record<string, Heard>;
  day: { d: number; nw: number; done: number; heard: number; np?: number; hp?: number };
  set: { newPerDay: number; theme: string; lang: string; reciter: string; en: number; tr?: number; speed?: number };
  my: number[];
  /** Surah units (round 2): day the Meet step was done, day the surah was followed by ear. */
  units: Record<string, { meet?: number; follow?: number }>;
  /** Daily lessons (v3): dictionary forms taught (id → day), verses finished (s:v → day), days with a lesson. */
  met: Record<string, number>;
  lv: Record<string, number>;
  lessonDays: Record<string, number>;
  placed: number;
  /** hist[day] = [first-try answers, first-try misses, listening checks ok, listening checks total, self-report sum, self-report count] */
  hist: Record<string, number[]>;
  updated: number;
};
export const MY_DEFAULT = [1, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
export const blank = (): State => ({ v: 1, r: {}, heard: {}, day: { d: 0, nw: 0, done: 0, heard: 0 }, set: { newPerDay: 8, theme: 'auto', lang: 'auto', reciter: 'Alafasy_128kbps', en: 32 }, my: MY_DEFAULT.slice(), units: {}, met: {}, lv: {}, lessonDays: {}, placed: 0, hist: {}, updated: 0 });
export function normalize(s: unknown): State {
  const b = blank() as Record<string, unknown>;
  if (s && typeof s === 'object') for (const k in b) { const v = (s as Record<string, unknown>)[k]; if (v !== undefined && v !== null && typeof v === typeof b[k] && Array.isArray(v) === Array.isArray(b[k])) b[k] = k === 'set' ? { ...(b[k] as object), ...(v as object) } : v; }
  return b as State;
}
export let state: State = blank();
try { const raw = localStorage.getItem(KEY); if (raw) state = normalize(JSON.parse(raw)); } catch { /* private mode: start blank */ }
export function replace(s: State) { state = s; }
export function save() {
  state.updated = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('Could not save on this device'); }
}
export function rollDay() { const t = dayNum(); if (state.day.d !== t) state.day = { d: t, nw: 0, done: 0, heard: 0 }; }
export function bump(i: number, k = 1) { const t = dayNum(), h = state.hist[t] || (state.hist[t] = [0, 0, 0, 0, 0, 0]); h[i] = (h[i] || 0) + k; }
/** An item counts as known once it has been recalled at least once and is not currently missed. */
/** Known = recalled correctly on a later day than first seen (the Phase 1 review found same-day grades flattered the numbers). */
export const isKnown = (id: string) => { const r = state.r[id]; return !!r && r.b >= 1 && r.c === 1; };
