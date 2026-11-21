// The daily lesson (v3, after Umut's feedback on round 2): one verse, a few new words, always in one surah.
// Teach first, then practise by choosing (no self-grading), then hear it without the text, then a short review
// of words taught on earlier days. One "Next" button leads the way; the header always says where you are.
import { state, save, rollDay, bump } from './store';
import { surah, surahs, items, type Verse, type Item, type Surah } from './data';
import { verseHtml, playBtn, toggle, reciterName, speedChips, setSpeed } from './verse';
import { meaning, grammarLabel } from './cardview';
import { trText, trName } from './trans';
import { openWordSheet } from './sheet';
import { t, lang, quizGloss, stemKey } from './i18n';
import { $, base, esc, shuffle, dayNum, ICON_PLAY } from './util';
import { similar } from './trans';
import { INTERVALS } from './srs';

/** The course: Al-Fatiha, then the short surahs most often recited, then the rest of Juz 30 from shortest. */
const FIRST = [1, 112, 113, 114, 108, 103, 110, 106, 105, 107, 109, 111, 102, 104, 101, 100, 99, 97, 95, 94, 93];
export async function course() { const ss = await surahs(); return [...FIRST, ...ss.filter((s) => s.n >= 78 && !FIRST.includes(s.n)).sort((a, b) => a.ayas - b.ayas).map((s) => s.n)]; }
export const MAX_NEW = 5;
const tokKey = (s: number, v: number, i: number) => `t:${s}:${v}:${i}`;
const lemmaOf = (w: Verse['w'][number], all: Item[]) => w[0].map((x) => all[x]).find((x) => x.k === 'l') || all[w[0][0]];

/** Words of a verse that would be taught: have a usable Turkish/English meaning here and their dictionary form is not met yet. */
function newWords(V: Verse, all: Item[]) {
  const seen = new Set<string>(), out: number[] = [];
  V.w.forEach((w, i) => { if (!w[0].length || !quizGloss(w)) return; const l = lemmaOf(w, all); if (!l || state.met[l.id] || seen.has(l.id)) return; seen.add(l.id); out.push(i); });
  return out;
}
export async function nextLesson() {
  const all = await items();
  for (const s of await course()) {
    const vs = await surah(s);
    for (const V of vs) { if (state.lv[`${s}:${V.n}`]) continue; const nw = newWords(V, all); return { s, v: V.n, teach: nw.slice(0, MAX_NEW), more: nw.length > MAX_NEW }; }
  }
  return null;
}
export const lessonsDays = () => Object.keys(state.lessonDays).length;
export const doneToday = () => !!state.lessonDays[dayNum()];
export const learnedCount = () => Object.keys(state.met).length;

// ---------- the lesson page ----------
type Q = { key: string; s: number; v: number; i: number; opts: string[]; right: string; chosen?: string; tries: number; item: string };
let S: Surah, V: Verse, vs: Verse[], all: Item[], teach: number[] = [], more = false;
let step: 'hear' | 'word' | 'practice' | 'ear' | 'review' | 'done' = 'hear', wi = 0, pq: Q[] = [], rq: Q[] = [], qi = 0, earHeard = false, earShown = false, self = -1, reviewOnly = false, right = 0;
const STEPS: ('hear' | 'word' | 'practice' | 'ear' | 'review')[] = ['hear', 'word', 'practice', 'ear', 'review'];

function optionsFor(right: string, pool: string[]) {
  const k = stemKey(right), out = [right], seen = new Set([k]);
  for (const g of shuffle(pool)) { const gk = stemKey(g); if (!g || seen.has(gk) || similar(g, right) >= 0.34) continue; seen.add(gk); out.push(g); if (out.length === 3) break; }
  return shuffle(out);
}
async function surahPool(s: number) { return [...new Set((await surah(s)).flatMap((x) => x.w.map((w) => quizGloss(w))).filter(Boolean))]; }

async function buildReview() {
  const t0 = dayNum(), due = Object.entries(state.r).filter(([k, r]) => k.startsWith('t:') && r.due <= t0 && (r.f ?? 0) < t0).sort((a, b) => a[1].due - b[1].due).slice(0, 8);
  rq = [];
  for (const [key] of due) {
    const [, s, v, i] = key.split(':').map(Number), sv = (await surah(s))[v - 1], w = sv.w[i], g = quizGloss(w);
    if (!g) continue;
    rq.push({ key, s, v, i, right: g, opts: optionsFor(g, await surahPool(s)), tries: 0, item: lemmaOf(w, all).id });
  }
}

const header = () => {
  const label = reviewOnly ? t('lsReviewTitle') : `${esc(lang() === 'tr' ? S.tr : S.tname)} · ${t('lsVerse', { v: V.n, n: S.ayas })}${more ? ` · ${t('lsPart')}` : ''}`;
  const steps = reviewOnly ? '' : `<ol class="lsteps" aria-label="${t('lsProgress')}">${STEPS.map((x) => `<li class="${STEPS.indexOf(x) < STEPS.indexOf(step as typeof STEPS[number]) || step === 'done' ? 'done' : x === step ? 'now' : ''}"><i></i><span>${t(('ls_' + x) as 'ls_hear')}</span></li>`).join('')}</ol>`;
  return `<div class="lhead"><a class="back" href="${base()}">✕ <span class="sr">${t('close')}</span></a><span class="eyebrow">${label}</span></div>${steps}`;
};
const player = (s = V.n) => `<div class="player">${playBtn(S.n, s, t('play'))}<div style="flex:1">${speedChips()}<p class="note" style="margin:4px 0 0">${esc(t('reciter', { r: reciterName() }))}</p></div></div>`;
const nextBtn = (label = t('lsNext'), dis = false) => `<div class="stackb dock"><button class="btn pri big" data-a="next" ${dis ? 'disabled' : ''}>${label}</button></div>`;
const known = (i: number) => { const l = lemmaOf(V.w[i], all); return !!l && !!state.met[l.id]; };
const verseView = (opts: { mark?: number } = {}) => { const k = new Uint8Array(all.length); V.w.forEach((w, i) => { if (known(i)) for (const x of w[0]) k[x] = 1; }); return `<div class="page">${V.b && V.bt ? `<p class="q basmala" lang="ar">${esc(V.bt)}</p>` : ''}${verseHtml(V, k, opts)}</div>`; };

function render() {
  let h = header();
  if (step === 'hear') {
    h += `<h1 class="h2">${t('lsHearT')}</h1><p class="sub">${t('lsHearS')}</p>${verseView()}<p class="tl">${esc(trText(V))}<small>${esc(trName())} · Açık Kuran</small></p>${player()}`;
    h += `<p class="note sec">${teach.length ? t('lsHearNext', { n: teach.length }) : t('lsHearNone')}</p>` + nextBtn();
  } else if (step === 'word') {
    const i = teach[wi], w = V.w[i], l = lemmaOf(w, all), parts = w[0].map((x) => all[x]).filter((x) => x.k !== 'l'), gr = grammarLabel(w[4]);
    h += `<p class="eyebrow">${t('lsWordN', { k: wi + 1, n: teach.length })}</p><div class="wcard"><div class="wcard-ar" lang="ar">${esc(V.t[i])}</div><p class="wcard-mean">${esc(quizGloss(w))}</p>${gr ? `<p class="note">${esc(gr)}</p>` : ''}`;
    if (parts.length) h += `<p class="note">${t('lsParts')}: ${parts.map((x) => `<span class="ar" style="font-size:19px">${esc(x.ar.split(' · ')[0])}</span> ${esc(meaning(x).split(/,| \(/)[0])}`).join(' · ')}</p>`;
    if (l && l.k === 'l') h += `<p class="note">${t('lsDict')}: <span class="ar" style="font-size:19px">${esc(l.ar)}</span> · ${t('times', { n: l.n })}</p>`;
    h += `<p class="src">${t('srcAk')}</p></div><p class="note" style="margin-top:12px">${t('lsWhere')}</p>${verseView({ mark: i })}${player()}`;
    h += `<div class="stackb"><button class="linkbtn" data-a="sheet" data-i="${i}">${t('lsMoreAbout')}</button></div>` + nextBtn(wi + 1 < teach.length ? t('lsNextWord') : t('lsToPractice'));
  } else if (step === 'practice' || step === 'review') {
    const qs = step === 'practice' ? pq : rq, q = qs[qi], qv = q.s === S?.n ? (vs[q.v - 1]) : null;
    h += `<p class="eyebrow">${step === 'practice' ? t('lsPracticeN', { k: Math.min(qi + 1, qs.length), n: qs.length }) : t('lsReviewN', { k: Math.min(qi + 1, qs.length), n: qs.length })}</p>`;
    h += `<p class="sub">${t('lsChoose')}</p><div class="wcard"><div class="wcard-ar" lang="ar">${esc((qv || reviewVerses.get(q.key)!).t[q.i])}</div></div>`;
    h += `<div style="margin-top:12px">${q.opts.map((o, k) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="ans" data-k="${k}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
    if (q.chosen) {
      const ok = q.chosen === q.right, rv = qv || reviewVerses.get(q.key)!;
      h += `<p class="${ok ? 'ok' : 'bad'}" style="margin-top:10px"><b>${ok ? t('correct') : step === 'review' ? t('lsWrongReview') : t('lsWrongSoft')}</b></p><div class="mini">${verseHtml(rv, null, { mark: q.i })}<p class="ref">${q.s}:${q.v}</p></div>`;
      h += nextBtn(qi + 1 < qs.length ? t('lsNext') : step === 'practice' ? t('lsToEar') : t('lsFinish'));
    }
  } else if (step === 'ear') {
    h += `<h1 class="h2">${t('lsEarT')}</h1><p class="sub">${t('lsEarS')}</p>${player()}`;
    if (!earHeard) h += `<p class="note">${t('playFirst')}</p>`;
    else if (!earShown) h += `<div class="stackb dock"><button class="btn pri big" data-a="reveal">${t('lsReveal')}</button></div>`;
    else {
      h += `${verseView()}<p class="tl">${esc(trText(V))}<small>${esc(trName())}</small></p><p style="margin-top:12px"><b>${t('selfQ')}</b></p><div class="chips">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
      if (self >= 0) h += nextBtn(rq.length ? t('lsToReview', { n: rq.length }) : t('lsFinish'));
    }
  } else {
    h += `<div class="done-box"><p class="big-ok">✓</p><h1 class="h1">${reviewOnly ? t('lsReviewDone') : t('lsDoneT')}</h1><p class="sub">${reviewOnly ? t('lsReviewDoneS', { k: right, n: rq.length }) : teach.length ? t('lsDoneS', { n: teach.length }) : t('lsDoneS0')}</p>${reviewOnly ? '' : verseView()}</div><div class="stackb"><a class="btn pri big" href="${base()}">${t('lsHome')}</a></div>`;
  }
  $('#lesson')!.innerHTML = h;
  window.scrollTo(0, 0);
}
const reviewVerses = new Map<string, Verse>();

async function finishLesson() {
  rollDay();
  const t0 = dayNum();
  for (const i of teach) {
    const key = tokKey(S.n, V.n, i), l = lemmaOf(V.w[i], all);
    if (!state.r[key]) state.r[key] = { b: 0, due: t0 + 1, n: 1, m: 0, f: t0 };
    if (l) state.met[l.id] ||= t0;
  }
  if (!more) state.lv[`${S.n}:${V.n}`] = t0;
  state.lessonDays[t0] = (state.lessonDays[t0] || 0) + 1;
  save();
}
function answerReview(q: Q, ok: boolean) {
  const t0 = dayNum(), r = state.r[q.key];
  if (r) { const b = ok ? Math.min(INTERVALS.length - 1, r.b + 1) : 0; state.r[q.key] = { ...r, b, due: t0 + (ok ? INTERVALS[b] : 1), n: r.n + 1, m: (r.m || 0) + (ok ? 0 : 1), ...(ok && (r.f ?? t0) < t0 ? { c: 1 as const } : {}) }; }
  // The dictionary form counts as known once a word with it is recalled on a later day (used by the progress numbers).
  const li = state.r[q.item];
  if (ok) state.r[q.item] = { b: Math.max(1, li?.b || 0), due: t0 + 2, n: (li?.n || 0) + 1, f: li?.f ?? (state.met[q.item] || t0), ...((li?.f ?? state.met[q.item] ?? t0) < t0 ? { c: 1 as const } : {}) };
  bump(0); if (!ok) bump(1); save();
}

document.addEventListener('audioended', () => { if (step === 'ear' && !earHeard) { earHeard = true; render(); } });
document.addEventListener('audioerror', () => { if (step === 'ear' && !earHeard) { earHeard = true; render(); } });
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b || !$('#lesson')) return;
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); render(); return; }
  if (a === 'word' && S) { const i = +b.dataset.i!; openWordSheet(S.n, V.n, i); return; }
  if (a === 'sheet') { openWordSheet(S.n, V.n, +b.dataset.i!); return; }
  if (a === 'ans') {
    const qs = step === 'practice' ? pq : rq, q = qs[qi]; if (q.chosen) return;
    q.chosen = q.opts[+b.dataset.k!]; q.tries++;
    const ok = q.chosen === q.right;
    if (step === 'practice' && !ok && q.tries < 2) pq.push({ ...q, chosen: undefined, opts: shuffle(q.opts) }); // try once more at the end
    if (step === 'review') { answerReview(q, ok); if (ok) right++; }
  } else if (a === 'next') {
    if (step === 'hear') { if (teach.length) { step = 'word'; wi = 0; } else step = 'ear'; }
    else if (step === 'word') { if (wi + 1 < teach.length) wi++; else { step = 'practice'; qi = 0; } }
    else if (step === 'practice') { if (qi + 1 < pq.length) qi++; else step = 'ear'; }
    else if (step === 'ear') { await finishLesson(); if (rq.length) { step = 'review'; qi = 0; } else step = 'done'; }
    else if (step === 'review') { if (qi + 1 < rq.length) qi++; else step = 'done'; }
  } else if (a === 'reveal') earShown = true;
  else if (a === 'self') { const v = +b.dataset.v!; if (self < 0) { bump(4, v); bump(5); } else bump(4, v - self); self = v; save(); }
  else return;
  render();
});

(async () => {
  if (!$('#lesson')) return;
  document.body.classList.add('focus'); // a lesson is a focused space: no tab bar, the next button stays in thumb reach
  all = await items();
  reviewOnly = new URLSearchParams(location.search).get('review') === '1';
  await buildReview();
  for (const q of rq) reviewVerses.set(q.key, (await surah(q.s))[q.v - 1]);
  if (reviewOnly) { step = rq.length ? 'review' : 'done'; S = (await surahs())[0]; V = (await surah(1))[0]; render(); return; }
  const L = await nextLesson();
  if (!L) { $('#lesson')!.innerHTML = `<h1 class="h1">${t('lsAllDone')}</h1>`; return; }
  const ss = await surahs(); S = ss[L.s - 1]; vs = await surah(L.s); V = vs[L.v - 1]; teach = L.teach; more = L.more;
  const pool = await surahPool(L.s);
  pq = teach.map((i) => { const g = quizGloss(V.w[i]); return { key: tokKey(L.s, L.v, i), s: L.s, v: L.v, i, right: g, opts: optionsFor(g, pool), tries: 0, item: lemmaOf(V.w[i], all).id }; });
  render();
})();
void ICON_PLAY;
