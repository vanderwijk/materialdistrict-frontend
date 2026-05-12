# Sessie 4 — Fixes na ChatGPT-validatie

Deze zip bevat de bestanden die ik gewijzigd heb om de TypeScript-build
volledig groen te krijgen, gevalideerd tegen de werkelijke staat van je
GitHub-repo (`vanderwijk/materialdistrict-frontend`, branch `main`).

## Plaatsing

```bash
cd /pad/naar/je/project
unzip materialdistrict-sessie4-fixes.zip -d /tmp/md-fixes
cp -r /tmp/md-fixes/src/* src/
cp /tmp/md-fixes/package.json /tmp/md-fixes/package-lock.json .
npm install
```

## Bestanden in deze levering

| Bestand | Wat is er gewijzigd |
|---|---|
| `package.json` | `react-icons@^5.6.0` toegevoegd (nodig voor `/style-guide` social-iconen) |
| `package-lock.json` | Lock-update voor bovenstaande |
| `src/app/materials/page.tsx` | `<JsonLd data={...}>` in array-vorm; `buildBreadcrumbList` kan `null` retourneren, alleen de array-vorm accepteert dat |
| `src/app/mock/page.tsx` | `InsiderGate mode=` → `variant=` (legacy alias migreerd); `useAuth().signIn/refresh` vervangen door directe `/api/auth/login`-fetch + `router.refresh()` (AuthContext kent die methodes niet meer) |
| `src/components/layout/index.ts` | `HeaderNavItem`, `MobileNavItem`, `FooterLink` toegevoegd aan barrel |
| `src/components/ui/index.ts` | Toegevoegd: `IconButton`, `TextLink`, `Tabs`, `TabItem`, `InsiderMark`, `BrandTierGate`, `PreviewModeIndicator`, `SubmitButton`, `FormStateProvider`, `useFormState`, `useFieldValidation`. Verwijderd: `FieldGroupProps`, `FieldRenderProps` (bestaan niet in onderliggende module, werden nergens geconsumeerd) |
| `src/lib/api/mappers.ts` | Nieuwe helper `publicationFromMeta()` met runtime type-guard; mapMaterial en mapMaterialListItem voegen nu het verplichte `publication`-veld toe. Bij ontbrekende WP-meta: placeholder met `isPlaceholder: true` (volgt de "Derived fields — source of truth"-regel uit `architecture-rules.md`) |
| `src/lib/auth/mappers.ts` | Volledig herschreven: `displayName` valt nu terug op `name` (mag niet undefined zijn); alle nullable velden 1-op-1 doorgegeven als `string \| null`; nieuwe `mapMembership()` helper bouwt placeholders voor `isInsider`/`status`/`billingInterval`/`isPlaceholder` (WP levert die nog niet); `brands: []` toegevoegd |

## Verificatie

```bash
npx tsc --noEmit
# moet exit 0 geven
```

In mijn omgeving slaagt `tsc --noEmit` met 0 errors. `next build` faalt
nog op het ophalen van DM Sans + DM Serif Display van Google Fonts, maar
dat is een sandbox-restrictie van mijn kant (HTTP 403 op
fonts.googleapis.com) — in jouw omgeving werkt dat (zoals
`validation_output.txt` al bewijst).

## Status van de 6 oorspronkelijke ChatGPT-bevindingen

| # | Issue | Status |
|---|---|---|
| 1 | `[slug]/page.tsx` en `[slug]/loading.tsx` empty | Al gefixt in repo vóór deze sessie (169 / 23 regels) |
| 2 | `react-icons` zonder dependency | **Gefixt in deze sessie** (toegevoegd aan package.json) |
| 3 | `useFieldValidation` mist `'use client'` | Al gefixt in repo vóór deze sessie |
| 4 | `orderby=menu_order` op `/wp/v2/media` (400) | Al gefixt in repo vóór deze sessie (`orderby: 'date'` + in-memory `menu_order`-sort als fallback) |
| 5 | `Math.random()` in `InsiderIcon` (hydration) | Al gefixt in repo vóór deze sessie (`useId()`) |
| 6 | Bypass van architectuur | Al gefixt in repo vóór deze sessie |

Het `validation_output.txt` in je repo toont een succesvolle HTTP 200
render van `/materials/flocc-recycled-cotton-flock` met DetailHeader,
MaterialGallery, MaterialDetailActions en MaterialDetailSidebar correct
gewired — de detail-pagina werkt nu in productie zoals bedoeld.

## Wat NIET in deze zip zit

- Geen wijzigingen aan de werkende `/materials/[slug]/page.tsx` of
  `/materials/[slug]/loading.tsx` — die zijn correct.
- Geen wijzigingen aan `MaterialGallery`, `MaterialCard`, `CompareBar`,
  `SampleRequestForm`, `useCompare` — die compileren al schoon.
- Geen nieuwe placeholder-infrastructuur (`src/lib/placeholders/`,
  `DevStatusButton`, etc.) — die was uit een eerdere sessie en past
  niet bij de huidige repo-staat. Als je daar later op terug wilt
  komen, doen we dat als losse batch op basis van wat dan werkelijk
  in de repo staat.

## Open items (geen blockers, ter info)

- `publication` is een placeholder in `mappers.ts` tot Johan's WP de
  velden levert. Materials tonen nu correct als `isOnline: true` met
  `isPlaceholder: true` zodat de UI later differentieel kan reageren.
- `Membership` mist `isInsider`/`status`/`billingInterval` in WP — ook
  placeholder, `isPlaceholder: true` per architectuur-regel.
- `User.brands` is leeg `[]` tot Johan `connected_brands` meestuurt.
