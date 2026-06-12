# MANIFEST — Profiel: tweede adresregel (address_2)

**Datum:** 11-06-2026 · **Type:** frontend (TS/TSX-only) · **Basis:** live `main`.

Sluit aan op Johan's live user-meta `address_2` (plugin master 94cc0a8,
`GET/POST /md/v2/dashboard/profile`). Brengt het user-profiel op gelijke voet met
het brand-profiel (dat een tweede adresregel al had) en met de WooCommerce-checkout
(`address_1` / `address_2`).

## Wijzigingen (additief, alleen address_2)
- `src/types/dashboard.ts` — `UserProfile.address2?: string` (optioneel).
- `src/lib/dashboard/mappers.ts` —
  - `RawUserProfile.address_2?`
  - `mapUserProfile`: `address2: raw.address_2 ?? ''` (WP → UI)
  - `toWpUserProfile`: `address_2: p.address2` (UI → WP)
- `src/components/dashboard/panels/ProfileForm.tsx` — "Address line 2"-veld
  (optioneel) onder "Street address", net als het brand-formulier.

## Keuze: optioneel
`address2` is optioneel gemaakt zodat de bestaande `MOCK_PROFILE`-literal (mock.ts)
niet hoeft te wijzigen — geen extra bestand, geen regressierisico op de mock.
De mapper seedt het veld altijd op `''`, dus in de echte flow is het altijd een string;
het formulier gebruikt een `?? ''`-guard voor de controlled input.

## Mapping naar checkout
`address` = regel 1 (`address_1`), `address2` = regel 2 (`address_2`). Wordt straks
gebruikt voor de checkout-prefill (account → checkout) in blok 4 van het bookshop-plan.

## Validatie
- diff vs live: uitsluitend address_2-regels; geen export verwijderd/hernoemd.
- esbuild OK op alle drie.
- geïsoleerde `tsc --strict` op de address2-round-trip (WP↔UI) + de optionele guard: schoon.
- Definitieve gate = `next build` op Vercel.
