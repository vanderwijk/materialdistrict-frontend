# MANIFEST — Prominente insider-prijs op de book-buy-card

**Datum:** 11-06-2026 · **Type:** frontend (1 TSX + 1 CSS-append-blok) · **Basis:** live `main`.

## Probleem
De insider-boekenkorting was visueel te zwak ("leesbril"): de enige signalen waren
een 11px groen tekstje ("Insider price applied") en een klein doorgehaald getal.
De logica klopte al — `BookBuyCard` rekent de insider-prijs uit via
`getBookPrice(price, true)` (10% uit `membership.ts`) en toont 'm auth-aware.

## Wijzigingen
1. `src/app/books/[slug]/_components/BookBuyCard.tsx`
   - Member + korting: een rij met een teal **"Insider price"-pill** + een concreet
     **"save €X"** (= `price − insiderPrice`).
   - Niet-member + korting: upsell toont nu óók het spaarbedrag
     ("Insiders pay €X — **save €Y**. Become an Insider").
2. `docs/globals-append-books-insider.css` — **APPEND-BLOK** voor `src/styles/globals.css`.
   - Plak dit blok **verbatim achteraan** `globals.css` (additief, later-wins override).
   - Versterkt: grotere insider-prijs (34px), duidelijke doorhaling, teal pill
     (`--ct-member`, witte tekst), bold-wit spaarbedrag.

## Waarom het CSS-blok los i.p.v. de hele globals.css
Conform de additieve discipline: het blok wordt achteraan toegevoegd, Johan plakt
alleen dit nieuwe blok. Zo geen risico op het terug-regresseren van latere CSS die
niet in mijn werkkopie zit.

## Kleuren / thema
Self-contained: teal pill (`--ct-member`) met witte tekst + wit spaarbedrag,
consistent met het bestaande wit-op-ink-patroon van de kaart (robuust in light/dark).
Geen `*/` in de comment-body.

## Validatie
- esbuild OK op BookBuyCard. CSS: braces gebalanceerd, één comment-close.
- diff JSX vs live: alleen de member-rij + het upsell-spaarbedrag.
- Eindcontrole = `next build` op Vercel.

## Hangt samen met (apart, backend)
De korting in de **cart** zelf landt nog niet (volle prijs) — dat is server-side
(zie de aparte Johan-mail: WC past de insider-prijs niet toe op de Store-API-cart,
ondanks de Bearer-JWT die de proxy meestuurt). Deze detail-weergave staat los en
sluit vanzelf aan zodra WC de cart-korting toepast.
