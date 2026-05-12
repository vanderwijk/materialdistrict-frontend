'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Types
// ============================================================

export type ActionButtonSize = 'sm' | 'md' | 'lg'

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Knopgrootte:
   *  - 'sm': 28×28 ronde overlay-knop voor op card-thumbs (alleen icoon, geen label)
   *  - 'md': 38px hoog met icoon + label, voor detail-page action-rows (default)
   *  - 'lg': 46px hoog primary CTA
   */
  size?: ActionButtonSize
  /** Icoon links van het label. Verplicht voor 'sm' (de hele knop is een icoon). */
  icon: ReactNode
  /** Label-tekst rechts van het icoon. Niet getoond bij size='sm'. */
  label?: string
  /**
   * Element rechts van het label, na de gap. Typisch een Insider-mark
   * voor non-members. Niet getoond bij size='sm'.
   */
  trailing?: ReactNode
  /**
   * Visueel "actief" maken — bv. voor toggle-knoppen (Save, Compare in compare-list).
   */
  isActive?: boolean
  /**
   * Voor accessibility wanneer er geen label is (bv. size='sm'). Verplicht bij 'sm'.
   */
  ariaLabel?: string
}

// ============================================================
// Component
// ============================================================

/**
 * ActionButton — generieke icon+label knop, drie maten.
 *
 * Vervangt drie eerdere patronen:
 *  - `.card-action-btn` (overlay op cards) → size='sm'
 *  - `.detail-action` (detail-page actions) → size='md'
 *  - inline-styled lg primary buttons → size='lg'
 *
 * @example Overlay op card-thumb:
 *   <ActionButton size="sm" icon={<Bookmark size={14} />} ariaLabel="Save" />
 *
 * @example Detail-page action met Insider-mark voor non-members:
 *   <ActionButton size="md" icon={<Folder size={13} />} label="Add to board"
 *     trailing={!isMember && <InsiderIcon size={12} />} />
 *
 * @example Toggle-knop:
 *   <ActionButton size="md" icon={<BarChart3 size={13} />} label="Compare"
 *     isActive={isInCompareList} onClick={toggleCompare} />
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    { size = 'md', icon, label, trailing, isActive = false, ariaLabel, className, type = 'button', ...rest },
    ref,
  ) {
    if (size === 'sm' && !ariaLabel) {
      // Dev-warning, niet runtime-blocker
      // eslint-disable-next-line no-console
      console.warn('ActionButton size="sm" requires an ariaLabel for accessibility.')
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn('action-btn', `is-${size}`, isActive && 'is-active', className)}
        aria-label={ariaLabel ?? label}
        aria-pressed={isActive ? true : undefined}
        {...rest}
      >
        {icon}
        {size !== 'sm' && label}
        {size !== 'sm' && trailing}
      </button>
    )
  },
)
