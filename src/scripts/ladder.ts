// Listening ladder (Phase 3): passages of 2–4 verses and whole short surahs, text off first.
// Flow: context → listen without text (as often as you like, speed of your choice) → questions → how much did you follow →
// the text with word meanings → listen again with the text. Passages come back after 1, 3, 7, 14 days (narrow listening),
// and results are kept per passage. The predict-then-check order follows Vandergrift & Tafaghodtari 2010 (docs/research/learning.md).
import { state, save, bump, rollDay, MY_DEFAULT } from './store';
import { surah, surahs, vreq, items, type Verse, type Surah, type Item } from './data';
import { knownIdx, verseShare } from './coverage';
import { verseHtml, playAll, speedChips, setSpeed, reciterName } from './verse';
import { meaning, grammarLabel, personOf, PERSON_OPTIONS } from './cardview';
import { trText, trName, checkTr, similar } from './trans';
import { t, pick, lang, num } from './i18n';
import { $, base, esc, shuffle, dayNum } from './util';

export type Passage = { s: number; a: number; b: number };
const key = (p: Passage) => `P${p.s}:${p.a}-${p.b}`;
const AGAIN = [1, 3, 7, 14];
const SHORT = 8; // surahs with up to 8 verses are listened to whole

/** Passages from your surahs: short surahs whole, longer ones in runs of 3 verses. */
export async function passages() {
  const [ss, vr, k] = await Promise.all([surahs(), vreq(), knownIdx()]);
  const out: (Passage & { share: number; whole: boolean })[] = [];
  for (const n of state.my.length ? state.my : MY_DEFAULT) {
    const S = ss[n - 1], share = (a: number, b: number) => { let s = 0; for (let v = a; v <= b; v++) s += verseShare(vr[S.start + v - 1], k); return s / (b - a + 1); };
    if (S.ayas <= SHORT) out.push({ s: n, a: 1, b: S.ayas, share: share(1, S.ayas), whole: true });
    else for (let a = 1; a <= S.ayas; a += 3) { const b = Math.min(S.ayas, a + 2); out.push({ s: n, a, b, share: share(a, b), whole: false }); }
  }
  return out;
}

let P: Passage, S: Surah, vs: Verse[], all: Item[], k: Uint8Array;
let step: 'ctx' | 'listen' | 'q' | 'self' | 'text' = 'ctx', playing = 0, stop: (() => void) | null = null, heardAll = false, plays = 0;
type Q = { kind: 'said' | 'who'; prompt?: string; opts: string[]; right: string; chosen?: string };
let qs: Q[] = [], qi = 0, self = -1, sel: { v: number; i: number } | null = null;

async function buildQuestions() {
  const inP = vs.filter((v) => v.n >= P.a && v.n <= P.b), outP = vs.filter((v) => v.n < P.a || v.n > P.b);
  const pool = outP.length >= 4 ? outP : outP.concat(await surah(P.s < 114 ? P.s + 1 : P.s - 1));
  qs = [];
  for (const v of shuffle(inP).slice(0, Math.min(2, inP.length))) {
    const right = checkTr(v).text, opts = [right];
    const cands = [...new Set(pool.map((x) => checkTr(x).text).filter((x) => x && x !== right))].map((x) => ({ x, sim: similar(right, x) })).filter((c) => c.sim < 0.4).sort((a, b) => Math.abs(0.22 - a.sim) - Math.abs(0.22 - b.sim));
    for (const c of cands) { if (opts.length === 3) break; if (opts.every((o) => similar(o, c.x) < 0.4) && !inP.some((y) => checkTr(y).text === c.x)) opts.push(c.x); }
    if (opts.length === 3) qs.push({ kind: 'said', right, opts: shuffle(opts) });
  }
  const verbs = inP.flatMap((v) => v.w.map((w, i) => ({ v, i, p: personOf(w[4]) })).filter((x) => x.p));
  if (verbs.length) { const vb = verbs.find((x) => /^(1|2)/.test(x.v.w[x.i][4].split('|')[1])) || verbs[0]; qs.push({ kind: 'who', prompt: vb.v.t[vb.i], right: vb.p, opts: shuffle([vb.p, ...shuffle(PERSON_OPTIONS().filter((x) => x !== vb.p)).slice(0, 2)]) }); }
  qi = 0;
}

function ref() { return P.a === 1 && P.b === S.ayas ? `${esc(lang() === 'tr' ? S.tr : S.tname)} (${t('wholeSurah')})` : `${esc(lang() === 'tr' ? S.tr : S.tname)} ${P.s}:${P.a}–${P.b}`; }
function render() {
  let h = `<a class="back" href="${base()}listen/ladder/">‹ ${t('ladder')}</a><span class="eyebrow">${step === 'listen' || step === 'q' ? t('ladder') : ref()}</span>`;
  if (step === 'ctx') {
    const type = S.type === 'Meccan' ? t('meccan') : t('medinan');
    h += `<h1 class="h1">${t('beforeListen')}</h1><div class="card"><p><b>${esc(lang() === 'tr' ? `${S.tr}${S.trMean ? ` (${S.trMean})` : ''}` : `${S.tname} (${S.enMean || S.en})`)}</b> <span class="ar" style="font-size:22px">${esc(S.ar)}</span></p><p class="note">${type} · ${t('verses', { n: S.ayas })} · ${t('order', { n: S.order })}</p><p class="note">${t('ladderVerses', { a: P.a, b: P.b })}</p><p class="src">${t('ctxSrc')}</p></div>`;
    h += `<p class="sub sec">${t('ladderHow')}</p><div class="stackb"><button class="btn pri" data-a="go">${t('ladderStart')}</button></div>`;
  } else if (step === 'listen') {
    h += `<h1 class="h1">${t('p3')}</h1><p class="sub">${t('ladderListenSub')}</p>${speedChips()}<p class="note">${esc(t('reciter', { r: reciterName() }))}</p>`;
    h += `<div class="stackb"><button class="btn pri" data-a="play" style="min-height:60px">${stop ? t('stopAll') : plays ? t('playAgain') : t('playPassage')}</button></div>`;
    if (playing) h += `<p class="ok" style="margin-top:10px">▶ ${t('verseN', { n: playing })}</p>`;
    if (plays && !stop) h += `<div class="stackb"><button class="btn" data-a="toq">${t('toQuestions')}</button></div>`;
  } else if (step === 'q') {
    const q = qs[qi];
    h += `<h1 class="h1">${qi + 1} / ${qs.length}</h1><p><b>${q.kind === 'said' ? t('saidQ') : t('whoHeardQ')}</b>${q.prompt ? ` <span class="ar" style="font-size:24px">${esc(q.prompt)}</span>` : ''}</p><div style="margin-top:10px">`;
    h += q.opts.map((o, i) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="ans" data-i="${i}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + '</div>';
    if (q.kind === 'said') h += `<p class="src" style="margin-top:6px">${esc(trName(checkTrId()))} · Açık Kuran</p>`;
    if (q.chosen) h += `<p class="${q.chosen === q.right ? 'ok' : 'bad'}" style="margin-top:10px">${q.chosen === q.right ? t('correct') : t('wrong')}</p><div class="stackb"><button class="btn pri" data-a="nextq">${t('next')}</button></div>`;
  } else if (step === 'self') {
    const ok = qs.filter((q) => q.chosen === q.right).length;
    h += `<h1 class="h1">${t('ladderScore', { ok, n: qs.length })}</h1>${heardAll ? '' : `<p class="note">${t('gistPractice')}</p>`}<p style="margin-top:12px"><b>${t('selfQ')}</b></p><div class="chips" style="margin-top:8px">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
  } else {
    h += `<h1 class="h1">${t('ladderText')}</h1><p class="sub">${t('tapWord')}</p>`;
    for (const v of vs.filter((x) => x.n >= P.a && x.n <= P.b)) {
      if (v.b && v.bt) h += `<p class="q basmala" lang="ar">${esc(v.bt)}</p>`;
      h += `<div data-v="${v.n}" style="border-top:1px solid var(--rule);padding-top:6px;margin-top:8px">${verseHtml(v, k, { sel: sel?.v === v.n ? sel.i : undefined })}`;
      if (sel?.v === v.n) { const w = v.w[sel.i], gr = grammarLabel(w[4]); h += `<div class="gloss"><span class="ar">${esc(v.t[sel.i])}</span> <b>${esc(pick(w[1], w[2])) || '—'}</b>${gr ? `<div class="note">${esc(gr)}</div>` : ''}<div class="ref">${w[0].map((x) => `${esc(all[x].ar)} ${esc(meaning(all[x]))}`).join(' · ')}</div></div>`; }
      h += `<p class="tl">${esc(trText(v))}</p></div>`;
    }
    const hd = state.heard[key(P)];
    h += `<p class="src">${esc(trName())} · ${t('srcAk')}</p><p class="note" style="margin-top:8px">${t('again3', { n: AGAIN[Math.min((hd?.n || 1) - 1, 3)] })}</p>`;
    h += `<div class="stackb"><button class="btn" data-a="playtext">${stop ? t('stopAll') : t('playWithText')}</button><a class="btn pri" href="${base()}listen/ladder/">${t('ladderDone')}</a></div>`;
  }
  $('#ladder')!.innerHTML = h;
}
const checkTrId = () => { const v = vs.find((x) => x.n === P.a)!; return checkTr(v).id; };

function record() {
  rollDay();
  const kk = key(P), d = dayNum(), hd = state.heard[kk] || { n: 0, last: 0, due: 0, ok: 0, tot: 0 };
  if (hd.last !== d) { hd.n++; hd.last = d; hd.due = d + AGAIN[Math.min(hd.n - 1, 3)]; state.day.heard++; }
  if (heardAll) { const ok = qs.filter((q) => q.chosen === q.right).length; hd.ok += ok; hd.tot += qs.length; bump(3, qs.length); bump(2, ok); }
  state.heard[kk] = hd; save();
}

document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b || !$('#ladder')) return;
  const a = b.dataset.a!;
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); }
  else if (a === 'go') { step = 'listen'; await buildQuestions(); }
  else if (a === 'play' || a === 'playtext') {
    if (stop) { stop(); stop = null; playing = 0; }
    else { stop = playAll(P.s, P.a, P.b, (v) => { playing = v; render(); }, (ok) => { stop = null; playing = 0; if (ok && a === 'play') heardAll = true; if (a === 'play') plays++; render(); }); }
  }
  else if (a === 'toq') { if (stop) { stop(); stop = null; } step = qs.length ? 'q' : 'self'; }
  else if (a === 'ans') { const q = qs[qi]; if (!q.chosen) q.chosen = q.opts[+b.dataset.i!]; }
  else if (a === 'nextq') { if (qi + 1 < qs.length) qi++; else { step = 'self'; record(); } }
  else if (a === 'self') { const v = +b.dataset.v!; if (self < 0) { bump(4, v); bump(5); } else bump(4, v - self); self = v; save(); step = 'text'; }
  else if (a === 'word') { const v = +b.closest<HTMLElement>('[data-v]')!.dataset.v!, i = +b.dataset.i!; sel = sel && sel.v === v && sel.i === i ? null : { v, i }; }
  else return;
  render();
});

async function landing() {
  const [list, ss] = await Promise.all([passages(), surahs()]), t0 = dayNum();
  const due = list.filter((p) => { const hd = state.heard[key(p)]; return hd && hd.due <= t0; });
  const fresh = list.filter((p) => !state.heard[key(p)]).sort((x, y) => Number(y.whole) - Number(x.whole) || y.share - x.share);
  const row = (p: typeof list[number]) => { const S = ss[p.s - 1], hd = state.heard[key(p)]; return `<li><a href="?p=${p.s}:${p.a}-${p.b}"><span style="flex:1"><b>${esc(lang() === 'tr' ? S.tr : S.tname)} ${p.whole ? `(${t('wholeSurah')})` : `${p.s}:${p.a}–${p.b}`}</b><span class="note" style="display:block">${t('known', { p: num(p.share * 100) })}${hd ? ` · ${t('ladderResult', { ok: hd.ok, tot: hd.tot, n: hd.n })}` : ''}</span></span><span class="go">›</span></a></li>`; };
  let h = `<a class="back" href="${base()}listen/">‹ ${t('listen')}</a><h1 class="h1">${t('ladder')}</h1><p class="sub">${t('ladderSub')}</p>`;
  if (due.length) h += `<div class="sec"><div class="sh">${t('ladderDue')}</div><ul class="list">${due.map(row).join('')}</ul></div>`;
  h += `<div class="sec"><div class="sh">${t('ladderNew')}</div><ul class="list">${fresh.slice(0, 12).map(row).join('')}</ul></div>`;
  const done = list.filter((p) => state.heard[key(p)] && !due.includes(p));
  if (done.length) h += `<div class="sec"><div class="sh">${t('ladderHeard')}</div><ul class="list">${done.map(row).join('')}</ul></div>`;
  $('#ladder')!.innerHTML = h;
}

const q = new URLSearchParams(location.search).get('p');
if ($('#ladder')) {
  if (q && /^\d+:\d+-\d+$/.test(q)) {
    const [s, r] = q.split(':'); const [a, bb] = r.split('-').map(Number); P = { s: +s, a, b: bb };
    Promise.all([surahs(), surah(P.s), items(), knownIdx()]).then(([ss, v, it, kk]) => { S = ss[P.s - 1]; vs = v; all = it; k = kk; render(); });
  } else landing();
}
