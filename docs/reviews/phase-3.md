# Phase 3 review: critic (2026-11-21)

Tested as Umut at 390 × 844, `tr-TR` (`en-GB` once). Day 1 clean, days +1 to +4 by moving the clock, day 30 from `seed-state.mjs 300 tr`. I added Nebe (78) to My surahs to get 3-verse passages.

**Limits.** I could not hear anything: I served a silent file (so "ended" fires) or made the audio fail. I cannot judge recitation or difficulty by ear; I judged the questions by reading them.

## 1. Verdict
The ladder works as a flow, and the 1-3-7-14 day schedule works. But the listening checks mostly do not test listening. For his default surahs every wrong option comes from a *different* surah he already knows, so he can answer from the surah name on the "before you listen" card. The self-report is asked after the score is shown. Fix these before Phase 4, or the check numbers will flatter again.

## 2. Phase 2 problems
1. Turkish card meanings: **partly.** My sample of the top 500: 16 of 30 verbs and 12 of 30 nouns are dictionary-like (details in §4.5).
2. Ear-first: **partly.** Play is required ([08](phase-3/08-ear-card-before-play.png)), but tap play then pause unlocks it. 3 ear cards in 18 (was 0). The word is printed after "Ayeti göster".
3. Who-question with text shown: **partly.** It now comes after listening, but the verb is still printed.
4. Joined-word giveaways: **partly.** Options are now grammatical, but the printed word still shows the ending (شَانِئَكَ: ـكَ / ـكُمْ / ـكُنَّ).
5. Checks too easy: **not**, for the ladder (§4.1). Verse-level check not re-tested.
6. Phase 2 not in Today: **fixed.** The practice row rotates (joined words, whole surah, phrases).
7. Placement: **fixed** (40 words).
8. Lessons, phrase meanings, "meaning here" word order: **not re-checked.** "1 gün sonra" is still there.

## 3. What works in Phase 3
- Clear flow: context → listen with no text → questions → self-report → text with tap meanings → listen again ([02](phase-3/02-listen-no-text.png)). Text off is really off: no reference while listening or answering.
- Unlimited replays; 0.7× and 0.85×. Failed audio is honest: "Alıştırma sayılır", not counted.
- Narrow listening works: İhlas came back on day +1, then +4 (3 days later), then due on +11. Missed passages stay due. Today shows "Tekrar dinle: Nebe 78:1–3 · 3 pasaj bekliyor" ([07](phase-3/07-today-passage-due.png)).
- Results per passage on the ladder page: "6 soruda 3 doğru, 2 kez dinlendi".
- For long surahs, same-surah wrong options are decent (Nebe 78:1–3). No tap target under 48 px.

## 4. Problems, most important first

**1. Whole-surah checks can be passed without listening.** All 11 default surahs have 8 or fewer verses, so all are "whole surah", and wrong options come from the *next* surah. İhlas → Felak lines ("Sığınırım o sabahın Rabbine"). Felak → Nas lines. Nasr → "Ebu Leheb'in elleri kurusun". Fatiha → Bakara ("Elif Lam Mim.", "Bu, kendisinde şüphe olmayan kitaptır") ([03](phase-3/03-fatiha-question.png)). Kevser (EN): the right answer contains "al-Kawthar", the name shown just before. *Why:* it measures surah knowledge, not the ear. *Fix:* wrong options from the *same* surah only; drop options with names (Ebu Leheb, Kevser) or transliterations; for 3-verse surahs ask "what came after X?".

**2. Self-report comes after the score** ([05](phase-3/05-self-after-score.png)). "3 soruda 0 doğru" is the heading, then "Ne kadarını takip ettin?". *Why:* PLAN §1 compares self-report with checks to show over-confidence. Seeing the score first spoils that. *Fix:* ask right after listening, before questions. Store it per passage and show "you said Most · checks 1 of 3" on the ladder row. Today shows "8 kontrolde 1 doğru · takip ettiğini söylediğin: Çoğunu" with no comment; say they disagree.

**3. The who-question is a reading question** ([04](phase-3/04-who-question-qul.png)). It prints the verb (قُلْ, نَعْبُدُ, تَرَ) and asks its person. Umut reads Arabic, so the ن of نَعْبُدُ gives "biz" without hearing. İhlas, Felak, Nas, Kafirun always ask قُلْ → "sen (erkek)", every day. It is counted as a listening check. *Fix:* do not print the verb; ask "who is told to say this?" or "who says 'we worship'?" with the verse translation hidden; vary the verb; do not count it until it needs the ear.

**4. The ladder has no middle rung.** With default surahs there are no 2–4 verse passages at all; one verse jumps to whole surahs. Day 1 offers surahs at "bilinen: %0"; the ≥95% target (PLAN §2) is unused ([01](phase-3/01-ladder-day1.png)). It is a list, not a ladder. *Fix:* split surahs of 5+ verses into 2–3 verse passages; open the whole surah after them.

**5. Turkish meanings still wrong for many common words.** وَعَدَ = "yapıldı" (wrong meaning), سَأَلَ = "istenseydi", تَلَىٰ = "okunurdu", خَشِىَ = "korkanlar", أَنذَرَ = "ben sizi uyardım", شَكَرَ = "şükrederler". Nouns keep endings: رَبّ = "Rabbim", شَمْس = "güneşi", سِحْر = "sihir midir?", ذِكْرَىٰ = "uyarırlardı". PLAN §5d says 144 of 156 verbs are plain; my sample says about half. *Fix:* the build check must also catch passive, plural "they", object pronouns, participles, and Turkish case endings (-i, -ı, -de, -in, -le); G17 dictionary source.

**6. Translations mixed and mislabelled.** Diyanet joins 30 of 55 verses in the default surahs, so the check falls back to Elmalılı. Fatiha: right "O Rahman, Rahim," (Elmalılı) beside 2:163 (Diyanet), labelled "Diyanet İşleri". Style alone can give the answer. *Fix:* all options from one translation, and name it correctly.

**7. Text step repeats joined translations** ([06](phase-3/06-text-step-repeated-range.png)). Felak shows the same "(1-5) De ki: …" five times; Fil "(3-5)" three times. *Fix:* show a joined range once, after its last verse.

**8. Wrong tick on Today.** After a passage, Today ticks the *verse* task ("✓ Bugün 1 ayet dinlendi") and keeps the ladder task open. *Fix:* count passages separately.

**9. Smaller.** Same options return on day +1 and +4, so answers get memorised. Stopping the first play gives no way to the questions. "Bu ayeti 1 gün sonra" for a passage. Sahih has "Muúammad" 264 times (broken ḥ, 78 files). One ear card showed "istisna edatı (-den başka)" before play: the answer.

## 5. Missing for the goal, ranked
1. Checks that need the ear (same-surah options, "what came next").
2. Who speaks to whom: Fil addresses "you"; Kafirun contrasts "I" and "you". No question uses this.
3. Replay one verse during text-off listening.
4. A predict step before listening (Vandergrift & Tafaghodtari 2010).
5. Self-report vs check per passage.
6. Speed or reciter change across days (waiting for Umut).

## 6. Top 7 changes

**Do a short Phase 3.1 (about 0.5 session) before Phase 4.** Phase 4 context cards will make the giveaway worse: a card saying what İhlas is about makes cross-surah options trivial.

1. Same-surah wrong options only; no names, transliterations or surah-name words; order questions for 3-verse surahs. *(3.1)*
2. Self-report before the questions, stored per passage, mismatch said plainly. *(3.1)*
3. Who-question without the printed verb, varied, not counted until fair. *(3.1)*
4. One translation per question with a correct label; joined ranges shown once; fix the Today tick and "Muúammad". *(3.1)*
5. Phase 4: sourced "before you listen" cards (topic, who is addressed) that are **never** the answer to the check.
6. Phase 4: surah-map sections become the ladder's middle rung (2–3 verses); the whole surah opens after.
7. Phase 4: grammar speaker cues (قُلْ، قالَ, person endings) shown *after* listening, and used for "who says this?" questions without text.

Keep G17 (Turkish dictionary source) open; it blocks every meaning-based question.
