# Regelboek materiaalclassificatie

> **Doel.** Eén norm voor het toekennen van material type en channels aan alle materialen op
> MaterialDistrict. Dit document is de maatstaf waaraan elk classificatievoorstel wordt
> getoetst — ongeacht of dat voorstel machinaal of met de hand tot stand komt. Wijzigt de
> norm, dan wijzigt dit bestand en wordt de ronde opnieuw gedaan — niet omgekeerd.
>
> Versie 1.9 · 19-08-2026 · legt de telwijze van de audit vast (§3.6c) en hermeet de vangregels
> ná de write-back van ronde 1 (§3.6a-ter). Geen grensregel gewijzigd.
> Versie 1.8 · 19-08-2026 · verwerkt de zes patroonbesluiten van ronde 1 en scherpt §3.1 aan op
> het verschil tussen kern en huid. Twee tekstwijzigingen: het WPC-voorbeeld vervalt uit §3.2 en
> Natural Stones is niet langer beperkt tot natuursteen in gewonnen vorm. Zie §0.
> Versie 1.7 · 19-08-2026 · zelfde besluiten, maar deelde de kartonnen honingraatpanelen bij
> Composites in. **Nooit in de repository geland** — gecorrigeerd in 1.8.
> Versie 1.6 · 19-08-2026 · de eerste versie waarin de wijzigingen van 1.5 daadwerkelijk in de
> repository landen; verwerkt daarnaast de meting van 19-08-2026. Geen grensregel gewijzigd.
> Versie 1.5 · 19-08-2026 · wijzigde §3.2, de eerste grensregelwijziging sinds 1.0, en hief de
> bevriezing van Composites en Leather op. **Nooit in de repository geland** — de inhoud staat
> in 1.6.
> Versie 1.4 · 18-08-2026 · verwerkte Sigrids antwoorden van 13-08-2026 en herstelde versie 1.3,
> die wel is opgesteld maar nooit in de repository is geland.
> Versie 1.3 · 11-08-2026 · sloot de vijf openstaande besluiten uit §7 en §3.6a.
> Versie 1.2 · 11-08-2026 · koppelde de norm los van de methode.
> Versie 1.1 · 31-07-2026 · gekalibreerd op 68 handmatig beoordeelde grensgevallen
> (`kalibratieset-68.csv`); voegde §3.6 toe met de vangregels na de eerste, mislukte
> classificatieronde.

---

## 0. Wat versie 1.9 verandert · *19-08-2026*

Geen enkele grensregel is aangeraakt. Twee toevoegingen, allebei meetkundig:

1. **§3.6c legt de telwijze van de audit vast.** Het audit-commando en de meting tegen de API
   kwamen structureel op andere getallen uit — 10 vóór en 5 ná tegenover 31 en 19. Dat bleek
   geen datafout maar twee definities: welke termen tellen als channel, en is §3.6.1 een
   overtreding of een voorlegging. Beide vragen worden hier beantwoord, zodat het commando
   erop kan worden afgesteld en er voortaan één getal is.
2. **§3.6a-ter hermeet de vangregels ná de write-back van ronde 1.** De stand uit §3.6a-bis is
   achterhaald door die ronde: *Corcrete* is onder §3.2c naar Bio-based (excl. Wood) verhuisd
   en is daarmee geen mineraal type meer, dus geen §3.6.1-geval. De lijst in §3.6b telt nog
   dertien namen in plaats van veertien.

## 0-oud. Wat versie 1.8 verandert · *besloten 19-08-2026 door Jeroen*

Ronde 1 (Leather en Composites) leverde zes patroonbesluiten op. Vier daarvan bevestigen
bestaande regels; twee vragen een tekstwijziging, en die staan hieronder.

1. **Het WPC-voorbeeld vervalt uit §3.2.** Sinds 1.5 gaat §3.2c voor, en die noemt houtvezelplaat
   met synthetische hars uitdrukkelijk Wood. De regel "WPC-vlonderplank → Composites" bleef bij het
   schrijven van 1.5 staan en sprak §3.2c tegen. Draagt de vezel de propositie, dan wint het
   vezeltype; draagt de matrix die, dan blijft het Composites (zie bamboe, §3.7).
2. **Natural Stones is niet langer beperkt tot natuursteen in gewonnen vorm.** Zie §2. Silestone
   (>90% kwarts) en CaesarStone (95% kwarts, 5% polyester) hoorden nergens: §3.2 geldt alleen
   wanneer géén basisstof domineert, en bij die aandelen domineert het mineraal, dus §3.1 geeft al
   uitsluitsel. De oude formulering sloot ze desondanks uit van het enige type dat past. De
   redactie plaatste ze op 13-08 al bij Natural Stones; dat blijkt juist.

3. **§3.1 zegt nu expliciet dat de kern telt en de huid niet.** Zie de toevoeging onderaan §3.1.
   Aanleiding: de kartonnen honingraatpanelen (YST, YST White Clinic, Ecoben) waren in 1.7
   ingedeeld bij Composites, op de redenering dat de biobased kern de verkooppropositie niet
   droeg — die is doorschijnendheid en gewicht. Dat is de verkeerde vraag. §3.1 vraagt naar de
   basisstof die de identiteit draagt, en zegt er zelf bij dat een kernlaag geen tweede type
   maakt. Bij een paneel met een kartonnen kern tussen twee dunne polyestervellen is het karton
   het lichaam. Karton is papier, en §3.2 wijst cellulosevezel uit oud papier al aan Bio-based
   toe. De drie records gaan naar **Bio-based (excl. Wood)**.

De overige drie patronen — aluminium composietpanelen blijven Metals, glasvezelversterkt beton
blijft Concrete, en steenfineer op een drager blijft bij de steen — volgen uit §3.1, §3.2c en
§3.9 zonder dat er iets wijzigt.

## 0-oud. Wat de versies 1.6 en 1.5 veranderen

**Versie 1.5 is opgesteld op 19-08-2026 maar nooit in `docs/` beland** — hij bleef in een
sessiebundel hangen. Dat is dezelfde fout als bij 1.3, en het is de tweede keer. De repository
droeg tot dit bestand nog 1.4, die Composites en Leather bevroren houdt en §3.2c niet kent.
Versie 1.6 laat die wijzigingen alsnog landen; de tekst van 1.5 is ongewijzigd overgenomen.

**Wat 1.6 zelf toevoegt zijn uitsluitend gemeten standen, geen norm.** Op 19-08-2026 is tegen
de live database geteld over alle 3.244 gepubliceerde materialen. Drie plekken droegen nog
cijfers van 11-08 en zijn bijgewerkt: §2 (typeverdeling), §4 (het bestaan van de term Healthy &
Non-Toxic) en §4.3 (de stand van de nul-channelmaterialen). Geen enkele grensregel is
aangeraakt. Wie wil weten wat er inhoudelijk is besloten, leest hieronder verder.

**Wat 1.5 veranderde. Let op: dat was de eerste versie die een grensregel wijzigt.** Versies 1.1 tot en met 1.4
scherpten aan, maten na en legden besluiten vast, maar lieten §3.1 tot en met §3.4 inhoudelijk
ongemoeid. Versie 1.5 verandert §3.2 wél. Wie op een oudere lezing van de Composites-drempel
heeft gewerkt, moet dat werk hertoetsen.

1. **§3.2 krijgt een voorrangsregel voor biobased en hout.** Zie §3.2c. Kruist een materiaal
   families waarvan er één biobased of hout is, en draagt die component de propositie, dan
   wint dat type en niet Composites.
2. **Composites en Leather zijn niet langer bevroren.** Beide blijven bestaan. Zie §3.9.
3. **Een fout in §3.9 van versie 1.4 is gecorrigeerd.** Die versie beweerde dat Timbercrete en
   hennepkalk onder §3.2 blijven staan omdat het om één materiaalfamilie gaat. Dat is onjuist:
   Timbercrete is hout plus cement en hennepkalk is hennep plus kalk, dus beide kruisen wel
   degelijk twee families. De redactie had op dit punt gelijk en het regelboek niet. §3.2c is
   de reparatie.
4. **Alle eerdere Composites-voorstellen vervallen.** Het voorstel van 13-08 om 283 records te
   verplaatsen steunde op de oude drempel en wordt niet uitgevoerd. Er wordt opnieuw gemeten.

## 0-oud. Wat versie 1.4 veranderde

**Eerst een waarschuwing over de versiegeschiedenis.** Versie 1.3 is op 11-08-2026 opgesteld
en de vijf besluiten daarin zijn door Jeroen genomen, maar het bestand is nooit in `docs/`
terechtgekomen — het bleef in een sessielevering hangen. De repository droeg tot 18-08 nog
versie 1.1. Daardoor is er ruim een week gewerkt met een normdocument dat vier besluiten als
"open" beschreef die allang genomen waren. Versie 1.4 herstelt dat: **§0a hieronder is de
inhoud van 1.3, ongewijzigd overgenomen.** Wie wil weten wat er sinds 1.1 is besloten, leest
§0a en §0b samen.

Wat 1.4 zelf toevoegt, op grond van Sigrids antwoorden van 13-08-2026:

1. **Een twaalfde channel: Healthy & Non-Toxic.** Zie §4 en §4.4.
2. **Biophilic & Human-Centred is scherper afgebakend.** Zie §4.4.
3. **Energy & Resilience wordt daadwerkelijk gebruikt.** Zie §4.
4. **Composites en Leather staan ter discussie.** Zie §3.9 — dit is het enige punt waarop
   dit regelboek en de redactie het oneens zijn, en het is niet door Claude op te lossen.
5. **Drie kandidaat-channels zijn geagendeerd, niet toegekend.** Zie §4.5.
6. **De vangregels zijn hermeten op 19-08-2026.** Zie §3.6a-bis: onder de norm van 1.3 resteren
   nul overtredingen op §3.6.1 en §3.6.2. Het audit-commando telt te laag en is niet
   betrouwbaar als controlepoort.

Nog open na 1.4: de status van Composites en Leather (§3.9), de drie kandidaat-channels
(§4.5), en de vraag of Ceramics wordt uitgebreid naar ongebakken klei (§3.10).

---

## 0a. Wat versie 1.3 veranderde · *besloten 11-08-2026 door Jeroen*

Versie 1.3 sloot de besluiten die versie 1.2 bewust open liet. Geen van de bestaande
grensregels verviel; er kwam één uitzondering bij en vier categorieën werden toegewezen.

1. **Bio-minerale hybriden — §3.6.1 krijgt een uitzondering.** Zie §3.6b.
2. **Pleisters, stucwerk en microcement horen bij Coatings.** Zie §3.4.
3. **Lijmen horen bij Coatings.** Zie §3.4.
4. **Bamboe gaat naar Wood.** Zie §3.7.
5. **Proces- en dienstrecords zijn geen materiaal.** Zie §3.8.

Daarnaast is de methodekeuze uit §7 beslist: er wordt gelezen, niet geteld, en het lezen
gebeurt door Claude. Zie §7.

---

## 0b. Wat de redactie op 13-08-2026 heeft besloten

Sigrid heeft dertien voorstellen beantwoord. Vijf zijn overgenomen, vier afgewezen, vier
uitgesteld. De afwijzingen zijn hier net zo belangrijk als de goedkeuringen: een afgewezen
voorstel is geen mislukking maar een genomen besluit, en het hoort vastgelegd zodat een
volgende ronde het niet opnieuw voorstelt.

**Overgenomen:**

- Biophilic & Human-Centred wordt losgekoppeld bij 617 materialen (§4.4).
- Healthy & Non-Toxic komt erbij als twaalfde channel, 176 materialen (§4.4).
- Bio-based & Living Materials wordt toegekend aan 231 materialen waar het ontbrak.
- Energy & Resilience wordt toegekend aan 200 materialen met een isolatie- of
  energieclaim.
- Glazuren, pleisters, stucwerk, microcement en lijmen gaan naar Coatings — dit bevestigt
  §3.4 zoals vastgelegd in 1.3.

**Afgewezen:**

- **Hout blijft aan Bio-based & Living Materials hangen.** Het voorstel om 73
  houtmaterialen los te koppelen is verworpen. De redactionele redenering: hout ís
  biobased, en dat wegdefiniëren maakt het channel niet zuiverder maar onvolledig. Let op
  de spanning met §3.2b, die voor het **type** precies de omgekeerde keuze maakt. Dat is
  geen tegenspraak — §3.2b gaat over het type, dit over het channel — maar het vraagt bij
  de uitvoering aandacht.
- **Smart & Responsive blijft ongewijzigd.** Het voorstel om 85 materialen los te koppelen
  is verworpen: als schakelbaar privacyglas eronder valt, valt schakelbaar licht er ook
  onder, en er is geen andere passende categorie.
- **Composites en Leather worden betwist.** Zie §3.9.

**Uitgesteld:** de vijftien materialen die door het uitfaseren van Translucency hun enige
channel verliezen; Ornilux (zie §4.5); de elf records die geen materiaal zijn (§3.8); en de
dubbele Rodruza-invoer, waar de neiging is samen te voegen met behoud van *Ceramic Facing
Bricks* omdat daar samples van zijn.

**Schrijfwijze.** De redactie gebruikt **biobased**, niet "bio-based". Dat is de norm voor
artikelen en hoort ook op de site consequent te worden doorgevoerd. Dit regelboek is daar
zelf niet consequent in geweest; bij de eerstvolgende naamswijziging van de channels en
types wordt het meegenomen.

---

## 1. Uitgangspunten

1. **Eén material type per materiaal.** Verplicht. Single-select: toekennen is altijd ook
   weghalen bij het vorige type.
2. **Nul tot drie channels per materiaal.** Meervoudig. Niet verplicht — een materiaal
   zonder thema is een geldige uitkomst.
3. **Maximaal twee channels uit de duurzaamheidsgroep.** Zie §4.2.
4. **Nooit een eigenschap verzinnen.** Technische waarden (brandklasse, hardheid,
   krasvastheid) worden niet afgeleid uit marketingtekst. Zie §5.
5. **Bij twijfel: lage zekerheid meegeven, niet gokken.** De redactie beslist over de
   twijfelgevallen; het voorstel markeert ze.

---

## 2. De elf material types

| Type | Kern | Codeprefix |
|---|---|---|
| (Bio)Plastics | Polymeren, synthetisch of biobased, inclusief biopolymeren | PLA |
| Bio-based (excl. Wood) | Plantaardig, dierlijk of microbieel materiaal dat geen hout is | ONA |
| Wood | Hout en houtplaatmateriaal | WOO |
| Metals | Metalen en metaallegeringen | MET |
| Glass | Glas | GLA |
| Ceramics | Gebakken keramiek, baksteen, porselein, geëxpandeerde klei | CER |
| Concrete | Cement- en mineraalgebonden gietmaterialen | CON |
| Natural Stones | Natuursteen, gewonnen of gereconstitueerd — zie §3.11 | NST |
| Composites | Materialen waarvan de combinatie de identiteit ís — zie §3.2 en §3.9 | COM |
| Leather | Dierlijke huid en herwonnen leervezel — zie §3.3 en §3.9 | LEA |
| Coatings | Verf, lak, glazuur, inkt, pigment, opgebrachte laagsystemen — zie §3.4 | COA |

Coatings blijft bestaan. Dat wijkt af van het eerdere plan om de categorie als legacy uit te
faseren; de onderbouwing staat in §3.4.

De prefixes staan ook als term meta `_material_code_prefix` op `material_category`
(31-07-2026). Composites en Leather hadden nog geen materialen en dus nog geen prefix in de
bestaande codes; **COM** en **LEA** zijn toen vastgelegd.

**Stand op 19-08-2026, hermeten.** Van de 3.244 gepubliceerde materialen dragen er 3.240
precies één type, 4 dragen er geen, en geen enkel materiaal draagt er meer dan één. De
verdeling is sinds 11-08 ongewijzigd. Composites en Leather staan allebei nog op nul, wat betekent dat de records die daarheen zouden horen nu elders
geparkeerd staan: (Bio)Plastics (913) en Bio-based excl. Wood (900) zijn samen 56% van het
bestand.

### 2a. Materiaalcodes en sample-labels · *besloten 19-08-2026*

**Een typewijziging verandert de materiaalcode niet.** `_material_code` blijft bij een
herclassificatie ongewijzigd staan. Fysieke samples in het archief hoeven daardoor niet
opnieuw gelabeld te worden — dat is uitdrukkelijk besloten en weegt niet mee bij de afweging
of een typewijziging de moeite waard is.

Gemeten op 19-08-2026, over alle 3.244 materialen:

- **De code komt niet voor in de URL.** Permalinks zijn opgebouwd uit de titel-slug; bij één
  record komt de code toevallig in de slug voor. Een QR-code op een label die naar de
  materiaalpagina wijst blijft dus werken, ongeacht type of code.
- **De prefix komt nu bij 3.237 van de 3.244 records overeen met het type**; zeven records
  wijken al af (onder meer *Botticino Classico marble* met NST-code bij Bio-based, en *Mother
  of pearl mosaic tiles* met ONA-code bij Natural Stones).

**Gevolg dat expliciet aanvaard wordt.** Na een herclassificatieronde zal de prefix bij een
paar honderd records niet meer met het type overeenkomen. De code wordt daarmee een
identificatienummer en geen typeaanduiding meer. Nieuwe materialen krijgen wél de prefix van
hun type, inclusief COM en LEA. Dat is een bewuste asymmetrie: de historische code identificeert
een sample, het type beschrijft het materiaal, en die twee hoeven na acht jaar archief niet
meer één op één te lopen.

**Voorwaarde bij de uitvoering.** Het apply-script voor typewijzigingen raakt uitsluitend
`material_category`. `_material_code` wordt niet herschreven en er mag geen hook meelopen die
de code opnieuw afleidt uit het type. Dit moet worden bevestigd voordat de eerste
typewijziging live gaat — zie §8.

---

---

## 3. Grensregels

De grensregels zijn de kern van dit document. Ze zijn in deze volgorde toe te passen.

### 3.1 De dominantietoets (eerste toets, altijd)

Een materiaal krijgt het type van de **basisstof die zijn identiteit draagt** — de stof
waaronder het wordt verkocht, benoemd en gezocht.

Een bindmiddel, matrix, coating, rug- of kernlaag maakt géén tweede materiaaltype zolang de
basis domineert.

- Uitgefreesd MDF met coating → **Wood**
- Fineer met melamine op plaatkern → **Wood**
- Harsgeïmpregneerd beukenfineer → **Wood**
- Translucent beton met optische vezels → **Concrete**
- Terrazzo (marmeraggregaat in cement) → **Concrete**
- Keramische tegel met leerprint → **Ceramics**
- Kurk met textielrug → **Bio-based (excl. Wood)**
- Aluminium met oppervlakteafwerking → **Metals**

**Uiterlijk verandert nooit het type.** Een tegel die op leer lijkt is keramiek; een
decorpaneel met betonprint op houtbasis is hout.

**Bij een sandwichpaneel telt de kern, niet de huid** · *nieuw in 1.8*. Twee dunne vellen om een
dikke kern zijn de rug- en deklaag uit de eerste alinea; de kern is het lichaam en bepaalt het
type. Wat het paneel verkoopt — doorschijnendheid, gewicht, stijfheid — is geen argument: §3.1
vraagt naar de basisstof, niet naar de propositie. Die vraag stelt §3.2c pas, en alleen wanneer
géén basisstof domineert.

- Kartonnen honingraat tussen twee polyestervellen → **Bio-based (excl. Wood)**
- Polyester kern tussen polyesterhuiden → **(Bio)Plastics** (één familie, §3.2 komt er niet aan te pas)
- Kern van cellulose én glasvezel én polyester → **Composites** (drie families, geen dominantie)

### 3.2 Composites: alleen bij kruisende families

> **Gewijzigd op 19-08-2026: lees §3.2c, die op deze regel voorgaat.**

Composites geldt **alleen** wanneer aan beide voorwaarden is voldaan:

1. Geen enkele basisstof domineert de identiteit (§3.1 geeft geen uitsluitsel), **én**
2. de bestanddelen komen uit **verschillende materiaalfamilies**.

De families: polymeer · mineraal · metaal · glas · biobased · hout.

- Glasvezelversterkte kunststof (glas + polymeer) → **Composites**
- Minerale vulstof in polyesterhars (mineraal + polymeer) → **Composites**
- Carbon-, glas- en basaltgarens → **Composites**
- PP-honingraat met glasgeweven huid → **Composites**
- 80% mineraal met 20% polymeer → **Composites**

**Binnen één familie geen Composites.** Twee minerale bestanddelen met een minerale binder
blijven Concrete; natuurvezel met biobased hars blijft biobased.

- Biocomposiet van natuurvezel en biobased hars → **Bio-based (excl. Wood)**
- Zetmeelbiopolymeer versterkt met miscanthus → **Bio-based (excl. Wood)**
- Hennep- en vlasfineer met popcornkern → **Bio-based (excl. Wood)**
- Cellulosevezel uit oud papier → **Bio-based (excl. Wood)**

Deze regel houdt de biocomposieten — het handelsmerk van het platform — in Bio-based (excl.
Wood), en reserveert Composites voor de echte hybriden.

*Reden voor de strengheid:* een letterlijke lezing van "bestaat uit meerdere materialen"
plaatste bij de meting van 31-07-2026 1.072 van de 3.245 gepubliceerde materialen in
Composites en trok Wood, Concrete en de biobased categorie leeg. Omdat het type single-select
is, verdwijnen die materialen dan uit de filters waar de doelgroep ze zoekt.

### 3.2b Hout is ook biobased — maar hoort in Wood

Hout voldoet aan elke definitie van biobased. Toch gaat het altijd naar **Wood**; de
uitsluiting staat niet voor niets in de termnaam. Dit is de meest voorkomende fout bij
klant-uploads, omdat de redenering "mijn houtvezelplaat is biobased" correct is en toch het
verkeerde vakje aanvinkt. Twijfelt de tekst tussen hout en biobased, dan wint Wood.

**Let op:** deze regel gaat uitsluitend over het **type**. Voor het **channel** heeft de
redactie op 13-08-2026 de omgekeerde keuze gemaakt: houtmaterialen mogen Bio-based & Living
Materials dragen. Zie §0b.

### 3.2c Biobased en hout gaan vóór Composites · *nieuw in 1.5*

Deze regel gaat vóór op §3.2. **Kruist een materiaal twee of meer families, en is één daarvan
biobased of hout, en draagt die component de propositie waaronder het materiaal wordt verkocht
en gezocht — dan krijgt het materiaal dát type, niet Composites.**

- Hennepkalk (biobased + mineraal) → **Bio-based (excl. Wood)**
- Timbercrete (hout + mineraal) → **Wood**
- Houtvezelplaat met synthetische hars → **Wood**
- Biocomposiet van natuurvezel en fossiele hars → **Bio-based (excl. Wood)**

**Composites blijft over voor de hybriden waar geen enkele familie de propositie draagt**, en
in de praktijk zijn dat vrijwel altijd combinaties zonder biobased of houten component:

- Glasvezelversterkte kunststof (glas + polymeer) → **Composites**
- Carbon-, glas- en basaltgarens → **Composites**
- PP-honingraat met glasgeweven huid → **Composites**
- Minerale vulstof in polyesterhars (mineraal + polymeer) → **Composites**
- Bamboevezel in polymeermatrix → **Composites** (uitzondering uit §3.7; hier draagt de matrix
  de propositie, niet de vezel)

*Waarom deze regel er is.* De drempel uit 1.0 hield alleen biocomposieten binnen één familie
buiten Composites — natuurvezel met bíobased hars. Zodra dezelfde vezel in een minerale of
fossiele matrix zat, verhuisde het materiaal alsnog. Daarmee verdween precies de categorie
waar MaterialDistrict om bekendstaat naar een technische restbak, en werd de bezwaargrond
"dan hoort 90% erin" terecht. Deze regel spiegelt §3.2b: zoals hout altijd Wood wint van
biobased, wint biobased altijd van Composites.

### 3.3 Leather: alleen echte huid en herwonnen leervezel

- Dierlijke huid, inclusief vis en niet-conventionele huiden → **Leather**
- Herwonnen leervezel met binder, mits leer de identiteit draagt → **Leather**
- Spray- of vloeibare toepassing van leerreststroom → **Leather**

**Leeralternatieven krijgen hun eigen basisstof**, ongeacht hoe ze aanvoelen of worden
gepositioneerd:

- Bacteriële cellulose met leergevoel → **Bio-based (excl. Wood)**
- Kurkleer → **Bio-based (excl. Wood)**
- Zonnebloemschil met agar → **Bio-based (excl. Wood)**
- Urethaanverf met suede-gevoel → **Coatings**

### 3.4 Coatings blijft bestaan

Uit de kalibratie: **11 van de 16 beoordeelde coatings zijn werkelijk een coating** en hebben
geen huis in de tien substantietypes. Verf, glazuur, inkt, pigment, poedercoating en
opgebrachte laagsystemen zijn een productklasse, geen stof. Ze wegzetten onder (Bio)Plastics
omdat de bindmiddelen polymeren zijn, maakt de categorie (Bio)Plastics onbruikbaar voor wie
plaatmateriaal zoekt.

**Coatings houden:** verf, lak, glazuur, inkt, pigment, poedercoating, spray-systemen,
opgebrachte functionele lagen.

**Ook Coatings, besloten 11-08-2026 (1.3) en bevestigd door de redactie op 13-08-2026:**
pleisters, stucwerk, kalkstuc, leempleister, tadelakt, microcement en shikkui, én lijmen. De
maatstaf is dat het materiaal **wordt aangebracht als laag** en niet wordt gegoten of geperst.
Onder Concrete zouden deze records die categorie onbruikbaar maken voor wie plaatmateriaal
zoekt; bij een lijm zou het bindmiddel het type bepalen en zou een biobased lijm ineens een
plastic worden.

**Ook Coatings, besloten 13-08-2026:** glazuren die als zelfstandig product worden verkocht.
Urine-Glaze, Care For Milk, ForzGlaze, de Clean Air City-glazuren en vijf andere stonden bij
Ceramics. Wat de koper afneemt is het glazuur, niet de tegel eronder. De redactie tekent
daarbij aan dat glazuur historisch bij keramiek is geplaatst omdat het bij tegels vaak juist
om het glazuur gaat — de nieuwe lijn is consequenter, maar het is een breuk met de oude
praktijk.

**Uit Coatings weghalen:** materialen die eigenlijk een plaat, vel, weefsel of gietmateriaal
zijn en per ongeluk hier stonden.

- Wandbekleding van glasvezel met biobased finish → **Composites**
- Gietpaneel van acryl-gemodificeerd gips → **Composites**
- Spray-upholstery uit leerreststroom → **Leather**
- Akoestische celluloseplaat → **Bio-based (excl. Wood)**

### 3.5 Restgevallen

Is er te weinig informatie om de basisstof te bepalen, dan blijft het huidige type staan met
zekerheid **laag** en de reden *"substantie niet te bepalen uit de tekst"*. Niet gokken, en
niet leegmaken. **Een type wordt nooit leeggemaakt** — anders dan bij channels, waar nul een
geldige uitkomst is.

### 3.6 Vangregels — harde onmogelijkheden

Besloten 31-07-2026, nadat een geautomatiseerde ronde 2.264 records indeelde op
woordfrequentie. Die ronde haalde 68% eerste keuze en 90% binnen de top drie, en was op de
site toch onhoudbaar. De vier fouten die daaronder zaten zijn hier vastgelegd als harde
regels. Ze gelden ongeacht wat de tekst suggereert, en ze gelden ook wanneer een mens leest —
bij record 400 wordt dezelfde soort fout gemaakt als een teller maakt.

1. **Een minerale of metallische identiteit sluit Bio-based & Living Materials uit.** Type
   Metals, Glass, Ceramics, Concrete of Natural Stones kan dat channel nooit dragen.
   *Uitzondering sinds 1.3: zie §3.6b.*
2. **Timber vereist een houten identiteit.** Een coating, lijm of behandeling die op hout
   wordt toegepast draagt Timber niet; het hout doet dat.
3. **Uiterlijk is geen samenstelling.** Staat er *look*, *print*, *effect*, *imitation*,
   *inspired by* of iets vergelijkbaars bij de materiaalterm, dan telt die term niet mee voor
   het stof-channel. Dit is de aanscherping van §3.1: daar gold uiterlijk al niet voor het
   **type**, hier geldt het ook niet voor het **channel**.
4. **Bewijs uit alleen de productnaam telt niet.** *Rodruza Living Bricks*, gebakken
   kleisteen, kreeg drie channels omdat er "Living" in de merknaam staat.

**Houd de lijst smal.** Circular, Acoustic, Biophilic & Human-Centred, Smart & Responsive,
Net Zero & Carbon en Energy & Resilience kunnen bij élk materiaaltype horen: beton kan
circulair zijn, metaal kan akoestisch zijn. Meer combinaties hard uitsluiten is gokken met een
ander gezicht.

### 3.6a De vangregels gemeten — 11-08-2026

De vangregels zijn machinaal toetsbaar: ze vergelijken type en channel, zonder één tekst te
lezen. Tegen de live database op 11-08-2026 stonden **29 van de 3.244 materialen in
overtreding**:

| regel | records |
|---|---|
| §3.6.1 — mineraal of metallisch type draagt Bio-based & Living Materials | 21 |
| §3.6.2 — Timber op een niet-Wood type | 5 |
| §1.2 — meer dan drie channels | 3 |

De duurzaamheidsgroep uit §4.2 wordt nergens overtreden: geen enkel materiaal draagt meer dan
twee van de vier.

De drie records die in §3.6.3 als voorbeeld staan — *Leather look tiles*, *Animal & Leather
Print Tiles* en *Grass & Leaves* — stonden alle drie nog steeds fout, net als *Rodruza Living
Bricks* uit §3.6.4. De vaststelling van 31-07 had dus niet tot correctie in de database geleid.

*Correctie op §3.6.3:* het regelboek beschreef *Grass & Leaves* als een tegel met grasmotief,
terwijl er werkelijk gras tussen het glas is gelamineerd. De uitkomst blijft dezelfde — de
identiteit is glas — maar het is geen uiterlijksfout en dus een slecht voorbeeld bij die regel.

### 3.6a-bis De vangregels hermeten — 19-08-2026

Na de write-back van blok A1 (12 records, uitgevoerd 11-08) is opnieuw geteld tegen de live
database, over alle 3.244 materialen. De telling hieronder is op 19-08-2026 opnieuw bevestigd
tegen de API:

| regel | records | oordeel |
|---|---|---|
| §3.6.1 — mineraal of metallisch type draagt Bio-based & Living Materials | 14 | **geen overtreding** — alle veertien vallen onder de uitzondering van §3.6b |
| §3.6.2 — Timber op een niet-Wood type | 0 | schoon |
| §1.2 — meer dan drie channels | 5 | open, zie hieronder |

**Onder de norm van 1.3 resteren nul overtredingen op §3.6.1 en §3.6.2.** De schoonmaak van
de vangregels is daarmee afgerond op §1.2 na.

*Aanvulling op de §3.6b-lijst:* **3D Printing Eggshell Bioceramic** (id 113108) valt onder de
uitzondering en ontbrak op de opsomming in 1.3. Daarmee telt de lijst veertien namen.

**De vijf §1.2-gevallen:** *Haptic 2.5D printing*, *Stitched Wood*, *Ceramic Textile*,
*Kromatafor* en *Rotterdam Fruitleather*. Bij *Stitched Wood* en *Rotterdam Fruitleather* komt
het vierde channel uit legacy (Sustainable); bij *Ceramic Textile* is Lightweight de vijfde.
Die drie lossen zichzelf op zodra de legacy-channels vervallen. Blijven over: twee records die
een redactioneel oordeel vragen over welk channel eraf gaat.

**Waarschuwing bij het audit-commando.** Het commando `wp md-classification audit` in
`class-md-classification-cli.php` telde bij de A1-ronde 10 vóór en 5 ná, waar de meting tegen
de API 31 vóór en 19 ná gaf. Het commando telt dus structureel te laag en is in de huidige
vorm geen betrouwbare controlepoort. Tot dat is nagelopen geldt de API-meting als maatstaf.

### 3.6a-ter De vangregels hermeten ná ronde 1 — 19-08-2026 · *nieuw in 1.9*

Gemeten tegen de live database ná de write-back van ronde 1 (135 typewijzigingen), over alle
3.244 gepubliceerde materialen, volgens de telwijze van §3.6c:

| regel | records | oordeel |
|---|---|---|
| §1.1 — meer dan één type | 0 | schoon |
| §1.2 — meer dan drie channels | 5 (waarvan 3 alleen door een legacy-channel) | open |
| §3.6.1 — mineraal of metallisch type draagt Bio-based & Living Materials | 13 | **geen overtreding** — alle dertien vallen onder §3.6b |
| §3.6.2 — Timber op een niet-Wood type | 0 | schoon |
| §4.2 — meer dan twee duurzaamheidschannels | 0 | schoon |

**Uniek: 18 records geraakt, waarvan 0 overtredingen en 18 voorleggingen.** Onder de telwijze
"alleen de twaalf actieve channels" zijn het er 16; het verschil van twee zit in §1.2.

*Wijziging ten opzichte van §3.6a-bis:* daar stonden veertien §3.6.1-gevallen. **Corcrete**
(id 121073) is in ronde 1 onder §3.2c naar Bio-based (excl. Wood) gegaan — kurk kruist een
minerale binder en draagt de propositie — en is daarmee geen mineraal type meer. Het record is
geen §3.6.1-geval meer en de opsomming in §3.6b telt nog dertien namen. Dat is geen correctie
maar het bedoelde gevolg van §3.2c.

### 3.6c Telwijze van de audit · *nieuw in 1.9*

Het audit-commando `wp md-classification audit` en de meting tegen de API kwamen op andere
getallen uit. Dat is geen datafout: het zijn twee definities die geen van beide waren
vastgelegd. Deze paragraaf legt ze vast. **Wijkt het commando hiervan af, dan wordt het
commando aangepast — niet deze paragraaf.**

**1. Wat telt als channel.** Voor §1.2 tellen **alle termen in de `theme`-taxonomie** die aan
een record hangen: de twaalf actieve channels, de vier legacy channels en de dertien
resttermen. Reden: de bezoeker ziet geen verschil tussen een actief en een legacy channel — ze
staan er allebei. Een record met drie actieve en één legacy channel toont er vier.

Het rapport meldt bij elk §1.2-geval **hoeveel daarvan actief zijn**, zodat zichtbaar is welke
gevallen zichzelf oplossen zodra de legacy-channels vervallen en welke een redactioneel
oordeel vragen. Nu: van de vijf gevallen lossen er drie zichzelf op.

**2. Overtreding of voorlegging.** Het rapport kent twee uitkomsten en houdt ze gescheiden:

- **Overtreding** — de combinatie kan onder geen enkele lezing van dit regelboek kloppen en
  moet gecorrigeerd worden. §1.1, §3.6.2 en §4.2 leveren altijd overtredingen op.
- **Voor te leggen** — de combinatie is verdacht maar kan onder een uitzondering vallen, en
  vraagt een menselijk oordeel. §3.6.1 valt hier altijd onder, vanwege §3.6b: mineraal type
  met Bio-based & Living Materials is toegestaan wanneer de biobased grondstof aantoonbaar in
  de samenstelling zit. §1.2 valt hier ook onder zolang het vierde channel uit legacy komt.

Een voorlegging telt **niet** mee in het overtredingstotaal. Het eindrapport noemt beide
getallen apart en daarnaast het aantal **unieke records** dat geraakt wordt — een record dat
twee regels raakt telt één keer.

**3. Welke regels worden getoetst.** Vijf: §1.1, §1.2, §3.6.1, §3.6.2 en §4.2. §3.6.3
(uiterlijk) en §3.6.4 (merknaam) zijn niet machinaal toetsbaar — ze vragen het lezen van een
tekst — en horen niet in het commando.

**4. Welke records.** Alleen `status=publish`. Concepten en prullenbak blijven buiten de
telling.

**5. Bij verschil wint de API-meting**, tot het commando aantoonbaar op deze paragraaf is
afgesteld. Daarna wint het commando, want dan is het de goedkoopste controle en de enige die
Johan zonder tussenkomst kan draaien.

### 3.6b Uitzondering op §3.6.1 — bio-minerale hybriden · *besloten 11-08-2026 (1.3)*

Een materiaal van het type Ceramics, Concrete, Natural Stones, Glass of Metals **mag** het
channel Bio-based & Living Materials dragen wanneer de tekst de biobased grondstof **als
onderdeel van de samenstelling** noemt.

De uitzondering geldt niet wanneer de biobased verwijzing uiterlijk, merknaam of toepassing
betreft. §3.6.3 en §3.6.4 blijven onverkort gelden en vangen die gevallen af.

- **Wel onder de uitzondering:** *Hemp concrete*, *Corcrete*, *Eggshell Ceramic*, *3D Printing
  Eggshell Bioceramic*, *MyCera*, *Mimmik® Tile*, *Coffire*, *Care For Milk*, *KERLOC*,
  *TERRA_TORY PMBC*, *Ott porcelain*, *Urine-Glaze*, *Woodstone*, *Mother of pearl mosaic
  tiles*. Veertien records, hermeten op 19-08-2026.
- **Niet onder de uitzondering:** *Leather look tiles*, *Animal & Leather Print Tiles*,
  *Grass & Leaves*, *Rodruza Living Bricks*, *Lightweight natural stone*, *Natural Stone
  Composites*, *Natural Footprint*.

De machinale toets uit §3.6a moet hierop worden aangepast: hij blijft de combinatie melden,
maar als *voor te leggen*, niet als overtreding.

### 3.7 Bamboe — besloten 11-08-2026 (1.3)

Bamboe gaat naar **Wood**. Botanisch is bamboe een gras, maar §3.2b stuurt twijfel tussen hout
en biobased al naar Wood, en het publiek zoekt bamboevloeren en -panelen onder hout.
**Uitzondering:** bamboevezel in een polymeermatrix volgt §3.2 en wordt Composites. Timber mag
bij type Wood, ook bij bamboe — daarmee vervalt het voorbehoud in §3.6.2.

Papier en karton zijn **niet** open: §3.2 wijst cellulosevezel uit oud papier expliciet toe aan
Bio-based (excl. Wood).

### 3.8 Proces- en dienstrecords — besloten 11-08-2026 (1.3)

Records die geen materiaal beschrijven maar een proces, dienst, apparaat of concept horen niet
in de materiaaldatabase. Ze krijgen **geen** nieuw type — §3.5 verbiedt het type leeg te maken
— maar komen op een **afvoerlijst** met de reden *hoort er niet meer*. Of ze offline gaan, is
een redactioneel besluit per record.

**Stand 13-08-2026:** de redactie wil deze elf records eerst zelf bekijken en heeft bij twee
gevallen al aangegeven ze te willen behouden met een channel in plaats van ze af te voeren.
De afvoerlijst is dus een voorlegging, geen opruimactie.

### 3.9 Composites en Leather — besloten 19-08-2026

Beide types **blijven bestaan**. De redactie wees op 13-08-2026 af dat er records naartoe
zouden verhuizen; het besluit is genomen die afwijzing niet te volgen op de categorie zelf,
maar wél op de afbakening — het bezwaar was inhoudelijk raak en heeft tot §3.2c geleid.

**Leather blijft.** Het argument dat leer biobased is en er dus onder kan, bewijst te veel:
hout is óók biobased en staat wél apart, precies omdat het een eigen zoekingang is. Leer is een
eigen markt met eigen leveranciers. Op dit moment levert een filter op leer nul resultaten
terwijl er 71 materialen liggen — zalm, forel, steur, rog, struisvogel, pensleer, perkament,
de collecties van Foglizzo en Prodital. Dat is de duidelijkste vindbaarheidslacune in de
collectie.

*Openstaand gevolg:* het type Bio-based (excl. Wood) zou strikt genomen Bio-based (excl. Wood
& Leather) moeten heten. Die naam is onwerkbaar lang en de redactie wil de categorienaam toch
al heroverwegen. Tot die heroverweging blijft de huidige naam staan; §3.3 regelt de afbakening
en dat is wat telt bij het classificeren.

**Composites blijft, met een gerepareerde drempel.** De categorie is nodig:
glasvezelversterkte kunststof, carbonweefsel en PP-honingraat met glashuid hebben in geen enkel
substantietype een huis. Maar de drempel uit 1.0 ving te veel, en juist de verkeerde records —
de biocomposieten, die het handelsmerk van het platform zijn en in het biobased verhaal horen,
niet in een technische restbak. §3.2c repareert dat.

**Wat nog een oordeel vraagt.** De redactie plaatst Silestone en CaesarStone bij Natural Stones
en DIBOND en ALUCOBOND bij Metals. Bij DIBOND is dat verdedigbaar via de dominantietoets: de
aluminium huid draagt de identiteit. Bij Silestone wringt het: het is 93% kwarts in hars, maar
§2 definieert Natural Stones als natuursteen *in gewonnen vorm*, en Silestone is gefabriceerd.
Dit gaat over een handvol records en wordt per geval beslist, niet per categorie.

**Fysieke samples worden niet opnieuw gelabeld.** Zie §2a — dat is besloten en het is geen
argument meer bij het afwegen van typewijzigingen.

### 3.11 Mineraal aggregaat in een bindmiddel · *nieuw in 1.7*

Domineert het minerale aggregaat, dan blijft het materiaal bij zijn minerale type; §3.2 komt
dan niet aan bod, omdat die regel alleen geldt wanneer géén basisstof domineert. In de praktijk
ligt de grens rond een bindmiddelaandeel van vijftien procent.

- Silestone, CaesarStone, CAVA, ORO (>90% kwarts in hars) → **Natural Stones**
- Riverstone, Natural Stone Composites (steengranulaat in hars) → **Natural Stones**
- Polymeerbeton (mineraal aggregaat in polymeerbinder) → **Concrete**

**Domineert er niets, dan geldt §3.2 gewoon.** Een paneel dat in de kern polyester met glasvezel
is en alleen aan het oppervlak steenpoeder draagt, is geen steen.

- MSD Panels (polyester en glasvezel, steenpoeder als toplaag) → **Composites**
- Deco S (marmer en glas) → **Composites**
- Marwoolus (marmerpoeder, wol en binder) → **Composites**

Dit is de reden dat §2 de woorden *in gewonnen vorm* niet meer draagt: gefabriceerd kwarts is
geen gewonnen steen, maar het hoort wel in het filter waar de doelgroep het zoekt.

### 3.10 Ongebakken klei — open

Ceramics is in §2 gedefinieerd als *gebakken* keramiek. Ongebakken kleimaterialen (Claytec,
Leemsteen) vallen daardoor tussen wal en schip: technisch geen keramiek, maar ook geen
natuursteen of beton. De redactie oppert Ceramics uit te breiden naar bijvoorbeeld
**Ceramics & Clay**. Tot dat besluit blijven deze records staan waar ze staan.

---

## 4. De twaalf channels

Channels zijn **redactionele verhaallijnen**, geen volledigheidseis. Een channel toekennen
betekent: dit materiaal hoort in dat verhaal thuis, niet dat het er technisch aan raakt.

| Channel | Toekennen wanneer |
|---|---|
| Bio-based & Living Materials | Biobased grondstof of levend/gegroeid materiaal is de kernpropositie |
| Circular | Gerecycled, reststroom, hergebruik, retourneerbaar, biologisch afbreekbaar als expliciete claim |
| Biophilic & Human-Centred | Welzijn en natuurbeleving in de binnenruimte — zie §4.4 |
| Healthy & Non-Toxic | Aantoonbaar gezond of niet-toxisch materiaal — zie §4.4 |
| Acoustic | Geluidsabsorptie of -isolatie is een genoemde functie |
| Timber | Constructief hout en houtbouw |
| Smart & Responsive | Reageert op licht, warmte, elektriciteit, vocht of aanraking |
| New Making | Productiewijze is de innovatie: printen, robotica, nieuwe fabricage |
| Material Futures | Experimenteel, onderzoeksfase, nog geen marktproduct |
| Net Zero & Carbon | CO₂-reductie, -opslag of -neutraliteit met een concrete claim |
| Energy & Resilience | Energieprestatie, isolatie, klimaatbestendigheid |
| Regenerative | Herstelt actief een systeem: bodem, biodiversiteit, ecosysteem |

Naast deze twaalf staan vier legacy channels (Sustainable, Lightweight, Translucency, Leisure
& Hospitality) die worden uitgefaseerd, en dertien resttermen die nog content dragen. Aan geen
van beide wordt nog toegekend.

**Healthy & Non-Toxic is nieuw op 13-08-2026.** De term is inmiddels in WordPress aangemaakt
en draagt op 19-08-2026 nul materialen; records kunnen er dus aan gehangen worden. Wat nog
ontbreekt is een **channel-afbeelding en een omschrijving** — zonder die twee verschijnt het
channel als grijs vlak op `/channels`, zoals nu al bij zes bestaande channels gebeurt.

### 4.1 Uitsluitcriteria

- **Niet toekennen op basis van een terloopse vermelding.** "Duurzaam geproduceerd" zonder
  onderbouwing is geen Circular.
- **Niet toekennen op toepassing.** Een materiaal dat *in* een gezondheidszorgproject is
  gebruikt, is daarmee niet Biophilic.
- **Material Futures sluit marktproducten uit.** Is het te koop, dan is het geen future.
- **Regenerative is de strengste.** Minder CO₂ uitstoten is Net Zero; een ecosysteem actief
  herstellen is Regenerative.

### 4.2 De duurzaamheidsgroep — maximaal twee

**Bio-based & Living Materials · Circular · Net Zero & Carbon · Regenerative.**

Uit deze vier maximaal twee per materiaal. Kiezen op basis van de sterkste, best onderbouwde
claim. De vrijgekomen plek gaat naar het functionele of typologische channel (Acoustic, Smart
& Responsive, Energy & Resilience, New Making, Timber, Biophilic, Healthy & Non-Toxic), zodat
het materiaal vindbaar blijft voor wie op functie zoekt.

Zonder deze regel vult elk biobased materiaal zijn drie plekken met duurzaamheid en verdwijnt
het uit het channel waar de doelgroep het zoekt.

### 4.3 Nul channels

Een geldige uitkomst. Deze materialen worden apart opgeleverd, met een reden uit vier
categorieën:

- **generiek** — goed materiaal, geen thema; vindbaar via de filters
- **te weinig info** — excerpt te dun; redactionele aanvulling nodig
- **kandidaat nieuw channel** — met voorgestelde noemer
- **hoort er niet meer** — verlopen merk, niet meer verkrijgbaar; input voor legacy

Nieuwe channels worden **alleen** voorgesteld bij een cluster van tientallen materialen onder
dezelfde noemer. Nooit bij losse gevallen.

**Stand op 19-08-2026, hermeten:** 1.255 materialen dragen nul actieve channels, waarvan 1.193
er nooit één hadden en 62 er alleen legacy- of resttermen op hebben staan. Dat is 39% van het
bestand dat via geen enkele channel-ingang te vinden is. Daarnaast dragen 458 materialen
Biophilic & Human-Centred als hun enige actieve channel; die raken leeg zodra de inperking uit
§4.4 wordt doorgevoerd, en vallen dus onder hetzelfde uitvoeringsprobleem hieronder.
*(Stand 11-08-2026 was 1.251 / 1.189 / 62.)*

**Uitvoeringsprobleem, open bij Johan.** Het apply-script kan een channelset niet leegmaken.
Bij een eerdere ronde bleven 23 records met "bewust geen channel" hun oude channels houden.
Zolang dat niet is opgelost, is elk "geen channel"-oordeel onuitvoerbaar — ook de vijftien uit
de twijfelgevallenlijst van 13-08.

### 4.4 Biophilic tegenover Healthy & Non-Toxic · *nieuw in 1.4*

Biophilic & Human-Centred hing op 13-08-2026 aan 748 materialen: bijna een kwart van de
collectie, inclusief antieke spiegels, gevelplaat, geglazuurde tegels, acrylplaat, vinylbehang
en tapijttegels. Een channel dat aan een kwart van alles hangt, zegt niets meer bij het
filteren.

- **Biophilic & Human-Centred** gaat over **welzijn en natuurbeleving**: mos- en algentegels,
  panelen met echt plantmateriaal, luchtzuiverende glazuren. Een mooi oppervlak is geen
  natuurbeleving. Na de inperking: 155 materialen.
- **Healthy & Non-Toxic** gaat over **aantoonbare gezondheidsclaims**: formaldehydevrij, geen
  VOC, loodvrij, antibacterieel. Deze materialen kregen Biophilic omdat er nergens anders plek
  voor was. Bij aanvang: 176 materialen.

De afbakening is: gaat het over hoe de ruimte **voelt**, dan Biophilic; gaat het over wat het
materiaal **niet uitstoot of afgeeft**, dan Healthy & Non-Toxic. Beide mogen samen voorkomen
wanneer beide claims onderbouwd zijn.

De redactie heeft geopperd Biophilic te hernoemen naar **Biophilic & Biodiversity**. Dat hangt
samen met het kandidaat-channel in §4.5 en is niet los te besluiten.

### 4.5 Kandidaat-channels — geagendeerd, niet toegekend · *nieuw in 1.4*

Drie noemers zijn voorgesteld door de redactie. Geen ervan is toegekend; §4.3 vereist een
gemeten cluster van tientallen materialen voordat een channel aan de lijst wordt toegevoegd,
en die meting is voor geen van de drie gedaan.

1. **Nature-Inclusive / Living Building / Biodiversity** — natuurinclusief bouwen. Aanleiding
   is onder meer Ornilux, glas met een UV-patroon dat vogelsterfte voorkomt, waar geen van de
   twaalf channels bij past. Raakt de voorgestelde hernoeming van Biophilic (§4.4) en overlapt
   mogelijk met Regenerative.
2. **Sense & Sensibility** — materialen die "alleen mooi" zijn, zonder thematische claim. Dit
   is geen nieuwe noemer: *Sense & Sensibility* bestaat al als restterm met 8 items, en staat
   op de lijst om op te ruimen. Het voorstel is dus feitelijk een heropening van een term die
   werd uitgefaseerd. Weegt zwaar, omdat het raakt aan de 1.189 materialen zonder channel:
   als esthetiek een geldige verhaallijn is, is een groot deel daarvan alsnog vindbaar.
3. **Ceramics & Clay** — dit is een material *type*, geen channel. Zie §3.10.

**Voordat hierover wordt besloten, wordt het cluster gemeten**, zodat de keuze op aantallen
rust en niet op indruk.

---

## 5. Afgeleide eigenschappen

**Wel voorstellen**, uitsluitend wanneer de tekst het expliciet stelt, gemarkeerd als afgeleid
en ter bevestiging door de redactie:

`biobased_content` · `recycled_content` · `upcycled_content` · `renewable` · `reduces_waste` ·
`climate_neutral`

Deze velden zijn nu vrijwel leeg — 1 van de 3.244 — terwijl vier channels erop leunen; dit is
hetzelfde gat waarop de compare-pagina wacht. Omdat het invullen dezelfde leesbeweging vraagt
als het toekennen van channels, is het efficiënt om beide in één doorloop te doen in plaats
van de teksten twee keer te lezen.

**Niet voorstellen.** Brandklasse, hardheid, krasvastheid, temperatuurbereik, chemische
weerstand, akoestische waarden. Dat zijn feitelijke productclaims met aansprakelijkheid; die
komen van de leverancier of het datasheet.

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
twijfelgevallen, niet de 3.244.

Dit formaat geldt ongeacht wie het voorstel maakt. Een handmatig gelezen record levert dezelfde
velden op als een machinaal voorgesteld record; alleen de manier waarop de zekerheid tot stand
komt verschilt.

---

## 7. Toepassing — besloten 11-08-2026 (1.3)

**Besluit: er wordt gelezen, niet geteld, en het lezen gebeurt door Claude.**

De mislukte ronde van juli telde woordfrequenties. Het probleem was niet het percentage maar
de aard van de fouten: een teller ziet niet dat *Rodruza Living Bricks* gebakken kleisteen is,
en behandelt *Coffire* en *Leather look tiles* identiek terwijl het onderscheid uitsluitend in
de tekst zit. Handmatig lezen door de redactie is bij 1.189 records een zaak van maanden.
Lezen door Claude combineert de doorlooptijd van de machine met het onderscheid dat alleen uit
de tekst te halen is.

Daarbij geldt in alle gevallen:

- De vangregels uit §3.6 worden **vooraf** toegepast, niet achteraf gecontroleerd. Een
  onmogelijke combinatie wordt niet voorgesteld.
- Elk voorstel draagt een motivering die naar een regel in dit document verwijst.
- Zekerheid *laag* is geen zwaktebod maar de bedoelde uitkomst bij twijfel (§1.5).
- Wat de redactie eerder heeft toegekend wordt niet stilzwijgend overschreven; een afwijkend
  voorstel is een voorstel, geen correctie.
- **Elk channel dat wordt weggehaald gaat naar de reviewlijst**, ongeacht de zekerheid.
  Toevoegen aan een leeg record mag bij hoge zekerheid automatisch.
- Per ronde worden **twintig willekeurige records** uit de zekere bak nagelopen als
  steekproef.

---

## 8. Terugschrijven

Een goedgekeurd voorstel wordt via WP-CLI teruggeschreven, uitgevoerd door de
backend-ontwikkelaar. Nooit met de hand, nooit via losse plugins of mu-plugins; alle PHP hoort
in de bestaande MaterialDistrict-plugin.

- Het script raakt **uitsluitend** de record-id's die in het goedgekeurde besluitbestand staan.
- **Dry-run eerst**, met een telling van wat er zou wijzigen.
- **Terugdraaien hoort bij de levering.** Het script legt per record de oude term-id's vast en
  er komt een terugdraaiscript mee dat die herstelt. Terugdraaien betekent oude waarden
  terugzetten, niet records verwijderen.
- **Lege waarden overschrijven nooit gevulde velden.** Uitzondering: het leegmaken van een
  channelset moet mogelijk worden gemaakt — zie §4.3.
- Een correctie op een handmatig door de redactie gezette waarde vereist expliciete goedkeuring
  per record, niet per blok.
- **`_material_code` wordt nooit meegeschreven.** Bij typewijzigingen raakt het script alleen
  `material_category`; de code blijft staan zodat sample-labels en QR-codes geldig blijven.
  Zie §2a. Vóór de eerste typewijziging moet zijn bevestigd dat geen hook de code herafleidt.

---

## 9. Versiebeheer van dit document

Toegevoegd in 1.4, na de constatering dat versie 1.3 nooit in de repository is geland.

- Dit bestand leeft op **`docs/materiaal-classificatie-regelboek.md`** in de moedermap en
  nergens anders. Een kopie in een sessielevering is een kopie, geen bron.
- **Een nieuwe versie is pas een versie als hij in de repository staat.** Een regelboek dat in
  een zip blijft hangen bestaat niet; bij 1.3 leverde dat een week werken op een verouderde
  norm op. Bij 1.5 gebeurde het opnieuw — zie §0. Een versie die alleen in een sessielevering
  bestaat, krijgt bij het alsnog landen een **nieuw nummer**, zodat er nooit twee verschillende
  bestanden met hetzelfde versienummer circuleren.
- **Eén repository, niet twee.** Op 19-08-2026 bleek `docs/materiaal-classificatie-regelboek.md`
  in de frontend-repo nog versie 1.1 van 31 juli te dragen, terwijl de actuele versie elders
  stond. Twee bestanden met dezelfde naam en hetzelfde pad in twee repositories zijn niet
  synchroon te houden; de verouderde kopie wordt verwijderd, niet bijgewerkt.
- **Elke kopie die rondgaat draagt het versienummer in de bestandsnaam**
  (`materiaal-classificatie-regelboek-v1.9.md`). Alleen het bestand in `docs/` houdt de kale
  naam. Op 19-08 lagen er drie bestanden met de kale naam en drie verschillende versies erin;
  aan de naam was niet te zien welke gold.
- Een Word- of PDF-leeskopie is uitdrukkelijk een leeskopie. Bij tegenspraak wint de `.md`.
- Elke versie noemt bovenaan wat hij verandert en wat er open blijft, zodat een verse sessie
  in één oogopslag ziet waar de norm eindigt en het oordeel begint.
