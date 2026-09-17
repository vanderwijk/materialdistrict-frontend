# MDU 2024 + 2025 — verslag voor Claude / Jeroen

Geschreven: 2026-09-16. Fair-import van beide edities staat live. MDU 2023 wordt parallel nog geschreven; dit verslag gaat daar niet over.

Doel van dit bestand: Claude kan verder zonder de importeersessie over te doen. Jeroen vult alleen de open kolom in het bijgevoegde werkboek. Meetbaar werk is al gedaan.

Norm: `docs/importprotocol.md`. Python-regels: `docs/import/regels.py` (21/21 testgevallen groen). Oordelenregister: `docs/import/oordelen.json`.

---

## Wat live staat

| | MDU 2024 | MDU 2025 |
|---|---:|---:|
| Fairdatum activiteiten | 2024-03-06 | 2025-03-12 |
| Bezoekersdatum | 2024-03-08 | 2025-03-14 |
| exposant | 139 | 131 |
| standbemanning (activiteit) | 489 | 418 |
| spreker | 28 | 29 |
| bezoeker_aanwezig | 4386 | 3598 |
| no_show | 1778 | 951 |
| bezoeker_geregistreerd | — | 185 |
| **totaal activiteiten** | **6820** | **5312** |
| merkenbatch | 30 nieuw + 109 bijgewerkt | 46 nieuw + 85 bijgewerkt |

Bronnen en batchnamen: `docs/import/mdu2024-fair-compleet/` en `docs/import/mdu2025-fair-compleet/` (`BRONNEN.md`, `IMPORT.md`).

---

## Wat Johan al heeft beslist (niet opnieuw voorleggen)

Multi-kandidaten, uitgevoerd tijdens schrijf:

| Editie | Bronnaam | Gekozen `brand_id` | Niet gekozen |
|---|---|---:|---|
| 2024 | 2TEC2 / Le Tissage d'Arcade | **31479** (2tec2) | 3484 Le Tissage d’Arcade |
| 2024 + 2025 | Maiburg | **17521** (Maiburg Hout) | 128943 DenimX by Maiburg — product, geen standexposant |
| 2024 | Ege Carpets A/S | **121114** | 3362 Carpet Concept |
| 2024 | Bolon Netherlands B.V. | **115147** | 3770 Bolon AB |
| 2024 | Asona Benelux BV | **120807** | 18865 Asona Benelux |

Deze vijf horen in `oordelen.json` (zelfde vorm als i-did / NTGRATE). Dat is Claude-werk, geen Jeroen-oordeel.

LEOXX-adres van 11-09 (Ringveste 9 / Houten, Jeroen **NIET**) is **niet** overschreven. In het 2025-besluitenlog staat “LEOXX / Sasdijk 14”; dat is de **bronnaam** van de NTGRATE-/wineo-stand (distributeur LEOXX). Geschreven op nieuwe merken **141613 NTGRATE** en **141658 wineo**, conform `oordelen.json`. Meta-sleutel `_brand_address` (niet `_brand_address_line_1`).

---

## Veldlog (auto, protocol §10)

Elk veld dat niet 1-op-1 is overgenomen, staat in het besluitenlog. Geen open gate: ouder of zwakker verliest, leeg wordt gevuld.

| | 2024 | 2025 |
|---|---:|---:|
| regels | 276 (88 merken) | 138 (56 merken) |
| vult leeg veld | 150 | 44 |
| wordt vervangen (bronsterkte 1 tegen 9) | 69 | 72 |
| NIET vervangen | 57 | 22 |

NIET-vervangen is bijna altijd “brondatum ouder dan wat al live stond”. Dat is geen twijfelbak.

Bestanden:

- `docs/import/mdu2024-fair-compleet/fase1-uitvoer/besluitenlog-mdu2024.csv`
- `docs/import/mdu2025-fair-compleet/fase1-uitvoer/besluitenlog-mdu2025.csv`
- gecombineerd werkboek (bijlage mail): `docs/import/mdu2024-2025-besluiten-jeroen.xlsx`

---

## Bewust geen merk (NIET)

Niet geschreven als exposant-merk. Personen/activiteiten mogen wél.

**2024**

| Naam | Reden |
|---|---|
| Karijn Den Teuling | geen eigen domein, btw of KvK |
| Elisabeth Klug | geen eigen domein, btw of KvK |
| Stichting Fibershed Nederland | stichting |

**2025** — zeven contactrijen zonder merkmatch horen hierbij.

| Bron | Stand | Reden |
|---|---|---|
| (leeg — Bianca Slijkhuis / i-did-export) | A23 | geen bedrijfsidentiteit in de rij |
| MaterialDistrict testdata (Sjoerd) | X00 | test |
| Jeroen Wand (persoon, geen company) | — | geen bedrijfsidentiteit |
| Ioana Maria Caramiciu | F16 | persoon, geen KvK/btw/domein |
| (leeg — Zanda Vitola) | B04 | geen bedrijfsidentiteit in de rij |
| c MAKER labs: | C12 | geen eigen domein, btw of KvK |
| (leeg — Marco Heezen) | — | geen bedrijfsidentiteit |
| Biophilic Design Academy | A10 | onderwijsinstelling |
| Stichting Ongekend Circulair | O04 | stichting |

**Wrijving.** 2024: Fibershed = NIET (stichting). 2025: `Fibershed Nederland` / `fibershed.nl` = **nieuw merk** (46-batch). Dat is de enige zaak waar het register nu twee kanten op wijst. Staat op het oordeelblad.

---

## Parkeerlijst standbemanning (open, analogaan 2026 emmer D)

Activiteit staat. Rol `medewerker` ontbreekt waar het domein niet uniek naar één merk wijst. Geen `mag_beheren` uit deze import.

| | 2024 | 2025 |
|---|---:|---:|
| standrijen in bron | 521 | 467 |
| activiteit geschreven | 489 (32 bron-duplicaten overgeslagen) | 418 (49 duplicaten) |
| rol `medewerker` | 269 | 204 |
| **zonder unieke domeinrol** | **252** | **263** |
| waarvan `object_id` (stand-object) | 0 | 121 |
| waarvan vrij e-mail (gmail/hotmail/…) | 47 | 21 |

JSON:

- `docs/import/mdu2024-fair-compleet/fase3-uitvoer/stand-park.json`
- `docs/import/mdu2025-fair-compleet/fase3-uitvoer/stand-park.json`

Voorstel, zelfde emmers als MDU 2026 (`PARK-triage.md`):

| Emmer | 2024 | 2025 | Actie |
|---|---:|---:|---|
| **A** object_id aanwezig | 0 | 121 | AUTO `medewerker` + `grond=registratie` (Rebrick, Pantoni, Maiburg→17521, FAAY, …) |
| **C** vrij e-mail, geen uniek merk | 47 | 21 | SLUITEN — activiteit blijft, geen rol |
| **B/D** rest (domein of company, geen unieke rol) | 205 | 121 | groepen in het werkboek; B = unieke company→draft-merk uit de 30/46 nieuwe merken, D = Jeroen |

2025-groepen in B/D (n personen): NTGRATE POWERED BY LEOXX 7, Onstein Textiel 7, Architextures 7, Wad van Waarde 7, WINEO POWERED BY LEOXX 6, Caffe Inc. 5, Cerriva 5, Ongekend Circulair 4, Van Laere hout 4, STILLIN 4, Biophilic Design Academy 4, plus kleinere. Ongekend Circulair is sinds Jeroens B een merk (141948). Biophilic-personen hangen aan Studio Lime 141775.

2024-groepen lopen via e-maildomein (companyveld in de stand-export was leeg): aquaminerals.com 8, wur.nl 7, asona.nl 7, iboma.com 7, thegoodplasticcompany.com 7, uberdutch.nl 6, planqproducts.com 5, …

Eerst A+C, daarna B waar company/domein uniek op een net geschreven draft valt. D niet auto.

---

## Wat Claude zelf kan doen

1. De vijf multi-kandidaten + Fibershed-wrijving in `oordelen.json` zetten (Fibershed pas na Jeroens kolom).
2. Park A+C voorbereiden in dezelfde vorm als `mdu2026-park-stand-01.json` / sluitlijst.
3. Geen tweede importeer-run. Batches: `mdu2024-*` en `mdu2025-*`. Terugdraaien: `wp eval-file …/import-mdu2024.php schrijf terugdraai=mdu2024-exposant-01` (2025 idem) en `md-import-personen.php` per personenbatch.

## Wat bij Jeroen blijft

Niets meer op dit blad. Vijf rijen ingevuld 2026-09-16, uitgevoerd hetzelfde uur. Verslag van de schrijfstap: `mdu2025-fair-compleet/OORDEEL-schrijf.md`.

## Jeroen 2026-09-16 — uitgevoerd

| Cluster | BESLIST | Live |
|---------|---------|------|
| Fibershed Nederland | A aanhouden | 141620 + Josephine medewerker |
| Stichting Ongekend Circulair | B merk | **141948** draft, exposant O04, 4 rollen |
| Biophilic Design Academy | B → Studio Lime | 4 rollen op **141775**, geen academy-merk |
| Chengdu Jingyangsheng | B alleen personen | geen extra merk; 141654 uit exposantenimport blijft |
| c MAKER labs | A merk | **141949** draft, exposant C12, Leon contactpersoon |

Batches `mdu2024-2025-oordeel-01` (merken) en `mdu2024-2025-oordeel-02` (rollen + 2 exposant). `mag_beheren` = 0.
