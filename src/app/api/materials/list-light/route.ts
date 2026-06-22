/**
 * GET /api/materials/list-light
 *
 * Lichtgewicht endpoint voor de client-side prev/next-resolver op de
 * material detail-page. Neemt dezelfde query-params als /materials
 * (FacetWP-selectie + sort + search), draait de FacetWP-query met
 * een grote per_page (PREV_NEXT_MAX_ITEMS) en returnt een platte lijst
 * van `{ id, slug, title }` zonder hero-images of brand-resolves.
 *
 * Waarom apart van /materials zelf:
 *  - /materials rendert een page (server component) — niet direct
 *    aanroepbaar als JSON-bron vanuit een client-side useEffect.
 *  - We hebben ook geen volledige Material-objecten nodig voor prev/next
 *    — alleen genoeg om te kunnen linken (slug) en het label te tonen
 *    (title).
 *
 * Cache:
 *  - Geen edge-cache vanuit ons; FacetWP cached zelf. Client kan de
 *    response 30s in-memory bewaren als hij dat wil.
 *
 * Errors:
 *  - 400 op invalid params (mismatch search/sort enum)
 *  - 502 op upstream FacetWP-faal
 */

import { NextResponse, type NextRequest } from 'next/server'
import { listMaterialsWithFacets } from '@/lib/api'
import { parseFacetSelectionFromSearchParams } from '@/lib/api'
import { PREV_NEXT_MAX_ITEMS } from '@/lib/hooks/useMaterialsContext'
import type { MaterialSortValue } from '@/types/facetwp'

export const revalidate = 600

interface LightMaterial {
  id: number
  slug: string
  title: string
  /** Kleine thumbnail-URL voor prev/next-knoppen. Null als geen hero. */
  thumbnailUrl: string | null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Parse query-params hetzelfde als /materials zou doen — zo bewaren we
  // één parser als source-of-truth.
  const sp: Record<string, string | string[] | undefined> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    const existing = sp[key]
    if (existing === undefined) {
      sp[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      sp[key] = [existing, value]
    }
  })

  const { selection } = parseFacetSelectionFromSearchParams(sp)
  const sort = selection.order?.[0] as MaterialSortValue | undefined
  const search = selection.search_materials?.[0]

  const filterSelection = { ...selection }
  delete filterSelection.order
  delete filterSelection.search_materials

  try {
    // Pak één grote pagina; FacetWP kan tot 100+ items aan zonder
    // problemen. Boven PREV_NEXT_MAX_ITEMS schakelt de client over
    // op fallback B (hier gewoon de eerste 100 — client beslist).
    const result = await listMaterialsWithFacets({
      selection: filterSelection,
      page: 1,
      perPage: PREV_NEXT_MAX_ITEMS,
      sort,
      search,
      skipBaseline: true,
      resolveBrandName: false,
    })

    const items: LightMaterial[] = result.items.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      thumbnailUrl:
        m.hero?.sizes?.thumbnail?.url ??
        m.hero?.sizes?.medium?.url ??
        m.hero?.sourceUrl ??
        null,
    }))

    return NextResponse.json({ items, totalRows: result.pager.totalRows })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream error'
    return NextResponse.json(
      { code: 'md_upstream_error', message },
      { status: 502 },
    )
  }
}
