# Notitie — toekomst: WooCommerce events in analytics

**Datum:** 6 augustus 2026  
**Status:** backlog / wens voor latere sprint  
**Context:** na livegang van de WP-admin Analytics Events viewer (`docs/note-admin-analytics-events-viewer.md`)

---

## Observatie (6 aug 2026)

In de AWS event stream vielen (nog) weinig of geen voorbeelden op van:

- `sample_request_started` / `sample_request_sent`
- `info_request_started` / `info_request_sent`
- `insider_teaser_clicked`

Dat kan normaal zijn kort na cutover (weinig traffic op die flows), of wijzen op ontbrekende instrumentation / consent / routing. Los monitoren via **Analytics → presets / event type filters**.

---

## Wens: WooCommerce commerce events

Voor de bookshop (`/book/` + Store API checkout) is het later handig om **WooCommerce-achtige funnel-events** ook in de AWS analytics-pipeline (`mda_events`) te loggen — zelfde contract als bestaande types, **geen** opslag in de WordPress content-DB.

### Voorgestelde event types (nieuw, whitelist sync WP + ingest Lambda)

| Event type | Moment | Nuttig voor |
|------------|--------|-------------|
| `cart_item_added` (of `add_to_cart`) | Add to cart (boek / product) | Funnel top |
| `checkout_started` | Start checkout (cart → checkout / Store API checkout begin) | Drop-off diagnose |
| `checkout_completed` | Order geplaatst / payment success | Conversie |

Optioneel later:

- `cart_viewed`
- `checkout_payment_failed`
- `order_refunded` (server-side)

### Payload-richting (attributes)

Minimaal, privacy-bewust:

- `product_id` / `product_sku` / `product_slug`
- `quantity`, `currency`, `value` (ex-btw of incl. — vastleggen in contract)
- `order_id` alleen bij `checkout_completed` (geen volledige PII in attributes)
- `source`: bijv. `store_api`, `next_checkout`

`object_type`: bij voorkeur `book` (of `product` als generiek); afstemmen met bestaande `book_viewed`.

### Implementatieplekken (later)

1. **Whitelist:** `includes/md-analytics-events.php` + `aws/md-analytics-ingest/index.mjs`
2. **Frontend:** cart/checkout client (`logEvent`) en/of order-confirmation
3. **Server fallback:** WP/Woo hooks of Store API-side als client-beacon mist (adblock / consent)
4. **Admin viewer:** werkt automatisch zodra events binnenkomen (filter op nieuwe types)

### Explicit niet nu

- Geen commerce events bouwen in deze MVP-viewer-sprint
- Geen dual-write naar WP tables
- Atlas / business dashboard blijft aparte fase

---

## Referenties

- Analytics viewer: [`note-admin-analytics-events-viewer.md`](./note-admin-analytics-events-viewer.md)
- Event contract / pipeline: [`analytics-database.md`](./analytics-database.md)
- Live shop: `https://materialdistrict.com/book/`
