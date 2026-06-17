# Fase 1 — logging en datalaag

*De eerste, gedisciplineerde plak: wát we loggen, hoe het wordt opgeslagen, en hoe de identiteit eraan vastzit. Bewust beperkt tot het fundament dat je niet met terugwerkende kracht kunt bouwen. De slimme features (dashboards, AI-agent, crawler, aanbevelingen) draaien later op deze data en horen in fase 2/3.*

*Status: vastgelegd. Dit is de bron voor Johans backend-spec.*

## Waarom dit eerst

Onder álles wat we willen — de follow-functie, de gepersonaliseerde mail, de dashboards, het AI-proof maken — ligt deze datalaag. Het is het enige stuk dat niet kan wachten: data die je vandaag niet vastlegt, krijg je nooit meer terug. Elke dag zonder logging is verloren data. Daarom gaat dit fundament als eerste in gang.

## Architectuur — vastgelegde keuzes

- **Aparte analytics-database**, gescheiden van de content-database. Besloten. Welke engine en waar is Johans invulling; dát het apart is, staat vast.
- **Twee lagen.** Een ruwe eventlaag (elke gebeurtenis als regel) en samenvattingstabellen (periodieke rollup). Dashboards lezen alleen de samenvattingen.
- **Praktisch real-time.** De historie komt uit de samenvattingen, "vandaag tot nu toe" wordt daar live bovenop opgeteld. Geen dag vertraging, en de ruwe laag wordt niet bij elke load bevraagd.
- **Migratie van de bestaande tellers.** De huidige view-tellers gaan als één "tot-migratie"-basisregel de samenvattingstabellen in. Granulaire historie begint bij go-live; de oude totalen gaan niet verloren.
- **Eén aanvoerroute in fase 1:** real-time webevents (frontend → proxy → endpoint → eventlaag). De import-route voor externe data is parked — zie onderaan.

## De identiteits-ruggengraat — kern

Alles valt of staat met kunnen koppelen wie-is-wie over contexten:

- ingelogd → `user_id`
- anoniem → `anonymous_id` (cookie)
- bij inloggen of registreren wordt het anonieme id "gestitcht" aan het `user_id`, zodat het gedrag van vóór de login meekomt naar het account.

Dit is platform-infrastructuur die je sowieso nodig hebt, los van de beurs of wat dan ook.

## Wat we loggen — fase 1, kern

Generieke eventvorm: gebruiker (`user_id` of `anonymous_id`), `event_type`, `object_type`, `object_id`, `timestamp`, `session_id`, `source`. Generiek van opzet: nieuwe event-types en nieuwe object-types (zoals dynamische channels) schuiven er zonder schemawijziging in.

**Content-interacties** — voor story, material, brand, talk, event en book:

- viewed, shared, saved (board/bookmark)
- download (op download-niveau, bijvoorbeeld een brochure)
- website-klik (brand)
- sample- of info-aanvraag (material — hoog-intentie)

**Ontdekking en intentie:**

- zoekopdracht (de zoekterm zelf — toont vraag én gaten in het aanbod)
- toegepaste filter-*combinatie* (zie logging-discipline hieronder)
- follows: `channel_followed`, `brand_followed` (met de gekozen content-types als kenmerk)
- `preferred_source_click` (object_type=site) — klik op de Google-voorkeursbron-knop, met de plek als `source`

**Intentie zonder voltooiing — de trechters (live onderdelen):**

- info-/sample-aanvraag: gestart → wel/niet verstuurd
- membership: insider-teaser geklikt → wel/niet Insider geworden
- *(cart-abandon van de boekshop hoort in dit rijtje, maar pas zodra de boekshop live is — nu contingent, niet bouwen)*

**Herkomst van verkeer:**

- bron per sessie, inclusief nieuwsbrief-clicks zodra de mailtool draait — zodat je ziet waar verkeer vandaan komt.

## Logging-discipline — niet alles, het juiste

De waarde zit in de juiste signalen, niet in volume. Te veel verzamelen verdunt het beeld en verzwaart de AVG. De filter is simpel: **"zou ik hiernaar handelen?"**

- **Wél loggen — vraag en intentie.** Een toegepaste filter-*combinatie* leggen we vast als één zoek-event op het moment dat het resultaat is uitgekristalliseerd (niet elke losse klik tijdens het schuiven). De gouden facetten zijn toepassing/applicatie plus eigenschappen (akoestisch, biobased, brandklasse) — dat is de echte vraag van de markt.
- **Niet loggen — UI-gefriemel.** Sorteren, weergave-toggle, paginering, scrollen. Dat is interface-ruis, geen signaal.
- **Aggregaat-eerst.** Geen eeuwige per-gebruiker filtersporen; we sturen op patronen op segment-niveau, niet op individuele surveillance.

**Profilering** (rol, type bedrijf, beslissingsbevoegdheid) is de echte moat, maar ook het zwaarst voor de AVG. Aanpak: vrijwillig opgegeven profielgegevens verzamelen, gedrag op **segment-niveau** koppelen, en licht blijven op het individuele niveau.

## Dynamische channels

Er zijn er nu ~20, en er komen er bij en gaan er weg. Daarom:

- channels worden aangesproken op een **stabiel id**, niet op naam of slug;
- een opgeheven channel wordt **gearchiveerd (soft-delete)**, niet verwijderd — zo blijven historie én bestaande follows intact;
- nieuwe channels verschijnen vanzelf; de generieke eventvorm (object_type=channel, object_id) vangt ze zonder aanpassing op;
- optioneel periodiek opruimen van follows op dode channels.

## Wat bewust buiten fase 1 valt

- **Beursdata (shows en no-shows).** Een losse, afkoppelbare verrijking. Extern ticketingsysteem (import, geen eigen pijplijn), gekoppeld op e-mail aan de identiteits-ruggengraat, en alleen relevant zolang MD de event-tak houdt. Komt als fase-2-bolt-on, zonder kernafhankelijkheden — zodat een eventuele verkoop van de event-tak het fundament niet raakt.
- **Per-follow typefilter** als latere verfijning (de *initiële* type-selectie bij het volgen zit wél in deel 2 — zie daar).
- **De intelligence-laag.** Uitgebreide dashboards, AI-agent, brand-crawler, aanbevelingen, opportunity scoring. Fase 2/3, bovenop deze data.

## AVG

- Anoniem gedrag loggen raakt de AVG → afstemmen op de cookie-consent (pseudoniem id, bewaartermijn). Het wel/niet accepteren van anonieme events en de grondslag is een product/juridische knoop voor jou en Johan samen.
- De zwaardere variant — offline beursdata koppelen aan online gedrag van identificeerbare mensen — is parked en vraagt te zijner tijd een eigen grondslag.

## Werkverdeling

Het leeuwendeel ligt bij de frontend; Johans deel is klein maar onmisbaar — het is de bodem waar de rest op staat.

- **Claude (frontend, ~95%):** events afvuren op de juiste plekken, de proxy verbreden voor de nieuwe types, de anoniem-id-afhandeling aan de clientkant, de dashboards die de nieuwe cijfers tonen — plus het uitschrijven van Johans spec.
- **Johan (backend, het onmisbare deel):**
  1. de aparte analytics-database (twee lagen: ruwe events + samenvattingen);
  2. het generieke events-endpoint dat de eventvorm hierboven accepteert — **ook anonieme events**;
  3. de rollup-job (cron) die de samenvattingstabellen vult;
  4. het migratiescript dat de huidige view-tellers als basisregel meeneemt;
  5. de follow-relatieopslag (zie deel 2);
  6. de berekening "is deze brand volgbaar" op basis van membership (zie deel 2);
  7. de AVG-/anonieme-events-knoop.

## Volgende stap

Dit plan is vastgelegd → Johans spec gaat eruit (zie de mail). Parallel start ik de frontend- en proxy-kant die geen afhankelijkheid van Johan heeft.
