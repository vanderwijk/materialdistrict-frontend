import { notFound } from 'next/navigation'
import { getBoard } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { BoardDetailPanel } from '@/components/dashboard/panels/BoardDetailPanel'

interface BoardDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { id } = await params
  const board = await getBoard(id)
  if (!board) notFound()

  return (
    <>
      <DashboardPageHeader
        title="Boards"
        crumbs={[
          { label: 'Account' },
          { label: 'Boards', href: '/dashboard/boards' },
          { label: board.name },
        ]}
      />
      <BoardDetailPanel board={board} />
    </>
  )
}
