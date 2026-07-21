'use client'

/**
 * BrandDetailActions — Save, Share, and Add to board (Insider).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { BoardPickerModal } from '@/components/ui/BoardPickerModal'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

export interface BrandDetailActionsProps {
  brandId: number
  brandSlug: string
  brandName: string
}

export function BrandDetailActions({
  brandId,
  brandSlug,
  brandName,
}: BrandDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  const [insiderGateOpen, setInsiderGateOpen] = useState(false)
  const [boardPickerOpen, setBoardPickerOpen] = useState(false)

  function handleRequireSignIn() {
    router.push(`/sign-in?next=${encodeURIComponent(`/brand/${brandSlug}`)}`)
  }

  function handleRequireInsider() {
    setInsiderGateOpen(true)
  }

  function handleToggleSave() {
    toggleBookmark('brands', brandId)
  }

  function handleAddToBoard() {
    setBoardPickerOpen(true)
  }

  return (
    <>
      <DetailActions
        type="brand"
        itemId={brandId}
        shareTitle={brandName}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved('brands', brandId)}
        onRequireSignIn={handleRequireSignIn}
        onRequireInsider={handleRequireInsider}
        onToggleSave={handleToggleSave}
        onAddToBoard={handleAddToBoard}
      />

      <InsiderGate
        variant="modal"
        open={insiderGateOpen}
        onClose={() => setInsiderGateOpen(false)}
        feature="boards"
      />

      <BoardPickerModal
        open={boardPickerOpen}
        onClose={() => setBoardPickerOpen(false)}
        type="brands"
        itemId={brandId}
        title={brandName}
      />
    </>
  )
}
