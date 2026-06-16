import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconArrowRight } from '@/components/ui/icons'

interface TextLinkBaseProps {
  children: ReactNode
  /** Toon trailing arrow icoon. Default: true. */
  arrow?: boolean
  /** Variant — bepaalt kleur. Default 'navy'. */
  variant?: 'navy' | 'muted' | 'inherit'
  className?: string
}

interface TextLinkInternalProps extends TextLinkBaseProps {
  href: string
  external?: never
}

interface TextLinkExternalProps extends TextLinkBaseProps {
  href: string
  external: true
}

type TextLinkProps = TextLinkInternalProps | TextLinkExternalProps

/**
 * TextLink — navy tekstlink met optionele trailing-arrow.
 *
 * Vervangt het inline "All materials →" patroon dat overal in de codebase
 * werd herhaald. Gebruikt next/link voor interne links, native `<a>` voor
 * externe (dan met `target="_blank"` + `rel="noopener noreferrer"`).
 *
 * @example
 *   <TextLink href="/material">All materials</TextLink>
 *   <TextLink href="https://docs.example.com" external>Docs</TextLink>
 *   <TextLink href="/x" arrow={false}>No arrow</TextLink>
 */
export function TextLink({
  href,
  children,
  arrow = true,
  variant = 'navy',
  external,
  className,
}: TextLinkProps) {
  const classes = cn('text-link', `text-link-${variant}`, className)
  const content = (
    <>
      <span className="text-link-label">{children}</span>
      {arrow && (
        <span className="text-link-arrow" aria-hidden="true">
          <IconArrowRight size={14} strokeWidth={2} />
        </span>
      )}
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
