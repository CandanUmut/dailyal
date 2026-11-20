// Review schedule (same rules as Uu): boxes with growing gaps. Missed -> tomorrow.
import { state, rollDay, bump, save } from './store';
import { dayNum } from './util';
import type { Item } from './data';
export const INTERVALS = [1, 2, 4, 8, 16, 32, 64, 120];

export const dueItems = (all: Item[]) => { const t = dayNum(); return all.filter((c) => state.r[c.id] && state.r[c.id].due <= t); };
/** New items for today, most frequent first (items from My surahs get a small lift). */
export function newItems(all: Item[], boost?: Set<string>) {
  rollDay();
  const left = Math.max(0, state.set.newPerDay - state.day.nw);
  if (!left) return [];
  const pool = all.filter((c) => !state.r[c.id]);
  if (boost?.size) pool.sort((a, b) => (boost.has(b.id) ? b.n * 3 : b.n) - (boost.has(a.id) ? a.n * 3 : a.n));
  return pool.slice(0, left);
}
export function grade(id: string, g: number, again: boolean) {
  rollDay();
  const t = dayNum(), prev = state.r[id], isNew = !prev, n = (prev?.n || 0) + 1, m = prev?.m || 0;
  if (g === 0) state.r[id] = { b: 0, due: t + 1, n, m: again ? m : m + 1 };
  else if (!again) { const b = Math.min(INTERVALS.length - 1, (prev ? prev.b : 0) + g); state.r[id] = { b, due: t + INTERVALS[b], n, m }; }
  if (!again) { bump(0); if (g === 0) bump(1); }
  if (isNew) state.day.nw++;
  state.day.done++;
  save();
}
/** Placement: the learner says they already know an item. It is checked again in a few days. */
export function place(id: string, knew: boolean) {
  const t = dayNum();
  if (knew) state.r[id] = { b: 2, due: t + 3 + Math.floor(Math.random() * 5), n: 0, p: 1 };
  else if (!state.r[id]) state.r[id] = { b: 0, due: t, n: 0, p: 1 };
}
export const nextGap = (id: string, g: number) => INTERVALS[Math.min(INTERVALS.length - 1, (state.r[id] ? state.r[id].b : 0) + g)];
export function missRate7() { const t = dayNum(); let a = 0, m = 0; for (let d = t - 6; d <= t; d++) { const h = state.hist[d]; if (h) { a += h[0] || 0; m += h[1] || 0; } } return { a, m, r: a ? m / a : 0 }; }
export function checks7() { const t = dayNum(); let ok = 0, tot = 0; for (let d = t - 6; d <= t; d++) { const h = state.hist[d]; if (h) { ok += h[2] || 0; tot += h[3] || 0; } } return { ok, tot }; }
