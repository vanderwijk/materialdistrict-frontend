import type { Metadata } from 'next'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { ConfirmEmailChangeView } from './ConfirmEmailChangeView'

export const metadata: Metadata = {
  title: 'Confirm your new email address',
  robots: { index: false, follow: false },
}

/**
 * Landing page for the link sent to a *new* address during an email change.
 *
 * Until this link is clicked the account keeps its old address, so nothing is at risk
 * while the link sits in an inbox. Confirming is therefore a deliberate act behind a
 * button rather than something that happens on render: a mail scanner prefetching the
 * URL must not be able to move someone's account.
 *
 * That is the one place this differs from /confirm-email, which redeems on mount — there
 * the worst a scanner can do is activate an account the person already asked for.
 */
interface ConfirmEmailChangePageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ConfirmEmailChangePage({
  searchParams,
}: ConfirmEmailChangePageProps) {
  const { token } = await searchParams

  return (
    <AuthPageLayout
      heading="Confirm your new email address"
      subheading="One last step before we move your account."
    >
      <ConfirmEmailChangeView token={token ?? ''} />
    </AuthPageLayout>
  )
}
