# Content Plan

> Status: **proposal** for Umut's approval. Counts are targets, not promises.

## 1. Rules (carried over from Uu)

1. **Research first.** App content comes only from `docs/research/`. Every meaning names its source.
2. **The Quran text is never changed.** It is read from the Tanzil file as-is. The corpus data is used verbatim (licences: `docs/research/sources.md`).
3. **Gaps are listed, not filled.** Anything not verified goes in `docs/CONTENT_GAPS.md`.
4. **No tafsir of our own.** Meanings are word meanings and sourced translations. Where translators differ, show the difference.
5. **Our own wording only where allowed.** Lessons are written in our own words from cited grammar sources. Word meanings come from a source, or are clearly labelled when they are our rewording of one.

## 2. Content

| Part | Unit | First release (Phase 1) | Target |
|---|---|---|---|
| Words | lemma, with meaning, root, count, example verse | top 100 lemmas | top 1,000 (≈ 89% of whole words, estimate) |
| Roots | root families | roots of the top 100 | top 300 roots |
| Listen | verse, chosen by "known share" | verses you can follow with the top 100, plus Al-Fatiha | grows with your words: every verse in the Quran, eventually |
| Lessons | short grammar lesson | 6: attached pronouns; و / فَ / ثُمَّ; prepositions; إِنَّ and its sisters; كانَ; the past and present verb | ~30 |

## 3. Lessons (first draft of the list)

1. How Arabic words are built: root + pattern
2. The small words that are everywhere: و، فَ، ثُمَّ، أَوْ
3. Prepositions: فِي، مِنْ، إِلَى، عَلَى، بِ، لِ
4. Attached pronouns: ـهُ، ـهُمْ، ـكُمْ، ـنا …
5. Negation: لا، ما، لَمْ، لَنْ، لَيْسَ
6. إِنَّ and its sisters
7. كانَ and its sisters
8. Past and present verbs; who is doing it (the person prefixes and suffixes)
9. Verb forms II–X: what each pattern usually adds to the meaning
10. الَّذِي، الَّذِينَ، ما، مَنْ: "who" and "what"

Grammar sources are still to be chosen (**open**). Candidates: public-domain Wright's *Grammar of the Arabic Language* (3rd ed. 1896–98), and the Quranic Arabic Corpus grammar notes.

## 4. Order of work

Phase 1 builds the app with the first 100 lemmas and 6 lessons. Then content grows in steps of 100 lemmas, one PR per step, each with its research notes and gaps.
