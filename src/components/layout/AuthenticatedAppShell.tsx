import { getInitialUser } from '@/lib/auth/get-current-user'
import { AppChrome } from '@/components/layout/AppChrome'

/**
 * Server-only auth hydration shell. Wrapped in Suspense from the root layout
 * so anonymous visitors are not blocked on cookie / WP auth resolution.
 */
export async function AuthenticatedAppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const initialUser = await getInitialUser()
  return <AppChrome initialUser={initialUser}>{children}</AppChrome>
}
