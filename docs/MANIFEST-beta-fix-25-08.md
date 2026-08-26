# MANIFEST — betafix 25-08 (verwerkt 26-08)

Bron: Claude `md-beta-fix-25-08-v1.zip`.

## Wat live ging

| Bestand | Actie |
|---------|--------|
| `src/components/ui/Pagination.tsx` | Overgenomen — dubbele paginanummers opgelost |
| `src/lib/api/facetwp.ts` | Tag op facet-query POST, **aangepast** aan scoped tags (`wp:material:list` + `:all`, niet Claude's `wp:materials`) |
| `src/lib/api/cache-tags.ts` | **Niet** overschreven. Alleen: bij material-opslag ook `wp:material-channels:list` |

## Bewust niet overgenomen

Claude's zip is geschreven vóór de scoped-cache-herziening (26-08 / PR #8). Blind overschrijven zou terugzetten naar één tag per contenttype (inclusief `wp:media` bij elke opslag) — precies de regressie die CMS-load 20 veroorzaakte.

| Bestand | Reden |
|---------|--------|
| `src/lib/api/cache-tags.ts` (volledig) | Grofmazige `POST_TYPE_TAGS` + `resourceCacheTag` i.p.v. record/list/all |
| `plugin/rest-revalidate.php` | Mist queue/coalesce/`postId`; `_material_brand` staat al in de scoped plugin |

Boeken: al gedekt in de scoped laag (`products` → `product`, ping `book`/`product` → beide list-tags).
