# MANIFEST — Frontend-feedbackbatch 20-06-2026

Volledige, complete bestanden in moedermap-structuur (geen patches). Plaats elk bestand
op het aangegeven `src/`-pad; `session-log.md` hoort aan de **repo-root**.

## Nieuwe bestanden (2)

| Bestand | Feedbackpunt |
|---|---|
| `src/app/(home)/_components/HomeChannelBar.tsx` | Homepage-1 — nav-variant van de channel-bar (tabs = links naar `/channel/<slug>`) |
| `src/app/api/channels/route.ts` | F4a — publieke proxy voor de volledige channel-catalogus |

## Gewijzigde bestanden (17)

| Bestand | Feedbackpunt(en) |
|---|---|
| `src/app/(home)/page.tsx` | Homepage-1 (HomeChannelBar i.p.v. MaterialCategoryStrip), Homepage-5 (bookmark op tegels) |
| `src/app/(home)/_components/FeaturedChannel.tsx` | Homepage-2 (hele hero klikbaar) |
| `src/components/layout/Footer.tsx` | Footer-3/4 (KvK + VAT onder address, dynamisch © 1999–jaar) |
| `src/components/layout/FollowDigestBlock.tsx` | F2b/F4b (kop + copy), F4a (alle channels + Show all) |
| `src/components/ui/DetailChannelPill.tsx` | F1 (unfollow-confirm + bel-met-streep), F2a (sluitkruis popover) |
| `src/components/ui/FollowToggle.tsx` | F2a (sluitkruis popover) |
| `src/app/material/[slug]/page.tsx` | F3 (follow-blok in sidebar) |
| `src/app/event/[slug]/page.tsx` | F3 (follow-blok in sidebar) |
| `src/app/brand/[slug]/page.tsx` | F3 (follow-blok in sidebar) |
| `src/app/talk/[slug]/page.tsx` | S1 (preferred-source plaatsing), F3 (channels doorgeven) |
| `src/app/talk/[slug]/_components/TalkDetailSidebar.tsx` | F3 (follow-blok + channels-prop) |
| `src/app/event/_components/EventCard.tsx` | E1 (datum-range op de eventtegel) |
| `src/app/book/page.tsx` | Books-2 (Category-filtergroep standaard open) |
| `src/app/book/_components/BookCard.tsx` | Books-3/4 (insider-prijs als teal pill) |
| `src/lib/api/mappers.ts` | E1 (`endDate` toegevoegd aan `mapEventListItem`) |
| `src/types/event.ts` | E1 (`endDate: string \| null` op `EventListItem`) |
| `src/styles/globals.css` | MD-1/2, Homepage-1/2/3, Footer-2, F1, F2a, S3c, E1-hover, Books-3/4/7a, F4a (alles in §FEEDBACK-20-06-appendblokken aan het einde) |

## Aandachtspunten voor merge

- **`mappers.ts`** — de crash-fix-invariant (`wpRenderedHtml`, commit `50b7bfc`) is intact;
  de enige delta is één regel `endDate,` in de return van `mapEventListItem`. Export-niveau
  ongewijzigd.
- **`globals.css`** — append-only: alle nieuwe regels staan in `§FEEDBACK-20-06`-blokken
  aan het einde; geen bestaande blokken aangeraakt. Bouw op de actuele main (er kunnen
  blokken bijgekomen zijn sinds sessiestart).
- **`page.tsx` (home)** — door Homepage-1 is `MaterialCategoryStrip` vervangen door
  `HomeChannelBar`; de oude `materialCategories` + `material_category`-fetch zijn nu dood.
  Niet verwijderd om de diff klein te houden — kan opgeruimd worden.
- **F4a** — footer en detailpagina's zijn **niet** aangepast: ze geven hun relevante set door
  (footer top-6, detail de eigen channels) en `FollowDigestBlock` haalt de rest zelf op via
  `/api/channels`. Geen per-pagina bedrading nodig.

## Bewust niet in deze batch (backend/launch)

- Compare-flow (S3a/S3b — `/compare`-pagina ontbreekt; tray-CTA-styling S3c is wél gedaan)
- `/contact`-pagina (Footer-5)
- Onboarding-stappen (Login-3)
- Boek↔channel-koppeling (waardoor het follow-blok op de boekdetailpagina nog niet staat)
- Saved-search-alert-engine
