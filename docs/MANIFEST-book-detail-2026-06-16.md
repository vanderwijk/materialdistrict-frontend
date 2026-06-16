# MANIFEST — Books detailpagina + reviewfixes (16-06-2026)

Bron: `materialdistrict-book-detail-16-06-2026.zip` (Claude). Gemerged met bestaande frontend (`main`).

## Gewijzigde bestanden

| Bestand | Wijziging |
|---|---|
| `src/app/book/[slug]/page.tsx` | Materials-shell detail (wit vel + donker koop-zijkaartje), pills, prev/next, More books (4 tegels) |
| `src/app/book/[slug]/_components/BookDetailActions.tsx` | **Nieuw** — Save + Share in detail-header |
| `src/app/book/page.tsx` | Deep-link filters `?tag=` / `?author=` / `?year=` (behoud category/discipline-filters) |
| `src/app/book/_components/BookCard.tsx` | `variant="home"` voor featured-tegel |
| `src/app/(home)/page.tsx` | Featured boek met `variant="home"` |
| `src/lib/api/books.ts` | `decodeHtmlEntities` op titels/termen; `mapPriceExVat()` via `extensions.materialdistrict` **+** behoud disciplines/ISBN/catalog-mapping |
| `src/styles/globals.css` | Append §BOOKS-DETAIL-SHEET; hover-fix uitverkocht-knop |

## Merge-notities (Johan)

- `books.ts` uit de zip zou disciplines/`global_unique_id`/catalog terugdraaien — **niet** overgenomen; alleen decode + `mapPriceExVat` gemerged.
- `BookGallery.tsx` was al verwijderd.
- Categorie-pills op detail gebruiken nog **tags** tot design-discipline terms aan producten hangen (plugin seed staat klaar).

## Backend open (Johan)

- Design-discipline `product_cat`-terms aan boeken koppelen → echte Category-pills + filter op `/book`.

## Verificatie

- `npm run typecheck` — OK
