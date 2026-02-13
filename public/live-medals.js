(() => {
  const API = "/api/medals";
  const POLL_MS = 30000;

  const css = `
  :root{
    --lm-bg: rgba(10,14,25,.72);
    --lm-border: rgba(255,255,255,.10);
    --lm-text: rgba(255,255,255,.92);
    --lm-muted: rgba(255,255,255,.65);
    --lm-soft: rgba(255,255,255,.06);
    --lm-soft2: rgba(255,255,255,.04);
    --lm-shadow: 0 18px 60px rgba(0,0,0,.45);
  }
  .lm-wrap{
    margin: 16px auto;
    max-width: 980px;
    padding: 14px 16px;
    border: 1px solid var(--lm-border);
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)) , var(--lm-bg);
    box-shadow: var(--lm-shadow);
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    color: var(--lm-text);
  }
  .lm-row{
    display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
  }
  .lm-title{
    font-weight: 900;
    letter-spacing: .2px;
    font-size: 16px;
    display:flex;align-items:center;gap:10px;
  }
  .lm-chip{
    font-size: 12px;
    padding: 6px 10px;
    border: 1px solid var(--lm-border);
    border-radius: 999px;
    background: rgba(0,0,0,.18);
    color: var(--lm-muted);
  }
  .lm-metrics{
    display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;
  }
  .lm-pill{
    display:inline-flex;align-items:center;gap:8px;
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid var(--lm-border);
    background: rgba(255,255,255,.05);
    font-weight: 700;
    font-size: 13px;
  }
  .lm-pill b{font-weight: 900;}
  .lm-note{
    margin-top:10px;
    font-size:12px;
    color: var(--lm-muted);
  }
  .lm-tableWrap{
    overflow:auto;
    border-radius: 14px;
    border: 1px solid var(--lm-border);
    background: rgba(0,0,0,.15);
    margin-top: 12px;
  }
  .lm-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    min-width: 760px;
    font-size: 14px;
  }
  .lm-th{
    position: sticky;
    top: 0;
    z-index: 2;
    text-align:left;
    padding: 12px 12px;
    background: rgba(0,0,0,.35);
    backdrop-filter: blur(8px);
    color: rgba(255,255,255,.75);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .12em;
    border-bottom: 1px solid var(--lm-border);
  }
  .lm-td{
    padding: 12px 12px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    color: rgba(255,255,255,.88);
    white-space: nowrap;
  }
  .lm-tdNum{ text-align:right; font-variant-numeric: tabular-nums; }
  .lm-tr:nth-child(odd){ background: rgba(255,255,255,.02); }
  .lm-tr:hover{ background: rgba(255,255,255,.06); }
  .lm-usa{
    background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
    outline: 1px solid rgba(255,255,255,.10);
  }
  .lm-flag{
    width: 22px; height: 22px;
    border-radius: 6px;
    display:inline-flex;align-items:center;justify-content:center;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.10);
  }
  .lm-country{
    display:flex;align-items:center;gap:10px;
  }
  .lm-code{
    font-weight: 900;
    opacity: .95;
    padding: 4px 8px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    font-size: 12px;
    letter-spacing: .04em;
  }
  @media (max-width: 760px){
    .lm-wrap{ border-radius: 16px; padding: 12px 12px; margin: 12px auto; }
    .lm-title{ font-size: 15px; }
    .lm-pill{ padding: 9px 10px; font-size: 13px; }
    .lm-table{ min-width: 640px; }
  }`;

  function ensureStyle() {
    if (document.getElementById("lm-style")) return;
    const s = document.createElement("style");
    s.id = "lm-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function el(tag, attrs = {}, html = "") {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "style") e.setAttribute("style", v);
      else e.setAttribute(k, v);
    }
    if (html) e.innerHTML = html;
    return e;
  }

  function ensureTopBox() {
    if (document.getElementById("usa-live-box")) return;

    const wrap = el("div", { id: "usa-live-box", class: "lm-wrap" });
    const header = el("div", { class: "lm-row" });

    const title = el(
      "div",
      { class: "lm-title" },
      `<span class="lm-flag">🏅</span><span>Team USA — Live Medals</span>`
    );

    const chip = el("div", { class: "lm-chip" }, `Live from <b>/api/medals</b> • ${POLL_MS / 1000}s`);

    header.appendChild(title);
    header.appendChild(chip);

    const metrics = el("div", { class: "lm-metrics" }, `
      <span class="lm-pill">🥇 <b id="usa-gold">—</b></span>
      <span class="lm-pill">🥈 <b id="usa-silver">—</b></span>
      <span class="lm-pill">🥉 <b id="usa-bronze">—</b></span>
      <span class="lm-pill">Total <b id="usa-total">—</b></span>
    `);

    wrap.appendChild(header);
    wrap.appendChild(metrics);
    wrap.appendChild(el("div", { class: "lm-note" }, `Auto-refreshes every ${POLL_MS / 1000}s.`));

    document.body.insertBefore(wrap, document.body.firstChild);
  }

  function ensureLiveTableContainer() {
    if (document.getElementById("live-medal-table")) return;

    const wrap = el("div", { id: "live-medal-table", class: "lm-wrap" });
    const header = el("div", { class: "lm-row" });

    header.appendChild(
      el("div", { class: "lm-title" }, `<span class="lm-flag">🏆</span><span>Live Medal Table</span>`)
    );
    header.appendChild(el("div", { class: "lm-chip" }, `Auto-refresh: ${POLL_MS / 1000}s`));

    const tableWrap = el("div", { class: "lm-tableWrap" });
    const table = el("table", { class: "lm-table" });
    table.innerHTML = `
      <thead>
        <tr>
          <th class="lm-th">#</th>
          <th class="lm-th">Country</th>
          <th class="lm-th" style="text-align:right">Gold</th>
          <th class="lm-th" style="text-align:right">Silver</th>
          <th class="lm-th" style="text-align:right">Bronze</th>
          <th class="lm-th" style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody id="live-medal-tbody"></tbody>
    `;
    tableWrap.appendChild(table);

    wrap.appendChild(header);
    wrap.appendChild(tableWrap);
    wrap.appendChild(el("div", { class: "lm-note" }, `Tip: the USA row is highlighted.`));

    // place it right under the USA box
    const top = document.getElementById("usa-live-box");
    if (top && top.parentNode) top.parentNode.insertBefore(wrap, top.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);

    // hide old static table if present
    hideOldStaticMedalTable();
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
    const e = document.getElementById(id);
    if (e) e.textContent = String(v);
  }

  function renderTable(rows) {
    const tb = document.getElementById("live-medal-tbody");
    if (!tb) return;
    tb.innerHTML = "";

    for (const r of rows) {
      const isUSA =
        String(r.code || "").toUpperCase() === "USA" ||
        /united states/i.test(String(r.country || ""));

      const tr = el("tr", { class: "lm-tr" + (isUSA ? " lm-usa" : "") });

      tr.appendChild(el("td", { class: "lm-td" }, `${r.rank ?? ""}`));

      const countryCell = el("td", { class: "lm-td" });
      countryCell.appendChild(
        el("div", { class: "lm-country" },
          `<span class="lm-code">${r.code || ""}</span><span>${r.country || ""}</span>`
        )
      );
      tr.appendChild(countryCell);

      tr.appendChild(el("td", { class: "lm-td lm-tdNum" }, `${r.gold ?? 0}`));
      tr.appendChild(el("td", { class: "lm-td lm-tdNum" }, `${r.silver ?? 0}`));
      tr.appendChild(el("td", { class: "lm-td lm-tdNum" }, `${r.bronze ?? 0}`));
      tr.appendChild(el("td", { class: "lm-td lm-tdNum" }, `<b>${r.total ?? 0}</b>`));

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
    } catch (e) {}
  }

  function start() {
    ensureStyle();
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
