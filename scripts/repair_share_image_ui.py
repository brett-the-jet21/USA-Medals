from pathlib import Path
import re, datetime

p = Path("public/index.html")
h = p.read_text(encoding="utf-8", errors="ignore")

bak = p.with_name(p.name + ".bak.shareimgfix." + datetime.datetime.now().strftime("%Y%m%d%H%M%S"))
bak.write_text(h, encoding="utf-8")
print("✅ Backup:", bak)

JUNK = [
  r'curl -sL "https?://[^"]+".*$',
  r'vercel --prod.*$',
  r'@brett-the-jet21.*$',
  r'grep -n ".*?".*$',
  r'\|\|\s*true\b.*$',
  r'\btruetrue\b.*$',
]

def scrub_lines(txt: str) -> str:
  out = txt
  for pat in JUNK:
    out = re.sub(pat, "", out, flags=re.M)
  out = re.sub(r'\btruetrue\b', "", out)
  out = out.replace("btn.disabled = True;", "btn.disabled = true;")
  return out

def scrub_tag(html: str, tag: str) -> str:
  def repl(m):
    return m.group(1) + scrub_lines(m.group(2)) + m.group(3)
  return re.sub(rf'(<{tag}[^>]*>)(.*?)(</{tag}>)', repl, html, flags=re.S|re.I)

h2 = scrub_tag(h, "style")
h2 = scrub_tag(h2, "script")

# belt + suspenders: scrub stray junk anywhere
h2 = scrub_lines(h2)

if h2 != h:
  p.write_text(h2, encoding="utf-8")
  print("✅ Cleaned paste junk + fixed JS boolean")
else:
  print("✅ No changes needed")

print("✅ Wrote:", p)
