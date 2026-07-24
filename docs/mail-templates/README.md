# Mail-templates — MaterialDistrict

Productieklare verzend-HTML voor de drie maaltypen, in de huisstijl van de nieuwe site
(tokens uit `src/styles/globals.css`). Staat **bewust los van `globals.css`**: mailclients
ondersteunen geen externe stylesheets, dus alles is table-gebaseerd met inline styles.

| Bestand | Maaltype | Wie stelt samen |
|---|---|---|
| `your-update.html` | Your update — persoonlijke digest | engine, volautomatisch |
| `theme-edition.html` | Thema-editie — tien materialen rond één thema | redactie vult de velden |
| `campaign.html` | Campagne / beursuitnodiging | redactie vult de velden |

---

## Placeholder-syntax

Tool-agnostisch, niet gebonden aan een template-engine. Drie constructies:

**1. Variabele** — `{{name}}` of `{{object.field}}`. Ontbrekende waarde → lege string.

**2. Herhaalblok** — alles tussen `<!-- BEGIN x -->` en `<!-- END x -->`, één keer per item
in lijst `x`. Binnen het blok verwijst de enkelvoudsvorm naar het huidige item
(`<!-- BEGIN facts -->` → `{{fact.label}}`). Nesten mag.

**3. Conditioneel blok** — alles tussen `<!-- IF x -->` en `<!-- ENDIF -->` vervalt als `x`
leeg, `null`, `0` of `false` is.

Markers staan op eigen regels en overleven minificatie niet — minify ná het renderen.

---

## Kaartrijen

De kaarten staan twee naast elkaar in een tabel. De engine levert ze **voorgegroepeerd
per rij** aan: `rows[].left` en `rows[].right`, waarbij `right` mag ontbreken bij een
oneven aantal. Dat scheelt reken-logica in het sjabloon.

Per kaart:

| veld | inhoud |
|---|---|
| `url`, `image_url`, `image_alt`, `title` | altijd |
| `kicker` / `brand_name` | kleine grijze kapitalen boven de titel |
| `pills[]` | `{label, bg, fg}` — eigenschapspills, zelfde als op de site |
| `gated` | true → CTA wordt "Insider only" |

**Merk gelijk aan titel?** Laat `kicker` leeg, anders staat dezelfde naam er twee keer
(bijv. materiaal "Lignify" van merk "Lignify").

---

## Kleuren

Overgenomen uit `globals.css`. Contenttype-kleuren komen mee als `{{group.color}}` en
`{{lead.type_pale}}` / `{{lead.type_dark}}`, zodat het sjabloon niets hoeft te weten van
types.

| rol | waarde |
|---|---|
| achtergrond mail | `#fbfaf7` |
| kaart | `#ffffff`, rand `#eae9e3`, radius 10px |
| tekst / gedempt | `#0d1f2d` / `#5a6a7a` |
| navy (links, knoppen) | `#183E90` |
| groen (conversie) | `#2E8C32` |
| insider | `#007890`, zone `#ddf2f5`, rand `#c8e6ec` |
| voettekst | `#eeeeea` |

Groen is gereserveerd voor conversie-acties: "Follow the Transition", "List your
materials", en de primaire knop in campagnemail. Content-knoppen zijn navy.

---

## Verplicht per verzending

- `{{unsubscribe_url}}` — één klik, werkt zonder inloggen, per ontvanger uniek en getekend.
- `{{web_view_url}}` — publieke render van dezelfde editie.
- `{{company_name}}` + adresregels — fysiek postadres, wettelijk verplicht.
- SMTP-headers `List-Unsubscribe` en `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- Afzender: `MaterialDistrict <news@materialdistrict.com>`, reply-to `info@materialdistrict.com`.

## Escaping

Alles HTML-escapen (`& < > " '`). Alleen `{{intro_text}}` en `{{section.body}}` mogen een
witte lijst aan tags bevatten (`<strong> <em> <br> <a>`); de rest is platte tekst.

## Beeld

Breedtes staan hard: hero 600, brede kaart 566, kaart in rij 274, sectie 552. Lever
afbeeldingen op **2× die breedte** voor retina. Altijd `alt` vullen. Geen
achtergrondafbeeldingen — Outlook rendert die niet betrouwbaar.

## Bekende afwijkingen t.o.v. de site

- **Lettertype:** Schibsted Grotesk laadt niet in Gmail en Outlook; die vallen terug op
  Arial. Kleur, ritme en opmaak komen wel overeen.
- **Afgeronde hoeken** worden vierkant in Outlook op Windows.
- **Eigenschapspills** staan op de site over de foto, in de mail eronder in het witte vlak.
  Tekst over een afbeelding is in Outlook niet betrouwbaar te positioneren.
- **Bookmark- en vergelijkknoppen** ontbreken; die doen niets in een mail.

## Testen vóór livegang

Render één editie per sjabloon en controleer in minimaal: Gmail web, Gmail Android,
Apple Mail iOS, Outlook 365 Windows, Outlook.com.
