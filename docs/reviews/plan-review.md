# Plan review: critic, before building (2026-11-20)

## Verdict
The base is good: the goal can be tested and the numbers are honest. But the plan trains **reading** words first and leaves **hearing, "who speaks to whom" grammar and context** late. The data source is also decided three different ways in different files. Fix both before building.

## What is strong
- The goal sentence, listening checks with no text, and self-report compared with the checks.
- It counts whole words, not the inflated "parts" count, and its caveats are honest.
- It picks Listen verses by how many of their words you know.
- The Quran text is verbatim, there is no tafsir of our own, and known words get an underline instead of a change to the text. The mockup is calm and readable.

## Problems (most important first)
1. **The data source is decided three ways.** PLAN §4 says Açık Kuran. sources.md, PROGRESS, CONTENT_GAPS and DESIGN §9 say Corpus glosses, Turkish from Quran.com live, and Tanzil translations. There is no Açık Kuran research note. Its frontend is CC BY-NC-SA, but I could not confirm the API data licence or where its meanings come from. The Corpus v0.4 file has no English glosses, so "GPL glosses" is assumed. **Fix:** R0 writes `research/acikkuran.md`, picks one source for each kind of data, and updates all files. Turkish meanings must work offline; English as a fallback makes a Turkish learner quit.
2. **Knowing the dictionary form is not hearing the word.** One قال card marks قالوا، يَقُولُونَ، قُلْ as "known". Person markers answer the goal ("who, to whom") yet sit in lesson 8. **Fix:** teach pronoun endings and verb person markers in Phase 1. Show the verse's real form on cards. Call the number "dictionary-form coverage".
3. **One meaning per word misleads.** In the mockup's own 1:4, الدِّين means judgment or recompense, not "religion". **Fix:** in Listen, show the meaning for that exact place (Corpus glosses are per place). Cards list each sense with its count.
4. **The cards train the eye; the learner's gap is the ear.** Recitation joins words: idgham, a dropped hamzat al-wasl, sun letters. **Fix:** an audio-first review direction, and a lesson on how recitation joins words. Word audio and word timing are blocked by Quran.com's terms; list them as a gap.
5. **The phase order is slow for the goal.** He hears al-Fatiha and short surahs daily, but My surahs is Phase 5 and Context is Phase 4. Chang & Read (2006): topic information helped L2 listening more than repetition, and vocabulary preview helped least. **Fix:** Phase 1 has a "prayer set" (surahs Umut picks) mixed with frequency order, each with a sourced context card.
6. **Context has no source, and the speaker is often tafsir.** Tanzil's metadata has Meccan/Medinan and divisions, not themes. **Fix:** name a source before Phase 4. Limit speaker markers to grammar cues (قُلْ، قالَ, person endings) and the translator's own brackets.
7. **Day 1 = flashcards of و، ال، الله.** He knows many already. **Fix:** a 2-minute "know / not sure" placement sweep over the top 300. Teach particles in a small Parts drill moved into Phase 1.
8. **Two high-yield methods are missing.** (a) Phrase cards: Tanzil's most repeated 3–6-word runs (وَاللَّهُ غَفُورٌ رَحِيمٌ…). Chunks make real-time listening easier. (b) Turkish loanwords (rahmet, kitap, sabır, ahiret): sourced (Nişanyan, TDK), with meaning shifts flagged.
9. **The numbers flatter.** "~450 verses, 74%" will feel like understanding. Even 1,000 forms give 89% of words, below the 95% listening level. **Fix:** lead with listening checks and My-surahs coverage, with a baseline check on day 1, not in Phase 3.
10. **Small points.** Phase 1 is the top 300 in PLAN but the top 100 in CONTENT_PLAN and PROGRESS. A simulated critic cannot test memory at "day 30"; Umut's own weekly checks are the real test.

**Translations.** Saheeh International plus Diyanet is a sound mainstream pair. Saheeh adds bracketed interpretation and leans to one theological school on God's attributes. Say this on the About page, and offer a second English translation. "Diyanet İşleri" exists in more than one edition, so name which one. Do not show Açık Kuran's other translators by default; I did not check that list.

**Alignment.** The Basmala shift is already known (396 against 450 verses). The Corpus was built on an older Tanzil version, and pause marks and words split differently also shift positions. **Fix:** a build test that requires the same word count for every verse across Tanzil, the Corpus and Açık Kuran, and lists every mismatch.

## Evidence check
| Claim | Status |
|---|---|
| van Zeeland & Schmitt 2013, 90–95% for listening | **Verified.** No significant gap between 90% and 95%, but 90% varied widely, so the authors recommend 95%. Short English narratives (best case); the move to Arabic forms is an assumption. |
| Wilson et al. 2019, "85% rule" | **Verified paper, wrong use.** It is about gradient-descent learning on two-choice tasks in models, not flashcard review. Remove it; keep 5–15% as a design choice. |
| Chang & Read 2006 (new) | **Verified** from the abstract. |
| Laufer 1989 (95%), Hu & Nation 2000 (98%) | Correct to my knowledge; **not checked**. |
| "Nation" | No year given; cite Nation 2006. **Not checked.** |
| Roediger & Karpicke 2006 | Real effect, **not checked**. Karpicke & Roediger 2008 (vocabulary) fits better. |
| Cepeda et al. 2006 | Spacing yes; **not** the 1-2-4-8-16 doubling schedule. The evidence on growing gaps is mixed. |
| Mayer/Paivio, Ausubel, Bjork, narrow listening, morphology | **Not checked.** |

## Top 5 changes
1. **R0 settles the data:** one source for each kind of data, Açık Kuran checked, Turkish offline, Diyanet edition named, alignment build test.
2. **Phase 1 = prayer set + frequency:** placement sweep, person markers and pronoun endings, a Parts drill, context cards.
3. **Train the ear:** audio-first review, the meaning for each exact place, a recitation-joining lesson, a day-1 baseline listening check.
4. **Add phrase cards and sourced Turkish loanword links.**
5. **Fix the evidence:** drop Wilson, don't credit Cepeda for the schedule, cite Nation 2006, put listening checks first on Today.
