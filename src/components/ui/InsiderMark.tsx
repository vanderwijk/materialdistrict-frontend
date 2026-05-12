import { cn } from '@/lib/utils/cn'
import { InsiderIcon } from './icons/InsiderIcon'

export type InsiderMarkSize = 'xs' | 'sm' | 'md'

interface InsiderMarkProps {
  /** xs (12px), sm (16px), md (20px). Default: sm. */
  size?: InsiderMarkSize
  /** Optionele aria-label. Default: "Insider only". */
  ariaLabel?: string
  className?: string
}

/**
 * InsiderMark — compacte icon-only Insider-marker.
 *
 * Een teal cirkel met het Insider-sterretje. Geen tekst, geen pill — voor
 * plekken waar de "Insider"-label te uitgesproken zou zijn. Denk aan:
 *   - vóór de titel van een Insider-only content card
 *   - in lijsten met gemengde access-levels
 *   - in een save-search-rij die Insider-only is
 *
 * Voor de pill-versie met tekst: gebruik `<InsiderBadge>`.
 *
 * @example
 *   <InsiderMark />                              // sm (16px)
 *   <InsiderMark size="xs" />                    // 12px voor inline-tekst
 *   <InsiderMark size="md" />                    // 20px voor prominente marker
 *
 * Drie maten:
 *   - xs (12px) — inline naast tekst, naast labels in dropdowns
 *   - sm (16px) — default, vóór card-titels of in compacte rijen
 *   - md (20px) — DetailHeader, prominente plekken
 */
export function InsiderMark({
  size = 'sm',
  ariaLabel = 'Insider only',
  className,
}: InsiderMarkProps) {
  // Inner SVG icon size — ~60% van de cirkel-diameter voor goede ratio
  const iconPx = size === 'xs' ? 7 : size === 'sm' ? 9 : 11

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn('insider-mark', `is-${size}`, className)}
    >
      <InsiderIcon size={iconPx} filled className="text-white" />
    </span>
  )
}
