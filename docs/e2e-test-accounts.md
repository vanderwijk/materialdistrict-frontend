# Dashboard E2E test accounts (production)

Alle accounts staan op **materialdistrict.com**. Wachtwoord voor elk account:

```
E2eDashboard2026!
```

## Accounts

| Key | E-mail | Brand ID | Slug | Brand tier | Insider |
|-----|--------|----------|------|------------|---------|
| free | e2e-dashboard-free@materialdistrict.com | 137153 | `e2e-free-brand` | free | nee |
| basis | e2e-dashboard-basis@materialdistrict.com | 137155 | `e2e-basis-brand` | basis (active) | nee |
| plus | e2e-dashboard-plus@materialdistrict.com | 137157 | `e2e-plus-brand` | plus (active) | nee |
| partner | e2e-dashboard-partner@materialdistrict.com | 137159 | `e2e-partner-brand` | partner (active) | nee |
| insider | e2e-dashboard-insider@materialdistrict.com | 137161 | `e2e-insider-brand` | free | **ja** (active) |
| pending | e2e-dashboard-pending@materialdistrict.com | 137163 | *(leeg → Pending setup)* | free | nee |

## Tier gates (verwacht gedrag)

- **Statistics / lead-routing**: 403 op free; OK vanaf basis+
- **Featured materials**: 403 onder partner; OK op partner
- **Insider panels** (boards, saved searches, insider insights): 403 zonder actieve Insider; OK op insider-account

## Opnieuw provisionen

Plugin-script (na deploy):

```bash
export WP_APP_USER=nextjs
export WP_APP_PASSWORD='…'
./scripts/provision-dashboard-e2e-accounts.sh
```

Endpoint: `POST /wp-json/md/v2/admin/provision-e2e-test-accounts`  
Auth: Application Password + header `X-MD-Provision-Key`.

Idempotent: bestaande accounts krijgen opnieuw het standaardwachtwoord en juiste tier-meta.
