module.exports = function handler(req, res) {
  // EMERGENCY STATIC SNAPSHOT
  // Source: your Google screenshot ("olympic medal count")
  // Update these manually if needed.

  const data = [
    { rank: 1, code: "NOR", country: "Norway",         gold: 14, silver: 8,  bronze: 9,  total: 31 },
    { rank: 2, code: "ITA", country: "Italy",          gold:  9, silver: 4,  bronze: 11, total: 24 },
    { rank: 3, code: "USA", country: "United States",  gold:  6, silver: 10, bronze: 5,  total: 21 },
    { rank: 4, code: "NED", country: "Netherlands",    gold:  6, silver: 6,  bronze: 1,  total: 13 },
    { rank: 5, code: "GER", country: "Germany",        gold:  5, silver: 8,  bronze: 7,  total: 20 },
    { rank: 6, code: "AUT", country: "Austria",        gold:  5, silver: 8,  bronze: 4,  total: 17 },
    { rank: 7, code: "FRA", country: "France",         gold:  5, silver: 7,  bronze: 4,  total: 16 },
    { rank: 8, code: "SWE", country: "Sweden",         gold:  5, silver: 5,  bronze: 2,  total: 12 },
    { rank: 9, code: "SUI", country: "Switzerland",    gold:  5, silver: 2,  bronze: 3,  total: 10 },
    { rank:10, code: "JPN", country: "Japan",          gold:  4, silver: 5,  bronze: 10, total: 19 },
    { rank:11, code: "CAN", country: "Canada",         gold:  3, silver: 4,  bronze: 5,  total: 12 }
  ];

  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.statusCode = 200;
  res.end(JSON.stringify(data));
};
