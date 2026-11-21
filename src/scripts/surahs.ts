// Surahs: My surahs (prayer set), all 114 with known share, and a reader (?n=) with tappable words and translation.
import { state, save, MY_DEFAULT } from './store';
import { surahs, surah, items, type Surah } from './data';
import { overview, knownIdx } from './coverage';
import { verseHtml, playBtn, toggle, playAll, speedChips, setSpeed } from './verse';
import { state as st } from './store';
import { openWordSheet } from './sheet';
import { wordKnown } from './coverage';
import { trName, rangeOnce } from './trans';
import { t, lang } from './i18n';
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
let limit = 40, hide = false, playing = 0, stop: (() => void) | null = null, done = false;
async function reader() {
  const [ss, vs, k, all] = await Promise.all([surahs(), surah(n), knownIdx(), items()]);
  const S = ss[n - 1];
  let h = `<a class="back" href="${base()}surahs/">‹ ${t('surahs')}</a><span class="eyebrow">${n} · ${S.type === 'Meccan' ? t('meccan') : t('medinan')} · ${t('order', { n: S.order })}</span><h1 class="h1">${esc(name(S))} <span class="ar" style="font-size:30px">${esc(S.ar)}</span></h1>`;
  h += `<p class="sub">${esc(lang() === 'tr' ? S.trMean || '' : S.enMean || S.en)} · ${t('verses', { n: S.ayas })}</p>`;
  h += `<button class="chip" style="margin-top:10px" data-a="my" data-n="${n}" aria-pressed="${state.my.includes(n)}">${state.my.includes(n) ? '★ ' + t('inMy') : '☆ ' + t('addMy')}</button><p class="src" style="margin-top:8px">${t('ctxSrc')}</p>`;
  h += `<div class="card sec"><b>${t('wholeTitle')}</b><p class="note">${t('wholeSub')}</p><div class="chips" style="margin-top:8px"><button class="chip" data-a="hide" aria-pressed="${hide}">${t('hideText')}</button></div>${speedChips()}<div class="stackb"><button class="btn pri" data-a="all">${playing ? t('stopAll') : t('playAll')}</button></div>`;
  // The check for a whole surah lives in the ladder (same-surah questions); here we only point to it (Phase 3 review).
  if (done) h += `<p class="sec">${t('wholeDone')}</p><div class="stackb"><a class="btn" href="${base()}listen/ladder/${S.ayas <= 8 && S.ayas > 3 ? `?p=${n}:1-${S.ayas}` : ''}">${t('ladder')} ›</a></div>`;
  h += '</div>';
  if (vs[0].b && vs[0].bt && !hide) h += `<p class="q basmala" lang="ar" style="margin-top:12px">${esc(vs[0].bt)}</p>`;
  const once = rangeOnce(vs);
  // Sections (Tanzil metadata): header with the share of words you know in it.
  const starts = vs.filter((v) => v.ruku).map((v) => v.n); let sec = 0;
  for (const V of vs) {
    if (V.n > limit && !(playing && V.n <= playing) && !(sel && V.n <= sel.v)) { h += `<div class="stackb"><button class="btn" data-a="more">${t('more', { n: Math.min(40, vs.length - limit) })}</button></div>`; break; }
    if (V.ruku && !hide && starts.length > 1) { sec++; const a = V.n, b = (starts[sec] || vs.length + 1) - 1, ws = vs.slice(a - 1, b).flatMap((x) => x.w.filter((w) => w[0].length)), kn = ws.filter((w) => wordKnown(w[0], k)).length; h += `<div class="sh sec" style="margin-top:22px">${t('section', { k: sec, a, b })} · ${t('known', { p: ws.length ? Math.round((kn / ws.length) * 100) : 0 })}</div>`; }
    if (hide) { h += `<div class="sec" style="margin-top:8px;border-top:1px solid var(--rule);padding-top:8px" data-v="${V.n}"><p class="${playing === V.n ? 'ok' : 'note'}">${playing === V.n ? '▶ ' : ''}${t('verseN', { n: V.n })}</p></div>`; continue; }
    h += `<div class="sec" style="margin-top:14px;border-top:1px solid var(--rule);padding-top:8px;${playing === V.n ? 'background:var(--sunk);' : ''}" data-v="${V.n}">${verseHtml(V, k, { sel: sel?.v === V.n ? sel.i : undefined })}`;
    h += `<div class="row" style="justify-content:space-between;align-items:flex-start;margin-top:4px"><p class="tl" style="flex:1">${esc(once.get(V.n) || '')}</p>${playBtn(n, V.n, t('play'), 'sm')}</div>`;
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
  if (a === 'more') { limit += 40; reader(); return; }
  if (a === 'all') {
    if (stop) { stop(); stop = null; playing = 0; reader(); return; }
    done = false;
    surahs().then((ss) => { stop = playAll(n, 1, ss[n - 1].ayas, (v) => { playing = v; reader().then(() => document.querySelector(`[data-v="${v}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })); }, async () => { stop = null; playing = 0; done = true; reader(); }); });
    return;
  }
  if (a === 'my') { const x = +b.dataset.n!; state.my = state.my.includes(x) ? state.my.filter((y) => y !== x) : [...state.my, x].sort((p, q) => p - q); save(); n ? reader() : list(); }
  if (a === 'word') { const v = +b.closest<HTMLElement>('[data-v]')!.dataset.v!, i = +b.dataset.i!; sel = { v, i }; openWordSheet(n, v, i); }
});
n >= 1 && n <= 114 ? reader() : list();
