# Dashboard datacontract (Fase 2)

Dit document beschrijft de endpoints die het dashboard nodig heeft. Het is
**afgeleid uit de mockup** (`MaterialDistrict_MockUp_DEF.html`, de
`renderDashboard`-panelen), niet andersom — de frontend is al tegen getypte
mock-data gebouwd, zodat Johans endpoints er achteraf inklikken zonder dat
componenten veranderen.

## Uitgangspunten

- **"WordPress rekent, frontend leest."** Alle afgeleide velden (quota,
  `isInsider`, statistiek-totalen, `timeAgo`) komen kant-en-klaar uit
  WordPress. De frontend herberekent niets.
- **camelCase domeintypes.** De interfaces hieronder staan in
  `src/types/dashboard.ts`. WordPress levert snake_case; de mapper-laag
  vertaalt (zoals bij de publieke frontend).
- **Eén naadlaag.** Alle data loopt via `src/lib/dashboard/data.ts`. Vandaag
  retourneert die de fixtures uit `mock.ts`; per endpoint wordt straks alleen
  daar de `return MOCK_*` vervangen door een `wpFetch(...)` + mapper.
- **Autorisatie.** De dashboard-layout gate't op ingelogd-zijn. Per-brand
  autorisatie gebeurt server-side via `findBrandMembership(user, { slug })`
  (`requireManagedBrand`). Endpoints moeten dit serverkant óók afdwingen:
  een gebruiker mag uitsluitend brands lezen/schrijven die in zijn
  `user.brands[]` staan.
- **Auth-header.** Alle endpoints draaien onder de bestaande JWT
  (`Authorization: Bearer <token>`), net als `/wp-json/md/v2/auth/*`.
- **Tier-poorten.** Welke panelen een brand mag gebruiken volgt uit
  `membership.ts` (`canManufacturerAccess`, `getMaterialLimit`). De frontend
  gate't de UI; het endpoint moet dezelfde regel serverkant afdwingen.

## Naamgeving & basis-URL

**Bevestigd (02-06-2026):**

- Basis: `/wp-json/md/v2/dashboard/…`
- Brand-endpoints: **numeriek `{brandId}`** in de URL (`/brands/{brandId}/…`)
- Frontend-routes: **slug** (`/dashboard/brands/{slug}/…`) — resolver mapt slug → id via `user.brands[]`
- Auth: **`Authorization: Bearer <JWT>`** (zelfde als `/auth/me`)
- Response-vorm: **kale JSON-body** (object of array), **geen** `{ data: … }`-wrapper
- Schrijven vanuit de frontend: server-side route-handlers onder `/api/dashboard/*` lezen de HttpOnly auth-cookie en forwarden Bearer naar WP (zelfde patroon als `/api/auth/*`)

---

## Transport & fouten

### Succes-responses

| Methode | Body |
|---|---|
| `GET` (enkel object) | Het object (bv. `UserProfile`, `BrandProfile`, `MaterialFormData`) |
| `GET` (lijst) | JSON-array |
| `POST` / `PATCH` | **Volledig bijgewerkt object** (zelfde shape als GET) — geen extra GET nodig na save |
| `DELETE` | **204** No Content, lege body |
| `POST …/claim` / `…/request-new` | `{ "status": "ok" }` (of vergelijkbaar kort ack) |

Material **create:** `POST …/materials` retourneert `MaterialFormData` met **`id` gezet** (`mode: 'edit'`).

### Fout-envelope

Zelfde patroon als auth/checkout:

```json
{
  "code": "md_dashboard_brand_not_found",
  "message": "Human-readable message.",
  "data": { "status": 404 }
}
```

| Situatie | HTTP | `code` |
|---|---|---|
| Geen / ongeldige JWT | 401 | `md_auth_unauthenticated` |
| Brand onbekend of niet beheerd door user | **404** | `md_dashboard_brand_not_found` |
| Tier te laag (Plus/Partner/Basis-gated endpoint) | 403 | `md_dashboard_forbidden` |
| Insider-only zonder actief Insider-lidmaatschap | 403 | `md_dashboard_insider_required` |
| Validatie / ontbrekend veld | 400 | `md_dashboard_invalid_request` |
| Publicatie-quota vol (online zetten / create) | 409 | `md_dashboard_quota_exceeded` |
| Stripe portal niet beschikbaar | 503 | `md_dashboard_unavailable` |
| Onverwachte serverfout | 500 | `md_internal_error` |

**404 i.p.v. 403 voor vreemde brand:** frontend gebruikt `notFound()` — geen lek dat de brand bestaat.

---

## Veldnamen (snake_case ↔ camelCase)

WordPress levert **snake_case**; frontend-mapper vertaalt naar `src/types/dashboard.ts`.

| Frontend | WordPress |
|---|---|
| `firstName` | `first_name` |
| `lastName` | `last_name` |
| `avatarUrl` | `avatar_url` |
| `brandName` | `brand_name` |
| `vatNumber` | `vat_number` |
| `chamberNumber` | `chamber_number` |
| `logoUrl` / `logoName` | `logo_url` / `logo_name` |
| `savedAt` | `saved_at` |
| `imageUrl` | `image_url` |
| `materialCount` / `articleCount` | `material_count` / `article_count` |
| `coverGradient` | `cover_gradient` |
| `alertsEnabled` | `alerts_enabled` |
| `resultCount` | `result_count` |
| `brandName` (requests) | `brand_name` |
| `updatedAt` | `updated_at` |
| `countsAgainstQuota` | `counts_against_quota` |
| `timeAgo` | `time_ago` |
| `requestOptions` | `request_options` |
| `materialId` | `material_id` |
| `publicationQuota` | `publication_quota` |
| `publicationsUsed` | `publications_used` |
| `cancelAtPeriodEnd` | `cancel_at_period_end` |
| `validUntil` | `valid_until` |
| `startsAt` / `endsAt` | `starts_at` / `ends_at` |
| `pdfUrl` | `pdf_url` |
| `featuredImage` | `featured_image` (object `{ id, name, url }`) |

**Computed door WP (frontend herberekent niet):** `counts_against_quota`, `time_ago`, saved-search `summary`, brand-level `publication_quota` / `publications_used`, board counts, statistiek-totalen.

**`counts_against_quota`:** `true` bij `publication_status = member`; `false` bij standalone/legacy/former_*.

---

## Databron per paneel (hergebruik vs apart endpoint)

| Paneel | Bron |
|---|---|
| Reader Insider membership | **`GET /auth/me` → `user.membership`** — geen dashboard-GET |
| Brand membership (tier/quota) | **`GET /auth/me` → `user.brands[]`** — geen dashboard-GET |
| My profile (form) | **`GET/POST /dashboard/profile`** — `/auth/me` mist o.a. `country` |
| Brand profile (form) | **`GET/POST …/brands/{brandId}/profile`** |
| Overige panelen | Eigen dashboard-endpoint (zie hieronder) |

Na profile-save: frontend doet `router.refresh()` zodat sidebar/`/auth/me` syncen.

---

## Persoonlijk account

### My profile
- `GET /md/v2/dashboard/profile` → `UserProfile`
- `POST /md/v2/dashboard/profile` (body: `UserProfile`) → `UserProfile`

```ts
interface UserProfile {
  firstName: string
  lastName: string
  email: string
  profession: string
  company: string
  country: string
  avatarUrl: string | null
}
```

### Bookmarks
- `GET /md/v2/dashboard/bookmarks` → `BookmarkItem[]`
- `DELETE /md/v2/dashboard/bookmarks/{id}` → `204`

```ts
type BookmarkType = 'materials' | 'articles' | 'brands' | 'talks' | 'events' | 'books'
interface BookmarkItem {
  id: string
  type: BookmarkType
  title: string
  label: string          // korte content-type-label, bv. "Material"
  href: string           // publieke detailpagina
  imageUrl: string | null
  gradient: string | null
  savedAt: string
}
```

### Boards _(Insider)_
- `GET /md/v2/dashboard/boards` → `Board[]`
- `POST /md/v2/dashboard/boards` (body: `{ name }`) → `Board`
- `PATCH /md/v2/dashboard/boards/{id}` → `Board`
- `DELETE /md/v2/dashboard/boards/{id}` → `204`

```ts
interface Board {
  id: string
  name: string
  createdAt: string
  materialCount: number   // door WP geteld
  articleCount: number    // door WP geteld
  coverGradient: string
}
```

### Saved searches _(Insider)_
- `GET /md/v2/dashboard/saved-searches` → `SavedSearch[]`
- `POST /md/v2/dashboard/saved-searches` → `SavedSearch`
- `PATCH /md/v2/dashboard/saved-searches/{id}` (o.a. `alertsEnabled`) → `SavedSearch`
- `DELETE /md/v2/dashboard/saved-searches/{id}` → `204`

```ts
interface SavedSearch {
  id: string
  name: string
  summary: string         // door WP geformuleerde filter-samenvatting
  query: string           // canonieke querystring voor /materials
  resultCount: number     // bij laatste evaluatie
  alertsEnabled: boolean
  createdAt: string
}
```

### Insider insights _(Insider)_
- `GET /md/v2/dashboard/insider-insights` → `InsightReport[]`

```ts
interface InsightReport {
  id: string
  title: string
  summary: string
  date: string
  category: string        // bv. "Trend report"
  href: string
}
```

### My requests
- `GET /md/v2/dashboard/requests` → `MyRequest[]`

```ts
type RequestKind = 'sample' | 'info' | 'brochure' | 'contact'
interface MyRequest {
  id: string
  kind: RequestKind
  subject: string
  brandName: string
  date: string
  status: string          // vrije label, bv. "Sent" / "Answered"
  message: string
}
```

### Insider membership (reader-billing)
Leest uit het bestaande `user.membership` (`Membership` in `shared.ts`) via **`/auth/me`** —
geen apart dashboard-GET voor lezen. Prijzen komen uit `INSIDER_PRICING` (`membership.ts`).

**Billing portal (v1):**
- `GET /md/v2/dashboard/membership/portal` → `{ url: string }`
- Stripe Customer Portal session; customer-id uit usermeta **`stripe_customer_id`**
- **Geen** `POST …/membership/cancel` in v1 — cancel/update via portal; webhooks zijn bron van waarheid

Brand-tier portal (later): `_brand_stripe_customer_id` op brand-post; apart endpoint of `?scope=brand&brandId=` — buiten v1-scope.

### Invoices (persoonlijk)
- `GET /md/v2/dashboard/invoices?scope=user` → `Invoice[]`

```ts
type InvoiceStatus = 'paid' | 'open' | 'overdue' | 'refunded'
interface Invoice {
  id: string
  date: string
  description: string
  amount: number          // WooCommerce levert decimaal
  currency: string
  status: InvoiceStatus
  pdfUrl: string | null   // signed URL of null zolang niet gegenereerd
}
```

---

## Brand-scope

Alle brand-endpoints vereisen dat de ingelogde gebruiker de brand beheert.

### Brand profile + keywords
- `GET /md/v2/dashboard/brands/{brandId}/profile` → `BrandProfile`
- `POST /md/v2/dashboard/brands/{brandId}/profile` (body: `BrandProfile`) → `BrandProfile`

```ts
interface BrandSocialLinks {
  twitter: string; instagram: string; linkedin: string
  youtube: string; pinterest: string; facebook: string
}
interface BrandProfile {
  brandId: number
  slug: string
  brandName: string
  description: string
  website: string
  email: string
  phone: string
  country: string
  address: string
  postcode: string
  city: string
  vatNumber: string
  chamberNumber: string
  social: BrandSocialLinks
  logoUrl: string | null
  logoName: string | null
  channels: string[]
  keywords: string[]      // Plus+ — server moet tier afdwingen
}
```

### Materials (lijst + status)
- `GET /md/v2/dashboard/brands/{brandId}/materials` → `MaterialListRow[]`
- `PATCH /md/v2/dashboard/brands/{brandId}/materials/{id}` (body: `{ status }`) → `MaterialListRow`

```ts
type MaterialPublicationStatus = 'online' | 'offline' | 'draft'
interface MaterialListRow {
  id: number
  name: string
  category: string
  status: MaterialPublicationStatus
  updatedAt: string
  countsAgainstQuota: boolean   // false = losse publicatie (standalone)
}
```

### Material form (create/edit)
- `GET /md/v2/dashboard/brands/{brandId}/materials/{id}` → `MaterialFormData`
- `POST /md/v2/dashboard/brands/{brandId}/materials` (create) → `MaterialFormData`
- `PATCH /md/v2/dashboard/brands/{brandId}/materials/{id}` (edit) → `MaterialFormData`
- `DELETE /md/v2/dashboard/brands/{brandId}/materials/{id}` → `204`

```ts
interface MaterialCategoryPath { id: string; l1: string; l2: string; l3: string }
interface MaterialAsset { id: string; name: string; url: string | null }
interface MaterialFormData {
  mode: 'create' | 'edit'
  id: number | null
  name: string
  description: string
  type: string
  featuredImage: MaterialAsset | null
  categories: MaterialCategoryPath[]
  channels: string[]
  gallery: MaterialAsset[]
  videos: string[]              // Basis+
  downloads: MaterialAsset[]    // Basis+ (PDF & EPD)
  keywords: string[]            // Plus+
}
```
> **Uploads (bevestigd 02-06-2026):** assets via **`POST /wp/v2/media`** (JWT).
> Het materiaalformulier stuurt **attachment-id's** mee; WP koppelt bij save en
> controleert dat de user de brand beheert.

**Request body** (`POST` / `PATCH …/materials`, snake_case):

```json
{
  "name": "…",
  "description": "…",
  "type": "Wood",
  "featured_image_id": 12345,
  "gallery_attachment_ids": [12346, 12347],
  "download_attachment_ids": [12348],
  "videos": ["https://…"],
  "keywords": ["acoustic"],
  "categories": [{ "id": "…", "l1": "…", "l2": "…", "l3": "…" }],
  "channels": ["Biobased"]
}
```

**Response:** `MaterialFormData` met `featured_image`, `gallery`, `downloads` als
`{ id, name, url }` (url ingevuld waar beschikbaar).

Status-toggle (lijst): `PATCH …/materials/{id}` body `{ "status": "online" | "offline" | "draft" }` → retourneert `MaterialListRow`.

### Interactions (inkomende leads)
- `GET /md/v2/dashboard/brands/{brandId}/interactions` → `Interaction[]`
- `PATCH /md/v2/dashboard/brands/{brandId}/interactions/{id}` (status) → `Interaction`

```ts
type InteractionType = 'request' | 'brochure-download' | 'info' | 'contact'
interface Interaction {
  id: number
  type: InteractionType
  page: string
  person: string
  role: string
  industry: string
  company: string
  email: string
  phone: string
  address: string
  postcode: string
  city: string
  country: string
  date: string
  timeAgo: string          // door WP geformatteerd (stabiele weergave)
  status: string
  message: string
  requestOptions: string[]
}
```

### Statistics _(Basis+)_
- `GET /md/v2/dashboard/brands/{brandId}/statistics?range=...` → `BrandStatistics`

```ts
interface StatMetric { label: string; value: number; note: string | null }
interface MaterialStatRow {
  materialId: number; name: string
  views: number; requests: number; downloads: number
}
interface BrandStatistics {
  metrics: StatMetric[]      // voor-geaggregeerd door WP
  materials: MaterialStatRow[]
}
```

### Lead routing _(Plus+)_
- `GET /md/v2/dashboard/brands/{brandId}/lead-routing` → `LeadRoutingConfig`
- `POST /md/v2/dashboard/brands/{brandId}/lead-routing` (body: `LeadRoutingConfig`) → `LeadRoutingConfig`

```ts
interface LeadRoute { id: number; country: string; name: string; email: string }
interface LeadRoutingConfig {
  defaultName: string
  defaultEmail: string
  routes: LeadRoute[]
}
```

### Featured placements _(Partner)_
- `GET /md/v2/dashboard/brands/{brandId}/featured` → `FeaturedPlacement[]`

```ts
type FeaturedSlotStatus = 'active' | 'available' | 'scheduled'
interface FeaturedPlacement {
  id: string
  slot: string
  status: FeaturedSlotStatus
  startsAt: string | null
  endsAt: string | null
  subject: string | null
}
```
> De catalogus van koopbare slots is een **regel** (config); per-brand
> boekingsstatus is **data**. Boeken loopt later via de upsell-shop /
> WooCommerce.

### Invoices (brand)
- `GET /md/v2/dashboard/brands/{brandId}/invoices` → `Invoice[]` _(zelfde shape als persoonlijk)_

### Membership (brand-tier)
Leest uit `user.brands[]` (`BrandMembership` in `shared.ts`): `tier`, `status`,
`publicationQuota`, `publicationsUsed`, `validUntil`, `cancelAtPeriodEnd`.
Prijzen + feature-matrix komen uit `membership.ts`. Tier-wisselingen lopen niet
via een self-service endpoint (decision: door ons team afgehandeld).

### Delete brand
- `DELETE /md/v2/dashboard/brands/{brandId}` → `204`

### Add brand (claim/create)
- `GET /md/v2/dashboard/brand-candidates?q=...` → `BrandCandidate[]`
- `POST /md/v2/dashboard/brands/claim` (body: `{ brandId }`) → `{ status }`
- `POST /md/v2/dashboard/brands/request-new` → `{ status }`

```ts
interface BrandCandidate {
  id: number
  name: string
  domain: string          // gematcht op e-maildomein
  website: string
  email: string
  logoLabel: string
}
```

---

## Implementatiestatus (WP plugin, 02-06-2026)

**Geen** `/md/v2/dashboard/*`-route staat nog op test/productie. Frontend draait op mock tot Johan endpoints levert in batches.

| Endpoint(s) | WP | Frontend `data.ts` |
|---|---|---|
| `/auth/me` (membership-panelen) | ✅ live | ✅ (layout/auth) |
| `/dashboard/profile` | 🔜 | mock |
| `/dashboard/bookmarks` | 🔜 | mock |
| `/dashboard/boards` | 🔜 | mock |
| `/dashboard/saved-searches` | 🔜 | mock |
| `/dashboard/insider-insights` | 🔜 | mock |
| `/dashboard/requests` | 🔜 | mock |
| `/dashboard/membership/portal` | 🔜 | — |
| `/dashboard/invoices` | 🔜 | mock |
| `/dashboard/brands/{id}/profile` | 🔜 | mock |
| `/dashboard/brands/{id}/materials` | 🔜 | mock |
| `/dashboard/brands/{id}/interactions` | 🔜 | mock |
| `/dashboard/brands/{id}/statistics` | 🔜 | mock |
| `/dashboard/brands/{id}/lead-routing` | 🔜 | mock |
| `/dashboard/brands/{id}/featured` | 🔜 | mock |
| `/dashboard/brands/{id}/invoices` | 🔜 | mock |
| `/dashboard/brands/{id}` DELETE | 🔜 | mock stub |
| `/dashboard/brand-candidates`, claim, request-new | 🔜 | mock |

Gerelateerd **wel** live (geen dashboard-namespace): `POST /checkout/insider`, `POST /auth/register` (manufacturer + brand).

---

## Beslissingen (afgesloten 02-06-2026)

Eerdere open punten — bevestigd voor implementatie:

1. **Basis-URL + brand-routes:** API op **numeriek `brandId`**, frontend op **slug**.
2. **Upload-flow:** **WP Media REST** + attachment-id's in materiaal-POST/PATCH (geen apart dashboard-upload-endpoint).
3. **Billing-portal:** **Stripe Customer Portal via WP** (`GET …/membership/portal`); geen custom cancel-endpoint v1.
4. **`timeAgo` + saved-search `summary`:** **server-side** door WP — frontend toont alleen.
5. **`countsAgainstQuota`:** **ja**, computed veld per materiaal (afgeleid van `publication_status`).
