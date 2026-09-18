"use strict";
/* スキルシート生成（本番・完全ブラウザ内処理）。
   window.PROJECTS / window.SKILLS（assets/data.js、既にこのページで読み込み済み）から、
   テンプレート（template.xlsx、案件テーブルは空欄）に書き込む。サーバーには何も送信しない。
   xlsx の読み書きは JSZip で zip を直接操作し、xl/worksheets/sheet1.xml だけを
   文字列レベルで書き換える（ExcelJS で読み込み→書き込みすると、このテンプレート特有の
   構造で Excel が「修復」を要求するファイルになってしまうため使わない）。

   変換・書き込みのロジックは tools/skillsheet/lib/*.js（ローカル専用ツール、実テンプレート用）
   の内容をブラウザ用に移植したもの。ビルドで自動同期されないため、規則を変えるときは
   両方を手動で直すこと。 */

/* ============================================================
   案件データ → テンプレート列 の変換（tools/skillsheet/lib/siteProjects.js と同じ規則）
   ============================================================ */
const LANG_FW = ["PHP", "Laravel", "Ruby", "Rails", "FastAPI", "Flask", "VB", "React", "Vue",
  "Python", "HTML/CSS", "JavaScript", "R", "GAS", "Next.js", "Swift", "Kotlin", "React Native"];
const DB_NAMES = ["MySQL", "PostgreSQL", "SQLite", "MariaDB"];
const SERVER_OS = ["Linux", "Ubuntu", "Redhat", "Apache", "nginx", "AWS", "Azure"];
const TOOLS = ["Moodle", "Prestashop", "WordPress", "EC-CUBE", "Magento", "WooCommerce", "Drupal",
  "O365", "Google Workspace", "Slack", "GitHub", "Git", "Teams", "VS Code", "Visual Studio Code"];

function normalize(token) { return token.trim().toLowerCase(); }
function buildLookup(list) { return new Set(list.map(normalize)); }
const LOOKUP = { languagesFw: buildLookup(LANG_FW), db: buildLookup(DB_NAMES), serverOs: buildLookup(SERVER_OS), tools: buildLookup(TOOLS) };

function classifyStack(stack) {
  const out = { languagesFw: [], db: [], serverOs: [], tools: [] };
  for (const token of stack || []) {
    const key = normalize(token);
    if (LOOKUP.languagesFw.has(key)) out.languagesFw.push(token);
    else if (LOOKUP.db.has(key)) out.db.push(token);
    else if (LOOKUP.serverOs.has(key)) out.serverOs.push(token);
    else out.tools.push(token);
  }
  return {
    languagesFw: out.languagesFw.join("\n"),
    db: out.db.join("\n"),
    serverOs: out.serverOs.join("\n"),
    tools: out.tools.join("\n"),
  };
}

function buildTeamSize(p) {
  let text = `＜全体＞\n${p.team}名`;
  if (p.sub) text += `\n\n＜チーム＞\n${p.sub}名`;
  return text;
}

function monthToDate(yyyyMm) { return `${yyyyMm}-01`; }

function buildDescription(body) {
  return "＜業務内容＞\n" + (body || []).map((line) => `・${line}`).join("\n");
}

function toBlock(p) {
  const stack = classifyStack(p.stack);
  return {
    id: p.id,
    industry: p.industry || "",
    company: (p.org && p.org.name) || "",
    employmentType: p.role || "",
    teamSize: buildTeamSize(p),
    languagesFw: stack.languagesFw,
    db: stack.db,
    serverOs: stack.serverOs,
    tools: stack.tools,
    phases: (p.phases || []).map(Boolean),
    start: p.start ? monthToDate(p.start) : "",
    end: p.end ? monthToDate(p.end) : null,
    title: `＜サービス＞\n${p.domain || p.service || ""}`,
    description: buildDescription(p.body),
  };
}

/* ============================================================
   スキル年数テーブル（tools/skillsheet/lib/skillTable.js と同じ規則）
   ============================================================ */
const SKILL_ROWS = [11, 12, 13, 14, 15];

function byYearsDesc(skills, kind) {
  return skills.filter((s) => s.kind === kind).slice().sort((a, b) => (b.years || 0) - (a.years || 0));
}
// テンプレートのフレームワーク欄は13行目だけ本来のR13:T13結合が外れており、
// 名前は代わりにS13に入っている（テンプレート側の元からの不整合）。
// R13に書くとS13の古い値（"Vue.js"）と重なって表示されるため、行ごとに列を上書きできるようにする。
function bucketCells(items, nameCol, yearsCol, nameColOverrides) {
  const cells = {};
  SKILL_ROWS.forEach((r, i) => {
    const item = items[i];
    const col = (nameColOverrides && nameColOverrides[r]) || nameCol;
    if (nameColOverrides && nameColOverrides[r] && col !== nameCol) {
      cells[`${nameCol}${r}`] = "";
    }
    cells[`${col}${r}`] = item ? item.name : "";
    cells[`${yearsCol}${r}`] = item ? item.years : "";
  });
  return cells;
}
function buildSkillCells(skills) {
  const langs = byYearsDesc(skills, "言語");
  const frameworks = byYearsDesc(skills, "フレームワーク").slice(0, 5);
  const databases = byYearsDesc(skills, "データベース").slice(0, 5);
  const infra = byYearsDesc(skills, "インフラ").slice(0, 5);
  const products = byYearsDesc(skills, "プロダクト").slice(0, 5);
  return {
    ...bucketCells(langs.slice(0, 5), "G", "J"),
    ...bucketCells(langs.slice(5, 10), "L", "O"),
    ...bucketCells(frameworks, "R", "U", { 13: "S" }),
    ...bucketCells(databases, "X", "AA"),
    ...bucketCells(infra, "AD", "AG"),
    ...bucketCells(products, "AJ", "AM"),
  };
}

/* ============================================================
   テンプレートへの書き込み（tools/skillsheet/lib/fillTemplate.js + xlsxPatch.js と同じ規則）
   ExcelJS で読み込み→書き込みし直すと、このテンプレート特有の構造で Excel が
   「修復」を要求するファイルになってしまうため（読み込むだけで何も変更せず
   書き戻しても再現する、ExcelJS 側の既知の未解決の不具合）、xl/worksheets/sheet1.xml
   だけを文字列レベルで書き換える。styles.xml・workbook.xml・theme 等は一切触らない。 */
const SHEET_PATH = "xl/worksheets/sheet1.xml";
const UPDATED_AT_CELL = "AE2";
const FIRST_BLOCK_ROW = 19;
const ROWS_PER_BLOCK = 10;
const BLOCK_COUNT = 16;
const PHASE_COLUMNS = ["AI", "AJ", "AK", "AL", "AM", "AN"];

function blockRows() {
  return Array.from({ length: BLOCK_COUNT }, (_, i) => FIRST_BLOCK_ROW + i * ROWS_PER_BLOCK);
}
function durationFormula(r) {
  return `IF(C${r + 1}="","",DATEDIF(C${r + 1},C${r + 6},"Y")&"年"&DATEDIF(C${r + 1},C${r + 6},"YM")+1&"ヶ月")`;
}
function excelSerialDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const epoch = Date.UTC(1899, 11, 30);
  return Math.round((Date.UTC(y, m - 1, d) - epoch) / 86400000);
}
function formatUpdatedAt(date) {
  return `更新日：　${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
function escapeXml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function findCell(xml, coord) {
  const re = new RegExp(`<c r="${coord}"((?:\\s+[\\w:.-]+="[^"]*")*)\\s*(?:/>|>([\\s\\S]*?)</c>)`);
  const m = re.exec(xml);
  if (!m) return null;
  const styleMatch = /\ss="(\d+)"/.exec(m[1] || "");
  return { fullMatch: m[0], index: m.index, length: m[0].length, style: styleMatch ? styleMatch[1] : null };
}
function buildCell(coord, style, inner) {
  const styleAttr = style != null ? ` s="${style}"` : "";
  if (!inner) return `<c r="${coord}"${styleAttr} t="n" />`;
  return `<c r="${coord}"${styleAttr}${inner.typeAttr || ""}>${inner.body}</c>`;
}
function setCell(xml, coord, spec) {
  const found = findCell(xml, coord);
  if (!found) {
    if (spec.clear || spec.string === "") return xml;
    throw new Error(`セル ${coord} がテンプレートに見つかりません`);
  }
  let inner = null;
  if (spec.clear || spec.string === "") {
    inner = null;
  } else if (typeof spec.string === "string") {
    inner = { typeAttr: ' t="inlineStr"', body: `<is><t xml:space="preserve">${escapeXml(spec.string)}</t></is>` };
  } else if (typeof spec.number === "number") {
    inner = { typeAttr: ' t="n"', body: `<v>${spec.number}</v>` };
  } else if (typeof spec.dateIso === "string") {
    inner = { typeAttr: ' t="n"', body: `<v>${excelSerialDate(spec.dateIso)}</v>` };
  } else if (typeof spec.formula === "string") {
    inner = { typeAttr: "", body: `<f>${escapeXml(spec.formula)}</f><v/>` };
  } else {
    throw new Error(`セル ${coord} の指定が不正です`);
  }
  const replacement = buildCell(coord, found.style, inner);
  return xml.slice(0, found.index) + replacement + xml.slice(found.index + found.length);
}
function setRowHidden(xml, rowNumber, hidden) {
  const re = new RegExp(`<row r="${rowNumber}"([^>]*)>`);
  const m = re.exec(xml);
  if (!m) throw new Error(`行 ${rowNumber} がテンプレートに見つかりません`);
  let attrs = m[1].replace(/\s+hidden="[01]"/, "");
  if (hidden) attrs += ' hidden="1"';
  const replacement = `<row r="${rowNumber}"${attrs}>`;
  return xml.slice(0, m.index) + replacement + xml.slice(m.index + m[0].length);
}

function writeBlock(xml, r, project, slot) {
  const set = (coord, spec) => { xml = setCell(xml, coord, spec); };

  if (!project) {
    set(`B${r}`, { clear: true }); set(`C${r}`, { clear: true }); set(`G${r}`, { clear: true }); set(`I${r}`, { clear: true });
    set(`W${r}`, { clear: true }); set(`Y${r}`, { clear: true }); set(`AA${r}`, { clear: true }); set(`AC${r}`, { clear: true });
    set(`AE${r}`, { clear: true }); set(`AG${r}`, { clear: true });
    for (const col of PHASE_COLUMNS) set(`${col}${r}`, { clear: true });
    set(`C${r + 1}`, { clear: true }); set(`I${r + 1}`, { clear: true }); set(`I${r + 3}`, { clear: true });
    set(`C${r + 5}`, { clear: true }); set(`C${r + 6}`, { clear: true });
    return xml;
  }

  set(`B${r}`, { number: slot });
  set(`C${r}`, { formula: durationFormula(r) });
  set(`G${r}`, { string: project.industry || "" });
  set(`I${r}`, { string: project.company || "" });
  set(`W${r}`, { string: project.employmentType || "" });
  set(`Y${r}`, { string: project.teamSize || "" });
  set(`AA${r}`, { string: project.languagesFw || "" });
  set(`AC${r}`, { string: project.db || "" });
  set(`AE${r}`, { string: project.serverOs || "" });
  set(`AG${r}`, { string: project.tools || "" });

  const phases = Array.isArray(project.phases) ? project.phases : [];
  PHASE_COLUMNS.forEach((col, i) => set(`${col}${r}`, { string: phases[i] ? "●" : "" }));

  set(`C${r + 1}`, project.start ? { dateIso: project.start } : { clear: true });
  set(`I${r + 1}`, { string: project.title || "" });
  set(`I${r + 3}`, { string: project.description || "" });
  set(`C${r + 5}`, { string: "〜" });
  set(`C${r + 6}`, project.end ? { dateIso: project.end } : { formula: "NOW()" });

  return xml;
}

async function fillWorkbook(templateArrayBuffer, projects, skills) {
  const zip = await JSZip.loadAsync(templateArrayBuffer);
  const file = zip.file(SHEET_PATH);
  if (!file) throw new Error(`テンプレートに ${SHEET_PATH} が見つかりません`);
  let xml = await file.async("string");

  xml = setCell(xml, UPDATED_AT_CELL, { string: formatUpdatedAt(new Date()) });

  const skillCells = buildSkillCells(skills || []);
  for (const [coord, value] of Object.entries(skillCells)) {
    xml = setCell(xml, coord, typeof value === "number" ? { number: value } : { string: value });
  }

  blockRows().forEach((r, i) => {
    xml = writeBlock(xml, r, projects[i] || null, i + 1);
  });

  const usedRowCount = projects.length * ROWS_PER_BLOCK;
  for (let i = 0; i < BLOCK_COUNT * ROWS_PER_BLOCK; i++) {
    xml = setRowHidden(xml, FIRST_BLOCK_ROW + i, i >= usedRowCount);
  }

  zip.file(SHEET_PATH, xml);
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* ============================================================
   案件セレクター UI
   ============================================================ */
const MAX_PROJECTS = BLOCK_COUNT;
const MAX_TAG_CHIPS = 14;
const MAX_TILE_TAGS = 4;

const tileGrid = document.getElementById("tileGrid");
const tileTemplate = document.getElementById("tileTemplate");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const tagFilterEl = document.getElementById("tagFilter");
const selectedListEl = document.getElementById("selectedList");
const selectedRowTemplate = document.getElementById("selectedRowTemplate");
const selectedCountEl = document.getElementById("selectedCount");
const statusEl = document.getElementById("status");
const generateBtn = document.getElementById("generateBtn");

let projects = [];
let byId = new Map();
let selectedOrder = [];
let activeTags = new Set();
let searchTerm = "";

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = `status ${kind || ""}`.trim();
}

function splitTags(text) {
  return (text || "").split("\n").map((s) => s.trim()).filter(Boolean);
}
function projectTags(project) {
  return [...splitTags(project.languagesFw), ...splitTags(project.db), ...splitTags(project.serverOs), ...splitTags(project.tools)];
}
function formatPeriod(project) {
  const start = project.start ? project.start.slice(0, 7).replace("-", "/") : "";
  const end = project.end ? project.end.slice(0, 7).replace("-", "/") : "継続中";
  return `${start} 〜 ${end}`;
}
function searchHaystack(project) {
  return [project.company, project.title, project.industry, project.employmentType, ...projectTags(project)].join(" ").toLowerCase();
}
function buildTagVocabulary() {
  const freq = new Map();
  for (const p of projects) {
    for (const tag of new Set(projectTags(p))) freq.set(tag, (freq.get(tag) || 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, MAX_TAG_CHIPS).map(([tag]) => tag);
}
function renderTagFilter() {
  tagFilterEl.innerHTML = "";
  for (const tag of buildTagVocabulary()) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip chip-toggle";
    chip.textContent = tag;
    chip.setAttribute("aria-pressed", activeTags.has(tag) ? "true" : "false");
    chip.addEventListener("click", () => {
      if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
      chip.setAttribute("aria-pressed", activeTags.has(tag) ? "true" : "false");
      renderTiles();
    });
    tagFilterEl.appendChild(chip);
  }
}
function matchesFilters(project) {
  if (searchTerm && !searchHaystack(project).includes(searchTerm)) return false;
  if (activeTags.size > 0) {
    const tags = new Set(projectTags(project));
    for (const t of activeTags) if (!tags.has(t)) return false;
  }
  return true;
}
function renderTiles() {
  const visible = projects.filter(matchesFilters);
  tileGrid.innerHTML = "";
  emptyMessage.hidden = visible.length > 0;
  for (const project of visible) {
    const li = tileTemplate.content.firstElementChild.cloneNode(true);
    const tile = li.querySelector(".tile");
    const selected = selectedOrder.includes(project.id);
    tile.setAttribute("aria-pressed", selected ? "true" : "false");
    tile.classList.toggle("selected", selected);
    tile.querySelector(".tile-company").textContent = project.company || "(会社名なし)";
    tile.querySelector(".tile-period").textContent = formatPeriod(project);
    const tagsEl = tile.querySelector(".tile-tags");
    const tags = projectTags(project);
    for (const tag of tags.slice(0, MAX_TILE_TAGS)) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tag;
      tagsEl.appendChild(chip);
    }
    if (tags.length > MAX_TILE_TAGS) {
      const more = document.createElement("span");
      more.className = "chip chip-more";
      more.textContent = `+${tags.length - MAX_TILE_TAGS}`;
      tagsEl.appendChild(more);
    }
    tile.addEventListener("click", () => toggleSelection(project.id));
    tileGrid.appendChild(li);
  }
}
function toggleSelection(id) {
  const idx = selectedOrder.indexOf(id);
  if (idx === -1) selectedOrder.push(id); else selectedOrder.splice(idx, 1);
  renderTiles();
  renderSelectedList();
}
function moveSelected(id, delta) {
  const idx = selectedOrder.indexOf(id);
  const target = idx + delta;
  if (idx === -1 || target < 0 || target >= selectedOrder.length) return;
  const [entry] = selectedOrder.splice(idx, 1);
  selectedOrder.splice(target, 0, entry);
  renderSelectedList();
}
function renderSelectedList() {
  selectedListEl.innerHTML = "";
  for (const id of selectedOrder) {
    const project = byId.get(id);
    if (!project) continue;
    const li = selectedRowTemplate.content.firstElementChild.cloneNode(true);
    li.querySelector(".s-company").textContent = project.company || "(会社名なし)";
    li.querySelector(".s-period").textContent = formatPeriod(project);
    li.querySelector(".move-up").addEventListener("click", () => moveSelected(id, -1));
    li.querySelector(".move-down").addEventListener("click", () => moveSelected(id, 1));
    li.querySelector(".remove").addEventListener("click", () => toggleSelection(id));
    selectedListEl.appendChild(li);
  }
  selectedCountEl.textContent = String(selectedOrder.length);
  selectedCountEl.parentElement.style.color = selectedOrder.length > MAX_PROJECTS ? "var(--shu)" : "";
}

let searchDebounce = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderTiles();
  }, 120);
});

generateBtn.addEventListener("click", async () => {
  if (selectedOrder.length === 0) {
    setStatus("出力する案件を1件以上選んでください", "err");
    return;
  }
  if (selectedOrder.length > MAX_PROJECTS) {
    setStatus(`案件は最大${MAX_PROJECTS}件までです（現在${selectedOrder.length}件選択中）`, "err");
    return;
  }
  setStatus("生成中...");
  try {
    const selected = selectedOrder.map((id) => byId.get(id)).filter(Boolean);
    const res = await fetch("template.xlsx");
    if (!res.ok) throw new Error("テンプレートの取得に失敗しました");
    const templateBuffer = await res.arrayBuffer();
    const blob = await fillWorkbook(templateBuffer, selected, window.SKILLS || []);

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `スキルシート_草間暁_${stamp}.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`書き出しました: ${filename}`, "ok");
  } catch (err) {
    setStatus(err.message, "err");
  }
});

function load() {
  projects = (window.PROJECTS || []).map(toBlock);
  byId = new Map(projects.map((p) => [p.id, p]));
  renderTagFilter();
  renderTiles();
  renderSelectedList();
}

load();
