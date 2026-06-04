# Session-log patch — Sessie 12 (Channels) — 04-06-2026

> Append-only. Build-order **Stap 12** — channel-hubs (`/channels` +
> `/channels/[slug]`). Volgt op de ChannelBar-rollout en de channels-hub-
> beslissing van 04-06.

## Gebouwd

**Datalaag (batch 1)**
- `theme`-filter doorgetrokken naar `listArticles` + `listEvents`
  (`wordpress.ts`: `theme?: number` → `?theme=<id>`; wrappers in `content.ts`
  forwarden via de bestaande spread). Materials/brands/talks hadden het al.
- `getChannelHub(slug, perStrip=8)` (`content.ts`) — resolved slug→term-id via
  de catalogus (onbekend = `null`), haalt parallel hero-term + 5 strips op
  (Materials via FacetWP `theme`-facet/slug, rest via `?theme=<id>`), met per
  strip de eerste 8 items + totaal, en een `isEmpty`-vlag.
- `getChannelsIndex()` (`channels.ts`) — joint `/md/v2/material-channels`
  (canonieke set + materials-telling) met `/wp/v2/theme` (description +
  `theme_thumbnail` + featured-vlag). Sortering: featured → telling → label.
- `getChannelTerm(idOrSlug)` (`channels.ts`) — hero-data (naam + description +
  thumbnail) voor de hub.
- `buildCollectionPage()` + `CollectionPageSchema` (`seo/`).
- Barrel (`api/index.ts`) doorgezet.

**`/channels`-index (batch 2)**
- `channels/page.tsx` (server) + `ChannelIndexCard` (op `Card`-primitives) +
  `loading.tsx` + `channels/layout.tsx` (`CompareProvider`, voor de
  materials-strip met compare in de hub).
- SEO: BreadcrumbList + CollectionPage (ItemList van de hubs). Canonical
  `/channels`.

**`/channels/[slug]`-hub (batch 3)**
- `[slug]/page.tsx` (server) — hero (`ChannelHero`, thumbnail-achtergrond via
  `--channel-hero-img`) + volledige description als prose + strips per type in
  topmenu-volgorde, elk via `ChannelStrip` met een "View all … in {channel}"-
  deeplink (`/materials?channel=…` enz.). Lege types vallen weg.
  `generateStaticParams` (alle 20) + `generateMetadata` (unieke titel +
  description + canonical per channel). `notFound()` bij onbekend/leeg channel.
- Kaarten: `ContentCard` voor materials/stories/events/talks, `BrandTile` voor
  brands — beide hergebruikt, geen nieuwe kaarttypes.
- `[slug]/loading.tsx`.
- SEO: BreadcrumbList (Home → Channels → channel) + CollectionPage met een
  gecombineerde ItemList van de getoonde items.

**CSS** — alleen toevoegingen in `globals.css` (compleet meegeleverd):
`.channel-card-desc`, `.channel-hero*`, `.channel-intro`, `.channel-strip*`.
Verder hergebruik van `ov-*` / `content-card-*`. Brace-balans 1889/1889.

## Beslissingen (met Jeroen, deze sessie)
1. 8 items per strip. 2. Hero = thumbnail-achtergrond + naam + 2-regel-teaser,
volledige description eronder. 3. Geen bar→hub-bruggetje in v1. 4. Index-telling
= materials (één betrouwbare bron). 5. Featured-first bouwen; terugval op
telling-sortering tot de WF-6-vlag in REST staat. 6. Leeg/onbekend channel → 404.

## Stylingkeuzes (autonoom)
- Channel = hub, geen content-item → eigen `ChannelIndexCard` i.p.v. ContentCard.
- Materials in de strip via `ContentCard` (niet `MaterialCard`) — vermijdt de
  client-callback-machinerie (compare/sample-gate); compare-state blijft wel
  beschikbaar via de layout-`CompareProvider` mocht dat later nodig zijn.
- "Featured" als eyebrow, geen aparte sectie (voorkomt lege sectie pre-exposure).

## Open / vervolg
Zie open-issues-patch (C-CH.1 featured-vlag-exposure, C-CH.2 books-strip,
C-CH.3 events-strip-ordering). Mail aan Johan: `email-johan-channels-featured-flag.txt`.
