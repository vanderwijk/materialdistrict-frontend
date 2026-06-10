# MANIFEST — F2.4 Dashboard-chrome (wit op canvas)
Datum: 09-06-2026
Zip: md-f2-dashboard-2026-06-09.zip
Gepatcht tegen: verse main globals.css van 09-06 (post-F2.3, deploy-pending)

## Te vervangen bestanden
| Bestand | Wijziging |
|---|---|
| `src/styles/globals.css` | Additief `§F2.4`-blok onderaan (105 regels). Niets verwijderd. |
| `src/components/dashboard/DashboardStickyFooter.tsx` | Save-knop `btn-green` → `btn-primary`. |

## Toe te voegen / te verwijderen
- Toevoegen: geen nieuwe bestanden.
- Verwijderen: geen.

## globals.css — additief bewijs
- Eerste 11878 regels byte-identiek aan de verse main (diff -q: identiek).
- `comm` main minus deze versie = 0 regels (niets verloren).
- Toegevoegd: alleen het `§F2.4`-blok (105 regels), na `§F2.3`.
- Comment-balans: 9× `/*` en 9× `*/`; geen `*/` in een selector-lijst.

## Wat er verandert (samengevat)
- Sidebar-nav van witte box → paper (spiegelt het filterpaneel §F2.2).
- Actief nav-item → zwart (`--ink`), gelijk aan actieve channel-pill/filterselectie.
- Brand-avatar geneutraliseerd (geen green/navy in de chrome).
- Mobiele dashboard-nav op paper, zwart-actief (spiegelt `.header-nav`).
- Primaire knoppen (incl. save) → zwart, scoped op het dashboard.
  Teal (Insider) en rood (destructief) ongemoeid.
- Content-panels: ongewijzigd — waren al witte tegels, drijven via `--bg` op paper.

## Niet aangeraakt (bewust)
- `types/dashboard.ts`, material-property-bestanden: styling-pass raakt geen data/types.
- `layout.tsx`: Schibsted al bedraad.
- `DashboardShell/PageHeader/Sidebar/MobileNav`: alle staten CSS-gedreven, geen markup nodig.
- `SavedSearchesPanel`: alerts-toggle blijft semantisch groen (aan/uit-status, geen primair).

## Verifiëren na deploy (testserver)
1. Dashboard-shell op paper; sidebar zonder witte box.
2. Actief sidebar-item zwart; brand-avatar neutraal.
3. Content-panels als witte tegels op paper.
4. Save-knop + overige primaire knoppen zwart; teal/rood ongemoeid.
5. Mobiel (<768px): dashboard-nav op paper, zwart-actief item.
6. Dark mode: actief item licht-op-donker (geen navy meer).
