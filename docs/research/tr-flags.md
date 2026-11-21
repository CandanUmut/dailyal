# Turkish word meanings: review flags (surah 1, surahs 93–114)

Data: `data/review/tr-flags.json`. Source checked: `data/acikkuran/words.json` (Açık Kuran word-by-word). Reviewed 2026-11-21.

## Summary

- 714 words read, one by one, in 23 surahs.
- **31 flags**: 27 words have an **empty** Turkish meaning, and **4** have a Turkish meaning that is wrong for that exact word.
- **13 unsure** cases are listed separately, for a person to decide.
- So the Turkish is good for about 96% of words. The real errors are few, but each one teaches something wrong about that one word.
- No new Turkish meanings were written. This is a list of flags only.

## Counts per surah

Words = words in the surah. "Wrong" = shifted, voice or person. "Empty" = missing.

| Surah | Words | Wrong | Empty | Unsure |
|---|---|---|---|---|
| 1 | 29 | 1 | 0 | 0 |
| 93 | 40 | 1 | 4 | 1 |
| 94 | 27 | 0 | 1 | 1 |
| 95 | 34 | 0 | 1 | 0 |
| 96 | 72 | 0 | 6 | 0 |
| 97 | 30 | 0 | 1 | 0 |
| 98 | 94 | 1 | 3 | 2 |
| 99 | 36 | 0 | 0 | 0 |
| 100 | 40 | 0 | 4 | 1 |
| 101 | 36 | 0 | 0 | 0 |
| 102 | 28 | 0 | 0 | 2 |
| 103 | 14 | 0 | 0 | 0 |
| 104 | 33 | 0 | 2 | 0 |
| 105 | 23 | 0 | 3 | 1 |
| 106 | 17 | 0 | 0 | 0 |
| 107 | 25 | 0 | 0 | 2 |
| 108 | 10 | 0 | 0 | 1 |
| 109 | 26 | 0 | 0 | 1 |
| 110 | 19 | 0 | 0 | 0 |
| 111 | 23 | 0 | 1 | 0 |
| 112 | 15 | 1 | 0 | 0 |
| 113 | 23 | 0 | 1 | 1 |
| 114 | 20 | 0 | 0 | 0 |
| **Total** | **714** | **4** | **27** | **13** |

## Kinds of errors

- **Missing (27).** The Turkish is empty. These are almost all small words: `lam` / `alam` (not, did not), `fī` (in), `ʿalā` (on), `min` (from), `ilā` (to), `alladhī` (the one who), `idhā` (when). Turkish puts their meaning into an ending on the next word (`bilmediği`, `kabirlerde`), so the verse reads fine. But a learner who taps the word sees nothing. In 93:2:2 (`idhā`, "when") the meaning is not really carried anywhere.
- **Shifted (2).** The Turkish belongs to the word next to it.
- **Voice (1).** A passive verb is given an active meaning.
- **Person (1).** "to Him" is given as "to themselves".
- No "different word entirely" case was clear enough to flag. The closest ones are in the unsure list.

## 10 typical examples

| Key | Arabic | English (Corpus) | Turkish (Açık Kuran) | Flag |
|---|---|---|---|---|
| 1:7:4 | عَلَيْهِمْ | on them | kimselerin | shifted: "those", the meaning of ٱلَّذِينَ |
| 93:10:1 | وَأَمَّا | And as for | ve sakın | shifted: "beware" comes from فَلَا (93:10:3, which is empty) |
| 98:5:7 | لَهُ | to Him | kendilerine | person: means "to themselves" |
| 112:3:4 | يُولَدْ | is he begotten | doğuranı | voice: means "the one who bore him" |
| 96:1:4 | ٱلَّذِى | the One Who | (empty) | missing |
| 100:9:6 | فِى | (is) in | (empty) | missing: carried by `kabirlerde` |
| 93:2:2 | إِذَا | when | (empty) | missing: not really carried anywhere |
| 108:2:3 | وَٱنْحَرْ | and sacrifice | ve göğüs ger | unsure: a minority reading ("stand firm"); translators differ |
| 102:6:1 | لَتَرَوُنَّ | Surely you will see | mutlaka görürdünüz | unsure: "you would see", read as the answer to `law` |
| 107:2:2 | ٱلَّذِى | (is) the one who | kimseler | unsure: singular word, plural Turkish |

## How I decided

1. A script (kept outside the repo) printed every word as `key | Arabic | English | Turkish`, verse by verse. I read all 714 rows myself, surah by surah. Nothing was flagged by an automatic rule except "Turkish is empty".
2. The English (Quranic Arabic Corpus) and the Arabic were the reference.
3. **Not flagged:**
   - free but fair renderings (`sinsi` for "the one who withdraws", `gerçeği karartanlar` for "disbelievers", `andolsun` for oath `wa-`);
   - word order and endings that Turkish needs (`-nden`, `ilki-`, `ay-`);
   - a meaning shared with the next word, when the two words read right together AND this word's Turkish still fits it. Examples: `ve olmazsınız` for وَلَآ; `yoktur` + `doğurduğu` for لَمْ يَلِدْ;
   - literal meanings where the English is idiomatic (`onun anası` for فَأُمُّهُۥ, "his abode").
4. **Flagged:** a learner who taps this one word would learn something wrong about it (wrong word, voice, person or number), or would see nothing (empty).
5. If I was not sure, I did not flag. Those cases are in `unsure`, at most 20.

## Limits

- One reviewer, one pass. The 4 "wrong" flags are clear. The 13 unsure cases need a second opinion.
- Only surah 1 and surahs 93–114 were checked (714 of 77,429 words). If the same error rate holds elsewhere, expect roughly 0.5% wrong and 4% empty. That guess has not been tested.
- The empty Turkish entries may be on purpose in Açık Kuran (meaning folded into the next word). Whether to fill them or show a note is a design choice for Umut.
