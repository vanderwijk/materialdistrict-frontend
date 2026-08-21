# Blok A — verantwoording van de meting

11-08-2026. Hoort bij `md-blok-A-11-08-v1.zip`. Norm:
`docs/materiaal-classificatie-regelboek.md` versie 1.2.

## Hoe er gemeten is

Alle 3.244 gepubliceerde materialen zijn opgehaald via
`https://cms.materialdistrict.com/wp-json/wp/v2/material` (`per_page=100`, pagineren tot
leeg antwoord), met `theme` en `material_category` per record, plus de termenlijsten van
beide taxonomieën. Daarna is per record machinaal getoetst op de vier onmogelijkheden uit
het regelboek: §3.6.1 (mineraal of metallisch type met Bio-based & Living Materials),
§3.6.2 (Timber zonder houtidentiteit), §1.2 (meer dan drie channels) en §4.2 (meer dan twee
uit de duurzaamheidsgroep). Er is voor deze toets geen enkele tekst gelezen; het is een
vergelijking van termen.

De teksten zijn wél gelezen voor de vraag die daarop volgt: is een overtreding een
uiterlijksfout of een inhoudelijk verdedigbaar geval. Die splitsing staat in de twee
besluitbestanden.

De uitkomsten van de nulmeting in de sessiebundel zijn hiermee bevestigd: 3.244 materialen,
1.251 met nul actieve channels, 1.302 met één, 572 met twee, 116 met drie, 3 met vier.
§4.2 wordt nergens overtreden.

## Drie afwijkingen van de bundel

**1. Eenendertig overtredingen, niet negenentwintig.** §3.6a van het regelboek en de bundel
noemen 29. Het verschil zit in §1.2. De bundel telt daar de *actieve* channels; leest men
§1.2 letterlijk — "nul tot drie channels per materiaal" — dan tellen de legacy-channels mee,
en komen `Stitched Wood` (42728) en `Rotterdam Fruitleather` (29386) er ook bij: drie actieve
channels plus legacy `Sustainable`.

Deze twee staan apart in `data/blok-A3-signalering-legacy-v1.csv` en zitten **niet** in het
script. Reden: het weghalen van een legacy-channel raakt het openstaande besluit over de
uitfasering van de legacy-channels en de 62 materialen die er alleen nog op staan. Zodra dat
besluit valt, lossen deze twee zich vanzelf op. Wordt in de tussentijd besloten dat §1.2 wel
degelijk letterlijk gelezen moet worden, dan is de correctie het schrappen van term 80
(`Sustainable`) op deze twee records.

Er is nog een derde record met een legacy-channel in dit blok: `Urine-Glaze` (87834) draagt
naast Bio-based en Circular ook `Sustainable`. Dat record zit in A2 en de legacy-term is
daar onaangeroerd gelaten, om dezelfde reden.

**2. Rodruza Living Bricks is niet het enige featured materiaal.** De bundel meldt dat het op
dit moment het enige materiaal is dat als featured op de homepage staat. Gemeten op de
meta-vlag `_featured` dragen zes materialen die vlag: Rodruza Living Bricks (135827), Qollect
(135819), Dales (135809), Silent Nature Printed Felt (135800), 3D Printed Limestone (134735)
en Omiyama (134880). Hoeveel daarvan de homepage werkelijk toont is een frontend-vraag; de
vlag zelf staat op zes records.

**3. Twee latente kwesties die geen vangregel overtreden.** `Lightweight natural stone`
(51863) en `Ceramic Textile` (29730) dragen `Material Futures` terwijl §4.1 dat channel
uitsluit voor marktproducten. Dat is geen harde onmogelijkheid uit §3.6, dus het valt buiten
blok A. Bij Ceramic Textile is het wel het voorstel geworden om die term te laten vervallen,
omdat daar hoe dan ook een channel af moet.

## De splitsing van de 21 §3.6.1-gevallen

Het criterium is dat van het regelboek zelf (§3.6a): zit de biobased component aantoonbaar
in de samenstelling, of zit hij in de afbeelding.

**Onbetwist (7)** — geen biobased bestanddeel in de tekst, of alleen uiterlijk of merknaam:
Leather look tiles, Animal & Leather Print Tiles, Grass & Leaves, Rodruza Living Bricks,
Lightweight natural stone, Natural Stone Composites, Natural Footprint.

Bij `Grass & Leaves` past een kanttekening. Het regelboek beschrijft het als "een glazen
tegel met grasmotief"; de tekst zegt dat er echt gras of handgemaakte bladeren tussen twee
lagen glas gelamineerd zitten. Het is dus geen motief. De uitkomst verandert daar niet door:
de identiteit is glas en de biobased inlage is decoratief, geen kernpropositie (§4). Het
staat hier omdat de omschrijving in de norm net iets scherper kan.

Bij `Natural Footprint` is het hout een offerlaag: het lasergesneden triplex wordt in het
beton gedrukt en bladert er daarna af. Het zit niet in het eindmateriaal.

**Voorleggen (14)** — biobased component aantoonbaar in de samenstelling. Zie de docx.

Drie daarvan zijn ook kandidaat voor hertypering naar Composites in blok B, omdat de
bestanddelen uit verschillende families komen (§3.2): `Corcrete` (kurk + mineraal), `MyCera`
(klei + zaagsel + mycelium) en `Woodstone` (kalksteen + plantenvezel). `Hemp concrete` is
een typevraag van een andere orde: de tekst noemt hennepvezel, natuurlijke lijm en water, en
geen cement — dan is `Concrete` mogelijk niet het juiste type. `Kromatafor` staat als
Bio-based (excl. Wood) maar is gelooide huid, dus een Leather-kandidaat (§3.3). Al deze
vragen horen in blok B, niet hier.

## Waarom vier records op nul channels uitkomen

`Leather look tiles`, `Animal & Leather Print Tiles`, `Grass & Leaves` en `Pro Clima` houden
na de correctie geen channel over. Volgens §4.3 is dat een geldige uitkomst, mits met reden;
alle vier krijgen `generiek`. Ze komen terug in de gewone channelronde. `Pro Clima` is daar
een kandidaat voor `Energy & Resilience` — de tekst noemt dampregulering en
energieprestatie — maar dat is een toekenning en dus geen blok-A-werk.

## Wat het script wel en niet doet

Het raakt uitsluitend de `theme`-taxonomie van de record-ids in het besluitbestand.
`material_category` wordt nooit aangeraakt, dus een type kan hierlangs niet leeggemaakt
worden (§3.5). Een leeg veld in de kolom `theme_ids_new` wordt geweigerd; nul channels moet
als de letterlijke waarde `NONE` in het bestand staan, zodat het altijd een besluit is en
nooit een lege cel. Wijkt de huidige stand van een record af van `theme_ids_old`, dan wordt
dat record overgeslagen en gemeld — dat betekent dat iemand het na het besluit heeft
aangepast. De terugdraairegel per record wordt weggeschreven vóórdat het record wordt
gewijzigd, zodat een afgebroken run een compleet herstelpad achterlaat.
