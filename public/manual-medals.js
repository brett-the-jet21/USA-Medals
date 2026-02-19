(() => {
  const USA = { gold: 7, silver: 11, bronze: 6, total: 24 };
  const ROWS = [
    { rank: 1,  country: "Norway",        gold: 15, silver: 8,  bronze: 10, total: 33 },
    { rank: 2,  country: "Italy",         gold:  9, silver: 5,  bronze: 12, total: 26 },
    { rank: 3,  country: "United States", gold:  7, silver: 11, bronze:  6, total: 24 },
    { rank: 4,  country: "France",        gold:  6, silver: 7,  bronze:  4, total: 17 },
    { rank: 5,  country: "Netherlands",   gold:  6, silver: 7,  bronze:  2, total: 15 },
    { rank: 6,  country: "Sweden",        gold:  6, silver: 6,  bronze:  3, total: 15 },
    { rank: 7,  country: "Germany",       gold:  5, silver: 8,  bronze:  8, total: 21 },
    { rank: 8,  country: "Austria",       gold:  5, silver: 8,  bronze:  4, total: 17 },
    { rank: 9,  country: "Japan",         gold:  5, silver: 6,  bronze: 11, total: 22 },
    { rank: 10, country: "Switzerland",   gold:  5, silver: 4,  bronze:  3, total: 12 },
    { rank: 11, country: "Canada",        gold:  4, silver: 4,  bronze:  6, total: 14 },
    { rank: 12, country: "Australia",     gold:  3, silver: 2,  bronze:  1, total:  6 },
    { rank: 13, country: "Great Britain", gold:  3, silver: 0,  bronze:  0, total:  3 },
    { rank: 14, country: "China",         gold:  2, silver: 3,  bronze:  4, total:  9 },
    { rank: 15, country: "South Korea",   gold:  2, silver: 2,  bronze:  3, total:  7 },
    { rank: 16, country: "Czechia",       gold:  2, silver: 2,  bronze:  0, total:  4 },
    { rank: 17, country: "Slovenia",      gold:  2, silver: 1,  bronze:  1, total:  4 },
    { rank: 18, country: "Brazil",        gold:  1, silver: 0,  bronze:  0, total:  1 },
    { rank: 18, country: "Kazakhstan",    gold:  1, silver: 0,  bronze:  0, total:  1 },
    { rank: 20, country: "Poland",        gold:  0, silver: 3,  bronze:  1, total:  4 },
    { rank: 21, country: "New Zealand",   gold:  0, silver: 2,  bronze:  1, total:  3 },
    { rank: 22, country: "Latvia",        gold:  0, silver: 1,  bronze:  1, total:  2 },
    { rank: 23, country: "Georgia",       gold:  0, silver: 1,  bronze:  0, total:  1 },
    { rank: 24, country: "Finland",       gold:  0, silver: 0,  bronze:  4, total:  4 },
    { rank: 25, country: "Bulgaria",      gold:  0, silver: 0,  bronze:  2, total:  2 },
    { rank: 26, country: "Belgium",       gold:  0, silver: 0,  bronze:  1, total:  1 }
  ];

  const mount = () => {
    // put a guaranteed overlay at top so you SEE numbers no matter what
    let el = document.getElementById("manual-medals-overlay");
    if (!el) {
      el = document.createElement("div");
      el.id = "manual-medals-overlay";
      el.style.cssText = `
        position:sticky; top:0; z-index:9999;
        backdrop-filter: blur(8px);
        background: rgba(5,12,20,.82);
        border-bottom: 1px solid rgba(255,255,255,.12);
        padding: 12px 14px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        color: #fff;
      `;
      document.body.prepend(el);
    }

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
        <div style="font-weight:800;">USA Medal Count Today (Static)</div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <span style="opacity:.85">USA</span>
          <span>🥇 <b>${USA.gold}</b></span>
          <span>🥈 <b>${USA.silver}</b></span>
          <span>🥉 <b>${USA.bronze}</b></span>
          <span>Total <b>${USA.total}</b></span>
        </div>
      </div>
      <div style="margin-top:8px; max-height:240px; overflow:auto; border:1px solid rgba(255,255,255,.12); border-radius:10px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead style="background: rgba(0,0,0,.25);">
            <tr>
              <th style="text-align:left;padding:8px;">#</th>
              <th style="text-align:left;padding:8px;">Country</th>
              <th style="text-align:right;padding:8px;">G</th>
              <th style="text-align:right;padding:8px;">S</th>
              <th style="text-align:right;padding:8px;">B</th>
              <th style="text-align:right;padding:8px;">T</th>
            </tr>
          </thead>
          <tbody>
            ${ROWS.map(r => `
              <tr style="${r.country==='United States'?'background:rgba(255,255,255,.06);':''}">
                <td style="padding:8px;">${r.rank}</td>
                <td style="padding:8px;">${r.country}</td>
                <td style="padding:8px;text-align:right;">${r.gold}</td>
                <td style="padding:8px;text-align:right;">${r.silver}</td>
                <td style="padding:8px;text-align:right;">${r.bronze}</td>
                <td style="padding:8px;text-align:right;font-weight:800;">${r.total}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div style="opacity:.6; font-size:12px; margin-top:6px;">
        Manual override. This overlay guarantees numbers display even if the site UI is broken.
      </div>
    `;
  };

  window.addEventListener("load", mount);
  setTimeout(mount, 50);
  setTimeout(mount, 250);
  setTimeout(mount, 1000);
})();
