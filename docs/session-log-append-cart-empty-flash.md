<!-- Append aan session-log.md (repo-root). -->

## Cart-pagina — leeg-flits weg (11-06-2026)

Tweede bron van de "cart is empty"-flits zat op `/cart` (niet in de checkout-wrappers,
die zijn schoon). `CartView` woog de bootstrap-staat niet mee.
- `app/cart/_components/CartView.tsx`: `initialized` uit `useCart()`; guard
  `!initialized → <EmptyState title="Loading your cart…" />` vóór de leeg-check.
Spiegelt de checkout-guard. Geen nieuwe CSS (hergebruik EmptyState). esbuild OK.

Open in dezelfde hoek: badge (punt 4, wacht op live layout.tsx i.v.m. CartProvider-nesting)
en Insider-korting in cart (punt 2, eerst server-side WC bij Johan).
