# Taxonomies boven post meta (WordPress)

> Architectuurregel voor `materialdistrict-plugin` en alle nieuwe WP-ontwikkeling.

## Regel

Gebruik voor **classificatie en filtering** altijd een **native WordPress-taxonomy**
(`register_taxonomy`, `show_in_rest`, term-relaties in `wp_term_relationships`).
Gebruik **geen** `post_meta` als bron van waarheid voor zulke velden.

## Waarom

- **Query-performance:** `tax_query` op term-relaties is in WordPress veel
  performanter dan `meta_query` op `wp_postmeta` (geen full table scans op
  losse meta-keys, betere indexering via term tables).
- **Consistentie:** term-counts, REST-collectiefilters en admin-UI (checkboxes /
  kolommen) werken out-of-the-box.
- **Schaalbaarheid:** channels, story types, material categories en vergelijkbare
  facetten groeien mee met duizenden posts.

## Voorbeelden in MaterialDistrict

| Concept | Taxonomy | CPT / object |
|--------|----------|----------------|
| Story type (articles) | `story_type` | `article` |
| Channels | `theme` | materials, articles, events, talks, products |
| Material category | `material_category` | `material` |
| Event type | `event_type` | `event` |
| Product tags (books) | `product_tag` | WooCommerce `product` |

## Wat wél in post meta hoort

Post meta blijft geschikt voor **unieke, niet-gefacetete** velden per post, bv.:

- `_featured` (boolean flag op CPT)
- `_article_insider_only`, `_event_date_start`, ISBN-achtige product-attributen
- Stripe-/membership-IDs, publicatiestatus, eenmalige configuratie

Scheid altijd: **taxonomie = categorisering/filteren**, **meta = eigenschappen
van één record**.

## REST-conventie

Taxonomy-data wordt in REST primair geleverd via:

1. Het standaard taxonomy-veld op de post (`story_type: [term_id, …]`), en/of
2. Berekende velden in `meta.*` die uit `get_the_terms()` worden opgebouwd
   (bv. `meta.story_type` als `{id, slug, label}[]`, `meta._story_type` als
   platte slug voor de frontend-mapper).

Die `meta.*`-velden zijn **geen opslag** in `wp_postmeta`; ze zijn runtime
afgeleid in `rest_prepare_*` filters.

## Nieuwe features

Bij een nieuw filter- of navigatieveld:

1. Registreer een taxonomy (of hergebruik een bestaande).
2. Koppel met `register_taxonomy_for_object_type` waar nodig (bv. `theme` op
   `product`).
3. Filter collecties via `tax_query` (custom `rest_*_query` filter indien slugs
   nodig zijn i.p.v. term-IDs).
4. Documenteer de REST-shape in een handoff voor de frontend.

Geen nieuwe `_foo_type` meta-keys voor facetten.
