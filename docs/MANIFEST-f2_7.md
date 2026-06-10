# MANIFEST — §F2.7 Overzicht-finetuning (TOTAAL)

Datum: 10-06-2026
Scope: uitsluitend de overzicht-/cataloguspagina's (materials, brands, stories,
talks, events) en hun gedeelde chrome/componenten. Frontend-only — geen
WordPress-werk. Property-pills ongemoeid (subtiel, geen amber/rood).

Deze zip is de **samengevoegde eindstand** van de vier deelbatches (A, B, B2,
C/D). Van elk bestand zit de finale versie erin; cross-batch supersets zijn al
opgelost. Eén keer deployen volstaat — geen onderlinge volgorde meer nodig.

## Verwerkte punten (Jeroen)
- **1.1** Witregel onder de ChannelBar.
- **1.2** Channel-/thema-labels HTML-gedecodeerd bij de bron (`&` i.p.v. `&amp;`).
- **1.3** Channel-/thema-filtering: al gewired op álle overzichten; entity-decode
  maakt de matching schoon (geen aparte codewijziging).
- **2.1** Filterblok plat op de paper (witte surfaces eruit).
- **2.2** ×/Save in de filter-header alleen bij een actief filter.
- **3.1** Actief paginanummer = ink (zat al in main; geen wijziging).
- **3.2** Recently-viewed tiles verwijderbaar.
- **3.3** Witregel onder de paginering.
- **4**  Melding i.p.v. directe login-redirect: Save → login-melding,
  Compare → Insider-gate.
- **Board-popover** (pitch Jeroen, hybride): instant opslaan + toast met
  "Add to board"; Insider → board kiezen/aanmaken, non-Insider → Insider-gate.
- **5.3/6.2/7.1/8.2** Bookmark-knop op stories/brands/events/talks.
- **6.1** Brands country-filter: aflopend op aantal + inklapbaar.
- **7.2** Events: Upcoming/Past-segment.
- **7.4** Events: max 20 per pagina (client-paginering).
- **5.4/6.3/7.3/8.3** Recently viewed op stories/brands/events/talks
  (+ minimale view-tracking op de detailpagina's).

## Bestanden (25 broncode)
Nieuw (4): `lib/hooks/useRecentlyViewed.tsx`, `components/ui/RecentlyViewedRail.tsx`,
`components/ui/CardBookmarkButton.tsx`, `components/ui/GateNotice.tsx`.
Gewijzigd (21): globals.css; channels.ts; useRecentlyViewedMaterials.tsx;
FilterSidebar.tsx; index.ts; layout.tsx; MaterialCard.tsx; BrandTile.tsx;
MaterialsFilterSidebar.tsx; RecentlyViewedSection.tsx; MaterialsGrid.tsx;
EventCard.tsx; EventsBrowser.tsx; BrandsFilterSidebar.tsx; articles/page.tsx;
articles/[slug]/page.tsx; brands/page.tsx; brands/[slug]/page.tsx;
events/[slug]/page.tsx; talks/page.tsx; talks/[slug]/page.tsx.

## globals.css — additief
`globals.css` = huidige main (12.228 regels, incl. §HOME-F2) + drie additieve
§F2.7-blokken erachter:
- `§F2.7 … (batch A)`  … `einde §F2.7 batch A`
- `§F2.7 … (batch B)`  … `einde §F2.7 batch B`
- `§F2.7 … (batch C/D)`… `einde §F2.7 batch C/D`
Regels 1–12.228 zijn byte-identiek aan de aangeleverde main. Neem de file als
eindstand, of plak alleen de drie §F2.7-blokken additief aan.

## Verificatie
- globals: regels 1–12.228 byte-identiek aan de huidige main; comment-
  terminators gebalanceerd in elk blok.
- TS/TSX: esbuild — 24/24 clean.
- Cross-batch supersets opgelost (FilterSidebar/index.ts/globals = C/D;
  MaterialsGrid/GateNotice/CardBookmarkButton = B2); B-wiring in
  articles/talks behouden.

## Bewust apart (geen onderdeel van deze zip)
- **Talks-filter (8.1)** — pagina-restructure (load-all + nieuw filterblok op
  jaar + spreker; bron-event ontbreekt in de talk-data). Volgt als losse,
  zorgvuldige stap. Talks kreeg in deze zip wél bookmark + recently-viewed.
- **Stories-tellingen (5.2)** — geen frontend-fix; onderzoeksvraag voor Johan,
  zie `email-johan-stories-tellingen-onderzoek.txt`.
