# Importprotocol

> **Normdocument.** Geldt voor elk bestand dat Jeroen aanlevert: beursbezoekers, exposanten,
> standbemanning, sprekers, boekkopers, abonnees, Moneybird-exports, verrijkingsbestanden.
>
> **Te delen aan het begin van elke importsessie.**
>
> **Het protocol kent twee trappen.** Trap 1 is filteren: wat gaat er wél in en wat niet. Trap 2 is
> importeren: alles wat door trap 1 komt, wordt aangemaakt of bijgewerkt. Tussen de twee zit één
> handeling van Jeroen — een blik op de lijst en het woord "ga".
>
> **De harde eis aan beide trappen: Jeroen vult niets in.** Geen kolom om aan te vinken, geen
> "beoordeel jij deze", geen bak "onbeslist". Claude beslist; Jeroen leest en corrigeert waar hij
> het er niet mee eens is.
>
> Versie 4.8 · 25-08-2026 · toelatingsladder (§1.3), vier stappen in vaste volgorde (§1.6),
> kandidaatstap vóór de sitescan (§2.1). Zie §Status.
>
> **Een import mag nooit meer records aanmaken dan hij kan verantwoorden. Koppelen is gratis;
> aanmaken kost.**

---

# TRAP 1 — FILTEREN

**Input:** één bestand, plus de bron en de brondatum.
**Output:** één werkboek met **twee tabbladen**. Meer niet.

| Tabblad | Wat erin staat |
|---|---|
| **1. WEL** | Gaat naar de website — aanmaken of bijwerken, dat onderscheid valt in trap 2 |
| **2. NIET** | Gaat niet, met per regel de reden |

Beide tabbladen alfabetisch, hoofdletterongevoelig gesorteerd.

## 1.1 · Elke regel krijgt een besluit — er is geen derde bak

**"Onbeslist" bestaat niet.** Kan Claude het niet vaststellen, dan gaat de regel naar **NIET**, met
als reden "niet vast te stellen" en wat er wél gevonden is. Zo landt er nooit iets in de database
op een gok, en kan Jeroen de NIET-lijst doorlopen en zeggen "die drie wel".

Een tabblad met honderden regels "nakijken" is geen levering. Als Claude dat produceert, heeft hij
zijn werk doorgeschoven.

## 1.2 · Bewijsvolgorde — gebruik eerst wat er ís

In deze volgorde. Stop bij het eerste harde bewijs.

**1. Wat het bestand zelf zegt over gedrag.** Dit is het sterkste en het goedkoopste bewijs, en
het wordt het vaakst vergeten. Een factuurregel vertelt wát iemand gekocht heeft:

| Koopt | Betekent |
|---|---|
| materiaalpublicatie · material publication · site membership | **hard bewijs materiaalleverancier** — het bedrijf had materiaal op het platform |
| alleen boeken | geen leverancier |
| advertentie · webspecial · nieuwsbrief-sponsoring | adverteerder, geen bewijs van een materiaalpropositie |
| stand · beursdeelname · innovatiefonds · innovation hotspot | **geen bewijs** — uitgeverijen, scholen, stichtingen en certificeerders kopen die ook |

Die laatste regel is uit schade geleerd: op 25-08-2026 bleek een indeling op "betaalde voor
beursdeelname of membership" 46 niet-leveranciers binnen te laten, waaronder vakmedia, vier
onderwijsinstellingen, een cateraar en een ingenieursbureau. Betalen bewijst een relatie, geen
propositie.

**2. De website van het bedrijf.** Niet alleen de homepagetitel — ook de product- of
assortimentspagina als de voorpagina te dun is. Zegt de site dat het bedrijf materialen maakt,
levert of verwerkt, dan is dat bewijs.

**3. Opzoeken.** Staat er geen website in de bron, of is het domein dood of geparkeerd, dan zoekt
Claude het bedrijf op: KvK-handelsregister, VIES, zoekmachine. **Een leeg websiteveld in de bron is
geen reden om op te geven.** Op 25-08-2026 gaf Claude 164 bedrijven op omdat het veld leeg was;
dat is de stap overslaan, niet de stap uitvoeren.

**4. Conflict tussen koopbewijs en website?** Koopbewijs wint, met één uitzondering: koopt een
stichting, school of certificeerder een materiaalpublicatie, dan gaat de regel naar NIET met de
tegenspraak erbij.

## 1.3 · De toelatingsladder

Vervangt de oude toets, die eiste dat een bedrijf "materialen maakt, levert of verwerkt" en
adviesbureaus categorisch uitsloot. Beide waren te smal. Vastgelegd in **B83**.

| Laag | Wat het is | Toelating |
|---|---|---|
| **Grondstof** | De substantie waaruit een materiaal is opgebouwd — gerecycled denimvezel, gerecycled schuim, hennep, bamboe. Wordt zelf nooit als sample aangeboden. | Ja |
| **Materiaal** | Het catalogusobject: wat een voorschrijver zoekt, vergelijkt en als sample aanvraagt. | Ja — dit is de kern |
| **Product** | Een afgewerkt ding gemaakt van materialen: een bank, een stoel, een raamdecoratiesysteem. | Nee, tenzij de uitzondering hieronder |
| **Dienst** | Ontwerp, advies, bewegwijzering, maquettebouw, projectmanagement. | Nee |

**De begrenzing: het ruimtelijke domein.** Over alle lagen heen. Gebouwen, interieurs,
buitenruimtes, decor, jachten en boten: alles wat het materialiseren van ruimte betreft. Hierop
vielen Heigo (bedrijfskleding) en Hateha (elektrotechniek) af — niet omdat ze niets maken, maar
omdat ze buiten het domein vallen.

> **De productuitzondering, in één vraag:** wordt dit gekozen of voorgeschreven vanwege de
> *duurzame* materialen waar het van gemaakt is?

Het woord *duurzaam* is daar de kern van, geen bijvoeglijk naamwoord. Het materiaal moet een
verkoopargument zijn, geen verantwoording achteraf: het staat bij het aanbod, in de collectie, op de
productpagina. Staat het alleen op een duurzaamheidspagina onder "Over ons", dan telt het niet.

*IJkpunt: ROFA maakt projectmeubilair — een product, dus in principe buiten. Maar drie van de zes
blokken op de eigen homepage gaan over herstoffering, circulariteit en duurzame stoffen, bij de
collectie. ROFA komt binnen. Bece verkoopt raamdecoratie zonder één woord over waar het van gemaakt
is: dezelfde laag, geen materiaalverhaal, valt af.*

**Wat er ook nog moet kloppen.** Het is een bedrijf, geen school en geen stichting. Er is een
aantoonbare identiteit: KvK, btw of een eigen domein. *Dat laatste is een voorwaarde om iets aan te
máken, geen bewijs van identiteit voor het samenvoegen met een bestaand record — zie §2.1.*

**Hoe een bedrijf aan het materiaal komt, is geen drempel.** Fabrikant, producent, merkeigenaar,
importeur, agent en handelaar dragen allemaal de manufacturer-rol; het verschil wordt vastgelegd als
`brand_type` (**B82**). Spadon verkoopt Italiaanse tegels van Coem en Mutina en maakt zelf niets —
die komt binnen, met `handelaar` als type.

**Persoon** — naam én e-mailadres aanwezig. De rol volgt uit §1.6; kan die niet worden vastgesteld,
dan blijft het rolveld leeg met een reden (**B85**).

## 1.4 · Wat het WEL-tabblad bevat

Per bedrijf of persoon: naam, de grond van het besluit in één regel, en de identificerende velden
die de bron levert (website, e-mail, land, KvK, btw). Verder niets — geen lege kolommen, geen
invulvakjes.

## 1.5 · Wat het NIET-tabblad bevat

Per regel: naam, reden, en het bewijs waarop de reden steunt. Zo is het na te lopen zonder dat
Jeroen iets hoeft op te zoeken.

**Jeroens correcties op de NIET-lijst zijn veldgesloten.** Zegt hij bij een bedrijf "deze wél" of
"deze niet", dan ligt dat vast en zet geen enkele latere import het terug.

## 1.6 · De vier stappen, in vaste volgorde

De volgorde is niet willekeurig. De eerste twee stappen kunnen niets kapotmaken; de laatste twee
wel. **Koppelen en aanmaken zijn twee besluiten** — in het oude protocol zaten ze aan elkaar vast, en
dat is waarom een bezoekersbestand 2.465 architectenbureaus en hogescholen dreigde aan te maken.

**Stap 1 — Koppelen aan wat er al staat.** Kandidaten zoeken op alles wat de bron levert: exact
domein, domeinstam én bedrijfsnaam (**B84**). Match je, dan wordt de user aangemaakt en gekoppeld.
Er wordt in deze stap niets aan de bedrijfskant aangemaakt.

**Stap 2 — Het bestaande merk bijwerken.** Het personenbestand draagt vaak bedrijfsgegevens die het
merkrecord mist. Een lege cel overschrijft nooit een gevulde waarde; een handmatig gecorrigeerd veld
staat op slot; bronautoriteit gaat vóór datum (§2.4). Dit is de stap die de ronde van augustus 2026
oversloeg, en de reden dat ~193 merken hun verrijking misliepen.

**Stap 3 — De onbekende lijst.** Wat overblijft: eigen bedrijfsdomein, geen merk erachter.

**Stap 4 — De site lezen.** Niet gokken op de bedrijfsnaam, maar ophalen wat er staat en daar de
ladder van §1.3 op toepassen. Bij een twijfelgeval ook de collectie- of productpagina, want daar
blijkt of het materiaal een koopargument is.

**Mislukking is geen oordeel.** Een timeout, bot-blokkade of lege pagina is een *toestand*, geen
bevinding. Vastgelegd wordt niet alleen het besluit maar ook de grond ervoor: "site gelezen, geen
duurzaam materiaalverhaal" is klaar, "site onbereikbaar" wordt automatisch opnieuw geprobeerd met
oplopende tussenpozen (**B85**). Niemand scant iets met de hand.

*In een testronde gaf `rofa.nl` een lege pagina terug terwijl de site gewoon werkt. Zonder deze
regel was ROFA als specifier weggeschreven en nooit meer bekeken.*

### Twee vallen die de scan zelf blootlegde

`heigo.nl` staat in het bronbestand als "CLS-Tex", maar de site is Heigo Bedrijfskleding. `hateha.nl`
staat als "JUNG", maar Hateha is de Nederlandse importeur van JUNG. Wie daar blind op aanmaakt, maakt
de importeur aan onder de naam van de fabrikant. **Naam uit de bron en identiteit van het domein zijn
twee verschillende dingen.**

## 1.7 · Wat er aan Jeroen wordt voorgelegd

Het oordeel of een bedrijf bij MaterialDistrict hoort is **commercieel, niet redactioneel**. Het gaat
naar Jeroen, niet naar Sigrid.

Wat hij krijgt is geen lijst om na te lopen maar een voorstel: de bedrijven die als brand toegevoegd
worden, per stuk met de zin uit de site waarop het oordeel steunt, plus de productkeuzevraag waar die
speelt. Hij beoordeelt het patroon en het getal, niet honderden losse regels (`mutatieprotocol.md`
poort 4).

---

# TRAP 2 — IMPORTEREN

Start pas nadat Jeroen "ga" heeft gezegd op de WEL-lijst. Vanaf dat moment is het onderscheid
tussen aanmaken en bijwerken werk van Claude, niet van Jeroen — voor hem is het één opdracht.

## 2.1 · Staat het er al? — kandidaten zoeken, dan pas beslissen

**Identiteit en relatie zijn twee besluiten** (**B84**). Zoek eerst kandidaten op álles wat de bron
levert; beslis daarna alleen op wat hard genoeg is.

| Ingang | Wat het vaststelt |
|---|---|
| Zelfde KvK of btw · zelfde e-mailadres · zelfde bron-ID | **hard bewijs** — bijwerken |
| Exact domein | sterk signaal (B46) — bijwerken ná verificatie |
| **Domeinstam**, extensie genegeerd | sterk signaal — verifiëren |
| **Bedrijfsnaam** | het merk *bestaat* — genoeg om géén duplicaat te maken, nooit genoeg om te koppelen |

**De relatie persoon → merk is een apart besluit.** Daarvoor is een bedrijfsdomein nodig. Een
schooladres of een vrije provider legt nooit een dienstverband vast: "Blueblocks" matchte op naam
terwijl de persoon vanaf `student.hku.nl` mailde — een stagiair, geen medewerker. Het merk wordt
herkend, er wordt niets aangemaakt, en er wordt niets beweerd over waar die persoon werkt.

### Drie vallen in de domeinstam

1. **Platformdomeinen.** `ioanacaramiciu.wixsite.com` en `manueljouvin.wixsite.com` delen de stam
   "wixsite". Naast de social-lijst hoort een platformlijst — wixsite, squarespace, myshopify,
   wordpress.com, weebly. Op zo'n domein wordt de match afgekeurd.
2. **Samengestelde landextensies.** `aub.ac.uk` en `uibk.ac.at` delen niet de stam "ac". Zonder een
   lijst van tweedelige suffixen worden twee Britse universiteiten en een Oostenrijkse één merk.
3. **De stam is niet gelijk maar bevat elkaar.** Moso mailt vanaf `moso.eu`, het merk staat op
   `moso-bamboo.com`. Zo ook Arpa Industriale tegenover Arpa Nederland. Dit is een naamvraag, geen
   domeinvraag — vandaar de derde ingang.

**Naamvergelijking is strak of hij is gevaarlijk.** Exact na normalisatie, of bevatting waarbij de
kortste naam minstens acht tekens telt en het lengteverschil hooguit vier is. Ruimer levert
JUNG–Jungbecker en Laser Whale–Hale op.

**De kandidaatstap gaat vóór de sitescan.** In de testronde scheelde dat 25 domeinen die niet
opgehaald hoefden te worden, waaronder dertien merken die al bestonden mét materialen.

## 2.2 · Bedrijf of persoon — dat bepaalt welke gegevens je zoekt

| | Bedrijf | Persoon |
|---|---|---|
| E-mail | algemeen adres van de website (`info@`, `contact@`) | het persoonsgebonden adres, nooit een algemeen adres |
| Telefoon | algemeen nummer van de website | doorkiesnummer of mobiel, alleen als de bron dat geeft |
| Adres | vestigingsadres | alleen als de bron het geeft — niet opzoeken |
| Identiteit | KvK, btw, domein | e-mailadres |

**Voor een persoon wordt niets opgezocht op internet.** Bedrijfsgegevens zijn openbaar,
persoonsgegevens niet. Ontbreekt er iets bij een persoon, dan blijft het leeg.

## 2.3 · Aanvullen wat ontbreekt

Ontbreekt een KvK-nummer, btw-nummer, telefoonnummer of algemeen e-mailadres bij een **bedrijf**,
dan zoekt Claude het op. Volgorde, van goedkoop naar duur:

1. Andere regel in hetzelfde bestand of in een parallel bestand.
2. Het e-maildomein van de eigen contactpersonen.
3. De bedrijfswebsite — colofon, contactpagina, algemene voorwaarden.
4. KvK-handelsregister.
5. VIES, om het btw-nummer te valideren en de geregistreerde naam terug te krijgen.
6. Zoekmachine, alleen om een kandidaat te vinden.

**Regels.** Opgezochte waarden dragen bronlabel `research` en zijn de zwakste bron: ze vullen
alleen lege velden en overschrijven nooit. Per aanvulling wordt gelogd wat er gezocht is, wat er
gevonden is en waarom het aan dít bedrijf hangt. Levert het niets op, dan blijft het veld leeg mét
reden — nooit gokken.

## 2.3b · De bron in vorm brengen — splitsen en schoonmaken

Een bronbestand is zelden gebouwd zoals de database het wil. Deze stap gaat vóór het matchen.

### Wat staat er in deze kolom?

Claude stelt per kolom vast wat hij bevat, en gaat niet af op de kolomnaam. Een kolom
"Organisatie" bevat in de praktijk regelmatig een persoonsnaam.

**Bedrijfsnaam en persoonsnaam gelijk?** Dan is het een eenmanszaak of ontwerpstudio. Er komt één
**brand** met die naam én één **persoon** als contact eraan gekoppeld — geen keuze tussen de twee.
In het MDU-bestand van 2022 gold dat voor tientallen regels ("Agne Kucerenkaite", "Studio Chardé
Brouwer").

**Bedrijf en persoon in één regel?** Splitsen in twee records, met de relatie ertussen. Een
persoonsnaam belandt nooit in een brand-veld.

### Volledige naam splitsen

Staat de naam in één veld, dan wordt hij gesplitst in **voornaam · tussenvoegsel · achternaam**.

- Nederlandse tussenvoegsels worden herkend en apart gezet: `van`, `van der`, `van den`, `de`,
  `den`, `ter`, `te`, `op de`, `in 't`, en de Belgische varianten.
- Staat de naam omgekeerd (`Muijnck, Veerle de`), dan wordt dat herkend aan de komma.
- Titels en achtervoegsels (`ir.`, `drs.`, `MSc`) worden verwijderd.
- Bij twijfel — één woord, drie of meer woorden zonder tussenvoegsel, een naam die ook een
  bedrijfsnaam kan zijn — gaat de regel niet naar NIET maar wordt de volledige naam in
  `achternaam` gezet met een notitie. Een persoon verliezen is erger dan een veld verkeerd vullen.

### Kapitalisatie

| Wat | Regel | Waarom |
|---|---|---|
| **Plaatsnaam** | **automatisch rechtgezet** naar de correcte schrijfwijze: `AMSTERDAM` → `Amsterdam`, `den haag` → `Den Haag`, `'S-HERTOGENBOSCH` → `'s-Hertogenbosch` | Een plaatsnaam heeft één juiste vorm; die is geen keuze |
| **Persoonsnaam** | automatisch: eerste letter hoofdletter, tussenvoegsel klein, `MacDonald` en `de Vries` blijven correct | idem |
| **Straatnaam** | automatisch, huisnummer en toevoeging gescheiden | idem |
| **Bedrijfsnaam** | **voorstel, nooit automatisch** | Een merknaam is merkeigendom. `3M` mag geen `3m` worden |

Dat onderscheid is scherper dan het in v3.2 stond: daar vielen plaatsnamen onder "presentatiekeuze"
en gingen ze als voorstel. Onterecht — `AMSTERDAM` is geen keuze maar een importfout.

### Rechtsvorm

Uniform naar de notatie **zonder punten**: `B.V.` → `BV`, `N.V.` → `NV`, `b.v.` → `BV`. Dat is de
meest voorkomende vorm in de eigen database en de notatie van het KvK-handelsregister zelf.
Internationale vormen (`GmbH`, `Ltd`, `Inc`, `S.r.l.`, `SA`, `BVBA`) blijven zoals het land ze
schrijft.

Dit gaat als **één patroonbesluit** langs Jeroen, niet als losse regels — en daarna is het norm en
wordt het niet per import opnieuw gevraagd.

### Dubbele records binnen één bron

Eén bron bevat vaak dezelfde partij twee keer, met verschillende schrijfwijze
(`ARCHIPOINT BELGIUM B.V.` naast `Archipoint Belgium B.V.`). Die worden binnen de bron ontdubbeld
vóór het matchen tegen de database, op dezelfde bewijsregels als §2.1 — anders krijgen twee regels
van hetzelfde bedrijf twee tegengestelde besluiten.

---

## 2.4 · Wat overschrijft wat

| In de database | In de bron | Uitkomst |
|---|---|---|
| leeg | gevuld | aanvullen |
| gevuld | leeg | niets doen |
| gevuld | gevuld, gelijk | alleen de herkomst bijwerken |
| gevuld | gevuld, verschillend | de sterkste bron wint |

**Rangorde bij conflict:** handmatige correctie (staat op slot, wint altijd) → Moneybird →
eigen dashboardinvoer door het merk → exposantenregistratie → bezoekersregistratie → `research`.
Binnen dezelfde rang wint de recentste **bevestigde** waarde — het moment waarop de waarde geldig
was, niet wanneer het bestand is aangeleverd.

**Een lege cel wist nooit iets.** Wissen gebeurt alleen op expliciete opdracht.

## 2.5 · Welke velden een import mag raken

**Wel:** naam · website · e-mail · telefoon · adres · postcode · plaats · land · KvK · btw ·
socials. Bij personen: voornaam · achternaam · e-mail · telefoon · functie · sector · adres.

**Nooit:** beschrijving · slug · logo · channels · keywords · applications · video's · gallery ·
downloads. Dat is redactie- en merkwerk en is niet uit een bronbestand terug te halen.

## 2.6 · Notatie

Alles gaat genormaliseerd de database in, en normaliseren gebeurt **vóór** het matchen — een
niet-genormaliseerd domein matcht niet.

| Veld | Norm |
|---|---|
| E-mail | kleine letters, getrimd |
| Website | `https://`, zonder `www.`, zonder slash, domein in kleine letters |
| Telefoon | E.164 — `+31631968244`. Landcode niet af te leiden? Leeg laten mét reden |
| Land | ISO 3166-1 alpha-2 |
| Postcode NL | `1017 CE` — vier cijfers, spatie, twee hoofdletters |
| Plaats | correcte schrijfwijze, automatisch rechtgezet (§2.3b) |
| Persoonsnaam | gesplitst in voornaam · tussenvoegsel · achternaam (§2.3b) |
| Rechtsvorm | `BV` / `NV` zonder punten; internationale vormen ongewijzigd |
| Btw | landcode + alfanumeriek, geen punten of spaties, VIES-gevalideerd |
| KvK | acht cijfers, met voorloopnul |
| Socials | volledige `https://`-URL |

**Automatisch, geen oordeel nodig:** HTML-entiteiten, dubbele spaties, hoofdletters in domeinnamen,
ontbrekende protocollen, kapitalisatie van plaats-, straat- en persoonsnamen, naamsplitsing.

**Voorstel, één keer per patroon:** kapitalisatie van bedrijfsnamen en de rechtsvorm — want een
merknaam is merkeigendom.

## 2.7 · Activity — één logboek

Een **activity** is wat een brand of persoon op het platform doet: een sample aanvragen, een
brochure downloaden, doorklikken naar een website, een channel volgen, iets bookmarken, een boek
bestellen, op de beurs staan.

**Eén logboek, twee filters** (B76). Filter op `subject` → "wat heeft deze persoon gedaan". Filter
op `object` → "wat is er bij mijn bedrijf gebeurd" — dat is wat een member in zijn dashboard ziet
als *Interactions*. Dezelfde rijen, andere kant van de relatie. Geen tweede systeem.

**Loggen is altijd volledig** (B77), inclusief wie het deed. Wat een member te zien krijgt is een
aparte laag: **met naam** wanneer de persoon zelf contact zocht (sampleaanvraag, contactformulier,
brochuredownload), **geteld zonder naam** bij gedrag (klik, bekeken, bookmark, follow). Niet loggen
is onherstelbaar; niet tonen is een instelling. Het is **een eigen record, geen veld**: één entiteit kan er onbeperkt veel dragen.

### Het woord "event" wordt hier niet gebruikt

Dat woord betekent op dit platform al twee andere dingen, en die drie door elkaar halen is een
gegarandeerd misverstand — het is op 25-08-2026 ook daadwerkelijk misgegaan.

| Wat | Waar het leeft | Heeft dit met interacties te maken? |
|---|---|---|
| **Agenda-item** — post type `event` | WordPress, publieke agenda, 170 records incl. derden | **Nee. Nul.** |
| **Analytics-event** — `material_viewed`, `channel_followed` | aparte analytics-database (RDS) | **Nee.** Gedragslogging, hoog volume |
| **Activiteit** (`activity`) | naast de brand of user | dít is het |

**Wat er moet veranderen aan het bestaande model.** De huidige `Interaction` bewaart de gegevens
van de aanvrager **inline** — naam, bedrijf, e-mail, adres — en verwijst niet naar een user- of
brandrecord. Dat is een lead-formulier, geen relatiegeheugen. Gevolg vandaag: een sampleaanvraag
van een ingelogde gebruiker is niet gekoppeld aan die gebruiker, dus "deze persoon vroeg vier
samples aan bij drie merken" is niet te beantwoorden.

Wat erbij moet:

| Veld | Waarom |
|---|---|
| `subject_type` + `subject_id` | wie het deed — `brand` of `user`. Nu ontbreekt dit volledig |
| `object_type` + `object_id` | waar het gebeurde — brand, material, editie. Nu een tekstveld `page` |
| `edition` | alleen bij beursinteracties |
| `source` + `batch_id` | herkomst, voor import en terugdraaien |

De bestaande inline-velden blijven bestaan als **terugval** voor wie geen record heeft — een
anonieme aanvrager houdt zijn gegevens in de rij zelf. Is de persoon wél bekend, dan wint
`subject_id`.

**Een activity raakt de publieke agenda (Events) nooit.** Geen koppeling, geen afhankelijkheid, geen
gedeelde tabel. Dat de agenda toevallig een pagina heeft voor MDU 2022 is voor het Activity-logboek
irrelevant.

### De vorm

| Kolom | Wat |
|---|---|
| `subject_type` · `subject_id` | wie het deed — `brand` of `user` |
| `object_type` · `object_id` | waar het gebeurde — brand, material of editie |
| `type` | wat er gebeurd is — gesloten lijst hieronder |
| `editie` | bij beursfeiten: welke editie. Leeg bij feiten die er niet bij horen |
| `datum` | wanneer |
| `detail` | vrij veld — standnummer, ordernummer, titel |
| `bron` · `batch_id` | herkomst |

### Type — gesloten lijst

De vier bestaande types blijven; de rest komt erbij.

**Bestaand (niet hernoemen):** `request` · `brochure-download` · `info` · `contact`

**Beurs:** `exposant` · `standbemanning` · `bezoeker_geregistreerd` · `bezoeker_aanwezig` ·
`no_show` · `spreker`

**Commercie:** `boekbestelling` · `ticketbestelling` · `materiaalpublicatie` · `membership` ·
`advertentie` · `innovatiefonds`

**Contact:** `abonnee`

De lijst groeit als er een type bij komt, maar hij is gesloten: geen vrije tekst.

*`sampleaanvraag`, `brochuredownload` en `contactformulier` staan hier bewust níét in — dat zijn de
bestaande `request`, `brochure-download` en `contact`. Twee namen voor hetzelfde is precies wat we
niet doen.*

### Editie is niet hetzelfde als agendapagina

Een **editie** is een intern object — MDU Utrecht 2019 t/m 2026 — dat bestaat voor relaties en
commercie. Dat drie edities geen agendapagina hebben doet er niet toe: ze hebben plaatsgevonden en
er zijn facturen van.

### Type en editie zijn twee kolommen, nooit één label

**Niet** `exhibitor_mdu2022` als samengestelde tekst. Wél `type = exposant` plus
`editie = MDU Utrecht 2022`. Een samengesteld label schrijf je één keer en filter je daarna nooit
meer: je kunt er niet op tellen, niet op sorteren, en elke schrijfvariant maakt een categorie bij.

Daarmee kan wat er gevraagd wordt: *personen die MDU 2022, 2023 én 2024 bezochten* · *exposanten
met meer dan één editie* · *wie stond er in 2019 en staat nog niet op het platform* · *wie kocht
ooit een boek maar nooit een ticket*.

### Waar de grens ligt met analytics

Een activity is **schaars en commercieel betekenisvol** en staat naast de entiteit. Een
analytics-event is **hoogvolume gedrag** en gaat naar RDS (besluitenregister B9, B10).

Een boekbestelling is een activity. Een paginaweergave is analytics. Een blijven staan
winkelmandje zit op de grens: het wordt als analytics gelogd en promoveert alleen tot activity
als er commercieel op gestuurd wordt.

### Één feit bestaat maar één keer

Sleutel: `subject_id + type + editie + datum`. Dezelfde bron twee keer importeren levert geen
tweede rij op.

### Jeroen noemt de editie

Bij elk bronbestand hoort, naast bron en brondatum, bij welke editie het hoort — als het een
beursbestand is. Claude leidt dat niet af uit bestandsnamen of datums.

## 2.8 · E-mailstatus — toestemming reist nooit mee

**Mailtoestemming wordt nooit overgenomen uit een bronbestand** (**B86**), ook niet wanneer het veld
netjes is bijgehouden. Alleen een handeling van de persoon zelf telt: een inschrijving, een keuze bij
registratie, een bevestigde aanmelding. Geïmporteerde contacten komen binnen met een lege mailstatus
en gaan dus geen mailing in.

*In de Insightly-export stond `EmailOptedOut` op `False` bij alle 5.445 contacten zonder één
uitzondering — de handtekening van een veld dat nooit is gebruikt. Een tweede veld was wél gebruikt,
met 419 expliciete inschrijvingen. Beide zijn onbruikbaar om dezelfde reden: ze zijn door medewerkers
ingevuld. Een vinkje in een CRM is een aantekening óver een persoon, geen keuze ván die persoon.*

**Een persoon zonder rol wordt niet gemaild** (B85). Geïmporteerde adressen gaan sowieso niet
ongevalideerd naar SES (B39).

## 2.9 · Accounts

Een import maakt **contactrecords**, geen inlogbare accounts (`md_account_kind = contact`). Een
account ontstaat pas als de persoon zelf handelt. Domeinkoppeling legt een verwachting vast
(`formatwood.com` → Formatwood) maar geeft nooit automatisch beheerrechten: de eerste persoon per
merk wordt handmatig goedgekeurd en laat daarna zelf collega's toe.

## 2.10 · Een nieuw merk begint als prospect

Een merk dat uit een personenimport ontstaat krijgt `record_status = prospect` (B47). Geen publieke
pagina, geen vermelding in het merkenoverzicht: alleen een record met een bron, een datum en een
bewijssoort. Wordt het niets, dan heb je een prospect te veel en niet een lege merkpagina op je site.

**De bewijssoort wordt per record vastgelegd en nooit weggemiddeld**, zodat achteraf te filteren is
op "alleen de merken die uit een beursdeelname komen". De drie soorten zijn niet even hard:

| Grond | Hardheid |
|---|---|
| E-maildomein matcht een bestaand merk | Geen oordeel nodig — het merk staat er al |
| De persoon stond zelf met een stand op MDU | Hard — presenteerde materiaal op een materialenbeurs |
| Zelfgerapporteerde hoofdactiviteit "Productie" | Zwak — zelfgerapporteerd; ruwweg de helft klopte niet |

*In augustus 2026 kostte het aanmaken van 287 records vijf minuten en het opruimen drie weken.*

**Terugdraaien kent twee vormen** (**B80**). Bestond het record vóór de import, dan herstelt
terugdraaien de vorige veldwaarden en wordt het record niet verwijderd. Maakte de import het record
zelf aan, dan mag terugdraaien het verwijderen. De grens loopt langs het **batch-ID**, nooit langs
een datumgrens of een namenlijst, en verwijderen gaat naar de prullenbak.

## 2.11 · Uitvoeren

Elke import draagt een **batch-ID**, elke rij een **rij-ID**. Het script draait in een
**transactie** — alles of niets. Terugdraaien gebeurt op batch-ID en herstelt de vorige
veldwaarden; het verwijdert geen records.

**Vóór uitvoering:** het terugdraaiscript ligt klaar. **Na uitvoering:** meten hoeveel velden per
veld gevuld zijn geraakt en dat vergelijken met wat de bron bood. In augustus 2026 klopte het
recordaantal wél en waren de velden leeg — dat is wat deze telling vangt.

---

## Rolverdeling

| Wat | Wie |
|---|---|
| Bron, brondatum **en editie** opgeven | **Jeroen** |
| Trap 1: filteren, twee tabbladen | Claude |
| Naar de NIET-lijst kijken en "ga" zeggen | **Jeroen** |
| Trap 2: matchen, opzoeken, normaliseren, script | Claude |
| Script draaien | Johan |
| Verificatie na afloop | Claude |

Jeroen doet twee dingen: bron en datum noemen, en één keer "ga" zeggen. Verder niets.

## Wat een import nooit doet

Een redactioneel veld schrijven · een gevulde waarde overschrijven met een lege · ontdubbelen op
naam · een handmatige correctie terugzetten · een afmelding opheffen · een inlogbaar account
aanmaken · persoonsgegevens opzoeken op internet · een adres mailbaar maken zonder validatie ·
draaien zonder terugdraaiscript · een waarde overnemen zonder normalisatie · **toestemming overnemen
uit een bron** · **een onbekende toestand als oordeel wegschrijven** · **een merk aanmaken op alleen
een naamtreffer** · **een relatie leggen op een schooladres of vrije provider**.

---

## Status

**v4.8 · 25-08-2026** — geschreven na vijf rondes waarin dit protocol tegen echte bestanden is
gehouden: het exposantenbestand van MDU2023 (125 rijen), de beurscatalogus van MDU2025 (135 records,
een Word-document zonder kolommen), de bezoekerslijst van MDU2023 (4.327 rijen), de terugdraailijst
van augustus en een CRM-export van 7.519 organisaties met 28.725 notities. Elke ronde brak iets.

Vervangen: **§1.3** (de toelatingstoets werd de toelatingsladder, B83) en **§2.1** (matchen kreeg de
kandidaatstap, B84). Nieuw: **§1.6** met de vier stappen in vaste volgorde, **§1.7** over wat er aan
Jeroen wordt voorgelegd. Herschreven: **§2.8** (toestemming reist niet mee, B86) en **§2.10** (een
nieuw merk begint als prospect, met de drie bewijssoorten en terugdraaien in twee vormen, B80).

Wat de rondes opleverden en waar het landde: de rij is niet de entiteit (§2.3b, een bezoekersbestand
telt tickets, geen personen) · ontdubbelen begint binnen de bron zelf · deelname is een gedateerd
feit en nooit een nieuw record · normaliseren vóór vergelijken · een gratis e-mailadres is geen grond
om een merk aan te maken, maar deelname wel.

Nieuwe besluiten: **B80** t/m **B87**. B80 herziet B37 regel 6 en B48.

**Vier punten blijven open** en worden niet ingevuld met een aanname. Zolang ze openstaan schrijft
geen importscript naar die velden: de enum van `account_type` (snoeien is een besluit, of het veld
wordt uitgelezen een opzoekvraag), de `wp_postmeta`-sleutels achter `vatNumber` en `chamberNumber`
met hun vulgraad, de waardenlijst van `record_status`, en of `brand.primary_user_id` is gebouwd. De
laatste drie rollen uit `brand-velden-uitdraai-v2.php`.

**v4.7 · 25-08-2026** — de naam is **Activity** geworden (B75); de agenda op de voorkant heet
**Events**. Toegevoegd: één logboek met twee filters (B76) en de zichtbaarheidslaag met twee
niveaus (B77) — loggen altijd volledig, tonen per type geregeld.

**v4.6 · 25-08-2026** — **één naam, één tabel: `interaction`.** Na `deelnamefeit`, `relatiefeit` en
`interactie` is de uitkomst dat de naam die er al is wint. `Interaction` staat live in het dashboard
met vier types; die worden uitgebreid in plaats van gedupliceerd.

Daarbij hoort een reparatie van het bestaande model: `Interaction` bewaart nu de gegevens van de
aanvrager inline en verwijst niet naar een user- of brandrecord. Daardoor is een sampleaanvraag van
een ingelogde gebruiker niet aan die gebruiker gekoppeld. Toegevoegd worden `subject_type`/
`subject_id`, `object_type`/`object_id`, `edition`, `source` en `batch_id`; de inline-velden blijven
als terugval voor anonieme aanvragers.

**v4.4 · 25-08-2026** — **het woord "event" is uit dit document verwijderd.** Het betekende al
twee andere dingen: het agenda-item (post type `event`, publieke content) en het analytics-event
(`material_viewed`, in RDS). Wat hier bedoeld wordt heette in die versie eerst
"relatiefeit" en daarna "activiteit"; sinds v4.7 is het **Activity** (B75). De soortenlijst is uitgebreid van acht naar zestien, in drie
groepen: beurs, commercie en contact. Toegevoegd: waar de grens ligt met analytics — schaars en
commercieel betekenisvol hoort naast de entiteit, hoogvolume gedrag gaat naar RDS.

**v4.3 · 25-08-2026** — **correctie op v4.2: een editie is niet hetzelfde als een agendapagina.**
In v4.2 stond dat een activity naar het post type `event` verwijst. Dat is fout en het is een
gevaarlijke fout: die 170 records zijn de publieke agenda, inclusief evenementen van derden en
items uit 2013. Deelname hangt aan een **editie** — een intern object voor relaties en commercie.
Een editie mag naar een agendapagina verwijzen als die bestaat, maar dat is weergave en verder
niets. Daarmee is ook het "gat" van 2019–2021 uit v4.2 geen gat: die edities hebben plaatsgevonden
en er zijn facturen van; dat er geen agendapagina van bestaat, doet er niet toe.

Toegevoegd: **Jeroen noemt de editie** bij het aanleveren van een bestand. Claude leidt die niet af
uit een bestandsnaam of een datum.

**v4.2 · 25-08-2026** — **§2.7 uitgewerkt.** Een activity is een eigen
record en geen veld, zodat één entiteit er onbeperkt veel kan dragen. Kern van de uitwerking: rol
en event zijn **twee kolommen**, nooit één samengesteld label — `exhibitor_mdu2022` als tekst is
één keer schrijven en daarna nooit meer filteren. Met `rol` plus `event_id` zijn beide vragen die
Jeroen wil stellen uitvoerbaar: personen die drie specifieke edities bezochten, en exposanten met
meer dan één editie. De sleutel `entity_id + event_id + rol` voorkomt dubbeltelling bij herimport.

(Die versie koppelde deelname nog aan het post type `event`; gecorrigeerd in v4.3.)

**v4.1 · 25-08-2026** — **§2.3b toegevoegd: de bron in vorm brengen.** Wat een kolom bevat wordt
vastgesteld op de inhoud en niet op de kolomnaam; bedrijf en persoon uit één regel worden
gesplitst; een naam die gelijk is aan de bedrijfsnaam levert allebei op (eenmanszaak); een
volledige naam wordt gesplitst in voornaam, tussenvoegsel en achternaam; en dubbele records binnen
één bron worden ontdubbeld vóór het matchen.

**Correctie op v3.2:** plaatsnamen vielen daar onder "presentatiekeuze" en gingen als voorstel. Dat
was fout — `AMSTERDAM` is geen keuze maar een importfout. Plaats-, straat- en persoonsnamen worden
nu automatisch rechtgezet; alleen bedrijfsnamen blijven een voorstel.

**v4.0 · 25-08-2026** — volledig herschreven naar twee trappen, na een droogloop die ontspoorde.
Wat er misging: de eerdere versies produceerden lijsten waarin Jeroen per bedrijf een oordeel moest
vellen — eerst 48 review-regels op 141 bedrijven, daarna 193 op 351. Dat is het omgekeerde van waar
het protocol voor is.

Drie structurele wijzigingen. **De bak "onbeslist" is afgeschaft** — elke regel krijgt een besluit,
en wat niet vast te stellen is gaat naar NIET met de reden erbij, zodat er nooit iets op een gok in
de database landt. **De bewijsvolgorde begint bij wat het bestand zelf zegt over gedrag** — een
factuurregel die "materiaalpublicatie" vermeldt is harder bewijs dan welke websitecheck ook, en dat
was in de vorige versies ongebruikt gebleven. **Een leeg websiteveld is geen reden om op te geven**
maar het startsein voor opzoeken; dat was de grootste bron van "nakijken"-regels.

Toegevoegd op verzoek van Jeroen: het onderscheid bedrijf versus persoon bepaalt welke gegevens
worden opgezocht — bij een bedrijf het algemene e-mailadres en telefoonnummer van de website, bij
een persoon niets, want persoonsgegevens zijn niet openbaar.

Vastgelegd uit de droogloop: **beursdeelname en het innovatiefonds zijn géén bewijs van een
materiaalpropositie.** Vakmedia, onderwijsinstellingen, stichtingen, cateraars en certificeerders
kopen die ook. Alleen materiaalpublicatie en site membership zijn beslissend.

Eerdere versies: v3.2 (normalisatie), v3.1 (verrijking), v3.0 (samenvoeging van twee protocollen),
v2.0 (beslisflow), v1.0 (eerste vastlegging uit `datastrategie-specificatie.docx`).

Opgesteld door Claude, namens Jeroen.
