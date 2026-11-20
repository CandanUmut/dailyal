// Today: the listening task first (the goal is hearing), then new words and review; then what you can follow.
import { state, rollDay } from './store';
import { items, surahs } from './data';
import { dueItems, newItems, checks7 } from './srs';
import { overview, pickVerse, mySurahItems, strip } from './coverage';
import { t, lang } from './i18n';
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
  h += `<a class="task ${heardToday ? 'done' : ''}" href="${base()}listen/?v=${nv.s}:${nv.v}"><span class="n">${n++}</span><div><b>${t('tListen', { ref: `${esc(name)} ${nv.s}:${nv.v}` })}</b><span class="d">${t('tListenD', { why: nv.why === 'again' ? t('whyAgain') : nv.why === 'follow' ? t('whyFollow') : t('whyStretch') })}</span></div><span class="go">›</span></a>`;
  if (nw) h += `<a class="task" href="${base()}words/"><span class="n">${n++}</span><div><b>${t('tNew', { n: nw })}</b><span class="d">${t('tNewD', { m: Math.max(1, Math.round(nw * 0.5)) })}</span></div><span class="go">›</span></a>`;
  if (due) h += `<a class="task" href="${base()}words/"><span class="n">${n++}</span><div><b>${t('tReview', { n: due })}</b><span class="d">${t('tReviewD', { d: due, m: Math.max(1, Math.round(due * 0.25)) })}</span></div><span class="go">›</span></a>`;
  h += '</div>';
  h += `<div class="sec"><div class="sh">${t('checks')}</div>${c.tot ? `<p class="big" style="font-size:30px">${t('checksN', { ok: c.ok, tot: c.tot })}</p>` : `<p class="note">${t('checksNone')}</p>`}</div>`;
  h += `<div class="sec"><div class="sh">${t('follow')}</div><div class="row" style="align-items:baseline"><span class="big">${ov.full.toLocaleString()}</span><span class="sub">${t('versesAll', { t: ov.total.toLocaleString() })}</span></div><p class="cap">${t('shareWords', { p: (ov.share * 100).toFixed(1) })}</p></div>`;
  h += `<div class="sec">${strip(ov.perSurah)}<p class="cap">${t('stripCap')}</p></div>`;
  $('#today')!.innerHTML = h;
})();
