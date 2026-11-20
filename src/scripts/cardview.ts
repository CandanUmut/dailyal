// The back of a word card: meaning, other senses, root, and up to 3 real verses with the word marked.
import { esc, base } from './util';
import { t, pick, lang } from './i18n';
import { surah, roots, rootMeans, items, type Item } from './data';
import { verseHtml, playBtn } from './verse';
import { knownIdx } from './coverage';

const PERSON: Record<string, [string, string]> = {
  '1S': ['I, me, my', 'ben, beni, benim'], '1P': ['we, us, our', 'biz, bizi, bizim'], '2MS': ['you (one man), your', 'sen (erkek), senin'], '2FS': ['you (one woman), your', 'sen (kadın), senin'],
  '2D': ['you two, your', 'siz ikiniz, sizin'], '2MP': ['you (all), your', 'siz, sizin'], '2FP': ['you (women), your', 'siz (kadınlar), sizin'], '3MS': ['he, him, his, it', 'o, onu, onun'],
  '3FS': ['she, her, it', 'o (dişil), onu, onun'], '3D': ['they two, them, their', 'o ikisi, onları, onların'], '3MP': ['they, them, their', 'onlar, onları, onların'], '3FP': ['they (women), them, their', 'onlar (kadınlar), onların'],
};
/** Short meaning shown on a card. Lemmas: Açık Kuran's most common word-by-word meaning. Prefixes: the corpus function. Pronouns: person. */
export function meaning(x: Item, tags?: Record<string, { ar: string; en: string }>) {
  if (x.k === 'l') return pick(x.gl?.tr, x.gl?.en);
  if (x.k === 'pr') { const p = PERSON[x.person!]; return p ? (lang() === 'tr' ? p[1] : p[0]) : x.person!; }
  return PREFIX_MEAN[x.id]?.[lang() === 'tr' ? 1 : 0] || '';
}
// Prefix meanings: the corpus tagset names the functions (CONJ, P, DET …); the plain glosses are checked against
// how Açık Kuran's word-by-word renders words that carry the prefix (docs/research/particles.md).
const PREFIX_MEAN: Record<string, [string, string]> = {
  'p:wa': ['and (also: by — in oaths)', 've (yeminlerde: andolsun)'], 'p:fa': ['so, then', 'sonra, böylece, o hâlde'], 'p:al': ['the', 'belirlilik eki (Türkçede karşılığı yok)'],
  'p:bi': ['with, by, in', 'ile, -de, -e'], 'p:la': ['for, to (li-); surely (la-)', 'için, -e (li-); elbette (le-)'], 'p:ka': ['like, as', 'gibi'], 'p:a': ['question: is it…?', 'soru: …mı?'],
  'p:sa': ['will (future)', '-ecek (gelecek)'], 'p:ya': ['O! (calling)', 'Ey!'], 'p:ha': ['O! (calling, with ayyuhā)', 'Ey! (ayyuhā ile)'], 'p:ta': ['by (in oaths: by Allah)', 'andolsun (yeminde)'],
};

export async function cardBack(x: Item) {
  const [rs, rm, k, all] = await Promise.all([roots(), rootMeans(), knownIdx(), items()]);
  const L = lang();
  let h = `<p class="mean">${esc(meaning(x)) || '—'}</p>`;
  if (x.k === 'l' && x.senses) { const s = (L === 'tr' ? x.senses.tr : x.senses.en).slice(1); if (s.length) h += `<p class="note" style="text-align:center">${t('senses')}: ${s.map(([g, n]) => `${esc(g)} (${n})`).join(' · ')}</p>`; }
  h += `<p class="note" style="text-align:center">${t('times', { n: x.n })} · ${t('rank', { r: x.r })}</p>`;
  if (x.root && rs[x.root]) {
    const R = rs[x.root], m = rm[x.root];
    const fam = R.items.filter((i) => all[i].id !== x.id).slice(0, 6).map((i) => `<a class="chip ar" style="font-size:20px" href="${base()}words/?id=${encodeURIComponent(all[i].id)}">${esc(all[i].ar)}${k[i] ? ' ✓' : ''}</a>`).join('');
    h += `<div class="sec"><div class="sh">${t('root')} <a href="${base()}library/roots/?r=${encodeURIComponent(x.root)}"><span class="ar" style="font-size:20px">${esc(R.ar)}</span></a> · ${t('family', { n: R.items.length, c: R.n })}</div>`;
    if (m) h += `<p class="note root-mean clamp">${esc(pick(m.tr, m.en))}</p>`;
    if (fam) h += `<div class="chips" style="margin-top:10px">${fam}</div>`;
    h += '</div>';
  }
  if (x.ex.length) {
    h += `<div class="sec"><div class="sh">${t('heardIn')}</div>`;
    for (const ref of x.ex) {
      const [s, v, w] = ref.split(':').map(Number), V = (await surah(s))[v - 1], W = V.w[w - 1];
      h += `<div style="margin-top:6px">${verseHtml(V, k, { mark: w - 1 })}<div class="row" style="justify-content:space-between"><span class="ref">${s}:${v} · <span class="ar" style="font-size:18px">${esc(V.t[w - 1])}</span>${pick(W[1], W[2]) ? ` = ${esc(pick(W[1], W[2]))} <span class="src">(${t('meaningHere')})</span>` : ''}</span>${playBtn(s, v, t('play'), 'sm')}</div></div>`;
    }
    h += `<p class="src" style="margin-top:8px">${t('srcAk')}</p></div>`;
  }
  return h;
}
