# WordPress brand/material REST plan

Date: 2026-05-27
Status: agreed implementation plan
Scope: WordPress plugin changes only, plus handoff instructions for the Next.js agent

## Agreed decisions

1. All new public fields must be normalized.
2. All existing raw underscore meta fields must remain available in REST.
3. Country data should expose both the stored code and the resolved country label.
4. "More from Brand" must use a code-based solution, not FacetWP.
5. No Next.js code changes in this task, but the Next.js agent needs a clear contract and migration steps.

## Verified current state

### Live API

- `GET /wp-json/wp/v2/brand?slug=<slug>` already works.
- `GET /wp-json/wp/v2/brand/<id>` already returns normalized fields such as:
  - `featured`
  - `membership`
  - `country`
  - `city`
  - `address`
  - `website`
  - `contact_email`
  - `primary_user_id`
  - `material_count`
- `GET /wp-json/wp/v2/material/<id>` already returns normalized fields such as:
  - `brand_id`
  - `disable_sample_request`
  - `material_code`
  - `short_description`
  - `transport_weight`
  - `not_available`
  - `featured`
  - `commercial_material`
  - `publication_status`
  - `publication_valid_until`
  - `period_end_date`
  - `tags`
  - `channels`
  - `sustainability_flags`
- Live material responses do **not** yet include `brand_slug`.
- Live material responses do **not** yet include resolved brand country data.
- Generic REST collection filtering via `meta_key` and `meta_value` is currently not reliable for brand/material collections and should not be used as the public solution.

### Local plugin code

- Brand and material REST shaping lives in `materialdistrict-plugin/rest-post-meta.php`.
- The plugin already registers many raw underscore meta keys for REST.
- Brand REST already computes normalized fields, but the normalized shape is incomplete for session 8.
- The raw underscore keys for booleans are registered generically as strings; keep them, but do not rely on them as the normalized contract.

## Implementation plan

## 1. Keep the raw underscore fields public

File: `materialdistrict-plugin/rest-post-meta.php`

Keep the existing `register_post_meta()` exposure for the raw underscore fields so older consumers and debugging workflows keep working.

Do not remove or rename any existing raw fields such as:
- `_material_brand`
- `_brand_country`
- `_brand_website`
- `_brand_email`
- `_brand_facebook`
- `_brand_instagram`
- `_brand_linkedin`
- `_brand_twitter`
- `_brand_youtube`
- `_partner`
- `_featured`

Note:
- `_partner` and `_featured` can continue to exist as raw underscore values.
- The normalized contract should expose real booleans separately.

## 2. Add normalized brand-derived fields to material responses

File: `materialdistrict-plugin/rest-post-meta.php`
Function: `md_extend_material_rest_meta()`

Add the following normalized fields under `meta` on the material response:

- `brand_slug`: `string | null`
  - source: linked brand post slug
- `brand_country`: `object | null`
  - source: linked brand `_brand_country`
  - shape:

```json
{
  "code": "JP",
  "label": "Japan"
}
```

Rules:
- If no brand is linked: `brand_slug = null`, `brand_country = null`
- If a brand is linked but `_brand_country` is empty or invalid: `brand_country = null`
- Keep raw `_material_brand` and normalized `brand_id` untouched

Recommended implementation detail:
- Reuse a helper that resolves a brand post once and builds a small summary payload, instead of duplicating multiple `get_post_meta()` calls in several places.

## 3. Extend the normalized brand response without breaking the existing normalized fields

File: `materialdistrict-plugin/rest-post-meta.php`
Function: `md_extend_brand_rest_meta()`

Do not remove existing normalized fields already live.
Keep these as-is for compatibility:
- `featured`
- `membership`
- `country`
- `city`
- `address`
- `website`
- `founded`
- `employees`
- `contact_email`
- `primary_user_id`
- `material_count`

Add these normalized fields:

- `partner`: `boolean`
- `country_detail`: `object | null`
  - shape:

```json
{
  "code": "JP",
  "label": "Japan"
}
```

- `socials`: `object`
  - shape:

```json
{
  "facebook": null,
  "instagram": null,
  "linkedin": null,
  "twitter": null,
  "youtube": null
}
```

Normalization rules:
- `partner` must be a real boolean derived with the same truthy logic already used for `featured`
- `country` remains the existing string code for backward compatibility
- `country_detail` is the new self-describing normalized country payload for new consumers
- `socials` should always exist, with nullable string values per field

Why this shape:
- It keeps the current live `country` field stable
- It avoids a breaking change on the brand endpoint
- It gives the Next.js agent one clear normalized object to consume going forward

## 4. Add a code-based material collection filter for brand relations

Preferred solution: extend the existing core material collection endpoint
Endpoint:
- `GET /wp-json/wp/v2/material?brand_id=<id>&exclude=<current_id>&per_page=3&orderby=date&order=desc`

Files:
- `materialdistrict-plugin/rest-post-meta.php` or a new focused REST file if preferred

Hooks to use:
- `rest_material_collection_params`
- `rest_material_query`

Expected behavior:
- Accept `brand_id` as a public query parameter on the material collection
- Translate it to a query on `_material_brand`
- Respect existing WP collection params like `exclude`, `per_page`, `page`, `orderby`, `order`
- Return only published materials from that brand

Recommended query behavior for the related-materials use case:
- default order: `date desc`
- allow caller to pass `exclude=<current_material_id>`
- frontend can request `per_page=4`, then slice to 3 if needed

Reason for choosing this approach:
- It is code-based
- It avoids FacetWP
- It fits naturally into the existing REST client and current frontend API layer
- It is more reusable than a one-off custom endpoint

Fallback only if needed:
- A dedicated custom route such as `GET /wp-json/md/v2/materials/<slug>/related-by-brand`
- Use only if the collection hook approach proves too awkward

## 5. Add a shared country resolver helper

File: `materialdistrict-plugin/rest-post-meta.php` or a small helper file required from the plugin bootstrap
Supporting source: `materialdistrict-plugin/includes/countries.php`

Add a helper that turns a stored `_brand_country` code into:

```php
array(
	'code'  => 'JP',
	'label' => 'Japan',
)
```

Rules:
- Invalid, blank, or placeholder values return `null`
- The helper should not mutate the stored raw value
- The helper should be used by both:
  - `md_extend_material_rest_meta()`
  - `md_extend_brand_rest_meta()`

## 6. Keep brand gallery behavior unchanged

No special brand-gallery endpoint is needed.
The contract remains:
- `featured_media` on the brand post for the primary image/logo/hero
- `GET /wp-json/wp/v2/media?parent=<brand_id>` for gallery attachments

This is a verification item, not a new implementation slice.

## Recommended order of work

1. Add the shared country resolver helper.
2. Add `brand_slug` and `brand_country` to material REST.
3. Add `partner`, `country_detail`, and `socials` to brand REST.
4. Add `brand_id` filtering to the material collection endpoint.
5. Run live/local smoke tests.

## Smoke tests

### Material single

```bash
curl -s 'https://materialdistrict.com/wp-json/wp/v2/material/<id>' | jq '.meta'
```

Expected new fields:

```json
{
  "brand_id": 136537,
  "brand_slug": "okunote",
  "brand_country": {
    "code": "JP",
    "label": "Japan"
  }
}
```

For a material without a linked brand:

```json
{
  "brand_id": 0,
  "brand_slug": null,
  "brand_country": null
}
```

### Brand single

```bash
curl -s 'https://materialdistrict.com/wp-json/wp/v2/brand/<id>' | jq '.meta'
```

Expected additions without removing existing fields:

```json
{
  "featured": false,
  "partner": false,
  "country": "JP",
  "country_detail": {
    "code": "JP",
    "label": "Japan"
  },
  "socials": {
    "facebook": null,
    "instagram": null,
    "linkedin": null,
    "twitter": null,
    "youtube": null
  }
}
```

### Material collection filtered by brand

```bash
curl -s 'https://materialdistrict.com/wp-json/wp/v2/material?brand_id=136537&exclude=136538&per_page=3&orderby=date&order=desc' | jq 'map({id,slug,brand_id:(.meta.brand_id // null)})'
```

Expected:
- only materials whose linked `_material_brand` is `136537`
- excluded material is absent

## Instructions for the Next.js agent

Do not make WordPress assumptions that are no longer true.

### Material detail page changes needed after WP work is live

Replace the current TODO usage on the material detail page with the new normalized material fields:
- use `meta.brand_slug` for brand links
- use `meta.brand_country.label` for display text
- use `meta.brand_country.code` only if needed for badges or metadata

This should remove the current hardcoded null placeholders for the brand card and meta row.

### Brand page mapper changes needed

The brand mapper currently assumes raw underscore fields.
Move it to the normalized contract first, while still tolerating raw underscore fields as a temporary fallback.

Preferred normalized reads:
- `meta.partner`
- `meta.featured`
- `meta.country_detail.label`
- `meta.website`
- `meta.contact_email`
- `meta.socials.facebook`
- `meta.socials.instagram`
- `meta.socials.linkedin`
- `meta.socials.twitter`
- `meta.socials.youtube`
- `meta.material_count`

Temporary fallback reads only if needed during rollout:
- `_partner`
- `_featured`
- `_brand_country`
- `_brand_website`
- `_brand_email`
- `_brand_facebook`
- `_brand_instagram`
- `_brand_linkedin`
- `_brand_twitter`
- `_brand_youtube`

### More from Brand changes needed

Do not use FacetWP for this component.
Use the normal material collection endpoint with the new `brand_id` filter.

Target request shape:

```ts
GET /wp-json/wp/v2/material?brand_id=<brandId>&exclude=<currentMaterialId>&per_page=4&orderby=date&order=desc
```

Frontend behavior:
- fetch via the existing WordPress material list layer, not FacetWP
- exclude the current material in the request
- render up to 3 remaining cards
- if zero related items remain, render nothing or follow the frontend fallback strategy already planned elsewhere

### Important compatibility note

The Next.js agent should treat the normalized fields as the canonical contract.
The raw underscore fields should remain available for debugging and temporary fallback only.

## Not included in this task

- No Next.js code changes
- No FacetWP configuration
- No custom brand gallery endpoint
- No generic `meta_key/meta_value` filtering contract for public use
