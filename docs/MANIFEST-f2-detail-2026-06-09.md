# MANIFEST — F2.5 Detail-chrome (wit op canvas) — 09-06-2026

Zip: `md-f2-detail-2026-06-09.zip` (moedermap-structuur, session-log.md in root)

## Bestanden in deze levering (allemaal VERVANGEN, geen nieuwe/verwijderde)

| Pad | Wijziging |
|-----|-----------|
| `src/styles/globals.css` | + additief `§F2.5`-blok (detail-chrome) — niets anders gewijzigd |
| `src/app/materials/[slug]/page.tsx` | hoofdkolom in `.detail-sheet`; tags-rij mee het vel in; back-link op de paper (`.detail-back-row`) |
| `src/app/articles/[slug]/page.tsx` | hoofdkolom in `.detail-sheet`; back-link op de paper; `ArticleRelated` naar de paper (`.detail-related-row`) |
| `src/app/talks/[slug]/page.tsx` | hoofdkolom in `.detail-sheet`; back-link op de paper; "More talks" naar de paper (`.detail-related-row`) |
| `src/app/events/[slug]/page.tsx` | hoofdkolom in `.detail-sheet`; back-link op de paper |
| `src/app/brands/[slug]/page.tsx` | hoofdkolom in `.detail-sheet` (geen back-link/related) |
| `session-log.md` (root) | + F2.4 (teruggezet) + F2.5 entries |
| `docs/email-johan-f2-detail.txt` | Mail-concept voor Johan |

NIET in deze levering (bewust ongemoeid): `DetailHeader.tsx` (geen wijziging nodig).

## Verificatie (uitgevoerd)

- **globals.css puur additief:** eerste 11878 regels byte-identiek aan de aangeleverde
  main; `comm -23 (main, mijn versie)` leeg; comment-balans 11/11 in `§F2.5`.
- **Alle 5 page.tsx syntax-OK** via esbuild (tsx-loader), zowel verbatim als na de
  wrapper-edit.
- **Getargete klassen bestaan** in main (pills, CTA-sub-elementen, gallery-thumb,
  sectietitel, back-links); `§F2.5` staat achteraan dus wint op gelijke specificiteit.
- **Dark mode:** geen botsende dark-regels op de CTA-kaarten/header; de dark-pill-
  regels (amber/rood) worden door `§F2.5` neutraal overschreven.

## Let op (globals.css)

`globals.css` = huidige main + `§F2.5` (additief). Johan kan desgewenst alleen het
`§F2.5`-blok toevoegen i.p.v. het hele bestand overschrijven — er is verder niets
gewijzigd.
