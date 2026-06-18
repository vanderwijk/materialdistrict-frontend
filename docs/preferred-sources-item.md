# Google Preferred Sources — knop (verkeers-/Google-spoor)

Klein, losstaand item. Staat los van de follow-laag en de datalaag; kan apart live.

## Wat & waarom
Met **Preferred Sources** kiezen lezers zelf welke bronnen ze vaker bovenaan
willen zien. Een lezer die MaterialDistrict toevoegt, ziet ons:
- vaker in **Top Stories**, en
- vaker in **AI Overviews / AI Mode** (Google heeft de functie mei 2026 naar AI
  Search uitgebreid) — sluit aan op het AI-proof-verhaal: wees de bron die AI
  laat zien.

Google zegt dat mensen ~2× zo vaak doorklikken naar een voorkeursbron. De
functie is wereldwijd beschikbaar voor Top Stories in alle talen — NL valt
eronder.

## Hoe het werkt
Eén deeplink met ons domein voorgevuld; ingelogde Google-gebruikers voegen ons
in één tik toe:

```
https://google.com/preferences/source?q=materialdistrict.com
```

Alleen domein/subdomein is geschikt (geen subpad) → `materialdistrict.com` is
prima. **Check eenmalig** of het domein in de tool staat: voer het in op
https://google.com/preferences/source

## Geleverde bestanden
- `src/components/ui/PreferredSourceButton.tsx` — de knop. Varianten
  `default` (volle CTA) en `compact` (kleine pill). Inline 4-kleuren Google-G;
  Google's officiële (gelokaliseerde) button-assets kunnen later 1-op-1 in
  `/public` en hier vervangen worden.
- `src/lib/api/preferredSource.ts` — anoniem-veilige click-logging,
  fire-and-forget naar `/api/events`. **Geen login vereist** (bewust los van
  `interactions.ts`).
- `src/styles/globals.css` — additief blok **§PREFERRED-SOURCE** onderaan.
- `src/components/layout/Footer.tsx` — knop gewired in de footer-bottom
  (`variant="compact"`, `placement="footer"`).

## Plaatsing
Live nu: **footer-bottom** (overal zichtbaar, laag risico).

Aanbevolen vervolgplekken — drop-in, één regel:
```tsx
<PreferredSourceButton variant="default" placement="article" />   // boven artikelen
<PreferredSourceButton variant="default" placement="homepage" />  // homepage
<PreferredSourceButton variant="default" placement="newsletter" />// in de digest-mail
```
`placement` is puur voor de analytics (event-`source`), zodat we per plek de
conversie zien. De digest-plek is de sterkste: dat is de loyale achterban.

## Voor Johan (kort)
- **CSS is volledig additief**: alleen het blok **§PREFERRED-SOURCE** onderaan
  `globals.css` is nieuw. Wijkt jouw main af, dan kun je dat blok los aanplakken.
- **`/api/events`** bestaat nog niet — dat is de generieke events-endpoint uit
  het datalaag-plan. Tot die er is faalt de click-log stil (fire-and-forget).
  Zodra de endpoint live is, telt de klik (`event_type=preferred_source_click`,
  `object_type=site`) **vanzelf** mee; geen extra wiring.

## Synergie
Zet de knop straks ook in de digest-mail en vraag de follow-achterban
MaterialDistrict als voorkeursbron toe te voegen. Compounds met het News-werk
(NewsArticle-schema): hoe vaker we in Top Stories staan, hoe meer de knop oplevert.
