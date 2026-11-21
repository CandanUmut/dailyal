# Phase 2 review: critic (2026-11-21)

Tested as Umut at 390 × 844, `tr-TR` (`en-GB` once). Day 1 clean; day 30 from `seed-state.mjs 300 tr`.

**Limits.** I could not hear audio: I served a silent file (so "ended" fires) or made it fail. I cannot judge recitation or speed by ear. Açık Kuran meanings cover surahs 1–26 and 78–114; not counted.

## 1. Verdict
A little closer. Phase 2 added the right things by name (who-question, ear-first, whole surah, joined words, phrases, lessons), but almost all of them show the Arabic text while asking. Umut already reads the script, so they train his eye, not his ear. Turkish word meanings are still often wrong. He would come back for the Listen reader, but the new drills are too easy to keep him.

## 2. Phase 1 problems
1. Turkish card meanings: **partly.** هَدَى, أَرْسَلَ, قَالَ are right now. But 88 of 154 verbs in the top 500 are still not the plain "he did" form, by my count (عَبَدَ = "taptıkları", عَمِلَ = "yaparsa", أَنذَرَ = "siz uyardık"), 41 nouns end in "-dir" (يَوْم = "bir gündür"), لَا = "yoktur", مَا = "şeyleri".
2. Listening check: **mostly fixed.** Options wait for the audio to end; no verse reference; audio failure is practice only.
3. Person in "meaning here": **fixed** ("ben · şimdiki-geniş zaman"). But the tense is wrong after لَمْ: يَلِدْ in 112:3 says "şimdiki-geniş zaman".
4. Numbers: **fixed.**
5. Bugs: **mostly fixed.** Left: Settings says "çal'a bastığında"; "Skip to content" in Turkish; English glosses in Turkish mode ("Did not", "Have not", "while not").
6. Card layout: **partly.** Grade buttons stay in reach. Examples still come from other surahs (لِ → 56:38 again).
7. Turkish wording: **partly.** "Ayeti başlat" is good. Still "1 gün sonra", and 1:1 = "Bismillahirrahmanirrahim."
8. Tap targets: **fixed** (none under 44 px on six pages).
9. Placement: **not fixed.** Still 150 cards, labelled "2–5 dakika".

## 3. What works
- Pass 3 hides the text and the reference, and the options appear only after the audio ends. If the audio fails, it says so and does not count it.
- Verb person labels; English glosses are very good.
- The phrase idea is right: يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ (89×), مِن دُونِ ٱللَّهِ (71×).
- "Türkçede: ilim, alem, malum…" on cards is very useful for him.
- Some joined-word items are excellent: دِينِ = دين + ـِي "benim dinim" (109:6), where the ending is hidden in recitation.

## 4. Problems, most important first

**1. Turkish word meanings are still wrong, and PLAN §5c calls them fixed.** See the numbers above. عَبَدَ shows "taptıkları" even when the example is Fatiha's نَعْبُدُ ([05](phase-2/05-card-abada-taptiklari.png)). *Why:* he learns wrong forms of the commonest verbs. *Fix:* a build check for participles (-an/-en, -dığı), conditionals (-sa/-se), "-dir" and wrong person; a sourced dictionary meaning (G17); merge suffix senses. Change §5c to "partly".

**2. The "ear" features train the eye.**
- *Ear-first* ([03](phase-2/03-ear-first-shows-text.png)): "Ayeti göster" works without playing. It then shows the verse, the marked word and the big lemma, so recall is from print. Only 21 of 300 known words qualify (69 occur in My surahs, but only 2 examples per word are stored), then half at random. In a 20-card day-30 session I got **zero** ear cards.
- *Who-question* ([02](phase-2/02-who-question-text-shown.png)): asked with the text on screen, about a word whose answer was shown twice a minute before (the tap label, then "(ben · …)" after the meaning question).
- *Joined words* ([04](phase-2/04-parts-giveaway.png)): the word is printed large. Wrong options use prefixes whose letters are not there (لِلَّهِ vs "فَ + Allah"), or ungrammatical ones ("ٱل + رَءَا"). I could answer every item from the first letter in a second.

*Fix:* ask after hearing, with the text hidden. Require play. Use sound-alike options (بِ / فِى, ـهُمْ / ـكُمْ, ـهُ / ـهَا).

**3. Lessons are word lists, and some teach errors** ([06](phase-2/06-lesson-la-ve.png)). Negation: لَا "ve (77) · yoktur (69)", لَمْ "ve (23) · hiç (2)". Nothing says لَمْ + verb means "did not" (past), which Ikhlas needs. Raw id "مَع2" shows; rare items (لَمَّا 1×) fill the list. *Fix:* 2–3 sourced sentences per role, 4–5 items, My-surah examples.

**4. The checks are too easy, so the check score flatters again.** Fatiha 1:4: the other options are other Fatiha verses, and "din gününün maliki" is given away by the word *din* ([01](phase-2/01-check-fatiha-too-easy.png)). The verse was studied word by word two minutes earlier. The whole-surah "gist" asks "which of these is in this surah?" against random verses from other surahs ("Şairlere ise…" for Ikhlas) and is **counted** as a listening check ([08](phase-2/08-whole-surah-gist.png)). *Fix:* wrong options that share Turkish loanwords and topic; check verses not studied in that session; gist questions about who speaks, to whom, and what is said; do not count the gist until it is fair.

**5. Phrase meanings are glosses joined with dots** ([07](phase-2/07-phrase-card.png)). مَا فِى ٱلسَّمَٰوَٰتِ = "ne · varsa · göklerde" (it suggests فِى = "varsa"). Some are fragments across a sentence break or wrong: "ٱللَّهَ إِنَّ ٱللَّهَ", "إِنَّ ٱللَّهَ لَا", "…وَمَا" = "ve yoktur", "مِن قَبْلِ أَن" = "daha önce · gerçekten". *Fix:* one Turkish phrase meaning, drop fragments ending in لَا / وَمَا, prefer phrases from Juz 30 and My surahs, use the shortest example.

**6. Phase 2 is not in Today.** Today shows Listen, new words and reviews only. Phrases, joined words and whole surahs are two taps deep; he will not find them. *Fix:* one rotating ear task in Today.

**7. Turkish "meaning here" follows Turkish word order.** 1:7 عَلَيْهِمْ = "kimselerin"; 112:3 يُولَدْ = "doğuranı". It appears on cards and in the prepositions lesson. *Fix:* hide glosses that clash with the corpus tags, or show the verse translation.

**8. Smaller.** Only 18 roots have loanwords (none for كتب, رحم, ذكر); ي د ي → "teyit" is wrong. Whole-surah smooth scroll ignores reduced motion. Each screen is `aria-live`, so a screen reader rereads it all on every tap.

## 5. Missing for the goal
1. Hear first with no text, then see (predict → check): still waiting for Umut.
2. Passages: 2–4 verses heard together, following who speaks to whom.
3. Self-report compared with the checks, shown to him.
4. A lesson on verb person markers (أَ / نَ / تَ / يَ, past endings), plus لَمْ / لَنْ.
5. A dictionary-style Turkish meaning source (G17).
6. What each short surah says, and to whom.

## 6. Top 7 changes for Phase 3
1. Fix Turkish lemma meanings first (dictionary forms, build check); the ladder depends on them.
2. Make checks fair and hard: loanword-sharing options from the same surah, on verses not studied that session, recorded per passage.
3. Build the ladder text-off first: 2–4 verses, then the whole short surah, with who / to whom / what questions instead of "which verse is in it".
4. Move the who-question and ear-first into the hear-only step; require play; use every My-surah place.
5. Narrow-listening sets: the same surah or phrase over 3 days, at 0.85× and then 1×, with a reciter change if Umut agrees.
6. Show self-report against check results on Today, per passage.
7. Put one listening task (joined words by ear, phrase, whole surah) in Today every day, and rewrite the role lessons with real explanations.
