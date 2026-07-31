# Regelboek materiaalclassificatie

> **Doel.** Eén norm voor het toekennen van material type en channels aan alle
> materialen op MaterialDistrict. Dit document is de instructie voor de
> geautomatiseerde classificatierun én de maatstaf waaraan de redactie de
> voorstellen toetst. Wijzigt de norm, dan wijzigt dit bestand en draait de run
> opnieuw — niet omgekeerd.
>
> Versie 1.0 · 26-07-2026 · gekalibreerd op 68 handmatig beoordeelde grensgevallen
> (`kalibratieset-68.csv`).

---

## 1. Uitgangspunten

1. **Eén material type per materiaal.** Verplicht. Single-select: toekennen is
   altijd ook weghalen bij het vorige type.
2. **Nul tot drie channels per materiaal.** Meervoudig. Niet verplicht — een
   materiaal zonder thema is een geldige uitkomst.
3. **Maximaal twee channels uit de duurzaamheidsgroep.** Zie §4.2.
4. **Nooit een eigenschap verzinnen.** Technische waarden (brandklasse, hardheid,
   krasvastheid) worden niet afgeleid uit marketingtekst. Zie §5.
5. **Bij twijfel: lage zekerheid meegeven, niet gokken.** De redactie beslist over
   de twijfelgevallen; het model markeert ze.

---

## 2. De tien material types

| Type | Kern |
|---|---|
| (Bio)Plastics | Polymeren, synthetisch of biobased, inclusief biopolymeren |
| Bio-based (excl. Wood) | Plantaardig, dierlijk of microbieel materiaal dat geen hout is |
| Wood | Hout en houtplaatmateriaal |
| Metals | Metalen en metaallegeringen |
| Glass | Glas |
| Ceramics | Gebakken keramiek, baksteen, porselein, geëxpandeerde klei |
| Concrete | Cement- en mineraalgebonden gietmaterialen |
| Natural Stones | Natuursteen in gewonnen vorm |
| Composites | Materialen waarvan de combinatie de identiteit ís — zie §3 |
| Leather | Dierlijke huid en herwonnen leervezel — zie §3.3 |

**Coatings** blijft bestaan als elfde type. Zie §3.4 — dit wijkt af van het
eerdere plan om de categorie als legacy uit te faseren.

---

## 3. Grensregels

De grensregels zijn de kern van dit document. Ze zijn in deze volgorde toe te passen.

### 3.1 De dominantietoets (eerste toets, altijd)

Een materiaal krijgt het type van de **basisstof die zijn identiteit draagt** — de
stof waaronder het wordt verkocht, benoemd en gezocht.

Een bindmiddel, matrix, coating, rug- of kernlaag maakt géén tweede materiaaltype
zolang de basis domineert.

- Uitgefreesd MDF met coating → **Wood**
- Fineer met melamine op plaatkern → **Wood**
- Harsgeïmpregneerd beukenfineer → **Wood**
- Translucent beton met optische vezels → **Concrete**
- Terrazzo (marmeraggregaat in cement) → **Concrete**
- Keramische tegel met leerprint → **Ceramics**
- Kurk met textielrug → **Bio-based (excl. Wood)**
- Aluminium met oppervlakteafwerking → **Metals**

**Uiterlijk verandert nooit het type.** Een tegel die op leer lijkt is keramiek;
een decorpaneel met betonprint op houtbasis is hout.

### 3.2 Composites: alleen bij kruisende families

Composites geldt **alleen** wanneer aan beide voorwaarden is voldaan:

1. Geen enkele basisstof domineert de identiteit (§3.1 geeft geen uitsluitsel), **én**
2. de bestanddelen komen uit **verschillende materiaalfamilies**.

De families: polymeer · mineraal · metaal · glas · biobased · hout.

- Glasvezelversterkte kunststof (glas + polymeer) → **Composites**
- WPC-vlonderplank (hout + polymeer) → **Composites**
- Minerale vulstof in polyesterhars (mineraal + polymeer) → **Composites**
- Carbon-, glas- en basaltgarens → **Composites**
- PP-honingraat met glasgeweven huid → **Composites**
- 80% mineraal met 20% polymeer → **Composites**

**Binnen één familie geen Composites.** Twee minerale bestanddelen met een
minerale binder blijven Concrete; natuurvezel met biobased hars blijft biobased.

- Biocomposiet van natuurvezel en biobased hars → **Bio-based (excl. Wood)**
- Zetmeelbiopolymeer versterkt met miscanthus → **Bio-based (excl. Wood)**
- Hennep- en vlasfineer met popcornkern → **Bio-based (excl. Wood)**
- Cellulosevezel uit oud papier → **Bio-based (excl. Wood)**

Deze regel houdt de biocomposieten — het handelsmerk van het platform — in
Bio-based (excl. Wood), en reserveert Composites voor de echte hybriden.

*Reden voor de strengheid:* een letterlijke lezing van "bestaat uit meerdere
materialen" plaatst 1.072 van de 3.245 gepubliceerde materialen in Composites en
trekt Wood, Concrete en de biobased categorie leeg. Omdat het type single-select is, verdwijnen
die materialen dan uit de filters waar de doelgroep ze zoekt.

### 3.2b Hout is ook biobased — maar hoort in Wood

Hout voldoet aan elke definitie van biobased. Toch gaat het altijd naar **Wood**;
de uitsluiting staat niet voor niets in de termnaam. Dit is de meest voorkomende
fout bij klant-uploads, omdat de redenering "mijn houtvezelplaat is biobased"
correct is en toch het verkeerde vakje aanvinkt. Twijfelt de tekst tussen hout en
biobased, dan wint Wood.

### 3.3 Leather: alleen echte huid en herwonnen leervezel

- Dierlijke huid, inclusief vis en niet-conventionele huiden → **Leather**
- Herwonnen leervezel met binder, mits leer de identiteit draagt → **Leather**
- Spray- of vloeibare toepassing van leerreststroom → **Leather**

**Leeralternatieven krijgen hun eigen basisstof**, ongeacht hoe ze aanvoelen of
worden gepositioneerd:

- Bacteriële cellulose met leergevoel → **Bio-based (excl. Wood)**
- Kurkleer → **Bio-based (excl. Wood)**
- Zonnebloemschil met agar → **Bio-based (excl. Wood)**
- Urethaanverf met suede-gevoel → **Coatings**

### 3.4 Coatings blijft bestaan

Uit de kalibratie: **11 van de 16 beoordeelde coatings zijn werkelijk een coating**
en hebben geen huis in de tien substantietypes. Verf, glazuur, inkt, pigment,
poedercoating en opgebrachte laagsystemen zijn een productklasse, geen stof.
Ze wegzetten onder (Bio)Plastics omdat de bindmiddelen polymeren zijn, maakt de
categorie (Bio)Plastics onbruikbaar voor wie plaatmateriaal zoekt.

**Coatings houden:** verf, lak, glazuur, inkt, pigment, poedercoating,
spray-systemen, opgebrachte functionele lagen.

**Uit Coatings weghalen:** materialen die eigenlijk een plaat, vel, weefsel of
gietmateriaal zijn en per ongeluk hier stonden.

- Wandbekleding van glasvezel met biobased finish → **Composites**
- Gietpaneel van acryl-gemodificeerd gips → **Composites**
- Spray-upholstery uit leerreststroom → **Leather**
- Akoestische celluloseplaat → **Bio-based (excl. Wood)**

Verwachting: ruwweg 70% van de 229 gepubliceerde coatings blijft staan.

### 3.5 Restgevallen

Is er te weinig informatie om de basisstof te bepalen, dan blijft het huidige type
staan met zekerheid **laag** en de reden *"substantie niet te bepalen uit de tekst"*.
Niet gokken, en niet leegmaken.

---

## 4. De elf channels

Channels zijn **redactionele verhaallijnen**, geen volledigheidseis. Een channel
toekennen betekent: dit materiaal hoort in dat verhaal thuis, niet dat het er
technisch aan raakt.

| Channel | Toekennen wanneer |
|---|---|
| Bio-based & Living Materials | Biobased grondstof of levend/gegroeid materiaal is de kernpropositie |
| Circular | Gerecycled, reststroom, hergebruik, retourneerbaar, biologisch afbreekbaar als expliciete claim |
| Biophilic & Human-Centred | Welzijn, natuurbeleving, tactiliteit of gezondheid in de binnenruimte |
| Acoustic | Geluidsabsorptie of -isolatie is een genoemde functie |
| Timber | Constructief hout en houtbouw |
| Smart & Responsive | Reageert op licht, warmte, elektriciteit, vocht of aanraking |
| New Making | Productiewijze is de innovatie: printen, robotica, nieuwe fabricage |
| Material Futures | Experimenteel, onderzoeksfase, nog geen marktproduct |
| Net Zero & Carbon | CO₂-reductie, -opslag of -neutraliteit met een concrete claim |
| Energy & Resilience | Energieprestatie, isolatie, klimaatbestendigheid |
| Regenerative | Herstelt actief een systeem: bodem, biodiversiteit, ecosysteem |

### 4.1 Uitsluitcriteria

- **Niet toekennen op basis van een terloopse vermelding.** "Duurzaam geproduceerd"
  zonder onderbouwing is geen Circular.
- **Niet toekennen op toepassing.** Een materiaal dat *in* een gezondheidszorgproject
  is gebruikt, is daarmee niet Biophilic.
- **Material Futures sluit marktproducten uit.** Is het te koop, dan is het geen future.
- **Regenerative is de strengste.** Minder CO₂ uitstoten is Net Zero; een ecosysteem
  actief herstellen is Regenerative.

### 4.2 De duurzaamheidsgroep — maximaal twee

**Bio-based & Living Materials · Circular · Net Zero & Carbon · Regenerative.**

Uit deze vier maximaal twee per materiaal. Kiezen op basis van de sterkste,
best onderbouwde claim. De vrijgekomen plek gaat naar het functionele of
typologische channel (Acoustic, Smart & Responsive, Energy & Resilience, New Making,
Timber, Biophilic), zodat het materiaal vindbaar blijft voor wie op functie zoekt.

Zonder deze regel vult elk biobased materiaal zijn drie plekken met duurzaamheid en
verdwijnt het uit het channel waar de doelgroep het zoekt.

### 4.3 Nul channels

Een geldige uitkomst. De run levert deze materialen apart op, met een reden uit
vier categorieën:

- **generiek** — goed materiaal, geen thema; vindbaar via de filters
- **te weinig info** — excerpt te dun; redactionele aanvulling nodig
- **kandidaat nieuw channel** — met voorgestelde noemer
- **hoort er niet meer** — verlopen merk, niet meer verkrijgbaar; input voor legacy

Nieuwe channels worden **alleen** voorgesteld bij een cluster van tientallen
materialen onder dezelfde noemer. Nooit bij losse gevallen — de lijst van elf blijft.

---

## 5. Afgeleide eigenschappen

**Wel voorstellen**, uitsluitend wanneer de tekst het expliciet stelt, gemarkeerd
als afgeleid en ter bevestiging door de redactie:

`biobased_content` · `recycled_content` · `upcycled_content` · `renewable` ·
`reduces_waste` · `climate_neutral`

Deze velden zijn nu vrijwel leeg (1 van de 3.245) terwijl vier channels erop leunen;
dit is hetzelfde gat waarop de compare-pagina wacht.

**Niet voorstellen.** Brandklasse, hardheid, krasvastheid, temperatuurbereik,
chemische weerstand, akoestische waarden. Dat zijn feitelijke productclaims met
aansprakelijkheid; die komen van de leverancier of het datasheet.

---

## 6. Output per materiaal

| Veld | Inhoud |
|---|---|
| `type_voorstel` | Eén van de elf types |
| `type_zekerheid` | hoog / midden / laag |
| `channels_voorstel` | 0–3 channels, pipe-gescheiden |
| `channels_zekerheid` | hoog / midden / laag |
| `geen_channel_reden` | Eén van de vier categorieën uit §4.3, indien leeg |
| `eigenschappen_voorstel` | Alleen §5-velden, met de letterlijke tekstgrond |
| `motivering` | Eén regel, welke regel is toegepast |

Sortering van de reviewlijst: **laagste zekerheid bovenaan**. De redactie leest de
twijfelgevallen, niet de 3.245.
