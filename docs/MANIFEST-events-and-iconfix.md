# MANIFEST — events-filter sidebar + save-icoon hotfix (gebundeld)

Datum: 11-06-2026. Twee onafhankelijke wijzigingen in één zip; verschillende
bestanden, geen overlap, geen globals.

## 1. Save-icoon hotfix (filter-header)
- `src/components/ui/icons/SaveSearchIcon.tsx` — NIEUW. Custom save-icoon
  (klassieke diskette, geometrie 1-op-1 uit de catalogus-demo).
- `src/components/ui/icons/index.ts` — `IconSaveSearch` wijst nu naar dat
  custom icoon i.p.v. lucide's `Save` (3-regel diff-geverifieerde wijziging).
  Reden: lucide (^0.541) heeft hun `Save`-glyph hertekend → verkeerd icoon.
  Zelfde versie-stabiliteit-aanpak als `IconCompare`.

## 2. Events-filter naar linker sidebar
- `src/app/events/_components/EventsBrowser.tsx` — filters van de bovenbalk naar
  een linker `<FilterSidebar>` (consistent met materials/brands/talks). Facets:
  Date (Upcoming/Past), Location (landen + "Online"), Type (event-types).
  Channel + zoek ongewijzigd. Geen page-/CSS-wijziging (EventsBrowser bezit
  zelf zijn `.ov-wrap`). Costs (free/paid) volgt na het backend-`is_free`-veld.

Esbuild (transform) schoon op alle drie de bestanden.
