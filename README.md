# MyPortfolio — 草間 暁 / AKIRA KUSAMA

ソフトウェア開発者・教育者・研究者、草間 暁 のポートフォリオサイト。
**エンジニア／教育者／研究者** の三つの視点を「目的別」に構成した、依存ライブラリなしの静的サイトです。

🔗 Design proposal (Artifact): https://claude.ai/code/artifact/89a1e012-b571-4c6d-89e2-29e8a5a216d6

## 構成

```
.
├── index.html          # トップ（概要・目的別入口・現在の活動・主な経歴・お知らせ最新5件）
├── engineer.html       # 目的別詳細 — エンジニア（For Business）
├── educator.html       # 目的別詳細 — 教育者（For Education）
├── researcher.html     # 目的別詳細 — 研究者（For Academia）
├── profile.html        # 経歴詳細（職歴・学歴・資格・受賞・国際交流）
├── news.html           # お知らせ / プレスリリース 一覧
├── release.html        # お知らせ詳細（?slug= で news/<slug>.md を描画）
├── news/               # リリース記事（Markdown・1件1ファイル）
│   └── *.md
├── tools/
│   └── build_news.py   # news/*.md → assets/news-index.json（Git 日付を付与）
├── assets/
│   ├── style.css       # 全ページ共通スタイル（配色・書体・レイアウト）
│   ├── data.js         # ★単一データソース（ナビ・リンク・スキル・案件・お知らせ）
│   ├── site.js         # 共通スクリプト（注入・案件エクスプローラー・お知らせ）
│   ├── news-index.json # build_news.py の生成物（お知らせ一覧＋日付）
│   └── akira-kusama.jpg
├── .nojekyll
└── README.md
```

### 案件エクスプローラー（実績）

トップ・エンジニア・教育者・経歴の各ページに、`assets/data.js` の `PROJECTS` を元にした
**フィルター＋ポップアップ**の実績ビューを表示します。言語・フレームワーク・データベース・
インフラ・プロダクト別に技術を複数選択し、参画年の範囲や進行中案件でも絞り込めます。
カードをクリックすると組織・参画情報・担当工程・技術スタックを確認できます。

トップでは情報量を抑えるため、現在からこれまでの主な活動を一本の流れとして常時表示します。
全件フィルターは「すべての案件・実績を見る」内に折りたたみ、要約カードから
経歴ページへ移動すると該当案件の詳細パネルが自動で開きます。

### お知らせ（Markdown ＋ Git 日付）

1件のリリース ＝ `news/<slug>.md`（フロントマターに `title` / `tag` / `date`）。

```bash
python3 tools/build_news.py      # news/*.md を走査して assets/news-index.json を生成
```

`build_news.py` は各記事の **公開日**（フロントマターの `date`）、**作成日**（Git で最初に
追加されたコミット日）、**更新日**（Git の最終コミット日）を集計します。記事を追加・編集して
`git commit` した後に再実行すると、日付が Git 情報に即して更新されます。詳細ページ
（`release.html`）は Markdown を `marked`（CDN）で描画します。

> ⚠️ `release.html` と一覧の自動描画は `fetch` を使うため、**簡易サーバー経由**での表示が必要です
> （`file://` 直開きでは一覧は `data.js` のフォールバックを表示し、詳細は読み込めません）。GitHub Pages では問題なく動作します。

- **依存ライブラリなし** — フレームワーク・ビルド不要。素の HTML/CSS/JS。Web フォント（Google Fonts）のみ外部参照。
- **スクリプトで一元管理** — ヘッダー・フッター・ナビは各 HTML に直接書かず、`assets/site.js` が `assets/data.js` を読み込んで全ページに自動注入。
  - ナビは `data.js` の `NAV` から自動生成し、**現在ページを自動でハイライト**。狭い画面では開閉式メニューへ切り替わります。
  - **お知らせ／プレスリリース**は `data.js` の `PRESS` を新しい順に整列。トップは最新5件、`news.html` は全件を自動描画。
  - 目的別ページの前後ページャーも `ROLE_ORDER` から自動生成。
- **ライト／ダーク両対応** — OS 設定に追従し、右上「◐ THEME」で手動切替（選択は `localStorage` に保存）。
- **アクセシビリティ** — 情報を色のみで伝えない設計。色覚多様性に配慮した配色、キーボードフォーカスの可視化、スキップリンク、`prefers-reduced-motion` 対応。

### お知らせ／ページを追加するには

`assets/data.js` を編集するだけです。

- **お知らせを足す** — `PRESS` 配列の先頭に1行追加（日付順は自動整列）:
  ```js
  { date:"2026-04-01", tag:"リリース", title:"新サービスを公開しました", url:"https://…" },
  ```
  `url` を空文字にするとリンクなし（テキストのみ）で表示されます。
- **ページを足す** — 新しい HTML を作り、`NAV` 配列に1行追加すれば、全ページのヘッダー／フッターに自動で反映されます。

## デザイン

| 要素 | 選択 |
|---|---|
| コンセプト | 学術プロスペクタス（趣意書） |
| 配色 | 和紙ニュートラル ＋ 藍（indigo）＋ 朱印の朱 |
| 書体 | Shippori Mincho ／ Newsreader ／ IBM Plex Mono |

## ローカルで確認

ビルド不要。任意の静的サーバーで開くだけです。

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## GitHub Pages で公開

1. このリポジトリを GitHub に push（下記コマンド参照）。
2. リポジトリの **Settings → Pages** で、Source を `Deploy from a branch`、Branch を `main` / `(root)` に設定。
3. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます。

独自ドメイン（例: `a-kusama.com`）を使う場合は、リポジトリ直下に `CNAME` ファイル（中身はドメイン名のみ）を追加し、DNS を GitHub Pages に向けます。

---

© 草間 暁 / AKIRA KUSAMA. Content all rights reserved. Set in Shippori Mincho, Newsreader &amp; IBM Plex Mono.
