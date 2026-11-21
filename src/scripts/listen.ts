// Listen: one verse, three passes (hear and see, choose meanings, hear only), ending with a listening check and a self-report.
// Changed after the Phase 1 review: per-verse texts in the check, no near-twin options, options only after the audio
// has played, no surah name or verse number during the check, and a check after reading the translation counts as practice.
import { state, save, bump, rollDay } from './store';
import { surah, surahs, items, type Verse, type Item, type Surah } from './data';
import { knownIdx, pickVerse, wordKnown } from './coverage';
import { place } from './srs';
import { verseHtml, playBtn, toggle, reciterName, speedChips, setSpeed } from './verse';
import { meaning, grammarLabel } from './cardview';
import { trText, trName, checkTr, similar } from './trans';
import { badge } from './chrome';
import { t, pick, lang } from './i18n';
import { $, base, esc, shuffle, dayNum, toast } from './util';

type Q = { word: number; opts: string[]; right: string; chosen?: string };
let S: Surah, V: Verse, all: Item[], k: Uint8Array, sv = { s: 1, v: 1 };
let pass = 1, sel = -1, showTr = false, readTr = false, ctxOpen = false, fill: Q[] = [], fi = 0, heard3 = false, audioFail = false;
let check: { opts: string[]; right: string; by: string; chosen?: string } | null = null, self = -1;
const seen = new Set<string>();
const AGAIN = [1, 3, 7, 14];
const place_ = (v: Verse, i: number) => pick(v.w[i][1], v.w[i][2]);

async function load(s: number, v: number) {
  sv = { s, v }; seen.add(`${s}:${v}`);
  [S, all, k] = await Promise.all([surahs().then((x) => x[s - 1]), items(), knownIdx()]);
  const ss = await surah(s); V = ss[v - 1];
  pass = 1; sel = -1; showTr = false; readTr = false; fi = 0; check = null; self = -1; heard3 = false; audioFail = false;
  // Choose meanings: up to 3 words that carry a dictionary form, preferring ones you are learning.
  // Options are meanings of other words in this surah that are clearly different (not near-twins).
  const pool = [...new Set(ss.flatMap((x) => x.w.map((w) => pick(w[1], w[2]))).filter(Boolean))];
  const cands = V.w.map((w, i) => ({ i, g: place_(V, i), learning: w[0].some((x) => state.r[all[x].id]), lemma: w[0].some((x) => all[x].k === 'l') })).filter((c) => c.g && c.lemma);
  fill = shuffle(cands).sort((a, b) => Number(b.learning) - Number(a.learning)).slice(0, Math.min(3, cands.length)).sort((a, b) => a.i - b.i).map((c) => {
    const others = shuffle(pool.filter((g) => g !== c.g && similar(g, c.g) < 0.34)).slice(0, 2);
    return { word: c.i, right: c.g, opts: shuffle([c.g, ...others]) };
  }).filter((q) => q.opts.length === 3);
  // Check: this verse's own text, and two clearly different texts from nearby verses.
  const mine = checkTr(V), seenTexts = [mine.text], others: string[] = [];
  const near = ss.filter((x) => x.n !== V.n).sort((a, b) => Math.abs(a.n - V.n) - Math.abs(b.n - V.n));
  const extra = await surah(s < 114 ? s + 1 : s - 1);
  for (const x of shuffle(near.slice(0, 12)).concat(shuffle(extra))) {
    const o = checkTr(x).text;
    if (!o || seenTexts.some((y) => y === o || similar(y, o) >= 0.4)) continue;
    others.push(o); seenTexts.push(o); if (others.length === 2) break;
  }
  check = { right: mine.text, by: trName(mine.id), opts: shuffle([mine.text, ...others]) };
}

function header() {
  const where = pass === 3 && self < 0 ? t('listen') : `${t('listen')} · ${esc(lang() === 'tr' ? S.tr : S.tname)} ${sv.s}:${sv.v}`;
  return `<span class="eyebrow">${where}</span><div class="passes">${[t('p1'), t('p2'), t('p3')].map((x, i) => `<span class="${i + 1 === pass ? 'on' : i + 1 < pass ? 'done' : ''}">${i + 1} · ${x}</span>`).join('')}</div>`;
}
function context() {
  const type = S.type === 'Meccan' ? t('meccan') : t('medinan');
  return `<details class="card" style="margin-bottom:12px" data-ctx ${ctxOpen ? 'open' : ''}><summary><b>${t('context')}</b>&nbsp;·&nbsp;<span class="ar" style="font-size:20px">${esc(S.ar)}</span></summary>
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
    const w = V.w[sel], gr = grammarLabel(w[4]);
    h += `<div class="gloss" aria-live="polite"><span class="ar" lang="ar">${esc(V.t[sel])}</span> &nbsp;<b>${esc(place_(V, sel)) || '—'}</b>${gr ? `<div class="note">${esc(gr)}</div>` : ''}<div class="ref">${t('meaningHere')} · ${t('srcAk')}</div>`;
    for (const x of w[0]) { const it = all[x]; h += `<div class="row" style="margin-top:6px;flex-wrap:wrap"><a href="${base()}words/?id=${encodeURIComponent(it.id)}" class="ar wlink">${esc(it.ar)}</a><span class="note">${esc(meaning(it))} · ${t('rank', { r: it.r })}</span>${k[x] ? `<span class="tag known">${t('knownWord')}</span>` : state.r[it.id] ? '' : `<button class="btn quiet" data-a="learn" data-id="${esc(it.id)}">${t('addWord')}</button>`}</div>`; }
    h += '</div>';
  }
  h += player();
  h += `<div class="stackb"><button class="btn quiet" data-a="tr">${showTr ? t('hideTr') : t('showTr')}</button></div>`;
  if (showTr) h += `<p class="tl" style="margin-top:12px">${esc(trText(V))}<small>${esc(trName())} · Açık Kuran</small></p>`;
  h += `<div class="stackb"><button class="btn pri" data-a="next">${fill.length ? t('nextFill') : t('nextHear')}</button></div>`;
  return h;
}
function pass2() {
  const q = fill[fi];
  let h = verseHtml(V, null, { mark: q.word }) + `<p style="margin-top:10px"><b>${t('fillQ')}</b> <span class="ar" style="font-size:22px">${esc(V.t[q.word])}</span></p><div style="margin-top:10px">`;
  h += q.opts.map((o, i) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="fill" data-i="${i}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + '</div>';
  if (q.chosen) { const gr = grammarLabel(V.w[q.word][4]); h += `<p class="${q.chosen === q.right ? 'ok' : 'bad'}" style="margin-top:10px">${q.chosen === q.right ? t('correct') : t('wrong')}${gr ? ` <span class="note">(${esc(gr)})</span>` : ''}</p><div class="stackb"><button class="btn pri" data-a="next">${fi + 1 < fill.length ? t('nextFill') : t('nextHear')}</button></div>`; }
  return h;
}
function pass3() {
  const c = check!;
  let h = `<p class="note">${t('noTextYet')}</p>` + player();
  if (!heard3 && !audioFail) return h + `<p class="note" style="margin-top:14px">${t('playFirst')}</p>`;
  if (audioFail && !heard3) h += `<p class="bad" style="margin-top:10px">${t('audioFail')}</p>`;
  h += `<p style="margin-top:16px"><b>${t('hearQ')}</b></p><div style="margin-top:10px">`;
  h += c.opts.map((o, i) => `<button class="opt ${c.chosen ? (o === c.right ? 'right' : o === c.chosen ? 'wrong' : '') : ''}" data-a="check" data-i="${i}" ${c.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + `</div><p class="src" style="margin-top:6px">${esc(c.by)} · Açık Kuran</p>`;
  if (c.chosen) {
    h += `<p class="${c.chosen === c.right ? 'ok' : 'bad'}" style="margin-top:10px">${c.chosen === c.right ? t('correct') : t('wrong')}</p>`;
    if (readTr) h += `<p class="note">${t('practiceOnly')}</p>`;
    h += `<p style="margin-top:14px"><b>${t('selfQ')}</b></p><div class="chips" style="margin-top:8px">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
  }
  if (self >= 0) {
    const h0 = state.heard[`${sv.s}:${sv.v}`];
    h += `<div class="sec">${verseHtml(V, k)}<p class="tl">${esc(trText(V))}<small>${esc(trName())} · Açık Kuran</small></p><p class="note" style="margin-top:8px">${t('again3', { n: AGAIN[Math.min((h0?.n || 1) - 1, 3)] })}</p></div>`;
    h += `<div class="stackb"><button class="btn pri" data-a="another">${t('nextVerse')}</button><a class="btn quiet" href="${base()}">${t('finish')}</a></div>`;
  }
  return h;
}
function render() { $('#listen')!.innerHTML = header() + (pass === 1 ? pass1() : pass === 2 ? pass2() : pass3()); }

function finishVerse(ok: boolean) {
  rollDay();
  const key = `${sv.s}:${sv.v}`, d = dayNum(), h = state.heard[key] || { n: 0, last: 0, due: 0, ok: 0, tot: 0 };
  if (h.last !== d) { h.n++; h.last = d; h.due = d + AGAIN[Math.min(h.n - 1, 3)]; state.day.heard++; }
  if (!readTr && heard3) { h.tot++; if (ok) h.ok++; bump(3); if (ok) bump(2); }
  state.heard[key] = h; save();
}

document.addEventListener('audioended', () => { if (pass === 3 && !heard3) { heard3 = true; render(); } });
document.addEventListener('audioerror', () => { if (pass === 3 && !heard3) { audioFail = true; render(); } });
document.addEventListener('toggle', (e) => { if ((e.target as HTMLElement).matches?.('[data-ctx]')) ctxOpen = (e.target as HTMLDetailsElement).open; }, true);
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); render(); return; }
  if (a === 'word' && pass === 1) sel = +b.dataset.i! === sel ? -1 : +b.dataset.i!;
  else if (a === 'tr') { showTr = !showTr; if (showTr) readTr = true; }
  else if (a === 'learn') { place(b.dataset.id!, false); save(); badge(); toast(t('added')); }
  else if (a === 'next') { if (pass === 1) pass = fill.length ? 2 : 3; else if (pass === 2) { if (fi + 1 < fill.length) fi++; else pass = 3; } }
  else if (a === 'fill') { const q = fill[fi]; q.chosen = q.opts[+b.dataset.i!]; }
  else if (a === 'check') { const c = check!; if (c.chosen) return; c.chosen = c.opts[+b.dataset.i!]; finishVerse(c.chosen === c.right); }
  else if (a === 'self') { const v = +b.dataset.v!; if (self < 0) { bump(4, v); bump(5); } else bump(4, v - self); self = v; save(); }
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
