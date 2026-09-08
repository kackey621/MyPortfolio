# MyPortfolio — 草間 暁 / AKIRA KUSAMA

ソフトウェア開発者・教育者・研究者、草間 暁 のポートフォリオサイト。
**エンジニア／教育者／研究者** の三つの視点を「目的別」に構成した、依存ライブラリなしの静的サイトです。

🔗 Design proposal (Artifact): https://claude.ai/code/artifact/89a1e012-b571-4c6d-89e2-29e8a5a216d6

## 構成

```
.
├── index.html                # ページ本体（単一HTML・自己完結）
├── assets/
│   └── akira-kusama.jpg       # ポートレート
├── .nojekyll                 # GitHub Pages で静的配信（Jekyll 無効化）
└── README.md
```

- **依存なし** — フレームワーク・ビルド不要。Web フォント（Google Fonts）のみ外部参照。
- **ライト／ダーク両対応** — OS 設定に追従し、右上「◐ THEME」で手動切替。
- **アクセシビリティ** — 情報を色のみで伝えない設計。色覚多様性に配慮した配色、キーボードフォーカスの可視化、`prefers-reduced-motion` 対応。

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
