'use client'

/**
 * BookDetailActions
 * ----------------------------------------------------------------------
 * Save + Share-rij in de book-detail-header — books-variant van de
 * gedeelde `<DetailActions>` (zoals materials `MaterialDetailActions`,
 * maar zonder Add-to-board/Compare: boeken kennen alleen Save + Share).
 *
 * Save loopt via dezelfde `useBookmarks()`-state als de book-tegels
 * (`type: 'books'`), zodat overzicht en detail dezelfde bewaar-status
 * delen. Niet-ingelogd → sign-in redirect met `next` terug naar dit boek.
 */

import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

export interface BookDetailActionsProps {
  bookId: number
  bookSlug: string
  bookTitle: string
}

export function BookDetailActions({
  bookId,
  bookSlug,
  bookTitle,
}: BookDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  return (
    <DetailActions
      type="book"
      itemId={bookId}
      shareTitle={bookTitle}
      includeBoard={false}
      includeCompare={false}
      isLoggedIn={isLoggedIn}
      isSaved={isSaved('books', bookId)}
      onToggleSave={() => toggleBookmark('books', bookId)}
      onRequireSignIn={() =>
        router.push(`/sign-in?next=${encodeURIComponent(`/book/${bookSlug}`)}`)
      }
    />
  )
}
