'use client'

/**
 * CardBookmarkButton — gedeelde Save-knop voor overzicht-kaarten (§F2.7).
 *
 * Tot nu toe had alleen de MaterialCard een Save/Compare-overlay. De
 * andere overzicht-kaarten (stories, brands, events, talks) misten een
 * bookmark-knop. Deze component levert die in één keer, gewired op de
 * gedeelde `useBookmarks()`-state (die alle content-types ondersteunt:
 * materials/articles/brands/talks/events/books).
 *
 * Gating (punt 4): klik door een niet-ingelogde bezoeker toont een
 * `GateNotice`-melding met "Sign in"-link i.p.v. een directe redirect.
 *
 * `withOverlay`:
 *  - `false` (default): geef de kale knop terug — voor `<ContentCard
 *    actions={…} />`, dat zelf al een `.card-thumb-overlay` rendert.
 *  - `true`: wikkel de knop in een eigen `.card-thumb-overlay` — voor
 *    bespoke kaarten (EventCard, BrandTile) zonder ContentCard-overlay.
 */

import type { MouseEvent } from 'react'
import { ActionButton } from './ActionButton'
import { IconSave } from './icons'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import { useGateNotice } from './GateNotice'
import type { BookmarkType } from '@/types/dashboard'

export interface CardBookmarkButtonProps {
  type: BookmarkType
  itemId: number
  /** Wikkel de knop in een eigen overlay-container (bespoke kaarten). */
  withOverlay?: boolean
}

export function CardBookmarkButton({
  type,
  itemId,
  withOverlay = false,
}: CardBookmarkButtonProps) {
  const { isLoggedIn } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()
  const { notifyLogin, notifySaved } = useGateNotice()
  const saved = isSaved(type, itemId)

  // preventDefault + stopPropagation: de knop ligt als overlay binnen de
  // card-Link; zonder dit navigeert de kaart en lijkt Save niets te doen.
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      notifyLogin('Sign in to save this to your account.')
      return
    }
    const willAdd = !saved
    toggleBookmark(type, itemId)
    // §F2.7-B2: na toevoegen een toast met "Add to board"-actie (hybride).
    if (willAdd) notifySaved({ type, itemId })
  }

  const btn = (
    <ActionButton
      size="sm"
      icon={
        <IconSave
          size={14}
          strokeWidth={2}
          fill={saved ? 'currentColor' : 'none'}
        />
      }
      ariaLabel={saved ? 'Remove from saved' : 'Save'}
      isActive={saved}
      onClick={onClick}
    />
  )

  if (!withOverlay) return btn
  return <div className="card-thumb-overlay">{btn}</div>
}
