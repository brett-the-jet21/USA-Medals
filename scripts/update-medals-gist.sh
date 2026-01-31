#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <gold> <silver> <bronze>"
  exit 1
fi

GOLD="$1"; SILVER="$2"; BRONZE="$3"
TOTAL=$((GOLD + SILVER + BRONZE))
NOW_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Find the first gist that contains usa-medals.json
GIST_ID=$(gh gist list --limit 50 | awk '/usa-medals\.json/ {print $1; exit}')
if [ -z "$GIST_ID" ]; then
  echo "Could not find a gist with usa-medals.json. Create it first."
  exit 1
fi

TMP=$(mktemp)
cat > "$TMP" <<JSON
{
  "country": "United States",
  "code": "USA",
  "gold": $GOLD,
  "silver": $SILVER,
  "bronze": $BRONZE,
  "total": $TOTAL,
  "lastUpdatedISO": "$NOW_ISO",
  "source": "gist"
}
JSON

gh gist edit "$GIST_ID" -a usa-medals.json < "$TMP" >/dev/null
echo "Updated gist $GIST_ID → USA: $GOLD/$SILVER/$BRONZE (Total $TOTAL) @ $NOW_ISO"
