# MANIFEST — md-copy-search-faq-31-07

Levering 31-07-2026. Alle bestanden zijn **complete vervangingen**, geen patches.
Paden zijn moedermap-paden; plaats ze één op één.

| Bestand | Nieuw / gewijzigd |
|---|---|
| `src/app/membership/page.tsx` | gewijzigd — copy + tabelbug |
| `src/app/become-a-partner/page.tsx` | gewijzigd — Basic, sales-led CTA's |
| `src/app/search/page.tsx` | gewijzigd — vormgeving |
| `src/app/faq/page.tsx` | **nieuw** — eigen route |
| `src/lib/config/membership.ts` | gewijzigd — sample requests + follow-vlaggen |
| `src/lib/config/static-pages.ts` | gewijzigd — allowlist |
| `src/components/layout/Footer.tsx` | gewijzigd — © 1998 |
| `src/styles/globals.css` | gewijzigd — append-only, twee nieuwe §-blokken |
| `scripts/wp-import-pages.php` | **nieuw** — WP-CLI-paginaimport |
| `membership-config.md` | gewijzigd — normdocument |
| `session-log.md` | gewijzigd — sessie toegevoegd |

## Volgorde

1. Frontend-bestanden plaatsen en deployen.
2. Daarna pas het importscript draaien — `/our-mission` en `/innovation-fund`
   geven een 404 zolang de allowlist niet live is, en `/faq` valt zonder de
   nieuwe route terug op de oude prozaweergave.

## Importscript

```
wp eval-file scripts/wp-import-pages.php            # droogloop, wijzigt niets
wp eval-file scripts/wp-import-pages.php --apply    # schrijft
```

Matcht op slug: bestaat de pagina, dan bijwerken; anders aanmaken. Herhaalbaar.

## Controles

- esbuild op alle gewijzigde TS/TSX — geen fouten.
- `globals.css` accoladebalans 3246/3246; alleen toegevoegd aan het eind.
- FAQ-HTML door dezelfde parser als de frontend: 4 secties, 22 vragen.
- Geen PHP in deze omgeving, dus het importscript is structureel gecontroleerd
  (heredocs, accolades, haakjes) en niet uitgevoerd. **Draai de droogloop eerst.**

## Let op

De slugs in het importscript moeten gelijk blijven aan `static-pages.ts` en aan de
FAQ-route. Wijzigt er één, wijzig de andere mee — anders volgt een 404.
