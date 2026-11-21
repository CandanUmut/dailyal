// You: your progress (surahs followed by ear, listening checks, coverage), and the settings.
import { state } from './store';
import { surahs } from './data';
import { checks7, selfAvg7 } from './srs';
import { overview, strip } from './coverage';
import { t, lang, num } from './i18n';
import { $, base, esc } from './util';
(async () => {
  const [ss, ov] = await Promise.all([surahs(), overview()]);
  const followed = Object.entries(state.units).filter(([, u]) => u.follow).map(([n]) => ss[+n - 1]);
  const c = checks7(), sa = selfAvg7(), SELF = [t('none'), t('some'), t('most'), t('all')];
  let h = `<h1 class="h1">${t('you')}</h1><div class="sec"><div class="sh">${t('youFollowed')}</div>`;
  h += followed.length ? `<div class="chips">${followed.map((S) => `<a class="chip" href="${base()}unit/?s=${S.n}">${esc(lang() === 'tr' ? S.tr : S.tname)} <span class="ar" style="font-size:18px">&nbsp;${esc(S.ar)}</span></a>`).join('')}</div>` : `<p class="note">${t('youNone')}</p>`;
  h += `</div><div class="sec"><div class="sh">${t('checks')}</div>${c.tot ? `<p class="big" style="font-size:30px">${t('checksN', { ok: c.ok, tot: c.tot })}</p>${sa != null ? `<p class="note">${t('selfAvg', { s: SELF[Math.round(sa)] })}</p>` : ''}` : `<p class="note">${t('checksNone')}</p>`}</div>`;
  h += `<div class="sec"><div class="sh">${t('follow')}</div><div class="row" style="align-items:baseline"><span class="big">${num(ov.full)}</span><span class="sub">${t('versesAll', { t: num(ov.total) })}</span></div><p class="cap">${t('shareWords', { p: num(ov.share * 100, 1) })}</p>${strip(ov.perSurah)}<p class="cap">${t('stripCap')}</p></div>`;
  h += `<ul class="list sec">${[['settings/', t('settings')], ['place/', t('tPlace')], ['library/how/', t('howLink')], ['about/', t('about')]].map(([href, l]) => `<li><a href="${base()}${href}"><span style="flex:1"><b>${l}</b></span><span class="go">›</span></a></li>`).join('')}</ul>`;
  $('#you')!.innerHTML = h;
})();
