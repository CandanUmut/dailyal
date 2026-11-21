// Surahs: My surahs (prayer set), all 114 with known share, and a reader (?n=) with tappable words and translation.
import { state, save, MY_DEFAULT } from './store';
import { surahs, surah, items, type Surah } from './data';
import { overview, knownIdx } from './coverage';
import { verseHtml, playBtn, toggle, playAll, speedChips, setSpeed } from './verse';
import { state as st, bump } from './store';
import { checkTr, similar } from './trans';
import { shuffle } from './util';
import { meaning, grammarLabel } from './cardview';
import { trText, trName } from './trans';
import { t, pick, lang } from './i18n';
import { $, base, esc } from './util';

const name = (s: Surah) => (lang() === 'tr' ? s.tr : s.tname);
const n = Number(new URLSearchParams(location.search).get('n'));
if (!state.my.length) state.my = MY_DEFAULT.slice();

async function list() {
  const [ss, ov] = await Promise.all([surahs(), overview()]);
  const row = (s: Surah) => `<li><div class="li"><a href="${base()}surahs/read/?n=${s.n}" style="flex:1;display:flex;gap:12px;align-items:center;min-height:56px;text-decoration:none"><span class="ref" style="width:28px">${s.n}</span><span style="flex:1"><b>${esc(name(s))}</b><span class="note" style="display:block">${s.type === 'Meccan' ? t('meccan') : t('medinan')} · ${t('verses', { n: s.ayas })} · ${t('known', { p: Math.round(ov.perSurah[s.n - 1] * 100) })}</span></span><span class="ar" style="font-size:22px">${esc(s.ar)}</span></a><button class="chip" style="margin-left:8px" data-a="my" data-n="${s.n}" aria-pressed="${state.my.includes(s.n)}" aria-label="${t('inMy')}">${state.my.includes(s.n) ? '★' : '☆'}</button></div></li>`;
  let h = `<h1 class="h1">${t('surahs')}</h1><div class="sec"><div class="sh">${t('mySurahs')}</div><p class="note">${t('mySub')}</p><ul class="list" style="margin-top:8px">${state.my.map((x) => row(ss[x - 1])).join('')}</ul></div>`;
  h += `<div class="sec"><div class="sh">${t('allSurahs')}</div><ul class="list">${ss.map(row).join('')}</ul></div>`;
  $('#surahs')!.innerHTML = h;
}

let sel: { v: number; i: number } | null = null;
// Whole-surah listening: play every verse in order, text shown or hidden, then a short gist check.
let hide = false, heardAll = false, playing = 0, stop: (() => void) | null = null, done = false, gist: { opts: string[]; right: string; chosen?: string } | null = null, selfR = -1;
async function makeGist() {
  const [vs, ss] = await Promise.all([surah(n), surahs()]);
  const right = checkTr(shuffle(vs.filter((v) => (checkTr(v).text || '').length > 20))[0] || vs[0]).text, opts = [right];
  for (let tries = 0; opts.length < 3 && tries < 20; tries++) {
    const other = 1 + Math.floor(Math.random() * 114); if (other === n) continue;
    const ov = await surah(other), x = checkTr(ov[Math.floor(Math.random() * ov.length)]).text;
    if (x && x.length > 20 && opts.every((o) => similar(o, x) < 0.3)) opts.push(x);
  }
  void ss; gist = { right, opts: shuffle(opts) };
}
async function reader() {
  const [ss, vs, k, all] = await Promise.all([surahs(), surah(n), knownIdx(), items()]);
  const S = ss[n - 1];
  let h = `<a class="back" href="${base()}surahs/">‹ ${t('surahs')}</a><span class="eyebrow">${n} · ${S.type === 'Meccan' ? t('meccan') : t('medinan')} · ${t('order', { n: S.order })}</span><h1 class="h1">${esc(name(S))} <span class="ar" style="font-size:30px">${esc(S.ar)}</span></h1>`;
  h += `<p class="sub">${esc(lang() === 'tr' ? S.trMean || '' : S.enMean || S.en)} · ${t('verses', { n: S.ayas })}</p>`;
  h += `<button class="chip" style="margin-top:10px" data-a="my" data-n="${n}" aria-pressed="${state.my.includes(n)}">${state.my.includes(n) ? '★ ' + t('inMy') : '☆ ' + t('addMy')}</button><p class="src" style="margin-top:8px">${t('ctxSrc')}</p>`;
  h += `<div class="card sec"><b>${t('wholeTitle')}</b><p class="note">${t('wholeSub')}</p><div class="chips" style="margin-top:8px"><button class="chip" data-a="hide" aria-pressed="${hide}">${t('hideText')}</button></div>${speedChips()}<div class="stackb"><button class="btn pri" data-a="all">${playing ? t('stopAll') : t('playAll')}</button></div>`;
  if (done && gist) {
    h += `<p style="margin-top:14px"><b>${t('gistQ')}</b></p>` + gist.opts.map((o, i) => `<button class="opt ${gist!.chosen ? (o === gist!.right ? 'right' : o === gist!.chosen ? 'wrong' : '') : ''}" data-a="gist" data-i="${i}" ${gist!.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('');
    if (gist.chosen) h += `<p class="${gist.chosen === gist.right ? 'ok' : 'bad'}" style="margin-top:8px">${gist.chosen === gist.right ? t('correct') : t('wrong')}${hide && heardAll ? '' : ' ' + t('gistPractice')}</p><p style="margin-top:10px"><b>${t('selfQ')}</b></p><div class="chips">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="selfR" data-v="${i}" aria-pressed="${selfR === i}">${x}</button>`).join('')}</div>`;
  }
  h += '</div>';
  if (vs[0].b && vs[0].bt && !hide) h += `<p class="q basmala" lang="ar" style="margin-top:12px">${esc(vs[0].bt)}</p>`;
  for (const V of vs) {
    if (hide) { h += `<div class="sec" style="margin-top:8px;border-top:1px solid var(--rule);padding-top:8px" data-v="${V.n}"><p class="${playing === V.n ? 'ok' : 'note'}">${playing === V.n ? '▶ ' : ''}${t('verseN', { n: V.n })}</p></div>`; continue; }
    h += `<div class="sec" style="margin-top:14px;border-top:1px solid var(--rule);padding-top:8px;${playing === V.n ? 'background:var(--sunk);' : ''}" data-v="${V.n}">${verseHtml(V, k, { sel: sel?.v === V.n ? sel.i : undefined })}`;
    if (sel?.v === V.n) { const w = V.w[sel.i]; h += `<div class="gloss"><span class="ar">${esc(V.t[sel.i])}</span> &nbsp;<b>${esc(pick(w[1], w[2])) || '—'}</b>${grammarLabel(w[4]) ? `<div class="note">${esc(grammarLabel(w[4]))}</div>` : ''}<div class="ref">${w[0].map((x) => `<a class="wlink" href="${base()}words/?id=${encodeURIComponent(all[x].id)}"><span class="ar">${esc(all[x].ar)}</span></a> ${esc(meaning(all[x]))}`).join(' · ')}</div></div>`; }
    h += `<div class="row" style="justify-content:space-between;align-items:flex-start;margin-top:4px"><p class="tl" style="flex:1">${esc(trText(V))}</p>${playBtn(n, V.n, t('play'), 'sm')}</div>`;
    h += `<a class="btn quiet" style="margin-top:6px" href="${base()}listen/?v=${n}:${V.n}">${t('listen')} ${n}:${V.n}</a></div>`;
  }
  h += `<p class="src" style="margin-top:14px">${esc(trName())} · ${t('srcAk')}</p>`;
  const y = window.scrollY; $('#surahs')!.innerHTML = h; window.scrollTo(0, y);
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'speed') { setSpeed(+b.dataset.v!); st.set.speed = +b.dataset.v!; save(); reader(); return; }
  if (a === 'hide') { hide = !hide; reader(); return; }
  if (a === 'all') {
    if (stop) { stop(); stop = null; playing = 0; reader(); return; }
    done = false; gist = null; selfR = -1;
    surahs().then((ss) => { stop = playAll(n, 1, ss[n - 1].ayas, (v) => { playing = v; reader().then(() => document.querySelector(`[data-v="${v}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })); }, async (ok) => { stop = null; playing = 0; done = true; heardAll = ok; await makeGist(); reader(); }); });
    return;
  }
  if (a === 'gist' && gist && !gist.chosen) { gist.chosen = gist.opts[+b.dataset.i!]; if (hide && heardAll) { bump(3); if (gist.chosen === gist.right) bump(2); } save(); reader(); return; }
  if (a === 'selfR') { const v = +b.dataset.v!; if (selfR < 0) { bump(4, v); bump(5); } else bump(4, v - selfR); selfR = v; save(); reader(); return; }
  if (a === 'my') { const x = +b.dataset.n!; state.my = state.my.includes(x) ? state.my.filter((y) => y !== x) : [...state.my, x].sort((p, q) => p - q); save(); n ? reader() : list(); }
  if (a === 'word') { const v = +b.closest<HTMLElement>('[data-v]')!.dataset.v!, i = +b.dataset.i!; sel = sel && sel.v === v && sel.i === i ? null : { v, i }; reader(); }
});
n >= 1 && n <= 114 ? reader() : list();
