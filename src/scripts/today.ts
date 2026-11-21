// Today (round 2): one path through your prayer surahs. The current unit with its next step, then review,
// then passages due again, then the path. Progress numbers live on the You page.
import { state, rollDay } from './store';
import { items, surahs } from './data';
import { dueItems, newItems } from './srs';
import { mySurahItems } from './coverage';
import { unitOrder, unitStatus, stepUrl, stepName, STEPS } from './units';
import { t, lang } from './i18n';
import { $, base, esc } from './util';

(async () => {
  rollDay();
  const [all, ss, order, boost] = await Promise.all([items(), surahs(), unitOrder(), mySurahItems()]);
  const name = (n: number) => (lang() === 'tr' ? ss[n - 1].tr : ss[n - 1].tname);
  const statuses = await Promise.all(order.slice(0, 14).map(unitStatus));
  const cur = statuses.find((s) => !s.done.follow) || statuses[0];
  const d = new Date();
  let h = `<span class="eyebrow">${d.toLocaleDateString(lang() === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span><h1 class="h1">${t('yourPath')}</h1>`;
  // Current unit
  let firstV = 1; for (let v = 1; v <= cur.S.ayas; v++) if (!state.heard[`${cur.n}:${v}`]) { firstV = v; break; }
  const next = cur.next || 'follow';
  h += `<article class="unit"><a class="unit-link" href="${base()}unit/?s=${cur.n}"><div class="unitar" lang="ar">${esc(cur.S.ar)}</div><p class="unitname">${esc(name(cur.n))} · ${esc(lang() === 'tr' ? cur.S.trMean || '' : cur.S.enMean || cur.S.en)} <span class="note">· ${t('verses_n', { n: cur.S.ayas })}</span></p></a>`;
  h += `<ol class="steps">${STEPS.map((s) => `<li class="${cur.done[s] ? 'done' : s === next ? 'now' : ''}"><i></i><span>${stepName(s)}</span></li>`).join('')}</ol>`;
  h += `<a class="btn pri cta" href="${next === 'meet' || next === 'follow' ? `${base()}unit/?s=${cur.n}` : stepUrl(cur.n, next, firstV)}">${t('continueStep', { step: stepName(next) })}</a></article>`;
  // Review (spaced) and passages due again (narrow listening)
  const due = dueItems(all).length, nw = newItems(all, boost).length;
  if (!state.placed) h += `<a class="task" href="${base()}place/"><div><b>${t('tPlace')}</b><span class="d">${t('tPlaceD')}</span></div><span class="go">›</span></a>`;
  if (due + nw) h += `<a class="task" href="${base()}words/"><div><b>${t('reviewRow', { n: due + nw })}</b><span class="d">${t('dueNew', { d: due, n: nw, m: Math.max(1, Math.round((due + nw) * 0.3)) })}</span></div><span class="go">›</span></a>`;
  const t0 = state.day.d || 0, dueP = Object.entries(state.heard).filter(([k2, hd]) => k2.startsWith('P') && hd.due <= t0 && hd.last < t0);
  if (dueP.length) { const m = /^P(\d+):(\d+)-(\d+)$/.exec(dueP[0][0])!; h += `<a class="task" href="${base()}listen/ladder/?p=${m[1]}:${m[2]}-${m[3]}"><div><b>${t('tPassage', { ref: `${esc(name(+m[1]))} ${m[1]}:${m[2]}–${m[3]}` })}</b><span class="d">${t('tPassageD', { n: dueP.length })}</span></div><span class="go">›</span></a>`; }
  // The path
  h += `<div class="thread sec">${statuses.map((s) => { const k = s.done.follow ? 'full' : STEPS.some((x) => s.done[x]) ? 'half' : ''; return `<a class="bead ${k}" href="${base()}unit/?s=${s.n}"><i></i><div><b>${esc(name(s.n))}</b> <span class="ar" style="font-size:19px">${esc(s.S.ar)}</span><span class="note" style="display:block">${s.done.follow ? t('followed') : s.next && k ? stepName(s.next) : t('verses_n', { n: s.S.ayas })}</span></div></a>`; }).join('')}</div>`;
  h += `<p class="cap">${t('pathCap')}</p>`;
  $('#today')!.innerHTML = h;
})();
