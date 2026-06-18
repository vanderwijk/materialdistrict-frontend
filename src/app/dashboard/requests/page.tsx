import { getMyRequests } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { RequestsPanel } from '@/components/dashboard/panels/RequestsPanel'

export default async function RequestsPage() {
  const requests = await getMyRequests()
  return (
    <>
      <DashboardPageHeader title="My requests" crumbs={[{ label: 'Account' }, { label: 'My requests' }]} />
      <RequestsPanel requests={requests} />
    </>
  )
}
