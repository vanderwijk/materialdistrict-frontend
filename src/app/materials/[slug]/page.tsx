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
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { getChannelCatalog } from '@/lib/api'
import { MaterialGallery } from '@/components/materials'
import { getMaterial, getMaterialDetail } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildProduct } from '@/lib/seo'
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

  const { material, keywords: keywordTerms, materialCategoryTerms } = detail
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
  // §F2.8 punt 8: material's theme-IDs resolven naar channel-pills.
  const channelCatalog = await getChannelCatalog()
  const materialChannels = material.taxonomies.theme
    .map((id) => channelCatalog.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ slug: c.slug, label: c.label }))

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
        {/* Sessie 7 Punt 13: tags-rij boven de h1 met
              - material-category termen (resolved via getTerms)
              - sustainability "Yes"-properties (groen check-icoontje)
            DetailHeader's eigen `tags`-prop blijft staan met de
            content-type pill, maar deze rij komt visueel eerst doordat
            ze hier vóór de DetailHeader gerenderd wordt. CSS-class
            `mat-detail-tags-row` aligneert met de detail-header-inner
            padding/max-width. */}
        {(materialCategoryTerms.length > 0 || sustainabilityTags.length > 0) && (
          <div className="mat-detail-tags-row">
            {materialCategoryTerms.map((term) => (
              <span
                key={`cat-${term.slug}`}
                className="mat-detail-tag mat-detail-tag--category"
              >
                {term.name}
              </span>
            ))}
            {sustainabilityTags.map((t) => (
              <span
                key={`sus-${t.facet}`}
                className="mat-detail-tag mat-detail-tag--sustainability"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="mat-detail-tag-icon"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t.label}
              </span>
            ))}
          </div>
        )}

        <DetailHeader
          tags={[]}  /* §F2.8 punt 1: content-type-badge weg */
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
                      href={`/brands/${material.brandSlug}`}
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
              materialSlug={material.slug}
              materialId={material.id}
              brandId={material.brandId}
              downloads={material.downloads}
              downloadsInsidersOnly={material.downloadsInsidersOnly}
              datasheetUrl={material.datasheetUrl}
              epdUrl={material.epdUrl}
              productUrl={material.productUrl}
            />
          </aside>
                  <div className="detail-prevnext-row">
            <PrevNextNavigation currentSlug={material.slug} />
          </div>

        </div>
      </article>

      <MoreFromBrand
        brandId={material.brandId}
        brandName={material.brandName}
        brandSlug={material.brandSlug}
        currentMaterialId={material.id}
      />

      <MaterialDetailCompareBar
        material={{
          id: material.id,
          title: material.title,
          brandName: material.brandName,
          hero: material.gallery.hero,
          slug: material.slug,
          link: `/materials/${material.slug}`,
        }}
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
