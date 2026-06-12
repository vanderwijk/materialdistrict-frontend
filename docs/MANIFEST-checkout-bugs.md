# MANIFEST — Checkout-hygiëne (blok 1): mandje legen + leeg-flits

**Datum:** 11-06-2026
**Type:** frontend bugfix (TSX-only; geen globals, geen WP/plugin)
**Basis:** live `main` — `CartContext.tsx` opgevraagd en gediff't.

Twee bugs uit de bookshop-test (zie `bookshop-account-plan.md`, blok 2):

## Bug 1 — mandje wordt niet geleegd na bestelling
Na een geplaatste order is de server-side mand de order geworden, maar de client
hield z'n cart-token + state vast → je zag je oude mandje terug.
- `CartContext.tsx`: nieuwe `clearCart()` — roept `clearCartSession()` (token/nonce wissen)
  en zet de cart-state op leeg. Een volgende add-to-cart bootstrapt vanzelf een verse sessie.
- `CheckoutForm.tsx`: `clearCart()` in de succes-paden (redirect/3DS én success/pending),
  NIET bij een directe betaalfout (dan blijft de mand voor een retry).

## Bug 2 — "mandje is leeg"-flits op /checkout
De leeg-melding verscheen zolang de mand nog laadde (zelfde flits via boek-detail
"Go to checkout" én direct binnenkomen).
- `CartContext.tsx`: nieuwe `initialized`-vlag — gaat op true zodra de bootstrap-beslissing
  rond is (token-fetch klaar óf "geen token"), zodat laad-staat ≠ leeg-staat.
- `CheckoutForm.tsx`: render-volgorde nu `placed` → "redirecting…", dan `!initialized` →
  "Loading your cart…", dan pas de echte leeg-staat. Geen nieuwe CSS (hergebruikt `checkout-empty`).

Een `placed`-vlag in CheckoutForm voorkomt bovendien een leeg-flits ná een geplaatste
order, terwijl de navigatie naar /order-confirmation loopt.

## Bestanden
- `src/components/providers/CartContext.tsx` — `initialized` + `clearCart` (additief).
- `src/app/checkout/_components/CheckoutForm.tsx` — hooks ingehaakt + render-guards.

> NB: CheckoutForm bevat als basis de al-gedeployde postcode-fix; t.o.v. `main` is de
> netto-wijziging in dit batchje uitsluitend de twee cart-bugs. Johan past het als
> compleet bestand toe (geen patch).

## Validatie
- CartContext diff vs live: alleen de cart-changes; geen export verwijderd/hernoemd.
- esbuild OK op beide files.
- volledige `tsc --strict` (React-types + stubs voor checkout/stripe/cart): schoon, exit 0 —
  o.a. dat het context-value het `CartContextValue`-contract dekt.
- Definitieve gate = `next build` op Vercel.

## Verificatie na deploy
1. Boek in mand → bestelling plaatsen (testkaart) → na afronding mand leeg (badge op 0).
2. /checkout direct of via boek-detail "Go to checkout" → geen "leeg"-flits meer;
   kort "Loading your cart…" en dan de checkout.
