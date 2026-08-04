# MANIFEST — md-mission-beeld-04-08-v2

Levering 04-08-2026. Beeld op de missiepagina + herontworpen routekeuze.

> **Vervangt `md-mission-beeld-04-08`** (die bevatte een los CSS-blok om te
> plakken). Gooi die eerst weg. Deze versie bevat een complete `globals.css`,
> dus er hoeft niets meer met de hand toegevoegd te worden.

Aanvulling op wat live staat; vervangt verder geen eerdere levering.

## Bestanden

| Pad | Nieuw / gewijzigd |
|---|---|
| `src/components/content/EditorialPage.tsx` | gewijzigd — beeld per sectie |
| `src/app/our-mission/page.tsx` | gewijzigd — foto's + nieuw routeblok |
| `src/app/about/page.tsx` | gewijzigd — één foto |
| `src/styles/globals.css` | gewijzigd — append-only, §EDITORIAL-MEDIA |
| `public/images/mission/*.jpg` | **nieuw** — 6 foto's, 2,0 MB totaal |
| `session-log.md` | gewijzigd |

## globals.css — gecontroleerd tegen jouw main

Dit bestand is gebouwd op de versie die op `main` staat (19.359 regels, inclusief
§CONTACT-FORM, §SEARCH-TYPE-TABS, §SOFTLAUNCH-404, §SOFTLAUNCH-FEEDBACK en
§TOUCH), niet op mijn sessiekopie. Controles:

- Selectorvergelijking: geen enkele selector van main ontbreekt.
- Append-only bewezen: het bestand begint letterlijk met de volledige huidige
  main; er is uitsluitend aan het eind toegevoegd — 137 regels, §EDITORIAL-MEDIA.
- Eindstand 19.496 regels, accoladebalans 3.430/3.430.

Je CSS voor het contactformulier en de filtertabs blijft dus staan.

## Volgorde

Alles in één keer. Geen WordPress-actie nodig: de tekst van beide pagina's staat
er al, dit gaat alleen over weergave en beeld.

## Controles

- esbuild op alle gewijzigde TSX — geen fouten.
- Foto's bijgesneden op vaste verhouding, geschaald (1600px tekstkolom /
  2000px breed), JPEG q82 progressive. Grootste bestand 565 kB.
