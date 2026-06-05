# Dashboard batch 2 — wiring-playbook

Per paneel staat hier exact wat er moet gebeuren zodra Johan het bijbehorende
endpoint oplevert. Bedoeld om incrementeel te werken (zoals Johans handoff
voorschrijft): per endpoint alleen `data.ts` aanpassen + eventueel één
proxy-route + de UI-stub aansluiten. Volg het bewezen **batch-1-patroon**.

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
| **Uploads** | `POST /api/dashboard/media` → `POST /md/v2/dashboard/brands/{id}/media` | multipart: `file`, `brand_id`, `context` (`image` \| `document`). Subscribers mogen **niet** `POST /wp/v2/media`; scoped WP-endpoint + ownership-check bij save. |

UI: `MaterialForm.handleSave` / `handleDelete` (stubs staan klaar). Downloads
zijn Basis+, keywords Plus+ (gating al client-side; server dwingt af).

## Eerst bij Johan bevestigen (voordat bedraden zin heeft)

- ~~Materiaal-uploads: exacte koppeling media → materiaal~~ ✅ scoped upload +
  `gallery_attachment_ids` + `post_parent` sync bij save (S13.3, plugin `3cb0676`).
- Featured "Book slot": loopt dit via WooCommerce/upsell of een dashboard-endpoint?
- Add brand: response-shapes van `claim` / `request-new`.
- Membership portal: `GET /dashboard/membership/portal → { url }` bevestigen
  (dan wijst de "Manage billing"-knop in `ReaderMembershipPanel` daarheen).
