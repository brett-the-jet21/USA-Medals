export default async function handler(req, res) {
  try {
    const url = "https://www.olympics.com/en/milano-cortina-2026/medals";

    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!r.ok) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(502).json({ error: "upstream_fetch_failed", status: r.status });
    }

    const html = await r.text();

    // Pull __NEXT_DATA__ (Olympics site is Next.js)
    const m = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (!m) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(500).json({ error: "next_data_not_found" });
    }

    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(500).json({ error: "next_data_parse_failed" });
    }

    // Walk the JSON and find an array that looks like a medal table
    function* walk(x) {
      if (!x || typeof x !== "object") return;
      yield x;
      if (Array.isArray(x)) {
        for (const v of x) yield* walk(v);
      } else {
        for (const k of Object.keys(x)) yield* walk(x[k]);
      }
    }

    let rows = null;

    for (const node of walk(data)) {
      // Heuristic: array of objects containing a country code and medal counts
      if (Array.isArray(node) && node.length > 5 && typeof node[0] === "object") {
        const o = node[0] || {};
        const hasCode =
          o.noc || o.countryCode || o.code || o.country?.noc || o.country?.code;
        const hasGold = o.gold != null || o.g != null || o.medals?.gold != null;
        const hasTotal = o.total != null || o.t != null || o.medals?.total != null;
        if (hasCode && (hasGold || hasTotal)) {
          rows = node;
          break;
        }
      }
      if (node && typeof node === "object" && Array.isArray(node.medalTable) && node.medalTable.length) {
        rows = node.medalTable;
        break;
      }
    }

    if (!rows) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(500).json({ error: "medal_table_not_found" });
    }

    const norm = rows
      .map((r) => {
        const code = String(
          r.noc ?? r.countryCode ?? r.code ?? r.country?.noc ?? r.country?.code ?? ""
        ).toUpperCase();

        const country = String(
          r.countryName ?? r.country?.name ?? r.name ?? r.country ?? ""
        );

        const gold = Number(r.gold ?? r.g ?? r.medals?.gold ?? 0) || 0;
        const silver = Number(r.silver ?? r.s ?? r.medals?.silver ?? 0) || 0;
        const bronze = Number(r.bronze ?? r.b ?? r.medals?.bronze ?? 0) || 0;
        const total =
          Number(r.total ?? r.t ?? r.medals?.total ?? (gold + silver + bronze)) ||
          (gold + silver + bronze);

        // rank sometimes provided, but we recompute later if missing
        const rank = Number(r.rank ?? r.position ?? 0) || 0;

        return { rank, code, country, gold, silver, bronze, total };
      })
      .filter((x) => x.code || x.country);

    // Re-rank by official-ish logic: gold → silver → bronze → total → country
    norm.sort(
      (a, b) =>
        (b.gold - a.gold) ||
        (b.silver - a.silver) ||
        (b.bronze - a.bronze) ||
        (b.total - a.total) ||
        String(a.country).localeCompare(String(b.country))
    );

    norm.forEach((x, i) => (x.rank = i + 1));

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(norm);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(500).json({ error: "server_error", message: String(e?.message || e) });
  }
}
