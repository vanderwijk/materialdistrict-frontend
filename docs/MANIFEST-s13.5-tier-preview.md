# MANIFEST — S13.5 Dashboard tier-preview (upsell-modus) — 05-06-2026

Scoped overlay in moedermap-structuur. Complete bestanden (geen patches).
Pure frontend — geen WP-/REST-wijziging. Alle batches geïsoleerd `tsc --strict`
geverifieerd (A+B+C+D, ook integraal).

## Gewijzigde bestanden

### A — fundament (mechaniek generaliseren + dashboard-breed mounten)
- `src/lib/hooks/usePreviewMode.tsx` — docstring gegeneraliseerd (brand + reader,
  dashboard-scoped). Geen logica-wijziging.
- `src/components/ui/PreviewModeIndicator.tsx` — docstring + upsell-neutrale copy
  ("— a preview of what you'd unlock").
- `src/components/dashboard/DashboardShell.tsx` — `PreviewModeProvider` rondom de
  shell + globale `PreviewModeIndicator` (dashboard-breed).

### B — reader-gate
- `src/components/ui/InsiderGate.tsx` — nieuwe `variant="preview"` (teal reveal,
  spiegelt `BrandTierGate section`), via dezelfde `usePreviewMode`-context.

### C — insights-banner
- `src/components/dashboard/panels/InsightsPanel.tsx` — nu client component; banner
  kreeg de Preview-knop; in preview tonen gated rapporten de download-affordance die
  naar de upgrade-CTA routeert (bestand blijft server-side gated).

### D — submit-block
- `src/components/ui/form/SubmitButton.tsx` — `useSubmitBlocked`: submit disabled
  tijdens preview ("Exit preview to save"). NOOP-safe buiten een Provider.

### CSS
- `src/styles/globals.css` — zie hieronder.

## globals.css — LET OP (supersession)
Gebouwd op de **huidige** main (die de dubbele `.compare-bar`-block heeft opgeschoond
en de slide-up-animatie zonder `forwards` heeft). Daarop heraangebracht:
1. B1-fix `.t-stats` 4→3 kolommen;
2. §S13.4-B3-blok (download/sample-gates + country-block);
3. nieuw §S13.5-blok (InsiderGate preview-overlay/blur + `insights-banner-actions`).

**Deze `globals.css` vervangt de versie uit `md-s13.4-interactions.zip`** (die was op
een oudere main gebouwd). Merge deze; niet die uit de S13.4-zip.

## Niet in deze zip / niet nodig
- Geen WP-wijziging, geen Johan-mail (puur frontend; insights-download al gated).
- De dashboard-pagina's hoeven niet te wijzigen: de Provider zit in `DashboardShell`,
  dus alle panelen vallen er automatisch onder.

## Aanname (graag bevestigen)
De `session-log.md` in deze zip is gebaseerd op de S13.4-output-versie (laatste
bekende head). Is de session-log sinds S13.4 met de hand gewijzigd, stuur dan de
actuele versie — dan vouw ik de S13.5-entry opnieuw in.

Root: `session-log.md` (volledig bijgewerkt) + dit MANIFEST.
