# MANIFEST — S13.2 (Dashboard: Persoonlijk account) — 05-06-2026

Overlay op de moedermap. Alle paden zijn relatief aan de repo-root.

## Gewijzigd / nieuw — code

| Bestand | Wat |
|---|---|
| `src/types/dashboard.ts` | `UserProfile` uitgebreid; nieuw `ProfileFieldOption(s)`; `InsightReport` uitgebreid |
| `src/lib/dashboard/mappers.ts` | profile lees/schrijf + `mapProfileFieldOptions` + insights-velden |
| `src/lib/dashboard/data.ts` | nieuw `getProfileFieldOptions()` |
| `src/lib/dashboard/mock.ts` | `MOCK_PROFILE` + `MOCK_INSIGHTS` naar nieuwe vorm |
| `src/components/dashboard/panels/ProfileForm.tsx` | herschreven naar demo |
| `src/components/dashboard/panels/InsightsPanel.tsx` | herschreven naar demo (banner + rijen) |
| `src/app/dashboard/profile/page.tsx` | haalt opties parallel op |
| `src/app/dashboard/insider-insights/page.tsx` | geeft `isInsider` door |
| `src/styles/globals.css` | `.profile-invoice-fields` + `.insights-banner*`/`.insight-row*` (oude `.insight-*` vervangen) |

## Gewijzigd — projectdocumentatie

| Bestand | Wat |
|---|---|
| `build-order.md` | Fase 2 vastgelegd als **S13** met substappen (S13.1–S13.5); S12 = Channel-hubs |
| `docs/session-log-patch-s13.2-personal-account.md` | append aan `session-log.md` |
| `docs/email-johan-s13.2-profile-insights.txt` | klaar om te versturen |

## Geen losse CSS-bestanden
Alle styling staat in de bestaande `globals.css`.

## Afhankelijkheden (Johan)
Zie de e-mail: `profile`-velden (lees+schrijf), nieuw `profile-options`-
endpoint, en `insider-insights`-velden (`pages`, `format`, `insider_only`
hergebruik, `pdf_url`). Alles valt defensief terug tot die er zijn.
