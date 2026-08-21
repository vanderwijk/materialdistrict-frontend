# Analytics database — setup & operations

## Architecture

Two layers on a **dedicated MySQL database** when possible, with a small AWS ingest layer for production:

```text
WordPress / frontend
  -> API Gateway HTTP API
      -> ingest Lambda
          -> SQS queue
              -> DB Lambda
                  -> RDS MySQL
```

This avoids direct MySQL connections from WP Engine. WP Engine does not provide stable outbound IPs, so production should not connect directly to RDS over port 3306.

| Layer | Table | Purpose |
|-------|-------|---------|
| Raw events | `mda_events` | One row per event (fast INSERT only) |
| Daily rollups | `mda_rollups_daily` | Pre-aggregated counts per day/object/event |
| Identity links | `mda_identity_links` | `anonymous_id` → `user_id` stitching |

Dashboards and reports should read **rollups + today's live slice** via `md_analytics_get_total_count()`, never scan the full raw table.

### Where the database runs

| Environment | Recommendation |
|-------------|----------------|
| **Local dev** | Fallback tables on the main WP DB (`wp_mdanalytics_*`) — no extra infra |
| **Production** | **External MySQL** (not on the WP Engine content database) |
| **High volume (later)** | ClickHouse or similar warehouse; keep the same REST/read contract |

WP Engine does not offer a convenient second database on the same instance. The intended production setup is an **AWS RDS or Aurora MySQL** instance in the same region as the site (e.g. `eu-central-1`), written through the AWS HTTPS ingest layer above.

Without `MD_ANALYTICS_API_*` or `MD_ANALYTICS_DB_*` constants the plugin can fall back to `{$wpdb->prefix}md_analytics_*` on the main WordPress database for local development only. Do not use the WordPress content database for production analytics traffic.

When `MD_ANALYTICS_API_*` is set, production runs in **remote-only** mode: events and counts go to AWS/RDS only. The WordPress content database is not used for analytics storage or fallback.

Each event carries a stable `event_id`. The AWS DB Lambda stores it under a unique key and updates raw events plus daily rollups in one transaction, so SQS retries or duplicate deliveries do not double-count analytics.

---

## AWS RDS / Aurora setup (production)

### 1. Choose engine

**Recommended now:** Amazon RDS MySQL 8.x or **Aurora MySQL** (Serverless v2 if you want auto-scaling).

- Same protocol as the plugin expects (`wpdb` over MySQL)
- No plugin code changes
- Small instance is enough for phase 1 (tens of millions of rows with rollups + prune)

**Later (phase 2+):** ClickHouse on AWS or ClickHouse Cloud for heavy analytics; migrate ingest/read behind the same API.

### 2. Create the instance (AWS Console or IaC)

Suggested starting point:

| Setting | Value |
|---------|--------|
| Engine | MySQL 8.x or Aurora MySQL 3.x |
| Instance | `db.t4g.micro` / `db.t4g.small` (RDS) or Aurora Serverless v2 min ACU |
| Region | Same as WP Engine (e.g. `eu-central-1`) |
| Storage | 20–50 GB gp3, autoscaling on |
| Multi-AZ | Optional for prod (higher availability) |
| Public access | **No** — Lambda reaches RDS inside the AWS VPC |
| Database name | `md_analytics` |

### 3. Security group

Create a dedicated security group for the analytics DB:

**Inbound**

| Type | Port | Source | Notes |
|------|------|--------|--------|
| MySQL/Aurora | 3306 | Analytics DB Lambda security group | Production writes/reads |
| MySQL/Aurora | 3306 | Your office/VPN IP | Optional: for TablePlus / debugging |

**Outbound** — default (no special rules needed).

**Do not** open 3306 to `0.0.0.0/0` in production. WP Engine uses dynamic outbound IPs; use the AWS HTTPS ingest API instead of direct MySQL from WP Engine.

### 4. Database user (least privilege)

Connect as master once and run:

```sql
CREATE DATABASE IF NOT EXISTS md_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'md_analytics_app'@'%' IDENTIFIED BY 'strong-random-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON md_analytics.*
  TO 'md_analytics_app'@'%';
FLUSH PRIVILEGES;
```

The plugin runs `dbDelta` on deploy, so `CREATE`/`ALTER` on that schema only is required. No access to the WordPress content database.

### 5. wp-config.php on WP Engine

For production through AWS API Gateway, add:

```php
define( 'MD_ANALYTICS_API_URL', 'https://3xe55jo7t6.execute-api.eu-central-1.amazonaws.com' );
define( 'MD_ANALYTICS_API_KEY', '...' ); // = Lambda env INGEST_API_KEY (see below); WPE secrets, not git
```

**Where to find the API key:** AWS Console → Lambda → `md-analytics-ingest` → Configuration → Environment variables → `INGEST_API_KEY`. The same value must be set on `md-analytics-db`. Use it as `MD_ANALYTICS_API_KEY` in WPE.

```bash
aws lambda get-function-configuration \
  --function-name md-analytics-ingest \
  --region eu-central-1 \
  --query 'Environment.Variables.INGEST_API_KEY' \
  --output text
```

When the AWS API is configured, WordPress does not fall back to local analytics tables. If AWS ingest/read is unavailable, event writes and dashboard reads stop until AWS recovers.

For local dev, or for direct database testing only, the plugin also supports:

```php
define( 'MD_ANALYTICS_DB_NAME', 'md_analytics' );
define( 'MD_ANALYTICS_DB_USER', 'md_analytics_app' );
define( 'MD_ANALYTICS_DB_PASSWORD', '...' ); // use WPE secrets / env, not git
define( 'MD_ANALYTICS_DB_HOST', 'md-analytics.xxxxx.eu-central-1.rds.amazonaws.com' );
define( 'MD_ANALYTICS_DB_PREFIX', 'mda_' );
define( 'MD_ANALYTICS_DB_SSL', true );
```

Use the RDS **endpoint** hostname (writer), not the IP. Port 3306 is default.

These values can also be supplied as environment variables with the same names. Constants take precedence over environment variables. Prefer WP Engine environment/secrets for passwords/API keys; do not commit credentials.

**SSL (recommended):** set `MD_ANALYTICS_DB_SSL=true` to have the plugin enable WordPress' `MYSQLI_CLIENT_SSL` flag for the dedicated analytics connection. If `MYSQL_CLIENT_FLAGS` is already defined globally in `wp-config.php`, include `MYSQLI_CLIENT_SSL` there instead.

### 6. Verify connectivity from WP Engine

After deploying the plugin and setting `MD_ANALYTICS_API_*`, smoke test the public WordPress endpoint:

```bash
curl -sS -X POST 'https://materialdistrict.com/wp-json/md/v2/events' \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"preferred_source_click","object_type":"site","anonymous_id":"prod-smoke-1","source":"ops"}'
```

Expected with AWS ingest: `{"ok":true,"queued":true}`.

Verified on production: 2026-06-18.

If connection fails: check `MD_ANALYTICS_API_URL`, `MD_ANALYTICS_API_KEY`, API Gateway routes, Lambda logs, SQS depth, DB Lambda security group ingress, and RDS credentials.

### 7. Go-live checklist (ops)

| Step | Status (2026-06-18) |
|------|---------------------|
| RDS `md-analytics-prod` live, private, encrypted | ✅ |
| SQS `md-analytics-events` + DLQ | ✅ |
| Lambda `md-analytics-ingest` + `md-analytics-db` | ✅ |
| RDS SG: only Lambda SG `sg-0754ce877c712379c` on 3306 | ✅ (temp office IP removed) |
| SQS → `md-analytics-db` event source mapping | ✅ |
| API Gateway HTTP API `md-analytics` (`3xe55jo7t6`) | ✅ |
| Routes: `POST /events`, `GET /analytics/counts`, `POST /analytics/counts/query`, `POST /analytics/migrate-rollups`, `GET /analytics/events` | ✅ |
| API Gateway default throttling (`200 req/s`, burst `500`) | ✅ |
| End-to-end smoke (ingest → SQS → RDS → counts) | ✅ |
| `MD_ANALYTICS_API_*` in WPE production | ✅ |
| Deploy plugin (`master` ≥ `7ab8100`) | ✅ |
| Production smoke via `POST /wp-json/md/v2/events` | ✅ `{"ok":true,"queued":true}` |
| Local WP analytics tables dropped | ✅ |
| Legacy `post_views_count` migrated to RDS rollups | ✅ |
| Legacy meta cleaned up; view tracking disabled in theme/plugin | ✅ |
| Frontend `/api/events` proxy live | ✅ |

**Production API base URL** (no trailing slash):

`https://3xe55jo7t6.execute-api.eu-central-1.amazonaws.com`

Use the same `INGEST_API_KEY` value as configured on both Lambdas for `MD_ANALYTICS_API_KEY` in WPE secrets / `wp-config.php`. Do not commit the key.

Suggested WPE rollout:

1. Set `MD_ANALYTICS_API_URL` + `MD_ANALYTICS_API_KEY`.
2. Smoke via `POST /wp-json/md/v2/events` → expect `{"ok":true,"queued":true}`.  
3. Check the WordPress dashboard AWS health widget and SQS/DLQ metrics.

### 7b. AWS resource reference (eu-central-1)

| Resource | Name / ID |
|----------|-----------|
| RDS instance | `md-analytics-prod` |
| RDS security group | `sg-07559d3d632aa0463` (`md-analytics-rds`) |
| Lambda security group | `sg-0754ce877c712379c` (`md-analytics-lambda`) |
| SQS queue | `md-analytics-events` |
| SQS DLQ | `md-analytics-events-dlq` |
| Ingest Lambda | `md-analytics-ingest` (`nodejs24.x`) |
| DB Lambda | `md-analytics-db` (VPC; writes to RDS; `nodejs24.x`) |
| API Gateway | `md-analytics` (`3xe55jo7t6`) |
| IAM roles | `md-analytics-ingest-lambda-role`, `md-analytics-db-lambda-role` |

The DB Lambda updates `mda_rollups_daily` on each newly ingested event (live counts). Duplicate SQS deliveries are ignored through the `mda_events.event_id` unique key. Historical backfill and raw-event pruning run on AWS (not in WordPress).

### 7c. Lambda runtime upgrades

AWS ended support for `nodejs20.x` on Lambda in April 2026. Both analytics functions use **`nodejs24.x`** (managed runtime; deprecation forecast **April 2028**).

Redeploy from the plugin repo:

```bash
chmod +x docs/aws-lambda-deploy.sh
./docs/aws-lambda-deploy.sh
```

Optional: `LAMBDA_RUNTIME=nodejs24.x AWS_REGION=eu-central-1 ./docs/aws-lambda-deploy.sh`

The script rebuilds `aws/md-analytics-ingest` and `aws/md-analytics-db`, uploads new code, and sets the runtime. No application code changes are required for the Node 20 → 24 upgrade (ES modules + AWS SDK v3).

### 8. Cost & ops notes

- **RDS `db.t4g.small`**: rough order of magnitude ~€15–40/month depending on region and storage (verify in AWS calculator).
- **Backups:** enable automated backups (7–14 days) on RDS; analytics is reconstructible from rollups for dashboards but raw events are pruned after 14 months.
- **Monitoring:** CloudWatch alarms on CPU, storage, and `DatabaseConnections`.

---

## REST API

### Write — ingest events

`POST /wp-json/md/v2/events`

- Anonymous-friendly (`anonymous_id` required when not logged in)
- Authenticated when Bearer JWT present (`user_id` set server-side)
- Server timestamp; best-effort 2xx on success

### Read — dashboard counts (authenticated)

`GET /wp-json/md/v2/analytics/counts?object_type=material&object_id=123`

Optional `event_type` (defaults to `{object_type}_viewed`, e.g. `material_viewed`).

Response:

```json
{
  "object_type": "material",
  "object_id": "123",
  "event_type": "material_viewed",
  "count": 1820,
  "includes_today": true
}
```

Batch (max 100 grains, two SQL queries):

`POST /wp-json/md/v2/analytics/counts/query`

```json
{
  "items": [
    { "object_type": "material", "object_id": "123" },
    { "object_type": "material", "object_id": "456", "event_type": "material_viewed" }
  ]
}
```

Brand statistics (`/dashboard/brands/{id}/statistics`) reads material views via `md_analytics_get_object_view_count()` (AWS analytics API rollups).

See `docs/backend-spec-datalaag-follow.md` in the frontend repo for the full contract.

---

## Legacy view counters (completed)

One-time migration from `post_views_count` post meta to `mda_rollups_daily` (`origin = pre_migration`) is complete on production. Legacy meta was removed; `md_update_post_views()` is a no-op and theme singles no longer increment local counters.

The `POST /analytics/migrate-rollups` API route remains on the DB Lambda for reference but is no longer called from WordPress.

---

## Plugin commits (reference)

| Commit | Contents |
|--------|----------|
| `a5e5759` | Datalaag: `POST /events`, schema, rollup/prune cron, migrate-views, identity stitching |
| `9c2a072` | Read API: `GET /analytics/counts`, `POST /analytics/counts/query`, brand stats wired |
| `eb34cfe` | Harden RDS config (`MD_ANALYTICS_DB_SSL`, env var support) |
| `5000d67` | Proxy events/counts through AWS API (`MD_ANALYTICS_API_*`) |
| `acd0521` | Follows API + `followable` on brand REST |

---

## Future: ClickHouse / external warehouse

The read path is rollup-based. To move analytics off MySQL later:

1. Ship raw events to ClickHouse (queue, Kinesis, or batch export)
2. Run rollups in the warehouse
3. Keep `md_analytics_get_total_count()` and the REST count endpoints as the dashboard contract — swap implementation behind them

No frontend contract changes required.
