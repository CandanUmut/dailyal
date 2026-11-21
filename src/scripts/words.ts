// Words: daily review (due + new), or one word's page (?id=). Say the meaning out loud, then grade yourself.
import { state, rollDay } from './store';
import { items, itemById, type Item } from './data';
import { dueItems, newItems, grade, nextGap, missRate7 } from './srs';
import { mySurahItems } from './coverage';
import { cardBack, roleLabel } from './cardview';
import { toggle } from './verse';
import { badge } from './chrome';
import { t } from './i18n';
import { $, base, esc, shuffle } from './util';

let all: Item[] = [];
let s: { queue: { c: Item; again: boolean }[]; shown: boolean; done: number; missed: number } | null = null;
let back = '';
const one = new URLSearchParams(location.search).get('id');

function start(list: Item[]) { s = { queue: shuffle(list).map((c) => ({ c, again: false })), shown: false, done: 0, missed: 0 }; }
const kindLabel = (c: Item) => (c.k === 'p' ? t('prefix') : c.k === 'pr' ? t('pronoun') : roleLabel(c));

async function landing(boost: Set<string>) {
  rollDay();
  const due = dueItems(all).length, nw = newItems(all, boost).length, ready = due + nw, mr = missRate7();
  let h = `<span class="eyebrow">${t('reviewTitle')}</span><h1 class="h1">${t('reviewTitle')}</h1><p class="sub">${t('reviewSub')}</p>`;
  h += `<div class="sec row"><span class="big">${ready}</span><div><p style="font-weight:700">${ready ? t('ready') : t('caught')}</p><p class="note">${t('dueNew', { d: due, n: nw, m: Math.max(1, Math.round(ready * 0.3)) })}</p></div></div>`;
  if (ready) h += `<div class="stackb"><button class="btn pri" data-a="start">${t('start')}</button></div>`;
  h += `<div class="sec"><div class="sh">${t('missRate')}</div>${mr.a >= 10 ? `<p><b>${t('mr', { p: Math.round(mr.r * 100), a: mr.a })}</b></p><p class="note">${mr.r < 0.05 ? t('mrLow') : mr.r <= 0.15 ? t('mrOk') : t('mrHigh')}</p>` : `<p class="note">${t('missRateNote')}</p>`}</div>`;
  return h;
}
function session() {
  const v = s!;
  if (!v.queue.length) return `<span class="eyebrow">${t('reviewTitle')}</span><h1 class="h1">${t('doneTitle')}</h1><p class="sub">${t('doneSub', { n: v.done, m: v.missed })}</p><div class="stackb"><a class="btn pri" href="${base()}">${t('backToday')}</a></div>`;
  const it = v.queue[0], c = it.c, isNew = !state.r[c.id] || state.r[c.id].n === 0;
  let h = `<div class="sess"><button class="back" data-a="stop">${t('stop')}</button><div class="meter"><span style="width:${(v.done / Math.max(1, v.done + v.queue.length)) * 100}%"></span></div><span class="eyebrow">${t('left', { n: v.queue.length })}</span></div>`;
  h += `<div class="card" style="margin-top:10px"><div class="row" style="flex-wrap:wrap;gap:8px"><span class="eyebrow">${esc(kindLabel(c))}</span>${isNew ? `<span class="tag new">${t('newTag')}</span>` : ''}${it.again ? `<span class="tag">${t('again')}</span>` : ''}</div>`;
  h += `<p class="prompt-ar" lang="ar">${esc(c.ar)}</p>`;
  h += v.shown ? back : '';
  h += '</div>';
  h += v.shown ? `<div class="grade sticky"><button class="btn fail" data-a="grade" data-v="0">${t('missed')}<small>${t('tomorrow')}</small></button><button class="btn inc" data-a="grade" data-v="1">${t('effort')}<small>${it.again ? t('tomorrow') : t('days', { n: nextGap(c.id, 1) })}</small></button><button class="btn pass" data-a="grade" data-v="2">${t('easy')}<small>${it.again ? t('tomorrow') : t('days', { n: nextGap(c.id, 2) })}</small></button></div>`
    : `<div class="stackb"><button class="btn pri" data-a="show" style="min-height:60px">${t('show')}</button></div>`;
  return h;
}
let boost = new Set<string>();
async function render() { $('#words')!.innerHTML = s ? session() : await landing(boost); }

document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'start') start(dueItems(all).concat(newItems(all, boost)));
  else if (a === 'stop') s = null;
  else if (a === 'show') { back = await cardBack(s!.queue[0].c); s!.shown = true; }
  else if (a === 'grade') { const v = +b.dataset.v!, it = s!.queue.shift()!; grade(it.c.id, v, it.again); s!.done++; if (v === 0) { s!.missed++; s!.queue.push({ c: it.c, again: true }); } s!.shown = false; badge(); }
  else return;
  await render(); window.scrollTo(0, 0);
});

(async () => {
  all = await items();
  if (one) {
    const x = (await itemById()).get(one);
    $('#words')!.innerHTML = x ? `<a class="back" href="${base()}words/">‹ ${t('reviewTitle')}</a><div class="card" style="margin-top:8px"><span class="eyebrow">${esc(kindLabel(x))}</span><p class="prompt-ar" lang="ar">${esc(x.ar)}</p>${await cardBack(x)}</div>` : '<p>Not found.</p>';
    return;
  }
  boost = await mySurahItems();
  await render();
})();
