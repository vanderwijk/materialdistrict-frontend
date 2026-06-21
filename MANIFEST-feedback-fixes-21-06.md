# MANIFEST — Feedback-fix build (21-06-2026)

Basis: laatste main `da82d5c`. 25 bestanden (22 gewijzigd, 3 nieuw). Plaats ze
op de aangegeven paden in de moedermap; `session-log.md` hoort op de repo-root.

## Nieuw
| Pad | Doel |
|---|---|
| `src/app/compare/page.tsx` | Server-pagina `/compare` — leest `?ids=`, fetcht materials, seedt CompareView. |
| `src/app/compare/_components/CompareView.tsx` | Client-tabel: kop-kaarten, secties, semantic-pills, guard + lege staat. |
| `src/components/layout/AccountMenu.tsx` | Avatar + voornaam + status-afhankelijk dropdown (vervangt de Insider-knop). |

## Gewijzigd
| Pad | Wijziging |
|---|---|
| `src/styles/globals.css` | Append-only §-blokken: channel-hero, F1-confirm, Events/Books-tegels, topmenu/account-menu, compare. |
| `src/lib/api/content.ts` | + `getMaterialsForCompare(ids)` (puur additief). |
| `src/lib/api/index.ts` | Export `getMaterialsForCompare`. |
| `src/lib/api/mappers.ts` | + `externalWebsite` in `mapEventListItem` (1 regel). `wpRenderedHtml`-crashfix intact. |
| `src/types/event.ts` | `externalWebsite: string \| null` toegevoegd aan `EventListItem`. |
| `src/components/layout/Header.tsx` | Insider-knop → `AccountMenu` (log-out zit in dat menu); nieuwe props/callbacks. Mobiele Sign out ongewijzigd. |
| `src/components/layout/HeaderShell.tsx` | Naam/avatar + account-callbacks doorgegeven (uit `useAuth().user`). |
| `src/components/layout/FollowDigestBlock.tsx` | Generiek: top-8 uit catalogus + "Show all"; `channels`-prop optioneel (alleen seed). |
| `src/components/layout/Footer.tsx` | Telefoon-regel + labels + copyright; digest-seed top-6 → top-8. |
| `src/components/ui/FollowToggle.tsx` | Confirm-bij-ontvolgen (`'confirm'`-popover). |
| `src/app/(home)/page.tsx` | Channel-bar, "List your materials", Get-tickets-knop onder de EventCard. |
| `src/app/book/_components/BookCard.tsx` | Home-variant: insider-prijs inline + "View book"-CTA. `/book` ongemoeid. |
| `src/app/event/_components/EventCard.tsx` | Jaartal als derde regel op de datum-badge. |
| `src/app/channel/[slug]/_components/ChannelHero.tsx` | Herontwerp: titel+follow één regel, bel, witte beschrijving in de hero. |
| `src/app/channel/[slug]/page.tsx` | `.channel-intro` onder de hero verwijderd. |
| `src/app/material/[slug]/page.tsx` | Follow-blok generiek (geen item-channels). |
| `src/app/brand/[slug]/page.tsx` | idem. |
| `src/app/event/[slug]/page.tsx` | idem. |
| `src/app/article/[slug]/page.tsx` + `_components/ArticleDetailSidebar.tsx` | Follow-blok generiek; `channels`-prop uit de sidebar. |
| `src/app/talk/[slug]/page.tsx` + `_components/TalkDetailSidebar.tsx` | idem. |
| `src/app/book/[slug]/page.tsx` | S1: Preferred Source-blok ín `.detail-sheet`. |

**S1 — Preferred Source-plaatsing:** op material / brand / event / talk / book is
het blok verplaatst van búiten het witte vel (na de aside, op de paper) naar
bínnen `.detail-sheet`, als laatste blok onder de content — conform Stories.

## Afhankelijkheden bij Johan
1. **Get tickets-link** — de mapper leest `external_website` al; exposeer dat veld
   ook op het event-**LIST**-endpoint. Tot dan valt de knop netjes weg (null).
2. **Follow-scope** — bij volgen vanuit het generieke blok stuurt de frontend
   `types: ['material','story','talk']`; het follow-record moet die scope bewaren.
3. **Compare-velden** — environmental(10) + content(3) komen pas uit WP zodra je
   ze aanlevert; de UI toont tot dan "Not specified".

## Validatie
- esbuild syntax-check: alle 25 bestanden OK (geen tsc in deze omgeving).
- `globals.css`: braces gebalanceerd (3110/3110), comments gebalanceerd, append-only.
- Gedeelde API-bestanden: alleen additief t.o.v. main (geen export-regressies);
  `wpRenderedHtml`-crashfix in `mappers.ts` geverifieerd intact (19×, geen kale `.rendered`).

## Topmenu — log-out
Log out staat onderaan het account-menu in het rood (met een divider erboven);
het power-icoon in de balk is weg. De mobiele drawer houdt z'n eigen Sign out-knop.
