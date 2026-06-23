# Handoff Claude — checkout, adres-Pad B, iDEAL & cart (juni 2026)

**Datum:** 15 juni 2026  
**Van:** Johan (via Cursor-sessie)  
**Voor:** Claude (alleen `materialdistrict-frontend`)  
**Doel:** Overdracht van alles wat deze week is gebouwd en op production is getest, zodat je zonder contextverlies verder kunt.

---

## Jouw scope vs. Johan

| | Claude | Johan |
|---|--------|-------|
| **Repo** | Alleen `materialdistrict-frontend` | Plugin + frontend + theme |
| **Git pull/sync** | Alleen frontend (als Johan de repo heeft bijgewerkt) | Alle repos |
| **Git push** | **Nooit** — geen push-rechten | Altijd; enige route naar GitHub/Vercel/WPE |
| **Plugin/theme code** | Geen toegang; alleen **consumer** van live REST/Store API | Bouwt en deployt `materialdistrict-plugin` (`master` → WP Engine) |

Als je plugin-wijzigingen nodig hebt: beschrijf het concreet (endpoint, payload, bestandsnaam) en laat Johan implementeren/deployen. Frontend bouw je lokaal in je checkout; Johan merged en pusht naar `main`.

---

## ⚠️ Eerst doen: sync met Johan

Voordat je **iets** wijzigt of nieuwe plannen maakt:

1. **Vraag Johan** of je op de laatste frontend-stand zit (`main`). Claude kan zelf **niet** pullen tenzij Johan de repo heeft gesynchroniseerd of een zip/commit-hash deelt.

2. **Verifieer frontend-commit** (minimaal één van onderstaande, of nieuwer):

   | Repo | Referentie-commit | Onderwerp |
   |------|-------------------|-----------|
   | **Frontend** (jouw repo) | `88c8ff7` | iDEAL via main `stripe` gateway |
   | Frontend | `8b1b54a` | Stripe payment_data + confirm flow |
   | Frontend | `a1b5689` | Email-first checkout + inline sign-in |
   | Frontend | `e0bde42` | Checkout prefill uit profiel |
   | Frontend | `2ea5e17` | Header cart badge via CartContext |

3. **Plugin-stand (alleen ter info — niet in jouw repo):** Johan deployt plugin apart. Onderstaande commits staan **live op production**; jij test ertegen via `https://cms.materialdistrict.com/wp-json`:

   | Plugin (Johan) | Commit | Onderwerp |
   |----------------|--------|-----------|
   | `materialdistrict-plugin` | `54ca83f` | Pad B legacy cleanup endpoint |
   | Plugin | `44680e6` | Dashboard profile → WC billing meta (Pad B) |
   | Plugin | `7cb68e1` | Checkout billing → profiel sync na order |
   | Plugin | `67eb535` | Email-first checkout account endpoints |

4. **Deploy:** Johan pusht frontend → `main` → Vercel. Plugin → `master` → WP Engine. Claude doet **geen** deploy.

5. **Geen mock-aannames:** test tegen productie-API (`WP_API_URL` → `https://cms.materialdistrict.com/wp-json`). Vercel preview gebruikt dezelfde backend.

---

## Architectuurkeuze: opslag adresgegevens (Pad B)

**Beslissing (Johan, vraag 20 in `vragen-johan-roadmap.md`): Ja op Pad B.**

### Wat Pad B betekent

User-adresgegevens worden opgeslagen in de **WooCommerce billing meta namespace** op het WordPress-user object:

| Dashboard / API veld | WordPress user meta |
|----------------------|---------------------|
| Straat (regel 1) | `billing_address_1` |
| Straat (regel 2) | `billing_address_2` |
| Postcode | `billing_postcode` |
| Plaats | `billing_city` |
| Land (ISO) | `billing_country` |
| Voornaam / achternaam | `billing_first_name` / `billing_last_name` |
| E-mail / telefoon | `billing_email` / `billing_phone` |
| Bedrijfsnaam (checkout) | `billing_company` |
| Factuur op bedrijf | `billing_is_company` (`true`/`false`) |
| Bedrijfsnaam (factuur) | `billing_company_name` |
| BTW-nummer | `billing_vat_number` |
| CoC-nummer | `billing_coc_number` (WP admin + REST user meta; **nog niet** in dashboard profile API) |

### Waarom Pad B

- **Eén bron van waarheid** voor checkout (Store API), orders en profiel — geen dubbele opslag in legacy keys (`address`, `address_street`, `postcode`, …).
- **WooCommerce-native**: billing op orders en customer records sluit aan op WC/Stripe flows.
- **Headless checkout** schrijft via Store API naar order billing; plugin synct dat terug naar user meta na order.

### Legacy keys (overgangsperiode)

Oudere MaterialDistrict-meta (`address`, `address_street`, `address_2`, `postcode`, `zipcode`, `city`, `country`, `telephone`, `company`) wordt **alleen nog gelezen als fallback** in `profile-options.php` (`md_profile_user_meta_first()`). Nieuwe writes gaan **niet** meer naar legacy keys (`md_profile_save_user_billing()`).

**Migratie op production is uitgevoerd** (zie § Datamigratie). Conflicts en garbage legacy meta zijn opgeschoond (804 users). Dual-read fallback kan later worden verwijderd als gewenst.

---

## Overzicht: wat is er gebouwd

### 1. Adresgegevens — plugin (Pad B) *(Johan; live op production)*

> Claude: deze endpoints en meta-keys **bestaan al op production**. Je roept ze aan vanuit de frontend; je wijzigt geen plugin-bestanden.

| Onderdeel | Bestand / endpoint |
|-----------|-------------------|
| Read/write Pad B + legacy fallback | `profile-options.php` |
| Dashboard GET/POST profiel | `rest-dashboard.php` → `/md/v2/dashboard/profile` |
| `address_2` in profiel API | commit `94cc0a8` |
| Eenmalige migratie legacy → `billing_*` | `md-address-pad-b-migrate.php` → `POST /md/v2/admin/migrate-address-pad-b` |
| Legacy cleanup (conflicts + garbage) | zelfde bestand → `POST /md/v2/admin/cleanup-address-pad-b-legacy` |
| Checkout → profiel sync na order | `includes/md-checkout-profile-sync.php` (hook `woocommerce_store_api_checkout_order_processed`) |

### 2. Adresgegevens — frontend

| Onderdeel | Bestand |
|-----------|---------|
| `address2` in profielformulier | `ProfileForm.tsx`, `types/dashboard.ts`, `mappers.ts` |
| Checkout prefill (ingelogd) | `src/lib/checkout/prefill.ts`, `profile-prefill.ts`, `checkout/page.tsx` |
| Prefill na inline login | `CheckoutSignInPanel.tsx` |
| Adresvelden checkout | `AddressFields.tsx` (`address_1` / `address_2`) |

### 3. Email-first checkout & account

Gast checkout begint met e-mail; systeem checkt of account bestaat; inline sign-in met cart merge.

| Laag | Detail |
|------|--------|
| Plugin *(Johan, live)* | `POST /md/v2/checkout/email-status` → `{ registered: bool }` |
| Plugin *(Johan, live)* | `POST /md/v2/checkout/merge-cart` (JWT + `Cart-Token` header) |
| Frontend *(jij)* | `src/app/api/checkout/email-status/`, merge-cart proxy |
| Frontend *(jij)* | `CheckoutSignInPanel.tsx`, `CheckoutForm.tsx` |
| Frontend *(jij)* | `src/lib/api/checkout-account.ts` |

Rate limiting via bestaande `md_auth_*` helpers op email-status.

### 4. Header — shopping basket counter

- `CartContext` (`src/components/providers/CartContext.tsx`) exposeert `itemCount` uit Store API cart (`items_count`).
- `HeaderShell.tsx` → `Header.tsx` toont badge als `cartCount > 0`.
- Provider hangt in root `layout.tsx`.

### 5. Checkout UX fixes (eerder in dezelfde sprint)

- Geen “cart is empty”-flits op `/checkout` en `/cart` (loading guard).
- Dubbele postcode opgelost (Stripe `hidePostalCode` + NL-normalisatie) — zie `docs/MANIFEST-checkout-postcode-fix.md`.
- Cart leegmaken na succesvolle order.
- Insider-prijs op boek-detail buy card.
- Betaalmethodes uit WC cart `payment_methods` (dynamisch i.p.v. hardcoded).

### 6. iDEAL betalingen (Store API + Stripe)

**Status: werkt op production** (getest door Johan).

#### Root causes die zijn opgelost

1. **`payment_data` incompleet** — WC block checkout stuurt o.a. `payment_method`, `wc-stripe-payment-method`, billing fields in `payment_data`. Zonder dit kon Stripe UPE-type niet bepalen.
2. **Verkeerde top-level gateway** — Store API vereist `payment_method: "stripe"` (top-level) + `payment_data.payment_method: "stripe_ideal"`. Alleen `stripe_ideal` top-level → lege `payment_result`.
3. **Post-checkout Stripe confirm** — WC retourneert hash redirects `#wc-stripe-confirm-pi:{order_id}:{client_secret}:{nonce}`. Client moet `stripe.confirmPayment()` aanroepen, niet `window.location = redirectUrl`.

#### Belangrijke frontend-bestanden

| Bestand | Rol |
|---------|-----|
| `src/lib/api/checkout.ts` | `buildStripePaymentData()`, `submitCheckout()` |
| `src/app/checkout/_components/CheckoutForm.tsx` | iDEAL flow, payment method selectie |
| `src/lib/stripe/confirm-redirect.ts` | Parse hash, `confirmPayment` / `confirmSetup` |
| `src/app/api/stripe/update-order-status/route.ts` | Proxy naar `/?wc-ajax=wc_stripe_update_order_status` |

#### Commits

- `8b1b54a` — payment_data + confirm flow
- `88c8ff7` — iDEAL via main `stripe` gateway

**Let op:** iDEAL Payment Element toont in test mode soms alleen “Volledige naam”; bankkeuze kan pas bij Stripe redirect na `confirmPayment` — normaal gedrag.

### 7. Overige plugin (zelfde periode) *(Johan; niet in jouw repo)*

- Insider 10% boekkorting in Store API cart.
- Verberg betaalde verzendopties als gratis optie beschikbaar.
- Admin endpoint users zonder e-mail verwijderen.

Als Store API-gedrag afwijkt van wat je verwacht: eerst live API testen; plugin-fix via Johan.

---

## Datamigratie — production status (15 juni 2026)

Uitgevoerd door Johan op production (admin REST, Application Password). **Geen actie voor Claude** — alleen context.

| Stap | Resultaat |
|------|-----------|
| Dry-run + batch scan (~128k kandidaten) | Slechts **2 users** hadden nog lege `billing_*` met bruikbare legacy data |
| Migratie applied | User 147294 (billing country/name/email); user 67260 had alleen garbage `company: \` |
| Legacy cleanup `conflicts_and_garbage` | **804 users** — WC-conflicts, dubbele address/address_street, garbage company-waarden |
| Verificatie | Geen open writes/deletes/conflicts in spot-check batches |

### Admin endpoints (alleen production ops)

```http
POST /wp-json/md/v2/admin/migrate-address-pad-b
POST /wp-json/md/v2/admin/cleanup-address-pad-b-legacy
```

Body-voorbeelden: `{ "dry_run": true, "limit": 500, "offset": 0 }` of `{ "user_id": 12345 }`.  
Cleanup scope: `conflicts_and_garbage` (default) of `all_safe` (optioneel: alle legacy waar WC al gevuld is — **niet** gedraaid).

---

## Store API / proxy (referentie)

Headless cart & checkout lopen via Next.js proxy:

```
/api/store-cart/*  →  {WP_API_URL}/wc/store/v1/*
```

JWT in `Authorization` voor ingelogde pricing (Insider-korting). Cart token in `Cart-Token` header.

Order confirmation URLs worden door de plugin herschreven naar Next.js (Johan: `headless-frontend-urls.php` op production).

---

## Nog open / niet in deze sprint

| Onderwerp | Status |
|-----------|--------|
| **CoC in dashboard** | `billing_coc_number` bestaat in WP; nog niet in `/md/v2/dashboard/profile` of `ProfileForm.tsx` — **frontend** kan `ProfileForm` + mappers; **plugin**-API-veld via Johan |
| **Company/BTW in checkout UI** | Profiel heeft `invoiceToCompany` / `vatNumber`; checkout prefill stuurt `company` mee maar geen BTW-UI — **frontend** |
| **VIES/BTW-validatie** | Geparkeerd (Batch E) — **plugin**, via Johan |
| **Legacy dual-read uitzetten** | **Plugin** (`profile-options.php`), via Johan |
| **Optionele bulk legacy cleanup** | Production ops, via Johan |

---

## Gerelateerde docs (frontend repo)

| Onderwerp | Bestand |
|-----------|---------|
| Checkout merge / Stripe | `docs/MANIFEST-checkout-merge.md` |
| Checkout bugs (empty flash) | `docs/MANIFEST-checkout-bugs.md` |
| Postcode fix | `docs/MANIFEST-checkout-postcode-fix.md` |
| Profile address_2 | `docs/MANIFEST-profile-address2.md` |
| Dashboard datacontract | `docs/dashboard-datacontract.md` |
| WC migratieplan | `docs/woocommerce-migration-plan.md` |
| Algemene Claude handoff | `docs/handoff-claude.md` |
| Pad B beslissing | `vragen-johan-roadmap.md` vraag 20 |

---

## Test-checklist (smoke)

- [ ] Ingelogd: `/dashboard/profile` adres opslaan → refresh → velden persistent
- [ ] Ingelogd: `/checkout` → billing vooringevuld
- [ ] Gast: e-mail invoeren → registered true/false → sign-in panel
- [ ] Sign-in op checkout → cart merge + billing prefill
- [ ] Order plaatsen → profiel adres bijgewerkt (WC sync)
- [ ] Header badge telt items na add-to-cart
- [ ] iDEAL testbetaling (Stripe test) → order confirmation
- [ ] Kaartbetaling regressie (zelfde confirm flow)

Testproduct op production: boek ID **137530**.

---

## Repo’s

| Repo | Wie | Branch | Deploy |
|------|-----|--------|--------|
| **`materialdistrict-frontend`** | Claude (lezen/schrijven lokaal) | `main` | Johan pusht → Vercel |
| `materialdistrict-plugin` | Alleen Johan | `master` | Auto → WP Engine |
| `materialdistrict-theme` | Alleen Johan | — | Weinig relevant deze sprint |

Claude werkt uitsluitend in **`materialdistrict-frontend`**. Plugin- en theme-paden zijn referentie voor Johan/Cursor, niet voor jouw workspace.

---

*Einde handoff. Frontend-wijzigingen: MANIFEST-bestanden + code in deze repo. Plugin/API-vragen: aan Johan, met verwijzing naar de commits/tabel hierboven.*
