# Stripe setup for brand memberships and material publications

Deze plugin ondersteunt nu drie Stripe-gestuurde membershipstromen:

- Insider op user-niveau
- Brand tier memberships op brand-niveau
- Standalone material publications op material-niveau

Deze handleiding beschrijft alleen de brand- en materialkant.

## 0. Self-service Checkout (headless)

Authenticated brand managers start annual tier Checkout via:

```http
POST /wp-json/md/v2/checkout/brand
Authorization: Bearer <jwt>
Content-Type: application/json

{ "brand_id": 123, "tier": "basis" }
```

`tier`: `basis` | `plus` | `partner` (API `basis` → WP/Stripe `basic`).

Response: `{ "checkout_url", "session_id" }`. Redirect the browser to `checkout_url`.

wp-config price constants (annual, tax-inclusive):

```php
define( 'MD_STRIPE_BRAND_PRICE_BASIC', 'price_…' );    // lookup_key brand_basic
define( 'MD_STRIPE_BRAND_PRICE_PLUS', 'price_…' );     // brand_plus
define( 'MD_STRIPE_BRAND_PRICE_PARTNER', 'price_…' );  // brand_partner
```

Reuse `MD_STRIPE_SECRET_KEY`, `MD_FRONTEND_URL`, and the Insider tax helpers.

## 1. Metadata die Stripe altijd moet meesturen

Voor brand tier subscriptions:

- `wp_user_id`
- `wp_brand_id`
- `membership_type=brand`
- `target_tier` (basis|plus|partner)
- aliases `user_id` / `brand_id` (optional)

Voor material publication subscriptions:

- `wp_user_id`
- `wp_brand_id`
- `wp_material_id`

Zet deze metadata op de subscription zelf, bijvoorbeeld via `subscription_data.metadata` in Checkout.

## 2. Verwachte Stripe lookup keys of membership codes

De webhook probeert Stripe prices te herkennen via `lookup_key`, `nickname` of `price.metadata.membership_code`.

Gebruik voor brand tiers exact deze codes:

- `brand_basic`
- `brand_plus`
- `brand_partner`
- `brand_plus_grandfathered_pro5`
- `brand_plus_grandfathered_pro10`

Gebruik voor standalone material publications exact deze codes:

- `material_publication_regular`
- `material_publication_grandfathered`

Als Stripe andere codes gebruikt, voeg dan een WordPress filter toe op:

- `md_stripe_brand_catalog_map`
- `md_stripe_material_catalog_map`

## 3. Wat de webhook met brand subscriptions doet

Bij brand subscriptions schrijft WordPress deze postmeta op de brand:

- `_brand_tier`
- `_brand_tier_grandfathered`
- `_brand_membership_status`
- `_brand_membership_valid_until`
- `_brand_membership_cancel_at_period_end`
- `_brand_stripe_customer_id`
- `_brand_stripe_subscription_id`

Daarnaast berekent WordPress:

- `has_active_membership = true` bij status `active`, `trialing` of `past_due` en tier niet `free`

Voor backward compatibility wordt ook `_brand_period_end_date` mee bijgewerkt.

Het legacy veld `_partner` blijft bewust los van Stripe en wordt niet door de webhook aangepast.

## 4. Wat de webhook met materials doet

Bij standalone material subscriptions schrijft WordPress deze postmeta op het materiaal:

- `_material_publication_status`
- `_material_publication_valid_until`
- `_material_stripe_subscription_id`

Voor backward compatibility wordt ook `_material_period_end_date` mee bijgewerkt.

## 5. Mutual exclusion die WordPress afdwingt

WordPress dwingt deze regel af:

- Brands met tier `free` mogen alleen `legacy`, `standalone_regular`, `standalone_grandfathered`, `former_member`, `former_standalone`
- Brands met tier `basic`, `plus` of `partner` mogen alleen `member`

Gevolgen:

- zodra een brand tier subscription actief wordt, worden alle materialen onder die brand naar `member` gezet
- zodra een brand tier subscription eindigt en de brand teruggaat naar `free`, worden `member`-materialen naar `former_member` gezet
- een standalone material subscription onder een niet-free brand wordt door de webhook geweigerd

## 6. Write protection in WP-admin

Stripe-gestuurde brandvelden zijn server-side beschermd tegen handmatige overschrijving.

Het bestaande legacy veld `_partner` blijft handmatig beheerbaar voor de huidige website en is geen Stripe source of truth.

Voor materials geldt:

- `legacy`: `publication_valid_until` mag handmatig worden aangepast
- `standalone_*`: `publication_valid_until` is Stripe-owned
- `member`: `publication_valid_until` wordt leeggemaakt
- `former_*`: `publication_valid_until` blijft bevroren

## 7. Minimale webhook-events

Laat Stripe minimaal deze events sturen:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Voor materials doet `invoice.payment_failed` bewust geen statusmutatie, omdat er geen apart material membership_status-veld bestaat.

## 8. Praktische testvolgorde

1. Maak een test-brand met een bekend post ID.
2. Maak een test-materiaal onder die brand.
3. Start een brand subscription met metadata `wp_brand_id` en controleer dat de brand tier/meta gevuld wordt.
4. Controleer dat de materialen van die brand naar `member` springen.
5. Beëindig de brand subscription en controleer dat `member`-materialen naar `former_member` gaan.
6. Start daarna op een free-brand een standalone material subscription met `wp_material_id`.
7. Controleer dat het materiaal `standalone_regular` of `standalone_grandfathered` krijgt, plus een `publication_valid_until` en `stripe_subscription_id`.