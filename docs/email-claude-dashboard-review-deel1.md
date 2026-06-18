Onderwerp: Dashboard review deel 1 — gedeployed

Hoi Claude,

Je zip `md-dashboard-review-deel1.zip` staat op main (`a769f7e`). Hieronder wat ik precies heb gedaan en wat nog open staat voor deel 2.

---

## Deploy

| Bestand | Status |
|---------|--------|
| `src/styles/globals.css` | `§DASH-REVIEW` append-only toegevoegd |
| `src/components/dashboard/fields/ChannelPicker.tsx` | overgenomen |
| `src/components/dashboard/panels/BrandProfileForm.tsx` | overgenomen |
| `src/components/dashboard/panels/MaterialForm.tsx` | overgenomen |
| `session-log.md` | bijgewerkt |

Build op main is groen.

---

## globals.css-merge

Zoals in je MANIFEST: geen wholesale replace. Main had al `§DASH-POLISH` én de follow/preferred-source-blokken uit `volledig-17-06`. Alleen het `§DASH-REVIEW`-blok is achteraan geappend — niets van de andere secties geraakt.

---

## Deel 2 — backend-vragen (nog niet opgepakt)

Ik heb je punten uit de mail/MANIFEST genoteerd; hier mijn eerste inschatting tot we het op kantoor doornemen:

**5. My requests (gebruikerskant) — detaildata in REST?**  
Nog te verifiëren. Ik kijk of de huidige requests-endpoint genoeg detail levert voor klikbare rijen, of dat er een detail-route bij moet.

**6. Saved searches — naam zelf benoemen?**  
Nog te verifiëren waar de huidige naam vandaan komt (auto gegenereerd vs. user input) en of PATCH/POST al een `name`-veld ondersteunt.

**9. VIES — live validatie brand + personal?**  
Checkout heeft VAT/VIES (`wc-checkout-vat-vies.php` + `/api/checkout/vat-status`). Of datzelfde pad ook op dashboard brand profile en personal profile actief is, moet ik nog even nalopen op prod.

**15. Crop bij upload — client-side crop opslaan?**  
Bestaande media-endpoint is `POST /md/v2/dashboard/media`. Waarschijnlijk kunnen we een bijgesneden bestand gewoon als normale upload posten (geen apart crop-endpoint nodig), maar dat wil ik expliciet bevestigen voordat jij de UI bouwt.

**Overige deel-2-punten (puur frontend)** — sidebar-accountblok, witregel invoice, back-link, verplichte velden + rode highlight, description-teller — wachten op jouw drop of kunnen parallel zodra we punt 8 (form-state) helder hebben.

---

Laat weten wanneer deel 2 klaarstaat; dan pak ik de backend-kant van 5/6/9/15 vooraf aan waar nodig.

Groet,  
Johan
