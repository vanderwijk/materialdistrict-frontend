# MANIFEST — ChannelBar catalogus-fix — 2026-06-04

Overlay op de projectroot: pak `materialdistrict-frontend/` uit over je project.

## Symptoom
Op /talks toont de bar alleen "All" en het channel-filter doet niets.

## Oorzaak (frontend)
`getChannelCatalog()` kwam leeg terug: de oude mapper eiste een kále array én
een numerieke `id`. Wijkt de response daarvan af (wrapper rond de array, of een
`id` als string), dan filterde de mapper álles weg → lege bar + geen slug→id →
geen filter.

## Fix — 1 bestand
- `src/lib/api/channels.ts` — defensieve parser:
  - accepteert een kale array of een wrapper (`channels` / `data` / `items` /
    `terms`);
  - `id` via `Number(...)` (accepteert getal én numerieke string), `term_id` als
    fallback;
  - `label` valt terug op `name` en dan `slug`;
  - ongeldige items worden overgeslagen i.p.v. de hele lijst te lozen.

## Te bevestigen met Johan
De exacte ruwe vorm van `GET /md/v2/material-channels` (kale array vs wrapper;
`id` getal vs string), én of het endpoint bereikbaar is vanaf de backend die de
test-frontend gebruikt. Is de vorm de oorzaak, dan lost dit het op. Blijft de bar
na deploy leeg, dan bereikt het endpoint de test-backend niet (backend/omgeving).

## Validatie
esbuild syntax-check geslaagd. Type-niveau in de projectbuild.
