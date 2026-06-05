import { getInsiderInsights } from '@/lib/dashboard/data'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { isInsider } from '@/lib/auth/user-helpers'
import { DashboardPageHeader } from '@/components/dashboard'
import { InsightsPanel } from '@/components/dashboard/panels/InsightsPanel'

export default async function InsiderInsightsPage() {
  const [user, insights] = await Promise.all([getInitialUser(), getInsiderInsights()])
  return (
    <>
      <DashboardPageHeader title="Insider insights" />
      <InsightsPanel insights={insights} isInsider={isInsider(user)} />
    </>
  )
}
