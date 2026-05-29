# Open issues — patch sessie 11 (Standaard contentpagina's, deel 1)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.

## 🔴 Blocker — wacht op Johan

### S11.1 — Contact-route geblokkeerd op Gravity Forms REST-info
**Eigenaar:** Johan (info) → Claude (Batch B-bouw)
De contact-pagina krijgt een eigen React-form dat server-side naar de Gravity
Forms REST-submission post (secret blijft server-side, geen CORS). Voor de bouw
nodig van Johan:
1. Is de Gravity Forms REST API (v2) aan, en welke auth voor submissions
   (consumer key/secret)? We posten server-side, dus een secret is prima.
2. Form-ID van het contactformulier (`/gf/v2/forms/<id>/submissions`).
3. Veld-mapping: welke GF-input-ID's horen bij naam / e-mail / onderwerp /
   bericht (+ overige verplichte velden)?
4. Verplichte velden + validatieregels.
5. Spambescherming (reCAPTCHA / honeypot)? reCAPTCHA maakt een headless submit
   lastig → dan een token-flow nodig.
6. Bevestiging dat een REST-submission nog steeds een entry aanmaakt én de
   notificatie-mails verstuurt zoals nu.

Batch B (bestanden `gravity-forms.ts`, `api/contact/route.ts`, `contact/page.tsx`,
`contact/components/ContactForm.tsx`) staat klaar zodra deze 6 antwoorden er zijn.

## 🟡 Voor deze sessie / verify

### S11.2 — `MaterialBody`: prose-breedte + static/dynamic-verificatie
**Eigenaar:** Claude (verify on build)
De gedeelde `MaterialBody` was niet in de geüploade set; hergebruikt op de
aanname dat-ie z'n breedte aan de parent ontleent. Twee dingen op de eerste
build checken: (a) leest de prose op `.ov-wrap-single` (1280px) niet té breed —
zo nodig één `max-width`-regel (`.content-page`) in `globals.css` (complete file);
(b) als `MaterialBody` `useSearchParams` (?q-highlighting) gebruikt, kan dat de
`[pageSlug]`-pagina dynamisch maken ondanks `generateStaticParams`. Acceptabel,
of anders een ?q-loze prose-variant. Pas aan zodra de build het uitwijst.

### S11.3 — Oude thema-CSS-klassen in WP-content
**Eigenaar:** Jeroen (beslissing) — laag-prioriteit
Sommige pagina's bevatten klassen als `col one-third` / `two-thirds` van het oude
thema; die styling bestaat in de frontend niet. v1 rendert dat als enkele kolom.
Indien een multi-kolom-layout gewenst is: lichte `columns`-styling in `globals.css`.

## 🟢 Resterend in build-order stap 11 (na deel 1)

### S11.4 — Overige stap-11-deliverables
**Eigenaar:** Claude (volgende sessies)
Nog te bouwen binnen stap 11: `/contact` (Batch B, zie S11.1); auth/account-
pagina's `/login`, `/register`, `/membership`; en de infra `not-found.tsx`,
`error.tsx`, `sitemap.ts`, `robots.ts`. Daarna rest alleen de homepage (stap 10).
