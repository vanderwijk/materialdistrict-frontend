# MANIFEST — Bookmarks werkend + Saved-search-create (rev. 04-06-2026, herbasis)

Overlay over de actuele "moedermap". Geen CSS-wijzigingen.
Alle bewerkte bestanden zijn opnieuw afgeleid van Jeroens ACTUELE uploads
(na de featured/offline-, ChannelBar- en a11y-patches), niet van de oude snapshot.

## Nieuw
- src/lib/hooks/useBookmarks.tsx
- src/app/api/dashboard/bookmarks/route.ts
- src/app/events/[slug]/_components/EventDetailActions.tsx

## Gewijzigd — herbouwd op actuele uploads
- src/types/dashboard.ts                                   (+ BookmarkItem.itemId; featured-velden ongemoeid)
- src/lib/dashboard/mappers.ts                             (+ item_id, toWpBookmark; featured-mapping ongemoeid)
- src/app/materials/_components/MaterialsFilterSidebar.tsx (Save this search werkend, channel-bewust; a11y-refactor ongemoeid)
- src/app/materials/_components/MaterialsGrid.tsx
- src/app/materials/[slug]/_components/MaterialDetailActions.tsx
- src/app/articles/[slug]/_components/ArticleDetailActions.tsx
- src/app/talks/[slug]/_components/TalkDetailActions.tsx
- src/app/events/[slug]/page.tsx
- src/app/brands/[slug]/_components/BrandMaterialsGrid.tsx

- src/app/layout.tsx (ROOT) — <BookmarksProvider> rond de shell. Herbouwd op de
  actuele bron (geverifieerd identiek aan de aangeleverde root-layout).

## Docs (los)
- docs/email-johan-bookmarks-boards.txt
- docs/session-log-patch-bookmarks.md
- docs/open-issues-patch-bookmarks.md

## Afhankelijkheden Johan
- POST /md/v2/dashboard/bookmarks + item_id in bookmark-response   [BM-1]
- Bevestig POST /md/v2/dashboard/saved-searches live               [BM-2]
- (volgende stap) POST /md/v2/dashboard/boards/{id}/items          [BD-1]
