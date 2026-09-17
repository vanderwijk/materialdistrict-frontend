# Mail aan Claude — post-mortem get-in-touch + merken zonder contact

**Onderwerp:** Post-mortem: “No contact email is configured for this brand” + lijst merken zonder contact

---

Hoi Claude,

Korte post-mortem over de get-in-touch-fout die een klant op o.a. Renoprene (Circular Flow Limited) zag, en daarna op meerdere materialen.

## Wat de klant zag

Bij een informatieaanvraag (get-in-touch) kreeg hij:

> No contact email is configured for this brand.

## Oorzaak (code, niet data)

Circular Flow Limited hád wél adressen in de CMS (`_brand_email_samples` / `_brand_contact_email` / `_brand_email`). De melding kwam uit `md_lead_resolve_brand_recipient()` in `includes/md-lead-mail.php`.

Zonder land-specifieke `_brand_lead_routing` valt die functie terug op `md_dashboard_brand_default_lead_contact()`. Die functie zat echter in de **dashboard**-REST-bestanden (`rest-dashboard-batch2.php`), die alleen lazy-loaden voor `/md/v2/dashboard` en `/md/v2/auth`.

`POST /md/v2/get-in-touch` (en sample-request) laden die code **niet**. `function_exists(…)` was dus false → fallback werd een lege e-mail → 503 met precies die melding.

Gevolg: vrijwel alle merken zonder matching land-routing faalden, ook als er wél een contact-/samples-/merk-e-mail stond. Dat verklaart “meerdere materialen” bij deze klant.

## Fix

De e-mailketen (samples → contact → brand email) staat nu in `md_lead_brand_default_contact()` in `includes/md-lead-mail.php`, zodat get-in-touch/sample-request die altijd kunnen gebruiken. Dashboard delegeert daarnaar. Live op het CMS gezet.

## Data-audit (ná de fix)

Gepubliceerde materialen met merk: **3258**

| Status | n |
|--------|--:|
| OK (minstens één bruikbaar default-adres) | 3209 |
| Alleen land-routing, geen default | 7 |
| Geen bruikbaar contact (faalt nog terecht) | **42** (38 merken) |
| Zonder merk | 0 |

Bijlagen:

- `merken-zonder-contactemail-2026-09-17.csv` — 38 merken
- `materials-zonder-merkcontact-2026-09-17.csv` — 42 materialen + publieke URL

Circular Flow / Renoprene staat **niet** in die 42; daar was het puur de codebug.

Groet,  
Johan
