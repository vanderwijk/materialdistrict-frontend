import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = {
  // Sessie 7 fix Punt 18: pagina-titel toont "Login" om uniform te zijn
  // met de header-knop "Login". URL blijft /sign-in. Body-CTAs ("Sign in
  // to get in touch" etc.) blijven voorlopig staan.
  title: 'Login',
  // Auth pages should not appear in search results.
  robots: { index: false, follow: false },
}

/**
 * Sign-in page.
 *
 * Server-side checks whether the visitor already has a valid session.
 * If so, redirect them straight to `next` (or /materials) — there is no
 * point showing the form to someone who is already logged in. This also
 * means deep links like /sign-in?next=/materials/obro do the right thing
 * for already-authenticated users (they land on the deep link directly).
 *
 * The `next` query parameter is forwarded to the client form so the
 * post-login redirect goes to the right place.
 */

interface SignInPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next, error } = await searchParams
  const safeNext = sanitizeNext(next)

  // Bail early if already logged in. We re-use the layout's auth
  // hydration logic: read the cookie, ask WP if it's still valid.
  const token = await getAuthCookie()
  if (token) {
    try {
      await getCurrentUser(token)
      // Cookie is valid → user is already signed in. Skip the form.
      redirect(safeNext)
    } catch (err) {
      // Cookie present but rejected — let the form render. The layout's
      // hydration will already have cleared the bad cookie on this
      // request; the next render is clean.
      if (!(err instanceof WordPressAuthError)) {
        // Unexpected backend failure — also let the form render, the
        // user is not blocked.
        console.error('[sign-in] session check failed', err)
      }
    }
  }

  return (
    <AuthPageLayout
      heading="Login"
      subheading="Welcome back. Log in to continue."
      footer={
        <>
          <span className="auth-card-footer-text">Don&apos;t have an account?</span>{' '}
          <a
            className="auth-card-footer-link"
            href={`/register${next ? `?next=${encodeURIComponent(safeNext)}` : ''}`}
          >
            Create one
          </a>
        </>
      }
    >
      <SignInForm next={safeNext} oauthError={error} />
    </AuthPageLayout>
  )
}

/**
 * Defensive normalisation of the `?next=` param. Returns an in-site path
 * we can safely redirect to.
 *
 * Refuses absolute URLs (`http://evil.com`) and protocol-relative URLs
 * (`//evil.com`) to prevent open-redirect abuse — a user clicks a
 * malicious "sign in here" link, lands on our real sign-in page, but
 * after login gets bounced to an attacker-controlled site. Only paths
 * starting with a single `/` followed by something that isn't another
 * `/` (or backslash) are allowed.
 */
function sanitizeNext(next: string | undefined): string {
  const fallback = '/material'
  if (!next) return fallback
  if (next.length === 0) return fallback
  // Must start with `/` …
  if (next[0] !== '/') return fallback
  // … but not `//` or `/\` (protocol-relative or backslash variant).
  if (next.length > 1 && (next[1] === '/' || next[1] === '\\')) return fallback
  return next
}
