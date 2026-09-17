# MDU 2025 fair-compleet — importverslag

Geschreven: 2026-09-16. Editie **MDU 2025**, fairdatum **2025-03-12**, bezoekersdatum **2025-03-14**.

## Volgorde

1. `importeer.py` op exhibitors + catalogus + oordelen → `fase1-uitvoer/`
2. Merken schrijven: `import-mdu2025.php schrijf alleen-merken` (batch `mdu2025-exposant-01`)
3. Activiteiten/personen via `md-import-personen.php` + phone/address-enrichers

## Batches

| Batch | Resultaat |
|-------|-----------|
| `mdu2025-exposant-01` | 46 merken nieuw, 85 bijgewerkt, 537 velden |
| `mdu2025-exposant-act-01` | 131× exposant |
| `mdu2025-stand-01` | 418× standbemanning (49 bron-duplicaten overgeslagen), 131 nieuwe rollen |
| `mdu2025-stand-phones-01` | 14 telefoons gevuld |
| `mdu2025-sprekers-01` | 29× spreker |
| `mdu2025-exposant-contact-01` | 94 nieuwe contactpersoon-rollen |
| `mdu2025-bezoekers-01`…`10` | 4734 bezoekersactiviteiten + phones/addr |
| `mdu2024-2025-oordeel-01` | 2 merken nieuw: Ongekend Circulair **141948**, c MAKER labs **141949** |
| `mdu2024-2025-oordeel-02` | 10 rollen + 2× exposant (O04, C12). Jeroen 2026-09-16 |

## Bewust open

- Overige standbemanners zonder unieke domeinrol → `fase3-uitvoer/stand-park.json`. De vijf Jeroen-clusters zijn gedaan: zie `OORDEEL-schrijf.md`.
- **7 exposant-contactrijen** zonder merkmatch
- Geen `mag_beheren` uit import
- Maiburg multi-kandidaat → merk **17521** (Maiburg Hout); DenimX-product niet als standexposant

## Terugdraaien

Merken: `wp eval-file …/import-mdu2025.php schrijf terugdraai=mdu2025-exposant-01`  
Personen: `wp eval-file …/md-import-personen.php <json> schrijf terugdraai=<batch>`
