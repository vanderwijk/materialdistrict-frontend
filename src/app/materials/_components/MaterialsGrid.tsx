'use client'

/**
 * MaterialsGrid — client-component die de grid van `<MaterialCard>` rendert
 * plus de CompareBar onderaan, en de twee gating-modals (sign-in voor Save,
 * Insider voor Compare) coördineert.
 *
 * Sessie 4 batch 3.
 *
 * Waarom client? Drie redenen:
 *  1. MaterialCard heeft callback-handlers (onRequireSignIn, onRequireInsider,
 *     onToggleSave, onCompareLimitReached) die alleen in een client-tree
 *     werken.
 *  2. We hebben de huidige user uit `useAuth()` nodig om Save/Compare
 *     correct te gaten.
 *  3. CompareBar leest de gedeelde compare-state via `useCompare()` —
 *     ook client.
 *
 * Lifting state:
 *  - InsiderGate modal-open state — één modal voor de hele grid
 *  - Sample limit-reached banner — kort getoond bij overschrijding van
 *    MAX_COMPARE
 *  - Saved state — placeholder voor nu (in v2 uit `useAuth()` of een
 *    dedicated saved-API). Sessie 4 toont alleen UI-toggle zonder back-end
 *    persistence.
 *
 * MaterialsById Map wordt eenmalig opgebouwd voor de CompareBar zodat die
 * de thumbs/titels van de geselecteerde materials kan tonen. Bij navigatie
 * naar een andere page verliezen we items die buiten de huidige grid
 * vallen — fallback in CompareBar toont dan "Material #id".
 */

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CompareBar, MaterialCard, InsiderGate } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import type { MaterialListItem } from '@/types/material'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialsGridProps {
  items: MaterialListItem[]
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialsGrid({ items }: MaterialsGridProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()

  // Modal-state: één gate voor de hele grid
  const [insiderGateOpen, setInsiderGateOpen] = useState(false)

  // Limit-reached banner (boven de grid). Verdwijnt automatisch na 4s.
  const [limitNotice, setLimitNotice] = useState<string | null>(null)

  // Saved-state placeholder — sessie 4 heeft nog geen saved-API.
  // Klik op Save toont een visuele toggle maar persisteert niets.
  // Vervangen in een sessie zodra Johan een /saved-endpoint heeft.
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())

  // Materials-map voor CompareBar (id → MaterialListItem)
  const materialsById = useMemo(() => {
    const map = new Map<number, MaterialListItem>()
    for (const item of items) {
      map.set(item.id, item)
    }
    return map
  }, [items])

  const handleRequireSignIn = () => {
    // Sign-in flow zit in sessie 11. Voor nu navigeren naar /sign-in
    // met de huidige path als `next` zodat de user na inloggen terugkomt.
    const path =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/materials'
    router.push(`/sign-in?next=${encodeURIComponent(path)}`)
  }

  const handleRequireInsider = () => {
    setInsiderGateOpen(true)
  }

  const handleToggleSave = (materialId: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(materialId)) {
        next.delete(materialId)
      } else {
        next.add(materialId)
      }
      return next
    })
  }

  const handleCompareLimitReached = () => {
    setLimitNotice(
      'You can compare up to 3 materials at a time. Remove one to add another.',
    )
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setLimitNotice(null), 4000)
    }
  }

  return (
    <>
      {limitNotice && (
        <div
          className="form-banner is-info"
          role="status"
          aria-live="polite"
          style={{ marginBottom: 16 }}
        >
          {limitNotice}
        </div>
      )}

      <div className="ov-grid-3">
        {items.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            isLoggedIn={isLoggedIn}
            isMember={isMember}
            isSaved={savedIds.has(material.id)}
            onRequireSignIn={handleRequireSignIn}
            onRequireInsider={handleRequireInsider}
            onToggleSave={handleToggleSave}
            onCompareLimitReached={handleCompareLimitReached}
          />
        ))}
      </div>

      {/* CompareBar — leest compare-state uit de Provider (layout.tsx) */}
      <CompareBar materialsById={materialsById} />

      {/* Eén Insider-gate-modal voor de hele grid */}
      <InsiderGate
        variant="modal"
        open={insiderGateOpen}
        onClose={() => setInsiderGateOpen(false)}
        feature="compare"
      />
    </>
  )
}
