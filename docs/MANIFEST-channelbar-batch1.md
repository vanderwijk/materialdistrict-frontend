# MANIFEST — Unified ChannelBar (batch 1: fundament + talks) — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.

Dit is increment 1 van de uitrol "overal exact dezelfde channel bar". Het levert
het **herbruikbare fundament** + **talks** als bewezen sjabloon. Brands, events en
materials zijn daarna identieke kopieën die hetzelfde fundament gebruiken.

## Nieuw (het gedeelde fundament — één keer, voor alle overzichten)
- `src/lib/api/channels.ts` — `getChannelCatalog()` haalt `/md/v2/material-channels`
  op → `{id, slug, label, count}[]`. Dit is in één call zowel de bar-optielijst
  (label + volgorde) als de slug→id-map. Plus `resolveChannelId()`. Faalt zacht
  naar een lege lijst.
- `src/components/ui/ChannelBarNav.tsx` — URL-gestuurde wrapper rond de bestaande
  `ChannelBar`. Tab-click → `?channel=<slug>`, zoekterm → `?q=` (debounced),
  reset `?page=`, behoudt overige params. **Dit is dé component die op elke
  overzichtspagina identiek wordt gebruikt** — zo is de bar overal pixel- en
  gedrag-gelijk; alleen de fetch erachter verschilt per pagina.

## Gewijzigd (chirurgisch)
- `src/lib/api/wordpress.ts` — `theme?: number` toegevoegd aan `ListTalksParams`
  en doorgegeven in `listTalks` → `?theme=<id>` op de WP-collectie. (`content.ts`
  spreidt params al door; geen wijziging nodig daar.)
- `src/lib/api/index.ts` — `getChannelCatalog`, `resolveChannelId`, type `Channel`
  geëxporteerd.
- `src/components/ui/index.ts` — `ChannelBarNav` geëxporteerd.
- `src/app/talks/page.tsx` — leest `?channel=`, resolvet slug→id, geeft `theme`
  mee aan `listTalks`, en rendert `ChannelBarNav` onder de page-header. De losse
  `TalksSearchInput` is uit de header gehaald; de search zit nu ín de bar.

## Niet aangeraakt
`globals.css`, `content.ts`, de gedeelde `mappers.ts`. `TalksSearchInput.tsx`
blijft staan (ongebruikt op talks; geen kwaad).

## Validatie
- esbuild syntax-check geslaagd op alle zes bestanden.
- Type-niveau in de projectbuild. `/md/v2/material-channels` wordt server-side
  via `wpFetch` (publiek, `WP_API_URL`) opgehaald — zelfde pad als de andere
  catalog-endpoints.

## Volgende increments (zelfde fundament, identieke bar)
- **Brands**: `theme?` op `listBrands` (lijkt al aanwezig) + `ChannelBarNav` op
  het brands-overzicht.
- **Events**: `ChannelBarNav` met volledige catalogus (vervangt de huidige
  "alleen aanwezige channels"-afwijking); filter mag client-side blijven of via
  `?theme=`.
- **Materials**: `ChannelBarNav` terug op /materials, gekoppeld aan het thema-
  filter (FacetWP).
- **Books**: zodra de Books-laag er is.
- **Channel-landingspagina's** (`/channels/[slug]`): kop uit `/wp/v2/theme/{id}`
  (name + description); thumbnail zodra Johan `theme_thumbnail` op `/wp/v2/theme`
  exposet.
