(() => {
  const API = "/api/medals";
  const POLL_MS = 30000;

  const css = `
  :root{
    --ice-0: rgba(235,245,255,.08);
    --ice-1: rgba(235,245,255,.12);
    --ice-2: rgba(235,245,255,.18);
    --ice-line: rgba(210,235,255,.22);
    --ice-text: rgba(245,250,255,.94);
    --ice-muted: rgba(245,250,255,.72);
    --ice-muted2: rgba(245,250,255,.55);
    --shadow: 0 18px 70px rgba(0,0,0,.55);
  }

  /* subtle snow grain overlay */
  .lm-snow:before{
    content:"";
    position:absolute; inset:0;
    pointer-events:none;
    opacity:.22;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,.25) 0 1px, transparent 2px),
      radial-gradient(circle at 70% 20%, rgba(255,255,255,.20) 0 1px, transparent 2px),
      radial-gradient(circle at 40% 80%, rgba(255,255,255,.18) 0 1px, transparent 2px),
      radial-gradient(circle at 85% 70%, rgba(255,255,255,.16) 0 1px, transparent 2px);
    background-size: 120px 120px, 160px 160px, 200px 200px, 240px 240px;
    filter: blur(.2px);
    mix-blend-mode: screen;
  }

  .lm-wrap{
    position:relative;
    margin: 16px auto;
    max-width: 980px;
    padding: 16px 16px;
    border: 1px solid var(--ice-line);
    border-radius: 20px;

    /* icy glass */
    background:
      linear-gradient(180deg, rgba(180,220,255,.16), rgba(20,40,70,.25)),
      radial-gradient(1200px 220px at 20% 0%, rgba(120,200,255,.25), transparent 55%),
      radial-gradient(900px 260px at 90% 10%, rgba(160,220,255,.16), transparent 60%),
      rgba(8,14,26,.68);

    box-shadow: var(--shadow);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);

    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    color: var(--ice-text);
  }

  .lm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
  .lm-title{
    font-weight: 950;
    letter-spacing: .3px;
    font-size: 16px;
    display:flex;align-items:center;gap:10px;
  }

  .lm-badge{
    display:inline-flex;align-items:center;gap:8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--ice-line);
    background: rgba(0,0,0,.18);
    color: var(--ice-muted);
    font-size: 12px;
  }

  .lm-flag{
    width: 26px; height: 26px;
    border-radius: 10px;
    display:inline-flex;align-items:center;justify-content:center;
    border: 1px solid var(--ice-line);
    background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
    box-shadow: 0 8px 22px rgba(0,0,0,.35);
  }

  .lm-metrics{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}

  .lm-pill{
    display:inline-flex;align-items:center;gap:10px;
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid var(--ice-line);
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03));
    font-weight: 800;
    font-size: 13px;
  }
  .lm-pill b{
    font-weight: 950;
    font-variant-numeric: tabular-nums;
    letter-spacing:.2px;
  }

  /* medal glow accents */
  .lm-gold{ box-shadow: 0 0 0 1px rgba(255,215,120,.18) inset, 0 10px 28px rgba(255,215,120,.10); }
  .lm-silver{ box-shadow: 0 0 0 1px rgba(220,235,255,.18) inset, 0 10px 28px rgba(220,235,255,.10); }
  .lm-bronze{ box-shadow: 0 0 0 1px rgba(255,185,120,.16) inset, 0 10px 28px rgba(255,185,120,.10); }
  .lm-total{ box-shadow: 0 0 0 1px rgba(140,210,255,.18) inset, 0 10px 28px rgba(140,210,255,.10); }

  .lm-note{
    margin-top:10px;
    font-size:12px;
    color: var(--ice-muted2);
  }

  .lm-tableWrap{
    overflow:auto;
    border-radius: 16px;
    border: 1px solid var(--ice-line);
    background: rgba(0,0,0,.18);
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
    background:
      linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04)),
      rgba(0,0,0,.35);
    backdrop-filter: blur(10px);
    color: rgba(240,248,255,.75);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .14em;
    border-bottom: 1px solid var(--ice-line);
  }

  .lm-td{
    padding: 12px 12px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    color: rgba(245,250,255,.90);
    white-space: nowrap;
  }
  .lm-tdNum{ text-align:right; font-variant-numeric: tabular-nums; }

  .lm-tr:nth-child(odd){ background: rgba(255,255,255,.03); }
  .lm-tr:hover{ background: rgba(255,255,255,.06); }

  .lm-usa{
    background:
      linear-gradient(90deg, rgba(120,200,255,.18), rgba(255,255,255,.03));
    outline: 1px solid rgba(140,210,255,.25);
  }

  .lm-country{display:flex;align-items:center;gap:10px;}
  .lm-code{
    font-weight: 950;
    opacity: .98;
    padding: 4px 8px;
    border-radius: 12px;
    border: 1px solid rgba(210,235,255,.22);
    background: rgba(0,0,0,.18);
    font-size: 12px;
    letter-spacing: .06em;
  }

  @media (max-width: 760px){
    .lm-wrap{ border-radius: 18px; padding: 14px 12px; margin: 12px auto; }
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
      else e.setAttribute(k, v);
    }
    if (html) e.innerHTML = html;
    return e;
  }

  function ensureTopBox() {
    if (document.getElementById("usa-live-box")) return;

    const wrap = el("div", { id: "usa-live-box", class: "lm-wrap lm-snow" });
    const header = el("div", { class: "lm-row" });

    header.appendChild(
      el("div", { class: "lm-title" }, `<span class="lm-flag">❄️</span><span>Team USA — Live Medals</span>`)
    );
    header.appendChild(el("div", { class: "lm-badge" }, `Ice-cold live • ${POLL_MS / 1000}s`));

    const metrics = el("div", { class: "lm-metrics" });
    metrics.appendChild(el("span", { class: "lm-pill lm-gold" }, `🥇 <b id="usa-gold">—</b>`));
    metrics.appendChild(el("span", { class: "lm-pill lm-silver" }, `🥈 <b id="usa-silver">—</b>`));
    metrics.appendChild(el("span", { class: "lm-pill lm-bronze" }, `🥉 <b id="usa-bronze">—</b>`));
    metrics.appendChild(el("span", { class: "lm-pill lm-total" }, `Total <b id="usa-total">—</b>`));

    wrap.appendChild(header);
    wrap.appendChild(metrics);
    wrap.appendChild(el("div", { class: "lm-note" }, `Source: usamedalstoday.com/api/medals`));

    document.body.insertBefore(wrap, document.body.firstChild);
  }

  function ensureLiveTableContainer() {
    if (document.getElementById("live-medal-table")) return;

    const wrap = el("div", { id: "live-medal-table", class: "lm-wrap lm-snow" });
    const header = el("div", { class: "lm-row" });

    header.appendChild(el("div", { class: "lm-title" }, `<span class="lm-flag">🏂</span><span>Live Medal Table</span>`));
    header.appendChild(el("div", { class: "lm-badge" }, `Auto-refresh: ${POLL_MS / 1000}s`));

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
    wrap.appendChild(el("div", { class: "lm-note" }, `USA row is highlighted. Scroll stays smooth. ❄️`));

    const top = document.getElementById("usa-live-box");
    if (top && top.parentNode) top.parentNode.insertBefore(wrap, top.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);

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
        el("div", { class: "lm-country" }, `<span class="lm-code">${r.code || ""}</span><span>${r.country || ""}</span>`)
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
