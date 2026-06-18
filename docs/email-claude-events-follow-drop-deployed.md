Onderwerp: frontend-events-follow-drop-18-06 gedeployed + legacy views gemigreerd

Hoi Claude,

Je zip staat op main. Hieronder wat er precies live is en waar we staan met de analytics-migratie.

---

## 1. Events + follow-drop — gedeployed

`frontend-events-follow-drop-18-06.zip` → main commit **`b3cc128`**. Build groen, Vercel deploy loopt mee.

**Merge:** chirurgisch (geen wholesale page-replaces). Alleen jouw 14 bestanden/wijzigingen; bestaande main-code (Preferred Source, globals-blokken, dashboard-review) ongemoeid.

| Onderdeel | Status |
|-----------|--------|
| `ViewLogger` op 7 detailpagina's | ✅ material, story, brand, channel, event, talk, book — `object_id` = post-ID |
| Header `search_performed` | ✅ `object_type: search`, `attributes.query` bij submit |
| Client follow-events verwijderd | ✅ server is bron bij POST/DELETE `/follows` |
| Mail-frequency | ✅ `PATCH /api/follows` → WP `/md/v2/follows/mail-frequency` (digest + toggle) |
| Facet-filter search-events | ⬜ bewust niet — akkoord met jouw keuze om eerst af te stemmen |

Contract 1-op-1 met `email-claude-analytics-event-contract.md` / `md-analytics-events.php`.

**Pad:** browser → `/api/events` → WP `POST /md/v2/events` → API Gateway → Lambda → SQS → RDS.

Na deploy zouden `*_viewed` en `search_performed` in RDS moeten binnenkomen zodra er verkeer op de site is.

---

## 2. Legacy view-tellers — gemigreerd naar RDS

Op productie (WPE) uitgevoerd:

```bash
wp md-analytics migrate_views
# → Success: Migrated 7018 object(s); 7018 rollup row(s) written.

wp md-analytics validate_views --sample=50
# → Success: Validation passed: 50/50 sampled row(s) OK (7018 legacy row(s) total).
```

Migratie loopt via `POST /analytics/migrate-rollups` (geen directe RDS vanaf WPE). Plugin master ≥ `7ab8100`.

**Nog te doen (ops, niet blokkerend voor jouw events):**

```bash
wp md-analytics cleanup_legacy_views --yes   # verwijdert post_views_count meta uit WP
```

Tot die cleanup draait, leest het dashboard `max(analytics RDS, legacy meta)` — na migratie is analytics ≥ legacy, dus geen impact op getoonde cijfers.

**Dashboard statistics:** `/dashboard/brands/{slug}/statistics` — vereist Basis-tier brand + ingelogd. Historische views uit migratie zijn zichtbaar zodra tier OK is.

---

## 3. Nog open

| Item | Wie |
|------|-----|
| `last_seen` user-veld/endpoint | Johan (backend) — jouw frontend kan voorbereiden |
| `cleanup_legacy_views` op WPE | Johan (na akkoord) |
| Rollup/prune-cron (RDS/Lambda schedule) | Johan — geen haast |
| Facet-granulariteit search-events | Samen afstemmen |

---

## 4. Referenties

- Frontend: `b3cc128` (events-follow-drop)
- Plugin: `8c6dcd9` (docs), `7ab8100` (API-migratie), `030f5d3` (WP-CLI aliases)
- Event-contract mail: `docs/email-claude-analytics-event-contract.md`

Fijn — dit was precies het stuk dat nog ontbrak aan de datalaag. Succes met de rest tijdens mijn vakantie.

Groet,  
Johan
