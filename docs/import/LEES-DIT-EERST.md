# docs/import — de regels als code

Hier staat wat het importprotocol beschrijft, in uitvoerbare vorm. Het protocol zelf staat
in `docs/importprotocol.md`.

| bestand | wat het is |
|---|---|
| `regels.py` | alle normalisatie- en vergelijkingsregels. Eén plek, altijd aanroepen |
| `testgevallen.py` | elke regel die ooit fout is gegaan, met zijn juiste antwoord |
| `poortcontrole.py` | leest een afgeleverd werkboek en geeft groen of rood |

## Waarom dit bestaat

Op 4 september 2026 bleek dat de huisnummerregel wel in het script van de MDU 2026-ronde zat
en niet in dat van de 2025-ronde. Beide rondes hadden hun eigen script en dezelfde regel was
twee keer geschreven. Dat is niet op te lossen met beter opletten.

Sindsdien geldt: **er wordt geen ronde-script meer geschreven dat regels overtypt.** Alles wat
in `regels.py` staat wordt aangeroepen. Komt er een regel bij, dan geldt hij vanaf dat moment
voor elke ronde, ook de rondes die al gedraaid zijn.

## Voor elke ronde

```
python3 testgevallen.py       # moet 21 van 21 groen zijn
```

Is er iets rood, dan is er een regel verdwenen of veranderd. Uitzoeken vóór er één bronrij
wordt verwerkt, niet erna.

## Na elke ronde

```
python3 poortcontrole.py <werkboek>.xlsx
```

Dit script staat bewust buiten de keten die het werkboek maakt en kan er niets aan
veranderen. Toen het nog binnen die keten draaide, vond het niets; los gedraaid vond het
meteen vijf merken met een privé-adres in het merk-e-mailveld.

## Als er een regel bijkomt

Twee dingen, altijd samen: de regel in `regels.py`, en een testgeval in `testgevallen.py`
met de aanleiding erbij — welke ronde, welke datum, wat er misging. De lijst bovenaan
`regels.py` is de geschiedenis van dit bestand en hoort mee te groeien.
