'use client'

/**
 * TalksBrowser — grid + client-side jaar/spreker-filter + paginatie voor het
 * talks-overzicht (§F2.10 P14.1).
 *
 * Krijgt de volledige (server-gefilterde op channel + zoekterm) talks-set in
 * één keer mee en filtert hier client-side op jaar en spreker — de twee enige
 * zinvolle filters voor talks in v1. Gespiegeld op EventsBrowser:
 * channel/zoekterm blijven URL-/server-gedreven via de gedeelde ChannelBarNav;
 * jaar + spreker zijn de client-filters. Paginatie en de recently-viewed rail
 * staan onderaan (gedeelde componenten).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  EmptyState,
  Button,
  Pagination,
  ContentCard,
  RecentlyViewedRail,
} from '@/components/ui'
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
  const [year, setYear] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [page, setPage] = useState(1)

  // Filter-opties afgeleid uit de geladen set.
  const yearOptions = useMemo(() => {
    const set = new Set<string>()
    talks.forEach((t) => {
      const y = yearOf(t.date)
      if (y) set.add(y)
    })
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [talks])

  const speakerOptions = useMemo(() => {
    const set = new Set<string>()
    talks.forEach((t) => t.speakerNames.forEach((n) => n && set.add(n)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [talks])

  const filtered = useMemo(
    () =>
      talks.filter((t) => {
        if (year && yearOf(t.date) !== year) return false
        if (speaker && !t.speakerNames.includes(speaker)) return false
        return true
      }),
    [talks, year, speaker],
  )

  // Reset naar pagina 1 zodra een filter wijzigt.
  useEffect(() => {
    setPage(1)
  }, [year, speaker])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasActiveFilters = Boolean(year) || Boolean(speaker)

  function clearFilters() {
    setYear('')
    setSpeaker('')
  }

  return (
    <>
      <div className="talks-filterbar">
        <div className="talks-filter-group">
          <label className="talks-filter-label" htmlFor="talks-filter-year">
            Year
          </label>
          <select
            id="talks-filter-year"
            className="talks-filter-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="talks-filter-group">
          <label className="talks-filter-label" htmlFor="talks-filter-speaker">
            Speaker
          </label>
          <select
            id="talks-filter-speaker"
            className="talks-filter-select"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
          >
            <option value="">All speakers</option>
            {speakerOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="talks-filter-clear"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}

        <span className="talks-filter-count">
          {filtered.length} {filtered.length === 1 ? 'talk' : 'talks'}
        </span>
      </div>

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
    </>
  )
}
