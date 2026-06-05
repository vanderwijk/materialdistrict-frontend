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

Voorstel basis: `/wp-json/md/v2/dashboard/…`. Brand-endpoints gebruiken het
**numerieke brand-id** in de URL (`/brands/{brandId}/…`), terwijl de frontend-
routes op **slug** draaien — de resolver (`getBrandProfile`) mapt slug → id.

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
- `POST /md/v2/dashboard/bookmarks` (body: `{ type, item_id }`) → `BookmarkItem` (idempotent; 201 new, 200 existing)
- `DELETE /md/v2/dashboard/bookmarks/{id}` → `204`

```ts
type BookmarkType = 'materials' | 'articles' | 'brands' | 'talks' | 'events' | 'books'
interface BookmarkItem {
  id: string              // bookmark record id (DELETE)
  item_id: number         // underlying WP post id (Save button state)
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
- `POST /md/v2/dashboard/boards/{id}/items` (body: `{ type, item_id }`) → `Board` (idempotent)
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
Leest uit het bestaande `user.membership` (`Membership` in `shared.ts`).
Prijzen komen uit `INSIDER_PRICING` (`membership.ts`) — niet uit een endpoint.
Voor het beheren van de subscription is later een billing-portal nodig:
- `POST /md/v2/dashboard/membership/cancel` → `Membership`
- `GET /md/v2/dashboard/membership/portal` → `{ url }` _(Stripe billing portal)_

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
> Uploads (featured/gallery/downloads/logo) lopen via
> `POST /md/v2/dashboard/brands/{brand_id}/media` (frontend proxy:
> `/api/dashboard/media`). Form levert asset-id's terug i.p.v. files. Gebruik
> **niet** generieke `POST /wp/v2/media` — subscribers missen `upload_files`.

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

## Open punten voor Johan

1. Bevestig basis-URL en of brand-routes op id of slug moeten.
2. ~~Upload-flow voor material-assets (eigen endpoint vs WP-media).~~ ✅ Scoped
   dashboard-endpoint (`/md/v2/dashboard/brands/{id}/media`); zie
   `docs/email-claude-s13.3-dashboard-media-upload-done.txt`.
3. Billing-portal: Stripe customer portal-URL via WP, of eigen cancel-endpoint?
4. `timeAgo` en `summary` (saved search) server-side formatteren — akkoord?
5. Levert WP `countsAgainstQuota` per materiaal mee (losse publicaties)?
