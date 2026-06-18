# Mail aan Claude — analytics sync (AWS live) + event-contract

**Onderwerp:** Sync: analytics draait al via AWS Lambda/RDS — event-contract + wat verouderd is

---

Hoi Claude,

Je mail gaat uit van een eerdere stand (o.a. `analytics-database.md` @ `eba9207`, en `backend-spec-datalaag-follow.md` als infra-leidraad). **Trek even de laatste plugin-`master` binnen** — daar is veel bij gekomen dat jij waarschijnlijk nog niet in je context hebt, met name de **AWS Lambda-ingestketen** op productie.

Hieronder: eerst wat verouderd is t.o.v. je mail, dan de actuele architectuur, dan het event-contract dat je vroeg.

---

## 1. Wat in jouw mail / onze eerdere specs inmiddels achterhaald is

| Onderwerp | Jouw aanname / oude spec | Actuele stand (jun 2026, plugin `master` ≥ `030f5d3`) |
|-----------|--------------------------|------------------------------------------------------|
| **Waar events landen** | `backend-spec-datalaag-follow.md` suggereert aparte MySQL op WPE of prefix op hoofd-DB | **Productie: dedicated RDS** via AWS — **niet** de WP-hoofddatabase |
| **Hoe WP bij RDS komt** | Directe MySQL (`MD_ANALYTICS_DB_*`) | **Productie op WPE: alleen HTTPS** via `MD_ANALYTICS_API_URL` + `MD_ANALYTICS_API_KEY` — WPE heeft geen stabiele outbound IP's voor RDS:3306 |
| **Ingest-pad** | “Lichte INSERT in WP” | `POST /md/v2/events` → **API Gateway → Lambda → SQS → Lambda → RDS** |
| **`migrate-views`** | “Wacht op directe RDS-toegang, niet vanaf WPE” | **Opgelost** (`7ab8100`): `wp md-analytics migrate_views` op WPE → batches via `POST /analytics/migrate-rollups` naar RDS. Ik draai dit op productie. |
| **Docs-referentie** | `analytics-database.md` @ `eba9207` | Gebruik **HEAD van `master`**; sinds `eba9207` o.a. `7ab8100` (API-migratie) + `030f5d3` (WP-CLI aliases). Go-live-tabel in die doc heeft op één regel nog de oude migrate-views-status — negeer die regel. |
| **Rollup/prune-cron** | Nog open | **Nog steeds open** — nightly `rollup` + `prune` vereisen RDS-toegang of een geplande Lambda; **geen blocker** voor jouw view/search-events |
| **`/api/events` proxy** | Nog te bouwen | **Al live** op frontend-main (events lopen mee zodra gebruikers de site raken) |
| **Follow-API** | Te bouwen | **Al in plugin** (`acd0521`): `GET/POST/DELETE /md/v2/follows`, `PATCH /md/v2/follows/mail-frequency`, `meta.followable` op brands |

Kortom: je hoeft **geen** analytics op de WP-hoofd-DB te ontwerpen of aan te nemen — dat was het fallback-pad voor lokaal. Productie = AWS.

---

## 2. Actuele productie-architectuur (AWS Lambda)

```text
Schrijven (events):
  Browser / Next /api/events
    → WP POST /wp-json/md/v2/events
      → API Gateway (3xe55jo7t6)
        → Lambda md-analytics-ingest
          → SQS md-analytics-events
            → Lambda md-analytics-db (VPC)
              → RDS md-analytics-prod (mda_events + mda_rollups_daily)

Lezen (dashboard counts):
  WP GET /md/v2/analytics/counts
  WP POST /md/v2/analytics/counts/query
    → API Gateway → Lambda md-analytics-db → RDS (rollups)

Legacy view-migratie (eenmalig, vanaf WPE):
  wp md-analytics migrate_views
    → WP batches POST /analytics/migrate-rollups
      → Lambda md-analytics-db → RDS (origin = pre_migration)
```

**Productie-smoke (werkt):**
```bash
curl -X POST 'https://materialdistrict.com/wp-json/md/v2/events' \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"preferred_source_click","object_type":"site","anonymous_id":"prod-smoke-1","source":"ops"}'
# → {"ok":true,"queued":true}
```

**Config op WPE:** `MD_ANALYTICS_API_URL` = `https://3xe55jo7t6.execute-api.eu-central-1.amazonaws.com` + `MD_ANALYTICS_API_KEY` (= Lambda `INGEST_API_KEY`).

**Canonieke docs:** `materialdistrict-plugin/docs/analytics-database.md` (master).  
**Canonieke code:** `includes/md-analytics-events.php` (whitelist), `aws/md-analytics-db/index.mjs` (Lambda-bron).

**Relevante commits om te syncen (chronologisch):**
`a5e5759` datalaag · `9c2a072` count-read API · `5000d67` **AWS API-proxy** · `eb34cfe` RDS-config · `acd0521` follows · `eba9207` go-live docs · `7ab8100` migrate-views via API · `030f5d3` WP-CLI aliases

---

## 3. Event-contract (wat je vroeg — 1-op-1 met de plugin)

### Endpoint

`POST /wp-json/md/v2/events` (jouw proxy: `POST /api/events`)

- Anoniem: `anonymous_id` **verplicht**
- Ingelogd: Bearer JWT → `user_id` server-side; `anonymous_id` optioneel (voor stitching bij login/registratie)
- `occurred_at`: **server-side** — niet meesturen
- Productie-succes: `{ "ok": true, "queued": true }` (event gaat via SQS naar RDS)
- Fout: `{ "code": "md_invalid_request", "message": "..." }` + 400; rate limit → 429

### Request body (snake_case)

| Veld | Verplicht | Opmerking |
|------|-----------|-----------|
| `event_type` | ja | whitelist (onder) |
| `object_type` | ja | whitelist; `article` → `story` |
| `object_id` | meestal ja | post-ID als string of slug; **leeg** voor `site` en `search` |
| `anonymous_id` | ja als anoniem | max 64 |
| `session_id` | nee | max 64 |
| `source` | nee | default `organic` |
| `attributes` | nee | JSON-object, max ~8KB |

### object_type (whitelist)

`material` · `story` · `brand` · `talk` · `event` · `book` · `channel` · `site` · `search`

### event_type (whitelist)

**Views:** `material_viewed` · `story_viewed` · `brand_viewed` · `talk_viewed` · `event_viewed` · `book_viewed` · `channel_viewed` · `viewed`

**Search:** `search_performed`

**Interactie/conversie:** `shared` · `saved` · `download` · `website_click` · `brochure_download` · `sample_request_started` · `sample_request_sent` · `info_request_started` · `info_request_sent` · `preferred_source_click` · `insider_teaser_clicked` · `insider_joined`

**Follows (server-side, niet dubbel client-side):** `channel_followed` · `brand_followed` · `channel_unfollowed` · `brand_unfollowed`

### View-voorbeeld

```json
{
  "event_type": "material_viewed",
  "object_type": "material",
  "object_id": "12345",
  "anonymous_id": "uuid-…",
  "session_id": "sess-…",
  "source": "organic"
}
```

### Search-voorbeeld

```json
{
  "event_type": "search_performed",
  "object_type": "search",
  "object_id": "",
  "anonymous_id": "uuid-…",
  "attributes": {
    "query": "recycled plastic",
    "facets": { "application": ["facade"], "properties": ["waterproof"] }
  }
}
```

### Counts lezen (dashboard)

`GET /md/v2/analytics/counts` · `POST /md/v2/analytics/counts/query` (max 100) — JWT verplicht; op productie ook via AWS Lambda → RDS.

---

## 4. Jouw geplande frontend-drop — bevestiging / nuance

| Jouw punt | Status |
|-----------|--------|
| **1. View- + search-events** | Graag op bovenstaand contract; komen via bestaande `/api/events` → AWS-keten in RDS |
| **2. `last_seen`** | **Nog niet op backend** — geen user-veld/endpoint. Frontend mag voorbereiden; API volgt later |
| **3. Follow-polish** | Akkoord: dubbele client follow-events eruit; server is bron bij `POST/DELETE /follows`. Frequency: `PATCH /md/v2/follows/mail-frequency` met `{ "mail_frequency": "daily"|"weekly"|"monthly" }` |

---

## 5. Wat je níet hoeft te doen / aan te nemen

- Geen aparte analytics-DB op WPE ontwerpen
- Geen directe RDS-connectie vanuit frontend of WP
- `migrate-views` hoeft jij niet op te pakken — backend/ops
- `backend-spec-datalaag-follow.md` blijft nuttig voor **API-contracten** (payload, follows), maar de **infra-secties** (MySQL op WPE, “queue later”) zijn vervangen door de AWS-setup hierboven

Als je `analytics-database.md` wilt hebben: die staat in de plugin-repo op `master` — niet alleen `eba9207`. Event-whitelist kun je 1-op-1 uit `md-analytics-events.php` halen.

Succes met de zip — geen actie van mij nodig tijdens vakantie.

Groet,  
Johan
