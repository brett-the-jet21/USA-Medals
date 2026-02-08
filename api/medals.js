export default async function handler(req, res) {
  try {
    const WIKI = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Winter_Olympics_medal_table&prop=wikitext&format=json&origin=*";
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
