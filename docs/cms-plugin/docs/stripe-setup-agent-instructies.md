# Stripe-setup MaterialDistrict Insider — agent-instructies + uitvoering

> Aangemaakt 02-06-2026. Beschrijft de geautomatiseerde Stripe-setup voor
> **MD Insider** (reader-abonnement) en legt de **test mode**-resultaten vast.
> Zie ook `stripe-insider-setup.md` (config-referentie) en
> `docs/johan-spec-membership-register-checkout.md` (implementatiespec).

## Scope

Alleen Stripe Dashboard/CLI configureren. WordPress (`wp-config.php`) zet Johan
zelf met de IDs hieronder. Checkout-sessies maakt de plugin aan via
`POST /md/v2/checkout/insider` — **niet** handmatig in Stripe aanmaken.

| Item | Waarde |
|---|---|
| Product | MD Insider (reader-tier) |
| Prijzen | €10/maand, €100/jaar (EUR, recurring) |
| Webhook-endpoint | `https://materialdistrict.com/wp-json/md/v2/stripe/webhook` |
| Frontend redirects | `https://materialdistrict.com` |

**Niet doen:** handmatige subscriptions (geen `wp_user_id` metadata → webhook
koppelt niet), publishable key in frontend (checkout is server-side), andere
tiers (fase 2), live mode vóór test-E2E slaagt.

## Setup-script

De setup gebeurt via de Stripe CLI (test mode = default na `stripe login`).
Het script `stripe-insider-setup.sh` maakt product + beide prices + webhook aan,
leest de IDs uit en print het wp-config-blok.

```bash
#!/usr/bin/env bash
set -euo pipefail
jq_id() { python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }

# Stap 1 — Product
PRODUCT_ID=$(stripe products create \
  --name="MD Insider" \
  --description="MaterialDistrict Insider membership — reader tier" \
  | jq_id id)

# Stap 2 — Maandprijs €10/maand
PRICE_MONTHLY=$(stripe prices create \
  --product="$PRODUCT_ID" --unit-amount=1000 --currency=eur \
  --lookup-key=insider_monthly -d "recurring[interval]=month" | jq_id id)

# Stap 3 — Jaarprijs €100/jaar
PRICE_ANNUAL=$(stripe prices create \
  --product="$PRODUCT_ID" --unit-amount=10000 --currency=eur \
  --lookup-key=insider_annual -d "recurring[interval]=year" | jq_id id)

# Stap 5 — Webhook-endpoint (incl. signing secret in .secret)
stripe webhook_endpoints create \
  --url="https://materialdistrict.com/wp-json/md/v2/stripe/webhook" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -d "enabled_events[]=invoice.payment_failed"
```

> Voor **live mode**: zelfde commando's met `--live` toegevoegd aan elke
> `stripe`-aanroep, en gebruik de `sk_live_…` + de live `whsec_…`.

## Resultaat — TEST MODE (02-06-2026)

Aangemaakt en geverifieerd: één product met twee recurring prices.

| Constante | Waarde |
|---|---|
| Modus | **Test** |
| `MD_STRIPE_INSIDER_PRODUCT_ID` | `prod_Ud3Z5qCoIynOi9` |
| `MD_STRIPE_INSIDER_PRICE_MONTHLY` | `price_1TdnS5LbBd2st6kqSqqBeNuw` (€10/mnd, lookup `insider_monthly`) |
| `MD_STRIPE_INSIDER_PRICE_ANNUAL` | `price_1TdnS6LbBd2st6kq0zvmDO31` (€100/jr, lookup `insider_annual`) |
| Webhook ID | `we_1TdnS6LbBd2st6kqTEwTY8BK` |
| `MD_STRIPE_WEBHOOK_SECRET` | *(niet in repo — staat in password manager)* |
| `MD_STRIPE_SECRET_KEY` | *(niet in repo — `sk_test_…`, password manager)* |

> **Secrets staan bewust niet in dit document.** `whsec_…` en `sk_test_…`
> alleen in password manager / WP Engine config. Nooit in git of chat.

## Resultaat — LIVE MODE (02-06-2026, aangemaakt maar nog niet in productie)

Live-resources alvast aangemaakt zodat alles aan Stripe-kant gereed is. Het
live wp-config-blok is **nog niet** toegepast op productie — er wordt in test
mode doorgewerkt totdat de E2E-acceptatie rond is. Live-resources staan los
naast de test-resources in hetzelfde account.

| Constante | Waarde |
|---|---|
| Modus | **Live** (klaargezet, niet actief op productie) |
| `MD_STRIPE_INSIDER_PRODUCT_ID` | `prod_Ud4KDRjnUXzEGX` |
| `MD_STRIPE_INSIDER_PRICE_MONTHLY` | `price_1TdoC6LbBd2st6kqon3MPEkk` (€10/mnd, lookup `insider_monthly`) |
| `MD_STRIPE_INSIDER_PRICE_ANNUAL` | `price_1TdoC6LbBd2st6kqKrZcBHBD` (€100/jr, lookup `insider_annual`) |
| Webhook ID | `we_1TdoC7LbBd2st6kq6hRt6fjE` |
| `MD_STRIPE_WEBHOOK_SECRET` | *(niet in repo — password manager)* |
| `MD_STRIPE_SECRET_KEY` | *(niet in repo — `sk_live_…`, password manager)* |

> Aangemaakt via `stripe-insider-setup-live.sh` (draait met de live secret key
> als env-var `MD_STRIPE_LIVE_KEY`, omdat de CLI-restricted key in live mode
> geen create-rechten heeft).

### wp-config.php blok (test)

```php
define( 'MD_STRIPE_SECRET_KEY', 'sk_test_…' );        // Developers > API keys
define( 'MD_STRIPE_WEBHOOK_SECRET', 'whsec_…' );      // signing secret endpoint
define( 'MD_STRIPE_INSIDER_PRODUCT_ID', 'prod_Ud3Z5qCoIynOi9' );
define( 'MD_STRIPE_INSIDER_PRICE_MONTHLY', 'price_1TdnS5LbBd2st6kqSqqBeNuw' );
define( 'MD_STRIPE_INSIDER_PRICE_ANNUAL', 'price_1TdnS6LbBd2st6kq0zvmDO31' );
define( 'MD_FRONTEND_URL', 'https://materialdistrict.com' );
```

`MD_JWT_SECRET` staat al in wp-config — niet wijzigen.

## Verificatie (stap 7)

1. **Webhook bereikbaar** — Stripe → Webhook → *Send test webhook* voor
   `customer.subscription.created`. Verwacht géén 404 (401/400 op signature is OK).
2. **Checkout-endpoint** (na wp-config):
   ```bash
   curl -s -X POST "https://materialdistrict.com/wp-json/md/v2/checkout/insider" \
     -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
     -d '{"interval":"monthly"}'
   ```
   `{ "checkout_url": "https://checkout.stripe.com/…", "session_id": "cs_…" }` = ✅
   503 = wp-config keys ontbreken · 401 = JWT ongeldig · 409 = al Insider.
3. **E2E** — ingelogde free user → `/checkout?plan=insider` → Stripe Checkout,
   testkaart `4242 4242 4242 4242`. Na betaling redirect naar
   `…/membership?checkout=success&session_id=cs_…`. Webhook zet usermeta
   `membership_tier=insider`, `membership_billing_interval`, `stripe_customer_id`,
   `stripe_subscription_id`. `GET /md/v2/auth/me` → `membership.is_insider: true`.

## Veelgemaakte fouten

Verkeerde webhook-URL (moet `/wp-json/md/v2/stripe/webhook` zijn) · price
one-time i.p.v. recurring · currency USD i.p.v. EUR · test keys in live config ·
twee aparte producten i.p.v. één met twee prices · live mode te vroeg.
