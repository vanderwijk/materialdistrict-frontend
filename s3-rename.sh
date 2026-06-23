#!/usr/bin/env bash
#
# S3-hernoem voor media-sanitering. Gebruikt s3api (niet de high-level
# `aws s3 mv`, die struikelt over '?' in keys). copy-source wordt URL-encoded
# zodat keys met ?, @, spaties e.d. kloppen. Idempotent: al-verplaatste
# objecten (oude key bestaat niet meer) worden overgeslagen.
#
# Draai vanuit de map met md-s3-moves.tsv:
#   bash s3-rename.sh
#
set -u
cd "$(dirname "$0")" || exit 1

B="materialdistrict-media"
REGION="eu-central-1"
TSV="md-s3-moves.tsv"

[ -f "$TSV" ] || { echo "Niet gevonden: $TSV (draai vanuit de juiste map)"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 niet gevonden"; exit 1; }

moved=0; skipped=0; fail=0
while IFS=$'\t' read -r old new; do
	[ -z "${old:-}" ] && continue

	# Al verplaatst? Dan bestaat de oude key niet meer -> overslaan.
	if ! aws s3api head-object --bucket "$B" --region "$REGION" --key "$old" >/dev/null 2>&1; then
		skipped=$((skipped + 1))
		continue
	fi

	# copy-source = bucket/<url-encoded key> (slashes behouden).
	enc=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe="/"))' "$old")
	src="$B/$enc"

	if aws s3api copy-object --bucket "$B" --region "$REGION" --key "$new" --copy-source "$src" >/dev/null 2>&1 \
		&& aws s3api delete-object --bucket "$B" --region "$REGION" --key "$old" >/dev/null 2>&1; then
		moved=$((moved + 1))
	else
		echo "FAIL: $old"
		fail=$((fail + 1))
	fi
done < "$TSV"

echo "klaar — verplaatst: $moved, al gedaan/overgeslagen: $skipped, mislukt: $fail"
