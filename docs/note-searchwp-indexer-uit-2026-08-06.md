# Notitie — SearchWP-indexer tijdelijk uit

**Datum:** 6 augustus 2026  
**Status:** ~~indexer uit~~ **indexer weer aan** (6 aug 2026, na upgrade naar 4 vCPU / 8 GB RAM)  
**Eigenaar:** Johan (hosting / CMS)  
**Aanleiding:** CMS-droplet ~100% CPU; load ~5 op 2 vCPU door SearchWP background-indexering

---

## Kern

De SearchWP-indexer stond **tijdelijk uit** (6 aug 2026, ochtend) vanwege CPU-overbelasting op 2 vCPU. Na upgrade naar **4 vCPU / 8 GB RAM** is de indexer **weer ingeschakeld** en draaien delta-updates opnieuw.

In SearchWP System Info zou **“Indexer Paused: No”** moeten staan. Redactie hoeft zich geen zorgen te maken — nieuwe/gewijzigde content wordt weer geïndexeerd.

**Besluit (6 aug 2026):** droplet upgraden naar **4 vCPU / 8 GB RAM**. Meerkosten worden **doorberekend op de maandfactuur naar MaterialDistrict**.

**Uitgevoerd (6 aug 2026, ~10:10 UTC):** upgrade live; MU-plugin verwijderd; indexer weer actief (`paused: false`); geheugeninstellingen afgestemd op 8 GB (zie § Serverinstellingen).

---

## Wat is er gedaan (6 aug 2026)

| Actie | Detail |
|-------|--------|
| MU-plugin geïnstalleerd | `/var/www/html/wp-content/mu-plugins/md-disable-searchwp-indexer.php` — blokkeert `searchwp:index\process\enabled` |
| Indexer gepauzeerd in WP | `indexer_paused = true` (SearchWP Settings / `searchwp_indexer` option) |
| Vastgelopen drop-queue opgeschoond | ~24.000 `searchwp_index_drop_*` rijen verwijderd uit `wp_options` (stuck achtergrondproces) |
| Purge-queue geleegd | `searchwp_purge_queue` / `searchwp_purge_queue_req` verwijderd |

**Niet gedaan door ons:** “Pause Indexing” stond al aan in SearchWP System Info vóór deze interventie; de indexer bleef desondanks via `admin-ajax` background-processen draaien.

---

## Wat werkt nog wel

- **Globale zoekpagina** `/search` → `GET /wp-json/md/v2/search` (bestaande index)
- **Related content** op artikelen → SearchWP Related (+ taxonomy-fallback in plugin)
- **Material-zoek op `/material`** → native `WP_Query` (`s`), **geen** SearchWP
- **WP-admin** Live Ajax Search (o.a. brand-koppelen in legacy theme)

---

## Wat werkt niet / kan achterlopen

~~Geen delta-indexering~~ — **opgelost** na herinschakeling indexer (6 aug 2026).

Tijdens de uitschakelfase (ochtend 6 aug) kan de index kort achterlopen op content die in die periode is gepubliceerd; SearchWP werkt dat automatisch bij.

---

## SearchWP-plugins nog actief

Op het CMS draaien nog (bewust niet verwijderd):

- `searchwp`
- `searchwp-metrics`
- `searchwp-related`
- `searchwp-woocommerce`

Indexgrootte op moment van uitschakelen: **~1,4M rijen** in `wp_searchwp_index` (zwaar voor 2 vCPU).

---

## Serverinstellingen (6 aug 2026 — 4 vCPU / 8 GB RAM)

| Component | Was | Nu |
|-----------|-----|-----|
| Droplet | 2 vCPU / 4 GB | **4 vCPU / 8 GB** |
| `WP_MEMORY_LIMIT` / `WP_MAX_MEMORY_LIMIT` | 256M | **512M** |
| PHP-FPM `memory_limit` | 256M | **512M** |
| PHP-FPM `pm.max_children` | 5 | **10** |
| PHP-FPM `pm.start_servers` | 2 | **4** |
| Redis `maxmemory` | 256 MB | **512 MB** |
| MySQL `innodb_buffer_pool_size` | 128 MB | **1 GB** |

MU-plugin `md-disable-searchwp-indexer.php` is **verwijderd**. SearchWP cron (`searchwp_indexer_cron`) draait weer.

**Opnieuw uitschakelen** (bij load-problemen): zie oude stappen — MU-plugin terugzetten + Pause Indexing aan in SearchWP admin.

---

## Vervolg (niet uitgevoerd)

- SearchWP Related / Metrics deactiveren
- Engine versimpelen (minder taxonomie-gewichten in index)
- Migratie naar **Meilisearch** of **Typesense** (search los van CMS-droplet)

Zie ook open vraag in [`woocommerce-migration-plan.md`](./woocommerce-migration-plan.md) § product search.

---

## Referenties

- Plugin-endpoint: `materialdistrict-plugin/rest-search.php` → `GET /md/v2/search`
- Related-endpoint: `materialdistrict-plugin/rest-articles-related.php`
- Frontend: `src/lib/api/search.ts`, `/search`
- CMS: `https://cms.materialdistrict.com` (DigitalOcean; **4 vCPU / 8 GB RAM**)
