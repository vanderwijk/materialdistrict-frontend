# Vragen aan Johan — Roadmap-vervolg (mei 2026)

**Datum:** 20 mei 2026
**Van:** Jeroen (in afstemming met Claude)
**Voor:** Johan
**Deadline antwoorden:** vrijdag 29 mei 2026

---

## Hoi Johan,

Een uitgebreide vragenset over de rest van het project. Aanleiding:
we willen vóór juni het complete datamodel voor Fase 1 (alle publieke
pagina's tot en met sessie 11) helder hebben, zodat jij in juni in
één lijn door kunt werken zonder dat we elke sessie opnieuw losse
vraagjes naar je sturen.

We hebben het project samen al een eind opgezet — auth-endpoints,
batch A-E in `database-uitbreidingen-instructie-johan.md`, en de
FacetWP-import zijn al bij jou bekend. Wat hier nu volgt zijn de
**nieuwe** open punten die we tijdens recent doorlopen van de
volgende sessies (Events, Books, Homepage, statische pagina's) zijn
tegengekomen, plus een paar nog-niet-beantwoorde vragen uit eerdere
documenten.

**Voor elke vraag:** schrijf je antwoord onder de stippellijntjes.
We bespreken alles wat onduidelijk is op het eerstvolgende kantoor-
moment, maar als je dingen schriftelijk kunt beantwoorden scheelt dat
flink.

**Tempo:** maak ons niet bang voor "ik weet het niet" of "dat moet ik
uitzoeken". Een goed antwoord later is beter dan een snel antwoord
nu. Maar als je een batch helemaal niet ziet zitten, wil ik dat ook
zo vroeg mogelijk weten.

---

## Deel 1 — Boekenwinkel-integratie (sessie 9)

**Even commerciële context vooraf:** de nieuwe MaterialDistrict-site
gaat pas live als alle drie de onderdelen af zijn — frontend (waar
we nu aan werken), brand-dashboard en insider-dashboard. Er is dus
**geen launch-druk** op de boeken-integratie. Als sessie 9 lekker
loopt, prima — als het te complex blijkt, schuiven we het naar achter
en lossen we het op een andere manier op.

Tot nu toe hebben we in alle planningen verondersteld dat boeken via
WooCommerce op de hoofd-MD-WP zouden komen (zie `session-log.md`
beslissing 16). Maar er draait nu `books.materialdistrict.com` als
aparte site, en we weten eerlijk gezegd niet hoe die technisch is
ingericht.

**Onze voorkeur:** als het qua omvang meevalt (~30 boeken opnieuw
invoeren), wel meteen meenemen. Insider-korting van 10% op boeken is
een belangrijk verkooppunt van het Insider-membership; het is fijn
als dat vanaf go-live netjes werkt.

**Vangnet als het te complex blijkt:** we schuiven Books-integratie
naar ná go-live. Bij launch krijgt het Insider-dashboard een sectie
"Voordelen" met een generieke kortingscode (bv. `INSIDER10`) die
Insiders op `books.materialdistrict.com` kunnen gebruiken voor hun
10% korting. Tijdelijk, niet optimaal, maar werkbaar.

**Wat we van je vragen:** beoordeel eerlijk welke route realistisch
is. Geen druk om voor de voorkeursroute te gaan — als de migratie te
complex is, zeg dat dan gewoon.

### Vraag 1 — Hoe is `books.materialdistrict.com` op dit moment opgezet?

Drie scenario's die we voor ons zien (jouw antwoord kan ook iets
totaal anders zijn):

- **Scenario 1:** Hetzelfde WordPress als de hoofd-site, alleen ander
  subdomein. WooCommerce draait op de hoofd-WP. → Integratie is dan
  triviaal.
- **Scenario 2:** Een aparte WP+WooCommerce-installatie achter het
  subdomein. → Dan moeten we kiezen tussen cross-domain API of
  migreren.
- **Scenario 3:** Een ander e-commerce-systeem (Shopify, Magento,
  Boekemus eigen platform, anders). → Dan een API-bridge of complete
  migratie.

Welk scenario klopt? En als geen ervan klopt — wat dan wel?

Antwoord: books.materialdistrict.com is een multisite WordPress installatie onder materialdistrict.com
Het vereist behoorlijk wat database aanpassingen om deze site onder te brengen onder het hoofddomein
____________________________________________________________________

### Vraag 2 — Wat is volgens jou de slimste integratie-route?

Gegeven hoe de winkel er nu uitziet en wat er aan data en historie in
zit: wat raad jij aan? We hebben geen voorkeur — jij overziet de
operationele consequenties beter dan wij.

Antwoord: Vanwege de tijd stel ik voor om books.materialdistrict.com voorlopig als losse multisite te laten
draaien. We kunnen voor insiders kortingscodes aanmaken in WooCommerce.

____________________________________________________________________

____________________________________________________________________

### Vraag 3 — Hoeveel data zit er op het subdomein?

Producten, orders, klanten, voorraad — orde van grootte. En: zit er
historie in (jaren aan orders) die behouden moet blijven, of is het
relatief jong?

Antwoord: Dit valt erg mee, de producten kunnen eenvoudig worden gemigreerd, de gebruikersdatabase wordt gedeeld
met het hoofdomein materialdistrict.com en er staan nu 3328 bestellingen in de database. Daar wordt echter helemaal
niets mee gedaan dus het zal geen probleem zijn die te verliezen.
Het probleem zit in het maken van redirects voor alle bestaande productpagina's en het overnemen van kortingscodes.

____________________________________________________________

____________________________________________________________________

### Vraag 4 — Welke book-specifieke velden bestaan al op de huidige producten?

Auteur, ISBN, publisher, jaar, taal, formaat (hardcover/paperback/
ebook), pagina's — welke zijn al ingevuld en in welk systeem?

Antwoord: De belangrijkste velden zijn prijs, voorraad, SKU (ISBN) en de verzendinformatie en inventaris.



____________________________________________________________________

### Vraag 5 — Voorkeursroute of vangnet? Plus inschatting

Twee dingen:

**a)** Welke route raad je aan?
- Voorkeursroute: Books-integratie meenemen in sessie 9 (Fase 1)
- Vangnet-route: uitstel naar ná go-live, met kortingscode-workaround
  in het Insider-dashboard

**b)** Bij voorkeursroute: orde van grootte van het werk (dagen /
weken / maanden) en wat de grootste onbekenden zijn.

Bij vangnet-route: schatting voor wanneer het wél kan (Q3? Q4? begin
volgend jaar?).

Antwoord: Ik denk dat we dit het beste even kunnen parkeren en direct na de livegang kunnen migreren.

____________________________________________________________________

____________________________________________________________________

---

## Deel 2 — Events (sessie 8)

De event-pagina is grotendeels al voorbereid in de basis-types
(`src/types/event.ts` heeft al start/eind-datum, tijden, kosten,
externe URL). Maar voor de detail-pagina hebben we nog wat extra's
nodig.

### Vraag 6 — Welke locatie-velden bestaan al op events in WP?

De wireframe toont een locatie-blok (venue + stad + land). Bestaan
deze velden al? Zo nee, voorkeur voor:

- Platte meta-velden (`event_venue`, `event_city`, `event_country`)
- Of een repeater met meerdere locaties per event mogelijk?

Antwoord: Events hebben metadata voor:
Featured (true/false)
Date
End date
Start time
End time
External website
Costs

Daarnaast hebben ze de taxonomies Sectors, Themes, en Location

____________________________________________________________________

### Vraag 7 — Bestaat er een eventtype-taxonomy?

De wireframe gebruikt category-pills (fair / exhibition / lecture /
workshop / online). Bestaat er al zoiets, of nieuw aan te maken?

Antwoord: Nee, dat bestaat niet

____________________________________________________________________

### Vraag 8 — Onderscheid MD-eigen events vs externe events?

Wireframe heeft "Register"-CTA voor MD-eigen events en "Visit
website"-CTA voor externe events. Bestaat er een veld of taxonomy
voor dit onderscheid, of moet er een `is_md_event`-flag bij?

Antwoord: Nee, dat wordt nu nog niet bijgehouden

____________________________________________________________________

### Vraag 9 — Speakers-koppeling op events?

Bij lecture/workshop-events tonen we mogelijk speakers — net zoals
bij talks. Bestaat de speaker-relatie al op event-niveau? Of zouden
we de talk-speakers-N:N-relatie kunnen hergebruiken (zelfde mecha-
nisme)?

Antwoord: Nee, dat bestaat nog niet

____________________________________________________________________

### Vraag 10 — Hoe ziet de huidige UI eruit voor event-invoer in WP?

Geen technische details nodig — gewoon: wat ziet de redacteur nu als
hij/zij een nieuw event aanmaakt? Dat helpt ons inschatten wat er
realistisch bij komt.

Antwoord: Gewoon een WordPress post met metadata-velden

____________________________________________________________________

---

## Deel 3 — Resterende vragen uit eerdere documenten

Deze vragen staan al in `database-uitbreidingen-instructie-johan.md`
maar zijn nog niet beantwoord. We willen ze hier herhalen omdat ze
voorwaardelijk zijn voor de batches die we eerder samen hebben
opgezet (A t/m E).

### Vraag 11 — Environmental/sustainability-velden in WP-meta

Welke environmental/sustainability-velden bestaan al in WP-meta? Wat
is het datatype per veld? Hoe is de vulgraad — bijna alle materials
ingevuld, of incidenteel?

Antwoord: Dit is helemaal nieuw en nog nergens ingevoerd

____________________________________________________________________

### Vraag 12 — Application-facet (naast Material Category)

Bestaat er een taxonomy voor Application (driedelig: main / sub /
type) of moet die nieuw worden opgezet? Hoeveel niveaus heb je in
gedachten?

Antwoord: Deze moet nieuw worden opgezet.

____________________________________________________________________

### Vraag 13 — Property-groepen canonieke mapping

Voor de material-properties (Sensorial / Technical / Environmental /
Content): hoe modelleren we dit in WP? Voorstel was per property een
meta-veld met een vaste prefix (`prop_sensorial_color`,
`prop_environmental_biobased`, etc.). Werkt dat voor jou, of liever
anders?

Antwoord: Nee, dat is niet handig. We gebruiken nu deze structuur:
https://materialdistrict.com/wp-admin/edit-tags.php?taxonomy=odeur&post_type=material
Odeur (Odor)
- None
- Moderate
- Strong

Dit is dus afhankelijk van de material property

____________________________________________________________________

### Vraag 14 — Story-types als taxonomy of ENUM?

Voor article story-types (news / process / people / projects /
collaborations). Voorkeur: WP-taxonomy zodat het uitbreidbaar blijft
zonder code-deploy. Akkoord?

Antwoord: Prima

____________________________________________________________________

### Vraag 15 — Article `related[]` — expliciet veld of inferentie?

Mockup toont gerelateerde artikelen, materialen en talks. Bestaat
dit al als expliciet relatie-veld, of moeten we het via taxonomie-
overlap inferren?

Antwoord: Dit bestaat nog niet. De voorkeur heeft het om dit te automatiseren. Bijvoorbeeld via de
SearchWP plugin die een functie voor related content heeft.

____________________________________________________________________

### Vraag 16 — `brand.employees` — bands of exact?

Bij brand-info willen we het aantal werknemers tonen. Voorstel was
bands (`1-10`, `11-50`, `51-200`, `201-1000`, `1000+`) ipv exacte
getallen. Werkt dat? Of liever anders?

Antwoord: Bands is prima, dit veld bestaat nog niet.
____________________________________________________________________

### Vraag 17 — Mutual exclusion (Batch A6): hard constraint of UI?

De regel "brand heeft óf tier-membership óf Free met standalones,
nooit beide" — wordt dat een **harde** WordPress-constraint (database
weigert verkeerde combinaties) of een **UI-niveau-bescherming** (admin
ziet het niet als optie)?

Antwoord: Dit is een vraag voor Jeroen

____________________________________________________________________

### Vraag 18 — Talk Vimeo-veld

Bestaat er al een gestructureerd Vimeo-veld op talks (bv. `vimeo_id`
of een gevalideerd `video_url`)? Voor auto-fill van talk-duur via
de Vimeo-API is een aparte `vimeo_id` of een gevalideerde `video_url`
praktischer. Voorstel: handmatig veld toevoegen voor v1, Vimeo-
auto-fill parkeren als latere optimalisatie. Werkt dat?

Antwoord: Ja, er is een veld voor vimeo_id waar alleen een nummer wordt ingevuld, bijvoorbeeld '1196302830'
____________________________________________________________________

### Vraag 19 — Talk-speakers 1:1 of N:N?

Mockup gaat uit van meerdere speakers per talk (panel-discussions).
Is de huidige speaker-relatie al N:N, of nu 1:1?

Antwoord: De relatie is N:N

____________________________________________________________________

### Vraag 20 — WooCommerce-integratie billing (Batch E6): Pad B akkoord?

Pad B betekent: factuuradres-uitbreiding-velden (`billing_is_company`,
`billing_company_name`, `billing_vat_number`, `billing_kvk_number`) in
WC-meta-namespace, zodat WooCommerce automatisch de BTW-afhandeling
doet. Akkoord op dit pad?

Antwoord: Ja

____________________________________________________________________

---

## Deel 4 — Tijdsinschatting per batch

Dit is voor onze planning belangrijk: we willen weten hoeveel werk
de verschillende batches voor jou inhouden, **niet** om je op te
jagen, maar om de frontend-bouw daarop af te stemmen. Frontend kan
gewoon doorgaan met mock-data; we hoeven niet op WP-werk te wachten.

Per batch een grove inschatting in werkdagen — geen exacte uren
nodig, een orde van grootte is genoeg. Als iets onbekend of
afhankelijk van iets anders is: schrijf dat erbij.

### Vraag 21 — Inschatting per batch

| Batch | Wat het inhoudt | Jouw inschatting |
|---|---|---|
| Auth-endpoints (lopend) | 5 endpoints + register-endpoint | ____ |
| Batch A — Membership & publicatie | Tier-velden + status-enums + afgeleide velden + Stripe-koppeling | ____ |
| Batch B — Brand-uitbreidingen | Bedrijfsgegevens-velden voor brand-info-card | ____ |
| Batch C-MAT — Material aanvullingen | Properties + videos + brochures + sustainability-flags + Prev/Next-endpoint | ____ |
| Batch C-TALK — Talks | Date + duration + speakers-N:N + company + channels + insider-default | ____ |
| Batch D — Story-types + articles | Article-type + insider_only + channels + reading_time + related | ____ |
| Batch E — Personal account billing | 4 billing-velden + format-validatie + WC-integratie | ____ |
| Batch F — Events (na vraag 6-10) | Hangt af van je antwoorden op vraag 6-10 | ____ |
| Batch G — Books (na vraag 1-5) | Hangt af van scenario-keuze | ____ |

### Vraag 22 — Wat is je beschikbaarheid voor MD?

Geen exacte planning nodig — globaal: gemiddeld hoeveel werkdagen per
week kun je realistisch aan MD besteden? En zijn er periodes (juni-
september) waarin dat anders ligt door andere klanten / vakantie?

Antwoord: Ik ben van 22 juni tot 12 juli op vakantie.

____________________________________________________________________

### Vraag 23 — Welke batch zou je zelf eerst willen doen?

Twee redenen om dit te vragen: (a) als jij weet dat de ene batch
fundamenteel gemakkelijker is dan de andere kunnen we daar de
frontend-volgorde op aanpassen, (b) als je een batch ziet die je
liever met iemand wil bespreken voor je begint, wil ik dat nu weten.

Antwoord: Ik wil graag als eerste de user registratie, login, profielbeheer, en wachtwoord (reset) maken.

____________________________________________________________________

---

## Deel 5 — Vrije inbreng

### Vraag 24 — Wat hebben we vergeten of verkeerd ingeschat?

Je kent de WordPress-kant beter dan wij. Als je iets ziet in deze
roadmap waar wij overheen kijken — een gemiste velden-uitbreiding,
een ingewikkelde migratie die we onderschatten, een eenvoudiger
alternatief voor iets dat we te ingewikkeld hebben gemaakt — schrijf
het hier neer.

Antwoord: Het belangrijkste is dat de url structuur hetzelfde blijft. Op die manier hoeven we niet enorm veel
redirects aan te maken en blijft (hopelijk) de Google ranking stabiel. Let erop dat dit nu nog niet het geval is (!).
Zodra alle basisfunctionaliteit gereed is moet er worden gewerkt aan het optimaliseren van de code zodat de site
zo snel mogelijk wordt. Waarschijnlijk moeten hiervoor ook wijzigingen worden gemaakt bij WP Engine. Ik weet wel
dat zij erg veel aandacht besteden aan headless wordpress dus ik denk dat het wel goed komt.
Zoals bij alle grote migraties is de vindbaarheid in Google cruciaal terwijl nu ook vindbaarheid in ai modellen 
steeds belangrijker wordt. We moeten daar heel goed naar kijken.

____________________________________________________________________

____________________________________________________________________

____________________________________________________________________

---

## Tot slot

Dank voor de tijd hierin, Johan. Zoals afgesproken in de werkwijze-
afspraak van 11 mei (zie `architecture-rules.md` §"WordPress-werkwijze
met Johan"): jij implementeert op instructies, en Jeroen + Claude
zorgen voor de architectuur-keuzes. Maar voor de **diagnose**-fase die
we nu in zitten hebben we jouw blik nodig — vooral op Boeken en Events.

Als iets onduidelijk is: bel of mail Jeroen. We werken graag in één
keer goed door zodat je in juni niet meer met losse vragen wordt
overspoeld.

Stuur het ingevuld document terug uiterlijk **vrijdag 29 mei**.

Groet,
Jeroen

---

*Bijlagen ter referentie (al in je bezit):*
- `database-uitbreidingen-instructie-johan.md` — batches A t/m E met
  detail-velden
- `datamodel-roadmap.md` v0.3.1 — overkoepelend eindplaatje Fase 1
- `architecture-rules.md` v1.6 — projectregels
