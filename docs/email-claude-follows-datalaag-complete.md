Onderwerp: Datalaag + follow — end-to-end status (17-06)

Hoi Claude,

Update: jouw `materialdistrict-frontend-volledig-17-06.zip` staat op main, en de ontbrekende plugin-endpoints zijn er nu ook bij. De contracten uit je mail en `backend-spec-datalaag-follow.md` zijn daarmee aan beide kanten ingevuld.

---

## Wat er nu live staat

### Frontend (main)

Commits: `4abe890` (volledig-17-06 zip) · `c4ba6f5` (followable + proxy-mapping)

- `/api/events` → `POST /md/v2/events` (best-effort; anoniem + ingelogd)
- `/api/follows` → `GET/POST/DELETE /md/v2/follows` (login vereist; snake_case ↔ camelCase in de proxy)
- Google Preferred Source-knoppen (footer + detailpagina's)
- Follow UI: `FollowToggle`, `FollowDigestBlock`, channel-hero
- Brand follow-toggle leest `followable` (geen permissieve default meer)

### Plugin (master)

Commits: `a5e5759` · `9c2a072` · `b2a16e5` (analytics, zie vorige mail) · `acd0521` (follows)

**Events (was al klaar)**

- `POST /md/v2/events` — anoniem + auth, rate limit, identity stitching
- Read: `GET /md/v2/analytics/counts` + `POST /md/v2/analytics/counts/query`
- Rollup-cron + `wp md-analytics migrate-views`

**Follows (nieuw)**

| Endpoint | Body / response |
|----------|-----------------|
| `GET /md/v2/follows` | `{ follows: [{ entity_type, entity_id, types }], mail_frequency }` |
| `POST /md/v2/follows` | `{ entity_type, entity_id, types }` — upsert; optioneel `mail_frequency` |
| `DELETE /md/v2/follows` | `{ entity_type, entity_id }` |
| `PATCH /md/v2/follows/mail-frequency` | `{ mail_frequency }` — klaar voor wanneer de digest-UI frequency wil persisteren |

Opslag: `wp_md_follows` op de hoofd-WP-database (schema auto-create bij eerste load na deploy).  
`mail_frequency` per user in user meta (`md_mail_frequency`, default `weekly`).

Validatie:

- `entity_type`: `channel` | `brand`
- `channel` → `theme`-taxonomy term-id
- `brand` → brand-post; follow alleen als `followable` (zie hieronder)
- `types`: `material` | `story` | `talk` | `book` | `event` | `brand`

Bij follow/unfollow schrijft de API ook analytics-events (`channel_followed` / `brand_followed` / `*_unfollowed`, source `follows_api`).

**Brand REST — `followable`**

- `meta.followable` op het publieke brand-object
- `true` = actieve betaalde membership (`basic` / `plus` / `partner`); anders `false`
- Frontend mapt naar `brand.followable` en gated de toggle daarop

---

## End-to-end: wat nu werkt

| Flow | Status |
|------|--------|
| Preferred Source clicks → `/api/events` → `/md/v2/events` | ✅ code klaar; events tellen mee zodra analytics-DB op prod staat |
| Follow channel/brand (ingelogd) → `/api/follows` → `wp_md_follows` | ✅ werkt op hoofd-DB, geen RDS nodig |
| Brand follow-toggle alleen bij betaalde brands | ✅ via `followable` |
| Follow-digest footer (channel-chips) | ✅ follow-opslag; frequency-UI nog niet gekoppeld aan PATCH |
| Dashboard view counts via analytics | ✅ code klaar; RDS + migrate-views nog Johan |

---

## Nog op mijn bord (infra)

Analytics-events en view-rollups hebben nog steeds de aparte DB nodig (WP Engine heeft geen tweede DB):

1. RDS/Aurora provisionen (zie `materialdistrict-plugin/docs/analytics-database.md`)
2. `MD_ANALYTICS_DB_*` in productie-`wp-config.php`
3. Plugin deployen (incl. `acd0521`)
4. `wp md-analytics migrate-views` + dagelijkse `wp md-analytics rollup`
5. Smoke: `POST /md/v2/events` en een follow-call met JWT

Follow-opslag (`wp_md_follows`) draait los daarvan op de hoofd-DB.

---

## Open / afstemmen op kantoor

**Dubbele follow-events.** Jouw frontend logt `channel_followed` / `brand_followed` via `/api/events` na een geslaagde follow-call; de plugin logt hetzelfde nog eens vanuit `POST /md/v2/follows`. Willen we één bron (client of server)?

**Digest frequency.** `PATCH /md/v2/follows/mail-frequency` staat klaar; `FollowDigestBlock` slaat de gekozen frequency nog niet op. Koppel jij die, of wil je dat in de profiel-flow?

**View-teller-bron.** Zoals in je vorige mail: legacy = post meta `post_views_count`. Stemmen we de event-namen en dashboard-reads daar morgen op af?

**AVG / consent / mailtool.** Ongewijzigd t.o.v. vorige mail — blokkeert follow-opslag niet, wel anonieme events en uiteindelijk de digest.

---

## Nog niet gebouwd

- Gepersonaliseerde digest-cron / mailtool (Sendy-op-SES)
- `anonymous_id`-cookie + consent-wiring aan jouw kant (events-proxy staat al)

---

Laat weten als je iets in de contract-shapes wilt aanpassen voordat we productie-smoke doen. Dan zet ik RDS + migrate-views aan en testen we follow + preferred-source in één ronde.

Groet,  
Johan
