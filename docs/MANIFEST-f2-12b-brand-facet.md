# MANIFEST — §F2.12b · Brand-facet frontend-wiring (afronding punt 3)

**Datum:** 11-06-2026
**Batch:** §F2.12b (TS-only; geen globals)
**Basis:** live `main` — `lib/api/facetwp.ts` + `types/facetwp.ts` opgevraagd en
byte-identiek aan de werktree bevonden (catalogus-rondes raakten deze core-files niet).

Sluit **punt 3** van §F2.12 af. Johan heeft de `brand`-FacetWP-facet live gezet
(plugin `facetwp-brand-facet.php`); dit is de bijbehorende frontend-aansluiting.

## Contract (Johan, 11-06-2026)
- Facet-key: `brand` (FacetWP facet name)
- Waarden: brand **post-slug** (`post_name`); indexer mapt `_material_brand` (brand-ID) → slug
- URL: `/materials?brand=<slug>` → FacetWP-payload `brand: ["<slug>"]`
- Deep-link-facet: staat bewust níét in de FilterSidebar

## Wijzigingen

### src/types/facetwp.ts (additief)
- Nieuw type `MaterialBrandFacetName = 'brand'`.
- `brand` toegevoegd aan `AnyMaterialFacetName`.
- `'brand'` toegevoegd aan `ALL_MATERIAL_FACET_KEYS` (ná `'theme'`) → gaat automatisch
  mee in elke FacetWP-fetch via `buildFacetsPayload` (lege array indien ongeselecteerd).
- `FacetSelection` uitgebreid met `brand?: string[]`.
- `MaterialFacetName`, `MATERIAL_FILTER_FACETS` en `MATERIAL_FACET_GROUPS` ongewijzigd
  → brand verschijnt niet in de sidebar (correct: deep-link-facet).

### src/lib/api/facetwp.ts (additief)
- `BRAND_PARAM_KEY = 'brand'`.
- `parseFacetSelectionFromSearchParams`: `?brand=<slug>` → `selection.brand = [slug]`
  (gespiegeld op de bestaande `channel`→`theme`-branch).
- `facetSelectionToSearchParams`: inverse `selection.brand` → `?brand=<slug>` (deep-links/clear).

Geen wijziging aan `materialFilterHref` (brand is geen sidebar-filter-facet) of aan andere files;
list-light, content.ts en de materials-page erven `brand` via `ALL_MATERIAL_FACET_KEYS` / de parser.

## Resultaat
`BrandMaterialsGrid` linkt al naar `/materials?brand=<slug>`. Met deze wiring + de live facet
filtert dat overzicht nu op het merk i.p.v. de hele catalogus → punt 3 rond.

## Validatie
- export-niveau: alleen additie (`MaterialBrandFacetName`); niets verwijderd/hernoemd.
- diff `types/facetwp.ts` vs live: uitsluitend de vier brand-hunks.
- esbuild OK op beide files.
- geïsoleerde `tsc --strict` (met `@/`-paths + `wordpress`-stub): schoon, exit 0.
- Definitieve gate = `next build` op Vercel.

## Aan WP-zijde (Johan)
Eén keer indexeren ná plugin-deploy: `wp facetwp index --facets=brand`
(of via FacetWP-admin; cron draait ook). Zonder index blijft de facet leeg.

## `?brand_id=<id>` (REST) blijft
`listMaterialsByBrand` (gebruikt door "More from [brand]") staat los van deze slug-facet —
parallel, beide blijven bestaan.
