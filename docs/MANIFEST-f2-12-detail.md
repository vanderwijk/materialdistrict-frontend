# MANIFEST — §F2.12 · Detailpagina-finetuning ronde 3

**Datum:** 11-06-2026
**Batch:** §F2.12 (detail-only)
**Basis:** live `main` (globals 13780 regels, mappers 1046 regels) — gesynct vóór de build.

> **Naamgeving:** de `§F2.10`/`§F2.11`-namespace is al in gebruik door de
> catalogus-/books-/logo-rondes uit andere sessies (zichtbaar in de live
> globals: §F2.10, §F2.10b, §F2.10c, §BOOKS, §F2.11, §Logo). Deze
> detail-ronde is daarom **§F2.12** gedoopt, additief ná §Logo.

---

## Wat er in zit (8 van 9 punten)

| # | Punt | Type | Bestand(en) |
|---|------|------|-------------|
| 1 | Klikbare pills: pijltje van ↗ (exit-gevoel) naar → ; taxonomie-pills krijgen hetzelfde bij hover | CSS | globals.css (§F2.12) |
| 2 | Article prev/next BOVEN "Related" + thumbnails (zoals material-detail) | TSX | articles/[slug]/page.tsx · ArticlePrevNext.tsx |
| 4 | Body vult de volle kolombreedte — geen `ch`-measure die met de leesgrootte meekrimpt | CSS | globals.css (§F2.12) |
| 5 | Talk-body definitief rechtop (ook authored `<em>` uit de WP-content) | CSS | globals.css (§F2.12) |
| 6 | Body-koppen schalen mee met de leesgrootte (em i.p.v. vaste px) + hiërarchie | CSS | globals.css (§F2.12) |
| 7 | Event register/visit-knop opent in een nieuw tabblad | TSX | events/[slug]/page.tsx |
| 8 | Channel-badge: `&amp;` → `&` (entities decoderen) | TS | lib/api/mappers.ts |
| 9 | Alle detail-wrappers gelijke maatvoering — article was smaller door eigen max-width + dubbele padding op `.pub-layout` | CSS | globals.css (§F2.12) |

**Punt 3** (brand "View all") — zie *Open / besluit* onderaan. Geen code in deze batch.

---

## Detail per wijziging

### globals.css — §F2.12-blok (additief, +73 regels, ná §Logo)
- **P1** — `.detail-sheet a.mat-property-tag.is-clickable::after`, `.mat-keywords-pill::after`,
  `.detail-header-channel::after`: `content` van `\2197` (↗) naar `\2192` (→).
  `a.mat-detail-tag` krijgt dezelfde →-affordance bij hover (hover-reveal, zoals de andere pills).
- **P4** — `.mat-body, .article-detail-lead, .article-detail-body, .event-detail-body { max-width: none }`.
  De article-body gebruikt óók `.mat-body` (ArticleBodyGate → MaterialBody), dus één regel dekt material + article.
- **P5** — `.talk-about .mat-body, .talk-about .mat-body * { font-style: normal !important }`.
  De italic kwam uit authored `<em>` in de content; de eerdere niet-`!important`-regel won daar niet van.
- **P6** — `.mat-body h2 { font-size: 1.25em }`, `.mat-body h3 { font-size: 1.1em }`.
  Stond op vaste tokens (`--text-2xl` 20px / `--text-xl` 17px); h3 was exact body-grootte → bij vergroten
  kleiner dan de body. Em schaalt mee met de (per leesgrootte ingestelde) body-font.
- **P9** — `.pub-layout, .pub-layout-inner { max-width: none; margin: 0; padding: 0;
  grid-template-columns: minmax(0,1fr) 320px; gap: var(--space-10) }`.
  `.pub-layout` had een eigen `max-width` + `margin:auto` + `padding` bóvenop `.pub-wrap`
  (dubbele inset) → article/event/talk smaller dan material. Nu gelijk aan `.mat-detail-wrap`.
  `.pub-layout` wordt uitsluitend door detailpagina's gebruikt (articles/events/talks), dus veilig.
  De bestaande mobiele media-queries (1-koloms) blijven gelden.

### lib/api/mappers.ts — P8
- `mapChannels`: `label: decodeHtmlEntities(t.label)` (helper was al geïmporteerd, wordt o.a. voor titels gebruikt).
- `wpRenderedHtml` + alle §F2.9-/§F2.10c-mappings ongewijzigd aanwezig.

### articles/[slug]/page.tsx — P2
- `getNeighbours`: prev/next krijgen `thumbnailUrl` (`hero.sizes.medium.url ?? hero.sourceUrl ?? null`).
  `listArticles` resolvet de hero default ON (één batched media-fetch), dus geen extra round-trips.
- Volgorde in de grid: `.detail-prevnext-row` staat nu **boven** `.detail-related-row`.

### articles/[slug]/_components/ArticlePrevNext.tsx — P2
- Herschreven naar de gedeelde `.mat-prevnext-*`-structuur (kaart + thumb-tile + eyebrow + titel + arrow),
  identiek aan material-detail. Placeholder-tile als een buur geen hero heeft. Nieuw veld op
  `ArticlePrevNextNeighbour`: `thumbnailUrl: string | null`. Geen nieuwe CSS nodig — classes bestonden al.

### events/[slug]/page.tsx — P7
- Register/visit-`<Button as="link">`: `target="_blank" rel="noopener noreferrer"` toegevoegd
  (Button geeft anchor-attributen door via `...rest`).

---

## Validatie
- `globals.css`: zuiver additief — eerste 13780 regels byte-identiek aan de aangeleverde live-versie; esbuild OK.
- `mappers.ts`: export-niveau identiek aan live + P8-edit; esbuild OK.
- Alle gewijzigde TSX: esbuild (tsx-loader) OK.
- Definitieve type-gate = `next build` op Vercel.

## Additiviteit (globals)
Alleen het `§F2.12`-blok is toegevoegd, ná `§Logo`. Niets uit eerdere `§`-blokken aangeraakt.
Pas additief toe op de huidige `main` (niet de zip-basis overschrijven).

---

## Open / besluit
- **P3 — brand "View all" toont de hele catalogus.** `BrandMaterialsGrid` linkt naar
  `/materials?brand=<slug>`, maar het /materials-overzicht filtert via FacetWP en daar bestaat
  (nog) **geen `brand`-facet** — dus geen filter → hele catalogus. Dit is de in §F2.9 (2×)
  gemelde backend-afhankelijkheid. Twee routes:
  - **(A)** Johan voegt de `brand`-FacetWP-facet toe → de link werkt meteen. *Aanbevolen.*
  - **(B)** Frontend-bypass: /materials herkent `?brand=<slug>` en gebruikt de REST-relatie-query
    (`listMaterialsByBrand`, zoals MoreFromBrand al doet) i.p.v. FacetWP. Werkt zonder Johan,
    maar raakt de overzichtspagina + datalaag (aparte ronde; `src/app/materials/page.tsx` nodig).
  Besluit ligt bij Jeroen; geen code in deze batch.
- Eerder genoteerd, nog open: `renewable=yes` facet-waarde bevestigen; article-comments JWT-POST-test.
