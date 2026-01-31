#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 3 ]; then echo "Usage: $0 <gold> <silver> <bronze>"; exit 1; fi
GOLD="$1"; SILVER="$2"; BRONZE="$3"
TOTAL=$((GOLD + SILVER + BRONZE))

FIREBASE_BASE="https://floppysnake-leaderboard-default-rtdb.firebaseio.com"
URL="$FIREBASE_BASE/usa-medals.json"
NOW_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

PAYLOAD=$(cat <<JSON
{"country":"United States","code":"USA","gold":$GOLD,"silver":$SILVER,"bronze":$BRONZE,"total":$TOTAL,"lastUpdatedISO":"$NOW_ISO","source":"firebase-remote"}
JSON
)

echo "PUT $URL"
curl -sS -X PUT -H "Content-Type: application/json" -d "$PAYLOAD" "$URL" | head -c 300
echo
