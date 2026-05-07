# MaterialDistrict — Session Log

> Dit bestand wordt na elke sessie bijgewerkt.
> Upload dit bestand aan het begin van elke nieuwe sessie zodat de context bewaard blijft.

---

## Laatste update
Datum: 07-05-2026
Sessie: 3 — Gedeelde componenten ✅

---

## Projectstatus

| Stap | Status | Notities |
|---|---|---|
| 1. Projectfundament | ✅ Klaar | Next.js 16 + React 19, build groen, types groen |
| 2. API & datamodel | ✅ Klaar | Live data werkt, smoke test groen, types schoon |
| 3. Gedeelde componenten | ✅ Klaar | 14 componenten, smoke test groen, types schoon |
| 4. Materials | ⬜ Niet gestart | Volgende sessie. Bouwt op sessie 3 (FilterSidebar wrappen met FacetWP, Materials overzicht + detail) |
| 5. Brands | ⬜ Niet gestart | Klaar voor bouw, mits brand-gallery via attachments werkt |
| 6. Articles | ⬜ Niet gestart | Insider-only-meta moet nog ontsloten — sessie 6-blocker |
| 7. Talks | ⬜ Niet gestart | Talk-meta in handover ontbreekt — sessie 7-blocker |
| 8. Events | ⬜ Niet gestart | Klaar voor bouw |
| 9. Books | ⬜ Niet gestart | Books-CPT bestaat niet in plugin — gaat via WC-products |
| 10. Homepage | ⬜ Niet gestart | |
| 11. Algemene templates | ⬜ Niet gestart | Stripe/User-integratie in deze stap of vlak ervoor |

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
- `src/types/shared.ts` — basis WP-types (sessie 2: User onaangepast tot Stripe-integratie-sessie)
- `src/types/material.ts`, `brand.ts`, `article.ts`, `talk.ts`, `event.ts`, `book.ts`

### App
- `src/app/layout.tsx`, `src/app/page.tsx` (vervangen in sessie 2 door smoke test, opnieuw vervangen in sessie 3 door definitieve layout)

### Components (placeholders)
- `src/components/layout/Header.tsx`, `Footer.tsx` *(vervangen in sessie 3)*

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
- `src/lib/api/wordpress.ts`, `facetwp.ts`, `woocommerce.ts`, `mappers.ts`, `content.ts`, `index.ts`

### Utilities
- `src/lib/utils/material-properties.ts`

### App
- `src/app/page.tsx` — smoke test die OBRO live ophaalt

### Configuratie
- `.env.local.example` — uitgebreid met `WP_APP_USER`, `WC_*`

### Documentatie (los van codebase)
- `wp-rest-api-blockers.md`, `wp-rest-api-followup.md`

---

## Aangemaakte/gewijzigde bestanden (sessie 3)

### CSS uitbreidingen (`src/styles/globals.css`)
Sessie 1 heeft de basis-tokens en mockup-styles neergezet. Sessie 3 heeft de stylesheet aangevuld met component-specifieke regels die in sessie 1 nog ontbraken:
- `.btn`-varianten, `.icon-btn` met dark-mode aanpassingen
- `.badge.b-*` (b-green, b-amber, b-blue, b-red, b-gray)
- `.ct-tag.ct-*` (material, article, event, book, brand, member)
- `.insider-badge` met `.is-sm` modifier
- `.skeleton.skeleton-thumb/title/text/avatar` met shimmer-animatie
- `.empty-state` met icon, title, description, actions
- `.card`, `.card-thumb`, `.card-body`, `.card-brand`, `.card-title`, `.card-date`
- `.breadcrumbs`, `.bc-sep`, `.bc-last`
- `.insider-gate-card` (inline gate variant) en `.insider-modal-*`
- `.channel-bar` (sticky), `.channel-tab`, `.channel-pager`, `.channel-page-btn` met dark-mode contrast, `channel-tab-in` keyframe animatie
- `.uf-sidebar`, `.uf-header`, `.uf-section`, `.uf-option`, `.uf-checkbox`, `.uf-search`
- `.mob-filter-trigger`, `.mob-filter-backdrop` voor mobile filter drawer
- `.site-header`, `.header-nav`, `.header-nav a` (≠ `button`), `.header-actions`
- `.search-wrap`, `.header-search`
- `.cart-btn`, `.cart-badge`
- `.mobile-nav-backdrop`, `.mobile-nav-drawer`, `.mobile-nav-header`, `.mobile-nav-list`, `.mobile-nav-actions`, `.mobile-nav-item`
- `.hide-mobile`, `.show-mobile` responsive helpers
- `.site-footer` met dark-mode kleur (= header surface), `.footer-inner`, `.footer-col`, `.footer-title`, `.footer-link`, `.footer-tagline`, `.footer-eyebrow`, `.footer-newsletter`, `.footer-newsletter-note`, `.footer-contact`, `.footer-contact > a { display: block }`, `.footer-address` met `font-style: normal`, `.footer-socials`, `.footer-social-btn`, `.footer-bottom`, `.footer-legal-links`
- `.logo` (single SVG-wrapper, height 38px desktop / 32px mobile, `.wordmark { display: none }` op mobile, dark-mode `.wordmark path { fill: white }`)
- `.ov-wrap` (overzichts-layout 220px sidebar + 1fr content)
- `.ov-grid-2/3/4` (overzichts-grids met gap 20px)
- `.grid-2/3/4` (homepage-grids met gap 16px)

### UI-componenten — `src/components/ui/`
- `Button.tsx` — polymorf via discriminated union (button OF link OF div), 7 varianten (primary/outline/green/blue/member/danger/ghost), 3 maten (sm/md/lg), `loading`-state, `iconOnly` mode
- `Badge.tsx` — 5 varianten (green/amber/blue/red/gray)
- `Tag.tsx` — content-type-tags (material/article/event/book/brand/member), automatische label-generatie
- `InsiderBadge.tsx` — teal pill met diamant-icon, `size` prop
- `Skeleton.tsx` — variants `text` / `title` / `thumb` / `avatar`, optionele `width`/`height`, shimmer
- `EmptyState.tsx` — title, description, optionele icon en actions slot
- `Card.tsx` — compound component: `Card.Thumb`, `Card.Body`, `Card.Brand`, `Card.Title`, `Card.Date`. Drie modi via discriminated union (link via `href`, klikbaar via `onClick` + `ariaLabel`, statisch)
- `ChannelBar.tsx` — sticky tabs met paginated channels (default 6 per pagina), `DEFAULT_CHANNELS` (20 thema-kanalen) + `ALL_CHANNELS` constants, search-input rechts, dark-mode chevron-knoppen met juiste contrast, slide-in animatie alleen bij page-change (`key={page}` op viewport)
- `FilterSidebar.tsx` — accordion-secties via `sections`-prop, `searchable` per sectie, controlled `selected: FilterSelection`, optionele `onClearAll`, mobile drawer met backdrop + body-scroll-lock + close-button. **UI-only** — geen FacetWP-koppeling
- `InsiderGate.tsx` — twee modi via discriminated union: `mode="modal"` (overlay met focus-trap, ESC, body-scroll-lock) en `mode="inline"` (gated-article-card). Feature-presets: compare/download/sample/export/savedSearch/boards/article/custom. `ALL_INSIDER_FEATURES` constant met 8 items
- `icons/InsiderIcon.tsx` — sterketin-icoon (4-puntige ster) als InlineSVG-component
- `index.ts` — barrel met alle UI-exports inclusief types

### Layout-componenten — `src/components/layout/`
- `Breadcrumb.tsx` — array-API met `BreadcrumbItem[]`, `display:contents` op `<ol>`/`<li>` voor flatten, current page met `aria-current`
- `Header.tsx` — client component, props-driven (geen routing-coupling). Logo, hoofdnav (6 items), search overlay met focus-management/ESC/blur-close, action icons (search, bookmarks, boards, cart met badge), conditional Login/Dashboard/Insider knop op basis van isLoggedIn/isMember, dark-mode toggle, mobile drawer
- `Logo.tsx` — inline SVG met `<g class="mark">` (gestylde M + 25-jaar badge in groen/blauw/geel/teal) en `<g class="wordmark">` (MATERIAL DISTRICT. tekst). Op mobile <768px wordmark verborgen via CSS, dark mode wordmark wit via CSS
- `Footer.tsx` — server component, 5-koloms grid (1.8fr + 4×1fr), 4 link-arrays + contact + socials, optionele `onNewsletterSubmit` callback (laadt dan `ClientNewsletterForm`)
- `ClientNewsletterForm.tsx` — alleen geladen wanneer Footer een onSubmit krijgt, houdt Footer als pure server component
- `HeaderShell.tsx` — client wrapper die Header voedt met `usePathname` (currentSection), `useTheme`, `useAuth`, `useRouter` voor callbacks. Loose coupling
- `index.ts` — barrel uitgebreid

### Providers — `src/components/providers/`
- `ThemeProvider.tsx` — context met theme/setTheme/toggleTheme, persisteert naar localStorage `'md-theme'`, leest initial van `<html data-theme>` (door inline script gezet)
- `AuthContext.tsx` — **mock voor sessie 3**. State: isLoggedIn, isMember, user. signIn(asMember?), signOut(). Wordt in sessie 4 vervangen door echte WordPress JWT/MemberPress integratie
- `index.ts` — barrel

### App
- `src/app/layout.tsx` — vervangen. `<body className="app-shell">`, ThemeProvider > AuthProvider > HeaderShell + main + Footer. Inline themeInitScript in `<head>` tegen FOUC (leest localStorage of prefers-color-scheme), `suppressHydrationWarning` op `<html>`
- `src/app/mock/page.tsx` — smoke-test pagina `/mock` met alle componenten samen. Te verwijderen of vervangen in sessie 4

### Public assets
- `public/material-district-logo.svg` — officiële MaterialDistrict-logo asset (mark + wordmark + 25-jaar badge), voor og:image, social sharing, favicon-generatie

### Utilities
- `src/lib/utils/cn.ts` — class-name combiner (truthy filter + space-join)

### Dependencies
- `lucide-react@^0.541.0` toevoegen aan package.json

---

## API-bevindingen (sessie 2 verificatie)

*(Ongewijzigd t.o.v. vorige versie — zie eerdere sectie hieronder voor referentie.)*

### Endpoints die werken (geverifieerd live)
- `GET /wp/v2/material` ✅, `GET /wp/v2/material/<id>` ✅, `GET /wp/v2/material?slug=<slug>` ✅
- `GET /wp/v2/media?parent=<post_id>` ✅
- `GET /facetwp/v1/fetch` (config-based, niet live getest)

### Endpoints die werken na developer-commit `0d8c923`
- `GET /wp/v2/brand` ✅, `GET /wp/v2/article` ✅, `GET /wp/v2/event` ✅, `GET /wp/v2/talk` ✅

### Niet bestaand
- `GET /wp/v2/book` — Books gaan via WooCommerce-products

### Datamodel-keuzes (sessie 2)
- `meta.samples_available` wordt genegeerd tot alias gefixt is
- `meta.gallery` wordt genegeerd, gallery komt uit `/wp/v2/media?parent=<id>`
- Underscore-velden niet getypt in Material-meta — alleen frontend-aliassen
- Eigenschap-taxonomieën via `class_list` parsing
- Image-sizes geverifieerd, alt-texts vaak leeg, `menu_order` valt terug op upload-datum

### FacetWP — niet geverifieerd live
Wordt ondervangen in sessie 4.

---

## Membership-architectuur (sessie 2 — uitleg ontvangen)

*(Ongewijzigd — zie originele tekst in oude versie van log voor 6 deelvragen.)*

Twee onafhankelijke systemen:
1. **Insider** (user-based) — `free`/`insider`, € 10/mnd of € 100/jr ex BTW
2. **Manufacturer** (brand-based) — `free`/`basis`/`plus`/`partner`, alleen jaarabonnementen

Stripe is bron van waarheid, WP synct status terug. Frontend praat met WP, niet rechtstreeks met Stripe. User-types blijven in sessie 1-vorm tot een aparte mini-sessie vlak voor sessie 11.

---

## Beslissingen & keuzes

### Sessie 1
1. Mockup is leidend boven `design-tokens.md`.
2. Fonts: DM Serif Display + DM Sans.
3. Radius: 6 / 8 / 12 px.
4. Insider-badge kleur geharmoniseerd naar `var(--ct-member)`.
5. Next.js 16 + React 19 stable.
6. Header/Footer als placeholders in sessie 1.
7. Tijdelijke homepage met smoke-test.
8. Geen Tailwind, geen CSS-modules.

### Sessie 2
9. Pauze tot WP-developer REST API uitbreidde.
10. `?_embed=1` blijkt door één van de fetchers gestript te worden.
11. Drielaagse data-architectuur (raw → mappers → domain).
12. Optionele relation-resolves op high-level functies.
13. Gallery-strategie: `featured_media` als hero, rest via `/wp/v2/media?parent=<id>`.
14. `samples_available` alias wordt genegeerd tot fix.
15. `getMaterial(slug, options)` in `content.ts` orchestreert fetch + resolves.
16. Books gaan via WooCommerce.
17. Stripe is bron van waarheid, WP synct status terug.
18. User-types blijven in sessie 1-vorm tot mini-sessie.
19. `membership-config.md` heeft een update nodig (€ 100/jr).

### Sessie 3
20. **`cn()` helper i.p.v. `clsx`** — eenvoudige truthy-filter, geen extra dependency
21. **Polymorfe Button via discriminated union** — `as="button" | "link" | "div"`. Type-veilig zonder runtime-checks; elke mode dwingt zijn eigen vereiste props af
22. **Card als compound component** — `Card.Thumb` / `Card.Body` / `Card.Brand` / `Card.Title` / `Card.Date`. Flexibele samenstelling zonder dat de parent alle inhoud als props doorgeeft
23. **InsiderGate met feature-presets** — 8 hardcoded `ALL_INSIDER_FEATURES`. Modal- en inline-variant via discriminated union. Gate-component is wrapper, business-logic (heeft user toegang?) blijft in de parent
24. **FilterSidebar UI-only** — geen FacetWP-koppeling. Sessie 4 maakt een wrapper (`MaterialFilterSidebar.tsx` of vergelijkbaar) die FacetWP-state beheert en deze pure UI-component voedt
25. **ChannelBar pageSize default 6** — paste niet altijd met 8 lange labels (Healing Environment, Sense & Sensibility) bij beschikbare viewport-breedte
26. **ChannelBar viewport `flex: 0 0 auto`** — zorgt dat rechter chevron-knop direct na de laatste tab staat, niet aan de search-divider geplakt. Search-balk staat altijd rechts via `margin-left: auto` op `.channel-search-wrap`
27. **Header — loose coupling van routing** — `currentSection` als prop (niet via `usePathname()`). `HeaderShell.tsx` doet die binding, zodat `Header` zelf testbaar/herbruikbaar is zonder Next.js context
28. **Footer als server component** — geen state, geen JS. `onNewsletterSubmit` callback maakt 'm impliciet client; opgelost door `ClientNewsletterForm.tsx` als losse client-component die alleen wordt geladen wanneer de callback aanwezig is
29. **Logo als inline SVG-component** — `<g class="mark">` en `<g class="wordmark">` zodat CSS de wordmark kan inverteren in dark mode en verbergen op mobile. Origineel SVG-bestand ook in `public/` voor og:image en social sharing
30. **ThemeProvider met FOUC-script** — inline script in `<head>` zet `data-theme` vóór React hydrateert. Leest localStorage met fallback op `prefers-color-scheme`
31. **AuthContext is mock** — pure client-state voor sessie 3 smoke-test. In sessie 4 vervangen door echte provider die WP JWT-cookie leest, `/api/me` aanroept, en SSR-veilig hydrateert
32. **Footer dark-mode kleur = header surface (`var(--surface)`)** — eerdere varianten (zwart, gedempt blauw) gaven onsamenhangend ontwerp. Header en footer hebben nu dezelfde tint, content donkerder ertussen, border-top voor scheiding
33. **`.app-shell`** met `min-height: 100vh` + `display: flex; flex-direction: column`, zodat footer onderaan blijft bij weinig content. `<main>` heeft `flex: 1`
34. **`.ov-wrap` is top-level layout** — niet binnen een outer max-width wrapper plaatsen. Breadcrumb + page-title staan in een eigen wrapper boven `.ov-wrap`. Anders krimpt de content-area door dubbele padding

---

## Openstaande vragen

### Aan WP-developer (zie `wp-rest-api-followup.md`)
1. `samples_available` alias omdraaien naar `disable_sample_request`
2. Wat doet `meta.gallery` op material? — frontend gebruikt het niet
3. Brand-admin gallery-uploader — bevestigen dat dit werkt
4. Insider-only meta-veld op article — voor sessie 6
5. Talk-meta — voor sessie 7

### Aan opdrachtgever
6. **WC-categorie-slug voor books** — `'books'`, `'boek'`, of anders? *(voor sessie 9)*
7. **WordPress applicatiewachtwoord** voor de Next.js-frontend
8. **WooCommerce consumer key + secret**
9. **Deployment-doel** — Vercel of eigen server?
10. **Git repository URL**
11. **Staging-omgeving**
12. **Stripe/membership-vragen** — 6 deelvragen, niet urgent voor sessie 4

### Onderhoud (eigenstandig)
13. **`membership-config.md` bijwerken** met Insider jaarabonnement (€ 100/jr ex BTW)
14. **`/mock` page verwijderen** — dit is een sessie-3 smoke-test die in sessie 4 weg kan, of vervangen door echte materials-overzicht

---

## Bekende issues
*Geen blokkerende issues.*

### Open visuele/UX-punten uit sessie 3 (door gebruiker te leveren)
De gebruiker heeft tijdens de smoke-test review nog enkele kleine visuele/UX-punten genoteerd die niet in sessie 3 zijn doorgevoerd vanwege tijdsdruk. Deze worden **als eerste** opgepakt aan het begin van sessie 4, vóór het werk aan de Materials overzichtspagina begint. De punten zelf staan nog niet in dit log — gebruiker levert ze aan bij start sessie 4.

---

## Sessiegeschiedenis

### Sessie 0 — Voorbereiding (07-05-2026)
Projectdocumenten, membership-config, design tokens.

### Sessie 1 — Projectfundament (07-05-2026) ✅
Volledige projectstructuur, Next.js 16 + React 19, `globals.css`, alle TS-types, Header/Footer placeholders, smoke test. Build groen.

### Sessie 2 — API & datamodel (07-05-2026) ✅
WP REST API verkenning, pauze tot developer-commit, daarna drielaagse architectuur, 8 nieuwe TS-bestanden, FacetWP-client, smoke test op `/`. TypeScript schoon. Membership-uitleg ontvangen.

### Sessie 3 — Gedeelde componenten (07-05-2026) ✅

**Aanpak:** Batch-gewijze opbouw met preview + review per batch. Mockup als visuele referentie, `globals.css` uit sessie 1 als CSS-fundament.

**Batches:**
- A — `globals.css` uitbreiden met component-CSS
- B — Atomaire UI-primitives (Button, Badge, Tag, InsiderBadge, Skeleton, EmptyState, InsiderIcon)
- C — Compound primitives (Card, Breadcrumb)
- D — InsiderGate (modal + inline modus, focus trap, body scroll lock)
- E — ChannelBar + FilterSidebar
- F — Header + Footer + Logo (officieel logo asset toegevoegd in `public/`)
- G — Finale tussenstand: providers (ThemeProvider, AuthContext), HeaderShell, layout.tsx update, smoke-test pagina `/mock`

**Werkflow per batch:** TypeScript schrijven → `npx tsc --noEmit` schoon → preview HTML met ingebedde CSS → Playwright screenshots op 1440px en mobile (~600-800px) → review → fixes → opnieuw screenshot. Light en dark mode op meerdere punten gevalideerd.

**Resultaat:** 14 React-componenten + 2 providers + 1 wrapper + 1 helper + 1 smoke-test page + ~300 regels CSS toegevoegd. Alle componenten typecheck-schoon onder strict mode. Smoke-test rendert alle componenten samen op één pagina (light + dark, desktop + mobile).

**Belangrijkste reviewpunten** (kort):
- ChannelBar — chevron-contrast in dark mode, rechter chevron bij tabs niet bij search, pageSize naar 6, slide-in animatie alleen bij page-change
- FilterSidebar — header `min-height: 44px` zodat hij niet schokt bij verschijnen Clear-knop
- Footer — email/telefoon op aparte regels, adres niet cursief, dark-mode kleur = `var(--surface)` (gelijk aan header)
- Logo — vervangen placeholder hexagon door officiële MaterialDistrict 25-jarig logo asset
- Smoke-test — `.ov-wrap` correct positioneren als top-level layout (niet binnen outer wrapper), `.grid-3` als helper-class toevoegen aan globals

---

## Volgende sessie — Stap 4: Materials

### Doel
Materials overzichtspagina + detailpagina, FacetWP-koppeling activeren.

### Vereisten bij start
- Sessie 3 is afgerond ✅
- Geen technische blockers — alle bouwstenen klaar
- Bij voorkeur: developer-bevestiging op `wp-rest-api-followup.md`

### Eerste taken in sessie 4
0. **Open punten uit sessie 3 afhandelen** — gebruiker heeft een lijst kleine visuele/UX-aanpassingen die niet in sessie 3 zijn afgewerkt vanwege tijdsdruk. Deze worden als eerste gedaan voordat het werk aan Materials begint.
1. **`MaterialFilterSidebar.tsx`** (of vergelijkbare wrapper) — verbindt de pure `FilterSidebar` UI-component met FacetWP-state. Beheert URL-syncing (filters in querystring), debounced fetches via `fetchMaterials`, count-updates per facet
2. **Materials overzichtspagina** — `/materials/[[...slug]]` met integratie van `ChannelBar` (met `MATERIAL_CHANNELS`), de gewrapte FilterSidebar, en een `OverviewGrid` van Cards
3. **Materials detailpagina** — `/materials/[slug]` met gallery, properties (uit `class_list`-parser), brand-link, sample-request-knop
4. **`AuthProvider` upgraden** — vervang mock door echte WP-integratie (cookie reading, `/api/me`-fetch, SSR-veilige hydratie)
5. **Newsletter form** — vervang `/api/newsletter` placeholder door Server Action

### Aanbevolen aanpak
- Open een nieuwe Claude-sessie met dit log + `architecture-rules.md` + `MaterialDistrict_MockUp_DEF.html` + `globals.css` (uit codebase) + sessie-3 componenten (uit codebase)
- Begin met FacetWP-wrapper om FilterSidebar
- Daarna overzichtspagina, dan detailpagina
- Insider-gating op sample-request via bestaande `InsiderGate`-component

### Verwijderen of vervangen in sessie 4
- `/mock` page (sessie-3 smoke-test) — verwijderen zodra echte pages er zijn
- `AuthContext.tsx` mock — vervangen door echte provider
- Newsletter form `action="/api/newsletter"` — vervangen door Server Action
