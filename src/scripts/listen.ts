// Listen: one verse, three passes (hear and see, fill, hear only), ending with a listening check and a self-report.
import { state, save, bump, rollDay } from './store';
import { surah, surahs, items, type Verse, type Item, type Surah } from './data';
import { knownIdx, pickVerse, wordKnown } from './coverage';
import { place } from './srs';
import { verseHtml, playBtn, toggle, reciterName, speedChips, setSpeed } from './verse';
import { meaning } from './cardview';
import { badge } from './chrome';
import { t, pick, lang } from './i18n';
import { $, base, esc, shuffle, dayNum, toast } from './util';

type Q = { word: number; opts: string[]; right: string; chosen?: string };
let S: Surah, V: Verse, all: Item[], k: Uint8Array, sv = { s: 1, v: 1 };
let pass = 1, sel = -1, showTr = false, fill: Q[] = [], fi = 0, check: { opts: string[]; right: string; chosen?: string } | null = null, self = -1;
const seen = new Set<string>();
const AGAIN = [1, 3, 7, 14];

const trText = (v: Verse) => (lang() === 'tr' ? v.tr : v.en) || v.en || v.tr || '';
const trBy = () => (lang() === 'tr' ? 'Diyanet İşleri (Açık Kuran)' : 'Sahih International (Açık Kuran)');
const place_ = (v: Verse, i: number) => pick(v.w[i][1], v.w[i][2]);

async function load(s: number, v: number) {
  sv = { s, v }; seen.add(`${s}:${v}`);
  [S, all, k] = await Promise.all([surahs().then((x) => x[s - 1]), items(), knownIdx()]);
  const ss = await surah(s); V = ss[v - 1];
  pass = 1; sel = -1; showTr = false; fi = 0; check = null; self = -1;
  // Fill: up to 3 words that carry a dictionary form, preferring ones you are learning; options are meanings of other words in this surah.
  const pool = ss.flatMap((x) => x.w.map((w) => pick(w[1], w[2]))).filter(Boolean);
  const cands = V.w.map((w, i) => ({ i, g: place_(V, i), learning: w[0].some((x) => state.r[all[x].id]), lemma: w[0].some((x) => all[x].k === 'l') })).filter((c) => c.g && c.lemma);
  fill = shuffle(cands).sort((a, b) => Number(b.learning) - Number(a.learning)).slice(0, Math.min(3, cands.length)).sort((a, b) => a.i - b.i).map((c) => {
    const others = shuffle([...new Set(pool.filter((g) => g !== c.g && !V.w.some((w, j) => j === c.i && pick(w[1], w[2]) === g)))]).slice(0, 2);
    return { word: c.i, right: c.g, opts: shuffle([c.g, ...others]) };
  });
  // Check: the right translation and two from other verses of the same surah (different texts).
  const mine = trText(V), others = shuffle([...new Set(ss.filter((x) => x.n !== V.n).map(trText).filter((x) => x && x !== mine))]).slice(0, 2);
  if (others.length < 2) { const s2 = await surah(s === 114 ? 113 : s + 1); others.push(...shuffle(s2.map(trText).filter((x) => x && x !== mine)).slice(0, 2 - others.length)); }
  check = { right: mine, opts: shuffle([mine, ...others]) };
}

function header() {
  return `<span class="eyebrow">${t('listen')} · ${esc(lang() === 'tr' ? S.tr : S.tname)} ${sv.s}:${sv.v}</span>
  <div class="passes">${[t('p1'), t('p2'), t('p3')].map((x, i) => `<span class="${i + 1 === pass ? 'on' : i + 1 < pass ? 'done' : ''}">${i + 1} · ${x}</span>`).join('')}</div>`;
}
function context() {
  const type = S.type === 'Meccan' ? t('meccan') : t('medinan');
  return `<details class="card" style="margin-bottom:12px"><summary><b>${t('context')}</b>&nbsp;·&nbsp;<span class="ar" style="font-size:20px">${esc(S.ar)}</span></summary>
  <p>${esc(lang() === 'tr' ? `${S.tr}${S.trMean ? ` (${S.trMean})` : ''}` : `${S.tname} (${S.enMean || S.en})`)}</p>
  <p class="note">${type} · ${t('verses', { n: S.ayas })} · ${t('order', { n: S.order })} · ${t('sections', { n: S.rukus })}</p>
  <p class="src" style="margin-top:6px">${t('ctxSrc')}</p></details>`;
}
function share() { const ws = V.w.filter((w) => w[0].length), kn = ws.filter((w) => wordKnown(w[0], k)).length; return kn === ws.length ? t('followAll') : t('followN', { k: kn, n: ws.length }); }
const player = () => `<div class="player">${playBtn(sv.s, sv.v, t('play'))}<div style="flex:1">${speedChips()}<p class="note" style="margin:4px 0 0">${esc(t('reciter', { r: reciterName() }))}</p></div></div>`;

function pass1() {
  let h = context() + (V.b && V.bt ? `<p class="q basmala" lang="ar">${esc(V.bt)}</p>` : '') + verseHtml(V, k, { sel });
  h += `<p class="cap">${share()} ${t('tapWord')}</p>`;
  if (sel >= 0) {
    const w = V.w[sel];
    h += `<div class="gloss" aria-live="polite"><span class="ar" lang="ar">${esc(V.t[sel])}</span> &nbsp;<b>${esc(place_(V, sel)) || '—'}</b><div class="ref">${t('meaningHere')} · ${t('srcAk')}</div>`;
    for (const x of w[0]) { const it = all[x]; h += `<div class="row" style="margin-top:6px;flex-wrap:wrap"><a href="${base()}words/?id=${encodeURIComponent(it.id)}" class="ar" style="font-size:22px">${esc(it.ar)}</a><span class="note">${esc(meaning(it))} · ${t('rank', { r: it.r })}</span>${k[x] ? `<span class="tag known">${t('knownWord')}</span>` : state.r[it.id] ? '' : `<button class="btn quiet" style="min-height:48px" data-a="learn" data-id="${esc(it.id)}">${t('addWord')}</button>`}</div>`; }
    h += '</div>';
  }
  h += player();
  h += `<div class="stackb"><button class="btn quiet" data-a="tr">${showTr ? t('hideTr') : t('showTr')}</button></div>`;
  if (showTr) h += `<p class="tl" style="margin-top:12px">${esc(trText(V))}<small>${trBy()}</small></p>`;
  h += `<div class="stackb"><button class="btn pri" data-a="next">${fill.length ? t('nextFill') : t('nextHear')}</button></div>`;
  return h;
}
function pass2() {
  const q = fill[fi];
  let h = verseHtml(V, null, { mark: q.word }) + `<p style="margin-top:10px"><b>${t('fillQ')}</b> <span class="ar" style="font-size:22px">${esc(V.t[q.word])}</span></p><div style="margin-top:10px">`;
  h += q.opts.map((o, i) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="fill" data-i="${i}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + '</div>';
  if (q.chosen) h += `<p class="${q.chosen === q.right ? 'ok' : 'bad'}" style="margin-top:10px">${q.chosen === q.right ? t('correct') : t('wrong')}</p><div class="stackb"><button class="btn pri" data-a="next">${fi + 1 < fill.length ? t('nextFill') : t('nextHear')}</button></div>`;
  return h;
}
function pass3() {
  const c = check!;
  let h = `<p class="note">${t('noTextYet')}</p>` + player() + `<p style="margin-top:16px"><b>${t('hearQ')}</b></p><div style="margin-top:10px">`;
  h += c.opts.map((o, i) => `<button class="opt ${c.chosen ? (o === c.right ? 'right' : o === c.chosen ? 'wrong' : '') : ''}" data-a="check" data-i="${i}" ${c.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + `</div><p class="src" style="margin-top:6px">${trBy()}</p>`;
  if (c.chosen) {
    h += `<p class="${c.chosen === c.right ? 'ok' : 'bad'}" style="margin-top:10px">${c.chosen === c.right ? t('correct') : t('wrong')}</p>`;
    h += `<p style="margin-top:14px"><b>${t('selfQ')}</b></p><div class="chips" style="margin-top:8px">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
  }
  if (self >= 0) {
    const h0 = state.heard[`${sv.s}:${sv.v}`];
    h += `<div class="sec">${verseHtml(V, k)}<p class="tl">${esc(trText(V))}<small>${trBy()}</small></p><p class="note" style="margin-top:8px">${t('again3', { n: AGAIN[Math.min((h0?.n || 1) - 1, 3)] })}</p></div>`;
    h += `<div class="stackb"><button class="btn pri" data-a="another">${t('nextVerse')}</button><a class="btn quiet" href="${base()}">${t('finish')}</a></div>`;
  }
  return h;
}
function render() { $('#listen')!.innerHTML = header() + (pass === 1 ? pass1() : pass === 2 ? pass2() : pass3()); }

function finishVerse() {
  rollDay();
  const key = `${sv.s}:${sv.v}`, d = dayNum(), h = state.heard[key] || { n: 0, last: 0, due: 0, ok: 0, tot: 0 };
  if (h.last !== d) { h.n++; h.last = d; h.due = d + AGAIN[Math.min(h.n - 1, 3)]; state.day.heard++; }
  h.tot++; if (check!.chosen === check!.right) h.ok++;
  state.heard[key] = h; save();
}

document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); render(); return; }
  if (a === 'word' && pass === 1) sel = +b.dataset.i! === sel ? -1 : +b.dataset.i!;
  else if (a === 'tr') showTr = !showTr;
  else if (a === 'learn') { place(b.dataset.id!, false); save(); badge(); toast(t('added')); }
  else if (a === 'next') { if (pass === 1) pass = fill.length ? 2 : 3; else if (pass === 2) { if (fi + 1 < fill.length) fi++; else pass = 3; } }
  else if (a === 'fill') { const q = fill[fi]; q.chosen = q.opts[+b.dataset.i!]; }
  else if (a === 'check') { const c = check!; c.chosen = c.opts[+b.dataset.i!]; bump(3); if (c.chosen === c.right) bump(2); finishVerse(); }
  else if (a === 'self') { self = +b.dataset.v!; bump(4, self); bump(5); save(); }
  else if (a === 'another') { const n = await pickVerse(seen); await load(n.s, n.v); window.scrollTo(0, 0); }
  else return;
  render();
});

(async () => {
  const q = new URLSearchParams(location.search).get('v');
  if (q && /^\d+:\d+$/.test(q)) { const [s, v] = q.split(':').map(Number); await load(s, v); }
  else { const n = await pickVerse(); await load(n.s, n.v); }
  render();
})();
