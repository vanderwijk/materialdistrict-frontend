import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/cookies'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'

/**
 * /dashboard/membership/manage
 *
 * "Manage billing" target. Resolves the Stripe billing-portal URL server-side
 * (`GET /md/v2/dashboard/membership/portal → { url }`) and redirects there.
 * When there's no Stripe customer WP returns 503 `md_dashboard_unavailable`;
 * we send the user back to the membership page with a flag instead of erroring.
 */
export default async function ManageBillingPage() {
  const token = await getAuthCookie()
  if (!token) redirect('/sign-in?next=/dashboard/membership')

  let url: string | null = null
  try {
    const data = await wpDashboardFetch<{ url?: string }>(
      '/md/v2/dashboard/membership/portal',
      { method: 'GET', bearer: token },
    )
    url = data?.url ?? null
  } catch (err) {
    if (!(err instanceof DashboardApiError)) throw err
    // 503 (no Stripe customer) or similar → fall through to the flag redirect.
  }

  redirect(url ?? '/dashboard/membership?billing=unavailable')
}
