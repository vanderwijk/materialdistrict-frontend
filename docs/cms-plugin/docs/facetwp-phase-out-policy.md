# FacetWP — uitgefaseerd (plugin)

**Status:** juni 2026 — headless `/material` gebruikt geen FacetWP meer.

## Vervanging

| Was (FacetWP) | Nu |
|---------------|-----|
| `POST /facetwp/v1/fetch` | `POST /md/v2/materials/facet-query` (`rest-material-facets.php`) |
| `facetwp-theme-facet.php` | `?theme=<term_id>` op `GET /wp/v2/material` + `theme` slug in facet-query |
| Facet labels uit `facetwp_facets` option | Statisch contract in `rest-frontend-catalogs.php` |

## CMS opschoning

FacetWP-plugin kan **gedeactiveerd/verwijderd** worden op `cms.materialdistrict.com` zodra:

- [x] Next.js `/material` op de nieuwe endpoint draait
- [ ] Legacy WP-theme archive-material (FacetWP shortcodes) is uit traffic of blijft op oude host

Het legacy theme (`archive-material.php`) gebruikt nog FacetWP shortcodes — alleen relevant als dat theme nog ergens live staat.

## Referentie-implementaties (zonder FacetWP)

| Feature | Bestand |
|---------|---------|
| Material facet query | `rest-material-facets.php` |
| Material → brand relatie | `rest-post-meta.php` (`?brand_id=`) |
| Brand country/application facets | `rest-brand-facets.php` |
