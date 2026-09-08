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
  { href:"",              label:"ホーム",     en:"Home",       num:"00" },
  { href:"engineer/",     label:"エンジニア", en:"Engineer",   num:"01" },
  { href:"educator/",     label:"教育者",     en:"Educator",   num:"02" },
  { href:"researcher/",   label:"研究者",     en:"Researcher", num:"03" },
  { href:"profile/",      label:"経歴",       en:"Profile",    num:"04" },
  { href:"news/",         label:"お知らせ",   en:"News",       num:"05" },
];

/* 目的別ページの前後リンク（pager 自動生成用の順序） */
window.ROLE_ORDER = ["engineer/","educator/","researcher/"];

/* 外部リンク（フッターは全件、各役割ページは roles で絞り込み自動表示）
   roles: "engineer" / "educator" / "researcher" のうち、その項目に合うものを列挙 */
window.LINKS = [
  { label:"GitHub",       icon:"github",    href:"https://github.com/kackey621",             ext:"↗",      roles:["engineer"] },
  { label:"LinkedIn",     icon:"linkedin",  href:"https://jp.linkedin.com/in/akira-kusama",   ext:"↗",      roles:["engineer","educator","researcher"] },
  { label:"researchmap",  icon:"research",  href:"https://ja.a-kusama.com/researcher/",       ext:"↗",      roles:["researcher"] },
  { label:"ORCID",        icon:"orcid",     href:"https://ja.a-kusama.com/researcher/",       ext:"↗",      roles:["researcher"] },
  { label:"Blog / Notes", icon:"notes",     href:"https://notes.a-kusama.com/index.php/ja/",  ext:"↗",      roles:["educator","engineer"] },
  { label:"Instagram",    icon:"instagram", href:"https://www.instagram.com/akirakusama/",    ext:"↗",      roles:["educator"] },
  { label:"X",            icon:"x",         href:"https://x.com/akirakusamajp",              ext:"↗",      roles:["engineer","educator","researcher"] },
];

/* ============================================================
   Google Analytics（GA4）+ GDPR 同意
   ・id に GA4 の測定 ID（例 "G-XXXXXXXXXX"）を入れると有効化される。
   ・id が空の間は Cookie バナーも解析も出ない（＝追跡すべきものが無い）。
   ・同意（Accept）を押したときだけ GA を読み込む。拒否（Reject）では
     一切読み込まない＝Cookie も送信も発生しない（site.js 参照）。
   ============================================================ */
window.ANALYTICS = { id: "" };

/* ============================================================
   スキル（フィルター用）
   ・level … 3=メイン / 2=実務あり / 1=利用可能
   ・years … 経験年数（目安）
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
   案件・実績
   ・org … 表示名と外部リンク
   ・phases … [要件定義, 基本設計, 詳細設計, 実装, テスト, 保守運用]
   ・start/end … "YYYY-MM"（end 省略 = 継続中）
   ・service … サービス概要 / body … 担当した業務内容
   profile / engineer / educator の #project-explorer が、
   フィルター＋ポップアップの実績ビューとして描画します。
   ============================================================ */
var PH = ["要件定義","基本設計","詳細設計","実装","テスト","保守運用"];
window.PHASE_LABELS = PH;

var WILLEN   = { name:"特定非営利活動法人 Willen",              url:"https://ja.a-kusama.com/" };
var WASEDA   = { name:"早稲田大学高等学院",                    url:"https://www.waseda.jp/school/shs/" };
var KADOKAWA = { name:"角川ドワンゴ学園（N高・S高）",           url:"https://nnn.ed.jp/" };
var FLN      = { name:"株式会社フューチャーリンクネットワーク", url:"https://www.futurelink.co.jp/" };
function anon(n){
  var labels = { K:"Web制作会社", O:"システム開発会社", S:"情報通信企業", H:"AI開発企業", C:"Webサービス企業" };
  return { name:labels[n]||"クライアント企業", url:"" };
}
function anonNpo(){ return { name:"福祉サービス事業者", url:"" }; }

window.PROJECTS = [
  { id:"p01", org:{name:"フリーランス受託",url:""}, industry:"情報", role:"業務委託／受託・フルスタックエンジニア", cat:"engineer",
    start:"2020-04", end:null, months:78, team:1,
    domain:"フリーランスによるシステム開発受託",
    service:"業務基幹システム／オンラインサービス開発、情報システム導入支援、IT コンサルティング",
    body:[
      "Moodle を用いたラーニングシステムの導入・運用",
      "EC-CUBE・Magento・Prestashop・WooCommerce 等の EC サイト導入支援",
      "PBX・Office365・Google Workspace・独自 ERP・SSO・キッティング等の社内システム運用提案",
      "WordPress・Drupal 等 CMS の導入・運用支援",
      "オンプレミスからクラウド（Azure・AWS）への移行支援",
      "運用教育・IT リテラシー教育、要件定義から運用までの一貫対応（一部 VibeCoding）",
      "企業 IT 顧問・IT ヘルプデスク・非常勤社内 SE"
    ],
    phases:[1,1,1,1,1,1],
    stack:["PHP","Laravel","Ruby","Rails","FastAPI","Flask","VB","React","Vue","MySQL","PostgreSQL","SQLite","Linux","Apache","nginx","AWS","Azure","Moodle","Prestashop","WordPress","EC-CUBE","Magento","WooCommerce","Drupal","O365","Google Workspace"] },

  { id:"p07", org:WILLEN, industry:"情報", role:"理事長", cat:"engineer",
    start:"2022-04", end:null, months:54, team:15, sub:5,
    domain:"業務基幹システム・オンライン講座基盤の開発運用",
    service:"業務基幹システム開発運用、オンラインサービス開発、情報システム担当",
    body:[
      "理事長として非営利活動の指揮、および新しいデジタルシステムの導入提案",
      "Moodle によるラーニングシステムの構築・運用",
      "WooCommerce を用いたオンラインチケット販売システムの構築・運用",
      "PBX・Office365・Google Workspace の導入と SAML 認証導入"
    ],
    phases:[1,1,1,1,1,1],
    stack:["PHP","Ruby","Rails","React","Vue","MySQL","Ubuntu","nginx","AWS","Azure","Moodle","Prestashop","WordPress","O365","Google Workspace"] },

  { id:"p06", org:anonNpo("S"), industry:"福祉", role:"職員", cat:"engineer",
    start:"2022-01", end:"2024-09", months:33, team:5, sub:3,
    domain:"業務基幹システム・オンライン講座基盤の開発運用",
    service:"業務基幹システム開発運用、オンラインサービス開発、情報システム担当",
    body:[
      "Moodle によるラーニングシステムの構築・運用",
      "WooCommerce を用いたオンラインチケット販売システムの構築・運用",
      "PBX・Office365・Google Workspace の導入と SAML 認証導入"
    ],
    phases:[1,1,1,1,1,1],
    stack:["PHP","Ruby","Rails","React","Vue","MySQL","Ubuntu","Redhat","Apache","nginx","AWS","Azure","GAS","Moodle","Prestashop","WordPress","EC-CUBE","O365","Google Workspace"] },

  { id:"p05", org:anon("K"), industry:"情報", role:"パート・専任エンジニア", cat:"engineer",
    start:"2023-08", end:"2024-07", months:12, team:3, sub:3,
    domain:"CMS サイト開発",
    service:"CMS サイト開発",
    body:[
      "プロジェクト専任エンジニアとして、複数プロダクトの制作を同時並行で担当",
      "PHP を用いた CMS 開発をチームで推進",
      "大企業案件から小規模案件まで幅広く対応"
    ],
    phases:[1,1,1,1,1,0],
    stack:["PHP","MariaDB","Linux","Teams","VS Code"] },

  { id:"p04", org:anon("O"), industry:"情報", role:"業務委託・PM 兼コーダー", cat:"engineer",
    start:"2023-10", end:"2024-02", months:5, team:1,
    domain:"業務用地図アプリケーションの開発",
    service:"業務用地図アプリケーションの開発",
    body:[
      "Laravel を用いた業務用地図アプリケーションを開発",
      "仕様が固まらない中で、機能改善・操作性向上・デバッグに主体的に従事"
    ],
    phases:[1,1,1,1,1,0],
    stack:["PHP","Laravel","React","Vue","MariaDB","Linux","Slack","GitHub","VS Code"] },

  { id:"p02", org:anon("S"), industry:"情報", role:"業務委託", cat:"engineer",
    start:"2025-01", end:"2025-04", months:4, team:11,
    domain:"R&D／BtoBtoC 会員・イベント管理 Web システム開発",
    service:"R&D／BtoBtoC の会員・イベント管理 Web システム開発",
    body:[
      "某大企業での通信システム関連 R&D に従事",
      "Flask を用いたシステム開発を一人称で担当",
      "イベントチケットの販売・決済サイトを設計から運用まで担当",
      "既存システムを巻き取り、コードリーディングと仕様書作成を実施"
    ],
    phases:[0,0,1,1,1,1],
    stack:["Python","Flask","Ruby","Rails","SQLite","Ubuntu","Teams","Git","VS Code"] },

  { id:"p03", org:anon("H"), industry:"情報", role:"業務委託・コーダー", cat:"engineer",
    start:"2024-09", end:"2024-12", months:4, team:3,
    domain:"AI を活用した受託開発システムの運用・保守",
    service:"受託システム開発",
    body:["コーダーとして、AI を活用した受託開発システムの運用・保守を担当"],
    phases:[0,0,0,1,1,1],
    stack:["Python","React","Vue","MySQL","Linux","AWS","Slack","GitHub","VS Code"] },

  { id:"p10", org:anon("C"), industry:"サービス", role:"コーダー", cat:"engineer",
    start:"2022-12", end:"2023-04", months:5, team:3,
    domain:"認証基盤（IdP）に向けた技術調査",
    service:"Web アプリケーション",
    body:["自社プロダクト開発に向けて、技術（IdP・利用スタック）を調査"],
    phases:[1,1,1,1,1,0],
    stack:["Ruby","Rails","React","Vue","PostgreSQL","AWS"] },

  { id:"p11", org:FLN, industry:"サービス", role:"コーダー", cat:"engineer",
    start:"2021-04", end:"2022-08", months:17, team:3, sub:3,
    domain:"地域コミュニティサイト「コミュチカ」の制作・運用",
    service:"Web アプリケーション（地域コミュニティサイト）",
    body:[
      "地域コミュニティサイト「コミュチカ」の制作・運用を担当",
      "アカウント関連システムの構築、運用中のバグ修正、パンくず・カテゴリ別表示機能の実装",
      "Google マイビジネス関連の新規事業立ち上げに伴うログイン・アカウント作成システムの構築"
    ],
    phases:[0,0,0,1,1,1],
    stack:["Ruby","Rails","React","Vue","MySQL","AWS"] },

  { id:"p08", org:WASEDA, industry:"サービス（教育）", role:"情報科 ティーチング・アシスタント", cat:"educator",
    start:"2022-09", end:"2024-09", months:24, team:5,
    domain:"高校 情報科 授業の運営支援（R）",
    service:"情報科授業の運営支援",
    body:[
      "高校生への情報授業支援",
      "R 言語を用いたプログラミングの指導・支援"
    ],
    phases:[0,0,0,0,0,0],
    stack:["R"] },

  { id:"p09", org:KADOKAWA, industry:"サービス（教育）", role:"プログラミング指導メンター（TA）", cat:"educator",
    start:"2022-09", end:"2023-04", months:8, team:20,
    domain:"学園生へのプログラミングコーチング",
    service:"学園生へのプログラミングコーチング",
    body:[
      "初学者を対象とした HTML/CSS/JavaScript のコーディング指導",
      "面談形式で週1回、宿題のコード評価や不明点の解消に対応"
    ],
    phases:[0,0,0,0,0,0],
    stack:["HTML/CSS","JavaScript"] },
];

/* News content is generated from news/*.md into assets/news-data.js. */
