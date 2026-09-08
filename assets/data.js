/* ============================================================
   data.js — サイト全体の単一データソース
   このファイルを編集するだけで、全ページのナビ・リンク・お知らせが
   自動的に更新されます（site.js が読み込んで各ページに反映）。
   ============================================================ */

/* サイト基本情報 */
window.SITE = {
  name:   "草間 暁",
  nameEn: "AKIRA KUSAMA",
  roleline: "Software Developer · Educator · Researcher",
  seal:   "暁",
  updated: "2026-09",           // フッターの「最終更新」に自動表示
};

/* グローバルナビ（=単一ソース）。
   ここに1行足すだけで、全ページのヘッダーとフッター目次に反映され、
   現在ページは自動でハイライトされます。 */
window.NAV = [
  { href:"index.html",      label:"ホーム",     en:"Home",       num:"00" },
  { href:"engineer.html",   label:"エンジニア", en:"Engineer",   num:"01" },
  { href:"educator.html",   label:"教育者",     en:"Educator",   num:"02" },
  { href:"researcher.html", label:"研究者",     en:"Researcher", num:"03" },
  { href:"profile.html",    label:"経歴",       en:"Profile",    num:"04" },
  { href:"news.html",       label:"お知らせ",   en:"News",       num:"05" },
];

/* 目的別ページの前後リンク（pager 自動生成用の順序） */
window.ROLE_ORDER = ["engineer.html","educator.html","researcher.html"];

/* 外部リンク（フッターは全件、各役割ページは roles で絞り込み自動表示）
   roles: "engineer" / "educator" / "researcher" のうち、その項目に合うものを列挙 */
window.LINKS = [
  { label:"GitHub",       href:"https://github.com/kackey621",             ext:"↗",      roles:["engineer"] },
  { label:"researchmap",  href:"https://ja.a-kusama.com/researcher/",       ext:"↗",      roles:["researcher"] },
  { label:"ORCID",        href:"https://ja.a-kusama.com/researcher/",       ext:"↗",      roles:["researcher"] },
  { label:"Blog / Notes", href:"https://notes.a-kusama.com/index.php/ja/",  ext:"↗",      roles:["educator","engineer"] },
  { label:"Instagram",    href:"https://www.instagram.com/akirakusama/",    ext:"↗",      roles:["educator"] },
  { label:"X (Twitter)",  href:"https://x.com/akirakusamajp",              ext:"↗",      roles:["engineer","educator","researcher"] },
  { label:"お問い合わせ", href:"https://ja.a-kusama.com/contact-me/",       ext:"MAIL ↗", roles:["engineer","educator","researcher"] },
];

/* ============================================================
   スキル（フィルター用）
   ・level … 3=メイン / 2=実務あり / 1=利用可能
   ・years … スキルシート上の経験年数（目安）
   ============================================================ */
window.SKILLS = [
  { name:"PHP",         kind:"言語",           level:3, years:5 },
  { name:"Ruby",        kind:"言語",           level:3, years:5 },
  { name:"JavaScript",  kind:"言語",           level:2, years:5 },
  { name:"Python",      kind:"言語",           level:2, years:4 },
  { name:"HTML/CSS",    kind:"言語",           level:2, years:5 },
  { name:"R",           kind:"言語",           level:1, years:2 },
  { name:"Laravel",     kind:"フレームワーク",   level:3, years:5 },
  { name:"Rails",       kind:"フレームワーク",   level:3, years:5 },
  { name:"Vue",         kind:"フレームワーク",   level:2, years:4 },
  { name:"React",       kind:"フレームワーク",   level:2, years:3 },
  { name:"Flask",       kind:"フレームワーク",   level:1, years:1 },
  { name:"FastAPI",     kind:"フレームワーク",   level:1, years:1 },
  { name:"MySQL",       kind:"データベース",     level:3, years:6 },
  { name:"PostgreSQL",  kind:"データベース",     level:3, years:6 },
  { name:"AWS",         kind:"インフラ",         level:2, years:5 },
  { name:"Azure",       kind:"インフラ",         level:2, years:3 },
  { name:"Linux",       kind:"インフラ",         level:2, years:5 },
  { name:"Docker",      kind:"インフラ",         level:2, years:5 },
  { name:"WordPress",   kind:"プロダクト",       level:3, years:10 },
  { name:"EC-CUBE",     kind:"プロダクト",       level:2, years:7 },
  { name:"Moodle",      kind:"プロダクト",       level:2, years:5 },
  { name:"Magento",     kind:"プロダクト",       level:1, years:3 },
];

/* ============================================================
   組織（org 名のリンク先。案件によっては非公開）
   ============================================================ */
window.ORGS = {
  willen:  { name:"特定非営利活動法人 Willen", url:"https://ja.a-kusama.com/" },
  waseda:  { name:"早稲田大学高等学院",        url:"https://www.waseda.jp/school/shs/" },
  kadokawa:{ name:"角川ドワンゴ学園（N高・S高）", url:"https://nnn.ed.jp/" },
  client:  { name:"受託・SES（クライアント非公開）", url:"" },
};

/* ============================================================
   案件・実績（スキルシートより）
   ・工程 phases … [要件定義, 基本設計, 詳細設計, 実装, テスト, 保守運用]
   ・start/end … "YYYY-MM"（end 省略 = 継続中）
   ・org … ORGS のキー
   profile / engineer / educator の #project-explorer が、
   フィルター＋ポップアップの実績ビューとして描画します。
   ※ 各案件の詳細説明（散文）は今後追記予定。
   ============================================================ */
var PH = ["要件定義","基本設計","詳細設計","実装","テスト","保守運用"];
window.PHASE_LABELS = PH;
window.PROJECTS = [
  { id:"p01", org:"client", role:"フルスタックエンジニア", cat:"engineer",
    start:"2020-04", end:null, months:78, team:1,
    domain:"EC・CMS・LMS・社内インフラを横断する受託／SES開発",
    phases:[1,1,1,1,1,1],
    stack:["PHP","Laravel","Rails","FastAPI","Flask","React","Vue","MySQL","PostgreSQL","SQLite","Linux","Apache","nginx","AWS","Azure","Moodle","Prestashop","WordPress","EC-CUBE","Magento","WooCommerce","Drupal","Google Workspace","GitHub","VS Code"] },
  { id:"p07", org:"client", role:"リードエンジニア／マネジメント", cat:"engineer",
    start:"2022-04", end:null, months:54, team:15, sub:5,
    domain:"LMS（Moodle）・EC 構築を含む大規模受託開発",
    phases:[1,1,1,1,1,1],
    stack:["PHP","Rails","React","Vue","MySQL","nginx","AWS","Azure","Ubuntu","Moodle","Prestashop","WordPress","WooCommerce","Google Workspace"] },
  { id:"p06", org:"client", role:"エンジニア", cat:"engineer",
    start:"2022-01", end:"2024-09", months:33, team:5, sub:3,
    domain:"LMS（Moodle）・EC・CMS の受託開発・運用",
    phases:[1,1,1,1,1,1],
    stack:["PHP","Rails","React","Vue","MySQL","Apache","nginx","AWS","Azure","GAS","Ubuntu","Redhat","Moodle","Prestashop","WordPress","EC-CUBE","WooCommerce","Google Workspace"] },
  { id:"p05", org:"client", role:"エンジニア", cat:"engineer",
    start:"2023-08", end:"2024-07", months:12, team:3,
    domain:"CMS 移行・PHP 開発",
    phases:[1,1,1,1,1,0],
    stack:["PHP","MariaDB","Linux","VS Code","Teams"] },
  { id:"p04", org:"client", role:"エンジニア（PM 兼務）", cat:"engineer",
    start:"2023-10", end:"2024-02", months:5, team:1,
    domain:"業務系 Web アプリ開発",
    phases:[1,1,1,1,1,0],
    stack:["PHP","Laravel","Vue","MariaDB","Linux","Slack","GitHub","VS Code"] },
  { id:"p02", org:"client", role:"エンジニア", cat:"engineer",
    start:"2025-01", end:"2025-04", months:4, team:11,
    domain:"R&D／BtoBtoC 向け Web アプリ開発",
    phases:[0,0,1,1,1,1],
    stack:["Rails","Flask","Ruby","Python","R","SQLite","Ubuntu","VS Code","Teams","Git"] },
  { id:"p03", org:"client", role:"エンジニア", cat:"engineer",
    start:"2024-09", end:"2024-12", months:4, team:3,
    domain:"AI を用いた Web アプリ開発",
    phases:[0,0,0,1,1,1],
    stack:["React","Vue","Python","MySQL","Linux","AWS","Slack","GitHub","VS Code"] },
  { id:"p10", org:"client", role:"エンジニア", cat:"engineer",
    start:"2022-12", end:"2023-04", months:5, team:3,
    domain:"認証基盤（IdP／SSO）開発",
    phases:[1,1,1,1,1,0],
    stack:["Rails","React","Vue","PostgreSQL","AWS"] },
  { id:"p11", org:"client", role:"エンジニア", cat:"engineer",
    start:"2021-04", end:"2022-08", months:17, team:3, sub:3,
    domain:"Web アプリ開発（Google 連携）",
    phases:[0,0,0,1,1,1],
    stack:["Rails","React","Vue","MySQL","AWS"] },
  { id:"p08", org:"waseda", role:"情報科 ティーチング・アシスタント", cat:"educator",
    start:"2022-09", end:"2024-09", months:24, team:5,
    domain:"高校 情報科 プログラミング授業の TA（R）",
    phases:[0,0,0,0,0,0],
    stack:["R"] },
  { id:"p09", org:"kadokawa", role:"プログラミング指導メンター", cat:"educator",
    start:"2022-09", end:"2023-04", months:8, team:20,
    domain:"N高・S高 オンライン・プログラミング指導",
    phases:[0,0,0,0,0,0],
    stack:["HTML/CSS","JavaScript"] },
];

/* ============================================================
   プレスリリース / お知らせ
   - 新しい順に並べ替えて表示（date は "YYYY-MM-DD"）
   - トップページは最新5件、news.html は全件を自動描画
   - tag: 種別ラベル / url: 詳細先（空文字ならリンクなし表示）

   新規追加の記入例（先頭に足すだけ。日付順は自動整列されます）:
     { date:"2026-04-01", tag:"リリース", title:"新サービス『○○』を公開しました", url:"https://…" },
   ============================================================ */
/* ↓ news-index.json が取得できない場合のフォールバック（slug は news/<slug>.md に対応）。
   通常は tools/build_news.py が生成する assets/news-index.json が使われます。 */
window.PRESS = [
  { date:"2025-09-01", tag:"資格", slug:"license-joho-2025",       title:"高等学校 情報科の教育職員免許状が交付されました" },
  { date:"2025-04-01", tag:"進学", slug:"meisei-2025",            title:"明星大学 通信教育課程（教科専門コース・高校公民）に入学しました" },
  { date:"2024-07-31", tag:"活動", slug:"waseda-ta-end-2024",     title:"早稲田大学高等学院 情報科TA（2022–2024）の任期を満了しました" },
  { date:"2022-09-01", tag:"活動", slug:"waseda-ta-2022",         title:"早稲田大学高等学院にて情報科ティーチング・アシスタントに着任" },
  { date:"2022-04-01", tag:"就任", slug:"willen-2022",            title:"特定非営利活動法人 Willen の理事長に就任しました" },
  { date:"2021-04-01", tag:"受賞", slug:"award-thesis-2021",      title:"早稲田大学高等学院 第72期 優秀論文作品賞を受賞" },
  { date:"2020-04-01", tag:"独立", slug:"freelance-2020",         title:"フリーランスエンジニアとして活動を開始しました" },
  { date:"2019-05-01", tag:"受賞", slug:"nikkei-stockleague-2019", title:"日経STOCKリーグ 入選（日本経済新聞社）" },
];
