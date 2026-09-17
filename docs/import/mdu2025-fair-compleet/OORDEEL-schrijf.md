# MDU 2024+2025 — Jeroen-oordelen uitgevoerd

Bron: `docs/import/mdu2024-2025-besluiten-jeroen.xlsx` (ingevuld 2026-09-16).
Personen en standbemanning stonden er al in. `mag_beheren` is 0.

## Beslissingen

| Cluster | BESLIST | Uitgevoerd |
|---------|---------|------------|
| Fibershed Nederland | **A** merk aanhouden | 141620 blijft. Josephine → `medewerker`. Stijntje was al `contactpersoon`. Geen 2024-exposant (dat jaar was NIET). |
| Stichting Ongekend Circulair | **B** toch een merk | Nieuw draft **141948**, exposant MDU 2025 stand O04. Robin `contactpersoon`, Jelle/Niek/Mart `medewerker`. |
| Biophilic Design Academy | **B** koppelen aan Studio Lime | Geen academy-merk, geen 2025-exposant op de academy. Vier personen op **141775**. Lianne `contactpersoon`, rest `medewerker`. Studio Lime houdt de 2024-exposant. |
| Chengdu Jingyangsheng Biotechnology | **B** alleen de personen | Geen extra merk uit standbemanning. Jing Chen was al `contactpersoon` op **141654** (dat record komt uit de 2025-exposantenimport, stand A14). Park-rij overgeslagen. |
| c MAKER labs | **A** nieuw merk | Nieuw draft **141949**, exposant MDU 2025 stand C12. Leon `contactpersoon`. Website `knoppertvanspijk.nl` (niet LinkedIn). Geen algemeen merk-e-mail: `leon@` is een persoon. |

## Batches

| Batch | Wat |
|-------|-----|
| `mdu2024-2025-oordeel-01` | 2 merken nieuw (141948, 141949), 13 velden |
| `mdu2024-2025-oordeel-02` | 10 nieuwe rollen, 1 rol bestond al (Stijntje), 2× exposant |

Databestanden: `docs/import/mdu2025-fair-compleet/fase5-uitvoer/import-mdu2024-2025-oordeel-data.json` en `mdu2024-2025-oordeel-02.json`.
Script merken: plugin `docs/import-mdu2025-fair/import-mdu2024-2025-oordeel.php`.
Personen: `docs/schrijfpad-personen-09-09-2026/md-import-personen.php`.

`oordelen.json` bijgewerkt (WEL Fibershed/Ongekend/Biophilic→Lime/c MAKER; NIET Chengdu-park).

## Terugdraaien

```text
wp eval-file …/md-import-personen.php …/mdu2024-2025-oordeel-02.json schrijf terugdraai=mdu2024-2025-oordeel-02
wp eval-file …/import-mdu2024-2025-oordeel.php …/import-mdu2024-2025-oordeel-data.json schrijf terugdraai=mdu2024-2025-oordeel-01
```

Tweede regel zet de twee nieuwe merken in de prullenbak. 141620 / 141775 / 141654 niet aanraken.
