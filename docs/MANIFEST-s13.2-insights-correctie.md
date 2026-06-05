# MANIFEST — S13.2 Insider insights, correctie + gated PDF-download (05-06-2026)

Een insider report is een EIGEN, los downloadbaar document (eigen CPT), géén
article/story-uitbreiding. De PDF komt uit de WP media library en wordt NIET als
URL aan de frontend gegeven — downloaden gaat via een gated, per-user endpoint
dat het bestand streamt met de naam van de insider in de bestandsnaam.

## Frontend (overlay op huidige main)

Gewijzigd:
- src/types/dashboard.ts                         InsightReport: summary→description,
                                                  category weg, thumbnailUrl +,
                                                  insiderOnly = eigen veld,
                                                  pdfUrl → hasPdf (bool; geen URL).
- src/lib/dashboard/mappers.ts                   RawInsight/mapInsight: description,
                                                  thumbnail_url, eigen insider_only,
                                                  pdf_url → has_pdf.
- src/lib/dashboard/mock.ts                       MOCK_INSIGHTS naar nieuw model.
- src/components/dashboard/panels/InsightsPanel.tsx  thumbnail-afbeelding +
                                                  download-knop wijst naar de gated
                                                  route (geen rauwe URL).
- src/styles/globals.css                          .insight-thumb object-fit:cover.

Nieuw:
- src/app/api/dashboard/insider-insights/[id]/download/route.ts
    GET-proxy: stuurt de JWT door naar het WP-download-endpoint en streamt de
    bytes terug, inclusief Content-Disposition (zodat de per-user-bestandsnaam
    bij de browser aankomt). Een gedeelde link is nutteloos voor derden: de
    route vereist de eigen cookie van de insider.

## WP (Johan), punt 3 — te bouwen

CPT (bv. insider_report), velden:
  title, description, thumbnail (afbeelding/attachment),
  pdf (MEDIA LIBRARY-attachment, geen los URL-veld),
  insider_only (eigen vinkje), pages, format.

GET /md/v2/dashboard/insider-insights  → lijst voor ALLE ingelogde users
  (niet 403 voor niet-Insiders), per report:
    title, description, thumbnail_url, has_pdf (bool), insider_only, pages, format.
  GEEN pdf_url in deze payload.

GET /md/v2/dashboard/insider-insights/{id}/download  → nieuw, gated:
  - JWT vereist; check Insider-status + insider_only (anders 403).
  - Serveer de media-library-PDF met:
      * Content-Disposition filename mét de naam van de insider, bv.
        "Biobased-Materials-Trend-Report-Q1-2026__Voornaam-Achternaam.pdf";
      * ingebakken traceability: zet de gebruiker (naam/e-mail/id) in de
        PDF-metadata (Author/Producer/Keywords) en/of een onzichtbare
        footer/watermark, zodat herkomst achterhaalbaar blijft ook na hernoemen.
  - no-store; geen publiek toegankelijke URL.

## Product/content (los van code)
- Algemene voorwaarden: clausule opnemen dat insider-content niet zonder onze
  toestemming met derden gedeeld mag worden (onderbouwt de traceability).
