import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icoon (uit de registry). Verplicht. */
  icon: ReactNode
  /** Aria-label is verplicht voor icon-only buttons. */
  ariaLabel: string
  /** sm = 28px, md = 36px (default), lg = 44px */
  size?: 'sm' | 'md' | 'lg'
  /** Variant — bepaalt achtergrond + hover. Default: 'ghost' (transparant). */
  variant?: 'ghost' | 'subtle' | 'solid'
  /** Active state — voor toggle-knoppen (theme, etc.). */
  active?: boolean
  /** Optioneel: notification dot (red) op de knop. */
  hasIndicator?: boolean
}

/**
 * IconButton — generieke icon-only button.
 *
 * Vervangt het patroon van inline-styled `<button>` met SVG kinderen dat
 * voorheen overal in `Header.tsx`, `Footer.tsx`, theme-toggles en
 * social-buttons werd herhaald. Klasse-gestuurd, geen inline styles.
 *
 * **Aria-label is verplicht** — een knop zonder tekst-content moet voor
 * screen readers een gesproken label hebben.
 *
 * @example
 *   <IconButton icon={<IconSearch />} ariaLabel="Open search" />
 *   <IconButton icon={<IconBell />} ariaLabel="Notifications" hasIndicator />
 *   <IconButton icon={<IconMoon />} ariaLabel="Dark mode" active={isDark} />
 *   <IconButton icon={<IconLinkedin />} ariaLabel="LinkedIn" variant="ghost" size="sm" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      ariaLabel,
      size = 'md',
      variant = 'ghost',
      active = false,
      hasIndicator = false,
      type = 'button',
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        aria-pressed={active || undefined}
        className={cn(
          'icon-btn',
          `is-${size}`,
          `is-${variant}`,
          active && 'is-active',
          className,
        )}
        {...rest}
      >
        <span className="icon-btn-icon" aria-hidden="true">
          {icon}
        </span>
        {hasIndicator && <span className="icon-btn-indicator" aria-hidden="true" />}
      </button>
    )
  },
)
