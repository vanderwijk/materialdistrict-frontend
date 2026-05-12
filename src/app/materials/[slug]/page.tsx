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
 * Data:
 *  - `getMaterial(slug)` voor hoofd-content (server fetch)
 *  - `getTerms('tags', { include: tag_ids })` voor keyword-labels
 *    (alleen als er tag-IDs zijn — anders skip de fetch)
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
import { getMaterial, getTerms } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildProduct } from '@/lib/seo'
import {
  groupTagsByCategory,
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
import { SampleRequestFormSection } from './_components/SampleRequestFormSection'

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
  const material = await getMaterial(slug)

  if (!material) {
    notFound()
  }

  const publishedLabel = formatDate(material.date)

  // Keywords ophalen — alleen als er tag-IDs zijn.
  let keywords: KeywordEntry[] = []
  if (material.taxonomies.tags && material.taxonomies.tags.length > 0) {
    try {
      const terms = await getTerms('tags', {
        include: material.taxonomies.tags,
        perPage: 50,
      })
      keywords = terms.map((t) => ({ name: t.name, slug: t.slug }))
    } catch {
      // Faalbestendig: bij upstream-fout simpelweg geen keywords tonen.
      keywords = []
    }
  }

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

  // Gegroepeerde properties voor de detail-page
  const propertyGroups = groupTagsByCategory(material.properties)

  return (
    <>
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
              <section
                className="mat-body"
                dangerouslySetInnerHTML={{ __html: material.contentHtml }}
              />
            ) : material.excerptHtml ? (
              <section
                className="mat-body"
                dangerouslySetInnerHTML={{ __html: material.excerptHtml }}
              />
            ) : null}

            {/* Properties — gegroepeerd in pills, kop per groep */}
            {propertyGroups.length > 0 && (
              <section className="mat-properties" aria-labelledby="properties-title">
                <h2 id="properties-title" className="mat-section-title">
                  Material properties
                </h2>
                {propertyGroups.map((group) => (
                  <div key={group.group} className="mat-property-group">
                    <p className="mat-property-group-label">{group.label}</p>
                    <ul className="mat-property-group-tags">
                      {group.tags.map((tag) => (
                        <li
                          key={`${tag.facet}:${tag.label}`}
                          className="mat-property-tag"
                        >
                          <span className="mat-property-tag-key">
                            {humanizeFacet(tag.facet)}
                          </span>
                          <span>{tag.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            <VideosSection
              videoUrl={material.videoUrl}
              materialTitle={material.title}
            />

            <KeywordsSection keywords={keywords} />

            <PrevNextNavigation currentSlug={material.slug} />

            {/* Sample request form — anchor voor Get-in-touch-CTA op
                ingelogde users. ID-target voor de #sample-request scroll. */}
            <section id="sample-request" className="mat-sample-section">
              <SampleRequestFormSection
                materialId={material.id}
                materialTitle={material.title}
                materialSlug={material.slug}
                disabled={material.disableSampleRequest}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="mat-sidebar">
            <GetInTouchCard
              materialSlug={material.slug}
              brandName={null /* geparkeerd tot brand-resolve */}
            />

            <div className="mat-brand-block">
              <span className="mat-brand-block-eyebrow">Material details</span>
              <h2 className="mat-brand-block-name">
                {material.materialCode || 'Material reference'}
              </h2>
              <p className="t-body-sm">Published {publishedLabel}</p>
              {material.transportWeight && (
                <p className="t-body-sm">
                  Transport weight: {material.transportWeight}
                </p>
              )}
            </div>

            <DownloadsCard
              materialSlug={material.slug}
              datasheetUrl={material.datasheetUrl}
              epdUrl={material.epdUrl}
              productUrl={material.productUrl}
            />
          </aside>
        </div>
      </article>

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
