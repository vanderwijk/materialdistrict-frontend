# Regelboek materiaalclassificatie

> **Doel.** Eén norm voor het toekennen van material type en channels aan alle materialen op MaterialDistrict. Dit document is de maatstaf waaraan elk classificatievoorstel wordt getoetst — ongeacht of dat voorstel machinaal of met de hand tot stand komt. Wijzigt de norm, dan wijzigt dit bestand en wordt de ronde opnieuw gedaan — niet omgekeerd.
>
> Versie 1.3 · 11-08-2026 · sluit de vijf openstaande besluiten uit §7 en §3.6a. Versie 1.2 · 11-08-2026. Versie 1.1 · 31-07-2026 · gekalibreerd op 68 handmatig beoordeelde grensgevallen (`kalibratieset-68.csv`); voegde §3.6 toe met de vangregels na de eerste, mislukte classificatieronde.

## 0. Wat versie 1.2 verandert

Versie 1.2 spreekt versie 1.1 nergens tegen. Er is geen enkele grensregel gewijzigd; de dominantietoets, de Composites-drempel, de Leather-afbakening, de vangregels en de duurzaamheidsgroep staan ongewijzigd. Wat wél is veranderd:

1.  **De norm is losgekoppeld van de methode.** Versie 1.1 beschreef zichzelf als "de instructie voor de geautomatiseerde classificatierun". Dat botste met de latere werkafspraak dat er gelezen wordt in plaats van geteld, waardoor een sessie moest kiezen welk document ze geloofde. De norm geldt nu voor beide werkwijzen; de methodekeuze staat apart in §7 en is een **open besluit**.
2.  **§2 telt nu elf types in één tabel** in plaats van tien plus een naschrift over Coatings.
3.  **De vangregels uit §3.6 zijn gemeten** tegen de live database op 11-08-2026. Zie §3.6a: 29 records staan in overtreding, en er is één inhoudelijke vraag uit voortgekomen die de redactie moet beantwoorden.
4.  **Alle aantallen zijn hermeten** op 11-08-2026 (3.244 gepubliceerde materialen, was 3.245).
5.  **§8 is nieuw:** hoe een goedgekeurd voorstel wordt teruggeschreven, inclusief de terugdraaieis.

Nog steeds open en bewust niet ingevuld: de methodekeuze (§7), de bio-minerale hybriden (§3.6a), bamboe (§3.7), en plasters/stucco, lijmen en de process-/service-records.

## 0a. Wat versie 1.3 verandert · *besloten 11-08-2026 door Jeroen*

Versie 1.3 sluit de besluiten die versie 1.2 bewust open liet. Geen van de bestaande grensregels vervalt; er komt één uitzondering bij en vier categorieën worden toegewezen.

1. **Bio-minerale hybriden — §3.6.1 krijgt een uitzondering.** Zie §3.6b.
2. **Pleisters, stucwerk en microcement horen bij Coatings.** Zie §3.4.
3. **Lijmen horen bij Coatings.** Zie §3.4.
4. **Bamboe gaat naar Wood.** Zie §3.7.
5. **Proces- en dienstrecords zijn geen materiaal.** Zie §3.8.

Daarnaast is de methodekeuze uit §7 beslist: er wordt gelezen, niet geteld, en het lezen gebeurt door Claude. Zie §7.

### 3.6b Uitzondering op §3.6.1 — bio-minerale hybriden · *nieuw in 1.3*

Een materiaal van het type Ceramics, Concrete, Natural Stones, Glass of Metals **mag** het channel Bio-based & Living Materials dragen wanneer de tekst de biobased grondstof **als onderdeel van de samenstelling** noemt.

De uitzondering geldt niet wanneer de biobased verwijzing uiterlijk, merknaam of toepassing betreft. §3.6.3 en §3.6.4 blijven onverkort gelden en vangen die gevallen af. *Hemp concrete*, *Corcrete*, *Eggshell Ceramic*, *MyCera*, *Mimmik® Tile*, *Coffire*, *Care For Milk*, *KERLOC*, *TERRA_TORY PMBC*, *Ott porcelain*, *Urine-Glaze*, *Woodstone* en *Mother of pearl mosaic tiles* vallen onder de uitzondering; *Leather look tiles*, *Animal & Leather Print Tiles*, *Grass & Leaves*, *Rodruza Living Bricks*, *Lightweight natural stone*, *Natural Stone Composites* en *Natural Footprint* niet.

De machinale toets uit §3.6a moet hierop worden aangepast: hij blijft de combinatie melden, maar als *voor te leggen*, niet als overtreding.

### 3.8 Proces- en dienstrecords · *nieuw in 1.3*

Records die geen materiaal beschrijven maar een proces, dienst, apparaat of concept horen niet in de materiaaldatabase. Ze krijgen **geen** nieuw type — §3.5 verbiedt het type leeg te maken — maar komen op een **afvoerlijst** met de reden *hoort er niet meer*. Of ze offline gaan, is een redactioneel besluit per record.

## 1. Uitgangspunten

1.  **Eén material type per materiaal.** Verplicht. Single-select: toekennen is altijd ook weghalen bij het vorige type.
2.  **Nul tot drie channels per materiaal.** Meervoudig. Niet verplicht — een materiaal zonder thema is een geldige uitkomst.
3.  **Maximaal twee channels uit de duurzaamheidsgroep.** Zie §4.2.
4.  **Nooit een eigenschap verzinnen.** Technische waarden (brandklasse, hardheid, krasvastheid) worden niet afgeleid uit marketingtekst. Zie §5.
5.  **Bij twijfel: lage zekerheid meegeven, niet gokken.** De redactie beslist over de twijfelgevallen; het voorstel markeert ze.

## 2. De elf material types

  —————————————————————————————————————————
  Type                     Kern                                                                       Codeprefix
  ———————— ————————————————————————-- ———————--
  (Bio)Plastics            Polymeren, synthetisch of biobased, inclusief biopolymeren                 PLA

  Bio-based (excl. Wood)   Plantaardig, dierlijk of microbieel materiaal dat geen hout is             ONA

  Wood                     Hout en houtplaatmateriaal                                                 WOO

  Metals                   Metalen en metaallegeringen                                                MET

  Glass                    Glas                                                                       GLA

  Ceramics                 Gebakken keramiek, baksteen, porselein, geëxpandeerde klei                 CER

  Concrete                 Cement- en mineraalgebonden gietmaterialen                                 CON

  Natural Stones           Natuursteen in gewonnen vorm                                               NST

  Composites               Materialen waarvan de combinatie de identiteit ís — zie §3.2             COM

  Leather                  Dierlijke huid en herwonnen leervezel — zie §3.3                         LEA

  Coatings                 Verf, lak, glazuur, inkt, pigment, opgebrachte laagsystemen — zie §3.4   COA
  —————————————————————————————————————————

Coatings blijft bestaan. Dat wijkt af van het eerdere plan om de categorie als legacy uit te faseren; de onderbouwing staat in §3.4.

De prefixes staan ook als term meta `_material_code_prefix` op `material_category` (31-07-2026). Composites en Leather hadden nog geen materialen en dus nog geen prefix in de bestaande codes; **COM** en **LEA** zijn toen vastgelegd.

**Stand op 11-08-2026.** Van de 3.244 gepubliceerde materialen dragen er 3.240 precies één type, 4 dragen er geen, en geen enkel materiaal draagt er meer dan één — het single-select- uitgangspunt uit §1.1 wordt overal gerespecteerd. Composites en Leather staan allebei nog op nul, wat betekent dat de records die daarheen horen nu elders geparkeerd staan: (Bio)Plastics (913) en Bio-based excl. Wood (900) zijn samen 56% van het bestand.

## 3. Grensregels

De grensregels zijn de kern van dit document. Ze zijn in deze volgorde toe te passen.

### 3.1 De dominantietoets (eerste toets, altijd)

Een materiaal krijgt het type van de **basisstof die zijn identiteit draagt** — de stof waaronder het wordt verkocht, benoemd en gezocht.

Een bindmiddel, matrix, coating, rug- of kernlaag maakt géén tweede materiaaltype zolang de basis domineert.

-   Uitgefreesd MDF met coating → **Wood**
-   Fineer met melamine op plaatkern → **Wood**
-   Harsgeïmpregneerd beukenfineer → **Wood**
-   Translucent beton met optische vezels → **Concrete**
-   Terrazzo (marmeraggregaat in cement) → **Concrete**
-   Keramische tegel met leerprint → **Ceramics**
-   Kurk met textielrug → **Bio-based (excl. Wood)**
-   Aluminium met oppervlakteafwerking → **Metals Uiterlijk verandert nooit het type.** Een tegel die op leer lijkt is keramiek; een decorpaneel met betonprint op houtbasis is hout.

### 3.2 Composites: alleen bij kruisende families

Composites geldt **alleen** wanneer aan beide voorwaarden is voldaan:

1.  Geen enkele basisstof domineert de identiteit (§3.1 geeft geen uitsluitsel), **én**
2.  de bestanddelen komen uit **verschillende materiaalfamilies**.

De families: polymeer · mineraal · metaal · glas · biobased · hout.

-   Glasvezelversterkte kunststof (glas + polymeer) → **Composites**
-   WPC-vlonderplank (hout + polymeer) → **Composites**
-   Minerale vulstof in polyesterhars (mineraal + polymeer) → **Composites**
-   Carbon-, glas- en basaltgarens → **Composites**
-   PP-honingraat met glasgeweven huid → **Composites**
-   80% mineraal met 20% polymeer → **Composites Binnen één familie geen Composites.** Twee minerale bestanddelen met een minerale binder blijven Concrete; natuurvezel met biobased hars blijft biobased.

-   Biocomposiet van natuurvezel en biobased hars → **Bio-based (excl. Wood)**
-   Zetmeelbiopolymeer versterkt met miscanthus → **Bio-based (excl. Wood)**
-   Hennep- en vlasfineer met popcornkern → **Bio-based (excl. Wood)**
-   Cellulosevezel uit oud papier → **Bio-based (excl. Wood)**

Deze regel houdt de biocomposieten — het handelsmerk van het platform — in Bio-based (excl. Wood), en reserveert Composites voor de echte hybriden.

*Reden voor de strengheid:* een letterlijke lezing van "bestaat uit meerdere materialen" plaatste bij de meting van 31-07-2026 1.072 van de 3.245 gepubliceerde materialen in Composites en trok Wood, Concrete en de biobased categorie leeg. Omdat het type single-select is, verdwijnen die materialen dan uit de filters waar de doelgroep ze zoekt.

### 3.2b Hout is ook biobased — maar hoort in Wood

Hout voldoet aan elke definitie van biobased. Toch gaat het altijd naar **Wood**; de uitsluiting staat niet voor niets in de termnaam. Dit is de meest voorkomende fout bij klant-uploads, omdat de redenering "mijn houtvezelplaat is biobased" correct is en toch het verkeerde vakje aanvinkt. Twijfelt de tekst tussen hout en biobased, dan wint Wood.

### 3.3 Leather: alleen echte huid en herwonnen leervezel

-   Dierlijke huid, inclusief vis en niet-conventionele huiden → **Leather**
-   Herwonnen leervezel met binder, mits leer de identiteit draagt → **Leather**
-   Spray- of vloeibare toepassing van leerreststroom → **Leather Leeralternatieven krijgen hun eigen basisstof**, ongeacht hoe ze aanvoelen of worden gepositioneerd:

-   Bacteriële cellulose met leergevoel → **Bio-based (excl. Wood)**
-   Kurkleer → **Bio-based (excl. Wood)**
-   Zonnebloemschil met agar → **Bio-based (excl. Wood)**
-   Urethaanverf met suede-gevoel → **Coatings**

### 3.4 Coatings blijft bestaan

Uit de kalibratie: **11 van de 16 beoordeelde coatings zijn werkelijk een coating** en hebben geen huis in de tien substantietypes. Verf, glazuur, inkt, pigment, poedercoating en opgebrachte laagsystemen zijn een productklasse, geen stof. Ze wegzetten onder (Bio)Plastics omdat de bindmiddelen polymeren zijn, maakt de categorie (Bio)Plastics onbruikbaar voor wie plaatmateriaal zoekt.

**Coatings houden:** verf, lak, glazuur, inkt, pigment, poedercoating, spray-systemen, opgebrachte functionele lagen.

**Ook Coatings, besloten 11-08-2026 (1.3):** pleisters, stucwerk, kalkstuc, leempleister, tadelakt, microcement en shikkui, én lijmen. De maatstaf is dat het materiaal **wordt aangebracht als laag** en niet wordt gegoten of geperst. Onder Concrete zouden deze records die categorie onbruikbaar maken voor wie plaatmateriaal zoekt; bij een lijm zou het bindmiddel het type bepalen en zou een biobased lijm ineens een plastic worden.

**Uit Coatings weghalen:** materialen die eigenlijk een plaat, vel, weefsel of gietmateriaal zijn en per ongeluk hier stonden.

-   Wandbekleding van glasvezel met biobased finish → **Composites**
-   Gietpaneel van acryl-gemodificeerd gips → **Composites**
-   Spray-upholstery uit leerreststroom → **Leather**
-   Akoestische celluloseplaat → **Bio-based (excl. Wood)**

Verwachting: ruwweg 70% van de 229 gepubliceerde coatings blijft staan. Dat betekent dat de Coatings-herbeoordeling in de praktijk ook een hertyperingsblok is van zo'n zeventig records.

### 3.5 Restgevallen

Is er te weinig informatie om de basisstof te bepalen, dan blijft het huidige type staan met zekerheid **laag** en de reden *"substantie niet te bepalen uit de tekst"*. Niet gokken, en niet leegmaken. **Een type wordt nooit leeggemaakt** — anders dan bij channels, waar nul een geldige uitkomst is.

### 3.6 Vangregels — harde onmogelijkheden

Besloten 31-07-2026, nadat een geautomatiseerde ronde 2.264 records indeelde op woordfrequentie. Die ronde haalde 68% eerste keuze en 90% binnen de top drie, en was op de site toch onhoudbaar. De vier fouten die daaronder zaten zijn hier vastgelegd als harde regels. Ze gelden ongeacht wat de tekst suggereert, en ze gelden ook wanneer een mens leest — bij record 400 wordt dezelfde soort fout gemaakt als een teller maakt.

1.  **Een minerale of metallische identiteit sluit Bio-based & Living Materials uit.** Type Metals, Glass, Ceramics, Concrete of Natural Stones kan dat channel nooit dragen.
2.  **Timber vereist een houten identiteit.** Een coating, lijm of behandeling die op hout wordt toegepast draagt Timber niet; het hout doet dat. Voor bamboe geldt de regel tot nader order alleen bij type Wood — zie §3.7.
3.  **Uiterlijk is geen samenstelling.** Staat er *look*, *print*, *effect*, *imitation*, *inspired by* of iets vergelijkbaars bij de materiaalterm, dan telt die term niet mee voor het stof-channel. Dit is de aanscherping van §3.1: daar gold uiterlijk al niet voor het **type**, hier geldt het ook niet voor het **channel**. *Leather look tiles*, *Animal & Leather Print Tiles* en *Grass & Leaves* — een glazen tegel met grasmotief — kwamen alle drie onder Bio-based terecht.
4.  **Bewijs uit alleen de productnaam telt niet.** *Rodruza Living Bricks*, gebakken kleisteen, kreeg drie channels omdat er "Living" in de merknaam staat.

**Houd de lijst smal.** Circular, Acoustic, Biophilic & Human-Centred, Smart & Responsive, Net Zero & Carbon en Energy & Resilience kunnen bij élk materiaaltype horen: beton kan circulair zijn, metaal kan akoestisch zijn. Meer combinaties hard uitsluiten is gokken met een ander gezicht.

### 3.6a De vangregels gemeten — 11-08-2026 · *nieuw in 1.2*

De vangregels zijn machinaal toetsbaar: ze vergelijken type en channel, zonder één tekst te lezen. Tegen de live database op 11-08-2026 staan **29 van de 3.244 materialen in overtreding**:

  ———————————————————————————————————————
  regel                                                                        records
  —————————————————————————- —————————————-
  §3.6.1 — mineraal of metallisch type draagt Bio-based & Living Materials   21

  §3.6.2 — Timber op een niet-Wood type                                      5

  §1.2 — meer dan drie channels                                              3
  ———————————————————————————————————————

De duurzaamheidsgroep uit §4.2 wordt nergens overtreden: geen enkel materiaal draagt meer dan twee van de vier.

De drie records die in §3.6.3 als voorbeeld staan — *Leather look tiles*, *Animal & Leather Print Tiles* en *Grass & Leaves* — staan alle drie nog steeds fout, net als *Rodruza Living Bricks* uit §3.6.4. De vaststelling van 31-07 heeft dus niet tot correctie in de database geleid. Dat is het eerste, goedkoopste werk van de eerstvolgende ronde.

**Open besluit — bio-minerale hybriden.** Onder de 21 §3.6.1-gevallen zitten twee soorten. De ene soort is de uiterlijksfout waarvoor de regel bedoeld is: een keramische tegel met leerprint, een glazen tegel met grasmotief. De andere soort is inhoudelijk verdedigbaar: *Hemp concrete*, *Corcrete* (kurk in beton), *Eggshell Ceramic*, *MyCera* (mycelium) — daar zit de biobased component aantoonbaar in de samenstelling, niet in de afbeelding.

De regel is bewust hard geformuleerd en die hardheid is de reden dat hij werkt. De vraag is of er een uitzondering komt voor materialen waarbij de biobased grondstof aantoonbaar onderdeel van de samenstelling is, of dat deze materialen hun verhaal via Circular of Material Futures moeten vertellen. **Dit is een redactioneel besluit; tot het genomen is blijft §3.6.1 onverkort gelden en worden deze records apart voorgelegd in plaats van automatisch gecorrigeerd.**

### 3.7 Bamboe — besloten 11-08-2026 (1.3)

Bamboe gaat naar **Wood**. Botanisch is bamboe een gras, maar §3.2b stuurt twijfel tussen hout en biobased al naar Wood, en het publiek zoekt bamboevloeren en -panelen onder hout. **Uitzondering:** bamboevezel in een polymeermatrix volgt §3.2 en wordt Composites. Timber mag bij type Wood, ook bij bamboe — daarmee vervalt het voorbehoud in §3.6.2.

Papier en karton zijn **niet** open: §3.2 wijst cellulosevezel uit oud papier expliciet toe aan Bio-based (excl. Wood).

## 4. De elf channels

Channels zijn **redactionele verhaallijnen**, geen volledigheidseis. Een channel toekennen betekent: dit materiaal hoort in dat verhaal thuis, niet dat het er technisch aan raakt.

  ————————————————————————————————————————————-
  Channel                             Toekennen wanneer
  ———————————-- ————————————————————————————————-
  Bio-based & Living Materials        Biobased grondstof of levend/gegroeid materiaal is de kernpropositie

  Circular                            Gerecycled, reststroom, hergebruik, retourneerbaar, biologisch afbreekbaar als expliciete claim

  Biophilic & Human-Centred           Welzijn, natuurbeleving, tactiliteit of gezondheid in de binnenruimte

  Acoustic                            Geluidsabsorptie of -isolatie is een genoemde functie

  Timber                              Constructief hout en houtbouw

  Smart & Responsive                  Reageert op licht, warmte, elektriciteit, vocht of aanraking

  New Making                          Productiewijze is de innovatie: printen, robotica, nieuwe fabricage

  Material Futures                    Experimenteel, onderzoeksfase, nog geen marktproduct

  Net Zero & Carbon                   CO₂-reductie, -opslag of -neutraliteit met een concrete claim

  Energy & Resilience                 Energieprestatie, isolatie, klimaatbestendigheid

  Regenerative                        Herstelt actief een systeem: bodem, biodiversiteit, ecosysteem
  ————————————————————————————————————————————-

Naast deze elf staan vier legacy channels (Sustainable, Lightweight, Translucency, Leisure & Hospitality) die worden uitgefaseerd, en dertien resttermen die nog content dragen. Aan geen van beide wordt nog toegekend.

### 4.1 Uitsluitcriteria

-   **Niet toekennen op basis van een terloopse vermelding.** "Duurzaam geproduceerd" zonder onderbouwing is geen Circular.
-   **Niet toekennen op toepassing.** Een materiaal dat *in* een gezondheidszorgproject is gebruikt, is daarmee niet Biophilic.
-   **Material Futures sluit marktproducten uit.** Is het te koop, dan is het geen future.
-   **Regenerative is de strengste.** Minder CO₂ uitstoten is Net Zero; een ecosysteem actief herstellen is Regenerative.

### 4.2 De duurzaamheidsgroep — maximaal twee

**Bio-based & Living Materials · Circular · Net Zero & Carbon · Regenerative.**

Uit deze vier maximaal twee per materiaal. Kiezen op basis van de sterkste, best onderbouwde claim. De vrijgekomen plek gaat naar het functionele of typologische channel (Acoustic, Smart & Responsive, Energy & Resilience, New Making, Timber, Biophilic), zodat het materiaal vindbaar blijft voor wie op functie zoekt.

Zonder deze regel vult elk biobased materiaal zijn drie plekken met duurzaamheid en verdwijnt het uit het channel waar de doelgroep het zoekt.

### 4.3 Nul channels

Een geldige uitkomst. Deze materialen worden apart opgeleverd, met een reden uit vier categorieën:

-   **generiek** — goed materiaal, geen thema; vindbaar via de filters
-   **te weinig info** — excerpt te dun; redactionele aanvulling nodig
-   **kandidaat nieuw channel** — met voorgestelde noemer
-   **hoort er niet meer** — verlopen merk, niet meer verkrijgbaar; input voor legacy

Nieuwe channels worden **alleen** voorgesteld bij een cluster van tientallen materialen onder dezelfde noemer. Nooit bij losse gevallen — de lijst van elf blijft.

**Stand op 11-08-2026:** 1.251 materialen dragen nul actieve channels, waarvan 1.189 er nooit één hadden en 62 er alleen legacy-channels op hebben staan. Dat is 37% van het bestand dat via geen enkele channel-ingang te vinden is.

## 5. Afgeleide eigenschappen

**Wel voorstellen**, uitsluitend wanneer de tekst het expliciet stelt, gemarkeerd als afgeleid en ter bevestiging door de redactie:

`biobased_content` · `recycled_content` · `upcycled_content` · `renewable` · `reduces_waste` · `climate_neutral`

Deze velden zijn nu vrijwel leeg — 1 van de 3.244 — terwijl vier channels erop leunen; dit is hetzelfde gat waarop de compare-pagina wacht. Omdat het invullen dezelfde leesbeweging vraagt als het toekennen van channels, is het efficiënt om beide in één doorloop te doen in plaats van de teksten twee keer te lezen.

**Niet voorstellen.** Brandklasse, hardheid, krasvastheid, temperatuurbereik, chemische weerstand, akoestische waarden. Dat zijn feitelijke productclaims met aansprakelijkheid; die komen van de leverancier of het datasheet.

## 6. Output per materiaal

  —————————————————————————————
  Veld                                Inhoud
  ———————————-- —————————————————
  `type_voorstel`                     Eén van de elf types

  `type_zekerheid`                    hoog / midden / laag

  `channels_voorstel`                 0--3 channels, pipe-gescheiden

  `channels_zekerheid`                hoog / midden / laag

  `geen_channel_reden`                Eén van de vier categorieën uit §4.3, indien leeg

  `eigenschappen_voorstel`            Alleen §5-velden, met de letterlijke tekstgrond

  `motivering`                        Eén regel, welke regel is toegepast
  —————————————————————————————

Sortering van de reviewlijst: **laagste zekerheid bovenaan**. De redactie leest de twijfelgevallen, niet de 3.244.

Dit formaat geldt ongeacht wie het voorstel maakt. Een handmatig gelezen record levert dezelfde velden op als een machinaal voorgesteld record; alleen de manier waarop de zekerheid tot stand komt verschilt.

## 7. Toepassing — besloten 11-08-2026 (1.3)

**Besluit: er wordt gelezen, niet geteld, en het lezen gebeurt door Claude.**

De mislukte ronde van juli telde woordfrequenties. Het probleem was niet het percentage maar de aard van de fouten: een teller ziet niet dat *Rodruza Living Bricks* gebakken kleisteen is. Claude leest de volledige beschrijving van elk record — die is publiek beschikbaar via de CMS-API, geen enkel record is leeg, de mediaan is 828 tekens.

De uitvoering loopt per materiaaltype, in blokken, en levert per blok drie stapels:

- **Ongewijzigd** — type klopt, channels blijven zoals ze zijn. Geen script, geen review.
- **Zeker** — zekerheid hoog of midden op beide velden. Gaat via het WP-CLI-script, met terugdraaibestand.
- **Twijfel** — zekerheid laag op minstens één veld. Komt op de reviewlijst.

Twee vangrails horen bij elke ronde. De machinale toets uit §3.6a draait ná het lezen over het hele blok; een blok met overtredingen wordt niet aangeboden. En de redactie controleert per blok **twintig willekeurige records uit de zeker-stapel**; bij meer dan twee fouten gaat het blok terug.

**Eén uitzondering op de zeker-stapel:** een channel dat de redactie eerder heeft toegekend en dat in het voorstel **verdwijnt**, gaat altijd naar de reviewlijst, ook bij hoge zekerheid. Een channel toevoegen aan een leeg record kan wel automatisch. Verdwijnt hetzelfde channel bij tientallen records om dezelfde reden, dan wordt dat als één patroonbesluit voorgelegd en niet als tientallen losse regels.

Versie 1.0 en 1.1 gingen uit van een geautomatiseerde ronde die voorstelt, met de redactie als toetsende partij. Die ronde is één keer gedraaid, haalde 68% eerste keuze en 90% binnen de top drie, en werd toch teruggedraaid — niet vanwege het percentage maar vanwege de aard van de fouten, die in §3.6 zijn vastgelegd. In de sessies daarna is de werkafspraak ontstaan dat er gelezen wordt in plaats van geteld.

Beide werkwijzen zijn met deze norm verenigbaar, en ze verschillen in doorlooptijd met een factor die er echt toe doet: bij 1.189 records zonder channel is dat het verschil tussen een paar ronden en een paar maanden. **De keuze ligt bij Jeroen en Sigrid.** Tot die keuze gemaakt is geldt in beide gevallen:

-   De vangregels uit §3.6 worden vooraf toegepast, niet achteraf gecontroleerd. Een onmogelijke combinatie wordt niet voorgesteld.
-   Elk voorstel draagt een `motivering` die naar een regel in dit document verwijst.
-   Zekerheid *laag* is geen zwaktebod maar de bedoelde uitkomst bij twijfel (§1.5).
-   Wat de redactie eerder heeft toegekend wordt niet stilzwijgend overschreven; een afwijkend voorstel is een voorstel, geen correctie.

## 8. Terugschrijven · *nieuw in 1.2*

Een goedgekeurd voorstel wordt via WP-CLI teruggeschreven, uitgevoerd door de backend-ontwikkelaar. Nooit met de hand, nooit via losse plugins of mu-plugins; alle PHP hoort in de bestaande MaterialDistrict-plugin.

-   Het script raakt **uitsluitend** de record-id's die in het goedgekeurde besluitbestand staan.
-   **Dry-run eerst**, met een telling van wat er zou wijzigen.
-   **Terugdraaien hoort bij de levering.** Het script legt per record de oude term-id's vast en er komt een terugdraaiscript mee dat die herstelt. Terugdraaien betekent oude waarden terugzetten, niet records verwijderen.
-   **Lege waarden overschrijven nooit gevulde velden.**
-   Een correctie op een handmatig door de redactie gezette waarde vereist expliciete goedkeuring per record, niet per blok.
