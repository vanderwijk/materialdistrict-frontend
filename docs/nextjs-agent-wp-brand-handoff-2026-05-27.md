# Next.js agent handoff: WordPress brand/material REST contract

Date: 2026-05-27
Status: production verified
Audience: agent working on the Next.js content layer and brand/material pages

## Purpose

This document describes the WordPress-side changes that are now live on `materialdistrict.com` and gives concrete instructions for how the Next.js app should consume them.

Use this as the source of truth for session 7 follow-up and session 8 brand-page work.

## What changed on the WordPress side

The WordPress plugin now exposes a stable normalized contract for material-brand relations, while keeping existing raw underscore fields available.

### 1. Material endpoint now includes normalized brand relation fields

Endpoint:
- `GET /wp-json/wp/v2/material/<id>`
- `GET /wp-json/wp/v2/material?slug=<slug>`
- `GET /wp-json/wp/v2/material?...` collections

New normalized fields under `meta`:
- `brand_id`: `number | null`
- `brand_slug`: `string | null`
- `brand_name`: `string | null` — linked brand `post_title`; avoids a second REST call on material detail
- `brand_country`: `null | { code: string, label: string }`

Existing raw fields remain available, including:
- `_material_brand`
- `_material_code`

Verified live example:

```json
{
  "id": 136538,
  "slug": "obro-leather-infused-translucent-pvc-composite",
  "meta": {
    "material_code": "PLA1498",
    "brand_id": 136537,
    "brand_slug": "okunote",
    "brand_name": "Okunote",
    "brand_country": {
      "code": "JP",
      "label": "Japan"
    },
    "_material_brand": "136537",
    "_material_code": "PLA1498"
  }
}
```

### 2. Brand endpoint now includes normalized public fields and raw underscore fields

Endpoints:
- `GET /wp-json/wp/v2/brand/<id>`
- `GET /wp-json/wp/v2/brand?slug=<slug>`
- `GET /wp-json/wp/v2/brand?...` collections

Normalized fields under `meta`:
- `featured`: `boolean`
- `partner`: `boolean`
- `country`: `string | null`
  - current behavior: country code, for example `JP`
- `country_detail`: `null | { code: string, label: string }`
- `website`: `string | null`
- `contact_email`: `string | null`
- `socials`: object with nullable strings
  - `facebook`
  - `instagram`
  - `linkedin`
  - `twitter`
  - `youtube`
- `material_count`: `number`
- `channels`: `Array<{ id: number, slug: string, label: string }>` — from WP taxonomy `sector` (URL slug `channel`); same shape as on material/article
- existing normalized fields from before remain live too:
  - `membership`
  - `city`
  - `address`
  - `founded`
  - `employees`
  - `primary_user_id`

Raw underscore fields now also exist on the brand response:
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

Verified live example:

```json
{
  "id": 136537,
  "slug": "okunote",
  "meta": {
    "featured": false,
    "partner": false,
    "country": "JP",
    "country_detail": {
      "code": "JP",
      "label": "Japan"
    },
    "website": "https://www.behance.net/okunote",
    "contact_email": "shimizu@okunote.tokyo",
    "socials": {
      "facebook": null,
      "instagram": null,
      "linkedin": null,
      "twitter": null,
      "youtube": null
    },
    "material_count": 1,
    "_partner": "false",
    "_featured": "false",
    "_brand_country": "JP",
    "_brand_website": "https://www.behance.net/okunote",
    "_brand_email": "shimizu@okunote.tokyo",
    "_brand_facebook": null,
    "_brand_instagram": null,
    "_brand_linkedin": null,
    "_brand_twitter": null,
    "_brand_youtube": null
  }
}
```

### 3. Material collection endpoint now supports code-based filtering by brand

Endpoint:
- `GET /wp-json/wp/v2/material?brand_id=<brandId>&exclude=<currentMaterialId>&per_page=5&orderby=date&order=desc`

This is the replacement for the old FacetWP-based approach in `MoreFromBrand`.

It is not a replacement for FacetWP in the broader materials filtering experience.
FacetWP remains the filtering mechanism for the main materials overview and related filtering flows handled elsewhere in the project.

Verified live example:

```http
GET /wp-json/wp/v2/material?brand_id=135550&exclude=135615&per_page=5&orderby=date&order=desc
```

Live result includes other materials from the same brand with correct normalized fields:

```json
[
  {
    "id": 135603,
    "slug": "wall-date-textile-from-date-palm-leaf-waste",
    "meta": {
      "brand_id": 135550,
      "brand_slug": "parali-by-aarushi",
      "brand_country": {
        "code": "IN",
        "label": "India"
      },
      "_material_brand": "135550"
    }
  }
]
```

### 4. Brand slug lookup remains standard WordPress REST

Endpoint:
- `GET /wp-json/wp/v2/brand?slug=<slug>`

Verified live example:
- `GET /wp-json/wp/v2/brand?slug=okunote`

### 5. Brand gallery behavior is unchanged

Use standard media attachments:
- primary image/logo/hero: `featured_media` on the brand post
- gallery images: `GET /wp-json/wp/v2/media?parent=<brand_id>&per_page=100`

No custom gallery endpoint was added.

## Instructions for the Next.js agent

## 1. Use normalized fields as the canonical contract

For new frontend logic, prefer the normalized fields.

Do not use raw underscore fields as the primary source for UI rendering.
Only use them as temporary fallback or debugging data if you explicitly need rollout tolerance.

Canonical material fields:
- `meta.brand_id`
- `meta.brand_slug`
- `meta.brand_country`
- `meta.material_code`

Canonical brand fields:
- `meta.featured`
- `meta.partner`
- `meta.country`
- `meta.country_detail`
- `meta.website`
- `meta.contact_email`
- `meta.socials`
- `meta.material_count`

## 2. Update the raw WP response types

Files likely involved:
- `src/lib/api/wordpress.ts`
- `src/types/brand.ts`
- `src/types/material.ts` if needed

### Material raw type should include

```ts
meta: {
  brand_id?: number
  brand_slug?: string | null
  brand_country?: { code: string; label: string } | null
  material_code?: string | null
  _material_brand?: string | null
  _material_code?: string | null
  ...
}
```

### Brand raw type should include normalized fields

Do not model brand REST as underscore-only anymore.
At minimum include:

```ts
meta: {
  featured?: boolean
  partner?: boolean
  country?: string | null
  country_detail?: { code: string; label: string } | null
  website?: string | null
  contact_email?: string | null
  socials?: {
    facebook?: string | null
    instagram?: string | null
    linkedin?: string | null
    twitter?: string | null
    youtube?: string | null
  } | null
  material_count?: number

  _partner?: string | null
  _featured?: string | null
  _brand_country?: string | null
  _brand_website?: string | null
  _brand_email?: string | null
  _brand_facebook?: string | null
  _brand_instagram?: string | null
  _brand_linkedin?: string | null
  _brand_twitter?: string | null
  _brand_youtube?: string | null
}
```

## 3. Update the brand mapper to prefer normalized fields

Files likely involved:
- `src/lib/api/mappers.ts`
- `src/types/brand.ts`

Current issue:
- the frontend brand mapper was originally written against raw underscore fields

Required change:
- switch the mapper to prefer normalized fields first
- keep raw underscore fallback only if you want a temporary guard during rollout

Recommended mapping logic:
- `country` display: `meta.country_detail?.label ?? null`
- `website`: `meta.website ?? null`
- `email`: `meta.contact_email ?? null`
- `partner`: `Boolean(meta.partner)`
- `featured`: `Boolean(meta.featured)`
- `socials.facebook`: `meta.socials?.facebook ?? null`
- `socials.instagram`: `meta.socials?.instagram ?? null`
- `socials.linkedin`: `meta.socials?.linkedin ?? null`
- `socials.twitter`: `meta.socials?.twitter ?? null`
- `socials.youtube`: `meta.socials?.youtube ?? null`
- `materialCount`: `meta.material_count ?? 0` if the domain model needs it

## 4. Update the material detail page to use the new material-brand fields

Files likely involved:
- `src/app/materials/[slug]/page.tsx`
- `src/app/materials/[slug]/_components/BrandInfoCard.tsx`
- any material-domain mapper/types used by the detail page

The current material detail page had TODOs for:
- clickable brand link under the title
- country in the meta row
- brand card link target
- country in the brand sidebar card

Required change:
- use `material.meta.brand_slug` for brand page links
- use `material.meta.brand_country?.label` for visible country text

Note:
- use `meta.brand_name` for the title under the material heading and in the sidebar brand card (no extra brand fetch required)
- do not assume `brand_country` always exists; render it conditionally

## 5. Implement MoreFromBrand through the new REST brand filter

Files likely involved:
- `src/app/materials/[slug]/_components/MoreFromBrand.tsx`
- `src/lib/api/content.ts`
- `src/lib/api/wordpress.ts` or the higher-level list function used by the component

Do not implement this specific component through FacetWP.

Important:
- this instruction applies only to `MoreFromBrand`
- FacetWP is still in use for the main material filtering experience and should remain untouched in this step

Use the normal WordPress material collection endpoint:

```http
GET /wp-json/wp/v2/material?brand_id=<brandId>&exclude=<currentMaterialId>&per_page=4&orderby=date&order=desc
```

Implementation guidance:
- fetch through the normal WordPress API layer, not through FacetWP
- pass `brand_id` from the current material
- pass `exclude` with the current material ID
- request `per_page=4`, then render up to 3 cards after any final filtering
- if zero items remain, render nothing or apply the fallback strategy you already planned separately

Why this is correct now:
- the WordPress REST API supports the relation query directly
- the live endpoint has been verified in production
- this gives `MoreFromBrand` a dedicated code-based data source without changing the broader FacetWP-based filtering architecture

## 6. Keep brand single-by-slug and gallery logic simple

For brand pages:
- brand content source: `GET /wp-json/wp/v2/brand?slug=<slug>`
- brand hero/gallery source: `GET /wp-json/wp/v2/media?parent=<brand_id>&per_page=100`

This matches the existing attachment strategy already used for materials.

## 7. Fields that are allowed to be empty

It is normal for some fields to be empty in production.
For example:
- social URLs such as Pinterest or YouTube may be missing
- website/contact info may be absent on some brands
- country may be absent on incomplete brand records

Frontend behavior should treat these as nullable optional fields, not as errors.

## Recommended implementation order in Next.js

1. Update raw REST response types in `wordpress.ts`
2. Update brand and material mappers to the normalized contract
3. Wire `brand_slug` and `brand_country.label` into the material detail page and sidebar brand card
4. Implement `MoreFromBrand` with the new `brand_id` collection query
5. Use `brand?slug=` and `media?parent=` for the brand detail page implementation

## Quick endpoint reference

### Material single

```http
GET /wp-json/wp/v2/material/<id>
```

Use for:
- material detail data
- `brand_id`
- `brand_slug`
- `brand_country`
- `material_code`

### Material collection by brand

```http
GET /wp-json/wp/v2/material?brand_id=<brandId>&exclude=<currentId>&per_page=4&orderby=date&order=desc
```

Use for:
- More from Brand

### Brand single by slug

```http
GET /wp-json/wp/v2/brand?slug=<slug>
```

Use for:
- `/brands/[slug]`

### Brand attachments

```http
GET /wp-json/wp/v2/media?parent=<brand_id>&per_page=100
```

Use for:
- brand gallery
- brand hero fallback/attachments list

## Final note for the Next.js agent

The WordPress side is live and verified.
You should now treat the normalized brand/material relation fields as the primary contract.
For `MoreFromBrand`, use the verified REST `brand_id` collection query instead of building that specific slice through FacetWP.
Do not change the separate FacetWP-based material filtering flows unless that is part of a different project step.
