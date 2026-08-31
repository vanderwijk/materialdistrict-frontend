import type { Metadata } from 'next'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { ConfirmEmailView } from './ConfirmEmailView'

export const metadata: Metadata = {
  title: 'Confirm your email',
  robots: { index: false, follow: false },
}

/**
 * Landing page for the confirmation link in the welcome email.
 *
 * The redemption itself happens client-side against /api/auth/confirm-email:
 * the page must stay statically renderable (it is linked from email, so it gets
 * crawled and prefetched by mail clients and security scanners), and a server
 * component that redeemed the key on render would burn the key on a scanner's
 * prefetch before the person ever clicked.
 */
interface ConfirmEmailPageProps {
  searchParams: Promise<{ key?: string; uid?: string }>
}

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const { key, uid } = await searchParams

  return (
    <AuthPageLayout
      heading="Confirm your email"
      subheading="One moment while we activate your account."
    >
      <ConfirmEmailView confirmKey={key ?? ''} userId={uid ?? ''} />
    </AuthPageLayout>
  )
}
