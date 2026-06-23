# Dashboard batch 4 — frontend handoff (Jeroen)

**Datum:** 2 juni 2026  
**Van:** Johan (WP plugin)  
**Voortgang:** Batches 1–3 ✅ live · Batch 4 ⏳ deploy + test

Contract: [`dashboard-datacontract.md`](./dashboard-datacontract.md)  
Wiring: [`dashboard-batch2-wiring.md`](./dashboard-batch2-wiring.md)

---

## Kort

| Endpoint | Status |
|---|---|
| `GET …/brands/{id}/featured` | ⏳ deploy |
| `GET …/brands/{id}/invoices` | ⏳ deploy |
| `DELETE …/brands/{id}` | ⏳ deploy |
| `GET …/brand-candidates?q=` | ⏳ deploy |
| `POST …/brands/claim` | ⏳ deploy |
| `POST …/brands/request-new` | ⏳ deploy |

**Plugin:** `rest-dashboard-batch4.php`

---

## 1. Featured placements _(Partner+)_

**`GET /md/v2/dashboard/brands/{brandId}/featured`**

403 `md_dashboard_forbidden` op tier lager dan Partner.

Response: `FeaturedPlacement[]` — catalogus merged met brand meta `_brand_dashboard_featured_placements`:

```json
[
  {
    "id": "homepage_hero",
    "slot": "Homepage hero",
    "status": "available",
    "starts_at": null,
    "ends_at": null,
    "subject": null
  }
]
```

Default slots (filter `md_dashboard_featured_slot_catalog`):

- `homepage_hero` — Homepage hero  
- `category_facade` — Category top — Facade  
- `newsletter_feature` — Newsletter feature  

Boeken blijft **WooCommerce/upsell** — geen dashboard POST. Admin/Woo vult meta `_brand_dashboard_featured_placements` per slot:

```json
{
  "homepage_hero": {
    "status": "active",
    "starts_at": "2026-04-01",
    "ends_at": "2026-04-30",
    "subject": "Acoustic wood panel"
  }
}
```

---

## 2. Brand invoices

**`GET /md/v2/dashboard/brands/{brandId}/invoices`**

Zelfde shape als user invoices (`Invoice[]`). Leest `_brand_stripe_customer_id` op brand-post → Stripe invoices API. Lege array als geen customer.

Geen extra tier gate (managed brand vereist).

---

## 3. Delete brand

**`DELETE /md/v2/dashboard/brands/{brandId}`** → `204`

- Trash alle materials van brand (`md_brand_material_ids`)
- Trash brand post
- Verwijdert `connected_brand_id` meta bij alle gekoppelde users

Geen tier gate. **Onomkeerbaar** (WP trash — admin kan herstellen).

---

## 4. Add brand — candidates & claim

### Candidates

**`GET /md/v2/dashboard/brand-candidates?q=optional`**

Match op **e-maildomein** ingelogde user vs `_brand_email`, `_brand_contact_email`, `_brand_website`.

Sluit uit: brands die user al beheert, brands met andere `primary_user_id` / andere connected user.

```json
[
  {
    "id": 3576,
    "name": "Materia",
    "domain": "materia.nl",
    "website": "https://materia.nl",
    "email": "info@materia.nl",
    "logo_label": "MA"
  }
]
```

### Claim

**`POST /md/v2/dashboard/brands/claim`**

Body: `{ "brand_id": 3576 }` (accepteert ook `brandId`)

Response: `{ "status": "ok" }`

- Zelfde domain-regels als candidates
- Zet `_brand_primary_user_id` + `connected_brand_id` usermeta
- 403 als domain mismatch of al bezet door andere user

### Request new

**`POST /md/v2/dashboard/brands/request-new`**

Body:

```json
{
  "name": "New brand BV",
  "website": "https://example.com",
  "email": "info@example.com",
  "message": "Optional note"
}
```

`name` verplicht. Response: `{ "status": "ok" }`

Opslag: usermeta `_md_dashboard_brand_requests` (pending). Hook: `md_dashboard_brand_request_created` — geen automatische brand-aanmaak in v1.

---

## Frontend wiring

| Paneel | Actie |
|---|---|
| `FeaturedPanel` | `getFeaturedPlacements` → GET featured |
| `InvoicesTable` (brand) | `getBrandInvoices` |
| `DeleteBrandPanel` | proxy DELETE + redirect `/dashboard/profile` + refresh auth |
| `AddBrandPanel` | candidates GET + claim POST + request-new POST |

Proxy routes nodig: DELETE brand, POST claim, POST request-new.

---

## Test curls

```bash
TOKEN="…"

curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brand-candidates?q=materia'

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"brand_id":3576}' \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/claim'

curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/invoices'

curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/featured'
# verwacht 403 op free/basic/plus tier
```

---

Vragen → mail Johan.
