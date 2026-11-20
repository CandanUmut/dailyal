# Design Brief — Quran understanding app (working name: *Fahm*)

> Status: **proposal**. Nothing here is final until Umut approves the Phase 0 mockup (`docs/design/mockup/`). Every choice says *why*, so it can be argued with.

Decided by Umut (2026-11-20):
- built like the validation app (Uu): a daily program, spaced review, research first, phone first
- **English and Turkish**, switchable
- reads Arabic **fluently**, so no transliteration
- Listen practice ordered **by word frequency**
- **Phase 0 first**

---

## 1. The one idea

**Hear it, and know what it says.**

The goal is not to translate on paper. The goal is that when a verse is recited, the meaning arrives while you listen. So the app trains two things together: the **words** (most frequent first) and the **ear** (hearing those words inside real recitation).

- **Honest, not gamified.** Every number means something you can explain in one sentence. "You know every word in 450 verses" is a real count (once the recount in `docs/research/frequency.md` is done), not points.
- **Calm and respectful.** It is opened every day, often for 10–15 minutes, near prayer times. It should feel like opening a good notebook next to a Mushaf.
- **The Quran text is never decoration.** It is shown exactly as in the source, in a proper Quran font, never cut mid-word, never coloured or animated.

## 2. What it must never look like

- Generic "AI app": gradients, glass, glowing blobs, emoji icons.
- Islamic clichés used as filler: gold-on-green, mosque silhouettes, crescent icons, geometric patterns pasted behind text.
- Gamification noise: confetti, XP, badges, streak flames, leaderboards. Missing a day must not feel like a punishment.
- A Mushaf imitation. This is a study notebook, not a printed Quran.

## 3. Visual language

### 3.1 Signature: "what you would follow if you heard it now"

| Form | Where | What it means |
|---|---|---|
| **The underline** | Listen, every verse | Words you know get a thin ink line *under* them. The Arabic itself stays full ink: we mark the knowing, not the text. A verse with every word underlined is one you can follow when you hear it. |
| **The surah strip** | Today, Library | 114 thin bars, one per surah, in Mushaf order. The ink height of each bar is the share of that surah's words you know. (Equal widths: bars sized by word count made the short surahs invisible.) Gaps show at a glance. |
| **The root family** | Word card, Roots | One root in the middle and its words around it, joined by hairlines (ر ح م → رَحْمَة، رَحْمٰن، رَحِيم). Shows why one root unlocks many words. |

Rules:
- One signature form per screen.
- Drawings appear once (≤ 600 ms), then stay still. With `prefers-reduced-motion`, there is no animation at all.
- Every drawing has a plain one-line caption.

### 3.2 Palette (proposal)

| Token | Role | Light | Dark | Why |
|---|---|---|---|---|
| `--paper` | background | `#F6F1E6` | `#14120F` | notebook page |
| `--ink` | text, Arabic | `#1B1A17` | `#ECE6DA` | ink |
| `--ink-soft` | secondary text | `#5E5850` | `#ABA395` | |
| `--rule` | hairlines | `#DDD4C2` | `#2E2A24` | |
| `--rubric` | the one accent | `#9B2C22` | `#F19A8C` | Old manuscripts used red ink ("rubric") for markers and headings. That is the job it has here, never on the Quran text itself. |
| `--known` / `--missed` | review grades only | `#2F6B45` / `#9B2C22` | lighter variants | grade colours, never decoration |

WCAG 2.2 AA in both themes, checked by a script in the build (as in Uu).

### 3.3 Type (self-hosted, no runtime CDN)

| Role | Choice | Why |
|---|---|---|
| Quran text | **Amiri Quran** (OFL) | A full Quran font with marks for stopping and long vowels. Its licence allows self-hosting. KFGQPC Hafs is an option if its licence allows (open). |
| Other Arabic (lemmas, roots) | **Amiri** (OFL) | matches |
| Latin text, English and Turkish | **Atkinson Hyperlegible Next** | Legible on small screens; full Turkish letters (ı İ ş ğ ç ö ü). Same as Uu. |
| Headings | **Literata** | A calm book serif. |

Quran text is at least 28px on phone, with a line height of 2.1, because the vowel marks need room.

## 4. Phone-first rules (non-negotiable)

- Tap targets ≥ 48px. Primary actions in the lower half of the screen.
- Nothing depends on hover or a keyboard. No keyboard shortcuts as a feature.
- Arabic is right-to-left inside left-to-right pages (English and Turkish). Mixed lines use `dir` correctly.
- Offline after the first visit (text, words, lessons). Audio is streamed and saved offline only when asked (licence: see `docs/research/sources.md`).
- Language follows the device (Turkish device → Turkish, otherwise English), with a switch in Settings. **Never forced.**

## 5. Screens

1. **Today**: three tasks with honest times (new words, review, one verse to listen to), plus the surah strip.
2. **Word card** (review): the Arabic word, a play button for its sound, then the meaning, its root family and one real verse where it occurs. Three grade buttons in thumb reach (as in Uu).
3. **Listen**, three passes on one verse chosen because you now know (almost) all its words:
   - **Hear and see**: play, tap any word to see its meaning.
   - **Fill**: some meanings are hidden; choose them.
   - **Hear only**: no text; listen, say the meaning out loud, then check.
4. **Roots**: the root family drawing, with every word's count in the Quran.
5. **Library**: short lessons on the grammar that unlocks the most meaning (attached pronouns, the small particles, verb forms). Each lesson ends with its sources.

## 6. Voice

- Plain words, short sentences, the same in English and Turkish.
- Meanings always say where they come from. Where translators differ, say so, and do not pick a winner.
- No commentary (tafsir) of our own. The app teaches language and points to scholars for interpretation.

## 7. The daily program

| Part | Time | What |
|---|---|---|
| New words | ~4 min | 5 new lemmas a day (adjustable), most frequent first. Small particles come first because they appear everywhere. |
| Review | ~6 min | Spaced repetition as in Uu: missed → tomorrow; known → 2, 4, 8, 16 days and on. Aim for a 5–15% miss rate. |
| Listen | ~4 min | One verse from the "you can now follow this" list, three passes. |
| Lesson | some days | A grammar lesson unlocks when its pattern starts to appear in your verses. |

At 5 new words a day, the top 300 lemmas take about 2 months. That is where 74% of the Quran's words are fully known (estimate: `docs/research/frequency.md`).

## 8. Open decisions for Umut

1. **Name.** Working name *Fahm* (فهم, "understanding"). Keep it or choose another?
2. **Palette and fonts** above: approve, or change after seeing the mockup.
3. **Underline for known words**, rather than fading the unknown ones. Fading would change how the Quran text looks, so I proposed the underline. Agree?

## 9. The big open problem: where word meanings come from

The best word-by-word data (Quran.com, English + Turkish) **cannot be bundled** into an offline app or a public repo under its terms (`docs/research/sources.md`). Options:

| Option | Gives us | Cost / risk |
|---|---|---|
| **A. Ask Quran Foundation for permission** (developers@quran.com) | Their reviewed English + Turkish word meanings, word audio and timing | Umut writes the request; the answer may be no or take time |
| **B. Our own lemma dictionary from public-domain sources**: Penrice (1873) for English, checked against public-domain verse translations (Pickthall; Elmalılı if the text is the original) | Fully ours, can ship offline | Slow, careful work. 19th-century English needs plain rewording. Turkish has no public-domain word dictionary I know of, so Turkish meanings would be our own translation of sourced English and labelled so. That needs Umut's yes. |
| **C. Fetch live from Quran.com at runtime** | No bundling | Needs secret credentials, so a small server. Not offline. Weekly cache limit. |

My recommendation: **start B for the first 300 lemmas** (it doesn't depend on anyone else, and 300 is a manageable size), and **send A in parallel**. If A says yes, the meanings get better and Turkish comes from a real source.
