# Dashboard batch 3 — frontend handoff (Jeroen)

**Datum:** 1 juni 2026  
**Van:** Johan (WP plugin)  
**Voortgang:** Batch 1 ✅ live · Batch 2 ⏳ deploy · Batch 3 ⏳ deploy + test (code klaar in plugin)

Volledige contract-spec: [`dashboard-datacontract.md`](./dashboard-datacontract.md)  
Eerdere handoffs: [batch 1](./dashboard-handoff-batch1-jeroen.md) · [batch 2](./dashboard-handoff-batch2-jeroen.md)

---

## Kort

| Onderdeel | Status |
|---|---|
| WP batch 1 (profile, brand profile, materials list) | ✅ live & getest |
| WP batch 2 (portal, requests, interactions, lead-routing, statistics) | ⏳ deploy |
| WP batch 3 (reader panels + material form CRUD) | ⏳ deploy naar productie |
| Frontend `data.ts` | 🔜 nog mock voor batch 3 panelen |
| `/api/dashboard/*` proxy | 🔜 uitbreiden |

**Plugin-bestanden:** `rest-dashboard.php` + `rest-dashboard-batch2.php` + `rest-dashboard-batch3.php`

---

## Batch 3 — nieuwe endpoints

Basis: `https://materialdistrict.com/wp-json`  
Auth: `Authorization: Bearer <JWT>`  
Responses: **snake_case** (mapper → camelCase in frontend)

### Overzicht

| Methode | Route | `data.ts` | UI |
|---|---|---|---|
| `GET` | `/md/v2/dashboard/bookmarks` | `getBookmarks()` | `BookmarksPanel` |
| `DELETE` | `/md/v2/dashboard/bookmarks/{id}` | — | verwijderen in panel |
| `GET` | `/md/v2/dashboard/boards` | `getBoards()` | `BoardsPanel` _(Insider)_ |
| `POST` | `/md/v2/dashboard/boards` | — | nieuw board |
| `PATCH` | `/md/v2/dashboard/boards/{id}` | — | rename |
| `DELETE` | `/md/v2/dashboard/boards/{id}` | — | verwijderen |
| `GET` | `/md/v2/dashboard/saved-searches` | `getSavedSearches()` | `SavedSearchesPanel` _(Insider)_ |
| `POST` | `/md/v2/dashboard/saved-searches` | — | opslaan |
| `PATCH` | `/md/v2/dashboard/saved-searches/{id}` | — | naam/query/alerts |
| `DELETE` | `/md/v2/dashboard/saved-searches/{id}` | — | verwijderen |
| `GET` | `/md/v2/dashboard/insider-insights` | `getInsiderInsights()` | `InsiderInsightsPanel` _(Insider)_ |
| `GET` | `/md/v2/dashboard/invoices?scope=user` | `getInvoices()` | `InvoicesPanel` |
| `GET` | `/md/v2/dashboard/brands/{brandId}/materials/{id}` | — | material edit form |
| `POST` | `/md/v2/dashboard/brands/{brandId}/materials` | — | material create |
| `PATCH` | `/md/v2/dashboard/brands/{brandId}/materials/{id}` | — | material form save **of** status toggle |
| `DELETE` | `/md/v2/dashboard/brands/{brandId}/materials/{id}` | — | trash material |

**Niet in batch 3 (later):** bookmark **aanmaken** (public site), brand invoices, brand delete, brand candidates, featured placements.

---

## 1. Bookmarks (alle ingelogde users)

**`GET /md/v2/dashboard/bookmarks`**

Response: `BookmarkItem[]`:

```json
[
  {
    "id": "bm_abc123",
    "type": "materials",
    "title": "Oak veneer",
    "label": "Material",
    "href": "https://materialdistrict.com/materials/oak-veneer",
    "image_url": "https://…",
    "gradient": null,
    "saved_at": "2026-04-12T10:00:00+00:00"
  }
]
```

Opslag: usermeta `_md_dashboard_bookmarks` (array van records met `id`, `type`, `object_id`, `saved_at`).

**`DELETE /md/v2/dashboard/bookmarks/{id}`** → `204`

- Geen POST in v1 — bookmarks worden later vanaf de publieke site toegevoegd.
- Verwijderde/orphan targets (post bestaat niet meer) worden niet in GET getoond.

---

## 2. Boards _(Insider vereist)_

403 `md_dashboard_insider_required` zonder actieve Insider membership.

**`GET /md/v2/dashboard/boards`**

```json
[
  {
    "id": "b_xyz789",
    "name": "Office project",
    "created_at": "2026-05-01T12:00:00+00:00",
    "material_count": 0,
    "article_count": 0,
    "cover_gradient": "linear-gradient(135deg,#d7e8b6,#eef6ff)"
  }
]
```

**`POST /md/v2/dashboard/boards`** — body `{ "name": "…" }` → `Board`

**`PATCH /md/v2/dashboard/boards/{id}`** — body `{ "name": "…" }` → `Board`

**`DELETE /md/v2/dashboard/boards/{id}`** → `204`

Opslag: usermeta `_md_dashboard_boards`. Items toevoegen aan boards (material/article ids) komt in een latere batch.

---

## 3. Saved searches _(Insider vereist)_

**`GET /md/v2/dashboard/saved-searches`**

```json
[
  {
    "id": "s_def456",
    "name": "Acoustic panels",
    "summary": "S: acoustic · Category: panels",
    "query": "s=acoustic&category=panels",
    "result_count": 42,
    "alerts_enabled": false,
    "created_at": "2026-05-10T08:00:00+00:00"
  }
]
```

**`POST /md/v2/dashboard/saved-searches`**

Body:

```json
{
  "name": "Acoustic panels",
  "query": "s=acoustic",
  "alerts_enabled": false
}
```

**`PATCH /md/v2/dashboard/saved-searches/{id}`** — `name`, `query`, `alerts_enabled` (optioneel)

**`DELETE /md/v2/dashboard/saved-searches/{id}`** → `204`

`result_count` wordt bij POST/PATCH opnieuw berekend (best-effort WP_Query op `material`).

---

## 4. Insider insights _(Insider vereist)_

**`GET /md/v2/dashboard/insider-insights`**

Response: `InsightReport[]` uit gepubliceerde `article` posts met meta `_article_insider_only = true`:

```json
[
  {
    "id": "12345",
    "title": "Trend report Q2",
    "summary": "…",
    "date": "2026-04-01",
    "category": "Article",
    "href": "https://materialdistrict.com/articles/trend-report-q2"
  }
]
```

---

## 5. Invoices (persoonlijk)

**`GET /md/v2/dashboard/invoices?scope=user`**

Response: `Invoice[]` via Stripe API (`stripe_customer_id` usermeta):

```json
[
  {
    "id": "in_…",
    "date": "2026-03-15",
    "description": "Insider membership",
    "amount": 99.0,
    "currency": "EUR",
    "status": "paid",
    "pdf_url": "https://pay.stripe.com/…"
  }
]
```

Lege array als geen Stripe customer of geen invoices. Brand-scope invoices (`/brands/{id}/invoices`) volgen later.

---

## 6. Material form CRUD (brand manager)

Slug → `brandId` via `user.brands[]` (zelfde als batch 1).

### GET form

**`GET /md/v2/dashboard/brands/{brandId}/materials/{materialId}`**

```json
{
  "mode": "edit",
  "id": 133915,
  "name": "Material name",
  "description": "…",
  "type": "Wood",
  "featured_image": { "id": "123", "name": "thumb.jpg", "url": "https://…" },
  "categories": [{ "id": "456", "l1": "…", "l2": "…", "l3": "…" }],
  "channels": ["Biobased"],
  "gallery": [{ "id": "124", "name": "…", "url": "https://…" }],
  "videos": ["https://vimeo.com/…"],
  "downloads": [{ "id": "125", "name": "spec.pdf", "url": "https://…" }],
  "keywords": ["acoustic"]
}
```

### Create

**`POST /md/v2/dashboard/brands/{brandId}/materials`**

Body (snake_case, zelfde velden als PATCH form):

```json
{
  "name": "New material",
  "description": "…",
  "type": "Wood",
  "featured_image_id": 12345,
  "gallery_attachment_ids": [12346],
  "download_attachment_ids": [12348],
  "videos": ["https://…"],
  "keywords": ["tag"],
  "categories": [{ "id": "456" }],
  "channels": ["Biobased"]
}
```

Response: `MaterialFormData` met `mode: "edit"` en `id` gezet (draft post).

### Form save (PATCH)

**`PATCH /md/v2/dashboard/brands/{brandId}/materials/{materialId}`**

- Body met **formvelden** (zie hierboven) → retourneert `MaterialFormData`
- Body met **alleen** `{ "status": "online"|"offline"|"draft" }` → retourneert `MaterialListRow` (batch 1 gedrag)

Dispatch-logica: als één van `name`, `description`, `type`, `featured_image_id`, `gallery_attachment_ids`, `download_attachment_ids`, `videos`, `keywords`, `categories`, `channels` aanwezig is → form save; anders status toggle.

### Delete

**`DELETE /md/v2/dashboard/brands/{brandId}/materials/{materialId}`** → `204` (wp_trash_post)

### Tier gates (form save)

| Veld | Minimale brand tier |
|---|---|
| `videos`, `download_attachment_ids` | Basis+ |
| `keywords` (niet-leeg) | Plus+ |

403 `md_dashboard_forbidden` bij overschrijding.

### Uploads

Assets uploaden via **`POST /wp/v2/media`** (JWT). Form stuurt attachment-id's; WP controleert dat de user de attachment mag gebruiken (`post_author` of `edit_others_posts`).

### WP meta keys (nieuw/gewijzigd)

| Key | Doel |
|---|---|
| `_material_dashboard_keywords` | keywords array |
| `_material_dashboard_videos` | video URL array |
| `_material_download_attachment_ids` | download attachment ids |
| `_material_dashboard_type` | form “type” string |

Bestaande keys: `gallery`, `_material_brand`, featured image (thumbnail), `material_category` + `sector` taxonomies.

---

## Frontend acties (suggestie)

1. **Mappers** in `src/lib/dashboard/` voor snake_case → types in `dashboard.ts`
2. **`data.ts` functies:**
   - `getBookmarks()`, `getBoards()`, `getSavedSearches()`, `getInsiderInsights()`, `getInvoices()`
   - Material form: fetch/create/save/delete via brand slug → id
3. **`/api/dashboard/*` proxy routes** voor POST/PATCH/DELETE
4. **Material edit page:** vervang mock door GET form + PATCH save; uploads → `/wp/v2/media` of proxy
5. **PATCH materials list:** blijft `{ status }` only → `MaterialListRow` (batch 1)

---

## Test curls (na deploy batch 3)

```bash
TOKEN="…"

# Bookmarks (leeg tot usermeta gevuld)
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/bookmarks'

# Boards (Insider vereist)
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/boards'

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test board"}' \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/boards'

# Saved searches
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","query":"s=wood","alerts_enabled":false}' \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/saved-searches'

# Insider insights
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/insider-insights'

# Invoices
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/invoices?scope=user'

# Material form GET (brand 3576, material 133915)
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials/133915'

# Material form PATCH (naam wijzigen)
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated name"}' \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials/133915'

# Status toggle (batch 1 — ongewijzigd gedrag)
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"offline"}' \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials/133915'

# Material create
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Draft material"}' \
  'https://materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials'
```

---

## Randgevallen

1. **Bookmarks zonder POST** — panel kan leeg blijven tot public-site bookmark flow live is.
2. **Insider 403** — boards, saved searches, insider insights vereisen actieve Insider (`/auth/me` → `membership.isInsider`).
3. **Material PATCH dispatch** — `{ "status": "draft", "name": "x" }` triggert form save (niet status toggle) omdat `name` aanwezig is.
4. **Free tier + downloads/videos/keywords** — 403 op form save; lege keywords op free tier is OK (meta wordt gewist).
5. **Invoices** — afhankelijk van Stripe customer; geen WooCommerce in plugin.

---

## Referenties

| Bestand | Doel |
|---|---|
| [`docs/dashboard-datacontract.md`](./dashboard-datacontract.md) | Volledig contract |
| Plugin: `rest-dashboard-batch3.php` | Batch 3 implementatie |
| Plugin: `rest-dashboard.php` | PATCH dispatcher material |

Vragen → mail Johan.
