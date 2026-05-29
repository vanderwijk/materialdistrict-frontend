/**
 * MaterialsSection — style-guide section voor de sessie-4-componenten.
 *
 * Toegevoegd in sessie 4 batch 4. Demonstreert de vier nieuwe componenten:
 *  - `<MaterialCard>` — wrapper rond ContentCard met Save/Compare overlay
 *  - `<CompareBar>` — sticky bottom-bar met slots
 *  - `<MaterialGallery>` — hero + filmstrip voor detail-pagina
 *
 * Deze sectie is bewust local-state-based (eigen CompareProvider) zodat de
 * style-guide los staat van een echte data-laag. In productie zit de
 * Provider in `/materials/layout.tsx` en delen alle pages dezelfde state.
 *
 * Inline styles waar nodig conform design-system §8 uitzondering 3
 * (style-guide page-specifieke layout-tweaks). De daadwerkelijke
 * component-styling komt uit globals.css / globals-additions.css.
 */

'use client'

import { CompareBar, MaterialCard } from '@/components/ui'
import { MaterialGallery } from '@/components/materials'
import { CompareProvider } from '@/lib/hooks/useCompare'
import type { MaterialListItem, MaterialProperties } from '@/types/material'
import type { Gallery, MediaImage } from '@/types/media'

// --------------------------------------------------------------------
// Mock data — alleen voor preview
// --------------------------------------------------------------------

/**
 * Bouwt een MediaImage-stub met een data-URL voor de gradient als
 * source. In productie komt dit uit de WP REST media-response.
 */
function mockMedia(id: number, label: string, gradient: string): MediaImage {
  // SVG-data-URL met een gradient — geen externe asset nodig in style-guide
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
       <defs>
         <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">${gradient}</linearGradient>
       </defs>
       <rect width="600" height="400" fill="url(#g${id})"/>
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
    width: 600,
    height: 400,
    sizes: {
      thumbnail: { url, width: 320, height: 200, mimeType: 'image/svg+xml' },
      medium: { url, width: 600, height: 400, mimeType: 'image/svg+xml' },
      medium_large: {
        url,
        width: 768,
        height: 512,
        mimeType: 'image/svg+xml',
      },
      large: { url, width: 960, height: 640, mimeType: 'image/svg+xml' },
      full: { url, width: 2000, height: 1333, mimeType: 'image/svg+xml' },
    },
    parentPostId: 0,
    menuOrder: id,
  }
}

const MOCK_MATERIALS: MaterialListItem[] = [
  {
    id: 9001,
    slug: 'recycled-glass-composite',
    link: '/materials/recycled-glass-composite',
    title: 'Recycled Glass Composite',
    excerptHtml: '<p>A translucent panel made from 100% post-consumer glass.</p>',
    hero: mockMedia(
      9001,
      'Recycled Glass Composite',
      '<stop offset="0" stop-color="#88a800"/><stop offset="1" stop-color="#4a5800"/>',
    ),
    properties: ({
      glossiness: 'semi-gloss',
      translucence: 'translucent',
      structure: 'closed',
      texture: 'medium',
      hardness: 'hard',
      temperature: 'cool',
      acoustics: 'moderate',
      odeur: 'none',
      weight: 'medium',
      fire_resistance: 'good',
      uv_resistance: 'good',
      weather_resistance: 'good',
      scratch_resistance: 'good',
      chemical_resistance: 'good',
      renewable: 'partial',
    } as unknown as MaterialProperties),
    brandName: 'Eternit',
    brandId: 1,
    brandSlug: 'eternit',
    brandCountry: 'Belgium',
    materialCode: null,
    featured: false,
    date: '2024-08-12T10:00:00',
    modified: '2024-08-12T10:00:00',
    publication: {
      isOnline: true,
      source: 'tier_slot',
      validUntil: null,
      isPlaceholder: false,
    },
  },
  {
    id: 9002,
    slug: 'biobased-acoustic-panel',
    link: '/materials/biobased-acoustic-panel',
    title: 'Biobased Acoustic Panel',
    excerptHtml: '<p>Hemp-fibre acoustic panel for interior partitioning.</p>',
    hero: mockMedia(
      9002,
      'Biobased Acoustic Panel',
      '<stop offset="0" stop-color="#dce8f8"/><stop offset="1" stop-color="#4070b0"/>',
    ),
    properties: ({
      glossiness: 'matt',
      translucence: 'opaque',
      structure: 'open',
      texture: 'coarse',
      hardness: 'soft',
      temperature: 'warm',
      acoustics: 'good',
      odeur: 'low',
      weight: 'light',
      fire_resistance: 'medium',
      uv_resistance: 'low',
      weather_resistance: 'low',
      scratch_resistance: 'low',
      chemical_resistance: 'medium',
      renewable: 'yes',
    } as unknown as MaterialProperties),
    brandName: 'OBRO B.V.',
    brandId: 2,
    brandSlug: 'obro-bv',
    brandCountry: 'Netherlands',
    materialCode: null,
    featured: true,
    date: '2024-09-01T10:00:00',
    modified: '2024-09-01T10:00:00',
    publication: {
      isOnline: true,
      source: 'tier_slot',
      validUntil: null,
      isPlaceholder: false,
    },
  },
  {
    id: 9003,
    slug: 'translucent-pvc-sheet',
    link: '/materials/translucent-pvc-sheet',
    title: 'Translucent PVC Sheet',
    excerptHtml: '<p>Pigmented PVC sheet with bio-resin matrix.</p>',
    hero: mockMedia(
      9003,
      'Translucent PVC Sheet',
      '<stop offset="0" stop-color="#f4e9d8"/><stop offset="1" stop-color="#7a5e30"/>',
    ),
    properties: ({
      glossiness: 'glossy',
      translucence: 'transparent',
      structure: 'closed',
      texture: 'fine',
      hardness: 'medium',
      temperature: 'medium',
      acoustics: 'poor',
      odeur: 'none',
      weight: 'light',
      fire_resistance: 'low',
      uv_resistance: 'medium',
      weather_resistance: 'medium',
      scratch_resistance: 'medium',
      chemical_resistance: 'high',
      renewable: 'no',
    } as unknown as MaterialProperties),
    brandName: 'OBRO B.V.',
    brandId: 2,
    brandSlug: 'obro-bv',
    brandCountry: 'Netherlands',
    materialCode: null,
    featured: false,
    date: '2024-07-20T10:00:00',
    modified: '2024-07-20T10:00:00',
    publication: {
      isOnline: true,
      source: 'tier_slot',
      validUntil: null,
      isPlaceholder: false,
    },
  },
]

const MOCK_GALLERY: Gallery = {
  hero: mockMedia(
    9101,
    'Recycled Glass Composite hero',
    '<stop offset="0" stop-color="#88a800"/><stop offset="1" stop-color="#4a5800"/>',
  ),
  thumbs: [
    mockMedia(
      9102,
      'Texture detail',
      '<stop offset="0" stop-color="#d8d0b8"/><stop offset="1" stop-color="#b4a878"/>',
    ),
    mockMedia(
      9103,
      'Application example',
      '<stop offset="0" stop-color="#b8c8d8"/><stop offset="1" stop-color="#7898b8"/>',
    ),
    mockMedia(
      9104,
      'Edge profile',
      '<stop offset="0" stop-color="#d8b8c8"/><stop offset="1" stop-color="#b878a8"/>',
    ),
    mockMedia(
      9105,
      'Cross-section',
      '<stop offset="0" stop-color="#c8b8d8"/><stop offset="1" stop-color="#a878d8"/>',
    ),
  ],
  total: 5,
}

// --------------------------------------------------------------------
// Section
// --------------------------------------------------------------------

export function MaterialsSection() {
  // CompareBar zit hier in een eigen Provider zodat de style-guide los
  // werkt van de productie-pages.
  return (
    <CompareProvider>
      <section
        className="sg-section"
        id="materials"
        aria-labelledby="materials-heading"
      >
        <div className="sg-section-header">
          <h2 id="materials-heading" className="t-display-md">
            Materials components
          </h2>
          <p className="t-body sg-section-desc">
            De vier componenten die in sessie 4 zijn toegevoegd voor de
            material-overzichts- en detailpagina&apos;s.{' '}
            <code>{'<MaterialCard>'}</code> wrappt <code>{'<ContentCard>'}</code>;{' '}
            <code>{'<CompareBar>'}</code> deelt state met de cards via{' '}
            <code>useCompare()</code>.
          </p>
        </div>

        {/* MaterialCard + CompareBar — live interactief */}
        <h3 className="t-display-xs sg-subsection-title">
          MaterialCard + CompareBar
        </h3>
        <p className="t-body-sm sg-subsection-desc">
          Klik op de Compare-knop in een card om dat material aan de
          CompareBar onderaan toe te voegen. Max 3 tegelijk; daarna verschijnt
          een limit-banner (niet zichtbaar in deze section-preview, wel op de
          echte page). Save-knop toont een visuele toggle — zonder
          back-end persistence in v1.
        </p>
        <p className="t-body-sm sg-subsection-desc">
          In deze preview is de gebruiker simuleert als{' '}
          <strong>ingelogd + Insider</strong> zodat alle gating uitstaat. Op de
          live page komen <code>isLoggedIn</code> en <code>isMember</code> uit{' '}
          <code>useAuth()</code>.
        </p>
        <div className="sg-preview is-grid-3 is-tinted">
          {MOCK_MATERIALS.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              isLoggedIn
              isMember
              onRequireSignIn={() =>
                console.info('[style-guide] sign-in required')
              }
              onRequireInsider={() =>
                console.info('[style-guide] insider gate triggered')
              }
              onToggleSave={(id) =>
                console.info('[style-guide] save toggled', id)
              }
              onCompareLimitReached={() =>
                console.info('[style-guide] compare limit reached')
              }
            />
          ))}
        </div>
        <p className="t-body-sm sg-subsection-desc" style={{ marginTop: 8 }}>
          De CompareBar zelf zit normaal onderaan de viewport — in de
          style-guide kun je hem hieronder rendered zien zodra je een material
          toevoegt.
        </p>

        {/* MaterialGallery */}
        <h3
          className="t-display-xs sg-subsection-title"
          style={{ marginTop: 32 }}
        >
          MaterialGallery (detail-page)
        </h3>
        <p className="t-body-sm sg-subsection-desc">
          Hero + filmstrip. Klik op een thumb om die de actieve hero te maken.
          Bij meer dan 5 thumbs krijgt de laatste een <code>+N</code>-overlay.
          Gebruikt de bestaande <code>.mat-gallery-*</code> klassen uit{' '}
          <code>globals-additions.css</code>.
        </p>
        <div className="sg-preview is-tinted" style={{ maxWidth: 600 }}>
          <MaterialGallery gallery={MOCK_GALLERY} title="Recycled Glass Composite" />
        </div>

        <CompareBar />
      </section>
    </CompareProvider>
  )
}
