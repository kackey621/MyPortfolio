"use strict";

const MAX_PROJECTS = 16;
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
let selectedOrder = []; // array of ids, in output order
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
  return [
    ...splitTags(project.languagesFw),
    ...splitTags(project.db),
    ...splitTags(project.serverOs),
    ...splitTags(project.tools),
  ];
}

function formatPeriod(project) {
  const start = project.start ? project.start.slice(0, 7).replace("-", "/") : "";
  const end = project.end ? project.end.slice(0, 7).replace("-", "/") : "継続中";
  return `${start} 〜 ${end}`;
}

function searchHaystack(project) {
  return [project.company, project.title, project.industry, project.employmentType, ...projectTags(project)]
    .join(" ")
    .toLowerCase();
}

function buildTagVocabulary() {
  const freq = new Map();
  for (const p of projects) {
    for (const tag of new Set(projectTags(p))) {
      freq.set(tag, (freq.get(tag) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_TAG_CHIPS)
    .map(([tag]) => tag);
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
      if (activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
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
  if (idx === -1) selectedOrder.push(id);
  else selectedOrder.splice(idx, 1);
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
  selectedCountEl.parentElement.style.color = selectedOrder.length > MAX_PROJECTS ? "#a03535" : "";
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
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedOrder }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "生成に失敗しました");
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? decodeURIComponent(match[1]) : "スキルシート.xlsx";
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

async function load() {
  setStatus("読み込み中...");
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("案件データの読み込みに失敗しました");
    projects = await res.json();
    byId = new Map(projects.map((p) => [p.id, p]));
    renderTagFilter();
    renderTiles();
    renderSelectedList();
    setStatus("");
  } catch (err) {
    setStatus(err.message, "err");
  }
}

load();
