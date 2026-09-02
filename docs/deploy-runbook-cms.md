# Deploy-runbook — CMS beschermen

**Verplicht bij elke productie-deploy naar Vercel** (push naar `main` of handmatige redeploy).

Zonder recovery mode stampedeert Vercel het CMS na een deploy: lege CDN-cache → duizenden ISR-requests → php-fpm vol → site en wp-admin onbereikbaar. Incident: sep 2026.

`WP_LOAD_SHIELD=true` staat in `vercel.json` — **niet uitzetten** tijdens opwarmperiode of deploy. Dat is geen vervanging voor recovery mode bij deploy.

---

## Vóór deploy

```bash
ssh cms-materialdistrict 'touch /var/www/html/.cms-recovery-mode && systemctl reload caddy'
```

Controle (moet **503** in <1s zijn, geen WordPress-boot):

```bash
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  -H "User-Agent: node" \
  https://cms.materialdistrict.com/wp-json/
# Verwacht: 503 ~0.1s
```

wp-admin blijft bereikbaar tijdens recovery.

---

## Deploy

1. Push naar `main` of redeploy in Vercel-dashboard.
2. Wacht tot build **Ready** is (build mag CMS niet nodig hebben — fallbacks in `getPage()`).
3. Wacht **niet** recovery uit te zetten tot de deploy klaar is.

---

## Na deploy

Load volgen tot stabiel (<5, CPU niet structureel >80%):

```bash
ssh cms-materialdistrict uptime
```

Recovery **uit** zetten:

```bash
ssh cms-materialdistrict 'rm /var/www/html/.cms-recovery-mode && systemctl reload caddy'
```

Controle (moet **200** in <2s zijn):

```bash
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  -H "User-Agent: node" \
  "https://cms.materialdistrict.com/wp-json/wp/v2/pages?per_page=1"
```

**Verwacht:** frontend vult cache geleidelijk op (traffic-gedreven ISR, geen bulk pre-fill). Populaire pagina's eerst; long-tail kan uren duren. Redactionele updates blijven direct via revalidate-webhook.

---

## Bij problemen — recovery weer aan

```bash
ssh cms-materialdistrict 'touch /var/www/html/.cms-recovery-mode && systemctl reload caddy'
```

---

## Technische achtergrond

| Onderdeel | Locatie |
|---|---|
| Recovery-flag | `/var/www/html/.cms-recovery-mode` op CMS-droplet |
| Caddy-config | `/etc/caddy/Caddyfile` — `@recovery_api` + `@recovery_vercel` |
| Load shield | `vercel.json` → `WP_LOAD_SHIELD=true` |
| Upstream guard | `src/lib/api/upstream-guard.ts` |

Recovery blokkeert `User-Agent: node` (Vercel server-side) op `/wp-json/*` en overige API-paden; wp-admin/wp-login gaat door.

---

## Toelatingsbeheer op de origin (toegevoegd 02-09-2026)

De aanname hierboven — "de frontend vult de cache geleidelijk" — bleek te optimistisch.
Na de deploy van 2 september vroeg het vullen ~29x de capaciteit van de droplet. Alles
kwam in de wachtrij, de gemiddelde requestduur liep op tot 74s, en omdat Vercel na 8s
afkapt werd al dat werk weggegooid: WordPress produceerde antwoorden die niemand meer
ophaalde, waarna dezelfde pagina opnieuw werd opgevraagd. De cache vulde zich niet.

De oplossing is toelatingsbeheer, niet meer capaciteit:

```
# /etc/php/8.3/fpm/pool.d/www.conf
listen.backlog = 16
```

**Vereist `systemctl restart php8.3-fpm`, niet reload** — de socket is bij een reload al
gebonden en houdt de oude backlog.

Wat het doet: verbindingen boven de backlog worden meteen geweigerd in plaats van in de
rij gezet. Caddy geeft dan snel een 502, Vercel faalt snel en probeert later opnieuw, en
de requests die wél worden toegelaten zijn binnen een seconde klaar — en landen dus
permanent in de cache. Meetresultaat direct na invoering: mediaan van 74s naar 0,81s,
96% binnen Vercels 8s-venster, en binnen enkele minuten weer 100% status 200.

Liever de helft snel bedienen dan alles traag: een verzoek dat na 8s alsnog slaagt is
verspilde capaciteit, want de klant is al weg.

**Let op bij het uitzetten van recovery mode:** de circuit breaker in `upstream-guard.ts`
kan nog openstaan (cooldown 120s bij `WP_LOAD_SHIELD=true`). Detailpagina's geven dan
kortstondig een 500 in ~0,2s — te snel om een origin-probleem te zijn. Even wachten.
