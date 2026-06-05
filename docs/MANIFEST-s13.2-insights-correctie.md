# MANIFEST — S13.2 Insider insights, correctie (05-06-2026)

Een insider report is een EIGEN, los downloadbaar document (eigen CPT), géén
article/story-uitbreiding. Deze 5 frontend-bestanden zetten het model recht.
Overlay op de huidige main (deployed S13.2).

Gewijzigd:
- src/types/dashboard.ts                         InsightReport: summary→description,
                                                  category verwijderd, thumbnailUrl +,
                                                  insiderOnly = eigen veld.
- src/lib/dashboard/mappers.ts                   RawInsight/mapInsight idem
                                                  (thumbnail_url, description, eigen insider_only).
- src/lib/dashboard/mock.ts                       MOCK_INSIGHTS naar nieuw model.
- src/components/dashboard/panels/InsightsPanel.tsx  rij toont thumbnail-afbeelding
                                                  met gradient-fallback.
- src/styles/globals.css                          .insight-thumb krijgt object-fit:cover.

WP (Johan), punt 3 — bouw een dedicated CPT (bv. insider_report) en lever op
GET /md/v2/dashboard/insider-insights (snake_case):
  title, description, thumbnail_url, pdf_url, insider_only (eigen vinkje),
  pages, format.
Endpoint geeft de lijst voor ALLE ingelogde users (niet 403 voor niet-Insiders);
frontend gate't per rapport op insider_only + Insider-status.
"Preview" is geen veld — dat is de S13.5 tier-preview.
