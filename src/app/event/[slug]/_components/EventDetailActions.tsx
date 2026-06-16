'use client'

/**
 * EventDetailActions
 * ----------------------------------------------------------------------
 * Event-specifieke wrapper rond `<DetailActions>`. Tot nu toe gebruikte de
 * event-detailpagina `<DetailActions>` direct (server-rendered), waardoor de
 * Save-knop alleen een lokale, niet-persistente toggle was. Deze client-
 * wrapper sluit Save aan op de echte bookmark-state (`useBookmarks`), net als
 * bij materials/articles/talks.
 *
 * De optionele `customPrimary` (de Register/Visit-knop) wordt door de
 * server-page als element doorgegeven en hier vóór de acties getoond.
 * GEEN Compare — dat is material-only.
 */

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import { BoardPickerModal } from '@/components/ui/BoardPickerModal'

export interface EventDetailActionsProps {
  eventId: number
  eventSlug: string
  eventTitle: string
  /** Register/Visit-knop uit de server-page (optioneel). */
  customPrimary?: ReactNode
}

export function EventDetailActions({
  eventId,
  eventSlug,
  eventTitle,
  customPrimary,
}: EventDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  const [insiderGateOpen, setInsiderGateOpen] = useState(false)
  const [boardPickerOpen, setBoardPickerOpen] = useState(false)

  function handleRequireSignIn() {
    const next = `/event/${eventSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleRequireInsider() {
    setInsiderGateOpen(true)
  }

  function handleToggleSave() {
    toggleBookmark('events', eventId)
  }

  function handleAddToBoard() {
    setBoardPickerOpen(true)
  }

  return (
    <>
      <DetailActions
        type="event"
        itemId={eventId}
        shareTitle={eventTitle}
        customPrimary={customPrimary}
        isLoggedIn={isLoggedIn}
        isMember={isMember}
        isSaved={isSaved('events', eventId)}
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
        type="events"
        itemId={eventId}
        title={eventTitle}
      />
    </>
  )
}
