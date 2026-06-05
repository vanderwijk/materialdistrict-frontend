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
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import { BoardPickerModal } from '@/components/ui/BoardPickerModal'
import { useCompare, type CompareMaterialSnapshot } from '@/lib/hooks/useCompare'
import type { MediaImage } from '@/types/media'

export interface MaterialDetailActionsProps {
  materialId: number
  materialSlug: string
  materialTitle: string
  brandName?: string | null
  hero?: MediaImage | null
}

export function MaterialDetailActions({
  materialId,
  materialSlug,
  materialTitle,
  brandName = null,
  hero = null,
}: MaterialDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()
  const { isInCompare, toggleCompare } = useCompare()
  const inCompare = isInCompare(materialId)

  const [insiderGateOpen, setInsiderGateOpen] = useState<
    'boards' | 'compare' | null
  >(null)
  const [boardPickerOpen, setBoardPickerOpen] = useState(false)

  function handleRequireSignIn() {
    const next = `/materials/${materialSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleRequireInsider(feature: 'boards' | 'compare') {
    setInsiderGateOpen(feature)
  }

  function handleToggleSave() {
    toggleBookmark('materials', materialId)
  }

  function handleAddToBoard() {
    setBoardPickerOpen(true)
  }

  function handleToggleCompare() {
    const snapshot: CompareMaterialSnapshot = {
      id: materialId,
      title: materialTitle,
      brandName,
      hero,
      slug: materialSlug,
      link: `/materials/${materialSlug}`,
    }
    toggleCompare(materialId, snapshot)
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
        isSaved={isSaved('materials', materialId)}
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

      <BoardPickerModal
        open={boardPickerOpen}
        onClose={() => setBoardPickerOpen(false)}
        type="materials"
        itemId={materialId}
        title={materialTitle}
      />
    </>
  )
}
