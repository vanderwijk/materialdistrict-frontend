# Backend-spec — datalaag + follow-opslag

*De detail achter de mail. De **contracten** (wat de frontend stuurt en terugleest) liggen vast — die bepaalt de frontend. De **invulling** (engine, tabellen, cron, migratie) is aan jou; per onderdeel staat een concrete **suggestie** als startpunt — neem of laat. Genuine onbekenden staan expliciet als "samen" / "aansluiten op jouw bron".*

## Aanhaken op wat er al staat

- WP-namespace `/md/v2/…`; de Next-proxy leest de HttpOnly-auth-cookie en stuurt 'm door als Bearer.
- Client camelCase ↔ WP snake_case.
- Error-vorm `{ code, message }` + HTTP-status (zoals `md_invalid_request` 400, `md_unauthorized` 401).
- **Precedent:** `POST /md/v2/interactions/events` (ingelogd-only, types `website_click` / `brochure_download`). De nieuwe events-endpoint is hiervan de generieke, anoniem-vriendelijke opvolger.

---

## 1. Events-endpoint (generiek)

Het belangrijkste verschil met het precedent: **accepteert ook anonieme events** — geen cookie verplicht.

`POST /md/v2/events`

Request (snake_case, zoals WP 'm binnenkrijgt):

```
{
  "event_type":   "material_viewed",   // zie taxonomie in het datalaag-plan
  "object_type":  "material",           // material|story|brand|talk|event|book|channel|site|search
  "object_id":    "1234",               // id of slug; leeg toegestaan voor search/site
  "anonymous_id": "abc-123",            // verplicht als er geen ingelogde user is
  "session_id":   "sess-xyz",
  "source":       "organic",            // herkomst/plek (footer, article, newsletter, organic, …)
  "attributes":   { }                   // optioneel, event-specifiek (zie onder)
}
```

- `user_id` leidt WP zelf af uit de Bearer-cookie als die er is; anders telt `anonymous_id`. Bij login/registratie stitcht WP `anonymous_id` → `user_id`, zodat eerder gedrag meekomt.
- `timestamp` zet WP server-side (niet de client vertrouwen).
- Best-effort: 2xx met lichte body; validatiefout → `{ code, message }` 400. Geen harde rate-limit nodig, wel basisbescherming tegen flooding.
- `attributes`-voorbeelden:
  - `search_performed`: `{ "query": "...", "facets": { "application": [...], "properties": [...] } }`
  - `channel_followed` / `brand_followed`: `{ "types": ["material","story","talk"] }`
  - `preferred_source_click`: `{}` (de plek zit al in `source`)

**Suggestie:** houd de insert zo licht mogelijk — één INSERT, geen zware verwerking inline (rollup en stitching gebeuren elders). Loopt de schrijflast ooit op, dan een simpele buffer/queue ertussen; voor nu niet nodig.

De frontend stuurt naar de proxy `/api/events` (bouw ik), camelCase; de proxy mapt naar snake_case en forwardt — met cookie als die er is, zonder als anoniem.

---

## 2. Eventlaag + samenvattingen

**Ruwe eventtabel** — één regel per gebeurtenis:
`id, occurred_at, user_id (nullable), anonymous_id (nullable), event_type, object_type, object_id, session_id, source, attributes (json)`.
Indexen op `(object_type, object_id, occurred_at)` en `(event_type, occurred_at)`.

**Samenvattingstabel(len)** — rollup per dag per `(object_type, object_id, event_type)` → count; voor follows ook per channel/brand. Grain: dag.

**Leespatroon:** dashboards lezen de samenvattingen en tellen "vandaag tot nu toe" live uit de ruwe laag bovenop. Zo praktisch real-time, zonder de ruwe laag bij elke load te bevragen.

**Suggestie (engine/plek):** voor nu een aparte MySQL-database — of, als een tweede DB op jullie WP Engine-setup lastig is, een aparte tabel-set met eigen prefix op dezelfde instance. Dichtbij, geen nieuwe infra, en de tweelaags-opzet houdt de query-last laag. Piekt het volume later, dan kan er een analytics-store (bv. ClickHouse) achter; doordat dashboards alleen de samenvattingen lezen, raakt die overstap de frontend niet. Mijn lead: begin simpel op MySQL.

---

## 3. Rollup-cron

Vult de samenvattingen tot en met gisteren; "vandaag" komt live uit de ruwe laag.

**Suggestie:** een nachtelijke job die "gisteren" wegrolt. Draai 'm via een echte system-cron (WP Engine's cron) in plaats van WP-cron — WP-cron hangt aan paginabezoek en is voor dit te wisselvallig. Als de "vandaag"-live-telling op drukke dashboards te zwaar wordt, een lichte intraday top-up elke 15–30 min toevoegen; begin zonder.

---

## 4. Migratie bestaande tellers

De huidige view-tellers → per object één basisregel in de samenvattingstabel met label "tot-migratie", datum = go-live. Granulaire historie begint daarna; de oude totalen blijven zo behouden.

**Vorm van het script (suggestie):** een eenmalig WP-CLI-script dat per object (material/story/brand/…) de huidige tellerwaarde leest en wegschrijft als één samenvattingsregel: `object_type, object_id, event_type='viewed', count = <teller>, day = go-live`.

*Waar de teller WP-zijdig staat weet jij beter dan ik — dat zit in jouw deel van de codebase, niet in de frontend. Gangbaar is een post-meta-key (zoiets als `_md_views` / `view_count`) of een eigen tellertabel; plug het script op de echte bron. Zeg even welke het is, dan stem ik de event-namen daarop af.*

---

## 5. Follow-opslag + endpoints

**Tabel `follows`:** `user_id, entity_type ('channel'|'brand'), entity_id, types (json-array content-types), created_at`. Unieke sleutel `(user_id, entity_type, entity_id)`.

**Globale frequentie** op user-niveau: `mail_frequency ('daily'|'weekly'|'monthly', default 'weekly')`. Eén per gebruiker, niet per follow.

**Suggestie (waar):** `mail_frequency` als één user-meta-veld (of in jullie bestaande user-settings, als dat er al is) — geen aparte tabel nodig voor één waarde.

Endpoints (camelCase aan de proxy-kant, snake_case naar WP):

- `POST /md/v2/follows` — body `{ entity_type, entity_id, types }` → maakt/updatet de follow. Login vereist.
- `DELETE /md/v2/follows` — body `{ entity_type, entity_id }` → ontvolgt. Login vereist.
- `GET /md/v2/follows` — lijst van de ingelogde user: `[{ entity_type, entity_id, types }]` + de globale `mail_frequency`.
- `PATCH /md/v2/me/mail-frequency` (of via het bestaande profiel-endpoint) — body `{ mail_frequency }`.

Bij elke follow/unfollow ook een event wegschrijven (`channel_followed` / `brand_followed`) met `types` in `attributes`.

---

## 6. "Is deze brand volgbaar" (membership)

De frontend leest dit alleen — WP rekent. Voorstel: een boolean **`followable`** op het publieke brand-object (de brand-REST-response die de channel-pill en detailpagina al ophalen). WP berekent 'm uit de brand-membership-tier:

- `followable = tier ∈ {basis, plus, partner}` (betaald), niet voor `free`.

Tier-namen volgen jullie `ManufacturerTier` (`free|basis|plus|partner`). Het brand-membership-blok stond in de types nog als "Fase 2, shape nog niet vast" — dit is het moment om minimaal `followable` (en eventueel `tier`) hard op de response te zetten.

---

## 7. Open knopen (samen te beslissen)

**AVG / anonieme events.**
Suggestie als startpunt voor jou + juridisch: `anonymous_id` als pseudonieme first-party cookie (random UUID, geen PII), gezet onder de analytics-consentcategorie van de cookiebanner. Bewaartermijn op de ruwe eventlaag bv. ~14 maanden (genoeg voor jaar-op-jaar), daarna prunen; de samenvattingen zijn geaggregeerd en niet-herleidbaar en mogen langer blijven. Bij intrekken consent: cookie niet meer zetten, anonieme events stoppen.

**Mailtool.**
Suggestie: gezien SES al draait is **Sendy** de meest voor de hand liggende keuze — het verstuurt rechtstreeks via SES (lage kosten per mail) en doet lijsten, segmenten, automation en RSS-to-email, precies wat de digest nodig heeft. **MailPoet** is WP-native en prettig geïntegreerd, maar koppelt sterker aan WP en de verzend-/automation-tiers lopen op. **Managed (MailerLite / Brevo)** als je liever niets zelf host. Mijn lead: Sendy-op-SES. Blokkeert dit fundament niet — de follow-laag kan vooruit.

---

## Wat ik (frontend) hierop bouw

De `/api/events`-proxy (anoniem + ingelogd), de `anonymous_id`-cookie, alle event-afvuringen, de follow-UI met de `/api/follows`-proxy, en de dashboards die de samenvattingen lezen. Daar heb je niks voor nodig tot het er staat.
