# Master plan: hear the Quran and understand it

> Living document. After each phase, a **critic** (a separate agent playing a real learner) uses the app on a phone-size screen and writes a review in `docs/reviews/`. The next phases are re-planned from that review. Umut can change anything here.

## 1. The goal, in one testable sentence

**When a passage is recited, the learner follows its meaning as they hear it: who is speaking, to whom, and what is said.**

We measure it, honestly:
- **Coverage:** the share of the Quran's words the learner knows (from their review history).
- **Listening checks:** after hearing a passage with no text on screen, the learner answers meaning questions. We track the share answered correctly, by passage.
- **Self-report:** after each Listen session, "How much did you follow?" (none / some / most / all). It is compared with the checks so the app can show over-confidence.

## 2. Learning methods we rely on (and why)

Every method here needs a source before the app claims it. R0 checked them (2026-11-20); the details and the depth of reading (mostly abstracts) are in `docs/research/learning.md`.

| Method | What it means here | Evidence (checked in `research/learning.md`) |
|---|---|---|
| **Frequency first** | Teach the items that cover the most running words first | Our own count (`frequency.md`). Nation 2006 gives vocabulary sizes, not a teaching order |
| **Retrieval practice** | Try to recall the meaning *before* seeing it, every time | Karpicke & Roediger 2008 (verified) |
| **Spacing** | Reviews spread over days. We double the gaps (1, 2, 4, 8 …) for fewer misses while learning | Spacing helps (Cepeda et al. 2006). Growing gaps do **not** beat equal gaps in the long term (Karpicke & Roediger 2007; Kang et al. 2014; Latimier et al. 2021) |
| **Comprehensible input** | Listen to verses where you know about 95% or more of the words | 95% is a **target, not a threshold**: understanding rises steadily with coverage (Schmitt et al. 2011). The data is English (van Zeeland & Schmitt 2013) |
| **Repeated listening** | Hear a verse more than once in a session, and again on later days | Within one sitting: Chang & Read 2006. Across days: our design choice |
| **Word parts on the fly** | Hearing و، فَ، بِ، لِ، ال and pronoun endings quickly is a separate skill, with its own drills | They are the most frequent items in our count |
| **Roots and patterns** | Group words by root | Learners process Arabic by root (Freynik et al. 2017). That teaching roots speeds vocabulary growth is **untested** (G16) |
| **Audio with text, then without** | Hear with the text, then hear without it | Speech + text beats speech alone (Adesope & Nesbit 2012); captions help L2 listening (Montero Perez et al. 2013). Fading the text is our design choice |
| **Desirable difficulty** | Aim for a 5–15% miss rate | General idea: Bjork & Bjork 2011. The 5–15% is ours |
| **Chunks** | Learn the most repeated phrases as units | Conklin & Schmitt 2008; Yeldham 2020 (listening). English data |
| **Context before detail** | Before a passage: what kind of surah, and where it sits (sourced only) | Chang & Read 2006: topic information helped L2 listening most, vocabulary preview least |
| **Learning to listen** | Predict, listen, check, listen again | Vandergrift & Tafaghodtari 2010 |
| **Honest self-check** | Compare "how much did you follow" with the listening check | People misjudge their own learning (Ross 1998; Karpicke & Roediger 2008) |

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
| **2. Ear and parts** | Ear-first review (hear a short verse from your surahs, then recall the marked word); whole-surah listening for My surahs; "who speaks / to whom?" questions from person markers; Parts drills; phrase cards (180 phrases repeated 8+ times); Turkish loanword links; lessons on particles, prepositions, negation, إنّ, كان | 2 | Critic can split common joined words and follow a short surah by ear |
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

## 5c. Changes after the Phase 1 review (`reviews/phase-1.md`, 2026-11-21) — Phase 1.1

| Review point | Decision |
|---|---|
| Word cards taught wrong or negated meanings (هَدَى = "doğru yola iletmez") | **Partly fixed** (corrected after the Phase 2 review, which found 88 of 154 top verbs still not in plain form; see §5d). Meanings now come from places where the word is in its base form (verbs: past, "he", active, not after a negation; nouns: no prefix or ending), preferring a plain past form in Turkish. هَدَى = "doğru yola iletti", أَرْسَلَ = "gönderdi", قَالَ = "dedi". Function words are split by role (مَا "not" vs مَا "what") and show their role first. A build check reports meanings that still look negated (6 of the top 1,000, listed in `data/build-report.txt`). A truly dictionary-style Turkish source would still be better: **open (G17)**. |
| The listening check could be passed without listening | **Fixed.** Each verse is checked against its own text (Diyanet's joined ranges fall back to Elmalılı for the check). Near-twin options (word overlap ≥ 40%) are dropped. The options appear only after the audio has played to the end. No surah name or verse number is shown during the check. If the translation was read earlier, or the audio failed, the check is practice only and is not counted. |
| "Meaning here" lost who is speaking | **Fixed.** Every verb shows person and tense from the corpus ("ben · şimdiki-geniş zaman"). |
| The numbers flattered | **Fixed.** An item counts as known only after a correct recall on a later day than first seen; placement words are checked first. Today calls the figure "dictionary-form coverage" and explains it. |
| Bugs (self-report counted twice, raw corpus codes, context card closing, Turkish numbers and endings, "çal", "Boşluk", mixed English) | **Fixed.** |
| Card layout (grade buttons below the fold, random examples) | **Fixed.** Grade buttons stay in reach; examples come from your own surahs first, each with its translation. |
| Tap targets under 48 px | **Fixed**, and the e2e test now checks width too. |
| Ear-first review, whole-surah listening, "who speaks?" questions | **Phase 2** (below). |
| One Turkish translation for both reading and the check | **Waiting for Umut**: which Turkish translation should be the default (Settings now offers Diyanet, Elmalılı (sadeleştirilmiş), Süleyman Ateş). |

## 5d. Changes after the Phase 2 review (`reviews/phase-2.md`, 2026-11-21) — Phase 2.1

| Review point | Decision |
|---|---|
| Turkish meanings still often not dictionary-like | **Improved, not solved.** The Turkish gloss is now chosen from all places of the word: plain past forms of up to 3 words (else present) for verbs, no "-dır", "bir …" or pronoun-first glosses for nouns. Top-500 verbs whose gloss *has the shape* of a plain form: 144 of 156; nouns ending in "-dır": 0. **Correction (Phase 3 review):** that is a form check, not a meaning check. Read by a Turkish speaker, a sample of 30 verbs and 30 nouns gave only 16 and 12 dictionary-like meanings (e.g. وَعَدَ = "yapıldı"). Still open: G17. |
| Ear-first could be revealed without playing; few words qualified | **Fixed.** The verse must be played first. Any place in Al-Fatiha or Juz 30 (up to 5) can be used, your surahs first. |
| Who-question asked with the text on screen | **Fixed.** It moved to the hear-only step, after the check, with only the verb shown. |
| Joined-word wrong options gave the answer away | **Fixed.** Wrong options now drop a joined part, or swap a pronoun for one with the same first letter (ـهُ / ـهَا / ـهُمْ). |
| Checks too easy (loanwords, random surahs) | **Improved.** Wrong options are chosen to share some words with the right one (about 0.1–0.4 overlap), from the same surah, nearby verses or Juz 30. Loanword overlap (e.g. "din") cannot be fully avoided. |
| Lessons were word lists with errors (لَا "ve") | **Partly.** Meanings of function words are now counted from places where the word stands alone. Real explanations wait for a cited grammar (G7, G18). |
| Today never offered Phase 2 | **Fixed.** One rotating practice a day (joined words, whole surah by ear, phrases); the self-report sits next to the check results. |
| Leftovers: placement 150 cards, "çal", English in Turkish mode | **Fixed.** Placement is about 40 words and stops after 12 unknown in a row; an English fallback in Turkish mode is labelled "(İng.)". |
| Listening ladder with the text off first, narrow-listening sets, results per passage | **Phase 3** (next). |

## 5e. Changes after the Phase 3 review (`reviews/phase-3.md`, 2026-11-21) — Phase 3.1

| Review point | Decision |
|---|---|
| Ladder questions used other surahs (answer given by the surah name) | **Fixed.** Wrong options come only from the same surah; options containing the surah's name are dropped. A whole surah asks "what came right after this?" (sequence, same surah). |
| Self-report asked after the score | **Fixed.** Asked before any question; kept per passage; the score page says plainly when feeling and result disagree. |
| Who-question printed the verb; always قُلْ | **Fixed.** No text: you play that one verse again, then answer. Commands (قُلْ) are skipped. It counts only after the verse was played. |
| Options mixed translators under one label | **Fixed.** One translator per question (the reader's, or a per-verse one for all options when the reader's joins verses), labelled correctly. |
| Joined Diyanet ranges repeated under every verse | **Fixed.** Shown once, under the last verse of the range (ladder and reader). |
| "Muúammad" (264×) in Sahih International | **Fixed** at packing: an encoding error in the source text (ú→ḥ, î→Ḥ, ê→Ṣ, §→ṣ), recorded in `data/acikkuran/LICENSE.md`. |
| Today ticked the wrong task after a passage | **Fixed.** Separate counters for verses and passages. |
| No middle step: short surahs were only whole | **Fixed.** Every surah is split into passages of 2–3 verses; short surahs (4–8 verses) can also be heard whole. |
| Ear-first unlocked by play-then-pause | **Fixed.** Unlocks only when the verse has played to the end. |
| Reader's whole-surah check used other surahs | **Removed.** The reader keeps the playback and points to the ladder for the check. |
| Turkish meanings (G17) block every meaning question | **Open — needs Umut's decision** (see PROGRESS). |

## 5f. Changes after the Phase 4 review (`reviews/phase-4.md`, 2026-11-21) — Phase 4.1

| Review point | Decision |
|---|---|
| Pronoun data had holes (إِيَّا without person; 438 verbs lost their ـنَا/ـنِي object) | **Fixed** in `morph.mjs`, with tests against the corpus: إِيَّاكَ = "you"; ـنَا on a verb that is not "we" is an object; any second pronoun ending is an object. |
| Turkish meanings (G17) | **Small step:** nouns use the plain form already in the data (يَوْم = "gün", not "günü"); passive and "fakat …" glosses are rejected for active verbs. Critic's sample before this step: 19/30 verbs, 11/30 nouns. **The source decision is still Umut's.** |
| "Persons" line and who-question teach agreement, not who | **Partly:** the who-question now uses only I / we / you verbs (where grammar and speaker or addressee agree); labels say "eril / dişil", not "erkek / kadın". Reworking the line into "who says this / who is spoken to" **waits for Umut**. |
| Duplicate options (109:3 = 109:5); 3-verse surahs got only one question | **Fixed.** Repeated verses are skipped as prompts and options are de-duplicated; short whole surahs get a sequence question with 2–3 options. |
| Self-report: no mismatch note on Today, not shown per passage | **Fixed.** |
| Ladder order: whole surahs before easier passages | **Fixed** to follow the plan (§3: passages you can follow first): passages first, by the share of words you know. |
| Wording ("1 gün sonra" for a passage, "1 days", "1 times") | **Fixed.** |
| Search failed for inflected Arabic and Turkish stems | **Fixed for the common cases:** prefixes and endings are stripped to find the root (الرحمن, يعلمون, قل → قَالَ); Turkish infinitives and softened consonants (bilmek, korkmak, kalp → kalbi). |

## 5g. Round 2 and its review (`reviews/round-2.md`, 2026-11-21)

Built (direction approved by Umut: "the direction is fine … just the word selection and meanings"): the **word sheet** (meaning in this verse, joined parts, dictionary form, root meaning, the same word in other verses where it is translated differently, family); the **surah-unit path** on Today (Tanış, Kelimeler, Ayet ayet, Dinle, Takip); **four tabs** (Bugün, Kur'an, Kelimeler, Sen). Dropped on purpose: "sound of a surah", the per-verse persons line, any numerical content.

| Review point | Decision |
|---|---|
| Wrong meanings in this verse (Açık Kuran data), graded as right in quizzes | **Flagged, not rewritten.** A careful review of Al-Fatiha and surahs 93–114 (714 words) found 4 clear errors (e.g. 1:7 عَلَيْهِمْ, 112:3 يُولَدْ) and 27 empty meanings (`data/review/tr-flags.json`, `research/tr-flags.md`). A flagged place shows a warning and the English reference; it is never used in quizzes or for a word's dictionary meaning. Other surahs: not reviewed yet (G21). |
| "Other verses" often differed only in Turkish endings (Allah / Allah'ın / Allah'a) | **Fixed.** Meanings are compared by their stem; only real differences are shown, at most 3. Same for "other meanings" on cards. |
| English shown in Turkish mode | **Fixed.** Never as the main meaning; when Turkish is missing, a labelled English reference ("İngilizce karşılığı: …"). |
| Root meanings were walls of text | **Fixed.** The first sense only (up to the first full stop), with "Devamını oku". |
| 4-verse surahs had an empty Listen step | **Fixed.** Surahs of 4–8 verses get at least 2 passages. |
| "Takip" could be passed from memory of the verse order | **Changed.** After the whole surah by ear, three verses are played **one by one, without text**, and you choose each one's meaning (2 of 3 passes). The claim is now "Follow check passed: hearing its verses alone, you recognised their meaning" — **Umut to confirm** what passing should mean. |
| Accessibility and layout (focus leaving the sheet, small root link, Meet button behind the tab bar, first verse at the bottom of the reader) | **Fixed.** Focus stays in the sheet; the link is 48 px; the step cards come first; reader controls fold away. |
| Small bugs (corpus id "مَٰلِك2" visible; Day-30 seed without unit progress) | **Fixed.** |
| Al-Fatiha in one sitting ≈ 40 minutes | **For Umut:** should a unit suggest a daily stopping point? Units already span several days. |

## 5h. v3: the daily lesson (2026-11-21, after Umut tried round 2)

Umut: "very hard to understand what I am doing, where I am … overwhelming … I couldn't finish one day … it opens a word and expects me to know it and say easy." He asked for the proposed simpler version.

- **One lesson a day, about 10 minutes, always in one surah.** The course is Al-Fatiha, then the short surahs most recited in prayer, then the rest of Juz 30. Each lesson covers one verse.
- **Teach before testing.** The steps are:
  1. Hear the verse with its text and meaning.
  2. Meet at most 5 new words, one at a time. Nothing is asked.
  3. Practise them by **choosing** the meaning. A wrong answer comes back once.
  4. Hear the verse without the text, then see it again.
  5. Review earlier words by choosing.
  6. "Done for today".
- **No self-grading** ("Easy / Missed") anywhere in the daily path.
- **Focus mode:** no tab bar in a lesson; ✕ exits; "Next" stays in thumb reach.
- **Today:** where you are, one button, and a short course view. **Words:** the words from your lessons, with review. **You:** days, words and verses learned.
- The reader, search, word sheet, roots, phrases and passages stay for free exploring. They are not in the daily path.

## 5i. v3.1: the middle way (2026-11-21)

Umut asked for a middle way that helps with the whole Quran, and for the good parts not to be hidden. He chose **4 + 2**.

**How much of the whole Quran you would understand** (all words learned are assumed remembered, so these are upper limits; the comparison is what matters):

| Days | One verse a day | Middle way (4 + 2) |
|---|---|---|
| 30 | 31% | 59% |
| 90 | 43% | 78% |
| 180 | 56% | 85% (Juz 30 done) |
| 365 | 67% | 90% |

What the lesson does now:
- **4 words from your surahs.** The lesson takes verses in order, in the same surah, until it has 4 **useful** new words (words that occur 3 or more times in the Quran). At most 5 verses.
- **Rare words** (1–2 times in the Quran) are shown with their meaning but are not drilled.
- **2 frequent words.** Each lesson adds 2 of the Quran's most frequent words you don't know yet. Each one is taught inside a real verse, with its count shown.
- **"What you learned today"** plus **one** Discover card (a root family, or a short lesson), tied to your words. The same card also appears on Today.
- **Words tab:** clear tiles for My words, My roots (only the roots of your words), Phrases and Lessons.

## 6. The critic

- A separate agent, given only the app (running at 390 × 844), `docs/PLAN.md` and a persona. It is told to be honest and specific, not kind.
- Persona: a Turkish speaker who reads Arabic script fluently but understands little, uses a phone for 15 minutes a day, and hears the Quran in prayer and on recordings.
- It does a real "day 1" and a simulated "day 30" (stored progress injected). It reports: what helped, what confused, what was missing for the goal in §1, bugs, and the 5 most important changes.
- Reviews are saved in `docs/reviews/phase-N.md`. The re-plan is a commit to this file that names which review points were taken, deferred or rejected, and why.
