module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const rows = [
    { rank:1, country:"Norway",        code:"NOR", gold:15, silver:8,  bronze:10, total:33 },
    { rank:2, country:"Italy",         code:"ITA", gold:9,  silver:5,  bronze:12, total:26 },
    { rank:3, country:"United States", code:"USA", gold:7,  silver:11, bronze:6,  total:24 },
    { rank:4, country:"France",        code:"FRA", gold:6,  silver:7,  bronze:4,  total:17 },
    { rank:5, country:"Netherlands",   code:"NED", gold:6,  silver:7,  bronze:2,  total:15 },
    { rank:6, country:"Sweden",        code:"SWE", gold:6,  silver:6,  bronze:3,  total:15 },
    { rank:7, country:"Germany",       code:"GER", gold:5,  silver:8,  bronze:8,  total:21 },
    { rank:8, country:"Austria",       code:"AUT", gold:5,  silver:8,  bronze:4,  total:17 },
    { rank:9, country:"Japan",         code:"JPN", gold:5,  silver:6,  bronze:11, total:22 },
    { rank:10,country:"Switzerland",   code:"SUI", gold:5,  silver:4,  bronze:3,  total:12 },
    { rank:11,country:"Canada",        code:"CAN", gold:4,  silver:4,  bronze:6,  total:14 }
  ];

  // Add legacy keys so ANY frontend version works
  const safeRows = rows.map(r => ({
    ...r,
    g: r.gold,
    s: r.silver,
    b: r.bronze
  }));

  res.status(200).json({
    updatedAt: new Date().toISOString(),
    source: "manual_hotfix",
    rows: safeRows
  });
};
