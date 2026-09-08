#!/usr/bin/env python3
"""Build the news index from trilingual Markdown and Git dates."""
import json
import re
import subprocess
from pathlib import Path

from article_content import read_article

ROOT = Path(__file__).resolve().parents[1]


def git_dates(root: Path, path: Path) -> list[str]:
    result = subprocess.run(
        ["git", "log", "--format=%as", "--", str(path.relative_to(root))],
        cwd=root, capture_output=True, text=True,
    )
    return result.stdout.strip().splitlines() if result.returncode == 0 else []


def collect_news(root: Path = ROOT) -> tuple[list[dict], dict]:
    items, documents = [], {}
    for path in sorted((root / "news").glob("*.md")):
        slug = path.stem
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            raise ValueError(f"{path}: use a lowercase, hyphen-separated slug")
        document = read_article(path)
        documents[slug] = document
        meta = document["meta"]
        dates = git_dates(root, path)
        updated = meta.get("updated") or (dates[0] if dates else meta["date"])
        translations = {code: {key: value for key, value in fields.items() if key != "body"}
                        for code, fields in document["translations"].items()}
        items.append({
            "slug": slug, "title": translations["ja"]["title"],
            "tag": translations["ja"]["tag"], "date": meta["date"],
            "created": dates[-1] if dates else meta["date"], "updated": updated,
            "translations": translations,
        })
    items.sort(key=lambda item: (item["date"], item["slug"]), reverse=True)
    return items, documents


def write_index(items: list[dict], root: Path = ROOT) -> None:
    output = root / "assets/news-index.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (root / "assets/news-data.js").write_text(
        "/* Generated from news/*.md. Do not edit. */\nwindow.PRESS = "
        + json.dumps(items, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")


if __name__ == "__main__":
    items, _ = collect_news()
    write_index(items)
    print(f"Built {len(items)} trilingual news entries.")
