/**
 * `/brands/[slug]` — brand-detailpagina.
 *
 * Sessie 5.
 *
 * Server Component. Haalt de brand op (incl. gallery via attachments),
 * de materials van de brand (relatie-query `?brand_id=`), en de
 * prev/next-buren (alfabetische brandenlijst). Rendert de detail-shell:
 *
 *   pub-wrap
 *     DetailHeader (back · brand-tag · naam · meta · [actions])
 *     pub-layout-inner
 *       main:   gallery (conditioneel) + body + materials-grid + prev/next
 *       aside:  contact-card + info-card
 *
 * Gallery: hergebruikt <MaterialGallery> (brand-agnostisch). Alleen
 * gerenderd bij ≥1 afbeelding; anders toont de component zelf een
 * placeholder.
 *
 * Geparkeerd (Johan-vragen, zie open-issues sessie 5):
 *  - Company-film: brand-videoveld nog niet beschikbaar.
 *  - Downloads: brand-downloadveld nog niet beschikbaar.
 *  - Channels: channel-pills in DetailHeader (theme terms via meta.channels).
 *
 * JSON-LD: Organization (brand) + BreadcrumbList.
 * notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { MaterialGallery } from '@/components/materials'
import { MaterialBody } from '@/app/materials/[slug]/_components/MaterialBody'
import { getBrand, listBrands, listMaterialsByBrand } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildBrandOrganization } from '@/lib/seo'
import { BrandDetailContactCard } from './_components/BrandDetailContactCard'
import { BrandDetailInfoCard } from './_components/BrandDetailInfoCard'
import { BrandMaterialsGrid } from './_components/BrandMaterialsGrid'
import { BrandPrevNext, type BrandPrevNextNeighbour } from './_components/BrandPrevNext'

const MATERIALS_PER_BRAND = 4

interface BrandDetailPageProps {
  params: Promise<{ slug: string }>
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({
  params,
}: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug, { resolve: { gallery: false } })

  if (!brand) {
    return { title: 'Brand not found', robots: { index: false, follow: false } }
  }

  const description = stripHtml(brand.excerptHtml) || undefined

  return {
    title: brand.name,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: {
      title: brand.name,
      description,
      type: 'profile',
      url: `/brands/${brand.slug}`,
    },
  }
}

/**
 * Bereken de prev/next-buren van een brand in de alfabetische lijst.
 * Lichte fetch (geen logo-resolve). Faalbestendig: bij een fout of als de
 * brand niet in de lijst zit, geen buren (component rendert dan niets).
 */
async function getBrandNeighbours(
  currentSlug: string,
): Promise<{ prev: BrandPrevNextNeighbour | null; next: BrandPrevNextNeighbour | null }> {
  try {
    const { items } = await listBrands({
      perPage: 100,
      orderby: 'title',
      order: 'asc',
      resolveLogo: false,
    })
    const idx = items.findIndex((b) => b.slug === currentSlug)
    if (idx === -1) return { prev: null, next: null }
    const prev = idx > 0 ? items[idx - 1] : null
    const next = idx < items.length - 1 ? items[idx + 1] : null
    return {
      prev: prev ? { slug: prev.slug, name: prev.name } : null,
      next: next ? { slug: next.slug, name: next.name } : null,
    }
  } catch {
    return { prev: null, next: null }
  }
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { slug } = await params

  const brand = await getBrand(slug)
  if (!brand) notFound()

  // Materials van de brand + buren parallel.
  const [materialsResult, neighbours] = await Promise.all([
    listMaterialsByBrand(brand.id, { perPage: MATERIALS_PER_BRAND }),
    getBrandNeighbours(slug),
  ])

  const hasGallery = brand.gallery.total > 0

  // Meta-regel: "City, Country · Est. Founded · N employees" — alleen de
  // ingevulde delen.
  const metaParts: string[] = []
  const place = [brand.city, brand.country].filter(Boolean).join(', ')
  if (place) metaParts.push(place)
  if (brand.founded) metaParts.push(`Est. ${brand.founded}`)
  if (brand.employees) metaParts.push(`${brand.employees} employees`)

  return (
    <>
      <article className="pub-wrap">
        <div className="pub-layout-inner">
          <div className="detail-sheet">
        <DetailHeader
          tags={[]}  /* §F2.8 punt 1: content-type-badge weg */
          channels={brand.channels.map((c) => ({ slug: c.slug, label: c.label }))}
          title={brand.name}
          meta={metaParts.length > 0 ? <>{metaParts.join(' · ')}</> : undefined}
        />

          {/* Main column */}
          <div>
            {hasGallery && (
              <MaterialGallery gallery={brand.gallery} title={brand.name} />
            )}

            {brand.contentHtml ? (
              <MaterialBody html={brand.contentHtml} />
            ) : brand.excerptHtml ? (
              <MaterialBody html={brand.excerptHtml} />
            ) : null}

            <BrandMaterialsGrid
              brandName={brand.name}
              brandSlug={brand.slug}
              materials={materialsResult.items}
              totalCount={brand.materialCount || materialsResult.total}
              maxVisible={3}
            />

          </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="brand-detail-sidebar">
              <BrandDetailContactCard
                brandId={brand.id}
                brandName={brand.name}
                brandSlug={brand.slug}
                country={brand.country}
                website={brand.website}
                socials={brand.socials}
              />

              <BrandDetailInfoCard
                brandSlug={brand.slug}
                brandId={brand.id}
                website={brand.website}
                address={brand.address}
                city={brand.city}
                country={brand.country}
                founded={brand.founded}
                employees={brand.employees}
                materialCount={brand.materialCount || materialsResult.total}
              />
            </div>
          </aside>
                  <div className="detail-prevnext-row">
            <BrandPrevNext prev={neighbours.prev} next={neighbours.next} />
          </div>

        </div>
      </article>

      <JsonLd
        data={[
          buildBrandOrganization({
            slug: brand.slug,
            name: brand.name,
            description: stripHtml(brand.excerptHtml) || undefined,
            logo: brand.gallery.hero?.sizes?.large?.url ?? brand.gallery.hero?.sourceUrl,
            website: brand.website,
            socials: brand.socials,
          }),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Brands', url: '/brands' },
            { label: brand.name },
          ]),
        ]}
      />
    </>
  )
}
