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
          '<span class="brand-en">' + esc(SITE.nameEn) + "</span></a>" +
        '<nav class="toc" aria-label="グローバルナビゲーション">' +
          links +
          '<button id="themeBtn" type="button" aria-label="配色を切り替え">◐ Theme</button>' +
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
          "<small>" + esc(SITE.name) + " ／ " + esc(SITE.nameEn) +
            " — Software Developer, Educator &amp; Researcher.</small>" +
          "<small>Last updated " + esc(SITE.updated) +
            " · Static site, hosted from GitHub.</small>" +
        "</div>" +
      "</div>";
  }

  /* ---------- プレスリリース / お知らせ ----------
     assets/news-index.json（Git 情報で生成）を優先。取得できない
     （file:// など）場合は data.js の window.PRESS にフォールバック。
     各項目は release.html?slug=… の詳細ページへリンク。 */
  function renderPress() {
    var hosts = document.querySelectorAll("[data-press]");
    if (!hosts.length) return;

    function paint(items) {
      items = items.slice().sort(function (a, b) {
        return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
      });
      hosts.forEach(function (host) {
        var limit = parseInt(host.getAttribute("data-press-limit"), 10);
        var list = isNaN(limit) ? items : items.slice(0, limit);
        if (!list.length) {
          host.innerHTML = '<p class="news-empty">現在、お知らせはありません。</p>';
          return;
        }
        host.className = "newsfeed";
        host.innerHTML = list.map(function (p) {
          var href = "release.html?slug=" + encodeURIComponent(p.slug || "");
          return '<a class="news-item" href="' + href + '">' +
            '<span class="date">' + esc(fmtDate(p.date)) + "</span>" +
            '<span class="tag">' + esc(p.tag || "") + "</span>" +
            '<span class="title">' + esc(p.title) + "</span>" +
            '<span class="arw">→</span></a>";
        }).join("");
      });
    }

    fetch("assets/news-index.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("no index"); return r.json(); })
      .then(paint)
      .catch(function () { if (window.PRESS) paint(window.PRESS); });
  }

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

  /* ---------- 案件エクスプローラー（フィルター＋ポップアップ詳細） ---------- */
  function meterHtml(level) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<i' + (i <= level ? ' class="on"' : "") + "></i>";
    return '<span class="meter" aria-hidden="true">' + s + "</span>";
  }
  var LEVEL_LABEL = { 3: "メイン", 2: "実務あり", 1: "利用可能" };

  function renderProjectExplorer() {
    var hosts = document.querySelectorAll("[data-projects]");
    if (!hosts.length || !window.PROJECTS) return;

    function fmtYM(ym){ var m=/^(\d{4})-(\d{2})$/.exec(ym||""); return m? m[1]+"."+m[2] : (ym||""); }
    function dur(m){ var y=Math.floor(m/12), mo=m%12; return (y?y+"年":"")+(mo?mo+"ヶ月":(y?"":"1ヶ月")); }
    function org(key){
      var o=(window.ORGS||{})[key]||{name:key,url:""};
      return o.url
        ? '<a class="xp-org" href="'+esc(o.url)+'" target="_blank" rel="noopener">'+esc(o.name)+' ↗</a>'
        : '<span class="xp-org none">'+esc(o.name)+'</span>';
    }
    function chips(list){ return (list||[]).map(function(s){return '<span class="pchip">'+esc(s)+'</span>';}).join(""); }

    /* modal (一度だけ生成) */
    var modal = document.getElementById("proj-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "proj-modal"; modal.className = "proj-modal"; modal.hidden = true;
      modal.innerHTML = '<div class="pm-backdrop"></div><div class="pm-panel" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabindex="-1"><button class="pm-close" type="button" aria-label="閉じる">✕</button><div class="pm-body"></div></div>';
      document.body.appendChild(modal);
      modal.querySelector(".pm-backdrop").addEventListener("click", closeModal);
      modal.querySelector(".pm-close").addEventListener("click", closeModal);
      document.addEventListener("keydown", function(e){ if(e.key==="Escape" && !modal.hidden) closeModal(); });
    }
    var lastFocus=null;
    function openModal(p){
      var phaseHtml = (window.PHASE_LABELS||[]).map(function(lab,i){
        var on=p.phases && p.phases[i];
        return '<span class="ph '+(on?"on":"")+'">'+esc(lab)+'</span>';
      }).join("");
      var scale = (p.team?("チーム "+p.team+"名"):"") + (p.sub?("／うち部下 "+p.sub+"名"):"");
      var period = fmtYM(p.start)+" 〜 "+(p.end?fmtYM(p.end):"継続中");
      modal.querySelector(".pm-body").innerHTML =
        '<div class="pm-eyebrow">案件 / Project</div>' +
        '<h3 id="pm-title" class="pm-title">'+esc(p.domain)+'</h3>' +
        '<div class="pm-org">'+org(p.org)+'<span class="pm-role">'+esc(p.role)+'</span></div>' +
        '<div class="pm-grid">' +
          '<div class="pm-cell"><span class="pm-k">期間</span><span class="pm-v">'+esc(period)+'</span></div>' +
          '<div class="pm-cell"><span class="pm-k">稼働</span><span class="pm-v">'+esc(dur(p.months))+'</span></div>' +
          (scale?'<div class="pm-cell"><span class="pm-k">規模</span><span class="pm-v">'+esc(scale)+'</span></div>':"") +
          '<div class="pm-cell"><span class="pm-k">立場</span><span class="pm-v">'+esc(p.role)+'</span></div>' +
        '</div>' +
        '<div class="pm-sec"><div class="pm-h">担当工程</div><div class="pm-phases">'+phaseHtml+'</div></div>' +
        '<div class="pm-sec"><div class="pm-h">技術スタック</div><div class="pm-chips">'+chips(p.stack)+'</div></div>' +
        '<p class="pm-note">案件概要・担当業務の詳細は準備中です。</p>';
      lastFocus=document.activeElement;
      modal.hidden=false; document.body.style.overflow="hidden";
      requestAnimationFrame(function(){ modal.classList.add("open"); });
      modal.querySelector(".pm-panel").focus();
    }
    function closeModal(){
      modal.classList.remove("open");
      document.body.style.overflow="";
      setTimeout(function(){ modal.hidden=true; }, 220);
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }

    hosts.forEach(function(host){
      var roleFilter = host.getAttribute("data-projects-role");
      var base = window.PROJECTS.filter(function(p){ return roleFilter ? p.cat===roleFilter : true; });
      base = base.slice().sort(function(a,b){ return a.start<b.start?1:a.start>b.start?-1:0; });

      /* フィルター用スキル（該当案件が1件以上あるものだけ） */
      var pills = (window.SKILLS||[]).map(function(s){
        var n = base.filter(function(p){ return (p.stack||[]).indexOf(s.name)!==-1; }).length;
        return { name:s.name, n:n };
      }).filter(function(x){ return x.n>0; });

      host.className = "explorer";
      host.innerHTML =
        '<div class="pf-bar" role="group" aria-label="技術で絞り込み">' +
          '<button type="button" class="pf active" data-skill="">すべて <b>'+base.length+'</b></button>' +
          pills.map(function(x){ return '<button type="button" class="pf" data-skill="'+esc(x.name)+'">'+esc(x.name)+' <b>'+x.n+'</b></button>'; }).join("") +
        '</div>' +
        '<div class="pf-status" aria-live="polite"></div>' +
        '<div class="flow"></div>';

      var flow = host.querySelector(".flow");
      var status = host.querySelector(".pf-status");
      var pfBtns = host.querySelectorAll(".pf");
      var active = "";

      function draw(){
        var list = active ? base.filter(function(p){ return (p.stack||[]).indexOf(active)!==-1; }) : base;
        flow.innerHTML = list.map(function(p,i){
          var period = fmtYM(p.start)+" – "+(p.end?fmtYM(p.end):"現在");
          var top = (p.stack||[]).slice(0,6);
          return '<button type="button" class="node" data-id="'+esc(p.id)+'" style="--d:'+(i*45)+'ms">' +
            '<span class="node-dot" aria-hidden="true"></span>' +
            '<span class="node-body">' +
              '<span class="node-period">'+esc(period)+' <em>'+esc(dur(p.months))+'</em></span>' +
              '<span class="node-org">'+((window.ORGS[p.org]||{}).name||"")+'</span>' +
              '<span class="node-domain">'+esc(p.domain)+'</span>' +
              '<span class="node-role">'+esc(p.role)+'</span>' +
              '<span class="node-tags">'+top.map(function(s){return '<i'+(s===active?' class="hit"':'')+'>'+esc(s)+'</i>';}).join("")+((p.stack||[]).length>6?'<i class="more">+'+((p.stack.length)-6)+'</i>':'')+'</span>' +
            '</span>' +
            '<span class="node-open" aria-hidden="true">詳細 →</span>' +
          '</button>';
        }).join("");
        status.textContent = active
          ? "「"+active+"」を含む案件："+list.length+"件"
          : "全"+base.length+"件を新しい順に表示中。技術で絞り込み、カードをクリックで詳細。";
        flow.querySelectorAll(".node").forEach(function(b){
          b.addEventListener("click", function(){
            var p = base.filter(function(x){return x.id===b.getAttribute("data-id");})[0];
            if(p) openModal(p);
          });
        });
      }
      pfBtns.forEach(function(b){
        b.addEventListener("click", function(){
          active = b.getAttribute("data-skill");
          pfBtns.forEach(function(x){ x.classList.toggle("active", x===b); });
          draw();
        });
      });
      draw();

      /* URL の ?skill= / #skill= で初期フィルター */
      var pre = (location.hash.match(/skill=([^&]+)/)||location.search.match(/skill=([^&]+)/)||[])[1];
      if(pre){ pre=decodeURIComponent(pre); var tgt=[].slice.call(pfBtns).filter(function(b){return b.getAttribute("data-skill")===pre;})[0]; if(tgt) tgt.click(); }
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
    renderProjectExplorer();
    buildPager();
    initTheme();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
