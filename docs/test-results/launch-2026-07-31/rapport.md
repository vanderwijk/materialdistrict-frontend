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

Belangrijkste afwijkingen:

- De Stripe Sandbox-betaling toont een successmelding, activeert de Insider-status en blijft actief na opnieuw inloggen.
- SEPA-incasso is nu beschikbaar met IBAN- en mandaatformulier; het volgens het draaiboek vereiste iDEAL wordt nog niet getoond.
- Vier van de nieuwe channels in de hoofdnavigatie geven een 404.
- De globale zoekfunctie navigeert niet; de doelroute `/search/` bestaat niet en geeft 404.
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
| B3 | Niet geslaagd | Uitgelogd volgen gaf geen redirect, maar een modal “Create a free account to follow”. URL bleef `/channel/bio-based-living-materials/`. Screenshot: [B3-follow-logged-out-modal.png](./B3-follow-logged-out-modal.png). |
| B4 | Niet geslaagd | De loginlink uit de modal ging naar `/sign-in/` zonder `next`. Na login kwam de gebruiker op `/material/`, niet terug op het channel. |
| B5 | Geslaagd | Exacte frequentie: label “Email updates:” met “Weekly” geselecteerd. |
| C1 | Geslaagd | `/membership/` toont €10/maand, €100/jaar en de voordelen. |
| C2 | Niet geslaagd | Hertest na activeren van SEPA: `/checkout/?plan=insider` opent Stripe Sandbox voor €10 per maand met kaart, Klarna en “SEPA-incasso”. Selecteren van SEPA toont een IBAN-, rekeningnaam-, adres- en incassomandaatformulier. iDEAL zelf ontbreekt nog steeds, zodat de in het draaiboek gevraagde iDEAL-bankkeuze en simulatie niet konden worden uitgevoerd. Screenshot: [C2-retest-sepa-visible-no-ideal.png](./C2-retest-sepa-visible-no-ideal.png). |
| C3 | Geslaagd | Een sandboxbetaling met `4242 4242 4242 4242`, `12/34` en CVC `123` werd geaccepteerd. De return naar `/membership/?checkout=success&session_id=…` toont “Payment received.” en, na de auth-refresh, “You’re an Insider — you have full access.” Screenshot: [C3-retest-payment-success.png](./C3-retest-payment-success.png). |
| C4 | Geslaagd | `/dashboard/membership/` toont na de betaling Status `active`, Billing `Monthly` en verlenging op 31 augustus 2026. De avatar heeft de Insider-ring. Na volledig uitloggen en opnieuw inloggen bleef dezelfde actieve status zichtbaar. Screenshot: [C4-retest-insider-active.png](./C4-retest-insider-active.png). |
| C5 | Geblokkeerd | De succesvolle testbetaling gebruikte `e2e-dashboard-free@materialdistrict.com`; voor die mailbox is geen toegang beschikbaar. Een bevestigingsmail kon daardoor niet worden gecontroleerd. |
| C6 | Geslaagd | Vanuit Stripe Sandbox via “Terug naar MaterialDistrict” afgebroken. Terugkeer ging naar `/membership/?checkout=cancel`; de gratis CTA bleef zichtbaar en er werden geen Insider-rechten toegekend. |
| C7 | Geslaagd | De officiële Stripe-weigerkaart `4000 0000 0000 0002` gaf duidelijk: “Je creditcard is geweigerd. Probeer te betalen met een debitcard.” Na terugkeer bleef het account gratis. Screenshot: [C7-retest-declined-card.png](./C7-retest-declined-card.png). |
| D1 | Deels geslaagd | Hertest van de nieuwe beheerfunctie met `ZZTEST-20260731-brand-approve-03` en `ZZTEST-20260731-brand-reject-04`. Het Gmail-account toont nu correct “No matching brands.” en biedt geen bestaande Gmail-brands meer ter directe claim aan. Beide aanvragen verschenen onder WordPress `Brands → Brand requests` met de juiste gebruiker, contactgegevens, website, bericht en datum. Goedkeuren gaf “Request approved. Brand created and requester notified.”, maakte draft-brand ID `138592` aan, koppelde dit aan de gebruiker en stuurde de juiste goedkeuringsmail. Weigeren met een reden gaf “Request rejected. Requester notified.”, stuurde een mail met de opgegeven reden en maakte geen brand-record aan. Afwijking: het goedgekeurde brand blijft in het dashboard niet-klikbaar als `Pending setup`; de mail zegt wel dat het beheerd kan worden en linkt naar `https://materialdistrict.com/dashboard/brands`, maar deze URL kwam uit op een niet-gerelateerde openbare brandpagina. Screenshots: [D1-retest-brand-request-approved.png](./D1-retest-brand-request-approved.png), [D1-retest-brand-request-rejected.png](./D1-retest-brand-request-rejected.png), [D1-retest-approved-brand-pending-setup.png](./D1-retest-approved-brand-pending-setup.png). |
| D2 | Geblokkeerd | Het goedgekeurde draft-brand staat als niet-klikbaar `Pending setup` in het dashboard; het profiel kan niet worden geopend. |
| D3 | Geblokkeerd | Het goedgekeurde draft-brand is nog niet via het dashboard te beheren. |
| D4 | Geblokkeerd | Het goedgekeurde draft-brand is nog niet via het dashboard te beheren. |
| D5 | Geblokkeerd | Draft-brand `138592` is niet gepubliceerd en heeft geen openbare brandpagina. |
| E1 | Geslaagd | Via bestaand eigen fixture-brand opende `/dashboard/brands/e2e-basis-brand/materials/new/` het formulier “Add material”. |
| E2 | Geslaagd | Elf typen zichtbaar: (Bio)Plastics, Bio-based (excl. Wood), Ceramics, Coatings, Composites, Concrete, Glass, Leather, Metals, Natural Stones en Wood. |
| E3 | Niet geslaagd | De als Partner gedocumenteerde fixture toonde “Current plan Free”; channel coupling bleef vergrendeld. De openbare header biedt 15 channels aan, waaronder Sustainable, Lightweight, Translucency en Leisure & Hospitality. Screenshot: [E3-partner-fixture-shows-free.png](./E3-partner-fixture-shows-free.png). |
| E4 | Geblokkeerd | Het goedgekeurde draft-brand uit D1 is niet-klikbaar en kan niet worden beheerd. |
| E5 | Geblokkeerd | Afhankelijk van E4. |
| E6 | Geblokkeerd | Afhankelijk van E5. |
| E7 | Geblokkeerd | Geen testmateriaal aangemaakt. |
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
| H1 | Niet geslaagd | De eerste elf zichtbare channelpagina's t/m Translucency tonen inhoud. Energy & Resilience, Net Zero & Carbon, Regenerative en Timber staan ook in de hoofdnavigatie maar geven 404. Screenshot: [H1-timber-404.png](./H1-timber-404.png). |
| H2 | Geslaagd | Homepage van boven tot onder gecontroleerd: inhoud aanwezig, geen kapotte of nul-grote afbeeldingen. |
| H3 | Niet geslaagd | Zoeken op `wood` en `timber` via het header-zoekveld navigeerde niet. De implementatie wijst naar `/search?q=…`, maar `/search/` geeft 404. Screenshot: [H3-search-no-navigation.png](./H3-search-no-navigation.png). |
| H4 | Niet geslaagd | `/search/?q=zztest-no-results-20260731` geeft een generieke 404 in plaats van een lege zoekstaat. Screenshot: [H4-search-route-404.png](./H4-search-route-404.png). |
| H5 | Geslaagd | `/zztest-20260731-does-not-exist/` toont een nette sitebrede 404 met “This page could not be found.” |
| H6 | Geslaagd | Homepage, materiaalpagina en artikelpagina getest op 390×844. Geen horizontale overflow; geen kapotte afbeeldingen. Screenshot: [H6-mobile-material.png](./H6-mobile-material.png). |
| H7 | Waarneming | Tijdens deze browsersessie verscheen geen cookiemelding. Omdat bestaande browservoorkeuren niet zijn gewist, is dit niet als defect beoordeeld. |

## Afwijkingen op ernst

### Blokkerend

Geen open blokkerende afwijkingen na de hertests van G2, G3 en C3–C4.

### Ernstig

1. **Kritieke follow-returnflow verliest de herkomstpagina.**
   Van `/channel/bio-based-living-materials/` naar `/sign-in/` zonder `next`; na login naar `/material/`.

2. **Globale zoekfunctie heeft geen werkende doelroute.**
   Het veld navigeert niet; `https://materialdistrict-frontend.vercel.app/search/?q=zztest-no-results-20260731` geeft “404 — This page could not be found.”

3. **Vier aangeboden channels geven 404.**
   `energy-resilience`, `net-zero-carbon`, `regenerative` en `timber`.
   Voorbeeld: `https://materialdistrict-frontend.vercel.app/channel/timber/`.

4. **Partner-testfixture is niet als Partner actief.**
   `e2e-partner-brand` toont “Current plan Free”, waardoor channel coupling niet kan worden getest.

5. **iDEAL ontbreekt in Stripe Checkout.**
   De sandboxcheckout opent correct voor €10 per maand en biedt kaart, Klarna en SEPA-incasso.
   Selecteren van SEPA toont een volledig IBAN- en incassomandaatformulier.
   De vereiste iDEAL-bankkeuze en simulatie uit C2 zijn niet beschikbaar.
   Screenshot: [C2-retest-sepa-visible-no-ideal.png](./C2-retest-sepa-visible-no-ideal.png).

6. **Goedgekeurd brand is nog niet beheerbaar en de e-maillink is onjuist.**
   Goedkeuring maakt draft-brand `138592` en koppelt het aan de gebruiker, maar
   het dashboard toont het alleen als niet-klikbaar `Pending setup`. De mail zegt
   “You can manage it in your dashboard” en linkt naar
   `https://materialdistrict.com/dashboard/brands`; deze URL kwam uit op een
   niet-gerelateerde openbare brandpagina. Screenshot:
   [D1-retest-approved-brand-pending-setup.png](./D1-retest-approved-brand-pending-setup.png).

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
| Account | `vanderwijk+zztest-20260731-01@gmail.com` | Aangemaakt en actief; wachtwoordreset voltooid. Op `/dashboard/profile/` is geen account-ID of verwijderactie beschikbaar. |
| Account | `vanderwijk+zztest-brand-20260731-02@gmail.com` | Aangemaakt voor de Gmail-brandroute en actief. Geen bestaand brand geclaimd. |
| Stripe Sandbox-abonnement | `e2e-dashboard-free@materialdistrict.com` | Testkaartbetaling geaccepteerd; account heeft Status `active`, maandelijkse facturering en verlenging op 31 augustus 2026. Annuleer of reset dit testabonnement bij opschoning. |

Niet aangemaakt:

- Geen gepubliceerd brandrecord; goedkeuring heeft alleen draft-brand `138592` aangemaakt.
- Geen materiaal.
- Geen echte betaling; alle betaaltests zijn zichtbaar als Stripe Sandbox uitgevoerd.

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
