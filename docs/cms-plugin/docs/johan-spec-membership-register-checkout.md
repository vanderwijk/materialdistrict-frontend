# Johan-spec — Register (W11) + Insider checkout (sessie 12)

> Frontend heeft op 01-06-2026 de marketingpagina's `/membership` (Insider) en
> `/become-a-partner` (manufacturer) geleverd. De CTA's lopen bewust vooruit op
> twee WordPress-stukken. Dit document is de implementatiespec.

> **Huidige status (01-06-2026):**
> - **Basis register:** ✅ `POST /md/v2/auth/register` werkt (email, password,
>   first_name, last_name → JWT + user). Getest op productie.
> - **Auth/me Bearer JWT:** ✅ gefixt (callback-validatie i.p.v.
>   `permission_callback: is_user_logged_in`).
> - **Insider membership in user-object:** ✅ webhook + usermeta +
>   `membership.is_insider` in `/auth/me` (zie `stripe-webhooks.php`).
> - **Register account_type + brand-aanmaak:** ✅ `POST /md/v2/auth/register`
>   accepteert `account_type` (`specifier` \| `manufacturer`, aliases `show`/`brand`/`partner`)
>   en optioneel `brand_name`. Manufacturer → draft brand + `connected_brand_id`.
>   `connected_brands[]` shape aligned met frontend datacontract.
> - **Insider checkout-sessie endpoint:** ✅ `POST /md/v2/checkout/insider`
>   (`rest-insider-checkout.php`). Vereist Stripe-config in wp-config (zie
>   `stripe-insider-setup.md`).
> - **Manufacturer tier checkout:** 🔜 Fase 2 (mondeling met frontend).

---

## Context — wat de frontend nu doet

| Pagina | CTA (uitgelogd) | CTA (ingelogd) |
|--------|-----------------|----------------|
| `/membership` | `/register?next=/membership` | `/checkout?plan=insider` (**404**) |
| `/become-a-partner` | `/register?next=/become-a-partner` | `/dashboard` (**404**, Fase 2) |
| Footer “List your materials” | `/register?type=show` | — |

Na registratie logt de frontend automatisch in (cookie + `{ user }` in
response) en redirect naar `?next=`. Manufacturer-flow verwacht dat een
**brand** meteen bestaat zodat `user.brands[]` / `getHighestBrandTier()` werkt
op `/become-a-partner`.

Prijs/features komen uit frontend `membership.ts` (€10/mnd, €100/jr Insider).
WordPress is bron van waarheid voor **status** (`isInsider`, tier, Stripe IDs).

---

## Deel 1 — Register uitbreiden (W11)

### Bestaand endpoint

```
POST /wp-json/md/v2/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "…",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

**Success (200):**

```json
{
  "token": "<jwt>",
  "expires_at": 1780919074,
  "user": { … }
}
```

Shape van `user` = zelfde als `/auth/login` en `/auth/me` (via
`md_auth_user_payload()`). Frontend mapt snake_case → camelCase in
`mapAuthMeResponse()`.

### Nieuwe request-velden

| Veld | Type | Verplicht | Default | Betekenis |
|------|------|-----------|---------|-----------|
| `account_type` | string | nee | `specifier` | `specifier` \| `manufacturer` |

**Backward compatibility:** bestaande callers zonder `account_type` gedragen
zich als `specifier` (huidig gedrag).

Frontend query-params (later door Jeroen in register-form):

- `?type=show` → preselect `manufacturer` (footer “List your materials”)
- `?next=/become-a-partner` → na signup terug naar partner-pagina

De Next.js route stuurt uiteindelijk `account_type` in de POST-body mee; WP
leest alleen de body (niet de query-string).

### Gedrag per account_type

#### `specifier` (default)

- Identiek aan huidige flow: `wp_insert_user`, role `subscriber`.
- Geen brand aanmaken.
- `user.connected_brands` = `[]`.

#### `manufacturer`

Na succesvolle user-aanmaak:

1. **Brand CPT aanmaken** (`post_type` = `brand`):
   - `post_title` = bedrijfsnaam **of** fallback `"{first_name} {last_name}"` tot
     dashboard-form dat later invult (zie open punt hieronder).
   - `post_status` = `draft` (aanbevolen) of `publish` — **beslissing nodig**;
     draft is veiliger tot profiel compleet is.
   - Minimale meta: `_brand_membership_tier` = `free` (of bestaande meta-key
     `brand_tier` — align met `md_brand_membership_payload()`).

2. **User koppelen:**
   - `update_user_meta( $user_id, 'connected_brand_id', $brand_id )` (multi-value
     meta — patroon bestaat al in `md_auth_connected_brands_payload()`).

3. **Optioneel:** role `brand_manager` toekennen (parkeren in database.md A9;
   voor v1 volstaat `subscriber` + connected_brand_id).

4. Response `user.connected_brands[]` bevat het nieuwe brand met free-tier
   membership-payload (tier, status, publicationQuota, …).

### Open punt — brand-naam bij register

Frontend register-form heeft **nog geen** veld “Company / brand name”. Opties:

- **A (snel):** brand-titel = `display_name` van user; later editable in dashboard.
- **B (uitstellen):** verplicht `brand_name` in register-body zodra Jeroen het
  veld toevoegt.

**Aanbeveling:** start met A; documenteer in error-envelope als B later komt.

### Error-envelope (ongewijzigd patroon)

Bestaande codes blijven; voeg toe:

| Code | HTTP | Wanneer |
|------|------|---------|
| `md_auth_invalid_request` | 400 | Onbekende `account_type` |
| `md_auth_register_failed` | 500 | User OK, brand-aanmaak mislukt (rollback user?) |

Bij brand-aanmaak-failure: **transactioneel** user verwijderen of user laten
bestaan zonder brand — voorkeur: rollback (`wp_delete_user`) + 500, zodat
frontend opnieuw kan proberen.

### Implementatie-locatie

- `rest-auth.php` → `md_auth_register_endpoint()`
- Hergebruik `md_auth_issue_token_response()` na user (+ eventueel brand) klaar.
- Brand membership defaults: `md_brand_membership_payload()` in
  `stripe-webhooks.php`.

### Acceptatiecriteria W11

1. `POST /auth/register` zonder `account_type` → subscriber, geen brand (regressie OK).
2. `account_type: "manufacturer"` → user + draft brand + `connected_brand_id`.
3. `/auth/me` met token toont nieuw brand in `connected_brands`.
4. Frontend `/become-a-partner` toont “Manage your membership” i.p.v. “Become a
   partner” (`getHighestBrandTier() !== null`).

---

## Deel 2 — Insider checkout (sessie 12)

### Wat al werkt

- Stripe webhook: `POST /wp-json/md/v2/stripe/webhook`
- Usermeta na subscription: `membership_tier`, `membership_status`, …
- `user.membership.is_insider` in auth-responses (computed server-side)
- Setup-guide: `stripe-insider-setup.md`

### Wat ontbreekt

Een **authenticated** endpoint dat een Stripe Checkout Session URL teruggeeft,
zodat de frontend `/checkout?plan=insider` (of een Route Handler) de user naar
Stripe kan sturen.

### Nieuw endpoint (voorstel)

```
POST /wp-json/md/v2/checkout/insider
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "interval": "monthly"
}
```

| Veld | Type | Verplicht | Waarden |
|------|------|-----------|---------|
| `interval` | string | ja | `monthly` \| `annual` |

**Success (200):**

```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_…",
  "session_id": "cs_test_…"
}
```

**Errors (`md_auth_*` / `md_checkout_*`):**

| Code | HTTP | Wanneer |
|------|------|---------|
| `md_auth_unauthenticated` | 401 | Geen/geldige JWT |
| `md_checkout_invalid_request` | 400 | Onbekende interval |
| `md_checkout_already_subscribed` | 409 | User is al Insider (`is_insider`) |
| `md_checkout_unavailable` | 503 | Stripe niet geconfigureerd |

### Stripe Checkout Session — verplichte velden

Zie `stripe-insider-setup.md` §5. Minimaal:

```json
{
  "mode": "subscription",
  "line_items": [{ "price": "<price_id_monthly_or_annual>", "quantity": 1 }],
  "customer_email": "<user_email>",
  "client_reference_id": "<wp_user_id>",
  "subscription_data": {
    "metadata": { "wp_user_id": "<wp_user_id>" }
  },
  "success_url": "<frontend>/membership?checkout=success&session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "<frontend>/membership?checkout=cancel"
}
```

**Configuratie (wp-config.php):**

```php
define( 'MD_STRIPE_SECRET_KEY', 'sk_live_…' );           // nieuw — voor API-calls
define( 'MD_STRIPE_INSIDER_PRODUCT_ID', 'prod_…' );      // bestaat al
define( 'MD_STRIPE_INSIDER_PRICE_MONTHLY', 'price_…' );  // nieuw
define( 'MD_STRIPE_INSIDER_PRICE_ANNUAL', 'price_…' );    // nieuw
define( 'MD_STRIPE_WEBHOOK_SECRET', 'whsec_…' );          // bestaat al
```

Price IDs kunnen ook via filters/options; hardcoded constants zijn OK voor v1.

**Success/cancel URLs:** frontend base = `NEXT_PUBLIC_SITE_URL`
(`https://materialdistrict.com` prod, `http://localhost:3000` dev). Overleg met
Jeroen of success direct naar `/membership` of account-pagina gaat.

### Flow na betaling

1. User betaalt in Stripe Checkout.
2. Webhook `customer.subscription.created` → usermeta + `is_insider=true`.
3. User keert terug naar success_url; frontend doet `router.refresh()` /
   opnieuw `/api/auth/me` → header toont Insider.

Geen wijziging nodig in webhook-logica als metadata correct is.

### Frontend-koppeling (ter info — Jeroen bouwt)

- Route `/checkout` (of server action) roept bovenstaand WP-endpoint aan met
  cookie-JWT, redirect naar `checkout_url`.
- `/membership` CTA voor ingelogde users → `/checkout?plan=insider` (eventueel
  `&interval=annual` later).

### Acceptatiecriteria Insider checkout

1. Ingelogde free user → POST checkout → geldige Stripe URL.
2. Na testmode-betaling → webhook → `/auth/me` toont `membership.is_insider: true`.
3. Reeds Insider → 409, geen dubbele checkout.
4. Webhook metadata bevat altijd `wp_user_id`.

---

## Deel 3 — Fase 2 (niet in deze sprint)

Manufacturer tier-aankopen (Basis / Plus / Partner):

- Apart checkout-endpoint per tier of generiek `/checkout/brand-tier`
- Brand-level Stripe subscriptions (post meta `_brand_membership_*`)
- Dashboard datacontract (`/dashboard`) — mondeling af te stemmen

Frontend partner-pagina toont tiers al marketing-only; geen WP-werk nodig voor
deploy van die pagina.

---

## Testplan (Johan)

### Register W11

```bash
# Specifier (regressie)
curl -s -X POST "$WP/auth/register" -H 'Content-Type: application/json' \
  -d '{"email":"…","password":"…","first_name":"A","last_name":"B"}'

# Manufacturer
curl -s -X POST "$WP/auth/register" -H 'Content-Type: application/json' \
  -d '{"email":"…","password":"…","first_name":"M","last_name":"Brand","account_type":"manufacturer"}'

# auth/me — connected_brands niet leeg
curl -s "$WP/auth/me" -H "Authorization: Bearer $TOKEN"
```

### Insider checkout

1. Stripe test mode keys in wp-config.
2. POST checkout als ingelogde user → open URL in browser.
3. Testkaart → webhook log → usermeta controleren.
4. `/auth/me` → `membership.tier === "insider"`, `is_insider === true`.

---

## Referenties

| Bestand | Rol |
|---------|-----|
| `rest-auth.php` | Register, login, me, JWT |
| `stripe-webhooks.php` | Webhook, membership payloads |
| `stripe-insider-setup.md` | Stripe Dashboard + metadata |
| `database.md` A7–A8 | Membership + connected_brands |
| Frontend `src/lib/config/membership.ts` | Prijzen/features (UI only) |
| Frontend `src/app/membership/` | Insider marketing + CTA |
| Frontend `src/app/become-a-partner/` | Partner marketing + CTA |
