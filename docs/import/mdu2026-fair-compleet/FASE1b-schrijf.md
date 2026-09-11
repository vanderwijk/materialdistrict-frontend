# Fase 1b schrijf — contactpersonen — 2026-09-11

Batch: `mdu2026-exposant-contact-01`  
Bron-JSON: `fase1-uitvoer/mdu2026-exposant-contact.json` (117 rijen)

## Resultaat live CMS

| Metriek | Waarde |
|---------|--------|
| Nieuwe users | **0** (117 e-mails bestonden al) |
| Nieuwe `contactpersoon`-rijen | **61** |
| Al gekoppeld (andere rol) | **56** — meestal `medewerker` uit `mdu2026-personen-01` |
| Activiteiten | **0** (bewust) |
| `mag_beheren` | altijd **0** |
| Geweigerd | **0** |

Grond (61 nieuwe):

- `registratie` 34  
- `domein` 22  
- `domeinstam` 5  

## Schema-notitie

`wp_md_user_brand` heeft unique key `(user_id, brand_id)` — **niet** per rol.  
Daardoor kan iemand die al `medewerker` is geen tweede rij `contactpersoon` krijgen. Dat is correct gedrag voor deze ronde: standbemanning-rol blijft staan.

Schrijfscript aangepast: bestaanstoets is nu op `(user_id, brand_id)` i.p.v. + `rol`, zodat dry-run geen valse “rol toevoegen” meer toont en INSERT geen Duplicate-entry meer gooit.

## Overslagen exhibitors

18 exposant-rijen zonder WEL-merk uit fase 1 (geen contact-JSON).

## Terugdraaien

```text
wp eval-file …/md-import-personen.php …/mdu2026-exposant-contact.json schrijf terugdraai=mdu2026-exposant-contact-01
```
