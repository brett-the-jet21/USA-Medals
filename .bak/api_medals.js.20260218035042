export default async function handler(req, res) {
  try {
    // Wikipedia is far more stable than olympics.com HTML/JS.
    const title = "2026_Winter_Olympics_medal_table";
    const url =
      "https://en.wikipedia.org/w/api.php" +
      "?action=parse&format=json&origin=*" +
      "&page=" + encodeURIComponent(title) +
      "&prop=text&section=0";

    const r = await fetch(url, {
      cache: "no-store",
      headers: {
        "user-agent": "usamedalstoday.com (Vercel) medals hotfix",
        "accept": "application/json"
      }
    });
    if (!r.ok) throw new Error(`Wikipedia API HTTP ${r.status}`);

    const j = await r.json();
    const html = j?.parse?.text?.["*"] || "";
    if (!html) throw new Error("Wikipedia returned empty HTML");

    // Pick the first "wikitable" that looks like a medal table.
    const tables = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/gi) || [];
    if (!tables.length) throw new Error("No wikitable found in Wikipedia HTML");

    let tableHtml = "";
    for (const t of tables) {
      const lower = t.toLowerCase();
      if (lower.includes("gold") && lower.includes("silver") && lower.includes("bronze") && lower.includes("total")) {
        tableHtml = t;
        break;
      }
    }
    if (!tableHtml) tableHtml = tables[0];

    // Utilities
    const strip = (s) =>
      s
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, ')
        .replace(/&#39;/g, ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

    const toInt = (x) => {
      const n = Number(String(x).replace(/[^\d]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    const trList = tableHtml.match(/<tr[\s\S]*?>[\s\S]*?<\/tr>/gi) || [];
    const rows = [];

    for (const tr of trList) {
      // skip obvious header rows
      const headerish = tr.toLowerCase().includes("<th") && tr.toLowerCase().includes("gold");
      if (headerish) continue;

      // Try to grab NOC code from <abbr> (often present in medal tables)
      let code = "";
      const abbr = tr.match(/<abbr[^>]*>\s*([A-Z]{3})\s*<\/abbr>/);
      if (abbr) code = abbr[1];

      // Grab cells
      const cells = tr.match(/<(td|th)[\s\S]*?>[\s\S]*?<\/\1>/gi) || [];
      if (cells.length < 5) continue;

      const plain = cells.map(strip).filter(Boolean);
      const joined = plain.join(" | ").toLowerCase();
      if (joined.includes("rank") && joined.includes("gold")) continue;
      if (joined.includes("noc") && joined.includes("total")) continue;

      // Country name: pick the longest alphabetic cell that is not "Total"
      let country = "";
      for (const p of plain) {
        if (!/[A-Za-z]/.test(p)) continue;
        const low = p.toLowerCase();
        if (low === "total" || low === "totals") continue;
        if (p.length > country.length) country = p;
      }
      if (!country) continue;

      // Numeric values in order
      const nums = plain.map(toInt).filter((n) => n >= 0);

      // Find (g,s,b,t) where g+s+b==t
      let gold=0, silver=0, bronze=0, total=0;
      for (let i=0; i+3<nums.length; i++) {
        const g=nums[i], s=nums[i+1], b=nums[i+2], t=nums[i+3];
        if (t>0 && g+s+b===t) { gold=g; silver=s; bronze=b; total=t; break; }
      }
      // Fallback: last 4 numbers
      if (total===0 && nums.length>=4) {
        gold=nums[nums.length-4];
        silver=nums[nums.length-3];
        bronze=nums[nums.length-2];
        total=nums[nums.length-1];
      }
      if (total===0) continue;

      // If code not found, derive a reasonable one for display (won’t break UI)
      if (!code) {
        const up = country.toUpperCase();
        if (up.includes("UNITED STATES")) code = "USA";
        else if (up.includes("GREAT BRITAIN")) code = "GBR";
        else if (up.includes("NETHERLANDS")) code = "NED";
        else if (up.includes("CZECH")) code = "CZE";
        else code = country.replace(/[^A-Za-z]/g,"").slice(0,3).toUpperCase() || "UNK";
      }

      rows.push({ code, country, gold, silver, bronze, total });
    }

    // Clean + sort
    const data = rows
      .filter(r => !/total/i.test(r.country))
      .sort((a,b) =>
        (b.gold-a.gold) || (b.silver-a.silver) || (b.bronze-a.bronze) || (b.total-a.total)
      )
      .map((r, i) => ({ rank: i+1, ...r }));

    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
    res.status(200).send(JSON.stringify(data));
  } catch (e) {
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
    res.status(500).send(JSON.stringify({ ok:false, error:String(e?.message||e) }));
  }
}
