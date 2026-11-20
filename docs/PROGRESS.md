# Progress and decisions

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Design brief, content plan, sources and licence check, phone mockup | **Done, waiting for Umut's review** (draft PR) |
| 1 | Astro app (same base as Uu): Today, Words, Listen, Roots, Library; top 100 lemmas; 6 lessons; offline; EN/TR; contrast and phone e2e checks | Not started; blocked on G1 (source of word meanings) |
| 2+ | Content in steps of 100 lemmas, one PR each | Not started |

Each phase ends with phone-size screenshots, test results and a PR.

## Decisions log

- **2026-11-20**: Umut asked for a daily Quran-understanding program, built like the validation app (Uu).
- **2026-11-20**: Umut: meanings in **English and Turkish**, switchable (the language follows the device by default).
- **2026-11-20**: Umut: reads Arabic **fluently**, so no transliteration.
- **2026-11-20**: Umut: Listen practice ordered **by word frequency**: verses are picked because you now know their words.
- **2026-11-20**: Umut: **Phase 0 first**.
- **2026-11-20**: Found: the Quran.com / Quran Foundation terms forbid bundling their word-by-word data, audio or timing into an app or a public repo (`docs/research/sources.md`). Options A / B / C are in `docs/design/DESIGN.md` §9, for Umut to choose.
- **2026-11-20**: Found: the Quranic Arabic Corpus forbids changed copies. The app will use the original v0.4 file, not the GitHub fork used for the first estimate.
