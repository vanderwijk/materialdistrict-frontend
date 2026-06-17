# Deel 2 — follow-functie en gepersonaliseerde e-mail

*Twee features bovenop het deel-1-fundament, in volgorde. Integraal in de data (ze leunen op dezelfde eventlaag en identiteits-ruggengraat), modulair in de bouw (geen monoliet, maar lagen op één basis).*

*Status: vastgelegd, inclusief de uitgewerkte follow-interactie.*

## De boog

Fundament (deel 1) → **follow-functie** (verzamelt) → **gepersonaliseerde mail** (consumeert).

De volgorde is geen detail: personalisatie heeft gevolgde dingen en gedrag nódig om iets te tonen. Een mail gepersonaliseerd op nul follows is leeg. Dus de follow-functie gaat eerst live en verzamelt, en de mail wordt aangezet zodra er data ligt. De follow-functie is daarmee de brug tussen deel 1 en deel 2 — én het sterkste conversiemoment (zie onder).

## Feature A — de follow-functie

### Het model (vastgelegd)

- Je volgt entiteiten: **channels en brands** (allebei bestaan al als eersterangsbegrip). Terminologie naar de gebruiker: **channels**, niet "thema's".
- Volgen betekent: *hou me op de hoogte van alles wat nieuw is hier, over alle contenttypes heen.* De digest groepeert per type.
- Volgen is iets anders dan bewaren: volgen = abonneren op een stroom nieuwe dingen; een board = specifieke items verzamelen die je al gevonden hebt.
- **Type-selectie per follow zit in scope:** bij het volgen kies je wélke contenttypes je uit dit channel/brand wilt. Defaults aan: Materials, Stories, Talks. Defaults uit: Books, Events, Brands.
- **Frequentie is één globale instelling**, geen per-channel-keuze. De gebruiker stelt 'm één keer in (en past 'm aan in het dashboard), getoond als een klein globaal uitklapmenu (Daily / Weekly / Monthly). Bewuste keuze: mensen mogen niet gaan denken dat frequentie per channel is.
- **Brands zijn alleen volgbaar met een (betaald) membership.** Een brand zonder membership krijgt geen toggle. Dit is een commerciële hefboom (volgbaarheid als membership-voordeel). WordPress berekent "is volgbaar", de frontend leest dat alleen.
- **Dynamische channels:** aangesproken op stabiel id; opgeheven channels worden gearchiveerd zodat bestaande follows en historie blijven staan (zie deel 1).

### De interactie (uitgewerkt en goedgekeurd)

- Een speels **schuifje** (Follow / Following), geen kale knop.
- Het zit in de **channel-pill** die bovenaan channelpagina's én op elke detailpagina staat — zodat je overal, dichtbij, snel kunt volgen (niet twee niveaus diep weggestopt).
- **Ingelogd:** tik → meteen gevolgd, plus een compacte **popover** die uit de toggle groeit met een rustige twee-koloms checklist *"What do you want to follow?"* (Materials, Stories, Talks, Books, Events, Brands) en onderaan *"Updates: Weekly"* waarbij de frequentie zelf een klein inline uitklapmenu is. De popover sluit vanzelf (dun balkje) en bij klik-buiten.
- **Niet ingelogd:** de toggle gaat *niet* aan; in plaats daarvan verschijnt een duidelijk andere **account-catch** (slotje, kop "Create a free account to follow", donkere knop "Create account", "Already have one? Log in").
- Alle UI-tekst in het Engels.
- Zijdingetje meegenomen: de channel-hero-titel moet wit worden (nu te laag contrast).

### Inzicht: de follow is je sterkste conversiemoment

Om gevolgd te kúnnen worden, heeft iemand een plek nodig waar de updates heen gaan — dus een account. Het follow-moment is daarmee de natuurlijke trigger om van anonieme bezoeker naar geregistreerde gebruiker te gaan. De account-creatie is de vangrail, niet het doel: volgen drijft registraties, en die registraties voeden de personalisatie (de data-moat).

### De nieuwsbrief-inschrijving wordt het follow-instappunt

Het oude "e-mail + Subscribe"-blok verdwijnt. Daarvoor in de plaats een **"Follow what you're into"-digestblok**:

- caption "Your digest", een paar populaire channel-chips ("you can follow more as you browse the site" — de overal-aanwezige toggle doet de breedte);
- **geen e-mailveld**;
- een "Start following"-knop, een klein globaal frequentie-uitklapmenu, en een live preview-regel;
- ingelogd → volgt meteen (bevestigingsregel); niet ingelogd → dezelfde account-catch als bij de toggle.

### Frontend (Claude)

- De toggle in de channel-pill, overal (channelpagina's + alle detailpagina's), inclusief popover en account-catch.
- Het digestblok dat de oude nieuwsbrief-box vervangt.
- Een "wat ik volg"-overzicht in het account, met beheer van follows, type-selectie en de globale frequentie.
- De follow-events afvuren in de deel-1-laag.

### Backend (Johan)

- De follow-relaties opslaan (gebruiker → entiteit + gekozen types), met endpoints om te volgen, ontvolgen en opvragen; de globale frequentie op gebruikersniveau.
- De berekening "is deze brand volgbaar" op basis van membership.
- Elke follow ook als event wegschrijven in de deel-1-laag (`channel_followed` / `brand_followed`, met de gekozen types als kenmerk).

Zo is een follow tegelijk een relatie (die de personalisatie leest) én statistiek — uit hetzelfde fundament, zonder apart systeem.

## Feature B — de gepersonaliseerde mail

Een samengestelde digest: een sjabloon met drie soorten blokken.

- **Blok 1 — persoonlijke content (automatisch):** het nieuwe uit de channels en brands die je volgt, gegroepeerd per type ("Nieuw in biobased: 3 materialen, 1 talk"). Komt vanzelf uit de follows.
- **Blok 2 — commerciële slots:** verkochte banners, featured brands/materials, sponsored content.
- **Blok 3 — insider-trigger:** dynamisch — niet-Insiders een teaser plus CTA, Insiders de nieuwste talks en insider-only materialen.

Blok 1 gaat automatisch; **blok 2 en 3 moeten per editie samengesteld kunnen worden** — daar zit een kleine beheer-/curatie-stap (in de composer van de mailtool of een licht admin-schermpje). Samengesteld, niet uit de RSS gedumpt, zodat de slots er vanzelf in passen. Verstuurd via de mailtool op de globale frequentie van de gebruiker.

**Begin segment-gericht, niet per individu.** De follow-functie geeft je al een segment-gerichte digest: je krijgt het nieuws van de channels en brands die je volgt, gegroepeerd. Dat is de haalbare eerste versie en dekt het grootste deel van de waarde. Echte per-persoon-ranking op gedrag is rijker maar complexer — latere verfijning op dezelfde data, niet de MVP.

**Handmatige mails** hoeven we nauwelijks zelf te bouwen: elke mailtool (Sendy, MailPoet, managed) heeft een composer waarmee je een handmatige mail naar een segment stuurt. Dat is grotendeels een tool-functie. Het past in het drie-lagen-model — transactioneel (SES, ongewijzigd), automatische digests, handmatige maatwerk-mails — allemaal op SES.

**Synergie met de Google-voorkeursbron-knop:** zet die knop ook onderaan de digest. De loyale, ingelogde digest-achterban is precies het publiek dat je vraagt MD als voorkeursbron toe te voegen.

## Wat bewust buiten deel 2 valt

- **Gedrag-gedreven aanbevelingen** ("omdat je X bekeek") boven op de follow-gedreven digest. Later, op meer data.
- **Een gepersonaliseerde feed op de site zelf** (naast de mail). Later.
- **Per-follow typefilter als latere verfijning** (de initiële type-selectie zit er nu al wél in).
- **AI-geschreven digest-intro's.** Fase-3-verfijning.

## AVG

Lichter dan bij het anonieme gedrag uit deel 1: een follow is een expliciete opt-in, gekoppeld aan een account — dat is meteen de grondslag om iemand te mailen. De personalisatie leunt op gedrag dat al onder de deel-1-consent valt.

## Openstaande afhankelijkheden

- **De mailtool** (op SES — Sendy, MailPoet of managed) is nog niet gekozen. Feature B hangt daaraan; Feature A (de follow-functie) niet — die kan vooruit.

## Werkverdeling — samengevat

- **Claude (frontend):** de hele follow-laag (toggle, popover, catch, digestblok, accountbeheer), de digest-sjabloonstructuur met de drie blokken en de logica die blok 1 uit de follows samenstelt, en de dashboards met follow-statistiek.
- **Johan (backend):** de follow-relatieopslag met endpoints, de volgbaar-berekening op membership, het wegschrijven van follow-events, en de koppeling met de mailtool.

## Volgende stap

Deel 1 is vastgelegd en gaat als spec naar Johan. Feature A (follow) bouw ik daar grotendeels parallel naast — die heeft alleen het fundament nodig, niet de mailtool. Feature B (de mail) volgt zodra de follows binnenstromen én de mailtool gekozen is.
