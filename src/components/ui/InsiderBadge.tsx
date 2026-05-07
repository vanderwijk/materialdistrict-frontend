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
 * (zonder icoon, andere styling) gebruik <Tag contentType="member" />.
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
      {children}
    </span>
  )
}
