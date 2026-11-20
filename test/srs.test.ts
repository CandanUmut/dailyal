import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} });
vi.stubGlobal('document', { getElementById: () => null, querySelector: () => null, body: { appendChild() {}, dataset: {} }, createElement: () => ({ setAttribute() {} }) });
const store = await import('../src/scripts/store');
const { replace, blank } = store;
const { grade, place, INTERVALS } = await import('../src/scripts/srs');
const { dayNum } = await import('../src/scripts/util');

describe('review schedule', () => {
  beforeEach(() => replace(blank()));
  it('a missed new word comes back tomorrow', () => { grade('l:x', 0, false); expect(store.state.r['l:x']).toMatchObject({ b: 0, due: dayNum() + 1, m: 1 }); });
  it('easy on a new word moves two boxes', () => { grade('l:x', 2, false); expect(store.state.r['l:x'].b).toBe(2); expect(store.state.r['l:x'].due).toBe(dayNum() + INTERVALS[2]); });
  it('a retry after a miss does not move the box', () => { grade('l:x', 0, false); grade('l:x', 2, true); expect(store.state.r['l:x'].b).toBe(0); });
  it('placement "knew it" is checked again within 3–7 days', () => { place('l:y', true); const d = store.state.r['l:y'].due - dayNum(); expect(d).toBeGreaterThanOrEqual(3); expect(d).toBeLessThanOrEqual(7); });
  it('counts new words per day', () => { grade('l:a', 1, false); grade('l:b', 1, false); expect(store.state.day.nw).toBe(2); });
});
