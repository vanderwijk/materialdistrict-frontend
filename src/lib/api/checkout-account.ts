/**
 * Checkout account — email-first flow (account lookup + cart merge).
 */

export interface CheckoutEmailStatus {
  registered: boolean
}

export interface CheckoutMergeResult {
  merged: boolean
  items_count: number
}

export interface CheckoutVatStatus {
  status: 'valid' | 'invalid' | 'unreachable' | 'non_eu' | 'empty'
  is_valid: boolean
  is_vat_exempt: boolean
  country: string
  vat_number: string
  checked_at: string | null
}

export class CheckoutAccountError extends Error {
  status: number
  code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = 'CheckoutAccountError'
    this.status = status
    this.code = code
  }
}

async function parseError(res: Response): Promise<CheckoutAccountError> {
  try {
    const body = (await res.json()) as { message?: string; code?: string }
    return new CheckoutAccountError(
      body.message ?? 'Request failed.',
      res.status,
      body.code ?? 'md_checkout_error',
    )
  } catch {
    return new CheckoutAccountError('Request failed.', res.status, 'md_checkout_error')
  }
}

export async function checkCheckoutEmail(email: string): Promise<CheckoutEmailStatus> {
  const res = await fetch('/api/checkout/email-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as CheckoutEmailStatus
}

export async function mergeCheckoutCart(cartToken: string): Promise<CheckoutMergeResult> {
  const res = await fetch('/api/checkout/merge-cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cart-Token': cartToken,
    },
    credentials: 'include',
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as CheckoutMergeResult
}

export async function checkCheckoutVat(
  country: string,
  vatNumber: string,
): Promise<CheckoutVatStatus> {
  const res = await fetch('/api/checkout/vat-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: country.trim(), vat_number: vatNumber.trim() }),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as CheckoutVatStatus
}
