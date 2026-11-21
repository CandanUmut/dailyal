// The daily lesson (v3.1, the "middle way" Umut chose): about 10–15 minutes, always in one surah.
//  - Your surahs, in order: the lesson takes verses until it reaches 4 useful new words (words that occur 3+ times
//    in the Quran). Words that occur only once or twice are shown with their meaning but not drilled.
//  - Plus 2 of the Quran's most frequent words you don't know yet, each taught inside a real verse.
// Teach first (nothing asked), then practise by choosing, then hear the verses without the text, then a short review
// of words from earlier days. One "Next" button leads the way; the header always says where you are.
import { state, save, rollDay, bump } from './store';
import { surah, surahs, items, roots, type Verse, type Item, type Surah } from './data';
import { verseHtml, playBtn, toggle, reciterName, speedChips, setSpeed, playAll } from './verse';
import { meaning, grammarLabel } from './cardview';
import { trText, trName, rangeOnce, similar } from './trans';
import { openWordSheet } from './sheet';
import { t, lang, quizGloss, stemKey, num } from './i18n';
import { $, base, esc, shuffle, dayNum, ICON_PLAY, ICON_PAUSE } from './util';
import { INTERVALS } from './srs';

/** The course: Al-Fatiha, then the short surahs most often recited, then the rest of Juz 30 from shortest. */
const FIRST = [1, 112, 113, 114, 108, 103, 110, 106, 105, 107, 109, 111, 102, 104, 101, 100, 99, 97, 95, 94, 93];
export async function course() { const ss = await surahs(); return [...FIRST, ...ss.filter((s) => s.n >= 78 && !FIRST.includes(s.n)).sort((a, b) => a.ayas - b.ayas).map((s) => s.n)]; }
export const SURAH_WORDS = 4, FREQ_WORDS = 2, USEFUL = 3, MAX_VERSES = 5;
const tokKey = (s: number, v: number, i: number) => `t:${s}:${v}:${i}`;
const lemmaOf = (w: Verse['w'][number], all: Item[]) => w[0].map((x) => all[x]).find((x) => x.k === 'l') || all[w[0][0]];
export type Tok = { s: number; v: number; i: number; freq?: true };
export type Lesson = { s: number; verses: number[]; teach: Tok[]; rare: Tok[]; partial: boolean };

/** Today's lesson: verses of the current surah until 4 useful new words, plus 2 frequent words from anywhere. */
export async function nextLesson(): Promise<Lesson | null> {
  const all = await items();
  for (const s of await course()) {
    const vs = await surah(s);
    if (vs.every((V) => state.lv[`${s}:${V.n}`])) continue;
    const L: Lesson = { s, verses: [], teach: [], rare: [], partial: false }, seen = new Set<string>();
    for (const V of vs) {
      if (state.lv[`${s}:${V.n}`]) continue;
      if (L.verses.length >= MAX_VERSES) break;
      const useful: Tok[] = [], rare: Tok[] = [];
      V.w.forEach((w, i) => {
        if (!w[0].length || !quizGloss(w)) return; const l = lemmaOf(w, all);
        if (!l || state.met[l.id] || seen.has(l.id)) return;
        (l.n >= USEFUL ? useful : rare).push({ s, v: V.n, i });
      });
      const room = SURAH_WORDS - L.teach.length;
      if (useful.length > room && L.verses.length) break; // this verse starts tomorrow's lesson
      L.verses.push(V.n);
      for (const tk of useful.slice(0, room)) { L.teach.push(tk); seen.add(lemmaOf(V.w[tk.i], all).id); }
      L.rare.push(...rare.filter((tk) => !seen.has(lemmaOf(V.w[tk.i], all).id)));
      rare.forEach((tk) => seen.add(lemmaOf(V.w[tk.i], all).id));
      if (useful.length > room) { L.partial = true; break; }
      if (L.teach.length >= SURAH_WORDS) break;
    }
    // Two frequent words of the whole Quran, each inside a real verse (one you have learned or a short surah first).
    const taughtIds = new Set(L.teach.map((tk) => lemmaOf(vs[tk.v - 1].w[tk.i], all).id));
    for (const it of all) {
      if (L.teach.filter((x) => x.freq).length >= FREQ_WORDS) break;
      if (it.k !== 'l' || state.met[it.id] || taughtIds.has(it.id)) continue;
      const refs = [...(it.ex30 || []), ...it.ex].sort((a, b) => Number(!!state.lv[b.split(':').slice(0, 2).join(':')]) - Number(!!state.lv[a.split(':').slice(0, 2).join(':')]));
      for (const ref of refs) { const [rs, rv, rw] = ref.split(':').map(Number), RV = (await surah(rs))[rv - 1]; if (quizGloss(RV.w[rw - 1])) { L.teach.push({ s: rs, v: rv, i: rw - 1, freq: true }); taughtIds.add(it.id); break; } }
    }
    return L;
  }
  return null;
}
export const lessonsDays = () => Object.keys(state.lessonDays).length;
export const doneToday = () => !!state.lessonDays[dayNum()];
export const learnedCount = () => Object.keys(state.met).length;

/** One thing to discover, tied to words you learned (shown at the end of a lesson and on Today). */
export async function discover() {
  const all = await items(), rs = await roots(), byId = new Map(all.map((x) => [x.id, x])), t0 = dayNum();
  const recent = Object.entries(state.met).sort((a, b) => b[1] - a[1]).map(([id]) => byId.get(id)).filter(Boolean) as Item[];
  const fresh = (k: string) => !state.disc[k] || state.disc[k] < t0 - 6;
  for (const x of recent) if (x.root && rs[x.root] && rs[x.root].items.length >= 3 && fresh('root:' + x.root)) return { key: 'root:' + x.root, href: `library/roots/?r=${encodeURIComponent(x.root)}`, title: t('dcRoot', { root: rs[x.root].ar }), sub: t('dcRootS', { w: x.ar, n: rs[x.root].items.length, c: num(rs[x.root].n) }) };
  const hasPron = Object.keys(state.r).some((k) => k.startsWith('t:')) && recent.length >= 4;
  if (hasPron && fresh('lesson:pron')) return { key: 'lesson:pron', href: 'library/pronouns/', title: t('dcPron'), sub: t('dcPronS') };
  if (recent.some((x) => x.id.endsWith('#NEG')) && fresh('lesson:neg')) return { key: 'lesson:neg', href: 'library/role/?r=NEG', title: t('dcNeg'), sub: t('dcNegS') };
  return null;
}
export function markDiscover(k: string) { state.disc[k] = dayNum(); save(); }

// ---------- the lesson page ----------
type Q = { key: string; s: number; v: number; i: number; opts: string[]; right: string; chosen?: string; tries: number; item: string };
let S: Surah, vs: Verse[], all: Item[], L: Lesson, ctx = new Map<string, Verse>();
let step: 'hear' | 'word' | 'practice' | 'ear' | 'review' | 'done' = 'hear', wi = 0, pq: Q[] = [], rq: Q[] = [], qi = 0, earHeard = false, earShown = false, self = -1, reviewOnly = false, right = 0;
let stopAll: (() => void) | null = null, playingV = 0, disc: Awaited<ReturnType<typeof discover>> = null;
const STEPS: ('hear' | 'word' | 'practice' | 'ear' | 'review')[] = ['hear', 'word', 'practice', 'ear', 'review'];
const vOf = (tk: { s: number; v: number }) => ctx.get(`${tk.s}:${tk.v}`)!;

function optionsFor(right: string, pool: string[]) {
  const out = [right], seen = new Set([stemKey(right)]);
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
    ctx.set(`${s}:${v}`, sv);
    rq.push({ key, s, v, i, right: g, opts: optionsFor(g, await surahPool(s)), tries: 0, item: lemmaOf(w, all).id });
  }
}

const range = () => (L.verses.length > 1 ? `${L.verses[0]}–${L.verses[L.verses.length - 1]}` : `${L.verses[0]}`);
const header = () => {
  const label = reviewOnly ? t('lsReviewTitle') : `${esc(lang() === 'tr' ? S.tr : S.tname)} · ${t('lsVerse', { v: range(), n: S.ayas })}`;
  const steps = reviewOnly ? '' : `<ol class="lsteps" aria-label="${t('lsProgress')}">${STEPS.map((x) => `<li class="${STEPS.indexOf(x) < STEPS.indexOf(step as typeof STEPS[number]) || step === 'done' ? 'done' : x === step ? 'now' : ''}"><i></i><span>${t(('ls_' + x) as 'ls_hear')}</span></li>`).join('')}</ol>`;
  return `<div class="lhead"><a class="back" href="${base()}">✕ <span class="sr">${t('close')}</span></a><span class="eyebrow">${label}</span></div>${steps}`;
};
const oneVersePlayer = (s: number, v: number) => `<div class="player">${playBtn(s, v, t('play'))}<div style="flex:1">${speedChips()}</div></div>`;
const allPlayer = () => `<div class="player"><button class="play" data-a="playall" aria-label="${t('play')}">${stopAll ? ICON_PAUSE : ICON_PLAY}</button><div style="flex:1">${speedChips()}<p class="note" style="margin:4px 0 0">${esc(t('reciter', { r: reciterName() }))}${playingV ? ` · ▶ ${t('verseN', { n: playingV })}` : ''}</p></div></div>`;
const nextBtn = (label = t('lsNext')) => `<div class="stackb dock"><button class="btn pri big" data-a="next">${label}</button></div>`;
const knownIn = (V: Verse) => { const k = new Uint8Array(all.length); V.w.forEach((w) => { const l = lemmaOf(w, all); if (l && state.met[l.id]) for (const x of w[0]) k[x] = 1; }); return k; };
const verseBlock = (V: Verse, opts: { mark?: number } = {}) => `<div class="page">${V.b && V.bt ? `<p class="q basmala" lang="ar">${esc(V.bt)}</p>` : ''}${verseHtml(V, knownIn(V), opts)}</div>`;
function lessonVerses(withText = true) {
  const vv = L.verses.map((n) => vs[n - 1]), once = rangeOnce(vv);
  return vv.map((V) => `<div data-v="${V.n}">${verseBlock(V)}${withText && once.has(V.n) ? `<p class="tl">${esc(once.get(V.n)!)}</p>` : ''}</div>`).join('') + `<p class="src">${esc(trName())} · Açık Kuran</p>`;
}

function render() {
  let h = header();
  if (step === 'hear') {
    h += `<h1 class="h2">${L.verses.length > 1 ? t('lsHearTn', { n: L.verses.length }) : t('lsHearT')}</h1><p class="sub">${t('lsHearS')}</p>${lessonVerses()}${allPlayer()}`;
    if (L.rare.length) h += `<div class="card sec"><p class="lh">${t('lsRare')}</p>${L.rare.map((tk) => { const V = vs[tk.v - 1]; return `<p><span class="ar" style="font-size:22px">${esc(V.t[tk.i])}</span> = ${esc(quizGloss(V.w[tk.i]))}</p>`; }).join('')}<p class="note">${t('lsRareS')}</p></div>`;
    h += `<p class="note sec">${L.teach.length ? t('lsHearNext2', { a: L.teach.filter((x) => !x.freq).length, b: L.teach.filter((x) => x.freq).length }) : t('lsHearNone')}</p>` + nextBtn();
  } else if (step === 'word') {
    const tk = L.teach[wi], V = vOf(tk), w = V.w[tk.i], l = lemmaOf(w, all), parts = w[0].map((x) => all[x]).filter((x) => x.k !== 'l'), gr = grammarLabel(w[4]);
    h += `<p class="eyebrow">${t('lsWordN', { k: wi + 1, n: L.teach.length })}${tk.freq ? ` · <b class="rub">${t('lsFreq')}</b>` : ''}</p><div class="wcard"><div class="wcard-ar" lang="ar">${esc(V.t[tk.i])}</div><p class="wcard-mean">${esc(quizGloss(w))}</p>${gr ? `<p class="note">${esc(gr)}</p>` : ''}`;
    if (parts.length) h += `<p class="note">${t('lsParts')}: ${parts.map((x) => `<span class="ar" style="font-size:19px">${esc(x.ar.split(' · ')[0])}</span> ${esc(meaning(x).split(/,| \(/)[0])}`).join(' · ')}</p>`;
    if (l && l.k === 'l') h += `<p class="note">${t('lsDict')}: <span class="ar" style="font-size:19px">${esc(l.ar)}</span> · <b>${t('times', { n: num(l.n) })}</b></p>`;
    h += `<p class="src">${t('srcAk')}</p></div>`;
    if (tk.freq) h += `<p class="note" style="margin-top:12px">${t('lsFreqWhere', { s: tk.s, v: tk.v })}</p>${verseBlock(V, { mark: tk.i })}<p class="tl note">${esc(trText(V))}</p>${oneVersePlayer(tk.s, tk.v)}`;
    else h += `<p class="note" style="margin-top:12px">${t('lsWhere')}</p>${verseBlock(V, { mark: tk.i })}${oneVersePlayer(tk.s, tk.v)}`;
    h += `<div class="stackb"><button class="linkbtn" data-a="sheet">${t('lsMoreAbout')}</button></div>` + nextBtn(wi + 1 < L.teach.length ? t('lsNextWord') : t('lsToPractice'));
  } else if (step === 'practice' || step === 'review') {
    const qs = step === 'practice' ? pq : rq, q = qs[qi], qv = vOf(q);
    h += `<p class="eyebrow">${step === 'practice' ? t('lsPracticeN', { k: Math.min(qi + 1, qs.length), n: qs.length }) : t('lsReviewN', { k: Math.min(qi + 1, qs.length), n: qs.length })}</p>`;
    h += `<p class="sub">${t('lsChoose')}</p><div class="wcard"><div class="wcard-ar" lang="ar">${esc(qv.t[q.i])}</div></div>`;
    h += `<div style="margin-top:12px">${q.opts.map((o, k) => `<button class="opt ${q.chosen ? (o === q.right ? 'right' : o === q.chosen ? 'wrong' : '') : ''}" data-a="ans" data-k="${k}" ${q.chosen ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
    if (q.chosen) {
      const ok = q.chosen === q.right;
      h += `<p class="${ok ? 'ok' : 'bad'}" style="margin-top:10px"><b>${ok ? t('correct') : step === 'review' ? t('lsWrongReview') : t('lsWrongSoft')}</b></p><div class="mini">${verseHtml(qv, null, { mark: q.i })}<p class="ref">${q.s}:${q.v}</p></div>`;
      h += nextBtn(qi + 1 < qs.length ? t('lsNext') : step === 'practice' ? t('lsToEar') : t('lsFinish'));
    }
  } else if (step === 'ear') {
    h += `<h1 class="h2">${t('lsEarT')}</h1><p class="sub">${t('lsEarS')}</p>${allPlayer()}`;
    if (!earHeard) h += `<p class="note">${t('playFirst')}</p>`;
    else if (!earShown) h += `<div class="stackb dock"><button class="btn pri big" data-a="reveal">${t('lsReveal')}</button></div>`;
    else {
      h += `${lessonVerses()}<p style="margin-top:12px"><b>${t('selfQ')}</b></p><div class="chips">${[t('none'), t('some'), t('most'), t('all')].map((x, i) => `<button class="chip" data-a="self" data-v="${i}" aria-pressed="${self === i}">${x}</button>`).join('')}</div>`;
      if (self >= 0) h += nextBtn(rq.length ? t('lsToReview', { n: rq.length }) : t('lsFinish'));
    }
  } else {
    h += `<div class="done-box"><p class="big-ok">✓</p><h1 class="h1">${reviewOnly ? t('lsReviewDone') : t('lsDoneT')}</h1><p class="sub">${reviewOnly ? t('lsReviewDoneS', { k: right, n: rq.length }) : L.teach.length ? t('lsDoneS', { n: L.teach.length }) : t('lsDoneS0')}</p></div>`;
    if (!reviewOnly && L.teach.length) h += `<div class="sec"><div class="sh">${t('lsLearned')}</div><ul class="list">${L.teach.map((tk) => { const V = vOf(tk); return `<li><div class="li"><span class="ar" style="font-size:26px;min-width:110px;text-align:right">${esc(V.t[tk.i])}</span><span style="flex:1">${esc(quizGloss(V.w[tk.i]))}${tk.freq ? `<span class="note" style="display:block">${t('lsFreq')}</span>` : ''}</span></div></li>`; }).join('')}</ul></div>`;
    if (disc) h += `<a class="discover sec" href="${base()}${disc.href}" data-disc="${esc(disc.key)}"><span class="lh">${t('dcTitle')}</span><b>${esc(disc.title)}</b><span class="note">${esc(disc.sub)}</span></a>`;
    h += `<div class="stackb"><a class="btn pri big" href="${base()}">${t('lsHome')}</a></div>`;
  }
  $('#lesson')!.innerHTML = h;
}
const renderTop = () => { render(); window.scrollTo(0, 0); };

async function finishLesson() {
  rollDay();
  const t0 = dayNum();
  for (const tk of L.teach) {
    const V = vOf(tk), key = tokKey(tk.s, tk.v, tk.i), l = lemmaOf(V.w[tk.i], all);
    if (!state.r[key]) state.r[key] = { b: 0, due: t0 + 1, n: 1, m: 0, f: t0 };
    if (l) state.met[l.id] ||= t0;
  }
  L.verses.forEach((n, k) => { if (!(L.partial && k === L.verses.length - 1)) state.lv[`${L.s}:${n}`] = t0; });
  state.lessonDays[t0] = (state.lessonDays[t0] || 0) + 1;
  save();
  disc = await discover();
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
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a], [data-disc]'); if (!b || !$('#lesson')) return;
  if (b.dataset.disc) { markDiscover(b.dataset.disc); return; }
  const a = b.dataset.a!;
  if (a === 'play') { toggle(b); return; }
  if (a === 'playall') {
    if (stopAll) { stopAll(); stopAll = null; playingV = 0; render(); return; }
    stopAll = playAll(L.s, L.verses[0], L.verses[L.verses.length - 1], (v) => { playingV = v; render(); }, () => { stopAll = null; playingV = 0; if (step === 'ear') earHeard = true; render(); });
    render(); return;
  }
  if (a === 'speed') { setSpeed(+b.dataset.v!); save(); render(); return; }
  if (a === 'word') { const v = +(b.closest<HTMLElement>('[data-v]')?.dataset.v || 0); if (v) openWordSheet(L.s, v, +b.dataset.i!); return; }
  if (a === 'sheet') { const tk = L.teach[wi]; openWordSheet(tk.s, tk.v, tk.i); return; }
  if (a === 'ans') {
    const qs = step === 'practice' ? pq : rq, q = qs[qi]; if (q.chosen) return;
    q.chosen = q.opts[+b.dataset.k!]; q.tries++;
    const ok = q.chosen === q.right;
    if (step === 'practice' && !ok && q.tries < 2) pq.push({ ...q, chosen: undefined, opts: shuffle(q.opts) }); // once more at the end
    if (step === 'review') { answerReview(q, ok); if (ok) right++; }
    render(); return;
  } else if (a === 'next') {
    if (stopAll) { stopAll(); stopAll = null; playingV = 0; }
    if (step === 'hear') { if (L.teach.length) { step = 'word'; wi = 0; } else step = 'ear'; }
    else if (step === 'word') { if (wi + 1 < L.teach.length) wi++; else { step = 'practice'; qi = 0; } }
    else if (step === 'practice') { if (qi + 1 < pq.length) qi++; else step = 'ear'; }
    else if (step === 'ear') { await finishLesson(); if (rq.length) { step = 'review'; qi = 0; } else step = 'done'; }
    else if (step === 'review') { if (qi + 1 < rq.length) qi++; else step = 'done'; }
  } else if (a === 'reveal') earShown = true;
  else if (a === 'self') { const v = +b.dataset.v!; if (self < 0) { bump(4, v); bump(5); } else bump(4, v - self); self = v; save(); render(); return; }
  else return;
  renderTop();
});

(async () => {
  if (!$('#lesson')) return;
  document.body.classList.add('focus'); // a lesson is a focused space: no tab bar, the next button stays in thumb reach
  all = await items();
  reviewOnly = new URLSearchParams(location.search).get('review') === '1';
  await buildReview();
  if (reviewOnly) { step = rq.length ? 'review' : 'done'; S = (await surahs())[0]; L = { s: 1, verses: [1], teach: [], rare: [], partial: false }; vs = await surah(1); renderTop(); return; }
  const next = await nextLesson();
  if (!next) { $('#lesson')!.innerHTML = `<h1 class="h1">${t('lsAllDone')}</h1>`; return; }
  L = next; S = (await surahs())[L.s - 1]; vs = await surah(L.s);
  for (const V of vs) ctx.set(`${L.s}:${V.n}`, V);
  for (const tk of L.teach) if (!ctx.has(`${tk.s}:${tk.v}`)) ctx.set(`${tk.s}:${tk.v}`, (await surah(tk.s))[tk.v - 1]);
  const pools = new Map<number, string[]>();
  for (const tk of L.teach) if (!pools.has(tk.s)) pools.set(tk.s, await surahPool(tk.s));
  pq = L.teach.map((tk) => { const V = vOf(tk), g = quizGloss(V.w[tk.i]); return { key: tokKey(tk.s, tk.v, tk.i), s: tk.s, v: tk.v, i: tk.i, right: g, opts: optionsFor(g, [...pools.get(tk.s)!, ...pools.get(L.s)!]), tries: 0, item: lemmaOf(V.w[tk.i], all).id }; });
  renderTop();
})();
