'use client'

/**
 * MaterialCard — material-specifieke variant van ContentCard.
 *
 * Sessie 4 batch 2.
 *
 * Wat het is:
 *  - Een dunne wrapper rond `<ContentCard contentType="material">`
 *  - Mapt `MaterialListItem` (uit `@/types/material`) naar de
 *    `ContentCard`-props (eyebrow=brandName, hero, etc.)
 *  - Voegt twee actie-knoppen toe als card-thumb-overlay: Save + Compare
 *  - Beide knoppen hebben Insider/login-gating (callback-style; UI-feedback
 *    is verantwoordelijkheid van de aanroeper)
 *  - Compare-state komt uit `useCompare()` (gedeeld met CompareBar)
 *
 * Wat het NIET is:
 *  - Geen eigen CSS-klasse `.material-card` — DRY-regel, alle styling via
 *    bestaande `.card-*` en `.content-card-*` klassen
 *  - Geen featured_image-fetch — die zit al in de data-laag
 *    (`listMaterialsWithFacets` lost hero op via batch-fetch)
 *  - Geen channel-overlay-tags in v1 — `MaterialListItem` heeft geen
 *    channel-velden meer (channels zitten op de theme-taxonomie en worden
 *    in batch 3 niet meegegeven aan de card; als gewenst voegen we ze later
 *    toe via een `channels`-prop)
 *
 * Open punt (W13): de FacetWP-labels worden in batch 3 leidend voor de
 * filter-UI. Voor de card hebben we (nog) geen humanized properties nodig —
 * de card toont alleen titel, brand en hero. De `properties` uit
 * `MaterialListItem` zijn beschikbaar maar onbenut tot we besluiten ze in
 * de card op te nemen.
 */

import { useCallback } from 'react'
import type { MaterialListItem } from '@/types/material'
import { useCompare } from '@/lib/hooks/useCompare'
import { ActionButton } from './ActionButton'
import { ContentCard } from './ContentCard'
import { IconCompare, IconSave } from './icons'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialCardProps {
  /** Het material-item. */
  material: MaterialListItem
  /**
   * Of de gebruiker is ingelogd. Gating voor Save (login-required) en
   * Compare (Insider-only via gating-callback).
   */
  isLoggedIn?: boolean
  /** Of de gebruiker een Insider is. Gating voor Compare. */
  isMember?: boolean
  /**
   * Of dit material in de huidige user's saved-list staat. Controlled-only;
   * MaterialCard zelf houdt geen save-state bij.
   *
   * Wordt in batch 3 doorgegeven vanaf de page (saved-list uit auth-context
   * of dedicated saved-API). Voor nu mag deze undefined zijn — dan toont de
   * knop de niet-actieve state.
   */
  isSaved?: boolean
  /**
   * Aangeroepen wanneer een niet-ingelogde gebruiker op Save of Compare klikt.
   * Aanroeper laat typisch de sign-in-flow zien.
   */
  onRequireSignIn?: () => void
  /**
   * Aangeroepen wanneer een ingelogde non-Insider op Compare klikt.
   * Aanroeper opent de InsiderGate-modal met `feature="compare"`.
   */
  onRequireInsider?: () => void
  /**
   * Save-toggle. Wordt aangeroepen na de login-gate. Verantwoordelijkheid
   * van de aanroeper om door te zetten naar de back-end.
   */
  onToggleSave?: (materialId: number) => void
  /**
   * Aangeroepen wanneer Compare-toggle een limit-reached oplevert.
   * Aanroeper toont typisch een toast/banner ("Up to 3 materials at a time").
   */
  onCompareLimitReached?: () => void
  /** Optionele extra className op de card-wrapper. */
  className?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialCard({
  material,
  isLoggedIn = false,
  isMember = false,
  isSaved = false,
  onRequireSignIn,
  onRequireInsider,
  onToggleSave,
  onCompareLimitReached,
  className,
}: MaterialCardProps) {
  const { isInCompare, toggleCompare } = useCompare()
  const inCompare = isInCompare(material.id)

  // Save: login-required. Niet Insider-only volgens sessie 4 gating-decision.
  const handleSave = useCallback(() => {
    if (!isLoggedIn) {
      onRequireSignIn?.()
      return
    }
    onToggleSave?.(material.id)
  }, [isLoggedIn, onRequireSignIn, onToggleSave, material.id])

  // Compare: login-required én Insider-only.
  const handleCompare = useCallback(() => {
    if (!isLoggedIn) {
      onRequireSignIn?.()
      return
    }
    if (!isMember) {
      onRequireInsider?.()
      return
    }
    const result = toggleCompare(material.id)
    if (result === 'limit-reached') {
      onCompareLimitReached?.()
    }
  }, [
    isLoggedIn,
    isMember,
    onRequireSignIn,
    onRequireInsider,
    toggleCompare,
    material.id,
    onCompareLimitReached,
  ])

  // Image-fallback (W4): MediaImage.alt is leeg op gemiddelde OBRO-attachments,
  // dus material-titel als fallback. De derde laag (generieke "Material image")
  // niet nodig — als hero ontbreekt rendert ContentCard een lege thumb met
  // alleen de Tag-overlay, geen img-element met een alt-tekst.
  const thumbAlt = material.hero?.alt?.trim() || material.title

  // Hero source: middle-grootte voor cards is meest economisch.
  // Image-sizes (zie session-log sessie 2):
  //   medium     600×400
  //   medium_large 768×512  ← gekozen: scherp genoeg voor retina-cards
  //   large      960×640
  const thumbSrc =
    material.hero?.sizes?.medium_large?.url ??
    material.hero?.sizes?.large?.url ??
    material.hero?.sizes?.medium?.url ??
    material.hero?.sourceUrl

  return (
    <ContentCard
      href={material.link.startsWith('/') ? material.link : `/materials/${material.slug}`}
      contentType="material"
      thumbSrc={thumbSrc}
      thumbAlt={thumbAlt}
      eyebrow={material.brandName ?? undefined}
      title={material.title}
      className={className}
      actions={
        <>
          <ActionButton
            size="sm"
            icon={
              <IconSave
                size={14}
                strokeWidth={2}
                fill={isSaved ? 'currentColor' : 'none'}
              />
            }
            ariaLabel={isSaved ? 'Remove from saved' : 'Save material'}
            isActive={isSaved}
            onClick={handleSave}
          />
          <ActionButton
            size="sm"
            icon={<IconCompare size={14} strokeWidth={2.5} />}
            ariaLabel={inCompare ? 'Remove from compare' : 'Add to compare'}
            isActive={inCompare}
            onClick={handleCompare}
          />
        </>
      }
    />
  )
}
