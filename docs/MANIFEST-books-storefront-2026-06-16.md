# MANIFEST — Bookshop redesign + storefront-feedback (één levering)

Datum: 16-06-2026

Deze zip bundelt **twee samenhangende rondes in één levering** en **vervangt**
de losse `books-redesign-moedermap.zip` en `storefront-feedback-moedermap.zip`
(niet beide los toepassen — alleen deze):

1. **Books redesign** — catalogus (`/books`) en detailpagina (`/books/[slug]`)
   heringericht naar de designerbooks-referentie (compacte 2:3-tegels; detail met
   cover + koop-kolom, binnenwerk-spreads en een "Additional information"-tabel).
2. **Storefront-feedback** — overzichtskaart-prijzen, winkelmand en checkout op
   basis van Jeroens opmerkingen, met de live oude bookstore als referentie.

Gebouwd op de actuele main-versies (door Jeroen aangeleverd) van `book.ts`,
`books.ts`, `CartView.tsx`, `CheckoutForm.tsx`, `cart.ts`, `CartContext.tsx`,
`AddressFields.tsx`. **Diff-gecontroleerd**: alleen onderstaande wijzigingen
erbovenop; geen drift in de basis, en alle backend-wiring van de checkout
(e-mail-detectie, dynamische betaalmethoden, sign-in panel, Stripe/3DS-redirect)
is ongemoeid gelaten.

## Gewijzigde / nieuwe bestanden

| Bestand | Status | Wijziging |
|---|---|---|
| `src/types/book.ts` | gewijzigd | `publisher` op `BookListItem`; `gallery` + `format` op `Book`. Schone superset van main. |
| `src/lib/api/books.ts` | gewijzigd | Mapper leest attributes **op naam** (`pickAttr`/`pickInt`, case-insensitive) → author/format/isbn/pages/year/publisher; `mapGallery` (spreads = `images[1..]`); ISBN = ISBN-attribuut anders SKU. Vervangt de oude `pickPublisher`. |
| `src/app/books/page.tsx` | herschreven | Catalogus met compacte `BookCard`-grid (`book-grid`) + lichte toolbar (zoek/sort/paginatie); ContentCard/ViewToggle eruit. |
| `src/app/books/loading.tsx` | gewijzigd | Skeleton op `book-grid` (2:3-tegels). |
| `src/app/books/[slug]/page.tsx` | herschreven | Designerbooks-layout: header → hero (cover + koop-kolom) → body → spreads-gallery → spec-tabel → "More books". **SEO behouden** (`generateMetadata`, `JsonLd`/`buildBook`, `notFound`). |
| `src/app/books/_components/BookCard.tsx` | nieuw/gewijzigd | Compacte boek-tegel; prominente prijs; auteur · **uitgever** (uitgever zwaarder); **Insider-korting zichtbaar** (auth-aware). |
| `src/app/cart/_components/CartView.tsx` | herschreven | Eén prijs per regel (incl. btw); min-knop → prullenbak bij aantal 1; verzendkosten "Calculated at checkout" tot een tarief gekozen is; samenvatting incl. btw + btw-notitie; free-shipping-melding. |
| `src/app/checkout/_components/CheckoutForm.tsx` | gewijzigd | "Calculate shipping"-knop weg → **automatische** tariefberekening op land + postcode (gedebounced) + auto-selectie goedkoopste tarief; free-shipping-melding; samenvatting incl. btw. |
| `src/lib/api/cart.ts` | gewijzigd | `total_items_tax` + `total_shipping_tax` (optioneel) op `StoreCartTotals` voor incl-btw weergave. |
| `src/lib/config/shipping-thresholds.ts` | **nieuw** | Free-shipping-drempels per zone (NL €30 · BE/DE €60 · Europa €120 · RoW €300). Spiegelt WooCommerce — synchroon houden. |
| `src/styles/globals-additions-books-storefront.css` | **nieuw §-blok** | Twee §-secties (redesign → feedback). Zie hieronder. |

**Niet in deze zip** (ongewijzigd, staat al op main): `CartContext.tsx`,
`AddressFields.tsx` (auto-shipping werkt via de bestaande `setCustomer`/
`selectShipping` + ongewijzigde adresvelden), en `BookBuyCard` /
`BooksSearchInput` / `BooksSort` / `BooksPagination` (hergebruikt).

**Opruimbaar op main:** `src/app/books/[slug]/_components/BookDetailSidebar.tsx`
wordt door de nieuwe detail-layout niet meer geïmporteerd. Mag weg.

## CSS — toepassen
`globals-additions-books-storefront.css` is **één** additief blok met twee
§-secties. **Plak de inhoud onderaan de centrale `globals.css`.** Volgorde binnen
het blok is bewust: het redesign-deel eerst, het feedback-deel erna (dat laatste
wint waar het bewust overschrijft, bv. een prominentere kaartprijs).

## Ontwerpkeuzes
- **Bedragen incl. btw** in mand én checkout-samenvatting; btw als notitie
  ("incl. €X VAT") i.p.v. een ex/incl-uitsplitsing. Sluit aan op de oude
  bookstore ("Total €27,45 includes €2,27 VAT").
- **Insider-prijs op de kaart**: ingelogde Insider ziet de Insider-prijs als
  hoofdprijs (reguliere prijs doorgestreept); iedereen anders ziet de reguliere
  prijs + een subtiele "Insider €X"-hint (drijft membership). UI-afleiding via
  `getBookPrice` (10%); mand/checkout tonen de echte WC-prijs (server-side
  dynamic pricing via de JWT-proxy).
- **Auto-shipping in de checkout**: geen knop meer; zodra land + postcode bekend
  zijn worden de tarieven berekend en wordt het goedkoopste vanzelf gekozen.
- **Free-shipping-drempels** hardcoded in config (incl-btw vergelijking), als
  spiegel van de WooCommerce-businessregels uit de oude-site-footer.

## Afhankelijk van Johan (backend) — nog te doen
De mapper leest attributes **op naam**, dus zodra deze er staan vullen
auteur/format/jaar/pagina's zich vanzelf; tot die tijd blijven die regels leeg.
1. **Globale productattributen** (namen exact): `Authors`, `Format`, `ISBN`,
   `Number of pages`, `Year of Publishing` (`Publisher` bestaat).
2. **Productcategorieën** (design-disciplines): Architecture, Interior Design,
   Urban & Landscape Design, Product Design, Packaging Design, Fashion Design,
   Graphic Design, Materials, Creative Business, Show Catalogues.
3. **Producttags**: `new-releases`, `last-chance` (Sale = `on_sale`, automatisch).
4. **WooCommerce CSV-import** designerbooks → MD **terwijl designerbooks nog live
   is** (image-URL's moeten resolven) — brengt boeken + attributes + categorieën
   + gallery-afbeeldingen mee.
5. **Filter-architectuur (beslissing):** per-optie tellingen via FacetWP (zoals
   materials) of via Store-API-params? Bepaalt hoe het filtermenu gebouwd wordt
   (Category, Format, Publisher, Price, Sale, New releases, Last chance — géén
   Rating, géén HS-code/land-van-herkomst; dat is SendCloud-only).

## Open (follow-up, geen blocker)
- **Mand: voor-berekende verzendkosten voor ingelogde gebruikers** met bewaard
  adres — uitgesteld (vergt profieladres-prefill in de cart-pagina). Nu toont de
  mand "Calculated at checkout"; de checkout rekent automatisch zodra het adres
  er is.
- **Betaalmethoden PayPal / Trustly / WERO** + Stripe `payment_data`: de
  dynamische lijst staat al op main (uit `cart.payment_methods`); de extra
  gateways blijven de bekende openstaande payment-integratie (sandbox).

## Verificatie
- Alle gewijzigde `.ts`/`.tsx` transpileren (esbuild, jsx=automatic).
- Diff-discipline: `cart.ts` = main + 2 optionele btw-velden; `book.ts`/`books.ts`
  = schone supersets; CheckoutForm = main + auto-shipping/banner/incl-btw, alle
  backend-imports intact.
- CSS brace- en comment-gebalanceerd (53/53, 13/13).
