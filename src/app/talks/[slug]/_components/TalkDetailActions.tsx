'use client'

/**
 * TalkDetailActions
 * ----------------------------------------------------------------------
 * Talk-specifieke wrapper rond `<DetailActions>`. Levert Save + Share +
 * Add to board (Insider). GEEN Compare — dat is material-only. Mirror van
 * ArticleDetailActions.
 *
 * Sessie 7. Save-state is lokaal (placeholder) tot Johan een saved-API
 * levert — dezelfde aanpak als bij materials/articles.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { useAuth } from '@/components/providers/AuthContext'

export interface TalkDetailActionsProps {
  talkId: number
  talkSlug: string
  talkTitle: string
}

export function TalkDetailActions({
  talkId,
  talkSlug,
  talkTitle,
}: TalkDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()

  const [isSaved, setIsSaved] = useState(false)
  const [insiderGateOpen, setInsiderGateOpen] = useState(false)

  function handleRequireSignIn() {
    const next = `/talks/${talkSlug}`
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
        type="talk"
        itemId={talkId}
        shareTitle={talkTitle}
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
