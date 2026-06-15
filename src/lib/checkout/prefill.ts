/**
 * Server-side checkout billing prefill loader.
 */

import { getInitialUser } from '@/lib/auth/get-current-user'
import { resolveCountryCode } from '@/lib/config/countries'
import { getProfile } from '@/lib/dashboard/data'
import type { StoreAddress } from '@/lib/api/cart'
import type { User } from '@/types/shared'
import {
  profileToCheckoutPrefill,
  type CheckoutPrefill,
} from '@/lib/checkout/profile-prefill'

export type { CheckoutPrefill }

const EMPTY_BILLING: StoreAddress = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  postcode: '',
  country: 'NL',
  state: '',
}

function userToCheckoutPrefill(user: User): CheckoutPrefill {
  const country = user.country ? resolveCountryCode(user.country) : 'NL'
  return {
    email: user.email,
    billing: {
      ...EMPTY_BILLING,
      first_name: user.firstName ?? '',
      last_name: user.lastName ?? '',
      country: country || 'NL',
      email: user.email,
    },
  }
}

/** Load billing prefill for logged-in checkout visitors; guests get `null`. */
export async function getCheckoutPrefill(): Promise<CheckoutPrefill | null> {
  const user = await getInitialUser()
  if (!user) return null

  try {
    const profile = await getProfile()
    return profileToCheckoutPrefill(profile)
  } catch {
    return userToCheckoutPrefill(user)
  }
}
