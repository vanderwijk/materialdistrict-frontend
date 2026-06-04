# MANIFEST — Featured + offline heads-up (frontend) — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.
Dit is de frontend-helft van de "featured + offline"-regel; de backend (online-
bewuste is_featured_now, geen blokkade, quota ongewijzigd) staat al live op prod.

## Gewijzigd
- `src/types/dashboard.ts` — `MaterialListRow` krijgt `featuredState`
  ('active' | 'scheduled' | null) en `featuredWeekStart` (ISO-maandag | null).
  De FeaturedSlot-types uit de featured-batch staan er nog in (compleet bestand,
  draait niks terug).
- `src/lib/dashboard/mappers.ts` — `mapMaterialListRow` mapt `featured_state` →
  `featuredState` en `featured_week_start` → `featuredWeekStart` (RawMaterial-
  ListRow uitgebreid).
- `src/components/dashboard/panels/MaterialsPanel.tsx` — zachte, niet-blokkerende
  heads-up bij het offline halen van een featured materiaal (active of
  scheduled): "… is featured this week / scheduled for the week of … — while
  it's offline it won't appear in the featured spots", met **Keep online** /
  **Take offline anyway**. Bevestigen → materiaal gaat offline (de booking en de
  verbruikte quota blijven). Alle overige toggles wijzigen direct.

## Niet aangeraakt
`globals.css` (de heads-up gebruikt bestaande tokens: `field-helper`, `g2`,
`btn` — geen nieuwe class). `data.ts`, de featured-slots routes: ongewijzigd.

## Reikwijdte
De heads-up zit op de online/offline-toggle in de materiaallijst (de primaire
offline-actie). Draft/verwijderen lopen via andere flows; de WP-regel dekt die
sowieso (alleen nog geen heads-up daar).

## Validatie
esbuild syntax-check geslaagd op alle drie. Type-niveau in de projectbuild.
Bouwt direct tegen productie-data (featured_state/featured_week_start zijn live).

## Eventueel later
Wil je de heads-up visueel laten opvallen (kader/achtergrond), dan is dat één
regel in globals.css — zeg maar, dan lever ik die compleet mee.
