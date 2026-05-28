/**
 * BrandsSection — style-guide section voor de sessie-5-componenten (Brands).
 *
 * Toegevoegd in sessie 5 batch 4. Demonstreert de overzicht-component:
 *  - `<BrandTile>` — brand-kaart met banner + overlappend logo + meta
 *
 * De detail-componenten (`BrandDetailContactCard`, `BrandDetailInfoCard`,
 * `BrandMaterialsGrid`) zijn bewust NIET in de style-guide opgenomen: ze
 * hangen van `useAuth()` (AuthContext) en — bij de contact-card — van de
 * GetInTouchModal-flow. Die los in de style-guide mocken zou een
 * kunstmatige context vereisen die niet representatief is. Ze zijn te
 * zien op een echte brand-detail-pagina (`/brands/[slug]`).
 *
 * Mock-data only — geen echte data-laag. Logo's zijn SVG-data-URL
 * gradients zodat er geen externe assets nodig zijn.
 *
 * Inline styles alleen voor style-guide-layout (design-system §8
 * uitzondering 3). Component-styling zelf komt uit globals.css
 * (`.brand-tile*`, `.ov-grid-brands`).
 */

'use client'

import { BrandTile } from '@/components/ui'
import type { BrandListItem } from '@/types/brand'
import type { MediaImage } from '@/types/media'

// --------------------------------------------------------------------
// Mock data — alleen voor preview
// --------------------------------------------------------------------

function mockLogo(id: number, label: string, gradient: string): MediaImage {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
       <defs>
         <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">${gradient}</linearGradient>
       </defs>
       <rect width="200" height="200" fill="url(#g${id})"/>
     </svg>`.replace(/\s+/g, ' '),
  )
  const url = `data:image/svg+xml;charset=utf-8,${svg}`
  return {
    id,
    alt: label,
    caption: '',
    description: '',
    mimeType: 'image/svg+xml',
    sourceUrl: url,
    width: 200,
    height: 200,
    sizes: {
      thumbnail: { url, width: 150, height: 150, mimeType: 'image/svg+xml' },
      medium: { url, width: 200, height: 200, mimeType: 'image/svg+xml' },
      full: { url, width: 200, height: 200, mimeType: 'image/svg+xml' },
    },
    parentPostId: 0,
    menuOrder: id,
  }
}

const MOCK_BRANDS: BrandListItem[] = [
  {
    id: 8001,
    slug: 'obro-bv',
    link: '/brands/obro-bv',
    name: 'OBRO B.V.',
    excerptHtml:
      '<p>Specialists in leather-infused translucent composites for interior and architectural applications.</p>',
    logo: mockLogo(
      8001,
      'OBRO B.V.',
      '<stop offset="0" stop-color="#183E90"/><stop offset="1" stop-color="#4070B0"/>',
    ),
    country: 'Netherlands',
    city: 'Rotterdam',
    materialCount: 24,
    partner: true,
    featured: true,
  },
  {
    id: 8002,
    slug: 'fiber-werk',
    link: '/brands/fiber-werk',
    name: 'FiberWerk GmbH',
    excerptHtml:
      '<p>Biobased acoustic panels and hemp-fibre surfaces, engineered in Germany.</p>',
    logo: null,
    country: 'Germany',
    city: 'Munich',
    materialCount: 7,
    partner: false,
    featured: false,
  },
  {
    id: 8003,
    slug: 'studio-mineral',
    link: '/brands/studio-mineral',
    name: 'Studio Mineral',
    excerptHtml:
      '<p>Recycled-glass terrazzo and mineral composites for worktops and cladding.</p>',
    logo: mockLogo(
      8003,
      'Studio Mineral',
      '<stop offset="0" stop-color="#2E8C32"/><stop offset="1" stop-color="#3A9C38"/>',
    ),
    country: 'Italy',
    city: null,
    materialCount: 1,
    partner: false,
    featured: false,
  },
]

// --------------------------------------------------------------------
// Section
// --------------------------------------------------------------------

export function BrandsSection() {
  return (
    <section className="sg-section" id="brands" aria-labelledby="brands-heading">
      <div className="sg-section-header">
        <h2 id="brands-heading" className="t-display-md">
          Brands components
        </h2>
        <p className="t-body sg-section-desc">
          Sessie 5. De <code>&lt;BrandTile&gt;</code> voor het brand-overzicht:
          banner met overlappend logo, naam, locatie, twee-regelige
          omschrijving en het aantal materialen. De hele kaart is een link
          naar de brand-detailpagina. Graceful fallbacks voor ontbrekend logo
          (initialen) en ontbrekende locatie. De detail-componenten
          (contact-card, info-card, materials-grid) zijn auth-afhankelijk en
          alleen op een echte <code>/brands/[slug]</code>-pagina te zien.
        </p>
      </div>

      <div className="ov-grid-brands" style={{ maxWidth: 920 }}>
        {MOCK_BRANDS.map((brand) => (
          <BrandTile key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  )
}
