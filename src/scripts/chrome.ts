// Bottom-nav badge on Words: words from your lessons waiting for review today (v3). Counted from saved progress only.
import { state } from './store';
import { $, dayNum } from './util';
export function badge() {
  const t = dayNum(); let n = 0;
  for (const id in state.r) if (id.startsWith('t:') && state.r[id].due <= t && (state.r[id].f ?? 0) < t) n++;
  const a = $('.nav a[data-tab="words"]');
  if (!a) return;
  a.querySelector('.badge')?.remove();
  if (n) a.insertAdjacentHTML('beforeend', `<span class="badge" aria-label="${n} to review">${n > 99 ? '99+' : n}</span>`);
}
