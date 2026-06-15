/**
 * Pure mappers: dashboard profile → checkout StoreAddress (client + server safe).
 */

import { resolveCountryCode } from '@/lib/config/countries'
import type { StoreAddress } from '@/lib/api/cart'
import type { UserProfile } from '@/types/dashboard'

export interface CheckoutPrefill {
  email: string
  billing: StoreAddress
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
