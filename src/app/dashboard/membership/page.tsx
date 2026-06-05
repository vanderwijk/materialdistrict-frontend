import { getInitialUser } from '@/lib/auth/get-current-user'
import { DashboardPageHeader } from '@/components/dashboard'
import { ReaderMembershipPanel } from '@/components/dashboard/panels/ReaderMembershipPanel'

interface ReaderMembershipPageProps {
  searchParams: Promise<{ checkout?: string }>
}

export default async function ReaderMembershipPage({
  searchParams,
}: ReaderMembershipPageProps) {
  const user = await getInitialUser()
  // The dashboard layout guarantees a user; this satisfies the type narrowing.
  if (!user) return null

  // /checkout bounces an already-subscribed Insider here with ?checkout=already.
  const { checkout } = await searchParams

  return (
    <>
      <DashboardPageHeader title="Insider membership" />
      {checkout === 'already' && (
        <div className="form-banner is-success" role="status">
          <strong>You&rsquo;re already an Insider.</strong> Manage your
          membership below.
        </div>
      )}
      <ReaderMembershipPanel membership={user.membership} />
    </>
  )
}
