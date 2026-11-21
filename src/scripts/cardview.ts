// The back of a word card: meaning, other senses, root, and up to 3 real verses with the word marked.
import { esc, base } from './util';
import { t, pick, lang } from './i18n';
import { surah, roots, rootMeans, items, type Item } from './data';
import { verseHtml, playBtn } from './verse';
import { knownIdx } from './coverage';
import { trText } from './trans';
import { state } from './store';

const PERSON: Record<string, [string, string]> = {
  '1S': ['I, me, my', 'ben, beni, benim'], '1P': ['we, us, our', 'biz, bizi, bizim'], '2MS': ['you (one man), your', 'sen (erkek), senin'], '2FS': ['you (one woman), your', 'sen (kadın), senin'],
  '2D': ['you two, your', 'siz ikiniz, sizin'], '2MP': ['you (all), your', 'siz, sizin'], '2FP': ['you (women), your', 'siz (kadınlar), sizin'], '3MS': ['he, him, his, it', 'o, onu, onun'],
  '3FS': ['she, her, it', 'o (dişil), onu, onun'], '3D': ['they two, them, their', 'o ikisi, onları, onların'], '3MP': ['they, them, their', 'onlar, onları, onların'], '3FP': ['they (women), them, their', 'onlar (kadınlar), onların'],
};
/** Short meaning shown on a card. Lemmas: Açık Kuran's most common word-by-word meaning. Prefixes: the corpus function. Pronouns: person. */
/** Grammar roles of function words (corpus tagset), in plain English and Turkish grammar terms. */
export const ROLE: Record<string, [string, string]> = {
  N: ['noun', 'isim'], PN: ['proper noun', 'özel isim'], ADJ: ['adjective', 'sıfat'], V: ['verb', 'fiil'], IMPN: ['verbal noun (command)', 'emir ismi'],
  PRON: ['pronoun', 'zamir'], DEM: ['pointing word (this, that)', 'işaret ismi (bu, şu)'], REL: ['relative word (who, which, what)', 'ilgi zamiri (ki o, olan)'],
  T: ['time word', 'zaman zarfı'], LOC: ['place word', 'yer zarfı'], P: ['preposition', 'harf-i cer (edat)'], CONJ: ['and-word (conjunction)', 'bağlaç'],
  SUB: ['that (subordinating)', 'masdar edatı (ki, -mesi)'], ACC: ['inna-type particle', 'inne ve kardeşleri'], NEG: ['negation (not, no)', 'olumsuzluk edatı'],
  COND: ['condition (if, whoever)', 'şart edatı (eğer)'], INTG: ['question word', 'soru edatı'], RES: ['restriction (only)', 'sınırlama edatı (ancak)'],
  EXP: ['exception (except)', 'istisna edatı (-den başka)'], CERT: ['certainty (indeed)', 'kesinlik edatı (muhakkak)'], PREV: ['preventive particle', 'engelleyici edat'],
  SUP: ['extra particle (emphasis)', 'zait edat (pekiştirme)'], PRO: ['prohibition (do not)', 'yasaklama edatı (yapma)'], VOC: ['calling (O …!)', 'nida edatı (ey)'],
  FUT: ['future (will)', 'gelecek edatı'], AMD: ['correction (but rather)', 'istidrak edatı (fakat)'], ANS: ['answer word', 'cevap edatı'], INC: ['beginning particle', 'başlangıç edatı'],
  EMPH: ['emphasis', 'pekiştirme'], INT: ['interpretation (that is)', 'tefsir edatı'], CAUS: ['cause (so that)', 'sebep edatı'], CIRC: ['circumstance (while)', 'hal edatı'],
  COM: ['together with', 'beraberlik'], EQ: ['equalization (whether)', 'eşitlik edatı'], EXH: ['urging (why not)', 'teşvik edatı'], EXL: ['explanation', 'açıklama'],
  REM: ['resumption (then, so)', 'isti\'naf'], RET: ['retraction (rather)', 'idrab (bilakis)'], RSLT: ['result (then)', 'sonuç'], SUR: ['surprise (behold)', 'şaşırma (bir de baktı ki)'], DET: ['the', 'belirlilik'],
};
/** Who is acting in a verb, and when: from the corpus features of that exact word (e.g. 'IMPF|1S|0' → "I · present"). */
const PERS: Record<string, [string, string]> = { '1S': ['I', 'ben'], '1P': ['we', 'biz'], '2MS': ['you (masculine)', 'sen (eril)'], '2FS': ['you (feminine)', 'sen (dişil)'], '2D': ['you two', 'siz ikiniz'], '2MD': ['you two', 'siz ikiniz'], '2MP': ['you (all)', 'siz'], '2FP': ['you (feminine plural)', 'siz (dişil)'], '3MS': ['he / it', 'o (eril)'], '3FS': ['she / it', 'o (dişil)'], '3MD': ['they two', 'o ikisi'], '3FD': ['they two', 'o ikisi'], '3D': ['they two', 'o ikisi'], '3MP': ['they', 'onlar'], '3FP': ['they (feminine)', 'onlar (dişil)'] };
const ASP: Record<string, [string, string]> = { PERF: ['past', 'geçmiş zaman'], IMPF: ['present / future', 'şimdiki-geniş zaman'], IMPV: ['command', 'emir'] };
/** The person of a verb tag in the reader's language ('IMPF|1S|0' → 'I'), for "who is doing it?" questions. */
export const personOf = (tag: string | undefined) => { const per = tag?.split('|')[1]; return per && PERS[per] ? PERS[per][lang() === 'tr' ? 1 : 0] : ''; };
export const PERSON_OPTIONS = () => ['1S', '1P', '2MS', '2MP'].map((k) => PERS[k][lang() === 'tr' ? 1 : 0]);
/** The who-question uses only I / we / you verbs: there grammar and speaker/addressee agree (Phase 4 review). */
export const isFirstSecond = (tag: string | undefined) => /^(1|2)/.test(tag?.split('|')[1] || '');
export function grammarLabel(tag: string | undefined) {
  if (!tag || !tag.includes('|')) return '';
  const [asp, per, pass] = tag.split('|'), L = lang() === 'tr' ? 1 : 0;
  return [PERS[per]?.[L], ASP[asp]?.[L], pass === '1' ? (L ? 'edilgen' : 'passive') : ''].filter(Boolean).join(' · ');
}
/** Who appears in a verse, from grammar only (Phase 4): the persons of its verbs and pronouns, in order of first appearance.
 *  This names grammatical persons ("we", "you"), never who they refer to — that would be commentary. */
export function cuesOf(v: { w: [number[], string | null, string | null, string | null, string][] }, all: Item[]) {
  const seen: string[] = [];
  for (const w of v.w) {
    const per = w[4]?.includes('|') ? w[4].split('|')[1] : '';
    if (per && PERS[per] && !seen.includes(per)) seen.push(per);
    for (const x of w[0]) { const it = all[x]; if (it.k === 'pr' && it.person && PERS[it.person] && !seen.includes(it.person)) seen.push(it.person); }
  }
  const L = lang() === 'tr' ? 1 : 0;
  return [...new Set(seen.map((p) => PERS[p][L]))];
}
export const roleOf = (x: Item) => (x.id.includes('#') ? x.id.slice(x.id.indexOf('#') + 1) : x.pos);
export const roleLabel = (x: Item) => { const r = ROLE[roleOf(x)]; return r ? (lang() === 'tr' ? r[1] : r[0]) : x.pos; };
export function meaning(x: Item, tags?: Record<string, { ar: string; en: string }>) {
  if (x.k === 'l' && x.id.includes('#')) { const g = pick(x.gl?.tr, x.gl?.en); return g ? `${roleLabel(x)} · ${g}` : roleLabel(x); }
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

export async function cardBack(x: Item): Promise<string> {
  if (x.k === 'ph') return phraseBack(x);
  const [rs, rm, k, all] = await Promise.all([roots(), rootMeans(), knownIdx(), items()]);
  const L = lang();
  let h = `<p class="mean">${esc(meaning(x)) || '—'}</p>`;
  if (x.k === 'l' && x.senses) { const s = (L === 'tr' ? x.senses.tr : x.senses.en).slice(x.id.includes('#') ? 0 : 1); if (s.length) h += `<p class="note" style="text-align:center">${t('senses')}: ${s.map(([g, n]) => `${esc(g)} (${n})`).join(' · ')}</p>`; }
  h += `<p class="note" style="text-align:center">${t('times', { n: x.n })} · ${t('rank', { r: x.r })}</p>`;
  if (x.root && rs[x.root]) {
    const R = rs[x.root], m = rm[x.root];
    const fam = R.items.filter((i) => all[i].id !== x.id).slice(0, 6).map((i) => `<a class="chip ar" style="font-size:20px" href="${base()}words/?id=${encodeURIComponent(all[i].id)}">${esc(all[i].ar)}${k[i] ? ' ✓' : ''}</a>`).join('');
    h += `<div class="sec"><div class="sh">${t('root')} <a href="${base()}library/roots/?r=${encodeURIComponent(x.root)}"><span class="ar" style="font-size:20px">${esc(R.ar)}</span></a> · ${t('family', { n: R.items.length, c: R.n })}</div>`;
    if (R.tw && L === 'tr') h += `<p style="margin:6px 0"><b>Türkçede:</b> ${esc(R.tw)} <span class="src">(Açık Kuran)</span></p>`;
    if (m) h += `<p class="note root-mean clamp">${esc(pick(m.tr, m.en))}</p>`;
    if (fam) h += `<div class="chips" style="margin-top:10px">${fam}</div>`;
    h += '</div>';
  }
  if (x.ex.length) {
    h += `<div class="sec"><div class="sh">${t('heardIn')}</div>`;
    // Examples from your own surahs first (the review asked for verses you actually hear), each with its translation.
    const mine = (x.ex30 || []).filter((r) => state.my.includes(+r.split(':')[0]));
    for (const ref of [...new Set([...mine, ...x.ex])].slice(0, 3)) {
      const [s, v, w] = ref.split(':').map(Number), V = (await surah(s))[v - 1], W = V.w[w - 1];
      h += `<div style="margin-top:6px">${verseHtml(V, k, { mark: w - 1 })}<div class="row" style="justify-content:space-between"><span class="ref">${s}:${v} · <span class="ar" style="font-size:18px">${esc(V.t[w - 1])}</span>${pick(W[1], W[2]) ? ` = ${esc(pick(W[1], W[2]))} <span class="src">(${t('meaningHere')})</span>` : ''}</span>${playBtn(s, v, t('play'), 'sm')}</div><p class="tl note" style="margin-top:2px">${esc(trText(V))}</p></div>`;
    }
    h += `<p class="src" style="margin-top:8px">${t('srcAk')}</p></div>`;
  }
  return h;
}

/** Back of a phrase card: word-by-word meanings in order, how often it occurs, and where, with the translation. */
async function phraseBack(x: Item) {
  let h = `<p class="mean">${esc(pick(x.gl?.tr, x.gl?.en)) || '—'}</p><p class="note" style="text-align:center">${t('phraseTimes', { n: x.n })}</p><div class="sec"><div class="sh">${t('heardIn')}</div>`;
  for (const ref of x.ex.slice(0, 2)) {
    const [s, v, w] = ref.split(':').map(Number), V = (await surah(s))[v - 1];
    h += `<div style="margin-top:6px">${verseHtml(V, null, { range: [w - 1, x.len || 3] })}<div class="row" style="justify-content:space-between"><span class="ref">${s}:${v}</span>${playBtn(s, v, t('play'), 'sm')}</div><p class="tl note">${esc(trText(V))}</p></div>`;
  }
  return h + `<p class="src" style="margin-top:8px">${t('phraseSrc')}</p></div>`;
}
