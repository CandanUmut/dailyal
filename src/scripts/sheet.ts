// The word sheet (round 2): tap any word in a verse and see, layer by layer, what it means.
//  1. In this verse: Açık Kuran's word-by-word meaning for this exact place (+ who is acting, for verbs).
//  2. The dictionary form, how often it is in the Quran, and the root's meaning (Açık Kuran, Turkish/English).
//  3. In other verses: the same dictionary form where it is translated differently, each with its translation,
//     so the learner sees how the word is used and how its meaning moves with the context.
//  4. Its family: other words from the same root.
// Everything shown is sourced; nothing is written by us. The Quran text is shown unchanged.
import { state, save, MY_DEFAULT } from './store';
import { surah, surahs, items, roots, rootMeans, vreq, type Verse } from './data';
import { knownIdx } from './coverage';
import { verseHtml, playBtn, toggle } from './verse';
import { meaning, grammarLabel, roleLabel } from './cardview';
import { trText, trName } from './trans';
import { place } from './srs';
import { badge } from './chrome';
import { t, pick, lang } from './i18n';
import { esc, base, toast, $ } from './util';

type Use = { s: number; v: number; w: number; gloss: string; V: Verse };

/** Places of a dictionary form in the Quran, as (surah, verse, word). Scans the per-verse item index. */
async function placesOf(ix: number) {
  const [vr, ss] = await Promise.all([vreq(), surahs()]);
  const out: { s: number; v: number; w: number; len: number }[] = [];
  ss.forEach((S) => { for (let i = S.start; i < S.start + S.ayas; i++) vr[i].forEach((w, wi) => { if (w.includes(ix)) out.push({ s: S.n, v: i - S.start + 1, w: wi, len: vr[i].length }); }); });
  return out;
}

/** Up to n other places where the word is translated differently: your surahs first, then short verses. */
export async function otherUses(ix: number, not: { s: number; v: number } | null, n = 4): Promise<Use[]> {
  const my = new Set(state.my.length ? state.my : MY_DEFAULT);
  const all = (await placesOf(ix)).filter((p) => !not || p.s !== not.s || p.v !== not.v);
  all.sort((a, b) => Number(my.has(b.s)) - Number(my.has(a.s)) || Number(b.s >= 78) - Number(a.s >= 78) || a.len - b.len);
  const cand = all.slice(0, 40), surahsNeeded = [...new Set(cand.map((p) => p.s))].slice(0, 10);
  const loaded = new Map(await Promise.all(surahsNeeded.map(async (s) => [s, await surah(s)] as const)));
  const seen = new Set<string>(), out: Use[] = [];
  for (const p of cand) {
    const vs = loaded.get(p.s); if (!vs) continue;
    const V = vs[p.v - 1], g = pick(V.w[p.w][1], V.w[p.w][2]);
    const key = g.toLocaleLowerCase().replace(/[^\p{L}\s]/gu, '').trim();
    if (!g || seen.has(key)) continue;
    seen.add(key); out.push({ s: p.s, v: p.v, w: p.w, gloss: g, V });
    if (out.length === n) break;
  }
  return out;
}

const firstPart = (s: string, max = 260) => { const x = s.replace(/\s+/g, ' ').trim(); return x.length <= max ? { short: x, more: false } : { short: x.slice(0, x.lastIndexOf(' ', max)) + ' …', more: true }; };

export async function openWordSheet(s: number, v: number, i: number) {
  const [vs, all, rs, rm, k] = await Promise.all([surah(s), items(), roots(), rootMeans(), knownIdx()]);
  const V = vs[v - 1], w = V.w[i], gr = grammarLabel(w[4]);
  const lemma = w[0].map((x) => all[x]).find((x) => x.k === 'l');
  const lix = lemma ? all.indexOf(lemma) : -1;
  const affixes = w[0].map((x) => all[x]).filter((x) => x.k !== 'l');
  let h = `<div class="sheet-ar" lang="ar">${esc(V.t[i])}</div>`;
  h += `<div class="layer"><div class="lh">${t('shHere')}</div><p class="big-mean">${esc(pick(w[1], w[2])) || '—'}</p>${gr ? `<p class="note">${esc(gr)}</p>` : ''}<p class="src">${t('srcAk')} · ${s}:${v}</p></div>`;
  if (affixes.length) h += `<div class="layer"><div class="lh">${t('shParts')}</div><div class="chips">${affixes.map((x) => `<span class="chip static"><span class="ar" style="font-size:20px">${esc(x.ar.split(' · ')[0])}</span>&nbsp;${esc(meaning(x).split(/,| \(/)[0])}</span>`).join('')}</div></div>`;
  if (lemma) {
    const R = lemma.root ? rs[lemma.root] : null, m = lemma.root ? rm[lemma.root] : null;
    h += `<div class="layer"><div class="lh">${t('shDict')}</div><p><a class="wlink ar" style="font-size:30px" href="${base()}words/?id=${encodeURIComponent(lemma.id)}">${esc(lemma.ar)}</a> <span class="note">${esc(roleLabel(lemma))} · ${t('times', { n: lemma.n })}${k[lix] ? ' · ✓' : ''}</span></p>`;
    if (m && pick(m.tr, m.en)) { const fp = firstPart(pick(m.tr, m.en)); h += `<p class="lh2">${t('shRootMean')} <span class="ar" style="font-size:20px">${esc(R!.ar)}</span></p><p class="root-mean" data-full="${esc(pick(m.tr, m.en))}">${esc(fp.short)}</p>${fp.more ? `<button class="linkbtn" data-a="sh-more">${t('shMore')}</button>` : ''}<p class="src">${t('shRootSrc')}</p>`; }
    if (!state.r[lemma.id]) h += `<div class="stackb"><button class="btn quiet" data-a="sh-learn" data-id="${esc(lemma.id)}">${t('addWord')}</button></div>`;
    h += `</div><div class="layer" id="sh-uses"><div class="lh">${t('shOther')}</div><p class="note">…</p></div>`;
    if (R && R.items.length > 1) h += `<div class="layer"><div class="lh">${t('shFamily', { n: R.items.length })}</div><div class="chips">${R.items.filter((x) => x !== lix).slice(0, 8).map((x) => `<a class="chip" href="${base()}words/?id=${encodeURIComponent(all[x].id)}"><span class="ar" style="font-size:20px">${esc(all[x].ar)}</span>&nbsp;<span class="note">${esc((meaning(all[x]) || '').split(',')[0])}</span></a>`).join('')}</div><p class="src"><a href="${base()}library/roots/?r=${encodeURIComponent(lemma.root!)}">${t('shRootPage')}</a></p></div>`;
  }
  show(h);
  if (lix >= 0) {
    const uses = await otherUses(lix, { s, v });
    const el = $('#sh-uses'); if (!el) return;
    el.innerHTML = `<div class="lh">${t('shOther')}</div>` + (uses.length ? `<p class="note">${t('shOtherSub')}</p>` + uses.map((u) => `<div class="use">${verseHtml(u.V, null, { mark: u.w })}<p><b>${esc(u.gloss)}</b> <span class="ref">${u.s}:${u.v}</span></p><p class="tl note">${esc(trText(u.V))}</p><div class="row" style="justify-content:flex-end;gap:8px">${playBtn(u.s, u.v, t('play'), 'sm')}<a class="btn quiet" href="${base()}listen/?v=${u.s}:${u.v}">${t('listen')}</a></div></div>`).join('') + `<p class="src">${t('srcAk')} · ${esc(trName())}</p>` : `<p class="note">${t('shOnly')}</p>`);
  }
}

let lastFocus: HTMLElement | null = null;
function show(inner: string) {
  close();
  lastFocus = document.activeElement as HTMLElement;
  const wrap = document.createElement('div');
  wrap.id = 'sheet'; wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-back" data-a="sh-close"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(t('shTitle'))}"><div class="sheet-top"><span class="grip" aria-hidden="true"></span><button class="sheet-x" data-a="sh-close" aria-label="${esc(t('close'))}">✕</button></div><div class="sheet-body">${inner}</div></section>`;
  document.body.appendChild(wrap); document.body.classList.add('noscroll');
  (wrap.querySelector('.sheet-x') as HTMLElement).focus();
}
export function close() { const s = $('#sheet'); if (s) { s.remove(); document.body.classList.remove('noscroll'); lastFocus?.focus?.(); } }

// Clicks inside the sheet never reach the page's own handlers (links still work).
document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest?.('#sheet')) return;
  e.stopImmediatePropagation();
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (!b) return;
  const a = b.dataset.a!;
  if (a === 'sh-close') close();
  else if (a === 'sh-more') { const p = b.previousElementSibling as HTMLElement; p.textContent = p.dataset.full || ''; b.remove(); }
  else if (a === 'sh-learn') { place(b.dataset.id!, false); save(); badge(); toast(t('added')); b.remove(); }
  else if (a === 'play') toggle(b);
}, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
void lang;
