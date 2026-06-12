# MANIFEST — Cart-pagina: leeg-flits weg (initialized-guard)

**Datum:** 11-06-2026 · **Type:** frontend (1 bestand) · **Basis:** live `main`.

## Probleem
Vanaf boek-detail naar de mand zie je heel even "Your cart is empty" voordat
de mand laadt. `CartView` checkte alleen `if (!cart || cart.items.length === 0)`,
zonder de bootstrap-staat mee te wegen — dus tijdens het ophalen (cart nog `null`)
toonde 'ie meteen de leeg-staat.

Dit is dezelfde klasse bug als eerder in de checkout (blok 1). De checkout-`page.tsx`
en `CheckoutView` hebben géén eigen leeg-check; de tweede bron zat dus hier, op `/cart`.

## Fix (additief, 1 bestand)
`src/app/cart/_components/CartView.tsx`
- `initialized` uit `useCart()` gehaald.
- Guard vóór de leeg-check: zolang `!initialized` → `<EmptyState title="Loading your cart…" />`.
  De "Your cart is empty"-staat verschijnt nu pas ná de bootstrap, bij een echt lege mand.

Spiegelt de checkout-guard (placed → !initialized → empty). Geen nieuwe CSS:
hergebruikt het bestaande `EmptyState` (alleen `title` is verplicht).

## Validatie
- diff vs live: alleen de `initialized`-destructure + de guard.
- esbuild OK; `initialized: boolean` bestaat op de CartContext-waarde.
- Eindcontrole = `next build` op Vercel.

## Nog open in deze hoek (apart)
- **Cart-badge (punt 4):** `Header.tsx` heeft de badge-logica al (`cartCount`-prop);
  `HeaderShell` geeft 'm alleen niet door. Wacht op de live `layout.tsx` om te bevestigen
  dat `CartProvider` boven `HeaderShell` zit, dan volgt de HeaderShell-koppeling.
- **Insider-korting in cart (punt 2):** functioneel server-side (WC) bij Johan;
  daarna pas de prominente visuele weergave (doorgestreepte prijs + Insider-prijs + label).
