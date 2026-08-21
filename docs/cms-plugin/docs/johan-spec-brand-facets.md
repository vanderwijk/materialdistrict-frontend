# Johan-spec — Brand facets (X-WP-Total + Country-tellingen)

> Aanvullend op de filter-implementatie die je al hebt gebouwd
> (`?brand_country=` werkt). Twee fixes nodig om het frontend-overzicht
> kloppend te krijgen.

> **Status (29 mei 2026):**
> - **Fix 1 — `X-WP-Total`: ✅ werkte al.** De `brand_country`-filter hangt op
>   `rest_brand_query` (hoofd-query), dus `found_posts`/`X-WP-Total` is correct
>   gefilterd. Geverifieerd op productie: `?brand_country=Belgium` → 105,
>   `Germany` → 336, `Netherlands` → 702, ongefilterd → 2293. De aanname dat
>   "105 = totaal" klopte niet; 2293 is het totaal. **Geen wijziging nodig.**
> - **Fix 2 — Country-facets: ✅ geïmplementeerd** als eigen endpoint
>   `GET /wp-json/md/v2/brands/country-facets` (`rest-brand-facets.php`).
>   Shape `{ "facets": [ { value, label, count } ] }`, alfabetisch op label,
>   alleen `publish`, brands zonder country uitgesloten, 6-uur transient-cache
>   met invalidatie op `save_post_brand` / `deleted_post`.

---

## Fix 1 — `X-WP-Total` header op gefilterde collectie

### Wat er nu gebeurt

Op `GET /wp/v2/brand?brand_country=Belgium`:
- ✅ De response-items zijn correct gefilterd (alleen Belgische brands).
- ❌ De `X-WP-Total` header geeft `105` terug (het totaal-aantal brands).
- Verwacht: het *gefilterde* aantal (in dit voorbeeld 6, of wat het ook is).

### Waarom het belangrijk is

De frontend leest `X-WP-Total` voor twee dingen:
1. De "X brands matching your filters" header.
2. Het totaal-aantal-pagina's voor paginatie (`X-WP-TotalPages`).

Beide tonen nu het ongefilterde totaal, wat de overzichtspagina onbruikbaar
maakt zodra er gefilterd wordt.

### Wat te doen

In het `meta_query`-blok dat je al hebt voor `?brand_country=`: zorg dat
de query-modifier ook wordt toegepast wanneer WP het totaal-aantal berekent
(`found_posts`). Dit gaat normaal vanzelf als de `meta_query` op de
hoofd-`WP_Query` is gehangen i.p.v. ná de query toegepast. Mocht het via
een `posts_clauses`-filter lopen, check dat 'ie ook op de count-query
draait.

Geen REST-schema-wijziging nodig — alleen de query-pipeline.

---

## Fix 2 — Facet-tellingen per land

### Wat de frontend nodig heeft

Bij een brand-overzichts-request: een lijst van alle landen met aantallen,
**onafhankelijk van de huidige country-filter** (de tellingen moeten ook
zichtbaar zijn als er al gefilterd is, zodat de gebruiker andere opties ziet).

### Voorstel — eigen endpoint

```
GET /wp-json/md/v2/brands/country-facets
```

Response:

```json
{
  "facets": [
    { "value": "Belgium",     "label": "Belgium",     "count": 6  },
    { "value": "Germany",     "label": "Germany",     "count": 21 },
    { "value": "Italy",       "label": "Italy",       "count": 10 },
    { "value": "Netherlands", "label": "Netherlands", "count": 14 }
  ]
}
```

### Specificatie

| Veld | Type | Opmerking |
|---|---|---|
| `value` | string | De waarde die de frontend in `?brand_country=` meestuurt (= de label) |
| `label` | string | Display-naam (= leesbare landnaam, bv. "Belgium") |
| `count` | integer | Aantal published brands met deze country |

- **Sortering:** alfabetisch op `label`.
- **Filtering:** alleen `post_status = publish`, conform de hoofd-collectie.
- **Leeg/onbekend:** brands zonder country-veld tellen niet mee.
- **Caching:** OK om server-side te cachen — brand-country verandert zelden. Cache-TTL van een paar uur is prima (matched de bestaande `BRAND_REVALIDATE = 24h` aan onze kant).
- **Geen auth nodig:** publieke endpoint, net als `/wp/v2/brand`.

### Alternatief — header op de bestaande collectie

Als een apart endpoint te veel werk is: een `X-MD-Country-Facets` header
op de bestaande `/wp/v2/brand`-response met dezelfde JSON-payload (URL-
encoded) kan ook. Frontend leest de header dan in dezelfde call. Iets
minder clean, maar geen tweede endpoint nodig.

**Onze voorkeur is het eigen endpoint** — schoner gescheiden, makkelijker
cachebaar, en straks uit te breiden naar andere facets (channels,
application-area) zonder de hoofd-response te vervuilen.

### Waarom in deze vorm en niet `X-WP-Total`-gerelateerd

`X-WP-Total` geeft alleen het totaal van de huidige query. Voor facet-
tellingen heb je per-waarde-aggregaties nodig, die WP standaard niet
levert via REST. Een eigen endpoint (of header) is daarom nodig — zelfde
patroon als FacetWP intern gebruikt voor materials.

---

## Wat de frontend doet zodra deze twee leven

- `X-WP-Total` lezen → "X brands matching your filters" toont juiste aantal + paginatie klopt.
- Nieuwe `/brands/country-facets`-endpoint aanroepen (1 keer per page-load, gecached) → filter-sidebar toont juiste aantallen per land.
- Op dit moment fetcht de frontend zelf alle brands op om de tellingen te schatten — dat valt eruit zodra jouw endpoint live is. Eén bestand aanpassen, paar regels.

---

## Testbaarheid

Als je beide hebt: laat even een test-URL zien (bv. een staging-link) of
roep `?brand_country=Belgium` aan op je dev-omgeving en check de
`X-WP-Total`-header in de Network-tab. Voor het facets-endpoint:
gewoon GET en kijken of de JSON-shape klopt.
