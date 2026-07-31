# Testdraaiboek — MaterialDistrict soft-launch

Bedoeld om uitgevoerd te worden door een AI-agent met browsertoegang, of door een
mens. Elke stap heeft een verwachte uitkomst; wijkt het af, dan is dat een
bevinding — niet iets om zelf op te lossen.

**Uitvoerder: los niets op, herstel niets, probeer geen work-arounds.** Noteer wat
er gebeurde en ga door met de volgende stap. Een testronde die halverwege is
"gerepareerd" levert geen bruikbaar beeld op.

---

## 0. Voorbereiding — lees dit eerst

**Omgeving.** Draai dit op staging, niet op productie. Staat alleen productie ter
beschikking, meld dat en stop. Testaccounts en test-brands in de live database zijn
lastiger op te ruimen dan ze waard zijn.

**Betalingen.** Controleer vóór flow C of Stripe in testmode staat (de checkout toont
dan een testmode-indicator, of de Stripe-key begint met `pk_test_`). Staat hij op
live keys: sla flow C over en meld het. Nooit een echte betaling doen.

**Naamgeving.** Alles wat je aanmaakt krijgt het voorvoegsel `ZZTEST-` gevolgd door
de datum, bijvoorbeeld `ZZTEST-20260729-brand-01`. E-mailadressen in de vorm
`zztest+20260729-01@<testdomein>`. Zo is achteraf in één query op te ruimen wat er
is achtergebleven.

**Vastleggen.** Per stap: stapnummer, wat je deed, wat je zag, geslaagd of niet, en
bij een afwijking de exacte foutmelding plus de URL. Schermafbeelding bij alles wat
visueel misgaat.

---

## Flow A — Registratie en inloggen

| # | Handeling | Verwacht |
|---|---|---|
| A1 | Registreer een nieuw account met een testadres | Bevestigingsscherm; geen foutmelding |
| A2 | Controleer of er een verificatiemail binnenkomt | Mail binnen 2 minuten, afzender `news@materialdistrict.com`, reply-to `info@materialdistrict.com` |
| A3 | Klik de verificatielink | Account actief, ingelogd of doorgestuurd naar login |
| A4 | Log uit en weer in | Lukt; naam verschijnt in het topmenu |
| A5 | Vraag een wachtwoordreset aan en doorloop hem | Mail komt aan, nieuw wachtwoord werkt, oud wachtwoord werkt niet meer |
| A6 | Registreer nogmaals met hetzelfde adres | Nette melding dat het adres al bestaat — geen technische fout, geen dubbel account |
| A7 | Registreer met een ongeldig adres (`geen-apenstaartje`) | Validatie blokkeert vóór verzending |

**Let op bij A2:** komt de mail in spam, meld dat apart. Dat is geen bug maar wel
relevant voor de mailreputatie.

---

## Flow B — Volgen en digest-voorkeur

| # | Handeling | Verwacht |
|---|---|---|
| B1 | Volg als ingelogde gebruiker een channel | Knop wisselt naar gevolgd, blijft zo na verversen |
| B2 | Ontvolg hetzelfde channel | Bevestiging wordt gevraagd; daarna ontvolgd |
| B3 | Volg uitgelogd een channel | Doorverwijzing naar inloggen |
| B4 | Log daarna in | **Kritiek:** kom je terug op dezelfde pagina, of beland je op een overzichtspagina? Noteer welke van de twee |
| B5 | Bekijk de e-mailvoorkeur bij follows | Er staat een frequentie vermeld (bijvoorbeeld wekelijks). Noteer de exacte tekst |

**Achtergrond bij B5:** de tekst belooft iets wat pas werkt als de digest draait.
Puur vastleggen wat er staat, niet beoordelen.

---

## Flow C — Insider worden (betaling)

Alleen uitvoeren als Stripe in testmode staat.

| # | Handeling | Verwacht |
|---|---|---|
| C1 | Ga naar de Insider-pagina als gratis gebruiker | Prijs en voordelen zichtbaar |
| C2 | Start de checkout, kies iDEAL | Bankkeuze verschijnt; in testmode een simulatiescherm |
| C3 | Rond de betaling af | Terug op de site, bevestigingsscherm |
| C4 | Controleer de status in het account | Insider-status zichtbaar, ring rond de avatar |
| C5 | Controleer of er een bevestigingsmail komt | Mail binnen enkele minuten |
| C6 | Breek een betaling halverwege af | Nette terugkeer, géén half-account met Insider-rechten |
| C7 | Probeer betaling met een weigerende testkaart | Duidelijke foutmelding, geen toegekende status |

**Bij C6 en C7 goed opletten:** de status mag pas omhoog als de webhook bevestigt.
Krijgt het account al toegang vóór afronding, dan is dat een ernstige bevinding.

---

## Flow D — Brand aanmaken en beheren

| # | Handeling | Verwacht |
|---|---|---|
| D1 | Maak als ingelogde gebruiker een brand aan | Lukt, brand verschijnt in het dashboard |
| D2 | Vul het profiel: naam, omschrijving, website, logo | Alles slaat op en blijft na verversen staan |
| D3 | Upload een logo groter dan 5 MB | Nette melding, geen stille mislukking |
| D4 | Vul een ongeldige website (`abc`) | Validatie grijpt in |
| D5 | Bekijk de openbare brandpagina | Toont wat je invulde |

---

## Flow E — Materiaal publiceren namens een leverancier

| # | Handeling | Verwacht |
|---|---|---|
| E1 | Maak een materiaal aan onder het testbrand | Formulier opent |
| E2 | Kies een materiaaltype | Elf types beschikbaar; controleer of Composites en Leather ertussen staan |
| E3 | Koppel channels | Elf channels; noteer of Sustainable, Lightweight, Translucency of Leisure & Hospitality nog aangeboden worden |
| E4 | Vul eigenschappen in en sla op | Alles blijft staan |
| E5 | Publiceer | Status verandert; noteer of het meteen live gaat of eerst ter goedkeuring |
| E6 | Bekijk de openbare materiaalpagina | Toont de ingevulde gegevens |
| E7 | Laat een veld leeg dat verplicht hoort te zijn | Validatie blokkeert |

**Bij E5 goed noteren wat er gebeurt.** Als een leverancier direct kan publiceren
zonder redactionele goedkeuring, is dat een besluit met gevolgen voor wat er in de
nieuwsbrief terechtkomt.

---

## Flow F — Rechten en afscherming (het belangrijkste deel)

Hier gaat het erom of dingen **niet** kunnen. Elke stap die wél lukt is een
bevinding.

Maak vooraf twee accounts aan: **gebruiker 1** met een eigen brand, en
**gebruiker 2** met een eigen, ander brand.

| # | Handeling | Verwacht |
|---|---|---|
| F1 | Probeer als gebruiker 2 het brand van gebruiker 1 te openen in het dashboard | Geweigerd |
| F2 | Idem, maar via een directe URL met het brand-ID van gebruiker 1 | Geweigerd |
| F3 | Probeer als gebruiker 2 een materiaal aan te maken onder het brand van gebruiker 1 | Geweigerd |
| F4 | Open een talk als uitgelogde bezoeker | Video niet afspeelbaar; noteer of het video-ID in de paginabron staat |
| F5 | Open een talk als gratis (niet-Insider) gebruiker | Zelfde controle |
| F6 | Zoek in de paginabron van een talk naar een reeks van negen tot tien cijfers | Mag er niet staan |
| F7 | Open een Insider-only artikel of rapport als gratis gebruiker | Alleen aanloop zichtbaar, niet de volledige tekst |
| F8 | Probeer een Insider-download op te halen als gratis gebruiker | Geweigerd |
| F9 | Bekijk de prijs bij checkout, wijzig hem in de browser en verstuur | Serverprijs wint; korting mag niet client-side te forceren zijn |

**F4 tot en met F6 zijn de kern.** Het talk-archief wordt betaald onderdeel van het
Insider-lidmaatschap. Staat het video-ID in de bron, dan is de betaalmuur te
omzeilen — ongeacht wat de pagina zelf laat zien.

---

## Flow G — Openbare API

Uit te voeren zonder in te loggen, met een gewone browser of `curl`.

| # | Handeling | Verwacht |
|---|---|---|
| G1 | Open `/wp-json/wp/v2/brand?per_page=5` | Geen e-mailadressen, geen Stripe-identificatie |
| G2 | Open `/wp-json/wp/v2/talk?per_page=5` | Geen video-ID in de uitvoer |
| G3 | Open `/wp-json/wp/v2/lead` | Hoort niet beschikbaar te zijn |
| G4 | Open `/wp-json/wp/v2/users` | Geen e-mailadressen; noteer of gebruikersnamen zichtbaar zijn |

---

## Flow H — Basiscontrole van de site

| # | Handeling | Verwacht |
|---|---|---|
| H1 | Open elk van de elf channels | Alle elf tonen inhoud; geen lege pagina |
| H2 | Doorloop de homepage van boven naar beneden | Geen lege blokken, geen ontbrekende afbeeldingen |
| H3 | Gebruik het zoekveld met een gangbare term | Resultaten verschijnen |
| H4 | Zoek iets wat niet bestaat | Nette lege staat, geen foutmelding |
| H5 | Open een niet-bestaande URL | Nette 404 |
| H6 | Bekijk drie willekeurige pagina's op een telefoonformaat | Leesbaar, niets valt buiten beeld |
| H7 | Controleer of de cookiemelding verschijnt | Noteer wat je ziet |

---

## Opruimen

Na afloop verwijderen: aangemaakte accounts, brands, materialen en testabonnementen.
Alles wat het voorvoegsel `ZZTEST-` draagt kan weg. Wat je niet verwijderd krijgt:
noteren met het ID, zodat het alsnog opgeruimd kan worden.

---

## Rapportage

Lever aan het eind:

1. Een tabel met alle stappen en de uitkomst
2. De afwijkingen apart, gesorteerd op ernst:
   - **Blokkerend** — betaling, registratie of afscherming werkt niet
   - **Ernstig** — functie werkt niet, geen omweg
   - **Klein** — cosmetisch of hinderlijk
3. De ID's van alles wat is achtergebleven
4. Bij elke afwijking: URL, exacte foutmelding, schermafbeelding

Rapporteer ook wat er goed ging. Een lijst met alleen problemen geeft geen beeld
van wat er wél staat.
