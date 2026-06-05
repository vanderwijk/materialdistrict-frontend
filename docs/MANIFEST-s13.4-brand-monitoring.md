# MANIFEST — S13.4 Dashboard: Brand-monitoring

Datum: 05-06-2026
Sessie: S13.4 (Fase 2 / dashboard) — Interactions, Statistics, Lead routing afgemaakt naar de demo.
Basis: gebouwd op de verse main (types/dashboard.ts, dashboard/{data,mappers,mock}.ts,
globals.css, form/index.ts door Jeroen aangeleverd) — niet op de sessie-snapshot, die op
de dashboard-datalaag aantoonbaar verouderd was (categories→applications, properties,
profile/insights/brandprofile-uitbreidingen). Geen teamwerk teruggedraaid.

## Scope van de zip (scoped overlay — alleen gewijzigde/nieuwe bestanden)

Datalaag (batch 1):
- src/types/dashboard.ts              — + BrochureStatRow; + brochures op BrandStatistics; + 3 booleans op LeadRoutingConfig
- src/lib/dashboard/mappers.ts        — + RawBrochureStatRow/mapBrochureStatRow + brochures in mapBrandStatistics; lead-routing read+write 3 booleans
- src/lib/dashboard/data.ts           — lege fallbacks aangevuld (brochures: []; 3× false)
- src/lib/dashboard/mock.ts           — brochures-fixtures (31/44/22) + lead-routing booleans (beide brands)

Design-system (batch 2):
- src/components/ui/form/Switch.tsx   — NIEUW: universele on/off toggle (role="switch", controlled, tone default/insider)
- src/components/ui/form/index.ts     — + export { Switch, type SwitchProps }
- src/styles/globals.css              — additieve §S13.4-sectie: .dash-filterbar, .t-brochures, .switch*, .lr-insider-block, .lr-restrict(-warn)

Panelen (batch 3):
- src/components/dashboard/panels/InteractionsPanel.tsx  — filterbar + client-side filtering (tabel + drawer ongewijzigd)
- src/components/dashboard/panels/StatisticsPanel.tsx    — server: cards + delegatie
- src/components/dashboard/panels/StatisticsTables.tsx   — NIEUW: client-eiland, Tabs Materials/Brochures + tabellen
- src/components/dashboard/panels/LeadRoutingPanel.tsx   — restrictie-toggle + Insider-blok (2 toggles), 3 booleans in config + save

Root:
- session-log.md  (volledig bijgewerkt)
- MANIFEST-s13.4.md (dit bestand)

## Contract (al akkoord)
- LeadRoutingConfig += restrictToListedCountries, sampleRequestsInsidersOnly, downloadsInsidersOnly (booleans).
- BrandStatistics += brochures: BrochureStatRow[]; BrochureStatRow = { title: string; downloads: number }.

## Bewust NIET in de zip (fixes die ná sessie-start in main landden — niet terugdraaien)
- src/components/dashboard/panels/MaterialForm.tsx
- src/components/dashboard/panels/BrandProfileForm.tsx
- src/app/api/dashboard/media/route.ts
S13.4 raakt deze inhoudelijk niet; door de scoped overlay zitten ze niet in de zip.

## Verificatie
- Geïsoleerde tsc --strict op (a) de gewijzigde datalaag-shapes incl. excess-property-check
  op de mock-literals, (b) Switch.tsx, (c) de vier panelen tegen de echte Switch + accurate
  import-stubs. Alles groen.
- CSS-comment-regel gecheckt: geen `*/` in comment-bodies.
- Barrel src/components/dashboard/index.ts ongemoeid (pagina's importeren panels rechtstreeks);
  StatisticsTables is intern (alleen geïmporteerd door StatisticsPanel).

## WordPress (zie Johan-mail) — niet-blokkerend
- GET+POST /md/v2/dashboard/brands/{id}/lead-routing: restrict_to_listed_countries,
  sample_requests_insiders_only, downloads_insiders_only (lees + schrijf, persisteren op brand).
- GET /md/v2/dashboard/brands/{id}/statistics: brochures: [{ title, downloads }] (lees,
  server-side geaggregeerd). Tot levering: lege array → lege-state in de Brochures-tab.

## Open / vervolg
- Insiders-only-gates (sample requests / downloads) zijn nu instelbaar op brandniveau; de
  daadwerkelijke gating op de publieke materiaalpagina's is een aparte stap.
- Snake_case-keys zijn aanname conform Johans conventie; bij afwijking één-regel-fix in mappers.ts.
