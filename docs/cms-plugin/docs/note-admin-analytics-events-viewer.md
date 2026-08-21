# Notitie — WP-admin Analytics Events viewer

**Datum:** 6 augustus 2026  
**Status:** live op `cms.materialdistrict.com`  
**Doel:** snelle ops-inzage in AWS event tracking (zeker 404’s), zonder data in WordPress op te slaan

---

## Waar

WP-admin → **Analytics** (menu links, `manage_options` only)

URL: `https://cms.materialdistrict.com/wp-admin/admin.php?page=md-analytics-events`

Preset 404s: `…&page=md-analytics-events&preset=404&event_type=page_not_found`

---

## Architectuur

```text
WP-admin (manage_options)
  → md_analytics_api_list_events()
    → GET https://…execute-api…/analytics/events  (X-MD-Analytics-Key)
      → Lambda md-analytics-db
        → RDS mda_events  (read only)
```

- Geen analytics-rows in de WordPress-database
- Geen API-key in de browser
- Claude’s latere frontend/Atlas kan dezelfde AWS-route hergebruiken

---

## Filters

| Filter | Gebruik |
|--------|---------|
| Event type | o.a. `page_not_found`, `material_viewed`, … |
| Object type | `material`, `site`, … |
| From / To | `Y-m-d` (UTC-range op `occurred_at`) |
| Search | substring in `attributes` JSON (handig voor paths) |
| Presets | 404s only / All recent / Material views |

Bij 404-filter: **Top 404 paths** (aggregate) + recente events met Path-kolom.

---

## AWS

| Item | Waarde |
|------|--------|
| Route | `GET /analytics/events` |
| Lambda | `md-analytics-db` |
| Params | `event_type`, `object_type`, `object_id`, `from`, `to`, `q`, `limit`, `offset`, `aggregate=path\|event_type` |

Deploy Lambda: `docs/aws-lambda-deploy.sh` (of alleen db-zip zoals bij deze release).

---

## Plugin files

- `includes/md-admin-analytics-events.php` — admin UI
- `includes/md-analytics-api.php` — `md_analytics_api_list_events()`
- `aws/md-analytics-db/index.mjs` — list/aggregate handlers
- `materialdistrict.php` — require admin file

---

## Rooktest

1. Open Analytics in WP-admin als administrator  
2. Preset **404s only** → events met paths zichtbaar  
3. Filter `material_viewed` → recente material views  
4. Bevestig: geen nieuwe `wp_md_analytics_*` writes op content-DB
