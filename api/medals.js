export default async function handler(req, res) {
  try {
    const url =
      "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Winter_Olympics_medal_table&prop=wikitext&format=json&origin=*";

    const r = await fetch(url, {
      headers: { "user-agent": "usamedalstoday.com" },
    });

    if (!r.ok) throw new Error("wiki fetch failed");

    const data = await r.json();
    const wt = data?.parse?.wikitext?.["*"] || "";

    const rows = [];
    const re =
      /\|\-\s*\n\|\s*([^\n|]+?)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)\s*\|\|\s*(\d+)/g;

    let m;
    while ((m = re.exec(wt)) !== null) {
      rows.push({
        country: m[1].replace(/\[\[|\]\]/g, "").trim(),
        gold: +m[2],
        silver: +m[3],
        bronze: +m[4],
        total: +m[5],
      });
    }

    const byCountry = {};
    rows.forEach(r => (byCountry[r.country] = r));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      updatedAt: new Date().toISOString(),
      rows,
      byCountry,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
