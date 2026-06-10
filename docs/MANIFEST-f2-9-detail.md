# MANIFEST — §F2.9 Detailpagina-finetuning ronde 2 (10-06-2026)

Additief op §F2.8 (commit `f921345`). Negen finetuning-punten over de vijf
detailpagina-types, plus het wireeable maken van brand-channels.

## Gewijzigde bestanden (12)

| Bestand | Wijziging |
|---|---|
| `src/styles/globals.css` | **Additief** §F2.9-blok ná §F2.8 (12651 → 12756, +105 regels). Eerste 12651 regels byte-identiek aan main. |
| `src/components/layout/DetailHeader.tsx` | Leeshulp-mount eruit (P1); nieuwe `leadingTags`-prop → taxonomie-pills vóór de channels met dunne scheiding. |
| `src/components/ui/DetailActions.tsx` | P6: default-volgorde Save · Share · Add-to-board · Compare. Nieuwe `includeBoard`-prop (default true; brand=false). |
| `src/app/brands/[slug]/_components/BrandDetailActions.tsx` | **NIEUW.** Brand-action-wrapper: Save (bookmark `brands`) + Share, `includeBoard={false}`, geen board/compare. |
| `src/types/brand.ts` | `Brand` krijgt `logo: MediaImage \| null` (P7c) + `channels: TaxonomyTerm[]` (P7). |
| `src/lib/api/mappers.ts` | `mapBrand` krijgt `logo`-param + zet `logo` en `channels`. **Johan's gallery-scoping + talk-featured + `wpRenderedHtml` ongewijzigd.** |
| `src/lib/api/content.ts` | `getBrand`: logo (featured_media) uit de gallery gehaald en apart doorgegeven (P7c). |
| `src/app/materials/[slug]/page.tsx` | Taxonomie-pills klikbaar + verhuisd naar header-rij (P1/P2); leeshulp + "About this material"-eyebrow boven de body. |
| `src/app/brands/[slug]/page.tsx` | Channels + Save/Share-actions in de header; leeshulp + "About this brand"-eyebrow; JSON-LD-logo nu uit `brand.logo`. |
| `src/app/events/[slug]/page.tsx` | P8: blauwe Visit-website/Register-knop uit de action-row (blijft in de sidebar-kaart); leeshulp + "About this event"-eyebrow. |
| `src/app/talks/[slug]/page.tsx` | Leeshulp boven de talk-about (italic→normaal via CSS). |
| `src/app/articles/[slug]/page.tsx` | Leeshulp boven de body (article bewust géén eyebrow — long-form). |

## De negen punten

- **P1** — Taxonomie- + channel-pills op één rij met dunne verticale scheiding;
  leeshulp (A−/A+/print) links bóven de body i.p.v. rechtsboven in de header;
  bredere tekstgrootte-stappen (sm 14px / base / lg 19px).
- **P2** — Taxonomie-pills klikbaar wanneer het facet filterbaar is
  (`materialFilterHref`): `material_category` → `/materials?material_category=<slug>`,
  `renewable` → `/materials?renewable=yes`. Niet-filterbare facets blijven
  statische `<span>`.
- **P3** — Property-pills nog maar twee smaken: **wit** (default/unknown/neutraal/
  negatief) of **groen** (positief). Property- én keyword-pills schalen mee met
  de leesgrootte.
- **P4** — Prev/next op contentbreedte (`grid-column: 1`), niet meer over de sidebar.
- **P5 / P7b** — Ruimte (22px) tussen gallery/beeld en de body-tekst.
- **P6** — Action-volgorde: vrije acties (Save · Share) eerst, Insider-acties
  (board · compare) erna.
- **P7** — Brand-channel-pills in de header (uit `meta.channels`).
- **P7a** — Brand krijgt Save (bookmark `brands`) + Share; géén board/compare.
- **P7c** — Brand-logo niet meer als grote gallery-hero: logo apart (`brand.logo`),
  gallery = alleen echte foto's. Logo-only brands → geen grote hero.
- **P8** — Dubbele blauwe event-CTA in de action-row weg (blijft in de
  register-kaart in de sidebar).
- **P9** — Consistente "About this [entiteit]"-eyebrow op material/brand/event/
  talk (article uitgezonderd); talk-body niet meer italic.

## Aannames & open punten (graag bevestigen)

1. **`renewable=yes`** — de klikbare sustainability-pill linkt naar
   `/materials?renewable=yes`. `yes` is de aangenomen facet-waarde voor het
   boolean `renewable`-facet. Klopt die waarde in FacetWP? Zo niet, geef de juiste
   door, dan pas ik de pill aan (of laat 'm statisch).
2. **Brand-channels via cast** — de brand-raw-meta in `wordpress.ts` typeert
   `channels` nog niet (article/event/talk wél). `mapBrand` leest het via een
   lokale cast op `meta.channels`, zodat `wordpress.ts` ongemoeid blijft. Optioneel
   later netjes maken: `channels?: WPMetaTermRaw[]` toevoegen aan de brand-meta.
3. **Talk-italic** — geforceerd normaal via CSS (`.talk-about .mat-body`). Blijft
   het italic, dan zit het in de WP-content zelf (authored `<em>`) → content-fix.
4. **(7d, nog open, niet in deze batch)** — de brand "View all"-knop richting
   `/materials?brand=<slug>` vereist een FacetWP **`brand`-facet** (los van channels).
   Dat staat los van §F2.9 en blijft openstaan voor jou.

## Validatie

- **esbuild** (extensie-afgeleide loader) groen op alle 12 bestanden (syntax/JSX).
- Gerichte type-inspectie; de enige echte type-risico (`m.channels`) is met een
  cast afgedekt. Een volledige geïsoleerde `tsc --strict` was hier niet schoon te
  draaien (geen `node_modules`/`next`); de **Vercel `next build`** is de finale
  tsc-gate.
- globals.css-additiviteit geverifieerd: `head -12651` byte-identiek aan main.
