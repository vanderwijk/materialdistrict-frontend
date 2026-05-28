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

  const [isSaved, setIsSaved] = useState(false)
  const [insiderGateOpen, setInsiderGateOpen] = useState(false)

  function handleRequireSignIn() {
    const next = `/articles/${articleSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleRequireInsider() {
    setInsiderGateOpen(true)
  }

  function handleToggleSave() {
    setIsSaved((s) => !s)
  }

  function handleAddToBoard() {
    // Placeholder — boards-API komt in latere sessie.
  }

  return (
    <>
      <DetailActions
        type="article"
        itemId={articleId}
        shareTitle={articleTitle}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved}
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
    </>
  )
}
