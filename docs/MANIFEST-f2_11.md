# MANIFEST — §F2.11 (catalogus-finetuning ronde 2, overzichtspagina's)

Datum: 11-06-2026
Additief op §F2.10 / §F2.10b / §F2.10c. Raakt niet aan de detail-rondes.

## Geleverde punten

| # | Punt | Aard | Bestand(en) |
|---|------|------|-------------|
| P1 | Kleurbolletjes vóór de story-types weg in het TYPE-filter | CSS | globals.css (`.articles-type-dot{display:none}`) |
| P2 | Facet-tellingen overal als wit pill (i.p.v. kale grijze cijfers) | CSS | globals.css (`.uf-option-count` → pill, zoals `.filter-count`) |
| P4 | Brand-tile montagebanner naar 4:1 (vierkante thumbnails) | CSS | globals.css (`.brand-tile-banner` → `aspect-ratio:4/1`) |
| P5 | Brand-tile in recently-viewed image-free (initialen-blok) | TSX + CSS | RecentlyViewedRail.tsx + globals.css (`.recently-viewed-thumb-initials`) |
| P7 | Talks-filter van bovenbalk naar LINKER sidebar (consistent met materials/brands) | TSX | talks/page.tsx + talks/_components/TalksBrowser.tsx |
| P8 (talks) | "Insider only"-optie in de talks-filtersidebar | TSX | TalksBrowser.tsx (sectie "Access", client-side) |

## Bestanden in deze zip
- `src/styles/globals.css` — additief §F2.11-blok onderaan. **Head 1–12756 byte-identiek aan de gedeployde main** (geverifieerd met diff). Niets boven §F2.11 gewijzigd.
- `src/components/ui/RecentlyViewedRail.tsx` — P5. Brands renderen een initialen-blok i.p.v. thumbnail (image-free); overige entities ongewijzigd.
- `src/app/talks/page.tsx` — P7. Body van single-column (`.ov-wrap-single`) naar twee-koloms `.ov-wrap` bij resultaten; 0-resultaten (channel/zoek) blijft single-column EmptyState.
- `src/app/talks/_components/TalksBrowser.tsx` — P7 + P8-talks. Herbouwd op de generieke `<FilterSidebar>` (secties Year / Speaker / Access→"Insider only", met counts). Jaar/spreker/insider blijven client-side filters op de in één keer geladen set.

## Technische noten
- P2 dekt materials/brands/events/talks in één keer: zowel de generieke `FilterSidebar` als `MaterialsFilterSidebar` renderen `<span class="uf-option-count">`.
- P7: `<FilterSidebar>` levert grid-kolom 1 (de fragment-children flatten in het `.ov-wrap`-grid; de mobile-trigger is `display:none` op desktop, de sidebar wordt een drawer op mobiel). De main-content is kolom 2 (plain `<div>`), gelijk aan brands/page.
- P8-talks: sectie "Access" verschijnt alleen als er insider-talks in de set zitten.
- Esbuild (transform, `--jsx=automatic --format=esm`) schoon op alle drie de TSX-bestanden.

## P3 — pagination "regressie": GEEN frontend-fix
Volledige keten getraceerd én geverifieerd:
- De gedeployde `Pagination.tsx` en `ChannelBarNav.tsx` (uit de §F2.10-TOTAAL-zip) zijn **byte-identiek** aan de geanalyseerde versies (diff: identiek).
- `materials/page.tsx` leest `?page=` en geeft `result.pager.page` / `result.pager.totalPages` correct door aan `MaterialsPagination`; de wrapper doet `router.push(?page=N)`; de component roept `onPageChange(N)` aan — de klik-/prev-/next-logica is **identiek aan de vorige werkende versie** (alleen first/last + "Go to" zijn nieuw).
- Empirisch bevestigd: pagina 3 zit in het venster én is bereikbaar (`onPageChange(3)` vuurt) zowel via klik als via "Go to".
- ChannelBarNav verwijdert `page` alléén bij zoeken/channel-wissel (gewenst), niet bij paginanavigatie.

Conclusie: geen codefout in het pagination-pad. Meest waarschijnlijk:
1. de testserver draait een stale/partiële build (de §F2.10-deploy was "git push only" — een schone rebuild is de eerste, goedkope check), of
2. de pager-waarden uit de backend (FacetWP / WP REST) kloppen niet voor page > 1 in de gedeployde omgeving.

Actie: schone rebuild op de testserver; als 't dan nog hapert, pager-waarden voor page > 1 verifiëren (backend) — één observatie volstaat: verschijnt `?page=3` in de adresbalk bij klik?

## Backend-pending (aparte mail al klaargezet)
- P6 — brands filteren op applicatie/sector (FacetWP-facet of query-param op de brand-endpoint?).
- P8 (stories) — `listArticles` / stories-endpoint filteren op `insider_only`?

Zodra Johan dit bevestigt, volgt de voorkant (BrandsFilterSidebar-applicatiefilter + stories-insiderfilter) in een vervolg-zip.
