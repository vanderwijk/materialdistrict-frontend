import { Suspense } from 'react'
import { AuthProvider } from '@/components/providers/AuthContext'
import { CartProvider } from '@/components/providers/CartContext'
import { BookmarksProvider } from '@/lib/hooks/useBookmarks'
import { GateNoticeProvider } from '@/components/ui'
import { HeaderShell } from '@/components/layout/HeaderShell'
import { ConfirmEmailBanner } from '@/components/layout/ConfirmEmailBanner'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

/**
 * App shell — providers, header, main, footer.
 *
 * Auth is hydrated inside AuthProvider, client-side. It used to be resolved
 * server-side one level up (AuthenticatedAppShell, now removed): that read
 * the auth cookie during render and thereby opted every route on the site
 * out of static rendering, so nothing could be cached at the edge. See
 * AuthContext for the full reasoning.
 *
 * Still no Suspense around page children — a fallback there commits HTTP 200
 * before `notFound()` can set a real 404 (soft-404). Footer is separately
 * suspended so main content is not blocked on the channel-catalog fetch.
 */
export function AppChrome({
  children = null,
}: {
  children?: React.ReactNode
}) {
  return (
    <AuthProvider>
      <BookmarksProvider>
        <CartProvider>
          <GateNoticeProvider>
            <HeaderShell />
            {/* Renders nothing unless the signed-in account is unconfirmed. */}
            <ConfirmEmailBanner />
            <main id="main">{children}</main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            {/*
              ScrollToTop sits *after* main on purpose. It reads search
              params, so it needs a Suspense boundary — and a boundary
              placed before `{children}` lets the shell flush before the
              page has resolved. Once the response is committed, a later
              `notFound()` can no longer set the status, which is how an
              unknown material URL ended up answering HTTP 200 with the
              404 body (a soft-404: Google reads it as a real page). Its
              position in the DOM is irrelevant — it only runs an effect.
            */}
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
          </GateNoticeProvider>
        </CartProvider>
      </BookmarksProvider>
    </AuthProvider>
  )
}
