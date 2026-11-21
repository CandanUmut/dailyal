# Design Brief v2: "Fahm" round 2

> Status: **proposal for Umut's yes** (2026-11-21). Nothing here is built yet. It answers Umut's request: "the best curriculum possible to learn and understand the Quran … simple to use, a joy to look at and touch, a unique design to display the beauty of the words and the language, how it is used … I plan to use it daily."

## 0. Summary

1. **One path, not five tabs.** Today becomes a single path through **surah units**: the surahs you pray, from Al-Fatiha and the short surahs onward. Each unit takes a few days and ends when you can **follow that surah by ear**. Words, listening and grammar live inside the units, not in separate places.
2. **Hear the words light up.** If the Tarteel QUL word timings can be used (research running), each word gets a soft underline the moment it is recited. Tap any word to see its meaning **here** and its **dictionary meaning**.
3. **Show how the language works, without claims.**
   - **Root families:** one root, its words, and how often each appears.
   - **Where a word lives:** a map of the 114 surahs showing where the word occurs.
   - **The sound of a surah:** its verse endings, lined up (every verse of An-Nas ends in ـاس).

   These are patterns the learner can see in the text. The app never states a "miracle"; it lets the text show itself.
4. **A calmer, richer look.** It stays the same ink-on-paper base (approved in Phase 0). It adds:
   - big Arabic as the hero of every screen
   - a Kufi display face for roots
   - fine manuscript-style rules and verse markers
   - gentle, tactile motion (none with reduced motion)
5. **Size: about 6–7 work sessions**, in 4 steps, each ending with phone screenshots, tests and a critic pass (§6).

## 1. What makes it unique (and why it should work)

| Idea | Why |
|---|---|
| **Your prayer surahs are the curriculum.** | You hear them every day, so every unit pays off right away. It is also "comprehensible input" at its best: short, repeated, meaningful texts (`research/learning.md`). |
| **Done = you can follow it by ear.** | Not "cards reviewed": a surah unit closes only when you pass a listening check without the text. |
| **Frequency still drives the words.** | Within a unit, a word's card says how many times it appears in the whole Quran. Learning أَحَد in Al-Ikhlas opens it in 74 other places. |
| **Meaning in two layers.** | "Here" (the meaning in this verse, Açık Kuran word-by-word) and "in the dictionary" (one meaning per dictionary form, from a reliable source; Umut asked not to write our own). |
| **Beauty as information.** | Every drawing means something you can say in one sentence (Phase 0 rule): root families, word maps, verse-ending sounds, the recitation lighting up. |

## 2. The curriculum

### 2.1 Units
A unit is one surah, or a section (2–7 verses) of a longer one.

The default order: Al-Fatiha, then Juz 30 from the easiest to the hardest. "Easiest" means the highest share of words you already know, combined with shortness. Units from **My surahs** come first. A unit has 5 steps; most take 1–2 days at about 15 minutes a day:

| Step | What you do | Ends when |
|---|---|---|
| 1. **Meet** | Hear the whole surah once, no text. See its name and meaning, Meccan or Medinan, and how many verses. | You have listened once |
| 2. **Words** | Learn the words of this surah you do not know yet, most frequent in the Quran first; each card shows the word in this surah. | Each new word recalled once |
| 3. **Verse by verse** | Hear first, then the text with words lighting up; tap any word (here + dictionary meaning, root). | All verses seen |
| 4. **Listen** | The ladder: 2–3 verses without the text, then questions (what was said, what came next, who speaks). | Passages answered |
| 5. **Follow** | The whole surah by ear, no text, a short check, and "how much did you follow?" | Check passed → the surah is **followed** |

Then the surah enters **narrow listening**: you hear it again after 1, 3, 7 and 14 days, and its words go into daily review.

### 2.2 Always there, never in the way
- **Daily review** (the current spaced review), folded into Today as one line: "12 words to review · 4 min".
- **Lessons** appear when their pattern first appears in your unit. Pronoun endings come with Al-Fatiha (إِيَّاكَ، نَعْبُدُ). Negation comes with Al-Ikhlas (لَمْ يَلِدْ). Lessons are not a separate list to read through.
- **Reader and search** stay, under "Quran".

### 2.3 Navigation: from 5 tabs to 4
**Today** (the path) · **Quran** (surahs, reader, search) · **Words** (review, roots, phrases) · **You** (progress, settings).

## 3. The visual language

**Kept from Phase 0:**
- warm paper and ink
- the one rubric-red accent
- the Quran text always in full ink, never coloured, never animated
- the thin underline for known words

**New:**

| Element | What it looks like | What it means |
|---|---|---|
| **Hero Arabic** | The verse or word in Amiri Quran at 34–40 px, generous line height, centred on its own "page" with fine double rules above and below | The text comes first |
| **Recitation light** | A soft ink underline grows under the word being recited (needs word timings). Reduced motion: it appears without growing | "This is the word you hear now" |
| **Root letters** | The three root letters set large in a Kufi face (Reem Kufi, OFL), spaced apart, with the family's words around them | The root is the shared core of the words |
| **Where it lives** | 114 thin bars (the surah strip you know), with a dot on each surah where the word occurs | How the word is used across the Quran |
| **The sound of a surah** | Verse endings collected in a quiet column beside the text: ـحَد ـمَد ـلَد ـحَد | Rhyme you can hear; shown beside the text, never by colouring it |
| **Unit path** | A single fine thread down the Today screen; each surah a small round mark: empty, half, or filled when followed | Your journey through the surahs you pray |
| **Touch** | Larger cards (min 56 px rows), a soft press state, and a gentle sheet that slides up for word details | A joy to touch, one-handed |

**Never:** gold-on-green, mosque or crescent images, geometric patterns as filler, confetti, streaks, badges, or claims of numerical "miracles".

## 4. Sources this depends on (research running)

| Need | Candidate | Status |
|---|---|---|
| Word timings for the recitation light | Tarteel QUL segmented recitations (Alafasy) | Being checked: download access and licence (`research/qul-and-dictionaries.md`) |
| Dictionary meaning per word, English | Quranic Arabic Corpus dictionary (one gloss per form, GPL) | Sample checked: عَبَدَ = "to worship" |
| Dictionary meaning per word, Turkish | Tarteel QUL Turkish word-by-word (+ a reviewed version on GitHub); Açık Kuran root meanings (Turkish, dictionary-style) | Being checked |
| Surah introductions | Tarteel QUL "surah info" | Optional. Umut asked why they are needed (§5) |

## 5. Answers to Umut's questions

- **"Why do we need introductions?"** Not strictly needed. One study (Chang & Read 2006) found that knowing the topic before listening helped second-language listeners more than a vocabulary preview did. That is why the plan had them. The v2 "Meet" step needs only the surah's name and its meaning (already sourced). A longer introduction would be optional, and only from a reliable source. **Proposal:** no introductions unless a reliable source appears.
- **The "persons" line (Q3):** v2 keeps only what grammar can show safely: "I / we / you" on verbs, inside the word sheet. The full line under each verse is removed. It confused more than it helped.

## 6. Size and order (each step: build → screenshots → tests → critic → fix)

| Step | What | Size |
|---|---|---|
| A | Sources: download and check QUL timings and dictionary data; corpus dictionary glosses; rebuild meanings in two layers | 1–1.5 sessions |
| B | Navigation (4 tabs) and the Today path with surah units, unit progress and narrow listening | 1.5 sessions |
| C | Visual language: hero Arabic, word sheet, root page with Kufi letters, word map, verse-ending column, recitation light | 2 sessions |
| D | Lessons in context; polish; accessibility and performance on a mid-range phone; final critic | 1–1.5 sessions |

**Total: about 6–7 sessions.**

**Decisions for Umut:**
1. Yes or no to this direction.
2. Is the unit order right: Al-Fatiha, then Juz 30 from easiest to hardest, My surahs first?
3. Is the Kufi face for roots welcome? (The mockup shows it.)
