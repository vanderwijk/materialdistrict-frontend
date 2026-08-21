# MANIFEST — schrijfscript versie 2 + nieuwe channelterm

**Levering:** `md-schrijfscript-11-08-v2.zip` · 11-08-2026
**Vervangt:** `scripts/class-md-classification-cli.php` uit `md-blok-A-11-08-v1.zip`.
Gooi die versie weg; deze is er de opvolger van, niet een aanvulling.

## Inhoud

| pad | wat |
|---|---|
| `scripts/class-md-classification-cli.php` | **versie 2** van het WP-CLI-commando |
| `docs/materiaal-classificatie-regelboek.md` | versie 1.3, ongewijzigd meegeleverd |

## Wat er anders is dan in versie 1

1. **`apply` schrijft nu ook het materiaaltype.** Versie 1 raakte alleen de
   `theme`-taxonomie. De hercategorisering levert 532 typewijzigingen op, dus dat
   moest erbij. Het type is single-select en wordt als precies één term
   weggeschreven; een rij zonder `type_term_id` laat het type met rust, en het
   type wordt nooit leeggemaakt.
2. **Het terugdraaibestand bewaart nu ook het oude type**, en `rollback` zet beide
   terug.
3. **`audit` kent §3.6b.** Een mineraal type dat Bio-based & Living Materials
   draagt wordt niet meer als overtreding geteld maar apart gerapporteerd als
   "to review", conform het redactionele besluit van 11-08-2026.
4. **Nieuwe kolom `type_term_id`** in het besluitbestand. Optioneel: laat je hem
   weg of gebruik je `--skip-types`, dan gedraagt het script zich als versie 1.
5. **Placeholder-detectie.** Staat er iets anders dan cijfers in `theme_ids_new`,
   dan wordt die rij overgeslagen met een duidelijke melding in plaats van
   stilzwijgend genegeerd. Dat is nodig vanwege het punt hieronder.

## Eén handeling vooraf: de nieuwe channelterm

Er komt een twaalfde channel bij: **Healthy & Non-Toxic**, voorgesteld slug
`healthy-non-toxic`, in de taxonomie `theme`. 176 materialen krijgen dat channel.

Die term bestaat nog niet. Zolang hij ontbreekt staat er in de besluitbestanden
`NIEUW-healthy-non-toxic` in plaats van een id, en slaat het script die rijen
over met een melding.

Aanmaken kan met:

    wp term create theme "Healthy & Non-Toxic" --slug=healthy-non-toxic --porcelain

Geef het teruggegeven id door, dan zet ik het in de besluitbestanden voordat er
iets geschreven wordt.

Het channel wacht nog op redactionele goedkeuring; de term aanmaken kan alvast,
want een lege term is zichtbaar noch schadelijk.

## Volgorde straks

1. `wp md-classification audit` — nulmeting.
2. `wp md-classification apply --file=<blok>.csv` — dry run, schrijft niets.
3. Dezelfde regel met `--execute` — schrijft, en legt een terugdraaibestand neer.
4. `wp md-classification audit` opnieuw.

Per goedgekeurd blok één keer. Terugdraaien:
`wp md-classification rollback --file=<terugdraaibestand> --execute`.

## Nog niet meeleveren

De besluitbestanden zelf. Die gaan pas mee als de redactie de voorstellen heeft
nagelopen; er zitten dertien open vragen in. Dit pakket is voorbereiding.
