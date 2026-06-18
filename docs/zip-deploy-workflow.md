# Zip-deploy workflow met Cursor — generieke uitleg

Zo kun je nieuwe zip-bestanden (bijv. van een AI-collega of externe leverancier) veilig en snel live krijgen.

---

## Het principe

```text
Zip in Downloads
  → uitpakken + vergelijken met git main
  → selectief mergen (niet blind kopiëren)
  → build/test
  → commit + push
  → CI/CD deployt automatisch
```

De zip is een **momentopname**. Je git-repo is meestal **nieuwer**. Overschrijven zonder vergelijken geeft regressies.

---

## Stap 1 — Zip uitpakken en inventariseren

```bash
unzip ~/Downloads/leverancier-drop.zip -d /tmp/leverancier-drop
find /tmp/leverancier-drop -type f
```

Noteer: welke bestanden zijn **nieuw**, welke **gewijzigd**, en wat de leverancier zegt dat erin zit.

---

## Stap 2 — Repo up-to-date en vergelijken

```bash
cd /pad/naar/je-project
git pull origin main   # of master / develop — wat jullie deploy-branch is
```

Per bestand uit de zip:

```bash
diff -u pad/naar/bestand in/repo /tmp/leverancier-drop/pad/naar/bestand
```

**Drie situaties:**

| Situatie | Actie |
|----------|--------|
| Bestand bestaat niet in repo | Toevoegen |
| Kleine, duidelijke wijziging | Alleen die wijziging overnemen |
| Groot bestand, veel overlap | Chirurgisch mergen — niet het hele bestand vervangen |

**Vuistregel:** merge **wijzigingen**, niet **snapshots**.

---

## Stap 3 — Regressies en compatibiliteit checken

Voordat je commit:

1. **Staat dit al in main?** (`git log`, `git diff`) — misschien is het al gedeployed.
2. **Overschrijft de zip recent werk?** Diff toont of lokale fixes teruggedraaid worden.
3. **Past het bij jullie stack?** Andere dependency-versies, API-contracten, env-vars?
4. **Build en tests** — wat jullie project gebruikt, bijvoorbeeld:

```bash
npm run build
npm test
# of: cargo build, mvn package, pytest, etc.
```

Geen groene build = niet pushen.

---

## Stap 4 — Commit en push

```bash
git status
git add <alleen-de-bestanden-die-je-bewust-hebt-gemerged>
git commit -m "Deploy <zip-naam>: korte beschrijving"
git push origin main
```

Commit **niet**: zip-bestanden zelf, `.env`, secrets, dependency-mappen (`node_modules`, etc.), build-artifacts (tenzij jullie dat bewust zo doen).

---

## Stap 5 — Auto-deploy

Na push naar de deploy-branch triggert jullie CI/CD (GitHub Actions, GitLab CI, Vercel, etc.) automatisch een deploy naar staging of productie.

Jij hoeft daarna meestal alleen de deploy-status te checken en een korte rooktest te doen.

---

## Sneller met AI in de IDE (optioneel)

In plaats van handmatig elke diff uit te pluizen:

1. Geef het zip-pad: `~/Downloads/leverancier-drop.zip`
2. Vraag expliciet: *"Merge chirurgisch met main, geen blind overwrite, run build, commit en push."*

De AI doet het repetitieve diff/merge-werk; **jij** blijft verantwoordelijk voor de juiste branch, build en review.

---

## Checklist

- [ ] Deploy-branch is up-to-date (`git pull`)
- [ ] Zip uitgepakt; bestandenlijst bekend
- [ ] Per bestand: diff met repo, geen blind overwrite
- [ ] Geen recente fixes teruggedraaid
- [ ] Build/tests groen
- [ ] Alleen bewuste wijzigingen gecommit
- [ ] Push → CI/CD geslaagd
- [ ] Rooktest op deployed omgeving

---

## Waarom dit sneller is dan “zip erin plakken”

| Slecht | Goed |
|--------|------|
| Hele zip over repo kopiëren | Alleen nieuwe/gewijzigde regels mergen |
| Geen diff | `diff` vóór elke merge |
| Geen build | Build verplicht vóór push |
| Handmatig uploaden naar server | Git push → CI/CD |

De tijdwinst zit in **selectief mergen + geautomatiseerde checks**, niet in het overslaan van de vergelijking.
