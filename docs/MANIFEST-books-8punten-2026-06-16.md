# MANIFEST — Books 8-puntencorrectie (16-06-2026)

Gerebased op de nieuwste main. Additief: globals.css alleen §-blok-toevoegingen +
drie in-place kleurwissels (geen volledige overschrijving). Toepassen bovenop de
huidige moedermap.

## Gewijzigde bestanden
- src/app/book/page.tsx — overzicht: alle boeken ophalen, channels + facetten (Format/Publisher/On sale) met tellingen afleiden, filteren/zoeken/pagineren in JS (punt 2 + 7).
- src/app/book/_components/BookCard.tsx — landscape thumb + bookmark + Add-to-cart; ex-btw prijs (punt 2/3/8; gedeeld met de featured-tegel op de homepage).
- src/app/book/_components/BooksFilterSidebar.tsx — props-gedreven + URL-schrijvend (punt 2).
- src/app/book/[slug]/page.tsx — detail herbouwd naar Designerbooks-structuur op de bestaande book-detail-klassen; filmstrip eruit (punt 5).
- src/app/book/[slug]/_components/BookBuyCard.tsx — ex groot + incl klein (punt 1).
- src/app/cart/_components/CartView.tsx — regelprijzen ex + BTW als aparte regel (punt 1).
- src/app/checkout/_components/CheckoutForm.tsx — idem in de checkout-samenvatting (punt 1).
- src/app/checkout/_components/AddressFields.tsx — herbouwd op huis-Input/Select (groen vinkje); Company + VAT naast elkaar (punt 4).
- src/lib/api/books.ts — WCStoreProduct + mappers: channels/tags/format/onSale (punt 7).
- src/types/book.ts — BookTerm + channels/tags/format/onSale op BookListItem/Book (punt 7).
- src/styles/globals.css — §BOOKS-FAMILY: .book-thumb, .book-tile-add, .book-buy-price-vat/-incl; .checkout-field-wide; punt-6-kleurwissels (cart-Checkout groen, footer-links leesbaar, Subscribe zwart).
- session-log.md — bijgewerkt.

## Ongebruikt geworden (mag weg, niet vereist)
- src/app/book/[slug]/_components/BookGallery.tsx — wordt niet meer geïmporteerd (filmstrip vervangen door gestapelde spreads).

## Backend-afhankelijkheden (Johan)
- Design-discipline-CATEGORIEËN als WC-taxonomie + aan boeken hangen → de Category-filtersectie vult zich vanzelf.
- Extra labels (New releases / Last items / Popular) vereisen publicatiedatum / voorraadaantal / verkoopdata in de Store-API-respons.
- Prijs-range-facet vereist een range-UI (losse follow-up).
