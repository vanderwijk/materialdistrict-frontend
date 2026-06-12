# Laadsnelheid — analyse & aanbevelingen

**Datum:** juni 2026  
**Doel:** uitleg waarom pagina’s traag kunnen aanvoelen, en wat **Johan (WordPress/plugin)** vs **Next.js-developer (Vercel)** kan doen.  
**Geen code-wijzigingen in dit document** — alleen diagnose en prioriteiten.

---

## Kort antwoord

Traagheid komt **niet** uit één laag. De site is een **keten**:

```text
Browser → Vercel (Next.js, Frankfurt fra1) → WordPress REST / FacetWP (WP Engine) → MySQL
```

Elke pagina doet vaak **meerdere HTTP-calls** naar WordPress. In de codebase staat expliciet dat één WP-fetch **~150–400 ms** kost (`src/lib/api/wordpress.ts`, `content.ts`). Een detailpagina met 4–6 calls kan op een **cache miss** al **0,6–2+ seconden TTFB** kosten — vóór HTML naar de browser gaat.

**Johan** kan vooral de **WordPress-kant sneller maken** (minder/z lichtere responses, caching, queries).  
**Next.js-developer** kan vooral **Vercel-caching, request-waterfalls en rendering** optimaliseren.  
**Beide** moeten weten dat **geo-latency** (Frankfurt ↔ WP Engine-locatie) per request meetelt.

---

## Hoe een pagina nu laadt (vereenvoudigd)

### Statische/detail routes (bijv. `/materials/[slug]`)

1. Vercel start Server Component render.
2. Next.js haalt data op via `fetch()` naar `materialdistrict.com/wp-json/...`.
3. Vaak **meerdere calls na elkaar of parallel**:
   - material op slug
   - attachments/gallery
   - brand-naam
   - taxonomie-termen (tags, categories)
4. HTML wordt opgebouwd en teruggestuurd.
5. Browser laadt CSS/JS/fonts/images (images via `next/image` → extra optimalisatiestap).

Met Next **Data Cache** (ISR/`revalidate`) worden stappen 2–3 **hergebruikt** tot de revalidate-tijd verloopt. **Zonder cache hit** betaal je elke keer de volledige WP-latency.

### Filter-/overzichtspagina’s (bijv. `/materials`, `/brands`, `/articles`)

Deze lezen **`searchParams`** (`?page=`, filters, `q=`). In Next.js App Router betekent dat: **dynamische server-render per unieke URL**, geen statische HTML uit build-time.

Voorbeeld **`/materials`** (`listMaterialsWithFacets`):

| Stap | Call | Opmerking |
|------|------|-----------|
| 1+2 (parallel) | FacetWP filtered + FacetWP baseline | 2× POST naar `/facetwp/v1/fetch` |
| 3 | `GET /wp/v2/material?include=…` | Batch na FacetWP-IDs |
| 4 (parallel) | Media + brand-namen | Extra REST |

→ **4+ round-trips** naar WordPress op cache miss. FacetWP is doorgaans **zwaarder** dan platte REST.

### Homepage (`/`)

- `revalidate = 600` (10 min) — relatief goed gecached.
- `Promise.all` over materials, articles, events, talks — **parallel**, dat is goed.
- Nog steeds 4 WP-calls op cold render.

---

## Eerste check (5 minuten) — vaak over het hoofd gezien

### `WP_CACHE_DISABLED` op Vercel production

In `wordpress.ts` / `facetwp.ts`:

- `WP_CACHE_DISABLED=true` → **elke** fetch = `cache: 'no-store'` → **geen Next Data Cache**.
- In productie logt de app een **console.warn** als dit aan staat.

**Actie Next.js-developer:** in Vercel → Project → Settings → Environment Variables controleren dat `WP_CACHE_DISABLED` **niet** `true` is op **Production** (Preview mag het voor debug).

Als dit per ongeluk aan staat, voelt de hele site “altijd traag” terwijl de code juist voor caching is gebouwd.

---

## Waar zit de bottleneck? — Diagnose

| Symptoom | Waarschijnlijke oorzaak | Wie |
|----------|-------------------------|-----|
| Eerste load traag, refresh sneller | Next ISR/Data Cache werkt; cold miss normaal | Beide |
| Alles altijd traag | `WP_CACHE_DISABLED`, of WP zelf traag | Next / Johan |
| Alleen `/materials` traag | FacetWP + dubbele fetch + include-batch | Beide (FacetWP = WP) |
| Alleen detailpagina’s traag | Meerdere sequentiële REST-calls (gallery, terms) | Beide |
| Alleen afbeeldingen traag | CDN/origin, image sizes, LCP | Meestal assets/WP uploads |
| Lokaal sneller dan productie | Geen Vercel-cache; dev anders dan prod | Verwacht gedrag |

**Meten (Next.js-developer):**

1. Chrome DevTools → Network → document-TTFB en waterfall.
2. Vercel → Speed Insights / Observability (function duration).
3. Server-side timing: tijdelijk loggen hoelang `listMaterialsWithFacets` / `getMaterialDetail` duurt (niet in prod laten staan zonder reden).

**Meten (Johan):**

1. Query Monitor of WP Engine performance tools op **staging/production**.
2. `curl -w "%{time_total}\n" -o /dev/null -s "https://materialdistrict.com/wp-json/wp/v2/material?per_page=1"` — baseline REST.
3. Vergelijk FacetWP POST vs simpele REST GET.

---

## Aanbevelingen — Johan (WordPress / plugin)

Johan heeft **geen directe controle over Vercel**, maar wel over **hoe snel en hoe zwaar** de API antwoordt. Dat is vaak het grootste hefboompunt bij cache miss.

### 1. REST-responses verlichten (hoge impact)

List-endpoints sturen soms **meer velden dan de UI nodig heeft** (content, lange meta). Elke byte kost parse-tijd aan beide kanten.

- Overweeg **`_fields`** of dedicated “light” shapes voor list/grid (id, slug, title, featured_media, minimale meta).
- Detail-endpoint mag rijk blijven; list-endpoints moeten mager.

*Referentie in frontend:* `list-light` / bewust kleine article-fetch in `wordpress.ts` (comment over 2 MB cache-limiet).

### 2. Minder round-trips via samengestelde endpoints (hoge impact)

Detailpagina’s doen nu: material → attachments → brand → terms. Dat zijn **4+ requests** vanuit Frankfurt.

Plugin kan bieden:

- `GET /md/v2/materials/{slug}/detail` — één payload met gallery URLs, brand summary, category labels.
- Vergelijkbaar voor `brand/{slug}/detail` (nu ook `listBrands(100)` voor prev/next op detail).

**Johan kan dit incrementeel doen** zonder frontend meteen te breken (frontend schakelt orchestrator om zodra endpoint live is).

### 3. Server-side caching in plugin (middel–hoog)

Er zijn al transients voor o.a.:

- `rest-frontend-catalogs.php` (material-channels, story types, …)
- `rest-brand-facets.php` (country/application facets)
- `rest-articles-related.php`

**Nog niet overal:** individuele material/brand REST-responses, zware meta-aggregaties, FacetWP-achtige tellingen.

Richtlijn:

- Cache **read-heavy, zelden muterende** aggregaties (facets, catalogs).
- Invalideren bij `save_post_material`, `save_post_brand`, term-wijzigingen (patroon bestaat al bij brand facets).

### 4. Query- en meta-performance (middel)

- `?brand_id=` filter op materials (`rest-post-meta.php`) — controleer index op `_material_brand` meta (WP Engine / DB).
- FacetWP indexering en query-load — zwaarste WP-pad voor `/materials`.
- Vermijd N+1 in `rest_prepare_*` filters (meta per veld extra query).

### 5. WP Engine platform (middel)

- **Object cache** (Redis/Memcached) — standaard op WP Engine; verifiëren dat het actief is en transients/object cache hit rate gezond is.
- **PHP/worker capacity** — piekload bij cold FacetWP.
- **Regio:** Vercel draait **`fra1`**. Als WP Engine origin in **VS** staat, is **~80–150 ms extra RTT per request** normaal. Meerdere requests = opstapelend. Eventueel met WP Engine/hosting afstemmen (EU edge/origin) — infrastructuur, geen code.

### 6. FacetWP uitfasering (strategisch — ook go-live)

Zie `docs/facetwp-phase-out-policy.md` en **`docs/note-go-live-facetwp-uitfaseren.md`**. Teamvoorkeur: FacetWP **uitgefaseerd vóór** productie-cutover Next.js frontend (snellere `/materials`, minder plugins). Legacy WP-theme houdt FacetWP tot die cutover; headless stack niet als eindtoestand.

FacetWP is **duurder** dan native REST voor de materials-filter. Uitfasering helpt **WP-load én** frontend-complexiteit (minder dubbele calls).

### 7. Wat Johan níet hoeft te doen voor “snellere pagina’s”

- Vercel-regio instellen (al `fra1`).
- Next.js bundel splitsen — frontend-developer.
- Client-side hydration verminderen — frontend-developer.

---

## Aanbevelingen — Next.js-developer (Vercel)

### 1. Productie-cache verifiëren (must)

- `WP_CACHE_DISABLED` uit op Production.
- Revalidate-waarden respecteren (`MATERIAL_REVALIDATE` 6u, FacetWP filtered 60s, baseline 600s, homepage 600s).

### 2. Dynamische routes begrijpen (must)

Pagina’s met **`searchParams`** (`/materials`, `/brands`, `/articles`, `/events`, `/talks`, `/books`) zijn **per URL-combinatie** server-rendered. Dat is functioneel correct maar **inherent trager** dan statische pagina’s.

Mogelijke richtingen (frontend-beslissing):

- **`unstable_cache` / cache tags** per filter-hash waar business het toelaat.
- **Streaming + Suspense** — shell/sneller first byte, grid later (UX win zonder WP sneller te maken).
- **Partial Prerendering** (Next 15+) waar van toepassing.

### 3. Waterfalls verminderen (hoog)

Code doet al veel `Promise.all` — goed. Nog te bekijken:

- **`/materials`:** kan baseline FacetWP **gedeeld/gecached** worden over filter-requests (nu elke page load opnieuw, wel 600s revalidate)?
- **Brand detail:** `getBrandNeighbours` haalt **100 brands** op voor prev/next — cachebaar of vervangen door lightweight `/md/v2/brands/neighbours?slug=` (Johan).
- **Material detail:** `generateMetadata` + page — deels gedeelde fetch-cache (comment in code); meten of dat in praktijk hit rate heeft.

### 4. Monitoring & budgets (hoog)

- Vercel **Speed Insights** / Core Web Vitals (LCP, INP).
- Alert op hoge **Function Duration** (>3s) per route.
- Route-level budget: bijv. `/materials` TTFB p95 < 1,5s (doel invullen met team).

### 5. Assets & client bundle (middel)

- `next/image` is geconfigureerd — controleer dat cards **sizes** correct zetten (geen onnodig grote heroes).
- Client components (`'use client'`) in filter-sidebars — hydration cost; niet WP, wel **Time to Interactive**.
- Fonts: preload alleen wat nodig is.

### 6. Auth/cart routes (laag voor catalogus)

Checkout/cart via `/api/store-cart` proxy — apart pad; Insider-pricing vereist dynamische calls. **Niet** de hoofdoorzaak van trage materials/brands-pagina’s.

---

## Prioriteitenmatrix

| Prioriteit | Actie | Eigenaar | Impact |
|------------|-------|----------|--------|
| P0 | Check `WP_CACHE_DISABLED` op Vercel Production | Next.js | Hoog als het fout staat |
| P0 | Meet TTFB per route (materials detail, materials list, homepage) | Next.js | Basis voor verder werk |
| P1 | REST payloads verlichten op list-endpoints | Johan | Hoog |
| P1 | Samengesteld detail-endpoint (material/brand) | Johan + later frontend | Hoog |
| P2 | Transient/object cache uitbreiden voor zware reads | Johan | Middel–hoog |
| P2 | Streaming/Suspense op trage overzichtspagina’s | Next.js | UX / perceived perf |
| P2 | Geo: WP Engine regio vs Vercel fra1 | Johan / hosting | Middel (multiplier) |
| P3 | FacetWP vervangen (REST facets) | Johan + Next.js | Lang termijn, structureel |
| P3 | DB/meta index audit | Johan | Middel |

---

## Verwachting management

- **“WordPress sneller maken”** helpt vooral de **API-laag** — essentieel bij cache miss en voor zware pagina’s (`/materials`).
- **“Vercel sneller maken”** helpt vooral **hergebruik, rendering en assets** — essentieel voor repeat visits en Core Web Vitals.
- **Perfecte snelheid op `/materials` met 20 FacetWP-filters** is **structureel moeilijk** zolang elke filtercombinatie dynamisch via FacetWP+REST gaat. Dat is geen misconfiguratie; het is architectuur.

---

## Gerelateerde code/docs

| Onderwerp | Locatie |
|-----------|---------|
| Revalidate & cache kill-switch | `src/lib/api/wordpress.ts` |
| FacetWP cache (60s / 600s) | `src/lib/api/facetwp.ts` |
| Materials orchestrator (4+ calls) | `src/lib/api/content.ts` → `listMaterialsWithFacets` |
| Vercel regio | `vercel.json` → `fra1` |
| Plugin transients | `rest-frontend-catalogs.php`, `rest-brand-facets.php` |
| FacetWP-beleid | `docs/facetwp-phase-out-policy.md` |

---

## Voorstel vervolgstap (team)

1. **Next.js-developer:** 30 min meten — TTFB homepage, material detail, `/materials` (ongefilterd), `/materials?material_category=…`; Vercel env check.
2. **Johan:** REST baseline timing (curl) + Query Monitor op zelfde routes WP-kant.
3. **Gezamenlijk:** vergelijken; als WP >60% van server-tijd is → P1 plugin/REST; als Vercel render >40% → P2 frontend streaming/cache.

Dit document kan naar de Next.js-developer; Johan-sectie is wat jij zelf kunt oppakken in `materialdistrict-plugin`.
