import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset your password',
  robots: { index: false, follow: false },
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

/**
 * Reset-password page.
 *
 * The token arrives in the URL (`?token=…`) via the link in the reset
 * email. If the token is missing or empty, we show a clear error page
 * with a link back to /forgot-password so the user can request a fresh
 * link without bouncing around.
 *
 * Token validity (expiration, single-use) is checked server-side by
 * WordPress on submit — we don't try to verify it here, since:
 *  - The token is opaque to the frontend.
 *  - Verifying on render would burn one of the token's allowed uses.
 *  - It's cleaner to let the form submit and show a single error point.
 *
 * Per `wordpress-instructions-auth.md` §5: no auto-login. After a
 * successful reset, the user is shown a confirmation with a button
 * back to /sign-in.
 */
export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams

  if (!token || token.length === 0) {
    return (
      <AuthPageLayout heading="Reset link missing">
        <div
          className="form-banner is-error"
          role="alert"
          aria-live="assertive"
        >
          <p>
            This page expects a reset token in the URL. Make sure you opened the
            exact link from your reset email.
          </p>
        </div>
        <FieldGroupSpacer />
        <Link
          className="btn btn-primary btn-lg auth-form-submit"
          href="/forgot-password"
        >
          Request a new link
        </Link>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout
      heading="Reset your password"
      subheading="Choose a new password to sign in with."
    >
      <ResetPasswordForm token={token} />
    </AuthPageLayout>
  )
}

/**
 * Tiny inline spacer so the button below the error sits at the same
 * vertical rhythm as a FieldGroup-driven button on the real form. Kept
 * private to this file because it's only used here.
 */
function FieldGroupSpacer() {
  return <div className="auth-form-spacer" aria-hidden="true" />
}
