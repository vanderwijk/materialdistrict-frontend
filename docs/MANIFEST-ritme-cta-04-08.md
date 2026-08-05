# MANIFEST — md-ritme-cta-04-08

Levering 04-08-2026 (tweede vandaag). Herstel van de tussenruimte op de
contentpagina's + opnieuw ontworpen routekeuze onderaan Our Mission.

| Pad | Wat |
|---|---|
| `src/components/content/EditorialPage.tsx` | gewijzigd — Fragment i.p.v. div |
| `src/app/our-mission/page.tsx` | gewijzigd — eyebrow + knopklassen |
| `css-append/EDITORIAL-RHYTHM-CTA.css` | **append-blok**, zie hieronder |
| `session-log.md` | gewijzigd |

## globals.css

Bewust geen compleet bestand deze keer. Main beweegt door terwijl ik werk, dus
een volledige `globals.css` van mijn kant loopt altijd het risico recent werk
terug te draaien — zoals vorige keer bijna gebeurde met de iOS-zoom- en
pagineringsfixes.

`css-append/EDITORIAL-RHYTHM-CTA.css` **aan het eind van
`src/styles/globals.css` plakken**, ná het laatste bestaande §-blok. Niets
erboven wijzigen. De map `css-append/` hoort niet in de repo.

- 158 regels, accolades in balans (32/32).
- Gecontroleerd tegen main van vandaag: append-only, totaal 19.697 regels,
  accoladebalans 3.470/3.470.

## Achtergrond

De tussenruimte was weggevallen door een fout van mij in de vorige levering: ik
zette sectie + beeld in een omhulsel, waardoor de bestaande afstandsregel tussen
secties niet meer aansloeg. Vandaar dat dit blok ook afstandsregels bevat voor
de situatie "beeld tussen twee secties", die eerder niet bestond.

## Controles

- esbuild op beide TSX-bestanden — geen fouten.
- Geen WordPress-actie nodig.
