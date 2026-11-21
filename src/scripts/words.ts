// Words: daily review (due + new), or one word's page (?id=). Say the meaning out loud, then grade yourself.
import { state, rollDay, save } from './store';
import { items, itemById, phrases, type Item } from './data';
import { dueItems, newItems, grade, nextGap, missRate7 } from './srs';
import { mySurahItems } from './coverage';
import { cardBack, roleLabel } from './cardview';
import { toggle, playBtn, verseHtml } from './verse';
import { surah } from './data';
import { badge } from './chrome';
import { t, lang } from './i18n';
import { $, base, esc, shuffle } from './util';

let all: Item[] = [];
type QI = { c: Item; again: boolean; ear?: string; heard?: boolean };
let s: { queue: QI[]; shown: boolean; done: number; missed: number } | null = null;
let back = '', earVerse = '';
const one = new URLSearchParams(location.search).get('id');
const deck = new URLSearchParams(location.search).get('deck');
const unitN = Number(new URLSearchParams(location.search).get('unit')) || 0;
let unitList: Item[] = [], unitName = '';
const PHRASES_PER_DAY = 3;

// Ear-first (Phase 2): about half of the words you are past learning come as "hear the verse first", using a verse from your own surahs.
const earRef = (c: Item) => { const r = state.r[c.id]; if (!r || r.b < 2 || !c.ex30?.length || Math.random() >= 0.5) return undefined; const mine = c.ex30.filter((x) => state.my.includes(+x.split(':')[0])); const pool = mine.length ? mine : c.ex30; return pool[Math.floor(Math.random() * pool.length)]; };
let earPlayed = false;
function start(list: Item[]) { s = { queue: shuffle(list).map((c) => ({ c, again: false, ear: earRef(c) })), shown: false, done: 0, missed: 0 }; }
const kindLabel = (c: Item) => (c.k === 'p' ? t('prefix') : c.k === 'pr' ? t('pronoun') : c.k === 'ph' ? t('phrase') : roleLabel(c));
/** New phrases: 3 a day, kept apart from the word count. */
const newPhrases = (ps: Item[]) => { rollDay(); return ps.filter((c) => !state.r[c.id]).slice(0, Math.max(0, PHRASES_PER_DAY - (state.day.np || 0))); };
let ps: Item[] = [];

async function landing(boost: Set<string>) {
  rollDay();
  const due = dueItems(unitN ? unitList : all).length, nw = (unitN ? unitList.filter((c) => !state.r[c.id]).slice(0, 12) : deck ? newPhrases(all) : newItems(all, boost)).length, ready = due + nw, mr = missRate7();
  let h = unitN ? `<a class="back" href="${base()}unit/?s=${unitN}">‹ ${t('backUnit')}</a><h1 class="h1">${t('unitWordsTitle', { name: esc(unitName) })}</h1><p class="sub">${t('reviewSub')}</p>` : deck ? `<a class="back" href="${base()}words/">‹ ${t('reviewTitle')}</a><h1 class="h1">${t('phrasesLink')}</h1><p class="sub">${t('reviewSub')}</p>` : `<span class="eyebrow">${t('reviewTitle')}</span><h1 class="h1">${t('reviewTitle')}</h1><p class="sub">${t('reviewSub')}</p>`;
  h += `<div class="sec row"><span class="big">${ready}</span><div><p style="font-weight:700">${ready ? t('ready') : t('caught')}</p><p class="note">${t('dueNew', { d: due, n: nw, m: Math.max(1, Math.round(ready * 0.3)) })}</p></div></div>`;
  if (ready) h += `<div class="stackb"><button class="btn pri" data-a="start">${t('start')}</button></div>`;
  if (!deck && !unitN) {
    const pd = dueItems(ps).length, pn = newPhrases(ps).length;
    h += `<div class="sec"><div class="sh">${t('moreWords')}</div><ul class="list">${[[`words/?deck=phrases`, t('phrasesLink'), t('phrasesLinkD', { d: pd, n: pn })], ['words/parts/', t('partsLink'), t('partsLinkD')], ['library/roots/', t('roots'), t('rootsSub')], ['library/', t('lessons'), t('lessonsLink')]].map(([href, l, d]) => `<li><a href="${base()}${href}"><span style="flex:1"><b>${l}</b><span class="note" style="display:block">${d}</span></span><span class="go">›</span></a></li>`).join('')}</ul></div>`;
  }
  h += `<div class="sec"><div class="sh">${t('missRate')}</div>${mr.a >= 10 ? `<p><b>${t('mr', { p: Math.round(mr.r * 100), a: mr.a })}</b></p><p class="note">${mr.r < 0.05 ? t('mrLow') : mr.r <= 0.15 ? t('mrOk') : t('mrHigh')}</p>` : `<p class="note">${t('missRateNote')}</p>`}</div>`;
  return h;
}
function session() {
  const v = s!;
  if (!v.queue.length) return `<span class="eyebrow">${t('reviewTitle')}</span><h1 class="h1">${t('doneTitle')}</h1><p class="sub">${t('doneSub', { n: v.done, m: v.missed })}</p><div class="stackb"><a class="btn pri" href="${base()}">${t('backToday')}</a></div>`;
  const it = v.queue[0], c = it.c, isNew = !state.r[c.id] || state.r[c.id].n === 0;
  let h = `<div class="sess"><button class="back" data-a="stop">${t('stop')}</button><div class="meter"><span style="width:${(v.done / Math.max(1, v.done + v.queue.length)) * 100}%"></span></div><span class="eyebrow">${t('left', { n: v.queue.length })}</span></div>`;
  h += `<div class="card" style="margin-top:10px"><div class="row" style="flex-wrap:wrap;gap:8px"><span class="eyebrow">${esc(kindLabel(c))}</span>${isNew ? `<span class="tag new">${t('newTag')}</span>` : ''}${it.again ? `<span class="tag">${t('again')}</span>` : ''}</div>`;
  if (it.ear && !it.heard && !v.shown) {
    const [es, ev] = it.ear.split(':').map(Number);
    h += `<span class="tag new">${t('earTag')}</span><p class="note" style="margin:10px 0">${t('earSub')}</p><div class="player">${playBtn(es, ev, t('play'))}</div></div><div class="stackb"><button class="btn pri" data-a="heard" style="min-height:60px" ${earPlayed ? '' : 'disabled'}>${t('showVerse')}</button>${earPlayed ? '' : `<p class="note">${t('earPlayFirst')}</p>`}</div>`;
    return h;
  }
  if (it.ear && earVerse) h += earVerse;
  h += `<p class="prompt-ar" lang="ar">${esc(c.ar)}</p>`;
  h += v.shown ? back : '';
  h += '</div>';
  h += v.shown ? `<div class="grade sticky"><button class="btn fail" data-a="grade" data-v="0">${t('missed')}<small>${t('tomorrow')}</small></button><button class="btn inc" data-a="grade" data-v="1">${t('effort')}<small>${it.again ? t('tomorrow') : t('days', { n: nextGap(c.id, 1) })}</small></button><button class="btn pass" data-a="grade" data-v="2">${t('easy')}<small>${it.again ? t('tomorrow') : t('days', { n: nextGap(c.id, 2) })}</small></button></div>`
    : `<div class="stackb"><button class="btn pri" data-a="show" style="min-height:60px">${t('show')}</button></div>`;
  return h;
}
let boost = new Set<string>();
async function render() { $('#words')!.innerHTML = s ? session() : await landing(boost); }

// Ear-first unlocks only when the verse has played to the end (Phase 3 review: play-then-pause unlocked it).
const unlockEar = async () => { if (s && s.queue[0]?.ear && !s.queue[0].heard && !earPlayed) { earPlayed = true; await render(); } };
document.addEventListener('audioended', unlockEar);
document.addEventListener('audioerror', unlockEar);
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'start') start(unitN ? dueItems(unitList).concat(unitList.filter((c) => !state.r[c.id]).slice(0, 12)) : dueItems(all).concat(deck ? newPhrases(all) : newItems(all, boost)));
  else if (a === 'stop') s = null;
  else if (a === 'heard') { const it = s!.queue[0], [es, ev, ew] = it.ear!.split(':').map(Number); earVerse = verseHtml((await surah(es))[ev - 1], null, { mark: ew - 1 }); it.heard = true; }
  else if (a === 'show') { back = await cardBack(s!.queue[0].c); s!.shown = true; }
  else if (a === 'grade') { const v = +b.dataset.v!, it = s!.queue.shift()!; const wasNew = !state.r[it.c.id]; grade(it.c.id, v, it.again); if (deck && wasNew) { state.day.nw--; state.day.np = (state.day.np || 0) + 1; save(); } s!.done++; if (v === 0) { s!.missed++; s!.queue.push({ c: it.c, again: true }); } s!.shown = false; earVerse = ''; earPlayed = false; badge(); }
  else return;
  await render(); window.scrollTo(0, 0);
});

(async () => {
  ps = await phrases();
  all = deck === 'phrases' ? ps : await items();
  if (one) {
    const x = one.startsWith('ph:') ? ps.find((p) => p.id === one) : (await itemById()).get(one);
    $('#words')!.innerHTML = x ? `<a class="back" href="${base()}words/">‹ ${t('reviewTitle')}</a><div class="card" style="margin-top:8px"><span class="eyebrow">${esc(kindLabel(x))}</span><p class="prompt-ar" lang="ar">${esc(x.ar)}</p>${await cardBack(x)}</div>` : '<p>Not found.</p>';
    return;
  }
  boost = await mySurahItems();
  if (unitN) { const { unitItems } = await import('./units'); const { surahs } = await import('./data'); unitList = await unitItems(unitN); const S = (await surahs())[unitN - 1]; unitName = lang() === 'tr' ? S.tr : S.tname; }
  await render();
})();
