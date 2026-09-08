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
  var SITE_LOCALE=(document.documentElement.lang||"ja").split("-")[0];
  var LANGUAGE_ROOT=SITE_LOCALE==="ja"?"/":"/"+SITE_LOCALE+"/";
  if (/\/index\.html$/.test(location.pathname)) {
    history.replaceState(null,"",location.pathname.replace(/index\.html$/,"")+location.search+location.hash);
  }

  /* All internal links are rooted in the current language directory. */
  function localPageHref(page) {
    return LANGUAGE_ROOT+page.replace(/^\//,"");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Articles keep the News navigation item selected. */
  function currentPage() {
    var parts=location.pathname.split("/").filter(Boolean);
    if(parts[0]==="en"||parts[0]==="de") parts.shift();
    return parts.length ? parts[0]+"/" : "";
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
        '<a href="' + esc(localPageHref(n.href)) + '"' + active + ">" +
        '<span class="toc-num">' + esc(n.num) + "</span>" +
        '<span class="lbl-ja">' + esc(n.label) + "</span>" +
        "</a>"
      );
    }).join("");

    host.className = "topbar";
    host.innerHTML =
      '<div class="wrap row">' +
        '<a class="brand" href="' + esc(localPageHref("")) + '">' + esc(SITE.name) +
          '<span class="brand-en">' + esc(SITE.nameEn) + "</span></a>" +
        '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">' +
          '<span class="nav-toggle-lines" aria-hidden="true"><i></i><i></i></span>' +
          '<span class="nav-toggle-label">Menu</span>' +
        '</button>' +
        '<nav class="toc" id="site-nav" aria-label="グローバルナビゲーション">' +
          links +
          '<button id="themeBtn" type="button" aria-label="配色を切り替え">◐ Theme</button>' +
        "</nav>" +
      "</div>";
  }

  function initNavigation() {
    var host = document.getElementById("site-header");
    var toggle = host && host.querySelector(".nav-toggle");
    var nav = host && host.querySelector(".toc");
    if (!host || !toggle || !nav) return;

    function setOpen(open) {
      host.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (ev) {
      if (ev.target.closest && ev.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && host.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  function buildUtilityNav() {
    var header = document.getElementById("site-header");
    if (!header || !window.LINKS) return;
    var locale = (document.documentElement.lang || "ja").split("-")[0];
    var pathParts=location.pathname.split("/").filter(Boolean);
    if(pathParts[0]==="en"||pathParts[0]==="de") pathParts.shift();
    var pagePath=pathParts.length?pathParts.join("/")+"/":"";
    var suffix = location.search + location.hash;
    function localeHref(target) {
      return (target === "ja" ? "/" : "/" + target + "/") + pagePath + suffix;
    }
    function iconSvg(type) {
      var icons = {
        github:'<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
        linkedin:'<path d="M6.5 8.2H3.2V21h3.3V8.2ZM4.85 3A1.92 1.92 0 1 0 4.85 6.84 1.92 1.92 0 0 0 4.85 3ZM21 13.66c0-3.86-2.06-5.65-4.8-5.65-2.21 0-3.2 1.22-3.75 2.07V8.2H9.16V21h3.29v-6.34c0-1.67.32-3.29 2.39-3.29 2.04 0 2.06 1.91 2.06 3.4V21H21v-7.34Z"/>',
        instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.7" r="1" class="fill"/>',
        x:'<path d="M4 3h4.5l4.15 5.55L17.5 3H20l-6.2 7.2L20.5 21H16l-4.7-6.28L5.9 21H3.4l6.75-7.92L4 3Zm3.25 2 9.8 14h1.2L8.45 5h-1.2Z"/>',
        research:'<path d="M4 19V5h6.2a4.4 4.4 0 0 1 1.65 8.48L16 19h-3.2l-3.65-5H7v5H4Zm3-8h3.1a1.5 1.5 0 0 0 0-3H7v3Zm10.4-3h2.6v11h-2.6z"/>',
        orcid:'<circle cx="12" cy="12" r="9"/><path class="cut" d="M8 8.2h1.8V10H8V8.2Zm0 3.1h1.8v5H8v-5Zm3.2-3.1h3.1c2.7 0 4.4 1.5 4.4 4s-1.7 4.1-4.4 4.1h-3.1V8.2Zm1.8 1.6v4.9h1.2c1.7 0 2.6-.8 2.6-2.5 0-1.6-.9-2.4-2.6-2.4H13Z"/>',
        notes:'<path d="M5 3h10l4 4v14H5V3Zm3 5h6V6H8v2Zm0 4h8v-2H8v2Zm0 4h8v-2H8v2Z"/>',
        mail:'<path d="M3 5h18v14H3V5Zm2 3.1V17h14V8.1l-7 5.2-7-5.2ZM6.2 7 12 11.3 17.8 7H6.2Z"/>'
      };
      var body=icons[type]||icons.notes;
      return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+body+'</svg>';
    }
    var social = window.LINKS.filter(function(link){return link.icon;}).map(function(link){
      return '<a class="social-link social-'+esc(link.icon)+'" href="'+esc(link.href)+'" target="_blank" rel="me noopener" aria-label="'+esc(link.label)+'" data-label="'+esc(link.label)+'">'+iconSvg(link.icon)+'</a>';
    }).join("");
    var languages = [
      {code:"ja",label:"日本語"},{code:"en",label:"EN"},{code:"de",label:"DE"}
    ].map(function(lang){return '<a href="'+esc(localeHref(lang.code))+'" hreflang="'+lang.code+'" lang="'+lang.code+'"'+(lang.code===locale?' aria-current="page"':'')+'>'+lang.label+'</a>';}).join("");
    var bar=document.createElement("div");
    bar.className="utilitybar";
    bar.innerHTML='<div class="wrap utilitybar-inner"><nav class="social-nav" aria-label="ソーシャルメディア">'+social+'</nav><nav class="language-nav" aria-label="表示言語">'+languages+'</nav></div>';
    header.insertAdjacentElement("afterend",bar);
  }

  /* ---------- フッター（外部リンク + 目次 + 落款を自動描画） ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host || !window.LINKS || !window.SITE) return;

    var linkHtml = window.LINKS.filter(function(l){return l.icon!=="mail";}).map(function (l) {
      return (
        '<a href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
        esc(l.label) + ' <span class="ext">' + esc(l.ext || "↗") + "</span></a>"
      );
    }).join("");

    host.innerHTML =
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<nav class="foot-links" aria-label="外部リンク">' + linkHtml + "</nav>" +
        "</div>" +
        '<div class="colophon">' +
          "<small>" + esc(SITE.name) + " ／ " + esc(SITE.nameEn) +
            " — Software Developer, Educator &amp; Researcher.</small>" +
          "<small>Last updated " + esc(SITE.updated) + ".</small>" +
        "</div>" +
      "</div>";
  }

  /* ---------- プレスリリース / お知らせ ----------
     assets/news-index.json（Git 情報で生成）を優先。取得できない
     （file:// など）場合は data.js の window.PRESS にフォールバック。
     各項目は検索・SNS共有に適した静的記事ページへリンク。 */
  function renderPress() {
    var hosts = document.querySelectorAll("[data-press]");
    if (!hosts.length) return;

    function paint(items) {
      items = items.map(function(p){
        var localized=(p.translations||{})[SITE_LOCALE]||p;
        var tag=(localized.tag==null?"":String(localized.tag)).trim();
        return Object.assign({},p,{title:localized.title,tag:tag});
      }).sort(function (a, b) {
        return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
      });
      function itemHtml(p) {
        var href = localPageHref("news/" + encodeURIComponent(p.slug || "") + "/");
        return '<a class="news-item" href="' + href + '">' +
          '<span class="date">' + esc(fmtDate(p.date)) + "</span>" +
          '<span class="tag">' + esc(p.tag || "") + "</span>" +
          '<span class="title">' + esc(p.title) + "</span>" +
          '<span class="arw">→</span></a>';
      }
      hosts.forEach(function (host) {
        var limit = parseInt(host.getAttribute("data-press-limit"), 10);
        var list = isNaN(limit) ? items : items.slice(0, limit);
        if (!list.length) {
          host.innerHTML = '<p class="news-empty">現在、お知らせはありません。</p>';
          return;
        }
        if (host.hasAttribute("data-press-filter")) {
          var tags = [];
          var years = [];
          items.forEach(function(p){
            var year=(p.date||"").slice(0,4);
            if(p.tag && tags.indexOf(p.tag)===-1) tags.push(p.tag);
            if(year && years.indexOf(year)===-1) years.push(year);
          });
          years.sort().reverse();
          host.className = "press-explorer";
          host.innerHTML =
            '<div class="press-filter" aria-label="お知らせの絞り込み">' +
              '<div class="press-filter-head"><div><div class="filter-kicker">News filter</div><h2>お知らせを絞り込む</h2></div>' +
                '<button type="button" class="press-clear" disabled>条件をクリア</button></div>' +
              '<div class="press-filter-fields">' +
                '<label><span>タグ</span><select class="press-tag"><option value="">すべてのタグ</option>'+tags.map(function(tag){return '<option value="'+esc(tag)+'">'+esc(tag)+'</option>';}).join("")+'</select></label>' +
                '<label><span>公開年</span><select class="press-year"><option value="">すべての年</option>'+years.map(function(year){return '<option value="'+year+'">'+year+'年</option>';}).join("")+'</select></label>' +
                '<label><span>公開月</span><select class="press-month"><option value="">すべての月</option>'+Array.from({length:12},function(_,i){var m=String(i+1).padStart(2,"0");return '<option value="'+m+'">'+(i+1)+'月</option>';}).join("")+'</select></label>' +
              '</div><div class="press-filter-status" aria-live="polite"></div>' +
            '</div><div class="newsfeed press-results"></div>';

          var tagSelect=host.querySelector(".press-tag");
          var yearSelect=host.querySelector(".press-year");
          var monthSelect=host.querySelector(".press-month");
          var clearButton=host.querySelector(".press-clear");
          var resultHost=host.querySelector(".press-results");
          var resultStatus=host.querySelector(".press-filter-status");
          function drawFilteredPress(){
            var filtered=items.filter(function(p){
              return (!tagSelect.value || p.tag===tagSelect.value) &&
                (!yearSelect.value || (p.date||"").slice(0,4)===yearSelect.value) &&
                (!monthSelect.value || (p.date||"").slice(5,7)===monthSelect.value);
            });
            resultHost.innerHTML=filtered.length?filtered.map(itemHtml).join(""):'<p class="news-empty">条件に一致するお知らせはありません。</p>';
            resultStatus.innerHTML='<strong>'+filtered.length+'</strong><span> / '+items.length+'件を表示</span>';
            clearButton.disabled=!tagSelect.value&&!yearSelect.value&&!monthSelect.value;
          }
          [tagSelect,yearSelect,monthSelect].forEach(function(select){select.addEventListener("change",drawFilteredPress);});
          clearButton.addEventListener("click",function(){tagSelect.value="";yearSelect.value="";monthSelect.value="";drawFilteredPress();});
          drawFilteredPress();
          return;
        }
        host.className = "newsfeed";
        host.innerHTML = list.map(itemHtml).join("");
      });
    }

    fetch("/assets/news-index.json", { cache: "no-cache" })
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
      ? '<a href="' + esc(localPageHref(prev.href)) + '"><div class="dir">← Prev</div>' +
        '<div class="t">' + esc(prev.label) + "</div></a>"
      : "<span></span>";
    var nextHtml = next
      ? '<a class="next" href="' + esc(localPageHref(next.href)) + '"><div class="dir">Next →</div>' +
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
        return l.icon!=="mail" && l.roles && l.roles.indexOf(role) !== -1;
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

  /* ---------- ホーム用：現在から過去へつながる主な活動歴 ---------- */
  function renderCareerSummary() {
    var hosts = document.querySelectorAll("[data-career-summary]");
    if (!hosts.length || !window.PROJECTS) return;

    function fmtYM(ym) {
      var m = /^(\d{4})-(\d{2})$/.exec(ym || "");
      return m ? m[1] + "." + m[2] : (ym || "");
    }
    function entry(p) {
      var current = !p.end;
      var period = fmtYM(p.start) + " — " + (p.end ? fmtYM(p.end) : "現在");
      var href = localPageHref("profile/") + "?project=" + encodeURIComponent(p.id) + "#skills";
      return '<div class="career-step'+(current?' is-current':'')+'"><span class="career-dot" aria-hidden="true"></span>' +
        '<a class="career-card" href="'+href+'" aria-label="'+esc((p.org||{}).name)+'の詳細を見る">' +
          '<span class="career-card-top"><span class="career-state">'+(current?'現在':'活動実績')+'</span>' +
            '<span class="career-period">'+esc(period)+'</span></span>' +
          '<span class="career-content"><strong class="career-org">'+esc((p.org||{}).name||"")+'</strong>' +
            '<span class="career-role">'+esc(p.role||"")+'</span>' +
            '<span class="career-domain">'+esc(p.domain||"")+'</span></span>' +
          '<span class="career-more">詳細を見る →</span>' +
        '</a></div>';
    }

    var featured = window.PROJECTS.filter(function(p){return !p.end || (p.org && p.org.url);})
      .slice().sort(function(a,b){
        if(!a.end && b.end) return -1;
        if(a.end && !b.end) return 1;
        var aKey=a.end||a.start, bKey=b.end||b.start;
        return aKey<bKey?1:aKey>bKey?-1:0;
      });

    hosts.forEach(function(host){
      host.className = "career-summary";
      host.innerHTML =
        '<div class="career-block-head"><h3>主な活動歴</h3><span>Career flow</span></div>' +
        '<div class="career-flow">'+featured.map(entry).join("")+'</div>';
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
    function org(o){
      o = o || {name:"",url:""};
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
        '<div class="pm-org">'+org(p.org)+
          (p.industry?'<span class="pm-role">業種：'+esc(p.industry)+'</span>':"")+
          '<span class="pm-role">'+esc(p.role)+'</span></div>' +
        (p.service?'<p class="pm-service">'+esc(p.service)+'</p>':"") +
        '<div class="pm-grid">' +
          '<div class="pm-cell"><span class="pm-k">期間</span><span class="pm-v">'+esc(period)+'</span></div>' +
          '<div class="pm-cell"><span class="pm-k">稼働</span><span class="pm-v">'+esc(dur(p.months))+'</span></div>' +
          (scale?'<div class="pm-cell"><span class="pm-k">規模</span><span class="pm-v">'+esc(scale)+'</span></div>':"") +
          '<div class="pm-cell"><span class="pm-k">立場</span><span class="pm-v">'+esc(p.role)+'</span></div>' +
        '</div>' +
        ((p.body&&p.body.length)?'<div class="pm-sec"><div class="pm-h">担当した業務内容</div><ul class="pm-duties">'+p.body.map(function(b){return '<li>'+esc(b)+'</li>';}).join("")+'</ul></div>':"") +
        '<div class="pm-sec"><div class="pm-h">担当工程</div><div class="pm-phases">'+phaseHtml+'</div></div>' +
        '<div class="pm-sec"><div class="pm-h">技術スタック</div><div class="pm-chips">'+chips(p.stack)+'</div></div>';
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

      /* スキル表の分類をそのまま使い、該当案件がある技術だけを表示 */
      var skills = (window.SKILLS||[]).map(function(s){
        var n = base.filter(function(p){ return (p.stack||[]).indexOf(s.name)!==-1; }).length;
        return { name:s.name, kind:s.kind, level:s.level, years:s.years, n:n };
      }).filter(function(x){ return x.n>0; });
      var kinds = [];
      skills.forEach(function(s){ if(kinds.indexOf(s.kind)===-1) kinds.push(s.kind); });
      var startYears = base.map(function(p){ return parseInt((p.start||"").slice(0,4),10); }).filter(Boolean);
      var endYears = base.map(function(p){ return p.end ? parseInt(p.end.slice(0,4),10) : new Date().getFullYear(); }).filter(Boolean);
      var minYear = Math.min.apply(null,startYears);
      var maxYear = Math.max.apply(null,endYears.concat([new Date().getFullYear()]));
      var years = [];
      for(var yr=maxYear;yr>=minYear;yr--) years.push(yr);

      var groups = kinds.map(function(kind){
        var items = skills.filter(function(s){return s.kind===kind;});
        return '<fieldset class="pf-group"><legend>'+esc(kind)+'</legend><div class="pf-options">' +
          items.map(function(s){
            return '<label class="pf-option"><input type="checkbox" value="'+esc(s.name)+'">' +
              '<span class="pf-check" aria-hidden="true">✓</span><span class="pf-name">'+esc(s.name)+'</span>' +
              '<span class="pf-meta">'+esc(String(s.years))+'年 · '+esc(LEVEL_LABEL[s.level]||"")+'</span>' +
              '<span class="pf-count">'+s.n+'</span></label>';
          }).join("") + '</div></fieldset>';
      }).join("");
      var yearOptions = years.map(function(y){return '<option value="'+y+'">'+y+'年</option>';}).join("");

      host.className = "explorer";
      host.innerHTML =
        '<div class="filter-panel">' +
          '<div class="filter-head"><div><div class="filter-kicker">Project filter</div>' +
            '<h3 class="filter-title">案件を絞り込む</h3>' +
            '<p class="filter-help">技術は複数選択できます。選択した技術をすべて含み、指定期間と重なる案件を表示します。</p></div>' +
            '<button type="button" class="pf-clear" disabled>条件をクリア</button></div>' +
          '<div class="filter-layout"><div class="filter-tech" aria-label="技術スタック">'+groups+'</div>' +
            '<fieldset class="pf-period"><legend>参画期間</legend>' +
              '<div class="period-fields"><label><span>開始</span><select class="pf-from"><option value="">指定なし</option>'+yearOptions+'</select></label>' +
              '<span class="period-sep" aria-hidden="true">—</span>' +
              '<label><span>終了</span><select class="pf-to"><option value="">指定なし</option>'+yearOptions+'</select></label></div>' +
              '<label class="pf-ongoing"><input type="checkbox"><span class="pf-check" aria-hidden="true">✓</span><span>現在進行中のみ</span></label>' +
              '<p class="period-help">案件の参画期間が、指定した年の範囲に一部でも重なるものを表示します。</p>' +
            '</fieldset></div>' +
          '<div class="filter-result"><div class="pf-status" aria-live="polite"></div><div class="pf-selected" aria-label="選択中の条件"></div></div>' +
        '</div>' +
        '<div class="flow"></div>';

      var flow = host.querySelector(".flow");
      var status = host.querySelector(".pf-status");
      var selectedHost = host.querySelector(".pf-selected");
      var skillInputs = host.querySelectorAll(".pf-option input");
      var fromSelect = host.querySelector(".pf-from");
      var toSelect = host.querySelector(".pf-to");
      var ongoingInput = host.querySelector(".pf-ongoing input");
      var clearBtn = host.querySelector(".pf-clear");

      function selectedSkills(){
        return [].slice.call(skillInputs).filter(function(input){return input.checked;}).map(function(input){return input.value;});
      }
      function projectMatchesPeriod(p,fromYear,toYear){
        var projectStart=parseInt((p.start||"").slice(0,4),10);
        var projectEnd=p.end?parseInt(p.end.slice(0,4),10):Infinity;
        return (!fromYear || projectEnd>=fromYear) && (!toYear || projectStart<=toYear);
      }

      function draw(){
        var selected = selectedSkills();
        var fromYear = parseInt(fromSelect.value,10)||null;
        var toYear = parseInt(toSelect.value,10)||null;
        if(fromYear && toYear && fromYear>toYear){
          if(document.activeElement===fromSelect) toSelect.value=String(fromYear);
          else fromSelect.value=String(toYear);
          fromYear=parseInt(fromSelect.value,10)||null;
          toYear=parseInt(toSelect.value,10)||null;
        }
        var list = base.filter(function(p){
          var hasSkills=selected.every(function(name){return (p.stack||[]).indexOf(name)!==-1;});
          return hasSkills && projectMatchesPeriod(p,fromYear,toYear) && (!ongoingInput.checked || !p.end);
        });
        flow.innerHTML = list.map(function(p,i){
          var period = fmtYM(p.start)+" – "+(p.end?fmtYM(p.end):"現在");
          var stack = p.stack||[];
          var top = selected.filter(function(name){return stack.indexOf(name)!==-1;})
            .concat(stack.filter(function(name){return selected.indexOf(name)===-1;})).slice(0,6);
          return '<button type="button" class="node" data-id="'+esc(p.id)+'" style="--d:'+(i*45)+'ms">' +
            '<span class="node-dot" aria-hidden="true"></span>' +
            '<span class="node-body">' +
              '<span class="node-period">'+esc(period)+' <em>'+esc(dur(p.months))+'</em></span>' +
              '<span class="node-org">'+esc((p.org||{}).name||"")+'</span>' +
              '<span class="node-domain">'+esc(p.domain)+'</span>' +
              '<span class="node-role">'+esc(p.role)+'</span>' +
              '<span class="node-tags">'+top.map(function(s){return '<i'+(selected.indexOf(s)!==-1?' class="hit"':'')+'>'+esc(s)+'</i>';}).join("")+((p.stack||[]).length>6?'<i class="more">+'+((p.stack.length)-6)+'</i>':'')+'</span>' +
            '</span>' +
            '<span class="node-open" aria-hidden="true">詳細 →</span>' +
          '</button>';
        }).join("") || '<div class="pf-empty"><strong>該当する案件がありません</strong><span>技術を減らすか、期間を広げてお試しください。</span></div>';
        var conditions = selected.slice();
        if(fromYear||toYear) conditions.push((fromYear?fromYear+"年":"開始指定なし")+"〜"+(toYear?toYear+"年":"現在"));
        if(ongoingInput.checked) conditions.push("現在進行中");
        status.innerHTML = '<strong>'+list.length+'</strong><span> / '+base.length+'件を表示</span>';
        selectedHost.innerHTML = conditions.map(function(label){return '<span>'+esc(label)+'</span>';}).join("");
        clearBtn.disabled=conditions.length===0;
        skillInputs.forEach(function(input){input.closest(".pf-option").classList.toggle("active",input.checked);});
        flow.querySelectorAll(".node").forEach(function(b){
          b.addEventListener("click", function(){
            var p = base.filter(function(x){return x.id===b.getAttribute("data-id");})[0];
            if(p) openModal(p);
          });
        });
      }
      skillInputs.forEach(function(input){input.addEventListener("change",draw);});
      fromSelect.addEventListener("change",draw);
      toSelect.addEventListener("change",draw);
      ongoingInput.addEventListener("change",draw);
      clearBtn.addEventListener("click",function(){
        skillInputs.forEach(function(input){input.checked=false;});
        fromSelect.value=""; toSelect.value=""; ongoingInput.checked=false; draw();
      });

      /* URL の ?skill=PHP,Laravel / #skill=... で初期フィルター */
      var pre = (location.hash.match(/skill=([^&]+)/)||location.search.match(/skill=([^&]+)/)||[])[1];
      if(pre){
        var requested=decodeURIComponent(pre).split(",");
        skillInputs.forEach(function(input){input.checked=requested.indexOf(input.value)!==-1;});
      }
      draw();

      /* 要約カードから経歴ページへ来た場合、その案件の詳細を開く */
      var projectParam = (location.search.match(/[?&]project=([^&]+)/)||[])[1];
      if(projectParam){
        projectParam=decodeURIComponent(projectParam);
        var requestedProject=base.filter(function(p){return p.id===projectParam;})[0];
        if(requestedProject) openModal(requestedProject);
      }
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

  /* ---------- Cookie 同意（GDPR）+ Google Analytics ----------
     ・GA は「同意」を押したときだけ読み込む。「拒否」では一切読み込まない
       ＝Cookie も送信も発生しない。選択は localStorage に保存し再表示しない。
     ・ANALYTICS.id が空の間はバナーも解析も出さない。 */
  var CONSENT_TEXT = {
    ja: { msg:"当サイトは、アクセス解析のために Cookie を使用します。", accept:"同意する", reject:"拒否する" },
    en: { msg:"This site uses cookies for analytics.", accept:"Accept", reject:"Reject" },
    de: { msg:"Diese Website verwendet Cookies zur Analyse.", accept:"Akzeptieren", reject:"Ablehnen" }
  };
  function initConsent() {
    var gaId = ((window.ANALYTICS && window.ANALYTICS.id) || "").trim();
    if (!gaId) return; // 解析が未設定ならバナーも出さない
    var KEY = "cookie-consent";
    function get(){ try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function save(v){ try { localStorage.setItem(KEY, v); } catch (e) {} }
    var gaLoaded = false;
    function loadGA(){
      if (gaLoaded) return; gaLoaded = true;
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId, { anonymize_ip: true });
    }
    var decision = get();
    if (decision === "granted") { loadGA(); return; } // 既に同意
    if (decision === "denied") { return; }             // 既に拒否 → 何もしない
    var t = CONSENT_TEXT[SITE_LOCALE] || CONSENT_TEXT.ja;
    var bar = document.createElement("div");
    bar.className = "cookie-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", t.msg);
    bar.innerHTML =
      '<p class="cc-msg">' + esc(t.msg) + "</p>" +
      '<div class="cc-actions">' +
        '<button type="button" class="cc-btn cc-reject">' + esc(t.reject) + "</button>" +
        '<button type="button" class="cc-btn cc-accept">' + esc(t.accept) + "</button>" +
      "</div>";
    document.body.appendChild(bar);
    requestAnimationFrame(function(){ bar.classList.add("show"); });
    function close(){ bar.classList.remove("show"); setTimeout(function(){ if (bar.parentNode) bar.parentNode.removeChild(bar); }, 260); }
    bar.querySelector(".cc-accept").addEventListener("click", function(){ save("granted"); loadGA(); close(); });
    bar.querySelector(".cc-reject").addEventListener("click", function(){ save("denied"); close(); });
  }

  function init() {
    buildHeader();
    initNavigation();
    buildUtilityNav();
    buildFooter();
    renderPress();
    renderRoleLinks();
    renderCareerSummary();
    renderProjectExplorer();
    buildPager();
    initTheme();
    initConsent();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
