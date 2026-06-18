import { getBoards } from '@/lib/dashboard/data'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { isInsider } from '@/lib/auth/user-helpers'
import { DashboardPageHeader } from '@/components/dashboard'
import { InsiderGate } from '@/components/ui/InsiderGate'
import { BoardsPanel } from '@/components/dashboard/panels/BoardsPanel'

export default async function BoardsPage() {
  const user = await getInitialUser()

  if (!isInsider(user)) {
    return (
      <>
        <DashboardPageHeader title="Boards" crumbs={[{ label: 'Account' }, { label: 'Boards' }]} />
        <InsiderGate variant="panel" feature="boards" ctaHref="/dashboard/membership" />
      </>
    )
  }

  const boards = await getBoards()
  return (
    <>
      <DashboardPageHeader title="Boards" crumbs={[{ label: 'Account' }, { label: 'Boards' }]} />
      <BoardsPanel initial={boards} />
    </>
  )
}
