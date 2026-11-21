// Roots: all roots by frequency, or one root's family (?r=).
import { roots, rootMeans, items } from './data';
import { knownIdx } from './coverage';
import { meaning } from './cardview';
import { t, pick } from './i18n';
import { $, base, esc } from './util';
const r = new URLSearchParams(location.search).get('r');
(async () => {
  const [rs, rm, all, k] = await Promise.all([roots(), rootMeans(), items(), knownIdx()]);
  if (r && rs[r]) {
    const R = rs[r], m = rm[r];
    let h = `<a class="back" href="${base()}library/roots/">‹ ${t('roots')}</a><h1 class="h1 ar" style="font-size:44px;text-align:right">${esc(R.ar)}</h1><p class="sub">${t('family', { n: R.items.length, c: R.n })}</p>`;
    if (m) h += `<div class="sec"><div class="sh">${t('rootMean')}</div><p class="root-mean">${esc(pick(m.tr, m.en))}</p></div>`;
    h += `<div class="sec"><ul class="list">${R.items.map((i) => `<li><a href="${base()}words/?id=${encodeURIComponent(all[i].id)}"><span class="ar" style="font-size:24px;min-width:110px;text-align:right">${esc(all[i].ar)}</span><span style="flex:1">${esc(meaning(all[i]))}<span class="note" style="display:block">${t('times', { n: all[i].n })}</span></span>${k[i] ? `<span class="tag known">✓</span>` : ''}</a></li>`).join('')}</ul></div>`;
    $('#roots')!.innerHTML = h; return;
  }
  const list = Object.entries(rs).sort((a, b) => b[1].n - a[1].n);
  $('#roots')!.innerHTML = `<a class="back" href="${base()}library/">‹ ${t('library')}</a><h1 class="h1">${t('roots')}</h1><p class="sub">${t('rootsSub')}</p><ul class="list sec">${list.slice(0, 300).map(([id, R]) => { const kn = R.items.filter((i) => k[i]).length; return `<li><a href="?r=${encodeURIComponent(id)}"><span class="ar" style="font-size:24px;min-width:90px;text-align:right">${esc(R.ar)}</span><span style="flex:1">${t('times', { n: R.n })}<span class="note" style="display:block">${kn} / ${R.items.length} ✓</span></span><span class="go">›</span></a></li>`; }).join('')}</ul><p class="note" style="margin-top:10px">300 / ${list.length}</p>`;
})();
