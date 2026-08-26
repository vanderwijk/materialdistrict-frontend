# Twee dingen die niet kunnen wachten — v2

Losse notitie, 25-08-2026. **Vervangt `NU-DOEN-twee-blokkades-25-08.md`; die versie bevatte een
feitelijke fout in punt 1 en moet weg.**

---

## 1 · De kale brandimport van augustus — al teruggedraaid, maar niet afgerond

**Correctie op de vorige versie.** Daar stond dat `terugdraai-merken.php` nooit is uitgevoerd en
dat 287 lege records nog in de database staan. Dat is onjuist. Het script is op **5 augustus 2026**
gedraaid, vóór de live-gang, door Johan.

**Wat er is gebeurd.** In augustus is een import gedraaid die nieuwe brands vrijwel leeg aanmaakte
— geen adressen terwijl het exposantenbestand er 111 gevuld had, geen btw, geen KvK, geen websites.
Ongeveer 193 bestaande brands misten daarbij hun Moneybird-verrijking. Eén persoon ging verloren
doordat een bronbestand geen kopregel had. Het aantal geïmporteerde records klópte, daarom viel het
niet meteen op.

**Wat er is gebeurd na de melding.** Johan heeft de dry-run gedaan en daarna toegepast op post-ID:
**268 kale import-merken verwijderd**. Personen, events en de 108 bijgewerkte merken zijn
onaangeroerd gebleven. Johan corrigeerde onderweg één ding in het script: drafts hebben vaak
`post_date_gmt = 0000-00-00`, waardoor de naam-modus alles als "te oud" zou overslaan; de ID-lijst
is daarom op `post_date` gebouwd.

**Geverifieerd tegen de live API op 25-08-2026.** Van de 287 merknamen in
`terugdraaien-merken-lijst.csv` bestaan er nu nog zes als gepubliceerd merk: Aalborg Portland
Belgium (#54087, 2018), PREFA GmbH (#2909, 2006), Paula Nerlich – Biodesign (#85921, 2020), Random
Works (#87826, 2020), TEKNOS B.V. (#129686, 2025) en Tierrafino B.V. (#48719, 2017). Allemaal
oudere records die terecht zijn blijven staan. In de hele gepubliceerde set zijn twee brands
aangemaakt in augustus 2026, beide compleet gevuld, en vijf brands zonder website, adres én stad.
Van een restant van honderden kale records is geen spoor.

### Wat er wél nog open staat

**a. Twee records zijn onverklaard.** De CSV telt 287 regels, Johan meldt 17 namen die al vóór
4 augustus bestonden, en 268 verwijderd. 287 − 17 = 270, niet 268. Waarschijnlijk dubbele namen of
niet-gevonden regels, maar in een verwijderactie is dat geen detail dat je laat liggen. Te
beantwoorden met de uitdraai (`brand-velden-uitdraai-v2.php`, blok 0).

**b. Eén materiaal is losgeraakt.** Johan meldt dat GUARDYL® aan een verwijderd merk hing. Het komt
niet voor in de 3.246 gepubliceerde materialen, en geen enkel gepubliceerd materiaal mist een
`brand_id` of `brand_name` — dus in de zichtbare set staan geen wezen. Waar GUARDYL® dan wél staat
(concept, of ook verwijderd) is van buitenaf niet te zien.

**c. De herimport is nooit gedaan.** Dat was de hele bedoeling: terugdraaien om daarna compleet
opnieuw te importeren. De 268 merken zijn weg en niet teruggekomen, en de ~193 gemiste
verrijkingen op bestaande merken zijn nooit alsnog aangebracht. Dát is wat er nu open staat — niet
een terugdraaiactie.

### Waarschuwing: dit script niet nog een keer draaien

De versie van `terugdraai-merken.php` die in omloop is, is de versie van vóór Johans correctie
(hij gebruikt nog `post_date_gmt`). Twee eigenschappen maken hergebruik gevaarlijk:

- `$CREATED_AFTER` staat hard op `2026-08-04`.
- Verwijderen gebeurt met `wp_delete_post( $id, true )` — force delete, langs de prullenbak heen,
  definitief.

Zolang de herimport niet heeft gedraaid richt het waarschijnlijk niets aan. **Maar na de herimport
is elk nieuw record aangemaakt ná 4 augustus en staat de naam in die CSV.** Het script draaien na
de herimport verwijdert dan precies wat er net is binnengehaald. Het hoort na gebruik uit omloop,
of het krijgt een batch-ID zoals B48 voorschrijft in plaats van een datumgrens.

**Actie: geen. Er hoeft niets teruggedraaid te worden.** Wat er moet gebeuren is de herimport, en
die loopt langs `importprotocol.md`.

---

## 2 · De statusvelden zijn leeg en blokkeren de member-outreach

Ongewijzigd ten opzichte van v1. Opnieuw gemeten tegen de live API op 25-08-2026; de stand klopt.

| Veld | Wat de spec zegt | Wat er staat |
|---|---|---|
| `material.publication_status` | default `legacy` (batch A, gemarkeerd als *done*) | **leeg op alle 3.246 gepubliceerde materialen** |
| `brand.tier` | `free` / `basic` / `plus` / `partner` | **`free` op alle 2.093 brands** |
| `brand.record_status` | waardenlijst | **leeg op alle 2.093** |

De velden bestaan en zijn geregistreerd. De backfill lijkt nooit gedraaid.

**Wat er daardoor niet kan:**

- Er is geen memberlijst, dus geen gerichte outreach naar betalende merken.
- Het onderscheid tussen betaald, legacy en standalone materiaal bestaat niet in de data.
- De legacy-banner ("your materials expire in X months") kan niet verschijnen.
- De automatische archivering per **30 april 2027** heeft niets om op te draaien.

In de praktijk is de `partner`-vlag nu het enige member-signaal — 130 brands — en die is
onbetrouwbaar: circa 22 partners hebben geen betaalde materialen en 34 brands mét betaalde
materialen missen de vlag.

**Actie: Johan** — dit rolt uit `brand-velden-uitdraai-v2.php` (blok 3 en 4). Blijkt dat de velden
bestaan maar nooit gevuld zijn, dan levert Claude het backfill-script; het oordeel over welk merk
welke tier krijgt ligt bij Jeroen.

**Dit blokkeert de septembercampagne.** Zonder tier- en publicatiestatus is er geen lijst om op te
richten.

---

## 3 · Een gat in de norm dat hierdoor zichtbaar werd

Geen actie voor Johan; een besluit voor Jeroen.

`besluitenregister.md` B37 regel 6 en B48 zeggen allebei: **terugdraaien herstelt veldwaarden en
verwijdert geen records.** De terugdraaiactie van 5 augustus deed precies het tegenovergestelde —
en had gelijk. De schade bestond niet uit verkeerd bijgewerkte velden maar uit records die nooit
hadden mogen ontstaan. Veldwaarden herstellen op zo'n record levert een leeg record op dat er nog
steeds staat.

De norm verbiedt dus wat er in de praktijk terecht is gebeurd, en die uitzondering staat nergens
opgeschreven. Voorstel voor een nieuw genummerd besluit:

> **Terugdraaien kent twee vormen.** Bij een record dat vóór de import al bestond, herstelt
> terugdraaien de vórige veldwaarden en wordt het record niet verwijderd (B37 regel 6, B48). Bij een
> record dat de import zélf heeft aangemaakt, mag terugdraaien het record verwijderen — het bestond
> ervoor niet. De grens loopt langs het batch-ID: een terugdraaiactie raakt uitsluitend records die
> dat batch-ID dragen, nooit een datumgrens of een namenlijst. Verwijderen gaat naar de prullenbak,
> niet met force delete, zodat de handeling zelf terug te draaien is.

De laatste zin is de les uit augustus: er is geen weg terug van een `wp_delete_post( $id, true )`.

---

## Wat hier bewust níét in staat

De documentatieset, het Activity-schema, de vijf importvelden en de route-hernoeming. Die gaan in
één keer naar Johan zodra de importtest is afgerond, zoals afgesproken — één levering in plaats van
drie losse mails.

---

## Status

**v2, 25-08-2026.** Punt 1 volledig herschreven: de bewering dat het terugdraaiscript nooit is
uitgevoerd was onjuist. Aanleiding is de mailwisseling van 5 augustus tussen Jeroen en Johan, plus
verificatie tegen de live API op 25-08-2026. Punt 2 is ongewijzigd en opnieuw gemeten. Punt 3 is
nieuw en volgt uit de vaststelling dat de geldende norm de terugdraaiactie van augustus verbiedt.

Opgesteld door Claude, namens Jeroen.
