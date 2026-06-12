<!-- Append aan session-log.md (repo-root). -->

## Checkout postcode-fix — "Postcode is onvolledig" (11-06-2026)

Frontend bugfix op Johan's diagnose. Op /checkout stonden twee postcodevelden
(adresformulier + ingebouwd Stripe-CardElement-veld); een leeg Stripe-veld gaf
de losse melding "Postcode is onvolledig".

**Gewijzigd (alleen `checkout/_components/CheckoutForm.tsx`):**
- `hidePostalCode: true` in `CARD_OPTIONS` (Stripe-postcodeveld weg).
- `billing_details.address` uit het factuuradres mee bij `createPaymentMethod`.
- NL-postcode-normalisatie ("1234 AB") vóór calculate-shipping / billing_details /
  submitCheckout — dekt ook het strikte WC-pad af.

`AddressFields.tsx` + `cart.ts` ongewijzigd. Validatie: esbuild + gerichte
`tsc --strict` tegen echte cart.ts schoon. Geen plugin-wijziging.
`buildStripePaymentData` (payment_data-capture) blijft de aparte open handoff.
