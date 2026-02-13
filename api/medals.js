export default function handler(req, res) {
  // ✅ Emergency truth source (manual), so site always loads correctly.
  // Update this list as needed until the scraper is fixed.
  const rows = [
    { rank: 1,  code: "NOR", country: "Norway",         gold: 8, silver: 3, bronze: 7, total: 18 },
    { rank: 2,  code: "ITA", country: "Italy",          gold: 6, silver: 3, bronze: 9, total: 18 },
    { rank: 3,  code: "USA", country: "United States",  gold: 4, silver: 7, bronze: 3, total: 14 },
    { rank: 4,  code: "FRA", country: "France",         gold: 4, silver: 5, bronze: 1, total: 10 },
    { rank: 5,  code: "GER", country: "Germany",        gold: 4, silver: 4, bronze: 3, total: 11 },
    { rank: 6,  code: "SWE", country: "Sweden",         gold: 4, silver: 3, bronze: 1, total: 8  },
    { rank: 7,  code: "SUI", country: "Switzerland",    gold: 4, silver: 1, bronze: 2, total: 7  },
    { rank: 8,  code: "AUT", country: "Austria",        gold: 3, silver: 6, bronze: 3, total: 12 },
    { rank: 9,  code: "NED", country: "Netherlands",    gold: 3, silver: 3, bronze: 1, total: 7  },
    { rank: 10, code: "JPN", country: "Japan",          gold: 3, silver: 2, bronze: 7, total: 12 },
    { rank: 11, code: "CZE", country: "Czechia",        gold: 2, silver: 2, bronze: 0, total: 4  },
    { rank: 12, code: "AUS", country: "Australia",      gold: 2, silver: 1, bronze: 0, total: 3  },
    { rank: 13, code: "KOR", country: "South Korea",    gold: 1, silver: 1, bronze: 2, total: 4  },
    { rank: 14, code: "SLO", country: "Slovenia",       gold: 1, silver: 1, bronze: 0, total: 2  },
    { rank: 15, code: "GBR", country: "Great Britain",  gold: 1, silver: 0, bronze: 0, total: 1  },
    { rank: 16, code: "CAN", country: "Canada",         gold: 0, silver: 3, bronze: 4, total: 7  },
    { rank: 17, code: "CHN", country: "China",          gold: 0, silver: 2, bronze: 2, total: 4  },
    { rank: 18, code: "POL", country: "Poland",         gold: 0, silver: 2, bronze: 0, total: 2  },
    { rank: 19, code: "NZL", country: "New Zealand",    gold: 0, silver: 1, bronze: 1, total: 2  },
    { rank: 20, code: "LAT", country: "Latvia",         gold: 0, silver: 1, bronze: 0, total: 1  },
    { rank: 21, code: "BUL", country: "Bulgaria",       gold: 0, silver: 0, bronze: 2, total: 2  },
    { rank: 22, code: "BEL", country: "Belgium",        gold: 0, silver: 0, bronze: 1, total: 1  },
    { rank: 23, code: "FIN", country: "Finland",        gold: 0, silver: 0, bronze: 1, total: 1  }
  ];

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json(rows);
}
