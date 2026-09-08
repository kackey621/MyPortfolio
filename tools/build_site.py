#!/usr/bin/env python3
"""Build localized HTML variants and search/social discovery files."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://ja.a-kusama.com"
PAGES = ["index.html", "engineer.html", "educator.html", "researcher.html", "profile.html", "news.html", "release.html"]
LOCALES = ("ja", "en", "de")

ARTICLE_TRANSLATIONS = {
    "license-joho-2025": {
        "en": ("Awarded an Upper-Secondary Computing Teaching License", ["I was awarded a Japanese upper-secondary teaching license in computing.", "Following teacher-training studies and teaching experience at N High School, S High School, and Waseda University Senior High School, I am now formally qualified as a computing educator. I will continue contributing to computing education in Japan."]),
        "de": ("Lehrbefähigung für Informatik an Oberschulen erhalten", ["Mir wurde die japanische Lehrbefähigung für Informatik an Oberschulen erteilt.", "Nach dem Lehramtsstudium und Unterrichtserfahrungen an der N High School, der S High School und der Waseda University Senior High School bin ich nun offiziell als Informatiklehrer qualifiziert. Ich werde mich weiterhin für die digitale Bildung in Japan einsetzen."]),
    },
    "meisei-2025": {
        "en": ("Enrolled in Meisei University’s Distance-Learning Civics Program", ["I enrolled in Meisei University’s distance-learning subject-specialist program for upper-secondary civics.", "By deepening my subject knowledge in civics alongside computing, I aim to support students’ learning from a broader perspective."]),
        "de": ("Fernstudium für das Unterrichtsfach Gemeinschaftskunde an der Meisei University begonnen", ["Ich habe mich für das Fernstudium der Meisei University im Fachprogramm Gemeinschaftskunde für Oberschulen eingeschrieben.", "Durch die Vertiefung meiner Fachkenntnisse in Gemeinschaftskunde zusätzlich zur Informatik möchte ich Lernende aus einer breiteren Perspektive unterstützen."]),
    },
    "waseda-ta-end-2024": {
        "en": ("Completed My Term as a Computing Teaching Assistant at Waseda (2022–2024)", ["I completed my term as a computing teaching assistant at Waseda University Senior High School, serving from September 2022 through July 2024.", "Supporting programming classes in R provided a valuable opportunity to practice and study teaching that is clear and accessible."]),
        "de": ("Tätigkeit als Teaching Assistant für Informatik an der Waseda beendet (2022–2024)", ["Meine Tätigkeit als Teaching Assistant für Informatik an der Waseda University Senior High School von September 2022 bis Juli 2024 ist beendet.", "Die Unterstützung von Programmierkursen in R bot eine wertvolle Gelegenheit, verständlichen Unterricht praktisch zu erproben und zu erforschen."]),
    },
    "waseda-ta-2022": {
        "en": ("Appointed Computing Teaching Assistant at Waseda University Senior High School", ["I was appointed as a teaching assistant for computing at Waseda University Senior High School.", "I will support programming classes."]),
        "de": ("Teaching Assistant für Informatik an der Waseda University Senior High School", ["Ich wurde als Teaching Assistant für Informatik an der Waseda University Senior High School berufen.", "Ich unterstütze den Programmierunterricht."]),
    },
    "willen-2022": {
        "en": ("Appointed Chairperson of the Nonprofit Willen", ["I was appointed chairperson of the nonprofit organization Willen.", "We will develop career-development support for young engineers and IT-use support programs for citizens and organizations."]),
        "de": ("Zum Vorstandsvorsitzenden der Nonprofit-Organisation Willen berufen", ["Ich wurde zum Vorstandsvorsitzenden der Nonprofit-Organisation Willen berufen.", "Wir entwickeln Angebote zur Karriereförderung junger Entwicklerinnen und Entwickler sowie zur Unterstützung von Bürgern und Organisationen bei der IT-Nutzung."]),
    },
    "award-thesis-2021": {
        "en": ("Received the 72nd Graduating Class Outstanding Thesis Award at Waseda", ["I received the Outstanding Thesis Award for the 72nd graduating class of Waseda University Senior High School."]),
        "de": ("Auszeichnung für eine herausragende Abschlussarbeit des 72. Jahrgangs der Waseda", ["Ich erhielt die Auszeichnung für eine herausragende Abschlussarbeit des 72. Abschlussjahrgangs der Waseda University Senior High School."]),
    },
    "freelance-2020": {
        "en": ("Started Working as a Freelance Software Engineer", ["I began working as a freelance software engineer.", "Focusing on web system development, I support organizations with problem-solving and new-business launches through contract and on-site engagements."]),
        "de": ("Tätigkeit als freiberuflicher Softwareentwickler aufgenommen", ["Ich begann meine Tätigkeit als freiberuflicher Softwareentwickler.", "Mit Schwerpunkt auf Websystemen unterstütze ich Organisationen bei Problemlösungen und beim Aufbau neuer Geschäftsfelder – projektbezogen und vor Ort."]),
    },
    "nikkei-stockleague-2019": {
        "en": ("Selected in the Nikkei STOCK League", ["My entry was selected in the Nikkei STOCK League organized by Nikkei Inc."]),
        "de": ("Auswahl bei der Nikkei STOCK League", ["Mein Beitrag wurde bei der von Nikkei Inc. veranstalteten Nikkei STOCK League ausgewählt."]),
    },
}

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
    tail = "/" if page == "index.html" else f"/{page}"
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
<link rel="icon" href="{'../' if locale != 'ja' else ''}assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="{'../' if locale != 'ja' else ''}site.webmanifest">
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
    text = text.replace("</head>", seo_block(page, locale) + "\n</head>", 1)
    if locale != "ja":
        text = re.sub(r'((?:href|src)=")\./assets/', r'\1../assets/', text)
        text = re.sub(r'((?:href|src)=")assets/', r'\1../assets/', text)
        text = text.replace('fetch("assets/', 'fetch("../assets/').replace('fetch("news/', 'fetch("../news/')
        text = text.replace('<script src="../assets/site.js"></script>', '<script src="../assets/site.js"></script>\n<script src="../assets/locale.js"></script>')
    return text


def build_sitemap() -> str:
    rows=[]
    for page in PAGES[:-1]:
        for locale in LOCALES:
            links="".join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{html.escape(url_for(page,code))}"/>' for code in LOCALES)
            links+=f'<xhtml:link rel="alternate" hreflang="x-default" href="{html.escape(url_for(page,"ja"))}"/>'
            rows.append(f'<url><loc>{html.escape(url_for(page,locale))}</loc><lastmod>2026-09-08</lastmod>{links}</url>')
    news_index=json.loads((ROOT/"assets/news-index.json").read_text(encoding="utf-8"))
    for article in news_index:
        slug=article["slug"]
        lastmod=article.get("updated") or article.get("date") or "2026-09-08"
        article_urls={code:BASE+("" if code=="ja" else "/"+code)+f"/news/{slug}.html" for code in LOCALES}
        links="".join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{html.escape(article_urls[code])}"/>' for code in LOCALES)
        links+=f'<xhtml:link rel="alternate" hreflang="x-default" href="{html.escape(article_urls["ja"])}"/>'
        for locale in LOCALES:
            rows.append(f'<url><loc>{html.escape(article_urls[locale])}</loc><lastmod>{html.escape(lastmod)}</lastmod>{links}</url>')
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+'\n'.join(rows)+'\n</urlset>\n'


def read_article(slug: str) -> tuple[dict[str, str], list[str]]:
    text=(ROOT/"news"/f"{slug}.md").read_text(encoding="utf-8")
    match=re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$",text)
    if not match:
        return {},[p.strip() for p in text.split("\n\n") if p.strip() and not p.startswith("#")]
    meta={}
    for line in match.group(1).splitlines():
        item=re.match(r'^\s*([A-Za-z0-9_]+)\s*:\s*"?(.*?)"?\s*$',line)
        if item: meta[item.group(1)]=item.group(2)
    body=re.sub(r"^\s*#\s+.*\n", "", match.group(2)).strip()
    return meta,[p.strip() for p in body.split("\n\n") if p.strip()]


def article_page(article: dict, locale: str) -> str:
    slug=article["slug"]
    source_meta,source_paragraphs=read_article(slug)
    if locale=="ja":
        title=source_meta.get("title") or article["title"]
        paragraphs=source_paragraphs
        tag=source_meta.get("tag") or article.get("tag","")
    else:
        title,paragraphs=ARTICLE_TRANSLATIONS[slug][locale]
        tag={"en":{"資格":"Credential","進学":"Education","活動":"Activity","就任":"Appointment","受賞":"Award","独立":"Freelance"},"de":{"資格":"Qualifikation","進学":"Studium","活動":"Aktivität","就任":"Ernennung","受賞":"Auszeichnung","独立":"Freiberuflich"}}[locale].get(article.get("tag",""),article.get("tag",""))
    description=paragraphs[0]
    prefix="../" if locale=="ja" else "../../"
    locale_root="" if locale=="ja" else f"/{locale}"
    canonical=f"{BASE}{locale_root}/news/{slug}.html"
    article_urls={code:BASE+("" if code=="ja" else "/"+code)+f"/news/{slug}.html" for code in LOCALES}
    og_locale={"ja":"ja_JP","en":"en_US","de":"de_DE"}[locale]
    image_alt={"ja":"ソフトウェア開発者・教育者・研究者、草間 暁のポートレート","en":"Portrait of Akira Kusama, software developer, educator, and researcher","de":"Porträt von Akira Kusama, Softwareentwickler, Pädagoge und Forscher"}[locale]
    ui={"ja":{"skip":"本文へスキップ","crumb":"パンくず","news":"お知らせ","published":"公開","updated":"更新","back":"お知らせ一覧へ戻る"},"en":{"skip":"Skip to content","crumb":"Breadcrumb","news":"News","published":"Published","updated":"Updated","back":"Back to news"},"de":{"skip":"Zum Inhalt springen","crumb":"Brotkrümelnavigation","news":"Aktuelles","published":"Veröffentlicht","updated":"Aktualisiert","back":"Zurück zu Aktuelles"}}[locale]
    alternates="\n".join(f'<link rel="alternate" hreflang="{code}" href="{article_urls[code]}">' for code in LOCALES)+f'\n<link rel="alternate" hreflang="x-default" href="{article_urls["ja"]}">' 
    graph={"@context":"https://schema.org","@type":"BlogPosting","@id":canonical+"#article","url":canonical,"headline":title,"description":description,"inLanguage":locale,"datePublished":article.get("date"),"dateModified":article.get("updated") or article.get("date"),"image":BASE+"/assets/akira-kusama.jpg","author":{"@type":"Person","@id":BASE+"/#person","name":"Akira Kusama","url":BASE+"/"},"publisher":{"@id":BASE+"/#person"},"mainEntityOfPage":{"@type":"WebPage","@id":canonical}}
    updated=(f'<span><b>{ui["updated"]}</b> <time datetime="{html.escape(article["updated"])}">{html.escape(article["updated"].replace("-","."))}</time></span>' if article.get("updated") and article.get("updated")!=article.get("date") else "")
    body="\n".join(f"<p>{html.escape(paragraph)}</p>" for paragraph in paragraphs)
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Shippori+Mincho:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
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
<meta property="og:image" content="{BASE}/assets/akira-kusama.jpg">
<meta property="og:image:width" content="828"><meta property="og:image:height" content="1104">
<meta property="og:image:alt" content="{html.escape(image_alt,quote=True)}">
<meta property="article:published_time" content="{html.escape(article.get('date',''))}">
<meta property="article:modified_time" content="{html.escape(article.get('updated') or article.get('date',''))}">
<meta property="article:section" content="{html.escape(tag,quote=True)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{html.escape(title,quote=True)}">
<meta name="twitter:description" content="{html.escape(description,quote=True)}">
<meta name="twitter:image" content="{BASE}/assets/akira-kusama.jpg">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False,separators=(',',':'))}</script>
</head>
<body>
<a class="skip" href="#main">{ui['skip']}</a>
<header id="site-header"></header>
<main id="main">
  <div class="page-hero"><div class="wrap-narrow">
    <nav class="breadcrumb" aria-label="{ui['crumb']}"><a href="../index.html">Home</a><span class="sep">/</span><a href="../news.html">{ui['news']}</a><span class="sep">/</span><span>{html.escape(title)}</span></nav>
    <div class="release-tag">{html.escape(tag)}</div>
    <h1 class="page-title">{html.escape(title)}</h1>
    <div class="release-meta"><span><b>{ui['published']}</b> <time datetime="{html.escape(article.get('date',''))}">{html.escape(article.get('date','').replace('-','.'))}</time></span>{updated}</div>
  </div></div>
  <article class="article"><div class="wrap-narrow"><div class="md-body">{body}</div><p style="margin-top:40px"><a class="sec-more-link" href="../news.html">← {ui['back']}</a></p></div></article>
</main>
<footer id="site-footer"></footer>
<script src="{prefix}assets/data.js"></script>
<script src="{prefix}assets/site.js"></script>
<script src="{prefix}assets/locale.js"></script>
</body>
</html>
'''


def main() -> None:
    originals={page:(ROOT/page).read_text(encoding="utf-8") for page in PAGES}
    for page, source in originals.items():
        (ROOT/page).write_text(prepare(source,page,"ja"),encoding="utf-8")
        for locale in ("en","de"):
            target=ROOT/locale/page
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(prepare(source,page,locale),encoding="utf-8")
    (ROOT/"sitemap.xml").write_text(build_sitemap(),encoding="utf-8")
    (ROOT/"robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n",encoding="utf-8")
    news_index=json.loads((ROOT/"assets/news-index.json").read_text(encoding="utf-8"))
    for article in news_index:
        for locale in LOCALES:
            target=ROOT/("" if locale=="ja" else locale)/"news"/f'{article["slug"]}.html'
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(article_page(article,locale),encoding="utf-8")
    manifest={"name":"Akira Kusama Portfolio","short_name":"Akira Kusama","start_url":"/","display":"standalone","background_color":"#ECEBE4","theme_color":"#2C3A86","icons":[{"src":"/assets/favicon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}]}
    (ROOT/"site.webmanifest").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")


if __name__ == "__main__":
    main()
