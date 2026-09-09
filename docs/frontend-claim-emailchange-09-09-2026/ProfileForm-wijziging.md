# De wijziging in ProfileForm.tsx

Twee plekken, verder verandert er niets aan dat bestand.

## 1. De import erbij

```tsx
import { EmailChangeField } from './EmailChangeField'
```

## 2. Het e-mailveld vervangen

Wat er nu staat, rond regel 185:

```tsx
        <div className="g2">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label="Telephone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            showFilledState
          />
        </div>
```

Wordt:

```tsx
        <div className="g2">
          <EmailChangeField email={form.email} pendingEmail={initial.pendingEmail} />
          <Input
            label="Telephone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            showFilledState
          />
        </div>
```

Let op: `initial.pendingEmail` en niet `form.pendingEmail`. Dat veld verandert niet door te
typen; het komt van de server en hoort niet in de formulierstaat.

## Wat er niet verandert

`form.email` blijft in de staat staan en gaat gewoon mee in de post naar
`/api/dashboard/profile`. De backend accepteert een ongewijzigd adres en weigert alleen een
gewijzigd adres met `md_dashboard_email_needs_confirmation` — het formulier post immers alle
velden, ook de velden die niet zijn aangeraakt. De validatie op regel 73
(`form.email.trim() !== ''`) blijft daarmee ook kloppen.

## Wat er in de typedefinitie bij moet

In `src/types/dashboard.ts`, op `UserProfile`:

```ts
  /**
   * Masked address of an email change awaiting confirmation, e.g. `j***@example.com`.
   * Set by the server; the account still uses `email` until the link is clicked.
   */
  pendingEmail?: string | null
```

En in `src/lib/dashboard/mappers.ts`, in `mapUserProfile`:

```ts
  pendingEmail: raw.pending_email ?? null,
```

Johan meldt dat de profiel-GET `pending_email` al gemaskeerd teruggeeft, dus aan de
WordPress-kant hoeft daar niets voor te gebeuren.

`toWpUserProfile` blijft ongemoeid: het veld gaat nooit terug naar de server.
