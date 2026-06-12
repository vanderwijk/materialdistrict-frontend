# MANIFEST — Checkout postcode-fix ("Postcode is onvolledig")

**Datum:** 11-06-2026
**Type:** frontend bugfix (TSX-only; geen globals, geen WP/plugin)
**Basis:** live `main` — `CheckoutForm.tsx` opgevraagd en gediff't; alleen de fix toegevoegd.

Lost Johan's diagnose op: op /checkout stonden in de praktijk **twee** postcodevelden —
één in het adresformulier en één ingebouwd in het Stripe `CardElement` (`hidePostalCode`
stond niet in `CARD_OPTIONS`). Bleef dat tweede veld leeg, dan gaf `createPaymentMethod`
de gelokaliseerde melding "Postcode is onvolledig", los van het adres.

## Wijziging (alleen `src/app/checkout/_components/CheckoutForm.tsx`)
1. **`hidePostalCode: true`** in `CARD_OPTIONS` → het losse Stripe-postcodeveld verdwijnt;
   er is nog maar één postcode (uit het adresformulier).
2. **`billing_details.address`** meegestuurd bij `createPaymentMethod` (line1/line2/city/
   state/postal_code/country uit het factuuradres) → Stripe valideert de postcode tegen het
   ingevulde adres i.p.v. een los veld.
3. **NL-postcode-normalisatie** (`normalizePostcode` + `withNormalizedPostcode`): NL wordt
   gecanonicaliseerd naar "1234 AB" (4 cijfers + spatie + 2 hoofdletters) vóór elke
   Stripe-/WooCommerce-call (calculate-shipping, billing_details, submitCheckout). Dekt
   meteen Johan's secundaire WC-pad af (WC valideert NL-postcodes strikt). Andere landen:
   alleen trimmen.

`AddressFields.tsx` en `cart.ts` ongewijzigd — veldnamen waren al toereikend
(`address_1/address_2/city/state/postcode/country`).

## Validatie
- diff vs live: uitsluitend bovenstaande wijzigingen.
- esbuild OK.
- gerichte `tsc --strict` op de `StoreAddress`-mapping + helpers tegen de échte `cart.ts`:
  schoon (exit 0). Stripe-adresvelden zijn snake_case conform de Stripe-API.
- Definitieve gate = `next build` op Vercel.

## Verificatie na deploy (Johan's stappen)
1. Mand met testboek, NL-adres (bv. 1016 DW Amsterdam).
2. Calculate shipping → tarief selecteren.
3. Stripe-testkaart 4242… → Place order.
4. Geen "Postcode is onvolledig" meer; order of een duidelijke vervolgstap
   (payment_data / 3DS) in de Network-tab.

## Buiten scope (zoals Johan aangaf)
- Geen plugin-wijziging voor Stripe-postcode.
- `buildStripePaymentData` (payment_data-capture) blijft de aparte open handoff — los van deze fix.
