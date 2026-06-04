# MANIFEST — ChannelBar op /materials (frontend) — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.
Laatste overzichtspagina die de ChannelBar krijgt. Identiek aan brands/talks/
events; alleen de fetch erachter verschilt (materials = FacetWP).

## ⚠️ Backend-afhankelijkheid (samen deployen)
Materials filtert via FacetWP-`results`; een rauwe `?theme=` werkt hier niet en
client-side filteren mag niet. Daarom is één FacetWP-facet op de `theme`-
taxonomie nodig (facetnaam `theme`, term-SLUGS als waarde). Zonder die facet
rendert de bar wél maar filtert niet — FacetWP negeert een onbekende facet
zonder error (per contract). Dus: deze frontend + Johan's `theme`-facet samen
deployen. Spec staat in de begeleidende mail aan Johan.

## Gewijzigd (add-only op shared files)
- `src/types/facetwp.ts` — `MaterialChannelFacetName = 'theme'` toegevoegd aan
  `AnyMaterialFacetName`; `'theme'` in `ALL_MATERIAL_FACET_KEYS` (gaat dus altijd
  mee in de payload); `theme?: string[]` op `FacetSelection`. Géén verwijderingen;
  `theme` zit bewust NIET in de FilterSidebar-facets (channel = de bar).
- `src/lib/api/facetwp.ts` — `?channel=<slug>` ↔ `theme`-facet:
  `parseFacetSelectionFromSearchParams` mapt `?channel` → `selection.theme`;
  `facetSelectionToSearchParams` mapt `theme` → `?channel`. Add-only.
- `src/app/materials/page.tsx` — `ChannelBarNav` op de identieke plek (direct
  onder de page-header, boven de filter-trigger-rij en `ov-wrap`); catalogus via
  `getChannelCatalog()` parallel met de materials-fetch; de losse
  `MaterialsSearchInput` is uit de header gehaald — zoeken zit nu in de bar
  (`?q=`, zelfde param als voorheen).

## Niet aangeraakt
`content.ts` (de selection → FacetWP-payload-route bestond al: `theme` lift
automatisch mee), `MaterialsPagination` (herbouwt uit `currentSearchParams`,
behoudt `?channel` vanzelf), `globals.css` (bar gebruikt bestaande tokens;
`channels.ts` + `ChannelBarNav` staan al op main uit batch 1/2).

## Validatie
esbuild syntax-check geslaagd op alle drie. Type-niveau in de projectbuild.

## Te verifiëren na deploy (samen met de facet)
`/materials?channel=biobased` → grid filtert op biobased; tab + zoeken in de
bar; pagination behoudt het channel; "Clear filters" wist ook het channel.
