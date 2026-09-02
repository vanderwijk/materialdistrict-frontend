#!/usr/bin/env bash
#
# md-frontend-healthcheck.sh
#
# Detects the failure mode of 2 September 2026: a page that renders and caches
# successfully while carrying no content, because the CMS returned nothing and
# the data fetch produced an empty list instead of an error.
#
# A plain uptime check does not catch this. The page returns 200, the HTML is
# valid, and Vercel serves it from cache. Only the item count reveals the
# problem. This script asserts a minimum number of content links per page.
#
# Exit codes:
#   0  all pages pass
#   1  at least one page is empty or degraded
#   2  the site itself is unreachable
#
# Usage:
#   ./md-frontend-healthcheck.sh                 # human-readable
#   ./md-frontend-healthcheck.sh --quiet         # only failures, for cron
#   ./md-frontend-healthcheck.sh --json          # machine-readable
#
# Cron example (every 10 minutes, mail on failure only):
#   */10 * * * * /path/md-frontend-healthcheck.sh --quiet || \
#     mail -s "MD frontend leeg" sjoerd@materialdistrict.com

set -uo pipefail

BASE="${MD_BASE_URL:-https://materialdistrict.com}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
TIMEOUT=20

QUIET=0
JSON=0
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=1 ;;
    --json)  JSON=1 ;;
    -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
  esac
done

# path | minimum number of content links | regex for what counts as content
CHECKS=(
  "/|8|href=\"/(material|story|article|channel)/[^\"]+\""
  "/material/|8|href=\"/material/[^\"]+\""
  "/article/|5|href=\"/article/[^\"]+\""
  "/brand/|8|href=\"/brand/[^\"]+\""
  "/channel/|5|href=\"/channel/[^\"]+\""
  "/channel/biophilic-human-centred/|10|href=\"/(material|story|article)/[^\"]+\""
)

FAILED=0
RESULTS=()

log() { [ "$QUIET" -eq 1 ] && return 0; [ "$JSON" -eq 1 ] && return 0; printf "%s\n" "$*"; }
fail_msg() { [ "$JSON" -eq 1 ] && return 0; printf "%s\n" "$*" >&2; }

# Is the site up at all?
root_code=$(curl -sS -o /dev/null -m "$TIMEOUT" -w "%{http_code}" -A "$UA" "$BASE/" 2>/dev/null)
if [ "$root_code" = "000" ] || [ -z "$root_code" ]; then
  fail_msg "KRITIEK: $BASE is onbereikbaar."
  exit 2
fi
if [ "$root_code" = "429" ]; then
  fail_msg "KRITIEK: $BASE geeft 429. Dit wijst op een overbelaste of onbereikbare backend,"
  fail_msg "         niet op een frontend-fout. Controleer cms.materialdistrict.com."
  exit 2
fi

log "Controle op $BASE"
log ""

for check in "${CHECKS[@]}"; do
  IFS='|' read -r path minimum pattern <<< "$check"

  headers=$(mktemp)
  body=$(curl -sS -m "$TIMEOUT" -D "$headers" -A "$UA" "$BASE$path" 2>/dev/null)
  code=$(awk 'toupper($1) ~ /^HTTP/ {c=$2} END {print c}' "$headers")
  cache=$(grep -i '^x-vercel-cache:' "$headers" | tr -d '\r' | awk '{print $2}')
  age=$(grep -i '^age:' "$headers" | tr -d '\r' | awk '{print $2}')
  etag=$(grep -i '^etag:' "$headers" | tr -d '\r' | awk '{print $2}')
  rm -f "$headers"

  count=$(printf "%s" "$body" | grep -oEi "$pattern" | sort -u | wc -l | tr -d ' ')

  status="OK"
  reason=""
  if [ "$code" != "200" ]; then
    status="FOUT"; reason="status $code"
  elif [ "$count" -lt "$minimum" ]; then
    status="LEEG"; reason="$count content-links, minimaal $minimum verwacht"
  fi

  [ "$status" != "OK" ] && FAILED=1

  RESULTS+=("{\"path\":\"$path\",\"status\":\"$status\",\"http\":\"$code\",\"items\":$count,\"minimum\":$minimum,\"cache\":\"${cache:-}\",\"age\":\"${age:-}\",\"etag\":${etag:-\"\"}}")

  if [ "$status" = "OK" ]; then
    log "  OK    $path  ($count items, cache ${cache:-?})"
  else
    fail_msg "  $status  $path  — $reason  [cache ${cache:-?}, age ${age:-?}]"
  fi
done

if [ "$JSON" -eq 1 ]; then
  printf '{"base":"%s","failed":%s,"checks":[%s]}\n' \
    "$BASE" "$FAILED" "$(IFS=,; echo "${RESULTS[*]}")"
  exit "$FAILED"
fi

log ""
if [ "$FAILED" -eq 1 ]; then
  fail_msg ""
  fail_msg "Een pagina rendert wel maar draagt geen inhoud. Dat is bijna altijd een"
  fail_msg "render die is gedraaid terwijl het CMS niets teruggaf. Hij herstelt niet"
  fail_msg "vanzelf: de cache bevat een geldige, lege pagina."
  fail_msg ""
  fail_msg "Herstel: POST naar $BASE/api/revalidate/ met de header"
  fail_msg "x-md-revalidate-secret. Werkt dat niet, dan een redeploy op Vercel."
  exit 1
fi

log "Alle pagina's dragen inhoud."
exit 0
