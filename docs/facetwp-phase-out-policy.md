# FacetWP — uitgefaseerd

**Status:** juni 2026 — headless `/material` gebruikt geen FacetWP meer.  
**Eigenaar:** Johan  
**Doelgroep:** Claude (frontend), Johan (plugin), Jeroen

## Vervanging

| Was (FacetWP) | Nu |
|---------------|-----|
| `POST /facetwp/v1/fetch` | `POST /md/v2/materials/facet-query` (`rest-material-facets.php`) |
| `facetwp-theme-facet.php` | `?theme=<term_id>` op `GET /wp/v2/material` + `theme` slug in facet-query |
| Facet labels uit `facetwp_facets` option | Statisch contract in `rest-frontend-catalogs.php` |

De Next.js-client (`src/lib/api/facetwp.ts`) praat met die MD-endpoint; de bestandsnaam is historisch.

## CMS opschoning

FacetWP-plugin kan **gedeactiveerd/verwijderd** worden op `cms.materialdistrict.com` zodra:

- [x] Next.js `/material` op de nieuwe endpoint draait
- [ ] Legacy WP-theme archive-material (FacetWP shortcodes) is uit traffic of blijft op oude host

Het legacy theme (`archive-material.php`) gebruikt nog FacetWP shortcodes — alleen relevant als dat theme nog ergens live staat.

## Regels voor nieuw werk

1. **Geen** nieuwe FacetWP-facet-keys, `facetwp-*.php`-registraties of FacetWP-fetch-payloads.
2. Filters en telling: eigen WP REST / `/md/v2/` (zie referenties hieronder).
3. Deep-links: query-params op Next-routes die server-side naar REST worden vertaald.

## Referentie-implementaties (zonder FacetWP)

| Feature | Bestand |
|---------|---------|
| Material facet query | `rest-material-facets.php` |
| Material → brand relatie | `rest-post-meta.php` (`?brand_id=`) |
| Brand country/application facets | `rest-brand-facets.php` |

## Gerelateerd

| Onderwerp | Bestand |
|-----------|---------|
| Go-live & FacetWP | `docs/note-go-live-facetwp-uitfaseren.md` |
| Brand REST i.p.v. FacetWP | `docs/email-claude-reply-brand-rest-no-facetwp.txt` |
