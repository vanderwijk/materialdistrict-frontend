# MANIFEST — Company-veld in checkout

**Datum:** 16 juni 2026
**Stand:** op `88c8ff7` (frontend `main`)
**Scope:** frontend-only — geen plugin/API-wijziging nodig

## Wat

Optioneel **"Company (optional)"**-veld toegevoegd aan de checkout-adresvelden.
Het veld is gewired op het bestaande `StoreAddress.company`, dat al end-to-end
meeloopt via `setCustomer` (`/cart/update-customer`) en `submitCheckout`
(`/checkout`). De live Store API accepteert `billing_address.company` native
(geverifieerd tegen production: `company` zit in de cart-`billing_address`-shape).

Voor ingelogde bezoekers wordt company al uit het profiel geprefilled
(`profile-prefill.ts` -> `company: profile.company`); die landt nu in een zichtbaar
veld.

## Gewijzigd

| Bestand | Wijziging |
|---------|-----------|
| `src/app/checkout/_components/AddressFields.tsx` | Optioneel company-input toegevoegd, na de naam-velden en voor adres (standaard WC-volgorde). Hergebruikt bestaande `addr-field addr-field-wide`-styling — geen CSS-toevoeging. |

Geen type-wijziging: `company?: string` stond al in `StoreAddress` (`src/lib/api/cart.ts`).

## Productkeuze

Company staat in de gedeelde `AddressFields`, dus verschijnt op zowel het
billing- als (bij afwijkend verzendadres) het shipping-blok. Beide zijn standaard
WC-velden en het veld is optioneel; geen aparte gating nodig. Te beperken tot
billing-only als gewenst — laat het weten.

## Test (smoke, tegen production)

- [ ] Gast: checkout -> company invulbaar, optioneel (geen validatie-blokkade)
- [ ] Ingelogd met bedrijf in profiel: checkout -> company vooringevuld
- [ ] Order plaatsen met company -> company op order-billing (en via sync terug naar profiel)
- [ ] Kaart + iDEAL regressie ongewijzigd

## Niet inbegrepen — BTW (`vat_number`)

BTW-veld in checkout is **bewust niet** gebouwd: de live Store API heeft geen
`additional_fields` en registreert `vat_number` nergens (geverifieerd: enige
extensie is `woocommerce_table_rate_shipping`). Een BTW-veld zou z'n waarde nergens
kwijt kunnen. Dit vereist plugin-werk van Johan (registreren van `vat_number` als
Store-API checkout-veld). Zie aparte e-mail.
