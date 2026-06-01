import { notFound } from 'next/navigation'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { findBrandMembership } from '@/lib/auth/user-helpers'
import type { User, BrandMembership } from '@/types/shared'

/**
 * Authorize access to a brand scope. Resolves the current user and the
 * `BrandMembership` for `slug`; if the user does not manage that brand,
 * `notFound()` is thrown (a non-manager must not learn the brand exists in
 * the dashboard). Brand pages call this first — it is the per-brand
 * authorization the dashboard layout's auth gate does not cover.
 *
 * Returns the membership too, so panels read tier/quota without re-querying.
 */
export async function requireManagedBrand(
  slug: string,
): Promise<{ user: User; brand: BrandMembership }> {
  const user = await getInitialUser()
  const brand = findBrandMembership(user, { slug })
  if (!user || !brand) {
    notFound()
  }
  return { user, brand }
}
