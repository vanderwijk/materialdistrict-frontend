/**
 * `/brand/[slug]` — brand-detailpagina.
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
 *  - Channels (ChannelBar / brand-tags): geen brand-channel-taxonomie.
 *
 * JSON-LD: Organization (brand) + BreadcrumbList.
 * notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { DetailReadingTools } from '@/components/ui/DetailReadingTools'
import { RecentlyViewedTracker } from '@/lib/hooks/useRecentlyViewed'
import { MaterialGallery } from '@/components/materials'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'
import { getBrand, listBrands, listMaterialsByBrand } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildBrandOrganization, canonicalPath, openGraphSite } from '@/lib/seo'
import { ViewLogger } from '@/components/ui/ViewLogger'
import { BrandDetailActions } from './_components/BrandDetailActions'
import { BrandDetailContactCard } from './_components/BrandDetailContactCard'
import { BrandDetailInfoCard } from './_components/BrandDetailInfoCard'
import { BrandMaterialsGrid } from './_components/BrandMaterialsGrid'
import { BrandPrevNext, type BrandPrevNextNeighbour } from './_components/BrandPrevNext'
import { PreferredSourceEndBlock } from '@/components/ui/PreferredSourceEndBlock'
import { FollowDigestBlock } from '@/components/layout/FollowDigestBlock'
import { AdSlot } from '@/components/ads/AdSlot'
import { getDigestChannels } from '@/lib/api/digest-channels'
import { FollowToggle } from '@/components/ui/FollowToggle'
import { DownloadsCard } from '@/app/material/[slug]/_components/DownloadsCard'

/**
 * §BETA-FIX-24-08 (X1) — soft-404 opgelost.
 *
 * Deze route stond op `force-static`. Dat hield de pagina's op het CDN, maar
 * had een bijwerking die pas op de beta zichtbaar werd: een onbekende slug
 * kreeg wél de 404-pagina te zien, maar het antwoord was HTTP 200. Ook de
 * niet-gevonden-uitkomst werd namelijk voorgebakken, en een voorgebakken
 * antwoord kan geen 404-status meer meegeven. Voor Google is zo'n pagina een
 * geldige pagina — bij een migratie met veel oude inbound links precies wat je
 * niet wilt.
 *
 * `dynamicParams` + `revalidate` doen hetzelfde werk zonder die bijwerking:
 * onbekende slugs worden op verzoek gerenderd, daarna gecachet en op een timer
 * ververst (ISR), maar `notFound()` levert nu een echte 404. Het CDN blijft de
 * gevonden pagina's dus gewoon bewaren.
 *
 * Let op bij toekomstig werk: `force-static` was óók een vangnet tegen een
 * `cookies()`- of `headers()`-aanroep die de hele route stilletjes dynamisch
 * zou maken. Dat vangnet is hier weg — lees in deze subtree geen request-data
 * server-side; wat per bezoeker verschilt hoort in een client-component
 * (zoals de auth-hydratie nu al doet).
 */
export const dynamicParams = true

/**
 * Leeg, maar noodzakelijk. Samen met `dynamicParams` markeert dit de route als
 * statisch-met-ISR: pagina's worden op verzoek gebouwd, daarna op het CDN
 * bewaard en op de timer ververst. Zónder deze functie behandelt Next de route
 * als volledig dynamisch — dan rendert élke bezoeker (en élke crawler) de
 * pagina opnieuw en bevraagt WordPress opnieuw. Dat was de reden voor het
 * eerdere `force-static`; deze regel neemt die taak over, maar laat
 * `notFound()` wél een echte 404 geven. Geen build-time prerender: de lijst is
 * bewust leeg om een request-storm tijdens de Vercel-build te voorkomen.
 */
export async function generateStaticParams() {
  return []
}


/** ISR — mirrors the fetch-level revalidate for this type (24 h). */
export const revalidate = 86400


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
    notFound()
  }

  const description = stripHtml(brand.excerptHtml) || undefined
  const path = canonicalPath(`/brand/${brand.slug}`)

  return {
    title: brand.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...openGraphSite,
      title: brand.name,
      description,
      type: 'profile',
      url: path,
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
  const digestChannels = await getDigestChannels()
  const { slug } = await params

  const brand = await getBrand(slug)
  if (!brand) notFound()

  // Materials van de brand + buren parallel.
  const [materialsResult, neighbours] = await Promise.all([
    listMaterialsByBrand(brand.id, { perPage: MATERIALS_PER_BRAND }),
    getBrandNeighbours(slug),
  ])

  const hasGallery = brand.gallery.total > 0
  // §F2.9 P9: eyebrow alleen tonen als er body-tekst is.
  const hasBody = Boolean(brand.contentHtml || brand.excerptHtml)

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
        <RecentlyViewedTracker
          type="brands"
          slug={brand.slug}
          title={brand.name}
          subtitle={place || null}
          thumbnailUrl={
            brand.gallery?.hero?.sizes?.large?.url ??
            brand.gallery?.hero?.sourceUrl ??
            null
          }
          href={`/brand/${brand.slug}`}
        />
        <div className="pub-layout-inner">
          <div className="detail-sheet">
        <DetailHeader
          tags={[]}  /* §F2.8 punt 1: content-type-badge weg */
          channels={brand.channels.map((c) => ({ id: c.id, slug: c.slug, label: c.label }))}
          title={brand.name}
          meta={metaParts.length > 0 ? <>{metaParts.join(' · ')}</> : undefined}
          actions={
            <BrandDetailActions
              brandId={brand.id}
              brandSlug={brand.slug}
              brandName={brand.name}
            />
          }
        />

          {/* Main column */}
          <div>
            {brand.followable && (
              <div className="brand-follow-row">
                <FollowToggle entityType="brand" entityId={brand.id} entityName={brand.name} />
              </div>
            )}
            {hasGallery && (
              <MaterialGallery gallery={brand.gallery} title={brand.name} />
            )}

            {/* §F2.9 P1: leeshulp links boven de body. */}
            <DetailReadingTools />

            {/* §F2.9 P9: consistente eyebrow boven de body. */}
            {hasBody && (
              <div className="detail-about-eyebrow">About this brand</div>
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

            {/* Google Preferred Source CTA — binnen het witte content-vel. */}
            <PreferredSourceEndBlock placement="brand" />

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

              <DownloadsCard
                signInNextPath={`/brand/${brand.slug}`}
                brandId={brand.id}
                downloads={brand.downloads}
                downloadsInsidersOnly={brand.downloadsInsidersOnly}
              />
            </div>

            {/* §BETA-FIX-24-08 (D2): medium rectangle boven het volgblok —
                dezelfde plek op elke detailpagina. */}
            <div className="ad-holder ad-holder--sidebar">
              <AdSlot name="mrec" />
            </div>

            <FollowDigestBlock channels={digestChannels} compact />
          </aside>

          <div className="detail-prevnext-row">
            <BrandPrevNext prev={neighbours.prev} next={neighbours.next} />
          </div>

        </div>
      </article>

      <ViewLogger objectType="brand" objectId={brand.id} />
      <JsonLd
        data={[
          buildBrandOrganization({
            slug: brand.slug,
            name: brand.name,
            description: stripHtml(brand.excerptHtml) || undefined,
            logo: brand.logo?.sizes?.large?.url ?? brand.logo?.sourceUrl,
            website: brand.website,
            socials: brand.socials,
          }),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Brands', url: '/brand' },
            { label: brand.name },
          ]),
        ]}
      />
    </>
  )
}
