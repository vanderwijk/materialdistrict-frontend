# MANIFEST — Checkout (merge op de Store-API-proxy)

Checkout uitgelijnd op de **proxy-architectuur op main** (gebouwd op de
`cart.ts` / `CartContext.tsx` uit `store-api-proxy-handoff.zip`).

**Vervangt** de eerdere checkout-zip (die op de oude `NEXT_PUBLIC_WP_URL`-opzet
stond — NIET deployen). Deze levering is een **schone merge op main**: alleen
gewijzigde + nieuwe bestanden, geen catalogus/layout/proxy eroverheen.

---

## Architectuur — alles via de proxy

Cart, checkout én order lopen via de bestaande generieke proxy
`/api/store-cart/[[...path]]` (same-origin, JWT server-side mee, Cart-Token +
Nonce passthrough). Eén client: `cartFetch` → herexporteerd als `storeRequest`.

- `POST /api/store-cart/checkout`           → `/wc/store/v1/checkout`
- `GET  /api/store-cart/order/{id}?key=…`   → `/wc/store/v1/order/{id}?key=…`

`credentials: 'include'` (al zo in main's cart.ts) → de HttpOnly JWT bereikt de
proxy → Insider-pricing geldt óók in checkout. `NEXT_PUBLIC_WP_URL` is hier niet
nodig (de proxy gebruikt server-side `WP_API_URL`).

---

## Bestanden

**Gewijzigd (complete bestanden, op main gebouwd)**
- `src/lib/api/cart.ts` — main's proxy-versie **+** `StoreAddress`,
  `updateCustomer`, `selectShippingRate`, `storeRequest` (= `cartFetch`).
- `src/components/providers/CartContext.tsx` — main's versie **+** `setCustomer`
  + `selectShipping`.
- `src/app/cart/_components/CartView.tsx` — checkout-knop actief → `/checkout`.

**Nieuw**
- `src/lib/api/checkout.ts` — `submitCheckout`, `fetchOrder` (beide via
  `storeRequest`), order-email-stash, `buildStripePaymentData` (⚠️ capture).
- `src/lib/stripe/client.ts` — Stripe.js-loader (publishable key uit env).
- `src/app/checkout/` — `page.tsx` + `CheckoutView` (Elements) + `CheckoutForm`
  + `AddressFields`.
- `src/app/order-confirmation/[orderId]/` — `page.tsx` + `OrderConfirmationView`.

**CSS (additief — alleen het nieuwe blok)**
- `src/styles/globals-additions-checkout.css` — append ná het bestaande
  §BOOKS-blok in `globals.css`. **Niet** het §BOOKS-blok opnieuw plakken; dat
  staat al op main.

---

## Te doen om te kunnen testen (Johan)

1. Dependencies: `@stripe/stripe-js` + `@stripe/react-stripe-js`.
2. `next.config`: images `remotePatterns` (materialdistrict.com + cms) + region
   `fra1` — sketch in `docs/next.config.sketch.js`.
3. `NEXT_PUBLIC_STRIPE_PK` op Vercel zetten zodra je wilt testen.

## ⚠️ De ene open plek — Stripe `payment_data`

`buildStripePaymentData()` (checkout.ts) bevat de best-known sleutels voor
gateway 10.7.0: `wc-stripe-payment-method` + `wc-stripe-is-deferred-intent`.
Bevestigen via de capture (handoff §4.1): test-betaling op lokale block-checkout,
DevTools, lees de `POST /checkout`-body. Wijkt af → alleen die ene functie
aanpassen.

## PayPal — spike open

Nog niet in de UI; redirect-afhandeling (`payment_result.redirect_url` →
doorsturen) staat generiek klaar, dus PayPal schuift erin zodra gateway-id +
`payment_data` uit de spike bekend zijn.

## Insider-korting — server-side (afgehandeld)

Cart/checkout renderen WC-totalen (incl. de 10% voor ingelogde members via de
JWT door de proxy). `getBookPrice` blijft puur voor de prijsweergave op `/books`
+ `/membership`. **Sync:** wijzigt de korting, dan moeten `membership.ts` én de
WP-plugin dezelfde waarde krijgen.

---

## Verificatie

- Alle bestanden transpileren schoon (esbuild; `@stripe/*` extern → installeren).
- Tegen productie eerder bevestigd: cart-flow (token/nonce/add-item → 201),
  checkout-prep (`update-customer` → tarieven per zone, `select-shipping-rate`),
  schema van `POST /checkout`.
- Niet vanuit deze omgeving te testen: de echte betaling (Stripe Elements in de
  browser, `payment_data`-capture, PayPal-redirect, order-fetch op een echte
  order). Dat is browser-/dev-werk.

## DoD-status

- [x] Catalogus, winkelmand, coupons (live op main)
- [x] Verzendtarieven per zone (update-customer → select-shipping-rate)
- [x] Checkout via proxy (JWT → Insider-pricing ook in checkout)
- [~] Stripe-kaart e2e — flow klaar; `payment_data` wacht op capture
- [~] Stripe iDEAL — redirect-flow klaar
- [ ] PayPal sandbox — spike open
- [x] Orderbevestiging-UI (order-fetch via key, met fallbacks)
- [~] Foutstaat mislukte betaling — in de UI; e2e na capture
- [ ] Bundle e2e — na capture
