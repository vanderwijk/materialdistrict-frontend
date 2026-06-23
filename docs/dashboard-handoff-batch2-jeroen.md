# Dashboard batch 2 — frontend handoff (Jeroen)

**Datum:** 2 juni 2026  
**Van:** Johan (WP plugin)  
**Voortgang:** Batch 1 ✅ live op productie · Batch 2 ⏳ deploy + test (code klaar in plugin)

Volledige contract-spec: [`dashboard-datacontract.md`](./dashboard-datacontract.md)  
Batch 1 handoff: [`dashboard-handoff-batch1-jeroen.md`](./dashboard-handoff-batch1-jeroen.md)

---

## Kort

| Onderdeel | Status |
|---|---|
| WP batch 1 (profile, brand profile, materials) | ✅ live & getest |
| WP batch 2 (portal, requests, interactions, lead-routing, statistics) | ⏳ deploy naar productie |
| Frontend `data.ts` | 🔜 nog mock voor batch 2 panelen |
| `/api/dashboard/*` proxy | 🔜 uitbreiden voor PATCH/POST batch 2 |

**Plugin-bestanden:** `rest-dashboard.php` + `rest-dashboard-batch2.php`

---

## Batch 2 — nieuwe endpoints

Basis: `https://cms.materialdistrict.com/wp-json`  
Auth: `Authorization: Bearer <JWT>`

### Overzicht

| Methode | Route | `data.ts` | UI component |
|---|---|---|---|
| `GET` | `/md/v2/dashboard/membership/portal` | — (client redirect) | `ReaderMembershipPanel` → “Manage billing” |
| `GET` | `/md/v2/dashboard/requests` | `getMyRequests()` | `RequestsPanel` |
| `GET` | `/md/v2/dashboard/brands/{brandId}/interactions` | `getInteractions(slug)` | `InteractionsPanel` |
| `PATCH` | `/md/v2/dashboard/brands/{brandId}/interactions/{id}` | — | status update (nog niet in UI) |
| `GET` | `/md/v2/dashboard/brands/{brandId}/lead-routing` | `getLeadRouting(slug)` | `LeadRoutingPanel` |
| `POST` | `/md/v2/dashboard/brands/{brandId}/lead-routing` | — | `LeadRoutingPanel.handleSave` |
| `GET` | `/md/v2/dashboard/brands/{brandId}/statistics` | `getBrandStatistics(slug)` | `StatisticsPanel` |

Slug → `brandId`: via `requireManagedBrand()` / `user.brands[]`.

---

## 1. Insider billing portal

**`GET /md/v2/dashboard/membership/portal`**

Response:

```json
{ "url": "https://billing.stripe.com/p/session/…" }
```

- Leest `stripe_customer_id` uit usermeta (zelfde als `/auth/me` → `membership.stripeCustomerId`).
- Maakt Stripe Customer Portal session aan.
- `return_url` → `{MD_FRONTEND_URL}/dashboard/membership`.

Fouten:

| HTTP | `code` | Wanneer |
|---|---|---|
| 503 | `md_dashboard_unavailable` | Geen Stripe customer / Stripe fout |
| 401 | `md_auth_unauthenticated` | Geen JWT |

**Frontend-suggestie:** vervang de hardcoded link `/dashboard/membership/manage` in `ReaderMembershipPanel` door:

1. Client click → `GET /api/dashboard/membership/portal` (proxy)
2. `window.location.href = data.url`

Geen apart dashboard-GET voor membership **lezen** — blijft `/auth/me`.

---

## 2. My requests (persoonlijk)

**`GET /md/v2/dashboard/requests`**

Response: `MyRequest[]` (snake_case):

```json
[
  {
    "id": "123",
    "kind": "contact",
    "subject": "Acoustic wood panel",
    "brand_name": "MaterialDistrict",
    "date": "2026-04-11",
    "status": "Sent",
    "message": "…"
  }
]
```

**Databron:** bestaande WordPress **`lead`** CPT-posts waar postmeta `user` = ingelogde user-id.

Mapper → `MyRequest` (`brandName`, camelCase).

`kind`: `sample` | `info` | `brochure` | `contact` — afgeleid van `_lead_type` meta (default `contact`).

---

## 3. Interactions (brand, inkomende leads)

**`GET /md/v2/dashboard/brands/{brandId}/interactions`**

Response: `Interaction[]`:

```json
{
  "id": 123,
  "type": "request",
  "page": "Acoustic wood panel",
  "person": "Eva Jansen",
  "role": "Designer",
  "industry": "",
  "company": "Studio EVA",
  "email": "eva@example.com",
  "phone": "+31 …",
  "address": "…",
  "postcode": "…",
  "city": "…",
  "country": "Netherlands",
  "date": "2026-04-12",
  "time_ago": "2 hours ago",
  "status": "Request",
  "message": "…",
  "request_options": ["Call me", "Send me a sample"]
}
```

**Databron:** `lead` CPT waar postmeta `brand` = `{brandId}`. Contactvelden komen uit het gekoppelde WP-userprofiel; ontbrekende velden → lege string.

**`time_ago`:** server-side (`human_time_diff`), frontend toont alleen.

**`PATCH …/interactions/{id}`** body `{ "status": "Answered" }` → retourneert bijgewerkt `Interaction`.

- Status opgeslagen in postmeta `_lead_dashboard_status`.
- `InteractionsPanel` is nu read-only — PATCH is klaar voor latere status-dropdown.

---

## 4. Lead routing (Plus+)

**`GET/POST /md/v2/dashboard/brands/{brandId}/lead-routing`**

Tier-gate: **Plus of Partner** — anders `403 md_dashboard_forbidden`.  
(Free/basis: endpoint niet beschikbaar; UI gate't al via `BrandTierGate` / `tierMeets(tier, 'plus')`.)

GET/POST response shape:

```json
{
  "default_name": "MaterialDistrict",
  "default_email": "info@materialdistrict.com",
  "routes": [
    {
      "id": 1,
      "country": "Netherlands",
      "name": "Jeroen van Oostveen",
      "email": "nl@example.com"
    }
  ]
}
```

POST body (snake_case, subset allowed):

```json
{
  "default_name": "…",
  "default_email": "…",
  "routes": [
    { "country": "Netherlands", "name": "…", "email": "…@…" }
  ]
}
```

- **Default contact:** `_brand_email_samples` + `_brand_contact_name` (legacy WP velden).
- **Routes:** `_brand_lead_routing` repeater (zelfde structuur als legacy theme `page-leads.php`).
- `country` in response = **label** (bv. `"Netherlands"`); POST accepteert label of ISO-code.
- Route `id` is een **volgnummer** (1-based), geen persistent DB-id.

**UI:** `LeadRoutingPanel.handleSave` → `POST /api/dashboard/brands/{brandId}/lead-routing`.

---

## 5. Statistics (Basis+)

**`GET /md/v2/dashboard/brands/{brandId}/statistics`**

Tier-gate: **Basis/Plus/Partner** (`basic` in WP) — **free → 403**.

Response:

```json
{
  "metrics": [
    { "label": "Material views", "value": 4820, "note": null },
    { "label": "Material requests", "value": 36, "note": null },
    { "label": "Brochure downloads", "value": 58, "note": null },
    { "label": "Website clicks", "value": 912, "note": null }
  ],
  "materials": [
    {
      "material_id": 133915,
      "name": "Test material …",
      "views": 120,
      "requests": 3,
      "downloads": 0
    }
  ]
}
```

**Databron:** legacy statistics page logic — `post_views_count` op materialen, lead-counts per materiaal, brochure/website meta op brand.

- `note` is **`null`** in v1 (geen month-over-month yet).
- `downloads` per materiaal is **`0`** tot download-tracking per materiaal bestaat.
- Query param `?range=…` uit datacontract: **nog niet geïmplementeerd** — negeren of later.

Mapper → `BrandStatistics` (`materialId`, camelCase).

---

## Wat nog mock blijft (batch 3+)

| Paneel | Reden |
|---|---|
| Bookmarks | Geen WP-opslag yet — nieuwe usermeta nodig |
| Boards | idem |
| Saved searches | idem |
| Insider insights | idem / content CPT TBD |
| Invoices (user + brand) | WooCommerce/Stripe invoices TBD |
| Material form CRUD | Batch 3 |
| Featured, brand candidates, delete brand | Batch 3+ |

---

## Voorgestelde implementatiestappen (batch 2)

1. **Mappers uitbreiden** in `src/lib/dashboard/mappers.ts`:
   - `mapMyRequest`, `mapInteraction`, `mapLeadRoutingConfig`, `mapBrandStatistics`

2. **`data.ts` reads** (server-side, Bearer uit cookie):
   - `getMyRequests()`
   - `getInteractions(slug)`
   - `getLeadRouting(slug)` — verwacht 403 op free/basis; page gate't tier al
   - `getBrandStatistics(slug)` — verwacht 403 op free

3. **`/api/dashboard/*` routes toevoegen:**
   - `GET /api/dashboard/membership/portal`
   - `PATCH /api/dashboard/brands/[brandId]/interactions/[interactionId]`
   - `POST /api/dashboard/brands/[brandId]/lead-routing`

4. **Client wiring:**
   - `LeadRoutingPanel.handleSave` → POST proxy + `router.refresh()`
   - `ReaderMembershipPanel` → portal redirect i.p.v. `/dashboard/membership/manage`
   - Batch 1 stubs (`ProfileForm`, `BrandProfileForm`, `MaterialsPanel`) kunnen parallel

---

## Test curls (na deploy batch 2)

```bash
TOKEN="…"

# Billing portal (Insider + stripe_customer_id vereist)
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/membership/portal'

# Mijn requests
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/requests'

# Brand interactions
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/interactions'

# Statistics — verwacht 403 op free tier brand 3576
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/statistics'

# Lead routing — verwacht 403 op free tier brand 3576
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/lead-routing'

# Interaction status (PATCH + bestaand lead id)
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"Answered"}' \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/interactions/LEAD_ID'
```

---

## Randgevallen

1. **Lege lead-lijsten** zijn normaal — legacy site registreert niet elke contact-form als lead CPT; nieuwe headless get-in-touch flow moet leads gaan aanmaken (toekomstig).
2. **Oudere leads** hebben soms alleen `brand` + `material` + `user` meta — overige velden komen uit userprofiel of zijn leeg.
3. **Tier 403 vs 404:** verkeerde brand → 404; tier te laag → 403 (statistics, lead-routing).
4. **PATCH verplicht** — zonder `-X PATCH` krijg je `rest_no_route` (zelfde les als batch 1 materials).

---

## Referenties

| Bestand | Doel |
|---|---|
| [`docs/dashboard-datacontract.md`](./dashboard-datacontract.md) | Volledig contract |
| [`docs/dashboard-handoff-batch1-jeroen.md`](./dashboard-handoff-batch1-jeroen.md) | Batch 1 (profile, materials) |
| [`src/lib/dashboard/data.ts`](../src/lib/dashboard/data.ts) | Read seam |
| [`src/types/dashboard.ts`](../src/types/dashboard.ts) | Types |
| Plugin: `rest-dashboard-batch2.php` | Batch 2 implementatie |

Vragen → mail Johan.
