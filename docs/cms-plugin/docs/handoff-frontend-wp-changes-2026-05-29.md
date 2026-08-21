# Handoff — WP REST-wijzigingen voor de frontend (29 mei 2026)

> Van: Johan (WordPress) → Next.js-agent.
> Alle onderstaande wijzigingen zitten in de `materialdistrict-plugin` en zijn
> lokaal getest. Na plugin-deploy + (waar genoemd) een index-/seed-stap zijn ze
> live op `materialdistrict.com`.

---

## 1. Article story-type → custom taxonomy (was meta-ENUM)

**Wat veranderde:** `story_type` is nu een echte WP-taxonomy op `article`
(betere query-performance via `tax_query` i.p.v. `meta_query`). De oude
`_article_type` post meta is verwijderd; er was geen productiedata om te migreren.

**REST-exposure op `/wp/v2/article`:**

```json
"meta": {
  "story_type": [ { "id": 42, "slug": "people", "label": "People" } ],
  "type": "people",
  "_story_type": "people"
}
```

- `meta.story_type` — array van `{id, slug, label}`, exact hetzelfde patroon als
  `meta.channels`. Leeg → `[]`.
- `meta.type` + `meta._story_type` — platte canonieke slug (string), voor
  backward-compat. Geen term → `news`.
- Canonieke slugs: `news | people | collaborations | projects | partner`
  (legacy `process` wordt server-side `partner`).

**Filter (collectie):** `GET /wp/v2/article?story_type=people,projects`
(komma-gescheiden, `tax_query`). `news` omvat ook artikelen zónder term.

**Mapper-advies:** lees `meta._story_type` (string) óf `meta.story_type[0]?.slug`
— beide leveren de canonieke slug. De bestaande mapper (`m._story_type ?? m.type`)
blijft werken.

**Deploy-stap:** seeder maakt de 5 terms automatisch aan bij de eerstvolgende
`init`. Geen handmatige actie.

---

## 2. Article related-content endpoint (nieuw)

```
GET /wp-json/md/v2/articles/{slug}/related?limit=N
```

**Response:** array van gemengde content-types.

```json
[
  {
    "type": "article",
    "id": 1234,
    "slug": "some-entry",
    "title": "Some entry",
    "thumbnail": "https://…-600x400.jpg",
    "link": "https://materialdistrict.com/article/some-entry/"
  }
]
```

- `type` ∈ `article | material | talk`.
- `thumbnail` = featured image (size `medium`) of `null` (geen featured image).
- Powered by **SearchWP Related** met een taxonomie-overlap-fallback
  (`sector`/`theme`/`post_tag`) als SearchWP leeg/niet-beschikbaar is.
- `limit`: default 6, max 20. Response 1 uur gecached (transient).
- 404 als de slug geen gepubliceerd artikel is.

**Let op (huidige config):** de SearchWP-engine indexeert nu alleen Articles,
dus het endpoint geeft momenteel **article-only** terug. Dat matcht het huidige
"Related articles"-blok (article-only, story-type-pill + `/articles/`-link).
Wil je later een gemengd related-blok (article+material+talk), dan voegt Johan
Materials/Talks aan de engine toe — **geen code-wijziging** aan dit endpoint nodig.

---

## 3. Brand company-film + downloads (nieuw, op `/wp/v2/brand`)

Conform `docs/johan-spec-brand-video-downloads.md`.

```json
"meta": {
  "video_url": "https://www.youtube.com/watch?v=…",
  "downloads": [
    { "type": "brochure", "url": "https://…/file.pdf", "title": "Company brochure 2026", "file_size": 2456789, "insider_only": false }
  ]
}
```

- `meta.video_url` — vrije URL (YouTube/Vimeo; provider-detectie aan frontend-kant).
  Leeg → `""`.
- `meta.downloads` — altijd array (`[]` als leeg). Per item:
  - `type` ∈ `brochure | catalogue | sustainability_report | price_list | other`
    (onbekend → `other`).
  - `url` (verplicht), `title` (`null` als leeg → frontend leidt af uit `type`),
    `file_size` (integer bytes of `null`), `insider_only` (boolean, default `false`).

**Geen admin-UI** (komt via brand-dashboard). Test-content vullen via WP-CLI:

```bash
wp post meta update <BRAND_ID> video_url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
wp post meta update <BRAND_ID> downloads '[{"type":"brochure","url":"https://…/a.pdf","title":"Brochure","file_size":2456789,"insider_only":false}]' --format=json
```

---

## 4. Brand country-facets endpoint (nieuw)

Conform `docs/johan-spec-brand-facets.md`.

```
GET /wp-json/md/v2/brands/country-facets
```

```json
{ "facets": [ { "value": "Belgium", "label": "Belgium", "count": 92 } ] }
```

- Per-land aantallen, **onafhankelijk** van de actieve `?brand_country=`-filter.
- `value` = de label die je in `?brand_country=` terugstuurt.
- Alfabetisch op label, alleen `publish`, brands zonder country uitgesloten.
- 6-uur cache; publiek. Vervangt de frontend-workaround die nu alle brands
  ophaalt om te tellen.

**`X-WP-Total` op `/wp/v2/brand?brand_country=…` werkte al** — correct gefilterd
(Belgium=105, NL=702, totaal=2293). Geen wijziging.

---

## 5. Bestaand maar mogelijk nog niet gekoppeld in de frontend

- **`article.insider_only` (D2)** en **`talk.insider_only` (C14)** zijn aan
  WP-kant al volledig gebouwd: `meta.insider_only` (boolean) + `meta._insider_only`
  (alias). Article default `false`, talk default `true`. Frontend-vlaggen als
  `STORY_TYPE_BACKEND_CONNECTED` en de "voorlopig false tot Johan koppelt"-comments
  kunnen aan/weg.

---

## Snelle verificatie na deploy

```bash
curl -s "https://materialdistrict.com/wp-json/wp/v2/article?story_type=people&per_page=1" | jq '.[0].meta | {story_type, type, _story_type}'
curl -s "https://materialdistrict.com/wp-json/md/v2/articles/<ARTICLE-SLUG>/related?limit=4" | jq
curl -s "https://materialdistrict.com/wp-json/wp/v2/brand/<BRAND_ID>" | jq '.meta | {video_url, downloads}'
curl -s "https://materialdistrict.com/wp-json/md/v2/brands/country-facets" | jq '.facets[:5]'
```
