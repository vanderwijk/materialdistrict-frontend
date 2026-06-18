import { getBookmarks } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { BookmarksPanel } from '@/components/dashboard/panels/BookmarksPanel'

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks()
  return (
    <>
      <DashboardPageHeader title="Bookmarks" crumbs={[{ label: 'Account' }, { label: 'Bookmarks' }]} />
      <BookmarksPanel initial={bookmarks} />
    </>
  )
}
