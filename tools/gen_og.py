#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph banners in assets/og/ (page-type x locale).

Design language mirrors the site — "academic prospectus": washi cream + 藍 indigo
+ 朱印 seal red, Shippori Mincho (JP) / Newsreader (latin) / IBM Plex Mono (labels),
with the portrait framed on the right. Fonts are subsetted to the exact glyphs used
and embedded, and the portrait is embedded, so headless Chrome renders each banner
pixel-perfect offline.

Requires Google Chrome (headless) and network access to Google Fonts. Re-run when
the wording, portrait, or palette changes, then rebuild with build_site.py.

    ../.venv/bin/python gen_og.py            # all 18
    ../.venv/bin/python gen_og.py index:ja   # one, for a quick preview
"""
from __future__ import annotations
import base64, html, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "og"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
LOCALES = ("ja", "en", "de")
NAME = {"ja": "草間 暁", "en": "Akira Kusama", "de": "Akira Kusama"}

# layout 'name'  => big is the name, sub is the tagline
# layout 'topic' => big is the page topic; a name line is shown below a rule
CONTENT = {
    "index": {"layout": "name",
        "ja": ("PORTFOLIO", "草間 暁", "ソフトウェア開発 · 情報教育 · 研究"),
        "en": ("PORTFOLIO", "Akira Kusama", "Software · Education · Research"),
        "de": ("PORTFOLIO", "Akira Kusama", "Software · Bildung · Forschung")},
    "engineer": {"layout": "topic",
        "ja": ("エンジニア — FOR BUSINESS", "ソフトウェア開発と\nITコンサルティング", ""),
        "en": ("ENGINEER — FOR BUSINESS", "Software Development\n& IT Consulting", ""),
        "de": ("INGENIEUR — FOR BUSINESS", "Softwareentwicklung\n& IT-Beratung", "")},
    "educator": {"layout": "topic",
        "ja": ("教育者 — FOR EDUCATION", "情報教育と\nプログラミング指導", ""),
        "en": ("EDUCATOR — FOR EDUCATION", "Computing Education\n& Programming", ""),
        "de": ("PÄDAGOGE — FOR EDUCATION", "Digitale Bildung &\nProgrammierunterricht", "")},
    "researcher": {"layout": "topic",
        "ja": ("研究者 — FOR ACADEMIA", "情報教育・\n教育工学の研究", ""),
        "en": ("RESEARCHER — FOR ACADEMIA", "Computing Education\n& EdTech Research", ""),
        "de": ("FORSCHER — FOR ACADEMIA", "Bildung &\nBildungstechnologie", "")},
    "profile": {"layout": "topic",
        "ja": ("経歴 — PROFILE", "経歴・案件実績・資格", ""),
        "en": ("PROFILE", "Profile · Projects\n· Credentials", ""),
        "de": ("PROFIL", "Profil · Projekte\n· Qualifikationen", "")},
    "news": {"layout": "topic",
        "ja": ("お知らせ — NEWS", "お知らせ・活動実績", ""),
        "en": ("NEWS", "News & Updates", ""),
        "de": ("AKTUELLES", "Aktuelles & Meldungen", "")},
}


def all_chars() -> str:
    s: set[str] = set()
    for page in CONTENT.values():
        for loc in LOCALES:
            for txt in page[loc]:
                s |= set(txt)
    for v in NAME.values():
        s |= set(v)
    s |= set("ja.a-kusama.com｜|/·—&0123456789"
             "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ")
    s.discard("\n")
    return "".join(sorted(s))


def fetch_css(fam_query: str, text: str) -> str:
    url = ("https://fonts.googleapis.com/css2?family=" + fam_query +
           "&text=" + urllib.parse.quote(text) + "&display=swap")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req).read().decode()


def inline_css(css: str) -> str:
    out = css
    for m in re.finditer(r"url\((https://fonts.gstatic.com[^)]+)\)", css):
        u = m.group(1)
        data = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA})).read()
        out = out.replace(u, "data:font/woff2;base64," + base64.b64encode(data).decode())
    return out


def build_font_css() -> str:
    chars = all_chars()
    return (inline_css(fetch_css("Shippori+Mincho:wght@600;700", chars))
            + inline_css(fetch_css("Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600", chars))
            + inline_css(fetch_css("IBM+Plex+Mono:wght@500", chars)))


def portrait_data_uri() -> str:
    b = (ROOT / "assets" / "akira-kusama.jpg").read_bytes()
    return "data:image/jpeg;base64," + base64.b64encode(b).decode()


PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
{fontcss}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1200px;height:630px}}
body{{position:relative;overflow:hidden;background:#ECEBE4;font-family:'Newsreader',serif;color:#1b2452;}}
.paper{{position:absolute;inset:0;background:
   radial-gradient(120% 140% at 82% 20%, rgba(255,255,255,.55), transparent 55%),
   radial-gradient(100% 120% at 8% 100%, rgba(44,58,134,.06), transparent 60%),#ECEBE4;}}
.frame{{position:absolute;inset:26px;border:1.5px solid rgba(44,58,134,.55);}}
.frame:after{{content:"";position:absolute;inset:6px;border:1px solid rgba(44,58,134,.28);}}
.stage{{position:absolute;inset:26px;display:flex;align-items:stretch;}}
.left{{flex:1;padding:64px 56px 56px;display:flex;flex-direction:column;justify-content:center;}}
.eyebrow{{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:20px;letter-spacing:.18em;
  color:#A83228;text-transform:uppercase;margin-bottom:26px;}}
.big{{font-weight:600;line-height:1.16;color:#1a2350;letter-spacing:.01em;white-space:pre-line;}}
.big.jp{{font-family:'Shippori Mincho',serif;font-weight:700;letter-spacing:.02em;}}
.name .big{{font-size:104px;line-height:1.0;}}
.name .sub{{margin-top:30px;font-size:34px;color:#2C3A86;font-weight:500;}}
.name .sub.jp{{font-family:'Shippori Mincho',serif;}}
.topic .big{{font-size:62px;}}
.rule{{width:88px;height:3px;background:#2C3A86;margin:34px 0 24px;}}
.nameline{{font-family:'Shippori Mincho',serif;font-weight:600;font-size:30px;color:#1a2350;}}
.nameline .en{{font-family:'Newsreader',serif;font-weight:500;color:#2C3A86;}}
.right{{width:360px;position:relative;display:flex;align-items:center;justify-content:center;
  border-left:1.5px solid rgba(44,58,134,.30);}}
.portrait{{position:relative;width:264px;height:352px;}}
.portrait img{{width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:contrast(1.02) saturate(.98);}}
.portrait .pf{{position:absolute;inset:-12px;border:1.5px solid rgba(44,58,134,.5);}}
.seal{{position:absolute;right:-14px;bottom:-14px;width:60px;height:60px;background:#A83228;
  display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.18);}}
.seal span{{font-family:'Shippori Mincho',serif;font-weight:700;color:#F3EFE6;font-size:34px;line-height:1;}}
</style></head><body>
<div class="paper"></div><div class="frame"></div>
<div class="stage">
  <div class="left {layout}"><div class="eyebrow">{eyebrow}</div>{mainblock}</div>
  <div class="right"><div class="portrait"><div class="pf"></div><img src="{portrait}" alt=""><div class="seal"><span>暁</span></div></div></div>
</div></body></html>"""


def main() -> None:
    only = sys.argv[1] if len(sys.argv) > 1 else None
    OUT.mkdir(parents=True, exist_ok=True)
    print("fetching + embedding fonts…", flush=True)
    fontcss = build_font_css()
    portrait = portrait_data_uri()
    targets = [(p, l) for p in CONTENT for l in LOCALES]
    if only:
        p, l = only.split(":"); targets = [(p, l)]
    with tempfile.TemporaryDirectory() as tmp:
        for page, loc in targets:
            layout = CONTENT[page]["layout"]
            eyebrow, big, sub = CONTENT[page][loc]
            jpcls = "jp" if loc == "ja" else ""
            if layout == "name":
                mainblock = (f'<div class="big {jpcls}">{html.escape(big)}</div>'
                             f'<div class="sub {jpcls}">{html.escape(sub)}</div>')
            else:
                nameline = ('<div class="nameline">草間 暁 <span class="en">· Akira Kusama</span></div>'
                            if loc == "ja" else
                            '<div class="nameline"><span class="en">Akira Kusama</span> · 草間 暁</div>')
                mainblock = (f'<div class="big {jpcls}">{html.escape(big)}</div>'
                             f'<div class="rule"></div>{nameline}')
            doc = PAGE.format(fontcss=fontcss, layout=layout, eyebrow=html.escape(eyebrow),
                              mainblock=mainblock, portrait=portrait)
            htmlpath = Path(tmp) / f"{page}_{loc}.html"
            htmlpath.write_text(doc, encoding="utf-8")
            pngpath = Path(tmp) / f"{page}-{loc}.png"
            subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
                            "--force-device-scale-factor=1", "--hide-scrollbars",
                            "--window-size=1200,630", "--virtual-time-budget=2000",
                            f"--screenshot={pngpath}", htmlpath.as_uri()],
                           check=True, capture_output=True)
            jpg = OUT / f"{page}-{loc}.jpg"
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "78",
                            str(pngpath), "--out", str(jpg)], check=True, capture_output=True)
            print("wrote", jpg.name, flush=True)
    print("done —", len(targets), "banner(s). Now run build_site.py.")


if __name__ == "__main__":
    main()
