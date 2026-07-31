# Regelboek vormgeving

> **Doel.** Eén norm voor de visuele bouwstenen van MaterialDistrict: typografie,
> ruimte, ronding, schaduw, focus, beweging en breekpunten. Dit document is de
> maatstaf waaraan nieuwe CSS getoetst wordt. Wijkt een sessiebundel, een oudere
> sectie in `globals.css` of een levering hiervan af, dan is dát stuk verouderd —
> niet dit regelboek.
>
> Versie 1.0 · 31-07-2026 · opgesteld na een volledige meting van `globals.css`
> (18.664 regels, ~50 append-lagen) en toegepast in dezelfde levering.

---

## 0. Uitgangspunten

1. **Eén bron per bouwsteen.** Elke maat, kleur, ronding, schaduw en duur heeft
   precies één token. Staat er een losse waarde in de code, dan is dat een fout,
   geen keuze.
2. **De ladder heeft treden, geen tussenwaarden.** Past iets niet op een trede,
   dan is de vraag welke trede het dichtst bij ligt — niet welke nieuwe waarde
   erbij moet.
3. **Nieuwe secties zijn append-only, maar de tokens niet.** Nieuwe regels komen
   onderaan in een genoemde `§`-sectie. De tokendefinities in `:root` blijven
   één blok; daar wordt in-place bijgewerkt.
4. **Overschrijven is een laatste redmiddel.** Een tweede definitie van dezelfde
   klasse ergens verderop in het bestand is toegestaan als het gedocumenteerd
   gebeurt (zoals sectie 38), maar is geen normale werkwijze.
5. **Bij twijfel: de bestaande trede, niet een nieuwe.**

---

## 1. Wat er op 31-07-2026 is rechtgetrokken

| Bouwsteen | Aangepast |
|---|---|
| Typografie | 497 losse maten naar een token, 20 halve stappen weg |
| Ruimte | 139 waarden buiten het raster gecorrigeerd |
| Ronding | 82 losse waarden naar een token, 6 kapotte verwijzingen hersteld |
| Schaduw | 27 eenmalige schaduwen naar de ladder, 3 richtinggevoelige behouden |
| Focusring | 49 ringen naar één token |
| Beweging | 59 duren naar een token |
| Defecten | 4 (zie §8, §9) |

---

## 2. Typografie

De schaal staat in hele pixels. Er zijn geen halve stappen.

| Token | Maat | Gebruik |
|---|---|---|
| `--text-2xs` | 11px | micro-labels, tellers |
| `--text-eyebrow` | 12px | eyebrow, kleine caps-labels, meta |
| `--text-xs` | 13px | pills, tags, bijschriften |
| `--text-sm` | 14px | interface-tekst, knoplabels |
| `--text-base` | 15px | secundaire lopende tekst |
| `--text-md` | 16px | body default |
| `--text-lg` | 18px | intro, lead |
| `--text-xl` | 19px | kleine kop |
| `--text-2xl` | 22px | sectiekop |
| `--text-3xl` | 31px | paginakop |
| `--text-4xl` | 40px | display |
| `--text-5xl` | 48px | display groot |
| `--text-6xl` | 57px | hero |
| `--text-7xl` | 70px | hero groot |

**Achtergrond.** De schaal stond in `rem` en was ooit met factor 1,1 opgehoogd,
terwijl de commentaren de waarden van vóór die ophoging bleven noemen —
`--text-sm` heette "13px" maar was 14,3px. Wie het token gebruikte kreeg iets
anders dan wie het commentaar volgde. Daar kwamen de halve stappen vandaan
(10,5 / 11,5 / 12,5 / 13,5 / 14,5px). De rem-waarden zijn vervangen door de
dichtstbijzijnde hele pixel; de grootste verschuiving is 0,5px.

**Regels.**
- Onder de 20px: altijd een token, nooit een losse waarde.
- Boven de 20px: display-koppen mogen per pagina een eigen maat houden waar dat
  bewust is, maar geen halve stappen.
- `--text-eyebrow` is de 12px-trede. De naam is historisch en zegt niets over
  waar hij gebruikt mag worden.
- Geen `clamp()` in gebruik; koppen springen op het breekpunt. Fluid typografie
  voor de drie grootste treden staat op de lijst, zie §11.

---

## 3. Ronding

| Token | Maat | Gebruik |
|---|---|---|
| `--radius-sm` | 4px | vinkjes, kleine indicatoren |
| `--radius` | 6px | invoervelden, knoppen, pills met vlak |
| `--radius-md` | 8px | tegels, kleine kaarten |
| `--radius-lg` | 12px | kaarten, panelen |
| `--radius-xl` | 16px | grote panelen, modals |
| `--radius-pill` | 999px | volledig ronde vormen |
| `50%` | — | cirkels (avatar, icoonknop) |

**Regels.**
- Een pilvorm is altijd `--radius-pill`. `100px` en `99px` zijn geen pilvorm maar
  een toevallige grote ronding; die schrijfwijzen zijn afgeschaft.
- `--radius-sm` bestond niet maar werd wel gebruikt, op twee plekken zonder
  terugvalwaarde — daar viel de ronding stil weg naar nul. Nu gedefinieerd.
- Terugvalwaarden in `var(--radius-x, Ypx)` zijn verwijderd: ze weken af van de
  echte tokenwaarde en gaven een tweede, stille bron.

---

## 4. Schaduw

Vier treden. Elke trede staat voor een hoogte boven het vlak, niet voor een look.

| Token | Bedoeld voor |
|---|---|
| `--shadow` | rusttoestand: kaarten, tegels, invoervelden |
| `--shadow-md` | opgetild: hover, actieve tegel |
| `--shadow-lg` | zwevend: dropdown, popover, sticky balk |
| `--shadow-panel` | boven alles: modal, uitschuifpaneel |

**Regels.**
- Geen nieuwe schaduwwaarden. Past iets niet, dan is de vraag welke hoogte het
  element heeft.
- **Richtinggevoelige schaduwen vallen buiten de ladder.** Een schaduw met een
  horizontale offset (uitschuifpaneel) of een negatieve verticale offset (sticky
  balk die naar boven schaduwt) houdt zijn eigen waarde. De ladder is neerwaarts;
  die er toch in duwen draait de richting om. Drie zulke schaduwen staan bewust
  buiten de ladder.
- Een ring geschreven als `box-shadow: 0 0 0 Npx` is geen schaduw maar een rand.
  Die blijft ongemoeid.

---

## 5. Focus

Eén ring: `--focus-ring` (2px, `--navy-light`).
Op een donkere ondergrond: `--focus-ring-on-dark` (2px wit).
Afstand tot het element: `--focus-offset` (2px).

**Regels.**
- De focusring is nooit merkkleur-afhankelijk. Een groene knop krijgt dezelfde
  ring als een blauwe. Hij stond in acht verschillende kleuren door het bestand;
  dat is nu één.
- `outline: none` zonder vervangende zichtbare focusindicatie is niet toegestaan.

---

## 6. Kleur

Kleur is de best onderhouden laag: 2.158 tokenverwijzingen tegen 288 losse
hexwaarden, en die laatste zijn vooral wit en donkere-modus-tinten.

**Regels.**
- Nooit een merkkleur hardcoden. `--navy`, `--green` en de `--ct-*`-reeks hebben
  tokens.
- **Sectie 38 (`WCAG AA contrast-fixes`) is de norm voor actiekleuren.** Dat blok
  overschrijft `--green-action`, `--green-action-hover` en `--text-hint` bewust
  en gedocumenteerd. De waarden in het hoofd-`:root`-blok zijn de historische
  uitgangswaarden en zijn níét de norm. Wie de kleur van een actieknop wil weten,
  kijkt in sectie 38.
- `--green` en `--green-mid` blijven accentkleuren voor vlakken zónder tekst.
  Een knop met wit label gebruikt `--green-action`.
- Rood: `--red` is de accentkleur, `--red-action` (5,4:1 op wit) is de kleur voor
  rode tekst en rode knoplabels. Die tweede stond tien keer los in het bestand.

---

## 7. Beweging

| Token | Duur | Gebruik |
|---|---|---|
| `--transition-fast` | 120ms | kleurwissel, kleine states |
| `--transition-base` | 150ms | standaard: hover, focus, toggle |
| `--transition-mid` | 180ms | tegel-lift, accordeon |
| `--transition-slow` | 250ms | grotere vlakken |
| `--transition-panel` | 300ms, eigen curve | uitschuifpanelen, modals |

**Regels.**
- Nooit een kale duur schrijven. `0.15s`, `.15s` en `150ms` stonden alle drie in
  het bestand voor dezelfde beweging.
- `prefers-reduced-motion` blijft gerespecteerd; nieuwe animaties horen daarin
  meegenomen te worden.

---

## 8. Ruimte

Raster: **stappen van 2px tot 24px, stappen van 4px daarboven.**
De `--space-*`-tokens blijven leidend voor lay-outruimte.

**Regels.**
- Oneven waarden bestaan niet. 3, 5, 7, 9, 11, 13 en 15px zijn gecorrigeerd naar
  de dichtstbijzijnde even trede.
- Boven de 24px alleen viervouden: 26, 30, 34, 46 en 50px zijn gecorrigeerd.
- 6, 10, 14, 18 en 22px zijn geldig — het raster is 2px, geen 4px. Ze naar
  viervouden duwen zou lay-outs verschuiven en is bewust niet gedaan.

---

## 9. Breekpunten

| Grens | Betekenis |
|---|---|
| 480px | kleine telefoon |
| 640px | telefoon |
| 768px | tablet staand |
| 1024px | tablet liggend / kleine laptop |
| 1280px | `--max-width`, inhoudsbreedte |

**Regels.**
- Nieuwe media queries gebruiken uitsluitend deze grenzen. Er staan er nu
  veertien in het bestand (360 / 480 / 520 / 540 / 560 / 600 / 640 / 700 / 720 /
  768 / 900 / 1000 / 1024 / 1025).
- Het bestand is overwegend desktop-first (`max-width`). Mobile-first eilanden
  (`min-width`) zijn toegestaan zolang één selector niet door beide wordt geraakt.
  **Gemeten op 31-07: dat gebeurt nergens.** De veertien grenzen zijn rommelig,
  maar ze botsen niet.
- De bestaande veertien grenzen zijn níét gemigreerd. Dat verschuift lay-outs en
  is geen polijstwerk. Zie §11.

---

## 10. Aanwijzers en aanraking

Een `:hover` die iets **verplaatst of optilt** (`transform`, `box-shadow`) moet
op aanraakschermen uitgezet worden. Op touch blijft zo'n staat na een tik hangen
tot je ergens anders tikt: de tegel blijft opgetild staan.

Het `§TOUCH`-blok onderaan `globals.css` doet dat voor de zeventien families die
liften of schaduwen. **Nieuwe hover-effecten met beweging horen daar bijgezet te
worden.**

Kleur- en randwissels op hover blijven wel staan: die zijn op touch onschuldig en
bevestigen de tik.

---

## 11. Bewust niet gedaan

Deze punten zijn gemeten en overwogen, maar vallen buiten "polijsten".

1. **Dode CSS verwijderen** — 211 klassen zijn aantoonbaar ongebruikt in de
   frontend-broncode (volledige lijst: `docs/dode-css-inventaris-31-07.md`).
   Niet verwijderd omdat niet te verifiëren is of WordPress-content of
   plugin-templates ze gebruiken; dat blijkt pas op een pagina die niemand deze
   week test. Na de soft-launch oppakken, met een ronde langs alle pagina's.
2. **Breekpunten migreren** — verschuift lay-outs, geen polijstwerk.
3. **Klassen die vier keer of vaker opnieuw gedefinieerd worden** (`.hp-main` 8×,
   `.channel-bar` 6×, `.hero-title` 5×) samenvoegen. Vergt per klasse uitzoeken
   welke laag wint; kandidaat voor een eigen ronde.
4. **De twee manieren om een knop te maken** samenvoegen: 67× de `Button`-
   component, 139× een handmatige klasse, en 20 `.btn-*`-varianten in CSS tegen
   8 in de component. Dit is componentwerk, geen CSS-werk.
5. **146 inline stijlen in componenten** (58 buiten de style-guide) opruimen.
6. **Fluid typografie** voor de drie grootste treden.
7. **Knophoogte** 36px (klein 30px) naar 40/44px voor comfortabeler aanraken.
8. **Tracking op caps-labels** samentrekken: zes waarden (0,04 – 0,14em) voor wat
   visueel één stijl is. Kleine ingreep, zichtbaar effect — goede eerste
   kandidaat voor een volgende ronde.

---

## 12. Toetsing

Voor elke levering die `globals.css` raakt:

1. Haakjesbalans gelijk (`{` = `}`).
2. Geen parse-fouten.
3. Selectorinventaris vóór en ná gelijk, op bewuste verwijderingen na.
4. Declaratietelling per eigenschap gelijk, op bewuste toevoegingen na.
5. Geen `var()` die naar een niet-bestaand token wijst.
6. Geen nieuwe waarde buiten de ladders van §2 t/m §9.
