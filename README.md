# MyPortfolio — 草間 暁 / AKIRA KUSAMA

ソフトウェア開発・教育・研究のポートフォリオです。日本語・英語・ドイツ語に対応し、
静的HTMLをGitHub Pages等で配信します。

## ページURL

| ページ | 日本語 | 英語 | ドイツ語 |
|---|---|---|---|
| ホーム | `/` | `/en/` | `/de/` |
| エンジニア | `/engineer/` | `/en/engineer/` | `/de/engineer/` |
| 教育者 | `/educator/` | `/en/educator/` | `/de/educator/` |
| 研究者 | `/researcher/` | `/en/researcher/` | `/de/researcher/` |
| 経歴 | `/profile/` | `/en/profile/` | `/de/profile/` |
| お知らせ | `/news/` | `/en/news/` | `/de/news/` |
| 記事 | `/news/<slug>/` | `/en/news/<slug>/` | `/de/news/<slug>/` |

実ファイルは各ディレクトリの `index.html` ですが、ナビ・言語切替・検索向けURLには
拡張子を含めません。旧 `.html` URLは新URLへ転送します。
旧 `release.html?slug=...` も対応しています。

## 編集元と生成物

- `tools/templates/*.html`: 主要ページの編集元。
- `news/<slug>.md`: **1記事につき1ファイルで、三言語のタイトル・タグ・本文を管理**。
- `assets/data.js`: ナビ・外部プロフィール・スキル・案件データ。
- `assets/site.js`: ナビ・SNSアイコン・言語切替・案件とお知らせのフィルター。
- `assets/locale.js`: 主要ページと共通UIの表示翻訳。記事の翻訳はここに登録しません。
- `tools/build_site.py`: 全ページ・記事・SEO情報・転送ページの生成。
- `tools/article_content.py`: 三言語Markdownの検証とHTML変換。
- `assets/news-index.json` / `assets/news-data.js`: 生成済み一覧データ（編集不要）。
- `sitemap.xml` / `robots.txt` / `site.webmanifest`: 生成済み検索・アプリ情報。

生成済みHTMLは直接編集せず、編集元を変更してビルドしてください。

## 記事を追加・編集する

`news/example-update.md` のような英小文字・数字・ハイフンのファイル名を使用します。
公開日は共通、タグは言語別です。各セクションの最初の `# 見出し` が記事タイトルになります。

```markdown
---
date: "2026-09-08"
tag_ja: "活動"
tag_en: "Activity"
tag_de: "Aktivität"
---

<!-- lang:ja -->
# 活動のお知らせ

日本語の本文です。

<!-- lang:en -->
# Activity update

This is the English article.

<!-- lang:de -->
# Neues zu meinen Aktivitäten

Hier steht der deutsche Artikel.
```

見出し、リンク、強調、箇条書き、引用、コードブロック、表を記述できます。
サイト内リンクは `/profile/`、画像は `/assets/example.jpg` のようにルートから指定します。

任意で `updated: "2026-09-08"` と `description_ja` / `description_en` /
`description_de` を追加できます。説明文を省略すると各本文の最初の段落から生成し、
更新日を省略するとGitの最終変更日（未追跡記事は公開日）を使用します。
日付は `YYYY-MM-DD`、メタ情報は1行の文字列で指定してください。

三言語のセクション・タイトル・本文・タグは必須です。不足や重複があると、
生成物を書き換える前に対象ファイルと問題を表示して停止します。
プログラムへの記事名・翻訳の追加登録は不要です。

## ビルド・ローカル確認

初回のみPython環境を準備します。Markdown変換ライブラリはビルド時だけ必要です。

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements.txt
```

記事またはページを編集したら、次のコマンドで一覧・記事・SEO情報をまとめて更新します。

```bash
.venv/bin/python tools/build_site.py
.venv/bin/python -m unittest discover -s tools/tests -v
python3 -m http.server 8000 --bind 127.0.0.1
```

`http://127.0.0.1:8000/` で確認できます。ルート相対URLを使用するためHTTP配信が必要です。
生成したHTML・assets・検索関連ファイルを含めて公開してください。

## 表示方針

ホームでは現在の活動と主な経歴をつながったタイムラインとして表示し、全案件は折りたたみ内で確認できます。
案件は技術の複数選択と参画期間、お知らせはタグ・公開年・公開月で絞り込めます。
「〜をお考えの方へ」などの対象者ラベルと相談誘導文は表示しません。SNS・連絡先アイコンは共通ナビにあります。

## SEOと公開

canonical・hreflang・OGP・Twitter Card・構造化データ・サイトマップは拡張子なしのURLで生成します。
本番URLは `tools/build_site.py` の `BASE`（現在 `https://www.a-kusama.com`）です。
ドメイン変更時は更新して再生成してください。サイトはドメインのルートでの配信を想定しています。

現在のSNS共有画像は `assets/akira-kusama.jpg` です。
主要ページにはPerson等、記事にはBlogPostingの構造化データを付与しています。
記事本文と記事固有のメタ情報は静的HTMLなので、JavaScriptなしでも取得できます。

© 草間 暁 / AKIRA KUSAMA.
