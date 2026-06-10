# MANIFEST — §F2.8 Detailpagina-finetuning (10-06-2026)

Eén deploy, complete bestanden, één zip. `globals.css` puur additief
(`§F2.8`-blok achteraan; eerste 12093 regels byte-identiek aan main, +224
regels). Alle TSX/TS parse-schoon (esbuild), CSS valideert.

## Gewijzigde bestanden

| Bestand | Punt(en) | Wat |
|---|---|---|
| `src/styles/globals.css` | 1,4,6,7,8,9,10 | Additief `§F2.8`-blok: kop één kolom, prev/next-paper-rij, property-pills wit+klikbaar, keyword-pills, channel-pill, event-videos, leeshulp + print. |
| `src/components/layout/DetailHeader.tsx` | 1,8,10 | Additieve `channels`-prop + hub-pill-render (link `/channels/<slug>`); mount van `DetailReadingTools`. Bestaand gedrag ongewijzigd (alleen optioneel). |
| `src/components/ui/DetailReadingTools.tsx` | 10 | **NIEUW.** Tekstgrootte A−/A+ (localStorage → `html[data-reading-size]`), printknop (`window.print()`), back-to-top (fixed, na ~600px). |
| `src/app/materials/[slug]/page.tsx` | 1,6,8,9 | Badge-tag weg; property-pills filteren/klikbaar (`materialFilterHref`) + lege sectie weg; `theme`→channel-resolve (`getChannelCatalog`); prev/next naar paper-rij. |
| `src/app/articles/[slug]/page.tsx` | 1,4,8,9 | Badge weg (insider blijft); gallery render (`MaterialGallery`); channel-pills via `.channels`; prev/next naar paper. |
| `src/app/articles/[slug]/_components/ArticleDetailSidebar.tsx` | 2,3 | Reading-progress weg (+ prop-cleanup); newsletter-copy "Twice-weekly … twice a week". |
| `src/app/talks/[slug]/page.tsx` | 1,8,9 | Badge weg (insider blijft); channel-pills; prev/next naar paper. |
| `src/app/events/[slug]/page.tsx` | 1,4,8,9 | Badge weg; `EventMediaViewer` → `MaterialGallery` + losse `VideoEmbed`-blokken; channel-pills; prev/next naar paper. |
| `src/app/brands/[slug]/page.tsx` | 1,9 | Badge weg; prev/next naar paper. (Channel-pill bewust nog niet — WF-3.) |
| `src/types/article.ts` | 4 | `Article.gallery: Gallery` toegevoegd (+ `Gallery`-import). |
| `src/lib/api/mappers.ts` | 4 | `mapArticle` krijgt optionele `gallery`-param + zet `gallery`. `wpRenderedHtml`-fix ONGEWIJZIGD aanwezig in alle mappers. |
| `src/lib/api/content.ts` | 4 | `getArticle` resolve't gallery uit aan-de-post-gehangen media (zelfde patroon als material/brand). |
| `src/lib/api/facetwp.ts` | 6 | `materialFilterHref(facet,value)` toegevoegd — returnt `null` als de facet niet in de URL-parser-allowlist zit (geen dode filterlinks). |

## Technische noten

- **DetailHeader additief**: `tags`-gedrag ongewijzigd; `channels` is optioneel
  en wordt alleen gerenderd indien meegegeven. De content-type-badge verdween
  doordat de pagina's de content-tag niet meer meegeven (niet door de component
  te slopen).
- **`globals.css` additief**: alleen `§F2.8` toegevoegd, niets gewijzigd/verwijderd.
  Geen `*/` in nieuwe comments.
- **`mappers.ts`**: `wpRenderedHtml` op alle excerpt/content blijft staan
  (crash-fix `/articles`,`/brands`).
- **Gallery (article)**: geen Johan nodig — article plakt nooit foto's in de
  tekst, dus de aan-de-post-gehangen media ís de schone foto-set.

## Bewust NIET in deze zip (eigen items)

- **Punt 5 — comments (article)**: eigen feature-build, wacht op Johan-REST-verify
  (zie Johan-mail).
- **Brand channel-pill**: wacht op WF-3 (themes in brand-REST). Frontend schakelt
  vanzelf aan zodra de data er is.
