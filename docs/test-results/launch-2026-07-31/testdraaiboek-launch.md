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

**Backend vs. frontend-host.** De Vercel-preview praat vaak tegen de gedeelde CMS
(`cms.materialdistrict.com`). API-stappen (flow G) altijd tegen die WordPress-host
uitvoeren — `/wp-json/` op het Vercel-domein is géén WordPress.

**Betalingen.** Controleer vóór flow C en I of Stripe in testmode staat (de checkout
toont dan een testmode-indicator, of de Stripe-key begint met `pk_test_`). Staat hij
op live keys: sla C en I over en meld het. Nooit een echte betaling doen.

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
| A1 | Registreer een nieuw account (specifier) met een testadres | Bevestigingsscherm óf directe login — noteer wat er gebeurt; geen technische fout |
| A2 | Controleer of er een welkomst-/verificatiemail binnenkomt | Mail binnen 2 minuten. Noteer afzender, reply-to, map (Inbox/Promoties/spam) en of er een verificatielink in zit |
| A3 | Als er een verificatielink is: klik die | Account actief. Zonder link: noteer dat het account al actief was |
| A4 | Log uit en weer in | Lukt; naam verschijnt in het topmenu |
| A5 | Vraag een wachtwoordreset aan en doorloop hem | Mail komt aan, nieuw wachtwoord werkt, oud wachtwoord werkt niet meer |
| A6 | Registreer nogmaals met hetzelfde adres | Nette melding dat het adres al bestaat — geen technische fout, geen dubbel account |
| A7 | Registreer met een ongeldig adres (`geen-apenstaartje`) | Validatie blokkeert vóór verzending met een **klopsprekende** foutmelding (niet “Email and password are required” als beide velden gevuld zijn) |
| A8 | Start login via Google of LinkedIn (als zichtbaar), annuleer op de provider | Nette terugkeer naar de site; geen half-ingelogde sessie |

**Let op bij A2:** komt de mail in spam of Promoties, meld dat apart. Dat is geen
bug maar wel relevant voor de mailreputatie. Noteer afwijkingen t.o.v. verwachte
afzender (`news@` / `noreply@`) als waarneming.

---

## Flow B — Volgen en digest-voorkeur

| # | Handeling | Verwacht |
|---|---|---|
| B1 | Volg als ingelogde gebruiker een channel | Knop wisselt naar gevolgd, blijft zo na verversen |
| B2 | Ontvolg hetzelfde channel | Bevestiging wordt gevraagd; daarna ontvolgd |
| B3 | Volg uitgelogd een channel | Account-catch (modal of panel): “Create a free account to follow”, mét link naar Log in — géén stille mislukking |
| B4 | Klik in die catch op “Log in”, log in met een geldig account | **Kritiek:** terug op exact dezelfde channel-URL (`/sign-in?next=…` moet gezet zijn). Noteer of je opnieuw op Follow moet klikken |
| B5 | Herhaal B3–B4 via “Create account” i.p.v. Log in | Registratie bewaart dezelfde `next`-URL; na afronden terug op het channel |
| B6 | Bekijk de e-mailvoorkeur bij follows | Er staat een frequentie vermeld (bijvoorbeeld wekelijks). Noteer de exacte tekst |
| B7 | Wijzig de digestfrequentie (bijv. Weekly → Daily) en ververs | Keuze blijft staan |
| B8 | Op een detailpagina (materiaal of story): gebruik de channel-pil of FollowDigest-blok uitgelogd | Zelfde account-catch; login/register behouden `next` naar de detailpagina |

**Achtergrond bij B6:** de tekst belooft iets wat pas werkt als de digest draait.
Puur vastleggen wat er staat, niet beoordelen.

---

## Flow C — Insider worden (betaling)

Alleen uitvoeren als Stripe in testmode staat.

| # | Handeling | Verwacht |
|---|---|---|
| C1 | Ga naar de Insider-pagina als gratis gebruiker | Prijs en voordelen zichtbaar |
| C2 | Start de checkout; controleer betaalmethoden | Kaart én iDEAL/Wero (of wat er geconfigureerd hoort) zichtbaar in Sandbox |
| C3 | Rond de betaling af met testkaart | Terug op de site, successmelding (“You’re an Insider” of gelijkwaardig) |
| C4 | Controleer de status in het account | Insider-status zichtbaar, ring rond de avatar; blijft na uitloggen/inloggen |
| C5 | Controleer of er een bevestigingsmail komt | Mail binnen enkele minuten (gebruik een mailbox waar je bij kunt) |
| C6 | Breek een betaling halverwege af | Nette terugkeer, géén half-account met Insider-rechten |
| C7 | Probeer betaling met een weigerende testkaart | Duidelijke foutmelding, geen toegekende status |
| C8 | (Indien gevraagd) Vul geen BTW-/adresvelden in als die optioneel zijn voor consumenten | Checkout mag afronden zonder adres voor een B2C-pad; noteer wat verplicht wordt gemaakt |

**Bij C6 en C7 goed opletten:** de status mag pas omhoog als de webhook bevestigt.
Krijgt het account al toegang vóór afronding, dan is dat een ernstige bevinding.

---

## Flow D — Brandaanvraag, goedkeuring en profiel

Gebruik een account met een **zakelijk e-maildomein** (geen Gmail/Hotmail) tenzij
de stap expliciet om een publiek domein vraagt. Goedkeuren gebeurt in WordPress
onder **Brands → Brand requests**.

| # | Handeling | Verwacht |
|---|---|---|
| D1 | Dien via `/dashboard/brands/new/` een brandaanvraag in (`ZZTEST-…`) | Bevestiging in de UI; aanvraag verschijnt in de WP-wachtrij met naam, contact, website en boodschap |
| D2 | Keur de aanvraag goed in WP | Melding “approved”; requester krijgt een goedkeuringsmail |
| D3 | Open de goedkeuringsmail | Link gaat naar het **frontend-dashboard** (niet naar een dood `materialdistrict.com/dashboard/…`-pad zonder werkende sessie). Noteer de exacte URL |
| D4 | Log als requester opnieuw in en open Brands in het dashboard | Brand is beheerbaar, of er is een duidelijke status (`Pending setup`) mét uitleg — géén stille niet-klikbare regel zonder toelichting |
| D5 | Vul het profiel: naam, omschrijving, website, logo, adres | Alles slaat op en blijft na verversen staan |
| D6 | Upload een logo groter dan 5 MB | Nette melding, geen stille mislukking |
| D7 | Vul een ongeldige website (`abc`) | Validatie grijpt in |
| D8 | Wijs een tweede aanvraag af met een reden | Aanvraag verdwijnt uit de wachtrij; requester krijgt een weigeringsmail; er ontstaat geen brand-record |
| D9 | Probeer met een **Gmail-account** een bestaand merk te claimen / aan te vragen | Geen automatische claim op een bestaand brand; nette blokkade of review-pad. Noteer de exacte melding |
| D10 | Bekijk de openbare brandpagina nadat het brand gepubliceerd is | Toont wat je invulde |

**Let op bij D4:** een draft zonder slug bleef eerder als “Pending setup” hangen.
Noteer of de status na goedkeuring binnen redelijke tijd klikbaar wordt, en of
de UI dat uitlegt.

---

## Flow E — Materiaal publiceren namens een leverancier

Gebruik een brand met een tier die materialen toestaat (Basis of hoger), tenzij
de stap juist de gratis limiet test.

| # | Handeling | Verwacht |
|---|---|---|
| E1 | Maak een materiaal aan onder het testbrand | Formulier opent |
| E2 | Kies een materiaaltype | Elf types beschikbaar; controleer of Composites en Leather ertussen staan |
| E3 | Koppel channels (alleen op Partner, of noteer de lock) | Partner: channels kiesbaar. Lagere tier: duidelijke lock-tekst, geen stille mislukking. Noteer of Sustainable, Lightweight, Translucency of Leisure & Hospitality nog worden aangeboden |
| E4 | Vul eigenschappen in (incl. ten minste één “Not specified”-optie als die bestaat) en sla op | Alles blijft staan; label toont “Not specified”, niet “Unknown” |
| E5 | Upload een PNG als featured image | Geaccepteerd |
| E6 | Upload een SVG als featured image | Noteer of UI SVG belooft; backend moet consistent zijn (accepteert of weigert mét nette melding — geen tegenstrijdigheid UI↔API) |
| E7 | Publiceer binnen de quotum van de tier | Status verandert; noteer of het meteen live gaat of Offline / ter goedkeuring blijft. Noteer ook “X of Y published” |
| E8 | Bekijk de openbare materiaalpagina (als gepubliceerd) | Toont de ingevulde gegevens |
| E9 | Laat een verplicht veld leeg | Validatie blokkeert |
| E10 | Probeer te publiceren boven de quotum (of op Free met 0 publicaties) | Duidelijke weigering; geen half-live materiaal |

**Bij E7 goed noteren wat er gebeurt.** Als een leverancier direct kan publiceren
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
| F7 | Open een Insider-only artikel of rapport als gratis gebruiker | Alleen aanloop zichtbaar, niet de volledige tekst. **Als je geen testcontent vindt:** noteer dat als Geblokkeerd met de gezochte URLs — verzin geen omweg |
| F8 | Probeer een Insider-download op te halen als gratis gebruiker | Geweigerd. Zelfde: zonder testsample → Geblokkeerd, niet overslaan zonder melding |
| F9 | Bekijk de prijs bij Insider-checkout, wijzig queryparams (`amount`, `price`, `discount`) en verstuur | Serverprijs wint; korting mag niet client-side te forceren zijn |
| F10 | Herhaal F9 voor brandmembership-checkout (`plan=brand`, andere `tier` of `amount` in de URL) | Stripe toont nog steeds de serverprijs van de gekozen tier |
| F11 | Als Insider: open een talk | Video speelbaar (of nette Insider-ervaring); noteer of de bron nu wél een embed toont |

**F4 tot en met F6 zijn de kern.** Het talk-archief wordt betaald onderdeel van het
Insider-lidmaatschap. Staat het video-ID in de bron, dan is de betaalmuur te
omzeilen — ongeacht wat de pagina zelf laat zien.

---

## Flow G — Openbare API

Uit te voeren zonder in te loggen, met een gewone browser of `curl` tegen de
**WordPress-host** (`cms.materialdistrict.com` of productie-WP) — niet tegen het
Vercel-previewdomein (daar draait geen `/wp-json/`).

| # | Handeling | Verwacht |
|---|---|---|
| G1 | Open `/wp-json/wp/v2/brand?per_page=5` | Geen e-mailadressen, geen Stripe-identificatie |
| G2 | Open `/wp-json/wp/v2/talk?per_page=5` (liefst `per_page=100` voor steekproef) | Geen `vimeo_id` / video-ID in de uitvoer |
| G3 | Open `/wp-json/wp/v2/lead` | Hoort niet beschikbaar te zijn (404 / `rest_no_route`) |
| G4 | Open `/wp-json/wp/v2/users` | Geen e-mailadressen; noteer of gebruikersnamen zichtbaar zijn of de route 401 geeft |
| G5 | Open `/wp-json/md/v2/search?q=wood&page=1&per_page=24` | Resultaten + `total` / `total_pages` > 0 |
| G6 | Zelfde query met `page=2` | Opnieuw resultaten (of eerlijke `total_pages` zodat page 2 niet bestaat) — **niet** `total: 0` terwijl page 1 wél hits had |

---

## Flow H — Basiscontrole van de site

| # | Handeling | Verwacht |
|---|---|---|
| H1 | Open **alle channel-links uit de header** (niet alleen “de elf”) | Elke link toont inhoud of een bewuste lege staat; geen kale 404. Noteer het aantal links vs. verwachte set |
| H2 | Doorloop de homepage van boven naar beneden | Geen lege blokken, geen ontbrekende afbeeldingen |
| H3 | Gebruik het header-zoekveld met een gangbare term + Enter | Navigatie naar `/search/?q=…`; resultaten verschijnen |
| H4 | Zoek iets wat niet bestaat | Nette lege staat (“No results found”), geen foutmelding, geen 404 |
| H5 | Zoek een term met meerdere pagina’s (bijv. `door` of `cork`), ga naar pagina 2 | Resultaten of een eerlijke één-pagina-telling — geen valse “No results” terwijl page 1 hits had |
| H6 | Open een niet-bestaande URL | Nette sitebrede 404 (geen kale Next.js-default); CTAs naar materials/stories aanwezig |
| H7 | Bekijk drie willekeurige pagina's op een telefoonformaat | Leesbaar, niets valt buiten beeld |
| H8 | Controleer of de cookiemelding verschijnt (bij voorkeur verse sessie / gewiste cookies) | Noteer wat je ziet |
| H9 | Open `/faq/`, `/about/` (of vergelijkbare statische pagina’s uit de footer) | Pagina laadt; geen 404 |
| H10 | Open een materiaaloverzicht, zet een filter, ga een pagina verder | Filter blijft actief; resultaten kloppen bij de selectie |

---

## Flow I — Brandmembership (betaling)

Alleen uitvoeren als Stripe in testmode staat. Gebruik een brand dat je in flow D
hebt aangemaakt (of een `ZZTEST-` brand op Free).

| # | Handeling | Verwacht |
|---|---|---|
| I1 | Open Membership op het testbrand | Free + Betaalde tiers met prijzen zichtbaar (Basis / Plus / Partner) |
| I2 | Start “Upgrade to Basis” (of equivalent) | Stripe Checkout Sandbox; bedrag komt overeen met de getoonde jaartierprijs |
| I3 | Annuleer via terugkeer naar de site | `checkout=cancel` (of gelijkwaardig); tier blijft Free; nette melding |
| I4 | Probeer met weigerende testkaart | Duidelijke fout; tier blijft Free |
| I5 | Rond Basis af met geldige testkaart | Successmelding; tier wordt Basis; quotum (bijv. “0 of 5”) zichtbaar |
| I6 | Ververs en log opnieuw in | Tier blijft Basis |
| I7 | Controleer een **ander** brand van dezelfde gebruiker | Dat andere brand is níet per ongeluk mee-geüpgraded |

**Kritiek bij I5–I7:** de webhook moet precies het `brandId` uit de sessie
bijwerken — niet “het eerste brand van de user”.

---

## Flow J — Soft-launch instrumentatie (404 + meldknop)

Alleen relevant nadat de sitebrede 404 en de feedbackknop zijn gedeployed.
Anders: noteer Geblokkeerd.

| # | Handeling | Verwacht |
|---|---|---|
| J1 | Open een niet-bestaande URL | Sitebrede 404; vaste meldknop (“Something broken?”) zichtbaar **ook uitgelogd** |
| J2 | Stuur via de knop een korte melding | Bevestiging “Thanks”; binnen enkele minuten mail op `webmaster@materialdistrict.com` met URL, viewport en bericht |
| J3 | Verstuur vijf+ meldingen snel achter elkaar vanaf hetzelfde netwerk | Rate limit grijpt in (nette fout) na het limiet; geen open mailrelay |
| J4 | (Optioneel, analytics) Laad een 404 vanaf een externe referrer indien mogelijk | Event `page_not_found` bereikt de events-rail; noteer of je dit kunt verifiëren of niet |

---

## Flow K — Contact, samples en overige gated acties

| # | Handeling | Verwacht |
|---|---|---|
| K1 | Op een materiaalpagina: “Get in touch” / contact als uitgelogde | Login (met `next` terug naar het materiaal) of duidelijke gate — geen dode knop |
| K2 | Zelfde als ingelogde gratis gebruiker | Formulier of actie werkt; bevestiging zichtbaar |
| K3 | Sample request (als de knop bestaat) uitgelogd vs. ingelogd | Uitgelogd: gate naar login. Ingelogd: verzoek gaat door of toont nette validatie |
| K4 | Save / board / compare als uitgelogde (waar aanwezig) | Gate naar login met return-URL; geen stille no-op |

---

## Flow L — Registratie als fabrikant

| # | Handeling | Verwacht |
|---|---|---|
| L1 | Registreer met account type manufacturer / via become-a-partner | Account aangemaakt; noteer of je meteen een brand hebt of een aanvraag moet indienen |
| L2 | Lees de welkomst-/bevestigingsmail | Tekst komt overeen met de echte status (geen “brand is ready” terwijl dashboard nog Pending setup / wachtrij toont) |
| L3 | Open `/become-a-partner/` | Tier-info klopt; CTA’s leiden naar register of checkout — geen dode “Talk to us” als er inmiddels Stripe brand-checkout is |

---

## Opruimen

Na afloop verwijderen: aangemaakte accounts, brands, materialen, brandaanvragen in
de WP-wachtrij, Insider-testabonnementen **en** brandmembership-testabonnementen in
Stripe Sandbox. Alles wat het voorvoegsel `ZZTEST-` draagt kan weg. Wat je niet
verwijderd krijgt: noteren met het ID (en bij Stripe de Checkout Session / Subscription
ID), zodat het alsnog opgeruimd kan worden.

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
