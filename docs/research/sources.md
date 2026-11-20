# Sources and licences

> Phase 0 research, 2026-11-20. Each row says what was actually read. A question that has not been answered yet is marked **open**, not guessed.

## Summary

| Need | Best source found | Can it ship inside the app (offline, in a public repo)? |
|---|---|---|
| Quran text (Uthmani) | **Tanzil** | **Yes**, verbatim only, with the notice and a link |
| Root and dictionary form (lemma) of every word | **Quranic Arabic Corpus v0.4** | **Yes**, verbatim only, with the notice and a link. The download asks for an e-mail address (see below) |
| Word-by-word meanings, **English** | **Quranic Arabic Corpus** word-by-word pages (University of Leeds; the same English glosses Quran.com shows) | **Yes**, GNU GPL with credit and link (decided 2026-11-20) |
| Word-by-word meanings, **Turkish** | Quran.com API (live) | Fetch live in the app, cache ≤ 1 week (their terms). Not bundled |
| Verse translations, English and Turkish | Tanzil translations: **Saheeh International** (EN), **Diyanet İşleri** (TR) | **Yes** for this app: Tanzil allows non-commercial use, and the app has no income (Umut, 2026-11-20). Credit each translator |
| Recitation audio (per verse) | everyayah.com, Quran.com | Stream only. Keep offline only when the user asks (**open** for everyayah: no terms found) |
| Word timing inside verse audio (for "light the word as it is recited") | Quran.com API | **No** bundling (same terms) |
| Audio of single words | Quran.com (`audio.qurancdn.com/wbw/…`) | **No** bundling (same terms) |

**What this means:** the text and the grammar data are fine. The **word-by-word meanings are the one hard problem**: this is the heart of the app, and the easy source cannot be bundled. Options are in the design brief, §9.

## Details

### Tanzil Quran text
- Read: https://tanzil.net/docs/text_license and the header of the downloaded file (`quranType=uthmani`, `txt-2`).
- Licence: Creative Commons Attribution 3.0, with these terms of use: "Permission is granted to copy and distribute verbatim copies of this text, but CHANGING IT IS NOT ALLOWED." It "can be used in any website or application, provided that its source (Tanzil Project) is clearly indicated, and a link is made to tanzil.net". The copyright notice must be included.
- Rule for us: the build reads the file unchanged and shows the text exactly as given. Never retype or "fix" the Quran text. Credit and link on the About page.

### Quranic Arabic Corpus (morphology v0.4)
- Read: https://corpus.quran.com/download/ (the file header shown on that page) and https://corpus.quran.com/license.jsp.
- Licence: GNU GPL, plus terms of use: verbatim copies only ("CHANGING IT IS NOT ALLOWED"), "can be used in any website or application, provided its source (the Quranic Arabic Corpus) is clearly indicated, and a link is made to http://corpus.quran.com".
- The download form asks for a contact e-mail. I did **not** enter Umut's e-mail. **Open:** Umut downloads the file once, or says which address to use.
- A fork on GitHub (`mustafa0x/quran-morphology`) fixes many roots and lemmas, but it **changes** the file and has no licence. Rule: the app uses the original v0.4 only. The fork was used **only** for the first frequency estimate in `frequency.md`, which must be redone on the original.

### Quran.com / Quran Foundation API
- Read: https://api-docs.quran.foundation/legal/developer-terms (updated 2026-11-20) and the Content Sync getting-started page. This was read through the web-fetch tool, and the quotes come from its report.
- Checked that it works: `api.quran.com/api/v4` returns word-by-word English and Turkish (e.g. 1:2 → "All praises and thanks" / "hamdolsun"), word audio URLs and word timing segments (Alafasy).
- Terms, in short:
  - Content may not be cached for longer than 1 week, except through "Content Sync". Content Sync needs credentials and approved production access, and must re-sync at least every 7 days.
  - "The Content Sync storage exception does not itself authorize distributing a prepackaged database or build-time bundle."
  - "Including Quran Foundation Content or raw API data in a public source-code repository … is redistribution", which is not allowed.
  - Audio may be kept offline only when the user asks for it, in private app storage, with credit to Quran Foundation and the reciter.
  - The terms do not say whether the old public `api.quran.com/api/v4` falls under them. I treat it as covered.
  - Contact for permission: developers@quran.com.
- Rule for us: no data from this API goes into the repository or the build. Live use at runtime would need credentials, and those must stay secret, which a static site cannot do without a server. **Open:** ask Quran Foundation for permission (Umut's decision).

### Tanzil translations
- Read: https://tanzil.net/trans/ ("for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher").
- Available there: English (Pickthall, Yusuf Ali, Arberry, Saheeh International, Hilali & Khan, and others) and Turkish (Diyanet İşleri, Diyanet Vakfı, Elmalılı Hamdi Yazır, Süleyman Ateş, Suat Yıldırım, and others).
- Public-domain candidates, still to be checked one by one:
  - **Pickthall** (published 1930; the author died in 1936).
  - **Elmalılı Hamdi Yazır** (died 1942). **Open:** whether Tanzil's text is the original or a later simplified edition. A simplified edition would have its own copyright.
- **Open:** a licence check for each translation before any of it ships.

### Public-domain dictionary for word meanings
- John Penrice, *A Dictionary and Glossary of the Kor-ân* (1873). It is public domain and was written specifically for Quran vocabulary. Scans are on archive.org (`adictionaryandg00penrgoog`).
- **Open:** how good the scan's Arabic is. The meanings would have to be typed in by hand or checked against the scan, and they are written in 19th-century English.

### Audio
- everyayah.com: per-verse MP3s load (e.g. `Alafasy_128kbps/001001.mp3`). No terms page was found. **Open.**
- Rule for us: stream only, never bundle. Offer offline download only on the user's own request, with credit to the reciter and the source.

### Fonts
- **Amiri Quran** (SIL Open Font License). It can be self-hosted. It is my mockup choice for Quran text.
- KFGQPC Uthmanic Hafs is the classic Mushaf font, but its redistribution terms are **open**.

## Decision 2026-11-20 (Umut)
"Don't worry about the licensing, we don't have any income intention from this app so you can use the most trusted and free sources."

What this changes:
- **Tanzil translations:** allowed, because their terms are "non-commercial purposes only". Chosen: Saheeh International (English) and Diyanet İşleri (Turkish), both widely trusted. Each is credited by name.
- **English word meanings:** the Quranic Arabic Corpus word-by-word glosses (GPL). Checked 1:2: "All praises and thanks / (be) to Allah / the Lord / of the universe". These are the same glosses Quran.com shows, so we get the trusted data from its free, GPL source.
- **What it does not change:** the Quran Foundation terms forbid bundling for **all** apps, paid or free, so having no income does not change them. Their Turkish word meanings are therefore fetched live when online and cached for at most a week. When offline, the app falls back to the English word meaning plus the Diyanet verse translation. Umut can overrule this.
