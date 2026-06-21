/**
 * `/compare` — vergelijk materials naast elkaar (Insider-feature).
 *
 * Server Component. Leest de comma-gescheiden `?ids=` (de CompareBar bouwt
 * die link), haalt de materials op via `getMaterialsForCompare` en seedt de
 * client-side `CompareView`. De pagina ligt bewust buiten de CompareProvider:
 * de URL is de bron, zodat een vergelijking deelbaar is via de link.
 *
 * Max 3 materials (mockup-conventie, `MAX_COMPARE`). Niet-indexeerbaar — dit
 * zijn vluchtige, gebruiker-specifieke URLs.
 */

import type { Metadata } from 'next'
import { getMaterialsForCompare } from '@/lib/api'
import { CompareView } from './_components/CompareView'

export const metadata: Metadata = {
  title: 'Material comparison — MaterialDistrict',
  robots: { index: false, follow: false },
}

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

function parseIds(raw: string | undefined): number[] {
  if (!raw) return []
  const seen = new Set<number>()
  for (const part of raw.split(',')) {
    const n = Number(part.trim())
    if (Number.isInteger(n) && n > 0) seen.add(n)
  }
  return Array.from(seen).slice(0, 3)
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids: idsRaw } = await searchParams
  const ids = parseIds(idsRaw)
  const materials = ids.length > 0 ? await getMaterialsForCompare(ids) : []

  const compareMaterials = materials.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    brandName: m.brandName,
    materialCode: m.materialCode,
    hero: m.hero,
    properties: m.properties,
  }))

  return (
    <div className="ov-wrap-single compare-wrap">
      <CompareView initialMaterials={compareMaterials} />
    </div>
  )
}
