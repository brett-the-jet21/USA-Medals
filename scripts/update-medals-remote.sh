#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <gold> <silver> <bronze>"
  exit 1
fi

GOLD="$1"
SILVER="$2"
BRONZE="$3"
TOTAL=$((GOLD + SILVER + BRONZE))
NOW_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

URL="https://script.google.com/macros/s/AKfycbxeQjJoRWr23II0C9fQ9F-e5D47n02tQdXu7j4uuEzC4CojWvKnnrEs3-G_knZN9Jeo/exec"
SECRET="uSaMedals_2026_9f3aasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf"

PAYLOAD=$(cat <<JSON
{"secret":"$SECRET","gold":$GOLD,"silver":$SILVER,"bronze":$BRONZE,"total":$TOTAL,"lastUpdatedISO":"$NOW_ISO"}
JSON
)

echo "POST $URL"
curl -sS -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$URL"
echo
echo "SUCCESS → USA $GOLD/$SILVER/$BRONZE (Total $TOTAL) @ $NOW_ISO"
