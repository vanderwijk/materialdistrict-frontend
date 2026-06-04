'use client'

/**
 * ArticleDetailActions
 * ----------------------------------------------------------------------
 * Article-specifieke wrapper rond `<DetailActions>`. Levert Save + Share +
 * Add to board (Insider). GEEN Compare — dat is material-only.
 *
 * Sessie 6. Parallel aan MaterialDetailActions, maar zonder compare:
 *  - `includeCompare` blijft default (false).
 *  - `groupInsiderActions` uit: de article-row is korter (Save · Share ·
 *    Add to board) en hoeft niet in twee groepen gesplitst.
 *
 * Save-state is lokaal (placeholder) tot Johan een saved-API levert —
 * dezelfde aanpak als bij materials.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import { BoardPickerModal } from '@/components/ui/BoardPickerModal'

export interface ArticleDetailActionsProps {
  articleId: number
  articleSlug: string
  articleTitle: string
}

export function ArticleDetailActions({
  articleId,
  articleSlug,
  articleTitle,
}: ArticleDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  const [insiderGateOpen, setInsiderGateOpen] = useState(false)
  const [boardPickerOpen, setBoardPickerOpen] = useState(false)

  function handleRequireSignIn() {
    const next = `/articles/${articleSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleRequireInsider() {
    setInsiderGateOpen(true)
  }

  function handleToggleSave() {
    toggleBookmark('articles', articleId)
  }

  function handleAddToBoard() {
    setBoardPickerOpen(true)
  }

  return (
    <>
      <DetailActions
        type="article"
        itemId={articleId}
        shareTitle={articleTitle}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved('articles', articleId)}
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
        type="articles"
        itemId={articleId}
        title={articleTitle}
      />
    </>
  )
}
