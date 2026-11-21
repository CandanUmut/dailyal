# Phase 4 review (sourced part): critic (2026-11-21)

Tested as Umut at 390 × 844, `tr-TR` (`en-GB` once), Day 1 fresh and Day 30 (`seed-state.mjs 300 tr`). Audio was a silent mp3. **I could not hear anything**, so I judged the questions by reading them, not by ear.

## 1. Verdict
Phase 3.1 fixed the main cheat: questions now use only the same surah, and the self-report comes first. The checks are much fairer. But Phase 4 adds little for the goal (who speaks, to whom). The "persons" line names grammar, not people. It is sometimes wrong and often confusing. It misses "sen" in إِيَّاكَ, the key "to whom" of the Fatiha. Search only finds dictionary forms, so a word copied from a verse (الرحمن, يعلمون) finds nothing. G17 has not moved: nouns are slightly worse than in Phase 3. **Do not build more context on top yet. Fix the data first.**

## 2. Phase 3 problems
| # | Problem | Status |
|---|---|---|
| 1 | Options from other surahs | **Fixed.** All options are from the same surah, in all 9 passages I tried. New bug: duplicate options (§4.3). |
| 2 | Self-report after the score | **Partly.** Now asked first ([02](phase-4/02-self-before-questions.png)), and the score page says when they disagree. Today still shows "8 kontrolde 3 doğru · takip ettiğini söylediğin: Çoğunu" with no comment. The ladder row does not show the self-report. |
| 3 | Who-question printed the verb | **Partly.** There is no text now: you replay the verse, and قُلْ is skipped. But the question can be unfair (§4.2). |
| 4 | Mixed translators | **Fixed.** One translator per question, named correctly. |
| 5 | Joined ranges repeated | **Fixed.** Fil 105:1–3 shows Diyanet's "(3-5)" text, so verses 4–5 are given away before that passage is heard. |
| 6 | "Muúammad" | **Fixed.** 0 files; "Muḥammad" is shown. |
| 7 | Today ticked the wrong task | **Fixed.** The ladder task is ticked; the verse task stays open. |
| 8 | No middle step | **Partly.** 2–4 verse passages exist. But the list puts **whole surahs first**: on Day 30, Kureyş whole (39% known) comes before Kafirun 109:1–3 (93%) ([01](phase-4/01-ladder-day30.png)). The 95% target is still unused. |
| 9 | "Bu ayeti 1 gün sonra" for a passage | **Not fixed.** In English: "in 1 days", "1 times". |

## 3. What works now
- Clear flow: context → listen, no text → self-report → questions → text → listen again.
- "What came right after this?" works well for İhlas, Felak, Fatiha and Tebbet.
- The who-question needs the ear: for نَعْبُدُ the ن must be heard.
- Reader section headers with the known % (Bakara, Day 30: 88 / 68 / 82 / 73 / 61%) help pick what to hear.
- Bakara and Yasin page by 40 verses and keep the scroll position. "2:255" in search opens the verse.
- No tap target under 48 px.

## 4. Problems, most important first

**1. The pronoun data has holes, so "who / to whom" is missing exactly where Umut prays.** In 1:5, إِيَّاكَ shows only "Şahıslar: biz". The "sen" (to You) is missing. In 1:6, ٱهْدِنَا shows "sen (erkek)" but not "biz" (guide **us**) ([05](phase-4/05-reader-fatiha-cues.png)). I compared the data with the corpus file: **all 24** إِيَّا forms have no person, and **438** verbs lose an object pronoun (نا, ني: 2:32 عَلَّمْتَنَا, 2:40 فَٱرْهَبُونِ). The card for إِيَّاكَ says "zamir · kendisinden". *Why:* these pronouns carry who is addressed, which is the goal. *Fix:* build the item from every corpus PRON segment (stem person for إِيَّا, every suffix); add a build test against the corpus count.

**2. The "persons" line and the who-question teach grammar agreement, not who.** Ayat al-Kursi gets "o (eril) · o (dişil) · onlar · o ikisi" ([06](phase-4/06-reader-255-persons.png)): "she" is sleep (سِنَة), "the two" are heavens and earth. It never claims who is meant (good), but a learner reads "a woman and two people". In Tebbet 1, "İşi kim yapıyor?" expects "o (dişil)" (تَبَّتْ, the hands). "onlar", the answer of someone who understood, is marked wrong ([04](phase-4/04-who-tebbet-feminine.png)). Fil 105:4 (the birds) has the same problem. For يُولَدْ (passive), "who does it" is the wrong question. Also, Allah is labelled "sen (erkek)" in 1:6–7. To a Turkish reader "erkek" means a man; the grammar word is "eril". *Fix:* show only 1st and 2nd persons (I / we / you: the speaker and the addressee). Ask "who says this?" or "who is spoken to?" only for verbs with a 1st or 2nd person. Never ask about verbs that are passive or agree with 3FS objects. Use "eril / dişil" everywhere.

**3. Some questions are broken or too thin.** Kafirun "what came right after" showed the same option twice ([03](phase-4/03-kafirun-duplicate-option.png)): Diyanet 109:3 and 109:5 are the same text. Kevser, Asr and Nasr (3 verses) get **only one question**, the who-question. *Fix:* remove duplicate option texts; for 3-verse surahs ask "which was said?" with options from other verses of the same surah.

**4. Search fails a reader of Arabic.** الرحمن or ٱلرَّحْمَٰنِ finds only surah 55, not the word ([08](phase-4/08-search-alrahman.png)). يعلمون finds nothing. قل does not find قَالَ. In Turkish, "kalp" and "korkmak" find nothing, and "bilmek" does not find عَلِمَ. English "know" does find it. *Fix:* strip ال and the prefixes; search verse word forms (map form → lemma); search Turkish by stem; prefer exact matches.

**5. The ladder is still a list.** Whole surahs come first, and there is no "ready (≥95%) / stretch" label. Sections in the reader cannot be sent to the ladder unless the surah is in My surahs. *Fix:* sort passages before whole surahs and by known %; open the whole surah after its passages; add a "listen to this section" button.

**6. Smaller.** Each word tap re-renders every loaded verse (about 0.5 s for 286 verses on a desktop; slower on a phone). The eyebrow repeats "Pasajlar ve sureler". Search highlights the "Kitaplık" tab. Smooth scrolling ignores reduced motion.

## 5. G17 sample (top 500, `k==='l'`, no `#`; 156 verbs, 224 nouns, fixed random seed)
**Verbs: 19 of 30** dictionary-like. **Nouns: 11 of 30.** Phase 3 was 16 and 12. I counted any plain verb form with the right meaning as fine, and a noun with no case or possessive ending as fine.

Bad examples:
- وَعَدَ = "yapıldı" (wrong meaning; still unfixed since Phase 3)
- كَتَبَ = "yazıldı" (passive for an active verb)
- نَسِىَ = "fakat o unuttu"
- مُسْلِم = "teslim olanlarız"
- ذَنب = "günahlarımızı"

Cheap partial fix: in **55 of 224** top nouns the plain form is already in the data but not chosen: يَوْم "günü" (gün 23×), شَىْء "şeyi" (şey 53×), سَمَآء "göklerde" (gök 14×), مَال "mallarını" (mal 7×). It does not close G17.

## 6. Top 7 next changes, in order
1. **Fix the pronoun data** (إِيَّا + all object suffixes), with a test against the corpus. *(bug fix)*
2. **Noun glosses:** prefer the plain sense that is already in the data; fix وَعَدَ and كَتَبَ. *(small)*
3. **Decide G17** (A, B or C in PROGRESS). **Umut's decision.** It blocks every meaning-based question.
4. **Rework the persons line and the who-question:** only "I / we / you", the questions "who says this?" and "who is spoken to?", "eril" instead of "erkek". **Umut's decision**, because it changes how a feature works.
5. **Question fixes:** no duplicate options; more than one question for 3-verse surahs; a mismatch note on Today; the self-report on the ladder row; "pasaj" wording, "1 day". *(small)*
6. **Ladder order:** passages before whole surahs, sorted by known %, a "ready / stretch" label, and "listen to this section" from the reader. **Umut's decision** (it changes the default order).
7. **Search:** inflected forms and ال, Turkish stems, exact matches first. *(medium, about 0.5 session)*

Topic cards (G11) should wait until 1–4 are done.
