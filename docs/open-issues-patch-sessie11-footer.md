# Open issues — addendum sessie 11 (Footer-links)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.

## Footer — wat nu werkt vs. wat nog volgt

`Footer.tsx` in-place gepatcht — alleen het legal-blok gewijzigd, rest
byte-identiek.

- **Discover** (Materials/Stories→/articles/Events/Talks/Books/Brands): wees al
  correct naar live routes. Ongewijzigd.
- **Legal** (gefixt):
  - Privacy policy → `/privacy-statement` (live, Batch A).
  - Terms of use → directe externe link naar de stabiele PDF op
    materiahost.nl (besluit 29-05) — zie S11.5 (opgelost).
  - Cookie settings → VERBORGEN (uitgecommentd) tot er een consent-tool is — zie S11.6.

### S11.5 — Terms-link — OPGELOST (29-05)
**Besluit (29-05):** voorlopig als PDF houden (optie 2) — versievast juridisch
document. Er bestaat géén WP-`page` met terms-content. Footer-link “Terms of use”
wijst nu direct naar de canonieke, stabiele asset-URL:
`https://materiahost.nl/assets/MaterialDistrict_TermsConditions_V20-01.pdf`
(HTTP 200, application/pdf, geen redirect, buiten de WAF). Gewone externe link
in nieuw tabblad; geen CSP-aanpassing nodig (we embedden niet). Versie V20.01
(april 2020) is voorlopig actueel. Willen we later een echte content-pagina,
dan via dezelfde page-template (één regel in `PAGE_SLUG_MAP` + link naar intern).

### S11.6 — "Cookie settings" heeft een consent-tool nodig
**Eigenaar:** Jeroen + Claude
**Besluit (29-05):** link nu VERBORGEN (uitgecommentd in `LEGAL_LINKS`) tot er een
consent-tool is. "Cookie settings" hoort een knop te zijn die een consent-manager
opent, geen pagina. Te beslissen welke tool (Cookiebot / Usercentrics / eigen
banner); daarna wordt het een knop die de manager opent. Eén regel terugzetten.

### S11.7 — Vooruit-lopende footer-links
**Eigenaar:** Claude (lost vanzelf op per sessie)
**Besluit (29-05):** ongewijzigd laten. For specifiers / For manufacturers wijzen naar nog-niet-gebouwde routes
(`/register`, `/membership`, `/compare`, `/dashboard/boards`, `/changemakers`,
`/transitioners`). Bewust ongewijzigd gelaten: ze zijn vooruit-correct en gaan
werken zodra die sessies landen; verbergen zou twee grid-kolommen leeg trekken.
Geen actie.
