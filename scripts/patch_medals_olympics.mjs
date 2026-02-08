import fs from "fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

// remove old injected blocks
html = html.replace(/\n<!-- LIVE_MEDALS_START -->[\s\S]*?<!-- LIVE_MEDALS_END -->\n/g, "\n");

const block = `
<!-- LIVE_MEDALS_START -->
<script>
(() => {
  const OLYMPICS_URL =
    "https://olympics.com/en/olympic-games/olympic-medal-tally.json";

  function badge(msg) {
    let b = document.getElementById("medalFixBadge");
    if (!b) {
      b = document.createElement("div");
      b.id = "medalFixBadge";
      b.style.cssText =
        "position:fixed;right:12px;bottom:12px;z-index:99999;" +
        "background:rgba(0,0,0,.8);color:#fff;padding:10px 12px;" +
        "border-radius:12px;font:12px/1.4 system-ui;white-space:pre";
      document.body.appendChild(b);
    }
    b.textContent = msg;
  }

  function cleanCountry(raw) {
    return (raw || "")
      .replace(/[\\u{1F1E6}-\\u{1F1FF}]/gu, "") // flags
      .replace(/\\b[A-Z]{2}\\b$/, "")           // ISO
      .replace(/\\s+/g, " ")
      .trim();
  }

  function updateTable(byName) {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    let updated = 0;

    for (const tr of rows) {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 6) continue;

      const name = cleanCountry(tds[1].innerText);
      const m = byName[name];
      if (!m) continue;

      tds[2].textContent = m.gold;
      tds[3].textContent = m.silver;
      tds[4].textContent = m.bronze;
      tds[5].textContent = m.total;
      updated++;
    }
    return updated;
  }

  async function refresh() {
    try {
      const r = await fetch(OLYMPICS_URL, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();

      // Build name → medals map
      const byName = {};
      for (const c of j.medalTally) {
        byName[c.description] = {
          gold: c.gold,
          silver: c.silver,
          bronze: c.bronze,
          total: c.total
        };
      }

      const updated = updateTable(byName);
      badge(
        "SOURCE: Olympics.com\\n" +
        "FETCH: OK\\n" +
        "Rows updated: " + updated + "\\n" +
        new Date().toLocaleString()
      );
    } catch (e) {
      badge("FETCH ERR\\n" + (e?.message || e));
      console.warn(e);
    }
  }

  refresh();
  setInterval(refresh, 30000);
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
console.log("✅ Olympics.com medal patch applied");
