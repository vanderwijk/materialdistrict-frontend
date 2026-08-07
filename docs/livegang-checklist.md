# Livegang-checklist — MaterialDistrict Next.js

**Doel:** bekende openstaande punten afvinken vóór (en kort na) productie-cutover.  
**Laatst bijgewerkt:** 6 augustus 2026  
**Bronnen:** `open-issues.md`, recente handoffs (checkout, books, VIES), `seo-migratieplan.md`, `note-go-live-facetwp-uitfaseren.md`, `note-cms-lockdown-theme-2026-08-06.md`, `note-books-subdomain-redirect-2026-08-06.md`

> **Gebruik:** werk per sectie van boven naar beneden. Items met 🔴 zijn launch-risico’s; 🟡 zijn belangrijk maar niet per se dag-1 blockers; 🟢 kan na live.  
> Gedetailleerde historie staat in [`open-issues.md`](./open-issues.md) — dit bestand is de **actieve** checklist.

---

## 0. Deploy & rooktest (elke release)

**Frontend** (`materialdistrict-frontend` → Vercel)

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Rooktest homepage, `/materials`, `/material/[slug]`, `/brands`, `/brand/[slug]`
- [ ] Rooktest `/checkout` (gast + ingelogd), cart badge, order confirmation
- [ ] Rooktest `/dashboard/profile` en `/dashboard/brands/{slug}/` (opslaan + refresh)
- [ ] `NEXT_PUBLIC_SITE_URL` op Vercel production = `https://materialdistrict.com` (geen trailing slash)

**Plugin** (`materialdistrict-plugin` → live CMS op DigitalOcean: `cms.materialdistrict.com`)

- [ ] Plugin deploy naar CMS (DigitalOcean) — niet naar WP Engine als primaire API
- [ ] REST-smoke: `GET /wp-json/md/v2/...` endpoints die de frontend gebruikt
- [ ] WooCommerce Store API via Next-proxy (`/api/store-cart/*`)

**Cross-cutting**

- [ ] Preview/staging niet indexeerbaar (`robots.ts` + `X-Robots-Tag` op `*.vercel.app`)
- [ ] DNS/cutover-plan vastgelegd — zie **§0.1**
- [ ] **Photo library / uploads → `media.materialdistrict.com`:** 301-redirects voor alle uploadmappen (zie §2.10)

---

## 0.1 Cutover-architectuur (livegang)

**Besluit (1-08-2026):** live gaan met Next.js op **Vercel** + headless CMS op **DigitalOcean** (`cms.materialdistrict.com`).  
`materialdistrict.com` wijst **niet** meer naar WP Engine, maar naar Vercel.

| Rol | Host | Live bij cutover |
|-----|------|------------------|
| Publieke site | Vercel (`materialdistrict.com`) | ✅ primair |
| Headless CMS / API | DigitalOcean (`cms.materialdistrict.com`) | ✅ primair |
| Media / uploads | `media.materialdistrict.com` | ✅ primair |
| Oude klassieke site | WP Engine | ⏸ standby (achtergrond, geen DNS) |
| Oude books-shop | `books.materialdistrict.com` → Vercel 301/308 → `/book/` | ✅ live (6-08-2026) |

**Rollback:** bij ernstige problemen DNS van `materialdistrict.com` weer terugzetten van Vercel → WP Engine. Oude site blijft daarom tijdelijk in de lucht op WP Engine (niet afbreken bij cutover).

**Later (niet launch-week):** nadenken over terugkeer van CMS-beheer DigitalOcean → WP Engine (zij doen serverbeheer). Geen actie nu; eerst stabiele launch.

### Pre-cutover DNS

- [ ] Huidige TTL van `materialdistrict.com` (en www/CNAME’s) vastleggen bij de DNS-provider
- [ ] TTL **zo laag mogelijk** zetten vóór cutover (bijv. 300s / 60s indien toegestaan) — ruim vóór switch, zodat de lage TTL al overal is gecached
- [ ] Vercel-domein `materialdistrict.com` geconfigureerd + SSL klaar (vóór DNS-switch)
- [ ] Notitie: welke records wijzigen (A/AAAA/CNAME apex + `www`) en wat de rollback-waarden naar WP Engine zijn

### Cutover-moment

- [ ] DNS `materialdistrict.com` → Vercel (niet WP Engine)
- [ ] CMS blijft DigitalOcean; frontend production praat tegen `cms.materialdistrict.com`
- [ ] WP Engine-site **aan laten staan** (standby), maar zonder publieke DNS
- [ ] Rooktest productie-URL’s + auth/checkout tegen live CMS
- [ ] Bij nood: DNS terug naar WP Engine (lage TTL = snellere rollback)

### Post-cutover (pas als stabiel)

- [ ] TTL weer naar een normaal/productiewaarde
- [ ] (Later) plan CMS DO → WP Engine — buiten launch-scope

### 🔴 Morgen (6-08-2026) — CMS lockdown-theme

**Notitie:** [`note-cms-lockdown-theme-2026-08-06.md`](./note-cms-lockdown-theme-2026-08-06.md)

Op `cms.materialdistrict.com` mag geen publieke content meer zichtbaar zijn; de site is headless.

- [ ] Nieuw (minimal) thema of equivalent op CMS activeren
- [ ] Alleen login + wp-admin voor editors; anonieme hits redirecten naar `https://materialdistrict.com`
- [ ] wp-admin “View”- / permalink-links → Vercel-frontend (niet `cms.…`)
- [ ] REST `/wp-json/*` blijft werken voor de Next-frontend

### On-demand Vercel-cache legen bij WP-save

**Status:** werkt nog niet — na save in WordPress blijven wijzigingen op de Vercel-site in de cache hangen tot de time-based revalidate verloopt (zie `src/lib/api/wordpress.ts`).

- [ ] Bij bijwerken/opslaan van content in WP: de **exacte publieke URL** op Vercel uit de cache purgen/revalideren, zodat wijzigingen direct zichtbaar zijn op `materialdistrict.com`
- [ ] Dekking minstens: materials, stories/articles, brands, pages (en andere CPT’s met een frontend-route)
- [ ] Bij voorkeur: WP-hook (`save_post` / REST update) → frontend on-demand revalidation (`revalidatePath` / `revalidateTag` of Vercel purge API), niet alleen TTL-wacht

### Product feeds — Google Merchant Center + Meta (Facebook/Instagram)

**Doel:** WooCommerce-boekassortiment op [`/book/`](https://materialdistrict.com/book/) synchroon houden met shopping-kanalen.

- [ ] Google Merchant Center-integratie: productfeed vanuit WooCommerce (CMS) voor de store op `https://materialdistrict.com/book/`
- [ ] Feed-URL’s / productlinks wijzen naar de **Vercel-frontend** (`materialdistrict.com/book/...`), niet naar `cms.…`
- [ ] Zelfde (of afgeleide) catalogus koppelen als **Meta product feed** (Facebook / Instagram Shop / Catalog)
- [ ] Rooktest: items in GMC + Meta matchen titel/prijs/voorraad/URL met de live books-pagina

### Books subdomain — `books.materialdistrict.com`

**Doel:** oude WP Engine-shop uitschakelen; alle URLs 301 → `/book/`.  
**Detail:** [`note-books-subdomain-redirect-2026-08-06.md`](./note-books-subdomain-redirect-2026-08-06.md)

- [x] Host-based redirects in `next.config.ts` + Vercel-domein toegevoegd (6-08-2026)
- [x] **OpenProvider DNS:** `books` A → `76.76.21.21` (CNAME WP Engine verwijderd)
- [x] Rooktest: homepage, product, cart, categorie → 308 naar `materialdistrict.com/book/…`

---

## 1. 🔴 Launch-gates (teamvoorkeur / harde risico’s)

### 1.1 FacetWP-afhankelijkheid op `/materials`

**Status:** nog actief — `listMaterialsWithFacets()` + `POST /facetwp/v1/fetch`  
**Eigenaar:** Johan (plugin endpoints) + frontend (orchestrator)  
**Referentie:** [`note-go-live-facetwp-uitfaseren.md`](./note-go-live-facetwp-uitfaseren.md)

- [ ] Property-filters + facet-counts via eigen REST (patroon: `rest-brand-facets.php`)
- [ ] Channel op materials via `?theme=<term_id>` i.p.v. FacetWP-facet
- [ ] `/materials` werkt volledig zonder `facetwp/v1/fetch`
- [ ] Performance-baseline gemeten (TTFB p95) — zie [`performance-load-time-analysis.md`](./performance-load-time-analysis.md)
- [ ] Expliciete uitzondering vastgelegd **als** go-live eerder moet (wie/wanneer/tech debt)

### 1.2 Offline materialen zichtbaar op publieke pagina’s

**Status:** ✅ afgerond 16-06-2026  
**Eigenaar:** Johan (REST exposure)  
**Referentie:** `open-issues.md` §S10.2 ronde-2; `src/lib/api/mappers.ts` (`publicationFromMeta`)

- [x] `meta.publication.isOnline` (+ `source`, `validUntil`) op `/wp/v2/material` — plugin commit `54d4ebb`
- [x] Homepage + `/materials` tonen geen offline materialen meer — frontend commit
- [x] Handmatige check met testmaterial ID 133752 (draft → geen REST-response, publish → `isOnline: true`)

### 1.3 SEO — sitemap & metadata

**Status:** `robots.ts` ✅; pre-DNS items ✅; post-DNS items open  
**Referentie:** [`seo-migratieplan.md`](./seo-migratieplan.md)

- [x] Sitemap-index + per-type child-sitemaps (materials, articles, brands, events, talks, books)
- [x] `lastmod` uit WP `modified`, niet build-datum (books via `/wp/v2/product`)
- [x] OG-image op material-detail `generateMetadata`
- [x] Twitter cards op root layout + detailpagina’s
- [x] Soft 404: `notFound()` bij lege taxonomy-pagina (pagina 1) — material-category + tag
- [ ] Na DNS: sitemap in Google Search Console + Bing Webmaster Tools
- [ ] `site:materialdistrict-frontend.vercel.app` → 0 resultaten in Google

### 1.4 Plugin security (open plan)

**Status:** plan opgesteld; uitvoering deels/onbekend  
**Eigenaar:** Johan  
**Scope:** exposed secrets, unauthenticated endpoints, REST data leaks (~55 plugin-bestanden)

- [ ] Fase 1 afgerond: secrets, kritieke REST-routes, rate limits
- [ ] Smoke na security-wijzigingen (auth, checkout, dashboard)
- [ ] Dependabot: 2 moderate vulnerabilities op plugin-repo ([security tab](https://github.com/vanderwijk/materialdistrict-plugin/security/dependabot))

---

## 2. 🟡 Belangrijk vóór of rond live

### 2.1 Checkout & account

**Referentie:** [`handoff-claude-2026-06-15-checkout-address-ideal.md`](./handoff-claude-2026-06-15-checkout-address-ideal.md)

| Item | Status | Eigenaar |
|------|--------|----------|
| Profieladres ↔ checkout prefill | ✅ gebouwd | — |
| VIES/BTW-validatie (profiel) | ✅ live | — |
| VIES/BTW-validatie (brand profiel, `_brand_vat_number`) | ✅ live | — |
| CoC (`billing_coc_number`) in dashboard profiel-API + UI | ❌ open | Johan + frontend |
| Legacy dual-read uitzetten (`profile-options.php`) | ❌ open | Johan |
| Betaalmethoden PayPal / Trustly / WERO (naast Stripe/iDEAL) | ❌ open | Johan + frontend |
| Checkout smoke (iDEAL + kaart, cart merge, adres-sync) | [ ] testen | team |

### 2.2 Books / bookshop (`/book`)

**Referentie:** [`MANIFEST-books-storefront-2026-06-16.md`](./MANIFEST-books-storefront-2026-06-16.md), [`handoff-claude-2026-06-16-books-vat-store-api.md`](./handoff-claude-2026-06-16-books-vat-store-api.md)

- [x] Globale WC-attributen: Authors, Format, ISBN, Number of pages, Year of Publishing
- [x] Productcategorieën (design-disciplines) + tags `new-releases`, `last-chance`
- [ ] CSV-import designerbooks → MD (images moeten resolven terwijl oude shop nog live is)
- [x] Filter-architectuur beslissing: fetch-all + filter-in-JS (geen FacetWP, geen Store API params)
- [x] Featured boek op homepage (WC `featured`-vlag) — `listFeaturedBooks()` actief
- [ ] Verzendkosten in mand voor ingelogden met bekend adres (uitgesteld)
- [ ] **Testbestellingen in de shop** (Stripe Sandbox): boek in mand → checkout (kaart én iDEAL) → order in WC + bevestigingsmail → mand leeg; gast én ingelogd. Zie ook testdraaiboek Flow M.

### 2.3 Auth & juridisch

| Item | Status | Actie |
|------|--------|-------|
| `POST /md/v2/auth/register` | ✅ in plugin | rooktest productie |
| Register rate-limiting beslissing (W12) | ❓ besluit | 5/uur per IP ja/nee + documenteren |
| Terms + Privacy links op `/register` (`href="#"`) | ❌ open | `/terms` + `/privacy` of link naar canonieke PDF (footer gebruikt al externe terms-PDF) |
| Cookie settings in footer | verborgen | consent-tool kiezen (Cookiebot/Usercentrics/…) |

### 2.3c Cookie-melding / blocker + marketing-analytics (4-08-2026 / 5-08-2026)

**Status:** soft-launch balk ✅ (`consent-bar-v1`) — **geen** TCF/CMP; GA/Plausible nog open.  
**Context:** minimale Accept/Refuse-balk gated `md_aid`, events en gpt.js. Footer “Cookie settings” blijft verborgen tot een echte CMP (`open-issues.md` S11.6). Jeroen stemt CMP commercieel af vóór september.

- [x] Soft-launch consent-bar (Accept/Refuse; undecided = deny)
- [x] Events + `md_aid` + gpt.js alleen na `md_consent=granted` (client + `/api/events`)
- [ ] Echte CMP (Cookiebot / Usercentrics / Google-certified) vóór commerciële start
- [ ] Footer “Cookie settings” weer tonen → opent de consent-manager
- [ ] Cookieverklaring / inventarisatie (balk linkt nu naar `/privacy-statement/`)
- [ ] **Google Analytics** (of GTM) toevoegen achter consent — bewust uit (eigen eventlaag)
- [x] **Plausible Analytics** — altijd aan, cookieless / AVG (`PlausibleAnalytics`)
- [ ] Rooktest: Network/devtools — gpt/events pas na Accept; Plausible altijd; Refuse verwijdert `md_aid`

### 2.3d Error monitoring (Sentry)

**Status:** ❌ nog nodig rond live — console- en scriptfouten moeten zichtbaar zijn zodat we ze snel kunnen oppikken en fixen.  
**Account:** aanmaken op [Sentry.io](https://sentry.io) met **webmaster@material-district.com**.

- [ ] Sentry.io-account aanmaken met `webmaster@material-district.com`
- [ ] Project voor de Next.js-frontend (Vercel) aanmaken; DSN in Vercel env zetten
- [ ] Sentry SDK inbouwen (client + server) zodat console-/scriptfouten en unhandled exceptions binnenkomen
- [ ] Rooktest: opzettelijke testfout → event zichtbaar in Sentry; alerts/e-mail naar webmaster bevestigen

### 2.3b Users: productie → CMS (cutover)

**Status:** gepland — geen blinde sync; wel eenmalige gefilterde import  
**Context (24-07-2026):** CMS-users bevroren sinds DB-kopie **22 juni 2026** (laatste ID ~`147326`). Nieuwe registraties gaan sindsdien alleen naar WP Engine. Steekproef ~100 recente prod-users: ~62% duidelijke spam (`*.click`, `mail24.top`, naam≠email, …), ~20% waarschijnlijk echt, rest grijs. Gap tot cutover: ordegrootte **~300–400** accounts, waarvan **~50–100** de moeite waard om te behouden.

**Besluit:**

- Incrementele sync neemt **geen users** mee (alleen content), zodat bots niet via de achterdeur in CMS belanden.
- Bij cutover: **eenmalige gefilterde import** productie → CMS van echte accounts sinds 22 jun.
- Classic registratie op productie (`MD_CLOSE_CLASSIC_REGISTRATION`) pas dichtzetten vlak vóór/bij Vercel-cutover (nieuwe frontend gebruikt die routes niet).

**Filter (minimaal):**

- [ ] Export users met `ID > 147326` (of `user_registered >= 2026-06-22 12:10:39`) van productie
- [ ] Weg: wegwerpdomeinen / bekende bot-TLD’s (`.click`, `mail24.top`, `adult-work.info`, `*.travellersrest*`, `*.billieholiday*`, …)
- [ ] Weg of review: nooit ingelogd + geen WC-orders + geen brand-koppeling (optioneel strenger)
- [ ] Houd: bedrijfs-/edu-domains + coherente free-mail; grijze Gmails handmatig of mild meenemen
- [ ] Import naar CMS: user + password hash + relevante usermeta (membership, `connected_brand_id`, …); dry-run → apply
- [ ] Spot-check: 5 echte accounts kunnen inloggen op de Next-frontend tegen CMS
- [ ] Na cutover: `MD_CLOSE_CLASSIC_REGISTRATION` op productie (optioneel meteen bij DNS)

### 2.4 Contactpagina

**Blocker:** Gravity Forms REST-info ontbreekt (form-ID, veld-mapping, spam) — `open-issues.md` S11.1

- [ ] Johan levert GF REST-details
- [ ] `/contact` + server-side submit route bouwen

### 2.5 Dashboard & content (niet-blokkerend maar zichtbaar)

- [ ] Board: item uit board verwijderen (DELETE endpoint ontbreekt)
- [ ] CompareBar op brand-detail (`BrandMaterialsGrid`) — CMP-1
- [ ] Insider-only material gate (hele pagina gated) — wacht op WP `insider_only` op materials — H11
- [ ] Homepage resterend: duurzaamheids-/channel-pills op materialtegels (theme-ID → label)
- [ ] Responsive-pass homepage + site-wide font-schaal (H9)

### 2.6 Toegankelijkheid (a11y)

- [ ] `BrandProfileForm`: logo file-input label + `aria-pressed` ✅ (16-06)
- [ ] `MaterialForm`: zelfde file-input label-patroon (`htmlFor` + `id`) nog controleren
- [ ] `GalleryField` / `DownloadsField`: verborgen file-inputs labelen

### 2.7 Tooling

- [ ] `npm run lint` faalt met *Invalid project directory …/lint* — Next/ESLint-config fixen (pre-existing; `typecheck` werkt wel)

### 2.8 Favorites-plugin → dashboard bookmarks (security)

**Status:** open — migratie vereist vóór verwijderen  
**Eigenaar:** Johan  
**Motivatie:** Simple Favorites-plugin bevat een security issue; na livegang zo snel mogelijk deactiveren en verwijderen. De Next.js-site gebruikt **niet** deze plugin — bookmarks lopen via `_md_dashboard_bookmarks` (`GET/POST/DELETE /md/v2/dashboard/bookmarks`). Oude favorieten staan nog in usermeta `simplefavorites` (serialized post-ID’s) en worden niet automatisch overgezet.

**Pre-check (productie):**

```bash
wp plugin list --status=active --fields=name,status | grep -i favorite
wp user meta list --keys=simplefavorites --format=count
```

- [ ] Aantal users met `simplefavorites`-data vastleggen (besluit: migreren ja/nee bij laag volume)
- [ ] Eenmalig migratiescript: `simplefavorites` → `_md_dashboard_bookmarks` (post type → bookmark `type`: `material`, `article`, `brand`, `talk`, `event`, `product` → `books`; alleen gepubliceerde posts; idempotent)
- [ ] Migratie op staging + spot-check (login als gemigreerde user → `/dashboard/bookmarks`)
- [ ] Migratie op productie
- [ ] Rooktest Next.js: Save-knop + bookmarks-panel na migratie
- [ ] Favorites-plugin deactiveren en verwijderen van WP Engine
- [ ] `wp cache flush --url=materialdistrict.com`

**Niet migreren:** anonieme favorieten (cookie/sessie) — vervallen bij cutover; nieuwe site vereist login voor bookmarks.

### 2.9 Material category-pagina's — vormgeving

**Status:** open — functioneel OK, visueel onder de maat  
**Eigenaar:** frontend (Claude)  
**Bron:** soft-launch checklist + Johan 06-08-2026  
**Referentie:** [`src/app/material-category/[slug]/page.tsx`](../src/app/material-category/[slug]/page.tsx)  
**Voorbeeld (live):** [materialdistrict.com/material-category/ceramics/](https://materialdistrict.com/material-category/ceramics/) — header/breadcrumb/titel/grid ogen rommelig (weinig hiërarchie, niet in lijn met `/material` of channel-hubs).

- [ ] Hero/intro-blok: één duidelijke H1, korte categoriebeschrijving (uit WP term), geen dubbele labels
- [ ] Grid + telling (“172 materials”) visueel in lijn met `/material` en brand-archief
- [ ] Responsive check (mobiel: breadcrumb + spacing)
- [ ] Rooktest op 2–3 categorieën (groot volume + kleine term), o.a. ceramics / plastics / concretes

### 2.10 Photo library — 301 redirects naar media-host

**Status:** ✅ redirects in `next.config.ts` (5-08-2026) — actief zodra apex DNS → Vercel  
**Eigenaar:** Johan (DNS / edge)  
**Doel:** alle photo-library / WordPress-uploadpaden blijven werken via **301** naar `media.materialdistrict.com`, zodat hotlinks en geïndexeerde afbeeldingen niet 404’en.

- [x] 301: `/wp-content/uploads/:path*` → `https://media.materialdistrict.com/wp-content/uploads/:path*`
- [x] Frontend herschrijft legacy hosts al via `normalizeMediaUrl()`
- [ ] Steekproef na DNS-cutover: 5–10 oude image-URL’s → **301** + bytes op media-host
- [ ] Eventuele legacy photo-library-paden buiten `/wp-content/uploads/` (indien nog in gebruik)

---

## 3. 🟢 Na live / tech debt

### 3.1 Codekwaliteit & hergebruik

- [ ] Gedeelde VIES-hook (`useVatValidation`) i.p.v. duplicate logic in ProfileForm, BrandProfileForm, CheckoutForm
- [ ] Brand VAT normaliseren bij save (uppercase, spaties strippen) — analoog aan persoonlijk profiel
- [ ] Author-naam resolve in content API (`content.ts` TODO: `/wp/v2/users/<id>`)
- [ ] `BOOK_CATEGORY_SLUG = 'books'` bevestigen (`woocommerce.ts`)
- [ ] CSS opruimen: `detail-*` vs `article-*` klassen generaliseren (S7.1)
- [x] `globals-additions-auth.css` in `globals.css` opgenomen (duplicaat verwijderd)

### 3.2 Database / WP ops

- [x] Verouderde postmeta `_article_type` op articles verwijderen (~16 rijen; plugin gebruikt `story_type` taxonomy)
- [ ] Optionele bulk legacy profile-meta cleanup (productie-ops)
- [ ] Events: admin-UI voor `videos`/`gallery` repeaters (nu via script/CLI)
- [ ] Events: server-side meta-orderby/paginatie bij groeiende set (S8.3)
- [ ] Talks: related-endpoint, Vimeo-auto-duration (S7.3/S7.4)

### 3.3 FacetWP & legacy theme

- [ ] **CMS lockdown-theme** (`cms.materialdistrict.com`) — zie §0.1 “Morgen” + [`note-cms-lockdown-theme-2026-08-06.md`](./note-cms-lockdown-theme-2026-08-06.md)
- [ ] Legacy WP-theme uit traffic / redirects na Next-cutover
- [ ] FacetWP plugin deactiveren op WP Engine (pas als theme + `/materials` niet meer afhankelijk zijn)
- [ ] Favorites-plugin verwijderen — zie **§2.8** (eerst bookmark-migratie)

### 3.4 Soft-launch UI-polish (31-07-2026)

Bron: Johan, soft-launch feedback. Details: [`open-issues.md`](./open-issues.md) § Soft-launch UI (31-07-2026).

- [x] **SL-UI-1** Channel-pagina’s: één sitebrede achtergrondkleur (nu grijs + beige)
- [x] **SL-UI-2** “Something broken”-modal op mobiel: verberg feedbackknop bij openen; geen horizontale scroll; copy “We send the address along automatically.” herschrijven
- [x] **SL-UI-3** Mobiel: stories-/materials-blokken tonen 3 items over 2 kolommen → lege cel; grid/aantal fixen
- [x] **SL-UI-4** Zoekpagina mobiel: toetsenbord sluiten na Enter; breadcrumb `Home – Home – Search` opschonen; zoekveld volle breedte (gelijk aan knop)

---

## 4. ✅ Recent afgerond (ter referentie)

| Datum | Onderwerp | Commit/context |
|-------|-----------|----------------|
| 16-06 | VIES op persoonlijk profiel (UI + server) | frontend `0d7f258` / `4873add`, plugin `3996646` |
| 16-06 | VIES op brand profiel (`_brand_vat_number`) | frontend `a4b9196`, plugin `6f84c83` |
| 16-06 | A11y fixes brand profile (logo label, channel chips) | frontend `2213c38` |
| 16-06 | Books: ex-VAT Store API + `/book` zonder FacetWP | zie books-handoff |
| eerdere | Brand country-filter + facet-endpoint (S5.1) | plugin `rest-brand-facets.php` |
| eerdere | `robots.ts` + preview noindex | `seo-migratieplan.md` launch checklist |

---

## 5. Snelle rooktest-scripts

**Checkout** (ingelogd + gast): zie test-checklist in [`handoff-claude-2026-06-15-checkout-address-ideal.md`](./handoff-claude-2026-06-15-checkout-address-ideal.md) § Test-checklist.

**Bookshop testbestellingen** (Stripe Sandbox — nooit live keys):

- [ ] `/book` → boek in mand → checkout afronden (kaart)
- [ ] Zelfde pad met iDEAL/Wero
- [ ] Order zichtbaar in WooCommerce; bevestigingsmail; mand leeg na success
- [ ] Gast- én ingelogde flow

**Cookie + analytics:**

- [ ] Incognito: cookiemelding/-blocker zichtbaar
- [ ] Weigeren: geen GA / geen Plausible (tenzij Plausible cookieloos is goedgekeurd)
- [ ] Accepteren: beide scripts laden; Realtime/Plausible ziet een pageview

**VIES**

- [ ] Profiel: BTW invullen + land → live check; save geblokkeerd bij invalid
- [ ] Profiel: pagina laden / opnieuw inloggen → **geen** VIES-call tot gebruiker BTW aanraakt
- [ ] Brand profiel: zelfde gedrag op `vat_number` + `_brand_country`
- [ ] Checkout: BTW-validatie ongewijzigd werkend

**Brands**

- [ ] `/brands` country-filter + sidebar-tellingen
- [ ] Brand detail: materials, downloads, video (indien gevuld)

---

## 6. Gerelateerde documenten

| Onderwerp | Bestand |
|-----------|---------|
| Volledige issue-historie | [`open-issues.md`](./open-issues.md) |
| FacetWP go-live gate | [`note-go-live-facetwp-uitfaseren.md`](./note-go-live-facetwp-uitfaseren.md) |
| SEO | [`seo-migratieplan.md`](./seo-migratieplan.md) |
| Checkout/adres | [`handoff-claude-2026-06-15-checkout-address-ideal.md`](./handoff-claude-2026-06-15-checkout-address-ideal.md) |
| Books | [`handoff-claude-2026-06-16-books-vat-store-api.md`](./handoff-claude-2026-06-16-books-vat-store-api.md) |
| Bookmarks (nieuw systeem) | [`dashboard-handoff-batch3-jeroen.md`](./dashboard-handoff-batch3-jeroen.md) § Bookmarks |
| Brand deploy (Johan) | `materialdistrict-plugin/deploy-checklist-johan-brands.md` |
| E2E-testaccounts | [`e2e-test-accounts.md`](./e2e-test-accounts.md) |
| Mailsysteem v7 | [`mailsysteem-spec.md`](./mailsysteem-spec.md) |

---

## 7. Mailsysteem (fase 0 / 1) — 24-07-2026

**Spec:** [`mailsysteem-spec.md`](./mailsysteem-spec.md) v7. Sendy-op-SES lead is **vervallen**; WP assembleert → SES.

| # | Item | Status | Eigenaar |
|---|------|--------|----------|
| M1 | Suppressie-oogst uit Sendy → `wp_md_mail_suppression` | ✅ CMS 24-07-2026 · 41.277 rijen (`sendy_export`; bounce 39.581 / complaint 1.696) | Johan |
| M2 | Contact-import (8.148 + 3.821) | open | Johan |
| M3 | Config sets + `news@` + re-engagement-subdomein | open | Johan |
| M4 | Queue/worker + SNS mail events + unsub/preferences | code klaar · deploy/ops | Johan |
| M5 | Campagneverzending | code klaar · deploy | Johan |
| M6 | Your update-assembler + Sendy uit | code klaar · oktober live | Johan |
| M7 | Frontend voorkeurcentrum / banner-UI / "+N more" | open | Claude |

---

*Werk dit bestand bij na elke afgeronde sprint; grote historische context hoeft niet hier — alleen wat nog openstaat of net gesloten is.*
