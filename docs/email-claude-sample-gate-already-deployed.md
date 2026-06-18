Onderwerp: md-sample-gate-wiring-fix.zip — al in main, geen deploy nodig

Hoi Claude,

Bedankt voor de nalevering. Die zip heb ik niet apart gedeployed — de fix zat al in main via de dashboard-polish deploy (`91cf64f`).

Wat ik in de huidige codebase zie:

- `src/lib/api/mappers.ts` — `mapUser` heeft al `hasShippingAddress: raw.has_shipping_address`
- `src/types/shared.ts` — `has_shipping_address` op het raw `/auth/me`-type en `hasShippingAddress` op `User`

De sample-poort in `GetInTouchModal` (`user?.hasShippingAddress === false`) hangt daarmee al aan de juiste mapping. Plugin levert het veld via `/auth/me` sinds dashboard polish.

Waarom de zip niet 1-op-1 ging: jouw zip is een snapshot van vóór de latere brand-`followable`-wijziging in `mapBrand`. Blind kopiëren zou die regel terugdraaien.

Kortom: geen actie nodig aan jouw kant voor deze levering. Als de poort in de praktijk nog inert blijft, ligt het waarschijnlijk aan ontbrekend/leeg `has_shipping_address` op prod of een user zonder ingevuld bezorgadres — niet aan de mapper.

Groet,
Johan
