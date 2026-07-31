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

Belangrijkste afwijkingen:

- De Insider-checkout kan niet starten: `/checkout/?plan=insider` toont “Your cart is empty.”
- Vier van de nieuwe channels in de hoofdnavigatie geven een 404.
- De globale zoekfunctie navigeert niet; de doelroute `/search/` bestaat niet en geeft 404.
- De follow-loginflow bewaart de herkomstpagina niet; na login komt de gebruiker op `/material/`.
- Een brand kan niet direct worden aangemaakt; alleen een review-aanvraag wordt verzonden. Daardoor zijn D2–D5 en E4–E7 geblokkeerd.

## Resultaat per stap

Legenda: **Geslaagd**, **Niet geslaagd**, **Geblokkeerd**, **Waarneming**.

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
| C2 | Niet geslaagd | `/checkout/?plan=insider` toont algemene checkout met exact “Your cart is empty.” en “Browse books”; geen Stripe- of iDEAL-flow. Op 31 juli 2026 opnieuw getest met de aangeleverde Stripe-testkaart beschikbaar. Ook de officiële account-CTA “Choose monthly” naar `/checkout/?plan=insider&interval=monthly` eindigde in dezelfde lege winkelwagen. De kaart kon daardoor nergens worden ingevoerd. Screenshots: [C2-membership-checkout-empty-cart.png](./C2-membership-checkout-empty-cart.png), [C2-retest-monthly-empty-cart.png](./C2-retest-monthly-empty-cart.png). |
| C3 | Geblokkeerd | Checkout kon niet worden gestart. |
| C4 | Geblokkeerd | Afhankelijk van C3. |
| C5 | Geblokkeerd | Afhankelijk van C3 en mailboxtoegang. |
| C6 | Geblokkeerd | Geen betaalflow beschikbaar om af te breken. |
| C7 | Geblokkeerd | Geen kaart- of Stripe-flow beschikbaar. |
| D1 | Niet geslaagd | “Add brand” leidt naar een review-aanvraag. `ZZTEST-20260731-brand-01` resulteerde alleen in “Thanks — your request has been sent. We'll review it and get back to you.”; er verscheen geen brand in het dashboard. Screenshot: [D1-brand-request-not-created.png](./D1-brand-request-not-created.png). |
| D2 | Geblokkeerd | D1 leverde geen testbrand op. |
| D3 | Geblokkeerd | D1 leverde geen testbrand op. |
| D4 | Geblokkeerd | D1 leverde geen testbrand op. |
| D5 | Geblokkeerd | D1 leverde geen openbare brandpagina op. |
| E1 | Geslaagd | Via bestaand eigen fixture-brand opende `/dashboard/brands/e2e-basis-brand/materials/new/` het formulier “Add material”. |
| E2 | Geslaagd | Elf typen zichtbaar: (Bio)Plastics, Bio-based (excl. Wood), Ceramics, Coatings, Composites, Concrete, Glass, Leather, Metals, Natural Stones en Wood. |
| E3 | Niet geslaagd | De als Partner gedocumenteerde fixture toonde “Current plan Free”; channel coupling bleef vergrendeld. De openbare header biedt 15 channels aan, waaronder Sustainable, Lightweight, Translucency en Leisure & Hospitality. Screenshot: [E3-partner-fixture-shows-free.png](./E3-partner-fixture-shows-free.png). |
| E4 | Geblokkeerd | Geen testbrand uit D1; bestaand fixture-brand is niet aangepast. |
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
| F9 | Geblokkeerd | De Insider-checkout is al bij C2 geblokkeerd. |
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

1. **Insider-betaling kan niet starten.**
   URL's: `https://materialdistrict-frontend.vercel.app/checkout/?plan=insider` en `https://materialdistrict-frontend.vercel.app/checkout/?plan=insider&interval=monthly`
   Exact: “Your cart is empty.”
   Gevolg: C2–C7 en F9 zijn niet uitvoerbaar.
   Hertest: uitgevoerd nadat testkaart `4242 4242 4242 4242` beschikbaar was gesteld; er verscheen nog steeds geen Stripe-formulier of testmode-indicator en de kaartgegevens zijn niet verzonden.
   Screenshots: [C2-membership-checkout-empty-cart.png](./C2-membership-checkout-empty-cart.png), [C2-retest-monthly-empty-cart.png](./C2-retest-monthly-empty-cart.png).

### Ernstig

1. **Kritieke follow-returnflow verliest de herkomstpagina.**
   Van `/channel/bio-based-living-materials/` naar `/sign-in/` zonder `next`; na login naar `/material/`.

2. **Globale zoekfunctie heeft geen werkende doelroute.**
   Het veld navigeert niet; `https://materialdistrict-frontend.vercel.app/search/?q=zztest-no-results-20260731` geeft “404 — This page could not be found.”

3. **Vier aangeboden channels geven 404.**
   `energy-resilience`, `net-zero-carbon`, `regenerative` en `timber`.
   Voorbeeld: `https://materialdistrict-frontend.vercel.app/channel/timber/`.

4. **Brand-onboarding maakt geen brand aan.**
   URL: `https://materialdistrict-frontend.vercel.app/dashboard/brands/new/`
   Exact: “Thanks — your request has been sent. We'll review it and get back to you.”
   Gevolg: D2–D5 en E4–E7 zijn geblokkeerd ten opzichte van het draaiboek.

5. **Partner-testfixture is niet als Partner actief.**
   `e2e-partner-brand` toont “Current plan Free”, waardoor channel coupling niet kan worden getest.

### Klein

1. **Ongeldig e-mailadres krijgt een misleidende melding.**
   URL: `/register/`
   Invoer: `geen-apenstaartje`
   Exact: “Email and password are required.” terwijl beide velden gevuld waren.

2. **Uitgelogd volgen opent een accountmodal in plaats van de verwachte directe loginredirect.**
   Dit is vooral hinderlijk; het ernstige gevolg — verlies van de return-URL — staat apart vermeld.

## Achtergebleven testdata

| Type | Identificatie | Status |
|---|---|---|
| Brandaanvraag | `ZZTEST-20260731-brand-01` | Achtergebleven als review-aanvraag; er werd geen ID in de UI getoond en er is geen verwijderactie beschikbaar. |
| Account | `vanderwijk+zztest-20260731-01@gmail.com` | Aangemaakt en actief; wachtwoordreset voltooid. Op `/dashboard/profile/` is geen account-ID of verwijderactie beschikbaar. |

Niet aangemaakt:

- Geen brandrecord in het dashboard.
- Geen materiaal.
- Geen testabonnement of betaling.

Tijdelijke followstatus op Bio-based & Living Materials is na de test weer verwijderd.

## Testbeperkingen

- De eerste G1–G4-meting tegen `materialdistrict-frontend.vercel.app/wp-json/` was ongeldig: op die host draait geen WordPress. De API-resultaten in dit rapport zijn vervangen door de hertest tegen de twee WordPress-hosts. De bestaande screenshot `G1-public-api-403.png` documenteert uitsluitend die vervallen eerste meting en geldt niet als bewijs voor G1–G4.
- Gmail is gekoppeld en de registratie- en resetmails zijn gecontroleerd. De AWS-trackinglink in de resetmail kon niet door de geautomatiseerde browser worden geopend; de gebruiker heeft die finale resetstap handmatig bevestigd.
- De kapotte Insider-checkout blokkeerde de betaal- en prijsmanipulatietests.
- De brandaanvraag leverde geen direct bruikbaar testbrand op.
- Het draaiboek vroeg om elf channels, terwijl de header er vijftien toont. Alle vijftien zichtbare links zijn daarom gecontroleerd; elf werken en vier geven 404.
