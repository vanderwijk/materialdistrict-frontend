# WordPress-instructies — Articles (story-type, insider-only, channels, related)

> **Voor:** Johan (WordPress-developer).
> **Status:** versie 1.2 — 29-05-2026. **Alles live — geen actie meer nodig.**
> **Vorige versie:** v1.1 (29-05, vragen open) — vervangen.
> **Hoort bij:** frontend-oplevering sessie 6b (Articles, v2-aligned — gaat naar live).

---

## 0. Samenvatting

Dit document is nu een **bevestiging**: alle vijf de punten (D1–D5) zijn aan
WP-kant geregeld en door de frontend aangesloten in sessie 6b. Er is van jouw
kant niets meer nodig. De afvink-checklist (§8) staat volledig aangevinkt op
basis van je 29-05-antwoord.

1. **D1 — story_type-taxonomy** — live (`meta.story_type` + `meta._story_type`).
2. **D2 — insider_only meta** — live (`meta.insider_only` + `meta._insider_only`).
3. **D3 — channels[] op articles** — live (`meta.channels`).
4. **D4 — reading_time_minutes** — optioneel, niet geleverd; frontend rekent zelf (geen blocker).
5. **D5 — SearchWP-related-endpoint** — live.
6. **Talks insider_only (C14)** — al gebouwd (default `true`).

### 0.1 Wat is veranderd t.o.v. v1.1

- **D1-shape definitief:** `story_type` is een **taxonomy**, geëxposeerd op
  **`meta.story_type`** (`{id,slug,label}[]`) plus **`meta._story_type`** /
  `meta.type` als platte canonieke slug. Dit is dus de `meta.*`-route, niet de
  `_embedded`- of `taxonomies.*`-variant uit v1.1.
- **D3-shape definitief:** **`meta.channels`** (`{id,slug,label}[]`) — niet
  `taxonomies.channels` zoals v1.1 voorstelde.
- **D5-shape definitief:** response is een **platte array**
  `{type, id, slug, title, thumbnail, link}` — niet `{ items: [...] }`, en
  zonder de extra type-specifieke velden uit het v1.1-voorstel.
- **D2/C14:** bevestigd dat beide al volledig gebouwd zijn (admin-checkbox +
  REST-exposure).

---

## 1. D1 — story-type-taxonomy ✅ live

WP-taxonomy `story_type` op `article` (gekozen voor query-performance boven
postmeta). Vijf terms, exacte slugs:

| Slug | Label |
|---|---|
| `news` | News |
| `people` | People |
| `collaborations` | Collaborations |
| `projects` | Projects |
| `partner` | Partner stories |

Géén `process`-term.

**Exposure (live):** `meta.story_type` als `{id, slug, label}[]` (canonieke
bron) + `meta._story_type` (en `meta.type`) als platte slug voor backward-compat.
**Filtering:** `?story_type=slug,slug` → tax_query. **Migratie-default:** `news`.

**Frontend:** mapper leest `meta._story_type ?? meta.story_type[0].slug`;
`STORY_TYPE_BACKEND_CONNECTED` staat op `true`.

---

## 2. D2 — `insider_only` meta ✅ live

Admin-checkbox; REST-exposure op `meta.insider_only` (boolean) + alias
`meta._insider_only`. Article-default `false`.

**Frontend:** mapper leest `Boolean(meta._insider_only ?? meta.insider_only)`;
stuurt de `ArticleBodyGate`-paywall + de InsiderMark op de cards.

---

## 3. D3 — channels[] op articles ✅ live

Exposure op `meta.channels` (`{id, slug, label}[]`), zelfde patroon als
`story_type`.

**Frontend:** `channels: TaxonomyTerm[]` op `Article`/`ArticleListItem`,
gevoed naar `ContentCard` via `channelTags` (witte pills onderaan de thumb).

---

## 4. D4 — reading_time_minutes (optioneel, niet geleverd)

Niet meegenomen — prima. De frontend rekent de leestijd zelf uit (200 wpm). Als
je het later alsnog wilt overschrijfbaar maken: `register_post_meta('article',
'_reading_time_minutes', ['type' => 'integer', 'single' => true, 'show_in_rest'
=> true])`. Mapper-werk is dan twee regels; geen blocker.

---

## 5. D5 — SearchWP-related-endpoint ✅ live

`GET /wp-json/md/v2/articles/{slug}/related?limit=N`, live op `.local` en
`.com`. SearchWP Related + taxonomie-overlap-fallback. 1-uur transient cache.
Default limit 6, max 20.

**Response (live):** een platte array van gemixte items:

```json
[
  { "type": "article",  "id": 1234, "slug": "biophilic-timber",   "title": "…", "thumbnail": "https://…", "link": "https://…" },
  { "type": "material", "id": 5678, "slug": "warmwood-classic",   "title": "…", "thumbnail": "https://…", "link": "https://…" },
  { "type": "talk",     "id": 9012, "slug": "regenerative-design", "title": "…", "thumbnail": "https://…", "link": "https://…" }
]
```

**Frontend:** `getRelatedContent(slug, limit)` hookt hierop; `ArticleRelated`
rendert per type een pill (article/material/talk). Onbekende types worden
weggefilterd; bij fout/leeg rendert de sectie niets (faalbestendig).

---

## 6. Talks insider-only (C14) ✅ al gebouwd

`talk.insider_only` op `meta.insider_only`/`_insider_only`, default `true`,
bestaande talks gebackfilld. Wordt opgepakt in sessie 7 (Talks).

---

## 7. Verificatie (al gedraaid)

```bash
curl -s "https://cms.materialdistrict.com/wp-json/wp/v2/article?slug=<SLUG>" | python3 -m json.tool
# meta.story_type / meta._story_type / meta.insider_only / meta.channels aanwezig
curl -s "https://cms.materialdistrict.com/wp-json/wp/v2/article?story_type=people" | python3 -m json.tool | grep '"slug"'
curl -s "https://cms.materialdistrict.com/wp-json/md/v2/articles/<SLUG>/related?limit=6" | python3 -m json.tool
```

---

## 8. Afvink-checklist — afgevinkt (Johan, 29-05)

### D1 — story_type-taxonomy
- [x] Taxonomy `story_type` geregistreerd met `show_in_rest`.
- [x] Vijf terms met exacte slugs: `news`, `people`, `collaborations`, `projects`, `partner`. Géén `process`.
- [x] Exposure op `meta.story_type` (`{id,slug,label}[]`) + `meta._story_type` (platte slug).
- [x] Collectie-endpoint filtert op `?story_type=` (tax_query).
- [x] Migratie-default `news`.

### D2 — insider-only
- [x] `meta.insider_only` (boolean, default `false`) + alias `meta._insider_only` in REST.

### D3 — channels[]
- [x] `meta.channels` (`{id,slug,label}[]`) in REST.

### D4 — reading_time (optioneel)
- [ ] Niet geleverd — frontend rekent zelf (akkoord, geen blocker).

### D5 — SearchWP-related
- [x] SearchWP geïnstalleerd + geconfigureerd voor article + material + talk.
- [x] Endpoint `GET /wp-json/md/v2/articles/{slug}/related?limit=N` gebouwd.
- [x] Response-shape (platte array) geverifieerd.
- [x] 1-uur transient cache actief; default 6, max 20.

### talks insider-only (C14)
- [x] `talk.insider_only` (default `true`) + backfill bestaande talks.

### Afronding
- [x] Velden + endpoint live op `.local` en `.com`.
- [x] Doorgegeven aan Jeroen/Claude → v2-aligned frontend-bundel volgt (deze).
