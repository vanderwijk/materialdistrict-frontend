# MANIFEST — Sessie 12 (Channels) — definitieve levering (batch 1 + 2 + 3)

Datum: 2026-06-04
Cumulatief: datalaag + `/channels`-index + `/channels/[slug]`-hub + eindlevering.
Overlay-veilig: alle wijzigingen zijn additief; bestaand gedrag verandert niet.

---

## BATCH 1 — datalaag

## Gewijzigde bestanden (shared — gediff't tegen current main)

### `src/lib/api/wordpress.ts`
- `ListArticlesParams` + `ListEventsParams`: nieuw veld `theme?: number`
  (WP `theme` term-id). Doorgegeven als `?theme=<id>` aan de collectie — WP-zijde
  bevestigd (channel-contract 04-06). Geen nieuwe exports; geen gedragsverandering
  zonder de param.

### `src/lib/api/content.ts`
- Nieuw: `getChannelHub(slug, perStrip = 8)` → `ChannelHub | null`.
  Resolved slug → term-id via de catalogus (onbekende slug = `null` → 404).
  Haalt parallel op: hero-term + 5 strips in topmenu-volgorde
  (Materials → Stories → Brands → Events → Talks). Per strip de eerste 8 items
  (keuze 1) + het totaal voor de "bekijk alle …"-deeplink. `isEmpty` voor de
  404-bij-lege-hub (keuze 6).
  - Materials via `listMaterialsWithFacets({ selection: { theme: [slug] } })`
    (FacetWP `theme`-facet, slug — zelfde bevestigde pad als de bar).
  - Stories/Brands/Events/Talks via `?theme=<id>` op hun collectie.
- Nieuwe types: `ChannelHub`, `ChannelHubStrip<T>`.
- Wrappers `listArticles`/`listEvents` ongewijzigd: `theme` flowt automatisch mee
  via de bestaande `...rawParams`-spread.

### `src/lib/api/channels.ts`
- Nieuw: `getChannelsIndex()` → `ChannelIndexItem[]` voor de `/channels`-index.
  Joint `/md/v2/material-channels` (canonieke set + **materials**-telling, keuze 4)
  met `/wp/v2/theme` (description + `theme_thumbnail` + featured-vlag).
  Sortering: featured eerst, dan telling aflopend, dan label (keuze 5; zolang de
  featured-vlag niet in REST staat = effectief telling-aflopend). Faalt `/wp/v2/theme`,
  dan kale kaarten i.p.v. lege index.
- Nieuw: `getChannelTerm(idOrSlug)` → `ChannelTerm | null` (hero-data: naam +
  description + thumbnail) voor `/channels/[slug]`.
- Nieuwe types: `ChannelIndexItem`, `ChannelTerm`.
- Bestaande `Channel` / `getChannelCatalog` / `resolveChannelId` ongewijzigd.

### `src/lib/seo/{types,structured-data,index}.ts`
- Nieuw type `CollectionPageSchema` (+ opgenomen in de `StructuredData`-union).
- Nieuwe builder `buildCollectionPage({ name, description?, url, image?, items? })`
  → `CollectionPageSchema`, met optionele `ItemList`. Voor de hub- en index-SEO.
- Barrel re-export bijgewerkt.

## Verificatie
- Export-diff tegen current main: géén verwijderde exports; alleen de hierboven
  genoemde toevoegingen.
- Geïsoleerde TS-syntaxcheck (tsc 5.9): geen parse-/typefouten in de eigen code.

## Afhankelijkheden / heads-up
- **WF-6 featured-vlag in REST** nog niet bevestigd. `getChannelsIndex` parseert
  defensief op kandidaat-meta-keys (`theme_featured` / `featured` / `is_featured`)
  en valt terug op `false`. Vraag aan Johan volgt in de eindlevering.
- `theme_thumbnail`: code accepteert zowel een directe URL als een attachment-id
  (batch-resolved). Eerste echte respons bepaalt welke vorm het is — geen actie nodig.
- Materials-strip gebruikt bewust `listMaterialsWithFacets` (haalt ook de
  facet-baseline op, gecachet). Correctheid > de marginale extra call.

---

## BATCH 2 — /channels-indexpagina

### Nieuwe bestanden
- `src/app/channels/layout.tsx` — `CompareProvider`-wrapper (mirror van
  brands/articles); nodig voor de materials-strip met compare in batch 3.
- `src/app/channels/page.tsx` — server component. `getChannelsIndex()` →
  `ov-page-header` + `ov-wrap-single` + `ov-grid-3` met channel-kaarten.
  SEO: BreadcrumbList + CollectionPage (ItemList van de channel-hubs als interne
  cluster-links). Canonical `/channels`. `EmptyState` als er (nog) geen channels zijn.
- `src/app/channels/_components/ChannelIndexCard.tsx` — dedicated kaart op de
  `Card`-primitives (geen ContentCard: channel = hub, geen content-item). Thumb +
  naam + 2-regel-description (HTML→platte tekst) + "X materials" (keuze 4) +
  "Featured"-eyebrow bij `featured`.
- `src/app/channels/loading.tsx` — skeleton dat de grid-layout matcht (geen
  layout-shift).

### Gewijzigde bestanden (shared)
- `src/lib/api/index.ts` (barrel) — re-export van `getChannelHub`,
  `getChannelsIndex`, `getChannelTerm` + types `ChannelHub`, `ChannelHubStrip`,
  `ChannelIndexItem`, `ChannelTerm`. Géén bestaande exports verwijderd.
- `src/styles/globals.css` (compleet bestand) — één nieuwe regel
  `.channel-card-desc` (2-regel-clamp), ingevoegd na `.content-card-meta-dot`.
  Verder volledig hergebruik van bestaande `ov-*`/`content-card-*` klassen.
  Brace-balans geverifieerd (1872/1872).

### Verificatie
- Barrel-export-diff: geen verwijderde exports.
- Geïsoleerde TS/JSX-check: geen parse-/typefouten (resterende meldingen zijn
  ontbrekende `react/jsx-runtime` + `any`-callbacks door onopgeloste imports —
  artefacten van de geïsoleerde check, niet van de code).

### Stylingkeuzes (autonoom, binnen design-system)
- Grid: `ov-grid-3` (3→2→1 responsive, zelfde als de overige overzichten).
- Kaart op `Card`-primitives i.p.v. ContentCard — semantisch juist + DRY.
- Thumbnail-loze channels tonen de bestaande neutrale `.card-thumb`-placeholder.
- "Featured" als eyebrow (geen aparte sectie — voorkomt een lege sectie zolang
  de WF-6-vlag niet in REST staat; keuze 5).

---

---

## BATCH 3 — /channels/[slug]-hub

### Nieuwe bestanden
- `src/app/channels/[slug]/page.tsx` — server component. `getChannelHub(slug, 8)`
  → hero + volledige description (prose) + strips per type in topmenu-volgorde
  (Materials → Stories → Brands → Events → Talks), elk met een
  "View all … in {channel}"-deeplink naar het gefilterde overzicht. Lege types
  vallen weg. `generateStaticParams` (alle 20 channels) + `generateMetadata`
  (unieke titel/description + canonical per channel). `notFound()` bij
  onbekend/leeg channel (keuze 6).
- `src/app/channels/[slug]/_components/ChannelHero.tsx` — hero met
  thumbnail-achtergrond via `--channel-hero-img` (toegestaan custom-property-
  patroon, geen inline background) + `is-plain`-fallback; naam + 2-regel-teaser.
- `src/app/channels/[slug]/_components/ChannelStrip.tsx` — generieke strip
  (sectiekop + view-all-link + grid).
- `src/app/channels/[slug]/loading.tsx` — hero- + strip-skeleton.

### Gewijzigd
- `src/styles/globals.css` (compleet) — `.channel-hero*`, `.channel-intro`,
  `.channel-strip*` toegevoegd na `.channel-card-desc`. Brace-balans 1889/1889.

### Kaarten (hergebruik, geen nieuwe types)
- Materials/stories/events/talks → `ContentCard` (universeel; materials via
  ContentCard i.p.v. MaterialCard om de client-callback-machinerie te vermijden).
- Brands → `BrandTile` (visueel distincte logo-tegel).

### Verificatie
- Geïsoleerde TS/JSX-check: enkel ontbrekende-React-types-artefacten, geen
  echte fouten. BrandListItem gebruikt `name` (niet `title`) — gecorrigeerd.
- CSS-tokens bestaan; brace-balans gelijk; comments vrij van `*/`.

---

## EINDLEVERING (in deze zip, `docs/`)
- `session-log-patch-sessie12-channels.md`
- `open-issues-patch-sessie12-channels.md`
- `email-johan-channels-featured-flag.txt` (WF-6-vlag-exposure + 2 checks)

## Overlay
Deze zip is de definitieve, cumulatieve levering (batch 1 + 2 + 3). Zet `src/`
in één keer over de moedermap; de `docs/`-patches voeg je toe aan de
projectkennis. Niets verandert aan bestaand gedrag buiten de nieuwe
`/channels`-routes.
