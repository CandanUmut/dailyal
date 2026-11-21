# Progress and decisions

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Design brief, content plan, sources and licence check, phone mockup | **Done, waiting for Umut's review** (draft PR) |
| Plan | `docs/PLAN.md`, reviewed by the critic (`docs/reviews/plan-review.md`) | **Done**; review decisions in PLAN §5b |
| R0 | Learning-method sources (`docs/research/learning.md`) | **Done**; PLAN §2 rewritten from it. Two behaviour changes are waiting for Umut (see below) |
| 1 | Foundation: data pipeline, app (Today, Placement, Words, Listen, Surahs, Library), EN/TR, offline, tests | **Built, tests pass**; waiting for the full Açık Kuran download, then the Phase 1 critic review |
| 1.1 | Fixes from the Phase 1 review (`docs/reviews/phase-1.md`; decisions in PLAN §5c) | **Done**, tests pass |
| 2 | Ear and parts (`docs/reviews/phase-2.md`) | **Done** |
| 2.1 | Fixes from the Phase 2 review (PLAN §5d) | **Done**, tests pass |
| 3–6 | See `docs/PLAN.md` §5 | Next: Phase 3 (listening ladder) |

Each phase ends with phone-size screenshots, test results and a PR.

## Decisions log

- **2026-11-20**: Umut asked for a daily Quran-understanding program, built like the validation app (Uu).
- **2026-11-20**: Umut: meanings in **English and Turkish**, switchable (the language follows the device by default).
- **2026-11-20**: Umut: reads Arabic **fluently**, so no transliteration.
- **2026-11-20**: Umut: Listen practice ordered **by word frequency**: verses are picked because you now know their words.
- **2026-11-20**: Umut: **Phase 0 first**.
- **2026-11-20**: Found: the Quran.com / Quran Foundation terms forbid bundling their word-by-word data, audio or timing into an app or a public repo (`docs/research/sources.md`). Options A / B / C are in `docs/design/DESIGN.md` §9, for Umut to choose.
- **2026-11-20**: Found: the Quranic Arabic Corpus forbids changed copies. The app will use the original v0.4 file, not the GitHub fork used for the first estimate.
- **2026-11-20**: Umut: no income from the app, so use the most trusted free sources. Chosen: Quranic Arabic Corpus English glosses (GPL), Saheeh International and Diyanet İşleri via Tanzil (non-commercial allowed), Turkish word meanings live from Quran.com (their terms still forbid bundling, even for free apps).
- **2026-11-20**: Umut: use Açık Kuran (open source, has APIs); open the branch; plan the whole app with a critic; work phase by phase, with a critic using the app after each phase; work until usage runs out and continue on a schedule. Done: Açık Kuran key saved as a network secret (never in the repo); `main` created; draft PR #1; a scheduled task continues the work every 5 hours.
- **2026-11-20**: Unchanged Quranic Arabic Corpus v0.4 file found (checksum matches its repository's Git LFS record), so no e-mail was needed.
- **2026-11-20**: Tanzil and the corpus align word for word in all 6,236 verses once 4 known two-token joins (بَعْدَ مَا, إِلْ يَاسِينَ) are handled. The Basmala is stored per surah, because 95 and 97 spell it بِّسْمِ.
- **2026-11-20**: R0 found that growing review gaps do not beat equal gaps in the long term. The doubling is kept only as a design choice (fewer misses while learning), and is now labelled that way.
- **Waiting for Umut** (these would change how the app behaves): (1) in Listen, hear the verse once **without** the text before seeing it (predict, then check); (2) switch reciters on later re-listens, to vary the conditions.
- **2026-11-21**: Correction. On 2026-11-21 I reported the Turkish card meanings as fixed after Phase 1.1. The Phase 2 critic showed they were only partly fixed. Now improved (144 of 156 top verbs are plain), still not perfect (G17).
