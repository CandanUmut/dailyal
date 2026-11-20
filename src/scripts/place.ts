// Placement sweep: the most frequent items, in batches of 10. Recall, reveal, say honestly whether you knew it.
import { state, save } from './store';
import { items, type Item } from './data';
import { place } from './srs';
import { meaning } from './cardview';
import { badge } from './chrome';
import { t } from './i18n';
import { $, base, esc } from './util';

let all: Item[] = [], i = 0, shown = false, known = 0, unknown = 0;
const LIMIT = 150;
const queue = () => all.filter((x) => !state.r[x.id]).slice(0, LIMIT);
let q: Item[] = [];

function render() {
  const el = $('#place')!;
  if (i >= q.length) { finish(); return; }
  const x = q[i];
  let h = `<span class="eyebrow">${t('placeTitle')} · ${i + 1} / ${q.length}</span><p class="sub" style="margin-top:4px">${i === 0 ? t('placeSub') : ''}</p>`;
  h += `<div class="card" style="margin-top:12px"><p class="prompt-ar" lang="ar">${esc(x.ar)}</p>${shown ? `<p class="mean">${esc(meaning(x)) || '—'}</p><p class="note" style="text-align:center">${t('times', { n: x.n })}</p>` : ''}</div>`;
  h += shown ? `<div class="grade" style="grid-template-columns:1fr 1fr"><button class="btn fail" data-a="no">${t('placeNot')}</button><button class="btn pass" data-a="yes">${t('placeKnew')}</button></div>` : `<div class="stackb"><button class="btn pri" data-a="show" style="min-height:60px">${t('show')}</button></div>`;
  h += `<div class="stackb"><button class="btn quiet" data-a="stop">${t('placeStop')}</button></div>`;
  el.innerHTML = h;
}
function finish() {
  state.placed = Date.now(); save(); badge();
  $('#place')!.innerHTML = `<h1 class="h1">${t('placeDone')}</h1><p class="sub">${t('placeResult', { k: known, u: unknown })}</p><div class="stackb"><a class="btn pri" href="${base()}">${t('backToday')}</a></div>`;
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'show') shown = true;
  else if (a === 'yes' || a === 'no') { const x = q[i]; if (a === 'yes') { place(x.id, true); known++; } else unknown++; i++; shown = false; save(); }
  else if (a === 'stop') { finish(); return; }
  else return;
  render();
});
(async () => { all = await items(); q = queue(); render(); })();
