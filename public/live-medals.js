(() => {
  const API = "/api/medals";
  const POLL_MS = 30000;

  function ensureTopBox() {
    if (document.getElementById("usa-live-box")) return;
    const box = document.createElement("div");
    box.id = "usa-live-box";
    box.style.cssText =
      "margin:12px auto;max-width:980px;padding:12px 14px;border:1px solid rgba(0,0,0,0.15);border-radius:12px;background:rgba(255,255,255,0.78);backdrop-filter:saturate(150%) blur(6px);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div style="font-weight:900;font-size:16px">🇺🇸 Team USA — Live Medals</div>
        <div style="opacity:0.7;font-size:12px">Live from <b>/api/medals</b></div>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:14px">
        <div>🥇 <span id="usa-gold">—</span></div>
        <div>🥈 <span id="usa-silver">—</span></div>
        <div>🥉 <span id="usa-bronze">—</span></div>
        <div><b>Total:</b> <span id="usa-total">—</span></div>
      </div>
    `;
    document.body.insertBefore(box, document.body.firstChild);
  }

  function ensureLiveTableContainer() {
    if (document.getElementById("live-medal-table")) return;

    const wrap = document.createElement("div");
    wrap.id = "live-medal-table";
    wrap.style.cssText =
      "margin:12px auto;max-width:980px;padding:12px 14px;border:1px solid rgba(0,0,0,0.12);border-radius:12px;background:rgba(255,255,255,0.72);backdrop-filter:saturate(150%) blur(6px);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";

    wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div style="font-weight:900;font-size:16px">🏅 Live Medal Table</div>
        <div style="opacity:0.7;font-size:12px">Auto-refresh: ${POLL_MS / 1000}s</div>
      </div>
      <div style="overflow:auto;margin-top:10px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">#</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">Country</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">Gold</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">Silver</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">Bronze</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(0,0,0,0.12)">Total</th>
            </tr>
          </thead>
          <tbody id="live-medal-tbody"></tbody>
        </table>
      </div>
    `;

    const top = document.getElementById("usa-live-box");
    if (top && top.parentNode) top.parentNode.insertBefore(wrap, top.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);
  }

  function hideOldStaticMedalTable() {
    const tables = Array.from(document.querySelectorAll("table"));
    for (const t of tables) {
      if (t.closest("#live-medal-table")) continue;
      const txt = (t.innerText || "").toLowerCase();
      if (txt.includes("gold") && txt.includes("silver") && txt.includes("bronze") && txt.includes("total")) {
        t.style.display = "none";
        return;
      }
    }
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v);
  }

  function renderTable(rows) {
    const tb = document.getElementById("live-medal-tbody");
    if (!tb) return;
    tb.innerHTML = "";

    for (const r of rows) {
      const tr = document.createElement("tr");
      const isUSA =
        String(r.code || "").toUpperCase() === "USA" ||
        /united states/i.test(String(r.country || ""));

      tr.style.background = isUSA ? "rgba(0,0,0,0.06)" : "transparent";

      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid rgba(0,0,0,0.08)">${r.rank ?? ""}</td>
        <td style="padding:8px;border-bottom:1px solid rgba(0,0,0,0.08)"><b>${r.code ? r.code + " " : ""}</b>${r.country ?? ""}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid rgba(0,0,0,0.08)">${r.gold ?? 0}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid rgba(0,0,0,0.08)">${r.silver ?? 0}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid rgba(0,0,0,0.08)">${r.bronze ?? 0}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid rgba(0,0,0,0.08)"><b>${r.total ?? 0}</b></td>
      `;
      tb.appendChild(tr);
    }
  }

  async function tick() {
    try {
      const r = await fetch(API + "?t=" + Date.now(), { cache: "no-store" });
      const rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) return;

      const usa =
        rows.find((x) => String(x.code || "").toUpperCase() === "USA") ||
        rows.find((x) => /united states/i.test(String(x.country || "")));

      if (usa) {
        set("usa-gold", usa.gold ?? 0);
        set("usa-silver", usa.silver ?? 0);
        set("usa-bronze", usa.bronze ?? 0);
        set("usa-total", usa.total ?? ((usa.gold || 0) + (usa.silver || 0) + (usa.bronze || 0)));
      }

      renderTable(rows);
      hideOldStaticMedalTable();
    } catch (e) {
      // silent
    }
  }

  function start() {
    ensureTopBox();
    ensureLiveTableContainer();
    tick();
    setInterval(tick, POLL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
