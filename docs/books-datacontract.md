# Books datacontract (frontend ↔ WordPress) — v0.3

Het ene leesendpoint dat de books-frontend nodig heeft. De frontend draait al
tegen getypte mock-data die exact deze shape volgt; Johans endpoint klikt er
achteraf in zonder dat componenten veranderen.

> **Wijziging v0.3 (Johan-antwoord 11-06):** een boek is een **WooCommerce-
> product** (`post_type=product`), géén `book`-CPT en géén ACF. Endpoint:
> `GET /wp/v2/product?product_cat=books`. De boek-metadata komt top-level via
> `register_rest_field` (afgeleid van SKU + product attributes). Onze
> domeintypes (`Book` / `BookListItem`) blijven identiek — alleen de
> mapper-input is een product. De koop-URL is fase-afhankelijk en wordt door
> Johan geleverd; gebruikers gaan **nooit** naar een `cms.`-URL.

## Uitgangspunten

- **WP is leidend voor de reguliere prijs, voorraad en metadata.** `price`,
  `in_stock`, `isbn`, `publisher` (en later auteur/pagina's/jaar) komen
  kant-en-klaar uit WordPress. De frontend leest die.
- **De Insider-korting woont in de frontend-config.** Eén constante
  (`BOOK_DISCOUNT.insiderDiscount`, nu 10%), toegepast via `getBookPrice()`.
  WordPress levert dus alleen de reguliere prijs. (Bevestigd.)
- **Het endpoint is niet gebruikersafhankelijk en volledig cachebaar.** Publiek,
  geen auth, `revalidate: 1800`.
- **camelCase domeintypes** (`src/types/book.ts`); WordPress levert snake_case,
  de mapper vertaalt. HTML-velden via de bestaande `wpRenderedHtml`-afhandeling.
- **Eén naadlaag** (`src/lib/api/books.ts`): vandaag mock, straks `wpFetch` +
  mapper via `BOOKS_LIVE=true`.

## Bron & endpoint

Een boek = WC-product in de productcategorie `books`.

- **Lijst:**
  `GET /wp/v2/product?product_cat=books&per_page={n}&page={p}&search={q}&orderby={date|title}&order={asc|desc}&_embed`
  → array van producten (raw); totalen via `X-WP-Total` / `X-WP-TotalPages`.
- **Detail:**
  `GET /wp/v2/product?product_cat=books&slug={slug}&_embed` → array, neem `[0]`.

`show-catalogues` is een **child-categorie** onder `books` (Books = 22 producten;
Show Catalogues = 9). `product_cat=books` pakt parent + children mee → **v1 toont
beide**. Willen we catalogi later scheiden, dan is dat een filter op de
categorie-hiërarchie (child uitsluiten), geen aparte taxonomie. `pa_publisher`
kan later een facet worden; nu niet nodig.

## Payload per boek (raw, snake_case — WC-product + register_rest_field)

```jsonc
{
  "id": 5101,
  "date": "2026-03-01T10:00:00",
  "modified": "2026-05-20T12:00:00",
  "slug": "the-material-book",
  "status": "publish",
  "link": "https://.../product/the-material-book/",
  "title":   { "rendered": "The Material Book" },
  "excerpt": { "rendered": "<p>Korte intro…</p>" },   // WC short description
  "content": { "rendered": "<p>Volledige beschrijving…</p>" }, // WC description
  "featured_media": 456,

  // top-level via register_rest_field:
  "isbn": "978-90-1234-001-1",
  "publisher": "MaterialDistrict Press",
  "author_name": "",        // nu leeg; later optioneel product attribute
  "pages": null,            // idem
  "publication_year": null, // idem
  "price": 39.95,
  "in_stock": true,
  "buy_url": "https://books.materialdistrict.com/product/the-material-book/",

  "_embedded": { "wp:featuredmedia": [ /* standaard WPMedia */ ] }
}
```

### Metadata-mapping

| Veld (ons / payload) | Bron (WC)                                  |
| -------------------- | ------------------------------------------ |
| `isbn`               | product `sku`                              |
| `publisher`          | product attribute `pa_publisher`           |
| `author_name`        | nu leeg; later optioneel product attribute |
| `pages`              | nu leeg; later optioneel product attribute |
| `publication_year`   | nu leeg; later optioneel product attribute |
| `price`              | WC regular price (number, EUR)             |
| `in_stock`           | `stock_status === 'instock'`               |
| `wc_product_id`      | = product `id` (mapper zet dit zelf)       |

Auteur/pagina's/jaar staan voorlopig in de producttekst; de mapper laat ze leeg
tot ze als attribute bestaan. Ontbrekende velden degraderen netjes (lege
waarde), niets breekt.

### Koop-URL (`buy_url`) — nooit een cms-URL

Gebruikers blijven altijd op `materialdistrict.com`. De koop-CTA gebruikt
uitsluitend de door Johan geleverde `buy_url`:

- **Nu (books-subsite, tijdelijk — verdwijnt bij cutover):**
  `https://books.materialdistrict.com/product/{slug}/`.
- **Na cutover:** een frontend-URL op het apex-domein (Store API / cart-route);
  de WC-permalink (`link`) wordt dan een backend-URL en is **niet** user-facing.

Ontbreekt `buy_url`, dan toont de frontend geen koopknop (geen gok, geen
backend-URL). Johan levert de definitieve URL per fase.

### Veld-notities

- **`price`: getal** (`39.95`), niet de WC-string. Twee decimalen, EUR.
- **Insider-prijs zit NIET in de payload** — UI-afleiding via `getBookPrice()`.
- **`in_stock`**: out-of-stock titels mogen mee in de lijst; de frontend toont
  ze met een uitgeschakelde koopknop ("Sold out").
- **Cover** via `?_embed`; geen afbeelding → frontend-placeholder.
- **Domeintype** (`BookListItem` / `Book`): ongewijzigd t.o.v. v0.2.

## Caching

`revalidate: 1800` (30 min). Tag-based revalidation optioneel.

## Status & open punten

Contract **settled (v0.3)**. Endpoint bouwt Johan zodra de catalogus op blog 1
(materialdistrict.com) staat; tot die tijd draait de frontend op mock.

Resterend, niet-blokkerend:
1. **Definitieve `buy_url` per fase** — Johan levert (mock-fase: placeholder).
2. **Later optioneel:** `author_name` / `pages` / `publication_year` als product
   attributes; catalogi scheiden van boeken; `pa_publisher` als facet.

Integratie-test-URL (nog zonder verrijkte velden):
`https://books.materialdistrict.com/wp-json/wp/v2/product?product_cat=books&per_page=5&_embed`
