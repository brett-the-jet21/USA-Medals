from pathlib import Path
import re, datetime

p = Path("public/index.html")
h = p.read_text(encoding="utf-8", errors="ignore")

bak = p.with_name(p.name + ".bak.shareimg." + datetime.datetime.now().strftime("%Y%m%d%H%M%S"))
bak.write_text(h, encoding="utf-8")
print("✅ Backup:", bak)

# 1) Upgrade sharebar markup to have two buttons (idempotent)
if "OLYMPIC_SHARE_IMAGE_MARKUP_START" not in h:
    # Replace existing single button block if present
    h = h.replace(
        '<button class="btn-share" id="sharePodiumBtn" type="button">Share Top 3</button>',
        '<!-- OLYMPIC_SHARE_IMAGE_MARKUP_START -->\n'
        '<button class="btn-share" id="copyPodiumImgBtn" type="button">Copy Image</button>\n'
        '<button class="btn-share" id="downloadPodiumImgBtn" type="button">Download PNG</button>\n'
        '<!-- OLYMPIC_SHARE_IMAGE_MARKUP_END -->'
    )
    print("✅ Upgraded share buttons markup")
else:
    print("✅ Share buttons markup already upgraded")

# 2) Add CSS for dual buttons (idempotent)
if "OLYMPIC_SHARE_IMAGE_STYLE_START" not in h:
    css = """
<!-- OLYMPIC_SHARE_IMAGE_STYLE_START -->
<style>
.sharebar{
  margin-top:10px;
  display:flex;
  justify-content:flex-end;
  gap:10px;
  flex-wrap:wrap;
}
.btn-share{
  cursor:pointer;
  border:1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.90);
  padding:10px 12px;
  border-radius:12px;
  font-weight:900;
  letter-spacing:.2px;
}
.btn-share:hover{ background: rgba(255,255,255,.10); }
.btn-share:disabled{
  opacity:.55;
  cursor:not-allowed;
}
</style>
<!-- OLYMPIC_SHARE_IMAGE_STYLE_END -->
"""
    h = h.replace("</head>", css + "\n</head>")
    print("✅ Added share image CSS")
else:
    print("✅ Share image CSS already present")

# 3) Replace the existing sharePodium() text-only function with image generation (idempotent)
if "OLYMPIC_SHARE_IMAGE_JS_START" not in h:
    # Insert new JS near the final polish JS (append before </body>)
    js = """
<!-- OLYMPIC_SHARE_IMAGE_JS_START -->
<script>
(function(){
  function $(id){ return document.getElementById(id); }
  function textOf(el){ return (el && el.textContent || "").trim(); }
  function safeNum(t){ var n = parseInt(String(t).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; }

  function readTop3(){
    var body = document.getElementById("tableBody");
    if(!body) return [];
    var rows = Array.from(body.querySelectorAll("tr")).slice(0,3);
    return rows.map(function(r){
      var tds = r.querySelectorAll("td");
      if(tds.length < 6) return null;
      return {
        rank: textOf(tds[0]),
        country: textOf(tds[1]),
        gold: safeNum(textOf(tds[2])),
        silver: safeNum(textOf(tds[3])),
        bronze: safeNum(textOf(tds[4])),
        total: safeNum(textOf(tds[5]))
      };
    }).filter(Boolean);
  }

  function readUSA(){
    var body = document.getElementById("tableBody");
    if(!body) return null;
    var rows = Array.from(body.querySelectorAll("tr"));
    for(var i=0;i<rows.length;i++){
      var tds = rows[i].querySelectorAll("td");
      if(tds.length < 6) continue;
      var c = textOf(tds[1]).toLowerCase();
      if(c.includes("united states") || c === "usa" || c.includes("usa")){
        return {
          rank: textOf(tds[0]),
          gold: safeNum(textOf(tds[2])),
          silver: safeNum(textOf(tds[3])),
          bronze: safeNum(textOf(tds[4])),
          total: safeNum(textOf(tds[5]))
        };
      }
    }
    return null;
  }

  function roundRect(ctx, x, y, w, h, r){
    var rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  function drawRing(ctx, x, y, color){
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI*2);
    ctx.stroke();
  }

  async function buildShareImage(){
    var top = readTop3();
    var usa = readUSA();

    // 1200x630 is perfect for social cards
    var W = 1200, H = 630;
    var canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");

    // Background gradient
    var g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, "#070b16");
    g.addColorStop(1, "#0b1220");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // Subtle stadium light
    var rg = ctx.createRadialGradient(200,0,10, 200,0,520);
    rg.addColorStop(0, "rgba(255,255,255,0.18)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0,0,W,H);

    // Title
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 46px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("USA Medal Count Today", 60, 88);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 22px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Milano Cortina 2026 • Live medal table", 60, 126);

    // Rings
    drawRing(ctx, 930, 76, "#0085C7"); // blue
    drawRing(ctx, 990, 76, "#000000"); // black
    drawRing(ctx, 1050, 76, "#DF0024"); // red
    drawRing(ctx, 960, 115, "#F4C300"); // yellow
    drawRing(ctx, 1020, 115, "#009F3D"); // green

    // Cards area
    var cardY = 170;
    var cardH = 280;
    var gap = 22;
    var cardW = Math.floor((W - 60*2 - gap*2) / 3);

    function medalColor(place){
      if(place===1) return "rgba(212,175,55,0.95)";
      if(place===2) return "rgba(191,199,213,0.95)";
      return "rgba(184,115,51,0.95)";
    }

    function drawCard(i, data){
      var x = 60 + i*(cardW+gap);
      // card background
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 2;
      roundRect(ctx, x, cardY, cardW, cardH, 22);
      ctx.fill(); ctx.stroke();

      // place medal dot
      ctx.fillStyle = medalColor(i+1);
      ctx.beginPath();
      ctx.arc(x+28, cardY+34, 10, 0, Math.PI*2);
      ctx.fill();

      // place label
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "900 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText((i+1)+"st".replace("1st","1st").replace("2st","2nd").replace("3st","3rd"), x+48, cardY+42);

      // country
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "950 30px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      var country = data ? data.country : "—";
      ctx.fillText(country.slice(0, 20), x+24, cardY+92);

      // stats
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.font = "800 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      var line = data ? ("G "+data.gold+" • S "+data.silver+" • B "+data.bronze+" • T "+data.total) : "Loading…";
      ctx.fillText(line, x+24, cardY+128);

      // footer
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("Top 3 overall", x+24, cardY+cardH-24);
    }

    for(var i=0;i<3;i++){
      drawCard(i, top[i]);
    }

    // USA strip
    var stripY = 480;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    roundRect(ctx, 60, stripY, W-120, 110, 22);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "950 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("USA snapshot", 84, stripY+40);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "800 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    var usaLine = usa
      ? ("Rank #"+usa.rank+" • "+usa.gold+"G  "+usa.silver+"S  "+usa.bronze+"B  •  Total "+usa.total)
      : "USA row not found yet";
    ctx.fillText(usaLine, 84, stripY+74);

    // Timestamp + URL
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    var now = new Date();
    ctx.fillText("Generated " + now.toLocaleString(), 84, stripY+100);
    ctx.fillText(location.href, 620, stripY+100);

    return canvas;
  }

  async function canvasToPngBlob(canvas){
    return await new Promise(function(resolve){
      canvas.toBlob(function(b){ resolve(b); }, "image/png", 1.0);
    });
  }

  async function copyImage(){
    var btn = $("copyPodiumImgBtn");
    if(btn) btn.disabled = True;
  }

  async function onCopy(){
    var btn = $("copyPodiumImgBtn");
    if(btn){ btn.disabled = true; btn.textContent = "Copying…"; }
    try{
      var canvas = await buildShareImage();
      var blob = await canvasToPngBlob(canvas);

      if(navigator.clipboard && window.ClipboardItem){
        await navigator.clipboard.write([ new ClipboardItem({ "image/png": blob }) ]);
        if(btn) btn.textContent = "Copied!";
        setTimeout(function(){ if(btn){ btn.textContent="Copy Image"; btn.disabled=false; } }, 1200);
      } else {
        // fallback: download if copy unsupported
        await onDownload(true);
        if(btn) btn.textContent = "Downloaded";
        setTimeout(function(){ if(btn){ btn.textContent="Copy Image"; btn.disabled=false; } }, 1200);
      }
    } catch(e){
      if(btn){ btn.textContent="Copy failed"; }
      setTimeout(function(){ if(btn){ btn.textContent="Copy Image"; btn.disabled=false; } }, 1400);
    }
  }

  async function onDownload(silent){
    var btn = $("downloadPodiumImgBtn");
    if(btn && !silent){ btn.disabled = true; btn.textContent = "Preparing…"; }
    try{
      var canvas = await buildShareImage();
      var blob = await canvasToPngBlob(canvas);
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "usa-medals-top3.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if(btn && !silent){ btn.textContent = "Downloaded"; setTimeout(function(){ btn.textContent="Download PNG"; btn.disabled=false; }, 1200); }
    } catch(e){
      if(btn && !silent){ btn.textContent="Download failed"; setTimeout(function(){ btn.textContent="Download PNG"; btn.disabled=false; }, 1400); }
    }
  }

  var copyBtn = $("copyPodiumImgBtn");
  var dlBtn = $("downloadPodiumImgBtn");
  if(copyBtn) copyBtn.addEventListener("click", onCopy);
  if(dlBtn) dlBtn.addEventListener("click", function(){ onDownload(false); });
})();
</script>
<!-- OLYMPIC_SHARE_IMAGE_JS_END -->
"""
    h = h.replace("</body>", js + "\n</body>")
    print("✅ Added share-image JS (copy + download)")
else:
    print("✅ Share-image JS already present")

p.write_text(h, encoding="utf-8")
print("✅ Wrote:", p)
