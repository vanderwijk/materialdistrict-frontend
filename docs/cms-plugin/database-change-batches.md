# Database change batches — implementation plan

**Based on:** database.md (19 mei 2026)
**Status:** Batch A done, Batch B done, Batch C done, Batch D done, Batch E done

---

## Summary by file

| File | What changes |
|---|---|
| `cpt-brand.php` | Add: `tier` (select), `tier_grandfathered` (select), `period_end_date` (date), `founded` (text), `employees` (select), `primary_user_id` (text/int) |
| `cpt-material.php` | Add: `publication_status` (select), `period_end_date` (date), sustainability boolean checkboxes (7 fields) |
| `cpt-article.php` | Add: `type` (select), `insider_only` (checkbox), `reading_time_minutes` (number) |
| `cpt-talk.php` | Add full meta box with: `date`, `duration_seconds`, `speaker` relation, `company_name`, `company_brand_id`, `insider_only` |
| `rest-post-meta.php` | Register all new brand/material/article/talk meta keys; extend all four `rest_prepare_*` filters; replace stub brand membership payload with real reader; add tag/channel resolution in material + article + talk mappers |
| `rest-user-meta.php` | Add `register_rest_field` for: `membership_status`, `billing_is_company`, `billing_company_name`, `billing_vat_number`, `billing_coc_number` |
| `rest-auth.php` | Replace `md_auth_membership_payload()` stub with real reader of `membership_status` user meta |
| `profile-fields.php` | Add display + save for billing fields (E1–E4) |
| New file `rest-material-neighbors.php` | `GET /md/v2/materials/{slug}/neighbors` endpoint |

---

## Batch A — Membership & publication statuses [done]

### A1–A3: Brand tier fields (`cpt-brand.php` + `rest-post-meta.php`)
- `cpt-brand.php` has no `tier`, `tier_grandfathered`, or `period_end_date` meta fields. Three new meta box fields need adding.
- `rest-post-meta.php` registers `_brand_*` meta keys but not these new ones. They need registering and the `md_extend_brand_rest_meta` filter currently only returns `featured` + the stub membership payload — it needs to return real tier data once the fields exist.
- `md_brand_membership_payload()` is a stub returning hardcoded `'free'`/`'inactive'`. This must be replaced with a real reader that fetches `tier`, `tier_grandfathered`, and `period_end_date` from post meta.

### A4–A5: Material publication status + period_end_date (`cpt-material.php` + `rest-post-meta.php`)
- Neither field exists anywhere. `cpt-material.php` needs a new meta box field for `publication_status` (ENUM select) and `period_end_date` (date).
- `rest-post-meta.php` must register and expose both through `md_extend_material_rest_meta`.

### A7–A8: User membership status + connected_brands enrichment (`rest-auth.php` + `rest-user-meta.php`)
- `md_auth_membership_payload()` in `rest-auth.php` is a stub. It needs to read `membership_status` from user meta and map to the Stripe-conform statuses (`inactive`, `active`, `trialing`, `past_due`, `canceled`). The meta key `membership_status` itself needs to be stored — likely by a separate Stripe webhook handler.
- `md_auth_connected_brands_payload()` already exists and correctly includes each brand's membership payload, which is currently stubbed. Once A1–A3 are done this auto-propagates.
- `rest-user-meta.php` doesn't expose `membership_status` — it needs a new `register_rest_field` entry for it.

---

## Batch B — Brand field enrichment [done]

### B1–B4: country, city, address, website
- **Already exist** as meta keys (`_brand_country`, `_brand_city`, `_brand_address`, `_brand_website`) and are registered in `rest-post-meta.php`.
- `md_extend_brand_rest_meta` does not pass them through to the REST response — only `featured` and `membership` are added. The filter needs extending to include these fields.

### B5: `brand.founded`
- Does not exist. New meta box field in `cpt-brand.php`, register in `rest-post-meta.php`, expose in `md_extend_brand_rest_meta`.

### B6: `brand.employees`
- Does not exist. New meta box field (ENUM select — bands) in `cpt-brand.php`, register in `rest-post-meta.php`, expose in `md_extend_brand_rest_meta`.

### B7: `brand.primary_user_id`
- Does not exist. New integer meta field in `cpt-brand.php` (user ID input), register in `rest-post-meta.php`, expose in `md_extend_brand_rest_meta`. Existing `_brand_email` stays as fallback.

### B8: `brand.material_count` (no DB column)
- Derived via `COUNT(*)` in the brand REST mapper. No new field needed — add to `md_extend_brand_rest_meta`.

---

## Batch C — Content-entiteit uitbreidingen (material + talks) [done]

### C1: `material.material_code`
- **Already exists** as `_material_code` and is already exposed in `md_extend_material_rest_meta`. No action needed.

### C2: Property groups (Sensorial / Technical / Environmental / Content)
- Properties exist as flat meta keys (e.g. `_material_glossiness_important`) but without group structure.
- Implemented in the plugin admin as grouped taxonomy-based dropdowns, following the structure in the theme edit flow.
- Uses existing material property taxonomies already present in WordPress, including environmental and content-composition taxonomies.

### C3: `material.videos[]`
- Implemented in `rest-post-meta.php` as array REST meta.
- Existing single-value `video_url` is still supported as backward-compatible fallback.

### C4: `material.brochures[]`
- Implemented in `rest-post-meta.php` as array REST meta.
- Existing `datasheet_url`, `epd_url`, and `product_url` values are still supported as backward-compatible fallback.
- Full repeater-style admin UI was not added in the plugin admin.

### C5: `material.tags[]` labels
- Implemented in `md_extend_material_rest_meta` with resolved `{id, slug, label}` objects.

### C6: `material.channels[]`
- Implemented in `md_extend_material_rest_meta` with resolved `{id, slug, label}` objects from the `sector` taxonomy.

### C7: Sustainability boolean flags
- Implemented via material property taxonomy resolution in the REST mapper.
- The frontend-facing sustainability booleans are derived from taxonomy terms rather than maintained as a separate editorial checkbox set.

### C8: prev/next neighbors endpoint
- Implemented in `rest-material-neighbors.php` as `GET /md/v2/materials/{slug}/neighbors`.

### C9: `talk.date`
- Implemented in `cpt-talk.php` and exposed in REST as `meta.date`.

### C10: `talk.duration_seconds`
- Implemented in `cpt-talk.php` and exposed in REST as `meta.duration_seconds`.

### C11: `talk.speakers[]`
- Implemented minimally via the existing `persons` taxonomy on `talk`.
- REST now exposes `speakers[]` with `{id, name, slug}`.
- `role` and `photo` are still not available because they are not modeled on the taxonomy terms yet.

### C12: `talk.company_name` + `talk.company_brand_id`
- Implemented using Option 3: `company_name` (string) + `company_brand_id` (nullable int).
- REST exposes both values plus a resolved `company_brand` summary when available.

### C13: `talk.channels[]`
- Implemented in the talk REST mapper as resolved taxonomy payloads for `channels` and `themes`.

### C14: `talk.insider_only`
- Implemented as talk meta with REST exposure as `meta.insider_only`.

---

## Batch D — Content-segmentatie

### D1: `article.type`
- Implemented as an article meta select field with values `news`, `process`, `people`, `projects`, `collaborations`.
- Exposed in REST as `meta.type`.

### D2: `article.insider_only`
- Implemented as an article meta checkbox and exposed in REST as `meta.insider_only`.

### D3: `article.channels[]`
- Implemented via the article REST mapper as `meta.channels` with `{id, slug, label}` objects from the `sector` taxonomy.

### D4: `article.reading_time_minutes`
- Implemented as an optional integer meta field and exposed in REST as `meta.reading_time_minutes`.

### D5: `article.related[]`
- Parked for now. Plan is to use SearchWP Related for article-related content instead of adding a custom plugin-side relation field or inference layer.

---

## Batch E — Personal account billing

### E1–E4: billing fields on user
- Implemented in `profile-fields.php` and `rest-user-meta.php`.
- Added profile form rows plus save handling for:
  - `billing_is_company` (boolean, default false)
  - `billing_company_name` (string, nullable)
  - `billing_vat_number` (string, nullable)
  - `billing_coc_number` (string, optional, nullable)
- Added REST exposure for all four fields with typed callbacks.
- VAT validation is format-only in v1; no live external verification.

### E5: VIES-validatie
- **Parked — not for v1.** Only store the field; no live validation.

---

## Open decisions (block implementation)

| Item | Decision needed from |
|---|---|
| A6: Mutual exclusion brand.tier ↔ material.publication_status — hard constraint or UI-only? | Johan |
| B6: `brand.employees` — exact number or bands? | Johan + opdrachtgever |
| C2: Property group naming convention (`prop_sensorial_*` etc.) — confirm field list | Johan + opdrachtgever |
| C11: `talk.speakers[]` — is relation currently 1:1 or N:N? | Johan |
| C12: `talk.company` — Option 1, 2, or 3? | Opdrachtgever + Johan |
| D1: `article.type` — are these the final 5 types? Taxonomy or ENUM? | Johan + opdrachtgever |
