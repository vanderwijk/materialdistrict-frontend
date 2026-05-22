'use client'

/**
 * MaterialDetailActions
 * ----------------------------------------------------------------------
 * Material-specifieke wrapper rond `<DetailActions>`. Levert de save +
 * compare-handlers en de gating-callbacks (sign-in voor anonieme users,
 * Insider-modal voor non-members).
 *
 * Sessie 4 batch 3 — initial.
 * Sessie 7 fix Punt 14: zet `groupInsiderActions` aan zodat de
 * action-row in twee groepen wordt gerenderd: [Save] [Share] aan
 * de linkerkant, [Add to board] [Compare] aan de rechterkant. Dat
 * matched de mockup en scheidt visueel gratis acties van Insider-
 * acties.
 *
 * Save-state is lokaal (placeholder) tot Johan een saved-API levert —
 * dezelfde aanpak als in `MaterialsGrid`.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { useAuth } from '@/components/providers/AuthContext'
import { useCompare } from '@/lib/hooks/useCompare'

export interface MaterialDetailActionsProps {
  materialId: number
  materialSlug: string
  materialTitle: string
}

export function MaterialDetailActions({
  materialId,
  materialSlug,
  materialTitle,
}: MaterialDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isInCompare, toggleCompare } = useCompare()
  const inCompare = isInCompare(materialId)

  const [isSaved, setIsSaved] = useState(false)
  const [insiderGateOpen, setInsiderGateOpen] = useState<
    'boards' | 'compare' | null
  >(null)

  function handleRequireSignIn() {
    const next = `/materials/${materialSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleRequireInsider(feature: 'boards' | 'compare') {
    setInsiderGateOpen(feature)
  }

  function handleToggleSave() {
    setIsSaved((s) => !s)
  }

  function handleAddToBoard() {
    // Placeholder — boards-API komt in latere sessie.
  }

  function handleToggleCompare() {
    toggleCompare(materialId)
  }

  return (
    <>
      <DetailActions
        type="material"
        itemId={materialId}
        shareTitle={materialTitle}
        includeCompare
        isInCompareList={inCompare}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved}
        onRequireSignIn={handleRequireSignIn}
        onRequireInsider={handleRequireInsider}
        onToggleSave={handleToggleSave}
        onAddToBoard={handleAddToBoard}
        onToggleCompare={handleToggleCompare}
        groupInsiderActions
      />

      <InsiderGate
        variant="modal"
        open={insiderGateOpen !== null}
        onClose={() => setInsiderGateOpen(null)}
        feature={insiderGateOpen ?? 'compare'}
      />
    </>
  )
}
