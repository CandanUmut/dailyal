// Today (v3, after Umut's feedback): where you are, and one button for today's lesson. Nothing else competes.
import { state } from './store';
import { surahs, surah } from './data';
import { nextLesson, course, doneToday, lessonsDays, learnedCount, discover, markDiscover } from './lesson';
import { t, lang } from './i18n';
import { $, base, esc, dayNum } from './util';

(async () => {
  const [ss, L, order] = await Promise.all([surahs(), nextLesson(), course()]);
  const name = (n: number) => esc(lang() === 'tr' ? ss[n - 1].tr : ss[n - 1].tname);
  const days = lessonsDays(), today = doneToday();
  let h = `<span class="eyebrow">${new Date().toLocaleDateString(lang() === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${days ? ` · ${t('tdDay', { n: days + (today ? 0 : 1) })}` : ''}</span>`;
  if (!days) h += `<h1 class="h1">${t('tdWelcomeT')}</h1><div class="welcome"><p>${t('tdWelcome1')}</p><ol><li>${t('tdWelcome2')}</li><li>${t('tdWelcome3')}</li><li>${t('tdWelcome4')}</li></ol><p class="note" style="margin-top:8px">${t('tdWelcome5')}</p></div>`;
  if (!L) { $('#today')!.innerHTML = h + `<h1 class="h1">${t('lsAllDone')}</h1>`; return; }
  const S = ss[L.s - 1], doneV = Object.keys(state.lv).filter((k) => k.startsWith(`${L.s}:`)).length;
  h += `<article class="unit sec"><div class="unitar" lang="ar">${esc(S.ar)}</div><p class="unitname">${name(L.s)} · ${esc(lang() === 'tr' ? S.trMean || '' : S.enMean || S.en)}</p>`;
  h += `<div class="bar" role="img" aria-label="${t('tdVerses', { k: doneV, n: S.ayas })}"><span style="width:${(100 * doneV) / S.ayas}%"></span></div><p class="note" style="text-align:center">${t('tdVerses', { k: doneV, n: S.ayas })}</p>`;
  if (today) {
    h += `<p class="ok" style="text-align:center;margin-top:10px"><b>${t('tdDoneToday')}</b></p><p class="note" style="text-align:center">${t('tdTomorrow', { name: name(L.s), v: L.verses[0] })}</p>`;
    h += `<div class="stackb"><a class="btn quiet" href="${base()}lesson/">${t('tdOneMore')}</a></div>`;
  } else {
    h += `<p style="text-align:center;margin-top:10px">${t('tdNext', { v: L.verses.length > 1 ? `${L.verses[0]}–${L.verses[L.verses.length - 1]}` : L.verses[0] })}${L.teach.length ? ` · ${t('tdNewWords', { n: L.teach.length })}` : ''}</p>`;
    h += `<div class="stackb"><a class="btn pri big" href="${base()}lesson/">${t('tdStart')}</a></div><p class="note" style="text-align:center">${t('tdTime')}</p>`;
  }
  h += '</article>';
  if (days) h += `<p class="note sec" style="text-align:center">${t('tdLearned', { w: learnedCount(), v: Object.keys(state.lv).length })}</p>`;
  // One thing to discover, tied to your words (never more than one).
  const d = days ? await discover() : null;
  if (d) h += `<a class="discover sec" href="${base()}${d.href}" data-disc="${esc(d.key)}"><span class="lh">${t('dcTitle')}</span><b>${esc(d.title)}</b><span class="note">${esc(d.sub)}</span></a>`;
  // The course, briefly: where you are among the surahs.
  const idx = order.indexOf(L.s), around = order.slice(Math.max(0, idx - 1), idx + 4);
  h += `<div class="thread sec">${await Promise.all(around.map(async (n) => { const vs = await surah(n), dv = vs.filter((v) => state.lv[`${n}:${v.n}`]).length, k = dv === vs.length ? 'full' : dv ? 'half' : ''; return `<div class="bead ${k}"><i></i><div><b>${name(n)}</b> <span class="ar" style="font-size:19px">${esc(ss[n - 1].ar)}</span><span class="note" style="display:block">${t('tdVerses', { k: dv, n: vs.length })}</span></div></div>`; })).then((x) => x.join(''))}</div>`;
  h += `<p class="cap">${t('tdCourse')}</p>`;
  $('#today')!.innerHTML = h;
  document.querySelector<HTMLElement>('[data-disc]')?.addEventListener('click', (e) => markDiscover((e.currentTarget as HTMLElement).dataset.disc!));
  void dayNum;
})();
