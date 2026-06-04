# MANIFEST — Featured slots (frontend batch 2) — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.

## Gewijzigd
- `src/types/dashboard.ts` — toegevoegd: `FeaturedSlot`, `FeaturedSlotsData`,
  `FeaturedSlotState`. De oude `FeaturedPlacement`/`FeaturedSlotStatus` blijven
  staan (nog gebruikt door `mock.ts`/`mappers.ts`); niets breekt.
- `src/lib/dashboard/data.ts` — `getFeaturedPlacements` vervangen door
  `getFeaturedSlots` (weekly model) met een lokale raw→domein-mapper. Ongebruikte
  imports (`mapFeaturedPlacements`, `FeaturedPlacement`) opgeruimd.
- `src/components/dashboard/panels/FeaturedPanel.tsx` — omgebouwd van read-only
  lijst naar interactief boek/annuleer-paneel (Partner): materiaal + week kiezen,
  x/4-teller, reset-datum, annuleren van `scheduled` slots. Hergebruikt bestaande
  klassen (geen `globals.css`-wijziging).
- `src/app/dashboard/brands/[brandSlug]/featured/page.tsx` — haalt nu
  `getFeaturedSlots` + `getBrandMaterials` (online materialen als boekbare opties)
  en geeft `brandId` door aan de panel.

## Nieuw
- `src/app/api/dashboard/brands/[brandId]/featured-slots/route.ts` — `POST`
  (boeken). Valideert brandId, proxy't naar WP met `{ material_id, week_start }`.
- `src/app/api/dashboard/brands/[brandId]/featured-slots/[slotId]/route.ts` —
  `DELETE` (annuleren).

Beide routes volgen het bestaande proxy-patroon (`getTokenOr401` +
`wpDashboardFetch` + `dashboardError`). WordPress bewaakt alle regels en levert
duidelijke foutmeldingen; de frontend toont die.

## Niet aangeraakt
`globals.css`, `src/lib/dashboard/mappers.ts`, `src/lib/dashboard/mock.ts`.

## Validatie
- esbuild syntax-check geslaagd op alle zes bestanden.
- Type-niveau wordt in de projectbuild gecheckt (geen lokale repo beschikbaar hier).
- **Nog samen met Johan te doen:** live sanity-check van de authenticated
  `GET/POST/DELETE /featured-slots` en `/auth/me` met de featured-velden (token nodig).

## Volgende batches (nog te doen)
- Homepage featured: slider via `meta.is_featured_now`, story-hero via
  `article.featured`, featured event.
- Channelpicker (WF-8): max-3 + Partner-gate, bron → `/material-channels`.
- Catalog-migraties: `/story-types`, `/event-types`, `/countries`, `/material-facets`.
