import { redirect } from 'next/navigation'

/**
 * /dashboard is a hub with no UI of its own — it redirects to the personal
 * profile panel, the canonical landing for the integrated dashboard.
 */
export default function DashboardHubPage() {
  redirect('/dashboard/profile')
}
