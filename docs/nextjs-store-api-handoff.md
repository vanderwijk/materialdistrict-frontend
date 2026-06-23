# NextJS developer handoff — WooCommerce Store API integration

**Audience:** the NextJS developer building the materialdistrict.com frontend.
**Backend owner:** Johan (WordPress plugin + server). Anything needed on the
WordPress side goes through him — frontend code never lives in the WP repo and
vice versa.
**Companion doc:** `docs/woocommerce-migration-plan.md` (migration & cutover plan).

---

## 1. Architecture

**Now (build phase):**

| Layer | URL |
|---|---|
| WordPress backend (REST + Store API + media) | `https://materialdistrict.com` |
| Old bookstore (untouched, retires at launch) | `https://books.materialdistrict.com` |
| NextJS dev | `http://localhost:3000` |
| NextJS test environment | `https://materialdistrict-frontend.vercel.app` (covered by the CORS preview wildcard) |

**After cutover (go-live):**

| Layer | URL |
|---|---|
| NextJS production (Vercel) | `https://materialdistrict.com` |
| WordPress backend | `https://cms.materialdistrict.com` |

→ **Build all backend URLs from an env var** (e.g. `NEXT_PUBLIC_WP_URL`), never
hard-code. At cutover only the env var changes.

**Current env values (build phase):**

```bash
NEXT_PUBLIC_WP_URL=https://materialdistrict.com
NEXT_PUBLIC_STRIPE_PK=pk_test_2ZhC8GFCniUHavip9OmgFKQ0
```

(The Stripe key is the test-mode publishable key — safe for the browser.)

**PayPal sandbox buyer** (test environment only, fake money — log in at
sandbox.paypal.com during checkout approval):

```
email:    sb-ke2yi51553774@personal.example.com
password: wj*6O//H
```

The WooCommerce store on the main site is fully populated (products, prices,
stock, shipping, tax, coupons, one product bundle) but hidden behind
WooCommerce "Coming soon" mode (store pages only). The catalog mirrors the live
bookshop until cutover.

**🔑 Decision (2026-06-11): the ENTIRE order flow lives in NextJS.** No
WordPress page is ever customer-facing: catalog, cart, checkout, payment
return/confirmation, and My Account are all NextJS routes. The WP
shop/cart/checkout pages exist only as technical placeholders (some plugins
require them) and stay noindexed. Consequence: every redirect that WooCommerce
generates toward itself (notably the post-payment "order received" URL) is
rewritten server-side to the NextJS equivalent — see §4.4.

## 2. CORS contract (already live in production)

The WP backend sends CORS headers on all `/wp-json/*` responses for these
origins: `https://materialdistrict.com`, `https://www.materialdistrict.com`,
`http://localhost:3000`, `https://localhost:3000`, and any
`https://*.vercel.app` preview deploy (the preview wildcard is switched off
after launch).

- Allowed request headers: `Authorization, Content-Type, Cart-Token, Nonce, X-WC-Store-API-Nonce, X-WP-Nonce`
- Exposed response headers: `Cart-Token, Nonce, X-WC-Store-API-Nonce, X-WP-Total, X-WP-TotalPages, Link`
- `Access-Control-Allow-Credentials: true`

Verify from your machine:

```bash
curl -s -o /dev/null -D - -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  https://cms.materialdistrict.com/wp-json/wc/store/v1/products | grep -i access-control
```

If you need an extra origin allowlisted, ask Johan (it's a one-line filter in
the WP plugin: `md_headless_cors_origins`).

## 3. Store API basics

Base: `{WP_URL}/wp-json/wc/store/v1/` — no authentication needed for guest
flows. Docs: https://developer.woocommerce.com/docs/apis/store-api/

**Catalog (read-only, cacheable — use ISR):**
- `GET products?per_page=20&page=1` (pagination via `X-WP-Total(Pages)` headers)
- `GET products/<id-or-slug>`
- `GET products/categories`

**Cart (session-based via Cart-Token, NOT cookies):**
1. First cart call (e.g. `GET cart`) returns a `Cart-Token` response header.
2. Persist that token client-side (localStorage) and send it as a `Cart-Token`
   request header on every subsequent cart/checkout call.
3. Mutations: `POST cart/add-item`, `POST cart/update-item`,
   `POST cart/remove-item`, `POST cart/apply-coupon`,
   `POST cart/update-customer` (sets shipping address → returns shipping rates),
   `POST cart/select-shipping-rate`.

The cart response contains totals, tax, shipping rates (table rates by zone:
NL / BE+DE / EU / rest of world) and applied coupons — render those, never
recompute prices client-side.

**Checkout:**
- `POST checkout` with billing/shipping addresses, `payment_method`, and
  gateway-specific `payment_data` (see §4).
- Response contains `payment_result` with `payment_status`
  (`success|failure|pending|error`), `payment_details` and `redirect_url`.
- For redirect-based methods (PayPal, iDEAL): send the customer to
  `redirect_url`, and handle the return. Return/thank-you URLs land on the WP
  domain by default — see "Open items" §7.

**One product type quirk:** the catalog contains one **product bundle**
("Tomorrow's Timber + Booming Bamboo"). Bundles expose their contents via the
Store API as `type: "bundle"` with extension data — test add-to-cart for this
product explicitly.

## 4. Payments

Stripe account and PayPal account are existing/live accounts of the books
store. The main-site store runs **Stripe in test mode** and **PayPal in
sandbox** until cutover.

### 4.1 Stripe (cards + iDEAL)

Plugin: official WooCommerce Stripe Gateway (`woocommerce-gateway-stripe`).

- Frontend uses Stripe.js/Elements with the **test publishable key** (get it
  from Johan; will be an env var `NEXT_PUBLIC_STRIPE_PK`).
- Flow: create a PaymentMethod client-side → `POST checkout` with
  `payment_method: "stripe"` and the gateway's expected `payment_data` keys →
  handle `payment_result` (3DS may surface via `redirect_url` or follow-up
  intent confirmation).
- iDEAL (`payment_method: "stripe_ideal"`) is redirect-based: expect a
  `redirect_url` to the bank flow.

⚠️ The exact `payment_data` keys are version-dependent and not formally
documented. **Authoritative discovery technique** (recommended by gateway
authors): complete a test payment on a native block-based checkout with
DevTools open and capture the `POST /wp-json/wc/store/v1/checkout` request
body — it shows every key the gateway expects.

**Important:** the production theme does NOT render WooCommerce checkout
pages, so do this on a throwaway local WordPress install instead (LocalWP +
Storefront theme + the same WooCommerce/Stripe/PayPal plugin versions, test
keys). The `payment_data` keys are plugin-version-specific, not
site-specific, so what you capture locally applies to production. Ask Johan
for the exact plugin versions.

### 4.2 PayPal — spike findings & decision needed

Plugin currently installed: official **WooCommerce PayPal Payments** (PPCP).
Its Store-API/headless support is poorly documented; it creates PayPal orders
through its own wc-ajax endpoints, which is awkward cross-origin.

A proven alternative exists: **Payment Plugins for PayPal WooCommerce**
(`pymntpl-paypal-woocommerce`). A developer publicly confirmed (plugin support
forum, 2024) completing headless Store API payments in both sandbox and
production with it; its `payment_data` consists of the PayPal order ID + an
optional billing-token key, and the plugin author actively supports the
capture-the-network-request discovery flow.

**Recommended approach:**
1. First try the official PPCP plugin via the discovery technique above (test
   payment on the native block checkout, capture `payment_data`). If the
   redirect → approve → return flow completes from an external origin, use it.
2. If PPCP fights you (origin-bound return URLs, ajax-only order creation),
   tell Johan — switching the main-site store to the Payment Plugins gateway
   is a backend change he can make; books keeps PPCP and is unaffected.

Time-box this: it's the riskiest integration in the project; do it early.

### 4.3 Order confirmation & payment returns (all-NextJS flow)

- `POST checkout` returns `order_id` and `order_key`. The NextJS
  order-confirmation route fetches the order with
  `GET /wp-json/wc/store/v1/order/{order_id}?key={order_key}&billing_email=…`
  (no auth needed — the key acts as the credential).
- For redirect gateways (PayPal, iDEAL): the WP backend rewrites its own
  customer-facing URLs to NextJS routes (shipped in the MaterialDistrict
  plugin, `headless-frontend-urls.php`). **Routes the NextJS app must
  implement:**
  - `/order-confirmation/{order_id}?key={order_key}` — post-payment landing
  - `/checkout` — cancel/failure returns land here
  - `/cart`
  The frontend base URL currently points at
  `https://materialdistrict-frontend.vercel.app` (switches to
  materialdistrict.com at cutover via the `MD_FRONTEND_URL` constant). Want
  different route shapes? Tell Johan — it's a one-line change per route.

### 4.4 Test cards

Stripe test mode: `4242 4242 4242 4242` (any future expiry/CVC); 3DS test card
`4000 0027 6000 3184`. PayPal: sandbox buyer account (ask Johan).

## 5. next.config requirements

```js
// Sketch — adapt to the project's config style.
const WP_URL = process.env.NEXT_PUBLIC_WP_URL; // https://materialdistrict.com → later https://cms.materialdistrict.com

module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'materialdistrict.com', pathname: '/wp-content/**' },
      { protocol: 'https', hostname: 'cms.materialdistrict.com', pathname: '/wp-content/**' },
    ],
  },
  async redirects() {
    return [
      // ACTIVATE AT CUTOVER: legacy media URLs indexed by Google must keep working
      { source: '/wp-content/:path*', destination: 'https://cms.materialdistrict.com/wp-content/:path*', permanent: true },
      { source: '/wp-admin', destination: 'https://cms.materialdistrict.com/wp-admin', permanent: false },
      { source: '/wp-login.php', destination: 'https://cms.materialdistrict.com/wp-login.php', permanent: false },
    ];
  },
};
```

- **Vercel function region: `fra1` (Frankfurt)** — the WP backend is hosted in
  an EU datacenter; keep SSR/route handlers close to it.
- Use ISR for catalog pages so most traffic never hits WordPress; throttle
  build-time fetching (don't hammer WP with hundreds of parallel requests
  during a deploy — at 46 products this is currently a non-issue, but the
  pattern matters for the content site).

## 6. Existing custom REST endpoints

The MaterialDistrict WP plugin already exposes custom endpoints used by the
frontend build (see plugin files `rest-*.php`), including `rest-auth.php`
(authentication), `rest-frontend-catalogs.php`, `rest-insider-checkout.php`
(Stripe-based Insider memberships — separate from WooCommerce), and others.
Coordinate with Johan for the contract of each; this handoff covers only the
WooCommerce Store API surface.

## 7. Open items (owner in brackets)

1. ~~Verify Store API guest access while coming-soon mode is on.~~
   ✅ Verified 2026-06-11: guest (cookie-less) requests to
   `/wp-json/wc/store/v1/products` return JSON; coming-soon only affects the
   store *pages*, not the Store API.
2. **[NextJS dev]** PayPal spike (§4.2) — time-box, report findings.
3. **[Johan]** ~~Provide env values + PayPal sandbox buyer~~ ✅ all in §1.
   Plugin versions for the local capture install: WooCommerce 10.8.1, Stripe
   gateway 10.7.0, PayPal Payments 4.0.4 (as of 2026-06-11 — verify current).
4. **[Johan]** ~~Thank-you/return-URL strategy~~ ✅ Decided 2026-06-11: no WP
   pages in the order flow at all. Johan ships a plugin filter that rewrites
   order-received/cancel URLs to NextJS routes (§4.3) — coordinate the route
   shapes before building the checkout.
5. **[Both]** My Account auth approach (cookie domain vs token) — decision
   pending. **Decided (2026-06-11):** historical bookshop orders are NOT
   migrated; My Account on the new site only shows orders placed there.
6. **[Both]** Customer-facing emails come from WordPress via `wp_mail()`
   (currently Postmark; moving to Amazon SES before/at cutover) — review links
   inside transactional emails at cutover so they point at the NextJS domain,
   not cms.

## 8. Definition of done for the checkout integration

- [ ] Product listing + detail from Store API (ISR, paginated)
- [ ] Cart with Cart-Token persistence; coupons apply correctly (try `TTT20%OFF` in test)
- [ ] Shipping rates appear per zone (NL / BE+DE / EU / RoW) incl. free-shipping thresholds
- [ ] Bundle product can be added to cart and checked out
- [ ] Stripe test card order end-to-end, incl. order confirmation UI
- [ ] Stripe iDEAL test order (redirect out + back)
- [ ] PayPal sandbox order (redirect out + back)
- [ ] Failed payment shows usable error state (declined test card `4000 0000 0000 0002`)
- [ ] All flows work from a Vercel preview URL (CORS preview wildcard)
