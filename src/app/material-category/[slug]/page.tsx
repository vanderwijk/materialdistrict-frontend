/**
 * `/material-category/[slug]` — taxonomy-overzichtspagina per materiaalcategorie.
 *
 * Matcht de bestaande WP-URL `/material-category/[slug]` zodat Google de
 * geïndexeerde pagina's en hun linkwaarde direct herkent — geen redirects nodig.
 *
 * Toont een gefilterd grid van materials uit die categorie via
 * `listMaterialsWithFacets` met `selection.material_category`. Ondersteunt
 * paginering via `?page=` searchParam.
 *
 * SEO: unieke title/description/canonical per categorie + BreadcrumbList +
 * CollectionPage JSON-LD met de getoonde items als ItemList.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentCard, EmptyState } from '@/components/ui'
import { getTerm, getTerms, listMaterialsWithFacets } from '@/lib/api'
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
// Static params
// --------------------------------------------------------------------

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const terms = await getTerms('material_category', { perPage: 100, hide_empty: true })
  return terms.map((t) => ({ slug: t.slug }))
}

// --------------------------------------------------------------------
// Metadata
// --------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const term = await getTerm('material_category', slug)
  if (!term) return { title: 'Category not found', robots: { index: false, follow: false } }

  const name = decodeHtmlEntities(term.name)
  const description = term.description
    ? toPlainText(term.description).slice(0, 160)
    : `Browse ${name} materials on MaterialDistrict — innovative and sustainable materials for architects and designers.`
  const path = canonicalPath(`/material-category/${slug}`)

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

export default async function MaterialCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const [term, result] = await Promise.all([
    getTerm('material_category', slug),
    listMaterialsWithFacets({
      selection: { material_category: [slug] },
      page,
      perPage: PER_PAGE,
    }),
  ])

  if (!term) notFound()

  const name = decodeHtmlEntities(term.name)
  const { items, pager } = result
  const { totalRows, totalPages } = pager

  // Soft 404: taxonomy bestaat maar heeft geen materialen op pagina 1.
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
            description: term.description ? toPlainText(term.description) : undefined,
            url: `/material-category/${slug}`,
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
        {term.description && (
          <p className="ov-page-description">{toPlainText(term.description)}</p>
        )}
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
            description="There are no materials in this category yet."
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
                    href={`/material-category/${slug}?page=${page - 1}`}
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
                    href={`/material-category/${slug}?page=${page + 1}`}
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
