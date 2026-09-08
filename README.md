# MyPortfolio — 草間 暁 / AKIRA KUSAMA

ソフトウェア開発者・教育者・研究者、草間 暁 のポートフォリオサイト。
**エンジニア／教育者／研究者** の三つの視点を「目的別」に構成した、依存ライブラリなしの静的サイトです。

🔗 Design proposal (Artifact): https://claude.ai/code/artifact/89a1e012-b571-4c6d-89e2-29e8a5a216d6

## 構成

```
.
├── index.html          # トップ（概要・目的別入口・お知らせ最新5件）
├── engineer.html       # 目的別詳細 — エンジニア（For Business）
├── educator.html       # 目的別詳細 — 教育者（For Education）
├── researcher.html     # 目的別詳細 — 研究者（For Academia）
├── profile.html        # 経歴詳細（職歴・学歴・資格・受賞・国際交流）
├── news.html           # お知らせ / プレスリリース 全件
├── assets/
│   ├── style.css       # 全ページ共通スタイル（配色・書体・レイアウト）
│   ├── data.js         # ★サイトの単一データソース（ナビ・リンク・お知らせ）
│   ├── site.js         # 共通スクリプト（ヘッダー/フッター注入・自動描画）
│   └── akira-kusama.jpg
├── .nojekyll
└── README.md
```

- **依存ライブラリなし** — フレームワーク・ビルド不要。素の HTML/CSS/JS。Web フォント（Google Fonts）のみ外部参照。
- **スクリプトで一元管理** — ヘッダー・フッター・ナビは各 HTML に直接書かず、`assets/site.js` が `assets/data.js` を読み込んで全ページに自動注入。
  - ナビは `data.js` の `NAV` から自動生成し、**現在ページを自動でハイライト**（ページを増やしても各所のリンクが自動更新）。
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
