import fs from "fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

// remove any previous injected block
html = html.replace(/\n<!-- LIVE_MEDALS_START -->[\s\S]*?<!-- LIVE_MEDALS_END -->\n/g, "\n");

const block = `
<!-- LIVE_MEDALS_START -->
<script>
(() => {
  const WIKI_URL = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Winter_Olympics_medal_table&prop=wikitext&format=json&origin=*";

  // Debug badge (so we can SEE it is updating)
  function badge(line1, line2="") {
    let b = document.getElementById("medalFixBadge");
    if (!b) {
      b = document.createElement("div");
      b.id = "medalFixBadge";
      b.style.cssText =
        "position:fixed;z-index:99999;right:12px;bottom:12px;max-width:520px;padding:10px 12px;border-radius:12px;" +
        "border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.75);color:#fff;font:12px/1.35 system-ui;white-space:pre-wrap";
      document.body.appendChild(b);
    }
    b.textContent = line1 + "\\n" + line2;
  }

  function stripFlagsAndTrim(s) {
    // Remove regional-indicator flag emoji pairs + misc emoji
    return (s||"")
      .replace(/[\\uD83C\\uDDE6-\\uDDFF]{2}/g, " ")
      .replace(/[\\u{1F1E6}-\\u{1F1FF}]/gu, " ")
      .replace(/[\\u{1F300}-\\u{1FAFF}]/gu, " ")
      .replace(/\\s+/g, " ")
      .trim();
  }

  function extractNameFromDomCountryCell(raw) {
    // raw example: "🇺🇸 United States US"
    const cleaned = stripFlagsAndTrim(raw);
    const parts = cleaned.split(" ").filter(Boolean);
    if (parts.length >= 2 && /^[A-Z]{2}$/.test(parts[parts.length - 1])) {
      parts.pop(); // drop ISO2
    }
    return parts.join(" ").trim();
  }

  function parseWikiByName(wt) {
    const by = Object.create(null);
    const re = /\\|\\-\\s*\\n\\|\\s*([^\\n\\|]+?)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)/g;
    let m;
    while ((m = re.exec(wt)) !== null) {
      const name = m[1].replace(/\\[\\[|\\]\\]/g, "").trim();
      by[name] = { gold:+m[2], silver:+m[3], bronze:+m[4], total:+m[5] };
    }
    return by;
  }

  function updateMainTable(byName) {
    const trs = Array.from(document.querySelectorAll("table tbody tr"));
    let updated = 0, scanned = 0;
    const missing = [];

    for (const tr of trs) {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length < 6) continue;

      scanned++;

      const rawCountry = tds[1].innerText || tds[1].textContent || "";
      const name = extractNameFromDomCountryCell(rawCountry);
      if (!name) continue;

      const medals = byName[name];
      if (!medals) {
        if (missing.length < 12) missing.push(name);
        continue;
      }

      tds[2].textContent = String(medals.gold);
      tds[3].textContent = String(medals.silver);
      tds[4].textContent = String(medals.bronze);
      tds[5].textContent = String(medals.total);
      updated++;
    }

    return { scanned, updated, missing };
  }

  async function refresh() {
    try {
      const r = await fetch(WIKI_URL, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const wt = j?.parse?.wikitext?.["*"] || "";
      const byName = parseWikiByName(wt);

      const { scanned, updated, missing } = updateMainTable(byName);

      badge(
        "FETCH: OK • " + new Date().toLocaleString(),
        "Table rows scanned: " + scanned +
        "\\nTable rows updated: " + updated +
        (missing.length ? "\\nMissing examples: " + missing.join(", ") : "")
      );
    } catch (e) {
      badge("FETCH: ERR • " + new Date().toLocaleString(), String(e?.message || e));
      console.warn("medals refresh failed", e);
    }
  }

  // Win against any re-render
  let lastRun = 0;
  const mo = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastRun > 800) { lastRun = now; refresh(); }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  refresh();
  setInterval(refresh, 30000);
})();
</script>
<!-- LIVE_MEDALS_END -->
`;

if (!/<\/body>/i.test(html)) {
  console.error("ERROR: </body> not found in public/index.html");
  process.exit(1);
}
html = html.replace(/<\/body>/i, block + "\n</body>");
fs.writeFileSync(file, html, "utf8");
console.log("✅ patched public/index.html");
