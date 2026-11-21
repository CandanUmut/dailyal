// Today: the listening task first (the goal is hearing), then new words and review; then what you can follow.
import { state, rollDay } from './store';
import { items, surahs, phrases } from './data';
import { dueItems, newItems, checks7, selfAvg7 } from './srs';
import { overview, pickVerse, mySurahItems, strip } from './coverage';
import { t, lang, num } from './i18n';
import { $, base, esc } from './util';

(async () => {
  rollDay();
  const [all, ss, ov, boost] = await Promise.all([items(), surahs(), overview(), mySurahItems()]);
  const due = dueItems(all).length, nw = newItems(all, boost).length, c = checks7();
  const nv = await pickVerse(), S = ss[nv.s - 1], heardToday = state.day.heard > 0;
  const name = lang() === 'tr' ? S.tr : S.tname;
  const d = new Date();
  let h = `<span class="eyebrow">${d.toLocaleDateString(lang() === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span><h1 class="h1">${t('today')}</h1><p class="sub">${t('todaySub')}</p><div class="sec tasks">`;
  let n = 1;
  if (!state.placed) h += `<a class="task" href="${base()}place/"><span class="n">${n++}</span><div><b>${t('tPlace')}</b><span class="d">${t('tPlaceD')}</span></div><span class="go">›</span></a>`;
  h += `<a class="task" href="${base()}listen/?v=${nv.s}:${nv.v}"><span class="n">${heardToday ? '✓' : n++}</span><div>${heardToday ? `<span class="d">${t('heardToday', { n: state.day.heard })}</span>` : ''}<b>${t(heardToday ? 'tListenMore' : 'tListen', { ref: `${esc(name)} ${nv.s}:${nv.v}` })}</b><span class="d">${t('tListenD', { why: nv.why === 'again' ? t('whyAgain') : nv.why === 'follow' ? t('whyFollow') : t('whyStretch') })}</span></div><span class="go">›</span></a>`;
  // Passages due again (narrow listening, Phase 3)
  const dueP = Object.entries(state.heard).filter(([k2, hd]) => k2.startsWith('P') && hd.due <= (state.day.d || 0) && hd.last < (state.day.d || 0));
  if (dueP.length) { const [k2] = dueP[0], m = /^P(\d+):(\d+)-(\d+)$/.exec(k2)!; const S2 = ss[+m[1] - 1]; h += `<a class="task" href="${base()}listen/ladder/?p=${m[1]}:${m[2]}-${m[3]}"><span class="n">${n++}</span><div><b>${t('tPassage', { ref: `${esc(lang() === 'tr' ? S2.tr : S2.tname)} ${m[1]}:${m[2]}–${m[3]}` })}</b><span class="d">${t('tPassageD', { n: dueP.length })}</span></div><span class="go">›</span></a>`; }
  else h += `<a class="task" href="${base()}listen/ladder/"><span class="n">${n++}</span><div><b>${t('ladder')}</b><span class="d">${t('tLadderD')}</span></div><span class="go">›</span></a>`;
  if (nw) h += `<a class="task" href="${base()}words/"><span class="n">${n++}</span><div><b>${t('tNew', { n: nw })}</b><span class="d">${t('tNewD', { m: Math.max(1, Math.round(nw * 0.5)) })}</span></div><span class="go">›</span></a>`;
  if (due) h += `<a class="task" href="${base()}words/"><span class="n">${n++}</span><div><b>${t('tReview', { n: due })}</b><span class="d">${t('tReviewD', { d: due, m: Math.max(1, Math.round(due * 0.25)) })}</span></div><span class="go">›</span></a>`;
  h += '</div>';
  // One practice a day, rotating (Phase 2 review: the new drills were two taps deep).
  const ps = await phrases(), pReady = ps.filter((p) => !state.r[p.id]).length ? Math.min(3, ps.length) : 0, day = new Date().getDate(), my = state.my.length ? state.my : [1];
  const wholeS = ss[my[day % my.length] - 1], opts = [
    { href: `${base()}words/parts/`, label: t('practiceParts') },
    { href: `${base()}surahs/read/?n=${wholeS.n}`, label: t('practiceWhole', { name: esc(lang() === 'tr' ? wholeS.tr : wholeS.tname) }) },
    { href: `${base()}words/?deck=phrases`, label: t('practicePhrases', { n: pReady }) },
  ], o = opts[day % opts.length];
  h += `<div class="sec"><div class="sh">${t('practice')}</div><ul class="list"><li><a href="${o.href}"><span style="flex:1"><b>${o.label}</b></span><span class="go">›</span></a></li></ul></div>`;
  const sa = selfAvg7(), SELF = [t('none'), t('some'), t('most'), t('all')];
  h += `<div class="sec"><div class="sh">${t('checks')}</div>${c.tot ? `<p class="big" style="font-size:30px">${t('checksN', { ok: c.ok, tot: c.tot })}</p>${sa != null ? `<p class="note">${t('selfAvg', { s: SELF[Math.round(sa)] })}</p>` : ''}` : `<p class="note">${t('checksNone')}</p>`}</div>`;
  h += `<div class="sec"><div class="sh">${t('follow')}</div><div class="row" style="align-items:baseline"><span class="big">${num(ov.full)}</span><span class="sub">${t('versesAll', { t: num(ov.total) })}</span></div><p class="cap">${t('shareWords', { p: num(ov.share * 100, 1) })}</p></div>`;
  h += `<div class="sec">${strip(ov.perSurah)}<p class="cap">${t('stripCap')}</p></div>`;
  $('#today')!.innerHTML = h;
})();
