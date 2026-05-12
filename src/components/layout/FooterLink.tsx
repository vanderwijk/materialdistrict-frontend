import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface FooterLinkProps {
  href: string
  children: ReactNode
  /** External link — opens in new tab with security attributes. */
  external?: boolean
  className?: string
}

/**
 * FooterLink — site-footer text link.
 *
 * Vervangt de inline `<a className="...">` patronen die voorheen in Footer.tsx
 * door alle footer-kolommen werden herhaald. Klasse-gestuurd via
 * `.footer-link` in §43.
 *
 * @example
 *   <FooterLink href="/about">About</FooterLink>
 *   <FooterLink href="https://docs.example.com" external>Documentation</FooterLink>
 */
export function FooterLink({
  href,
  children,
  external,
  className,
}: FooterLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('footer-link', className)}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={cn('footer-link', className)}>
      {children}
    </Link>
  )
}
