import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getInitialUser } from '@/lib/auth/get-current-user'
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
 * sign-in with a `next` back to the dashboard. The resolved user is handed to
 * the (client) shell, which renders the adaptive sidebar + mobile nav around
 * the active panel. Each panel page fetches its own data and runs its own
 * brand-authorization check.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getInitialUser()
  if (!user) {
    redirect('/sign-in?next=/dashboard')
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
