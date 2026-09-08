"""Regression checks for trilingual editing, static routes, and navigation/filtering."""
import json
import subprocess
import sys
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

TOOLS = Path(__file__).resolve().parents[1]
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
from article_content import read_article
import build_site
from build_news import collect_news


FIXTURE = '''---
date: "2026-09-08"
tag_ja: "新規"
tag_en: "New category"
tag_de: "Neue Kategorie"
description_de: "Eigene Beschreibung"
---

<!-- lang:ja -->
# 新しい記事

日本語の本文。

<!-- lang:en -->
# A completely new article

A **bold** update and [profile](/en/profile/).

## Details

- First item
- Second item

```text
<!-- lang:de -->
```

<!-- lang:de -->
# Ein ganz neuer Artikel

Deutscher Inhalt.
'''


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attributes):
        self.links.extend(value for key, value in attributes if key in ("href", "src") and value)


class ArticleTests(unittest.TestCase):
    def test_one_new_file_drives_all_languages_and_markdown(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "news").mkdir()
            path = root / "news/new-article.md"
            path.write_text(FIXTURE, encoding="utf-8")
            items, documents = collect_news(root)
            article = items[0]
            self.assertEqual(article["translations"]["en"]["tag"], "New category")
            self.assertEqual(article["translations"]["de"]["description"], "Eigene Beschreibung")
            self.assertNotIn("**", article["translations"]["en"]["description"])
            for locale in ("ja", "en", "de"):
                page = build_site.article_page(article, locale, documents["new-article"])
                self.assertIn(article["translations"][locale]["title"], page)
                self.assertIn('/news/new-article/', page)
                self.assertNotIn('/news/new-article.html', page)
                if locale == "en":
                    self.assertIn("<strong>bold</strong>", page)
                    self.assertIn('<a href="/en/profile/">profile</a>', page)
                    self.assertIn("<h2>Details</h2>", page)
                    self.assertIn("<li>Second item</li>", page)
                    self.assertIn("&lt;!-- lang:de --&gt;", page)
            # Editing the same Markdown changes titles, tags, descriptions, and body.
            path.write_text(FIXTURE.replace("A completely new article", "Revised title")
                            .replace("New category", "Changed category")
                            .replace("A **bold** update", "An **edited** update"), encoding="utf-8")
            edited, docs = collect_news(root)
            self.assertEqual(edited[0]["translations"]["en"]["title"], "Revised title")
            self.assertEqual(edited[0]["translations"]["en"]["tag"], "Changed category")
            self.assertIn("An edited update", edited[0]["translations"]["en"]["description"])
            self.assertIn("<strong>edited</strong>", build_site.article_page(edited[0], "en", docs["new-article"]))

    def test_missing_or_duplicate_language_and_invalid_date_rejected(self):
        cases = [FIXTURE.split("\n<!-- lang:de -->\n#")[0],
                 FIXTURE + "\n<!-- lang:en -->\n# Duplicate\n\nBody",
                 FIXTURE.replace('date: "2026-09-08"', 'date: "2026-02-30"')]
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "test.md"
            for content in cases:
                with self.subTest(content=content[-40:]):
                    path.write_text(content, encoding="utf-8")
                    with self.assertRaises(ValueError):
                        read_article(path)

    def test_invalid_article_does_not_overwrite_published_files(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "news").mkdir()
            (root / "news/incomplete.md").write_text(FIXTURE.replace("<!-- lang:en -->", "<!-- lang:fr -->"))
            (root / "index.html").write_text("existing page")
            with patch.object(build_site, "collect_news", side_effect=lambda: collect_news(root)):
                with self.assertRaises(ValueError):
                    build_site.main()
            self.assertEqual((root / "index.html").read_text(), "existing page")

    def test_generated_routes_metadata_and_local_links(self):
        sitemap = ET.parse(ROOT / "sitemap.xml")
        entries = sitemap.getroot().findall("{*}url")
        self.assertEqual(len(entries), 42)
        for entry in entries:
            url = entry.find("{*}loc").text
            self.assertNotIn(".html", url)
            file = ROOT / urlsplit(url).path.lstrip("/") / "index.html"
            text = file.read_text(encoding="utf-8")
            self.assertIn(f'<link rel="canonical" href="{url}">', text)
            self.assertNotIn("forwhom", text)
            self.assertNotIn("ご相談", text)
            parser = Links()
            parser.feed(text)
            for ref in parser.links:
                if ref.startswith(("https:", "http:", "#", "mailto:")):
                    continue
                path = urlsplit(ref).path
                self.assertNotIn(".html", path, (file, ref))
                target = ROOT / path.lstrip("/") if path.startswith("/") else file.parent / path
                self.assertTrue(target.exists(), (file, ref))
        for locale in ("", "en/", "de/"):
            redirect = (ROOT / locale / "profile.html").read_text()
            self.assertIn(f'var target="/{locale}profile/"', redirect)
            self.assertIn("location.search+location.hash", redirect)
            self.assertNotIn('<main', redirect)

    def test_client_navigation_and_news_filters(self):
        jsc = Path("/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc")
        if not jsc.exists():
            self.skipTest("JavaScriptCore not available on this platform")
        source = (ROOT / "assets/site.js").read_text()
        source = source.replace("  function init() {", "  window.testAPI={header:buildHeader,utility:buildUtilityNav,press:renderPress};\n  function init() {")
        data = (ROOT / "assets/data.js").read_text()
        news = json.loads((ROOT / "assets/news-index.json").read_text())
        # Add a category/title that cannot be supplied by the UI translation dictionary.
        news.append({"slug":"brand-new", "date":"2026-09-08", "title":"新記事", "tag":"新規",
                     "translations":{"de":{"title":"Neue Meldung XYZ", "tag":"Neue Kategorie XYZ"}}})
        bootstrap = '''
var window=globalThis, location={pathname:"/de/news/license-joho-2025/",search:"?view=full",hash:"#details"};
function element(){return {innerHTML:"",value:"",events:{},addEventListener:function(n,f){this.events[n]=f;}};}
var header=element(), utility;
header.insertAdjacentElement=function(where,bar){utility=bar.innerHTML;};
var selectors={};[".press-tag",".press-year",".press-month",".press-clear",".press-results",".press-filter-status"].forEach(function(s){selectors[s]=element();});
var host=element();host.getAttribute=function(){return null;};host.hasAttribute=function(n){return n==="data-press-filter";};host.querySelector=function(s){return selectors[s];};
var document={documentElement:{lang:"de"},readyState:"loading",addEventListener:function(){},getElementById:function(id){return id==="site-header"?header:null;},createElement:element,querySelectorAll:function(s){return s==="[data-press]"?[host]:[];}};
function assert(value,message){if(!value)throw Error(message);}
function resolved(value){return {then:function(fn){return resolved(fn(value));},catch:function(){return this;}};}
'''
        assertions = '''
testAPI.header();testAPI.utility();
assert(header.innerHTML.indexOf('href="/de/news/" aria-current="page"')>=0,"Article must activate News");
assert(header.innerHTML.indexOf('.html')<0,"No .html navigation links");
assert(utility.indexOf('href="/en/news/license-joho-2025/?view=full#details"')>=0,"Language switch preserves route, query and fragment");
var fetch=function(url){assert(url==="/assets/news-index.json","Rooted index URL");return resolved({ok:true,json:function(){return news;}});};
testAPI.press();
assert(selectors[".press-results"].innerHTML.indexOf("Neue Meldung XYZ")>=0,"New Markdown title reaches list");
assert(host.innerHTML.indexOf("Neue Kategorie XYZ")>=0,"New Markdown category reaches filter");
selectors[".press-tag"].value="Neue Kategorie XYZ";
selectors[".press-year"].value="2026";selectors[".press-month"].value="09";
selectors[".press-tag"].events.change();
assert(selectors[".press-filter-status"].innerHTML.indexOf("<strong>1</strong>")>=0,"Combined filters");
assert(selectors[".press-results"].innerHTML.indexOf('/de/news/brand-new/')>=0,"Localized clean article URL");
selectors[".press-month"].value="01";selectors[".press-month"].events.change();
assert(selectors[".press-filter-status"].innerHTML.indexOf("<strong>0</strong>")>=0,"Empty result");
selectors[".press-clear"].events.click();
assert(selectors[".press-filter-status"].innerHTML.indexOf("<strong>9</strong>")>=0,"Clear filters");
'''
        result = subprocess.run([str(jsc), "-e", bootstrap + data + "\nvar news=" + json.dumps(news) + ";\n" + source + assertions], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
