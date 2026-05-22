'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ActionButton } from './ActionButton'
import {
  IconSave,
  IconBoard,
  IconCompare,
  IconShare,
  InsiderIcon,
} from './icons'

// ============================================================
// Types
// ============================================================

interface DetailActionsProps {
  /** Content-type — voor analytics/share-flow. */
  type: 'material' | 'article' | 'event' | 'book' | 'brand' | 'talk'
  /** Item ID — gebruikt voor Compare en evt. analytics. */
  itemId?: number
  /** Title voor `navigator.share()`. Default: document.title. */
  shareTitle?: string
  /** Toon Compare-knop — alleen voor materials. Default: false. */
  includeCompare?: boolean
  /** Of het item al in de compare-lijst staat. */
  isInCompareList?: boolean
  /** Of de gebruiker is ingelogd. */
  isLoggedIn?: boolean
  /** Of de gebruiker een Insider-member is. */
  isMember?: boolean
  /** Callback wanneer een niet-ingelogde user op Save klikt. */
  onRequireSignIn?: () => void
  /** Callback wanneer een non-member op een Insider-feature klikt. */
  onRequireInsider?: (feature: 'boards' | 'compare') => void
  /** Save-toggle — controlled. Afwezig = lokale state. */
  isSaved?: boolean
  /** Save-handler. */
  onToggleSave?: () => void
  /** Add-to-board-handler. */
  onAddToBoard?: () => void
  /** Compare-toggle-handler. */
  onToggleCompare?: () => void
  /** Optionele primaire knop die als eerste wordt getoond. */
  customPrimary?: ReactNode
  /**
   * Sessie 7 fix Punt 14: split de action-row in twee groepen met
   * visuele gap ertussen.
   *  - Linker groep (gratis acties): customPrimary · Save · Share
   *  - Rechter groep (Insider acties): Add to board · Compare
   * Op mobile wrappen de groepen onder elkaar in 2 rijen.
   * Default false → bestaande ordening blijft intact voor andere
   * detail-pagina's (article/event/book).
   */
  groupInsiderActions?: boolean
  className?: string
}

// ============================================================
// Component
// ============================================================

/**
 * DetailActions — universele action-row voor detail-pagina's.
 *
 * Knoppen (in volgorde): customPrimary (optioneel) · Save · Add to board ·
 * Compare (alleen materials) · Share.
 *
 * Insider-features (Boards, Compare) tonen een Insider-mark voor non-members
 * en triggeren via `onRequireInsider` de Insider-gate.
 *
 * Iconen via de centrale icon-registry (`./icons`):
 *   Save = IconSave (Bookmark) — gevuld als isSaved
 *   Board = IconBoard (Folder)
 *   Compare = IconCompare (BarChart2 — drie staafjes verschillende hoogtes)
 *   Share = IconShare (Share2)
 *
 * Gemodelleerd op `detailActions()` uit MaterialDistrict_MockUp_DEF.html.
 * Sinds batch I gebruikt deze de generieke <ActionButton /> in plaats van een
 * eigen .detail-action klasse.
 */
export function DetailActions({
  type: _type,
  itemId,
  shareTitle,
  includeCompare = false,
  isInCompareList = false,
  isLoggedIn = false,
  isMember = false,
  onRequireSignIn,
  onRequireInsider,
  isSaved: controlledSaved,
  onToggleSave,
  onAddToBoard,
  onToggleCompare,
  customPrimary,
  groupInsiderActions = false,
  className,
}: DetailActionsProps) {
  const [localSaved, setLocalSaved] = useState(false)
  const isControlled = controlledSaved !== undefined
  const isSaved = isControlled ? controlledSaved : localSaved

  function handleSave() {
    if (!isLoggedIn) {
      onRequireSignIn?.()
      return
    }
    if (isControlled) {
      onToggleSave?.()
    } else {
      setLocalSaved((s) => !s)
      onToggleSave?.()
    }
  }

  function handleBoard() {
    if (!isLoggedIn) {
      onRequireSignIn?.()
      return
    }
    if (!isMember) {
      onRequireInsider?.('boards')
      return
    }
    onAddToBoard?.()
  }

  function handleCompare() {
    if (!isLoggedIn) {
      onRequireSignIn?.()
      return
    }
    if (!isMember) {
      onRequireInsider?.('compare')
      return
    }
    onToggleCompare?.()
  }

  function handleShare() {
    const title = shareTitle ?? (typeof document !== 'undefined' ? document.title : '')
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title, url }).catch(() => {
        /* User cancelled — geen actie */
      })
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {
        /* Niet kritiek */
      })
    }
  }

  const insiderMark = !isMember ? <InsiderIcon size={12} /> : undefined

  // Sessie 7 Punt 14: twee-groep variant voor material-detail.
  // Linker groep = gratis acties (customPrimary · Save · Share).
  // Rechter groep = Insider acties (Add to board · Compare) met
  // insider-mark wanneer de user geen lid is. Wrapper-klasse
  // `mat-detail-actions-grouped` lost de space-between + mobile-wrap
  // op via CSS.
  if (groupInsiderActions) {
    return (
      <div
        className={
          className
            ? `mat-detail-actions-grouped ${className}`
            : 'mat-detail-actions-grouped'
        }
      >
        <div className="mat-detail-actions-group">
          {customPrimary}

          <ActionButton
            size="md"
            icon={<IconSave size={13} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} />}
            label={isSaved ? 'Saved' : 'Save'}
            isActive={isSaved}
            onClick={handleSave}
          />

          <ActionButton
            size="md"
            icon={<IconShare size={13} strokeWidth={2} />}
            label="Share"
            onClick={handleShare}
          />
        </div>

        <div className="mat-detail-actions-group mat-detail-actions-group--insider">
          <ActionButton
            size="md"
            icon={<IconBoard size={13} strokeWidth={2} />}
            label="Add to board"
            trailing={insiderMark}
            isInsiderFeature
            isInsiderUnlocked={isMember}
            onClick={handleBoard}
          />

          {includeCompare && itemId !== undefined && (
            <ActionButton
              size="md"
              icon={<IconCompare size={13} strokeWidth={2.5} />}
              label={isInCompareList ? 'Added ✓' : 'Compare'}
              trailing={insiderMark}
              isActive={isInCompareList}
              isInsiderFeature
              isInsiderUnlocked={isMember}
              onClick={handleCompare}
            />
          )}
        </div>
      </div>
    )
  }

  // Default — bestaande ordening voor article/event/book/talk/brand:
  // customPrimary · Save · Add to board · Compare · Share, allemaal
  // in één rij.
  return (
    <div className={className ? `u-row ${className}` : 'u-row'}>
      {customPrimary}

      <ActionButton
        size="md"
        icon={<IconSave size={13} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} />}
        label={isSaved ? 'Saved' : 'Save'}
        isActive={isSaved}
        onClick={handleSave}
      />

      <ActionButton
        size="md"
        icon={<IconBoard size={13} strokeWidth={2} />}
        label="Add to board"
        trailing={insiderMark}
        isInsiderFeature
        isInsiderUnlocked={isMember}
        onClick={handleBoard}
      />

      {includeCompare && itemId !== undefined && (
        <ActionButton
          size="md"
          icon={<IconCompare size={13} strokeWidth={2.5} />}
          label={isInCompareList ? 'Added ✓' : 'Compare'}
          trailing={insiderMark}
          isActive={isInCompareList}
          isInsiderFeature
          isInsiderUnlocked={isMember}
          onClick={handleCompare}
        />
      )}

      <ActionButton
        size="md"
        icon={<IconShare size={13} strokeWidth={2} />}
        label="Share"
        onClick={handleShare}
      />
    </div>
  )
}
