import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { signInHrefForCurrentPath } from '@/lib/auth/request-path'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

/**
 * Dashboard is private and personalized — never indexed, never statically
 * generated. `robots.ts` already disallows /dashboard/*; this reinforces it.
 */
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

/**
 * Auth gate for the entire dashboard subtree.
 *
 * Reads the server-hydrated user once. Anonymous visitors are redirected to
 * sign-in with a `next` back to the page they actually requested, so a shared
 * deep link (`/dashboard/boards/12`) survives the login. The resolved user is
 * handed to the (client) shell, which renders the adaptive sidebar + mobile nav
 * around the active panel. Each panel page fetches its own data and runs its
 * own brand-authorization check.
 *
 * Layout and page render in parallel, so the data layer runs the same gate
 * (`requireToken` in `lib/dashboard/data.ts`) with the same target — whichever
 * of the two gets there first sends the visitor to the same place.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getInitialUser()
  if (!user) {
    redirect(await signInHrefForCurrentPath('/dashboard'))
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
