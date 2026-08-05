import { Suspense } from 'react'
import type { User } from '@/types/shared'
import { AuthProvider } from '@/components/providers/AuthContext'
import { CartProvider } from '@/components/providers/CartContext'
import { BookmarksProvider } from '@/lib/hooks/useBookmarks'
import { GateNoticeProvider } from '@/components/ui'
import { HeaderShell } from '@/components/layout/HeaderShell'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

/**
 * App shell — providers, header, main, footer.
 *
 * Auth is hydrated by AuthenticatedAppShell (no Suspense around page
 * children — that caused soft-404). Footer is separately suspended so
 * main content is not blocked on the channel-catalog fetch.
 */
export function AppChrome({
  initialUser,
  children = null,
}: {
  initialUser: User | null
  children?: React.ReactNode
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <BookmarksProvider>
        <CartProvider>
          <GateNoticeProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <HeaderShell />
            <main id="main">{children}</main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </GateNoticeProvider>
        </CartProvider>
      </BookmarksProvider>
    </AuthProvider>
  )
}
