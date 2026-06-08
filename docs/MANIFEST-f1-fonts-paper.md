# MANIFEST — F1.0 Typografie + paper-canvas (08-06-2026)

## Bestanden in deze zip (moedermap-structuur)
- src/app/layout.tsx        (gewijzigd — next/font -> Schibsted Grotesk)
- src/styles/globals.css    (gewijzigd — :root font-tokens + --bg paper)
- design-tokens.md          (gewijzigd — font + --bg + F1.0-changelog)
- session-log.md            (gewijzigd — Laatste-update + F1.0-entry)
- MANIFEST-f1-fonts-paper.md (dit bestand)

## Wat het doet
- Letterfamilie -> Schibsted Grotesk (display + body).
- Pagina-achtergrond -> paper (#fbfaf7); tegels/panels blijven wit (--surface).
- Geen layout/structuur-wijzigingen.

## Basis / diff-discipline
Alle bestanden gepatcht op de door Johan aangeleverde verse main (niet op de
projectsnapshot, die achterliep). Per bestand is diff (verse-main -> opgeleverd)
beperkt tot uitsluitend de bedoelde regels:
- globals.css   : 3 :root-token-regels
    --bg            #ffffff -> #fbfaf7
    --font-display  'DM Serif Display', Georgia, serif -> 'Schibsted Grotesk', system-ui, sans-serif
    --font-body     'DM Sans', ... -> 'Schibsted Grotesk', system-ui, -apple-system, sans-serif
- layout.tsx    : next/font-import + 2 font-instances + html className
- design-tokens.md : font-familie, --bg, laad-notitie, display-notitie + F1.0-changelog
- session-log.md   : Laatste-update-blok + nieuwe F1.0-entry onderaan

## Deploy
Puur frontend. next/font self-host Schibsted Grotesk at build — geen externe
font-requests, geen WP/backend-actie nodig.

## Na deploy verifieren (1 plek)
Paywall-fade op gated artikelen/talks vervaagt nu naar paper i.p.v. wit. Correct
zolang de artikeltekst op de pagina-achtergrond staat (huidige layout); bij latere
tile-isatie van de artikeltekst moet de fade meeverhuizen naar --surface.

## Niet in deze stap (bewust geparkeerd voor F2/F3/F5)
Card-herontwerp, schaduw/radius-overhaul, wit-op-canvas-layout op detail- en
dashboardpagina's.
