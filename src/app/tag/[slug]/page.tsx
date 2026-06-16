/**
 * `/tag/[slug]` — taxonomy-overzichtspagina per keyword-tag.
 *
 * Matcht de bestaande WP-URL `/tag/[slug]` zodat Google de geïndexeerde
 * tag-pagina's en hun linkwaarde direct herkent — geen redirects nodig.
 *
 * Tags in MaterialDistrict zijn gekoppeld aan materials. De pagina toont
 * een gefilterd grid via `listMaterialsWithFacets` met `search`-param op
 * de tag-slug (WP behandelt tags als zoektermen in FacetWP-context).
 *
 * Ondersteunt paginering via `?page=` searchParam.
 *
 * SEO: unieke title/description/canonical per tag + BreadcrumbList +
 * CollectionPage JSON-LD.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentCard, EmptyState } from '@/components/ui'
import { getTerm, listMaterialsWithFacets } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildCollectionPage, canonicalPath } from '@/lib/seo'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'

const PER_PAGE = 24

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

// --------------------------------------------------------------------
// Metadata
// --------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const term = await getTerm('tags', slug)
  if (!term) return { title: 'Tag not found', robots: { index: false, follow: false } }

  const name = decodeHtmlEntities(term.name)
  const description = `Browse all materials tagged "${name}" on MaterialDistrict — innovative and sustainable materials for architects and designers.`
  const path = canonicalPath(`/tag/${slug}`)

  return {
    title: name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${name} | MaterialDistrict`,
      description,
      type: 'website',
      url: path,
    },
  }
}

// --------------------------------------------------------------------
// Page
// --------------------------------------------------------------------

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  // Tags worden in WP opgeslagen met de slug als zoekterm.
  // We gebruiken de `search`-param van listMaterialsWithFacets om te filteren.
  const [term, result] = await Promise.all([
    getTerm('tags', slug),
    listMaterialsWithFacets({
      search: slug,
      page,
      perPage: PER_PAGE,
    }),
  ])

  if (!term) notFound()

  const name = decodeHtmlEntities(term.name)
  const { items, pager } = result
  const { totalRows, totalPages } = pager

  // Soft 404: tag bestaat maar heeft geen materialen op pagina 1.
  if (items.length === 0 && page === 1) notFound()

  const collectionItems = items.map((m) => ({
    name: m.title,
    url: `/material/${m.slug}`,
  }))

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Materials', url: '/material' },
            { label: name },
          ]),
          buildCollectionPage({
            name,
            url: `/tag/${slug}`,
            items: collectionItems,
          }),
        ]}
      />

      <div className="ov-page-header">
        <Breadcrumb
          items={[
            { label: 'Materials', href: '/material' },
            { label: name },
          ]}
        />
        <h1 className="ov-page-title">{name}</h1>
        <p className="ov-page-description">
          Materials tagged &ldquo;{name}&rdquo;
        </p>
        {totalRows > 0 && (
          <p className="ov-page-count">
            {totalRows.toLocaleString('en-US')} material{totalRows !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="ov-wrap-single">
        {items.length === 0 ? (
          <EmptyState
            title="No materials found"
            description={`There are no materials tagged "${name}" yet.`}
          />
        ) : (
          <>
            <div className="ov-grid">
              {items.map((m) => (
                <ContentCard
                  key={m.id}
                  href={`/material/${m.slug}`}
                  contentType="material"
                  thumbSrc={m.hero?.sourceUrl}
                  thumbAlt={m.hero?.alt ?? m.title}
                  eyebrow={m.brandName ?? undefined}
                  title={m.title}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="ov-pagination" aria-label="Pagination">
                {page > 1 && (
                  <a
                    href={`/tag/${slug}?page=${page - 1}`}
                    className="ov-pagination-btn"
                  >
                    Previous
                  </a>
                )}
                <span className="ov-pagination-info">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <a
                    href={`/tag/${slug}?page=${page + 1}`}
                    className="ov-pagination-btn"
                  >
                    Next
                  </a>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </>
  )
}
