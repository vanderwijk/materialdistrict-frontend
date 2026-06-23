# Dashboard batch 1 — frontend handoff (Jeroen)

**Datum:** 2 juni 2026  
**Van:** Johan (WP plugin)  
**Status:** Batch 1 staat **live op productie** (`materialdistrict.com`). Frontend draait nog op mock.

Dit document beschrijft wat je kunt inpluggen in de Next.js frontend. Het volledige contract staat in [`dashboard-datacontract.md`](./dashboard-datacontract.md) (commit `e0462b0` op `main`).

---

## Kort

| Onderdeel | Status |
|---|---|
| WP endpoints batch 1 | ✅ live & getest op productie |
| Frontend `data.ts` | 🔜 nog mock |
| `/api/dashboard/*` proxy routes | 🔜 nog niet gebouwd |
| Form save + material toggle in UI | 🔜 stubs (`ProfileForm`, `BrandProfileForm`, `MaterialsPanel`) |

**Jouw scope:** mock vervangen door echte data in `src/lib/dashboard/data.ts`, dashboard-mappers toevoegen, `/api/dashboard/*` route handlers voor schrijfacties, en de TODO-stubs in de client components aansluiten.

---

## Architectuur (herhaling)

```
Dashboard page (RSC)
  → data.ts (getProfile, getBrandMaterials, …)
      → Server: wpFetch met Bearer uit HttpOnly cookie
      OF via /api/dashboard/* proxy

Client form / toggle
  → fetch('/api/dashboard/…')  (cookie automatisch mee)
      → Next route handler leest cookie → Bearer naar WP
```

- **Lezen:** Server Components mogen direct `wpFetch` doen met token uit `getAuthCookie()` (zelfde patroon als auth).
- **Schrijven:** Client components → `/api/dashboard/*` (cookie → Bearer), analoog aan `/api/auth/*`.
- **Eén naadlaag:** alleen `data.ts` + mappers wijzigen voor reads; components importeren nooit `mock.ts`.
- **Slug vs id:** routes in de UI zijn `/dashboard/brands/{slug}/…`. WP API gebruikt **numeriek `brandId`**. Map via `user.brands[]` / `requireManagedBrand()`.

---

## Batch 1 — live endpoints

Basis-URL: `https://cms.materialdistrict.com/wp-json`

Auth op alle calls: `Authorization: Bearer <JWT>`

### 1. User profile

| | |
|---|---|
| **Lezen** | `GET /md/v2/dashboard/profile` |
| **Schrijven** | `POST /md/v2/dashboard/profile` |
| **data.ts** | `getProfile()` |
| **UI** | `ProfileForm` → save stub regel 33–37 |

**Response (snake_case):**

```json
{
  "first_name": "Johan",
  "last_name": "van der Wijk",
  "email": "webmaster@materialdistrict.com",
  "profession": "Other",
  "company": "MaterialDistrict",
  "country": "Netherlands",
  "avatar_url": "https://…"
}
```

POST body: zelfde velden (snake_case). Retourneert het bijgewerkte object.  
Na save: `router.refresh()` zodat sidebar + `/auth/me` syncen.

**Mapper:** → `UserProfile` in `src/types/dashboard.ts` (`firstName`, `lastName`, …).

**Let op:** WP levert `country` als **label** (bv. `"Netherlands"`), niet ISO. Dat sluit aan bij de hardcoded `COUNTRIES` in `ProfileForm`.

---

### 2. Brand profile

| | |
|---|---|
| **Lezen** | `GET /md/v2/dashboard/brands/{brandId}/profile` |
| **Schrijven** | `POST /md/v2/dashboard/brands/{brandId}/profile` |
| **data.ts** | `getBrandProfile(slug)` |
| **UI** | `BrandProfileForm` → save stub |

**Slug → id:** `const brand = findBrandMembership(user, { slug })` → `brand.id` (numeriek).

**Response (productie-voorbeeld brand 3576):**

```json
{
  "brand_id": 3576,
  "slug": "materia",
  "brand_name": "MaterialDistrict",
  "description": "",
  "website": "http://www.materialdistrict.com",
  "email": "info@materialdistrict.com",
  "phone": "+31 547 855599",
  "country": "Netherlands",
  "address": "Vonderweg 36d",
  "postcode": "7468 DC",
  "city": "Enter",
  "vat_number": "",
  "chamber_number": "",
  "social": {
    "twitter": "",
    "instagram": "",
    "linkedin": "",
    "youtube": "",
    "pinterest": "",
    "facebook": ""
  },
  "logo_url": null,
  "logo_name": null,
  "channels": [],
  "keywords": []
}
```

POST body: subset van bovenstaande velden; `brand_id` / `slug` hoeven niet mee.  
**Keywords:** server enforced **Plus/Partner** — anders `403 md_dashboard_forbidden`.  
**Channels:** array van sector-labels; WP koppelt `sector`-taxonomy.

**Nog geen logo-upload via dashboard** — `logo_url` komt uit featured image (read-only in batch 1).

---

### 3. Brand materials (lijst + status toggle)

| | |
|---|---|
| **Lezen** | `GET /md/v2/dashboard/brands/{brandId}/materials` |
| **Status** | `PATCH /md/v2/dashboard/brands/{brandId}/materials/{materialId}` |
| **data.ts** | `getBrandMaterials(slug)` |
| **UI** | `MaterialsPanel` → `toggleStatus()` is lokaal/optimistic stub |

**PATCH body:**

```json
{ "status": "online" | "offline" | "draft" }
```

**Response:** één `MaterialListRow` (snake_case):

```json
{
  "id": 133915,
  "name": "Test material …",
  "category": "Metals",
  "status": "online",
  "updated_at": "2026-06-02T09:51:35+00:00",
  "counts_against_quota": false
}
```

**Mapper:** → `MaterialListRow` (`countsAgainstQuota`, `updatedAt`, …).

**Quota in UI:** `requireManagedBrand()` levert al `brand.publicationQuota` en `brand.publicationsUsed` uit `/auth/me`. WP telt `publications_used` live (publish + `publication_status=member`). Na toggle: `router.refresh()` of optimistisch `used` bijwerken.

**Fout bij quota vol:** `409 md_dashboard_quota_exceeded`.

**Belangrijk — HTTP-methode:** PATCH is verplicht. Zonder `-X PATCH` krijg je `rest_no_route`.

---

## Nog mock (batch 2+)

Deze panelen hebben **geen** WP-endpoint yet — mock laten staan:

- Bookmarks, Boards, Saved searches, Insider insights  
- My requests, Invoices (user + brand)  
- Interactions, Statistics, Lead routing, Featured  
- Material form (create/edit), brand delete, brand candidates, membership portal  

Zie implementatiestatus-tabel onderaan [`dashboard-datacontract.md`](./dashboard-datacontract.md).

---

## Voorgestelde implementatiestappen

### Stap 1 — Dashboard fetch helper

Voeg in `src/lib/api/wordpress.ts` (of apart `dashboard.ts`) een helper analoog aan `wpAuthFetch`:

- Prefix: `/md/v2/dashboard/…`
- Bearer token verplicht
- Error envelope: `md_dashboard_*` + `md_auth_unauthenticated`
- `cache: 'no-store'`

### Stap 2 — Mappers

Nieuw bestand bv. `src/lib/dashboard/mappers.ts`:

```ts
mapUserProfile(raw)       // snake → UserProfile
mapBrandProfile(raw)      // snake → BrandProfile
mapMaterialListRow(raw)   // snake → MaterialListRow
mapMaterialListRows(raw[]) 
```

Veldnamen: zie tabel in `dashboard-datacontract.md` § “Veldnamen”.

### Stap 3 — `data.ts` reads

Voorbeeld flow `getBrandProfile(slug)`:

1. Server-side user ophalen (`getInitialUser()` of token uit cookie).
2. `findBrandMembership(user, { slug })` → `brandId`.
3. `wpDashboardFetch(`/md/v2/dashboard/brands/${brandId}/profile`, { bearer: token })`.
4. Mapper → `BrandProfile`.
5. On `404 md_dashboard_brand_not_found` → `null` (page roept al `notFound()` via `requireManagedBrand`).

Idem voor `getProfile()` en `getBrandMaterials(slug)`.

### Stap 4 — `/api/dashboard/*` routes

Minimaal voor batch 1:

| Route | Forward naar |
|---|---|
| `POST /api/dashboard/profile` | `POST /md/v2/dashboard/profile` |
| `POST /api/dashboard/brands/[brandId]/profile` | `POST …/brands/{id}/profile` |
| `PATCH /api/dashboard/brands/[brandId]/materials/[materialId]` | `PATCH …/materials/{id}` |

Patroon: kopieer structuur van `src/app/api/auth/me/route.ts` (cookie lezen, Bearer forward, errors doorgeven).

### Stap 5 — Client components

| Component | Actie |
|---|---|
| `ProfileForm.handleSave` | `POST /api/dashboard/profile` + `router.refresh()` |
| `BrandProfileForm.handleSave` | `POST /api/dashboard/brands/{brandId}/profile` |
| `MaterialsPanel.toggleStatus` | `PATCH /api/dashboard/brands/{brandId}/materials/{id}` + error toast bij 409 |

---

## Foutcodes (dashboard)

| HTTP | `code` | Wanneer |
|---|---|---|
| 401 | `md_auth_unauthenticated` | Geen/ongeldige JWT |
| 404 | `md_dashboard_brand_not_found` | Brand onbekend of niet beheerd |
| 403 | `md_dashboard_forbidden` | Tier te laag (bv. keywords) |
| 403 | `md_dashboard_insider_required` | Insider-only endpoint (later) |
| 400 | `md_dashboard_invalid_request` | Validatie / verkeerd material id |
| 409 | `md_dashboard_quota_exceeded` | Quota vol bij online zetten |
| 503 | `md_dashboard_unavailable` | Stripe portal e.d. (later) |

Brand-auth failures → altijd **404**, niet 403 (geen lek).

---

## Productie smoke tests (Johan, 2 jun 2026)

```bash
TOKEN="…"  # via POST /md/v2/auth/login

# Profile ✅
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/profile'

# Brand profile ✅ (id 3576, slug materia)
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/profile'

# Materials list ✅
curl -s -H "Authorization: Bearer $TOKEN" \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials'

# Status toggle ✅ — PATCH verplicht, juiste material id
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"online"}' \
  'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/3576/materials/133915'
```

---

## Bekende randgevallen

1. **`/dashboard/brands` zonder slug → 404** — geen index route; sidebar linkt naar eerste brand.
2. **Mock slugs** `materialdistrict` / `second-brand` werken alleen op mock — echte test-slugs o.a. `materia`, `test`, `a-matter-of-fruit` (zie `/auth/me` → `connected_brands[]`).
3. **Nieuwe manufacturer brands** kunnen lege slug hebben (draft) → brand profile page 404 tot slug gezet is.
4. **`counts_against_quota: false`** op free-tier legacy materialen — online zetten telt niet tegen quota.
5. **Membership panelen** blijven op `/auth/me` — geen dashboard-GET nodig voor read.

---

## Referenties in de repo

| Bestand | Doel |
|---|---|
| [`docs/dashboard-datacontract.md`](./dashboard-datacontract.md) | Volledig endpoint-contract |
| [`src/types/dashboard.ts`](../src/types/dashboard.ts) | TypeScript interfaces |
| [`src/lib/dashboard/data.ts`](../src/lib/dashboard/data.ts) | Enige read-seam (mock → WP) |
| [`src/lib/dashboard/brand-access.ts`](../src/lib/dashboard/brand-access.ts) | Slug-auth + tier/quota |
| [`src/lib/api/wordpress.ts`](../src/lib/api/wordpress.ts) | `wpAuthFetch` als voorbeeld |
| [`src/app/api/auth/me/route.ts`](../src/app/api/auth/me/route.ts) | Cookie → Bearer proxy patroon |

WP plugin: `materialdistrict-plugin/rest-dashboard.php` (batch 1).

---

## Vragen?

Mail Johan bij contract-afwijkingen of ontbrekende velden. Batch 2 endpoints volgen incrementeel; per endpoint alleen `data.ts` + eventueel één API route toevoegen.
