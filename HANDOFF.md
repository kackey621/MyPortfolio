# 引き継ぎ資料 — MyPortfolio（草間 暁 ポートフォリオ）

このドキュメントは、本リポジトリのこれまでの制作内容・設計・データ構造・編集方法・未決事項を、
別の担当者（または別セッション）が引き継げるようにまとめたものです。

- 対象リポジトリ: `/Users/akira/Documents/Dev/MyPortfolio`
- 種別: 依存ライブラリなしの**静的マルチページサイト**（GitHub Pages 想定）
- 参照元（旧サイト）: https://ja.a-kusama.com/
- 最終更新: 2026-09（コミット `a23a68d` 時点）

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

## 3. ディレクトリ構成

```
.
├── index.html          # トップ（概要・自己紹介・目的別入口・実績・お知らせ最新5件）
├── engineer.html       # 目的別詳細：エンジニア（できること・開発実績・役割別リンク）
├── educator.html       # 目的別詳細：教育者（指導歴・資格・指導実績）
├── researcher.html     # 目的別詳細：研究者（研究関心・在籍・外部プロフィール）
├── profile.html        # 経歴（案件・実績エクスプローラー／職歴学歴／資格受賞国際交流）
├── news.html           # お知らせ一覧（全件）
├── release.html        # お知らせ詳細（?slug= で news/<slug>.md を marked で描画）
├── news/               # リリース記事（Markdown・1件1ファイル）
│   └── *.md            #   フロントマター: title / tag / date
├── tools/
│   └── build_news.py   # news/*.md → assets/news-index.json（Git 日付を付与）
├── assets/
│   ├── style.css       # 全ページ共通スタイル（トークン・全コンポーネント）
│   ├── data.js         # ★単一データソース（下記 4 章）
│   ├── site.js         # ★共通スクリプト（下記 5 章）
│   ├── news-index.json # build_news.py の生成物（お知らせ一覧＋日付）
│   └── akira-kusama.jpg # ポートレート
├── .nojekyll           # GitHub Pages で Jekyll を無効化
├── .gitignore
├── README.md           # 利用者向けの概要（公開手順など）
└── HANDOFF.md          # 本ドキュメント
```

**設計の要点**: ヘッダー・フッター・ナビ・案件・お知らせは各 HTML に直接書かず、
`assets/site.js` が `assets/data.js`（＋`news-index.json`）を読み込んで**全ページへ注入・描画**する。
ページを増やす／内容を変える作業は、原則 `data.js` の編集だけで完結する。

---

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
| `PRESS` | `news-index.json` が取得できない場合のフォールバック（`{date,tag,slug,title}`） |

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
| `buildHeader()` | ヘッダーを注入。`NAV` から生成し、現在ページを `aria-current` で自動ハイライト |
| `buildFooter()` | フッター（外部リンク＋コロフォン）を注入 |
| `renderPress()` | `[data-press]` に描画。`assets/news-index.json` を優先取得、失敗時は `PRESS` にフォールバック。`data-press-limit` で件数制限（トップは 5）。各項目は `release.html?slug=` へリンク |
| `renderRoleLinks()` | `[data-role-links="engineer"]` 等に、その役割の外部リンクを表示 |
| `renderProjectExplorer()` | `[data-projects]`（任意で `data-projects-role`）に**案件エクスプローラー**を描画。技術フィルター＋アニメーション付きフロー＋クリックでポップアップ詳細（組織／参画情報／工程／技術／業務内容）。`?skill=` で初期フィルター可 |
| `buildPager()` | 目的別ページの前後ページャーを `ROLE_ORDER` から生成 |
| `initTheme()` | ライト／ダーク切替（`localStorage` 保存） |

### HTML 側のフック（各ページに置くだけ）

```html
<header id="site-header"></header>        <!-- ヘッダー注入先 -->
<footer id="site-footer"></footer>        <!-- フッター注入先 -->
<div data-press data-press-limit="5"></div>          <!-- お知らせ最新5件 -->
<div data-projects></div>                            <!-- 全案件エクスプローラー -->
<div data-projects data-projects-role="engineer"></div> <!-- 役割で絞った案件 -->
<div data-role-links="engineer"></div>               <!-- 役割別リンク -->
<div id="role-pager"></div>                          <!-- 前後ページャー -->
<script src="assets/data.js"></script>
<script src="assets/site.js"></script>
```

---

## 6. データの出所と匿名化方針（重要）

案件データは本人のスキルシートに由来。

- 提供された `.csv` は**日本語が全て文字化け（`?`）して失われていた**ため使用不可。
- **`.xlsx`（`~/Downloads/2512_SkillSheet_AKIRA.xlsx`）は日本語が保持**されており、こちらから抽出した。
  （このマシンに `openpyxl` が無いため、`zipfile` + `xml.etree` で `sharedStrings.xml`/`sheet1.xml` を直接パースした。）

**組織名の扱い**:
- 公開＝実名＋リンク: **Willen**（本人の NPO・理事長）／**早稲田大学高等学院**（情報科 TA）／
  **角川ドワンゴ学園（N高・S高）**（指導メンター）／**株式会社フューチャーリンクネットワーク**
  （案件「コミュチカ」。本人が自己 PR 内で社名を明記していたため実名採用）。
- SES クライアント（株式会社 S/H/O/K/C、特定非営利活動法人 S）は**匿名**（「株式会社S（非公開）」等）。

> ⚠️ **未確認事項**: フューチャーリンクネットワークを匿名（株式会社F）に戻すか、他に公開可能な
> クライアントがあるかは本人確認待ち。スキルシートの年齢・フルリモート等の掲載可否も未確認。

---

## 7. 編集・拡張のしかた

### お知らせ（プレスリリース）を追加する
1. `news/<slug>.md` を作成（フロントマター必須）:
   ```markdown
   ---
   title: "タイトル"
   tag: "リリース"
   date: "2026-04-01"
   ---

   # タイトル

   本文（Markdown）…
   ```
2. `python3 tools/build_news.py` を実行 → `assets/news-index.json` を再生成。
3. トップ（最新5件）と `news.html`（全件）に自動反映。詳細は `release.html?slug=<slug>`。

### 案件・実績を追加／修正する
`assets/data.js` の `PROJECTS` を編集（4 章のフィールド参照）。`stack` の名称を `SKILLS.name` と
一致させると技術フィルターの対象になる。

### ページ・ナビ・リンク・スキルを変える
- ページ追加: HTML を作り、`NAV` に 1 行足す（ヘッダー／ページャーに自動反映）。
- 外部リンク: `LINKS` を編集（`roles` で役割別表示を制御）。
- スキルの年数・レベル: `SKILLS` を編集。

---

## 8. ローカル確認・公開

### ローカル確認（**簡易サーバー必須**）
```bash
cd /Users/akira/Documents/Dev/MyPortfolio
python3 -m http.server 8000
# → http://localhost:8000
```
`release.html` と一覧の自動描画は `fetch` を使うため、`file://` 直開きでは動かない
（一覧は `data.js` フォールバック表示、詳細は不可）。GitHub Pages では問題なし。

### GitHub へ公開（この環境に `gh` CLI は無い）
```bash
cd /Users/akira/Documents/Dev/MyPortfolio
git remote add origin https://github.com/<ユーザー名>/MyPortfolio.git
git push -u origin main
```
その後 **Settings → Pages** で Source を `main` / `(root)` に設定。独自ドメインは `CNAME` を追加。

---

## 9. 既知の注意点・ハマりどころ

- **`fetch` 依存**: お知らせ描画とリリース詳細はサーバー配信が前提（上記）。
- **Git 日付の再生成**: 記事を編集・コミットした後に `python3 tools/build_news.py` を再実行すると、
  `news-index.json` の作成日／更新日が Git 情報に追従する。
- **過去の回帰（教訓）**: 一時 `site.js` の文字列引用符不整合（`…</a>";`）で **site.js 全体が
  読み込めず**、ヘッダー・ナビ・エクスプローラー・お知らせが全ページで停止したことがある
  （コミット `a23a68d` で修正済み）。**site.js を編集したら、必ずブラウザでヘッダーが描画され、
  エクスプローラーにノードが出ることを確認する**こと。
- **CDN 制約**: `marked`（`release.html`）は cdnjs から読み込み。オフラインでは詳細本文が出ない。

---

## 10. 未決 TODO（引き継ぎ先へ）

- [ ] フューチャーリンクネットワーク（案件#11）の実名可否を本人に確認
- [ ] 他 SES クライアントで公開可能なものがあるか確認
- [ ] スキルシートの年齢・勤務形態などの追加掲載可否
- [ ] GitHub リモート作成＋push（本人の GitHub アカウントが必要）
- [ ] GitHub Pages 有効化・独自ドメイン（`a-kusama.com`）設定の要否

---

## 11. コミット履歴（新しい順）

| ハッシュ | 内容 |
|---|---|
| `a23a68d` | スキルシート実データ（.xlsx）で案件を充実。site.js 回帰（引用符不整合）を修正 |
| `a332a78` | 案件エクスプローラー・Markdown リリース・UI 拡大。CSV ベースの初版データ |
| `bd6c7a7` | 役割別リンク＋スキル×経歴エクスプローラー（初版） |
| `d75b143` | 複数ページ静的サイト化＋共有 JS 層 |
| `8b57a48` | 初版（目的別リデザイン：engineer / educator / researcher） |

> 参考: 単一ページ版のデザイン提案は Claude Artifact としても存在
> （`https://claude.ai/code/artifact/89a1e012-b571-4c6d-89e2-29e8a5a216d6`）。
> 複数ページ版はページ間遷移が要のため、リポジトリが本体。
