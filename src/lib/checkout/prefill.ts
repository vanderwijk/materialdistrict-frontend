/**
 * Checkout billing prefill — maps the dashboard profile (Pad B billing meta)
 * into the WooCommerce Store API `StoreAddress` shape used by CheckoutForm.
 */

import { getInitialUser } from '@/lib/auth/get-current-user'
import { resolveCountryCode } from '@/lib/config/countries'
import { getProfile } from '@/lib/dashboard/data'
import type { StoreAddress } from '@/lib/api/cart'
import type { UserProfile } from '@/types/dashboard'
import type { User } from '@/types/shared'

export interface CheckoutPrefill {
  email: string
  billing: StoreAddress
}

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

export function profileToCheckoutPrefill(profile: UserProfile): CheckoutPrefill {
  const country = resolveCountryCode(profile.country) || 'NL'
  return {
    email: profile.email,
    billing: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      company: profile.company || undefined,
      address_1: profile.address,
      address_2: profile.address2 || undefined,
      city: profile.city,
      postcode: profile.postcode,
      country,
      state: '',
      email: profile.email,
      phone: profile.phone || undefined,
    },
  }
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
