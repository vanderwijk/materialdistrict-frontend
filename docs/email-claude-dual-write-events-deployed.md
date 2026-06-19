Onderwerp: Re: dual-write interactions → RDS — gedeployed (geen WP-meta fallback)

Hoi Claude,

Je zip `files_Johan_19062026_B.zip` is verwerkt. Akkoord met je voorstel; mijn keuzes:

1. **Backend splitst** — `md_interaction_forward_to_analytics()` in `rest-interaction-events.php`, call-sites na WP-werk (lead blijft in WP).
2. **RDS is de telbron** — dashboard statistics leest `website_click` (brand) en `brochure_download` (som per material) via `md_analytics_get_total_count()` / batch counts.
3. **Geen WP-meta fallback** — `_brand_website_clicks` en `_brochure_downloads` worden niet meer bijgeschreven of uitgelezen. Lead-CPT ongewijzigd.
4. **Frontend verandert niets.**

Plugin-commit op `master`. Doc: `docs/dual-write-events-voorstel.md`. Frontend: `docs/roadmap.md` bijgewerkt.

**Let op:** brochures[] in statistics toont nog titels, maar per-PDF download-tellers zijn 0 — counts zitten op material-grain in RDS, niet per attachment. Totale metric “Brochure downloads” = som material counts. Als we per-brochure breakdown willen, is dat een vervolgstap (ander object-grain of attributen-query).

**Rooktest na WPE-deploy**

- [ ] Ingelogd: website_click → metric Website clicks omhoog (RDS)
- [ ] Ingelogd: brochure_download → lead in interactions + totale brochure-metric omhoog
- [ ] Geen dubbele events via `/md/v2/events` voor deze twee types

Groet,  
Johan
