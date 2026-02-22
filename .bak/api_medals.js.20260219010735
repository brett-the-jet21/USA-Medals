module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const rows = [
    { rank: 1, code: "NOR", country: "Norway",        gold: 15, silver:  8, bronze: 10, total: 33 },
    { rank: 2, code: "ITA", country: "Italy",         gold:  9, silver:  5, bronze: 12, total: 26 },
    { rank: 3, code: "USA", country: "United States", gold:  7, silver: 11, bronze:  6, total: 24 },
    { rank: 4, code: "FRA", country: "France",        gold:  6, silver:  7, bronze:  4, total: 17 },
    { rank: 5, code: "NED", country: "Netherlands",   gold:  6, silver:  7, bronze:  2, total: 15 },
    { rank: 6, code: "SWE", country: "Sweden",        gold:  6, silver:  6, bronze:  3, total: 15 },
    { rank: 7, code: "GER", country: "Germany",       gold:  5, silver:  8, bronze:  8, total: 21 },
    { rank: 8, code: "AUT", country: "Austria",       gold:  5, silver:  8, bronze:  4, total: 17 },
    { rank: 9, code: "JPN", country: "Japan",         gold:  5, silver:  6, bronze: 11, total: 22 },
    { rank:10, code: "SUI", country: "Switzerland",   gold:  5, silver:  4, bronze:  3, total: 12 },
    { rank:11, code: "CAN", country: "Canada",        gold:  4, silver:  4, bronze:  6, total: 14 },
  ];

  res.status(200).json({
    updatedAt: new Date().toISOString(),
    source: "manual_hotfix",
    rows,
  });
};
