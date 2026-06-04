# MANIFEST — Board picker ("Add to board") — 04-06-2026

Overlay over de actuele moederrepo (commit 824d3b3). Geen CSS-wijzigingen:
de modal hergebruikt de bestaande `git-*` shell + `git-option`-rijen.

## Nieuw
- src/components/ui/BoardPickerModal.tsx          (modal: kies/maak board → voeg item toe)
- src/app/api/dashboard/boards/[id]/items/route.ts (POST item → board)

## Gewijzigd
- src/app/api/dashboard/boards/route.ts           (+ GET voor de picker; POST ongemoeid)
- src/app/materials/[slug]/_components/MaterialDetailActions.tsx
- src/app/articles/[slug]/_components/ArticleDetailActions.tsx
- src/app/talks/[slug]/_components/TalkDetailActions.tsx
- src/app/events/[slug]/_components/EventDetailActions.tsx
  (in alle vier: `handleAddToBoard` opent nu de BoardPickerModal)

## Backend (al live, Johan 2aedda2)
- POST /md/v2/dashboard/boards/{id}/items { type, item_id } → Board
- (gebruikt ook de bestaande POST /md/v2/dashboard/boards voor "New board")

## Geen nieuwe afhankelijkheden
Backend staat. Niets te wachten op Johan.

## Buiten scope (zoals afgesproken)
- Save-knop op book-/brand-detail (types ondersteunen het al; geen UI-affordance).
- Item uit board verwijderen (endpoint nog niet nodig).
