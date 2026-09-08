/* ============================================================
   site.js — 全ページ共通のスクリプト（依存なし / file:// でも動作）
   ・ヘッダー / フッターを全ページに注入
   ・ナビは data.js の NAV から自動生成し、現在ページを自動ハイライト
   ・プレスリリース（お知らせ）を最新順に描画（トップは最新5件）
   ・目的別ページの前後ページャーを自動生成
   ・ライト / ダーク テーマ切替
   ============================================================ */
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* 現在ページのファイル名（例: "engineer.html"）。ルート/末尾スラッシュは index.html 扱い */
  function currentPage() {
    var p = location.pathname.split("/").pop();
    return !p || p === "" ? "index.html" : p;
  }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[1] + "." + m[2] + "." + m[3] : (iso || "");
  }

  /* ---------- ヘッダー（ナビ自動生成 + 現在ページ判定） ---------- */
  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host || !window.NAV || !window.SITE) return;
    var here = currentPage();

    var links = window.NAV.map(function (n) {
      var active = n.href === here ? ' aria-current="page"' : "";
      return (
        '<a href="' + esc(n.href) + '"' + active + ">" +
        '<span class="toc-num">' + esc(n.num) + "</span>" +
        '<span class="lbl-ja">' + esc(n.label) + "</span>" +
        "</a>"
      );
    }).join("");

    host.className = "topbar";
    host.innerHTML =
      '<div class="wrap row">' +
        '<a class="brand" href="index.html">' + esc(SITE.name) +
          ' <span class="seal">◈</span> A.KUSAMA</a>' +
        '<nav class="toc" aria-label="グローバルナビゲーション">' +
          links +
          '<button id="themeBtn" type="button" aria-label="配色を切り替え">◐ THEME</button>' +
        "</nav>" +
      "</div>";
  }

  /* ---------- フッター（外部リンク + 目次 + 落款を自動描画） ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host || !window.LINKS || !window.SITE) return;

    var linkHtml = window.LINKS.map(function (l) {
      return (
        '<a href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
        esc(l.label) + ' <span class="ext">' + esc(l.ext || "↗") + "</span></a>"
      );
    }).join("");

    host.innerHTML =
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          "<div>" +
            '<p class="foot-lead">まずは、実現したい未来について<br>お聞かせください。</p>' +
            '<p class="foot-sub">具体的な仕様が決まっていなくても構いません。開発・教育・研究のいずれのご相談も、最適なロードマップを一緒に描きます。</p>' +
          "</div>" +
          '<nav class="foot-links" aria-label="外部リンク">' + linkHtml + "</nav>" +
        "</div>" +
        '<div class="colophon">' +
          '<div class="fseal"><span>' + esc(SITE.seal || "暁") + "</span></div>" +
          "<small>" + esc(SITE.name) + " ／ " + esc(SITE.nameEn) +
            " — Software Developer, Educator &amp; Researcher.</small>" +
          "<small>Last updated " + esc(SITE.updated) +
            " · Static site, hosted from GitHub.</small>" +
        "</div>" +
      "</div>";
  }

  /* ---------- プレスリリース / お知らせ ---------- */
  function renderPress() {
    var hosts = document.querySelectorAll("[data-press]");
    if (!hosts.length || !window.PRESS) return;

    var items = window.PRESS.slice().sort(function (a, b) {
      return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0; // 新しい順
    });

    hosts.forEach(function (host) {
      var limit = parseInt(host.getAttribute("data-press-limit"), 10);
      var list = isNaN(limit) ? items : items.slice(0, limit);

      if (!list.length) {
        host.innerHTML = '<p class="news-empty">現在、お知らせはありません。</p>';
        return;
      }

      host.innerHTML = list.map(function (p) {
        var linked = p.url && p.url.length;
        var tag = tagName(p, linked);
        var attrs = linked
          ? 'href="' + esc(p.url) + '" target="_blank" rel="noopener"'
          : 'aria-disabled="true"';
        var inner =
          '<span class="date">' + esc(fmtDate(p.date)) + "</span>" +
          '<span class="tag">' + esc(p.tag || "") + "</span>" +
          '<span class="title">' + esc(p.title) + "</span>" +
          '<span class="arw">' + (linked ? "↗" : "") + "</span>";
        return "<" + tag + ' class="news-item' + (linked ? "" : " no-link") + '" ' + attrs + ">" +
               inner + "</" + tag + ">";
      }).join("");
    });
  }
  function tagName(p, linked) { return linked ? "a" : "div"; }

  /* ---------- 目的別ページの前後ページャー ---------- */
  function buildPager() {
    var host = document.getElementById("role-pager");
    if (!host || !window.ROLE_ORDER || !window.NAV) return;
    var here = currentPage();
    var order = window.ROLE_ORDER;
    var i = order.indexOf(here);
    if (i === -1) return;

    function meta(href) {
      return (window.NAV.filter(function (n) { return n.href === href; })[0]) || null;
    }
    var prev = i > 0 ? meta(order[i - 1]) : null;
    var next = i < order.length - 1 ? meta(order[i + 1]) : null;

    var prevHtml = prev
      ? '<a href="' + esc(prev.href) + '"><div class="dir">← Prev</div>' +
        '<div class="t">' + esc(prev.label) + "</div></a>"
      : "<span></span>";
    var nextHtml = next
      ? '<a class="next" href="' + esc(next.href) + '"><div class="dir">Next →</div>' +
        '<div class="t">' + esc(next.label) + "</div></a>"
      : "<span></span>";
    host.className = "pager";
    host.innerHTML = prevHtml + nextHtml;
  }

  /* ---------- テーマ切替 ---------- */
  function initTheme() {
    var root = document.documentElement;
    function sysDark() {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    try {
      var saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
    } catch (e) {}

    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("#themeBtn");
      if (!btn) return;
      var cur = root.getAttribute("data-theme") || (sysDark() ? "dark" : "light");
      var nextT = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", nextT);
      try { localStorage.setItem("theme", nextT); } catch (e) {}
    });
  }

  function init() {
    buildHeader();
    buildFooter();
    renderPress();
    buildPager();
    initTheme();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
