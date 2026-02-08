export default async function handler(req, res) {
  try {
    const url = "https://olympics.com/en/olympic-games/milano-cortina-2026/medals";

    const r = await fetch(url, {
      headers: {
        "user-agent": "usamedalstoday.com",
        "accept": "text/html,application/xhtml+xml",
      },
    });
    if (!r.ok) throw new Error(`olympics.com HTTP ${r.status}`);

    const html = await r.text();

    // Extract Next.js payload
    const m = html.match(
      /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i
    );
    if (!m) throw new Error("missing __NEXT_DATA__");

    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      throw new Error("failed to parse __NEXT_DATA__ JSON");
    }

    // Recursively find an array of medal rows
    function isMedalRow(x) {
      return x && typeof x === "object" &&
        typeof x.gold === "number" &&
        typeof x.silver === "number" &&
        typeof x.bronze === "number" &&
        typeof x.total === "number" &&
        (typeof x.description === "string" ||
         typeof x.name === "string" ||
         typeof x.country === "string" ||
         typeof x.noc === "string" ||
         typeof x.code === "string");
    }

    function findRows(node) {
      if (!node) return null;

      if (Array.isArray(node)) {
        // If this looks like the medal array, return it
        if (node.length && node.every(isMedalRow)) return node;
        // Otherwise search inside
        for (const v of node) {
          const got = findRows(v);
          if (got) return got;
        }
        return null;
      }

      if (typeof node === "object") {
        for (const k of Object.keys(node)) {
          const got = findRows(node[k]);
          if (got) return got;
        }
      }

      return null;
    }

    const rowsRaw = findRows(data);
    if (!rowsRaw) throw new Error("could not locate medal rows in __NEXT_DATA__");

    const rows = rowsRaw.map((x) => {
      const name = x.description || x.name || x.country || x.organisation?.description || x.organisation?.name || "";
      const code = x.noc || x.code || x.countryCode || x.organisation?.code || x.organisation?.noc || "";
      return {
        name,
        code, // NOC/ISO-ish (often 3-letter NOC)
        gold: x.gold,
        silver: x.silver,
        bronze: x.bronze,
        total: x.total,
      };
    }).filter(r => r.name);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    res.status(200).json({
      source: "olympics.com medals page (__NEXT_DATA__)",
      updatedAt: new Date().toISOString(),
      count: rows.length,
      rows
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
