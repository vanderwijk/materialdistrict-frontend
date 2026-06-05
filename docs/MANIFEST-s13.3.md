# MANIFEST — S13.3 Dashboard: Brand- en materiaalformulieren (05-06-2026)

Overlay deze bestanden op de moedermap (volledige bestanden, geen patches).
Type-check: `tsc --noEmit` groen over de hele boom.

## Nieuw

- `src/lib/config/material-applications.ts`
  Gedeelde applicatie-cascade (6 hoofd → 26 sub → 189 types) + lookup-helpers.
  Enige optiebron voor de ApplicationPicker in beide formulieren.
- `src/lib/dashboard/material-property-options.ts`
  `buildMaterialPropertyOptions()` — merget FacetWP-baseline (filterbaar) over
  statische defaults (niet-filterbaar).
- `src/components/dashboard/CurrentPlanBanner.tsx`
  Tier-specifieke "Current plan"-banner (prijs + pills uit membership-config).
- `src/components/dashboard/fields/ApplicationPicker.tsx`
- `src/components/dashboard/fields/DownloadsField.tsx`
- `src/components/dashboard/fields/VideoLinksField.tsx`
- `src/components/dashboard/fields/GalleryField.tsx`
- `src/components/dashboard/fields/index.ts`

## Gewijzigd

- `src/types/dashboard.ts`
  `MaterialAsset.title?`; `BrandProfile` (address→line1/line2 + applications/
  videos/gallery/downloads); `MaterialFormData` (categories→applications +
  indoorOutdoor + properties).
- `src/lib/dashboard/mappers.ts`
  Brand- en material-mappers (lezen + WP-write) op het nieuwe contract; gedeelde
  serializers voor gallery/downloads/applications; downloads dragen `title`;
  `app:`-paden zonder echte term-id worden bij wegschrijven overgeslagen.
- `src/lib/dashboard/mock.ts`
  Beide brand-profielen + material-form demo-getrouw op het nieuwe contract.
- `src/lib/dashboard/data.ts`
  `getMaterialPropertyOptions()` toegevoegd; create-form-blank op nieuw contract.
- `src/lib/utils/material-properties.ts`
  Additief: `EMPTY_MATERIAL_PROPERTIES`, `PROPERTY_VALUE_OPTIONS`.
- `src/components/dashboard/panels/BrandProfileForm.tsx`
  Volledig gelijkgetrokken aan de demo (zie session-log S13.3).
- `src/components/dashboard/panels/MaterialForm.tsx`
  Volledig gelijkgetrokken aan de demo; Categories-Selects vervangen door de
  gedeelde ApplicationPicker; propertyblok 24/4.
- `src/styles/globals.css`
  Nieuwe sectie "S13.3 — Brand & material form fields" (append-only).
- `src/app/dashboard/brands/[brandSlug]/materials/[materialId]/edit/page.tsx`
- `src/app/dashboard/brands/[brandSlug]/materials/new/page.tsx`
  Fetchen `getMaterialPropertyOptions()` i.p.v. `getMaterialCategories()`;
  geven `propertyOptions` door aan MaterialForm.

## Root

- `session-log.md` — volledige bijgewerkte versie (S13.3-sectie toegevoegd).

## Wacht op Johan
Zie `docs/email-johan-s13.3.txt` en de "Open (S13.3 — Johan)" in de session-log:
WP moet de nieuwe velden lezen/persisteren. Frontend degradeert netjes zonder.
