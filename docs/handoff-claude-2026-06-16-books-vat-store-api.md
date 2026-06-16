# Handoff Claude — Books / VAT / Store API (2026-06-16)

Deze handoff bundelt de laatste backend+frontend updates rond books, ex-VAT pricing en het uitfaseren van FacetWP voor de nieuwe books-flow.

## Belangrijk vooraf

- Werk in `materialdistrict-frontend` op basis van de laatste `main`.
- Pushes naar `materialdistrict-frontend` gaan via Johan.
- Nieuwe code moet **niet** afhankelijk zijn van FacetWP (wordt uitgefaseerd).

## Wat is live gepusht

## Plugin (`materialdistrict-plugin`)

- `4ca245f` — Add ex-VAT price field to WooCommerce Store API product prices.
- `81cfd2f` — Expose native featured, channels, and tags in Store API products.

### Technisch resultaat op Store API product-response

Via filter `woocommerce_store_api_product_response` zijn nu deze velden beschikbaar:

- `prices.md_price_ex_vat` (minor units string, net als `prices.price`)
- `featured` (boolean, native WooCommerce featured flag)
- `channels` (terms uit taxonomie `theme`)
- `tags` (native WooCommerce `product_tag` terms)

Daarnaast is taxonomie `theme` native gekoppeld aan `product` via:

- `register_taxonomy_for_object_type( 'theme', 'product' )`

Hiermee kun je channels op producten beheren in WordPress/WooCommerce zonder custom opslaglaag.

## Frontend (`materialdistrict-frontend`)

- `f88dbd0` — route rename van `/books` naar `/book`
- `61e6f75` — VAT-validatie styling hersteld
- `c7b41e1` — consume ex-VAT Store API veld + /book cleanup zonder FacetWP

### Technisch resultaat frontend

- Book cards lezen nu ex-VAT direct uit backendveld (`priceExVat`) i.p.v. vaste 9%-afleiding.
- Tijdelijke frontend fallback verwijderd:
  - `BOOK_VAT`
  - `getBookExVatPrice()`
- `/book` flow opgeschoond voor FacetWP-uitfasering:
  - FacetWP-references verwijderd in relevante book-flow docs/comments
  - ongebruikte `BooksSearchInput.tsx` en `BooksSort.tsx` verwijderd
- Build was groen na wijzigingen.

## JSON voorbeeld (Store API product-response)

Onderstaand voorbeeld toont alleen relevante delen:

```json
{
  "id": 12345,
  "name": "Material Atlas",
  "slug": "material-atlas",
  "on_sale": false,
  "prices": {
    "currency_code": "EUR",
    "currency_minor_unit": 2,
    "price": "4900",
    "regular_price": "4900",
    "sale_price": "",
    "md_price_ex_vat": "4495"
  },
  "featured": true,
  "channels": [
    { "id": 11, "name": "Architecture", "slug": "architecture" },
    { "id": 14, "name": "Materials", "slug": "materials" }
  ],
  "tags": [
    { "id": 201, "name": "new-releases", "slug": "new-releases" },
    { "id": 202, "name": "last-chance", "slug": "last-chance" }
  ]
}
```

## Mapping advies frontend

- `prices.md_price_ex_vat` -> parse minor units naar decimal EUR (`priceExVat`)
- `featured` -> badge op card/detail
- `channels` -> channel bar/pills + channel hubs
- `tags` -> keywords op detail + labels zoals `new-releases` en `last-chance`

## Open items (niet geblokkeerd door code, wel door content/config)

- WooCommerce data-inrichting:
  - product channels (`theme`) invullen op books
  - product tags (`new-releases`, `last-chance`) invullen
  - benodigde attributen/termen voor filter-UX (Authors, Format, ISBN, Number of pages, Year of Publishing, etc.)
- Payment-track (losstaand):
  - Stripe `payment_data` (sandbox)
  - gateways PayPal / Trustly / WERO

## Richting filter-implementatie

- Besluit: nieuwe books-filters via **Store API parameters**, niet via FacetWP.
- Houd nieuwe code FacetWP-vrij; behandel bestaande FacetWP code als legacy die gefaseerd uitgezet wordt.
