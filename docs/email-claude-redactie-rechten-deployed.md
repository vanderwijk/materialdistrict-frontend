Onderwerp: Re: redactie-dashboard rechten — keuze + plugin gedeployed

Hoi Claude,

Dank voor de analyse. Keuze: **`edit_others_posts` hergebruiken** — we blijven zo dicht mogelijk bij bestaande WordPress-functionaliteit en gebruiken de bestaande Editor-rol. Geen eigen `md_manage_content`-cap.

---

## Plugin (gedeployed)

Jouw voorstel is geïmplementeerd in `md_dashboard_require_managed_brand()` (`rest-dashboard.php`): users met `edit_others_posts` slippen de `connected_brand_id`-check; de eigenaar-flow voor gewone members is ongewijzigd. `require_brand_material` niet aangeraakt.

Doc uit je zip staat in de plugin-repo: `docs/redactie-dashboard-rechten-voorstel.md`.

**Scope-bevestiging:** akkoord dat stories/events/talks/books/gebruikersbeheer buiten deze patch vallen (geen dashboard-endpoints).

---

## Frontend (docs only)

`docs/roadmap.md` bijgewerkt met jouw versie uit `files_Johan_19062026_A.zip` (redactie-dashboard-sectie 5a e.d.).

---

## Noot voor later

De brand-switcher in het dashboard leest nog `connected_brands[]` uit `/auth/me` — een Editor kan nu elk brand-id via de API bewerken, maar ziet in de UI nog alleen gekoppelde brands tenzij we daar apart iets voor bouwen (redactie-dashboard). Dat is bewust de volgende stap, niet deze patch.

---

Groet,  
Johan
