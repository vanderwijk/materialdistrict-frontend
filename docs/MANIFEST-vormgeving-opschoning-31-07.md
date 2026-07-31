# MANIFEST — vormgeving-opschoning (31-07-2026)

Zip: `materialdistrict-vormgeving-opschoning-v1.zip`
Gebouwd op: `main` @ `775e601` (schone checkout, gelijk aan `origin/main`).

---

## Bestanden

| Pad | Actie |
|---|---|
| `src/styles/globals.css` | vervangen |
| `docs/vormgeving-regelboek.md` | nieuw |
| `docs/dode-css-inventaris-31-07.md` | nieuw |
| `docs/MANIFEST-vormgeving-opschoning-31-07.md` | nieuw |
| `session-log.md` | vervangen (sessie toegevoegd) |

**Let op:** `globals.css` is deze keer **in-place bewerkt**, niet alleen
aangevuld. Dat is een bewuste uitzondering op de append-only-regel, eenmalig,
voor deze opschoning. Er is één nieuwe sectie achteraan toegevoegd (`§TOUCH`).

---

## Wat er is gewijzigd

### Tokens uitgebreid
- Type-schaal van `rem` naar hele pixels; twee treden toegevoegd (`--text-2xs`).
- `--radius-sm`, `--radius-xl`, `--radius-pill` toegevoegd.
- `--shadow-md`, `--shadow-panel` toegevoegd.
- `--focus-ring`, `--focus-ring-on-dark`, `--focus-offset` toegevoegd.
- `--transition-mid` toegevoegd; `--red-action` toegevoegd.

### Losse waarden naar tokens
| | Aantal |
|---|---|
| font-size naar token | 497 |
| halve stappen weggewerkt (11,5 / 12,5 / 13,5 / 14,5 / 10,5 / 17px) | 20 |
| border-radius naar token | 82 |
| kapotte `var(--radius-*, fallback)` hersteld | 6 |
| box-shadow naar de ladder | 27 |
| box-shadow bewust buiten de ladder gehouden (richting) | 3 |
| focusring naar één token | 49 |
| transitieduur naar token | 59 |
| ruimtewaarden buiten het raster gecorrigeerd | 139 |

### Defecten
1. Dubbel `data-reading-size`-blok: de eerste, volledig overschreven versie
   verwijderd (bevatte andere waarden dan de werkende versie).
2. Dode dark-mode-regel voor de material-tag verwijderd (wit op olijf, 2,75:1;
   werd al door sectie 38 overschreven).
3. Losse rode kleur `#c0392b` (10×) naar `--red-action`.
4. Nieuw `§TOUCH`-blok: lift- en schaduw-hovers uitgezet op apparaten zonder
   muisaanwijzer, voor 17 families.

---

## Wat er níét in zit

- **211 dode CSS-klassen** — geïnventariseerd, niet verwijderd. Niet te
  verifiëren of WordPress-content ze gebruikt. Zie
  `docs/dode-css-inventaris-31-07.md`.
- **Breekpunten migreren** (14 grenzen) — verschuift lay-outs.
- Zeven verdere punten, zie `docs/vormgeving-regelboek.md` §11.

---

## Verwachte zichtbare verandering

Vrijwel nul. De verschuivingen:

- **Typografie:** max 0,5px op de plekken die al een token gebruikten (165), en
  0,5–1px op de 20 halve stappen. Alle overige 497 omzettingen zijn maat-voor-maat
  gelijk — alleen de bron verandert.
- **Ruimte:** max 2px, op 139 plekken.
- **Ronding:** max 2px, behalve één element van 20px naar 16px.
- **Schaduw:** dit is de enige plek met echt zichtbaar effect. 27 eenmalige
  schaduwen zijn naar vier treden getrokken; enkele worden iets zachter of
  steviger. **Dit is het punt om bij het testen naar te kijken.**

---

## Verificatie

| Controle | Uitkomst |
|---|---|
| Haakjesbalans | 3282 = 3282 |
| Parse-fouten (tinycss2) | 0 (baseline ook 0) |
| Unieke selectors vóór/ná | 2634 → 2634, geen verdwenen |
| Declaratietelling per eigenschap | gelijk, op 2 bewuste verwijderingen en 1 toevoeging na |
| `var()` zonder definitie | 21 → 20 (`--radius-sm` opgelost; rest zijn variabelen die via JS/inline gezet worden, pre-existent) |

---

## Twee correcties op de eerste scan

Bij het uitwerken bleken twee bevindingen uit de eerste meting te stellig:

1. **Contrast.** De gemelde faalpunten (groene knop 3,5:1, `--text-hint` 2,3:1,
   amber, dark-mode material-tag) zijn **al opgelost** in sectie 38, het
   WCAG-correctieblok uit sessie A11Y-1. De eerste meting las de `:root`-waarden
   zonder die latere laag mee te nemen. Alleen de dode regel is opgeruimd.
2. **Breekpunt-overlap.** De gemelde botsing op 768px en 1024px bestaat in de
   praktijk niet: de `min-width`-regels raken andere selectors dan de
   `max-width`-regels. Gecontroleerd op alle 142 media queries.

Beide gevallen illustreren hetzelfde: in een bestand van 18.664 regels met
vijftig lagen liegt de eerste definitie. Dat is precies waarom het regelboek
vastlegt welke laag de norm is.

---

## Integratie op main (na zip)

Zip gebouwd op `775e601`. Op huidige `main` gezet via patch i.p.v. blind vervangen, zodat latere soft-launch CSS behouden blijft:

- homepage overflow (`minmax(0,1fr)`, `overflow-x: clip`, phone 1-col `.hp-main .grid-3`)
- channel-hero `--bg`
- feedback-paneel (trigger hide, safe-area, geen `100vw`/honeypot-scroll)
- search form stretch op smalle viewports

Aanpassingen t.o.v. zip:

1. Mislukte patch-hunk rond `.hp-main`/`.insider-cta` handmatig gemerged (tokens + overflow-fixes).
2. Typo in commentaar: `vormgeying` → `vormgeving`.
3. `§TOUCH`: sticky hover reset zet geen `--shadow` meer op elementen zonder rustschaduw.
4. `session-log.md` niet vervangen — vormgeving-sessie aangehangen na de classificatie-sessie.

