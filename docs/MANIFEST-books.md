# MANIFEST — Books-frontend (overzicht + detail), levering op mock

**Wat:** de complete `books`-vertical — datalaag, overzicht (`/books`) en detail
(`/books/[slug]`) — in "wit op canvas". Draait volledig op **mock**; de swap naar
de live WP-data is één env-variabele (`BOOKS_LIVE=true`), zonder codewijziging.

**Bron (datacontract v0.3):** een boek is een WooCommerce-**product**
(`/wp/v2/product?product_cat=books`); metadata top-level via
`register_rest_field`. Zie `docs/books-datacontract.md`.

---

## Bestanden

Datalaag
- `src/types/book.ts` — domeintypes (`BookListItem`, `Book`, `BooksListParams`).
- `src/lib/api/books.ts` — rauwe WC-product-shape, raw→domain mappers, publieke
  fetchers (`listBooks`, `getBook`) + mock-seam.
- `src/lib/api/books-mock.ts` — 6 fixtures in WC-product-shape (verwijderbaar
  zodra live de standaard is).
- `src/lib/utils/format-price.ts` — `formatEur`.

Overzicht
- `src/app/books/page.tsx` — server: header, toolbar (zoek/sort/view-toggle),
  ContentCard-grid (portrait), paginatie, lege-staten.
- `src/app/books/loading.tsx` — skeleton.
- `src/app/books/_components/BooksSearchInput.tsx` — gedebouncede `?q`-zoek.
- `src/app/books/_components/BooksSort.tsx` — `?sort` (Newest / Title).
- `src/app/books/_components/BooksPagination.tsx` — `?page`-bridge.

Detail
- `src/app/books/[slug]/page.tsx` — server: detail-sheet (cover · about),
  sidebar, "More books", JSON-LD, `notFound()`.
- `src/app/books/[slug]/loading.tsx` — skeleton.
- `src/app/books/[slug]/_components/BookDetailSidebar.tsx` — server: koop-card +
  "Book details".
- `src/app/books/[slug]/_components/BookBuyCard.tsx` — client, auth-aware prijs +
  groene koop-CTA.

Styling
- `src/styles/globals-additions-books.css` — additief `§BOOKS`-blok (toolbar +
  detail). **Onderaan `src/styles/globals.css` plakken; niets overschrijven.**

---

## Integratie-stappen (Johan)

1. **src-bestanden** op hun paden in moedermap zetten. Let op de twee
   `[slug]`-mappen (bracket-paden) en de map `_components`.
2. **`§BOOKS`-blok** uit `src/styles/globals-additions-books.css` onderaan
   `src/styles/globals.css` plakken (additief). Geen `*/` binnen selectors —
   het blok is al schoon.
3. **WP-endpoint** bouwen zodra de catalogus op blog 1 staat:
   `GET /wp/v2/product?product_cat=books&_embed`, plus `register_rest_field` voor
   `price`, `in_stock`, `isbn` (←sku), `publisher` (←pa_publisher). `author_name`
   / `pages` / `publication_year` mogen voorlopig leeg — de mapper degradeert
   netjes. Volledige shape + mapping-tabel in `docs/books-datacontract.md`.
4. **Live zetten:** `BOOKS_LIVE=true` in de env zodra het endpoint op de
   testserver draait. De frontend punt dan alleen de databron om.
5. **`buy_url`** per fase aanleveren (nooit een `cms.`-URL). Ontbreekt die, dan
   toont de frontend bewust geen koopknop.

Integratie-smoketest (zonder verrijkte velden) werkt al:
`https://books.materialdistrict.com/wp-json/wp/v2/product?product_cat=books&per_page=5&_embed`
→ titels + covers; prijs/voorraad zodra de velden geregistreerd zijn.

---

## Architectuur & beslissingen

- **Geïsoleerde vertical.** `mappers.ts`, `content.ts`, `globals.css` en de
  `@/lib/api`-barrel zijn bewust ongemoeid (geen moedermap-conflict). Pagina's
  importeren uit `@/lib/api/books`; barrel-inbouw volgt later.
- **Insider-prijs is frontend-config.** Alleen de reguliere `price` komt uit WP;
  de korting (`BOOK_DISCOUNT.insiderDiscount`, 10%) wordt toegepast via
  `getBookPrice()`. WordPress rekent dus geen Insider-prijs.
- **Catalogi:** `product_cat=books` pakt de child `show-catalogues` mee → v1
  toont beide (akkoord). Scheiden = later een categorie-hiërarchie-filter.
- **Geparkeerd:** homepage books-blok + sidebar-widget; channels/facetten op het
  overzicht (tot een eventuele taxonomie).

## Verificatie

Alle bestanden transpileren schoon (esbuild, tsx). De datalaag is end-to-end op
mock gedraaid: lijst, paginatie, zoek, sortering en alle randgevallen (geen
cover, geen auteur, uitverkocht, onbekende slug) leveren de juiste output;
`buyUrl` resolveert naar het apex-domein (nooit cms); `wcProductId` = product-id.
