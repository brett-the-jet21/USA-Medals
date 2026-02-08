export default async function handler(req, res) {
  try {
    const url = "https://www.olympics.com/en/milano-cortina-2026/medals";

    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
      },
    });

    if (!r.ok) throw new Error(`olympics.com HTTP ${r.status}`);

    const html = await r.text();

    // Try several common bootstraps (they sometimes change)
    const candidates = [
      /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i,
      /<script[^>]*id="__NUXT__"[^>]*>([\s\S]*?)<\/script>/i,
      /window\.__NEXT_DATA__\s*=\s*({[\s\S]*?});/i,
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/i,
    ];

    let jsonText = null;
    for (const re of candidates) {
      const m = html.match(re);
      if (m && m[1]) { jsonText = m[1]; break; }
    }

    if (!jsonText) {
      // return a tiny debug snippet so we can see what HTML we got
      res.status(500).json({
        error: "missing bootstrap JSON (__NEXT_DATA__/__NUXT__/INITIAL_STATE)",
        debug_head: html.slice(0, 600),
      });
      return;
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      res.status(500).json({
        error: "failed to parse bootstrap JSON",
        debug_json_head: String(jsonText).slice(0, 400),
      });
      return;
    }

    // Find medal rows recursively
    function isRow(x) {
      return x && typeof x === "object" &&
        typeof x.gold === "number" &&
        typeof x.silver === "number" &&
        typeof x.bronze === "number" &&
        typeof x.total === "number" &&
        (typeof x.description === "string" ||
         typeof x.name === "string" ||
         typeof x.country === "string" ||
         typeof x.noc === "string" ||
         typeof x.code === "string" ||
         typeof x.organisation?.description === "string");
    }

    function findRows(node) {
      if (!node) return null;
      if (Array.isArray(node)) {
        if (node.length && node.every(isRow)) return node;
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
    if (!rowsRaw) {
      res.status(500).json({
        error: "could not locate medal rows inside bootstrap JSON",
        hint: "site likely changed structure; we can target a specific path once we see keys",
      });
      return;
    }

    const rows = rowsRaw.map((x) => {
      const name =
        x.description ||
        x.name ||
        x.country ||
        x.organisation?.description ||
        x.organisation?.name ||
        "";
      const code =
        x.noc ||
        x.code ||
        x.countryCode ||
        x.organisation?.code ||
        x.organisation?.noc ||
        "";
      return { name, code, gold: x.gold, silver: x.silver, bronze: x.bronze, total: x.total };
    }).filter(r => r.name);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    res.status(200).json({
      source: url,
      updatedAt: new Date().toISOString(),
      count: rows.length,
      rows,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
