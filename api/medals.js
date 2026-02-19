module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const countries = [
    { rank:1,  country:"Norway",        code:"NOR", gold:15, silver:8,  bronze:10, total:33 },
    { rank:2,  country:"Italy",         code:"ITA", gold:9,  silver:5,  bronze:12, total:26 },
    { rank:3,  country:"United States", code:"USA", gold:7,  silver:11, bronze:6,  total:24 },
    { rank:4,  country:"France",        code:"FRA", gold:6,  silver:7,  bronze:4,  total:17 },
    { rank:5,  country:"Netherlands",   code:"NED", gold:6,  silver:7,  bronze:2,  total:15 },
    { rank:6,  country:"Sweden",        code:"SWE", gold:6,  silver:6,  bronze:3,  total:15 },
    { rank:7,  country:"Germany",       code:"GER", gold:5,  silver:8,  bronze:8,  total:21 },
    { rank:8,  country:"Austria",       code:"AUT", gold:5,  silver:8,  bronze:4,  total:17 },
    { rank:9,  country:"Japan",         code:"JPN", gold:5,  silver:6,  bronze:11, total:22 },
    { rank:10, country:"Switzerland",   code:"SUI", gold:5,  silver:4,  bronze:3,  total:12 },
    { rank:11, country:"Canada",        code:"CAN", gold:4,  silver:4,  bronze:6,  total:14 },
    { rank:12, country:"Australia",     code:"AUS", gold:3,  silver:2,  bronze:1,  total:6 },
    { rank:13, country:"Great Britain", code:"GBR", gold:3,  silver:0,  bronze:0,  total:3 },
    { rank:14, country:"China",         code:"CHN", gold:2,  silver:3,  bronze:4,  total:9 },
    { rank:15, country:"South Korea",   code:"KOR", gold:2,  silver:2,  bronze:3,  total:7 },
    { rank:16, country:"Czechia",       code:"CZE", gold:2,  silver:2,  bronze:0,  total:4 },
    { rank:17, country:"Slovenia",      code:"SLO", gold:2,  silver:1,  bronze:1,  total:4 },
    { rank:18, country:"Brazil",        code:"BRA", gold:1,  silver:0,  bronze:0,  total:1 },
    { rank:18, country:"Kazakhstan",    code:"KAZ", gold:1,  silver:0,  bronze:0,  total:1 },
    { rank:20, country:"Poland",        code:"POL", gold:0,  silver:3,  bronze:1,  total:4 },
    { rank:21, country:"New Zealand",   code:"NZL", gold:0,  silver:2,  bronze:1,  total:3 },
    { rank:22, country:"Latvia",        code:"LAT", gold:0,  silver:1,  bronze:1,  total:2 },
    { rank:23, country:"Georgia",       code:"GEO", gold:0,  silver:1,  bronze:0,  total:1 },
    { rank:24, country:"Finland",       code:"FIN", gold:0,  silver:0,  bronze:4,  total:4 },
    { rank:25, country:"Bulgaria",      code:"BUL", gold:0,  silver:0,  bronze:2,  total:2 },
    { rank:26, country:"Belgium",       code:"BEL", gold:0,  silver:0,  bronze:1,  total:1 }
  ];

  // add compatibility fields
  const enriched = countries.map(c => ({
    ...c,
    g: c.gold,
    s: c.silver,
    b: c.bronze
  }));

  res.status(200).json({
    updatedAt: new Date().toISOString(),
    source: "manual_override",
    rows: enriched,
    countries: enriched,
    data: enriched
  });
};
