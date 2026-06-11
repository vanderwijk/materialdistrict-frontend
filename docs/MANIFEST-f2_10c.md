# MANIFEST — §F2.10c Catalogus-correcties

Datum: 11-06-2026
Scope: drie filter-correcties + de brand-tegel-montage. Additief op
§F2.10/§F2.10b, NIET rakend aan de detail-rondes.

## In deze zip (compleet + esbuild-geverifieerd, 6/6)

- **Filter-header sluit-× weg op desktop.** De × stond op desktop (ook in
  rust, zonder actief filter) door een CSS-volgorde-bug: `.uf-header-clear
  { display: inline-flex }` (regel 11719) stond ná de hide-regel
  `.uf-header-close { display: none }` (regel 7863) en won daardoor. Gericht
  hersteld voor materials (`.uf-header-close`) én brands
  (`.uf-header-clear.u-mobile-only`): de sluit-× verschijnt alleen wanneer de
  mobiele drawer open is.
- **"Filters:" met colon wanneer actief** — exact als het voorbeeld:
  "Filters:" + zwart rond telling-badge, daarnaast het save-icoon en het
  prullenbak-icoon (de ronde icoonknoppen die er al waren). In rust gewoon
  "Filters". Materials + brands gelijk.
- **Channel-× niet meer op "All".** De × als deselect-affordance hoort alleen
  op een echt channel; op de All-pill slaat dat nergens op. De All-tab krijgt
  `.is-all` in ChannelBar en de × wordt daar onderdrukt.
- **Brand-tegel material-thumbnail-montage (punt 11.2).** De lege banner toont
  nu een montage van max 4 material-thumbnails (lazy-loaded, vaste ratio),
  achter het overlappende logo en de bookmark-knop. Rollout-tolerant: lege/
  ontbrekende `material_thumbnails` → de bestaande gradient/placeholder blijft.
  Licht vanzelf op zodra Johans veld live is op productie.

## Bestanden (7, complete files)
- src/styles/globals.css  (§F2.10c-blok; additief — regels 1–13.082 identiek
  aan de huidige main incl. §F2.10/§F2.10b)
- src/components/ui/ChannelBar.tsx  (is-all op de All-tab)
- src/components/ui/FilterSidebar.tsx  (colon)
- src/components/ui/BrandTile.tsx  (montage)
- src/app/materials/_components/MaterialsFilterSidebar.tsx  (colon)
- src/lib/api/mappers.ts  (materialThumbnails-mapping; pure toevoeging,
  wpRenderedHtml ongemoeid)
- src/types/brand.ts  (materialThumbnails op BrandListItem)

## Verificatie
- esbuild: 6/6 clean.
- globals.css additief: regels 1–13.082 byte-identiek aan de huidige main.
- mappers.ts/brand.ts: diff = uitsluitend toevoegingen; wpRenderedHtml intact.

## Deploy / let op
- Additief — gewoon plaatsen bovenop de huidige main.
- De brand-montage activeert zichzelf zodra het `material_thumbnails`-veld op
  productie staat; tot die tijd tonen de tegels netjes de bestaande banner.
