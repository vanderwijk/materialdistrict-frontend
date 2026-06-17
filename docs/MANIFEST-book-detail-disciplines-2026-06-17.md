# Levering — detail-categorie-pills op disciplines (17-06-2026)

Gerebased op de door Jeroen aangeleverde actuele main. Eén-bestand-delta.

| Bestand | Wijziging |
|---|---|
| `src/app/book/[slug]/page.tsx` | Categorie-pills boven de titel gebruiken nu `book.disciplines` (deep-link `/book?category=<slug>`); terugval op `book.tags` (`/book?tag=`) voor boeken zonder discipline. Alleen het `categoryPills`-blok. |
| `session-log.md` | Logregel. |

## Verificatie
- Gediffd tegen de aangeleverde main: **alleen** het categoryPills-blok wijzigt, verder niets.
- esbuild-transpile OK.
- Geen backend-afhankelijkheid; `disciplines` worden al geleverd.
