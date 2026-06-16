# Session-log — Bookshop redesign + storefront-feedback (16-06-2026)

> In te voegen in de root `session-log.md`. Eén levering die de losse redesign-
> en feedback-zips vervangt.

## Aanleiding
designerbooks.store en books.materialdistrict.com gaan op in één bookshop op
materialdistrict.com. De catalogus + detailpagina zijn heringericht naar de
designerbooks-look; daarna een feedback-ronde van Jeroen op kaarten, mand en
checkout, met de live oude bookstore als referentie (verzendkosten + de
"Spend €X more for free shipping"-melding).

## Geleverd — redesign
**Catalogus (`/books`)**
- Compacte `BookCard`-grid (2:3-cover, titel, auteur · uitgever, prijs, Add-to-cart);
  ContentCard/ViewToggle eruit. Lichte toolbar (zoek/sort/paginatie) blijft.
- `loading.tsx`: skeleton op `book-grid`.

**Detail (`/books/[slug]`)** — designerbooks-layout
- header (breadcrumb + titel) → hero (cover links · koop-kolom met korte
  beschrijving + `BookBuyCard`) → body → binnenwerk-spreads (gallery = `images[1..]`)
  → "Additional information"-tabel → "More books".
- SEO behouden: `generateMetadata`, `JsonLd`/`buildBook`, `notFound`.

**Types + mapper**
- `book.ts`: `publisher` op `BookListItem`; `gallery` + `format` op `Book`.
- `books.ts`: attributes **op naam** gelezen (`pickAttr`/`pickInt`, case-insensitive)
  → author/format/isbn/pages/year/publisher; `mapGallery` (spreads). ISBN =
  ISBN-attribuut anders SKU. Placeholder-bestendig tot Johans attributes er zijn.

## Geleverd — storefront-feedback
**Overzicht (BookCard)**
- Prijs prominenter (16px / 700); uitgever met meer gewicht.
- Insider-korting zichtbaar: hoofdprijs voor Insiders (reguliere prijs
  doorgestreept), "Insider €X"-hint voor de rest. Auth-aware via `isInsider(user)`.

**Winkelmand (CartView, herschreven)**
- Eén prijs per regel, incl. btw (dubbele incl/excl vervallen).
- Min-knop wordt prullenbak bij aantal 1; losse "Remove"-knop weg.
- Verzendkosten "Calculated at checkout" tot een tarief gekozen is (de
  "€0,00"-bug — `"0"` is truthy — verholpen via controle op een geselecteerd
  tarief).
- Samenvatting incl. btw + btw-notitie; free-shipping-melding (NL-drempel).

**Checkout (CheckoutForm)**
- "Calculate shipping"-knop weg → automatische tariefberekening (gedebounced,
  600 ms) op land + postcode; auto-selectie goedkoopste tarief.
- Free-shipping-melding (op `billing.country`); samenvatting incl. btw.
- Alle bestaande backend-wiring intact (e-mail-detectie, dynamische
  betaalmethoden, sign-in panel, Stripe/3DS-redirect).

**Config / API**
- `shipping-thresholds.ts` (nieuw): drempels per zone, incl-btw.
- `cart.ts`: `total_items_tax` + `total_shipping_tax` toegevoegd.

**CSS**
- `globals-additions-books-storefront.css` (één §-blok, twee secties: redesign →
  feedback), onderaan globals.css.

## Discipline
- Gebouwd op de door Jeroen aangeleverde main-versies; diff-gecontroleerd, geen
  drift in de basis. Alleen gewijzigde/nieuwe bestanden geleverd.
- Alle gewijzigde bestanden transpileren (esbuild). CSS brace- en
  comment-gebalanceerd.

## Afhankelijk van Johan
Attributen (`Authors`/`Format`/`ISBN`/`Number of pages`/`Year of Publishing`),
categorieën (design-disciplines), tags (`new-releases`/`last-chance`), de
WooCommerce CSV-import designerbooks → MD (terwijl designerbooks nog live is), en
de filter-architectuurbeslissing (FacetWP vs Store-API-params).

## Open (follow-up)
- Mand: voor-berekende verzendkosten voor ingelogde gebruikers (profieladres
  prefillen in de cart-pagina).
- Payment-integratie PayPal / Trustly / WERO + Stripe `payment_data` (sandbox).
- `BookDetailSidebar.tsx` is ongebruikt geworden — mag van main.
