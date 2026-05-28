/**
 * `/brands` — brand-overzichtspagina met search, Country-filter, grid en
 * paginatie.
 *
 * Sessie 5.
 *
 * Server Component. Leest searchParams (q, country, page), haalt brands +
 * country-facetopties op, en rendert de overzichts-shell rond een
 * brand-tile-grid.
 *
 * URL-structuur:
 *   /brands?q=acoustic&country=NL,DE&page=2
 *
 * Layout volgt dezelfde shell als /materials (design-system §6.1):
 *   ov-page-header (breadcrumb + h1 + search)
 *   ov-wrap (BrandsFilterSidebar + grid + paginatie)
 *
 * Country-filter (Optie A): de selectie gaat als `?brand_country=` naar
 * WP. Tot Johan de WP-kant koppelt (open-issue sessie 5) filtert het nog
 * niet — de UI toont wel. Zie open-issues-patch-sessie5.md.
 *
 * EmptyState bij 0 resultaten — geen 404 (een filter/zoek met 0 matches
 * is een geldige query). Twee varianten: met of zonder actieve filters.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, EmptyState, BrandTile } from '@/components/ui'
import { getBrandCountryOptions, listBrands } from '@/lib/api'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { BrandsFilterSidebar } from './_components/BrandsFilterSidebar'
import { BrandsPagination } from './_components/BrandsPagination'
import { BrandsSearchInput } from './_components/BrandsSearchInput'

const BRANDS_PER_PAGE = 24

export const metadata: Metadata = {
  title: 'Brands',
  description:
    'Discover the manufacturers and suppliers behind the materials on MaterialDistrict. Browse by country, search by name, and explore their material collections.',
  alternates: { canonical: '/brands' },
  openGraph: {
    title: 'Brands | MaterialDistrict',
    description:
      'Discover the manufacturers and suppliers behind the materials on MaterialDistrict.',
    type: 'website',
    url: '/brands',
  },
}

interface BrandsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Parse een komma-gescheiden multi-value searchParam naar string[]. */
function parseMultiValue(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return []
  const joined = Array.isArray(raw) ? raw.join(',') : raw
  return joined
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Parse `?page=` naar een 1-based paginanummer (default 1). */
function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams

  const search = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined
  const selectedCountries = parseMultiValue(params.country)
  const page = parsePage(params.page)

  // Brands + country-facetopties parallel. De facetopties komen uit een
  // ruime ongefilterde fetch (zie getBrandCountryOptions) — de
  // gefilterde lijst gebruikt de country-param.
  const [result, countryOptions] = await Promise.all([
    listBrands({
      perPage: BRANDS_PER_PAGE,
      page,
      search,
      country: selectedCountries.length > 0 ? selectedCountries : undefined,
    }),
    getBrandCountryOptions(),
  ])

  const hasActiveFilters = selectedCountries.length > 0 || Boolean(search)
  const total = result.total

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Brands' }]} />
          <h1 className="t-display-lg">Brands</h1>
          {total > 0 && (
            <p className="t-body">
              {total.toLocaleString('en-US')} {total === 1 ? 'brand' : 'brands'}
              {hasActiveFilters ? ' matching your filters' : ''}
            </p>
          )}
        </div>
        <div className="ov-page-header-aside">
          <BrandsSearchInput initialValue={search ?? ''} />
        </div>
      </header>

      <div className="ov-wrap">
        <BrandsFilterSidebar
          countryOptions={countryOptions}
          selectedCountries={selectedCountries}
        />

        <div>
          {result.items.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No brands match these filters"
                description="Try removing the country filter or clearing your search to see more."
                actions={
                  <Button as="link" href="/brands" variant="outline" size="sm">
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No brands available"
                description="There are currently no brands to show. Please check back later."
              />
            )
          ) : (
            <>
              <Suspense fallback={null}>
                <div className="ov-grid-brands">
                  {result.items.map((brand) => (
                    <BrandTile key={brand.id} brand={brand} />
                  ))}
                </div>
              </Suspense>

              {result.totalPages > 1 && (
                <div className="ov-pagination">
                  <BrandsPagination
                    currentPage={page}
                    totalPages={result.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Brands' },
          ]),
        ]}
      />
    </>
  )
}
