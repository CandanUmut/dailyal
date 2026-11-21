// One surah unit: its 5 steps, with the Meet step (whole surah, no text) done right here.
import { save } from './store';
import { unitStatus, stepUrl, stepName, markMeet, STEPS } from './units';
import { playAll, speedChips, setSpeed, reciterName } from './verse';
import { t, lang } from './i18n';
import { $, base, esc } from './util';

const n = Number(new URLSearchParams(location.search).get('s')) || 1;
const follow = new URLSearchParams(location.search).get('follow') === '1';
let stop: (() => void) | null = null, playing = 0;

async function render() {
  const st = await unitStatus(n), S = st.S;
  let firstV = 1; for (let v = 1; v <= S.ayas; v++) if (!(await import('./store')).state.heard[`${n}:${v}`]) { firstV = v; break; }
  let h = `<a class="back" href="${base()}">‹ ${t('today')}</a><div class="unit-hero"><div class="unitar" lang="ar">${esc(S.ar)}</div><p class="unitname">${esc(lang() === 'tr' ? S.tr : S.tname)} · ${esc(lang() === 'tr' ? S.trMean || '' : S.enMean || S.en)}</p><p class="note" style="text-align:center">${t('verses_n', { n: S.ayas })} · ${S.type === 'Meccan' ? t('meccan') : t('medinan')}</p></div>`;
  if (st.done.follow) h += `<p class="ok sec" style="text-align:center"><b>${t('unitDone')}</b></p>`;
  h += '<ol class="steplist">';
  for (const s of STEPS) {
    const c = (st.counts as Record<string, number[]>)[s], isNext = st.next === s;
    h += `<li class="${st.done[s] ? 'done' : isNext ? 'now' : ''}"><i></i><div style="flex:1"><b>${stepName(s)}</b>${c ? `<span class="note" style="display:block">${t('stepsDone', { a: c[0], b: c[1] })}</span>` : ''}</div>${s !== 'meet' && s !== 'follow' ? `<a class="btn ${isNext ? 'pri' : 'quiet'}" href="${stepUrl(n, s, firstV)}">${st.done[s] ? '✓' : '›'}</a>` : st.done[s] ? '<span class="ok">✓</span>' : ''}</li>`;
  }
  h += '</ol>';
  // Meet: here. Follow: the whole-surah check in the ladder.
  if (!st.done.meet || (!follow && st.next === 'meet')) h += `<div class="card sec"><b>${stepName('meet')}</b><p class="note">${t('meetSub')}</p>${speedChips()}<p class="note">${esc(t('reciter', { r: reciterName() }))}</p><div class="stackb"><button class="btn pri" data-a="meet">${stop ? t('stopAll') : t('meetPlay')}</button></div>${playing ? `<p class="ok">▶ ${t('verseN', { n: playing })}</p>` : ''}</div>`;
  if (st.next === 'follow' || follow) h += `<div class="card sec"><b>${stepName('follow')}</b><p class="note">${t('followSub')}</p><div class="stackb"><a class="btn pri" href="${base()}listen/ladder/?p=${n}:1-${S.ayas}&unit=1">${t('followGo')}</a></div></div>`;
  $('#unit')!.innerHTML = h;
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  if (b.dataset.a === 'speed') { setSpeed(+b.dataset.v!); save(); render(); return; }
  if (b.dataset.a !== 'meet') return;
  if (stop) { stop(); stop = null; playing = 0; render(); return; }
  import('./data').then(({ surahs }) => surahs()).then((ss) => {
    stop = playAll(n, 1, ss[n - 1].ayas, (v) => { playing = v; render(); }, (ok) => { stop = null; playing = 0; if (ok) { markMeet(n); save(); } render(); });
    render();
  });
});
render();
