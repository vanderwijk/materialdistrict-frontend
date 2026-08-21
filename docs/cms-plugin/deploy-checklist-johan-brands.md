# Deploy-checklist Johan — Sessie 5 (Brands)

> Losse checklist bij `materialdistrict-sessie5-compleet.zip`. Puur de
> WP-/backend-kant. De frontend is af; onderstaande punten activeren de
> laatste stukjes. Volledige context staat in `docs/open-issues.md` (S5.1–S5.6).

## 0. Uitpakken & build-check (eerst)

- [ ] Zip uitpakken op de **project-root**. `src/` en `docs/` overschrijven 1-op-1; geen handmatige edits nodig.
- [ ] `npm run typecheck` (of `npx tsc --noEmit`) — volledige typecheck tegen de echte codebase. *(Aan onze kant is elke gewijzigde laag geïsoleerd groen; dit is de eerste keer dat het tegen de hele codebase draait.)*
- [ ] `npm run build` — bevestig dat `/brands` en `/brands/[slug]` bouwen.
- [ ] Snelle rooktest: `/brands` laadt met tiles, een brand-detail laadt, search werkt, paginatie werkt.

---

## 1. S5.1 — Country-filter activeren 🟡 (belangrijkste)

**Wat:** het Country-filter op `/brands` is frontend-volledig. De selectie gaat
als query-param naar WP, maar WP filtert er nog niet op.

**Frontend stuurt:** `GET /wp/v2/brand?brand_country=NL,DE` (komma-gescheiden,
waarden = de labels zoals ze in `country_detail.label` staan).

**Te leveren WP-kant:**
- [x] `brand_country` op de `/wp/v2/brand`-collectie → `meta_query` op `_brand_country` (zie `rest-post-meta.php`). Accepteert komma-gescheiden **ISO-codes** (`NL,DE`) en **labels** (`Netherlands,Germany`) — sluit aan op de huidige frontend-filteropties.
- [x] **`X-WP-Total` op gefilterde collectie** klopt al (filter hangt op de hoofd-`rest_brand_query`). Geverifieerd: Belgium=105, Germany=336, Netherlands=702, ongefilterd=2293.
- [x] **Facet-tellingen per land** via eigen endpoint `GET /wp-json/md/v2/brands/country-facets` (**geen FacetWP**; `rest-brand-facets.php`). Shape `{ facets: [ { value, label, count } ] }`, alfabetisch, alleen published, 6-uur cache. Zie `docs/johan-spec-brand-facets.md`.

**Besluit:** brands-indexering via **native WP REST** (`rest_brand_query`), niet via FacetWP.

**Status na deploy plugin:** country-filter op `/brands` filtert de lijst server-side. Tellingen in de sidebar blijven indicatief tot een apart count-endpoint (optioneel).

---

## 2. S5.5 — MaterialCard ↔ useCompare versie-check 🟡

**Wat:** in de project-upload zit een mismatch tussen twee bestanden:
- `src/components/ui/MaterialCard.tsx` roept `isInCompare(material.id)` en `toggleCompare(material.id)` (number) aan.
- `src/lib/hooks/useCompare.tsx` exposeert `isInList(id)` en `toggleCompare(item: CompareItem)` (object).

Die twee matchen niet — zelfde soort drift als de 0-byte `MaterialDetailActions.tsx`
in sessie 7.

**Te doen:**
- [ ] Op de **deploy-/main-branch** kijken welke versie van deze twee bestanden canoniek is (de upload is mogelijk niet in sync).
- [ ] De twee op elkaar afstemmen (waarschijnlijk MaterialCard updaten naar `isInList` + `toggleCompare({ id, ... })`).

**Waarom relevant:** onze nieuwe `BrandMaterialsGrid` rendert `<MaterialCard>`
(via de gedocumenteerde props). Raakt de mismatch niet direct, maar als
MaterialCard op de branch écht zo staat, kan de typecheck/runtime dáár vallen.
Buiten scope sessie 5 gehouden omdat onduidelijk is welke versie canoniek is.

---

## 3. S5.2 — Brand company-film (videoveld) ✅ done

**Wat:** mockup brand-detail heeft een company-film-blok; geen videoveld op het
brand-CPT, dus in v1 niet gebouwd.

**Geleverd:**
- [x] `brand.video_url` op het brand-CPT (vrije YouTube/Vimeo-URL, geen provider-ID) — geregistreerd via `register_post_meta('brand', 'video_url', …)` en geëxposed als `meta.video_url` (string, `""` als leeg). Analoog aan `material.video_url`. Zie `docs/johan-spec-brand-video-downloads.md` §1.

Daarna is het aan onze kant een mapper-uitbreiding + hergebruik van de
bestaande `VideosSection` (geen herbouw). Admin-UI volgt via het brand-dashboard;
test-content kan via WP-CLI.

---

## 4. S5.3 — Brand downloads-structuur ✅ done

**Wat:** mockup brand-detail heeft een Downloads-blok (brochure, catalogue,
sustainability report); geen brand-downloadveld in het datamodel, dus bewust
niet gebouwd (geen nep-PDF's).

**Geleverd:**
- [x] `brand.downloads[]` op het brand-CPT, zelfde patroon als `material.brochures[]`: per item `{ type, url, title, file_size, insider_only }`. Geregistreerd via `register_post_meta('brand', 'downloads', …)` met object-schema en genormaliseerd in REST als `meta.downloads` (altijd array, `[]` als leeg).
- [x] `insider_only`-flag per download (sluit aan op W11), default `false`.
- [x] `type` als ENUM `brochure | catalogue | sustainability_report | price_list | other` (onbekend → `other`). Zie `docs/johan-spec-brand-video-downloads.md` §2.

---

## 5. S5.4 — Brand-channel + Application-area taxonomie ⚪ (later)

**Wat:** overkoepelend, niet alleen brands. Twee dingen die nu geparkeerd zijn:
- De **ChannelBar** moet uiteindelijk op alle overzichten — geen brand-channel-data bekend.
- Het brand-overzicht heeft in de mockup ook een cascading **Application-area-filter** (main → sub → type) — hangt op een `APPLICATIONS`-taxonomie die niet als brand-data beschikbaar is.

**Te bevestigen (geen haast):**
- [ ] Bestaat er een brand-channel-taxonomie? Hoe ontsloten via REST?
- [ ] Bestaat er een application-area-taxonomie per brand? Hoe ontsloten?

V1-scope brand-overzicht = Country-filter + search. De rest komt zodra deze
taxonomieën beschikbaar zijn.

---

## Al opgelost in deze oplevering (ter info)

- **S7.1** — "More from Brand" op de material-detailpagina toont nu betrouwbaar brand-specifieke materials (via de genormaliseerde `?brand_id=`-relatie-query uit jouw handoff i.p.v. de oude FacetWP-hack).
- **S7.3** — brand-naam (klikbaar) + land in de meta-regel onder de material-titel, dankzij `brand_slug` / `brand_country` uit de normalized handoff.

Bedankt alvast — vooral punt 1 (S5.1) is wat het brand-overzicht "compleet"
maakt. De rest is fijn-om-te-hebben en kan gefaseerd.
