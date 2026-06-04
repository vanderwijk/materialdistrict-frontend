# MANIFEST — Unified ChannelBar: brands + events — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.
Increment 2 van de uitrol: dezelfde bar als op talks, nu op brands + events,
op het al gedeployde fundament (channels.ts + ChannelBarNav + barrels).

## Gewijzigd
- `src/lib/api/wordpress.ts` — `theme?: number` toegevoegd aan `ListBrandsParams`
  en doorgegeven in `listBrands` (`?theme=<id>` op /wp/v2/brand). De talks-edit
  uit batch 1 (`ListTalksParams.theme`) staat er nog in — dit is het complete
  bestand, dus het draait niets terug.
- `src/app/brands/page.tsx` — leest `?channel=`, resolvet slug→id, geeft `theme`
  mee aan `listBrands`, en rendert `ChannelBarNav` boven de filter+grid-wrap.
  De losse `BrandsSearchInput` is uit de header gehaald; search zit nu in de bar.
  (Het country-filter in de sidebar blijft ongewijzigd.)
- `src/app/events/page.tsx` — leest `?channel=` + `?q=`, haalt de catalogus
  parallel op, en rendert `ChannelBarNav` boven de browser.
- `src/app/events/_components/EventsBrowser.tsx` — omgezet naar prop-gestuurd:
  geen eigen ChannelBar/zoek-state meer, filtert de (volledig geladen) lijst op
  het channel-slug + zoekterm uit de URL. **De oude afwijking — alleen de
  channels tonen die toevallig op events voorkomen — is eruit; nu de volledige
  canonieke catalogus, identiek aan de andere overzichten.**

## Niet in deze zip (al op main)
`channels.ts`, `ChannelBarNav.tsx`, de barrels — die staan al op test (batch 1 +
catalogus-fix). `globals.css`, `mappers.ts`, de paginatie-componenten:
ongewijzigd (paginatie behoudt `?channel` al, want die bouwt de URL uit álle
huidige params).

## Mechaniek per pagina (bewust; bar is overal identiek)
- Talks + brands: server-side `?theme=<id>` op de collectie.
- Events: client-side filter op de volledig geladen lijst (WP kan events niet op
  datum sorteren over paginatie heen). Gebruiker ziet exact dezelfde bar.

## Validatie
esbuild syntax-check geslaagd op alle vier. Type-niveau in de projectbuild.

## Test na deploy
- /brands en /events: bar met de 20 channels + "All" + zoekveld; channel kiezen
  filtert (brands server-side, events client-side); `?channel=<slug>` in de URL;
  op /brands behoudt paginatie het channel- + zoekfilter.
