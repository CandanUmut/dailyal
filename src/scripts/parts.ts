// Parts drill (Phase 2): split joined words by ear and eye. A real word from your surahs, its parts as options.
// Correct parts come from the Quranic Arabic Corpus; the meaning of the whole word from Açık Kuran.
import { state, MY_DEFAULT } from './store';
import { surah, items, type Item } from './data';
import { meaning } from './cardview';
import { verseHtml, playBtn, toggle } from './verse';
import { t, pick } from './i18n';
import { $, base, esc, shuffle } from './util';

type Q = { s: number; v: number; w: number; word: string; parts: number[]; opts: number[][]; gloss: string; chosen?: number };
let all: Item[] = [], qs: Q[] = [], i = 0, right = 0;
const label = (p: number[]) => p.map((x) => `<span class="ar" style="font-size:20px">${esc(all[x].ar.split(' · ').pop()!.split(' / ')[0])}</span> ${esc(meaning(all[x]).split(/,| \(/)[0])}`).join(' + ');

async function build() {
  all = await items();
  const surahsList = state.my.length ? state.my : MY_DEFAULT, pool: Q[] = [];
  for (const sn of surahsList) for (const V of await surah(sn)) V.w.forEach((w, wi) => {
    if (w[0].length >= 2 && w[0].some((x) => all[x].k !== 'l')) pool.push({ s: sn, v: V.n, w: wi, word: V.t[wi], parts: w[0], opts: [], gloss: pick(w[1], w[2]) });
  });
  // Fair wrong options (Phase 2 review: letters not in the word gave the answer away):
  // drop one joined part, or swap a pronoun for another with the same first letter (ـهُ / ـهَا / ـهُمْ …, ـكَ / ـكُمْ …).
  const pr = new Map(all.map((x, k) => [x.id, k]));
  const FAMILY: Record<string, string[]> = { h: ['3MS', '3FS', '3D', '3MP', '3FP'], k: ['2MS', '2FS', '2D', '2MP', '2FP'] };
  const famOf = (person: string) => (person.startsWith('3') ? 'h' : person.startsWith('2') ? 'k' : '');
  qs = shuffle(pool).map((q) => {
    const opts = [q.parts], alts: number[][] = [];
    q.parts.forEach((x, j) => { if (all[x].k !== 'l') alts.push(q.parts.filter((_, m) => m !== j)); });
    q.parts.forEach((x, j) => { const it = all[x]; if (it.k === 'pr' && famOf(it.person!)) for (const p of FAMILY[famOf(it.person!)]) { const k = pr.get('pr:' + p); if (k != null && k !== x) { const a = q.parts.slice(); a[j] = k; alts.push(a); } } });
    for (const a of shuffle(alts)) { if (opts.length === 3) break; if (a.length && !opts.some((o) => o.join() === a.join())) opts.push(a); }
    return { ...q, opts: shuffle(opts) };
  }).filter((q) => q.opts.length === 3).slice(0, 8);
}
async function render() {
  const el = $('#parts')!;
  if (!qs.length) { el.innerHTML = `<h1 class="h1">${t('partsTitle')}</h1><p class="sub">${t('partsNone')}</p>`; return; }
  if (i >= qs.length) { el.innerHTML = `<h1 class="h1">${t('partsTitle')}</h1><p class="big">${right} / ${qs.length}</p><div class="stackb"><button class="btn pri" data-a="again">${t('partsAgain')}</button><a class="btn quiet" href="${base()}words/">‹ ${t('reviewTitle')}</a></div>`; return; }
  const q = qs[i], V = (await surah(q.s))[q.v - 1];
  let h = `<span class="eyebrow">${t('partsTitle')} · ${i + 1} / ${qs.length}</span><p class="sub" style="margin-top:4px">${t('partsSub')}</p>`;
  h += `<div class="card" style="margin-top:10px"><p class="prompt-ar" lang="ar">${esc(q.word)}</p>${verseHtml(V, null, { mark: q.w })}<div class="row" style="justify-content:space-between"><span class="ref">${q.s}:${q.v}</span>${playBtn(q.s, q.v, t('play'), 'sm')}</div></div>`;
  h += `<p style="margin-top:12px"><b>${t('partsQ')}</b></p>` + q.opts.map((o, k) => `<button class="opt ${q.chosen != null ? (o === q.parts ? 'right' : k === q.chosen ? 'wrong' : '') : ''}" data-a="pick" data-k="${k}" ${q.chosen != null ? 'disabled' : ''}>${label(o)}</button>`).join('');
  if (q.chosen != null) h += `<p class="${q.opts[q.chosen] === q.parts ? 'ok' : 'bad'}" style="margin-top:10px">${q.opts[q.chosen] === q.parts ? t('correct') : t('wrong')}</p>${q.gloss ? `<p class="note">${t('wholeWord')}: <b>${esc(q.gloss)}</b> (Açık Kuran)</p>` : ''}<div class="stackb"><button class="btn pri" data-a="next">${t('next')}</button></div>`;
  el.innerHTML = h;
}
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'pick') { const q = qs[i]; q.chosen = +b.dataset.k!; if (q.opts[q.chosen] === q.parts) right++; }
  else if (a === 'next') { i++; window.scrollTo(0, 0); }
  else if (a === 'again') { i = 0; right = 0; await build(); }
  else return;
  await render();
});
build().then(render);
