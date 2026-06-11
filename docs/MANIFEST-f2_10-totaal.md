# MANIFEST — §F2.10 Catalogus-finetuning (TOTAAL)

Datum: 11-06-2026
Scope: complete correctieronde op de overzicht-/cataloguspagina's
(§F2.10 + §F2.10b samengevoegd). Frontend-only. Additief op §F2.7, en NIET
rakend aan de detail-rondes §F2.8/§F2.9.

Eén deploy. `globals.css` is de superset (§F2.10 + §F2.10b in één bestand);
regels 1–12.756 zijn byte-identiek aan de huidige main, de twee §-blokken
staan erachter.

## Punten in deze zip (compleet + esbuild-geverifieerd, 14/14)

- **9/12/13.2/14.2 — recently-viewed hersteld.** De detail-rondes §F2.8/§F2.9
  hadden de detailpagina's opnieuw geleverd en de §F2.7 `RecentlyViewedTracker`
  weg-geclobberd → lege recently-viewed op stories/brands/events/talks. Tracker
  teruggezet op alle vier de detailpagina's. (Materials liep via een ander pad
  en werkte al.) Zie ook `handover-recently-viewed.md`.
- **1 — filter-header.** Zwart rond telling-badge achter "Filters", Save als
  icon-only, Clear als prullenbak-icoon; alle drie alleen bij ≥1 actief
  facet-filter (channel telt niet mee). Materials gelijkgetrokken; brands had
  dit al via de generieke FilterSidebar (daar puur de badge-CSS).
  **1d** — mobiel filtermenu kreeg een solide achtergrond (was transparant).
- **3 — ChannelBar-deselect.** Klik op het actieve channel → terug naar "All";
  × in de actieve (zwarte) pill als affordance.
- **4 — actieve paginaknop ink.** Was ink op `opacity 0.35` (uitgewassen door
  de `:disabled`-regel) → nu volle ink.
- **5 — recently-viewed verwijder-knop in bookmarks-stijl** (.bm-remove:
  30×30, afgerond, witte bg, icoon rood op hover, IconDelete 16) — materials-
  sectie én generieke rail.
- **6 — ViewToggle default = 2 koloms** (was 3).
- **7a — stories STORY TYPE-filter plat op de paper** (witte box + grijze band
  weg).
- **8 — gekleurd story-type-badge** linksboven op de story-tegels (type-kleur
  uit STORY_TYPE_META), via de nieuwe ContentCard `typeBadge`-prop.
- **10 — pagination-redesign** (goedgekeurd): venster rond de huidige pagina +
  first/last (« ») + "Go to page"-invoerveld (geen pulldown) + ink actief.
- **13.1 — event-tegel 16/9** (was vaste 120px).
- **14.1 — talks-filterblok.** Talks-overzicht herbouwd naar load-all + nieuwe
  `TalksBrowser` (client): filters op **jaar** en **spreker**, client-paginatie
  en de rail. Channel + zoek blijven server-/URL-gedreven via de ChannelBarNav.

## Naar Johan (backend-actiepunten — losse specs in deze zip)
- **7b** — stories-tellingen kloppen niet (News 12, rest 0/1). Geen frontend-
  oorzaak; wijst op de WP `story_type`-taxonomy. → `email-johan-stories-tellingen.txt`
- **11.2** — brand-tegels met material-thumbnails: vereist een endpoint-veld
  `material_thumbnails` (max 3-4 kleine URL's per brand, géén N+1). De
  frontend-montage bouw ik zodra de data er is. → `email-johan-brand-thumbnails-endpoint.txt`

## Bestanden (15, complete files)
globals.css · ContentCard.tsx · Pagination.tsx · ChannelBarNav.tsx ·
ViewToggle.tsx · RecentlyViewedRail.tsx · articles/page.tsx ·
articles/[slug]/page.tsx · brands/[slug]/page.tsx · events/[slug]/page.tsx ·
talks/[slug]/page.tsx · talks/page.tsx · talks/_components/TalksBrowser.tsx ·
materials/_components/MaterialsFilterSidebar.tsx ·
materials/_components/RecentlyViewedSection.tsx

## Verificatie
- esbuild: 14/14 clean (alle TS/TSX).
- globals.css additief: regels 1–12.756 byte-identiek aan de aangeleverde
  main; §F2.10- en §F2.10b-blok erachter; §F2.8/§F2.9 ongemoeid.
- RV-tracker-props matchen de `RecentlyViewedEntry`-interface.
- ChannelBar.tsx bewust NIET meegeleverd (deselect zit in ChannelBarNav, × is CSS).

## Aannames / let op
- Talks load-all is gecapt op de WP-max van 100/page; de talks-catalogus valt
  daar ruim binnen.
- **Handover:** de `RecentlyViewedTracker` op de vier detailpagina's MOET
  behouden blijven bij een volgende detailronde (zie handover-doc).

## Buiten deze ronde
- 11.2-frontend (na Johans endpoint) · 7b (WP-tellingen) · punt 2
  (responsiveness, eigen ronde).
