# Session-log patch — Bookmarks (werkend maken) + Saved-search-create

> Append-only patch voor `session-log.md`. Datum: 04-06-2026.
> Dashboard-vervolg: de "opslaan/aanmaken"-kant die in eerdere sessies bewust
> als placeholder bleef staan, nu écht werkend gemaakt op de publieke site.

## Aanleiding

Reads + deletes van het hele dashboard-datacontract waren al bedraad (batch
1–4 + portal). Wat ontbrak was de **create-kant**: "Save" op detailpagina's en
material-cards was een lokale, niet-persistente toggle, en `POST
/md/v2/dashboard/bookmarks` was nooit gecontracteerd. Daardoor kon je nergens
een bookmark aanmaken. Saved-searches had wél een POST-route, maar de
"Save this search"-knop in de materials-filter was een bewuste TODO-no-op.

## Bookmarks — nu werkend

**Nieuw:**
- `src/lib/hooks/useBookmarks.tsx` — client-provider + `useBookmarks()`, zelfde
  loose-mode-patroon als `useCompare`. Hydrateert eenmalig de bookmarks van de
  ingelogde gebruiker (GET) naar een Map `"{type}:{itemId}" → bookmarkId`, en
  `toggleBookmark(type, itemId)` schrijft optimistisch door (POST om toe te
  voegen, DELETE op record-id om te verwijderen) met revert bij fout. Geen
  dubbel-klik-races (per-key pending-guard). Anoniem = lege set, geen fetch.
- `src/app/api/dashboard/bookmarks/route.ts` — `GET` (hydratie-lijst) +
  `POST` (create, body `{ type, itemId }` → WP `{ type, item_id }` via nieuwe
  `toWpBookmark`). DELETE bestond al in `[id]/route.ts`.
- `src/app/events/[slug]/_components/EventDetailActions.tsx` — events gebruikten
  `<DetailActions>` direct (server-rendered, Save was no-op). Nieuwe client-
  wrapper sluit Save aan op `useBookmarks`, met `customPrimary` (Register/Visit)
  doorgegeven vanuit de page.

**Gewijzigd:**
- `src/types/dashboard.ts` — `BookmarkItem` krijgt `itemId: number` (onderliggende
  WP-post-id; nodig om een card/detail aan zijn bookmark-record te koppelen).
- `src/lib/dashboard/mappers.ts` — `RawBookmark.item_id`, `mapBookmark` leest het,
  + write-mapper `toWpBookmark`. Rest van het bestand byte-identiek
  (`wpRenderedHtml` ongemoeid).
- `src/app/layout.tsx` — `<BookmarksProvider>` gemount binnen `AuthProvider`
  (rond shell), zodat elk client-eiland de saved-state deelt.
- Save-knoppen bedraad op `useBookmarks` i.p.v. lokale state:
  - `MaterialDetailActions`, `ArticleDetailActions`, `TalkDetailActions`
  - `MaterialsGrid` + `BrandMaterialsGrid` (material-cards)
  - `EventDetailActions` (nieuw)

**Buiten scope (geen Save-affordance vandaag):** book- en brand-detailpagina's
hebben nu geen Save-knop; het bookmark-type ondersteunt ze wel zodra die
knoppen later toegevoegd worden.

**Afhankelijkheid (Johan):** `POST /md/v2/dashboard/bookmarks` + `item_id` in de
bookmark-response. Frontend is tegen die shape gebouwd en werkt zodra het
deployt. Zie `docs/email-johan-bookmarks-boards.txt`.

## Saved-search-create — nu werkend

- `src/app/materials/_components/MaterialsFilterSidebar.tsx` — de "Save this
  search"-knop is niet langer disabled:
  - Anoniem → redirect naar `/sign-in?next=<huidige URL>`.
  - Ingelogd, geen Insider → `InsiderGate` (feature `savedSearch`).
  - Insider → `POST /api/dashboard/saved-searches` met `{ name, query }`.
    `query` = canonieke filter-querystring (`buildUrl(localSelection)` zonder
    pathname); `name` = auto-afgeleid uit de actieve selectie (WP berekent de
    `summary`). Bevestiging/fout via de bestaande `.form-banner`-klasse —
    **geen nieuwe CSS**. Knop disabled zolang er niets geselecteerd is of de
    POST loopt (spinner via `IconLoading`).
- Gating gebruikt `useAuth()` direct (de page geeft `isMember` niet mee).

**Afhankelijkheid (Johan):** bevestig dat de al-gecontracteerde
`POST /md/v2/dashboard/saved-searches` live op productie staat.

## Geen CSS-wijzigingen

Alles hergebruikt bestaande klassen/componenten (`ActionButton`, `IconButton`,
`form-banner is-info/is-error`, `InsiderGate`, `btn`). `globals.css` ongewijzigd.

## Volgende stap (niet in deze oplevering)

Boards "Add to board" werkend maken: vereist een board-picker-modal (eigen
styling → CSS-toevoeging) + het nieuwe `POST /md/v2/dashboard/boards/{id}/items`
(in dezelfde Johan-mail meegevraagd). Wordt de eerstvolgende stap.

## Addendum (herbasis 04-06, 2e ronde)

- Alle bewerkte bestanden opnieuw afgeleid van Jeroens actuele bron nadat bleek
  dat de werkkopie verouderd was (featured/offline-velden op `MaterialListRow`,
  ChannelBar-`theme`-facet, en een a11y-refactor in de FilterSidebar). Mijn
  bookmark-/saved-search-wijzigingen staan nu náást dat werk, niets overschreven.
- Saved-search is nu **channel-bewust**: de opgeslagen `query` neemt de volledige
  URL-state mee (filters + q + sort + actief `?channel=`), minus paging.
- Enige uitzondering: de ROOT `src/app/layout.tsx` (provider-mount) is op de
  oudere snapshot gebaseerd — te verifiëren tegen de huidige bron.
