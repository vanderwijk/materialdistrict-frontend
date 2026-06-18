import { getSavedSearches } from '@/lib/dashboard/data'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { isInsider } from '@/lib/auth/user-helpers'
import { DashboardPageHeader } from '@/components/dashboard'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { SavedSearchesPanel } from '@/components/dashboard/panels/SavedSearchesPanel'

export default async function SavedSearchesPage() {
  const user = await getInitialUser()

  if (!isInsider(user)) {
    return (
      <>
        <DashboardPageHeader title="Saved searches" crumbs={[{ label: 'Account' }, { label: 'Saved searches' }]} />
        <InsiderGate variant="panel" feature="savedSearch" ctaHref="/dashboard/membership" />
      </>
    )
  }

  const searches = await getSavedSearches()
  return (
    <>
      <DashboardPageHeader title="Saved searches" crumbs={[{ label: 'Account' }, { label: 'Saved searches' }]} />
      <SavedSearchesPanel initial={searches} />
    </>
  )
}
