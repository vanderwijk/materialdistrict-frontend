/**
 * `/materials` — overzichtspagina met FacetWP-filters, grid en pagination.
 *
 * Sessie 4 batch 3 — initial implementation.
 * Sessie 6 (19-05-2026) — filter-sidebar rebuild:
 *  - `<MaterialsFilterProvider>` rond filter + grid → trigger en sidebar
 *    delen drawer-state via Context
 *  - `<MaterialsFilterTrigger>` in eigen rij onder de page-header
 *    (op desktop verborgen, op mobile zichtbaar) — fix voor Punt 22
 *  - `.ov-grid-wrap` met `data-pending` voor optimistic dim tijdens
 *    filter-transition (CSS-side, geen state-prop nodig)
 *
 * Server Component. Leest searchParams, roept `listMaterialsWithFacets()`
 * aan, en rendert de page-shell rond een client-side grid + pagination.
 *
 * URL-structuur (zie `parseFacetSelectionFromSearchParams`):
 *   /materials?material_category=biobased,recycled&renewable=yes&q=hemp&sort=newest&page=2
 *
 * Layout volgt `design-system.md §6.1` (overzichtspagina-shell):
 *   ov-page-header (breadcrumb + h1 + search)
 *   ov-filter-trigger-row (alleen mobile, sessie 6)
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
import { MaterialsContextWriter } from '@/lib/hooks/useMaterialsContext'
import {
  MaterialsFilterProvider,
  MaterialsFilterSidebar,
  MaterialsFilterTrigger,
  MaterialsGridDimWrapper,
} from './_components/MaterialsFilterSidebar'
import { MaterialsGrid } from './_components/MaterialsGrid'
import { MaterialsPagination } from './_components/MaterialsPagination'
import { MaterialsSearchInput } from './_components/MaterialsSearchInput'
import { RecentlyViewedSection } from './_components/RecentlyViewedSection'
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

  // Reconstrueer de raw search-params string voor de filter-context.
  // Deze string is wat we naar sessionStorage schrijven en die op de
  // detail-page weer gebruiken voor back-link + prev/next.
  const queryString = buildQueryString(params)

  return (
    <MaterialsFilterProvider>
      <MaterialsContextWriter queryString={queryString} />

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

      {/* Mobile filter-trigger rij — sessie 6 fix voor Punt 22.
          Op desktop verborgen via CSS-media-query. Plaats: tussen
          page-header en .ov-wrap, eigen rij zodat de drawer-trigger
          niet in de grid-flow zit. */}
      <div className="ov-filter-trigger-row">
        <MaterialsFilterTrigger />
        <div className="ov-filter-trigger-row-aside">
          {/* Placeholder voor toekomstige sort-dropdown of view-toggle. */}
        </div>
      </div>

      <div className="ov-wrap">
        <MaterialsFilterSidebar
          sections={result.filterSections}
          preservedParams={{ q: search, sort }}
        />

        {/* Grid-wrapper met data-pending hook (sessie 6). De wrapper
            zet `data-pending="true"` tijdens filter-transitions zodat
            CSS de inhoud subtiel kan dimmen. Eigen client-component
            zodat page.tsx zelf server-rendered kan blijven. */}
        <MaterialsGridDimWrapper>
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
                <MaterialsGrid items={result.items} searchTerm={search} />
              </Suspense>

              {result.pager.totalPages > 1 && (
                <div className="ov-pagination">
                  <MaterialsPagination
                    currentPage={result.pager.page}
                    totalPages={result.pager.totalPages}
                  />
                </div>
              )}

              {/* Sessie 7 fix Punt 3: Recently viewed staat nu binnen
                  de .ov-wrap-grid, in dezelfde kolom als de grid
                  (kolom 2 op desktop). Voorheen rendderde de sectie
                  ná de </div> van .ov-wrap en kreeg dus de volle
                  pagina-breedte — wat hem ook onder de filter-sidebar
                  liet doorlopen. De .is-inline-variant overschrijft
                  de full-bleed CSS van de standalone sectie. */}
              <RecentlyViewedSection variant="inline" />
            </>
          )}
        </MaterialsGridDimWrapper>
      </div>

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Materials' },
          ]),
        ]}
      />
    </MaterialsFilterProvider>
  )
}

/**
 * Bouw een raw query-string uit de Next.js `searchParams`-object. Multi-
 * value keys (array) worden samengevoegd met `,` — dezelfde conventie
 * als `parseFacetSelectionFromSearchParams`. Lege waarden worden
 * weggelaten zodat we geen "?foo=&bar=" rommel produceren.
 *
 * Output (zonder leading `?`):
 *   "material_category=wood,biobased&q=acoustic&sort=newest&page=3"
 */
function buildQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (rawValue === undefined) continue
    const value = Array.isArray(rawValue) ? rawValue.join(',') : rawValue
    if (value.trim().length === 0) continue
    params.set(key, value)
  }
  return params.toString()
}
