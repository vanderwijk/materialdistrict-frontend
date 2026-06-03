# Dashboard — verzoek endpoint: material categories

**Van:** Jeroen (frontend) · **Voor:** Johan (WP plugin)
**Waarom:** de laatste functionele gap in het materiaalformulier.

## Probleem

De categorie-picker in het materiaalformulier gebruikt nu een hardcoded lijst
**zonder echte WP term-id's**. Bij opslaan stuurt de frontend alleen categorieën
mee met een geldig numeriek term-id (`categories: [{ "id": 456 }]`). Gevolg:

- Bestaande categorieën (uit de form-GET, die hebben al een `id`) → blijven behouden.
- **Nieuw gekozen** categorieën → krijgen geen geldig id → worden bij opslaan genegeerd.

Een manufacturer kan dus op dit moment geen categorie toevoegen of wijzigen.

## Verzoek

Eén read-only endpoint dat de toewijsbare categorieën teruggeeft **mét term-id**.

```
GET /md/v2/dashboard/material-categories
Auth: Authorization: Bearer <JWT>   (zoals de andere dashboard-endpoints)
```

Globaal endpoint — geen `brandId` nodig; de categorie-taxonomie is platform-breed.

### Response (snake_case)

**Exact dezelfde shape als de `categories[]` in de material-form GET**, dus
zonder nieuw contract om te onthouden — alleen nu de volledige catalogus:

```json
[
  { "id": 456, "l1": "Wood", "l2": "Veneer", "l3": "Oak" },
  { "id": 457, "l1": "Wood", "l2": "Solid",  "l3": "" },
  { "id": 458, "l1": "Metal", "l2": "",       "l3": "" }
]
```

- `id` = WP `term_id` uit de `material_category`-taxonomy. **Exact** het id dat
  het material-save body al verwacht in `categories: [{ "id": <term_id> }]`.
- `l1` / `l2` / `l3` = het pad (zelfde betekenis als in de form-GET). Lege
  string waar een niveau niet van toepassing is.
- Geef de **toewijsbare** categorieën terug (de niveaus die een manufacturer
  mag kiezen). Als alleen de diepste niveaus (l3, of l2 waar geen l3 bestaat)
  toewijsbaar zijn, volstaat die set — laat me weten welke conventie je aanhoudt.

### Foutcodes

Standaard: `md_auth_unauthenticated` (401). Verder geen tier-gate nodig (lezen).

## Wat ik er frontend-zijdig mee doe

Ik vervang de hardcoded picker door een echte picker gevoed door dit endpoint.
Het **save-contract verandert niet** — ik blijf `categories: [{ id }]` sturen,
nu met geldige term-id's, zodat nieuw gekozen categorieën ook echt opslaan.
Zodra dit endpoint live is, is dit een wijziging van één component aan mijn kant.
