# MANIFEST — Books storefront (Store API): catalogus + winkelmand

**Wat:** de books-vertical is omgebouwd naar een **headless storefront** op de
WooCommerce **Store API**. De catalogus draait nu op echte productie-data; de
**winkelmand** (Add-to-cart + `/cart`) is toegevoegd. Checkout/payments is de
volgende fase (zie onderaan).

**Spec:** `docs/nextjs-store-api-handoff.md` (jouw handoff). Het oude
`books-datacontract.md` (v0.3, `/wp/v2/product` + register_rest_field) is
**vervallen** — de Store API levert alles native, dus daar is geen WP-werk meer
voor nodig.

---

## Wijzigingen t.o.v. de vorige levering

**Gewijzigd**
- `src/lib/api/books.ts` — leest nu de Store API (`/wc/store/v1/products`),
  env-driven via `WP_API_URL` (server-side). Categorie-id dynamisch geresolved.
  Prijs uit minor-units, cover uit `images`, `isbn`←`sku`, `publisher`←attribuut.
- `src/types/book.ts` — `cover` is nu `BookCover` (Store-API-URL's).
- `src/app/books/page.tsx`, `src/app/books/[slug]/page.tsx` — cover-reads.
- `src/app/books/[slug]/_components/BookBuyCard.tsx` — **Add-to-cart** i.p.v.
  externe link.
- `src/app/books/[slug]/_components/BookDetailSidebar.tsx` — geeft `productId`.
- `src/app/layout.tsx` — `CartProvider` in de provider-tree.
- `src/components/providers/index.ts` — exporteert `CartProvider` / `useCart`.
- `src/styles/globals-additions-books.css` — `§BOOKS`-blok uitgebreid (toolbar,
  detail, add-to-cart, winkelmand).

**Nieuw**
- `src/lib/api/cart.ts` — Store-API-cart-client (Cart-Token + Nonce).
- `src/components/providers/CartContext.tsx` — `CartProvider` / `useCart`.
- `src/app/cart/page.tsx` + `src/app/cart/_components/CartView.tsx` — `/cart`.

**Verwijderd**
- `src/lib/api/books-mock.ts` — de Store API is live; geen mock meer.

---

## Integratie-stappen (Johan)

1. **src-bestanden** plaatsen. Let op: de `[slug]`-map, `_components`,
   `src/components/providers/`, en de nieuwe `src/app/cart/`.
   `layout.tsx` en `providers/index.ts` zijn **complete bestanden** (additieve
   wijziging: alleen `CartProvider` toegevoegd).
2. **`§BOOKS`-blok** uit `src/styles/globals-additions-books.css` onderaan
   `src/styles/globals.css` plakken (additief).
3. **ENV — nodig voor de winkelmand:** zet
   `NEXT_PUBLIC_WP_URL=https://materialdistrict.com` op de Vercel-deploy. De cart
   draait client-side vanuit de browser; zonder die env bereikt hij de Store API
   niet. (De catalogus gebruikt de server-side `WP_API_URL` en werkt nu al.)
   CORS staat goed (localhost + `*.vercel.app` toegestaan).
4. **Geen WP-werk** voor catalogus/cart — de Store API levert alles native.

---

## Verificatie

- Alle bestanden transpileren schoon (esbuild, tsx).
- De mappers draaiden over **echte** Store-API-productdata (prijs uit
  minor-units, isbn←sku, publisher←attribuut, covers).
- De **cart-flow** is tegen productie bevestigd: `GET cart` → Cart-Token +
  Nonce; `POST add-item` → HTTP 201; totalen incl. btw (boeken 9%) en
  verzendtarief komen uit de response.
- Runtime in de browser kan pas getest worden zodra `NEXT_PUBLIC_WP_URL` gezet
  is (stap 3).

---

## ⚠️ Beslissing voor Johan — Insider-korting moet server-side

De 10%-Insider-korting op boeken is nu een **frontend-weergave** (`getBookPrice`).
Dat werkte toen "kopen" naar buiten linkte, maar met een echte Store-API-mand
rekent WooCommerce de **reguliere** prijs af. Gevolg: een member ziet op de
productpagina de Insider-prijs, maar de winkelmand toont de volle prijs.

→ De member-korting moet een **echte WC-korting** worden (rol-gebaseerde
dynamic pricing of een auto-coupon voor members), zodat de mand/checkout
daadwerkelijk de Insider-prijs rekent. Dan toont de frontend gewoon de
WC-totalen en valt de inconsistentie weg. Dit is een backend-beslissing.

---

## Volgende fase — checkout/payments (van Johan)

Nodig om te starten (jouw handoff §4 + open punten):
- `NEXT_PUBLIC_STRIPE_PK` (test) en de PayPal-sandbox-buyer-login.
- WP-admin-toegang om op de native block-checkout de echte
  `POST /checkout`-request te "vangen" (de `payment_data`-sleutels staan niet
  vast gedocumenteerd — blind bouwen breekt).
- Keuze thank-you/return-URL voor redirect-gateways (apex i.p.v. cms).
- PayPal: eerst PPCP via de capture-techniek; lukt dat niet headless, dan de
  Payment Plugins-gateway (backend-switch).

## Geparkeerd / later

- Header cart-badge (de Header-component zit buiten deze set; haak ik later in).
- Homepage books-blok + sidebar-widget.
