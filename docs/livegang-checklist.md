# Livegang-checklist — MaterialDistrict Next.js

**Doel:** bekende openstaande punten afvinken vóór (en kort na) productie-cutover.  
**Laatst bijgewerkt:** 16 juni 2026  
**Bronnen:** `open-issues.md`, recente handoffs (checkout, books, VIES), `seo-migratieplan.md`, `note-go-live-facetwp-uitfaseren.md`

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

**Plugin** (`materialdistrict-plugin` → WP Engine)

- [ ] Plugin zip/deploy naar production
- [ ] REST-smoke: `GET /wp-json/md/v2/...` endpoints die de frontend gebruikt
- [ ] WooCommerce Store API via Next-proxy (`/api/store-cart/*`)

**Cross-cutting**

- [ ] Preview/staging niet indexeerbaar (`robots.ts` + `X-Robots-Tag` op `*.vercel.app`)
- [ ] DNS/cutover-plan vastgelegd (redirects, Search Console)

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

### 2.3 Auth & juridisch

| Item | Status | Actie |
|------|--------|-------|
| `POST /md/v2/auth/register` | ✅ in plugin | rooktest productie |
| Register rate-limiting beslissing (W12) | ❓ besluit | 5/uur per IP ja/nee + documenteren |
| Terms + Privacy links op `/register` (`href="#"`) | ❌ open | `/terms` + `/privacy` of link naar canonieke PDF (footer gebruikt al externe terms-PDF) |
| Cookie settings in footer | verborgen | consent-tool kiezen (Cookiebot/Usercentrics/…) |

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

---

## 3. 🟢 Na live / tech debt

### 3.1 Codekwaliteit & hergebruik

- [ ] Gedeelde VIES-hook (`useVatValidation`) i.p.v. duplicate logic in ProfileForm, BrandProfileForm, CheckoutForm
- [ ] Brand VAT normaliseren bij save (uppercase, spaties strippen) — analoog aan persoonlijk profiel
- [ ] Author-naam resolve in content API (`content.ts` TODO: `/wp/v2/users/<id>`)
- [ ] `BOOK_CATEGORY_SLUG = 'books'` bevestigen (`woocommerce.ts`)
- [ ] CSS opruimen: `detail-*` vs `article-*` klassen generaliseren (S7.1)
- [ ] `globals-additions-auth.css` eventueel in `globals.css` opnemen

### 3.2 Database / WP ops

- [x] Verouderde postmeta `_article_type` op articles verwijderen (~16 rijen; plugin gebruikt `story_type` taxonomy)
- [ ] Optionele bulk legacy profile-meta cleanup (productie-ops)
- [ ] Events: admin-UI voor `videos`/`gallery` repeaters (nu via script/CLI)
- [ ] Events: server-side meta-orderby/paginatie bij groeiende set (S8.3)
- [ ] Talks: related-endpoint, Vimeo-auto-duration (S7.3/S7.4)

### 3.3 FacetWP & legacy theme

- [ ] Legacy WP-theme uit traffic / redirects na Next-cutover
- [ ] FacetWP plugin deactiveren op WP Engine (pas als theme + `/materials` niet meer afhankelijk zijn)
- [ ] Favorites-plugin verwijderen — zie **§2.8** (eerst bookmark-migratie)

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

---

*Werk dit bestand bij na elke afgeronde sprint; grote historische context hoeft niet hier — alleen wat nog openstaat of net gesloten is.*
