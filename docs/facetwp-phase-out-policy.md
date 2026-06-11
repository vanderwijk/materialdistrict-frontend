# FacetWP — gebruiksbeleid & uitfasering

**Status:** actief beleid (juni 2026)  
**Eigenaar:** Johan  
**Doelgroep:** Claude (frontend), Johan (plugin), Jeroen

---

## Samenvatting

We **vermijden nieuwe afhankelijkheden** op de FacetWP-plugin. Bestaande materials-filters op `/materials` blijven voorlopig op FacetWP draaien (historisch). **Alle nieuwe filter-, relatie- en archief-functionaliteit** bouwen we via **eigen WP REST-queries** of **custom `/md/v2/`-endpoints**.

FacetWP wordt op **termijn uitgefaseerd** zodra de materials-property-filters zijn vervangen door native REST (of dedicated MD-endpoints).

---

## Wat nog wél FacetWP gebruikt (legacy)

| Onderdeel | Route / mechaniek | Opmerking |
|-----------|-------------------|-----------|
| Materials property-filters | `POST /facetwp/v1/fetch` via `listMaterialsWithFacets()` | ~20 facets (sensorial, technical, environmental, …) |
| Channel op materials | FacetWP-facet `theme` + plugin `facetwp-theme-facet.php` | URL `?channel=<slug>` → `selection.theme` |
| Filter-sidebar counts | FacetWP baseline + filtered merge | `mapFacetWPToFilterSections()` |

**Niet** via FacetWP (eigen REST):

| Onderdeel | Mechaniek |
|-----------|-----------|
| Brand-materials relatie | `GET /wp/v2/material?brand_id=<id>` (`rest-post-meta.php`) |
| `/materials?brand=<slug>` | Slug → `getBrand()` → `listMaterials({ brand_id })` — **geen FacetWP** |
| Brands-overzicht filters | `GET /md/v2/brands/country-facets`, `application-facets` |
| Talks, articles, events, brands channel-bar | `GET /wp/v2/{cpt}?theme=<term_id>` |
| More from brand, brand-detail grid | `listMaterialsByBrand()` → REST `brand_id` |

---

## Regels voor nieuw werk

### Frontend (Claude)

1. **Geen nieuwe FacetWP-facet-keys** toevoegen aan `ALL_MATERIAL_FACET_KEYS` / `FacetSelection`.
2. **Geen nieuwe `facetwp-*.php`-facets** vragen of ontwerpen — tenzij expliciet goedgekeurd door Johan (uitzondering: bestaand legacy-pad).
3. Voor **relatie-queries** (brand, author, “meer van X”): gebruik `listMaterials()` met bestaande REST-params of vraag Johan om een query-param / `/md/v2/`-endpoint.
4. Voor **filter-tellingen op niet-materials-overzichten**: volg het brands-patroon (`rest-brand-facets.php`) — eigen endpoint, gecachte facet-shape `{ value, label, count }`.
5. Deep-links: **query-params op Next-routes** die server-side naar REST worden vertaald — niet naar FacetWP-payloads.

### Plugin (Johan)

1. Geen nieuwe `facetwp-*-facet.php`-registraties zonder expliciete legacy-reden.
2. Nieuwe filters: `rest_*_query`-filters, collection params, of `/md/v2/`-routes in `materialdistrict-plugin`.
3. Referentie-implementaties:
   - `rest-post-meta.php` — `brand_id` op material-collectie
   - `rest-brand-facets.php` — country/application facets zonder FacetWP
   - `facetwp-theme-facet.php` — **alleen** legacy channel op materials (later migreren)

---

## Migratiepad (toekomst)

1. **Kort termijn:** FacetWP alleen voor bestaand `/materials`-filtergrid; alles nieuw via REST.
2. **Middellang:** property-filters één voor één naar REST of `/md/v2/material-facets`-achtig endpoint; sidebar-counts uit eigen aggregator.
3. **Eindstaat:** FacetWP-plugin deactiveren; `lib/api/facetwp.ts` verwijderen of reduceren tot shim.

Geen harde deadline — wel **richting**: elke nieuwe feature mag FacetWP niet vergroten.

---

## Case study: brand-filter (juni 2026)

**Was (kort live):** FacetWP-facet `brand` + `facetwp-brand-facet.php` + `selection.brand` in FacetWP-fetch.

**Nu:** `facetwp-brand-facet.php` verwijderd (plugin `3f820e1`). Frontend `057a8a8`:

- `/materials?brand=<slug>` → `listMaterialsForBrandArchive()` → REST `?brand_id=`
- URL-contract voor Claude **ongewijzigd** (`?brand=<slug>`)
- Geen FacetWP-index nodig

Zie `email-claude-reply-brand-rest-no-facetwp.txt`.

---

## Gerelateerde docs

| Onderwerp | Bestand |
|-----------|---------|
| Brand REST relatie | `rest-post-meta.php` (plugin), handoff 27-05-2026 |
| Brand country facets (zonder FacetWP) | `docs/johan-spec-brand-facets.md` (plugin) |
| Materials FacetWP client | `src/lib/api/facetwp.ts`, `architecture-rules.md` |
| Channel materials (legacy FacetWP) | `docs/MANIFEST-channelbar-materials.md` |
