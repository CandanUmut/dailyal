# QUL, the Quranic Arabic Corpus dictionary, and Turkish lemma meanings

> Research done 2026-11-21. Every claim below was checked on the live site or on a downloaded file, unless it says **not verified**. No account was made and no log-in was used. Raw downloads are in the session scratchpad, not in the repo.

## Summary

The short answer: **nothing new here is clearly safe to bundle.** QUL has useful data, but its downloads need a log-in and every resource I checked says "We don't have copyright information for this resource." The corpus dictionary only has real dictionary meanings for **verbs**. I found **no** open Turkish dictionary-form (lemma) meanings anywhere.

One finding matters for data we already use: **Açık Kuran's Turkish word meanings are mostly the same text as QUL's Turkish word-by-word file (#99).** Where both have a meaning for a word, 62,781 of 70,536 are identical (89%). So Açık Kuran most likely took them from QUL / Quran.com. Its CC BY-NC-SA badge may not cover them.

| Resource | What | Download without log-in? | Licence | Can we bundle? | Verdict |
|---|---|---|---|---|---|
| QUL translation #99 (Turkish word-by-word) | Turkish meaning per word, 70,539 of 77,429 words | **No.** The buttons open a sign-in box. A copy of the original file is on GitHub (see below) | "We don't have copyright information for this resource." Author "Unknown" | **Unclear.** No licence. | Same base as Açık Kuran's Turkish. Adds nothing new. |
| furkancemalcaliskan/qul-turkish-wbw-translation | Reviewed and completed copy of #99, all 83,665 slots | **Yes** (GitHub raw and release, HTTP 200) | **No licence file.** The README says it does not give the data a licence | **Unclear** (same as #99) | Better coverage, but done by one person with help from tools/AI, and not accepted by QUL. |
| QUL recitation #118 (Alafasy, ayah by ayah, with word timings) | Word start/end times per ayah | **No** (log-in). A preview API answers without log-in, but Tarteel's terms forbid scraping | "We don't have copyright information for this resource." | **No** | The timings match the everyayah `Alafasy_128kbps` files byte for byte (checked 1:1 and 2:255). |
| Alafasy audio files (everyayah / audio-cdn.tarteel.ai / verses.quran.com) | One MP3 per ayah | Yes (HTTP 200) | No terms found for everyayah. QUL docs say "download them once and serve them from your own storage" | **Stream only** (no change from `sources.md`) | Same file on all four hosts. |
| QUL surah info #3 (English) | Surah introductions | No (log-in) | "We don't have copyright information for this resource." The text is from Maududi, *Tafhim al-Qur'an* | **No** | There is **no Turkish** surah info on QUL. |
| QUL morphology #75 (word lemma), word root, #77 (word stem) | Lemma / root / stem per word | No (log-in) | "We don't have copyright information for this resource." | Not needed | We already have the original Quranic Arabic Corpus v0.4 file. |
| QUL Turkish translations (Diyanet, Elmalılı, Muslim Shahin, Shaban Britch, Dar Al-Salam) and tafsirs (Al-Mukhtasar, Ibn Kathir, As-Saadi) | Verse translations and commentary | No (log-in) | "We don't have copyright information for this resource." on every one | **No** | QUL's Elmalılı is the same text as Tanzil's `tr.yazir`. Use Tanzil if needed. |
| QUL GitHub repo | The QUL web app code + a 202 MB partial data dump | Yes | Code: MIT. The data dump has **no** licence statement | **No** | The dump is only part of the data (1,923 of 6,236 verses). |
| Quranic Arabic Corpus dictionary | Short English meaning per verb lemma; only a word class for nouns | Yes (web pages) | Site footer: "available under the GNU public license with terms of use" | **Probably yes** for the verb meanings, with credit and a link, but see the "verbatim" problem below | Useful for about 1,475 verb lemmas. Nouns get no meaning. |
| Açık Kuran `/roots/{latin}` "diffs" | Lemmas of a root, with a count and **one** example meaning | API key needed (proxy) | CC BY-NC-SA badge (repo), like our other Açık Kuran data | Yes, under our current Açık Kuran rule | The Turkish meaning is **one word in one verse**, not a dictionary form (e.g. عَبْد → "kuluyum"). Weak. |
| Open Turkish lemma-level meanings (any source) | Turkish dictionary-form meanings | Nothing found | — | — | **None found.** |

## 1. Tarteel QUL (qul.tarteel.ai)

### 1.0 Things true for every QUL resource
- **Download needs a log-in.** Each "Download json" / "Download sqlite" button is `href="#_"` with `data-url="/users/sign_in?modal=true&user_return_to=…"`. There is no direct file link in the page. Checked on #99, #118, #414, surah info #3, morphology #75 and the root resource.
- **Licence tab.** Every resource I checked (14 of them, listed in the table) shows exactly: "We don't have copyright information for this resource."
- **QUL FAQ** (https://qul.tarteel.ai/faq):
  - "Can I use the data in a commercial project? Yes, you can use QUL data in commercial projects. However, please review the licensing terms for each resource. Some data may have restrictions or require attribution, while others are freely available for commercial use."
  - "The resources available on QUL vary in their copyright status. Some are in the public domain, while others may be subject to specific licenses. We recommend reviewing the licensing information provided by each resource's author before use."
  - "If you only want to download a resource, you do NOT need access to tools." (But you still need an account to download.)
  - "If you have downloaded a resource from QUL, you will receive an email notification whenever that resource is updated." (This is why downloads are tied to an account.)
- **Terms of use.** The QUL footer links to https://tarteel.ai/terms. It says: "No Service Content may be modified, copied, distributed, framed, reproduced, republished, downloaded, scraped, … other than as expressly permitted in these Terms and Conditions. You may not use any data mining, robots, scraping or similar data gathering or extraction methods to obtain Service Content". These terms are written for the Tarteel app. **Not verified** whether Tarteel means them to cover QUL data. But they are linked from QUL, so scraping QUL pages or its preview API is not OK.
- **GitHub** (`TarteelAI/quranic-universal-library`): the `LICENSE` file is MIT, "Copyright (c) 2024-present Tarteel, Inc". This covers the **code**. Nothing in the README gives a licence for the data. (The `gh` API was blocked for this repo in this session. I read the files through raw.githubusercontent.com.)
- **Data dump.** The repo's setup page links a public dump: `https://static-cdn.tarteel.ai/qul/mini-dumps/mini_quran_dev.sql.zip` (HTTP 200, 201,979,245 bytes, dated 2025-07-28; 868 MB unzipped). It is a **partial** sample: 1,923 of 6,236 verses, 500 roots, 500 lemmas, 18,612 of the Turkish word meanings. The `data_sources` table has every name replaced with "Demo". It is meant for developers running QUL locally, not as a data release. It has no licence statement. **Do not use it as a source.**
- **IDs differ.** The website number (e.g. "translation/99") is not the database id. In the dump, Turkish word-by-word is `resource_contents.id = 555`, and id 99 is Bengali.

### 1.1 Turkish word-by-word translation (/resources/translation/99)
- **Download without log-in:** No (sign-in box). But the untouched original QUL file is public on GitHub, inside `furkancemalcaliskan/qul-turkish-wbw-translation`, at `resources/turkish/turkish-wbw-translation.json`: HTTP 200, 1,674,055 bytes, SHA-256 `23c79ff7…49d5`. This matches the hash in that repo's `reports/resource-integrity.json`.
- **Licence:** "We don't have copyright information for this resource."
- **Who made it / source:** Not stated anywhere I could see. The dump row has author "Unknown", no author id, no data source; created 2021-11-18. The page only says "The meaning of each word of the Quran in Turkish." **Not verified** who wrote it. It is very likely the same Turkish word-by-word that Quran.com shows (1:2:1 "hamdolsun" is the same in both), but I did not compare the whole file with Quran.com.
- **Size and coverage:** 70,539 entries. The Quran has 77,429 words, so about 6,890 words (9%) have no Turkish meaning.
- **Format** (from the docs tab): JSON is a flat object keyed by `surah:ayah:word`. SQLite columns: `surah_number`, `ayah_number`, `word_number` (TEXT), `text`.
- **Sample rows** (from the original file):
  ```
  "1:2:1": "hamdolsun"      (ٱلْحَمْدُ)
  "2:2:2": "Kitap"          (ٱلْكِتَـٰبُ)
  "112:1:4": "birdir"       (أَحَدٌ)
  ```
- **Compared with Açık Kuran** (our `data/acikkuran/words.json`, all 77,429 words):
  - 62,781 words have the **identical** Turkish text; 7,755 differ.
  - Açık Kuran has 5,534 **empty** Turkish meanings and some suffix-only ones (e.g. 41:2:2 "-dan", where QUL has "Rahmandan").
  - Most differences look like Açık Kuran moved the Turkish so that each piece sits under the matching Arabic/English word.
  - **Conclusion:** Açık Kuran's Turkish word meanings come from the same source as QUL #99. This answers part of open question G13 in `acikkuran.md`, and it weakens the idea that CC BY-NC-SA covers them.

### 1.2 Reviewed version: github.com/furkancemalcaliskan/qul-turkish-wbw-translation
- **Licence:** there is no `LICENSE` file (404 on `master`). The README says: "The resource #99 licence page states that copyright information is unavailable. We record that uncertainty here. Attribution does not establish that the files are unlicensed or public domain; we do not assign our own licence to the downloaded originals."
- **Download:** release v1.0.0 works without log-in: `turkish-wbw-translation.json` HTTP 200, 2,008,237 bytes, SHA-256 `afc43339…c9d4`, which matches the release `SHA256SUMS`.
- **What they claim (quotes):**
  - "This independent project reviews, completes, and corrects the Turkish word-by-word translation (#99)". "It is not an approved or published QUL release." "QUL submission is pending."
  - "All 831 records were assessed against Arabic and the English reference". "487 records were closed through reviews involving changes, and 344 through reasoned retention."
  - "The spelling/grammar stage corrected 1,162 values."
  - "Tools/AI assisted the work; no independent expert endorsement is claimed." "This is not independent expert certification of every one of the 83,665 translations."
  - "External contributions are currently closed".
- **What I measured:** 83,665 keys (77,429 words + 6,236 verse-number markers such as `"1:1:5": "(1)"`). Compared with the original: 8,909 values changed and 13,126 keys added.
- **A big change in style:** the review adds a bracket notation that splits a Turkish word over two Arabic words. Examples:
  ```
  "2:5:4": "(Rableri)nden"     en: "from"
  "2:5:5": "Rableri(nden)"     en: "their Lord"
  "67:15:2": "(yap)andır"      original: "yapandır"   en: "(is) the One Who"
  "22:32:9": "kalplerin"       original: "kalblerin"  (spelling fix)
  ```
  Reading the text outside the brackets ("nden", "andır") is hard for a learner. Our app would need to handle this notation.
- **Verdict:** more complete and probably cleaner than the original. But there is no licence, one person made it, AI helped, and nobody independent has checked it. I would not make it our main source without Umut's decision.

### 1.3 Word timing for Mishary Alafasy, ayah by ayah
- **Right resource:** https://qul.tarteel.ai/resources/recitation/118, "Mishari Rashid al-`Afasy", "Ayah by Ayah", tags "With segments", "Murattal", "Hafs". Its player uses internal recitation id 18.
  - Others: #414 "Mishari Rashid al-`Afasy Streaming" (surah by surah, with segments). There are also a second surah-by-surah Alafasy and versions with English translation.
- **Download without log-in:** No (sign-in box).
- **Licence:** #118 and #414 both say "We don't have copyright information for this resource."
- **Format** (docs tab): "A segment is a three-number array: [word position, start in ms, end in ms]." Ayah-by-ayah example: `{"surah": 1, "ayah": 1, "audio_url": "https://.../001001.mp3", "segments": [[1, 361, 1051], [2, 1051, 1622]]}`. "Segments are relative to the start of that ayah's own file."
- **Live sample.** The page's preview player calls `/api/v1/audio/ayah_segments/18?surah=1&per_page=10&page=1`. I called it **once**, for surah 1 only: HTTP 200, 1,160 bytes, no log-in. Here each segment has **four** numbers (a 0-based index first):
  ```
  "1:1": audio_url https://audio-cdn.tarteel.ai/quran/alafasy/001001.mp3, segments [[0,1,0,560],[1,2,760,1200],[2,3,2000,2360],[3,4,2680,6120]]
  "1:2": audio_url …/001002.mp3, segments [[0,1,360,840],[1,2,1210,1310],[2,3,2170,2270],[3,4,2440,5640]]
  "1:3": audio_url …/001003.mp3, segments [[0,1,760,1120],[1,2,1440,4680]]
  ```
  Getting all 6,236 verses this way would be scraping, which Tarteel's terms forbid. I did not do it, and I do not recommend it.
- **Which audio the timings match:** they point to `audio-cdn.tarteel.ai/quran/alafasy/SSSAAA.mp3`. I downloaded 1:1 and 2:255 from four hosts. The files are **byte-identical** (same size and SHA-256):
  - `audio-cdn.tarteel.ai/quran/alafasy/`
  - `everyayah.com/data/Alafasy_128kbps/`
  - `verses.quran.com/Alafasy/mp3/`
  - `mirrors.quranicaudio.com/everyayah/Alafasy_128kbps/` (1:1 only)

  1:1 is 146,830 bytes; 2:255 is 831,865 bytes. So the timings also fit everyayah's `Alafasy_128kbps` files. (Two verses checked, not all 6,236.)
- **Bundle or stream?** QUL's "Downloading and Using Data" page says: "For exports that reference CDN-hosted assets (for example recitation audio_url files on audio-cdn.tarteel.ai), download them once and serve them from your own storage or CDN. Tarteel's CDN is shared infrastructure, not a guaranteed production dependency." That is advice about hosting, **not a licence**. The recording rights belong to the reciter/publisher. No terms were found for everyayah (`everyayah.com` home page has no terms text). **Verdict: stream only; no change from `sources.md`.**

### 1.4 Surah info / introductions
- Live list (https://qul.tarteel.ai/resources/surah-info): English (#3), Urdu, Tamil, Malayalam, Indonesian, Italian. **No Turkish.**
- #3 English: the text is Sayyid Abul Ala Maududi's *Tafhim al-Qur'an* (the dump names this source). Licence tab: "We don't have copyright information for this resource." Maududi died in 1979, so the work is still under copyright. **Do not bundle.**
- Download without log-in: No. Formats offered: JSON, CSV, SQLite.

### 1.5 Morphology (lemma, root, stem)
- Live list (https://qul.tarteel.ai/resources/morphology): "Word stem" (#77), "Word lemma" (#75), "Word root" (`/resources/morphology/quran-word-roots`), and the ayah-level "Ayah Stem/Root/Lemma" (#481–483). Only SQLite downloads, all behind log-in. Licence tab: "We don't have copyright information for this resource."
- Preview for 73:4 shows, e.g., تَرۡتِيلًا → lemma ترتيل, root ر ت ل. This is Quranic Arabic Corpus data in another script.
- **No lemma-meaning or dictionary dataset exists on QUL.** The partial dump has empty-looking `dictionary_root_definitions` (3 rows) and `dictionary_word_roots` (2 rows) tables; there is no public resource for them.
- **Verdict:** not needed. We already have the original corpus file with its notice intact.

### 1.6 Turkish tafsir and Turkish translations on QUL
- Turkish translations: Diyanet (#148), Muslim Shahin (#157), Shaban Britch (#161), Dar Al-Salam Center (#196), Elmalılı Hamdi Yazır (#233). Turkish tafsir: Al-Mukhtasar (#258), Ibn Kathir (#306), As-Saadi (#484, only 1,739 of 6,236 verses in the dump). Licence tab on **all eight**: "We don't have copyright information for this resource."
- **Elmalılı:** QUL's text is the same as Tanzil's `tr.yazir` file (header "Last Update: June 4, 2010"). I compared 1:2, 1:5, 2:2 and 112:1, and they are identical, e.g. 1:5 "Ancak sana ederiz kulluğu, ibadeti ve ancak senden dileriz yardımı, inayeti. (Ya Rab!)." The wording looks close to the 1935 original, but some verses have added explanations in brackets (2:2 "müttakiler (kötülükten korunacaklar) için"). **Still open:** which edition this is, so whether it is public domain. QUL adds nothing here; Tanzil is the better route (its terms are already in `sources.md`).
- **Verdict:** nothing on QUL here that we may bundle with a clear licence.

## 2. Quranic Arabic Corpus dictionary (corpus.quran.com/qurandictionary.jsp)

### Licence
- Footer on every page, the dictionary pages included: "Copyright © Kais Dukes, 2009-2017. Maintained by the quran.com team. This is an open source project. The Quranic Arabic Corpus is available under the GNU public license with terms of use." The "GNU public license" links to `/license.jsp`, which is the plain GPL v3 text. The "terms of use" link goes to `/download`.
- The terms of use on `/download` (the same as in our morphology file header): "Permission is granted to copy and distribute verbatim copies of this file, but CHANGING IT IS NOT ALLOWED." and "This annotation can be used in any website or application, provided its source (the Quranic Arabic Corpus) is clearly indicated, and a link is made to http://corpus.quran.com".
- **My reading:** the footer puts the whole corpus, the dictionary included, under GPL + these terms. But the terms were written for the downloadable file. The dictionary glosses are **not** in any downloadable file. Taking them out of web pages and storing them as JSON is a new format. Whether that counts as "changing" is **not clear**. Safest course: keep each gloss text exactly as written, credit the corpus and link to it on the word card and the About page. A short e-mail to the corpus maintainers (the quran.com team) would settle it. That is Umut's decision.
- `robots.txt` does not exist (the request is redirected to the home page), so there are no crawl rules.

### What a page gives (5 pages fetched: Ebd, ktb, Elm, qwl, rHm)
Each page has a summary list of the root's lemmas (Arabic, word class, count). Then one heading per lemma, in the same order, followed by every occurrence with its word-by-word gloss. Parsed pairs:

| Root | Lemma | Count | Heading (the "gloss") |
|---|---|---|---|
| ع ب د | عَبَدَ (form I verb) | 122 | Verb (form I) -to worship |
| ع ب د | عَبَّد (form II verb) | 1 | Verb (form II) -to enslave |
| ع ب د | عَبْد (noun) | 131 | Noun |
| ع ب د | عَابِد (active participle) | 11 | Active participle |
| ك ت ب | كَتَبَ (form I verb) | 49 | Verb (form I) -to write, to prescribe, to ordain |
| ك ت ب | كِتَٰب (noun) | 260 | Noun |
| ع ل م | عَلِمَ (form I verb) | 382 | Verb (form I) -to know |
| ع ل م | عَلَّمَ (form II verb) | 41 | Verb (form II) -to teach |
| ع ل م | يَتَعَلَّمُ (form V verb) | 2 | Verb (form V) -to learn |
| ع ل م | عِلْم (noun) | 105 | Noun |
| ع ل م | عَلِيم (nominal) | 163 | Nominal |
| ق و ل | قَالَ (form I verb) | 1,618 | Verb (form I) -to say |
| ق و ل | تَقَوَّلَ (form V verb) | 2 | Verb (form V) -to fabricate, to make up |
| ق و ل | قَوْل (verbal noun) | 92 | Verbal noun |
| ر ح م | رَّحِمَ (form I verb) | 28 | Verb (form I) -to have mercy |
| ر ح م | رَحْمَة (noun) | 114 | Noun |
| ر ح م | رَّحْمَٰن (nominal) | 57 | Nominal |

**Important:** only **verbs** get a meaning. Nouns, adjectives, participles and "nominals" get only their word class ("Noun"), with no meaning. On all 5 pages, every lemma that was not a verb had no gloss. For nouns, the only English on the page is each occurrence's in-context gloss (e.g. عَبْد at 2:23:8 → "Our slave"). Those are the same glosses we already have from the word-by-word data. The page itself warns: "The translations below are brief glosses intended as a guide to meaning."

### Size
- 1,642 roots in our corpus v0.4 file, so 1,642 pages (Açık Kuran has 1,641 roots). 4,832 lemmas in all; 175 of them have no root (particles, names) and are not on root pages.
- About 1,475 lemmas appear as verbs. These are the ones that would get a dictionary meaning.
- Page size grows with how often the root occurs: 111 KB (Ebd, 275 occurrences) to 625 KB (qwl, 1,722). Every page held all its occurrences; none was split into pages. Rough total: 1,642 pages × ~150 KB ≈ 250 MB of HTML (**an estimate**; I only measured 5 pages).

### Polite scrape plan (not started; needs Umut's yes)
1. Build the list of 1,642 roots from our local corpus file. Convert each root to the site's Buckwalter form (`Ebd`, `ktb`, `Elm`, `qwl`, `rHm`; some letters need URL encoding, e.g. `Ey%24` for ع ي ش, `Ew*` for ع و ذ).
2. One request at a time, **one every 10 seconds** (about 4.6 hours in all). Plain, generic User-Agent; no personal data.
3. Save each raw page to a cache folder that is **not committed** (like `data-raw/`). Skip pages already saved, so a rerun costs nothing. Stop on any 429 or 5xx and wait before retrying.
4. Parse only the summary list + the `h4 class="dxe"` headings. Keep the gloss text exactly as written. Check that the number of lemmas equals the number of headings on every page (true on all 5 samples). Report any mismatch.
5. Store root, lemma (Arabic exactly as on the page), word class, count, gloss, with the corpus notice and link.
6. Run once. Do not re-scrape on every build.

**Is it worth it?** Only partly. It gives about 1,475 English verb meanings in dictionary form ("to worship"). It gives nothing for nouns and nothing in Turkish.

## 3. Open Turkish lemma-level (dictionary-form) meanings

**Result: I found none that is open and reliable.**

- **Açık Kuran `/v1/roots/{latin}`** (3 of the 10 allowed calls used: Ebd, ktb, Elm; all HTTP 200).
  - Each root returns `mean` (Turkish root meaning) and `mean_en` (we already have these in `data/acikkuran/roots.json`), plus `diffs`: one row per lemma with `diff` (Arabic lemma), `count`, `translation`, `translation_en` and transcriptions.
  - The `translation` is **one inflected, in-context word meaning**, not a dictionary form:
    ```
    عَبْد   131 | tr: "kuluyum"            | en: "a slave"
    عَبَدَ  122 | tr: "kulluk edin"        | en: "worship"
    عَلِمَ  382 | tr: "bilmişti"           | en: "knew"
    عِلْم   105 | tr: "bilgimiz"           | en: "knowledge"
    يَتَعَلَّمُ 2 | tr: "fakat öğreniyorlardı" | en: "But they learn"
    كَتَبَ  49  | tr: "yazıldı"            | en: "Prescribed"
    ```
    "kuluyum" means "I am a servant", and "bilmişti" means "he had known". These are fine as **examples**, wrong as **headwords**. The Turkish also comes from the same word-by-word source as QUL #99 (see 1.1).
  - **Verdict:** usable only as "one example meaning", clearly labelled. Not a dictionary.
- **QUL:** no Turkish lemma or root meanings (only the word-by-word file).
- **GitHub and the web** (three searches in English and Turkish):
  - `AbstractThinker0/quran-roots`: roots and derived words from the Zekr app. **Not verified** whether it has any meanings.
  - `hablullah/data-quran`: a search result says it has word-by-word files under CC BY-NC-ND 4.0 (no derivatives). The repo now returns **404**. **Not verified.**
  - Turkish theses on Quran word forms on `acikbilim.yok.gov.tr` (YÖK open archive), and books such as *Kelamullah*: either not machine-readable or not openly licensed. **Not verified** in detail.
  - Diyanet's Kur'an portal (kuran.diyanet.gov.tr) has a word search, but I found **no terms** that allow reuse.
- **Public-domain fallback (from `sources.md`):** Penrice (1873) is English, not Turkish. For Turkish, a public-domain classic would need an author who died before 1956 (Turkish law: life + 70 years). **Not researched** here.

## 4. What I could not verify
- Who wrote the QUL Turkish word-by-word (#99) and where it came from. QUL says "Unknown".
- Whether the QUL Turkish file is exactly the same as Quran.com's Turkish word-by-word. Only one word checked (1:2:1).
- Whether Tarteel's terms (no scraping) are meant to cover QUL.
- Whether the corpus's "verbatim only" rule allows taking the dictionary glosses out of web pages.
- Which edition of Elmalılı Tanzil and QUL carry.
- Whether the Alafasy files match on all 6,236 verses (2 checked).
- Licence and content of `hablullah/data-quran` (repo gone) and `AbstractThinker0/quran-roots`.
- The full QUL downloads themselves (not seen, because they need a log-in).

## 5. Recommendation
1. **Keep the current plan.** Tanzil text, corpus v0.4 morphology, Açık Kuran data. Nothing found here is safer.
2. **Tell Umut about the Turkish word meanings.** Açık Kuran's Turkish word meanings are, for 89% of words, the same as QUL #99, which has **no known author or licence**. Our current rule rests on Açık Kuran's CC BY-NC-SA badge, and that badge may not really cover this text. This changes our licence picture, so it is Umut's decision. Options:
   - (a) Keep Açık Kuran and say "source: Açık Kuran (based on the Quran.com/QUL Turkish word-by-word)".
   - (b) Ask Açık Kuran where the Turkish word meanings come from.
   - (c) Ask QUL (GitHub issue) who made #99 and under what licence.
3. **Do not use QUL downloads, its data dump or its preview API.** Each needs a log-in, has no licence, or would be scraping.
4. **Word timing (light up the word as it is recited):** still no source we may bundle. If Umut wants it, the honest route is to ask Tarteel (GitHub issue or Discord) whether #118 segments may be bundled in a free app with credit. The timings fit everyayah's `Alafasy_128kbps` audio, which we would stream.
5. **Turkish dictionary-form meanings do not exist openly.** If the app needs them, they must be written by hand from a cited source, or Umut accepts a label like "example meaning: kuluyum (2:23)". Write this in `docs/CONTENT_GAPS.md`. I did not edit that file.
6. **Corpus dictionary scrape:** worth it only for English verb meanings (~1,475). If Umut says yes, follow the plan in section 2 (one page every 10 s, cached, run once). Optionally e-mail the corpus team first about the "verbatim" rule.
7. **The reviewed Turkish wbw (furkancemalcaliskan):** do not adopt it yet. It has no licence, one person made it with AI help, and its bracket notation would change how word cards look. Watch whether QUL accepts it.

## Request log
- qul.tarteel.ai: about 40 page requests (resource pages, licence/docs tabs, docs) and 1 preview-API call (surah 1 only).
- static-cdn.tarteel.ai: 1 dump download (202 MB).
- Audio: 9 MP3 downloads, to compare files.
- api.acikkuran.com: 3 calls (of 10 allowed).
- corpus.quran.com: 5 dictionary pages, plus the licence, download and robots pages.
- GitHub raw: README/licence files of 2 repos, plus the original and reviewed Turkish files.
- No log-in and no account; no personal data sent.
