// UI strings in English and Turkish. Language: the setting, else the device language (Turkish device -> Turkish, else English).
import { state } from './store';
export type Lang = 'en' | 'tr';
export const lang = (): Lang => (state.set.lang === 'tr' || state.set.lang === 'en' ? state.set.lang : (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en');
const S = {
  en: {
    stop: '‹ Stop', left: '{n} left', show: 'Show the meaning', missed: 'Missed', effort: 'With effort', easy: 'Easy', tomorrow: 'tomorrow', days: '{n} days',
    newTag: 'New', again: 'Again', rank: 'rank {r}', times: '{n} times in the Quran', root: 'Root', heardIn: 'Heard in', meaningHere: 'meaning here',
    senses: 'Other meanings, by how often', prefix: 'Prefix', pronoun: 'Pronoun', srcAk: 'Meanings: Açık Kuran word-by-word', play: 'Play the verse', pause: 'Pause',
    reviewTitle: 'Words', reviewSub: 'Say the meaning out loud before you look. Missed words come back tomorrow; known ones after 2, 4, 8, 16 days and on.',
    ready: 'Words ready', caught: 'All caught up', dueNew: '{d} due, {n} new · about {m} min', start: 'Start', doneTitle: 'Done for now', doneSub: '{n} answered, {m} missed. Missed words come back tomorrow.',
    backToday: 'Back to Today', moreNew: 'More new words', missRate: 'Miss rate · last 7 days', missRateNote: 'Shows after 10 first-try answers in a week. Aim for about 1 miss in 10.',
    mr: '{p}% of {a} first tries were missed', mrLow: 'Under 5%: easy for you. You can take more new words a day.', mrOk: 'Between 5% and 15%: a good pace.', mrHigh: 'Over 15%: too many misses. Take fewer new words a day.',
    listen: 'Listen', p1: 'Hear and see', p2: 'Fill', p3: 'Hear only', tapWord: 'Tap any word for its meaning in this place.', showTr: 'Show the translation', hideTr: 'Hide the translation',
    nextFill: 'Next: fill', nextHear: 'Next: hear only', fillQ: 'What does the marked word mean here?', hearQ: 'Listen without the text. Which translation matches?',
    selfQ: 'How much did you follow?', none: 'None', some: 'Some', most: 'Most', all: 'All', nextVerse: 'Another verse', finish: 'Finish',
    correct: 'Right.', wrong: 'Not this one. The right one is marked.', followAll: 'You know every word in this verse.', followN: 'You know {k} of {n} words.',
    again3: 'You will hear this verse again in {n} days.', addWord: 'Learn this word', added: 'Added to your words', knownWord: 'You know this word', reciter: 'Recitation: {r} · everyayah.com', noTextYet: 'The text is hidden. Play, listen, then answer.',
    today: 'Today', todaySub: 'About 15 minutes. Missing a day is fine.', tListen: 'Listen: {ref}', tListenMore: 'One more: {ref}', heardToday: '{n} verse(s) heard today', tListenD: '{why} · about 4 min', whyFollow: 'you know almost every word', whyAgain: 'hearing it again', whyStretch: 'a stretch: some words are new',
    tNew: '{n} new words', tNewD: 'most frequent first · about {m} min', tReview: 'Review {n} words', tReviewD: '{d} due today · about {m} min', tPlace: 'Placement: what do you already know?', tPlaceD: '2–5 minutes, once',
    follow: 'What you would follow if you heard it', versesAll: 'verses where you know every word, of {t}', shareWords: '{p}% of all the words in the Quran are fully known to you (dictionary forms, prefixes and pronouns).',
    stripCap: 'One bar per surah, 1 to 114. Ink height is the share of its words you know.', checks: 'Listening checks · last 7 days', checksN: '{ok} of {tot} right', checksNone: 'No listening checks yet. Each Listen session ends with one.',
    placeTitle: 'What do you already know?', placeSub: 'You will see the most frequent words and parts of the Quran. Try to recall the meaning, then check. Words you know are checked again in a few days.',
    placeKnew: 'I knew it', placeNot: 'I did not', placeDone: 'Placement saved', placeStop: 'Stop here', placeMore: '{n} more', placeResult: '{k} known, {u} to learn.',
    surahs: 'Surahs', mySurahs: 'My surahs', mySub: 'The surahs you recite in prayer or hear often. Their words and verses come first.', inMy: 'In my surahs', addMy: 'Add to my surahs',
    meccan: 'Meccan', medinan: 'Medinan', verses: '{n} verses', order: 'revelation order {n}', sections: '{n} sections', context: 'Before you listen', ctxSrc: 'Type, order and sections: Tanzil metadata. Name meaning: Açık Kuran.',
    allSurahs: 'All surahs', known: '{p}% known', library: 'Library', roots: 'Roots', settings: 'Settings', about: 'About and sources',
    rootsSub: 'Words grouped by their root. Learning one root opens a whole family.', family: '{n} words from this root, {c} times in the Quran', rootMean: 'Root meaning (Açık Kuran)',
  },
  tr: {
    stop: '‹ Bırak', left: '{n} kaldı', show: 'Anlamı göster', missed: 'Bilemedim', effort: 'Zorlandım', easy: 'Kolay', tomorrow: 'yarın', days: '{n} gün',
    newTag: 'Yeni', again: 'Tekrar', rank: '{r}. sırada', times: "Kur'an'da {n} kez", root: 'Kök', heardIn: 'Geçtiği yer', meaningHere: 'buradaki anlamı',
    senses: 'Diğer anlamları, sıklığa göre', prefix: 'Ön ek', pronoun: 'Zamir', srcAk: 'Anlamlar: Açık Kuran kelime meali', play: 'Ayeti çal', pause: 'Durdur',
    reviewTitle: 'Kelimeler', reviewSub: 'Bakmadan önce anlamı sesli söyle. Bilemediğin kelimeler yarın gelir; bildiklerin 2, 4, 8, 16 gün sonra ve sonrasında.',
    ready: 'Hazır kelimeler', caught: 'Hepsi tamam', dueNew: '{d} tekrar, {n} yeni · yaklaşık {m} dk', start: 'Başla', doneTitle: 'Şimdilik bu kadar', doneSub: '{n} cevap, {m} bilinmedi. Bilinmeyenler yarın tekrar gelir.',
    backToday: 'Bugün’e dön', moreNew: 'Daha fazla yeni kelime', missRate: 'Bilememe oranı · son 7 gün', missRateNote: 'Haftada 10 ilk denemeden sonra görünür. Hedef: 10’da yaklaşık 1 hata.',
    mr: '{a} ilk denemenin %{p}’i bilinmedi', mrLow: '%5’in altı: senin için kolay. Günde daha çok yeni kelime alabilirsin.', mrOk: '%5 ile %15 arası: iyi bir hız.', mrHigh: '%15’in üstü: çok hata. Günde daha az yeni kelime al.',
    listen: 'Dinle', p1: 'Dinle ve gör', p2: 'Boşluk', p3: 'Sadece dinle', tapWord: 'Bir kelimeye dokun: bu yerdeki anlamını gör.', showTr: 'Meali göster', hideTr: 'Meali gizle',
    nextFill: 'Sıradaki: boşluk', nextHear: 'Sıradaki: sadece dinle', fillQ: 'İşaretli kelime burada ne anlama geliyor?', hearQ: 'Metin olmadan dinle. Hangi meal uyuyor?',
    selfQ: 'Ne kadarını takip ettin?', none: 'Hiç', some: 'Biraz', most: 'Çoğunu', all: 'Hepsini', nextVerse: 'Başka bir ayet', finish: 'Bitir',
    correct: 'Doğru.', wrong: 'Bu değil. Doğrusu işaretli.', followAll: 'Bu ayetteki her kelimeyi biliyorsun.', followN: '{n} kelimenin {k} tanesini biliyorsun.',
    again3: 'Bu ayeti {n} gün sonra tekrar dinleyeceksin.', addWord: 'Bu kelimeyi öğren', added: 'Kelimelerine eklendi', knownWord: 'Bu kelimeyi biliyorsun', reciter: 'Kıraat: {r} · everyayah.com', noTextYet: 'Metin gizli. Çal, dinle, sonra cevapla.',
    today: 'Bugün', todaySub: 'Yaklaşık 15 dakika. Bir günü kaçırmak sorun değil.', tListen: 'Dinle: {ref}', tListenMore: 'Bir tane daha: {ref}', heardToday: 'Bugün {n} ayet dinlendi', tListenD: '{why} · yaklaşık 4 dk', whyFollow: 'neredeyse her kelimeyi biliyorsun', whyAgain: 'tekrar dinleme', whyStretch: 'biraz zor: bazı kelimeler yeni',
    tNew: '{n} yeni kelime', tNewD: 'en sık geçenler önce · yaklaşık {m} dk', tReview: '{n} kelime tekrarı', tReviewD: 'bugün {d} tane · yaklaşık {m} dk', tPlace: 'Seviye: ne biliyorsun?', tPlaceD: '2–5 dakika, bir kez',
    follow: 'Duysan takip edebileceklerin', versesAll: 'her kelimesini bildiğin ayet ({t} ayetten)', shareWords: "Kur'an'daki kelimelerin %{p}’ini tam biliyorsun (sözlük biçimleri, ön ekler ve zamirler).",
    stripCap: 'Her sure için bir çubuk, 1’den 114’e. Mürekkep yüksekliği, o surenin bildiğin kelime oranı.', checks: 'Dinleme kontrolleri · son 7 gün', checksN: '{tot} kontrolde {ok} doğru', checksNone: 'Henüz dinleme kontrolü yok. Her Dinle oturumu bir kontrolle biter.',
    placeTitle: 'Neleri zaten biliyorsun?', placeSub: "Kur'an'da en sık geçen kelimeler ve ekler gelecek. Anlamı hatırlamaya çalış, sonra kontrol et. Bildiğin kelimeler birkaç gün sonra tekrar sorulur.",
    placeKnew: 'Biliyordum', placeNot: 'Bilmiyordum', placeDone: 'Seviye kaydedildi', placeStop: 'Burada bırak', placeMore: '{n} tane daha', placeResult: '{k} biliniyor, {u} öğrenilecek.',
    surahs: 'Sureler', mySurahs: 'Surelerim', mySub: 'Namazda okuduğun veya sık duyduğun sureler. Kelimeleri ve ayetleri önce gelir.', inMy: 'Surelerimde', addMy: 'Surelerime ekle',
    meccan: 'Mekki', medinan: 'Medeni', verses: '{n} ayet', order: 'iniş sırası {n}', sections: '{n} bölüm', context: 'Dinlemeden önce', ctxSrc: 'Tür, sıra ve bölümler: Tanzil verileri. İsim anlamı: Açık Kuran.',
    allSurahs: 'Bütün sureler', known: '%{p} biliniyor', library: 'Kitaplık', roots: 'Kökler', settings: 'Ayarlar', about: 'Hakkında ve kaynaklar',
    rootsSub: 'Kökü aynı olan kelimeler bir arada. Bir kökü öğrenmek bütün bir aileyi açar.', family: "Bu kökten {n} kelime, Kur'an'da {c} kez", rootMean: 'Kökün anlamı (Açık Kuran)',
  },
} as const;
export type Key = keyof typeof S.en;
export const t = (k: Key, v: Record<string, string | number> = {}) => (S[lang()][k] as string).replace(/\{(\w+)\}/g, (_, x) => String(v[x] ?? ''));
/** The word meaning in the reader's language, falling back to the other one. */
export const pick = (tr: string | null | undefined, en: string | null | undefined) => (lang() === 'tr' ? tr || en : en || tr) || '';
