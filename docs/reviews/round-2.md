# Round 2 review: critic (2026-11-21)

Tested as Umut: 390 × 844, touch, `tr-TR` (`en-GB` + dark once). Fresh Day 1: Today → Al-Fatiha → all 5 steps. Then the reader (İhlas, Felak, Duha 6–8, Yasin 1–5, Alaq 1–2) and 2:255. **148 word sheets opened.** Day 30 with `seed-state.mjs 300 tr`. Audio was a silent mp3: **I could not hear anything.** Tests: 19/19 pass, but none covers the sheet or the units.

## 1. Verdict
Today is now simple: one card, one button ("Devam et · Tanış"). I knew what to do in a second. The sheet is fast (median 51 ms, slowest 241 ms, desktop). **When it works, it is the best thing in the app:** ضَآلًّا is "şaşırmış" in 93:7, but the same word is "sapmışların" in 1:7. That is exactly "word selection and meaning".

But in **Fatiha and İhlas, which Umut prays daily**, the sheet and the quiz show wrong word meanings. "Başka ayetlerde" often shows only Turkish endings. Root meanings are walls of text. **Daily use: probably yes. Real help with understanding: partly, and it also teaches some errors.** Fix the meanings before merging.

## 2. What truly helps (keep)
- **Today and the unit page:** one button, clear steps with counts and ticks ([01](round-2/01-today-day1.png), [02](round-2/02-unit-fatiha-follow.png)).
- **"Başka ayetlerde", good cases:**
  - دِين = "ceza" (82:15)
  - هَدَى = "gösterdik" (90:10)
  - أَحَد = "tektir", but "hiç kimse" (89:26)
  - عُقْدَة = "düğüm" (20:27), "akit" (2:237)

  ([06](round-2/06-sheet-dalla-other-verses.png))
- **Joined parts:** إِيَّاكَ shows أَنْتَ "sen". The Phase 4 hole is closed here.
- **Family chips and loanwords:** فَالِق "yaran" under ٱلْفَلَقِ; ilim, âlem, malûm. A real joy for a Turkish reader.
- **Sheet basics:** focus goes to ✕ (48 px), Esc closes it, focus returns to the word. It works in dark mode ([07](round-2/07-sheet-falaq-en-dark.png)).

## 3. Problems, most important first

**1. Wrong "in this verse" meanings in the prayer surahs.**
- 1:7: the first عَلَيْهِمْ is "kimselerin" ([05](round-2/05-sheet-fatiha-alayhim-wrong.png)).
- 112:3: يَلِدْ is "doğurduğu", يُولَدْ is "doğuranı" (a passive shown as active), لَمْ is "yoktur".

This is Açık Kuran's data, which follows Turkish word order. But the app shows it as fact, and **the fill quiz grades it**: "kimselerin" is the "right" answer for عَلَيْهِمْ. *Why it matters:* the passive يُولَدْ is exactly the word choice Umut wants to see, and the app gets it backwards. *Fix:* check every word of the 14 path surahs against the corpus English gloss. Keep the mismatches out of quizzes. Show the English gloss as a labelled check line. **Umut decides** how to show a sourced but wrong meaning.

**2. "Başka ayetlerde" picks different strings, not different meanings.** 12 of the 74 dictionary forms I opened show only endings: ٱللَّه = Allah / Allah'ın / Allah'a / ve Allah ([03](round-2/03-sheet-allah-other-verses.png)). The same happens for رَبّ, حَمْد, عَبَدَ, أَعُوذُ and مِن. Many more are mostly endings. The subtitle promises "bağlamın anlamı nasıl şekillendirdiğini gör", so it misleads. The cards repeat it: "Diğer anlamları: Rabbidir (12) · Rabbine (9)". Each example has two audio buttons (▶ and "Dinle"), so the sheet gets long. *Fix:* compare by stem or by the English gloss. If nothing differs, show one line: "Hep aynı anlamda". Show at most 3 examples, with one ▶ each.

**3. English leaks into Turkish.** 9 of 148 sheets have English as the main meaning: أَلَمْ "Did not (İng.)", لَا "Not (İng.)" (2:255). 11 sheets have it among the other verses: فِى "go (İng.)". *Fix:* skip these places in the other verses. In the main slot, say there is no Turkish meaning and label the English.

**4. Root meanings overwhelm and sometimes mislead.** Most run to 260 characters. Some start with an unrelated sense: غَيْر "getirmek, iletmek"; عون "Orta yaşlı olmak"; فلق "…tombul olmak"; رب "şef, gardiyan". There are English leftovers ("Alif-Lam-Lam-ha", "Yashirru"). *Fix:* show the first clause (about 80 characters) and put the rest behind "Devamını oku". Show at most 5 loanwords, on their own line.

**5. A step that is empty but "done".** 4-verse surahs (İhlas, Kureyş) get no passages: "Dinle 0 / 0 ✓". On Day 1 the path already marks them half-done. *Fix:* use 2 + 2 passages, or leave the step out of progress.

**6. "Kulaktan takip ediyorsun" claims more than it checks.** I passed Fatiha's check with 2 of 3, from "Bundan hemen sonra ne geldi?" questions. You can answer those from memory, and the audio was silent. Right after, the app said "4 kelimenin 0 tanesini biliyorsun". *Fix:* at least 4 questions, one per passage or more. Show words you are still learning separately from 0%. **Umut decides** the wording of "followed".

**7. Accessibility and layout.**
- Tab leaves the open sheet (`aria-modal`, but focus is not trapped).
- "Bu kökün bütün kelimeleri ›" is 16 px tall.
- The Meet play button is behind the tab bar.
- The reader's first verse starts at the bottom of the screen, under the controls ([04](round-2/04-reader-ikhlas.png)). That is not "Arabic first".

**8. Smaller.**
- "مَٰلِك2" (an internal id) appears in a family.
- The هُوَ sheet says "Ona bitişik: هُوَ"; لَهُۥ has no dictionary form.
- أَعُوذُ shows the form عُذْ.
- "Kelimeler 0 / 30" counts ال, و and بِ, and needs 3 sessions.
- In a unit, the verse page opens with "Daha uzun dinleme ›", a link out of the unit.
- İhlas is called "Özgüleme".
- Fatiha in one sitting is about 180 taps, roughly 40 minutes against the brief's 15. Nothing suggests a stopping point.

**Day 30:** the seed has no unit progress, so it looks like Day 1 ([08](round-2/08-today-day30.png)). The order is sensible (Kafirun, Nasr early); the false half-done marks show again; You is clear. The seed needs unit progress before Day 30 can be judged honestly.

## 4. Word-sheet audit: 8 of 15 genuinely helpful
"Helpful" means the meaning here is right **and** at least one layer adds understanding without misleading.

| Word | Verdict |
|---|---|
| مَٰلِكِ 1:4 | ✓ (but "مَٰلِك2") |
| ٱلدِّينِ 1:4 | ✓ "ceza" (82:15) |
| إِيَّاكَ 1:5 | ✓ bana / size / O'na |
| ٱهْدِنَا 1:6 | ✓ "ilet" against "göster" |
| أَحَدٌ 112:1 | ✓ |
| ٱلْفَلَقِ 113:1 | ✓ root + family |
| ٱلْعُقَدِ 113:4 | ✓ |
| ضَآلًّا 93:7 | ✓ |
| ٱلصَّمَدُ 112:2 | ~ the root explains Samed, after "vurmak, süslemek" |
| ٱللَّهِ 1:1 | ✗ endings only, long root text |
| رَبِّ 1:2 | ✗ endings only; "şef, gardiyan" |
| أَعُوذُ 113:1 | ✗ endings only; form عُذْ |
| عَلَيْهِمْ 1:7 | ✗ **wrong**: "kimselerin" |
| يُولَدْ 112:3 | ✗ **wrong**: "doğuranı" |
| لَا 2:255 | ✗ "Not (İng.)" |

## 5. Top 7 fixes before merging, in order
1. **Audit the meanings of the 14 path surahs** against the corpus gloss; take mismatches out of quizzes; add a test. *(Umut decides how to show them.)*
2. **"Başka ayetlerde": real differences only**, at most 3 examples, one ▶ each, else "Hep aynı anlamda". The same rule on the cards.
3. **No "(İng.)" in Turkish mode.**
4. **Shorter root meaning**, with loanwords on their own line.
5. **Fix the empty Dinle step** and the false half-done marks.
6. **Accessibility:** focus trap, a 48 px root link, play buttons above the fold, the first verse visible in the reader.
7. **Small bugs:** "مَٰلِك2", the هُوَ/لَهُۥ sheets, عُذْ; unit progress in the seed.

**For Umut to decide:** (a) how to show a sourced meaning that is wrong; (b) what "Takip" must require and may claim; (c) whether a unit should suggest a daily stopping point.
