import { getInitialUser } from '@/lib/auth/get-current-user'
import { DashboardPageHeader } from '@/components/dashboard'
import { ReaderMembershipPanel } from '@/components/dashboard/panels/ReaderMembershipPanel'

interface ReaderMembershipPageProps {
  searchParams: Promise<{ checkout?: string; billing?: string }>
}

export default async function ReaderMembershipPage({
  searchParams,
}: ReaderMembershipPageProps) {
  const user = await getInitialUser()
  // The dashboard layout guarantees a user; this satisfies the type narrowing.
  if (!user) return null

  // /checkout bounces an already-subscribed Insider here with ?checkout=already.
  // The "Manage billing" flow bounces back with ?billing=unavailable when the
  // Stripe billing portal can't be resolved (no Stripe customer / portal not set
  // up server-side) — show a visible notice so the button never feels dead.
  const { checkout, billing } = await searchParams

  return (
    <>
      <DashboardPageHeader title="Insider membership" />
      {checkout === 'already' && (
        <div className="form-banner is-success" role="status">
          <strong>You&rsquo;re already an Insider.</strong> Manage your
          membership below.
        </div>
      )}
      {billing === 'unavailable' && (
        <div className="form-banner is-error" role="status">
          <strong>Billing portal isn&rsquo;t available right now.</strong> Please
          try again later or contact support if it keeps happening.
        </div>
      )}
      <ReaderMembershipPanel membership={user.membership} />
    </>
  )
}
