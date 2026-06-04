# Open issues — patch Bookmarks / Saved searches / Boards

> Append aan `docs/open-issues.md`. Datum: 04-06-2026.
> Sluit de eerder genoteerde "bookmark POST (publieke site)"- en
> "board-items toevoegen"-gaten gedeeltelijk en herclassificeert ze.

## Opgelost / werkend gemaakt deze stap

- **Bookmarks create-flow (frontend)** — "Save" persisteert nu echt over de hele
  publieke site (materials/articles/talks/events + material-cards). Provider +
  GET/POST-route + `item_id` op `BookmarkItem`. Was: lokale no-op toggle.
- **Saved-search create (frontend)** — "Save this search" in de materials-filter
  is werkend (Insider-gated, POST naar bestaande route). Was: disabled TODO.

## ✅ Johan — live op productie (04-06-2026)

### BM-1 — `POST /md/v2/dashboard/bookmarks` + `item_id` in response
Plugin `2aedda2`. Smoke: POST 201/200, GET bevat `item_id`.

### BM-2 — `POST /md/v2/dashboard/saved-searches` live
Bevestigd op productie (Insider-gated). Smoke met `e2e-dashboard-insider@materialdistrict.com`.

## 🟢 Volgende stap (eigen, niet-blokkerend)

### BD-1 — Boards "Add to board" werkend maken
**Eigenaar:** Claude (UI) + Johan (endpoint)
"Add to board" is nu nog een no-op/Insider-gate. Vereist:
1. WP: `POST /md/v2/dashboard/boards/{id}/items` (`{ type, item_id }`, idempotent)
   — meegevraagd in email §2.
2. Frontend: board-picker-modal (kies bestaand board of maak nieuw via de
   bestaande `POST /boards`), + `GET` toevoegen aan de boards-collectie-route
   voor de picker. **Nieuwe CSS** (modal) → aparte gefocuste stap; daarom niet
   in deze oplevering meegenomen.

## Boekhouding

- Items book-/brand-detail hebben (nog) geen Save-knop; bewust buiten scope
  gehouden om geen half-gebouwde UI of nieuwe CSS te introduceren. Het
  bookmark-type ondersteunt ze al.
