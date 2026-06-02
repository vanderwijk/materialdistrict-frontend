# Dashboard batch 2 — wiring-playbook

Per paneel staat hier exact wat er moet gebeuren zodra Johan het bijbehorende
endpoint oplevert. Bedoeld om incrementeel te werken (zoals Johans handoff
voorschrijft): per endpoint alleen `data.ts` aanpassen + eventueel één
proxy-route + de UI-stub aansluiten. Volg het bewezen **batch-1-patroon**.

## WP-status (Johan, 02-06-2026)

**Batch 2 én batch 3 staan live op productie** (`materialdistrict.com/wp-json`).
Je kunt direct bedraden — geen wachten op nieuwe plugin-deploy voor onderstaande
endpoints. Handoffs: `dashboard-handoff-batch2-jeroen.md` + `batch3`.

| Batch | Live op productie |
|---|---|
| **2** | portal, requests, interactions (+ PATCH status), lead-routing, statistics |
| **3** | bookmarks, boards, saved-searches, insider-insights, user invoices, material form CRUD |

**Nog niet live (batch 4+):** featured, brand invoices, delete brand, brand-candidates / claim / request-new, bookmark POST (public site).

## Vaste aanpak (zelfde als batch 1)

1. **Mapper** toevoegen in `src/lib/dashboard/mappers.ts` (snake → camel; en
   `toWp…` voor schrijfacties).
2. **Read** in `src/lib/dashboard/data.ts`: vervang `return MOCK_*` door
   `wpDashboardFetch(path, { method:'GET', bearer: token })` + mapper.
   Brand-scope: `resolveBrandId(slug)` is er al; 404 → `null`/`[]`.
3. **Write**: nieuwe route onder `src/app/api/dashboard/…` (cookie → Bearer,
   kopie van een bestaande route). Client-stub → `fetch('/api/dashboard/…')`.
4. **Fouten**: `DashboardApiError` levert `code` + `status`; UI toont melding
   (zie `.form-error`) en revert optimistische updates.

Infra die al klaarstaat: `wpDashboardFetch` (GET/POST/PATCH), het proxy-patroon,
de mapper-laag, de `data.ts`-naad, en alle renderende pagina's.

## Foutcodes (uit batch 1, hergebruiken)

`md_auth_unauthenticated` (401) · `md_dashboard_brand_not_found` (404) ·
`md_dashboard_forbidden` (403, tier) · `md_dashboard_invalid_request` (400) ·
`md_dashboard_quota_exceeded` (409) · `md_dashboard_unavailable` (503).
Brand-auth-fouten komen als **404** (geen lek).

---

## Persoonlijke panelen

| Paneel | Endpoint(s) | data.ts | Mapper | Proxy-route | UI-stub |
|---|---|---|---|---|---|
| Bookmarks | `GET /dashboard/bookmarks`, `DELETE …/{id}` | `getBookmarks` | `mapBookmark` | `DELETE /api/dashboard/bookmarks/[id]` | `BookmarksPanel.remove` |
| Boards | `GET /dashboard/boards`, `POST`, `DELETE …/{id}` | `getBoards` | `mapBoard` | `POST`/`DELETE /api/dashboard/boards[/id]` | `BoardsPanel.createBoard/remove` |
| Saved searches | `GET …/saved-searches`, `PATCH …/{id}` (alerts), `DELETE` | `getSavedSearches` | `mapSavedSearch` | `PATCH`/`DELETE /api/dashboard/saved-searches/[id]` | `SavedSearchesPanel.toggleAlert/remove` |
| Insider insights | `GET …/insider-insights` | `getInsiderInsights` | `mapInsight` | — (read-only) | — |
| My requests | `GET …/requests` | `getMyRequests` | `mapMyRequest` | — (read-only) | — |
| User invoices | `GET …/invoices?scope=user` | `getUserInvoices` | `mapInvoice` | — (read-only) | — |

Insider-gating (boards / saved-searches / insights) blijft client-side via
`isInsider` + `InsiderGate`; server dwingt af met `md_dashboard_insider_required`.

## Brand-panelen

| Paneel | Endpoint(s) | data.ts | Mapper | Proxy-route | UI-stub |
|---|---|---|---|---|---|
| Interactions | `GET …/brands/{id}/interactions`, evt. `PATCH …/{id}` | `getInteractions` | `mapInteraction` | evt. status-PATCH | `InteractionsPanel` (read; drawer al af) |
| Statistics | `GET …/brands/{id}/statistics` | `getBrandStatistics` | `mapBrandStatistics` | — | — (Basis-gate al af) |
| Lead routing | `GET …/lead-routing`, `POST …/lead-routing` | `getLeadRouting` | `mapLeadRouting` / `toWpLeadRouting` | `POST /api/dashboard/brands/[brandId]/lead-routing` | `LeadRoutingPanel.handleSave` |
| Featured | `GET …/featured`; boeken via WooCommerce/upsell | `getFeaturedPlacements` | `mapFeatured` | boeken = upsell-track, **niet hier** | `FeaturedPanel` (read) |
| Brand invoices | `GET …/brands/{id}/invoices` | `getBrandInvoices` | `mapInvoice` (hergebruik) | — | — |
| Delete brand | `DELETE …/brands/{id}` | — | — | `DELETE /api/dashboard/brands/[brandId]` | `DeleteBrandPanel.handleDelete` |
| Add brand | `GET …/brand-candidates?q=`, `POST …/brands/claim`, `POST …/brands/request-new` | `getBrandCandidates` | `mapBrandCandidate` | `POST /api/dashboard/brands/claim` + `…/request-new` | `AddBrandPanel` (claim/create) |

## Materiaalformulier (apart — meest complex)

| Onderdeel | Endpoint | Let op |
|---|---|---|
| Lezen | `GET …/brands/{id}/materials/{matId}` | `getMaterialForm` → `mapMaterialFormData` |
| Create | `POST …/brands/{id}/materials` | retour: nieuwe `id` |
| Edit | `PATCH …/brands/{id}/materials/{matId}` | |
| Delete | `DELETE …/brands/{id}/materials/{matId}` | |
| **Uploads** | `POST /wp/v2/media` (los van dashboard) | Zie **Bevestigingen Johan** hieronder — geen enkele `attachment_ids`-array |

UI: `MaterialForm.handleSave` / `handleDelete` (stubs staan klaar). Downloads
zijn Basis+, keywords Plus+ (gating al client-side; server dwingt af).

## Bevestigingen Johan (02-06-2026)

Antwoorden op de vier open punten — bedraden kan nu starten.

### 1. Materiaal-uploads

**Geen** generieke `attachment_ids`-array. Flow:

1. Client uploadt via **`POST /wp/v2/media`** (JWT in `Authorization` header).
2. Response levert attachment-**id** (numeriek).
3. Material **POST/PATCH** stuurt id's in **aparte velden** (snake_case body):

```json
{
  "featured_image_id": 12345,
  "gallery_attachment_ids": [12346, 12347],
  "download_attachment_ids": [12348]
}
```

**Validatie WP bij save:**

- User moet de brand **beheren** (`md_dashboard_require_managed_brand`).
- Material moet bij die brand horen (create zet `_material_brand`).
- Per attachment: post type `attachment` + **`post_author` = ingelogde user** (of user heeft `edit_others_posts`). Geen aparte “brand owns this media”-check — upload gebeurt onder jouw JWT, koppeling bij material save.

Tier gates: `download_attachment_ids` / `videos` → Basis+; niet-lege `keywords` → Plus+.

Zie ook `dashboard-datacontract.md` § Material form + `dashboard-handoff-batch3-jeroen.md`.

### 2. Featured “Book slot”

**Boeken:** later via **WooCommerce / upsell-shop** — **geen** dashboard POST-endpoint voor booking.

**Lezen:** `GET /md/v2/dashboard/brands/{brandId}/featured` → `FeaturedPlacement[]` komt in **batch 4** (nog niet live). `FeaturedPanel` read-only houden; “Book”-CTA blijft upsell-track.

Catalogus van slots = frontend config/regel; per-brand status = WP data (later).

### 3. Add brand — claim / request-new

**Nog niet geïmplementeerd** (batch 4). Geplande shapes (datacontract):

| Endpoint | Request (snake_case API) | Response |
|---|---|---|
| `POST /md/v2/dashboard/brands/claim` | `{ "brand_id": 3576 }` | `{ "status": "ok" }` |
| `POST /md/v2/dashboard/brands/request-new` | `{ "name": "…", "website": "…", … }` (velden TBD bij implementatie) | `{ "status": "ok" }` |

`GET /md/v2/dashboard/brand-candidates?q=…` → `BrandCandidate[]` (zelfde shape als mock/types).

Tot batch 4 live is: **`AddBrandPanel` mock laten**.

### 4. Membership portal

**Bevestigd en live:**

`GET /md/v2/dashboard/membership/portal` → `{ "url": "https://billing.stripe.com/…" }`

- Vereist `stripe_customer_id` op user (Insider); anders **503** `md_dashboard_unavailable`.
- `return_url` → `{frontend}/dashboard/membership`.
- Geen POST cancel in v1 — alles via Stripe portal + webhooks.

**Frontend:** `ReaderMembershipPanel` → proxy `GET /api/dashboard/membership/portal` → `window.location.href = data.url` (vervang `/dashboard/membership/manage`).

---

## Aanbevolen bedraad-volgorde (Johan)

Alles batch 2+3 hieronder is **al live** — volgorde is voor jouw planning, niet voor deploy-wachten.

| # | Paneel | Waarom eerst |
|---|---|---|
| 1 | **Membership portal** | Snelle winst, één GET + redirect |
| 2 | **My requests** | Read-only, plat |
| 3 | **Interactions** | Read-only; PATCH status optioneel later |
| 4 | **Statistics** | Read-only; **403 op free-tier brands** (test met Basis+ brand of verwacht 403) |
| 5 | **Lead routing** | GET + POST; **403 op free tier** |
| 6 | **User invoices** | Read-only (batch 3) |
| 7 | **Bookmarks / boards / saved searches / insider insights** | Batch 3; boards/searches/insights vereisen Insider |
| 8 | **Material form** | Meest complex (media upload + PATCH dispatch); batch 3 live |

**Wachten tot batch 4:** featured, brand invoices, delete brand, add brand.

**Foutcodes batch 3 extra:** `md_dashboard_insider_required` (403) voor boards, saved-searches, insider-insights.
