# MANIFEST — Board-detailpagina — 04-06-2026

Overlay over de actuele moederrepo. Gebouwd op de zojuist aangeleverde bronversies.
Geen CSS-wijzigingen (hergebruikt `bm-card`/`board-*`/`btn`-klassen) → geen botsing
met de globals.css uit de parallelle channels-sessie.

## Nieuw
- src/app/dashboard/boards/[id]/page.tsx              (server-pagina, notFound bij 404/403)
- src/components/dashboard/panels/BoardDetailPanel.tsx (items-grid, hergebruikt bm-card)

## Gewijzigd
- src/types/dashboard.ts                  (+ BoardItem, BoardDetail; rest ongemoeid)
- src/lib/dashboard/mappers.ts            (+ mapBoardItem, mapBoardDetail)
- src/lib/dashboard/data.ts               (+ getBoard(id))
- src/components/dashboard/panels/BoardsPanel.tsx (board-kaarten klikbaar → detail)

## Afhankelijkheid (Johan)
GET /md/v2/dashboard/boards/{id} → Board + items[] (BookmarkItem-shape, zonder
record-id), orphan/unpublished server-side gefilterd. Contract = de mail van
zojuist. Tot deploy levert een klik op een board een notFound()-pagina (404/403
→ null). Frontend werkt zodra het endpoint live is.

## Buiten v1 (zoals afgesproken)
- Item verwijderen uit een board (wacht op DELETE-endpoint; nu niet nodig).
- Save-knop op book-/brand-detail (los puntje).
