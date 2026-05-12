import Link from 'next/link'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Button-varianten.
 *
 * Sessie 3B correctie 3: `'member'` is hernoemd naar `'insider'`. De oude
 * waarde `'member'` blijft als alias werken (backward-compat) en mapt
 * intern naar dezelfde `.btn-insider` styling. Nieuwe code moet
 * `'insider'` gebruiken.
 */
export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'blue'
  | 'green'
  | 'danger'
  | 'insider'
  /** @deprecated Sessie 3B — gebruik `'insider'`. */
  | 'member'
  | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  /**
   * Toon een loading-spinner naast het label en zet de knop op `aria-busy`.
   * Werkt alleen op de native button-variant (niet op link).
   */
  loading?: boolean
}

/** Native button — als 'as' niet wordt opgegeven of expliciet 'button' is. */
type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    as?: 'button'
  }

/** Link — voor navigatie. Vereist 'href'. */
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    as: 'link'
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Button — alle variants en sizes uit globals.css §8.
 *
 * Default: native <button>. Voor navigatie: as="link" + href="...".
 * De link-variant gebruikt next/link en is dus client-side navigeerbaar.
 *
 * @example
 *   <Button variant="primary">Click</Button>
 *   <Button variant="outline" size="sm">Cancel</Button>
 *   <Button as="link" href="/membership" variant="insider">Become Insider</Button>
 *   <Button loading>Saving…</Button>
 */
export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className,
    loading = false,
    ...rest
  } = props

  // Sessie 3B correctie 3: oude 'member' variant mappen naar 'insider'-klasse,
  // zodat zowel oude als nieuwe code dezelfde teal-knop krijgt.
  const variantClass = variant === 'member' ? 'insider' : variant

  const classes = cn(
    'btn',
    `btn-${variantClass}`,
    size !== 'md' && `btn-${size}`,
    loading && 'is-loading',
    className,
  )

  if ('as' in props && props.as === 'link') {
    // Link-variant — strip 'as' en 'href' uit rest, gebruik href op Link.
    // Loading-state op link is geen UX-pattern; we negeren het hier stilletjes.
    const { as: _as, href, ...anchorProps } = rest as {
      as: 'link'
      href: string
    } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'>
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    )
  }

  // Button-variant — strip 'as' uit rest
  const { as: _as, disabled, ...buttonProps } = rest as { as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
