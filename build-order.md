# MaterialDistrict — Bouwvolgorde & Sessie-aanpak

## Werkwijze

Elke stap is een aparte Claude-sessie. Begin elke sessie door:
1. Dit bestand te uploaden (context over de bouwvolgorde)
2. Het session-log.md te uploaden (wat is al gebouwd)
3. De relevante bestanden te uploaden (project-brief, architecture-rules, membership-config)
4. Kort te vermelden welke stap je gaat uitvoeren

## Bouwvolgorde

### Stap 1 — Projectfundament
**Doel:** Werkend Next.js project met alle infrastructuur klaar.

Deliverables:
- `package.json` met correcte dependencies
- `next.config.ts` met image domains, CSP headers, redirects
- `src/styles/globals.css` — alle design tokens + basis component-klassen
- `src/lib/config/membership.ts` — centrale membership configuratie
- `src/types/` — TypeScript interfaces voor alle content-types
- `.env.local.example` — template voor API-credentials
- `src/app/layout.tsx` — root layout met header en footer

Vereisten bij start:
- WordPress REST API URL
- Authenticatie (app password of JWT)
- Overzicht custom post types

---

### Stap 2 — API verkennen & datamodel vastleggen
**Doel:** Alle API-koppelingen werkend, TypeScript interfaces kloppen met echte data.

Deliverables:
- `src/lib/api/wordpress.ts` — client voor alle WP endpoints
- `src/lib/api/woocommerce.ts` — client voor WC endpoints
- `src/lib/api/facetwp.ts` — client voor FacetWP
- Bijgewerkte TypeScript interfaces op basis van echte API-responses

Vereisten bij start:
- Werkende API-toegang
- Eén volledig materials-item via de API

---

### Stap 3 — Gedeelde componenten
**Doel:** Alle herbruikbare bouwstenen klaar voordat de pagina's gebouwd worden.

Deliverables:
- `Header.tsx` — navigatie, zoekbalk, cart, gebruikersmenu, dark mode toggle
- `Footer.tsx`
- `Button.tsx`, `Badge.tsx`, `Tag.tsx`
- `Card.tsx` — herbruikbaar voor meerdere content-types
- `ChannelBar.tsx` — universele navigatiebar voor overzichtspagina's
- `FilterSidebar.tsx` — koppeling aan FacetWP
- `Breadcrumb.tsx`
- `Skeleton.tsx` — loading states
- `EmptyState.tsx` — lege filterresultaten
- `InsiderBadge.tsx` — Insider-only indicator
- `InsiderGate.tsx` — upgrade-gate voor gated content

---

### Stap 4 — Materials
**Doel:** Meest complete en complexe sectie — bepaalt het patroon voor de rest.

Deliverables:
- `/materials` — overzichtspagina met ChannelBar, FilterSidebar via FacetWP, grid
- `/materials/[slug]` — detailpagina met gallery, video, specs, compare, sample request gate
- `MaterialCard.tsx`
- `CompareBar.tsx` — sticky vergelijkingsbalk
- Schema.org `Product` structured data
- `generateMetadata` per pagina

---

### Stap 5 — Brands
Deliverables:
- `/brands` — overzichtspagina
- `/brands/[slug]` — detailpagina met materialen van dit brand, contact

---

### Stap 6 — Articles
Deliverables:
- `/articles` — overzichtspagina
- `/articles/[slug]` — detailpagina met pub-layout, sidebar, gating voor Insider-only content
- Schema.org `Article`

---

### Stap 7 — Talks
Deliverables:
- `/talks` — overzichtspagina
- `/talks/[slug]` — detailpagina met video-integratie, speaker-profiel

---

### Stap 8 — Events
Deliverables:
- `/events` — overzichtspagina
- `/events/[slug]` — detailpagina met gallery, video, registratie-flow
- Schema.org `Event`

---

### Stap 9 — Books
Deliverables:
- `/books` — overzichtspagina
- `/books/[slug]` — detailpagina met WooCommerce-koppeling, add to cart, Insider-korting
- Schema.org `Book`

---

### Stap 10 — Homepage
Deliverables:
- `/` — homepage met hero, shortcuts, content-blokken, Insider CTA
- Hergebruikt alle componenten van voorgaande stappen

---

### Stap 11 — Algemene templates
Deliverables:
- `/login` — WordPress-authenticatie
- `/register` — registratie flow (discover / brand)
- `/membership` — Insider membership pagina
- `/about`, `/privacy` — statische pagina's vanuit WordPress
- `not-found.tsx` — 404 pagina
- `error.tsx` — 500 pagina
- `sitemap.ts` — automatisch gegenereerd
- `robots.ts` — correct geconfigureerd

---

### Stap 12 — Channel-hubs (`/channels` + `/channels/[slug]`)
**Doel:** Topic-hubs per channel (`theme`-taxonomie, 20 termen) die dwars door
alle content-types snijden — los van de in-place ChannelBar-filter.

Deliverables:
- `/channels` — index van alle channels (thumbnail + naam + description +
  telling), featured channels vooraan
- `/channels/[slug]` — gemengde cross-entity hub: hero (naam + description uit
  `/wp/v2/theme/{id}` + `theme_thumbnail`) + strips per type in topmenu-volgorde
  (Materials → Stories → Brands → Events → Talks; Books later), elk met een
  "bekijk alle … in {channel}"-deeplink naar het gefilterde overzicht
- SEO: unieke metadata + canonical per channel, BreadcrumbList + CollectionPage
  JSON-LD; `?channel=`-overzichten canonical naar het kale overzicht
- Hergebruikt `ChannelBar` / `getChannelCatalog` + de bestaande content-cards

Afhankelijkheid: materials-slice per channel via de FacetWP `theme`-facet
(zelfde als de materials-ChannelBar); overige types via `?theme=<term_id>`.

---

## Fase 2 — Dashboards (later)

Na afronding van alle publieke pagina's:

- `/dashboard` — persoonlijk dashboard (Insider)
- `/dashboard/brand` — brand dashboard
- Boards, saved searches, Insider insights
- Brand: materials beheer, statistieken, sample requests, featured placements
- Membership management (upgrade/downgrade)
- Invoices

---

## Sessie-log bijhouden

Na elke sessie: update `session-log.md` met:
- Welke bestanden zijn aangemaakt of gewijzigd
- Welke beslissingen zijn genomen
- Welke API-velden of structuren zijn ontdekt
- Openstaande vragen of issues
