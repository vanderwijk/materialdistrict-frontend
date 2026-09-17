# MDU 2024 fair-compleet — importverslag

Geschreven: 2026-09-16. Editie **MDU 2024**, fairdatum **2024-03-06**, bezoekersdatum **2024-03-08**.

## Bijzonderheden

- Exposantenbestand is een **site-export** (`company_*`), geen Mailchimp-kolommen. `importeer.py` uitgebreid met die aliassen.
- Bugfix in `regels.py`: `me.com` matchte als deelstring in o.a. `claylime.com` → `is_vrij_domein()` op hostniveau + testgeval.

## Batches

| Batch | Resultaat |
|-------|-----------|
| `mdu2024-exposant-01` | 30 merken nieuw, 109 bijgewerkt |
| `mdu2024-exposant-act-01` | 139× exposant |
| `mdu2024-stand-01` | 489× standbemanning (32 bron-duplicaten) |
| `mdu2024-sprekers-01` | 28× spreker |
| `mdu2024-exposant-contact-01` | contactrollen (103 rijen; bestonden deels al) |
| `mdu2024-bezoekers-01`…`13` | 6164 unieke bezoekersactiviteiten |

## Multi-kandidaten (handmatig)

| Merk | brand_id |
|------|----------|
| 2TEC2 / Le Tissage d'Arcade | 31479 |
| Maiburg Hout BV | 17521 |
| Ege Carpets A/S | 121114 |
| Bolon Netherlands B.V. | 115147 |
| Asona Benelux BV | 120807 |

## Open

- **252 standbemanners zonder unieke domeinrol** → `fase3-uitvoer/stand-park.json`
- NIET-merken: Karijn Den Teuling, Elisabeth Klug, Stichting Fibershed Nederland
