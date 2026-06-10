<!-- GECONSOLIDEERD 29-05-2026: hoofdlog (t/m 12-05) + alle losse sessie-patches
     samengevoegd tot één bestand. De losse patch-bestanden zijn vervallen.
     Let op: de hoofdlog loopt t/m 12-05; de daarna gevoegde sessie-entries (6a, 7,
     8, 10, 11, db-uitbreidingen) zijn de losse entries die nog niet in de hoofdtekst
     waren verwerkt. Tussenliggende sessies 5/6/9 staan in archief/sessie-notities.md. -->

# MaterialDistrict — Session Log

> Dit bestand wordt na elke sessie bijgewerkt.
> Upload dit bestand aan het begin van elke nieuwe sessie zodat de context bewaard blijft.

---

## Laatste update
Datum: 09-06-2026 — Fase 3 / F2.4: dashboard-chrome (wit op canvas, sidebar +
primaire knoppen zwart). Puur frontend; deploy pending.

---

## Projectstatus

| Stap | Status | Notities |
|---|---|---|
| 1. Projectfundament | ✅ Klaar | Next.js 16 + React 19, build groen, types groen |
| 2. API & datamodel | ✅ Klaar | Live data werkt, smoke test groen, types schoon |
| 3. Gedeelde componenten | ✅ Klaar | Sessie 3 + 3A + 3B + W6 |
| B1/B2 Auth & Membership (deel 1) | ✅ Klaar | `auth-strategy.md`, TS-types per datacontract, mock geüpdatet |
| Johan-gesprek (12-05-2026) | ✅ Klaar | Alle 9 vragen beantwoord. 5 architectuur-vondsten onderweg. Vervolgsessie B1/B2 deel 2 voorbereid |
| B1/B2 Auth & Membership (deel 2) | ⏸ Wacht op start | Code-werk + documentatie-verwerking; geschat 2-3 uur |
| 4. Materials | ⬜ Niet gestart | Klaar zodra B1/B2 deel 2 is afgerond |
| 5. Brands | ⬜ Niet gestart | Klaar voor bouw, mits brand-gallery via attachments werkt |
| 6. Articles | ⬜ Niet gestart | Insider-only-meta moet nog ontsloten — sessie 6-blocker |
| 7. Talks | ⬜ Niet gestart | Talk-meta in handover ontbreekt — sessie 7-blocker |
| 8. Events | ⬜ Niet gestart | Klaar voor bouw |
| 9. Books | ⬜ Niet gestart | Books-CPT bestaat niet in plugin — gaat via WC-products |
| 10. Homepage | ⬜ Niet gestart | |
| 11. Algemene templates | ⬜ Niet gestart | |

Status codes: ⬜ Niet gestart · 🔄 In uitvoering · ⏸ Gepauzeerd · ✅ Klaar · ⚠️ Issues

---

## Aangemaakte bestanden (sessie 1)

### Root
- `package.json`, `tsconfig.json`, `next.config.ts`, `.env.local.example`, `.gitignore`, `README.md`

### Stylesheet
- `src/styles/globals.css` — alle design tokens 1-op-1 uit `MaterialDistrict_MockUp_DEF.html`

### Centrale config
- `src/lib/config/membership.ts`

### Types (sessie 1, herzien in sessie 2)
- `src/types/shared.ts` — basis WP-types (sessie 2: User onaangepast tot membership-uitleg)
- `src/types/material.ts`, `brand.ts`, `article.ts`, `talk.ts`, `event.ts`, `book.ts`

### App
- `src/app/layout.tsx`, `src/app/page.tsx` (vervangen in sessie 2 door smoke test)

### Components (placeholders)
- `src/components/layout/Header.tsx`, `Footer.tsx`

---

## Aangemaakte/gewijzigde bestanden (sessie 2)

### Nieuwe types
- `src/types/media.ts` — `MediaImage`, `MediaSize`, `Gallery`, `ImageSizeKey` (gemodelleerd op werkelijke `/wp/v2/media`-response)
- `src/types/facetwp.ts` — exact gemodelleerd op `facetwp.json` (20 facets, ghost-flags, sort-opties, request/response shapes)

### Herziene types (op basis van werkelijke API + handover)
- `src/types/material.ts` — definitief: `WPMaterialRaw`-shape, `MaterialMeta` (alleen aliassen, geen underscore-velden), `MaterialProperties`, `MaterialListItem`, `Material`
- `src/types/brand.ts` — `BrandMeta` (underscore-velden volgens handover), `BrandListItem`, `Brand`
- `src/types/article.ts` — `ArticleMeta`, `ArticleListItem`, `Article` (met `insiderOnly` flag, default false tot meta ontsloten)
- `src/types/event.ts` — `EventMeta`, `EventListItem`, `Event` (met date/time-combinatie tot ISO `startsAt` / `endsAt`)
- `src/types/talk.ts` — minimale shape, talk-specifieke meta nog niet bekend

### API-clients
- `src/lib/api/wordpress.ts` — generieke fetcher (Basic Auth, error classes, `wpFetch`, `wpFetchOrNull`, `wpFetchPaginated`), taxonomie-helpers, media-helpers, `getAttachmentsForPost`, en raw endpoint-functies voor `material`, `brand`, `article`, `event`, `talk`
- `src/lib/api/facetwp.ts` — volledige FacetWP-client + `fetchMaterials` helper
- `src/lib/api/woocommerce.ts` — Basic Auth client + products/books endpoints (klaar voor sessie 9)
- `src/lib/api/mappers.ts` — pure raw→domain mappers voor alle CPT's, plus `splitGallery()` (hero + thumbs uit attachments + featured_media)
- `src/lib/api/content.ts` — high-level API (`getMaterial`, `listMaterials`, `getBrand`, `listBrands`, `getArticle`, `listArticles`, `getEvent`, `listEvents`, `getTalk`, `listTalks`) met optionele relation-resolves (gallery, hero, brand-naam batch)
- `src/lib/api/index.ts` — barrel export — pages importeren uit `@/lib/api`

### Utilities
- `src/lib/utils/material-properties.ts` — `parseMaterialProperties(class_list)` (extraheert glossiness/hardness/etc. uit `class_list`-strings zonder extra fetch), `humanizeValue()`, `humanizeFacet()`, `toMaterialTags()`

### App
- `src/app/page.tsx` — vervangen door smoke test die OBRO live ophaalt en toont (titel, hero, thumbs, properties, meta-velden, externe links). Wordt vervangen in stap 10.

### Configuratie
- `.env.local.example` — uitgebreid met `WP_APP_USER`, `WC_API_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`

### Documentatie (los van codebase)
- `wp-rest-api-blockers.md` — blocker-doc dat naar developer is gestuurd (sessie 2-pauze)
- `wp-rest-api-followup.md` — kleine vervolg-vragen (samples-alias + meta.gallery clarificatie + brand-admin-gallery-uploader-vraag)

---

## API-bevindingen (sessie 2 verificatie)

### Endpoints die werken (geverifieerd live)
- `GET /wp/v2/material` ✅
- `GET /wp/v2/material/<id>` ✅
- `GET /wp/v2/material?slug=<slug>` ✅
- `GET /wp/v2/media?parent=<post_id>` ✅ (gallery-fetch)
- `GET /facetwp/v1/fetch` (via aangeleverde config — niet live getest, structuur uit `facetwp.json`)

### Endpoints die werken na developer-commit `0d8c923`
- `GET /wp/v2/brand` ✅ (REST-enabled in commit)
- `GET /wp/v2/article` ✅
- `GET /wp/v2/event` ✅
- `GET /wp/v2/talk` ✅
- Material-meta inclusief `brand_id`, `gallery` (zie punt onder), `video_url`, `disable_sample_request` (na fix), etc.

### Niet bestaand
- `GET /wp/v2/book` — geen book-CPT in MaterialDistrict-plugin. Books gaan via WooCommerce-products (categorie-filter) — geconfigureerd in `woocommerce.ts`, slug bevestigen voor sessie 9.

### Datamodel-keuzes
- **`meta.samples_available` wordt genegeerd** — alias is misleidend omgekeerd t.o.v. WP-bron `_material_disable_sample_request`. Developer is gevraagd alias om te draaien naar `disable_sample_request` met identieke semantiek. Tot die fix is `material.disableSampleRequest` standaard `false` (samples aan).
- **`meta.gallery` wordt genegeerd** in de frontend — gallery komt uit `/wp/v2/media?parent=<id>` met `orderby=menu_order&order=asc`, met `featured_media` als hero. Reden: directer, geen synchronisatie-issue tussen meta en attachments. Aan developer gevraagd of `meta.gallery` een specifieke functie heeft die we missen.
- **Underscore-velden niet getypt** in Material-meta — alleen frontend-aliassen. Voor onderhoudbaarheid: één bron van waarheid in TypeScript. Brand-meta heeft (nog) géén aliassen, dus daar gebruiken we wel de underscore-velden.
- **Eigenschap-taxonomieën via `class_list`** — geen extra term-fetches nodig op overzichtspagina. Slugs hebben de vorm `<facet>-<value>`, parser respecteert facet-namen met underscore en waarden met streepjes (zoals `weather_resistance-good` en `translucence-50-100-percent`).
- **Image-sizes geverifieerd**: `thumbnail` (320×200), `medium` (600×400), `medium_large` (768×512), `large` (960×640), `1536x1536` (1536×1024), `full` (2000×1333), `listing-article` (660×300, custom MD-size). Aspect-ratio is doorgaans 3:2; `listing-article` is 11:5.
- **Alt-texts zijn leeg** op getoetste OBRO-attachments — toegankelijkheidsissue, frontend gebruikt material-titel als fallback. Content-team / brands moeten alt-tekst gaan invullen.
- **`menu_order` niet expliciet gezet** op OBRO-attachments — verwachte fallback op upload-datum werkt zoals gepland.

### FacetWP — niet geverifieerd live
We hebben de config-export, maar de fetch zelf is niet live getest. Wordt ondervangen in sessie 4 (Materials overzichtspagina) waar `fetchMaterials` voor het eerst gebruikt wordt. Geen risico — `facetwpFetch()` is een dunne wrapper rond een gestandaardiseerd POST-endpoint.

---

## Beslissingen & keuzes

### Sessie 1
1. **Mockup is leidend boven `design-tokens.md`**.
2. **Fonts: DM Serif Display + DM Sans**.
3. **Radius: 6 / 8 / 12 px**.
4. **Insider-badge kleur geharmoniseerd naar `var(--ct-member)`**.
5. **Next.js 16 + React 19 stable**.
6. **Header/Footer als placeholders** in sessie 1; volledige implementatie in stap 3.
7. **Tijdelijke homepage** met smoke-test.
8. **Geen Tailwind, geen CSS-modules**.

### Sessie 2 — verkenning + pauze (eerder)
9. **Pauzeren tot WP-developer de REST API heeft uitgebreid**.
10. **`?_embed=1` blijkt door één van de fetchers gestript te worden** — voor toekomstige diagnose: handmatig fetchen.

### Sessie 2 — vervolg na developer-commit
11. **Drielaagse data-architectuur**: raw API-shapes (`WP*Raw`) → mappers → domain types (`Material`, `Brand`, etc.). Pages roepen alleen high-level `getMaterial`/`listMaterials`/etc. uit `content.ts` aan. Mappers zijn pure functions, testbaar zonder netwerk.
12. **Optionele relation-resolves** op high-level functies (`resolveHero`, `resolveBrandName`, `resolve.gallery`). Default ON; pages die het niet nodig hebben kunnen het uitzetten voor performance. Brand-namen worden batch-geresolved met `include=`-parameter (één extra REST-call per pagina, niet één per item).
13. **Gallery-strategie**: `featured_media` is hero, alle overige attachments via `/wp/v2/media?parent=<id>&orderby=menu_order` zijn thumbs. `meta.gallery` wordt genegeerd (zie ook openstaande vraag).
14. **`samples_available` alias wordt genegeerd** tot developer hem omdraait naar `disable_sample_request`.
15. **`getMaterialBySlug` wordt niet zelf uitgebreid** — in plaats daarvan een aparte `getMaterial(slug, options)` in `content.ts` die fetch + resolves orchestreert. Houdt `wordpress.ts` als pure raw-laag.
16. **Books gaan via WooCommerce, niet via een eigen book-CPT** — bevestigd door developer-handover. Slug van WC-categorie nog te bevestigen voor sessie 9.

---

## Openstaande vragen

> Voor sessie 6, 7, 9 en de nog niet aangeroerde stappen:

### Aan WP-developer (zie `wp-rest-api-followup.md`)
1. **`samples_available` alias omdraaien** naar `disable_sample_request` met identieke semantiek als bron
2. **Wat doet `meta.gallery` op material?** — frontend gebruikt het niet, dus óf bevestiging dat we niets missen, óf verduidelijking met use-case
3. **Brand-admin gallery-uploader** — bevestigen dat brand-admins meerdere afbeeldingen aan een brand-post kunnen uploaden
4. **Insider-only meta-veld op article** — voor sessie 6 (Articles): hoe wordt insider-gating in WP gemarkeerd? Custom meta `_insider_only`, aparte categorie, of iets anders?
5. **Talk-meta** — voor sessie 7: welke meta-velden zijn er (speakers, video-URL, datum, locatie)?

### Aan opdrachtgever
6. **Custom membership-systeem uitleg** — niet binnen tijdens sessie 2; nodig voordat User-types definitief kunnen worden:
   - Hoe is `readerTier` (`free` / `insider`) opgeslagen?
   - Hoe is `manufacturerTier` (`free` / `basis` / `plus` / `partner`) opgeslagen?
   - Hoe uitleesbaar via REST? Custom endpoint of standaard `/wp/v2/users/me`?
   - Hoe wordt expiratie / verloopdatum bijgehouden?
   - Kan een gebruiker tegelijk Insider én Manufacturer zijn?
   - Hoe bepaalt de frontend dat de huidige bezoeker een specifiek brand "is" (Fase 2)?
7. **WC-categorie-slug voor books** — `'books'`, `'boek'`, of anders?
8. **WordPress applicatiewachtwoord** voor de Next.js-frontend
9. **WooCommerce consumer key + secret**
10. **Deployment-doel** — Vercel of eigen server?
11. **Git repository URL**
12. **Staging-omgeving**

---

## Bekende issues
*Geen.*

---

## Sessiegeschiedenis

### Sessie 0 — Voorbereiding (07-05-2026)
- Projectdocumenten aangemaakt
- Membership-configuratie uitgewerkt
- Design tokens geëxtraheerd

### Sessie 1 — Projectfundament (07-05-2026) ✅
- Volledige projectstructuur conform `architecture-rules.md`
- Next.js 16 + React 19 + TypeScript
- `globals.css`, `membership.ts`, alle TS-interfaces (educated guess), Header/Footer placeholders, smoke test
- Build groen, typecheck groen

### Sessie 2 — API & datamodel (07-05-2026) ✅

**Eerste deel — verkenning + pauze:**
- WP REST API verkend, FacetWP-config geanalyseerd uit `facetwp.json`
- Material-CPT werkt; brand/article/event/talk geven 404
- Geen ACF op materials; brand-relatie en gallery in raw post-meta (niet ontsloten)
- Sessie gepauzeerd; `wp-rest-api-blockers.md` opgesteld

**Tussenliggend werk (developer ~30 min):**
- Developer leverde commit `0d8c923` met REST-enabled CPT's en uitgebreide material-meta
- Eén alias-issue ontdekt: `samples_available` is omgekeerd t.o.v. WP-bron

**Tweede deel — bouw:**
- Verificatie-fetches op material + media bevestigden alle aannames
- 8 nieuwe TypeScript-bestanden + 4 herziene
- Drielaagse architectuur: raw → mappers → domain
- Smoke test op `/` haalt OBRO live op
- TypeScript schoon (`npx tsc --noEmit` exit 0)
- `wp-rest-api-followup.md` opgesteld met twee kleine vragen aan developer

### Sessie 3 — Gedeelde componenten (07-05-2026) ✅
*Niet apart in dit log gedocumenteerd; afgerond vóór sessie 3A.*

### Sessie 3A — Design System & Style Guide (08-05-2026) ✅
*Stap 3.5 — toegevoegd na sessie 3 omdat het visuele systeem niet geconsolideerd was. 6 batches: design-feedback verwerken, form-fields herschrijven, ContentCard layout-overhaul + Tags & InsiderMark, Buttons/Links/Navigation, Membership-gates, finalisatie.*

### Sessie 3B — Correcties op design system (09-05-2026) ✅

Geen nieuwe stap; vervolg op stap 3.5. Tijdens review werden 10 correcties op het design system aangedragen, één voor één behandeld, akkoord per correctie, daarna in één batch verwerkt.

**Correcties verwerkt:**

1. **Dark mode contrast (drie sub-onderdelen).** `--text-muted`/`--text-hint` lichter; content-type Tag-paren mid-fill+witte-tekst in dark mode (book uitgezonderd); nieuw `--link` token (light=navy, dark=navy-light) toegepast op TextLink/Tabs/HeaderNavItem/MobileNavItem/Breadcrumb-links/Pagination. ActionButton is-active feller groen in dark. Skeleton-shimmer zichtbaar in beide modes. Channel-tag-overlay was al correct.
2. **ActionButton compare-icoon.** `strokeWidth={2.5}`-overrides verwijderd uit style-guide-voorbeelden zodat icoon overal identiek is aan Iconen-sectie.
3. **`member` → `insider` hernoeming.** Door het hele design system: tokens (`--ct-member-*` → `--ct-insider-*`), CSS-klassen (`.btn-member` → `.btn-insider`, `.ct-tag.ct-member` → `.ct-tag.ct-insider`), TypeScript-types (Tag `'member'` → `'insider'`, Button `'member'` → `'insider'`). Oude waarden blijven werken als deprecated alias. INSIDER-tag verplaatst naar Insider-componenten-sectie van style-guide.
4. **InsiderBadge padding consistent.** Sterretje in alle varianten (default/sm/padded) op gelijke optische afstand van linker pill-rand. Was: 3/0/10px. Nu: 9/6/12px.
5. **Skeleton-shimmer zichtbaar.** Light mode: donker-grijs-band ipv wit-band (was onzichtbaar over `--surface2`). Dark: skeleton-blok lichter dan `--bg`, shimmer-alpha verhoogd.
6. **FilterSidebar header (visueel deel).** "Filters" body-font wit, beide klassenamen werken (`.uf-title` en `.uf-header-title`). "Clear" als outline-button-stijl met witte border. Functionele uitbreiding (collapse, search-in-section) geparkeerd in W6.
7. **Breadcrumb visueel onderscheid.** Links → `--text-muted` (hover `--link`), separator → `--text-hint`, current → `--text` met font-weight 600.
8. **InsiderGate herzien naar mockup.** Alle 4 varianten (modal/paywall/panel/card) krijgen het mockup-patroon: teal top-block met icoon-vierkant + INSIDER ONLY eyebrow + DM Serif Display titel + uitleg in wit; wit body-block met benefits als kaartjes en teal CTA-knop (`btn-insider`). Modal heeft Maybe later + optionele "Don't show this again". Mockup-CSS-waarden direct overgenomen uit `MaterialDistrict_MockUp_DEF.html` regels rond `.insider-modal-top` / `.insider-modal-body`.
9. **Lock-cirkel altijd rond.** `flex-shrink: 0` + `align-self: center` op `.brand-tier-gate-icon` en `.insider-gate-icon` voorkomt vervorming naar ovaal in flex-contexten.
10. **BrandTierGate Section padding-top.** `.brand-tier-gate-overlay` padding-top 24px → 36px voor ademruimte boven content (Partner-variant zonder lock-cirkel).

**Bestanden gewijzigd:**
- `src/styles/globals.css` — alle CSS-correcties (1-10), nieuwe tokens (`--ct-insider-*`, `--link`), member→insider hernoeming met backward-compat
- `src/components/ui/Tag.tsx` — `ContentType` union: `'insider'` toegevoegd, `'member'` als deprecated alias
- `src/components/ui/Button.tsx` — `ButtonVariant` union: `'insider'` toegevoegd, `'member'` als deprecated alias (mapt intern naar `.btn-insider`)
- `src/components/ui/InsiderGate.tsx` — JSX herzien: CTA-knop className van `btn-primary` (navy) naar `btn-insider` (teal); Maybe later + Don't-show-again binnen body-wrapper
- `src/components/ui/InsiderBadge.tsx` — alleen docstring update (member → insider)
- `src/app/style-guide/page.tsx` — compare-icoon fix, INSIDER-tag verplaatst naar Insider-sectie, member→insider props, Don't-show-again toegevoegd aan modal-preview, intro-tekst bij Insider-gates verwijst naar mockup-patroon
- `preview_styleguide.html` — alle CSS-correcties gespiegeld, ct-tag insider hernoemd, btn-primary CTA's vervangen door btn-insider, INSIDER-tag verplaatst, Added-knop juiste BarChart2-icoon
- `design-system.md` — §3 (Kleursysteem) uitgebreid met `--ct-insider-*`, `--link` token, dark-mode-strategie. §5.2 Buttons-varianten member→insider. §5.3 Tag-iconen-tabel insider. §5.5 InsiderGate-varianten herschreven met mockup-patroon. Wijzigingen-log v1.7.
- `open-issues.md` — W6 toegevoegd (FilterSidebar functionele uitbreiding). Wijzigingen-log v1.1.

**Post-3B fix — Compare-icoon vergrendeld als custom SVG:**
- `src/components/ui/icons/CompareIcon.tsx` (nieuw) — custom SVG, drie staafjes oplopend, strokeWidth 2, linecap round
- `src/components/ui/icons/index.ts` — `BarChart2 as IconCompare` uit lucide-export verwijderd, vervangen door `export { CompareIcon as IconCompare } from './CompareIcon'`. ICON_REGISTRY metadata: source van `lucide-react/BarChart2` → `custom/CompareIcon`.
- `design-system.md` §5.7 Bronnen-tabel — Custom SVG-rij uitgebreid met `CompareIcon` naast `InsiderIcon`.

**Lessons learned voor andere lucide-iconen:**
`lucide-react` is niet versie-gepind in `package.json`. Bij dependency-updates kunnen icoon-namen verschuiven (BarChart-familie is daar een voorbeeld van; LucideIcons heeft de chart-categorie meermaals herstructureerd). Voor de meeste UX-iconen is dat geen probleem (Bookmark, ChevronRight, etc. zijn stabiel), maar voor centrale brand-acties met visuele consequenties moet er een keuze gemaakt worden: ofwel versie pinnen, ofwel custom SVG. We hebben nu twee custom SVG's (`InsiderIcon`, `CompareIcon`). Mocht een ander icoon (bv. `IconSaveSearch` = floppy-disk) ook centraal blijken in de UX, dan kan dezelfde aanpak gevolgd worden.

**Beslissingen genomen (genummerd, doortellend vanaf bestaande lijst):**

17. **Mockup is leidend voor InsiderGate-styling.** Bij correctie 8 zijn exacte CSS-waarden uit `MaterialDistrict_MockUp_DEF.html` overgenomen (padding `32px 32px 28px` voor modal-top, `28px 32px 32px` voor modal-body, teal `#007890` = `--ct-insider`, feature-grid 2-cols gap 10px, `.insider-feature-item` `surface2`-fill met border en check-icoon). Niet vrij vertaald.
18. **Insider-CTA-knop is teal, niet navy.** `btn-insider` (teal-fill, witte tekst) i.p.v. `btn-primary` (navy-fill). Logica: de hele gate is Insider-branded, dus de CTA hoort in dezelfde kleur als de branding.
19. **Backward-compat boven schoonmaakwerk.** Bij member→insider hernoeming zijn oude tokens en klassen behouden als alias (`--ct-member: var(--ct-insider)`, `.btn-member` blijft werken, Tag `contentType="member"` rendert nog steeds correct). Reden: voorkomt brekende veranderingen voor bestaande pages of preview-HTML. Een latere opruim-sessie kan de aliassen verwijderen.
20. **`--link` als semantisch token i.p.v. directe `--navy-light` overrides.** Eén centraal token regelt de "interactieve navy"-rol voor light/dark mode. Voorkomt dat we elk component apart moeten patchen voor dark mode.
21. **Dark mode Tag-paren: mid-fill + witte tekst (Insider-pill conventie).** Optie B uit de gespreksanalyse, niet pale-fill verlichten. Sluit aan bij hoe `<InsiderBadge>` al werkt — visueel consistent.
22. **FilterSidebar functioneel uitbreiden hoort niet in 3B.** Sessie 3B was een correctie-sessie op design-system-deliverables, niet een feature-uitbreiding. Collapse/expand en search-binnen-sectie horen op een page (Materials in sessie 4) getoetst te worden, niet alleen statisch in een style-guide. Geparkeerd als W6.
23. **InsiderBadge padding-strategie: gelijke padding links/rechts.** Was eerder asymmetrisch (default 8px rechts / 3px links) om het sterretje strakker tegen de rand te zetten. Sessie 3B: gewoon symmetrisch, sterretje + 5px gap + tekst, met 9px padding aan beide kanten. Voor `is-padded`: 12px. Voor `is-sm`: 6px. Resultaat is visueel rustig én consistent over varianten.

24. **Compare-icoon vergrendelen als custom SVG (post-3B fix).** Tijdens review na sessie 3B bleek dat het Compare-icoon in de ActionButton-voorbeelden visueel afweek van het icoon in de Iconen-sectie. Root cause: `lucide-react` hernoemt periodiek hun chart-iconen (`BarChart2` → `ChartNoAxesColumn` is recent gebeurd) waardoor het visuele resultaat afhangt van welke versie geïnstalleerd is, en dat is niet versie-gepind in `package.json`. Twee opties: (a) `lucide-react` versie pinnen + workaround op de hernoemingen, (b) custom SVG, versie-onafhankelijk. Gekozen voor (b) omdat Compare een centrale UX-actie is die op veel plekken voorkomt (cards, detail-headers, compare-bar) en visuele stabiliteit belangrijker is dan flexibiliteit. Nieuw bestand `src/components/ui/icons/CompareIcon.tsx` met drie staafjes oplopend (5/12/19 hoog), strokeWidth 2, linecap round. Registry exporteert `CompareIcon as IconCompare` zodat alle bestaande imports automatisch het juiste icoon krijgen — geen wijzigingen nodig in `Tag.tsx`, `Button.tsx`, `ActionButton.tsx`, `InsiderGate.tsx`, of `style-guide page.tsx`. Past in het bestaande patroon: `InsiderIcon` was al om dezelfde reden custom (brand-asset). Beide staan nu naast elkaar in §5.7 Bronnen-tabel als "Custom SVG".

**Openstaand na sessie 3B:**

- **W6 (nieuw):** FilterSidebar functionele uitbreiding (collapse/expand, search-binnen-sectie, initial-state-prop) — voor sessie 4. 🟡
- **Backward-compat aliases opruimen:** in een latere sessie kunnen `--ct-member-*`, `.btn-member`, `.ct-tag.ct-member`, en de `'member'` deprecated TS-aliassen verwijderd worden zodra alle code op `insider` staat. Niet urgent.
- **Bestaande blockers ongewijzigd:** B1 (auth), B2 (membership-opslag), B3 (URL-mapping), W1-W5 staan onveranderd in `open-issues.md`. Sessie 4 (Materials) wacht op B1+B2.

### Sessie W6 — FilterSidebar verificatie en preview-uitbreiding (09-05-2026) ✅

Bedoeld als pre-sessie 4: de drie features die in W6 stonden (collapse/expand,
search-binnen-sectie, initial-state-per-sectie) gingen we bouwen.

**Bevinding na pre-flight:** alle drie de features waren al in de component-code aanwezig
sinds sessie 3 (oorspronkelijke FilterSidebar-implementatie). De CSS-styling stond ook
klaar (`.uf-section-toggle`, `.uf-chevron`, `[aria-expanded="false"]`-rotatie, `.uf-search`).

In sessie 3B was dat onopgemerkt gebleven omdat de focus daar op visuele tweaks
(header-styling) lag, en de preview-data in de style-guide gebruikte slechts twee secties
zonder `searchable` of `defaultOpen: false`. De feature was er, maar onzichtbaar.

**Wat we hebben gedaan:**
- Style-guide preview uitgebreid: derde sectie "Sustainability" met 13 opties en
  `searchable: true` (zodat search-binnen-sectie zichtbaar is), vierde sectie
  "Application" met `defaultOpen: false` (zodat collapse/expand standaard ingeklapt
  reproduceert).
- Toelichtende tekst boven de preview die expliciet vermeldt welke props welke gedragingen
  activeren.
- W6 afgesloten in `open-issues.md` met resolutie-beschrijving.
- W7 toegevoegd in `open-issues.md`: preview-HTML uit sync met React-component op enkele
  plekken (verschillende klassenamen). Niet blokkerend voor sessie 4 omdat die op de live
  React-page werkt; sweep-correctie voor later.

**Beslissing 25:**
**Preview-HTML niet synchroniseren in deze pre-sessie.** Toen we W6 implementeerden bleek
dat `preview_styleguide.html` (statische HTML-snapshot) op enkele componenten andere
klasse-namen gebruikt dan de React-component. Synchroniseren is een grotere ingreep dan
W6 zelf en hoort in een aparte sweep-sessie. Voor sessie 4 niet relevant. Genoteerd als
W7.

**Beslissing 26 (na W6, in lopend gesprek):**
**Mockup vs design-system rolverdeling expliciet vastgelegd in `architecture-rules.md`.**
Aanleiding: opdrachtgever vroeg of de mockup zou moeten worden bijgewerkt om aan het
design-system te conformeren, en uitte zorg over conflicten — met name voor responsive
layouts waar de mockup geen antwoord op geeft.

Beslissing: mockup blijft "als is" als historisch/functioneel anker; design-system is
levend voor styling. Drie-laags-prioriteitsregel: design-system > mockup > Claude-
voorstel-met-akkoord (voor responsive). Bij elke pagina-sessie verplichte pre-flight
in vier stappen: mockup-inspectie, design-system-inspectie, responsive-voorstel,
akkoord vragen.

Reeds gebouwde componenten (Header, Footer, FilterSidebar, ContentCard) niet vooraf
nalopen op responsive correctheid — pakken we per pagina-sessie op zodra ze in context
gebruikt worden.

Dit is een **werkwijze-beslissing**, niet een technische. Borgt dat ik in elke
volgende sessie consistent dezelfde aanpak hanteer en dat opdrachtgever niet voor
verrassingen komt te staan.

**Niet getest in browser** — gebruiker heeft geen lokale dev-omgeving en zou daarvoor
afhankelijk zijn van Johan (developer). Code-review is gebeurd; de implementatie is
correct. Live verificatie wordt opgepakt zodra Johan maandag beschikbaar is.

**Bestanden gewijzigd:**
- `src/app/style-guide/page.tsx` — FilterSidebar-preview uitgebreid van 2 naar 4 secties,
  toelichtende tekst toegevoegd
- `open-issues.md` — W6 afgesloten met resolutie, W7 toegevoegd
- `architecture-rules.md` — nieuwe sectie "Mockup vs design-system" toegevoegd
  (rolverdeling, prioriteitsregel, pre-flight per pagina-sessie). Verwijzing toegevoegd
  vanuit Responsiveness-sectie.
- `session-log.md` — dit verslag, beslissingen 25 en 26

---

### Sessie B1/B2 — Authenticatie & Membership-types, deel 1 van 2 (11-05-2026) ✅

Voorbereidende sessie ter ontblokkering van sessies 4 en verder. Doel:
de twee 🔴 blockers (B1 auth-strategie, B2 membership-opslag) zo ver
mogelijk dichttimmeren vóór Johan's overleg op dinsdag 12-05-2026,
zodat we maandag niet stil hoeven te zitten en dinsdag direct kunnen
aansluiten.

**Werkwijze deze sessie:**
1. Pre-flight: open issues gescand, drie kernvragen geformuleerd
   (auth-flow keuze, `is_placeholder`-strategie, volgorde A-E)
2. Op verzoek van opdrachtgever (geen developer): aanpak vereenvoudigd
   naar één centrale beslissing ("cookie of localStorage"), rest van de
   technische keuzes door Claude voorgesteld en op papier vastgelegd
3. `auth-strategy.md` geschreven in normale taal
4. TypeScript-types bijgewerkt zonder tussentijdse akkoorden — op
   verzoek opdrachtgever ("ik kan er toch niets zinnigs over zeggen,
   belangrijkste is dat je bijhoudt wat we dinsdag moeten weten")

**Bestanden aangemaakt:**
- `auth-strategy.md` — 1-pagina-document (in normale taal) dat de
  inlog-flow vastlegt: JWT-token in HttpOnly cookie, server-side
  leeslogica, aansluiting op `/wp-json/md/v2/auth/me` uit datacontract.
  Bevat vier concrete vragen aan Johan voor dinsdag (JWT-plugin keuze,
  geldigheidsduur, secret-key-deling, wachtwoord-reset-flow).

**Bestanden gewijzigd:**
- `src/types/shared.ts` — `User`-interface volledig herzien naar de
  shape uit `datacontract-proposal.md` sectie 2. Nieuwe types:
  `Membership`, `BrandMembership`, `MembershipStatus`, `BillingInterval`,
  `AuthMeResponse`. Constante `UNLIMITED_PUBLICATIONS = -1`
  geïntroduceerd voor leesbaarheid in code.
- `src/types/material.ts` — `MaterialPublication`-type toegevoegd
  (uit datacontract sectie 3). `MaterialMeta.publication` als optioneel
  raw-veld; `Material.publication` en `MaterialListItem.publication`
  als verplicht domain-veld (mapper bouwt placeholder als API het nog
  niet levert).
- `src/lib/config/membership.ts` — `INSIDER_PRICING.annual` (€100/jaar)
  geactiveerd; was eerder gecomment placeholder. Header-comment
  bijgewerkt met datacontract-referentie.
- `src/components/providers/AuthContext.tsx` — herschreven om de
  nieuwe `User`-shape te gebruiken. Mock-implementatie behouden
  (echte cookie-flow wacht op Johan), nu met `signIn({ insider?, brand? })`
  voor flexibele mock-states. `isLoggedIn` en `isMember` blijven
  exposed voor backward-compat — Header, HeaderShell, FilterSidebar
  en DetailActions blijven zonder wijziging werken.
- `src/lib/api/wordpress.ts` — TODO-blok regel 840-848 vervangen door
  `getCurrentUser(token)` placeholder met definitieve signatuur (return
  type `Promise<AuthMeResponse>`). Throwt expliciet zolang endpoint
  niet live is, om accidentele production-call met mock-data te
  voorkomen.

**Bestanden nieuw:**
- `src/lib/auth/user-helpers.ts` — user-aware membership-helpers
  (`isInsider(user)`, `findBrandMembership(user, {slug|id})`,
  `isBrandManager(user, brand)`, `getHighestBrandTier(user)`).
  Gescheiden van `src/lib/config/membership.ts` om circulaire imports
  te vermijden (shared.ts importeert uit membership.ts voor de
  primitive tier-types).

**Documentatie-updates:**
- `open-issues.md` — B1 en B2 bijgewerkt van 🔴 Blocker naar
  🟡 Gedeeltelijk opgelost. Volledige resolutie wacht op Johan dinsdag.
  Wijzigingen-log v1.3.
- `session-log.md` — dit verslag.

**Type-check status:** `tsc --noEmit` op de gewijzigde files schoon
(uitgevoerd in geïsoleerde omgeving, niet in de eigenlijke project-
context; finale verificatie volgt zodra de bestanden in de codebase staan).

**Beslissingen genomen (genummerd, doortellend vanaf 26):**

27. **Auth via cookie boven localStorage.** HttpOnly + Secure +
    SameSite=Lax. Veiliger, SSR-friendly, past bij Next.js Server
    Components (pijler 2 — Performance). Vastgelegd in
    `auth-strategy.md` §2.
28. **`is_placeholder` als gewoon veld in de types, geen type-guard.**
    Het datacontract beweegt nog; complexe type-guards (`isLiveMembership(m): m is LiveMembership`)
    zouden extra refactor-werk geven als Johan iets afwijkends voorstelt.
    UI-code beslist zelf of het placeholder-state visueel toont.
29. **User-aware helpers in aparte file `src/lib/auth/user-helpers.ts`.**
    Niet in `membership.ts` zelf, omdat `shared.ts` daar al uit
    importeert (`ReaderTier`/`ManufacturerTier`). Circulaire imports
    vermeden door scheiding. `membership.ts` blijft puur configuratie
    + primitive-tier-helpers.
30. **Backward-compat op `AuthContext`.** `isLoggedIn` en `isMember`
    blijven beschikbaar als convenience-flags op de context value,
    naast het nieuwe `user`-object. Voorkomt cascade-wijzigingen in
    Header, HeaderShell, FilterSidebar, DetailActions. Consistent met
    beslissing 19 (backward-compat boven schoonmaakwerk) uit sessie 3B.
31. **`getCurrentUser()` throwt als placeholder.** Liever expliciet
    falen dan stilletjes mock-data terugsturen die in production
    onbedoeld werkt. De echte implementatie volgt na dinsdag in een
    korte vervolgsessie.
32. **`UNLIMITED_PUBLICATIONS = -1` als named constant.** Datacontract
    gebruikt sentinel `-1` voor unlimited publication-quota; een named
    constant maakt code-lezen eenvoudiger ("`b.publicationQuota === UNLIMITED_PUBLICATIONS`"
    vs `b.publicationQuota === -1`).

**Wat dinsdag op tafel moet bij Johan:**

Uit `datacontract-proposal.md` §8:
- Status-string-naming (`active`/`inactive`/`canceled`/`past_due` of Stripe-namen?)
- `publication_quota: -1` als sentinel akkoord, of liever `null`/`"unlimited"`?
- Bestaande brand-data migratie — meebewegen of pas bij nieuwe activaties?
- Webhook-strategie (`customer.subscription.*` alleen, of ook `invoice.*`?)
- Edge cases B (brand downgrade) en C (past_due)

Uit `auth-strategy.md` §4:
- Welke JWT-plugin in WordPress?
- JWT-geldigheidsduur (default 7 dagen?)
- Hoe delen we de secret key tussen WordPress en Next.js?
- Wachtwoord-reset-flow — eigen endpoint of WordPress' reset-pagina?

**Vervolgsessie (na Johan dinsdag) — Sessie B1/B2 deel 2:**

Zodra Johan's antwoorden binnen zijn:
1. Eventuele aanpassingen op types/`AuthMeResponse` op basis van
   afwijkende keuzes (verwacht: klein, types zijn voorbereid op
   variatie via `is_placeholder` en optionele velden)
2. Echte `getCurrentUser()` implementeren tegen `/wp-json/md/v2/auth/me`
3. Next.js server-routes `app/api/auth/login/route.ts` en
   `app/api/auth/logout/route.ts` aanmaken
4. Cookie-zet- en leeslogica in `src/lib/auth/cookies.ts`
5. `AuthContext` overzetten van mock naar echte server-hydratie
6. Smoke-test op een dummy-account

Verwachte doorlooptijd deel 2: één sessie van 1-2 uur als Johan's
antwoorden in lijn liggen met het voorstel.

**Niet gedaan deze sessie, bewust:**

- Geen `/login` pagina (staat in sessie 11)
- Geen UI-aanpassingen aan bestaande componenten — backward-compat
  laat ze ongewijzigd werken
- ~~Geen tests — sluit aan op W2 (test-strategie nog te beslissen)~~
  → opgelost in vervolg hieronder
- `samples_available` alias-omdraaiing (W1.1) — onafhankelijk van auth,
  blijft staan voor sessie 4 voorbereiding

---

### Sessie B1/B2 deel 1 — vervolg, W2/W3/W4 afhandelen (11-05-2026) ✅

Korte aanvulling na deel-1-afronding. Op verzoek opdrachtgever ("kunnen
we vandaag niets meer doen?") drie 🟡 items uit `open-issues.md` die
sessie 4 zouden voorbereiden alsnog afgehandeld — geen code, alleen
documentatie + één beslissing.

**Bestanden gewijzigd:**

- `architecture-rules.md` — twee nieuwe secties toegevoegd vóór
  "Mockup vs design-system":
  - **Test-strategie** — Optie A vastgelegd (geen automatische tests),
    met motivatie, kwaliteits-laag-overzicht (TypeScript / style-guide /
    handmatige acceptatie / axe / Lighthouse), en trigger voor
    heroverweging (meerdere ontwikkelaars, frequente regressies,
    externe partij).
  - **Error-handling-patroon** — drie patronen vastgelegd: detail-page
    (`notFound()` voor 404, `error.tsx`-bubble voor 5xx), overzichts-page
    (`<EmptyState>` voor lege resultaten, `error.tsx` voor 5xx),
    form-submit (inline error-banner, **geen** toast). Defensie-volgorde:
    TypeScript → mapper → page → `error.tsx`.
- `design-system.md` — §11.2 (next/image en next/font) uitgebreid met
  expliciete image-conventies: 3-laags alt-text fallback, `onError`
  → placeholder-SVG, drie `sizes`-standaarden per context, priority-
  loading-regel (alleen first-above-the-fold), en image-size-keuze per
  context op basis van in sessie 2 geverifieerde WP-sizes.
  Wijzigingen-log v1.9.
- `open-issues.md` — W2, W3, W4 afgesloten met resolutie-beschrijvingen.
  Wijzigingen-log v1.4.
- `session-log.md` — deze toevoeging.

**Beslissingen genomen (genummerd, doortellend vanaf 32):**

33. **Geen automatische tests (Optie A).** TypeScript strict +
    handmatige acceptatie + `/style-guide`-check + axe DevTools +
    Lighthouse-steekproef. Motivatie opdrachtgever: 15+ jaar
    samenwerking met één developer (Johan), niet de verwachting dat
    er meerdere ontwikkelaars bijkomen. Heroverweging als die context
    verandert. Vastgelegd in `architecture-rules.md` nieuwe sectie
    "Test-strategie".
34. **Toast-meldingen niet voor form-status.** Een formulier verdient
    een eigen status-blok dicht bij de actie; toast-overlays zijn
    voor side-effects op andere plekken in de pagina (bv. "Item
    toegevoegd aan bookmarks"). Vastgelegd in `architecture-rules.md`
    nieuwe sectie "Error-handling-patroon".
35. **Image-fallback-keten 3-laags expliciet.** `attachment.alt_text`
    → `post.title` → generieke string. Voorkomt `alt=""` op niet-
    decoratieve afbeeldingen — bestaande code volgde dit al, nu
    expliciet als referentie. Vastgelegd in `design-system.md` §11.2.

**Status sessie 4 (Materials) — wat is nu nog open?**

| Issue | Status na vandaag |
|---|---|
| 🔴 B1 — Auth-strategie | 🟡 Gedeeltelijk: strategie + types klaar, wacht op Johan dinsdag |
| 🔴 B2 — Membership-opslag | 🟡 Gedeeltelijk: voorstel verzonden, wacht op Johan dinsdag |
| 🟡 W1.1 — `samples_available` alias | Open, ligt bij WP-developer |
| 🟡 W2 — Test-strategie | ✅ Afgesloten |
| 🟡 W3 — Error-handling | ✅ Afgesloten |
| 🟡 W4 — Image-conventies | ✅ Afgesloten |

Resultaat: alle "🟡 aanbevolen vóór sessie 4" items van de lijst af.
Sessie 4 start dinsdag direct na Johan's input op auth + datacontract.

---


Sessie 4 mag pas starten als B1 (auth-strategie) en B2 (membership-opslag) opgelost zijn. W1.1 (`samples_available` alias-omdraaiing), W2 (test-strategie), W3 (error-handling), W4 (image-conventies) zijn niet hard blokkerend maar sterk aanbevolen vóór sessie 4 — anders ad-hoc keuzes die teruggedraaid moeten worden.

W6 (FilterSidebar collapse/expand/search) kan binnen sessie 4 worden meegenomen of als korte pre-sessie ervoor.

---


### Zijsprong — Legacy-conversie & Membership-overgang, deel 1 (11-05-2026, avond) ✅

Niet-genummerde zijsprong-sessie, geïnitieerd door Jeroen vanuit
de vraag: "wat is het businessplan rondom de legacy-conversie die
nu in de mockup-banner zit (30 april 2027)?". De sessie groeide
gaandeweg tot een fundamentele herziening van het commerciële
model én het datamodel.

**Wat is opgeleverd:**
- `legacy-conversion-wip.md` *(nieuw)* — werkdocument met alle
  beslissingen, kaders en open punten. Niet het eindproduct; gestructureerd
  memo dat als startpunt dient voor de vervolgsessie.
- `vragen-johan.md` *(gewijzigd)* — uitbreiding met 10 nieuwe vragen
  (nummers 10 t/m 19) die voortkomen uit de legacy-conversie: brand- en
  materiaal-status-enums, prijzen-config, mutual-exclusion-regel,
  grandfathered-Stripe-modellering, sample-bibliotheek-datamodel, en
  data-export-eisen.
- `architecture-rules.md` *(gewijzigd, v1.4)* — nieuwe sectie
  "WordPress-werkwijze met Johan" toegevoegd. Borgt rolverdeling
  Claude-Johan-Jeroen voor datamodel-implementaties in WordPress.

**Bestanden níét aangepast deze sessie:**
- `datacontract-proposal.md` — uitbreiding (status-enums, grandfathered-
  velden) is onderwerp van het gesprek met Johan; nog niet eenzijdig
  ingebouwd.
- `open-issues.md` — geen nieuwe formele blocker; legacy-conversie loopt
  parallel aan sessies 4+, niet erop blokkerend.
- Broncode — geen wijzigingen in deze sessie.

**Beslissingen genomen (genummerd, doortellend vanaf 35):**

36. **Twee categorieën producten:** terugkerend (membership +
    material-publication) vs eenmalig (webshop met membershipkorting).
    Geen vermenging.
37. **Tier-prijzen herzien:** Basic €750 (ongewijzigd), Plus
    **€1.500** (was €1.250), Partner **€3.000** (was €3.750).
38. **Standalone material-publication: €250/jaar.** Sterkere
    upsell-mechaniek dan eerdere €150-voorstel.
39. **Free-tier voor brands behouden** maar brand-page en directory
    pas zichtbaar bij minstens 1 actieve publicatie. Voetnoot in
    pricing-tabel.
40. **Sample/info-requests universeel** bij elke gepubliceerde
    material, niet tier-gebonden.
41. **Geo-based lead routing blijft Plus+** — slimme routing wel
    tier-feature, sample-aanvraag zelf niet.
42. **Grandfathered MAT-tarief** (€100/jaar) gebonden aan specifieke
    materialen, niet aan slots. Vervalt bij upgrade of vervangen.
43. **Grandfathered PRO-tarief:** PRO 5 → Plus op €995, PRO 10 → Plus
    op €1.245. Twee aparte tarieven. Volle 15 Plus-slots. Vervalt
    bij stoppen.
44. **Mutual exclusion:** brand heeft óf tier-membership óf Free met
    standalones; nooit beide. Bij upgrade kantelen alle materialen
    naar `member`-status.
45. **Status-architectuur:** brand-status enum (5 waarden) en
    materiaal-status enum (6 waarden). Symmetrisch: voor elke
    "actieve" status een `former_*`-tegenhanger. Houdt content-asset
    bewaard, maakt reactivering-campagnes mogelijk.
46. **Prijzen centraal in code-config**, niet verspreid. Database
    verwijst naar welke prijs van toepassing is via status-velden.
47. **Geen retentie-kortingen bij stop.** Eerlijke prijs van begin af
    aan; klanten voelen "speciaal aanbod om te blijven" als
    manipulatie. Wel half-jaarlijkse reactivering-mailings naar
    `former_*`-statussen.
48. **Online/offline-toggle in dashboard** dwingt tier-quota af met
    blocking melding bij overschrijding (server-side validatie).
49. **Eigenaarschap commerciële outreach: Jeroen** (of door hem
    aangewezen commercieel iemand), niet Sigrid. Sigrid blijft
    redactionele rol.
50. **Werkwijze-afspraak met Johan:** hij implementeert in WordPress
    op instructie van Claude. Vastgelegd in `architecture-rules.md`
    nieuwe sectie. Geen tweespraak Claude ↔ Johan zonder Jeroen erbij
    voor commerciële of scope-keuzes.

**Wat nog open is (zie `legacy-conversion-wip.md` §10):**
- Vier scenario's voor benadering bevestigd (Jeroen heroverweegt).
- Strategische doelstelling op einddatum (afhankelijk van Johan's
  export).
- Definitieve tijdlijn-data.
- Concrete e-mail-templates per scenario.
- Sample-bibliotheek-inventarisatie.
- Migratie handmatige facturatie → Stripe per brand.

**Vervolg:**
- Dinsdag 12-05-2026: gesprek met Johan. Naast de oorspronkelijke 9
  auth-vragen ook de 10 nieuwe legacy-vragen meenemen.
- Johan levert data-export (kolommen: brand × aantal materialen ×
  contactpersoon × sample × historie).
- Daarna: vervolgsessie legacy-conversie waarin
  `legacy-conversion-strategy.md` als definitief beslis-document wordt
  geschreven.

**Parallel spoor:** verse Claude-sessie voor `upsell-shop.md` —
strategisch beslis-document voor de eenmalige-proposities-webshop.
Begin-prompt is opgenomen in het handover-overzicht voor Jeroen.

---

## Sessie 12-05-2026 (ochtend) — Johan-gesprek, alle 9 vragen beantwoord ✅

**Doel:** dinsdag-ochtend-gesprek met Johan doorlopen om de 9 open
vragen uit `vragen-johan.md` te beantwoorden (5 datacontract-vragen +
4 auth-vragen). Sessie geleid door Claude met Jeroen + Johan aan
tafel.

**Duur:** ~2 uur (verwachting was 45-60 minuten; uitloop kwam door
waardevolle architectuur-discussies onderweg).

**Resultaat:** alle 9 vragen beantwoord, plus 5 architectuur-vondsten
boven water gekomen die het project structureel beter maken. B1/B2
deel 2 kan in vervolgsessie van start (geschat 2-3 uur).

### Antwoorden Johan (samenvatting)

Volledige uitwerking met implicaties staat in `vragen-johan.md`.

| # | Onderwerp | Antwoord |
|---|---|---|
| 1 | Status-strings | 6 Stripe-statussen: `inactive`, `trialing`, `active`, `past_due`, `canceled`, `unpaid` |
| 2 | Unlimited-sentinel | `-1` akkoord |
| 3 | Bestaande brands | Optie A — big-bang migratie door Johan |
| 4 | Stripe-webhooks | Aanpak C — `customer.subscription.*` + `invoice.payment_failed` |
| 5a | Brand-downgrade | Blokkeren tot brand zelf opschoont. "Offline" = status `draft` |
| 5b | `past_due` | Alles online; offline pas bij `canceled`/`unpaid` |
| 6 | Auth-endpoints | Eigen `/wp-json/md/v2/auth/*` (geen 3rd-party plugin). Login geeft volledige user terug. Geen refresh-token |
| 7 | JWT-geldigheid | 7 dagen |
| 8 | Secret key | HS256, één gedeelde `MD_JWT_SECRET`, uitwisseling via 1Password/Bitwarden vault |
| 9 | Wachtwoord-reset | Scenario A — eigen flow op Next.js, twee extra WP-endpoints |

### Belangrijkste architectuur-vondsten (5)

Onderweg zijn vijf principes expliciet geworden die breder gelden dan
auth alleen:

1. **`inactive` → `legacy` voor Free-brands** (was foutje in huidige
   API-response). Johan corrigeert. `legacy` geldt **alleen voor
   brand-membership**, niet voor user-membership — daar zijn de
   Stripe-statussen leidend.

2. **`publication_quota` op brand-niveau via Scenario B.** WordPress
   leest eigen tier-config en vult `publication_quota` in op de
   API-response. Eén bron van waarheid (WP-config). Frontend rekent
   niet zelf aan tier-regels.

3. **`is_placeholder` is een technische flag over de Stripe-koppeling**,
   niet een per-brand-flag. Wordt vanzelf `false` zodra Stripe live
   staat. Belangrijke correctie op Claude's eerste interpretatie.

4. **`is_member` wordt door WordPress berekend** uit `status`.
   Wijzigt MD ooit de regel over welke statussen als member tellen,
   dan landt die wijziging één keer in WP en volgt frontend
   automatisch.

5. **Algemeen principe: WordPress rekent, frontend leest af.** Geldt
   voor álle afgeleide membership-velden — nu en in de toekomst
   (`is_member`, `publication_quota`, `can_publish_more`,
   `is_grandfathered`, `discount_eligible`, etc.). Frontend rekent
   nooit zelf aan tier-regels.

### Aangemaakte / bijgewerkte bestanden

**Bijgewerkt:**
- `vragen-johan.md` — alle 9 antwoorden ingevuld met implicaties.
  Vragen 10-19 (legacy-conversie) staan onveranderd voor de aparte
  vervolgsessie.
- `open-issues.md` v1.5 — B1 + B2 op ✅, vier nieuwe items
  toegevoegd (zie hieronder).
- `auth-strategy.md` v0.2 — definitieve versie met alle keuzes
  verwerkt. Endpoints, error-formats, secret-uitwisseling, en
  wachtwoord-reset-flow zijn nu concreet.
- `datacontract-proposal.md` v0.2 — open vragen §8 zijn beantwoord,
  6 statussen verwerkt, edge cases B en C definitief, Scenario B
  voor `publication_quota` toegevoegd.
- `session-log.md` — dit verslag.

**Nieuw:**
- `handover-sessie-B1B2-deel2.md` — opening-prompt + complete
  to-do-lijst voor de vervolgsessie (code + documentatie). Geschatte
  duur 2-3 uur. Bedoeld om de volgende Claude-sessie schoon te laten
  starten.

### Nieuwe open-issues-items (toegevoegd door Claude in v1.5)

| Code | Status | Onderwerp |
|---|---|---|
| W8 | 🟡 | Aparte JWT-secret voor staging bij opzet test-omgeving |
| W9 | 🟡 | Wachtwoord-eisen centraal definiëren (lengte/complexiteit, server-side validatie) |
| W10 | 🟡 | WordPress-rollen-mapping bij introductie rol-gebaseerde rechten |
| G4 | 🟢 | Escalatie-pad webhook-failures (Stripe-retry + WP-downtime) |
| G5 | 🟢 | Optionele MD-eigen communicatie tijdens `past_due` |

### Twee taal-correcties uit deze sessie (vastgelegd in memory)

Tijdens de sessie bleek dat Claude er onterecht van uitging dat de
frontend Nederlandstalig was en dat foutmeldingen vertaald moesten
worden. Dat is **niet** het geval:

- **Frontend, backend, codebase en API-output: Engels.**
- **Onze chat-communicatie en projectdocumentatie (.md): Nederlands.**

Vastgelegd in Claude's memory (memory_user_edits #1) zodat dit in
vervolgsessies meteen klopt.

### Beslissingen genomen (genummerd, doortellend vanaf 50)

51. **Zes Stripe-statussen ondersteunen i.p.v. vier.** `MembershipStatus`
    breidt uit met `trialing` en `unpaid`. Frontend behandelt
    `active`, `trialing`, `past_due` als "ingelogd-als-member"; rest
    als niet-member.

52. **`is_member` berekend door WordPress.** Frontend leest alleen
    af. Voorkomt verspreide membership-logica in Next.js-code.

53. **Scenario B voor afgeleide velden.** WordPress vult kant-en-klare
    waardes in op de API-response uit eigen config. Geldt voor
    `publication_quota` en alle toekomstige afgeleide velden.

54. **`legacy`-status alleen voor brand-membership.** User-membership
    (Insider) gebruikt strikt de Stripe-statussen.

55. **`is_placeholder` is een Stripe-koppeling-flag, niet per-brand.**
    Vanzelf `false` zodra Stripe live staat.

56. **Big-bang migratie van bestaande brands.** Johan voert
    mapping-tabel uit aan WP-kant. Definitieve mapping komt uit
    legacy-conversie-vervolgsessie.

57. **Webhook-strategie Aanpak C.** Beginnen met
    `customer.subscription.*` + `invoice.payment_failed`. Uitbreiden
    wanneer commercieel nodig.

58. **Brand-downgrade: blokkeren, niet automatisch oplossen.**
    Eenvoudige if-check in WP, geen tussenstaten, geen
    keuze-schermen. Brand schoont zelf op via material-management
    (status → `draft`).

59. **`past_due`: materialen online houden.** Stripe's eigen
    retry-mails zorgen voor communicatie. Pas offline bij definitieve
    `canceled` / `unpaid`.

60. **Custom auth-endpoints onder `/wp-json/md/v2/auth/*`.** Geen
    third-party plugin. Login geeft volledige user mee → geen
    aparte `/auth/me`-call op login-moment. Geen refresh-token.

61. **JWT-geldigheid 7 dagen.** Standaard middenweg tussen
    veiligheid en gebruiksgemak.

62. **HS256 (symmetrisch) signing.** Eén gedeelde `MD_JWT_SECRET`.
    Lage gevoeligheid van content rechtvaardigt simpele opzet.
    Migratie naar RS256 mogelijk indien ooit nodig.

63. **Secret-uitwisseling via password-manager shared vault.** Geen
    WhatsApp, e-mail, Slack-DM, git-commit. Voor nu één secret;
    aparte secret voor staging is 🟡-item.

64. **Wachtwoord-reset Scenario A.** Eigen flow op Next.js (mooiere
    UX). Twee endpoints aan WP-kant: `forgot-password` (verzendt
    mail, neutrale respons, rate-limited) en `reset-password`
    (eenmalige tokens, server-side validatie van wachtwoord-eisen).
    Pagina's gebouwd in sessie 11.

65. **Twee nieuwe architectuur-principes voor `architecture-rules.md`**
    (toegevoegd in vervolgsessie B1/B2 deel 2):
    a. **Afgeleide velden — bron van waarheid:** WordPress rekent,
       frontend leest af.
    b. **Tier-wijzigingen worden geblokkeerd, niet opgelost:**
       systeem dwingt regels af, brand lost zelf op.

### Wat NIET in deze sessie

- Geen code-wijzigingen (sessie was puur gesprek + documentatie).
- Geen `architecture-rules.md`-update (gepland voor deel 2 zodat
  de twee nieuwe principes tegelijk met de implementatie landen).
- Geen `wordpress-instructions-auth.md` (gepland voor deel 2;
  Claude schrijft die als concrete instructie voor Johan zodra
  endpoints + types definitief zijn).

### Vervolg

**Korte termijn (sessie B1/B2 deel 2):**
1. Types in `src/types/shared.ts` uitbreiden (6 statussen,
   `AuthLoginResponse`, `AuthErrorResponse`).
2. Next.js server-routes maken voor login, logout, forgot-password,
   reset-password.
3. Cookie-helpers in `src/lib/auth/cookies.ts`.
4. Echte `getCurrentUser()` in `src/lib/api/wordpress.ts`.
5. `AuthContext` overzetten van mock naar echte server-hydratie.
6. `architecture-rules.md` uitbreiden met twee nieuwe principes.
7. `wordpress-instructions-auth.md` schrijven (instructie voor
   Johan).

Opening-prompt voor deze sessie staat in
`handover-sessie-B1B2-deel2.md`.

**Parallel (Johan):**
- `inactive` → `legacy` correctie op brand-API.
- Wacht op `wordpress-instructions-auth.md` voor implementatie van
  auth-endpoints en reset-flow.
- JWT-secret genereren met `openssl rand -base64 48`, in 1Password
  vault delen.

**Daarna (sessie 11 of eerder als nodig):**
- Login-, register-, forgot-password-, reset-password-pagina's
  bouwen.

---


## Sessie B1/B2 deel 2 — Implementatie auth-flow (12-05-2026, middag) ✅

Vervolg op de Johan-sessie van die ochtend. Doel: alle codebase-werk en
documentatie afronden zodat de auth-flow end-to-end staat aan Next.js-
kant, en Johan kan starten met zijn WP-implementatie op basis van een
concrete instructie.

Geschat 2-3 uur, in 5 batches afgewikkeld conform `build-order.md`
§Werkwijze (pre-flight, akkoord per batch, geen code zonder akkoord).

### Pre-flight-bevinding

De openings-prompt in `handover-sessie-B1B2-deel2.md` noemde nog
"open-issues.md updaten (B1 + B2 ✅, vier nieuwe items toevoegen)". Bij
inspectie bleek dat deze updates **al gedaan zijn in v1.5** tijdens
het Johan-gesprek diezelfde ochtend: B1 en B2 staan ✅, en W8, W9, W10,
G4, G5 zijn al toegevoegd. Geen item-statuswijzigingen meer nodig;
alleen een nieuwe v1.6 changelog-entry die de implementatie-deliverable
markeert.

### Wat is gebouwd

**Batch 1 — TypeScript-types.**

- `src/types/shared.ts` — `MembershipStatus` uitgebreid van 4 naar 6
  Stripe-statussen (`inactive`, `trialing`, `active`, `past_due`,
  `canceled`, `unpaid`); JSDoc per waarde aangescherpt met expliciete
  noot dat `legacy` *niet* in deze enum hoort (brand-only).
  `AuthLoginResponse` toegevoegd als alias voor `AuthMeResponse` (DRY,
  zelfde shape).
  `AuthErrorCode` toegevoegd als string-literal-union met de drie
  Johan-bevestigde login-codes plus twee gereserveerd voor reset-flow
  (`md_auth_invalid_token`, `md_auth_weak_password`).
  `AuthErrorResponse` toegevoegd met exacte `{ code, message, data:
  { status } }`-shape.
  `WPAuthMeRawResponse` toegevoegd: raw snake_case-shape colocated met
  domain-type zodat het contract WordPress↔mapper op één plek
  leesbaar is.

**Batch 2 — Cookie-helpers + mapper.**

- `src/lib/auth/cookies.ts` (nieuw) — `setAuthCookie`, `getAuthCookie`,
  `clearAuthCookie`. HttpOnly + Secure (productie-only) + SameSite=Lax
  + path=/. Cookie-naam `md_auth_token`, prefix om botsing met
  WordPress-cookies op dezelfde apex te voorkomen. Async wegens
  Next.js 15 `cookies()`-API.
- `src/lib/api/mappers.ts` — auth-sectie toegevoegd: `mapAuthMeResponse`
  (export, hoofd-entry), `mapBrandMembership` (export, voor mogelijk
  hergebruik bij brand-dashboard), `mapMembership` en `mapUser`
  (intern). Bestaande mappers ongewijzigd.

**Batch 3 — WordPress API client.**

- `src/lib/api/wordpress.ts` — placeholder `getCurrentUser` vervangen
  door echte implementatie. Vier publieke auth-functies: `loginUser`,
  `getCurrentUser`, `forgotPassword`, `resetPassword`. Nieuwe
  `WordPressAuthError`-class (extends `WordPressError`) voor
  `md_auth_*`-codes. Interne `wpAuthFetch`-helper die geen Basic-Auth
  WP-applicatie-password meestuurt, altijd `no-store` gebruikt, en
  `md_auth_*`-errors omzet naar `WordPressAuthError`. Generieke
  `wpFetch` en alle bestaande endpoint-functies onveranderd.

**Batch 4 — Next.js server-routes.**

Vijf routes onder `src/app/api/auth/`:

- `login/route.ts` — POST → cookie zetten → `{ user }` terug.
- `logout/route.ts` — POST → cookie wissen → 204.
- `me/route.ts` — GET → 200 `{ user: User | null }` bij geen cookie of
  geldig cookie; 401 + cookie-wis bij afgekeurd cookie.
- `forgot-password/route.ts` — POST → neutrale 200 `{ ok: true }`.
- `reset-password/route.ts` — POST → 200 `{ ok: true }` zonder auto-login.

Gedeeld patroon: body-validatie 400 vóór WP-call (`md_invalid_request`,
geen `md_auth_*`-prefix omdat onze laag de fout uitstuurt, niet WP);
`WordPressAuthError` → forward code + message + status; andere errors
→ generieke 500 met `md_internal_error`.

**Batch 5A — AuthContext + layout.**

- `src/components/providers/AuthContext.tsx` — mock-helpers
  (`buildMockUser`, `SignInOptions`, `signIn`) verwijderd. `initialUser`
  is nu verplichte prop, gevuld door de server. `signOut` echt
  geworden: POST naar `/api/auth/logout` + `setUser(null)` +
  `router.refresh()`. Backward-compat behouden: `isLoggedIn`,
  `isMember`, `user` blijven op identieke positie in de interface.
- `src/app/layout.tsx` — async geworden. Nieuwe `getInitialUser`
  helper wrapped in React `cache()` om binnen één render-cycle
  dedup te garanderen. Drie error-paden: geen cookie → null;
  afgekeurd cookie → cookie wissen + null; backend-storing → log +
  null (site blijft up).

**Batch 5B — Documentatie.**

- `architecture-rules.md` v1.5 — twee nieuwe top-level secties
  toegevoegd vóór "WordPress-werkwijze met Johan": **"Afgeleide
  velden — bron van waarheid"** en **"Tier-wijzigingen — geblokkeerd,
  niet opgelost"**. Beide met concrete velden-tabel, voorbeeld, en
  verbinding naar de codebase.
- `open-issues.md` v1.6 — alleen changelog-entry; geen
  status-wijzigingen (al gedaan in v1.5).
- `wordpress-instructions-auth.md` v1.0 (nieuw) — concrete
  instructie voor Johan: 4 endpoints met exacte request/response-
  shapes, error-codes, JWT-spec, secret-exchange, deployment-
  checklist. Op contract-niveau (geen PHP-fragmenten — Johan kiest
  implementatievorm).
- Dit verslag.

### Beslissingen genomen (genummerd, doortellend vanaf 65)

66. **AuthContext-hydratie via server-side `initialUser`-prop.**
    `app/layout.tsx` is async, leest cookie, roept `getCurrentUser`,
    geeft user-object door als prop. Geen client-side fetch op eerste
    render → geen flash-of-logged-out, geen extra roundtrip. Login
    zelf loopt niet via AuthContext maar via directe POST naar
    `/api/auth/login` gevolgd door redirect; server-hydratie op de
    volgende paginarender pikt de verse cookie op. Alleen logout zit
    in AuthContext omdat dat een directe UI-actie is.

67. **`AuthMeResponse` hergebruikt voor zowel `/login` als `/me`.**
    `AuthLoginResponse` toegevoegd als alias, niet als apart type.
    Zelfde shape (`token`, `expiresAt`, `user`); WordPress retourneert
    op `/auth/me` ook een verse token+expiry zodat de cookie
    stilzwijgend verlengd kan worden bij actief gebruik. DRY-conform.

68. **`/api/auth/me` retourneert 200 `{ user: null }` bij geen cookie,
    401 alleen bij afgekeurd cookie.** Onderscheid tussen "nooit
    ingelogd" en "sessie verlopen" blijft scherp; cliënt-code simpeler
    (één pad voor de normale gevallen, expliciete 401 voor de
    cleanup-case). 401-altijd zou cases 1 en 3 vermengen.

69. **`reset-password` logt niet automatisch in.** User navigeert naar
    `/login` en logt opnieuw in met nieuwe wachtwoord. Houdt
    reset-capability semantisch gescheiden van session-grant; past
    bij de pagina-flow in sessie 11.

70. **React `cache()` rond `getInitialUser` in layout.tsx.** Voorkomt
    dat zowel layout als RSC's binnen één render twee aparte
    WordPress-calls voor dezelfde user doen. Geen seconde-cache, geen
    staleness — `cache()` reset per render-cycle.

71. **Nederlandse comments in code mogen blijven staan in bestanden
    die niet in deze sessie aangeraakt zijn** (bv. bestaande mapper-
    helpers `combineDateTime`, `stringOrNull`, en de oude header van
    `mappers.ts`). Voor bestanden *die in deze sessie geschreven of
    aangepast werden* (auth-sectie, layout, AuthContext, cookies,
    routes, types) is alles Engels. Reden: scope-discipline.
    Eventuele aparte vertaal-sweep is een W-item indien gewenst —
    niet aangemaakt omdat de codebase grotendeels al Engels is en de
    NL-fragmenten zeldzaam zijn.

### Wat NIET in deze sessie

- **Login/register/forgot-password/reset-password pagina's** — komen
  in sessie 11. Deze sessie levert alleen de endpoints + types +
  cookie-logica + AuthContext-hydratie.
- **WordPress-implementatie van de 4 endpoints** — parallel spoor bij
  Johan op basis van `wordpress-instructions-auth.md`.
- **Wachtwoord-eisen vastleggen** — W9 blijft open; voorlopige eis
  (10 karakters minimum, geen complexiteit) opgenomen in
  `wordpress-instructions-auth.md` §5.2 zodat Johan kan starten;
  definitieve eis volgt zodra Jeroen beslist.
- **Registratie-endpoint** — niet in B1/B2-scope; volgt in sessie 11.

### Vervolg

**Sessie 4 (Materials) is nu unblocked** — B1 en B2 zijn definitief
afgesloten met implementatie aan beide kanten in zicht. Mits Johan
voldoende vooruit komt met `wordpress-instructions-auth.md` is het
veilig om sessie 4 te starten. Sample-request-gating en
membership-aware UI kunnen tegen de echte AuthContext-shape gebouwd
worden (de mock is weg).

**Sessie 11 (login/register-pagina's)** wacht op:
- Johan's implementatie van de 4 endpoints in WordPress.
- Definitieve wachtwoord-eisen (W9) — voorlopige eis is OK voor
  Johan om te starten, maar voor de frontend-validatie wil je
  exact dezelfde regels tonen.

**Parallel spoor — Johan:**
- 4 auth-endpoints implementeren conform `wordpress-instructions-auth.md`.
- JWT-secret genereren + delen via 1Password.
- `inactive` → `legacy` correctie op brand-API (uit Johan-sessie ochtend).
- Big-bang migratie van bestaande brands (uit legacy-conversie-sessie
  zodra data-export beschikbaar).

---



---

# ─────────────────────────────────────────────
# LOSSE SESSIE-ENTRIES (29-05-2026) — eerder aparte patch-bestanden
# ─────────────────────────────────────────────


---

## ↳ Sessie 6A

# session-log — append voor sessie 6A

> **Werkwijze:** dit blok onderaan `session-log.md` plakken, vóór de
> laatste afsluitende `---`.

---

## Sessie 6A — Auth-pagina's (sign-in / register / forgot / reset) (19-05-2026) ✅

Frontend-pagina's bouwen die het in B1/B2 deel 2 opgezette auth-backend
aanspreken. Live linken op meerdere plekken al naar `/sign-in?next=...`
maar die pagina bestond niet — 404 op:

- Get-in-touch-modal (sessie 5)
- Save-knop op MaterialCard + DetailActions
- Insider-features Add-to-board + Compare
- Downloads-card sign-in gate
- Brand-info card sign-in gate
- Login-knop in header

Sessie 6A unblockt dat in één keer.

### Pre-flight-bevindingen

1. **Register-endpoint bestaat nog niet aan WP-kant.** Het
   `wordpress-instructions-auth.md` §11 stelt expliciet: *"Registratie-
   endpoint — niet in B1/B2-scope. Komt bij sessie 11 als aparte
   instructie."* Drie opties besproken (placeholder / contract+frontend /
   skip); akkoord op **contract + frontend bouwen**. Resultaat:
   `wordpress-instructions-register.md` v1.0 schrijft het ontbrekende
   contract uit, frontend gaat live klaar voor Johan's implementatie.

2. **AuthContext-update na login** — huidige strategie zegt expliciet
   "geen login via context, alleen redirect + server-side hydration"
   (regel 26-29 in `AuthContext.tsx`). Botst met sessie-doel
   ("AuthContext bijwerken zodat na succesvolle login direct geüpdatet").
   Akkoord op `signIn(user)`-method toevoegen aan context: context
   wordt geen credentials-handler, alleen state-seed na geslaagde POST.
   Reden: voorkomt flash van uitgelogde header tussen redirect en
   server re-render. Server-hydration blijft autoritair bij volgende
   navigatie.

3. **"Remember me"-checkbox** — drie opties (functioneel / cosmetisch /
   weglaten). Akkoord op **functioneel**: `setAuthCookie` krijgt
   `persistent`-param. `persistent=true` → expliciete `Expires`
   conform JWT-expiry (7 dagen). `persistent=false` → geen `Expires`
   → browser behandelt als session-cookie → weg bij browser-sluiten.

4. **Terms/Privacy-links** — pagina's bestaan nog niet. Akkoord op
   `href="#"` met dichte TODO; volgt zodra terms/privacy-content er is.

### Wat is gebouwd

**Pagina's (4 routes):**

- `src/app/sign-in/page.tsx` + `SignInForm.tsx` — email + password +
  remember-me + forgot-link + create-account-link. Server-side check:
  als bezoeker al een geldige sessie heeft, direct redirect naar
  `?next=` (of `/materials`). Anti-open-redirect-sanitization op
  `next`-param: alleen in-site paden (`/`-start, geen `//` of `/\`)
  worden gehonoreerd, anders fallback naar `/materials`.

- `src/app/register/page.tsx` + `RegisterForm.tsx` — first/last name +
  email + password (×2 met confirm-validation) + accept-terms checkbox.
  Auto-login na succes (route handler zet cookie, frontend `signIn(user)`,
  push naar `next`). Client-side password-regel min 10 karakters
  spiegelt server-side regel uit `wordpress-instructions-auth.md` §5.2.

- `src/app/forgot-password/page.tsx` + `ForgotPasswordForm.tsx` —
  email-veld → neutrale success-state ("If an account exists for X,
  we've sent a link"). Mirrort WP-conventie: geen onderscheid tussen
  "email bestaat" en "email bestaat niet" → geen user-enumeration.

- `src/app/reset-password/page.tsx` + `ResetPasswordForm.tsx` — token
  uit URL, nieuwe password + confirm. Token-validatie loopt server-side
  bij submit (niet bij render — zou een eenmalig-bruikbare token
  verbranden). Success-state: link naar `/sign-in` (geen auto-login
  zoals door `wordpress-instructions-auth.md` §5 voorgeschreven).
  Missing-token edge-case: aparte server-rendered error met "Request a
  new link"-CTA.

**Gedeelde components:**

- `src/app/_auth-components/AuthPageLayout.tsx` — smalle centered card
  met heading, subheading, body, footer. Werkt op light + dark via de
  bestaande surface-tokens. Gekozen voor colocated component i.p.v.
  `(auth)`-route-group omdat de pagina's elk hun eigen metadata,
  validation en submit-logica hebben — een gedeeld layout-bestand
  bovenaan zou daar niets aan toevoegen.

- `src/app/_auth-components/auth-errors.ts` — `parseAuthErrorResponse`
  (best-effort JSON-parse van fout-responses) en `focusFieldForCode`
  (welk input-veld focus krijgt na een gegeven WP error-code). Houdt
  de vier forms DRY.

**API-routes:**

- `src/app/api/auth/login/route.ts` — uitgebreid met `rememberMe`-flag
  in body, doorgegeven naar `setAuthCookie(token, expiresAt, persistent)`.
  Backward-compat: `rememberMe` is optional, default `true` (= oude
  gedrag).
- `src/app/api/auth/register/route.ts` (nieuw) — body
  `{ email, password, firstName, lastName }`, roept `registerUser` aan,
  zet persistent cookie, retourneert `{ user }`. Forward't WP-errors
  verbatim (md_auth_invalid_request, md_auth_invalid_email,
  md_auth_email_taken, md_auth_weak_password).

**Backend-uitbreidingen:**

- `src/lib/auth/cookies.ts` — `setAuthCookie` krijgt derde optionele
  parameter `persistent: boolean = true`. `false` → omit `Expires`
  → session-cookie. Default `true` houdt alle bestaande callers
  intact (incl. de register-auto-login die expliciet `true` doorgeeft
  voor consistente UX).
- `src/components/providers/AuthContext.tsx` — `signIn(user)`-method
  toegevoegd aan context-value. Pure state-seed (geen network calls,
  geen `router.refresh`). De caller (sign-in/register form) doet zelf
  de push + refresh. Comment-blok herschreven om de nieuwe login-flow
  te beschrijven; backward-compat met bestaande consumers
  (Header, FilterSidebar, DetailActions, InsiderGate) volledig intact.
- `src/lib/api/wordpress.ts` — `registerUser({ email, password, firstName,
  lastName })` toegevoegd. POSTs naar `/md/v2/auth/register` met
  snake_case body (`first_name`, `last_name`). Returntype identiek aan
  `loginUser` (`AuthMeResponse`).
- `src/types/shared.ts` — `AuthErrorCode` uitgebreid met
  `md_auth_email_taken`. JSDoc-blok geüpdatet: drie groepen codes
  (login bevestigd / reset bevestigd / register pending Johan).

**Styling:**

- `src/styles/globals-additions-auth.css` — `.auth-page`, `.auth-card*`,
  `.auth-form*` classes. Append-only patch — niet als losse stylesheet
  importeren. Bestaande `.form-banner is-{success,error,info}` wordt
  hergebruikt voor inline meldingen (de eerder geschreven
  `SampleRequestForm` gebruikte `.form-status-*`-klassen die niet in
  CSS bestonden; alle nieuwe forms gebruiken nu de bestaande
  form-banner-conventie).

**Documentatie:**

- `wordpress-instructions-register.md` (nieuw) v1.0 — contract voor
  Johan om `/md/v2/auth/register` te implementeren. Volgt exact de
  conventies van `wordpress-instructions-auth.md` (snake_case body,
  error-envelope, JWT HS256, 7 dagen geldigheid). Bevat smoke-test-
  checklist.
- `open-issues.md` — W-item toegevoegd voor pending register-implementatie
  WP-kant (zie patch).
- `session-log.md` — dit blok.

### Beslissingen vastgelegd

1. **Login flow via context = state-seed-only.** De /sign-in en /register
   pagina's POSTen rechtstreeks naar de API-routes. AuthContext krijgt
   alleen de `{ user }` uit de response — geen credentials, geen
   network. `signIn(user)` doet `setUser(user)` en niets meer; de caller
   doet `router.push(next) + router.refresh()`. Server-hydration in
   layout.tsx blijft de autoritaire bron bij volgende renders.

2. **Persistent cookie default true.** Alle bestaande callers van
   `setAuthCookie` blijven werken zonder aanpassing. Alleen de
   sign-in-route maakt het knipperbaar.

3. **Anti-open-redirect-sanitization op `?next=` lokaal.** Sign-in en
   register pagina's normaliseren `next` zelf via `sanitizeNext()`.
   Reden: helder, geen extra dependency, en de regel is heel simpel
   (single-`/`-prefix, geen `//`/`\`). Als de check op meer plekken
   nodig wordt → naar `src/lib/auth/` verhuizen.

4. **Geen auto-login na reset-password** — bevestiging van bestaande
   regel uit `wordpress-instructions-auth.md` §5. Success-pagina toont
   link naar `/sign-in`.

5. **Terms/Privacy-links wachten.** De checkbox in register linkt naar
   `href="#"`. Wanneer de pagina's gemaakt worden, twee URL's
   updaten en klaar.

6. **Register-pagina shipt vóór WP-endpoint klaar is.** Tot Johan
   ship, faalt POST `/api/auth/register` met een generieke 500
   richting de gebruiker (de WP-route is er nog niet, dus de fetch
   in `registerUser` throwt een `WordPressError`). Bewuste keuze:
   liever de pagina al staan en CTAs werkend, dan een 404. Open-issue
   W-item houdt de status bij.

### Wat NIET in deze sessie

- WP-implementatie van `/md/v2/auth/register` — parallel spoor bij Johan
  op basis van `wordpress-instructions-register.md`.
- Account-settings pagina — sessie 11 of later.
- Social login (Google/Apple/etc) — niet in scope; auth-strategie §8
  voorziet dit als toekomstig spoor.
- 2FA — niet in scope.
- Email-templates voor forgot-password — Johan beheert (WP-kant).
- `/terms` en `/privacy` pagina's — content beschikbaar maken in losse
  sessie.

### Vervolg

**Klaar voor live** zodra:
- Johan `/md/v2/auth/register` implementeert per
  `wordpress-instructions-register.md`.
- De vier auth-endpoints in productie staan (B1/B2 deel 2 deliverable).
- CSS uit `globals-additions-auth.css` is gemerged in `globals.css`.

**Open vragen:**
- Rate-limiting op register? Voorstel staat in
  `wordpress-instructions-register.md` §2 maar geen v1-eis. Open-issue
  voor Jeroen/Johan.
- Terms/Privacy-content. Geen blocker; checkbox kan met `#`-links live
  zolang de pagina niet publiek wordt gepromoot.

---


---

## ↳ Sessie 7 (Talks)

# Session-log — patch sessie 7 (Talks)

> Append-only patch voor `session-log.md`. Voeg deze sectie toe bovenaan
> onder "Laatste update". **Naamcollisie-let-op:** dit is build-order **stap 7
> (Talks)**, niet de oudere chronologische "Sessie 7 — Materials finetunen"
> (zie `session-log-patch-sessie7.md`). Sessies worden genummerd volgens de
> build-order-stap.

---

## Laatste update
Datum: 29-05-2026
Sessie: Stap 7 — Talks (overzicht + detail, datalaag + UI) ✅ frontend klaar

**Build-order-tabel:** zet rij `7. Talks` op ✅ — "Frontend gebouwd (datalaag
+ /talks + /talks/[slug]). WP-deploy pending: speakers-field + show_in_rest +
channels-exposure (zie wordpress-instructions-talks.md)."

---

## Stap 7 — Talks (29-05-2026)

**Status:** ✅ frontend klaar. Talk-blocker gesloten: Johan leverde de
C-TALK-shapes (C14 al live; C9–C13 bevestigd, deels deploy-pending). Werkwijze:
pre-flight (drift-check tegen de gedeployede 6b-zip = nihil) → 4 batches met
akkoord per batch.

### Context

- Voortgebouwd op de gedeployede 6b-code (Articles v2). Drift-check: de 6b-zip
  was byte-identiek aan de in-project snapshot voor alle aangeraakte API-
  bestanden; talk/media/blueprint waren door 6b niet aangeraakt. Eén canonieke
  basis.
- C-TALK-afstemming met Johan (29-05): C14 (insider_only) al gebouwd; vimeo_id
  meta bevestigd; talk_duration meta ("mm:ss"/"h:mm:ss", >60min = h:mm:ss);
  speakers = WP-taxonomy `persons` (naam-only, role/photo vervallen);
  company_name string (geen brand-koppeling); channels-shape akkoord maar de
  zichtbare ChannelBar is een aparte latere sessie.

### Batches

**Batch 1 — datalaag.** `talk.ts`: lege `TalkMeta`-shell eruit; `TalkSpeaker`;
zes velden op `Talk`/`TalkListItem` (insiderOnly, vimeoId, durationSeconds,
companyName, speakers[], channels[]). `wordpress.ts`: `WPTalkRawResponse.meta`
getypt (`WPTalkMetaRaw`) + top-level `speakers` (`WPTalkSpeakerRaw`).
`mappers.ts`: talk-mappers verrijkt (talk-default insider true via
`?? true`, mapChannels hergebruikt, `parseTalkDuration` mm:ss/h:mm:ss → sec).
`content.ts` ongemoeid (mappers lopen er vanzelf doorheen).

**Batch 2 — overzicht (/talks).** Single-column (geen filter in v1: channels
vastgehouden, geen story-type). `ContentCard`-grid hergebruikt
(`contentType="talk"`), debounced search + paginatie als dunne URL-bridges
(mirror van de articles-versies), EmptyState 2 varianten, breadcrumb-JsonLd.
`CompareProvider`-layout. `.ov-wrap-single` toegevoegd in globals.css.

**Batch 3 — detail (/talks/[slug]).** `DetailHeader` + `pub-layout`. Alleen de
video gegate (`TalkVideoGate` → locked poster + InsiderGate; summary altijd
zichtbaar). `TalkVideo` (Vimeo-iframe), `TalkPrevNext`, `TalkDetailActions`
(type "talk"), `TalkDetailSidebar` (talk-details + upsell). "More talks" via
`listTalks` (ContentCard-grid; geen talks-related-endpoint). `formatDuration`-
util. `buildVideoObject` in de seo-lib (VideoObject + BreadcrumbList JSON-LD).
**S6.7 afgehandeld:** `ArticleRelated.hrefFor` talk-case → `/talks/${slug}`.

**Batch 4 — docs + zip + mail.** Deze patch, open-issues-patch,
wordpress-instructions-talks, MANIFEST, eind-zip, deploy-mail aan Johan.

### Genummerde beslissingen

1. Talk-default insider_only = `true` bij afwezig veld (`?? true` vóór Boolean);
   expliciete `false` blijft false.
2. Duration als `durationSeconds: number | null`, geparset uit `talk_duration`
   (mm:ss / h:mm:ss); waarde zonder `:` → null (geen "0 min").
3. Speakers = top-level `speakers`-objects {id,name,slug} (geen kale term-id's);
   role/photo vervallen.
4. Company = platte tekst (`company_name`), geen brand-link (C12-optie 3 zonder
   company_brand_id).
5. Channels gemapt maar zichtbare UI (pills + bar) vastgehouden tot de aparte
   channel-sessie.
6. Overzicht single-column (`.ov-wrap-single`); geen featured-behandeling.
7. Alleen de video gegate; summary/metadata zichtbaar als teaser (mockup).
8. More talks i.p.v. echte related (geen talks-related-endpoint): laatste talks
   excl. huidige via listTalks.
9. InsiderGate met `feature="article"` + overschreven talk-copy (geen nieuwe
   shared preset deze sessie).
10. Hergebruik `article-prevnext`/`article-side-*`-CSS voor talks (DRY > nieuwe
    klassen); naam-generalisatie als follow-up.

### Bevestigde API-shapes (Johan 29-05)

- C14: `meta.insider_only` (boolean) + `meta._insider_only`. Talk-default true.
- C10: `meta.vimeo_id` (string); `meta.talk_duration` ("mm:ss" / "h:mm:ss",
  >60min = h:mm:ss).
- C12: `meta.company_name` (string), geen brand-koppeling.
- C11: top-level `speakers: {id,name,slug}[]` via register_rest_field
  (persons-taxonomy). **Deploy-pending.**
- C13: `meta.channels: {id,slug,label}[]`. Shape akkoord; exposure deploy-
  pending; zichtbare UI later.
- C9: `raw.date` (WP-core).

### Verificatie (offline — geen volledige codebase-typecheck mogelijk)

- Datalaag: `tsc --strict` + `noUnusedLocals/Parameters` over de echte talk.ts +
  raw-meta-blok + beide talk-mappers + helpers (stubs voor MediaImage/
  TaxonomyTerm/WPMetaTermRaw/mapChannels) → exit 0.
- UI-laag (TSX): `tsc --strict` over /talks + /talks/[slug] + componenten +
  util + de echte seo-bestanden, tegen echte React 19.2 / Next 15.5 (TS 5.6),
  signature-getrouwe stubs voor de `@/`-imports → exit 0.
- `parseTalkDuration` / `formatDuration` / `isoDuration` runtime-getest.
- `globals.css` brace-balans 1439/1439.

**Niet offline verifieerbaar:** in-repo compile tegen de echte ongewijzigde
componenten (`DetailHeader`, `DetailActions`, `InsiderGate`, `MaterialBody`,
ui-barrel). Gemirrord uit de live articles-code; integratie-check bij deploy.

### Openstaande issues na deze sessie

Zie `open-issues-patch-sessie7-talks.md`. Kort: WP-deploy van speakers +
show_in_rest + channels (blocker voor live talks-data); follow-ups
(detail-*-klassenaam-generalisatie, echte 'talk'-InsiderGate-preset, talks-
related-endpoint).


---

## ↳ Sessie 8 (Events)

# Session-log — patch sessie 8 (Events)

> Voeg dit toe aan `session-log.md`. Datum: 29-05-2026.

## Sessie 8 — Events ✅ (build-order stap 8)

Volledige Events-feature tegen Johan's sessie-8-REST-contract (plugin-commit
`b64c8de`), in vier batches, elk geïsoleerd op `tsc → 0`. **Eindoplevering
gebouwd op de verse main van 29-05 (ná de story-type-counts-fix)** — de
event-wijzigingen zijn rechtstreeks op de actuele gedeelde api-bestanden
toegepast, geen reconcile/_RECONCILE meer.

### Batch 1 — Datalaag
- `event-types.ts` (nieuw): 6 types (`fair/exhibition/lecture/workshop/online/
  other`), `DEFAULT_EVENT_TYPE='other'`, labels-only.
- `event.ts` herschreven: `Event`/`EventListItem` + `EventVenue` + `EventVideo`.
- `wordpress.ts`: `WPEventMeta` + `WPEventVenueRaw` + `WPEventVideoRaw`;
  `WPEventRawResponse.meta` getypeerd.
- `mappers.ts`: `mapEvent`/`mapEventListItem` herschreven; `mapEventVenue` +
  `mapEventVideos`; `mapChannels` + `wpRenderedHtml` hergebruikt (helper stond
  al in main — niet opnieuw gedeclareerd).
- `content.ts`: `getEvent` resolve't expliciete `meta.gallery`-ID's → `Gallery`.

### Batch 2 — Listing `/events`
- Server-page (ruime fetch + server-side sort), client `EventsBrowser`
  (ChannelBar + search, client-side filter), `EventCard` (datum-badge), loading,
  JsonLd. CSS: `.ov-wrap-full` + `.event-card*`.
- Ordering-keuze: WP kan niet `orderby` op `date_start` → app-side sort
  (aankomend eerst). Geen server-paginatie in v1.

### Batch 3 — Video-embed-util
- `video-embed.ts` (pure parser): YouTube + Vimeo incl. unlisted `{id}/{hash}`.
- `VideoEmbed.tsx` (ui): responsive iframe + externe-link-fallback. Geëxporteerd
  uit de ui-barrel.

### Batch 4 — Detail `/events/[slug]`
- Server-page met `DetailHeader` + `DetailActions` (`type="event"`, CTA =
  `customPrimary`), `EventMediaViewer` (gallery + video), beschrijving, sidebar
  (Register/Visit-CTA · Event details · Other events), `EventPrevNext`, Event +
  Breadcrumb JSON-LD.
- `_lib/events-order.ts`: gedeelde sort (listing + detail prev/next + others).
- CSS: media-viewer + sidebar-kaarten + `.event-detail-body`.

### Beslissingen
- Venue = N:1, gedenormaliseerd op `meta.venue`; `region`/"omgeving" geschrapt.
- CTA: `is_md_event` stuurt label; beide naar `external_website`.
- v1-scope: geen highlights, geen related books (sessie 9), themes geparkeerd.

### Verificatie
- Datalaag-`tsc` → 0; UI-`tsc` (9 events-bestanden + VideoEmbed + echte
  datalaag) → 0. v2-fixes (story-type-counts, article-total-count,
  wpRenderedHtml, talk-types, brand-country-facets) onaangeraakt en intact.


---

## ↳ Sessie 10 (Homepage, revisie 2)

# Session-log — patch sessie 10 (Homepage) — revisie 2

> Append-only entry voor `session-log.md`. Build-order stap 10 = Sessie 10.
> Revisie 2: Johan-instructie (route-group + CSS-comment) verwerkt en twee
> homepage-uitbreidingen toegevoegd.

## Sessie 10 — Homepage (29-05-2026) ✅ (rev 2)

### Aangemaakte / gewijzigde bestanden

> De homepage staat nu in route-group `src/app/(home)/` (URL blijft `/`).

- `src/app/(home)/page.tsx` — **vervangt** de vorige (root-)homepage.
  Server-component: `Promise.all` (materials/articles/events), featured-
  resolutie met terugval, `generateMetadata`, WebSite+Organization JSON-LD,
  verborgen canonieke `<h1>`, hero-bovenkant via provider, statische quotes +
  partners, sidebar met Top stories + manufacturer-promo, books-placeholder.
- `src/app/(home)/loading.tsx` — loading-skeleton (verplaatst naar `(home)`).
- `src/app/(home)/_components/HomeHeroProvider.tsx` — **nieuw**. Gedeelde
  client-state `showPromo`; promo en article-hero zijn elkaars tegenpool.
- `src/app/(home)/_components/PromoHero.tsx` — **nieuw** (verving HomeHero).
  Gast-promoband; zichtbaarheid + dismiss via de provider.
- `src/app/(home)/_components/FeaturedArticleHero.tsx` — **nieuw**. Groot
  "Featured article"-blok bovenaan de contentkolom; toont wanneer de promo
  weg is (uitgelogd-weggeklikt of ingelogd). Titel hergebruikt
  `.ed-featured-title`.
- `src/app/(home)/_components/TopStoriesWidget.tsx` — verplaatst (ongewijzigd).
- `src/app/(home)/_components/InsiderCtaBlock.tsx` — verplaatst (ongewijzigd).
- **Verwijderen:** `_components/HomeHero.tsx` (vervangen door PromoHero +
  HomeHeroProvider + FeaturedArticleHero).
- `src/styles/globals.css` — **gewijzigd**. (1) Sessie-10-comment herschreven
  zonder `*/` (build-fix). (2) Nieuwe regels toegevoegd: `.hp-hero-article*`
  (featured-article-hero) en de `.sidebar-cta`-kaart + `-eyebrow`/`-desc`
  (manufacturer-promo). Niets bestaands gewijzigd buiten de comment.

### Beslissingen (Sessie 10 — nummering doorzetten bij invoegen)

1–9. (Zie revisie 1.) Featured data-driven met terugval; één materials-fetch;
   live hero-telling; material-kaarten via ContentCard; auth-UI als client-
   eilanden; verborgen canonieke h1; Insider-CTA verborgen voor members +
   geen hardcoded prijs; quotes/partners statisch; design-system leidend
   (section-title 44px, gradient via tokens).
10. **Promo-hero en featured-article-hero zijn elkaars tegenpool** via een
    gedeelde client-context (HomeHeroProvider): gast ziet de promo, wegklikken
    toont direct de article-hero; ingelogde users zien meteen de article-hero.
11. **Featured-article-hero = het nieuwste/eerste artikel** (= top story).
    Geen aparte `featured`-flag-afhankelijkheid → geen leeg blok.
12. **Manufacturer-promo in de sidebar** ("Show your material to architects &
    specifiers") — statisch, altijd zichtbaar, knop naar `/register`.
13. **Route-group `(home)`** voor de homepage (Johan-instructie issue 2):
    loading-boundary alleen voor de homepage, geen app-brede soft-404.
14. **CSS-comments bevatten nooit `*/`** (Johan-instructie issue 1):
    selector-opsommingen met komma's/"en", niet met slashes.

### Werkwijze-noot

- `globals.css` is een gedeeld bestand. Deze levering gaat uit van een `main`
  waarvan de sessie-10-CSS-sectie gelijk is aan de eerder geleverde (met door
  de andere agent gefixte comment). Reconcileer bij twijfel tegen de actuele
  `main` vóór merge.

### Openstaande issues (zie open-issues-patch-sessie10.md rev 2)

- S10.1 — Books-blok + Insider-prijzen (wacht op Books-domeinlaag + membership).
- S10.2 — Volledige categorie-carousel.
- S10.3 — Echte partners-bron.
- Gesloten: `contentType="material"`-verificatie (build groen op main).

### Volgende sessie / definition-of-done

`npm run build` + `next start` + de 404-curl-checks uit de Johan-instructie;
Lighthouse/axe-steekproef; drie-viewport-walkthrough. Books + `membership.ts`
aanhaken zodra beschikbaar (S10.1).


---

## ↳ Sessie 11 (Pages)

# Session-log — patch sessie 11 (Standaard contentpagina's, deel 1)

> Voeg dit toe aan `session-log.md`. Datum: 29-05-2026.

## Sessie 11 — Standaard contentpagina's, deel 1 ✅ (build-order stap 11)

Generieke "content page"-template voor de statische, redactionele
site-pagina's, gevoed door het WP-core `page`-posttype. WordPress vereist
geen wijziging — core `/wp/v2/pages` is REST-enabled inclusief Yoast
(`yoast_head_json`). Bron: `instructie-andere-agent-standaard-paginas.md`.

Oplevering gebouwd op de verse main van 29-05; alle gedeelde bestanden
(`wordpress.ts`, `mappers.ts`, `content.ts`, `api/index.ts`, `seo/index.ts`)
zijn in-place gepatcht. Export-/content-diff tegen main: **alleen toevoegingen,
niets verwijderd of gewijzigd** (`comm -13` leeg op alle vijf).

### Nieuwe bestanden
- `src/types/page.ts` — `Page` + `PageSeo` (genormaliseerde Yoast-velden).
- `src/lib/config/static-pages.ts` — `PAGE_SLUG_MAP` (allowlist route-segment →
  WP-slug), `STATIC_PAGE_SLUGS`, `wpSlugForRoute()`. Tevens de beveiligingsgrens.
- `src/lib/seo/page-metadata.ts` — `buildPageMetadata(page, canonicalPath)`:
  Yoast → Next `Metadata`, canonical = frontend-route, robots doorgezet.
- `src/app/[pageSlug]/page.tsx` — generieke server-template: allowlist-gate →
  `notFound()`, `generateStaticParams()` over de allowlist, `generateMetadata()`,
  body via de gedeelde `MaterialBody`-prose-renderer.
- `src/app/[pageSlug]/loading.tsx` — skeleton via het gedeelde `<Skeleton>`.

### Gewijzigde (gedeelde) bestanden — in-place, alleen toevoegingen
- `src/lib/api/wordpress.ts` — `WPPageRaw` + `getPageBySlug()` (zelfde by-slug-
  patroon als `getArticleBySlug`, met `_fields` + `EDITORIAL_REVALIDATE`).
- `src/lib/api/mappers.ts` — `mapPage()`, hergebruikt de bestaande
  `wpRenderedHtml()`-guard (crash-fix) voor `title`/`content`.
- `src/lib/api/content.ts` — page-facing `getPage(slug)` (fetch + map, geen hero).
- `src/lib/api/index.ts` — re-export `getPage`, `getPageBySlug`, `mapPage`.
- `src/lib/seo/index.ts` — re-export `buildPageMetadata`.

### Live routes na deze sessie
`/about`, `/faq`, `/jobs`, `/become-a-partner` (WP-slug `advertise`),
`/privacy-statement`. Onbekende/niet-toegestane segmenten → 404.

### Beslissingen
1. **Eén dynamische route `[pageSlug]` + expliciete allowlist** i.p.v. losse
   route-mappen. De allowlist is de beveiligingsgrens: account-/systeempagina's
   (sign-in, invoices, …) kunnen nooit via deze template publiek worden.
2. **Canonical = frontend-route, niet de Yoast-canonical** (die wijst naar het
   oude WP-domein). Yoast-canonical wordt wél bewaard op `PageSeo.yoastCanonical`
   voor debugging.
3. **`/contact` valt buiten deze template** → eigen route met Gravity
   Forms-maatwerk (eigen form → GF REST). Geblokkeerd op info van Johan (S11.1).
4. **`/sitemap` vervalt als contentpagina** → gedekt door `sitemap.ts` (machine).
   Voorkomt een verouderde dubbele waarheid.
5. **Geen hero, geen "laatst bijgewerkt" in v1.** `featured_media` is op deze
   pagina's vrijwel altijd 0; `modified` is wel gemapt maar niet getoond.
6. **Body via gedeelde `MaterialBody`** (DRY) i.p.v. een eigen prose-container —
   consistente typografie + dark mode, geen tweede prose-systeem, geen nieuwe CSS.

### API-velden / structuren (WP-core `page`)
- `GET /wp/v2/pages?slug=<slug>&per_page=1&_fields=…` → array van 0/1.
- Relevant: `title.rendered`, `content.rendered`, `modified`, `featured_media`
  (meestal 0), en `yoast_head_json` (title, description, og_*, canonical, robots).
- WP-slug ≠ route waar nodig: `advertise` (WP) → `become-a-partner` (route).


---

## ↳ Database-uitbreidingen

### Zijsprong — Database-uitbreidingen inventarisatie voor Johan (29-05-2026) ✅

Niet-genummerde zijsprong-sessie, geïnitieerd vanuit een verschil van
inzicht tussen Jeroen en Johan over de werkvolgorde: database-first
(Jeroen) versus on-demand-uitbreiden tijdens pagina-bouw (Johan). Sessie
heeft het verschil benoemd, technisch onderbouwd en omgezet in een
concreet werkstuk voor Johan zodat de discussie niet abstract blijft.

**Standpunt vastgelegd:** database-first voor álle al-vastgelegde
uitbreidingen. Onderbouwing in vier punten — schema als contract,
geen YAGNI bij vastgelegde features, migratiepijn schaalt met data,
voorkomt dubbel frontend-werk. Niet als regel voor speculatieve
features.

**Wat is opgeleverd:**
- `database-uitbreidingen-instructie-johan.md` *(nieuw)* — instructie-
  document met alle DB-uitbreidingen die nodig zijn vóór de productie-
  pagina's gebouwd worden, in vijf batches:
  - **Batch A** — Membership en publicatie-statussen (brand-tier,
    material-publication-status, user-membership, mutual-exclusion-regel)
  - **Batch B** — Brand-uitbreidingen (country, city, address, website,
    founded, employees, primary-user-koppeling)
  - **Batch C** — Content-entiteit uitbreidingen, twee sub-batches:
    - **C-MAT**: material-code, property-groepen, videos[], brochures[],
      channels exposure, sustainability-flags, prev/next-mechanisme
    - **C-TALK**: date (verplicht), duration_seconds (handmatig + Vimeo-
      optie), speakers[] verifiëren, company-koppeling (drie opties),
      channels, insider_only (default `true`)
  - **Batch D** — Content-segmentatie (article.type, insider-only
    exposure, channels, reading-time, related[])
  - **Batch E** — Personal account billing (billing_is_company,
    company_name, vat_number, kvk_number — VIES-validatie geparkeerd
    naar latere release)

**Open beslissingen die nog terug moeten komen:**

| Onderwerp | Wachtend op | Voorstel Claude |
|---|---|---|
| Mutual-exclusion brand-tier × material-status (A6) | Johan | Harde constraint in WP (save_post-hook) |
| `brand.employees` exact getal of bands | Jeroen + Johan | Bands |
| `article.type`: ENUM of WP-taxonomy | Jeroen + Johan | Taxonomy (uitbreidbaar zonder code-deploy) |
| Talks-company-koppeling: hergebruik brand / nieuwe company-entiteit / pragmatische hybride | Jeroen + Johan | Optie 3 — `talk.company_name` + optionele `talk.company_brand_id` |
| Talks-Vimeo: handmatig v1, auto-fill later? | Johan | Handmatig v1; Vimeo-auto-fill als follow-up |
| Talks-speakers: 1:1 of N:N | Johan | Verifiëren; mockup gaat uit van N:N |
| Personal billing in WC-meta-namespace of eigen MD-velden | Johan | WC-namespace (Pad B) |
| VIES-validatie BTW-nummers | Latere release | Alleen format-regex in v1 |

Plus volgorde-akkoord op de vijf-batch-aanpak — wacht op opdrachtgever.

**Niet meegenomen (bewust buiten scope):**
- Stripe-prijzen (blijven in `src/lib/config/membership.ts`)
- Pre-aangemaakte user-accounts voor claim-flow (aparte sessie)
- Webhook-event-log-tabel (later)
- Audit-log van tier-wijzigingen (geen v1-blocker)
- VIES-validatie en Vimeo-auto-fill (zie open-issues hierboven)

**Werkwijze:** sessie heeft het standpunt onderbouwd vóór het werkstuk;
zodra het document compleet was, lichte iteraties op talks-velden en
personal billing (uit handover-aanvulling Jeroen) en `talk.insider_only`
toegevoegd (default `true`).

**Geen code-werk deze sessie.** Pure documentatie-deliverable. Implementatie
ligt bij Johan in WP; frontend-impact volgt zodra batches landen.

**Bestanden aangemaakt:**
- `database-uitbreidingen-instructie-johan.md` — naar projectdocumentatie

**Bestanden gewijzigd:** geen.

**Vervolg:** Jeroen legt het document voor aan Johan. Open beslissingen
komen terug in een korte vervolg-afstemming, daarna kan Johan starten
met Batch A. Pas na oplevering Batch A (membership + statussen) kunnen
productiepagina's gebouwd worden waarin die velden voorkomen.

---


---

## ↳ Opruiming (29-05-2026)

Schoonmaakactie op de moedermap (zie `MANIFEST-opschoning.md`):
- `src/styles/globals-additions-auth.css` verwijderd (dode CSS; één-stylesheet-regel).
- `src/app/mock/` verwijderd (DevAuthPanel/mock — achterstallige opruim-TODO; `/sign-in`
  + `/register` + `/materials` bestaan en niets linkte nog naar `/mock`).
- `cookie.ts` blijft (is wél in gebruik; cookie-config naast de `cookies.ts`-helpers).

> Deze verwijderingen moeten ook in Johan's repo worden gecommit (anders komen ze terug
> bij de volgende server-export).


---

## ↳ Sessie Dashboard (Fase 2)

# Session-log — patch sessie Dashboard (Fase 2)

> Append-only entry voor `session-log.md`. Dashboard = Fase 2 (volgt na de
> publieke frontend, sessies 1–11). Bouwt het volledige dashboard tegen de
> getypte mock-laag.

## Sessie Dashboard — geïntegreerd account- + brand-dashboard (01-06-2026) ✅

**Mentaal model (leidend):** één geïntegreerd dashboard per ingelogde
persoon. Basis = persoonlijk account; Insider voegt extra's toe; brand-beheer
hangt eronder (`user.brands[]` = array → multi-brand). Navigatie past zich aan
op user-state. Datacontract is **output** uit de mockup (niet wachten op
Johan); gebouwd tegen `mock.ts` zodat WP-endpoints achteraf inklikken.

### Gebouwd

**Shell (Batch 0):** echte geneste Next.js-routes onder `/dashboard`. Server
auth-gate (`layout.tsx` → redirect bij uitgelogd, `noindex`). Adaptieve
client-shell: `DashboardShell` (scope uit URL via `resolveDashboardScope`),
`DashboardSidebar` (Account-scope + per-brand scopes + add-brand +
back-to-home), `DashboardMobileNav` (horizontale scroller), `DashboardPageHeader`
(breadcrumbs + titel), `DashboardStickyFooter` (voortgang + Save/Preview,
breedte via `--progress` custom-property). Hub `page.tsx` → redirect
`/dashboard/profile`.

**Datalaag:** `types/dashboard.ts` (interfaces per paneel), `lib/dashboard/nav.ts`
(USER_NAV/BRAND_NAV + `tierMeets`/`brandPanelHref`/`resolveDashboardScope`),
`lib/dashboard/mock.ts` (getypte fixtures), `lib/dashboard/data.ts` (async
naadlaag, nu mock), `lib/dashboard/brand-access.ts` (`requireManagedBrand` →
`notFound()`), `lib/auth/get-current-user.ts` (gedeelde auth-hydratatie;
root-layout onaangeroerd).

**Persoonlijke panelen (Batch 1):** profile (form + sticky footer), bookmarks
(getabd, verwijderbaar), boards (Insider-gated), saved-searches (Insider-gated),
insider-insights (vergrendelde teaser voor niet-Insiders), membership
(reader-billing; prijzen uit `INSIDER_PRICING`), requests (read-only),
invoices (`InvoicesTable`, herbruikt).

**Brand-panelen (Batch 2/3):** brand profile (form, keywords Plus-gated),
membership (tier-vergelijkingstabel; prijzen + feature-matrix uit
`membership.ts`, tier-kleur via data-injection), materials (lijst +
status-toggle + quota-balk), material form new/edit (categorieën, channels,
gallery, videos, downloads Basis-gated, keywords Plus-gated, danger zone),
interactions (lijst + slide-in `.ip-*` detail-drawer), statistics (Basis-gated;
stat-cards + tabel), lead-routing (Plus-gated), featured (Partner-gated),
brand invoices (`InvoicesTable`), delete-brand (naam-bevestiging), add-brand
(claim via zoeken of nieuwe aanvragen).

**Tier-poorten:** consequent via `canManufacturerAccess`/`tierMeets` +
`BrandTierGate` (brand-side) en `InsiderGate` (reader-side). Geen dead-ends —
gated panelen blijven zichtbaar en verkopen de waarde (upsell-pilaar).

### Beslissingen (Sessie Dashboard — per-sessie genummerd)

1. **Echte geneste routes** i.p.v. SPA-state: persoonlijk onder `/dashboard/*`,
   brand onder `/dashboard/brands/[brandSlug]/*`. URL = single source of truth
   voor actieve scope/paneel.
2. **Brand-route op slug** (niet id); resolver mapt slug → id richting WP.
3. **Insider-extra's zichtbaar + gated** (mockup-gedrag, upsell).
4. **Reader-Insider-membershippaneel toegevoegd** (`/dashboard/membership`,
   kleine afwijking van mockup).
5. **Mock/datacontract-plaatsing:** `types/dashboard.ts`, `lib/dashboard/*`,
   `docs/dashboard-datacontract.md`.
6. **Batch-volgorde:** Shell → Persoonlijk → Brand-kern → Brand-rest.

### API-velden / datacontract

Volledig vastgelegd in `docs/dashboard-datacontract.md` (endpoints, methodes,
interfaces, autorisatieregels). Kern: "WordPress rekent, frontend leest";
brand-endpoints dwingen `findBrandMembership` serverkant af; tier-poorten ook
serverkant. Vijf open vragen voor Johan onderaan dat document (basis-URL,
upload-flow, billing-portal, server-side `timeAgo`/`summary`,
`countsAgainstQuota`).

### Open issues / aandachtspunten

- **`globals.css` (gewijzigd, gedeeld bestand):** dashboard-CSS alsnog uit de
  mockup geport (zat er nog niet in; eerdere pre-flight-aanname was fout). Een
  per ongeluk meegekomen globale override-sweep (herstylede publieke klassen
  `.hero-title`/`.card`/`.mat-card`/`.login-title`) is gestript om regressie op
  de publieke frontend te voorkomen; alleen 3 dashboard-only verfijningen
  teruggezet. **Bij integratie: export/inhoud-diff tegen actuele `main`** vóór
  overschrijven (frontend-merge-stap, géén Johan-actie).
- **Footer op dashboard:** root-layout rendert altijd `<Footer/>`; de mockup
  verbergt die op het dashboard. Niet aangepast (zou root-layout raken). Later
  beslissen of footer conditioneel verborgen moet worden op `/dashboard/*`.
- **Alles draait op mock** tot Johans endpoints er zijn. Save/delete/claim zijn
  optimistische lokale stubs.

### Volgende sessie

- Endpoints van Johan inklikken in `data.ts` (per functie `MOCK_*` →
  `wpFetch` + mapper); open datacontract-vragen afstemmen.
- Featured-boeken koppelen aan upsell-shop/WooCommerce.
- Billing-portal (Stripe customer portal) voor reader + brand membership.
- Eventueel footer-zichtbaarheid op dashboard.

**Bestanden aangemaakt:** 53 (zie zip `materialdistrict-dashboard-fase2.zip`).
**Bestanden gewijzigd:** `src/styles/globals.css`.

### Patch — build-fix (01-06-2026, na QA Johan)

- `ReaderMembershipPanel.tsx`: `billingInterval === 'month'` → `'monthly'`.
  `BillingInterval` in `shared.ts` is `'monthly' | 'annual' | null`. De
  pricing-metadata `INSIDER_PRICING.monthly.interval: 'month'` is iets anders
  (Stripe-achtig) en bleef ongemoeid. Enige plek in de dashboard-code met deze
  vergelijking; `npm run build` blokkeerde hierop.
- Datacontract-vragen 1–5 door Johan beantwoord en bevestigd (basis-URL +
  brandId-API/slug-routes; WP Media REST voor assets; Stripe Customer Portal
  via `/membership/portal`, geen apart cancel-endpoint v1; `timeAgo` +
  saved-search-`summary` server-side; `countsAgainstQuota` als computed veld).

### Patch — sign-out + checkout-CTA (01-06-2026)

- **Sign-out toegevoegd:** er was nog geen uitlog-mogelijkheid. Knop nu in
  `DashboardSidebar` (footer, naast "Back to homepage") én in
  `DashboardMobileNav` (zijbalk is op mobiel verborgen). Beide roepen
  `useAuth().signOut()` aan en navigeren daarna naar `/`. Nieuwe klassen:
  `.sb-footer`, `.sb-signout`, `.dash-mob-signout`.
- **Reader-Insider-CTA's** in `ReaderMembershipPanel` wijzen nu naar
  `/checkout?plan=insider&interval=annual|monthly` (was `/membership?plan=…`),
  consistent met de bestaande `/membership`-CTA. NB: de `/checkout`-route zelf
  hoort bij de membership-track (S11.1) en is daar nog te bouwen — tot die er
  is geeft de link een 404 (zelfde vooruit-lopende patroon als de bestaande
  membership-CTA).

### Patch — Batch 1 live bedrading (02-06-2026)

Johan's Batch 1 dashboard-endpoints staan live op productie (profile, brand
profile, materials list + status-toggle). Frontend hierop aangesloten; overige
panelen blijven mock tot batch 2.

**Nieuw:**
- `src/lib/api/dashboard.ts` — `wpDashboardFetch` (Bearer + GET/POST/PATCH +
  `md_dashboard_*`-error-envelope via `DashboardApiError`). Hergebruikt alleen
  het geëxporteerde `WP_API_URL`; raakt de gedeelde `wordpress.ts` niet.
- `src/lib/dashboard/mappers.ts` — snake↔camel: `mapUserProfile`,
  `mapBrandProfile`, `mapMaterialListRow(s)` + reverse `toWpUserProfile`/
  `toWpBrandProfile`.
- `/api/dashboard/profile` (POST), `/api/dashboard/brands/[brandId]/profile`
  (POST), `/api/dashboard/brands/[brandId]/materials/[materialId]` (PATCH) —
  cookie→Bearer proxy's (patroon van `/api/auth/me`). JWT is HttpOnly, dus
  schrijven loopt server-side via deze routes.

**Gewijzigd:**
- `data.ts` — `getProfile`, `getBrandProfile`, `getBrandMaterials` nu live
  (server-side `wpDashboardFetch` + mapper; slug→id via `findBrandMembership`;
  404 → null). Rest nog mock.
- `ProfileForm` / `BrandProfileForm` — `handleSave` POST't naar de proxy +
  `router.refresh()`; foutmelding bij falen (incl. `md_dashboard_forbidden`
  → keywords-tier-melding).
- `MaterialsPanel` — `toggleStatus` doet optimistische PATCH met revert +
  `409 md_dashboard_quota_exceeded`-melding; nieuwe prop `brandId` (numeriek)
  doorgegeven vanuit de materials-page.
- `globals.css` — `.form-error` banner.

**Aandachtspunten:** material-toggle is PATCH (niet POST); brand-API op
numeriek `brandId` (slug→id via `user.brands[]`); brand-auth-fouten komen als
404 (geen lek), afgevangen → `notFound()`.

### Patch — Batch 3 bedrading (tegen bevestigde spec, ⏳ deploy)

Johan's batch-3 handoff geeft de exacte shapes (snake_case, methodes, bodies,
foutcodes, PATCH-dispatch, tier-gates). Hierop bedraad; testbaar zodra batch 3
gedeployd is op productie.

**Reads live (`data.ts`):** `getBookmarks`, `getBoards`, `getSavedSearches`,
`getInsiderInsights`, `getUserInvoices`, en `getMaterialForm` (edit-GET; create
blijft lokaal blanco). Mock-imports opgeschoond.

**Mappers (`mappers.ts`):** + `mapBookmark(s)`, `mapBoard(s)`,
`mapSavedSearch(es)`, `mapInsight(s)`, `mapInvoice(s)`, `mapMaterialFormData`,
en write-mappers `toWpBoard` / `toWpSavedSearch` / `toWpMaterialForm`.

**Fetch-helper (`api/dashboard.ts`):** `wpDashboardFetch` ondersteunt nu ook
**DELETE** en handelt **204/lege body** af (anders crasht `res.json()`).

**Proxy-routes (nieuw):**
- `DELETE /api/dashboard/bookmarks/[id]`
- `POST /api/dashboard/boards`, `PATCH`/`DELETE /api/dashboard/boards/[id]`
- `POST /api/dashboard/saved-searches`, `PATCH`/`DELETE …/[id]`
- `POST /api/dashboard/brands/[brandId]/materials` (create)
- `PATCH`/`DELETE …/materials/[materialId]` — PATCH **dispatcht**: body met
  formvelden → form-save (retour MaterialFormData); body met alleen `{status}`
  → toggle (retour MaterialListRow), conform WP.
- `POST /api/dashboard/media` — scoped upload (cookie→Bearer, multipart:
  `file` + `brand_id` + `context`) → proxy naar
  `POST /md/v2/dashboard/brands/{brandId}/media` → `{ id, name, url }`.
  Gebruikt **niet** generieke `/wp/v2/media` (subscribers missen `upload_files`).
- Gedeelde `api/dashboard-proxy.ts` helpers (`getTokenOr401`, `dashboardError`).

**UI aangesloten:** BookmarksPanel (delete), BoardsPanel (create/delete),
SavedSearchesPanel (alerts-PATCH + delete), MaterialForm (create/edit/delete +
**echte uploads** via media-proxy met file-inputs; `brandId`-prop doorgegeven
vanuit new/edit-pages). Alles optimistisch met revert + `.form-error`.

**Bekende gap (follow-up):** de categorie-picker in MaterialForm gebruikt nog
een hardcoded TAXONOMY zonder echte term-id's. `toWpMaterialForm` stuurt alleen
categorieën mee met een geldig numeriek term-id → **bestaande** categorieën
(uit de GET-form) blijven behouden, maar **nieuw** toegevoegde categorieën
krijgen geen geldig id en worden bij opslaan genegeerd. Een echte taxonomy-picker
(term-id's uit WP) is nodig om nieuwe categorieën te kunnen toewijzen.

### Patch — Batch 2 start (membership portal) + brandmenu-404 hardening

- **Membership portal (live):** nieuwe server-route
  `/dashboard/membership/manage` haalt de Stripe-portal-URL op
  (`GET /md/v2/dashboard/membership/portal → { url }`) en redirect erheen;
  bij 503 (geen Stripe-customer) terug naar `/dashboard/membership?billing=unavailable`.
  De bestaande "Manage billing"-link wees hier al heen — geen client-component nodig.
- **Brandmenu-404:** een brand met lege slug (draft/nieuw, conform Johans
  batch-1-randgeval) produceerde een link `/dashboard/brands/` → 404. Sidebar
  toont zo'n brand nu als niet-klikbare "Pending setup" i.p.v. een dode link.
  NB: als de 404 op een brand mét slug optreedt, ligt het aan de profile-read
  (brandId/endpoint) — apart te bevestigen.
- **Batch 2 data-panelen** (requests, interactions, statistics, lead-routing):
  nog niet bedraad — wachten op `dashboard-handoff-batch2-jeroen.md` voor de
  exacte snake_case-shapes (o.a. `time_ago`, geneste StatMetric/MaterialStatRow/
  LeadRoute). Niet gokken (batch-1-les).

### Patch — Batch 4 bedrading (featured, brand invoices, delete brand, add brand)

Tegen Johans bevestigde batch-4 handoff-shapes.

**Mappers:** + `mapFeaturedPlacement(s)`, `mapBrandCandidate(s)` (brand-invoices
hergebruiken `mapInvoices`).

**Reads live (`data.ts`):** `getFeaturedPlacements` (Partner+; 403/404 → []),
`getBrandInvoices` (404 → []), `getBrandCandidates(q)`.

**Proxy-routes (nieuw):**
- `DELETE /api/dashboard/brands/[brandId]` — trash brand.
- `POST /api/dashboard/brands/claim` — body `{ brandId }` → WP `{ brand_id }`.
- `POST /api/dashboard/brands/request-new` — `{ name, website?, email?, message? }`.
(Static `claim`/`request-new` gaan vóór dynamische `[brandId]` in Next routing.)

**UI:** `DeleteBrandPanel` (echte DELETE + `brandId`-prop + refresh),
`AddBrandPanel` (claim → POST + refresh zodat sidebar de brand oppikt; nieuw
request-formulier → POST request-new met bevestiging). `FeaturedPanel` en de
brand-`InvoicesTable` zijn read-only → alleen `data.ts`.

**Nog open (enige resterende gap):** batch-2 data-panelen (requests,
interactions, statistics, lead-routing) — wachten op
`dashboard-handoff-batch2-jeroen.md` voor de exacte snake_case (o.a. `time_ago`,
geneste StatMetric/MaterialStatRow/LeadRoute). Membership portal (batch 2) is al wel live bedraad.

### Patch — Batch 2 data-panelen bedraad (laatste gap gedicht)

De batch-2 handoff met snake_case-shapes was niet beschikbaar; velden daarom
afgeleid uit de contract-types (Johans conventie is consequent puur snake_case —
batch 1 bevestigde dat élk veld een directe conversie was). Geneste velden
gemarkeerd in `mappers.ts`; afwijking = één-regel fix.

**Mappers:** + `mapMyRequest(s)`, `mapInteraction(s)` (incl. `time_ago`,
`request_options`), `mapBrandStatistics` (+ StatMetric/MaterialStatRow),
`mapLeadRoutingConfig` (+ LeadRoute) + `toWpLeadRouting`.

**Reads live (`data.ts`):** `getMyRequests`, `getInteractions`,
`getBrandStatistics` (403 free tier → leeg), `getLeadRouting` (403 → leeg).

**Write:** `POST /api/dashboard/brands/[brandId]/lead-routing`;
`LeadRoutingPanel.handleSave` aangesloten (+ `brandId`-prop, 403-melding,
re-sync van door WP toegekende route-ids). Requests/Interactions/Statistics zijn
read-only → alleen `data.ts`.

**Status:** het volledige dashboard-datacontract is nu frontend-zijdig
aangesloten (batch 1–4 + portal). Resterend buiten scope: bookmark POST
(publieke site) en board-items toevoegen (latere batch). `data.ts` gebruikt
nergens nog mock behalve de blanco-create-fallback van het materiaalformulier.

### Patch — Insider-reads 403-safe (na Johans deploy-bevestiging)

Johan bevestigde: batch-2 veldnamen kloppen (geen mapper-wijziging),
`connected_brands[].id` = WP brand-post-id (brandId-resolutie correct),
lege-slug-fix correct. Eén hardening: de `insider-insights`-pagina fetcht
onvoorwaardelijk (rendert `locked` voor niet-Insiders), dus een
`403 md_dashboard_insider_required` zou de pagina laten crashen. `getBoards`,
`getSavedSearches` en `getInsiderInsights` vangen 403 nu af → `[]` (boards/
saved-searches gaten al client-side vóór de fetch; dit is belt-and-suspenders).

### Patch — Dashboard robuustheid-vangnet (C)

Nu de panelen echte netwerk-reads doen:
- `src/app/dashboard/error.tsx` — segment-brede error boundary (rendert binnen
  de shell): vriendelijke melding + "Try again" (reset) + terug-link. `notFound()`
  en auth-redirects blijven ongemoeid (geen errors).
- `src/app/dashboard/loading.tsx` — skeleton-laadstaat (header + paneel) tijdens
  server-side reads. Nieuwe klasse `.dash-loading`.

### Patch — Categorie-picker (B): echte taxonomy i.p.v. hardcoded

`MaterialForm` had een hardcoded TAXONOMY zonder echte term-id's → nieuw gekozen
categorieën gingen bij opslaan verloren. Vervangen door een picker gevoed door
de catalogus uit WP:
- `mappers.ts`: + `mapMaterialCategoryOptions` (hergebruikt `mapCategory`).
- `data.ts`: + `getMaterialCategories()` → `GET /md/v2/dashboard/material-categories`.
  Endpoint bestaat nog niet → 404 wordt afgevangen → lege catalogus (picker toont
  "nog niet beschikbaar", formulier blijft werken). Klikt in zodra Johan 'm levert.
- `MaterialForm`: hardcoded TAXONOMY + addCategory/updateCategory weg; nu een
  `categoryOptions`-prop, een Select uit de catalogus (label "l1 › l2 › l3",
  value = term-id) + geselecteerde categorieën als chips (`.chip-group`/`.chip-x`,
  hergebruikt). Save stuurt nu echte term-id's mee (`categories: [{ id }]`).
- new- + edit-page: halen de catalogus parallel op en geven `categoryOptions` door.

Contract-spec voor het endpoint staat in `docs/wordpress-instructions-material-categories.md`.

### Fix — Categorie-picker: 3-traps cascade terug (Johan-bug ─1227)

Johan meldde op test: de eerder afgesproken 3 cascade-dropdowns (l1/l2/l3) waren
verdwenen en de categorie leek "twee keer op de pagina" te staan (de platte
dropdown leek op het "Material type"-veld). Oorzaak: ik had de cascade vervangen
door één platte Select. Teruggezet naar de oorspronkelijke 3-traps cascade,
nu gevoed door de **live catalogus** (`categoryOptions`) i.p.v. de oude hardcoded
TAXONOMY:
- l1-opties = unieke l1 uit de catalogus; l2/l3 afgeleid per gekozen niveau.
- Bij een volledige (l1,l2,l3)-match wordt het echte WP leaf-`term_id` gestempeld
  (`resolveCategoryId`), zodat opslaan met geldige term-id's gebeurt.
- Onvolledige rij → id '' → valt weg in `toWpMaterialForm` (zoals voorheen).
- UX/markup identiek aan het origineel (`.cat-row`/`.cat-remove`/`panel-head-row`).

OPEN VRAAG aan Johan: als de category Level-1-opties dezelfde termen zijn als het
"Material type"-veld, is dat een data-overlap (top-level van material_category ==
material type)? Dan afstemmen of die niveaus gescheiden moeten zijn.

### Patch — Featured + offline heads-up (frontend) (04-06)

Johan zette de online-bewuste featured-regel live (plugin `3e9d10f`):
`is_featured_now` = actieve kalenderweek én materiaal online; offline/draft
tijdens een geboekte week → uit slider/categorie-pin, week blijft geboekt, heelt
vanzelf bij weer-online. Geen blokkade op offline/draft/verwijderen; quota
ongewijzigd (geboekte week telt mee, ook offline). Per materiaalrij op
`GET /md/v2/dashboard/brands/{brandId}/materials`: `featured_state`
(`'active'`|`'scheduled'`|`null` = geboekte kalenderweek, niet zichtbaarheid) +
`featured_week_start` (ISO-maandag|`null`).

Frontend opgeleverd (zip `featured-offline-headsup`): `featured_state`/
`featured_week_start` → camelCase op `MaterialListRow` (types + dashboard-
mappers); `MaterialsPanel` toont een zachte, niet-blokkerende heads-up bij het
offline halen van een featured materiaal (active/scheduled) — "Keep online" /
"Take offline anyway". Bevestigen zet 'm offline; booking + quota blijven.
Heads-up zit op de online/offline-toggle in de materialenlijst (primaire pad);
draft/verwijderen lopen via andere flows (WP-regel dekt die sowieso).
**Live:** main `070d489`; heads-up geverifieerd op Partner E2E-brand.

### Patch — ChannelBar-rollout afgerond (alle overzichten live) (04-06)

ChannelBar staat op alle overzichten, overal identiek (`?channel=<slug>`, zoeken
in de bar via `?q=`, behoudt overige params). Eén gedeelde `ChannelBarNav` +
`getChannelCatalog()`/`resolveChannelId()` (`channels.ts`) gevoed door
`/md/v2/material-channels` (wrapper `{ channels:[{id,slug,label,count}] }`, 20
termen).

- **Talks/brands/events:** live + door Johan geverifieerd op test (main
  `84322bf`). Talks/brands filteren server-side (`?theme=<term_id>`); events
  client-side op slug (WP kan niet orderby `date_start` over paginatie).
- **Materials (live):** channel-filter via FacetWP-facet **`theme`** (slug;
  plugin `facetwp-theme-facet.php` + re-index in WP admin). Frontend main
  `76dd5c4` (`channelbar-materials`): `theme` in facet-set, `?channel` ↔ `theme`,
  `ChannelBarNav` op /materials. Geverifieerd: curious 33, biobased 719.

**Gotcha vastgelegd:** FacetWP-taxonomiefacets verwachten term-SLUGS;
WP-REST-collecties (`?theme=`) verwachten term-ID's. Niet door elkaar halen.

### Beslissing — Channels-hubs (volgende sessie) (04-06)

Richting vastgelegd met Jeroen (zie `openingsprompt-channels-sessie.md`):
- `/channels`-index meenemen (alle 20, featured channels vooraan).
- `/channels/[slug]` = gemengde cross-entity hub (niet materials-only — dat zou
  de bar-filter dubbelen). Hero uit `/wp/v2/theme/{id}` (naam + description) +
  `theme_thumbnail`. Strips per type in **topmenu-volgorde: Materials → Stories →
  Brands → Events → Talks** (Books later, tussen Events en Talks), elk met een
  "bekijk alle … in {channel}"-deeplink naar het in-place gefilterde overzicht.
- Bar blijft in-place filteren; hubs via de index (+ evt. klein bruggetje).
- SEO = Claude (canonical/JSON-LD); `?channel=`-overzichten canonical naar het
  kale overzicht.

### Stap 12 — Channels-hubs gebouwd (`/channels` + `/channels/[slug]`) (04-06)

#### Gebouwd

**Datalaag (batch 1)**
- `theme`-filter doorgetrokken naar `listArticles` + `listEvents`
  (`wordpress.ts`: `theme?: number` → `?theme=<id>`; wrappers in `content.ts`
  forwarden via de bestaande spread). Materials/brands/talks hadden het al.
- `getChannelHub(slug, perStrip=8)` (`content.ts`) — resolved slug→term-id via
  de catalogus (onbekend = `null`), haalt parallel hero-term + 5 strips op
  (Materials via FacetWP `theme`-facet/slug, rest via `?theme=<id>`), met per
  strip de eerste 8 items + totaal, en een `isEmpty`-vlag.
- `getChannelsIndex()` (`channels.ts`) — joint `/md/v2/material-channels`
  (canonieke set + materials-telling) met `/wp/v2/theme` (description +
  `theme_thumbnail` + featured-vlag). Sortering: featured → telling → label.
- `getChannelTerm(idOrSlug)` (`channels.ts`) — hero-data (naam + description +
  thumbnail) voor de hub.
- `buildCollectionPage()` + `CollectionPageSchema` (`seo/`).
- Barrel (`api/index.ts`) doorgezet.

**`/channels`-index (batch 2)**
- `channels/page.tsx` (server) + `ChannelIndexCard` (op `Card`-primitives) +
  `loading.tsx` + `channels/layout.tsx` (`CompareProvider`, voor de
  materials-strip met compare in de hub).
- SEO: BreadcrumbList + CollectionPage (ItemList van de hubs). Canonical
  `/channels`.

**`/channels/[slug]`-hub (batch 3)**
- `[slug]/page.tsx` (server) — hero (`ChannelHero`, thumbnail-achtergrond via
  `--channel-hero-img`) + volledige description als prose + strips per type in
  topmenu-volgorde, elk via `ChannelStrip` met een "View all … in {channel}"-
  deeplink (`/materials?channel=…` enz.). Lege types vallen weg.
  `generateStaticParams` (alle 20) + `generateMetadata` (unieke titel +
  description + canonical per channel). `notFound()` bij onbekend/leeg channel.
- Kaarten: `ContentCard` voor materials/stories/events/talks, `BrandTile` voor
  brands — beide hergebruikt, geen nieuwe kaarttypes.
- `[slug]/loading.tsx`.
- SEO: BreadcrumbList (Home → Channels → channel) + CollectionPage met een
  gecombineerde ItemList van de getoonde items.

**CSS** — alleen toevoegingen in `globals.css` (compleet meegeleverd):
`.channel-card-desc`, `.channel-hero*`, `.channel-intro`, `.channel-strip*`.
Verder hergebruik van `ov-*` / `content-card-*`. Brace-balans 1889/1889.

#### Beslissingen (met Jeroen, deze sessie)
1. 8 items per strip. 2. Hero = thumbnail-achtergrond + naam + 2-regel-teaser,
volledige description eronder. 3. Geen bar→hub-bruggetje in v1. 4. Index-telling
= materials (één betrouwbare bron). 5. Featured-first bouwen; terugval op
telling-sortering tot de WF-6-vlag in REST staat. 6. Leeg/onbekend channel → 404.

#### Stylingkeuzes (autonoom)
- Channel = hub, geen content-item → eigen `ChannelIndexCard` i.p.v. ContentCard.
- Materials in de strip via `ContentCard` (niet `MaterialCard`) — vermijdt de
  client-callback-machinerie (compare/sample-gate); compare-state blijft wel
  beschikbaar via de layout-`CompareProvider` mocht dat later nodig zijn.
- "Featured" als eyebrow, geen aparte sectie (voorkomt lege sectie pre-exposure).

#### Open / vervolg
Zie open-issues-patch (C-CH.1 featured-vlag-exposure, C-CH.2 books-strip,
C-CH.3 events-strip-ordering). Mail aan Johan: `email-johan-channels-featured-flag.txt`.

### S13.1 — Bookmarks & saved-search werkend gemaakt (04-06)

#### Aanleiding

Reads + deletes van het hele dashboard-datacontract waren al bedraad (batch
1–4 + portal). Wat ontbrak was de **create-kant**: "Save" op detailpagina's en
material-cards was een lokale, niet-persistente toggle, en `POST
/md/v2/dashboard/bookmarks` was nooit gecontracteerd. Daardoor kon je nergens
een bookmark aanmaken. Saved-searches had wél een POST-route, maar de
"Save this search"-knop in de materials-filter was een bewuste TODO-no-op.

#### Bookmarks — nu werkend

**Nieuw:**
- `src/lib/hooks/useBookmarks.tsx` — client-provider + `useBookmarks()`, zelfde
  loose-mode-patroon als `useCompare`. Hydrateert eenmalig de bookmarks van de
  ingelogde gebruiker (GET) naar een Map `"{type}:{itemId}" → bookmarkId`, en
  `toggleBookmark(type, itemId)` schrijft optimistisch door (POST om toe te
  voegen, DELETE op record-id om te verwijderen) met revert bij fout. Geen
  dubbel-klik-races (per-key pending-guard). Anoniem = lege set, geen fetch.
- `src/app/api/dashboard/bookmarks/route.ts` — `GET` (hydratie-lijst) +
  `POST` (create, body `{ type, itemId }` → WP `{ type, item_id }` via nieuwe
  `toWpBookmark`). DELETE bestond al in `[id]/route.ts`.
- `src/app/events/[slug]/_components/EventDetailActions.tsx` — events gebruikten
  `<DetailActions>` direct (server-rendered, Save was no-op). Nieuwe client-
  wrapper sluit Save aan op `useBookmarks`, met `customPrimary` (Register/Visit)
  doorgegeven vanuit de page.

**Gewijzigd:**
- `src/types/dashboard.ts` — `BookmarkItem` krijgt `itemId: number` (onderliggende
  WP-post-id; nodig om een card/detail aan zijn bookmark-record te koppelen).
- `src/lib/dashboard/mappers.ts` — `RawBookmark.item_id`, `mapBookmark` leest het,
  + write-mapper `toWpBookmark`. Rest van het bestand byte-identiek
  (`wpRenderedHtml` ongemoeid).
- `src/app/layout.tsx` — `<BookmarksProvider>` gemount binnen `AuthProvider`
  (rond shell), zodat elk client-eiland de saved-state deelt.
- Save-knoppen bedraad op `useBookmarks` i.p.v. lokale state:
  - `MaterialDetailActions`, `ArticleDetailActions`, `TalkDetailActions`
  - `MaterialsGrid` + `BrandMaterialsGrid` (material-cards)
  - `EventDetailActions` (nieuw)

**Buiten scope (geen Save-affordance vandaag):** book- en brand-detailpagina's
hebben nu geen Save-knop; het bookmark-type ondersteunt ze wel zodra die
knoppen later toegevoegd worden.

**Afhankelijkheid (Johan):** ~~`POST /md/v2/dashboard/bookmarks` + `item_id`~~ —
live plugin `2aedda2`, frontend test `824d3b3`.

#### Saved-search-create — nu werkend

- `src/app/materials/_components/MaterialsFilterSidebar.tsx` — de "Save this
  search"-knop is niet langer disabled:
  - Anoniem → redirect naar `/sign-in?next=<huidige URL>`.
  - Ingelogd, geen Insider → `InsiderGate` (feature `savedSearch`).
  - Insider → `POST /api/dashboard/saved-searches` met `{ name, query }`.
    `query` = canonieke filter-querystring (`buildUrl(localSelection)` zonder
    pathname); `name` = auto-afgeleid uit de actieve selectie (WP berekent de
    `summary`). Bevestiging/fout via de bestaande `.form-banner`-klasse —
    **geen nieuwe CSS**. Knop disabled zolang er niets geselecteerd is of de
    POST loopt (spinner via `IconLoading`).
- Gating gebruikt `useAuth()` direct (de page geeft `isMember` niet mee).

**Afhankelijkheid (Johan):** ~~`POST /md/v2/dashboard/saved-searches`~~ — live,
Insider-smoke op productie + Vercel test.

#### Geen CSS-wijzigingen

Alles hergebruikt bestaande klassen/componenten (`ActionButton`, `IconButton`,
`form-banner is-info/is-error`, `InsiderGate`, `btn`). `globals.css` ongewijzigd.

#### Volgende stap (niet in deze oplevering)

Boards "Add to board" werkend maken: WP-endpoint `POST …/boards/{id}/items` live
(plugin `2aedda2`). Frontend board-picker-modal (eigen styling) = eerstvolgende stap.

#### Addendum (herbasis 04-06, 2e ronde)

- Alle bewerkte bestanden opnieuw afgeleid van Jeroens actuele bron nadat bleek
  dat de werkkopie verouderd was (featured/offline-velden op `MaterialListRow`,
  ChannelBar-`theme`-facet, en een a11y-refactor in de FilterSidebar). Mijn
  bookmark-/saved-search-wijzigingen staan nu náást dat werk, niets overschreven.
- Saved-search is nu **channel-bewust**: de opgeslagen `query` neemt de volledige
  URL-state mee (filters + q + sort + actief `?channel=`), minus paging.
- ROOT `layout.tsx` + provider: gedeployed op test; geen regressie gemeld.

#### Verificatie (04-06-2026, na deploy)

- Vercel test: `GET`/`POST`/`DELETE` `/api/dashboard/bookmarks` OK; saved-search
  Insider 200 / partner 403; idempotent POST bookmark.
- Johan handmatig: Save op event- en article-detail OK.
- Alleen **gepubliceerde** targets (draft E2E-materiaal → 400 verwacht).

### S13.1 — Board picker ("Add to board") (04-06)

#### Wat

"Add to board" op de detailpagina's was een no-op (gating + placeholder). Nu opent
het een `BoardPickerModal` waarin de gebruiker het item aan een bestaand board
toevoegt of een nieuw board aanmaakt.

**Nieuw:**
- `src/components/ui/BoardPickerModal.tsx` — Insider-modal. Bij openen GET
  `/api/dashboard/boards`; klik op een board → POST `/boards/{id}/items`
  `{ type, itemId }`; "New board" → naam via prompt → POST `/boards` → meteen het
  item toevoegen. Succes-scherm via `git-success`. Hergebruikt de `git-*`
  modal-shell + `git-option`-rijen → **geen nieuwe CSS**.
- `src/app/api/dashboard/boards/[id]/items/route.ts` — POST-proxy naar Johans
  `POST /md/v2/dashboard/boards/{id}/items` (live, plugin 2aedda2).

**Gewijzigd:**
- `src/app/api/dashboard/boards/route.ts` — `GET` toegevoegd (lijst voor de
  picker); bestaande `POST` ongemoeid.
- De vier detail-wrappers (material/article/talk/event): `handleAddToBoard`
  opent nu de modal i.p.v. niets te doen.

#### Gating
Ongewijzigd: `DetailActions` checkt eerst ingelogd (→ sign-in) en Insider
(→ InsiderGate) vóór `onAddToBoard`. De modal gaat dus uit van een Insider.

#### Geen CSS-wijzigingen
`globals.css` ongemoeid; alles via bestaande `git-*` / `btn` / icon-klassen.

#### Resteert
- Save-knop op book-/brand-detail (los puntje; types ondersteunen het al).
- Roadmap: channel-hubs `/channels` + `/channels/[slug]` (build-order Stap 12).

### S13.1 — Board-detailpagina (04-06)

#### Wat
Board-kaarten op /dashboard/boards waren niet klikbaar; er was geen pagina om de
opgeslagen items te bekijken. Toegevoegd:

**Nieuw:**
- `src/app/dashboard/boards/[id]/page.tsx` — server-pagina; `getBoard(id)` →
  `notFound()` bij onbekend/niet-eigen board (of zolang het endpoint nog niet
  live is). Header = board-naam.
- `src/components/dashboard/panels/BoardDetailPanel.tsx` — items-grid die exact
  de bookmark-card-opmaak hergebruikt (`bm-grid`/`bm-card`) + lege staat. Back-
  link via `btn btn-outline btn-sm`. **Geen nieuwe CSS.**

**Gewijzigd:**
- `src/types/dashboard.ts` — `BoardItem` (BookmarkItem-shape zonder record-id) +
  `BoardDetail` (Board + items[]).
- `src/lib/dashboard/mappers.ts` — `mapBoardItem` + `mapBoardDetail`.
- `src/lib/dashboard/data.ts` — `getBoard(id)` → GET `/md/v2/dashboard/boards/{id}`;
  404/403 → null.
- `src/components/dashboard/panels/BoardsPanel.tsx` — cover + titel in een `Link`
  naar het detail (zoals BookmarksPanel); delete-knop blijft werken.

#### Afhankelijkheid
`GET /md/v2/dashboard/boards/{id}` (Johan) — contract per mail 04-06. Vooruit
gebouwd; werkt zodra gedeployed.

#### Geen botsing met channels-sessie
Alle geraakte bestanden zitten in dashboard/types/data/mappers — disjunct van de
parallelle Stap-12 (channels) levering (die raakt o.a. globals.css, lib/api,
lib/seo). Geen overlappende bestanden.

### S13.2 — My profile + Insider insights (05-06) ✅ LIVE op Vercel test

#### Live
- Frontend: Johan-commits `5b073a3`, `86cabae`, `d89a872`. WP-plugin `964d1ac`.
- Test: `/dashboard/profile` + `/dashboard/insider-insights`.

#### Gebouwd (samenvatting)
- **My profile** uitgebreid naar de demo: personal details (incl. phone,
  profession, industry) + billing/adres + "Invoice to a company" (company +
  VAT). Groene vinkjes via `showFilledState`; voortgang via sticky footer.
  Avatar-blok verwijderd.
- **Insider insights** herschreven: upsell-banner (niet-Insiders) + altijd de
  rapportlijst; per rij Download PDF óf "Insider only" via `insiderOnly`.
- Datalaag/types/mappers/mock uitgebreid (`UserProfile`, `InsightReport`,
  `ProfileFieldOptions`); `getProfileFieldOptions()` toegevoegd. Save-route
  ongewijzigd (gebruikte al `toWpUserProfile`).

#### Afwijkingen t.o.v. de oorspronkelijke zip (door Johan, nu canoniek)
1. **Profession/industry = SLUGS** (`architect`, `interior`, …), niet legacy
   labels. Dropdowns altijd gevuld: WP `profile-options` wint, anders
   `DEFAULT_PROFILE_FIELD_OPTIONS` (`src/lib/config/profile-options.ts` +
   `mergeProfileFieldOptions` in `data.ts`). Dus géén vrij-tekst-fallback meer.
2. **Country = volledige lijst** uit `src/lib/config/countries.ts` (ISO-code als
   value; `resolveCountryCode()` normaliseert WP-label → code bij form-init).
   Niet langer de 10-landen-hardcode.
3. **`withCurrentSelectValue()`** — onbekende legacy usermeta blijft zichtbaar
   als extra dropdown-optie (niets verdwijnt).
- Nieuw in repo: `src/lib/config/countries.ts`, `src/lib/config/profile-options.ts`,
  `scripts/gen-countries.mjs` (generator, optioneel).

#### WP-contract live (punt 1 + 2)
- `GET`/`POST /md/v2/dashboard/profile` met alle velden (snake_case).
- `GET /md/v2/dashboard/profile-options` (professions + industries, slugs).
- Usermeta-mapping behoudt legacy (phone→telephone, industry→sector,
  invoice_to_company→billing_is_company, enz.); slugs opgeslagen, onbekende
  waarden pass-through (geen bulk-migratie).

#### Open (S13.2-staart)
- **Insider insights — punt 3 (WP):** payload nog niet uitgebreid met `pages`,
  `format`, `insider_only`, `pdf_url`, `gradient`. Frontend is er klaar voor;
  non-Insiders zien een lege lijst zolang het endpoint 403 geeft. Johan pakt dit
  op wanneer prioriteit; dan tonen we de lijst voor alle ingelogde users met
  per-rapport gating.
- Optioneel later: theme `page-edit-profile.php` uit dezelfde profile-options-
  helper laten lezen (één lijst, geen drift).

#### Correctie — insider report = eigen CPT (05-06, na deploy)

> Misverstand rechtgezet vóórdat Johan punt 3 bouwde. Een **insider report is
> géén article/story-uitbreiding** maar een **eigen, los downloadbaar document
> (eigen CPT)**. De eerdere instructie om `meta.insider_only` van articles te
> hergebruiken is ingetrokken.

Frontend-model bijgesteld (correctie-zip `md-s13.2-insights-correctie`):
- `InsightReport`: `summary` → `description`; `category` verwijderd;
  `thumbnailUrl` toegevoegd (echte afbeelding, `gradient` als fallback);
  `insiderOnly` is nu een **eigen** veld op dit CPT (geen article-meta).
- `mapInsight`/`RawInsight`, `MOCK_INSIGHTS` en `InsightsPanel` mee aangepast
  (rij toont nu de thumbnail-afbeelding met gradient-fallback). `.insight-thumb`
  kreeg `object-fit:cover`.

CPT-velden (definitief): title, description, thumbnail (afbeelding), PDF
(download), insider_only (eigen vinkje), pages, format. "Preview" is **geen
veld** maar de S13.5 tier-preview (niet-Insider mag de functionaliteit inzien).


### S13.3 — Dashboard: Brand- en materiaalformulieren (05-06)

Brand profile én material add/edit gelijkgetrokken aan de demo. Eén gedeelde
laag voor alles wat in beide formulieren voorkomt (DRY).

**Beslissingen (Jeroen):**
- Indoor/Outdoor op materiaal = **multi** (beide tegelijk mag).
- Current-plan-banner = **tier-specifiek** + "Compare plans"-CTA voor niet-Partner.
  Banner toont de **echte config-prijzen** (Partner €3.000, Plus €1.500, Basis
  €750) — de mockup-prijs €3.750 is stale; config overrulet de mockup voor waarden.

**Gedeelde fundamenten (nieuw):**
- `src/lib/config/material-applications.ts` — de complete applicatie-cascade
  (6 hoofd → 26 sub → 189 types) 1:1 uit de mockup. **Enige optiebron** voor de
  picker in beide formulieren.
- `src/components/dashboard/fields/` — vier gedeelde componenten:
  `ApplicationPicker` (Main/Sub/Type + Add + breadcrumb-chips, max 3, dedup),
  `DownloadsField` (documenttitel + file + lijst), `VideoLinksField` (URL + lijst
  + lege staat), `GalleryField` (upload + reorder via toetsenbord-toegankelijke
  up/down + verwijderen).
- `src/components/dashboard/CurrentPlanBanner.tsx` — tier + prijs + pills
  (quota / featured placement / fair-korting) uit `membership.ts`.
- `src/lib/dashboard/material-property-options.ts` — `buildMaterialPropertyOptions()`
  merget de **live FacetWP-baseline** over statische defaults wanneer choices
  ontbreken (zelfde model voor alle 24 facets); datalaag-helper
  `getMaterialPropertyOptions()` met graceful fallback naar all-static.

**Contract (`types/dashboard.ts`):**
- `MaterialAsset` + optioneel `title` (gedeelde downloads-met-titel-shape).
- `BrandProfile`: `address` → `addressLine1` + `addressLine2`; nieuw
  `applications` (`MaterialCategoryPath[]`), `videos`, `gallery`, `downloads`.
- `MaterialFormData`: `categories` → `applications`; nieuw `indoorOutdoor`
  (`Array<'indoor'|'outdoor'>`) en `properties` (`MaterialProperties`, 24 velden).
- `material-properties.ts`: `EMPTY_MATERIAL_PROPERTIES` + `PROPERTY_VALUE_OPTIONS`
  geëxporteerd (beide additief).

**BrandProfileForm — demo-volgorde:** Current plan-banner → Brand details + logo
→ Contact & company (adres line 1/2) → Social channels → Sectors & applications
(Plus+) → Media (gallery alle tiers + video links Plus+) → Downloads & brochures
(Plus+) → Keywords (Plus+) → Channel coupling (**Partner**, max 3 + Active
channel links + 24-uurs-melding).

**MaterialForm — demo-volgorde:** Basic information (naam + featured image) →
Classification (type + Indoor/Outdoor-toggle + Material applications) → Media
(gallery + video links Plus+) → Documents & downloads (Plus+) → Search &
filtering (24 properties / 4 groepen, hergebruik `material-properties.ts`) →
Keywords (Plus+) → Channel coupling (**Partner**, max 3 + Active channel links)
→ Danger zone. De oude losse Categories-Selects + `categoryOptions`-prop +
`getMaterialCategories()`-call uit de edit/new-pages verwijderd; die fetchen nu
`getMaterialPropertyOptions()`.

**Gating** volgt exact de mockup (`mfGate`): sectors/video/downloads/keywords =
Plus+, channel coupling = Partner. Ook server-side door WP afgedwongen.

**Styling:** alle nieuwe regels in één `globals.css` (sectie "S13.3 — Brand &
material form fields"), CSS-tokens, geen inline hardcoded waarden, responsive
grids + dark-mode. `.asset-list`/`.asset-row` hergebruikt.

**Kwaliteit:** `tsc --noEmit` groen over de hele boom; export-diff op gedeelde
bestanden schoon (alleen additief: `EMPTY_MATERIAL_PROPERTIES`,
`PROPERTY_VALUE_OPTIONS`).

#### Open (S13.3 — Johan)
WP-endpoints staan live (plugin `278351f`, frontend `e5ed40b`). Restpunt: materialen
taggen + FacetWP re-index zodat environmental/content-facets choices krijgen in de
baseline (zelfde pad als sensorial/technical — geen apart datamodel).
- **Applicatie-term-mapping:** de picker zet voorlopig `app:`-pad-ids; die worden
  bij wegschrijven overgeslagen. `/md/v2/dashboard/material-categories` levert
  `[{id,l1,l2,l3}]` voor hydratie met echte term-ids.
- **Slug-alignment:** form static defaults vs. WP-term-slugs (vooral percentages)
  nog eens verifiëren bij eerste echte saves.
- **Media upload (subscribers):** ✅ scoped `POST /md/v2/dashboard/brands/{id}/media`
  (plugin `3cb0676`, frontend `1169f60`); gallery `post_parent` sync bij save.
  Claude zip `md-s13.3-upload-fix` bevestigt dezelfde frontend-implementatie.
  Handoff: `docs/email-claude-s13.3-dashboard-media-upload-done.txt`.

#### S13.3 — follow-up na Johan (05-06)

Twee correcties van Johan verwerkt:

1. **Filterbaar/niet-filterbaar — rechtgezet.** Environmental (9) en content (3)
   zijn géén apart datamodel: ze lopen via hetzelfde FacetWP-pad als sensorial/
   technical (WP-taxonomie → term op material → class_list → parseMaterialProperties
   → filter). Dat content nu nauwelijks filterbaar lijkt komt door wéinig data
   (lege facet-choices in de baseline → verborgen filtergroepen), niet door het
   datamodel. WP-persist voor alle 24 properties staat live (plugin 278351f) via
   wp_set_object_terms — geen apart publiek REST-pad nodig naast class_list.
   Johan heeft de frontend-comments hierop afgestemd (geen logica gewijzigd);
   die comment-only-bestanden zijn NIET opnieuw uit deze kant geleverd om zijn
   edits niet te overschrijven. **Monitoring-punt:** slug-alignment tussen de
   form-defaults (`PROPERTY_VALUE_OPTIONS`) en de WP-term-slugs, vooral de
   percentage-buckets — relevant zolang een facet lege baseline-choices heeft en
   dus op de statische defaults terugvalt.

2. **Save-bug (Free/Basis) — gefixt.** `toWpMaterialForm()` stuurt altijd
   `videos: []` mee; WP deed een tier-check zodra de key `videos` aanwezig was
   (ook leeg) → 403 `md_dashboard_forbidden` bij elke save voor brands onder
   Basis. Root-fix WP-zijde (plugin master): tier-check alleen bij
   `! empty($videos)`. **Frontend:** de foutweergave bij `md_dashboard_forbidden`
   toont nu het WP-bericht (`err?.message`) met korte fallback, i.p.v. de
   misleidende vaste Plus+/Partner-tekst — WP is source of truth voor tier-
   messaging (videos = Basis+, keywords = Plus+, channels = Partner). Toegepast in
   `MaterialForm.tsx` en `BrandProfileForm.tsx`. Geen wijziging aan save-payload
   of UI-tier-gates.

#### S13.3 — follow-up 2: upload-401 gefixt (05-06)

Dashboard file-uploads (gallery/downloads/logo/featured) faalden met 401 op
`/api/dashboard/media` ("Sorry, you are not allowed to create posts as this
user"): dashboard-users zijn WP-subscribers zonder `upload_files`, en de proxy
postte naar de generieke `POST /wp/v2/media`.

Root-fix WP-zijde (plugin master `3cb0676`): nieuw scoped endpoint
`POST /md/v2/dashboard/brands/{id}/media` (JWT + managed-brand-check, mime/size/
rate-limit, `post_author` = user, response `{id,name,url}`), plus
`post_parent`/`menu_order`-sync van gallery/featured/logo bij save zodat de
publieke site de gallery via `?parent=<post_id>` ophaalt.

Frontend (main `1169f60`, bevestigd door Claude zip `md-s13.3-upload-fix`):
- `src/app/api/dashboard/media/route.ts` — `file` + `brand_id` + `context` uit
  FormData; forward multipart naar scoped endpoint; `{id,name,url}` → MaterialAsset.
- `MaterialForm.tsx` / `BrandProfileForm.tsx` — `uploadFile(file, context)` met
  `brand_id`; gallery/logo/featured = `image`, downloads = `document`. Main
  behoudt `logoId` op brand logo-save (niet in Claude zip).

E2E na deploy (beide repos): material edit → gallery upload → save → publieke
materialpagina toont gallery. Testaccount: e2e-dashboard-free.

#### S13.3 — follow-up 3: brand-profile country-list (05-06)

Bug: de country-dropdown op Edit brand gebruikte een hardcoded korte lijst i.p.v.
de canonieke landtabel. Gefixt in `BrandProfileForm.tsx`: nu `COUNTRY_OPTIONS` +
`resolveCountryCode` uit `@/lib/config/countries` (zelfde bron/patroon als
`ProfileForm`). De Select toont de volledige lijst (value = landcode), en een
opgeslagen waarde (code óf legacy-label) wordt bij laden naar de code
genormaliseerd. Type-check groen.

**WP-alignment (plugin):** `GET …/brands/{id}/profile` gaf `country` als
human-readable label terug (`md_dashboard_country_label`); `POST` accepteerde
en bewaarde al een code via `md_dashboard_normalize_country_code`. GET levert
nu ook de genormaliseerde code — read/write consistent, net als user profile
opslag. Frontend `resolveCountryCode` blijft legacy-labels opvangen.

NB voor S13.4: `LeadRoutingPanel.tsx` heeft dezelfde hardcoded `COUNTRIES`-lijst
voor de per-country routing-regels — daar in S13.4 ook `COUNTRY_OPTIONS`
gebruiken (+ `resolveCountryCode` op `route.country` bij laden).

---

## Sessie 10 — Homepage afronding (S10.2 + S10.3) (05-06-2026)

Build-order stap 10. De twee resterende open homepage-punten afgerond; S10.1
(boeken) blijft geparkeerd.

### S10.3 — Featured partners (echte bron)
- Placeholder-array `PARTNERS` vervangen door `listBrands` → filter op
  `partner === true`, roterende subset van max 8 (10-min ISR-bucket).
- Weergave via `BrandTile` in `.ov-grid-brands`; `FeaturedPartners` component.
- Dode `.partner-grid`/`.partner-card`-CSS verwijderd uit `globals.css`.

### S10.2 — Material-type-carrousel
- Bron: `getTerms('material_category', { hide_empty:true })`.
- Deeplink: `/materials?material_category=<slug>`.
- `MaterialCategoryStrip` component; degradeert naar alleen "All materials" bij
  lege taxonomie.

### Te verifieren op test-deploy (HP-V1 / HP-V2)
1. Partners-blok toont Partner-tier brands (24 partners in eerste 100 brands op
   productie — vlag is gevuld).
2. Carrousel toont material-types (Ceramics, Glass, Metals, Wood, …) — geen
   theme-slugs; `/materials?material_category=ceramics` filtert via FacetWP.

### Status
S10.2 + S10.3 gesloten. Deploy naar Vercel test (05-06-2026).

---

## Sessie S13.4 — Interactions (integraal) — 05-06-2026

Frontend zip `md-s13.4-interactions` 1:1 gemerged op main (commit volgt). WP-
contractpunten 1–7 stonden al live op productie (plugin master).

### Frontend overlay
- Nieuw: `lib/api/interactions.ts`, `app/api/interactions/events/route.ts`
- Statistics: materials[] zonder downloads-kolom; 4 metrics-kaarten
- Publieke datalaag: material.downloads[], brand_* gates, user.country uit /auth/me
- Materiaalpagina: download/sample Insider-gates + country-block (label-tegen-label)
- Brand-pagina: website_click logging op website-links
- globals.css: additief §S13.4-B3 + `.t-stats` 4→3 kolommen (homepage partner-CSS
  bewust niet teruggedraaid)

### WP live (productie geverifieerd 05-06)
- GET /auth/me → country (label) + country_code
- POST /md/v2/interactions/events geregistreerd
- GET /wp/v2/material → downloads[] + brand_* + brand_accepted_countries (labels)
- POST /md/v2/get-in-touch → lead + country/insider enforcement

### E2E testplan (Claude + Johan)
Zie docs/MANIFEST-s13.4-interactions.md punten 1–7.

---

## Sessie S13.5 — Dashboard tier-preview (05-06-2026)

Pure frontend overlay `md-s13.5-tier-preview.zip`:
- `usePreviewMode` + `PreviewModeProvider` in `DashboardShell`
- `InsiderGate` variant `preview`; `InsightsPanel` preview-knop
- `SubmitButton` blocked tijdens preview
- globals.css: additief §S13.5-blok (zip-volledige globals NIET blind gemerged —
  bevatte stale partner-grid; §S13.5 CSS handmatig op huidige main)

Geen WP-wijziging. Deploy naar Vercel test.

---

## F1.0 — Typografie + paper-canvas (Fase 3) — 08-06-2026

Start van **Fase 3** (consolidatie/fine-tuning). Bewust beperkte, chirurgische
wijziging: alleen design-tokens, geen layout-herziening (die volgt in F2/F3/F5).

**Gewijzigd:**
- `src/app/layout.tsx` — DM Sans/DM Serif Display → **Schibsted_Grotesk** (next/font)
- `src/styles/globals.css` — `--font-display`/`--font-body` → Schibsted Grotesk;
  `--bg` `#ffffff` → `#fbfaf7` (paper). `--surface` wit, dark-mode ongemoeid.
- `design-tokens.md` — font + paper tokens bijgewerkt

**Verifieren na deploy:** paywall-fade op gated artikelen/talks vervaagt naar paper
i.p.v. wit (correct zolang artikeltekst op pagina-achtergrond staat).

Zip: `md-f1-fonts-paper-2026-06-08.zip`. Deployed (`f6c995c`).

---

## F2.1–F2.3 — Catalog-chrome (batch 1+2+3) — 09-06-2026

Gecombineerde zip `md-f2-chrome-batch1-2-3-2026-06-09.zip`. Eén deploy voor volledige
F2 catalogus-look. Puur frontend.

**Batch 1:** `--ink`/`--on-ink` tokens; §F2.1 header/nav/paginatie zwart; Header sign-out icoon.
**Batch 2:** §F2.2 channelbar/filter/footer op paper; compacte page-header; telling in zoekbox;
articles op standaard channelbar-shell.
**Batch 3:** §F2.3 cards (FEATURED pill, sustainability badges, view-toggle 2/3/4 koloms);
`ViewToggle.tsx` nieuw; ContentCard/MaterialCard/ChannelBar updates.

`globals.css`: additief §F2.1–§F2.3 + ink tokens (niet blind overschreven).

Duurzaamheids-badges wachten op gevulde environmental-properties in WP (frontend klaar).

Zip deployed (`09cb085`).

---

## F2.4 — Dashboard-chrome (wit op canvas) batch 4 — 09-06-2026

Zip `md-f2-dashboard-2026-06-09.zip`. Dashboard in dezelfde taal als catalogus-chrome.

**Gewijzigd:**
- `src/styles/globals.css` — additief `§F2.4`: sidebar op paper, zwart actief nav-item,
  mobiele nav op paper, scoped `.btn-primary` ink in dashboard + sticky-footer.
- `src/components/dashboard/DashboardStickyFooter.tsx` — save-knop `btn-green` → `btn-primary`.

**Verifiëren na deploy:** sidebar op paper (geen witte box), actief item zwart; panels wit op
paper; primaire/save-knoppen zwart; teal/rood ongemoeid; mobiele nav zwart-actief.

Zip deployed pending.
