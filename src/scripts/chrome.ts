// Bottom-nav badge on Words: reviews due today plus new words left for today. Counted from saved progress only.
import { state, rollDay } from './store';
import { $, dayNum } from './util';
export function badge() {
  rollDay();
  const t = dayNum(); let due = 0; for (const id in state.r) if (state.r[id].due <= t) due++;
  const n = due + Math.max(0, state.set.newPerDay - state.day.nw), a = $('.nav a[data-tab="words"]');
  if (!a) return;
  a.querySelector('.badge')?.remove();
  if (n) a.insertAdjacentHTML('beforeend', `<span class="badge" aria-label="${n} ready">${n > 99 ? '99+' : n}</span>`);
}
