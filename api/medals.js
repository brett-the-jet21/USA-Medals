import https from "https";

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export default async function handler(req, res) {
  try {
    const url = "https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table";
    const html = await fetchHTML(url);

    const tableMatch = html.match(/<table[^>]*wikitable[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) throw new Error("Medal table not found");

    const rows = [...tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];

    const data = [];

    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
        .map(c => c[1].replace(/<[^>]+>/g, "").trim());

      if (cells.length >= 5 && !isNaN(parseInt(cells[0]))) {
        data.push({
          rank: cells[0],
          country: cells[1],
          gold: parseInt(cells[2]) || 0,
          silver: parseInt(cells[3]) || 0,
          bronze: parseInt(cells[4]) || 0,
          total: parseInt(cells[5]) || 0
        });
      }
    }

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ updated: new Date().toISOString(), medals: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
