# Deploy-runbook — CMS & origin

Checklist voor elke productie-deploy naar Vercel (push naar `main` of handmatige redeploy).

Incident achtergrond: sep 2026 — lege CDN-cache na deploy → duizenden ISR-requests → php-fpm vol → site en wp-admin onbereikbaar. Opgelost met origin-tuning (`listen.backlog`) + frontend load shield.

`WP_LOAD_SHIELD=true` staat in `vercel.json` — **niet uitzetten** tijdens opwarmperiode. Dat is geen vervanging voor een gezonde origin.

---

## Werkwijze (standaard)

**Geen recovery mode vóór deploy.** Recovery mode geeft de build 503 → overzichtspagina's (`/`, `/material/`, `/article/`, `/brand/`) worden leeg voorgebouwd (homepage 83 kB i.p.v. 278 kB). Met `listen.backlog` beschermt de origin zichzelf.

### 1. Vóór deploy — origin gezond?

```bash
ssh cms-materialdistrict uptime
# load < 5 op 4 vCPU

curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  -H "User-Agent: node" \
  "https://cms.materialdistrict.com/wp-json/wp/v2/material?per_page=10&_fields=slug"
# Verwacht: 200, < 2s
```

### 2. Deploy

1. Push naar `main` of redeploy in Vercel-dashboard.
2. Wacht tot build **Ready** is.

### 3. Na deploy — load monitoren

```bash
ssh cms-materialdistrict uptime
```

**Verwacht:** frontend vult cache geleidelijk op (traffic-gedreven ISR, geen bulk pre-fill). Populaire pagina's eerst; long-tail kan uren duren. Redactionele updates blijven direct via revalidate-webhook.

**Circuit breaker:** na zware load kan `upstream-guard.ts` nog 120s openstaan (`WP_LOAD_SHIELD=true`). Detailpagina's geven dan kortstondig 500 in ~0,2s — even wachten.

### 4. Noodrem — recovery mode aan

Alleen als load boven ~12 loopt of het percentage requests binnen 8s onder ~80% zakt:

```bash
ssh cms-materialdistrict 'touch /var/www/html/.cms-recovery-mode && systemctl reload caddy'
```

Controle (503 in <1s, geen WordPress-boot):

```bash
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  -H "User-Agent: node" \
  https://cms.materialdistrict.com/wp-json/
```

wp-admin blijft bereikbaar. **Let op:** actieve builds krijgen lege prerender als recovery aan staat.

Recovery **uit**:

```bash
ssh cms-materialdistrict 'rm /var/www/html/.cms-recovery-mode && systemctl reload caddy'
```

---

## Frontend-bescherming

| Onderdeel | Locatie |
|---|---|
| Load shield | `vercel.json` → `WP_LOAD_SHIELD=true` |
| Upstream guard | `src/lib/api/upstream-guard.ts` — 8s timeout, max 3 concurrent, circuit breaker 120s |
| Build fallbacks | `src/lib/api/content.ts` — `withUpstreamFallback` op `getPage()` |

---

## Droplet-tuning (cms-materialdistrict)

Live serverconfiguratie per 02-09-2026. Wijzigingen alleen via SSH; backups staan naast de config (`*.bak-YYYYMMDD*`).

### Hardware

| | Waarde |
|---|---|
| vCPU | 4 |
| RAM | 7,8 GB |
| Swap | 2 GB |
| Disk | 67 GB |

### PHP-FPM — `/etc/php/8.3/fpm/pool.d/www.conf`

| Setting | Waarde | Doel |
|---|---|---|
| `listen.backlog` | **16** | Verbindingen boven capaciteit direct weigeren i.p.v. 74s wachtrij |
| `pm.max_children` | 10 | Max gelijktijdige WordPress-requests (was 20) |
| `pm.start_servers` | 5 | |
| `pm.min_spare_servers` | 3 | |
| `pm.max_spare_servers` | 5 | |
| `pm.max_requests` | 500 | Worker recyclen vóór memory leaks |
| `request_terminate_timeout` | 30s | Hangende requests killen |
| `request_slowlog_timeout` | 5s | Log naar `/var/log/php8.3-fpm-slow.log` |

**`listen.backlog` vereist `systemctl restart php8.3-fpm`, niet reload** — de socket is bij reload al gebonden.

Effect backlog: mediaan 74s → 0,81s, 96% binnen Vercels 8s-venster. Liever de helft snel bedienen dan alles traag — een request dat na 8s alsnog slaagt is verspilde capaciteit.

### OPcache — `/etc/php/8.3/fpm/conf.d/`

| Setting | Waarde |
|---|---|
| `opcache.memory_consumption` | 512 |
| `opcache.max_accelerated_files` | 32531 |
| `opcache.interned_strings_buffer` | 32 |
| `opcache.revalidate_freq` | 60 |
| `opcache.validate_timestamps` | 1 |
| `opcache.jit` | off |

PHP: `memory_limit = 1024M`, `max_execution_time = 60`.

### MySQL — `/etc/mysql/mysql.conf.d/mysqld.cnf`

| Setting | Waarde |
|---|---|
| `innodb_buffer_pool_size` | 1 GB |

### Systeem (sysctl)

```
vm.swappiness = 10
net.core.somaxconn = 4096
```

### Caddy — `/etc/caddy/Caddyfile`

- Recovery mode: flag `/var/www/html/.cms-recovery-mode` → 503 op `/wp-json/*` en `User-Agent: node`
- Bot-blocking (Amazonbot, GPTBot, AhrefsBot, etc.)
- JSON access log: `/var/log/caddy/access.json`
- Sitemaps → 404 op CMS
- Feed-handler voor `?md_feed=*`

Reload Caddy na recovery-wijziging: `systemctl reload caddy`.

### WordPress & cron

- `DISABLE_WP_CRON = true` in `wp-config.php`
- System cron: `*/5 * * * * www-data wp cron event run --due-now`
- Redis object cache: `wp-content/object-cache.php`

### Diagnose-commando's

```bash
# Load + workers
ssh cms-materialdistrict 'uptime; ps aux | grep "php-fpm: pool www" | grep -v grep | wc -l'

# API-latency
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  -H "User-Agent: node" \
  "https://cms.materialdistrict.com/wp-json/wp/v2/pages?per_page=1"

# Trage PHP-requests
ssh cms-materialdistrict 'tail -20 /var/log/php8.3-fpm-slow.log'
```

---

## Historisch — waarom recovery mode geen standaardstap meer is

**Deploy 1 (mét recovery):** build tegen CMS met 503 → statische overzichtsroutes leeg voorgebouwd.

**Deploy 2 (zónder recovery):** load 2,8 vs 2,3 baseline, mediaan 0,68s, p90 0,95s, 100% binnen 8s, 7/10 workers bezet, geen lege pagina's.

Verschil: `listen.backlog` laat de origin overload afwijzen in plaats van vastlopen in een wachtrij.
