<!-- Append aan session-log.md (repo-root). -->

## Prominente insider-prijs op book-buy-card (11-06-2026)

Insider-korting was visueel te zwak; logica klopte al (getBookPrice, 10%).
- `app/books/[slug]/_components/BookBuyCard.tsx`: teal "Insider price"-pill +
  concreet "save €X" voor members; spaarbedrag in de niet-member upsell.
- `docs/globals-append-books-insider.css`: §BOOKS-INSIDER append-blok (grotere
  prijs, duidelijke doorhaling, teal pill, bold-wit spaarbedrag). Johan plakt
  het blok achteraan globals.css.
esbuild OK. Staat los van de backend-cart-korting (aparte Johan-mail).
