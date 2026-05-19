import type { Metadata } from 'next'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot your password?',
  robots: { index: false, follow: false },
}

/**
 * Forgot-password page.
 *
 * No auto-redirect for logged-in users — someone who is signed in but
 * forgot their password (perhaps for an alternate account) should still
 * be able to use this flow. The form handles its own anonymous state.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      heading="Forgot your password?"
      subheading="Enter your email and we’ll send you a link to reset it."
      footer={
        <>
          <span className="auth-card-footer-text">Remembered it?</span>{' '}
          <a className="auth-card-footer-link" href="/sign-in">
            Back to sign in
          </a>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  )
}
