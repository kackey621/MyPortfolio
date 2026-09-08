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

  /* ---------- 役割別リンク（各詳細ページ） ---------- */
  function renderRoleLinks() {
    var hosts = document.querySelectorAll("[data-role-links]");
    if (!hosts.length || !window.LINKS) return;
    hosts.forEach(function (host) {
      var role = host.getAttribute("data-role-links");
      var list = window.LINKS.filter(function (l) {
        return l.roles && l.roles.indexOf(role) !== -1;
      });
      if (!list.length) { host.hidden = true; return; }
      var items = list.map(function (l) {
        return '<a class="rl" href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
               '<span class="rl-label">' + esc(l.label) + "</span>" +
               '<span class="rl-ext">' + esc(l.ext || "↗") + "</span></a>";
      }).join("");
      host.className = "rolelinks";
      host.innerHTML =
        '<div class="rl-head">この分野のリンク</div>' +
        '<div class="rl-list">' + items + "</div>";
    });
  }

  /* ---------- スキル × 経歴エクスプローラー（双方向クリック連動） ---------- */
  function meterHtml(level) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<i' + (i <= level ? ' class="on"' : "") + "></i>";
    return '<span class="meter" aria-hidden="true">' + s + "</span>";
  }
  var LEVEL_LABEL = { 3: "メイン", 2: "実務あり", 1: "利用可能" };

  function renderSkillExplorer() {
    var host = document.getElementById("skill-explorer");
    if (!host || !window.SKILLS || !window.EXPERIENCES) return;
    var SKILLS = window.SKILLS, XPS = window.EXPERIENCES;

    /* スキル一覧（種別ごと） */
    var kinds = [];
    SKILLS.forEach(function (s) { if (kinds.indexOf(s.kind) === -1) kinds.push(s.kind); });
    var skillsHtml = kinds.map(function (k) {
      var rows = SKILLS.filter(function (s) { return s.kind === k; }).map(function (s) {
        return '<button type="button" class="sk" data-skill="' + esc(s.name) + '" aria-pressed="false">' +
                 '<span class="sk-name">' + esc(s.name) + "</span>" +
                 meterHtml(s.level) +
                 '<span class="sk-lv">' + esc(LEVEL_LABEL[s.level]) + "</span>" +
               "</button>";
      }).join("");
      return '<div class="sk-group"><div class="sk-kind">' + esc(k) + "</div>" + rows + "</div>";
    }).join("");

    /* 経歴カード（新しい順は入力順を尊重） */
    var xpsHtml = XPS.map(function (x) {
      var tags = (x.skills || []).map(function (n) {
        return '<span class="xp-tag" data-skill="' + esc(n) + '">' + esc(n) + "</span>";
      }).join("");
      return '<button type="button" class="xp" data-xp="' + esc(x.id) + '" aria-pressed="false">' +
               '<span class="xp-period">' + esc(x.period) + "</span>" +
               '<span class="xp-title">' + esc(x.title) + "</span>" +
               '<span class="xp-desc">' + esc(x.desc || "") + "</span>" +
               (tags ? '<span class="xp-tags">' + tags + "</span>" : "") +
             "</button>";
    }).join("");

    host.className = "explorer";
    host.innerHTML =
      '<div class="exp-legend"><span class="lg"><b>' + meterHtml(3) + '</b> メイン</span>' +
        '<span class="lg">' + meterHtml(2) + " 実務あり</span>" +
        '<span class="lg">' + meterHtml(1) + " 利用可能</span>" +
        '<span class="lg hint">スキル／経歴をクリックすると連動して絞り込めます</span></div>' +
      '<div class="exp-grid">' +
        '<div class="exp-col exp-skills"><div class="exp-h">スキルスタック<span>Skill stack</span></div>' + skillsHtml + "</div>" +
        '<div class="exp-col exp-career"><div class="exp-h">経歴の流れ<span>Career flow</span></div>' + xpsHtml + "</div>" +
      "</div>" +
      '<div class="exp-status" aria-live="polite" role="status"></div>';

    var skBtns = host.querySelectorAll(".sk");
    var xpBtns = host.querySelectorAll(".xp");
    var status = host.querySelector(".exp-status");
    var xpById = {}; XPS.forEach(function (x) { xpById[x.id] = x; });
    var state = { skill: null, xp: null };

    function clearActive() {
      skBtns.forEach(function (b) { b.classList.remove("active", "hi", "dim"); b.setAttribute("aria-pressed", "false"); });
      xpBtns.forEach(function (b) { b.classList.remove("active", "hi", "dim"); b.setAttribute("aria-pressed", "false"); });
      host.querySelectorAll(".xp-tag").forEach(function (t) { t.classList.remove("on"); });
    }

    function selectSkill(name) {
      clearActive();
      if (!name) { state = { skill: null, xp: null }; status.textContent = ""; return; }
      state = { skill: name, xp: null };
      var used = [];
      skBtns.forEach(function (b) {
        if (b.getAttribute("data-skill") === name) { b.classList.add("active"); b.setAttribute("aria-pressed", "true"); }
      });
      xpBtns.forEach(function (b) {
        var x = xpById[b.getAttribute("data-xp")];
        var has = x && x.skills && x.skills.indexOf(name) !== -1;
        b.classList.add(has ? "hi" : "dim");
        if (has) {
          used.push(x.title);
          b.querySelectorAll(".xp-tag").forEach(function (t) {
            if (t.getAttribute("data-skill") === name) t.classList.add("on");
          });
        }
      });
      status.textContent = used.length
        ? "「" + name + "」を使用した経歴：" + used.length + "件 — " + used.join(" ／ ")
        : "「" + name + "」に紐づく経歴はまだありません。";
    }

    function selectXp(id) {
      clearActive();
      var x = xpById[id];
      if (!x) { state = { skill: null, xp: null }; status.textContent = ""; return; }
      state = { skill: null, xp: id };
      var set = {};
      (x.skills || []).forEach(function (n) { set[n] = true; });
      xpBtns.forEach(function (b) {
        if (b.getAttribute("data-xp") === id) { b.classList.add("active"); b.setAttribute("aria-pressed", "true"); }
        else b.classList.add("dim");
      });
      b_mark_tags(x);
      skBtns.forEach(function (b) {
        b.classList.add(set[b.getAttribute("data-skill")] ? "hi" : "dim");
      });
      status.textContent = (x.skills && x.skills.length)
        ? "「" + x.title + "」で使用したスキル：" + x.skills.length + "件"
        : "「" + x.title + "」は運営・支援が中心の経歴です。";
    }
    function b_mark_tags(x) {
      var active = host.querySelector('.xp[data-xp="' + x.id + '"]');
      if (active) active.querySelectorAll(".xp-tag").forEach(function (t) { t.classList.add("on"); });
    }

    skBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-skill");
        if (state.skill === name) selectSkill(null); else selectSkill(name);
      });
    });
    xpBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-xp");
        if (state.xp === id) selectXp(null); else selectXp(id);
      });
    });
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
    renderRoleLinks();
    renderSkillExplorer();
    buildPager();
    initTheme();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
