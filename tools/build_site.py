#!/usr/bin/env python3
"""Build localized HTML variants and search/social discovery files."""
from __future__ import annotations

import hashlib
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

from build_news import collect_news, write_index

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://ja.a-kusama.com"

# Assets that carry a content-hash ?v= query so browsers never serve a stale
# copy after a rebuild (a stale site.js was generating broken article links).
VERSIONED_ASSETS = ("site.js", "data.js", "news-data.js", "locale.js", "style.css")


def asset_version() -> str:
    digest = hashlib.sha1()
    for name in VERSIONED_ASSETS:
        path = ROOT / "assets" / name
        if path.exists():
            digest.update(path.read_bytes())
    return digest.hexdigest()[:8]


def version_assets(text: str, version: str) -> str:
    return re.sub(r'(/assets/[\w.-]+\.(?:js|css))(?!\?)', rf"\1?v={version}", text)
PAGES = ["index.html", "engineer.html", "educator.html", "researcher.html", "profile.html", "news.html", "release.html"]
LOCALES = ("ja", "en", "de")

META = {
    "index.html": {
        "ja": ("草間 暁｜ソフトウェア開発・情報教育・研究", "草間 暁の公式ポートフォリオ。ソフトウェア開発、ITコンサルティング、情報教育、教育工学研究の経歴・実績・お知らせを紹介します。"),
        "en": ("Akira Kusama | Software, Education & Research", "Official portfolio of Akira Kusama: software development, IT consulting, computing education, educational technology research, experience, and news."),
        "de": ("Akira Kusama | Software, Bildung & Forschung", "Offizielles Portfolio von Akira Kusama: Softwareentwicklung, IT-Beratung, digitale Bildung, bildungstechnologische Forschung, Erfahrung und Aktuelles."),
    },
    "engineer.html": {
        "ja": ("ソフトウェア開発・ITコンサルティング｜草間 暁", "要件定義から設計、実装、インフラ、保守運用まで。Laravel、Ruby on Rails、OSSを活用した草間 暁のソフトウェア開発実績と対応領域。"),
        "en": ("Software Development & IT Consulting | Akira Kusama", "Software development from requirements and architecture to implementation, infrastructure, and operations, using Laravel, Ruby on Rails, and open-source platforms."),
        "de": ("Softwareentwicklung & IT-Beratung | Akira Kusama", "Softwareentwicklung von Anforderungen und Architektur bis Implementierung, Infrastruktur und Betrieb mit Laravel, Ruby on Rails und Open-Source-Plattformen."),
    },
    "educator.html": {
        "ja": ("情報教育・プログラミング指導｜草間 暁", "高等学校情報科の教育職員免許を持つ草間 暁の教育活動。情報I、プログラミング、オンラインコーチングの指導歴と対応領域を紹介します。"),
        "en": ("Computing Education & Programming Instruction | Akira Kusama", "Teaching experience in computing, programming, Information I, and online coaching by Akira Kusama, a licensed upper-secondary computing educator in Japan."),
        "de": ("Digitale Bildung & Programmierunterricht | Akira Kusama", "Lehrerfahrung in Informatik, Programmierung und Online-Coaching von Akira Kusama mit japanischer Lehrbefähigung für Informatik an Oberschulen."),
    },
    "researcher.html": {
        "ja": ("情報教育・教育工学研究｜草間 暁", "北陸先端科学技術大学院大学で情報教育、教育工学、ソフトウェア、情報セキュリティを研究する草間 暁の研究関心と学術プロフィール。"),
        "en": ("Research in Computing Education & Educational Technology | Akira Kusama", "Research interests and academic profiles of Akira Kusama at JAIST, spanning computing education, educational technology, software, and information security."),
        "de": ("Forschung zu digitaler Bildung & Bildungstechnologie | Akira Kusama", "Forschungsinteressen und akademische Profile von Akira Kusama am JAIST zu digitaler Bildung, Bildungstechnologie, Software und Informationssicherheit."),
    },
    "profile.html": {
        "ja": ("経歴・案件実績・資格｜草間 暁", "草間 暁の職歴、学歴、ソフトウェア開発案件、教育実績、資格、受賞、国際交流をまとめたプロフィール。技術や参画期間で実績を検索できます。"),
        "en": ("Profile, Projects & Credentials | Akira Kusama", "Akira Kusama’s professional and academic background, software projects, teaching experience, credentials, awards, and international experience."),
        "de": ("Profil, Projekte & Qualifikationen | Akira Kusama", "Beruflicher und akademischer Werdegang, Softwareprojekte, Lehrerfahrung, Qualifikationen, Auszeichnungen und internationale Erfahrung von Akira Kusama."),
    },
    "news.html": {
        "ja": ("お知らせ・活動実績｜草間 暁", "草間 暁の活動、教育、研究、資格、受賞に関する最新のお知らせ。タグ、公開年、公開月で絞り込んで確認できます。"),
        "en": ("News & Professional Updates | Akira Kusama", "News about Akira Kusama’s software, education, research, credentials, and awards. Filter updates by category, publication year, and month."),
        "de": ("Aktuelles & berufliche Meldungen | Akira Kusama", "Neuigkeiten zu Software, Bildung, Forschung, Qualifikationen und Auszeichnungen von Akira Kusama, filterbar nach Kategorie, Jahr und Monat."),
    },
    "release.html": {
        "ja": ("お知らせ詳細｜草間 暁", "草間 暁の活動、教育、研究、資格、受賞に関するお知らせの詳細です。"),
        "en": ("News Article | Akira Kusama", "An update about Akira Kusama’s work in software, education, research, credentials, or awards."),
        "de": ("Meldung | Akira Kusama", "Eine Meldung zu Akira Kusamas Arbeit in Software, Bildung, Forschung, Qualifikationen oder Auszeichnungen."),
    },
}


def url_for(page: str, locale: str) -> str:
    prefix = "" if locale == "ja" else f"/{locale}"
    tail = "/" if page == "index.html" else f"/{page.removesuffix('.html')}/"
    return BASE + prefix + tail


def seo_block(page: str, locale: str) -> str:
    title, description = META[page][locale]
    canonical = url_for(page, locale)
    alternates = "\n".join(
        f'<link rel="alternate" hreflang="{code}" href="{url_for(page, code)}">' for code in LOCALES
    ) + f'\n<link rel="alternate" hreflang="x-default" href="{url_for(page, "ja")}">'
    og_locale = {"ja": "ja_JP", "en": "en_US", "de": "de_DE"}[locale]
    og_alts = "\n".join(
        f'<meta property="og:locale:alternate" content="{value}">' for code, value in {"ja":"ja_JP","en":"en_US","de":"de_DE"}.items() if code != locale
    )
    image_alt = {
        "ja": "ソフトウェア開発者・教育者・研究者、草間 暁のポートレート",
        "en": "Portrait of Akira Kusama, software developer, educator, and researcher",
        "de": "Porträt von Akira Kusama, Softwareentwickler, Pädagoge und Forscher",
    }[locale]
    page_type = "CollectionPage" if page == "news.html" else ("ProfilePage" if page in {"index.html", "profile.html"} else "WebPage")
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person", "@id": BASE + "/#person", "name": "Akira Kusama", "alternateName": "草間 暁",
                "url": BASE + "/", "image": BASE + "/assets/akira-kusama.jpg",
                "jobTitle": ["Software Developer", "Educator", "Researcher"],
                "sameAs": ["https://github.com/kackey621", "https://jp.linkedin.com/in/akira-kusama", "https://www.instagram.com/akirakusama/", "https://x.com/akirakusamajp"],
                "knowsAbout": ["Software Development", "IT Consulting", "Computing Education", "Educational Technology", "Information Security"],
            },
            {"@type": page_type, "@id": canonical + "#page", "url": canonical, "name": title, "description": description, "inLanguage": locale, "about": {"@id": BASE + "/#person"}},
            {"@type": "WebSite", "@id": BASE + "/#website", "url": BASE + "/", "name": "Akira Kusama", "alternateName": "草間 暁", "inLanguage": list(LOCALES)},
        ],
    }
    robots = "noindex,follow" if page == "release.html" else "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    return f'''<!-- SEO:START -->
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canonical}">
{alternates}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="image_src" href="{BASE}/assets/akira-kusama.jpg">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{html.escape(description, quote=True)}">
<meta property="og:type" content="{'profile' if page == 'index.html' else 'website'}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Akira Kusama">
<meta property="og:locale" content="{og_locale}">
{og_alts}
<meta property="og:image" content="{BASE}/assets/akira-kusama.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="828">
<meta property="og:image:height" content="1104">
<meta property="og:image:alt" content="{html.escape(image_alt, quote=True)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{html.escape(title, quote=True)}">
<meta name="twitter:description" content="{html.escape(description, quote=True)}">
<meta name="twitter:image" content="{BASE}/assets/akira-kusama.jpg">
<meta name="twitter:image:alt" content="{html.escape(image_alt, quote=True)}">
<script type="application/ld+json">{json.dumps(graph, ensure_ascii=False, separators=(',', ':'))}</script>
<!-- SEO:END -->'''


def strip_old_seo(text: str) -> str:
    text = re.sub(r"\n?<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->\n?", "\n", text)
    text = re.sub(r'\n?<meta property="og:[^"]+"[^>]*>', "", text)
    text = re.sub(r'\n?<meta name="twitter:[^"]+"[^>]*>', "", text)
    text = re.sub(r'\n?<link rel="(?:canonical|alternate|image_src|icon|manifest)"[^>]*>', "", text)
    return text


def prepare(text: str, page: str, locale: str) -> str:
    text = strip_old_seo(text)
    title, description = META[page][locale]
    text = re.sub(r'<html lang="[^"]+">', f'<html lang="{locale}">', text, count=1)
    text = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)}</title>", text, count=1)
    text = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(description, quote=True)}">', text, count=1)
    text = re.sub(r'((?:href|src)=")(?:\./|\.\./)*assets/', r'\1/assets/', text)
    def page_link(match):
        return 'href="' + urlsplit(url_for(match[1], locale)).path + match[2] + '"'
    text = re.sub(r'href="([a-z]+\.html)([^"]*)"', page_link, text)
    text = text.replace("</head>", seo_block(page, locale) + "\n</head>", 1)
    text = text.replace('<script src="/assets/site.js"></script>', '<script src="/assets/news-data.js"></script>\n<script src="/assets/site.js"></script>')
    if locale != "ja":
        text = text.replace('<script src="/assets/site.js"></script>', '<script src="/assets/site.js"></script>\n<script src="/assets/locale.js"></script>')
    return text

def build_sitemap(news_index: list[dict]) -> str:
    rows=[]
    for page in PAGES[:-1]:
        for locale in LOCALES:
            links="".join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{html.escape(url_for(page,code))}"/>' for code in LOCALES)
            links+=f'<xhtml:link rel="alternate" hreflang="x-default" href="{html.escape(url_for(page,"ja"))}"/>'
            rows.append(f'<url><loc>{html.escape(url_for(page,locale))}</loc><lastmod>2026-09-08</lastmod>{links}</url>')
    for article in news_index:
        slug=article["slug"]
        lastmod=article.get("updated") or article.get("date") or "2026-09-08"
        article_urls={code:BASE+("" if code=="ja" else "/"+code)+f"/news/{slug}/" for code in LOCALES}
        links="".join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{html.escape(article_urls[code])}"/>' for code in LOCALES)
        links+=f'<xhtml:link rel="alternate" hreflang="x-default" href="{html.escape(article_urls["ja"])}"/>'
        for locale in LOCALES:
            rows.append(f'<url><loc>{html.escape(article_urls[locale])}</loc><lastmod>{html.escape(lastmod)}</lastmod>{links}</url>')
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+'\n'.join(rows)+'\n</urlset>\n'


def article_page(article: dict, locale: str, document: dict) -> str:
    slug = article["slug"]
    fields = document["translations"][locale]
    title, tag, description = fields["title"], fields["tag"], fields["description"]
    prefix = "/"
    locale_root = "" if locale == "ja" else f"/{locale}"
    canonical = f"{BASE}{locale_root}/news/{slug}/"
    article_urls = {code: BASE + ("" if code == "ja" else "/" + code) + f"/news/{slug}/" for code in LOCALES}
    og_locale={"ja":"ja_JP","en":"en_US","de":"de_DE"}[locale]
    og_alternates="\n".join(f'<meta property="og:locale:alternate" content="{value}">' for code,value in {"ja":"ja_JP","en":"en_US","de":"de_DE"}.items() if code!=locale)
    image_alt={"ja":"ソフトウェア開発者・教育者・研究者、草間 暁のポートレート","en":"Portrait of Akira Kusama, software developer, educator, and researcher","de":"Porträt von Akira Kusama, Softwareentwickler, Pädagoge und Forscher"}[locale]
    ui={"ja":{"skip":"本文へスキップ","crumb":"パンくず","news":"お知らせ","published":"公開","updated":"更新","back":"お知らせ一覧へ戻る"},"en":{"skip":"Skip to content","crumb":"Breadcrumb","news":"News","published":"Published","updated":"Updated","back":"Back to news"},"de":{"skip":"Zum Inhalt springen","crumb":"Brotkrümelnavigation","news":"Aktuelles","published":"Veröffentlicht","updated":"Aktualisiert","back":"Zurück zu Aktuelles"}}[locale]
    alternates="\n".join(f'<link rel="alternate" hreflang="{code}" href="{article_urls[code]}">' for code in LOCALES)+f'\n<link rel="alternate" hreflang="x-default" href="{article_urls["ja"]}">' 
    graph={"@context":"https://schema.org","@type":"BlogPosting","@id":canonical+"#article","url":canonical,"headline":title,"description":description,"inLanguage":locale,"datePublished":article.get("date"),"dateModified":article.get("updated") or article.get("date"),"image":BASE+"/assets/akira-kusama.jpg","author":{"@type":"Person","@id":BASE+"/#person","name":"Akira Kusama","url":BASE+"/"},"publisher":{"@id":BASE+"/#person"},"mainEntityOfPage":{"@type":"WebPage","@id":canonical}}
    updated=(f'<span><b>{ui["updated"]}</b> <time datetime="{html.escape(article["updated"])}">{html.escape(article["updated"].replace("-","."))}</time></span>' if article.get("updated") and article.get("updated")!=article.get("date") else "")
    body=fields["body"]
    return f'''<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)} — Akira Kusama</title>
<meta name="description" content="{html.escape(description,quote=True)}">
<meta name="theme-color" content="#ECEBE4">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&amp;family=Shippori+Mincho:wght@400;500;600;700&amp;family=Noto+Sans+JP:wght@400;500;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="{prefix}assets/style.css">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="{canonical}">
{alternates}
<link rel="icon" href="{prefix}assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="{prefix}site.webmanifest">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(title,quote=True)}">
<meta property="og:description" content="{html.escape(description,quote=True)}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Akira Kusama">
<meta property="og:locale" content="{og_locale}">
{og_alternates}
<meta property="og:image" content="{BASE}/assets/akira-kusama.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="828"><meta property="og:image:height" content="1104">
<meta property="og:image:alt" content="{html.escape(image_alt,quote=True)}">
<meta property="article:published_time" content="{html.escape(article.get('date',''))}">
<meta property="article:modified_time" content="{html.escape(article.get('updated') or article.get('date',''))}">
<meta property="article:section" content="{html.escape(tag,quote=True)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{html.escape(title,quote=True)}">
<meta name="twitter:description" content="{html.escape(description,quote=True)}">
<meta name="twitter:image" content="{BASE}/assets/akira-kusama.jpg">
<meta name="twitter:image:alt" content="{html.escape(image_alt,quote=True)}">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False,separators=(',',':'))}</script>
</head>
<body>
<a class="skip" href="#main">{ui['skip']}</a>
<header id="site-header"></header>
<main id="main" data-no-translate>
  <div class="page-hero"><div class="wrap-narrow">
    <nav class="breadcrumb" aria-label="{ui['crumb']}"><a href="{locale_root}/">Home</a><span class="sep">/</span><a href="{locale_root}/news/">{ui['news']}</a><span class="sep">/</span><span>{html.escape(title)}</span></nav>
    <div class="release-tag">{html.escape(tag)}</div>
    <h1 class="page-title">{html.escape(title)}</h1>
    <div class="release-meta"><span><b>{ui['published']}</b> <time datetime="{html.escape(article.get('date',''))}">{html.escape(article.get('date','').replace('-','.'))}</time></span>{updated}</div>
  </div></div>
  <article class="article"><div class="wrap-narrow"><div class="md-body">{body}</div><p style="margin-top:40px"><a class="sec-more-link" href="{locale_root}/news/">← {ui['back']}</a></p></div></article>
</main>
<footer id="site-footer"></footer>
<script src="{prefix}assets/data.js"></script>
<script src="{prefix}assets/site.js"></script>
<script src="{prefix}assets/locale.js"></script>
</body>
</html>
'''


def redirect_page(target: str, release: bool = False) -> str:
    # Keep old bookmarks working while all visible links use directory URLs.
    script = "var target=" + json.dumps(target) + ";"
    if release:
        script += 'var slug=new URLSearchParams(location.search).get("slug");if(slug&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){target+=slug+"/";}location.replace(target+location.hash);'
    else:
        script += 'location.replace(target+location.search+location.hash);'
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Akira Kusama</title><meta name="robots" content="noindex,follow">
<link rel="canonical" href="{BASE}{target}">
<script>{script}</script></head><body><a href="{target}">Continue →</a></body></html>
"""


def main() -> None:
    # Validate every language before changing any generated file.
    news_index, documents = collect_news()
    outputs = {}
    for page in PAGES[:-1]:
        source = (ROOT / "tools/templates" / page).read_text(encoding="utf-8")
        for locale in LOCALES:
            path = urlsplit(url_for(page, locale)).path
            outputs[ROOT / path.lstrip("/") / "index.html"] = prepare(source, page, locale)
            if page != "index.html":
                legacy = ROOT / ("" if locale == "ja" else locale) / page
                outputs[legacy] = redirect_page(path)
    for locale in LOCALES:
        language = "" if locale == "ja" else f"/{locale}"
        outputs[ROOT / language.lstrip("/") / "release.html"] = redirect_page(language + "/news/", release=True)
    for article in news_index:
        for locale in LOCALES:
            language = "" if locale == "ja" else f"/{locale}"
            path = f'{language}/news/{article["slug"]}/'
            outputs[ROOT / path.lstrip("/") / "index.html"] = article_page(article, locale, documents[article["slug"]])
            legacy = ROOT / language.lstrip("/") / "news" / f'{article["slug"]}.html'
            outputs[legacy] = redirect_page(path)
    version = asset_version()
    for target, content in outputs.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(version_assets(content, version), encoding="utf-8")
    write_index(news_index)
    (ROOT / "sitemap.xml").write_text(build_sitemap(news_index), encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n", encoding="utf-8")
    manifest = {"name":"Akira Kusama Portfolio","short_name":"Akira Kusama","start_url":"/","display":"standalone","background_color":"#ECEBE4","theme_color":"#2C3A86","icons":[{"src":"/assets/favicon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}]}
    (ROOT / "site.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built 18 pages and {len(news_index) * 3} article pages with extensionless URLs.")


if __name__ == "__main__":
    main()
