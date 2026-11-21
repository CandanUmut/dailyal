# Content gaps

Things that are not verified yet. Nothing here goes into the app until it is closed.

| # | Gap | What closes it |
|---|---|---|
| G1 | ~~Word meanings source~~ **Closed 2026-11-20**: English from the Quranic Arabic Corpus (GPL); Turkish live from Quran.com; verse translations from Tanzil (Saheeh Intl., Diyanet) | — |
| G2 | ~~Original corpus file~~ **Closed**: unchanged copy found and its checksum verified (`research/sources.md`) | — |
| G3 | ~~Frequency on the fork~~ **Closed**: recomputed on the original (`research/frequency.md`) | — |
| G4 | ~~Translation licences~~ **Closed**: Tanzil non-commercial use, which fits this app | — |
| G5 | everyayah.com audio terms | Find the terms, or ask them |
| G6 | KFGQPC Uthmanic Hafs font licence | Read the font's licence text |
| G7 | Grammar lesson sources | Choose and read them (Wright's grammar is the candidate) |
| G8 | Pronoun display forms in `scripts/data/morph.mjs` (PRONOUN_FORM) are the standard paradigm, written from knowledge | Check against Wright, *Grammar of the Arabic Language*, vol. 1 (pronouns), and cite the section |
| G9 | Açık Kuran data licence: only the repository's CC BY-NC-SA badge | Ask Açık Kuran, or accept it as is (Umut: non-commercial, go ahead) |
| G10 | Word audio and word timing inside verse audio (no open source found; Quran.com's terms forbid bundling) | Find an open source, or do our own alignment later |
| G11 | A source for passage themes and context, beyond the metadata | Find one before Phase 4 |
| G12 | Which Diyanet edition is Açık Kuran's author 11 | Ask Açık Kuran, or compare with the published editions |
| G13 | Who wrote Açık Kuran's word meanings, and how they were checked | Ask Açık Kuran |
| G14 | ~~Learning-method citations~~ **Closed**: checked in `research/learning.md` | — |
| G15 | Short meanings of prefixes and pronouns (`src/scripts/cardview.ts`: PREFIX_MEAN, PERSON) are written from knowledge | Check against how Açık Kuran renders words that carry them, and against the corpus tagset; write `docs/research/particles.md` |
| G16 | No study found on teaching Arabic roots to adult learners (does it speed vocabulary growth?) | Keep watching; measure in our own data |
| G17 | Turkish (and English) dictionary-style meaning per lemma. Açık Kuran gives meanings per place; we pick base-form places, but a real dictionary entry would be better | Find an open Turkish Quran dictionary, or have meanings checked by a person |
| G18 | Lesson intro sentences (`src/pages/library/role/`, pronouns, how-it-works) are plain descriptions written from general knowledge | Check against a cited grammar (G7) |
| G19 | Provenance of the Turkish word-by-word meanings: 89% of Açık Kuran's Turkish word meanings are identical to Tarteel QUL resource #99 ("Turkish wbw translation"), whose author and licence are unknown. The CC BY-NC-SA badge may not cover them | Umut decides: credit as "based on the Quran.com/QUL Turkish word-by-word", ask Açık Kuran, or ask QUL (`research/qul-and-dictionaries.md`) |
| G20 | No open, reliable Turkish dictionary-form (lemma) meanings found. QUL has none; the reviewed GitHub version of #99 has no licence; Açık Kuran root "diffs" are examples in context | Keep looking; ask Açık Kuran; English verb meanings possible from the corpus dictionary (scrape needs Umut's yes) |
| G21 | Turkish place meanings reviewed only for Al-Fatiha and surahs 93–114 (4 errors, 27 empty in 714 words); the rest of the Quran is not reviewed | Extend the review surah by surah as units grow; 13 'unsure' cases need a second opinion |
