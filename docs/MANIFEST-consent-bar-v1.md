# MANIFEST — consent-bar-v1

Geleverd 31-07-2026. Minimale cookietoestemming voor de soft launch.

## Nieuwe bestanden

| Pad | Wat |
|---|---|
| `src/lib/consent/consent.ts` | Opslag, uitlezen en abonneren op de keuze |
| `src/components/consent/ConsentBar.tsx` | De balk zelf |

## Gewijzigde bestanden (compleet, geen patches)

| Pad | Wijziging |
|---|---|
| `src/lib/api/events.ts` | `md_aid` én `logEvent` gated op toestemming |
| `src/components/ads/AdSlot.tsx` | gpt.js wordt niet geïnjecteerd zonder toestemming |
| `src/app/layout.tsx` | `<ConsentBar />` gemount |
| `src/styles/globals.css` | Blok `§CONSENT-BAR` achteraan toegevoegd |

`globals.css` is append-only bijgewerkt op de versie uit de zip van 31-07
(19.540 → 19.615 regels). Niets verwijderd of herschreven.

## Hoe het werkt

Eén keuze, twee uitkomsten:

- **Accepteren** → `md_aid` wordt gezet, events worden verstuurd, gpt.js laadt.
- **Weigeren** → niets van dat alles. Niet "geanonimiseerd", niet "beperkt":
  het script komt de pagina niet in en er verlaat geen event de browser. Een
  al gezette `md_aid` wordt actief verwijderd.
- **Nog niet gekozen** → geldt als weigeren. Zwijgen is geen toestemming.

Strikt noodzakelijke cookies vallen erbuiten: de inlogcookie, de winkelwagen
en de consentkeuze zelf. Daar hoeft niet om gevraagd te worden, en ernaar
vragen leert mensen alleen de balk weg te klikken.

De balk luistert naar wijzigingen, dus wie accepteert ziet de banners meteen
in plaats van na een herlaadbeurt.

## Wat dit NIET is

Geen TCF-gecertificeerde CMP. Google eist voor gepersonaliseerde advertenties
in de EER een consenttool uit hun eigen lijst. Deze balk staat daar niet op.
Praktisch gevolg: met deze oplossing kan GAM besluiten alleen niet-
gepersonaliseerde advertenties te leveren, wat lagere opbrengsten betekent.
Voor een testmaand is dat te overzien; vóór de commerciële start in september
hoort hier een echte CMP te staan.

Ook niet meegeleverd: de cookieverklaring zelf. De balk linkt naar `/privacy`
(bestaat, http 200). Een volledige cookie-inventarisatie stond al als open
punt genoteerd en is niet in dit pakket opgelost.

## Validatie

- esbuild-transform op alle vijf TS/TSX-bestanden: geslaagd
- `globals.css` brace-balans: 3.454 / 3.454
- `globals.css` begint byte-identiek aan de aangeleverde versie
- `/privacy` gecontroleerd: http 200

Niet gedraaid: `tsc --strict` (geen `node_modules`).
