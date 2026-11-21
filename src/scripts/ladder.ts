// Listening ladder (Phase 3): passages of 2–4 verses and whole short surahs, text off first.
// Flow: context → listen without text (as often as you like, speed of your choice) → questions → how much did you follow →
// the text with word meanings → listen again with the text. Passages come back after 1, 3, 7, 14 days (narrow listening),
// and results are kept per passage. The predict-then-check order follows Vandergrift & Tafaghodtari 2010 (docs/research/learning.md).
import { state, save, bump, rollDay, MY_DEFAULT } from './store';
import { surah, surahs, vreq, items, type Verse, type Surah, type Item } from './data';
import { knownIdx, verseShare } from './coverage';
import { verseHtml, playAll, speedChips, setSpeed, reciterName, toggle } from './verse';
import { personOf, PERSON_OPTIONS, isFirstSecond } from './cardview';
import { trText, trName, checkSet, similar, rangeOnce } from './trans';
import { openWordSheet } from './sheet';
import { passagesOf, markFollow } from './units';
import { playBtn } from './verse';
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
    // Middle step (Phase 3 review): every surah is split into passages of 2–3 verses; short surahs can also be heard whole.
    // Passages never cross a section boundary (Tanzil metadata, Phase 4).
    const vsN = await surah(n), starts = vsN.filter((v) => v.ruku).map((v) => v.n).concat(S.ayas + 1);
    for (let si = 0; si + 1 < starts.length; si++) {
      const A = starts[si], B = starts[si + 1] - 1, len = B - A + 1, parts = Math.max(1, Math.round(len / 3)), size = len / parts;
      for (let i = 0; i < parts; i++) { const a = A + Math.round(i * size), b = A + Math.round((i + 1) * size) - 1; if (b - a + 1 < S.ayas || S.ayas <= 3) out.push({ s: n, a, b, share: share(a, b), whole: false }); }
    }
    if (S.ayas <= SHORT && S.ayas > 3) out.push({ s: n, a: 1, b: S.ayas, share: share(1, S.ayas), whole: true });
  }
  return out;
}

let P: Passage, S: Surah, vs: Verse[], all: Item[], k: Uint8Array;
let step: 'ctx' | 'listen' | 'self' | 'q' | 'score' | 'text' = 'ctx', playing = 0, stop: (() => void) | null = null, heardAll = false, plays = 0;
type Q = { kind: 'said' | 'after' | 'who'; prompt?: string; verse?: number; by?: string; opts: string[]; right: string; chosen?: string; heard?: boolean };
let qs: Q[] = [], qi = 0, self = -1, sel: { v: number; i: number } | null = null;

async function buildQuestions() {
  // Wrong options only from the same surah (Phase 3 review: other surahs were given away by the surah name).
  const inP = vs.filter((v) => v.n >= P.a && v.n <= P.b), outP = vs.filter((v) => v.n < P.a || v.n > P.b);
  const names = [S.tr, S.tname, S.trMean || '', S.enMean || ''].filter((x) => x && x.length > 3).map((x) => x.toLocaleLowerCase());
  const named = (x: string) => names.some((nm) => x.toLocaleLowerCase().includes(nm));
  qs = [];
  const whole = P.a === 1 && P.b === S.ayas;
  if (!whole && outP.length >= 2) {
    for (const v of shuffle(inP).slice(0, Math.min(2, inP.length))) {
      const set = checkSet([v, ...outP]), right = set.texts[0];
      if (named(right)) continue;
      const cands = set.texts.slice(1).map((x) => ({ x, sim: similar(right, x) })).filter((c) => c.x && c.x !== right && c.sim < 0.4 && !named(c.x)).sort((a, b) => Math.abs(0.22 - a.sim) - Math.abs(0.22 - b.sim));
      const opts = [right]; for (const c of cands) { if (opts.length === 3) break; if (!opts.includes(c.x) && opts.every((o) => similar(o, c.x) < 0.4)) opts.push(c.x); }
      if (opts.length === 3) qs.push({ kind: 'said', right, by: trName(set.id), opts: shuffle(opts) });
    }
  } else if (inP.length >= 3 || (whole && inP.length >= 2)) {
    // Whole surah (or a passage with no verses outside it): "what came right after …?" — sequence, same surah only.
    const set = checkSet(inP), texts = set.texts;
    for (const i of shuffle([...Array(inP.length - 1).keys()]).slice(0, 2)) {
      const right = texts[i + 1];
      if (texts.filter((x) => x === texts[i]).length > 1 || texts.filter((x) => x === right).length > 1) continue; // repeated verses (e.g. 109:3 = 109:5) are not fair
      const others = [...new Set(shuffle(texts.filter((x, j) => j !== i && j !== i + 1 && x !== right)))].slice(0, 2);
      if (others.length >= 1) qs.push({ kind: 'after', prompt: texts[i], right, by: trName(set.id), opts: shuffle([right, ...others]) });
    }
  }
  // Who: one verse, played again on its own, no text shown; commands (قُلْ) are skipped because they are always "you".
  const verbs = inP.flatMap((v) => v.w.map((w, i) => ({ v, i, p: personOf(w[4]), asp: w[4].split('|')[0] })).filter((x) => x.p && x.asp !== 'IMPV' && isFirstSecond(x.v.w[x.i][4])));
  if (verbs.length) { const vb = shuffle(verbs)[0]; qs.push({ kind: 'who', verse: vb.v.n, right: vb.p, opts: shuffle([vb.p, ...shuffle(PERSON_OPTIONS().filter((x) => x !== vb.p)).slice(0, 2)]) }); }
  qi = 0;
}

function ref() { return P.a === 1 && P.b === S.ayas ? `${esc(lang() === 'tr' ? S.tr : S.tname)} (${t('wholeSurah')})` : `${esc(lang() === 'tr' ? S.tr : S.tname)} ${P.s}:${P.a}–${P.b}`; }
function render() {
  let h = `<a class="back" href="${unitParam ? `${base()}unit/?s=${P.s}` : `${base()}listen/ladder/`}">‹ ${unitParam ? t('backUnit') : t('ladder')}</a><span class="eyebrow">${step === 'listen' || step === 'q' ? t('ladder') : ref()}</span>`;
  if (step === 'ctx') {
    const type = S.type === 'Meccan' ? t('meccan') : t('medinan');
    h += `<h1 class="h1">${t('beforeListen')}</h1><div class="card"><p><b>${esc(lang() === 'tr' ? `${S.tr}${S.trMean ? ` (${S.trMean})` : ''}` : `${S.tname} (${S.enMean || S.en})`)}</b> <span class="ar" style="font-size:22px">${esc(S.ar)}</span></p><p class="note">${type} · ${t('verses', { n: S.ayas })} · ${t('order', { n: S.order })}</p><p class="note">${t('ladderVerses', { a: P.a, b: P.b })}</p><p class="src">${t('ctxSrc')}</p></div>`;
    h += `<p class="sub sec">${t('ladderHow')}</p><div class="stackb"><button class="btn pri" data-a="go">${t('ladderStart')}</button></div>`;
  } else if (step === 'listen') {
    h += `<h1 class="h1">${t('p3')}</h1><p class="sub">${t('ladderListenSub')}</p>${speedChips()}<p class="note">${esc(t('reciter', { r: reciterName() }))}</p>`;
    h += `<div class="stackb"><button class="btn pri" data-a="play" style="min-height:60px">${stop ? t('stopAll') : plays ? t('playAgain') : t('playPassage')}</button></div>`;
    if (playing) h += `<p class="ok" style="margin-top:10px">▶ ${t('verseN', { n: playing })}</p>`;
    if (plays && !stop) h += `<div class="stackb"><button class="btn" data-a="toself">${t('toQuestions')}</button></div>`;
  } else if (step === 'self') {
    // Asked before any score is shown (Phase 3 review), so it can be compared honestly with the checks.
    h += `<p style="margin-top:12px"><b>${t('selfQ')}</b></p><div class="chips" style="margin-top:8px">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
  } else if (step === 'q') {
    const q = qs[qi];
    h += `<h1 class="h1">${qi + 1} / ${qs.length}</h1>`;
    if (q.kind === 'said') h += `<p><b>${t('saidQ')}</b></p>`;
    else if (q.kind === 'after') h += `<p><b>${t('afterQ')}</b></p><p class="tl" style="margin:6px 0 4px">“${esc(q.prompt!)}”</p>`;
    else { h += `<p><b>${t('whoVerseQ', { n: q.verse! })}</b></p><div class="player">${playBtn(P.s, q.verse!, t('play'))}</div>`; if (!q.heard) { $('#ladder')!.innerHTML = h + `<p class="note" style="margin-top:10px">${t('playFirst')}</p>`; return; } }
    h += '<div style="margin-top:10px">' + q.opts.map((o, i) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="ans" data-i="${i}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('') + '</div>';
    if (q.by) h += `<p class="src" style="margin-top:6px">${esc(q.by)} · Açık Kuran</p>`;
    if (q.chosen) h += `<p class="${q.chosen === q.right ? 'ok' : 'bad'}" style="margin-top:10px">${q.chosen === q.right ? t('correct') : t('wrong')}</p><div class="stackb"><button class="btn pri" data-a="nextq">${t('next')}</button></div>`;
  } else if (step === 'score') {
    const ok = qs.filter((q) => q.chosen === q.right).length, share = qs.length ? ok / qs.length : 0;
    const gap = self >= 2 && share < 0.5 ? t('selfHigh') : self <= 1 && share >= 0.67 && qs.length ? t('selfLow') : '';
    h += `<h1 class="h1">${t('ladderScore', { ok, n: qs.length })}</h1>${heardAll ? '' : `<p class="note">${t('gistPractice')}</p>`}${gap ? `<p class="sec">${gap}</p>` : ''}<div class="stackb"><button class="btn pri" data-a="totext">${t('ladderText')}</button></div>`;
  } else {
    h += `<h1 class="h1">${t('ladderText')}</h1><p class="sub">${t('tapWord')}</p>`;
    const inP = vs.filter((x) => x.n >= P.a && x.n <= P.b), once = rangeOnce(inP);
    for (const v of inP) {
      if (v.b && v.bt) h += `<p class="q basmala" lang="ar">${esc(v.bt)}</p>`;
      h += `<div data-v="${v.n}" style="border-top:1px solid var(--rule);padding-top:6px;margin-top:8px">${verseHtml(v, k, { sel: sel?.v === v.n ? sel.i : undefined })}`;
      h += once.has(v.n) ? `<p class="tl">${esc(once.get(v.n)!)}</p></div>` : '</div>';
    }
    const hd = state.heard[key(P)];
    h += `<p class="src">${esc(trName())} · ${t('srcAk')}</p><p class="note" style="margin-top:8px">${t('againP', { n: AGAIN[Math.min((hd?.n || 1) - 1, 3)] })}</p>`;
    h += `<div class="stackb"><button class="btn" data-a="playtext">${stop ? t('stopAll') : t('playWithText')}</button><a class="btn pri" href="${unitParam ? `${base()}unit/?s=${P.s}` : `${base()}listen/ladder/`}">${unitParam ? t('backUnit') : t('ladderDone')}</a></div>`;
  }
  $('#ladder')!.innerHTML = h;
}

const unitParam = new URLSearchParams(location.search).get('unit');
function record() {
  rollDay();
  const kk = key(P), d = dayNum(), hd = state.heard[kk] || { n: 0, last: 0, due: 0, ok: 0, tot: 0 };
  if (hd.last !== d) { hd.n++; hd.last = d; hd.due = d + AGAIN[Math.min(hd.n - 1, 3)]; state.day.hp = (state.day.hp || 0) + 1; }
  // Counted only when the passage was heard to the end without the text; the who-question only after its verse was played.
  const counted = qs.filter((q) => heardAll && (q.kind !== 'who' || q.heard)), ok = counted.filter((q) => q.chosen === q.right).length;
  if (counted.length) { hd.ok += ok; hd.tot += counted.length; bump(3, counted.length); bump(2, ok); }
  (hd as typeof hd & { self?: number }).self = self;
  state.heard[kk] = hd;
  // Follow step: the whole surah heard to the end without the text, with at least 2 of 3 answers right.
  if (P.a === 1 && P.b === S.ayas && heardAll && counted.length && ok / counted.length >= 2 / 3) markFollow(P.s);
  save();
}

document.addEventListener('audioended', () => { if (step === 'q' && qs[qi]?.kind === 'who') { qs[qi].heard = true; render(); } });
document.addEventListener('audioerror', () => { if (step === 'q' && qs[qi]?.kind === 'who') { qs[qi].heard = true; render(); } });
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b || !$('#ladder')) return;
  const a = b.dataset.a!;
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); }
  else if (b.dataset.a === 'play' && step === 'q' && b.classList.contains('play')) { toggle(b); return; }
  else if (a === 'go') { step = 'listen'; await buildQuestions(); }
  else if (a === 'play' || a === 'playtext') {
    if (stop) { stop(); stop = null; playing = 0; }
    else { stop = playAll(P.s, P.a, P.b, (v) => { playing = v; render(); }, (ok) => { stop = null; playing = 0; if (ok && a === 'play') heardAll = true; if (a === 'play') plays++; render(); }); }
  }
  else if (a === 'toself') { if (stop) { stop(); stop = null; } step = 'self'; }
  else if (a === 'self') { const v = +b.dataset.v!; if (self < 0) { bump(4, v); bump(5); } else bump(4, v - self); self = v; save(); step = qs.length ? 'q' : 'score'; if (!qs.length) record(); }
  else if (a === 'ans') { const q = qs[qi]; if (!q.chosen) q.chosen = q.opts[+b.dataset.i!]; }
  else if (a === 'nextq') { if (qi + 1 < qs.length) qi++; else { step = 'score'; record(); } }
  else if (a === 'totext') step = 'text';
  else if (a === 'word') { const v = +b.closest<HTMLElement>('[data-v]')!.dataset.v!, i = +b.dataset.i!; sel = { v, i }; openWordSheet(P.s, v, i); return; }
  else return;
  render();
});

async function landing() {
  const un = Number(unitParam) || 0;
  const [list, ss] = await Promise.all([un ? passagesOf(un).then((l) => l.filter((p) => !p.whole)) : passages(), surahs()]), t0 = dayNum();
  const due = list.filter((p) => { const hd = state.heard[key(p)]; return hd && hd.due <= t0; });
  const fresh = list.filter((p) => !state.heard[key(p)]).sort((x, y) => Number(x.whole) - Number(y.whole) || y.share - x.share);
  const row = (p: typeof list[number]) => { const S = ss[p.s - 1], hd = state.heard[key(p)]; return `<li><a href="?p=${p.s}:${p.a}-${p.b}${unitParam ? '&unit=1' : ''}"><span style="flex:1"><b>${esc(lang() === 'tr' ? S.tr : S.tname)} ${p.whole ? `(${t('wholeSurah')})` : `${p.s}:${p.a}–${p.b}`}</b><span class="note" style="display:block">${t('known', { p: num(p.share * 100) })}${hd ? ` · ${t('ladderResult', { ok: hd.ok, tot: hd.tot, n: hd.n })}${(hd as { self?: number }).self != null ? ` · ${t('youSaid', { s: [t('none'), t('some'), t('most'), t('all')][(hd as { self?: number }).self!] })}` : ''}` : ''}</span></span><span class="go">›</span></a></li>`; };
  let h = un ? `<a class="back" href="${base()}unit/?s=${un}">‹ ${t('backUnit')}</a><h1 class="h1">${esc(lang() === 'tr' ? ss[un - 1].tr : ss[un - 1].tname)} · ${t('st_listen')}</h1><p class="sub">${t('ladderSub')}</p>` : `<a class="back" href="${base()}surahs/">‹ ${t('quran')}</a><h1 class="h1">${t('ladder')}</h1><p class="sub">${t('ladderSub')}</p>`;
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
