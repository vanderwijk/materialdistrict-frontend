# MANIFEST — S13.4 Interactions (integraal) — 05-06-2026

Scoped overlay in moedermap-structuur. Complete bestanden (geen patches).
Merge: leg deze bestanden 1-op-1 op de moedermap; ze zijn additief op de
in-sessie geleverde main. `wpRenderedHtml`-helper in `mappers.ts` ongemoeid (19×).

## Nieuwe bestanden
- `src/lib/api/interactions.ts` — client-helper `logInteractionEvent` (best-effort).
- `src/app/api/interactions/events/route.ts` — Next-proxy → `POST /md/v2/interactions/events`.

## Gewijzigde bestanden

### B1 — statistics-correctie + lead-routing codes
- `src/types/dashboard.ts`
- `src/lib/dashboard/mappers.ts`
- `src/lib/dashboard/data.ts`
- `src/lib/dashboard/mock.ts`
- `src/components/dashboard/panels/StatisticsPanel.tsx`
- `src/components/dashboard/panels/StatisticsTables.tsx`
- `src/components/dashboard/panels/LeadRoutingPanel.tsx`

### B2 — publieke datalaag
- `src/types/shared.ts`
- `src/types/material.ts`
- `src/lib/api/wordpress.ts`
- `src/lib/api/mappers.ts`

### B3 — publieke materiaalpagina + gates
- `src/styles/globals.css`  (§S13.4 + B1 `.t-stats`-grid + §S13.4-B3)
- `src/app/materials/[slug]/page.tsx`
- `src/app/materials/[slug]/_components/DownloadsCard.tsx`  (ook B5-logging)
- `src/app/materials/[slug]/_components/GetInTouchModal.tsx`
- `src/app/materials/[slug]/_components/GetInTouchCard.tsx`

### B5 — event-logging (brand-pagina)
- `src/app/brands/[slug]/page.tsx`
- `src/app/brands/[slug]/_components/BrandDetailContactCard.tsx`
- `src/app/brands/[slug]/_components/BrandDetailInfoCard.tsx`

## Bewust NIET in deze zip
- DEEL-1 S13.4-bestanden die al door Johan zijn gemerged en niet opnieuw
  gewijzigd: `InteractionsPanel.tsx`, `components/ui/form/Switch.tsx`,
  `components/ui/form/index.ts`.
- `src/app/api/get-in-touch/route.ts` — ongewijzigd (alleen als referentie
  gebruikt voor de proxy-stijl).
- B4 publieke brand-pagina vroeg geen code-wijziging (render-check akkoord).

## Verificatie
Geïsoleerde `tsc --strict` per batch groen (logica-harnasses + echte componenten
met react-types en `@/`-stubs). Gedeelde bestanden additief gediff't tegen de
in-sessie geleverde main.

## Landen-nuance (let op bij toekomstig werk)
- Dashboard lead-routing + WP-enforcement: **codes**.
- Publieke material-gate: **labels** (`brand_accepted_countries` + `user.country`
  zijn labels per Johan-handoff). Gate matcht label-tegen-label.

Root: `session-log.md` (volledig bijgewerkt) gaat mee met deze zip.
