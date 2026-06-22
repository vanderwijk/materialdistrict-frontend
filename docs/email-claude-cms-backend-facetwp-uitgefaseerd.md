Onderwerp: Backend verhuisd naar cms.materialdistrict.com + FacetWP uitgefaseerd

Hoi Claude,

Korte infra-update — geen actie nodig aan jouw kant voor bestaande frontend-code.

---

## Backend-URL

WordPress draait nu op een **aparte CMS-host**:

| Was | Nu |
|-----|-----|
| `https://materialdistrict.com/wp-json` (of mainsite) | **`https://cms.materialdistrict.com/wp-json`** |

- Publieke site: `materialdistrict.com` (Next.js op Vercel)
- CMS/API: `cms.materialdistrict.com` (WP Engine, plugin auto-deploy vanaf `materialdistrict-plugin` `master`)

Lokaal/productie: `WP_API_URL=https://cms.materialdistrict.com/wp-json` in `.env.local` / Vercel env.

Alle bestaande REST-contracten (`/wp/v2/*`, `/md/v2/*`) zijn hetzelfde — alleen de host is veranderd.

---

## FacetWP uitgefaseerd

De **FacetWP-plugin is verwijderd** van cms (betere performance, minder plugin-last).

**Jij hoeft hier niets voor aan te passen** in je zip-leveringen:

- De frontend praat al niet meer met `/facetwp/v1/fetch`
- Materials-filtering op `/material` loopt via **`POST /md/v2/materials/facet-query`** (plugin `rest-material-facets.php`)
- Request/response-shape is FacetWP-*compatibel* (zelfde `{ data: { facets, query_args } }` → `{ results, facets, pager }`), maar het endpoint is native WP
- `facetwp.ts`, `types/facetwp.ts` en mappers blijven qua **types en URL-contract** geldig — alleen de backend-URL wijst naar cms + het nieuwe pad

**Niet meer doen in nieuwe batches:**

- Geen FacetWP-aannames, geen re-index-instructies, geen `facetwp_facets` option
- Geen nieuwe FacetWP-facets of plugin-bestanden

**Wel blijven geldig:**

- Filter-sidebar op `/material` (zelfde URL-params: `?material_category=…`, `?channel=…`, `?q=…`, `?sort=…`)
- `listMaterialsWithFacets()` / `fetchMaterialsFiltered()` / `fetchMaterialFacetsBaseline()` — intern al omgezet
- Dashboard material-form property-options via dezelfde baseline-call

---

## Commits (referentie)

| Repo | Commit | Wat |
|------|--------|-----|
| plugin `master` | `1c11e05` | `rest-material-facets.php`, `facetwp-theme-facet.php` verwijderd |
| frontend `main` | `97d7c29` | Client → `/md/v2/materials/facet-query` |

Rooktest cms (na deploy): baseline 3244 materials, filters (renewable/channel), zoeken, sort — alles 200.

---

## Legacy (niet jouw scope)

Het oude WP-theme (`archive-material.php`) gebruikte FacetWP-shortcodes — dat theme staat niet meer op het publieke pad. Headless Next.js is leidend.

---

Kortom: **cms.materialdistrict.com** is de API-host; **FacetWP is weg**; jouw frontend-zips kunnen gewoon door — geen FacetWP-code of -docs meer toevoegen.

Groet,  
Johan
