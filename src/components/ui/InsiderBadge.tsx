import { cn } from '@/lib/utils/cn'
import { InsiderIcon } from './icons/InsiderIcon'

interface InsiderBadgeProps {
  /** 'md' (default, 20px hoog) of 'sm' (16px hoog, voor lijsten/dropdowns). */
  size?: 'md' | 'sm'
  /** Extra padding rechts — voor langere labels zoals "Insider settings". */
  padded?: boolean
  /** Custom label. Default: "Insider". */
  children?: string
  className?: string
}

/**
 * Insider badge — uit globals.css §12.
 * Teal pill met witte ster-cirkel links en label rechts.
 *
 * Gebruik dit naast titels/cards. Voor een gewone content-type-pill
 * (zonder icoon, andere styling) gebruik <Tag contentType="insider" />.
 * Voor een icon-only marker zonder pill: gebruik <InsiderMark />.
 *
 * Sessie 3A batch 3: tekst-alignment fix — label krijgt expliciet een
 * <span class="ib-label"> wrapper zodat de CSS de optical baseline kan
 * corrigeren (uppercase letters renderen iets boven hun line-height-mid).
 *
 * Sessie 3B correctie 4: padding consistent gemaakt over alle varianten.
 * Het sterretje staat in default, is-sm en is-padded op dezelfde optische
 * afstand van de linker pill-rand.
 *
 * @example
 *   <InsiderBadge />                          // "Insider"
 *   <InsiderBadge size="sm" />                // compacte variant
 *   <InsiderBadge padded>Insider settings</InsiderBadge>
 */
export function InsiderBadge({
  size = 'md',
  padded = false,
  children = 'Insider',
  className,
}: InsiderBadgeProps) {
  const iconSize = size === 'sm' ? 7 : 10
  return (
    <span
      className={cn(
        'insider-badge',
        size === 'sm' && 'is-sm',
        padded && 'is-padded',
        className,
      )}
    >
      <span className="ib-icon">
        <InsiderIcon size={iconSize} filled className="text-white" />
      </span>
      <span className="ib-label">{children}</span>
    </span>
  )
}
