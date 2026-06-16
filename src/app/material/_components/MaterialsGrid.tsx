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

import { useEffect, useMemo, useState } from 'react'
import { CompareBar, MaterialCard, InsiderGate } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import { useGateNotice } from '@/components/ui'
import { useCompare } from '@/lib/hooks/useCompare'
import type { MaterialListItem } from '@/types/material'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialsGridProps {
  items: MaterialListItem[]
  searchTerm?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialsGrid({ items, searchTerm }: MaterialsGridProps) {
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()
  const { notifyLogin, notifySaved } = useGateNotice()
  const { compareIds, registerCompareMaterial } = useCompare()

  // Modal-state: één gate voor de hele grid
  const [insiderGateOpen, setInsiderGateOpen] = useState(false)

  // Limit-reached banner (boven de grid). Verdwijnt automatisch na 4s.
  const [limitNotice, setLimitNotice] = useState<string | null>(null)

  // Materials-map voor CompareBar (id → MaterialListItem)
  const materialsById = useMemo(() => {
    const map = new Map<number, MaterialListItem>()
    for (const item of items) {
      map.set(item.id, item)
    }
    return map
  }, [items])

  // Verrijk compare-slots voor materials op de huidige grid-pagina.
  useEffect(() => {
    const compareSet = new Set(compareIds)
    for (const item of items) {
      if (!compareSet.has(item.id)) continue
      registerCompareMaterial({
        id: item.id,
        title: item.title,
        brandName: item.brandName,
        hero: item.hero,
        slug: item.slug,
        link: item.link.startsWith('/') ? item.link : `/material/${item.slug}`,
      })
    }
  }, [items, compareIds, registerCompareMaterial])

  const handleRequireSignIn = () => {
    // §F2.7 (punt 4): geen directe redirect meer naar /sign-in. Toon een
    // korte melding met "Sign in"-link; de bezoeker blijft op het overzicht.
    notifyLogin('Sign in to save materials to your account.')
  }

  const handleRequireInsider = () => {
    setInsiderGateOpen(true)
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
            isSaved={isSaved('materials', material.id)}
            onRequireSignIn={handleRequireSignIn}
            onRequireInsider={handleRequireInsider}
            onToggleSave={(id) => {
              const willAdd = !isSaved('materials', id)
              toggleBookmark('materials', id)
              if (willAdd) notifySaved({ type: 'materials', itemId: id })
            }}
            onCompareLimitReached={handleCompareLimitReached}
            searchTerm={searchTerm}
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
