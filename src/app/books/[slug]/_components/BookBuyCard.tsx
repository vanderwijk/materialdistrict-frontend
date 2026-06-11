'use client'

/**
 * BookBuyCard
 * ----------------------------------------------------------------------
 * Auth-aware koop-card voor de book-detail-sidebar. Ink-paneel met een groene
 * koop-CTA (F2 CTA-taal). De Insider-prijs is een UI-afleiding via
 * `getBookPrice(price, isInsider)` — WordPress levert alleen de reguliere
 * prijs. Client-component omdat de weergave van `useAuth().isMember` afhangt:
 *
 *  - Insider           → de Insider-prijs groot, reguliere prijs doorgehaald.
 *  - Niet-member       → reguliere prijs groot + upsell ("Insiders pay …").
 *  - Uitverkocht       → "Sold out" i.p.v. de koopknop.
 *  - Geen prijs bekend  → val terug op een neutrale "View"-link.
 *
 * De koop-CTA linkt naar de bestaande WooCommerce-flow (`buyUrl`); checkout
 * bouwen we niet opnieuw in Next.js.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { getBookPrice } from '@/lib/config/membership'
import { formatEur } from '@/lib/utils/format-price'

export interface BookBuyCardProps {
  title: string
  price: number
  inStock: boolean
  /**
   * WooCommerce-koop-URL, fase-afhankelijk door Johan geleverd (nooit een
   * cms-URL). `null` als nog niet bekend — dan tonen we geen koopknop i.p.v.
   * een gokje, zodat we gebruikers nooit naar een backend-URL sturen.
   */
  buyUrl: string | null
}

export function BookBuyCard({ title, price, inStock, buyUrl }: BookBuyCardProps) {
  const { isMember } = useAuth()

  const priceKnown = price > 0
  const insiderPrice = getBookPrice(price, true)
  const hasDiscount = priceKnown && insiderPrice < price

  return (
    <aside className="book-buy-card" aria-label={`Buy ${title}`}>
      <div className="book-buy-eyebrow">Buy this book</div>

      {priceKnown ? (
        <>
          <div className="book-buy-price">
            <span className="book-buy-price-now">
              {formatEur(isMember && hasDiscount ? insiderPrice : price)}
            </span>
            {isMember && hasDiscount && (
              <span className="book-buy-price-was">{formatEur(price)}</span>
            )}
          </div>

          {isMember && hasDiscount && (
            <div className="book-buy-insider-tag">Insider price applied</div>
          )}

          {!isMember && hasDiscount && (
            <p className="book-buy-upsell">
              Insiders pay {formatEur(insiderPrice)}.{' '}
              <a href="/membership">Become an Insider</a>
            </p>
          )}
        </>
      ) : (
        <p className="book-buy-upsell">See price and availability in the shop.</p>
      )}

      {!inStock ? (
        <span className="book-buy-soldout">Sold out</span>
      ) : buyUrl ? (
        <a className="book-buy-btn-link" href={buyUrl}>
          {priceKnown ? 'Buy this book' : 'View in shop'}
          <span aria-hidden="true"> →</span>
        </a>
      ) : null}
    </aside>
  )
}
