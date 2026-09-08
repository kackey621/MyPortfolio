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

/* 外部リンク（フッターに自動描画） */
window.LINKS = [
  { label:"お問い合わせ",        href:"https://ja.a-kusama.com/contact-me/", ext:"MAIL ↗" },
  { label:"GitHub",              href:"https://github.com/kackey621",        ext:"↗" },
  { label:"X (Twitter)",         href:"https://x.com/akirakusamajp",         ext:"↗" },
  { label:"Instagram",           href:"https://www.instagram.com/akirakusama/", ext:"↗" },
  { label:"Blog / Notes",        href:"https://notes.a-kusama.com/index.php/ja/", ext:"↗" },
  { label:"researchmap · ORCID", href:"https://ja.a-kusama.com/researcher/",  ext:"↗" },
];

/* ============================================================
   プレスリリース / お知らせ
   - 新しい順に並べ替えて表示（date は "YYYY-MM-DD"）
   - トップページは最新5件、news.html は全件を自動描画
   - tag: 種別ラベル / url: 詳細先（空文字ならリンクなし表示）

   新規追加の記入例（先頭に足すだけ。日付順は自動整列されます）:
     { date:"2026-04-01", tag:"リリース", title:"新サービス『○○』を公開しました", url:"https://…" },
   ============================================================ */
window.PRESS = [
  { date:"2025-09-01", tag:"資格",   title:"高等学校 情報科の教育職員免許状が交付されました", url:"" },
  { date:"2025-04-01", tag:"進学",   title:"明星大学 通信教育課程（教科専門コース・高校公民）に入学しました", url:"" },
  { date:"2024-07-31", tag:"活動",   title:"早稲田大学高等学院 情報科TA（2022–2024）の任期を満了しました", url:"" },
  { date:"2022-09-01", tag:"活動",   title:"早稲田大学高等学院にて情報科ティーチング・アシスタントに着任", url:"" },
  { date:"2022-04-01", tag:"就任",   title:"特定非営利活動法人 Willen の理事長に就任しました", url:"" },
  { date:"2021-04-01", tag:"受賞",   title:"早稲田大学高等学院 第72期 優秀論文作品賞を受賞", url:"" },
  { date:"2020-04-01", tag:"独立",   title:"フリーランスエンジニアとして活動を開始しました", url:"" },
  { date:"2019-05-01", tag:"受賞",   title:"日経STOCKリーグ 入選（日本経済新聞社）", url:"" },
];
