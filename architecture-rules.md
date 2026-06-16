# MaterialDistrict — Architecture Rules

> Deze regels zijn niet onderhandelbaar en worden vanaf dag één toegepast in elke sessie.

## Stijlen

### Één centraal stylesheet
- Alle stijlen in `src/styles/globals.css`
- Geen inline styles, behalve `style="--custom-property: value"` voor dynamische waarden
- Geen component-scoped CSS modules die het visuele systeem fragmenteren
- Geen Tailwind of andere utility-frameworks — eigen klassen op basis van de design tokens

### Design tokens als CSS custom properties
Alle tokens gedefinieerd in `:root` in `globals.css`. Nooit hardcoded waarden in components.

```css
/* Voorbeeld — volledige lijst in design-tokens.md */
:root {
  --color-navy: #0D2F4E;
  --color-navy-light: #1A4B6E;
  --spacing-4: 1rem;
  --radius-md: 8px;
}
```

### Dynamische waarden
Items met unieke visuele waarden (gradient per materiaal, kleur per brand) gaan via een CSS custom property op het element zelf:

```tsx
// GOED
<div style={{ '--item-color': material.gradient } as React.CSSProperties} className="mat-card" />

// FOUT
<div style={{ background: material.gradient }} />
```

### Klassen, geen stijlen
Componenten krijgen klassen mee. De stylesheet bepaalt het uiterlijk.

```tsx
// GOED
<button className="btn btn-primary btn-lg">Klik hier</button>

// FOUT  
<button style={{ background: '#0D2F4E', color: 'white', padding: '0 28px', height: '46px' }}>Klik hier</button>
```

---

## Mappenstructuur

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Publieke routes
│   │   ├── materials/
│   │   │   ├── page.tsx        # Overzicht
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Detail
│   │   ├── brands/
│   │   ├── articles/
│   │   ├── talks/
│   │   ├── events/
│   │   ├── books/
│   │   └── page.tsx            # Homepage
│   ├── (auth)/                 # Login, register
│   ├── (dashboard)/            # Dashboard routes (Fase 2)
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Generieke UI-componenten
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ChannelBar.tsx
│   │   ├── FilterSidebar.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Breadcrumb.tsx
│   ├── materials/              # Sectie-specifieke componenten
│   ├── brands/
│   └── ...
├── lib/
│   ├── api/
│   │   ├── wordpress.ts        # WordPress REST API client
│   │   ├── woocommerce.ts      # WooCommerce REST API client
│   │   └── facetwp.ts          # FacetWP REST client
│   ├── config/
│   │   └── membership.ts       # CENTRALE membership config (zie membership-config.md)
│   └── utils/
├── styles/
│   └── globals.css             # ENIGE stylesheet — design tokens + alle klassen
└── types/
    ├── material.ts
    ├── brand.ts
    ├── article.ts
    └── ...
```

---

## Components

### Herbruikbaar en stijl-agnostisch
```tsx
// Button component — props bepalen gedrag, klassen bepalen uiterlijk
interface ButtonProps {
  variant?: 'primary' | 'outline' | 'blue' | 'green' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props}>
      {children}
    </button>
  )
}
```

### Server Components als standaard
```tsx
// Standaard: Server Component (geen 'use client')
export default async function MaterialsPage() {
  const materials = await getMaterials() // server-side fetch
  return <MaterialGrid materials={materials} />
}

// Alleen 'use client' als interactiviteit nodig is
'use client'
export function FilterSidebar({ onFilter }: FilterSidebarProps) {
  const [open, setOpen] = useState(false)
  // ...
}
```

---

## Data & API

### WordPress REST API
```ts
// lib/api/wordpress.ts
const WP_BASE = process.env.WP_API_URL // in .env.local

export async function getMaterials(params?: MaterialsParams) {
  const url = new URL(`${WP_BASE}/wp/v2/materials`)
  // params toevoegen...
  const res = await fetch(url, { next: { revalidate: 3600 } })
  return res.json()
}
```

### FacetWP (legacy — alleen `/materials` property-filters)

FacetWP wordt **niet uitgebreid** voor nieuwe features; zie `docs/facetwp-phase-out-policy.md`.
Nieuwe filters, relatie-queries en archieven: **eigen WP REST** of **`/md/v2/`-endpoints**.

```ts
// lib/api/facetwp.ts — alleen voor bestaand /materials-filtergrid + channel→theme
export async function getFacetedMaterials(facets: Record<string, string[]>) {
  const res = await fetch(`${WP_BASE}/facetwp/v1/fetch`, {
    method: 'POST',
    body: JSON.stringify({ action: 'fetch', data: { facets } })
  })
  return res.json()
}

// Voorbeeld nieuw werk (geen FacetWP): brand-materials
// GET /wp/v2/material?brand_id=<id> — zie listMaterials() / listMaterialsByBrand()
```

### Credentials
```
# .env.local — NOOIT in git
WP_API_URL=https://materialdistrict.com/wp-json
WP_APP_PASSWORD=...
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
```

---

## WordPress data model

Classificatie en filtering (channels, story types, material categories, event
types, product tags, …) lopen via **WordPress taxonomies**, niet via `post_meta`.
Taxonomy-queries (`tax_query`) zijn op grote catalogi veel performanter dan
`meta_query`.

Zie `materialdistrict-plugin/docs/taxonomy-over-post-meta.md`.

REST-responses mogen afgeleide taxonomy-velden onder `meta.*` tonen (bv.
`meta._story_type`) — dat is geen meta-opslag, maar een convenience voor de
frontend-mapper.

---

## Metadata & SEO

```tsx
// Elke pagina krijgt generateMetadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const material = await getMaterial(params.slug)
  return {
    title: `${material.name} | MaterialDistrict`,
    description: material.description,
    openGraph: {
      title: material.name,
      images: [material.image],
    },
    alternates: {
      canonical: `https://materialdistrict.com/materials/${params.slug}`,
    },
  }
}
```

---

## Responsiveness

- Mobile-first: alle CSS begint vanuit het kleinste scherm
- Breakpoints uitsluitend via CSS custom properties uit globals.css
- Touch targets minimaal 44×44px
- Filters, navigatie en galleries werken volledig op mobiel

```css
/* globals.css — breakpoints */
:root {
  --bp-mobile: 768px;
  --bp-tablet: 1024px;
  --bp-desktop: 1280px;
}

@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```
