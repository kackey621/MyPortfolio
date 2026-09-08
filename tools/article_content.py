"""Read one Markdown document containing Japanese, English and German sections."""
from __future__ import annotations

import datetime
import json
import re
from html.parser import HTMLParser
from pathlib import Path

import markdown

LOCALES = ("ja", "en", "de")


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, value):
        self.parts.append(value)


def excerpt(rendered: str) -> str:
    first = re.search(r"<p>([\s\S]*?)</p>", rendered)
    parser = PlainText()
    parser.feed(first.group(1) if first else rendered)
    return " ".join("".join(parser.parts).split())[:200]


def read_article(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    front = re.match(r"\A---\n([\s\S]*?)\n---\s*\n([\s\S]*)", text)
    if not front:
        raise ValueError(f"{path}: frontmatter is required")
    meta = {}
    for line in front[1].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        match = re.fullmatch(r"([a-z_]+):\s*(.*?)\s*", line)
        if not match or match[1] in meta:
            raise ValueError(f"{path}: invalid or duplicate metadata: {line}")
        key, value = match.groups()
        if value.startswith('"'):
            value = json.loads(value)
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1].replace("''", "'")
        if not isinstance(value, str):
            raise ValueError(f"{path}: {key} must be text")
        meta[key] = value
    for field in ("date", "updated"):
        if field == "date" or field in meta:
            value = meta.get(field, "")
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                raise ValueError(f"{path}: {field} must be YYYY-MM-DD")
            datetime.date.fromisoformat(value)

    sections, current, fence = {}, None, None
    for line in front[2].splitlines():
        fence_match = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if fence_match:
            marker = fence_match[1]
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
        marker = None if fence else re.fullmatch(r"\s*<!--\s*lang:([a-z]+)\s*-->\s*", line)
        if marker:
            current = marker[1]
            if current not in LOCALES or current in sections:
                raise ValueError(f"{path}: invalid or duplicate language {current}")
            sections[current] = []
        elif current is not None:
            sections[current].append(line)
        elif line.strip():
            raise ValueError(f"{path}: content must follow a <!-- lang:ja --> marker")

    translations = {}
    for locale in LOCALES:
        section = "\n".join(sections.get(locale, [])).strip()
        heading = re.match(r"\A#\s+(.+?)\s*\n+([\s\S]+)", section)
        if not heading or not heading[2].strip():
            raise ValueError(f"{path}: {locale} needs a # Title and Markdown body")
        tag = meta.get(f"tag_{locale}", "")
        if not tag:
            raise ValueError(f"{path}: tag_{locale} is required")
        rendered = markdown.markdown(heading[2], extensions=["extra", "sane_lists"], output_format="html")
        translations[locale] = {
            "title": heading[1], "tag": tag,
            "description": meta.get(f"description_{locale}") or excerpt(rendered),
            "body": rendered,
        }
    return {"meta": meta, "translations": translations}
