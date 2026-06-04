# Handoff Claude — channels, featured, test

Geconsolideerd uit verzonden maildrafts (`email-claude-*.txt`, verwijderd juni 2026).  
Bron van waarheid voor **gedrag/API** blijft code + onderstaande docs; dit bestand is de korte samenvatting voor frontend-werk met Claude (geen git op Claude-kant).

## Gerelateerde docs

| Onderwerp | Bestand |
|-----------|---------|
| Featured API (curl, shapes) | `handoff-frontend-channels-featured-2026-06-04.md` |
| Featured UI-handtest | `featured-slots-ui-manual-test.md` |
| E2E-accounts | `e2e-test-accounts.md` |
| ChannelBar batch1 | `MANIFEST-channelbar-batch1.md` |
| Catalog parse-fix | `MANIFEST-channelbar-catalogfix.md` |
| Featured batch2 | `MANIFEST-featured-slots-batch2.md` |
| Dashboard datacontract | `dashboard-datacontract.md` |
| Bookmarks + saved search (live) | `MANIFEST-bookmarks-savedsearch-2026-06-04.md` |
| Maildraft Claude bookmarks | `email-claude-bookmarks-done.txt` |
| Maildraft Claude board picker | `email-claude-board-picker-done.txt` |
| Maildraft Claude board detail (volgende stap) | `email-claude-board-detail-next.txt` |
| Channels hubs (sessie 12) | `MANIFEST-channels-sessie12.md` |
| Maildraft Claude channels | `email-claude-channels-sessie12-done.txt` |

## Infra

- **Vercel test** (`materialdistrict-frontend.vercel.app`): `WP_API_URL` → `https://materialdistrict.com/wp-json` (preview + production env).
- **Plugin**: push `master` in `materialdistrict-plugin` → auto-deploy WP Engine (productie).
- Claude bouwt UI tegen **productie-API**; Vercel is alleen deploy van de Next-app.

## Channels

### Collection-filter (server-side)

```http
GET /wp-json/wp/v2/{talk|article|brand|event}?theme=<term_id>
```

- Parameter `theme` = **integer term-id** alleen (slug → 400).
- Slug → id: `GET /wp/v2/theme?slug=biobased` of item uit `/md/v2/material-channels`.
- Paginatie: `X-WP-Total` / `X-WP-TotalPages` respecteren filter.
- Items: `theme: [79, …]`; plugin ook `meta.channels` als `[{ id, slug, label }]`.
- Term REST: `theme_thumbnail` = `{ id, url, alt }`; `featured` = boolean (Tax Meta `_featured`).
- Gebruik **`theme`**, niet taxonomy `sector`, voor channel-bars/landings.

`article` heeft daarnaast `?story_type=` (los van theme).

### Channel-catalogus (ChannelBar)

```http
GET /wp-json/md/v2/material-channels
```

Response: **wrapper**, geen bare array:

```json
{ "channels": [ { "id": 79, "slug": "biobased", "label": "Biobased", "count": 719 }, … ] }
```

- ~20 channels; `id` is JSON-number; `count` = materialen met dat theme.
- Frontend: `Array.isArray(raw) ? raw : raw?.channels` (+ optioneel string-`id` normaliseren). Zie `src/lib/api/channels.ts`.
- Bar toont **volledige catalogus**, niet “alleen channels op huidige posts”.
- **Events**: zelfde patroon, volledige catalogus (niet alleen aanwezige channels op de pagina).

### Landingspagina `/channels/[slug]`

| Onderdeel | Endpoint |
|-----------|----------|
| Copy | `GET /wp/v2/theme/{id}` → `name`, `description` |
| Thumbnail | `theme_thumbnail` op zelfde object: `{ id, url, alt }` of `null` (plugin `taxonomy-theme.php`, live) |

`/md/v2/material-channels` blijft picker-only: `id`, `slug`, `label`, `count` — geen description/thumbnail.

Catalogus-cache: 6u transient op `material-channels`; na WP term-wijzigingen eventueel cache flush.

### Test-URLs

- Talks bar: https://materialdistrict-frontend.vercel.app/talks  
- Deep link: `?channel=<slug>` → resolve id → `?theme=<id>` op collection.

## Featured slots

Zie `handoff-frontend-channels-featured-2026-06-04.md` voor routes, POST/DELETE, quota.

### Featured + offline materiaal (live, plugin `3e9d10f`)

| Concept | Regel |
|---------|--------|
| `is_featured_now` | Kalenderweek **active** én materiaal `publish` (online) |
| Offline tijdens geboekte week | `is_featured_now: false` (geen slider/pin); **week blijft geboekt** |
| Weer online,zelfde week | `is_featured_now` weer true, geen extra actie |
| Offline/draft/delete | **Niet geblokkeerd** |
| Slot `status` | Alleen kalender (`scheduled` / `active` / `done`) |
| Quota | Geboekte week telt in `featured_slots_used`, ook als offline; geen teruggave |

### Dashboard materials-lijst (offline heads-up)

`GET /md/v2/dashboard/brands/{brandId}/materials` per rij:

| Veld | Waarden | Betekenis |
|------|---------|-----------|
| `featured_state` | `active` \| `scheduled` \| `null` | Geboekte week (kalender), niet zichtbaarheid |
| `featured_week_start` | ISO-maandag of `null` | Bij `scheduled`: vroegste toekomstige week |

`active` + materiaal offline → UI waarschuwing. Boeken/annuleren blijft via `/featured-slots`.

### Frontend: reset-datum crash (opgelost)

WP levert `featured_slots_reset_date` als volledige ISO (`2027-06-03T13:00:49+00:00`).  
**Niet** `new Date(\`${iso}T00:00:00\`)` — alleen `iso.slice(0, 10)` + `T12:00:00`. Zie commits `7864309`, `e62dbc7` (`FeaturedPanel`, `normalizeDashboardDate` in `data.ts`).

## Testaccounts & URLs

Partner featured-test:

| | |
|---|---|
| E-mail | e2e-dashboard-partner@materialdistrict.com |
| Wachtwoord | `E2eDashboard2026!` |
| Brand | `e2e-partner-brand` (id `137159`) |
| Featured UI | https://materialdistrict-frontend.vercel.app/dashboard/brands/e2e-partner-brand/featured |

Volledige tabel: `e2e-test-accounts.md`. Handmatige stappen: `featured-slots-ui-manual-test.md`.

E2E-brand heeft vaak alleen **offline** testmateriaal → “Publish a material first” is normaal tot één materiaal online staat.

## Bookmarks & saved searches — live (04-06-2026) ✅

| | Commit / zip |
|---|--------------|
| WP plugin | `2aedda2` (productie) |
| Frontend test | `824d3b3` — zip `md-bookmarks-savedsearch-2026-06-04-FINAL.zip` |

**End-to-end af:** Save op materials, articles, talks, events (+ cards). Johan
handmatig OK op event + article. API-smoke op
https://materialdistrict-frontend.vercel.app.

Public **Save** (alle ingelogde users) → Next `/api/dashboard/bookmarks` → WP:

| Methode | Route | Body |
|---------|-------|------|
| `GET` | `/md/v2/dashboard/bookmarks` | — |
| `POST` | `/md/v2/dashboard/bookmarks` | `{ "type", "item_id" }` |
| `DELETE` | `/md/v2/dashboard/bookmarks/{id}` | — |

Frontend gebruikt camelCase `itemId` in JSON naar Next; mapper → `item_id` naar WP.
Response: **`item_id`** + **`id`** (record-id voor DELETE). Idempotent POST. Alleen
**gepubliceerde** targets → anders 400.

**Saved searches** _(Insider)_: `POST /md/v2/dashboard/saved-searches` — live;
materials-filter "Save this search" op test.

**Boards — live (04-06-2026):** zip `md-board-picker-2026-06-04.zip` → `BoardPickerModal`,
`GET`/`POST` `/api/dashboard/boards`, `POST …/boards/{id}/items`. Zie
`MANIFEST-board-picker-2026-06-04.md`.

Docs: `MANIFEST-bookmarks-savedsearch-2026-06-04.md`, `dashboard-datacontract.md`.

## Voorgestelde volgorde (frontend)

1. Featured UI-check op test (Partner-account).
2. ~~ChannelBar naar **brands**, **events**~~ — live op test (increment 2, `MANIFEST-channelbar-brands-events.md`).
3. ~~ChannelBar **materials** (FacetWP)~~ — live + geverifieerd (`MANIFEST-channelbar-materials.md`, FacetWP-facet `theme` + index).
4. ~~Landings `/channels` + `/channels/[slug]`~~ — live (`MANIFEST-channels-sessie12.md`).
5. ~~Materials-lijst: featured offline heads-up~~ — live op test (`MANIFEST-featured-offline-headsup.md`).
6. ~~Bookmarks Save + saved-search create~~ — live (`MANIFEST-bookmarks-savedsearch-2026-06-04.md`).
7. ~~Board picker~~ — live (`MANIFEST-board-picker-2026-06-04.md`).
