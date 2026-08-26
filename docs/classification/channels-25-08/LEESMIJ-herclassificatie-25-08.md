# Herclassificatie — levering 25-08-2026

Alles uit de herclassificatie in één zip. Alle 3.244 gepubliceerde materialen zijn
per record op de eigen tekst gelezen. De redactie is overal uit; er wacht niets meer.

## Volgorde van uitvoeren

**1. Eerst: het channel Living Materials aanmaken.**
Via Channels in het beheermenu. Dat channel bestaat nog niet, en in
`besluit-channels-ronde2-25-08-v3.csv` staat 46 keer de tekst
`NIEUW_LIVING_MATERIALS` in plaats van een term-id. Vervang die door het echte id,
daarna is het bestand compleet.

Tegelijk: hernoem `Bio-based & Living Materials` naar **`Bio-based materials`**.
Alleen het label — de slug blijft `bio-based-living-materials`, dus geen redirects.

**2. `besluit-channels-ronde2-25-08-v3.csv` — 981 records, channels.**
Kolommen: id, title, theme_ids_old, theme_ids_new, channels_new_readable, motivering.
`theme_ids_old` is de stand gemeten op 25-08; wijkt de database daarvan af, dan is er
tussentijds iets veranderd.

**Let op: 334 rijen dragen `NONE`.** Dat is bewust. Het gaat om de inperking van
Biophilic & Human-Centred, dat aan 832 materialen hing — een kwart van de collectie —
en daardoor bij het filteren niets meer zei. Na deze ronde houdt het er 8 over.
Geen enkele rij komt boven drie channels uit.

**3. `besluit-materialtype-25-08-v2.csv` — 60 records, material_category.**
Raakt uitsluitend `material_category`, nooit channels. `_material_code` blijft staan.
43 daarvan gaan naar Composites: HPL is papier met melaminehars en hoort daar,
patroonbesluit van 25-08. Zes HPL-records blijven bewust Bio-based omdat een
biobased vezel daar de propositie draagt (Bark Cloth, Abacá, ECO-HPL).

**4. `eigenschap-sustainably-produced-fsc-25-08-v1.csv` — 78 records.**
Geen channel maar het veld `sustainably_produced`, dat op `yes` gaat. De kolom
`tekstgrond` bevat de letterlijke zin waarop het besluit steunt. Loopt dit door een
ander script dan het channel-script, laat het weten — dan passen we het formaat aan.

**5. `includes/theme-taxonomy-guard.php`** — voor `includes/` van de plugin.
Staat los van de classificatie en kan meteen. Twee dingen: `wp md theme-cleanup`
ruimt elf per ongeluk aangemaakte channels op, en een slot voorkomt dat het opnieuw
gebeurt door aanmaken buiten de beheerpagina te blokkeren. PHP is hier met een parser
gecontroleerd, niet met `php -l`.

**6. `docs/materiaal-classificatie-regelboek.md` — versie 2.0.**
Vervangt de huidige v1.9 in de frontend-repo. Nieuw: §3.12 (HPL), §3.13 (Living
Materials) en §4.6 (Sense & Sensibility).

## Wat er niet in zit

Twee kleine lijsten gaan naar de redactie en niet naar de uitvoering: twee records die
al vier channels droegen voordat deze ronde begon, en twaalf records die geen materiaal
blijken maar een bewerking, machine of bedrijfsprofiel.

## Zoals altijd

Dry-run met telling eerst, rollback per record. Gezien de 334 `NONE`-regels is het
de moeite die telling deze keer extra na te lopen voordat `--execute` draait.
