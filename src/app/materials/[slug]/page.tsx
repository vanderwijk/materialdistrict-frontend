/**
 * /materials/[slug] — material detail page
 *
 * Sessie 4 part 2 — herstructurering volgens mockup.
 *
 * Layout (zie mockup `renderMaterialDetail()`):
 *   ┌─── DetailHeader (back, tag, h1, meta, actions) ────────────────┐
 *   ├─── 2-koloms wrap (.mat-detail-wrap) ───────────────────────────┤
 *   │  Left (1.4fr)                       │  Right sidebar (1fr)     │
 *   │  ─ Gallery (hero + filmstrip)       │  ─ GetInTouchCard        │
 *   │  ─ Excerpt / body prose             │  ─ Material details      │
 *   │  ─ Material properties (3 grps)     │  ─ DownloadsCard         │
 *   │  ─ VideosSection                    │                          │
 *   │  ─ KeywordsSection                  │                          │
 *   │  ─ PrevNext nav                     │                          │
 *   │  ─ SampleRequestForm anchor         │                          │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Data (sessie 6 — performance):
 *  - `getMaterialDetail(slug)` voor hoofd-content + keywords in één
 *    parallelle orchestratie (gallery + brand-naam + tag-terms).
 *  - `getMaterial(slug, { resolve: { gallery: false } })` in
 *    `generateMetadata` — lichtgewicht variant voor metadata. Beide
 *    calls hitten dezelfde WP-endpoint voor de raw material en delen
 *    daardoor Next.js' fetch-cache.
 *
 * Geparkeerd tot Johan brand-data levert:
 *  - Brand-info-card in sidebar
 *  - "More from Brand" related-grid onder de page
 *
 * Prev/Next: client-side via /api/materials/list-light + sessionStorage
 *   filter-context (zie PrevNextNavigation).
 *
 * Back-link: client-side, leest dezelfde filter-context (zie
 *   MaterialDetailBackLink).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { MaterialGallery } from '@/components/materials'
import { getMaterial, getMaterialDetail } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildProduct } from '@/lib/seo'
import {
  getAllPropertyGroups,
  humanizeFacet,
  toMaterialTags,
} from '@/lib/utils/material-properties'
import { MaterialDetailActions } from './_components/MaterialDetailActions'
import { MaterialDetailBackLink } from './_components/MaterialDetailBackLink'
import { GetInTouchCard } from './_components/GetInTouchCard'
import { DownloadsCard } from './_components/DownloadsCard'
import { VideosSection } from './_components/VideosSection'
import {
  KeywordsSection,
  type KeywordEntry,
} from './_components/KeywordsSection'
import { PrevNextNavigation } from './_components/PrevNextNavigation'
import { BrandInfoCard } from './_components/BrandInfoCard'
import { MoreFromBrand } from './_components/MoreFromBrand'
import { MaterialBody } from './_components/MaterialBody'
import { RecentlyViewedWriter } from '@/lib/hooks/useRecentlyViewedMaterials'

interface MaterialDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: MaterialDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const material = await getMaterial(slug, { resolve: { gallery: false } })

  if (!material) {
    return {
      title: 'Material not found',
      robots: { index: false, follow: false },
    }
  }

  const description =
    material.shortDescription ?? stripHtml(material.excerptHtml)

  return {
    title: material.title,
    description: description || undefined,
    alternates: { canonical: `/materials/${material.slug}` },
    openGraph: {
      title: material.title,
      description: description || undefined,
      type: 'article',
      url: `/materials/${material.slug}`,
    },
  }
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { slug } = await params

  // Sessie 6 (performance): één orchestrator-call die material, gallery,
  // brand-naam én keyword-terms parallel ophaalt. Voorheen waren keywords
  // een aparte sequentiële fetch ná `getMaterial`, wat 150–400 ms extra
  // TTFB kostte. Zie `getMaterialDetail` voor de implementatie.
  const detail = await getMaterialDetail(slug)

  if (!detail) {
    notFound()
  }

  const { material, keywords: keywordTerms } = detail
  const publishedLabel = formatDate(material.date)

  // KeywordEntry shape is identiek aan MaterialKeyword — passthrough.
  const keywords: KeywordEntry[] = keywordTerms

  // JSON-LD payload
  const tagsForJsonLd = toMaterialTags(material.properties)
  const productJsonLd = buildProduct({
    slug: material.slug,
    title: material.title,
    description: material.shortDescription ?? stripHtml(material.excerptHtml),
    heroImage:
      material.gallery.hero?.sizes.large?.url ??
      material.gallery.hero?.sourceUrl,
    properties: tagsForJsonLd.map((tag) => ({
      name: humanizeFacet(tag.facet),
      value: tag.label,
    })),
  })

  // Alle 24 properties in 4 groepen — lege waarden tonen "Not specified"
  const propertyGroups = getAllPropertyGroups(material.properties)

  return (
    <>
      <RecentlyViewedWriter
        slug={material.slug}
        title={material.title}
        brandName={material.brandName}
        thumbnailUrl={
          material.gallery.hero?.sizes?.thumbnail?.url ??
          material.gallery.hero?.sizes?.medium?.url ??
          material.gallery.hero?.sourceUrl ??
          null
        }
      />

      <article className="pub-wrap">
        <DetailHeader
          backNode={<MaterialDetailBackLink />}
          tags={[{ type: 'content', contentType: 'material' }]}
          title={material.title}
          meta={
            <>
              {material.materialCode && (
                <>
                  Code <strong>{material.materialCode}</strong> ·{' '}
                </>
              )}
              Published <strong>{publishedLabel}</strong>
            </>
          }
          actions={
            <MaterialDetailActions
              materialId={material.id}
              materialSlug={material.slug}
              materialTitle={material.title}
            />
          }
        />

        <div className="mat-detail-wrap">
          {/* Main column */}
          <div className="mat-main">
            <MaterialGallery gallery={material.gallery} title={material.title} />

            {material.shortDescription && (
              <p className="mat-info-excerpt">{material.shortDescription}</p>
            )}

            {material.contentHtml ? (
              <MaterialBody html={material.contentHtml} />
            ) : material.excerptHtml ? (
              <MaterialBody html={material.excerptHtml} />
            ) : null}

            {/* Properties — gegroepeerd in pills, kop per groep.
                Toont ALLE 24 properties. Lege waarden krijgen "Not
                specified" + grijze pill zodat brands zien wat ze nog
                kunnen invullen. */}
            <section className="mat-properties" aria-labelledby="properties-title">
              <h2 id="properties-title" className="mat-section-title">
                Material properties
              </h2>
              <div className="mat-properties-grid">
                {propertyGroups.map((group) => (
                  <div key={group.group} className="mat-property-group">
                    <p className="mat-property-group-label">{group.label}</p>
                    <ul className="mat-property-group-rows" role="list">
                      {group.entries.map((entry) => (
                        <li
                          key={entry.facet}
                          className="mat-property-row"
                        >
                          <span className="mat-property-row-label">
                            {entry.facetLabel}
                          </span>
                          <span
                            className={`mat-property-row-value is-${entry.semantic}`}
                          >
                            {entry.displayValue}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <VideosSection
              videoUrl={material.videoUrl}
              materialTitle={material.title}
            />

            <KeywordsSection keywords={keywords} />

            <PrevNextNavigation currentSlug={material.slug} />
          </div>

          {/* Sidebar */}
          <aside className="mat-sidebar">
            <GetInTouchCard
              materialSlug={material.slug}
              brandName={material.brandName}
            />

            {material.brandName && (
              <BrandInfoCard
                brandName={material.brandName}
                brandSlug={null /* TODO: brand-slug uit Material zodra WP-mapper het levert */}
                country={null /* TODO: brand-country uit Material idem */}
                materialSlug={material.slug}
              />
            )}

            <DownloadsCard
              materialSlug={material.slug}
              datasheetUrl={material.datasheetUrl}
              epdUrl={material.epdUrl}
              productUrl={material.productUrl}
            />
          </aside>
        </div>
      </article>

      <MoreFromBrand
        brandId={material.brandId}
        brandName={material.brandName}
        currentMaterialId={material.id}
      />

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Materials', url: '/materials' },
            { label: material.title },
          ]),
          productJsonLd,
        ]}
      />
    </>
  )
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
