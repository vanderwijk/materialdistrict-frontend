import { getInitialUser } from '@/lib/auth/get-current-user'
import { AppChrome } from '@/components/layout/AppChrome'

/**
 * Server-only auth hydration shell.
 *
 * Intentionally rendered without a root-layout Suspense boundary around
 * `{children}`: a fallback shell would commit HTTP 200 before `notFound()`
 * can set a real 404 (soft-404). Cookie miss returns null immediately; only
 * logged-in requests wait on WordPress.
 */
export async function AuthenticatedAppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const initialUser = await getInitialUser()
  return <AppChrome initialUser={initialUser}>{children}</AppChrome>
}
