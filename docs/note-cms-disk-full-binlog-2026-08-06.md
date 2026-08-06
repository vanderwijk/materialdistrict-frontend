# CMS disk full — root cause & fix (6 aug 2026)

## Kort antwoord op de traffic-piek

**Ja — die hangt er direct mee samen.** In DO Insights (lokale tijd UTC+2) startte de bandwidth-piek ~13:50 en de lineaire disk-groei ~14:00. Op de server (UTC) is dat ~11:50–12:00.

De publieke site is headless: Next.js doet bij traffic **veel `/wp-json/*`-requests** naar `cms.materialdistrict.com`. SearchWP Metrics maakte bij **elke cookieless WP-bootstrap** een nieuwe visitor-UID (`INSERT INTO wp_swpext_metrics_ids`). SSR/API stuurt die cookie nooit terug → **1 UID ≈ 1 CMS-request**.

Op de oude monolithische site zat de browser op hetzelfde domein als WP; de Metrics-cookie bleef hangen. Zelfde content, maar géén UID-storm.

Binlogs (toen nog aan) vermenigvuldigden elke insert → gemeten **~22 GB/uur** → schijf vol in ~2,5 uur.

## Bewijs (live)

| Metric | Waarde |
|--------|--------|
| `metrics_ids` type `uid` vóór fix | ~446 000 |
| type `hash` / searches | ~2 120 |
| Orphan UIDs (geen search) | ~445 000 |
| UID-groei tijdens onderzoek | +115 / 20s |
| Na fix: 10× `GET /wp-json/` | **delta 0** |
| Na orphan-purge | ~448 uid (alleen gekoppeld aan searches) |

Performance Schema top writer: `INSERT INTO wp_swpext_metrics_ids` (SearchWP Metrics), niet “zoekopdrachten alleen”.

## Wat is live gezet

1. **Plugin** `includes/md-searchwp-headless.php`
   - `searchwp_metrics_skip_uid` op REST / cron / CLI / ajax
   - `searchwp_metrics_log_search` uit op die contexts
   - Metrics retention 90 dagen
   - Helper om orphan UIDs te purgen
2. Orphan UIDs opgeschoond (~446k → ~448)
3. Emergency MU-plugin `md-pause-searchwp-indexer.php` **verwijderd** — indexer weer aan voor nieuwe content
4. `skip-log-bin` blijft aan (geen replicas); vangnet als er ooit weer write-storms komen
5. Search REST cache-headers iets langer (Metrics eiste geen uncached hits meer)

## Indexer

Uitzetten was alleen noodverband. Indexer draait weer met bestaande `searchwp_reduced_indexer_aggressiveness=1`. Nieuwe/gewijzigde content wordt opnieuw geïndexeerd.

## SearchWP Metrics-dashboard

Publieke zoekstatistieken via Metrics op de headless API zijn beperkt (bewust). Gebruik Plausible / eigen analytics voor site-search. Metrics in wp-admin blijft bruikbaar voor eventuele classic/admin searches.

## Follow-up (niet blocking)

- Engines slanker maken (`materials` heeft veel taxonomie-attributen; `product` in `default` heroverwegen)
- `md_search_run` loopt tot 80 SearchWP-pagina’s — later optimaliseren naar één Query
- Bij replicas later: binlog weer aan + korte expire **nadat** Metrics-headless-fix stabiel is
