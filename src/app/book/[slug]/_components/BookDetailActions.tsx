'use client'

/**
 * BookDetailActions — Save, Share, and Add to board (Insider).
 * Books are WooCommerce products; bookmark/board type is `books`.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { BoardPickerModal } from '@/components/ui/BoardPickerModal'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

export interface BookDetailActionsProps {
  bookId: number
  bookSlug: string
  bookTitle: string
}

export function BookDetailActions({
  bookId,
  bookSlug,
  bookTitle,
}: BookDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  const [insiderGateOpen, setInsiderGateOpen] = useState(false)
  const [boardPickerOpen, setBoardPickerOpen] = useState(false)

  function handleRequireSignIn() {
    router.push(`/sign-in?next=${encodeURIComponent(`/book/${bookSlug}`)}`)
  }

  function handleRequireInsider() {
    setInsiderGateOpen(true)
  }

  function handleToggleSave() {
    toggleBookmark('books', bookId)
  }

  function handleAddToBoard() {
    setBoardPickerOpen(true)
  }

  return (
    <>
      <DetailActions
        type="book"
        itemId={bookId}
        shareTitle={bookTitle}
        includeCompare={false}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved('books', bookId)}
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
        type="books"
        itemId={bookId}
        title={bookTitle}
      />
    </>
  )
}
