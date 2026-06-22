'use client'

/**
 * CardCompareButton — gedeelde Compare-knop voor material-tegels.
 *
 * Tot nu toe had alleen de `MaterialCard` (overzichtspagina's) een Compare-
 * overlay. De homepage rendert material-tegels via de generieke `ContentCard`
 * en miste daardoor de Compare-knop — alleen Save stond erop. Deze component
 * levert dezelfde Compare-actie als los knopje, te plaatsen náást
 * `CardBookmarkButton` in de `actions`-slot van een ContentCard.
 *
 * Gating (consistent met MaterialCard, §F2.7): Compare is een Insider-feature.
 * Niet-members (incl. niet-ingelogd) krijgen een niet-blokkerende GateNotice,
 * geen directe redirect. Vol (>= MAX_COMPARE) → een korte melding.
 *
 * Werkt alleen mee aan de compare-state als er een `CompareProvider` boven in
 * de tree zit (de homepage krijgt die via `(home)/layout.tsx`). Zonder provider
 * is `toggleCompare` een no-op (useCompare valt terug op NOOP_VALUE).
 *
 * `withOverlay`:
 *  - `false` (default): kale knop — voor `<ContentCard actions={…} />`, dat zelf
 *    al een `.card-thumb-overlay` rendert.
 *  - `true`: eigen `.card-thumb-overlay`-wrapper — voor bespoke kaarten.
 */

import type { MouseEvent } from 'react'
import { ActionButton } from './ActionButton'
import { IconCompare } from './icons'
import { useAuth } from '@/components/providers/AuthContext'
import {
  useCompare,
  MAX_COMPARE,
  type CompareMaterialSnapshot,
} from '@/lib/hooks/useCompare'
import { useGateNotice } from './GateNotice'

export interface CardCompareButtonProps {
  /** Material-metadata (id + velden voor de compare-slot). */
  material: CompareMaterialSnapshot
  /** Wikkel de knop in een eigen overlay-container (bespoke kaarten). */
  withOverlay?: boolean
}

export function CardCompareButton({
  material,
  withOverlay = false,
}: CardCompareButtonProps) {
  const { isMember } = useAuth()
  const { isInCompare, toggleCompare } = useCompare()
  const { notify } = useGateNotice()
  const inCompare = isInCompare(material.id)

  // preventDefault + stopPropagation: de knop ligt als overlay binnen de
  // card-Link; zonder dit navigeert de kaart en lijkt Compare niets te doen.
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Compare is een Insider-feature (consistent met MaterialCard).
    if (!isMember) {
      notify('Compare is an Insider feature. Become an Insider to compare materials.')
      return
    }
    const result = toggleCompare(material.id, material)
    if (result === 'limit-reached') {
      notify(`You can compare up to ${MAX_COMPARE} materials.`)
    }
  }

  const btn = (
    <ActionButton
      size="sm"
      icon={<IconCompare size={14} strokeWidth={2.5} />}
      ariaLabel={inCompare ? 'Remove from compare' : 'Add to compare'}
      isActive={inCompare}
      onClick={onClick}
    />
  )

  if (!withOverlay) return btn
  return <div className="card-thumb-overlay">{btn}</div>
}
