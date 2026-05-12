/**
 * `/materials` — overzichtspagina met FacetWP-filters, grid en pagination.
 *
 * Sessie 4 batch 3.
 *
 * Server Component. Leest searchParams, roept `listMaterialsWithFacets()`
 * aan, en rendert de page-shell rond een client-side grid + pagination.
 *
 * URL-structuur (zie `parseFacetSelectionFromSearchParams`):
 *   /materials?material_category=biobased,recycled&renewable=yes&q=hemp&sort=newest&page=2
 *
 * Layout volgt `design-system.md §6.1` (overzichtspagina-shell):
 *   ov-page-header (breadcrumb + h1 + search)
 *   ov-wrap (FilterSidebar + main content)
 *
 * EmptyState bij 0 results — geen 404 (FacetWP-filter met 0 matches is
 * een geldige query, geen "page does not exist"). Verschilt visueel:
 *  - Zonder zoek/filters: "no-results" (data nog niet beschikbaar?)
 *  - Met zoek/filters: "filtered-out" (te strenge filters)
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, EmptyState } from '@/components/ui'
import { listMaterialsWithFacets } from '@/lib/api'
import { parseFacetSelectionFromSearchParams } from '@/lib/api'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { MaterialsFilterSidebar } from './_components/MaterialsFilterSidebar'
import { MaterialsGrid } from './_components/MaterialsGrid'
import { MaterialsPagination } from './_components/MaterialsPagination'
import { MaterialsSearchInput } from './_components/MaterialsSearchInput'
import type { MaterialSortValue } from '@/types/facetwp'

// --------------------------------------------------------------------
// Metadata
// --------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Materials',
  description:
    'Browse 15,000+ innovative and sustainable materials for architects, designers and specifiers. Filter by properties, request samples, save your favourites.',
  alternates: { canonical: '/materials' },
  openGraph: {
    title: 'Materials | MaterialDistrict',
    description:
      'Browse 15,000+ innovative and sustainable materials for architects, designers and specifiers.',
    type: 'website',
    url: '/materials',
  },
}

// --------------------------------------------------------------------
// Page
// --------------------------------------------------------------------

interface MaterialsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  const params = await searchParams
  const { selection, page } = parseFacetSelectionFromSearchParams(params)

  // Sort en search uit selection halen — daar zijn `order` en `search_materials`
  // de juiste keys, maar voor de orchestrator splitsen we ze
  const sort = selection.order?.[0] as MaterialSortValue | undefined
  const search = selection.search_materials?.[0]

  // Filter-selection (zonder order/search) — die gaan apart naar de orchestrator
  // zodat de FacetSelection alleen filter-keys bevat (cleaner contract).
  const filterSelection = { ...selection }
  delete filterSelection.order
  delete filterSelection.search_materials

  const result = await listMaterialsWithFacets({
    selection: filterSelection,
    page,
    sort,
    search,
  })

  const hasActiveFilters =
    Object.keys(filterSelection).length > 0 || Boolean(search)
  const totalRows = result.pager.totalRows

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Materials' }]} />
          <h1 className="t-display-lg">Materials</h1>
          {totalRows > 0 && (
            <p className="t-body">
              {totalRows.toLocaleString('en-US')}{' '}
              {totalRows === 1 ? 'material' : 'materials'}
              {hasActiveFilters ? ' matching your filters' : ''}
            </p>
          )}
        </div>
        <div className="ov-page-header-aside">
          <MaterialsSearchInput initialValue={search ?? ''} />
        </div>
      </header>

      <div className="ov-wrap">
        <MaterialsFilterSidebar
          sections={result.filterSections}
          preservedParams={{ q: search, sort }}
        />

        <div>
          {result.items.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No materials match these filters"
                description="Try removing one or more filters, or clear them all to start over."
                actions={
                  <Button as="link" href="/materials" variant="outline" size="sm">
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No materials available"
                description="There are currently no materials to show. Please check back later."
              />
            )
          ) : (
            <>
              <Suspense fallback={null}>
                <MaterialsGrid items={result.items} />
              </Suspense>

              {result.pager.totalPages > 1 && (
                <div className="ov-pagination">
                  <MaterialsPagination
                    currentPage={result.pager.page}
                    totalPages={result.pager.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JsonLd
        data={buildBreadcrumbList([
          { label: 'Home', url: '/' },
          { label: 'Materials' },
        ])}
      />
    </>
  )
}
