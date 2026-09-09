import type { Metadata } from 'next'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { ClaimAccountForm } from './ClaimAccountForm'

export const metadata: Metadata = {
  title: 'Activate your account',
  robots: { index: false, follow: false },
}

/**
 * Landing page for the activation link sent to a contact record.
 *
 * There are roughly 12,790 people on the CMS who exist as a contact but cannot sign in:
 * imported from Sendy, from fair registrations, from the old CRM. Registering with their
 * own address returned `md_auth_email_taken`, which locked them out of their own history.
 * This page is the way back in.
 *
 * Like /confirm-email it stays statically renderable, because the link is opened from a
 * mail client and gets prefetched by scanners. Unlike /confirm-email nothing is consumed
 * on render: the token is only spent when the form is submitted, so a scanner following
 * the link cannot burn it.
 */
interface ClaimAccountPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ClaimAccountPage({ searchParams }: ClaimAccountPageProps) {
  const { token } = await searchParams

  return (
    <AuthPageLayout
      heading="Activate your account"
      subheading="Your details are already with us. Set a password to pick up where you left off."
    >
      <ClaimAccountForm token={token ?? ''} />
    </AuthPageLayout>
  )
}
