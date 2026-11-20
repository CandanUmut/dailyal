# Master plan: hear the Quran and understand it

> Living document. After each phase, a **critic** (a separate agent playing a real learner) uses the app on a phone-size screen and writes a review in `docs/reviews/`. The next phases are re-planned from that review. Umut can change anything here.

## 1. The goal, in one testable sentence

**When a passage is recited, the learner follows its meaning as they hear it: who is speaking, to whom, and what is said.**

We measure it, honestly:
- **Coverage:** the share of the Quran's words the learner knows (from their review history).
- **Listening checks:** after hearing a passage with no text on screen, the learner answers meaning questions. We track the share answered correctly, by passage.
- **Self-report:** after each Listen session, "How much did you follow?" (none / some / most / all). It is compared with the checks so the app can show over-confidence.

## 2. Learning methods we rely on (and why)

Every method here needs a source before the app claims it. Items marked *(verify)* are checked in research phase R0 and listed in `docs/research/learning.md`.

| Method | What it means here | Evidence *(verify)* |
|---|---|---|
| **Frequency first** | Teach the lemmas that cover the most running words first | Nation 2006 *(verify)* and our own count (`frequency.md`) |
| **Retrieval practice** | Try to recall the meaning *before* seeing it, every time | Karpicke & Roediger 2008 (vocabulary) *(verify)* |
| **Spacing** | Reviews spread over days. The doubling gaps (1, 2, 4, 8, 16 …) are Uu's design choice; the evidence for that exact schedule is mixed | Cepeda et al. 2006 for spacing itself *(verify)* |
| **Comprehensible input** | Listen to passages where you already know about 95% or more of the words, so the rest can be followed | Coverage thresholds: 95–98% for reading (Laufer 1989; Hu & Nation 2000), 90–95% for listening (van Zeeland & Schmitt 2013) |
| **Narrow, repeated listening** | Hear the same passage several times across days, then related passages | Repeated listening helps L2 listening comprehension *(verify)* |
| **Word parts on the fly** | Arabic joins و، فَ، بِ، لِ، كَ، ال and pronoun endings to words. Hearing them quickly is a separate skill, so it gets its own drills | Corpus: most frequent "lemmas" are these parts (`frequency.md`) |
| **Roots and patterns** | Group words by root, and learn what verb forms and noun patterns add | Morphological awareness supports Arabic vocabulary *(verify)* |
| **Dual coding** | Sound + Arabic text + meaning together, then take the text away step by step | Mayer, Paivio *(verify)* |
| **Desirable difficulty** | Aim for a 5–15% miss rate (as in Uu). This is a design choice, not a research number | Bjork *(verify)* |
| **Context before detail** | Before a passage: what kind of surah, where it sits, the translators' own wording (sourced only). After: the detail | Chang & Read 2006: topic information helped L2 listening more than vocabulary preview *(verified by the critic, abstract)* |
| **Chunks** | Learn the most repeated multi-word phrases (وَٱللَّهُ غَفُورٌ رَّحِيمٌ …) as units | Formulaic-language research *(verify)* |

## 3. What the finished app does

| Area | Does |
|---|---|
| **Today** | 3–4 tasks, about 15 minutes, chosen from your state: new words, review, listen, and sometimes a lesson. Honest time estimates. Missing a day is fine: no streaks, no guilt. |
| **Words** | Spaced review of lemmas, most frequent first. Card: Arabic, the sound in a real verse, meaning (TR or EN), root, word parts, 2–3 real verses. Grading as in Uu. |
| **Parts** | Drills for hearing and splitting joined words: وَلَهُمْ = و + لِ + هُمْ. |
| **Listen** | A ladder: one verse → a short passage → a whole short surah. Each rung has three passes: hear and see, fill, hear only. Passages are chosen because you know ≥ 95% of their words. Several reciters and speeds. |
| **Context** | Surah map: Meccan or Medinan, sections, what each section says (from translations, sourced), who is addressed. "Before you listen" cards. |
| **Roots** | Root families with counts; learning one root unlocks related words. |
| **Library** | Short grammar lessons ordered by how much meaning they unlock, each sourced. |
| **My surahs** | Mark the surahs you recite in prayer or hear often; the app prioritises their words and passages. |
| **Progress** | Coverage, surah strip, listening-check history, verses you can now follow. Export and import of progress. |

Always: phone first, offline after the first visit (audio streamed, saved only on request), English and Turkish following the device, light and dark, WCAG 2.2 AA, no ads, no account.

## 4. Data (decided 2026-11-20; see `research/sources.md`)

| Data | Source | Licence |
|---|---|---|
| Quran text (Uthmani) | Tanzil | CC BY 3.0, verbatim |
| Morphology: lemma, root, part of speech, features | Quranic Arabic Corpus v0.4 (original file) | GPL, verbatim + credit |
| Word meanings TR + EN **for each place** (not one meaning per word), root meanings, Turkish loanwords, grammar labels | Açık Kuran API, downloaded once at build time, bundled, works offline | CC BY-NC-SA 4.0 (non-commercial) |
| Verse translations | Açık Kuran: Diyanet İşleri (TR, edition to be named), Sahih International (EN), with a second English translation offered | via Açık Kuran; non-commercial |
| Verse audio | everyayah.com (stream) | streamed only |
| Surah metadata (Meccan/Medinan, revelation order, sections) | Tanzil metadata | CC BY 3.0 |

Because Açık Kuran is CC BY-NC-SA, our derived data files are shared under the **same licence**, and the app credits Açık Kuran on every word card and on the About page.

## 5. Phases

Each phase: build → tests + 390 px screenshots → **critic review** → re-plan → PR update. Sizes are estimates in work sessions.

| Phase | What | Size | Done when |
|---|---|---|---|
| **R0** | Research: learning-method sources (`learning.md`); data checks (word alignment between Tanzil, corpus and Açık Kuran) | 0.5 | Every *(verify)* above is either sourced or removed |
| **1. Foundation** | Data pipeline + alignment test. Astro app (Uu base). Placement sweep. Today (listening check first). Words (all items ranked, senses with counts). Listen (verse level, 3 passes, meaning for each place, listening check). My surahs + context cards. Roots. Library: how it works, person markers. EN/TR. Offline. Tests. | 2.5 | A learner can do a full 15-minute day on a phone |
| **2. Ear and parts** | Audio-first review; Parts drills; phrase cards; Turkish loanword links; recitation-joining lesson; lessons on particles, prepositions, negation, إنّ, كان | 2 | Critic can split common joined words and recognise phrases by ear |
| **3. Listening ladder** | Passage and short-surah listening; reciter/speed choice; listening checks; narrow-listening sets; self-report vs check | 2 | Listening checks recorded; ladder works across days |
| **4. Context** | Surah map from metadata + translations; "before you listen" cards; who-is-speaking markers (sourced only) | 1.5 | Every passage in Listen has a sourced context card |
| **5. Breadth and personal** | Up to 2,000 lemmas; My surahs; search; progress export/import | 1.5 | Learner can steer the program to what they hear |
| **6. Polish** | Performance, accessibility audit, offline audio on request, final critic pass | 1 | Critic verdict: "I'd use this daily" with no blocking issue |

## 5b. Changes after the plan review (`reviews/plan-review.md`, 2026-11-20)

| Review point | Decision |
|---|---|
| 1. The data source was decided in three different ways | **Taken.** Açık Kuran is now the one source for word meanings (TR + EN), root meanings and translations, bundled for offline use. `sources.md`, `acikkuran.md`, PROGRESS and GAPS were updated to match. |
| 2. Knowing the dictionary form is not hearing the word | **Taken.** Pronoun endings are frequency items from day 1 (they rank in the top 30). Cards show real forms from verses. A person-markers lesson moves to Phase 1. The number shown is called "dictionary-form coverage". |
| 3. One meaning per word misleads | **Taken.** Listen shows the meaning for that exact place. Cards list the top senses with counts. |
| 4. The cards train the eye; the gap is the ear | **Partly.** Phase 2 adds an audio-first review (hear the verse, give the meaning of the marked word) and a lesson on how recitation joins words. Word audio and word timing stay a gap (G10). |
| 5. The phase order is slow for the goal | **Taken.** Phase 1 has **My surahs** (preset: Al-Fatiha and the last 10 surahs; the learner can change it), mixed with frequency order, plus sourced context cards (Meccan/Medinan, revelation order, name meaning). |
| 6. Context has no source, and naming the speaker is often tafsir | **Taken.** Speaker markers only from grammar cues (قُلْ، قالَ, person endings). A theme source is to be found before Phase 4 (G11). |
| 7. Day 1 is flashcards of words he already knows | **Taken.** A placement sweep ("know / not sure") over the top items in Phase 1. |
| 8a. Phrase cards | **Taken**, Phase 2 (repeated runs of words, counted from the Tanzil text). |
| 8b. Turkish loanwords | **Taken**, Phase 2. Açık Kuran root meanings already list them ("Türkçe'ye girmiş türevler"). |
| 9. The numbers flatter | **Taken.** A simple listening check (pick the matching translation after hearing the verse without text) is in Phase 1, and Today leads with it. |
| 10. Inconsistent sizes and the "day 30" simulation | **Taken.** All items are ranked; new items per day is a setting. Umut's own weekly use is the real test; the critic's "day 30" only checks that the app behaves. |
| Translations | **Taken.** The About page notes the bracketed interpretations in Saheeh. A second English translation is offered. The Diyanet edition is to be named (G12). |
| Alignment | **Taken.** The build fails if Tanzil, the corpus and Açık Kuran disagree on the word count of any verse, and it lists every mismatch. |

## 6. The critic

- A separate agent, given only the app (running at 390 × 844), `docs/PLAN.md` and a persona. It is told to be honest and specific, not kind.
- Persona: a Turkish speaker who reads Arabic script fluently but understands little, uses a phone for 15 minutes a day, and hears the Quran in prayer and on recordings.
- It does a real "day 1" and a simulated "day 30" (stored progress injected). It reports: what helped, what confused, what was missing for the goal in §1, bugs, and the 5 most important changes.
- Reviews are saved in `docs/reviews/phase-N.md`. The re-plan is a commit to this file that names which review points were taken, deferred or rejected, and why.
