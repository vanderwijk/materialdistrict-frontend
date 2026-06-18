# MANIFEST — Homepage S10.2 ronde-3 (gemerged op actuele main)

Gewijzigde/nieuwe bestanden in deze levering (ALLEEN de ronde-3-delta):

- `src/app/(home)/page.tsx` — featured-materials zonder terugval + verborgen indien leeg; Events/Books-split (twee gelabelde helften, BookCard `variant="home"`); featured brands aangevuld tot zes; `listBooks`-fetch + `SidebarBooks` in de rechterkolom.
- `src/app/(home)/_components/FeaturedChannel.tsx` — "In the spotlight" → "Featured channel"; thumbnails ín de hero-foto (klein, wit kadertje, hover-tooltip); hero geen Link-wrapper meer (geneste anchors).
- `src/app/(home)/_components/SidebarBooks.tsx` — NIEUW; compact nieuwste-boeken-blok (rechterkolom), `listBooks` uit de canonieke books-module.
- `src/styles/globals.css` — categorie-strip winnende regel gefixt (één rij, lijn weg, minder inspring); featured-channel hero als kolom + thumbnail-strip + titel-link; nieuw §-blok Events/Books-split + sidebar-boeken. **Additief gemerged op de actuele main (16503 → 16617 regels); niets van ander werk verwijderd.**

NIET meegeleverd (bewust): round-2-bestanden (al gemerged: ContentCard, MaterialCard, FeaturedTalkBand, FeaturedPartners, MaterialCategoryStrip, FeaturedArticleHero, Header, HeaderShell, channel-hub) en Johan's `books.ts`/`book.ts` (door hem uitgebreid).

## Johan-acties
1. Materialen in WP als `featured` aanvinken → vult het Featured-materials-blok (nu verborgen).
2. `meta.publication.isOnline` blootleggen in de material-respons → offline materiaal verdwijnt.

## Deploy-checks
- Krappe plekken door de eerdere lettervergroting.
- Prijsafronding op .95/.99.
