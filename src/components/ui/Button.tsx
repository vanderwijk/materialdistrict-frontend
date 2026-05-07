import Link from 'next/link'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant = 'primary' | 'outline' | 'blue' | 'green' | 'danger' | 'member'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
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
 *   <Button as="link" href="/membership" variant="member">Become Insider</Button>
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', children, className, ...rest } = props

  const classes = cn(
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    className,
  )

  if ('as' in props && props.as === 'link') {
    // Link-variant — strip 'as' en 'href' uit rest, gebruik href op Link
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
  const { as: _as, ...buttonProps } = rest as { as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
