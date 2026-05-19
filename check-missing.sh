#!/usr/bin/env bash
# check-missing.sh — controleert welke bestanden op de dev-server ontbreken
#
# Uitvoeren vanuit de project-root:
#   bash check-missing.sh
#
# Geeft een lijst van bestanden die in de codebase worden geïmporteerd maar
# niet (meer) op disk staan. Vergelijkbaar met wat de Next.js build doet,
# maar dan in 2 seconden zonder de hele compile-stack op te starten.

set -u

# Bestanden die volgens de codebase moeten bestaan (gedetecteerd via imports
# in sessie 6 vergelijking). Elk pad heeft minstens één van .ts, .tsx, of /index.ts(x).

# Tolerant matchen: een import "@/foo/bar" matcht als één van deze bestaat:
#   src/foo/bar.ts
#   src/foo/bar.tsx
#   src/foo/bar/index.ts
#   src/foo/bar/index.tsx

check_import() {
  local import_path="$1"
  local base="src/${import_path}"
  if [[ -f "${base}.ts" ]] || [[ -f "${base}.tsx" ]] || \
     [[ -f "${base}/index.ts" ]] || [[ -f "${base}/index.tsx" ]]; then
    echo "  ✓ @/${import_path}"
    return 0
  else
    echo "  ✗ @/${import_path}  ← MIST"
    return 1
  fi
}

echo "Checking 7 imports waarvan niet zeker is of ze op disk staan..."
echo

missing=0
for imp in \
  "components/layout" \
  "components/layout/Breadcrumb" \
  "components/layout/DetailHeader" \
  "components/layout/Footer" \
  "components/layout/HeaderShell" \
  "components/providers/PlaceholderContext" \
  "lib/auth/server" \
; do
  check_import "$imp" || missing=$((missing + 1))
done

echo
if [[ $missing -eq 0 ]]; then
  echo "Alles staat. Geen actie nodig."
else
  echo "$missing bestand(en) ontbreken. Stuur deze lijst terug naar Claude — die levert de hersteldownload."
fi

# Bonus: check ook RecentlyViewedSection en zijn hook (zou nu wel moeten staan
# na de eerdere fix, maar even controleren).
echo
echo "Aanvullende check (zou nu moeten bestaan na eerdere herstel-zip):"
check_import "app/materials/_components/RecentlyViewedSection" || true
check_import "lib/hooks/useRecentlyViewedMaterials" || true
