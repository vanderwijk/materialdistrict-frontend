# Session-log patch — Board-detailpagina

> Append aan `session-log.md`. Datum: 04-06-2026.

## Wat
Board-kaarten op /dashboard/boards waren niet klikbaar; er was geen pagina om de
opgeslagen items te bekijken. Toegevoegd:

**Nieuw:**
- `src/app/dashboard/boards/[id]/page.tsx` — server-pagina; `getBoard(id)` →
  `notFound()` bij onbekend/niet-eigen board (of zolang het endpoint nog niet
  live is). Header = board-naam.
- `src/components/dashboard/panels/BoardDetailPanel.tsx` — items-grid die exact
  de bookmark-card-opmaak hergebruikt (`bm-grid`/`bm-card`) + lege staat. Back-
  link via `btn btn-outline btn-sm`. **Geen nieuwe CSS.**

**Gewijzigd:**
- `src/types/dashboard.ts` — `BoardItem` (BookmarkItem-shape zonder record-id) +
  `BoardDetail` (Board + items[]).
- `src/lib/dashboard/mappers.ts` — `mapBoardItem` + `mapBoardDetail`.
- `src/lib/dashboard/data.ts` — `getBoard(id)` → GET `/md/v2/dashboard/boards/{id}`;
  404/403 → null.
- `src/components/dashboard/panels/BoardsPanel.tsx` — cover + titel in een `Link`
  naar het detail (zoals BookmarksPanel); delete-knop blijft werken.

## Afhankelijkheid
`GET /md/v2/dashboard/boards/{id}` (Johan) — contract per mail 04-06. Vooruit
gebouwd; werkt zodra gedeployed.

## Geen botsing met channels-sessie
Alle geraakte bestanden zitten in dashboard/types/data/mappers — disjunct van de
parallelle Stap-12 (channels) levering (die raakt o.a. globals.css, lib/api,
lib/seo). Geen overlappende bestanden.
