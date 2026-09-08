# 引き継ぎ資料 — MyPortfolio（草間 暁 ポートフォリオ）

このドキュメントは、本リポジトリのこれまでの制作内容・設計・データ構造・編集方法・未決事項を、
別の担当者（または別セッション）が引き継げるようにまとめたものです。

- 対象リポジトリ: `/Users/akira/Documents/Dev/MyPortfolio`
- 種別: 依存ライブラリなしの**静的マルチページサイト**（GitHub Pages 想定）
- 参照元（旧サイト）: https://ja.a-kusama.com/
- 最終更新: 2026-09-08（三言語Markdown・拡張子なしURLへの移行）

---

## 1. 概要とゴール

草間 暁（AKIRA KUSAMA）氏のポートフォリオ。**エンジニア／教育者／研究者**の三面を「目的別」に
提示し、知的な印象を与えることが目的。旧 WordPress サイトの内容を引き継ぎつつ、静的サイトとして
再構築した。

- 本人写真を掲載（`assets/akira-kusama.jpg`、フルカラー）
- SES を含む職歴・教育活動を掲載
- 自己紹介・「できること」・案件実績を含む
- GitHub リポジトリ参照の静的サイト

---

## 2. デザイン方針

「学術プロスペクタス（趣意書）」がコンセプト。AI 生成デザインで氾濫する定番（クリーム＋テラコッタ）
を避け、被写体固有の要素で構成している。

| 項目 | 値 |
|---|---|
| 配色 | 和紙ニュートラル＋**藍 `--ai:#2C3A86`**＋朱 `--shu:#A83228`（ダークは明色側に反転） |
| 書体 | Shippori Mincho（見出）／ Newsreader（英字見出）／ IBM Plex Mono（ラベル・数値）／ Noto Sans JP（本文） |
| テーマ | ライト／ダーク両対応（OS 追従＋右上「◐ Theme」で手動、選択は `localStorage`） |
| 配慮 | 色覚多様性（情報を色のみで伝えない）、キーボードフォーカス可視化、`prefers-reduced-motion`、スキップリンク |

> 過去の指示で削除済み: ポートレートのグレースケールフィルタ（→フルカラー）、印影「暁」スタンプ。
> ナビは大きめ・横展開。本文フォントは全体的に拡大済み。

---

## 3. 編集元とURL

主要ページの編集元は `tools/templates/*.html`、お知らせは `news/<slug>.md`。
`tools/build_site.py` が `/<page>/index.html`、`/en/<page>/index.html`、
`/de/<page>/index.html` と各言語の `news/<slug>/index.html` を生成する。

URLは `/engineer/`、`/en/profile/`、`/de/news/<slug>/` など。
内部リンク、言語切替、canonical、hreflang、サイトマップはこの形式で統一する。
従来の `.html` は新URLへの転送用ファイル。本文の編集先ではない。
`index.html` をURLに明示した場合もアドレスをディレクトリURLに正規化する。

共通UIは `assets/site.js`、スタイルは `assets/style.css`、
主要ページの表示翻訳は `assets/locale.js` に置く。
記事の翻訳はMarkdown内で管理し、プログラムの辞書に登録しない。

## 4. データモデル（`assets/data.js`）

グローバルに以下を定義（すべて `window.*`）。**ここを編集すれば全ページに反映される。**

| 変数 | 用途 |
|---|---|
| `SITE` | 氏名・肩書き・最終更新日など |
| `NAV` | グローバルナビ（`{href,label,en,num}`）。1 行足すと全ページのヘッダーに反映＆現在ページを自動ハイライト |
| `ROLE_ORDER` | 目的別ページの前後ページャー順 |
| `LINKS` | 外部リンク。各要素に `roles:["engineer"|"educator"|"researcher"]` を付与し、詳細ページで役割別に自動表示（フッターは全件） |
| `SKILLS` | フィルター用スキル。`{name, kind, level(3=メイン/2=実務/1=利用可能), years}` |
| `PHASE_LABELS` | 工程ラベル `["要件定義","基本設計","詳細設計","実装","テスト","保守運用"]` |
| `PROJECTS` | 案件・実績（11 件）。下表参照 |
| `PRESS` | `assets/news-data.js` にMarkdownから自動生成される一覧フォールバック（各言語のタイトル・タグ・説明文を含む） |

### `PROJECTS` の各フィールド

```js
{
  id:"p07",                      // 一意 ID
  org:{name:"…", url:"…"},       // 組織（url 空 = リンクなし表示）
  industry:"情報",               // 業種
  role:"理事長",                 // 雇用形態・立場
  cat:"engineer"|"educator",     // どのページの絞り込みに出すか
  start:"2022-04", end:null,     // "YYYY-MM"（end 省略/null = 継続中）
  months:54, team:15, sub:5,     // 稼働月数・規模（sub=部下、任意）
  domain:"…",                    // カード見出し（サービスの要約）
  service:"…",                   // サービス概要（1 行）
  body:["…","…"],                // 担当した業務内容（箇条書き）
  phases:[1,1,1,1,1,1],          // 6 工程の担当有無（PHASE_LABELS と対応）
  stack:["PHP","Rails", …]       // 技術スタック（SKILLS.name と一致すると絞り込み対象）
}
```

---

## 5. 共通スクリプト（`assets/site.js`）

`DOMContentLoaded` で `init()` が以下を実行（すべて依存なし・素の JS）。

| 関数 | 役割 |
|---|---|
| `buildHeader()` | ヘッダーを注入。`NAV` から生成し、現在ページを `aria-current` で自動ハイライト。860px 以下は開閉式メニュー |
| `initNavigation()` | モバイルナビの開閉、Esc キー、ページ遷移・画面拡大時の自動クローズを管理 |
| `buildUtilityNav()` | SNS・外部プロフィールのアイコンナビと JA / EN / DE 言語切替を注入 |
| `buildFooter()` | フッター（外部リンク＋コロフォン）を注入 |
| `renderPress()` | `[data-press]` に描画。`data-press-filter` がある一覧ではタグ・公開年・公開月で絞り込み。各項目は言語別の静的記事へリンク |
| `renderRoleLinks()` | `[data-role-links="engineer"]` 等に、その役割の外部リンクを表示 |
| `renderCareerSummary()` | ホームの `[data-career-summary]` に、現在からこれまでの主な活動を一本のタイムラインとして要約表示。各項目は `/profile/?project=<id>#skills` へ遷移 |
| `renderProjectExplorer()` | `[data-projects]`（任意で `data-projects-role`）に**案件エクスプローラー**を描画。`SKILLS.kind` 別の技術複数選択（AND）＋参画年範囲＋進行中フィルター、選択条件・件数、アニメーション付きフロー、クリック詳細を提供。`?skill=PHP,Laravel` のような初期指定も可 |
| `buildPager()` | 目的別ページの前後ページャーを `ROLE_ORDER` から生成 |
| `initTheme()` | ライト／ダーク切替（`localStorage` 保存） |

### HTML 側のフック（各ページに置くだけ）

```html
<header id="site-header"></header>        <!-- ヘッダー注入先 -->
<footer id="site-footer"></footer>        <!-- フッター注入先 -->
<div data-press data-press-limit="5"></div>          <!-- お知らせ最新5件 -->
<div data-projects></div>                            <!-- 全案件エクスプローラー -->
<div data-projects data-projects-role="engineer"></div> <!-- 役割で絞った案件 -->
<div data-career-summary></div>                      <!-- ホーム用の主要活動タイムライン -->
<div data-role-links="engineer"></div>               <!-- 役割別リンク -->
<div id="role-pager"></div>                          <!-- 前後ページャー -->
<script src="assets/data.js"></script>
<script src="assets/site.js"></script>
```

---

## 6. 表示・取扱方針

- サイト上では、案件情報に関する内部的な取扱情報を注記しない。
- 固有名を掲載しない案件は、業種・事業特性に沿った中立的な組織表記を使用する。
- ホームでは主要な活動だけを表示し、全件は折りたたみ内の案件エクスプローラーで確認できるようにする。
- 各ページの「〜をお考えの方へ」、相談誘導文、本文の相談ボタン、フッターの営業文を表示しない。
- 連絡先は共通SNSアイコンナビに残す。

---

## 7. 編集・拡張のしかた

### お知らせ（プレスリリース）を追加する

1. `news/<slug>.md` を作成する。形式はREADMEの三言語Markdown例を参照。
2. 共通の `date` と言語別の `tag_ja` / `tag_en` / `tag_de` を記載する。
3. `<!-- lang:ja -->` / `<!-- lang:en -->` / `<!-- lang:de -->` の各セクションに `# タイトル` と本文を書く。
4. `.venv/bin/python tools/build_site.py` を実行する。一覧、本文、メタ情報、サイトマップを一括更新する。

タイトル・本文・タグの欠落とセクションの重複をビルド前に検証する。
記事名のハードコードや、Python・JSへの翻訳登録は不要。
任意の `updated` と `description_ja/en/de` で更新日・説明文を明示できる。
Markdownの見出し、リンク、強調、リスト、表、コードブロック等はPython-MarkdownでHTMLに変換する。
編集用ライブラリは `tools/requirements.txt`。配信時のPythonは不要。

### 多言語・SEO・SNS共有

- 日本語を既定とし、`en/` と `de/` に言語別の固有URLを配置。
- 主要ページ・全記事に canonical / hreflang、固有 title / description、OGP、Twitter Card、JSON-LD を設定。
- 記事は静的HTMLと `BlogPosting` 構造化データを生成するため、検索・SNSクローラーが本文と日付を直接取得できる。
- SEO生成の本番基準URLは `tools/build_site.py` の `BASE`（現在 `https://ja.a-kusama.com`）。ドメイン変更時はここを更新する。
- SNS専用横長画像は未生成。現状は既存ポートレートを OGP / Twitter Card に使用。

### 案件・実績を追加／修正する
`assets/data.js` の `PROJECTS` を編集（4 章のフィールド参照）。`stack` の名称を `SKILLS.name` と
一致させると、`SKILLS.kind`（言語・フレームワーク・データベース等）の分類で技術フィルターに出る。
期間フィルターの選択肢は `PROJECTS.start` / `end` から自動生成される。

### ページ・ナビ・リンク・スキルを変える
- ページ追加: HTML を作り、`NAV` に 1 行足す（ヘッダー／ページャーに自動反映）。
- 外部リンク: `LINKS` を編集（`roles` で役割別表示を制御）。
- スキルの年数・レベル: `SKILLS` を編集。

---

## 8. ローカル確認・公開

### ローカル確認

初回は `python3 -m venv .venv` と
`.venv/bin/python -m pip install -r tools/requirements.txt` を実行。

```bash
.venv/bin/python tools/build_site.py
.venv/bin/python -m unittest discover -s tools/tests -v
python3 -m http.server 8000 --bind 127.0.0.1
```

ブラウザは `http://127.0.0.1:8000/` から開く。ルート相対URLなのでHTTP配信が必要。
記事本文は静的HTMLでありCDNのMarkdownライブラリには依存しない。

### GitHub へ公開（この環境に `gh` CLI は無い）
```bash
cd /Users/akira/Documents/Dev/MyPortfolio
git remote add origin https://github.com/<ユーザー名>/MyPortfolio.git
git push -u origin main
```
その後 **Settings → Pages** で Source を `main` / `(root)` に設定。独自ドメインは `CNAME` を追加。

---

## 9. 既知の注意点・ハマりどころ

- **`fetch` 依存**: お知らせ一覧はサーバー配信が前提。記事詳細は静的HTML。
- **Git 日付の再生成**: 記事を編集・コミットした後に `.venv/bin/python tools/build_site.py` を再実行すると、
  `news-index.json` の作成日／更新日が Git 情報に追従する。
- **過去の回帰（教訓）**: 一時 `site.js` の文字列引用符不整合（`…</a>";`）で **site.js 全体が
  読み込めず**、ヘッダー・ナビ・エクスプローラー・お知らせが全ページで停止したことがある
  （コミット `a23a68d` で修正済み）。**site.js を編集したら、必ずブラウザでヘッダーが描画され、
  エクスプローラーにノードが出ることを確認する**こと。
- **旧URL**: `release.html?slug=` は互換用で `noindex`。新規リンクは `/news/<slug>/` を使用。

---

## 10. 未決 TODO（引き継ぎ先へ）

- [ ] GitHub リモート作成＋push（本人の GitHub アカウントが必要）
- [ ] GitHub Pages 有効化・独自ドメイン（`a-kusama.com`）設定の要否

---

## 11. コミット履歴（新しい順）

| ハッシュ | 内容 |
|---|---|
| `a23a68d` | 案件データを充実。site.js 回帰（引用符不整合）を修正 |
| `a332a78` | 案件エクスプローラー・Markdown リリース・UI 拡大。初版データを追加 |
| `bd6c7a7` | 役割別リンク＋スキル×経歴エクスプローラー（初版） |
| `d75b143` | 複数ページ静的サイト化＋共有 JS 層 |
| `8b57a48` | 初版（目的別リデザイン：engineer / educator / researcher） |

> 参考: 単一ページ版のデザイン提案は Claude Artifact としても存在
> （`https://claude.ai/code/artifact/89a1e012-b571-4c6d-89e2-29e8a5a216d6`）。
> 複数ページ版はページ間遷移が要のため、リポジトリが本体。
