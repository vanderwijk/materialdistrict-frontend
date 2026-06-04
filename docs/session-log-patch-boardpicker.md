# Session-log patch — Board picker ("Add to board")

> Append aan `session-log.md`. Datum: 04-06-2026.
> Sluit het laatste gat uit de bookmarks/boards-sessie: "Add to board" werkt nu echt.

## Wat

"Add to board" op de detailpagina's was een no-op (gating + placeholder). Nu opent
het een `BoardPickerModal` waarin de gebruiker het item aan een bestaand board
toevoegt of een nieuw board aanmaakt.

**Nieuw:**
- `src/components/ui/BoardPickerModal.tsx` — Insider-modal. Bij openen GET
  `/api/dashboard/boards`; klik op een board → POST `/boards/{id}/items`
  `{ type, itemId }`; "New board" → naam via prompt → POST `/boards` → meteen het
  item toevoegen. Succes-scherm via `git-success`. Hergebruikt de `git-*`
  modal-shell + `git-option`-rijen → **geen nieuwe CSS**.
- `src/app/api/dashboard/boards/[id]/items/route.ts` — POST-proxy naar Johans
  `POST /md/v2/dashboard/boards/{id}/items` (live, plugin 2aedda2).

**Gewijzigd:**
- `src/app/api/dashboard/boards/route.ts` — `GET` toegevoegd (lijst voor de
  picker); bestaande `POST` ongemoeid.
- De vier detail-wrappers (material/article/talk/event): `handleAddToBoard`
  opent nu de modal i.p.v. niets te doen.

## Gating
Ongewijzigd: `DetailActions` checkt eerst ingelogd (→ sign-in) en Insider
(→ InsiderGate) vóór `onAddToBoard`. De modal gaat dus uit van een Insider.

## Geen CSS-wijzigingen
`globals.css` ongemoeid; alles via bestaande `git-*` / `btn` / icon-klassen.

## Resteert
- Save-knop op book-/brand-detail (los puntje; types ondersteunen het al).
- Roadmap: channel-hubs `/channels` + `/channels/[slug]` (build-order Stap 12).
