# Notitie — FacetWP uitfaseren vóór go-live Next.js frontend

**Datum:** juni 2026  
**Status:** teambesluit / richting  
**Eigenaar:** Johan (plugin + hosting), afstemming met Next.js-developer en Jeroen

---

## Kern

**Voordat we de nieuwe Next.js frontend productie-wide live zetten** (cutover van het huidige WordPress-thema naar Vercel), willen we **FacetWP uitgefaseerd** hebben op het materials-filterpad.

**Motief:**

1. **Laadsnelheid** — `/materials` doet per request meerdere FacetWP-calls plus REST; dat is structureel zwaarder dan eigen queries (zie `performance-load-time-analysis.md`).
2. **Minder plugins** — we willen de stack zo **plugin-arm** mogelijk houden; FacetWP is een grote, gespecialiseerde dependency die we niet nodig hebben in de headless architectuur.
3. **Eén filtermodel** — REST + eigen `/md/v2/`-endpoints sluiten aan bij brands, channels op andere CPT’s, en het FacetWP-beleid in `facetwp-phase-out-policy.md`.

---

## Huidige situatie (twee frontends)

| Frontend | FacetWP nodig? | Reden |
|----------|----------------|-------|
| **Bestaand WordPress-theme** (live site) | **Ja, voorlopig** | Historisch filtergedrag op materials; theme is daarop gebouwd. |
| **Nieuwe Next.js frontend** (Vercel) | **Nee, op termijn** | `/materials` gebruikt FacetWP nog **alleen** voor property-filters + channel→`theme` — rest al REST. |

FacetWP blijft **op WP Engine geïnstalleerd** zolang het legacy theme live is. Dat is acceptabel **tijdens de overgang**. Het doel is: **bij go-live van Next.js niet langer afhankelijk zijn** van FacetWP voor de publieke materials-ervaring.

---

## Wat “uitgefaseerd” concreet betekent

FacetWP mag **deactiveren** (of verwijderen) zodra het volgende vervangen is:

| Nog FacetWP | Vervanging (richting) |
|-------------|------------------------|
| ~20 property-facets op `/materials` | Eigen REST-filter + facet-counts (patroon: `rest-brand-facets.php` of `/md/v2/material-facets`) |
| Channel op materials (`facetwp-theme-facet.php`, `?channel=` → `theme`) | `?theme=<term_id>` op material-collectie (zelfde als talks/articles/brands) |
| `listMaterialsWithFacets()` / `facetwp.ts` | Orchestrator op pure REST |

**Al vervangen (geen FacetWP):** brand-materials (`?brand_id=`, `?brand=<slug>`), brands-filters, overige overzichtspagina’s.

---

## Go-live criterium (voorkeur)

**Voorkeur team:** go-live Next.js frontend pas wanneer:

- [ ] `/materials` volledig werkt **zonder** `POST /facetwp/v1/fetch`
- [ ] Filter-sidebar (counts + selectie) fed door **eigen API**
- [ ] Performance-baseline gemeten (TTFB `/materials` p95) — zie performance-doc
- [ ] Legacy theme kan FacetWP verliezen **of** cutover is zo gepland dat theme direct uit traffic gaat

**Pragmatisch:** als go-live eerder **moet**, minimaal een **expliciete uitzondering** vastleggen (who/when/technical debt) — niet stilzwijgend FacetWP meenemen als permanente oplossing.

---

## Waarom niet “FacetWP laten staan na go-live”

- Elke filtercombinatie op `/materials` blijft **2+ zware WP-calls** kosten.
- FacetWP-index, admin en upgrades blijven **operationele last**.
- Nieuwe features worden **twee sporen** (REST + FacetWP) — we hebben dat bewust afgesloten (zie brand-case, juni 2026).
- Headless stack hoort **REST-first**; plugins alleen waar WordPress core het niet kan.

---

## Volgorde werk (voorstel)

1. **Nu:** geen nieuwe FacetWP-facets; nieuw werk REST (beleid actief).
2. **Plugin:** material-facet-endpoint(s) + query-filters voor property-velden; cache/invalidatie.
3. **Next.js:** `listMaterialsWithFacets` vervangen door REST-orchestrator; sidebar mapper aanpassen.
4. **Channel materials:** `theme`-filter op REST i.p.v. FacetWP-facet.
5. **Test:** pariteit filters, counts, URLs, performance.
6. **Go-live Next.js** + legacy theme uit / redirect.
7. **FacetWP plugin deactiveren** op WP Engine (legacy theme niet meer nodig).

---

## Gerelateerde docs

| Onderwerp | Bestand |
|-----------|---------|
| FacetWP-beleid (geen nieuw werk) | `facetwp-phase-out-policy.md` |
| Laadsnelheid & FacetWP-impact | `performance-load-time-analysis.md` |
| Plugin-kant (kort) | `materialdistrict-plugin/docs/facetwp-phase-out-policy.md` |
