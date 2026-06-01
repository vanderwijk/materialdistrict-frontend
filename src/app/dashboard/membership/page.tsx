import { getInitialUser } from '@/lib/auth/get-current-user'
import { DashboardPageHeader } from '@/components/dashboard'
import { ReaderMembershipPanel } from '@/components/dashboard/panels/ReaderMembershipPanel'

export default async function ReaderMembershipPage() {
  const user = await getInitialUser()
  // The dashboard layout guarantees a user; this satisfies the type narrowing.
  if (!user) return null
  return (
    <>
      <DashboardPageHeader title="Insider membership" />
      <ReaderMembershipPanel membership={user.membership} />
    </>
  )
}
