from pathlib import Path
import re, datetime

p = Path("public/index.html")
html = p.read_text(encoding="utf-8", errors="ignore")

bak = p.with_name(p.name + ".bak.repair." + datetime.datetime.now().strftime("%Y%m%d%H%M%S"))
bak.write_text(html, encoding="utf-8")

JUNK_LINE_PATTERNS = [
    r'curl -sL "https?://[^"]+".*$',
    r'vercel --prod.*$',
    r'@brett-the-jet21.*$',
    r'grep -n ".*?".*$',
    r'\|\|\s*true\b.*$',
    r'\btruetrue\b.*$',
]

def strip_junk_lines(block: str) -> str:
    out = block
    for pat in JUNK_LINE_PATTERNS:
        out = re.sub(pat, "", out, flags=re.M)
    # Remove stray "true==prev.b" type fragments
    out = re.sub(r'\btrue==[a-zA-Z0-9_.]+\b', "", out)
    out = re.sub(r'\btrue\s*\|\s*true\b', "", out)
    return out

def clean_blocks(h: str, tag: str) -> str:
    # tag = 'style' or 'script'
    def repl(m):
        return m.group(1) + strip_junk_lines(m.group(2)) + m.group(3)
    return re.sub(rf'(<{tag}[^>]*>)(.*?)(</{tag}>)', repl, h, flags=re.S|re.I)

def ensure_insert_before(label: str, insert: str, before_regex: str, h: str) -> str:
    if label in h:
        return h
    m = re.search(before_regex, h, flags=re.I|re.S)
    if not m:
        return h
    return h[:m.start()] + insert + "\n" + h[m.start():]

# 0) Clean style + script junk first
h = clean_blocks(html, "style")
h = clean_blocks(h, "script")

# 1) Ensure theme + base CSS exists (do not remove existing, just ensure markers exist)
def ensure_head_css(marker: str, css: str, h: str) -> str:
    if marker in h:
        return h
    return h.replace("</head>", css + "\n</head>")

# Keep your existing theme/table/podium CSS blocks if present; only add missing ones.
# (We rely on your already-inserted CSS markers.)

# 2) Ensure podium markup exists above the table
podium_markup = """<!-- OLYMPIC_PODIUM_MARKUP_START -->
<div class="podium" id="podium"></div>
<!-- OLYMPIC_PODIUM_MARKUP_END -->"""
h = ensure_insert_before("OLYMPIC_PODIUM_MARKUP_START", podium_markup,
                         r'<table\b[^>]*aria-label="Winter Olympics medal count table"[^>]*>', h)

# 3) Ensure USA mega markup exists (insert after badge inside hero)
if "OLYMPIC_USA_MEGA_START" not in h:
    mega = """<!-- OLYMPIC_USA_MEGA_START -->
<div class="hero-grid">
  <div class="usa-mega" id="usaMega">
    <div class="usa-top">
      <div>
        <div class="usa-title">Team USA — Live Total</div>
        <div class="usa-total" id="usaTotal">—</div>
        <div class="usa-sub" id="usaMeta">Reading from medal table…</div>
      </div>
      <div style="text-align:right; color:rgba(255,255,255,.70); font-size:12px;">
        <div style="font-weight:900;">Updated</div>
        <div id="usaUpdated">—</div>
      </div>
    </div>

    <div class="usa-medals">
      <span class="usa-pill"><span class="medal gold"></span><b id="usaGold">—</b> Gold</span>
      <span class="usa-pill"><span class="medal silver"></span><b id="usaSilver">—</b> Silver</span>
      <span class="usa-pill"><span class="medal bronze"></span><b id="usaBronze">—</b> Bronze</span>
      <span class="usa-pill"><span class="m total"></span><b id="usaTotal2">—</b> Total</span>
    </div>
  </div>
  <div></div>
</div>
<!-- OLYMPIC_USA_MEGA_END -->"""
    h = h.replace(
        '<div class="olympic-badge"><span class="olympic-dot"></span> Live updates</div>',
        '<div class="olympic-badge"><span class="olympic-dot"></span> Live updates</div>\n' + mega,
        1
    )

# 4) Ensure medal header icons exist (safe replace)
h = h.replace('<th class="right">Gold</th>',   '<th class="right medalHead"><span class="m gold"></span>Gold</th>')
h = h.replace('<th class="right">Silver</th>', '<th class="right medalHead"><span class="m silver"></span>Silver</th>')
h = h.replace('<th class="right">Bronze</th>', '<th class="right medalHead"><span class="m bronze"></span>Bronze</th>')
h = h.replace('<th class="right">Total</th>',  '<th class="right medalHead"><span class="m total"></span>Total</th>')

# 5) Ensure USA mega JS exists (if missing, append clean version)
if "OLYMPIC_USA_MEGA_JS_START" not in h:
    usa_js = """<!-- OLYMPIC_USA_MEGA_JS_START -->
<script>
(function(){
  function textOf(el){ return (el && el.textContent || "").trim(); }
  function numOfText(t){ var n = parseInt(String(t).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; }
  var prev = {g:null,s:null,b:null,t:null};
  function findUSARow(){
    var body = document.getElementById("tableBody");
    if(!body) return null;
    var rows = Array.from(body.querySelectorAll("tr"));
    for (var i=0;i<rows.length;i++){
      var tds = rows[i].querySelectorAll("td");
      if(tds.length < 6) continue;
      var country = textOf(tds[1]).toLowerCase();
      if(country.includes("united states") || country === "usa" || country.includes("usa")){
        return {tr: rows[i], tds: tds};
      }
    }
    return null;
  }
  function setText(id, v){ var el = document.getElementById(id); if(el) el.textContent = v; }
  function pulseIfChanged(el, changed){
    if(!el || !changed) return;
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }
  function tick(){
    var u = findUSARow();
    if(!u) return;
    var gold = numOfText(textOf(u.tds[2]));
    var silver = numOfText(textOf(u.tds[3]));
    var bronze = numOfText(textOf(u.tds[4]));
    var total = numOfText(textOf(u.tds[5]));
    setText("usaGold", gold);
    setText("usaSilver", silver);
    setText("usaBronze", bronze);
    setText("usaTotal", total);
    setText("usaTotal2", total);
    var now = new Date();
    setText("usaUpdated", now.toLocaleTimeString());
    setText("usaMeta", "Pulled from live table • Rank " + textOf(u.tds[0]));
    var mega = document.getElementById("usaMega");
    var changed = (prev.g !== null) && (gold!==prev.g || silver!==prev.s || bronze!==prev.b || total!==prev.t);
    pulseIfChanged(mega, changed);
    prev = {g:gold,s:silver,b:bronze,t:total};
  }
  tick();
  var body = document.getElementById("tableBody");
  if(body){
    var obs = new MutationObserver(function(){ tick(); });
    obs.observe(body, {childList:true, subtree:true});
  }
  setInterval(tick, 30000);
})();
</script>
<!-- OLYMPIC_USA_MEGA_JS_END -->"""
    h = h.replace("</body>", usa_js + "\n</body>")

# 6) Ensure podium JS exists (if missing, append clean version)
if "OLYMPIC_PODIUM_JS_START" not in h:
    podium_js = """<!-- OLYMPIC_PODIUM_JS_START -->
<script>
(function(){
  function textOf(el){ return (el && el.textContent || "").trim(); }
  function numOf(el){ var n = parseInt(textOf(el).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; }
  function escapeHtml(s){
    return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }
  function build(){
    var body = document.getElementById("tableBody");
    var podium = document.getElementById("podium");
    if(!body || !podium) return;
    var rows = Array.from(body.querySelectorAll("tr"));
    if(rows.length < 3) return;

    function read(tr){
      var tds = tr.querySelectorAll("td");
      if(tds.length < 6) return null;
      return {tr:tr, rank:textOf(tds[0]), country:textOf(tds[1]), gold:numOf(tds[2]), silver:numOf(tds[3]), bronze:numOf(tds[4]), total:numOf(tds[5])};
    }

    var top = rows.slice(0,3).map(read).filter(Boolean);
    if(top.length < 3) return;

    rows.forEach(function(r){
      var d = read(r); if(!d) return;
      var c = d.country.toLowerCase();
      if(c.includes("united states") || c === "usa" || c.includes("usa")) d.tr.classList.add("usa-row");
    });

    var places=[{label:"1st", cls:"gold"},{label:"2nd", cls:"silver"},{label:"3rd", cls:"bronze"}];
    podium.innerHTML = top.map(function(d,i){
      var meta=places[i];
      return '<div class="podium-card">'+
        '<div class="podium-top"><div class="podium-place"><span class="podium-medal '+meta.cls+'"></span>'+meta.label+'</div>'+
        '<div style="color:rgba(255,255,255,.72);font-size:12px;">Rank '+d.rank+'</div></div>'+
        '<div class="podium-country">'+escapeHtml(d.country)+'</div>'+
        '<div class="podium-sub">Gold '+d.gold+' • Silver '+d.silver+' • Bronze '+d.bronze+' • Total '+d.total+'</div>'+
      '</div>';
    }).join("");
  }
  build();
  var body = document.getElementById("tableBody");
  if(body){
    var obs = new MutationObserver(function(){ build(); });
    obs.observe(body, {childList:true, subtree:true});
  }
})();
</script>
<!-- OLYMPIC_PODIUM_JS_END -->"""
    h = h.replace("</body>", podium_js + "\n</body>")

p.write_text(h, encoding="utf-8")
print("✅ Repaired + wrote:", p)
print("✅ Backup saved:", bak)
