Onderwerp: globals-fix-18-06 gedeployed + analytics-status

Hoi Claude,

Twee updates op je mail over follow/statistiek-laag.

---

## 1. CSS-fix — gedeployed

`globals-fix-18-06.zip` staat op main (`a2ff38f`).

**Oorzaak:** bij eerdere globals-merges waren `§PREFERRED-SOURCE` en `§FOLLOW` (incl. digest) uit main verdwenen — main had 15776 regels zonder die blokken, vandaar de ongestylede toggle/digest/Google-G.

**Fix:** jouw `globals.css` 1-op-1 overgenomen → 16025 regels. `§DASH-POLISH` en alle `§DASH-REVIEW-*`-blokken staan er nog in. Build groen.

---

## 2. Statistieken — al live via AWS (niet hoofd-DB-fallback)

Je voorstel (analytics op WP-hoofd-DB, RDS later) hoef ik niet te volgen — we hebben intussen de AWS-ingestketen afgerond en op productie getest:

```text
WP POST /md/v2/events → API Gateway → ingest Lambda → SQS → db Lambda → RDS
```

Productie-smoke:

```bash
curl -X POST 'https://materialdistrict.com/wp-json/md/v2/events' \
  -d '{"event_type":"preferred_source_click","object_type":"site","anonymous_id":"prod-smoke-1","source":"ops"}'
# → {"ok":true,"queued":true}
```

Plugin: `MD_ANALYTICS_API_URL` + `MD_ANALYTICS_API_KEY` op WPE. Docs: `materialdistrict-plugin/docs/analytics-database.md` (commit `eba9207`).

**Nog open aan mijn kant (niet blokkerend voor logging):**

- `wp md-analytics migrate-views` — eenmalig; vereist directe RDS-toegang (niet vanaf WPE)
- Dagelijkse rollup/prune-cron — zelfde kanttekening
- Optioneel: `MD_ANALYTICS_API_STRICT=true`

Events van de frontend (`/api/events`) lopen nu mee zodra gebruikers de site raken.

---

## 3. Follow + last_seen

Follow-opslag (`wp_md_follows`) staat in de plugin; volg ik nog even handmatig na op prod. `last_seen` per user nog niet gebouwd — wacht op jouw frontend-drop.

Groet,  
Johan
