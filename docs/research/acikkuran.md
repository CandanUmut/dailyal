# Açık Kuran (acikkuran.com) as a data source

> Checked 2026-11-20. The questions that are still open are listed at the end.

## What it is
- A volunteer, non-profit, ad-free Quran site: "an open-source project founded on the principles of volunteerism … a non-profit initiative" (API README).
- Code: https://github.com/acik-kuran/acikkuran-api (and the frontend repo). The README's licence badge says **CC BY-NC-SA 4.0**.
- API: `https://api.acikkuran.com/v1`. Its docs are at https://acikkuran.com/docs/api.
  - It needs a free key (`Authorization: Bearer ak_…`).
  - The docs say to keep the key on a server, not in a browser ("API tarayıcıdan doğrudan çağrılmaya açık değildir").
  - Limits: 60 requests/minute, 20 searches/minute, 10,000 requests/day.
- The README's sample `.env` points to a public **test** database, with the warning "do not use this data in your own application". We use the production API with Umut's key, not the test database.

## How we use it
- **Download once, at build time** (`scripts/data/fetch-acikkuran.mjs`), with Umut's key injected by the network proxy. The key is never in the repo or the app.
- The packed data (`data/acikkuran/`) is shared under **CC BY-NC-SA 4.0**, the same licence. The app credits Açık Kuran on word cards and on the About page.
- Umut decided (2026-11-20) that the app is non-commercial and should use the most trusted free sources.

## What it gives (checked on real responses)
- `/surahs/{s}/verses/{v}/words`: for each word, the Arabic, Turkish and English transcription, a **Turkish meaning** (`translation_tr`) and an **English meaning** (`translation_en`), grammar labels in Turkish and English, and the root. The root comes with its Arabic letters, a Turkish and an English meaning, a count, and often "Türkçe'ye girmiş türevler" (Turkish words derived from it).
  - Example 1:2: ٱلْحَمْدُ "hamdolsun" / "All praises and thanks"; root حمد (count 63).
  - The English meanings are the same as the Quranic Arabic Corpus word-by-word ("All praises and thanks", "(be) to Allah", "the Lord").
- `/surahs/{s}?author={id}`: a whole surah in one translation, with footnotes.
  - Chosen: **11 Diyanet İşleri** ("Kur'an-ı Kerim Türkçe Meali") and **32 Sahih International**.
  - Diyanet sometimes joins verses, e.g. 1:2 reads "(2-4) Hamd, Alemlerin Rabbi, …". The app must show such a range once and say so.
- Word numbering matches the Quranic Arabic Corpus (checked on 2:3, 8 words). The build checks every verse.

## Open
- G9: The data licence is not stated apart from the repository's CC BY-NC-SA badge. We treat the data as CC BY-NC-SA.
- G12: Which Diyanet edition is author 11? The name only says "Kur'an-ı Kerim Türkçe Meali".
- G13: Who wrote the Turkish word meanings, and how were they checked? Not stated. The app labels them "Açık Kuran word-by-word".
