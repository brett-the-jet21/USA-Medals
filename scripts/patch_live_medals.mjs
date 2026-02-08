import fs from "fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

// Remove any prior injected block
html = html.replace(/\n<!-- LIVE_MEDALS_START -->[\s\S]*?<!-- LIVE_MEDALS_END -->\n/g, "\n");

const block = `
<!-- LIVE_MEDALS_START -->
<div id="liveMedalsWrap" style="max-width:1100px;margin:24px auto;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.25)">
  <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px">
    <div>
      <div style="font-size:18px;font-weight:700">LIVE Medal Table (Source: Wikipedia)</div>
      <div style="opacity:.85;font-size:12px">Updated: <span id="liveMedalsUpdated">—</span></div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <input id="liveMedalsSearch" placeholder="Search country…" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff;outline:none" />
      <select id="liveMedalsSort" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff;outline:none">
        <option value="gold">Sort: Gold</option>
        <option value="total">Sort: Total</option>
      </select>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:left;width:60px;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Rank</th>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:left;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Country</th>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right;width:90px;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Gold</th>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right;width:90px;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Silver</th>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right;width:90px;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Bronze</th>
        <th style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right;width:90px;opacity:.85;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Total</th>
      </tr>
    </thead>
    <tbody id="liveMedalsBody">
      <tr><td colspan="6" style="padding:10px 8px">Loading…</td></tr>
    </tbody>
  </table>

  <div id="liveMedalsErr" style="margin-top:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,120,120,.35);background:rgba(255,0,0,.08);display:none"></div>
</div>

<script>
(() => {
  const WIKI_URL = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Winter_Olympics_medal_table&prop=wikitext&format=json&origin=*";

  function parseRows(wt) {
    const rows = [];
    const re = /\\|\\-\\s*\\n\\|\\s*([^\\n\\|]+?)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)\\s*\\|\\|\\s*(\\d+)/g;
    let m;
    while ((m = re.exec(wt)) !== null) {
      const country = m[1].replace(/\\[\\[|\\]\\]/g, "").trim();
      rows.push({ country, gold:+m[2], silver:+m[3], bronze:+m[4], total:+m[5] });
    }
    return rows;
  }

  function setUpdated(t){ const el=document.getElementById("liveMedalsUpdated"); if(el) el.textContent=t; }
  function showErr(msg){ const el=document.getElementById("liveMedalsErr"); if(!el) return; el.style.display="block"; el.textContent=msg; }

  function render(rows){
    const body=document.getElementById("liveMedalsBody"); if(!body) return;
    const q=(document.getElementById("liveMedalsSearch")?.value||"").trim().toLowerCase();
    const sort=(document.getElementById("liveMedalsSort")?.value||"gold");
    let list=rows;
    if(q) list=rows.filter(r=>r.country.toLowerCase().includes(q));
    list=list.slice().sort((a,b)=>{
      if(sort==="total"){
        if(b.total!==a.total) return b.total-a.total;
        if(b.gold!==a.gold) return b.gold-a.gold;
        return b.silver-a.silver;
      }
      if(b.gold!==a.gold) return b.gold-a.gold;
      if(b.silver!==a.silver) return b.silver-a.silver;
      if(b.bronze!==a.bronze) return b.bronze-a.bronze;
      return b.total-a.total;
    });

    body.innerHTML="";
    if(!list.length){ body.innerHTML='<tr><td colspan="6" style="padding:10px 8px">No matches.</td></tr>'; return; }

    list.forEach((r,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML = `
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right">${i+1}</td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:left">${r.country}</td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right">${r.gold}</td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right">${r.silver}</td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right">${r.bronze}</td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.10);text-align:right"><b>${r.total}</b></td>
      `;
      body.appendChild(tr);
    });
  }

  let cache=[];
  async function tick(){
    try{
      const r=await fetch(WIKI_URL,{cache:"no-store"});
      if(!r.ok) throw new Error("HTTP "+r.status);
      const j=await r.json();
      const wt=j?.parse?.wikitext?.["*"]||"";
      cache=parseRows(wt);
      setUpdated("OK "+new Date().toLocaleString());
      render(cache);
    }catch(e){
      setUpdated("ERR "+new Date().toLocaleString());
      showErr("Fetch blocked/failed (often CSP blocks https://en.wikipedia.org). Error: "+(e?.message||e));
      console.warn(e);
    }
  }

  document.getElementById("liveMedalsSearch")?.addEventListener("input",()=>render(cache));
  document.getElementById("liveMedalsSort")?.addEventListener("change",()=>render(cache));
  tick(); setInterval(tick, 30000);
})();
</script>
<!-- LIVE_MEDALS_END -->
`;

// Insert before closing </body> (case-insensitive)
if (!/<\/body>/i.test(html)) {
  console.error("ERROR: </body> not found");
  process.exit(1);
}
html = html.replace(/<\/body>/i, block + "\n</body>");

fs.writeFileSync(file, html, "utf8");
console.log("✅ Patched", file);
