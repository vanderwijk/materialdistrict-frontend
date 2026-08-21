# Stripe setup for MD Insider

Deze plugin verwacht dat Insider-abonnementen in Stripe als subscription-product worden ingericht en dat Stripe-webhooks de usermeta in WordPress bijwerken.

## 1. Maak het product en de prijzen aan in Stripe

Maak in Stripe Dashboard precies dit product aan:

- Productnaam: `MD Insider`

Maak daarbinnen twee recurring prices aan:

- `insider_monthly`: `EUR 10`, interval `Monthly`
- `insider_annual`: `EUR 100`, interval `Yearly`

Sla het Stripe Product ID op, bijvoorbeeld `prod_ABC123`.

## 2. Configureer de webhook in Stripe

Maak in Stripe Dashboard een webhook endpoint aan naar de **CMS** (headless
bron van usermeta — niet WP Engine / materialdistrict.com):

```text
https://cms.materialdistrict.com/wp-json/md/v2/stripe/webhook
```

Schakel minimaal deze events in:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `checkout.session.completed` (belt-and-braces activatie na Checkout)

Kopieer daarna de webhook signing secret, bijvoorbeeld `whsec_...`.

> Jul 2026 incident: de Insider-webhook stond op `materialdistrict.com` terwijl
> de frontend membership van `cms.materialdistrict.com` leest (aparte DB).
> Betaling lukte, Insider bleef Free. Endpoint moet naar CMS wijzen.

## 2b. Betaalmethoden (NL abonnementen)

Insider Checkout zet `payment_method_types` expliciet op **`card` + `ideal`**:

- **Geen Klarna** — niet geschikt voor B2B / professionals; bewust weggelaten.
- **Geen losse SEPA in de session** — dat toont het IBAN-formulier. SEPA Direct
  Debit moet wél **aan** staan in het Stripe Dashboard (Payment methods), zodat
  iDEAL bij de eerste betaling een SEPA-mandaat aanmaakt voor vernieuwingen.
- **Kaart** — Apple Pay / Link verschijnen automatisch wanneer beschikbaar.
- Checkout toont een korte toelichting over iDEAL → SEPA (`custom_text.submit`).

Route: klant kiest iDEAL → bankbevestiging (evt. QR) → Stripe slaat IBAN +
SEPA-machtiging op → maandelijkse renewals via SEPA.

## 2c. B2B-facturen (BTW / VAT / bedrijfsnaam)

Insider Checkout is ingericht voor zakelijke facturen:

- `billing_address_collection=auto` — adres alleen als Stripe het nodig heeft (tax); particulieren kunnen zonder adres betalen
- `tax_id_collection.enabled=true` — EU btw-nummer (+ bedrijfsnaam) in Checkout
- Prefill vanuit dashboard-profiel: `billing_is_company`, `billing_company_name`,
  `billing_vat_number`, WooCommerce `billing_*` adresvelden → Stripe Customer
- `automatic_tax.enabled=true` (Stripe Tax) wanneer beschikbaar
- Insider-prijzen hebben `tax_behavior=inclusive` zodat €10 / €100 het
  **totaal** blijft; BTW wordt op de factuur uitgesplitst
- Fallback: als Stripe Tax faalt, optioneel
  `MD_STRIPE_NL_VAT_TAX_RATE_ID` (inclusieve NL 21% tax rate) op de subscription

### Stripe Tax (aanbevolen)

In Stripe Dashboard → **Tax**:

1. Activeer Stripe Tax
2. Vul **head office** / registratieadres in (NL)
3. Registreer NL BTW waar nodig

Zonder volledige Tax-setup valt Checkout terug op de handmatige tax rate
(of geen tax line, maar wel adres + VAT ID op de factuur).

### Dashboard-profiel

Gebruikers kunnen vóór checkout onder Account → Profile al
“Invoice to company”, bedrijfsnaam en btw-nummer invullen (VIES-format
`NL…`). Die waarden worden op de Stripe Customer gezet; Checkout laat ze
nog corrigeren.

## 3. Zet de vereiste WordPress-configuratie

Voeg in `wp-config.php` deze constanten toe:

```php
define( 'MD_STRIPE_SECRET_KEY', 'sk_live_...' );              // server-side API (Checkout)
define( 'MD_STRIPE_WEBHOOK_SECRET', 'whsec_...' );
define( 'MD_STRIPE_INSIDER_PRODUCT_ID', 'prod_ABC123' );
define( 'MD_STRIPE_INSIDER_PRICE_MONTHLY', 'price_...' );     // EUR 10 / month (tax inclusive)
define( 'MD_STRIPE_INSIDER_PRICE_ANNUAL', 'price_...' );      // EUR 100 / year (tax inclusive)

// Optional: inclusive NL 21% tax rate when Stripe Tax is unavailable
// define( 'MD_STRIPE_NL_VAT_TAX_RATE_ID', 'txr_...' );

// Headless frontend base URL (success/cancel redirects)
define( 'MD_FRONTEND_URL', 'https://materialdistrict.com' );
```

`MD_STRIPE_INSIDER_PRODUCT_ID` is sterk aanbevolen. Zonder deze constante accepteert de webhook alle subscription-events die op dit endpoint binnenkomen.

`MD_STRIPE_SECRET_KEY` en de price IDs zijn vereist voor `POST /wp-json/md/v2/checkout/insider` (Insider Checkout Session).

Zet op de Stripe Prices `tax_behavior=inclusive` (eenmalig via API of bij
aanmaken), zodat automatic tax / de fallback-rate het geadverteerde bedrag
niet ophoogt.

## 4. Maak abonnementen niet handmatig aan zonder user-koppeling

De WordPress-plugin moet bij elke subscription kunnen bepalen bij welke WP-user het abonnement hoort.

De veiligste koppeling is:

- zet altijd `subscription_data.metadata.wp_user_id`
- zet optioneel ook `client_reference_id` op hetzelfde WordPress user ID
- geef `customer_email` of een bestaand `customer` object mee

Als `subscription_data.metadata.wp_user_id` ontbreekt, probeert de plugin terug te vallen op bestaand `stripe_customer_id`, `stripe_subscription_id` of email. Voor een eerste subscription is dat vaak niet genoeg. Gebruik deze metadata dus altijd.

## 5. Vereiste checkout-aanroep

Bij het aanmaken van een Stripe Checkout Session voor Insider moet de payload functioneel hierop neerkomen:

```json
{
  "mode": "subscription",
  "line_items": [
    {
      "price": "price_for_monthly_or_annual",
      "quantity": 1
    }
  ],
  "customer_email": "user@example.com",
  "client_reference_id": "123",
  "subscription_data": {
    "metadata": {
      "wp_user_id": "123"
    }
  },
  "success_url": "https://jouwdomein.nl/account/insider/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://jouwdomein.nl/account/insider/cancel"
}
```

Belangrijk:

- `123` is hier het WordPress user ID.
- De gekozen `price` bepaalt automatisch `monthly` of `annual` in WordPress.
- De plugin slaat geen apart Stripe-productmodel op in WordPress op.
- De live Checkout Session zet ook `customer` (niet alleen `customer_email`),
  `billing_address_collection`, `tax_id_collection`, `customer_update` en
  `automatic_tax` — zie `rest-insider-checkout.php`.

## 6. Wat de plugin opslaat op user-niveau

Na de webhooks schrijft de plugin deze usermeta-velden:

- `membership_tier`
- `membership_status`
- `membership_billing_interval`
- `membership_valid_until`
- `membership_cancel_at_period_end`
- `stripe_customer_id`
- `stripe_subscription_id`

Daarnaast berekent WordPress:

- `is_insider = true` bij `active`, `trialing` of `past_due`

## 7. Gedrag per webhook-event

- `customer.subscription.created`: zet tier op `insider` en vult status, interval, valid_until, Stripe IDs
- `customer.subscription.updated`: werkt status, interval, valid_until en `cancel_at_period_end` bij
- `customer.subscription.deleted`: zet tier terug naar `free`, status naar `canceled`, interval naar `null`
- `invoice.payment_failed`: zet status naar `past_due`

## 8. Insider Checkout endpoint (headless frontend)

Authenticated users start checkout via:

```http
POST /wp-json/md/v2/checkout/insider
Authorization: Bearer <jwt>
Content-Type: application/json

{ "interval": "monthly" }
```

Response:

```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_...",
  "session_id": "cs_..."
}
```

Redirect the browser to `checkout_url`. After payment, Stripe sends
`customer.subscription.created` to the webhook and the user returns to
`/membership?checkout=success&session_id=…` on the Next.js frontend.

Error codes:

- `md_auth_unauthenticated` (401)
- `md_checkout_invalid_request` (400)
- `md_checkout_already_subscribed` (409)
- `md_checkout_unavailable` (503 — missing Stripe config or API error)

## 9. Aanbevolen testvolgorde

Test dit minimaal in Stripe test mode:

1. Start een maandabonnement voor een bestaande WordPress-user.
2. Controleer in WordPress usermeta of `membership_tier=insider` en `membership_billing_interval=monthly` zijn gezet.
3. Zeg het abonnement op met `cancel_at_period_end=true` en controleer dat die boolean in WordPress mee verandert.
4. Forceer een `invoice.payment_failed` en controleer dat `membership_status=past_due` wordt.
5. Laat het abonnement eindigen of verwijder het en controleer dat `membership_tier=free` en `membership_status=canceled` worden.

## 10. Praktische noot voor Johan

Gebruik voor Insider geen losse handmatige subscriptions in het Stripe Dashboard als die niet aan een WordPress user ID gekoppeld zijn. De webhook kan zulke subscriptions wel ontvangen, maar kan de juiste user dan niet betrouwbaar vinden.