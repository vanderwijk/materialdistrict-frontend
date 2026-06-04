'use client'

/**
 * BrandMaterialsGrid
 * ----------------------------------------------------------------------
 * "Materials by [Brand]"-sectie op de brand-detail-page. Volgt de mockup
 * `renderBrandDetail()`:
 *
 *   Materials by [Brand]  (12)                       View all →
 *   ┌──────────┐ ┌──────────┐ ┌──────────┐
 *   │ MaterialCard (max 3)                  │
 *   └──────────┘ └──────────┘ └──────────┘
 *
 * Toont maximaal 3 materials (mockup-conform). "View all →" verschijnt
 * alleen bij meer dan 3 en linkt naar het materials-overzicht gefilterd
 * op deze brand.
 *
 * Client-component omdat <MaterialCard> gating-callbacks heeft (Save =
 * login-required, Compare = Insider-only) en `useAuth()` nodig is. De
 * CompareBar zelf leeft op layout-niveau (`/brands/[slug]/layout.tsx`
 * wrapt een <CompareProvider>, net als /materials). Gedeelde compare-
 * state werkt daardoor over de hele brands-subtree.
 *
 * Lege staat: als de brand geen materials heeft, toont een nette
 * placeholder ("No materials listed yet.").
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MaterialCard, InsiderGate } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import type { MaterialListItem } from '@/types/material'

export interface BrandMaterialsGridProps {
  brandName: string
  brandSlug: string
  /** Alle (of de eerste pagina) materials van dit brand. */
  materials: MaterialListItem[]
  /** Totaal aantal materials van dit brand (voor de count + View all). */
  totalCount: number
  /** Hoeveel cards maximaal tonen. Default 3 (mockup). */
  maxVisible?: number
}

export function BrandMaterialsGrid({
  brandName,
  brandSlug,
  materials,
  totalCount,
  maxVisible = 3,
}: BrandMaterialsGridProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  const [insiderGateOpen, setInsiderGateOpen] = useState(false)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)

  const visible = materials.slice(0, maxVisible)
  const hasMore = totalCount > maxVisible

  const handleRequireSignIn = () => {
    router.push(`/sign-in?next=${encodeURIComponent(`/brands/${brandSlug}`)}`)
  }

  const handleRequireInsider = () => {
    setInsiderGateOpen(true)
  }

  const handleCompareLimit = () => {
    setLimitNotice('You can compare up to 3 materials at a time.')
    window.setTimeout(() => setLimitNotice(null), 4000)
  }

  return (
    <section className="brand-materials" aria-labelledby="brand-materials-title">
      <header className="brand-materials-header">
        <h2 id="brand-materials-title" className="brand-materials-title">
          Materials by {brandName}
          {totalCount > 0 && (
            <span className="brand-materials-count"> ({totalCount})</span>
          )}
        </h2>
        {hasMore && (
          <Link
            href={`/materials?brand=${brandSlug}`}
            className="brand-materials-viewall"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        )}
      </header>

      {limitNotice && (
        <div className="form-banner is-info" role="status">
          {limitNotice}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="brand-materials-grid">
          {visible.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              isLoggedIn={isLoggedIn}
              isMember={isMember}
              isSaved={isSaved('materials', m.id)}
              onRequireSignIn={handleRequireSignIn}
              onRequireInsider={handleRequireInsider}
              onToggleSave={(id) => toggleBookmark('materials', id)}
              onCompareLimitReached={handleCompareLimit}
            />
          ))}
        </div>
      ) : (
        <p className="brand-materials-empty">No materials listed yet.</p>
      )}

      <InsiderGate
        variant="modal"
        feature="compare"
        open={insiderGateOpen}
        onClose={() => setInsiderGateOpen(false)}
      />
    </section>
  )
}
