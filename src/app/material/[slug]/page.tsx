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
 * Data (performance):
 *  - `getMaterialDetail(slug)` — gallery + material_category-terms; keywords,
 *    brand en channels uit embedded `meta` op het material-object.
 *    Ook gebruikt in `generateMetadata` — `React.cache()` dedupliceert
 *    metadata + page binnen één request.
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
import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { DetailReadingTools } from '@/components/ui/DetailReadingTools'
import { MaterialGallery } from '@/components/materials'
import { getMaterialDetail } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildProduct, canonicalPath } from '@/lib/seo'
import { ViewLogger } from '@/components/ui/ViewLogger'
import { materialFilterHref } from '@/lib/api/facetwp'
import {
  getActiveSustainabilityFacets,
  getAllPropertyGroups,
  humanizeFacet,
  toMaterialTags,
} from '@/lib/utils/material-properties'
import { MaterialDetailActions } from './_components/MaterialDetailActions'
import { MaterialDetailCompareBar } from './_components/MaterialDetailCompareBar'
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
import { PreferredSourceEndBlock } from '@/components/ui/PreferredSourceEndBlock'
import { FollowDigestBlock } from '@/components/layout/FollowDigestBlock'
import { getDigestChannels } from '@/lib/api/digest-channels'

interface MaterialDetailPageProps {
  params: Promise<{ slug: string }>
}

/** ISR — mirrors `MATERIAL_REVALIDATE` in `lib/api/wordpress.ts` (6 h). */
export const revalidate = 21600

export async function generateMetadata({
  params,
}: MaterialDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const detail = await getMaterialDetail(slug)

  if (!detail) {
    return {
      title: 'Material not found',
      robots: { index: false, follow: false },
    }
  }

  const material = detail.material
  const description =
    material.shortDescription ?? stripHtml(material.excerptHtml)
  const path = canonicalPath(`/material/${material.slug}`)
  const hero = material.gallery.hero

  return {
    title: material.title,
    description: description || undefined,
    alternates: { canonical: path },
    openGraph: {
      title: material.title,
      description: description || undefined,
      type: 'article',
      url: path,
      ...(hero && {
        images: [{ url: hero.sourceUrl, width: hero.width, height: hero.height }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(hero && { images: [hero.sourceUrl] }),
    },
  }
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { slug } = await params

  const digestChannels = await getDigestChannels()

  const detail = await getMaterialDetail(slug)

  if (!detail) {
    notFound()
  }

  const { material, keywords: keywordTerms, materialCategoryTerms, channels } =
    detail
  const publishedLabel = formatDate(material.date)

  // KeywordEntry shape is identiek aan MaterialKeyword — passthrough.
  const keywords: KeywordEntry[] = keywordTerms

  // Sessie 7 Punt 13: tags-rij boven de h1 = material-category termen
  // + sustainability-Yes properties (met groen icoontje). De Yes-only
  // filter zit in `getActiveSustainabilityFacets`. Volgorde:
  // categories first, dan sustainability — zodat de eerste tag-rij
  // begint met de meest specifieke classificatie.
  const sustainabilityTags = getActiveSustainabilityFacets(material.properties)

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
  // §F2.8 punt 6: alleen ingevulde properties tonen op de publieke pagina.
  const hasAnyProperties = propertyGroups.some((g) =>
    g.entries.some((e) => e.rawValue !== ''),
  )
  // §F2.8 punt 8: channel-pills uit `meta.channels` (geen catalog-fetch).
  const materialChannels = channels

  // §F2.9 P1 + P2: taxonomie-pills (category + sustainability) verhuizen naar
  // de header-pill-rij (vóór de channels) en worden klikbaar zodra het facet
  // filterbaar is. `materialFilterHref` geeft null voor niet-filterbare facets
  // → dan blijft de pill een statische <span>.
  const hasTaxonomyPills =
    materialCategoryTerms.length > 0 || sustainabilityTags.length > 0
  const taxonomyPills = hasTaxonomyPills ? (
    <>
      {materialCategoryTerms.map((term) => {
        const href = materialFilterHref('material_category', term.slug)
        const cls = 'mat-detail-tag mat-detail-tag--category'
        return href ? (
          <Link key={`cat-${term.slug}`} href={href} className={cls}>
            {term.name}
          </Link>
        ) : (
          <span key={`cat-${term.slug}`} className={cls}>
            {term.name}
          </span>
        )
      })}
      {sustainabilityTags.map((t) => {
        const href = materialFilterHref(t.facet, 'yes')
        const cls = 'mat-detail-tag mat-detail-tag--sustainability'
        const inner = (
          <>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mat-detail-tag-icon"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {t.label}
          </>
        )
        return href ? (
          <Link key={`sus-${t.facet}`} href={href} className={cls}>
            {inner}
          </Link>
        ) : (
          <span key={`sus-${t.facet}`} className={cls}>
            {inner}
          </span>
        )
      })}
    </>
  ) : undefined

  // §F2.9 P9: "About this material"-eyebrow alleen tonen als er body is.
  const hasBody = Boolean(
    material.shortDescription || material.contentHtml || material.excerptHtml,
  )

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
        <div className="mat-detail-wrap">
          <div className="detail-back-row">
            <MaterialDetailBackLink />
          </div>
          <div className="detail-sheet">
        <DetailHeader
          tags={[]}  /* §F2.8 punt 1: content-type-badge weg */
          leadingTags={taxonomyPills}
          channels={materialChannels}
          title={material.title}
          meta={
            // Sessie 7 Punt 13 + sessie 5 (Johan-handoff 27-05-2026):
            // `by [Brand]` · `[Country]` · `[Code]` · `Published [date]`.
            // Brand-naam is nu een LINK naar /brands/[slug] zodra brand_slug
            // beschikbaar is (handoff §4). Country komt uit
            // material.brandCountry (brand_country.label) — conditioneel.
            <>
              {material.brandName && (
                <>
                  by{' '}
                  {material.brandSlug ? (
                    <Link
                      href={`/brand/${material.brandSlug}`}
                      className="mat-detail-meta-brand-link"
                    >
                      <strong>{material.brandName}</strong>
                    </Link>
                  ) : (
                    <strong>{material.brandName}</strong>
                  )}
                  {material.brandCountry && (
                    <>
                      {' · '}
                      {material.brandCountry}
                    </>
                  )}
                  {material.materialCode && (
                    <>
                      {' · '}
                      <span className="mat-detail-meta-code">
                        {material.materialCode}
                      </span>
                    </>
                  )}
                  {' · '}
                </>
              )}
              {!material.brandName && material.materialCode && (
                <>
                  Code <strong>{material.materialCode}</strong>
                  {' · '}
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
              brandName={material.brandName}
              hero={material.gallery.hero}
            />
          }
        />

          {/* Main column */}
          <div className="mat-main">
            <MaterialGallery gallery={material.gallery} title={material.title} />

            {/* §F2.9 P1: leeshulp links boven de body. */}
            <DetailReadingTools />

            {/* §F2.9 P9: consistente eyebrow boven de body. */}
            {hasBody && (
              <div className="detail-about-eyebrow">About this material</div>
            )}

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
            {hasAnyProperties && (
            <section className="mat-properties" aria-labelledby="properties-title">
              <h2 id="properties-title" className="mat-section-title">
                Material properties
              </h2>
              {/* Sessie 7 fix Punt 7: terug naar de horizontale pill-style
                  ipv de 3-koloms grid (mat-property-row). Per groep een
                  flex-wrap container met pills [label: value]. Semantische
                  kleuren komen via `is-{semantic}` op de pill zelf. */}
              <div className="mat-properties-grid">
                {propertyGroups.map((group) => {
                  // §F2.8 punt 6: lege ("Not specified") waarden weglaten;
                  // groep met 0 ingevulde properties verdwijnt volledig.
                  const specified = group.entries.filter(
                    (e) => e.rawValue !== '',
                  )
                  if (specified.length === 0) return null
                  return (
                    <div key={group.group} className="mat-property-group">
                      <p className="mat-property-group-label">{group.label}</p>
                      <div className="mat-property-group-tags">
                        {specified.map((entry) => {
                          const href = materialFilterHref(
                            entry.facet,
                            entry.rawValue,
                          )
                          const inner = (
                            <>
                              <span className="mat-property-tag-key">
                                {entry.facetLabel}:
                              </span>
                              {entry.displayValue}
                            </>
                          )
                          return href ? (
                            <Link
                              key={entry.facet}
                              href={href}
                              className={`mat-property-tag is-${entry.semantic} is-clickable`}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <span
                              key={entry.facet}
                              className={`mat-property-tag is-${entry.semantic}`}
                            >
                              {inner}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
            )}

            <VideosSection
              videoUrl={material.videoUrl}
              materialTitle={material.title}
            />

            <KeywordsSection keywords={keywords} />

            {/* Google Preferred Source CTA — binnen het witte content-vel,
                als laatste blok onder de content (net als op Stories). */}
            <PreferredSourceEndBlock placement="material" />

          </div>
          </div>

          {/* Sidebar */}
          <aside className="mat-sidebar">
            <GetInTouchCard
              materialSlug={material.slug}
              materialId={material.id}
              materialTitle={material.title}
              brandName={material.brandName}
              restrictToListedCountries={material.restrictToListedCountries}
              acceptedCountries={material.acceptedCountries}
              brandWebsite={material.brandWebsite}
              sampleRequestsInsidersOnly={material.sampleRequestsInsidersOnly}
            />

            {material.brandName && (
              <BrandInfoCard
                brandName={material.brandName}
                brandSlug={material.brandSlug}
                country={material.brandCountry}
                materialSlug={material.slug}
              />
            )}

            <DownloadsCard
              signInNextPath={`/material/${material.slug}`}
              brandId={material.brandId ?? 0}
              materialId={material.id}
              downloads={material.downloads}
              downloadsInsidersOnly={material.downloadsInsidersOnly}
              datasheetUrl={material.datasheetUrl}
              epdUrl={material.epdUrl}
              productUrl={material.productUrl}
            />

            <FollowDigestBlock channels={digestChannels} compact />
          </aside>

          <div className="detail-prevnext-row">
            <PrevNextNavigation currentSlug={material.slug} />
          </div>

        </div>
      </article>

      <Suspense fallback={null}>
        <MoreFromBrand
          brandId={material.brandId}
          brandName={material.brandName}
          brandSlug={material.brandSlug}
          currentMaterialId={material.id}
        />
      </Suspense>

      <MaterialDetailCompareBar
        material={{
          id: material.id,
          title: material.title,
          brandName: material.brandName,
          hero: material.gallery.hero,
          slug: material.slug,
          link: `/material/${material.slug}`,
        }}
      />

      <ViewLogger objectType="material" objectId={material.id} />
      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Materials', url: '/material' },
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
