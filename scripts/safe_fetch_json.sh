#!/usr/bin/env bash
set -euo pipefail

URL="$1"
OUT="$2"

tmp="$(mktemp)"
hdr="$(mktemp)"

# fetch (capture headers + body)
curl -sS -D "$hdr" -o "$tmp" "$URL" || true

status="$(head -n 1 "$hdr" | tr -d '\r')"
ctype="$(grep -i '^content-type:' "$hdr" | head -n 1 | tr -d '\r' || true)"
bytes="$(wc -c < "$tmp" | tr -d ' ')"

echo "status=$status"
echo "content-type=$ctype"
echo "bytes=$bytes"

# must be 200 and JSON-ish and not tiny
if ! echo "$status" | grep -q " 200"; then
  echo "ERROR: non-200 from $URL" >&2
  exit 22
fi

first="$(head -c 1 "$tmp" || true)"
if [ "$first" != "{" ] && [ "$first" != "[" ]; then
  echo "ERROR: not JSON (first byte '$first')" >&2
  exit 23
fi

if [ "$bytes" -lt 300 ]; then
  echo "ERROR: payload too small ($bytes bytes) — refusing to overwrite $OUT" >&2
  exit 24
fi

mv "$tmp" "$OUT"
rm -f "$hdr"
echo "✅ wrote $OUT from $URL"
