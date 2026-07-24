# Blauwdruk: het e-mail- en nieuwsbriefsysteem

*Het totaalbeeld, losstaand van welke tool er uiteindelijk gekozen wordt*

Alle e-mail van MaterialDistrict loopt via Amazon SES. SES is de verzendlaag; daarbovenop zit een laag die abonnees, segmentatie, automatisering en opmaak regelt. Deze blauwdruk beschrijft de structuur — de tool eronder is een aparte, nog open beslissing (zie onderaan).

## De drie soorten mail

### 1. Transactioneel — automatisch, app-gestuurd

Wachtwoord-resets, bestelbevestigingen (boeken), accountmails. Worden door de applicatie getriggerd, lopen al via SES. Hier verandert niets; dit staat los van alle marketing.

### 2. Terugkerende updates — het zelf-kies-concept, automatisch en sjabloon-gestuurd

De kern van de vernieuwing. Vervangt de handmatige tweewekelijkse nieuwsbrief die nu identiek naar iedereen gaat.

De abonnee bepaalt zelf twee dingen: welke kanalen (Materialen, Verhalen, Events, Talks) en welke frequentie (dagelijks of wekelijks). De mail wordt vervolgens samengesteld uit een sjabloon met drie soorten blokken:

- **A — automatische content:** de nieuwste items uit de gekozen kanalen, opgehaald uit de WordPress-feeds.
- **B — commerciële slots:** vaste plekken voor verkochte banners.
- **C — promo-blok:** een roterende Insider-talk of artikel, om membership te promoten.

Eenmalig inrichten; daarna loopt de samenstelling én de verzending automatisch op het gekozen interval. Omdat de mail wordt *samengesteld* en niet rechtstreeks uit de feed wordt gedumpt, passen de banner- en promo-blokken er vanzelf in.

### 3. Maatwerkmails — handmatig, naar segmenten

Evenement-uitnodigingen en betaalde thema-edities (bijvoorbeeld "10 biobased gevelmaterialen voor je gevel", waar de tien merken voor betalen). Deze worden door mensen opgemaakt in de composer en naar het relevante segment verstuurd, via dezelfde abonnee-infrastructuur.

## Het abonnee- en segmentmodel

Eén abonneebestand, met per persoon labels: de gekozen kanalen en de frequentie. Diezelfde labels sturen alles aan — wie welke automatische digest krijgt (Tier 2) én wie een bepaalde maatwerk- of thema-editie krijgt (Tier 3). Voor ingelogde gebruikers staan de voorkeuren ook in hun account en blijven die gesynchroniseerd.

## De commerciële laag — waarom dit geld oplevert, niet kost

De banners (Tier 2, blok B) en de sponsored thema-edities (Tier 3) zijn inkomstenstromen, en het promo-blok (blok C) voedt de membership-inkomsten. Het belangrijke inzicht: segmentatie maakt je advertentie-inventaris wáárdevoller, niet lastiger. Een gevelbanner die alleen naar de materialen-volgers gaat, is voor een adverteerder meer waard dan een banner over de hele lijst — gerichter bereik rechtvaardigt een hoger tarief. En de betaalde thema-edities landen beter bij het juiste segment. De nieuwsbrief is daarmee tegelijk verkeerskanaal, retentiekanaal én advertentieproduct.

## Het aanmeld- en beheerpunt (frontend)

De toggle-widget (kanalen aanvinken + frequentie kiezen) komt op een paar plekken: onderaan een artikel, op een aanmeldpagina, en in het account voor het beheren van voorkeuren. De keuzes worden als labels naar het abonneebestand weggeschreven.

## Wat automatisch loopt versus wat handwerk blijft

Automatisch, na eenmalig inrichten: het transactionele verkeer en de terugkerende digests (samenstelling plus verzending). Bewust handwerk, maar beperkt: het inplannen van de verkochte banner per periode, en het opmaken van de maatwerk- en thema-edities. Zo verdwijnt het routinewerk en gaat de menselijke aandacht alleen naar wat geld oplevert of een persoonlijke touch vraagt.

## Hoe het op SES rust

SES verzorgt de verzending voor alle drie de soorten mail. De laag erbovenop levert abonneebeheer, segmentatie, de sjabloon/composer, de automatisering, tracking en de bounce- en uitschrijfafhandeling. Eén technisch aandachtspunt: houd het transactionele verkeer en het marketingverkeer in SES gescheiden (via aparte streams/configuration sets), zodat een probleem met de marketingreputatie nooit de bezorging van wachtwoord-resets en bestelbevestigingen raakt.

## Rolverdeling

- **Claude (frontend):** de toggle-widget, het voorkeurenbeheer in het account, de koppeling die labels wegschrijft, en de sjabloonstructuur van de digest met de drie blokken.
- **Johan (backend/infra):** de gekozen laag op SES, de feeds per kanaal, de automatisering voor de digests, en de scheiding transactioneel/marketing in SES.
- **Redactie en sales:** de banners inplannen in de slots, de maatwerk- en thema-edities opmaken, en het Insider-promo-item aanleveren.

## De openstaande beslissing

De laag bovenop SES is nog te kiezen, en die keuze ligt primair bij Johan, op basis van onderhoud versus gemak:

- **MailPoet in WordPress** — composer waar het team al werkt, native "laatste berichten"-automatisering, geen aparte server; prettig voor de maatwerkmails.
- **Sendy** — goedkoopst, self-hosted op SES, maar de RSS-automatisering is een klein eigen klusje en de composer is gedateerd.
- **Managed SaaS** (MailerLite/Brevo) — duurder per maand, maar nul onderhoud en RSS ingebouwd.

De blauwdruk hierboven werkt op alle drie; alleen de manier waarop de blokken en de automatisering technisch landen, verschilt.
