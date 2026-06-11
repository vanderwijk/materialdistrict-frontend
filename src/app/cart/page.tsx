/**
 * `/cart` — winkelmand-pagina.
 *
 * Dunne server-wrapper (header + metadata) rond de client-`CartView`. Niet
 * indexeerbaar. De mand-state komt uit de CartProvider (Store API).
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CartView } from './_components/CartView'

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Cart' }]} />
          <h1 className="t-display-lg">Cart</h1>
        </div>
      </header>

      <div className="ov-wrap-single">
        <CartView />
      </div>
    </>
  )
}
