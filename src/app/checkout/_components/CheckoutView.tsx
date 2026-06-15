'use client'

import type { CheckoutPrefill } from '@/lib/checkout/profile-prefill'
import { CheckoutForm } from './CheckoutForm'

interface CheckoutViewProps {
  prefill: CheckoutPrefill | null
}

export function CheckoutView({ prefill }: CheckoutViewProps) {
  return <CheckoutForm key={prefill?.email ?? 'guest'} prefill={prefill} />
}
