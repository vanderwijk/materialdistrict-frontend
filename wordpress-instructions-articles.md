# WordPress-instructies — Articles (story-type + insider-only)

> **Voor:** Johan (WordPress-developer).
> **Doel:** twee velden op de article-CPT ontsluiten in de REST-API, zodat
> de filter-segmentatie en de Insider-paywall op `/articles` live gaan.
> **Status:** versie 1.0 — 28-05-2026.
> **Hoort bij:** frontend-oplevering sessie 6 (Articles). Open-issues W17 + W18.
> **Werkwijze:** zie `architecture-rules.md` §WordPress-werkwijze.
> **Bredere context:** `database-uitbreidingen-instructie-johan.md` §D1/D2.

---

## 0. Samenvatting in één alinea

De `/articles`-pagina's draaien al volledig op de huidige API. Twee features
staan "aan de frontend-kant klaar" maar wachten op een WP-veld: de
**story-type-segmentatie** (D1) en de **Insider-only paywall** (D2). Lever
beide op de article-REST-response en de frontend pikt ze op — story-type
zelfs zonder enige code-wijziging aan mijn kant. Pak ze in één keer mee, het
is hetzelfde stuk werk.

---

## 1. Veld 1 — story-type (D1)

### Wat het stuurt

De segmentatie van articles in subtypen. Op het overzicht stuurt dit de
filter-sidebar en de type-pills; op de detailpagina de category-pill.

### ⚠️ Beslispunt vóór je iets bouwt — welke 5 waarden?

Er zit een discrepantie tussen twee bronnen die we eerst moeten gladstrijken:

| # | `database-uitbreidingen…md` (D1) | De mockup + de gebouwde frontend |
|---|---|---|
| 1 | `news` | `news` |
| 2 | `process` | `people` |
| 3 | `people` | `collaborations` |
| 4 | `projects` | `projects` |
| 5 | `collaborations` | `partner` |

De gebouwde frontend (`src/lib/config/story-types.ts`) volgt de **mockup**:
`news · people · collaborations · projects · partner`. Het verschil zit in
`process` (alleen in de DB-doc) versus `partner` (in de mockup/frontend).

**Actie:** bevestig met de opdrachtgever welke set definitief is.
- Wordt het de mockup-set → dan zijn jouw enum-/term-waarden hieronder correct.
- Komt `process` er (ook) bij → laat het me weten; ik voeg het type toe aan
  `story-types.ts` (label, kleur, icoon). Dat is één klein frontend-bestand.

De **slugs** die de frontend verwacht zijn exact (lowercase, geen spaties):
`news`, `people`, `collaborations`, `projects`, `partner`.

### Aanbevolen implementatie — taxonomy (voorkeur)

Een taxonomy is uitbreidbaar zonder code-deploy en daarom de voorkeur boven
een ENUM. Registreer een taxonomy `story_type` op de `article`-CPT en expose
'm in REST:

```php
add_action('init', function () {
    register_taxonomy('story_type', 'article', [
        'label'        => 'Story type',
        'hierarchical' => false,
        'show_in_rest' => true,   // belangrijk: anders niet in de API
        'rest_base'    => 'story_type',
    ]);
});
```

Maak daarna de vijf terms aan met exact deze slugs: `news`, `people`,
`collaborations`, `projects`, `partner`.

De frontend leest het type uit `meta._story_type`. Lever de term-slug óók als
meta mee (één bron voor de mapper), bijvoorbeeld:

```php
add_action('rest_api_init', function () {
    register_rest_field('article', '_story_type', [
        'get_callback' => function ($post) {
            $terms = wp_get_object_terms($post['id'], 'story_type', ['fields' => 'slugs']);
            return is_wp_error($terms) || empty($terms) ? 'news' : $terms[0];
        },
    ]);
});
```

> Lever je liever een ENUM/string-meta in plaats van een taxonomy, dan is dat
> prima — zolang `meta._story_type` de slug bevat. De frontend kijkt alleen
> naar `meta._story_type`.

### Filtering op de collectie-endpoint

Het overzicht stuurt `?story_type=people` naar `/wp/v2/article`. Zorg dat de
collectie-endpoint die query-param vertaalt naar een filter (tax_query bij een
taxonomy, of meta_query bij een ENUM). Tot dat werkt toont de frontend de
filter wél, maar filtert de lijst nog niet — dat is bewust afgevangen.

### Migratie-default

Bestaande articles zonder type → `news`.

### Wat er aan míjn kant gebeurt

**Niets.** De mapper draait al `toStoryType(m._story_type)`; zodra het veld
gevuld is, mapt het automatisch mee. Ik zet daarna alleen één vlag
(`STORY_TYPE_BACKEND_CONNECTED = true`) om de "indicatieve counts"-hint te
verbergen.

---

## 2. Veld 2 — insider-only (D2)

### Wat het stuurt

De Insider-paywall op de article-detailpagina. Insider-only artikelen tonen
voor niet-members een teaser + upgrade-gate; members zien de volledige tekst.

### Implementatie

Een boolean meta-veld, ontsloten in REST onder `meta._insider_only`:

```php
add_action('init', function () {
    register_post_meta('article', '_insider_only', [
        'type'         => 'boolean',
        'single'       => true,
        'default'      => false,
        'show_in_rest' => true,
    ]);
});
```

- **Type:** boolean
- **Default:** `false` (articles zijn standaard open; Insider-only is de
  uitzondering)
- **Verplicht:** nee (default vult in)

### Wat er aan míjn kant gebeurt

Eén wijziging van twee regels in `mappers.ts`: `insiderOnly: false` →
`insiderOnly: Boolean(m._insider_only)`. Zeg maar wanneer het veld live staat,
dan zet ik het om.

---

## 3. Neem meteen mee — talks insider-only (C14)

Volgende sessie (Talks) heeft exact hetzelfde patroon nodig, alleen met een
**andere default**:

```php
register_post_meta('talk', '_insider_only', [
    'type'         => 'boolean',
    'single'       => true,
    'default'      => true,   // let op: talks zijn standaard Insider-only
    'show_in_rest' => true,
]);
```

- **Default:** `true` (voor talks is Insider-only de regel, niet de
  uitzondering)
- **Backfill:** alle bestaande talks `insider_only = true`; redactie opent
  handmatig waar gewenst.

Het is hetzelfde mechanisme als D2 — als je toch in de mapper/registratie zit,
is dit vijf minuten extra en is sessie 7 alvast unblocked.

---

## 4. Verificatie (na deploy)

Controleer dat de velden echt in de REST-output staan. Pak een bestaande
article-ID of -slug:

```bash
# Vervang <SLUG> door een bestaande article-slug
curl -s "https://<jouw-wp-domein>/wp-json/wp/v2/article?slug=<SLUG>" \
  | python3 -m json.tool | grep -A2 "_story_type\|_insider_only"
```

Verwacht: beide velden aanwezig in `meta`, met respectievelijk een geldige
slug (`news`/`people`/…) en een boolean.

Filter-check (story-type), zodra de collectie-filtering werkt:

```bash
curl -s "https://<jouw-wp-domein>/wp-json/wp/v2/article?story_type=people" \
  | python3 -m json.tool | grep '"slug"'
```

Verwacht: alleen articles van type `people`.

---

## 5. Afvink-checklist

**story-type (D1)**
- [ ] Definitieve 5 waarden bevestigd met opdrachtgever (`process` vs `partner`).
- [ ] Eventuele afwijking van de mockup-set aan Jeroen/Claude doorgegeven.
- [ ] Taxonomy `story_type` (of ENUM-meta) geregistreerd met `show_in_rest`.
- [ ] Vijf terms aangemaakt met exacte slugs: `news`, `people`, `collaborations`, `projects`, `partner`.
- [ ] `meta._story_type` levert de slug op de article-response.
- [ ] Collectie-endpoint filtert op `?story_type=`.
- [ ] Migratie-default `news` toegepast op bestaande articles.

**insider-only (D2)**
- [ ] `register_post_meta('article', '_insider_only', …)` met `show_in_rest` + default `false`.
- [ ] `meta._insider_only` zichtbaar in de REST-output.

**talks insider-only (C14) — optioneel meteen meenemen**
- [ ] `register_post_meta('talk', '_insider_only', …)` met default `true`.
- [ ] Backfill: bestaande talks op `true`.

**afronding**
- [ ] curl-verificatie geslaagd (beide velden in `meta`).
- [ ] Aan Jeroen/Claude doorgegeven dat de velden live staan → dan zet ik de
      `insiderOnly`-mapperregel om en flip ik de story-type-vlag.
