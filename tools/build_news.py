#!/usr/bin/env python3
"""
build_news.py — news/*.md をスキャンし、フロントマターと Git 情報から
assets/news-index.json を生成する。

・公開日 (date) … フロントマターの date
・作成日 (created) … Git にファイルが最初に追加されたコミット日（なければ date）
・更新日 (updated) … Git の最終コミット日（なければファイル mtime）

使い方:  python3 tools/build_news.py
（記事を追加・更新して commit した後に実行すると、日付が Git に即して更新されます）
"""
import os, re, json, subprocess, datetime, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_DIR = os.path.join(ROOT, "news")
OUT = os.path.join(ROOT, "assets", "news-index.json")


def git_date(args):
    try:
        out = subprocess.run(["git"] + args, cwd=ROOT, capture_output=True, text=True)
        val = out.stdout.strip().splitlines()
        return val
    except Exception:
        return []


def parse_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
    meta, body = {}, text
    if m:
        body = m.group(2)
        for line in m.group(1).splitlines():
            mm = re.match(r'^\s*([A-Za-z0-9_]+)\s*:\s*"?(.*?)"?\s*$', line)
            if mm:
                meta[mm.group(1)] = mm.group(2)
    return meta, body


def created_date(path):
    # 最初に追加されたコミットの author date（%as = YYYY-MM-DD）
    vals = git_date(["log", "--diff-filter=A", "--format=%as", "--", path])
    return vals[-1] if vals else None


def updated_date(path):
    vals = git_date(["log", "-1", "--format=%as", "--", path])
    if vals:
        return vals[0]
    ts = os.path.getmtime(path)
    return datetime.date.fromtimestamp(ts).isoformat()


def main():
    items = []
    for path in glob.glob(os.path.join(NEWS_DIR, "*.md")):
        slug = os.path.splitext(os.path.basename(path))[0]
        meta, _ = parse_frontmatter(open(path, encoding="utf-8").read())
        date = meta.get("date") or updated_date(path)
        items.append({
            "slug": slug,
            "title": meta.get("title", slug),
            "tag": meta.get("tag", ""),
            "date": date,
            "created": created_date(path) or date,
            "updated": updated_date(path),
        })
    items.sort(key=lambda x: x["date"], reverse=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(items, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"wrote {OUT} ({len(items)} entries)")


if __name__ == "__main__":
    main()
