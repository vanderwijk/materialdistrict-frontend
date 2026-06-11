'use client'

/**
 * TalksBrowser — talks-overzicht met een LINKER filter-sidebar + grid +
 * client-side paginatie.
 *
 * §F2.11 P7: de filters verhuizen van de bovenbalk naar een linker sidebar,
 * consistent met materials/brands. We hergebruiken daarvoor de generieke
 * <FilterSidebar> (zelfde .uf-* opbouw, mobiele drawer, witte-pill counts),
 * gevoed door client-state i.p.v. FacetWP. De volledige (op channel + zoekterm
 * server-gefilterde) set komt in één keer mee en wordt hier client-side
 * gefilterd op jaar, spreker en — §F2.11 P8 — "Insider only".
 *
 * Sidebar = grid-kolom 1, main = kolom 2 (de <FilterSidebar>-fragment flatt
 * zich in het .ov-wrap grid; de mobile-trigger is display:none op desktop).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  EmptyState,
  Button,
  Pagination,
  ContentCard,
  RecentlyViewedRail,
} from '@/components/ui'
import {
  FilterSidebar,
  type FilterSection,
  type FilterSelection,
} from '@/components/ui/FilterSidebar'
import { CardBookmarkButton } from '@/components/ui/CardBookmarkButton'

const PAGE_SIZE = 12

export interface TalksBrowserItem {
  id: number
  slug: string
  title: string
  date: string
  heroUrl?: string
  heroAlt: string
  speakerNames: string[]
  insiderOnly: boolean
}

interface TalksBrowserProps {
  talks: TalksBrowserItem[]
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function yearOf(value: string): string {
  const y = new Date(value).getFullYear()
  return Number.isFinite(y) ? String(y) : ''
}

export function TalksBrowser({ talks }: TalksBrowserProps) {
  const [selected, setSelected] = useState<FilterSelection>({})
  const [page, setPage] = useState(1)

  // Filter-opties + counts afgeleid uit de volledige geladen set.
  const { yearOptions, speakerOptions, insiderCount } = useMemo(() => {
    const yearCounts = new Map<string, number>()
    const speakerCounts = new Map<string, number>()
    let insider = 0
    talks.forEach((t) => {
      const y = yearOf(t.date)
      if (y) yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1)
      t.speakerNames.forEach((n) => {
        if (n) speakerCounts.set(n, (speakerCounts.get(n) ?? 0) + 1)
      })
      if (t.insiderOnly) insider += 1
    })
    return {
      yearOptions: Array.from(yearCounts.entries())
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([value, count]) => ({ value, label: value, count })),
      speakerOptions: Array.from(speakerCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, label: value, count })),
      insiderCount: insider,
    }
  }, [talks])

  const sections: FilterSection[] = useMemo(() => {
    const list: FilterSection[] = [
      { key: 'year', title: 'Year', defaultOpen: true, options: yearOptions },
      {
        key: 'speaker',
        title: 'Speaker',
        searchable: true,
        collapseAfter: 8,
        options: speakerOptions,
      },
    ]
    if (insiderCount > 0) {
      list.push({
        key: 'access',
        title: 'Access',
        defaultOpen: true,
        options: [{ value: 'insider', label: 'Insider only', count: insiderCount }],
      })
    }
    return list
  }, [yearOptions, speakerOptions, insiderCount])

  const filtered = useMemo(() => {
    const yearSel = selected.year ?? []
    const speakerSel = selected.speaker ?? []
    const insiderOnly = (selected.access ?? []).includes('insider')
    return talks.filter((t) => {
      if (yearSel.length > 0 && !yearSel.includes(yearOf(t.date))) return false
      if (
        speakerSel.length > 0 &&
        !t.speakerNames.some((n) => speakerSel.includes(n))
      )
        return false
      if (insiderOnly && !t.insiderOnly) return false
      return true
    })
  }, [talks, selected])

  // Reset naar pagina 1 zodra de filterselectie wijzigt.
  useEffect(() => {
    setPage(1)
  }, [selected])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters = Object.values(selected).some((v) => v.length > 0)

  function clearFilters() {
    setSelected({})
  }

  return (
    <>
      <FilterSidebar
        sections={sections}
        selected={selected}
        onChange={setSelected}
        onClearAll={clearFilters}
      />

      <div>
        {filtered.length === 0 ? (
          <EmptyState
            title="No talks match these filters"
            description="Try a different year or speaker, or clear the filters."
            actions={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="ov-grid-3">
              {pageItems.map((t) => (
                <ContentCard
                  key={t.id}
                  href={`/talks/${t.slug}`}
                  contentType="talk"
                  showTypeBadge={false}
                  thumbSrc={t.heroUrl}
                  thumbAlt={t.heroAlt}
                  eyebrow={formatDate(t.date)}
                  title={t.title}
                  meta={t.speakerNames.length > 0 ? t.speakerNames : undefined}
                  isInsiderOnly={t.insiderOnly}
                  actions={<CardBookmarkButton type="talks" itemId={t.id} />}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="ov-pagination">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}

        <RecentlyViewedRail entity="talks" variant="inline" />
      </div>
    </>
  )
}
