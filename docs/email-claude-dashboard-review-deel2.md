Onderwerp: Dashboard review deel 2 — gedeployed

Hoi Claude,

Je cumulatieve zip `md-dashboard-review-deel2.zip` staat op main (`e10434e`). Deel 1 zat er al in (`a769f7e`); deel 2 is daar bovenop gezet.

---

## Deploy

| Bestand | Status |
|---------|--------|
| `src/styles/globals.css` | `§DASH-REVIEW-2`, `-SIDEBAR`, `-PANELS`, `-CROP` append-only toegevoegd |
| `src/components/dashboard/fields/CropModal.tsx` | **nieuw** |
| `DashboardPageHeader.tsx` | back-link onder titel (material new/edit) |
| `DashboardStickyFooter.tsx` | Save klikbaar + rode highlight bij incomplete form |
| `ProfileForm.tsx` | witregel invoice-blok + VIES ongewijzigd |
| `BrandProfileForm.tsx` / `MaterialForm.tsx` | crop + validatie + description-teller |
| `RequestsPanel.tsx` | klikbare rijen met detail (message uit data) |
| `SavedSearchesPanel.tsx` | hernoemen via bestaande PATCH `name` |
| `ChannelPicker.tsx` | al identiek aan deel 1 — geen diff |
| `Textarea.tsx` | min. 500 tekens + live teller |
| `materials/new/page.tsx` + `edit/page.tsx` | page header/back |
| `session-log.md` | bijgewerkt |

Build op main is groen.

---

## globals.css-merge

Geen wholesale replace. Main had al `§DASH-POLISH`, follow/preferred-source-blokken én `§DASH-REVIEW` (deel 1). Alleen de vier nieuwe append-blokken uit jouw zip zijn achteraan gezet — niets van de andere secties geraakt.

---

## Kleine fix naast je zip

`LeadRoutingPanel.tsx` gebruikte nog `disabled={!routesComplete}` op `DashboardStickyFooter`. Jouw nieuwe API is `invalid` — één regel aangepast zodat de build niet breekt. Zelfde gedrag: Save highlight bij incomplete routing, geen stille disabled-knop meer.

---

## Backend-vragen uit deel 1

Akkoord met jouw conclusies — ik heb niets aan de plugin hoeven wijzigen:

- **My requests:** message zat al in de data → frontend-only detail-uitklap werkt
- **Saved searches:** PATCH `name` bestond al → hernoemen werkt
- **VIES:** intact in beide forms
- **Crop:** client-side bijgesneden `File` naar `/api/dashboard/media` → geen backend-wijziging

---

## Review-ronde

Alle 15 punten uit je MANIFEST staan nu visueel + interactioneel op main. Laat weten als je nog iets ziet dat op prod anders uitpakt dan lokaal.

Groet,  
Johan
