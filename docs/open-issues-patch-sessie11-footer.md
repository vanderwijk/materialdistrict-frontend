# Open issues — addendum sessie 11 (Footer-links)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.

## Footer — wat nu werkt vs. wat nog volgt

`Footer.tsx` in-place gepatcht — alleen het legal-blok gewijzigd, rest
byte-identiek.

- **Discover** (Materials/Stories→/articles/Events/Talks/Books/Brands): wees al
  correct naar live routes. Ongewijzigd.
- **Legal** (gefixt):
  - Privacy policy → `/privacy-statement` (live, Batch A).
  - Terms of use → interim externe link naar `https://materialdistrict.com/terms/`
    (serveert nu de PDF) — zie S11.5.
  - Cookie settings → VERBORGEN (uitgecommentd) tot er een consent-tool is — zie S11.6.

### S11.5 — Eigen Terms-pagina (Jeroen wil dit "straks anders")
**Eigenaar:** Jeroen (beslissing) → Claude (bouw)
`/terms/` linkt nu naar de Terms-PDF (V20.01, april 2020). Te beslissen hoe we
dit op de frontend willen: (a) de PDF op de frontend hosten en daar naartoe
linken, of (b) een echte terms-content-pagina bouwen. Optie (b) kan via dezelfde
generieke pagetemplate als er een WP-`page` met terms-content is — dan één regel
in `PAGE_SLUG_MAP` + de footer-link omzetten van extern naar `/terms` (intern).
Tot die beslissing blijft de interim externe link staan.

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
