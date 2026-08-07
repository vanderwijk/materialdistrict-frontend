/**
 * `/checkout` — dual-purpose:
 *
 * 1. Insider subscription: `?plan=insider[&interval=monthly|annual]`
 * 2. Brand tier: `?plan=brand&brandId=&tier=basis|plus|partner&brandSlug=`
 *    Server redirect to Stripe Checkout Session via WP. No WooCommerce cart.
 *
 * 3. Book storefront: no `plan` param → WooCommerce Store API checkout UI.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import {
  createBrandCheckout,
  createInsiderCheckout,
  WordPressError,
} from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'
import { getCheckoutPrefill } from '@/lib/checkout/prefill'
import { CheckoutView } from './_components/CheckoutView'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string
    interval?: string
    brandId?: string
    tier?: string
    brandSlug?: string
  }>
}

async function startInsiderCheckout(interval: 'monthly' | 'annual'): Promise<never> {
  const selfHref = `/checkout?plan=insider&interval=${interval}`
  const signInHref = `/sign-in?next=${encodeURIComponent(selfHref)}`

  const token = await getAuthCookie()
  if (!token) {
    redirect(signInHref)
  }

  let checkoutUrl: string | undefined
  try {
    const session = await createInsiderCheckout(token, interval)
    checkoutUrl = session.checkoutUrl
  } catch (err) {
    const status = err instanceof WordPressError ? err.status : 0
    if (status === 401) {
      redirect(signInHref)
    }
    if (status === 409) {
      redirect('/dashboard/membership?checkout=already')
    }
    if (status === 503) {
      redirect('/membership?checkout=unavailable')
    }
    console.error('[checkout] insider checkout failed', err)
    redirect('/membership?checkout=error')
  }

  if (!checkoutUrl) {
    redirect('/membership?checkout=error')
  }

  redirect(checkoutUrl)
}

async function startBrandCheckout(args: {
  brandId: number
  tier: 'basis' | 'plus' | 'partner'
  brandSlug: string
}): Promise<never> {
  const membershipPath = args.brandSlug
    ? `/dashboard/brands/${encodeURIComponent(args.brandSlug)}/membership`
    : '/dashboard'
  const selfHref =
    `/checkout?plan=brand` +
    `&brandId=${encodeURIComponent(String(args.brandId))}` +
    `&tier=${encodeURIComponent(args.tier)}` +
    `&brandSlug=${encodeURIComponent(args.brandSlug)}`
  const signInHref = `/sign-in?next=${encodeURIComponent(selfHref)}`

  const token = await getAuthCookie()
  if (!token) {
    redirect(signInHref)
  }

  let checkoutUrl: string | undefined
  try {
    const session = await createBrandCheckout(token, {
      brandId: args.brandId,
      tier: args.tier,
    })
    checkoutUrl = session.checkoutUrl
  } catch (err) {
    const status = err instanceof WordPressError ? err.status : 0
    if (status === 401) {
      redirect(signInHref)
    }
    if (status === 409) {
      redirect(`${membershipPath}?checkout=already`)
    }
    if (status === 503) {
      redirect(`${membershipPath}?checkout=unavailable`)
    }
    console.error('[checkout] brand checkout failed', err)
    redirect(`${membershipPath}?checkout=error`)
  }

  if (!checkoutUrl) {
    redirect(`${membershipPath}?checkout=error`)
  }

  redirect(checkoutUrl)
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const {
    plan,
    interval: rawInterval,
    brandId: rawBrandId,
    tier: rawTier,
    brandSlug: rawSlug,
  } = await searchParams

  if (plan === 'insider') {
    const interval: 'monthly' | 'annual' =
      rawInterval === 'annual' ? 'annual' : 'monthly'
    await startInsiderCheckout(interval)
  }

  if (plan === 'brand') {
    const brandId = Number(rawBrandId)
    const tier = rawTier === 'plus' || rawTier === 'partner' || rawTier === 'basis'
      ? rawTier
      : null
    const brandSlug = (rawSlug ?? '').trim()
    if (!Number.isFinite(brandId) || brandId <= 0 || !tier || !brandSlug) {
      redirect('/dashboard')
    }
    await startBrandCheckout({ brandId, tier, brandSlug })
  }

  // Unknown plan query → membership marketing page (not the book cart).
  if (plan) {
    redirect('/membership')
  }

  const prefill = await getCheckoutPrefill()

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb
            items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]}
          />
          <h1 className="t-display-lg">Checkout</h1>
        </div>
      </header>

      <div className="ov-wrap-single">
        <CheckoutView prefill={prefill} />
      </div>
    </>
  )
}
