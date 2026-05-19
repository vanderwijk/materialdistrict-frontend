/**
 * AuthPageLayout — shared shell for /sign-in, /register, /forgot-password,
 * /reset-password.
 *
 * Why a colocated layout (in `_auth-components`) and not a real
 * `app/(auth)/layout.tsx`:
 *  - These four pages each need their own metadata.tsx, validation logic,
 *    and submit handlers. A route-group layout would force them to share
 *    a single React subtree on every transition, which adds nothing.
 *  - This component is small (centered card, MD logo, back-to-home link)
 *    and stays free of routing concerns. Imported as a plain component
 *    by each page.
 *
 * Visual contract:
 *  - Narrow column centred horizontally and vertically (min-height of
 *    viewport minus header/footer)
 *  - Card with rounded corners + subtle shadow on light bg, no shadow on
 *    dark bg (matches design-system.md conventions for surfaces)
 *  - Heading top, optional subheading, then children (the form), then
 *    optional footer (small links for switching between sign-in /
 *    register / forgot-password)
 *  - MD wordmark + back-to-home link live in the global HeaderShell —
 *    not duplicated here.
 *
 * Accessibility:
 *  - The outer wrapper is `<main>` already (from app/layout.tsx).
 *  - This component renders an `<article>` so screen readers announce
 *    the card as a self-contained landmark, with a real `<h1>` inside.
 */

import type { ReactNode } from 'react'

interface AuthPageLayoutProps {
  /** Big heading shown at the top of the card (rendered as h1). */
  heading: string
  /** Optional supporting copy beneath the heading. */
  subheading?: ReactNode
  /** The form (or success message). */
  children: ReactNode
  /**
   * Optional row of small links at the bottom of the card —
   * e.g. "Don't have an account? Create one" on /sign-in.
   */
  footer?: ReactNode
}

export function AuthPageLayout({
  heading,
  subheading,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="auth-page">
      <article className="auth-card" aria-labelledby="auth-heading">
        <header className="auth-card-header">
          <h1 id="auth-heading" className="auth-card-heading">
            {heading}
          </h1>
          {subheading ? (
            <p className="auth-card-subheading">{subheading}</p>
          ) : null}
        </header>

        <div className="auth-card-body">{children}</div>

        {footer ? <footer className="auth-card-footer">{footer}</footer> : null}
      </article>
    </div>
  )
}
