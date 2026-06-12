<!-- Append aan session-log.md (repo-root). -->

## Profiel — tweede adresregel address_2 (11-06-2026)

Sluit aan op Johan's live user-meta `address_2` (`/md/v2/dashboard/profile`). Brengt
het user-profiel op gelijke voet met brand + de WooCommerce-checkout.
- `types/dashboard.ts`: `UserProfile.address2?: string` (optioneel).
- `lib/dashboard/mappers.ts`: `RawUserProfile.address_2`, `mapUserProfile` (WP→UI),
  `toWpUserProfile` (UI→WP).
- `dashboard/panels/ProfileForm.tsx`: optioneel "Address line 2"-veld onder Street address.

Optioneel gehouden zodat MOCK_PROFILE niet hoeft te wijzigen. Validatie: esbuild +
geïsoleerde tsc --strict schoon. Vormt de basis voor de checkout-prefill (blok 4).
