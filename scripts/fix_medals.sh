#!/usr/bin/env bash
set -euo pipefail

# SAFETY: never publish tiny/non-JSON medals output
KEEP_LAST_GOOD=1
LAST_GOOD_FILE="public/medals.last_good.json"


echo "== ensure dirs =="
mkdir -p api scripts public

echo "== write serverless API: api/medals.js (Wikipedia) =="
cat > api/medals.js <<'JS'
export default async function handler(req, res) {
  try {
    const WIKI = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Winter_Olympics&prop=wikitext&format=json&origin=*";
    const r = await fetch(WIKI, { headers: { "user-agent": "Mozilla/5.0 usamedalstoday.com" } });
    if (!r.ok) throw new Error(`wiki HTTP ${r.status}`);
    const j = await r.json();
    const wt = j?.parse?.wikitext?.["*"] || "";

    const rows = [];
    const re = /\|\-\s*\n\|\s*([^\n\|]+?)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)/g;
    let m;
    while ((m = re.exec(wt)) !== null) {
      const name = m[1]
        .replace(/\[\[|\]\]/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\(\s*host nation\s*\)/i, "")
        .trim();
      rows.push({ name, gold:+m[2], silver:+m[3], bronze:+m[4], total:+m[5] });
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    res.status(200).json({ source: "wikipedia", updatedAt: new Date().toISOString(), count: rows.length, rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
JS

echo "== patch public/index.html (inject client updater) =="
node - <<'NODE'
const fs = require("fs");
const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

// remove any previous injected block
html = html.replace(/\n<!-- LIVE_MEDALS_START -->[\s\S]*?<!-- LIVE_MEDALS_END -->\n/g, "\n");

const block = `
<!-- LIVE_MEDALS_START -->
<script>
(() => {
  const API = "/api/medals";

  const norm = (s) => (s||"")
    .replace(/[\\u{1F1E6}-\\u{1F1FF}]/gu, "")   // flags
    .replace(/\\b[A-Z]{2}\\b/g, " ")           // ISO2
    .replace(/[^A-Za-z\\s]/g, " ")
    .replace(/\\s+/g, " ")
    .trim()
    .toLowerCase();

  function badge(lines) {
    let b = document.getElementById("liveMedalsDebug");
    if (!b) {
      b = document.createElement("div");
      b.id = "liveMedalsDebug";
      b.style.cssText =
        "position:fixed;right:16px;bottom:16px;max-width:560px;padding:12px 14px;" +
        "background:rgba(0,0,0,.70);color:#fff;font:12px/1.35 ui-monospace,Menlo,monospace;" +
        "border-radius:12px;z-index:99999;white-space:pre-wrap;box-shadow:0 10px 30px rgba(0,0,0,.35)";
      document.body.appendChild(b);
    }
    b.textContent = lines.join("\\n");
  }

  function updateTable(rows) {
    const map = new Map(rows.map(r => [norm(r.name), r]));
    const trs = Array.from(document.querySelectorAll("table tbody tr"));

    let scanned = 0, updated = 0;
    const missing = [];

    for (const tr of trs) {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length < 6) continue;
      scanned++;

      const key = norm(tds[1].textContent || "");
      const hit = map.get(key);

      if (!hit) {
        if (missing.length < 12) missing.push((tds[1].textContent||"").trim().slice(0,60));
        continue;
      }

      tds[2].textContent = String(hit.gold);
      tds[3].textContent = String(hit.silver);
      tds[4].textContent = String(hit.bronze);
      tds[5].textContent = String(hit.total);
      updated++;
    }

    badge([
      "SOURCE: /api/medals (wikipedia) • OK • " + new Date().toLocaleString(),
      "Rows in API: " + rows.length,
      "Table rows scanned: " + scanned,
      "Table rows updated: " + updated,
      missing.length ? ("Missing examples: " + missing.join(", ")) : "Missing examples: (none)"
    ]);
  }

  async function tick() {
    try {
      const r = await fetch(API, { cache:"no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      updateTable(j.rows || []);
    } catch (e) {
      badge(["FETCH ERR", String(e?.message || e)]);
      console.warn(e);
    }
  }

  tick();
  setInterval(tick, 30000);
})();
</script>
<!-- LIVE_MEDALS_END -->
`;

if (!/<\/body>/i.test(html)) {
  console.error("ERROR: </body> not found");
  process.exit(1);
}
html = html.replace(/<\/body>/i, block + "\n</body>");
fs.writeFileSync(file, html, "utf8");
console.log("patched", file);
NODE

echo "== commit + deploy =="
git add api/medals.js public/index.html
git commit -m "Fix: medal counts via wikipedia API + live DOM table update" || true
git push
npx -y vercel@latest --prod

echo "== quick check =="
curl -s https://usamedalstoday.com/api/medals | head -c 300; echo

# ---- SAFETY GUARD (append) ----
if [ -f "public/medals.json" ]; then
  bytes="$(wc -c < public/medals.json | tr -d " ")"
  first="$(head -c 1 public/medals.json || true)"
  if [ "$bytes" -lt 300 ] || { [ "$first" != "{" ] && [ "$first" != "[" ]; }; then
    echo "❌ medals.json looks bad (bytes=$bytes first='$first'). Restoring last-good if available..."
    if [ -f "$LAST_GOOD_FILE" ]; then
      cp -f "$LAST_GOOD_FILE" public/medals.json
      echo "✅ restored public/medals.json from $LAST_GOOD_FILE"
    else
      echo "⚠️ no last-good file available; leaving current medals.json as-is"
    fi
  else
    cp -f public/medals.json "$LAST_GOOD_FILE"
    echo "✅ saved last-good to $LAST_GOOD_FILE"
  fi
fi
# ---- END SAFETY GUARD ----
