<!-- Append aan session-log.md (repo-root). -->

## Checkout-hygiëne — mandje legen + leeg-flits (11-06-2026)

Blok 1 van het bookshop-plan. Twee frontend-bugs.
- **CartContext.tsx**: `clearCart()` (token + state legen na order) + `initialized`-vlag
  (bootstrap-klaar, ook zonder token) zodat laad-staat ≠ leeg-staat.
- **CheckoutForm.tsx**: `clearCart()` in de succes-paden (niet bij directe fout);
  render-guards `placed` → "redirecting…", `!initialized` → "Loading…", dan pas leeg.

CheckoutForm-basis bevat de al-gedeployde postcode-fix; netto t.o.v. main = alleen de
cart-bugs. Validatie: esbuild + volledige tsc --strict (React-types) schoon. Geen globals/CSS.
