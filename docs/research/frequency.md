# Word frequency: how far do the most frequent words take you?

> Phase 0 estimate, 2026-11-20. **Source caveat:** I counted with the GitHub fork of the Quranic Arabic Corpus (`mustafa0x/quran-morphology`), because the original download needs an e-mail address. The fork changes some lemmas. These numbers must be recomputed on the original v0.4 file before the app shows them.

## Method
- The corpus splits every word into parts (prefix, stem, suffix), and most parts carry a lemma (dictionary form). Example: وَٱلْكِتَٰبِ = و (and) + ال (the) + كِتَاب (book).
- I ranked lemmas by how often they occur, then asked two questions:
  1. **Parts:** what share of all word parts belong to the top N lemmas?
  2. **Whole words (more honest):** what share of whole words have every one of their parts in the top N? I also counted how many verses have every word known.

## Results

Totals: 77,429 words, 4,776 distinct lemmas, 1,651 roots, 6,216 verses.

| Top N lemmas known | Parts covered | Whole words fully known | Verses with every word known | Verses with ≥ 90% known |
|---|---|---|---|---|
| 100 | 68.9% | 57.7% | 35 | 62 |
| 300 | 81.1% | 74.2% | 450 | 798 |
| 1,000 | 92.2% | 89.3% | 2,176 | 3,361 |

Roots: the top 300 roots cover 83.5% of the word parts that have a root.

## What it means, plainly
- The often-quoted "learn 300 words and understand 70% of the Quran" claim is roughly right, **if** "understand" means "know every word part". Counted that way, 300 lemmas get you to 74% of whole words.
- Knowing every word in a verse is **not** the same as understanding the verse. Grammar (who does what to whom), idioms and context still matter. So the app also teaches the small grammar that unlocks the most meaning.
- The number of fully known verses grows fast: 35 at 100 lemmas, 450 at 300 and 2,176 at 1,000. This is why the **Listen** practice can pick verses you can now follow completely (Umut's choice: order by frequency).
- The top lemmas are mostly small words: و and, ال the, لِ for/to, مِن from, فَ so/then, اللَّه, ما what/not, بِ with/in, لا no/not, فِي in, إِنَّ indeed, قالَ he said, الَّذِي who/which. The app must teach them well, even though they are "easy".

## Known weaknesses of this count (to fix in the recount)
- Word parts with no lemma in the corpus (e.g. some separate pronouns like هُوَ) were left out of the counts.
- Verses made only of the opening letters (e.g. الٓمٓ) have no lemma, so they are counted as "not known".
- Tanzil's text puts the Basmala at the start of verse 1 of most surahs, but the corpus does not. Matching words by position shifts there. A first matcher using Tanzil's word positions found 396 fully known verses at N = 300, against 450 by corpus position. The recount must line the two up properly. Until then, treat 400–450 as the range.
