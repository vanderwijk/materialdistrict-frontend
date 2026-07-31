# Testrapport soft-launch MaterialDistrict

- Uitgevoerd: 31 juli 2026
- Omgeving: `https://materialdistrict-frontend.vercel.app/`
- De frontend draait op een previewdomein, maar gebruikt via `WP_API_URL` de gedeelde backend `https://cms.materialdistrict.com/wp-json`; dit is geen geïsoleerde stagingomgeving.
- Testaccounts: bestaande E2E-fixtures uit `docs/e2e-test-accounts.md`.
- Werkwijze: zichtbare browserflows; openbare API met unauthenticated `curl` tegen zowel `cms.materialdistrict.com` als `materialdistrict.com`.
- Er zijn geen reparaties of work-arounds uitgevoerd.

## Samenvatting

Belangrijkste positieve resultaten:

- In- en uitloggen werkt; de gebruikersnaam verschijnt in het topmenu.
- De wachtwoordreset werkt: de resetmail komt aan, het oude wachtwoord wordt daarna geweigerd en het nieuwe werkt.
- Een gevolgd channel blijft gevolgd na verversen; ontvolgen vraagt bevestiging.
- De talk-paywall schermt de videobron af voor zowel uitgelogde als gratis gebruikers.
- Cross-brand dashboardtoegang en aanmaken van materiaal onder een ander brand worden met een 404 geweigerd.
- De homepage, 404 en drie mobiele pagina's renderen zonder kapotte afbeeldingen of horizontale overflow.
- Dubbele registratie geeft een nette melding.
- De elf materiaaltypen zijn aanwezig, inclusief Composites en Leather.
- De publieke talk-API verbergt na de hertest de Vimeo-ID's van alle 92 CMS- en 99 productietalks.
- De publieke lead-route is na de hertest op CMS en productie verwijderd en geeft 404.
- De WordPress-wachtrij voor brandaanvragen toont nieuwe aanvragen met alle
  ingediende gegevens; goedkeuren en weigeren werken en sturen de juiste e-mails.
- Publieke e-maildomeinen zoals `gmail.com` leveren na de hertest geen direct
  claimbare bestaande brands meer op.
- De aanvullende brandmembership-hertest is volledig geslaagd: een Basis-plan
  opent Stripe Sandbox voor exact €750 per jaar, verwerkt kaartbetaling en zet
  alleen het gekozen brand via de webhook van Free naar Basis. De status blijft
  na verversen en opnieuw inloggen behouden.

Belangrijkste afwijkingen:

- De Stripe Sandbox-betaling toont een successmelding, activeert de Insider-status en blijft actief na opnieuw inloggen.
- iDEAL/Wero is bij de nieuwste hertest beschikbaar in de Insider-checkout; de
  eerste betaling gaat via de bank en vervolgbetalingen via SEPA-incasso.
- Drie van de nieuwe channels in de hoofdnavigatie geven nog 404;
  `regenerative` is hersteld.
- De route `/search/` en de lege zoekstaat werken nu, maar het zoekveld in de
  header verstuurt de zoekopdracht nog niet.
- De follow-loginflow bewaart de herkomstpagina niet; na login komt de gebruiker op `/material/`.
- Een goedgekeurde aanvraag wordt als draft-brand gekoppeld maar blijft
  niet-klikbaar als `Pending setup`. De goedkeuringsmail zegt dat het brand
  beheerd kan worden en linkt naar een URL die niet naar het dashboard leidt.

## Resultaat per stap

Legenda: **Geslaagd**, **Deels geslaagd**, **Niet geslaagd**, **Geblokkeerd**, **Waarneming**.

| Stap | Uitkomst | Wat is gedaan en gezien |
|---|---|---|
| A1 | Niet geslaagd | Account `vanderwijk+zztest-20260731-01@gmail.com` is succesvol aangemaakt, maar er verscheen geen bevestigingsscherm. Het account werd direct ingelogd en doorgestuurd naar `/material/`; `ZZTEST` verscheen in het accountmenu. |
| A2 | Niet geslaagd | De welkomstmail kwam binnen ongeveer één minuut aan en stond in Inbox onder Promoties, niet in spam. Afzender was echter `MaterialDistrict noreply@materialdistrict.com`, niet het verwachte `news@materialdistrict.com`. De mail bevatte geen verificatielink; alleen links naar profiel, membership en homepage. Reply-to was niet beschikbaar in de door Gmail geleverde metadata. |
| A3 | Niet geslaagd | Er was geen verificatielink om te openen. Het account was direct actief en ingelogd. |
| A4 | Geslaagd | Het nieuwe `ZZTEST`-account uitgelogd en opnieuw ingelogd met het oorspronkelijke wachtwoord. Login lukte en `ZZTEST` verscheen in het topmenu. |
| A5 | Geslaagd | Reset aangevraagd; de pagina bevestigde dat een link was verstuurd. Mail “Reset your MaterialDistrict password” kwam binnen ongeveer één minuut aan, in Inbox onder Promoties en niet in spam, van `noreply@materialdistrict.com`. De gebruiker heeft de resetlink geopend en het nieuwe testwachtwoord bevestigd. Daarna gaf het oude wachtwoord exact “Invalid credentials.” en logde het nieuwe wachtwoord succesvol in naar `/material/`, met `ZZTEST` in het accountmenu. |
| A6 | Geslaagd | Registratie met `e2e-dashboard-free@materialdistrict.com` gaf exact: “An account with this email already exists.” URL: `/register/`. Screenshot: [A6-duplicate-email.png](./A6-duplicate-email.png). |
| A7 | Niet geslaagd | `geen-apenstaartje` werd geblokkeerd, maar de melding was onjuist: “Email and password are required.” terwijl beide velden gevuld waren. URL: `/register/`. Screenshot: [A7-invalid-email-wrong-error.png](./A7-invalid-email-wrong-error.png). |
| B1 | Geslaagd | Bio-based & Living Materials gevolgd. Schakelaar werd “Following” en bleef checked na verversen. |
| B2 | Geslaagd | Ontvolgen opende “Unfollow Bio-based & Living Materials?”; na bevestiging stond de schakelaar weer op “Follow”. |
| B3 | Niet geslaagd | Opnieuw getest na de nieuwste deployment: uitgelogd volgen geeft nog steeds geen redirect, maar de modal “Create a free account to follow”. URL blijft `/channel/bio-based-living-materials/`. Screenshot van de eerste meting: [B3-follow-logged-out-modal.png](./B3-follow-logged-out-modal.png). |
| B4 | Niet geslaagd | De loginlink uit de modal gaat nog steeds naar `/sign-in/` zonder `next`. Na login kwam het testaccount opnieuw op `/material/`, niet terug op het channel. |
| B5 | Geslaagd | Exacte frequentie: label “Email updates:” met “Weekly” geselecteerd. |
| C1 | Geslaagd | `/membership/` toont €10/maand, €100/jaar en de voordelen. |
| C2 | Geslaagd | Nieuwste hertest: `/checkout/?plan=insider&interval=monthly` opent Stripe Sandbox voor €10 per maand en toont `iDEAL | Wero` naast kaart. Selecteren van iDEAL toont naam, Nederland als regio, het bankredirectbericht en de SEPA-mandaattekst voor vervolgbetalingen. Er is geen betaling ingediend, zodat geen tweede Insider-abonnement ontstond. De oudere screenshot [C2-retest-sepa-visible-no-ideal.png](./C2-retest-sepa-visible-no-ideal.png) documenteert uitsluitend de inmiddels vervallen meting. |
| C3 | Geslaagd | Een sandboxbetaling met `4242 4242 4242 4242`, `12/34` en CVC `123` werd geaccepteerd. De return naar `/membership/?checkout=success&session_id=…` toont “Payment received.” en, na de auth-refresh, “You’re an Insider — you have full access.” Screenshot: [C3-retest-payment-success.png](./C3-retest-payment-success.png). |
| C4 | Geslaagd | `/dashboard/membership/` toont na de betaling Status `active`, Billing `Monthly` en verlenging op 31 augustus 2026. De avatar heeft de Insider-ring. Na volledig uitloggen en opnieuw inloggen bleef dezelfde actieve status zichtbaar. Screenshot: [C4-retest-insider-active.png](./C4-retest-insider-active.png). |
| C5 | Geblokkeerd | De succesvolle testbetaling gebruikte `e2e-dashboard-free@materialdistrict.com`; voor die mailbox is geen toegang beschikbaar. Een bevestigingsmail kon daardoor niet worden gecontroleerd. |
| C6 | Geslaagd | Vanuit Stripe Sandbox via “Terug naar MaterialDistrict” afgebroken. Terugkeer ging naar `/membership/?checkout=cancel`; de gratis CTA bleef zichtbaar en er werden geen Insider-rechten toegekend. |
| C7 | Geslaagd | De officiële Stripe-weigerkaart `4000 0000 0000 0002` gaf duidelijk: “Je creditcard is geweigerd. Probeer te betalen met een debitcard.” Na terugkeer bleef het account gratis. Screenshot: [C7-retest-declined-card.png](./C7-retest-declined-card.png). |
| D1 | Deels geslaagd | Opnieuw vanaf nul uitgevoerd met `ZZTEST-20260731-brand-flow-06`. De aanvraag is uitsluitend via `materialdistrict-frontend.vercel.app/dashboard/brands/new/` ingediend. Alleen de goedkeuring is via WordPress `Brands → Brand requests` uitgevoerd. De aanvraag verscheen daar met de juiste gebruiker, contactgegevens, website en boodschap; goedkeuren gaf “Request approved. Brand created and requester notified.” Direct na opnieuw inloggen stond het brand niet-klikbaar als `Pending setup`; bij een latere controle werd het zonder verdere CMS-ingreep alsnog een klikbaar Brand account en opende de profielroute correct. De flow kent dus een onduidelijke propagatievertraging zonder voortgangsindicatie of automatische refresh. Aanvullend is `ZZTEST-20260731-brand-link-07` via dezelfde frontend aangevraagd en in CMS goedgekeurd. De nieuwe goedkeuringsmail kwam aan, maar linkt nog naar `https://materialdistrict.com/dashboard/brands/zztest-20260731-brand-link-07` in plaats van het frontenddashboard. Screenshots van de eerdere flow: [BRAND-flow-06-cms-approved.png](./BRAND-flow-06-cms-approved.png), [BRAND-flow-06-approved-pending-setup.png](./BRAND-flow-06-approved-pending-setup.png), [BRAND-flow-06-accessible-after-delay.png](./BRAND-flow-06-accessible-after-delay.png). |
| D2 | Deels geslaagd | `ZZTEST-20260731-brand-flow-06` werd na vertraging beheerbaar; de directe frontend-profielroute laadt. Direct na goedkeuring bood de UI echter geen klikbare route en geen aanwijzing dat wachten/verversen nodig was. |
| D3 | Geslaagd | Op het beheerbare testbrand `ZZTEST-20260731-brand-e2e-05` zijn beschrijving, telefoon en adres uitsluitend via het frontend opgeslagen. Na volledige herlaadactie bleven alle waarden aanwezig. Het vooraf ingevulde land moest eerst naar een ander land en terug naar Nederland worden gezet voordat validatie groen werd en opslaan werkelijk startte. Screenshot: [BRAND-e2e-05-profile-saved.png](./BRAND-e2e-05-profile-saved.png). |
| D4 | Geslaagd | Verplichte profielvelden, volledig adres en het aanwezige logo werden door het frontend geaccepteerd; de opgeslagen waarden zijn tevens teruggelezen via de publieke brand-API. |
| D5 | Geblokkeerd | Het verse `brand-flow-06` staat nog niet in de publieke brand-API. Publicatie na het volledig invullen van dit nieuwe brand is in deze run niet afgerond. |
| BM1 | Geslaagd | De Membership-pagina van `ZZTEST-20260731-brand-flow-06` toont Free, Basis €750/jaar, Plus €1.500/jaar en Partner €3.000/jaar. “Upgrade to Basis” start `/checkout/?plan=brand&brandId=138595&tier=basis&brandSlug=zztest-20260731-brand-flow-06`. |
| BM2 | Geslaagd | De serverroute maakt een Stripe Checkout Session in Sandbox aan voor “Basic”, jaarlijks gefactureerd, totaal vandaag €750. De checkout toont kaart en iDEAL/Wero; bij iDEAL staat de toelichting dat vervolgbetalingen via SEPA Direct Debit lopen. |
| BM3 | Geslaagd | Annuleren via “Terug naar MaterialDistrict” keert terug naar de juiste brandmembershiproute met `?checkout=cancel`, toont “Checkout was cancelled. No charge was made” en laat de tier op Free. |
| BM4 | Geslaagd | Stripe-testkaart `4000 0000 0000 0002` wordt geweigerd met “Je creditcard is geweigerd. Probeer te betalen met een debitcard.” Er wordt geen plan geactiveerd. |
| BM5 | Geslaagd | Testkaart `4242 4242 4242 4242`, vervaldatum `12/34` en CVC `123` werd geaccepteerd. Return naar de brandmembershippagina bevat `checkout=success` en de Checkout Session-ID en toont “Payment received. Your brand plan is active.” |
| BM6 | Geslaagd | Brand ID `138595` veranderde direct van Free naar Basis en toont `0 of 5 materials published`. De status bleef aanwezig na een volledige herlaadactie en na uitloggen en opnieuw inloggen. Screenshots: [BRAND-flow-06-basis-active.jpg](./BRAND-flow-06-basis-active.jpg), [BRAND-flow-06-basis-persists-relogin.jpg](./BRAND-flow-06-basis-persists-relogin.jpg). |
| BM7 | Geslaagd | Controle op het andere brand `ZZTEST-20260731-brand-e2e-05` (ID `138593`) toont nog steeds Free. De succesvolle webhook heeft dus het brand uit de checkoutsessie bijgewerkt en niet een ander brand van dezelfde gebruiker. |
| E1 | Geslaagd | Via bestaand eigen fixture-brand opende `/dashboard/brands/e2e-basis-brand/materials/new/` het formulier “Add material”. |
| E2 | Geslaagd | Elf typen zichtbaar: (Bio)Plastics, Bio-based (excl. Wood), Ceramics, Coatings, Composites, Concrete, Glass, Leather, Metals, Natural Stones en Wood. |
| E3 | Niet geslaagd | Nieuwste hertest: de als Partner gedocumenteerde fixture `e2e-partner-brand` toont nu “Current plan Basis”, niet Partner. Op het materiaalformulier blijft “Channel coupling requires Partner” vergrendeld. De fixture is dus wel gewijzigd sinds de eerste meting (toen Free), maar nog niet correct geprovisioneerd. Oude screenshot: [E3-partner-fixture-shows-free.png](./E3-partner-fixture-shows-free.png). |
| E4 | Deels geslaagd | Materiaal `ZZTEST-20260731-material-e2e-05` is via de beveiligde frontend-API onder brand `138593` aangemaakt als ID `138602`, met featured image, Wood, Indoor en applicatie Acoustic Wall Panels. SVG is opnieuw via dezelfde frontendroute `/api/dashboard/media` getest onder brand `138595`; `ZZTEST-20260731-upload-07.svg` gaf opnieuw HTTP 400 met `File type is not allowed.` PNG werd bij de eerdere test wel geaccepteerd. |
| E5 | Geslaagd | De materialenlijst toont het nieuwe materiaal met categorie Acoustic Wall Panels, datum 31 juli 2026 en status Offline. |
| E6 | Geslaagd | De frontend-editpagina voor materiaal ID `138602` toont de volledige beschrijving, type Wood, Indoor, featured image, Acoustic Wall Panels en de opgegeven filtereigenschappen. Screenshot: [BRAND-e2e-05-material-138602.png](./BRAND-e2e-05-material-138602.png). |
| E7 | Deels geslaagd | Het materiaal is aangemaakt maar blijft Offline. De gratis tier toont `0 of 0 published`; publicatie is niet afgerond. Een mislukte eerste create met een niet-toegestane attachment liet bovendien materiaal ID `138597` achter, waardoor dezelfde testnaam tweemaal in de lijst staat. |
| F1 | Geslaagd | Gebruiker 2 op `/dashboard/brands/e2e-free-brand/` kreeg een 404. |
| F2 | Geslaagd | Gebruiker 2 op directe ID-URL `/dashboard/brands/137153/` kreeg een 404. |
| F3 | Geslaagd | Gebruiker 2 op `/dashboard/brands/e2e-free-brand/materials/new/` kreeg een 404. |
| F4 | Geslaagd | Uitgelogde talk toont “INSIDER ONLY”; geen iframe/video. In de bron stond `vimeoId:null`. Screenshot: [F4-talk-logged-out-paywall.png](./F4-talk-logged-out-paywall.png). |
| F5 | Geslaagd | Gratis gebruiker ziet dezelfde paywall; geen iframe, video, `vimeoId` of videobron in de DOM. Screenshot: [F5-talk-free-paywall.png](./F5-talk-free-paywall.png). |
| F6 | Geslaagd | Na uitsluiting van de door de Codex-browser geïnjecteerde sidebar-node stond geen reeks van negen of tien cijfers in de talkbron van de gratis gebruiker. |
| F7 | Geblokkeerd | In de beschikbare artikelindex was geen herkenbaar Insider-only artikel/rapport als testsample aanwezig. |
| F8 | Geblokkeerd | Op het gecontroleerde materiaal was geen Insider-download aanwezig om gericht te testen. |
| F9 | Geslaagd | Checkout gestart met gemanipuleerde parameters `amount=1`, `price=1` en `discount=100`. Stripe Sandbox bleef €10 per maand tonen. De gemanipuleerde sessie is met de weigerkaart ingediend en gaf de normale kaartweigering; de serverprijs won en er werd geen Insider-status toegekend. |
| G1 | Geslaagd | Unauthenticated `/wp-json/wp/v2/brand?per_page=5` geeft 200 op CMS en productie. In beide steekproeven van vijf brands zijn geen e-mailadressen, Stripe-gerelateerde velden of Stripe-identifiers gevonden. |
| G2 | Geslaagd | Hertest na deployment: unauthenticated `/wp-json/wp/v2/talk?per_page=100` geeft 200 op CMS en productie. Alle 92 CMS- en 99 productierecords zijn Insider-only en hebben `meta.vimeo_id:null`; er lekt geen Vimeo-ID. `meta.has_video` is `true` bij 91/92 CMS-records en 99/99 productierecords. De ene CMS-talk met `has_video:false` heeft eveneens `vimeo_id:null`. |
| G3 | Geslaagd | Hertest na deployment: unauthenticated `/wp-json/wp/v2/lead` geeft op CMS en productie 404 met code `rest_no_route`; de voorheen publieke leadcollectie is niet meer via deze route beschikbaar. |
| G4 | Geslaagd | Unauthenticated `/wp-json/wp/v2/users?per_page=5` geeft op beide hosts 401 met code `rest_forbidden`; er zijn geen e-mailadressen of gebruikersnamen zichtbaar. |
| H1 | Deels geslaagd | Nieuwste hertest van de vier eerdere 404-routes: `regenerative` werkt nu en toont zeven stories en twee talks. `energy-resilience`, `net-zero-carbon` en `timber` geven nog steeds 404. Screenshot van Timber: [H1-timber-404.png](./H1-timber-404.png). |
| H2 | Geslaagd | Homepage van boven tot onder gecontroleerd: inhoud aanwezig, geen kapotte of nul-grote afbeeldingen. |
| H3 | Deels geslaagd | `/search/?q=wood` werkt nu en toont 1.330 resultaten. Het header-zoekveld navigeert echter nog niet: na openen, `wood` invoeren en Enter blijft de URL op de huidige pagina. Screenshot [H3-search-no-navigation.png](./H3-search-no-navigation.png) toont de eerdere meting van hetzelfde headerprobleem. |
| H4 | Geslaagd | De zoekroute toont nu een nette lege staat. Query `qzxvbnm987654321nomatch` geeft “No results found” met links naar Materials en Stories, niet langer een 404. De oude screenshot [H4-search-route-404.png](./H4-search-route-404.png) documenteert de vervallen situatie. |
| H5 | Geslaagd | `/zztest-20260731-does-not-exist/` toont een nette sitebrede 404 met “This page could not be found.” |
| H6 | Geslaagd | Homepage, materiaalpagina en artikelpagina getest op 390×844. Geen horizontale overflow; geen kapotte afbeeldingen. Screenshot: [H6-mobile-material.png](./H6-mobile-material.png). |
| H7 | Waarneming | Tijdens deze browsersessie verscheen geen cookiemelding. Omdat bestaande browservoorkeuren niet zijn gewist, is dit niet als defect beoordeeld. |

## Afwijkingen op ernst

### Blokkerend

Geen open blokkerende afwijking in het bereikbaar worden van de brandroute: het
verse brand werd na vertraging alsnog klikbaar. De betaalde Basis-tier is nu
end-to-end afgerond; publicatie van het nieuwe brand is nog niet afgerond.

### Ernstig

1. **Kritieke follow-returnflow verliest de herkomstpagina.**
   Van `/channel/bio-based-living-materials/` naar `/sign-in/` zonder `next`; na login naar `/material/`.

2. **Globale zoekfunctie verstuurt de zoekopdracht niet vanuit de header.**
   De doelroute `/search/` werkt inmiddels, inclusief resultaten en lege staat.
   Invoer in het header-zoekveld gevolgd door Enter laat de URL echter ongewijzigd.

3. **Drie aangeboden channels geven 404.**
   `energy-resilience`, `net-zero-carbon` en `timber`. `regenerative` is hersteld.
   Voorbeeld: `https://materialdistrict-frontend.vercel.app/channel/timber/`.

4. **Partner-testfixture is niet als Partner actief.**
   `e2e-partner-brand` toont “Current plan Basis”, waardoor channel coupling
   vergrendeld blijft. iDEAL/Wero bij Insider is wel hersteld en is daarom uit
   deze openstaande lijst verwijderd.

5. **De goedkeuringsmail bevat nog een onjuiste beheerlink.**
   De verse mail voor `ZZTEST-20260731-brand-link-07` linkt naar
   `https://materialdistrict.com/dashboard/brands/zztest-20260731-brand-link-07`
   in plaats van het dashboard op `materialdistrict-frontend.vercel.app`.

6. **SVG-upload wordt tegengesproken door de backend.**
   Het materiaalformulier vermeldt “JPEG, PNG, SVG or WebP”, maar upload via
   dezelfde frontend-media-API gaf voor een geldig SVG-bestand
   `File type is not allowed.` PNG werd wel geaccepteerd.

### Klein

1. **Ongeldig e-mailadres krijgt een misleidende melding.**
   URL: `/register/`
   Invoer: `geen-apenstaartje`
   Exact: “Email and password are required.” terwijl beide velden gevuld waren.

2. **Uitgelogd volgen opent een accountmodal in plaats van de verwachte directe loginredirect.**
   Dit is vooral hinderlijk; het ernstige gevolg — verlies van de return-URL — staat apart vermeld.

3. **Welkomstmail loopt vooruit op de brandgoedkeuring.**
   Een als fabrikant geregistreerd Gmail-account ontvangt direct “your brand
   account is now ready”, terwijl het dashboard `Pending setup` toont en de
   brandaanvraag nog op goedkeuring wacht.

## Achtergebleven testdata

| Type | Identificatie | Status |
|---|---|---|
| Brandaanvraag | `ZZTEST-20260731-brand-01` | Achtergebleven als review-aanvraag; er werd geen ID in de UI getoond en er is geen verwijderactie beschikbaar. |
| Brandaanvraag | `ZZTEST-20260731-brand-02` | Vóór de nieuwe beheerwachtrij aangemaakt en niet zichtbaar in de nieuwe wachtrij. |
| Brand | `ZZTEST-20260731-brand-approve-03` — ID `138592` | Door goedkeuring aangemaakt als draft en aan het Gmail-testaccount gekoppeld; dashboard toont `Pending setup`. |
| Brandaanvraag | `ZZTEST-20260731-brand-reject-04` | Afgewezen met testreden; uit de wachtrij verwijderd en geen brand-record aangemaakt. |
| Brand | `ZZTEST-20260731-brand-e2e-05` — ID `138593` | Afgebroken test: na goedkeuring handmatig in CMS gepubliceerd en voorzien van de bestaande `woocommerce-placeholder`. Niet gebruikt voor de nieuwe frontend-only hertest. |
| Brand | `ZZTEST-20260731-brand-flow-06` — ID `138595` | Nieuwe frontend-only hertest; via Brand requests goedgekeurd en aanvankelijk `Pending setup`, later zonder CMS-ingreep alsnog klikbaar. Nu actief op Basis na een geslaagde Stripe Sandbox-betaling; nog niet zichtbaar in de publieke brand-API. |
| Brand | `ZZTEST-20260731-brand-link-07` | Verse hertest van de mailbeheerlink; via frontend aangevraagd en in CMS goedgekeurd. Goedkeuringsmail linkt nog naar de verkeerde host. |
| Materiaal | `ZZTEST-20260731-material-e2e-05` — ID `138597` | Achtergebleven Offline-record van de eerste create die HTTP 400 gaf vanwege een niet-toegestane attachment. |
| Materiaal | `ZZTEST-20260731-material-e2e-05` — ID `138602` | Via de frontend-API aangemaakt en zichtbaar/bewerkbaar in het dashboard; status Offline. |
| Brandtier-aanvraag | Basis voor brand ID `138593` | Membership-pagina toont `Requested ✓`; huidige tier blijft Free en er is geen Stripe-sessie gestart. |
| Account | `vanderwijk+zztest-20260731-01@gmail.com` | Aangemaakt en actief; wachtwoordreset voltooid. Op `/dashboard/profile/` is geen account-ID of verwijderactie beschikbaar. |
| Account | `vanderwijk+zztest-brand-20260731-02@gmail.com` | Aangemaakt voor de Gmail-brandroute en actief. Geen bestaand brand geclaimd. |
| Stripe Sandbox-abonnement | `e2e-dashboard-free@materialdistrict.com` | Testkaartbetaling geaccepteerd; account heeft Status `active`, maandelijkse facturering en verlenging op 31 augustus 2026. Annuleer of reset dit testabonnement bij opschoning. |
| Stripe Sandbox-brandabonnement | Brand `ZZTEST-20260731-brand-flow-06` — ID `138595`; Checkout Session `cs_test_a1wDHG4YhkL4VYCVVdzKED5vYQYbAg96wN93FSe297egGt6uSiB6sHmJmm` | Testkaartbetaling geaccepteerd; brand staat op Basis met 5 publicaties en jaarlijkse facturering van €750. Annuleer of reset dit testabonnement bij opschoning. |

Status van de nieuwe `brand-flow-06`-hertest:

- Geen materiaal onder `brand-flow-06`; de materiaalhertest is uitgevoerd onder
  het al beheerbare `brand-e2e-05`.
- Voor `brand-flow-06` is nu wel een actief Basis-brandabonnement en een Stripe
  Sandbox-sessie aangemaakt. De oudere handmatige Basis-upgradeaanvraag hoort
  bij brand ID `138593` en blijft als aparte testdata staan.

Tijdelijke followstatus op Bio-based & Living Materials is na de test weer verwijderd.

## Testbeperkingen

- De eerste G1–G4-meting tegen `materialdistrict-frontend.vercel.app/wp-json/` was ongeldig: op die host draait geen WordPress. De API-resultaten in dit rapport zijn vervangen door de hertest tegen de twee WordPress-hosts. De bestaande screenshot `G1-public-api-403.png` documenteert uitsluitend die vervallen eerste meting en geldt niet als bewijs voor G1–G4.
- Gmail is gekoppeld en de registratie- en resetmails zijn gecontroleerd. De AWS-trackinglink in de resetmail kon niet door de geautomatiseerde browser worden geopend; de gebruiker heeft die finale resetstap handmatig bevestigd.
- De interne brandnotificatie op `info@materialdistrict.com` is door de gebruiker
  bevestigd: ontvangen om 12:56, van `requests@materialdistrict.com`, met de
  juiste gegevens van `ZZTEST-20260731-brand-02`.
- C5 kon niet worden gecontroleerd omdat de gebruikte E2E-fixturemailbox niet toegankelijk is.
- De brandaanvraag leverde geen direct bruikbaar testbrand op.
- Het draaiboek vroeg om elf channels, terwijl de header er vijftien toont. Alle vijftien zichtbare links zijn daarom gecontroleerd; elf werken en vier geven 404.
