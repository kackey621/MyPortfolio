"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const DATA_JS_PATH = path.join(REPO_ROOT, "assets", "data.js");

/* サイトに掲載している案件データ（assets/data.js の window.PROJECTS）を
   そのまま読み込む。data.js はブラウザ用スクリプト（window.X = ...）なので、
   vm でサンドボックス実行して window オブジェクトを取り出す。
   このファイルは「単一データソース」を保つため、案件データを複製しない。 */
function loadWindowGlobals() {
  const code = fs.readFileSync(DATA_JS_PATH, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "data.js" });
  return sandbox.window;
}

// スタック表記の揺れ（大文字/表記違い）を吸収するための正規化キー。
function normalize(token) {
  return token.trim().toLowerCase();
}

const LANG_FW = ["PHP", "Laravel", "Ruby", "Rails", "FastAPI", "Flask", "VB", "React", "Vue",
  "Python", "HTML/CSS", "JavaScript", "R", "GAS", "Next.js", "Swift", "Kotlin", "React Native"];
const DB = ["MySQL", "PostgreSQL", "SQLite", "MariaDB"];
const SERVER_OS = ["Linux", "Ubuntu", "Redhat", "Apache", "nginx", "AWS", "Azure"];
const TOOLS = ["Moodle", "Prestashop", "WordPress", "EC-CUBE", "Magento", "WooCommerce", "Drupal",
  "O365", "Google Workspace", "Slack", "GitHub", "Git", "Teams", "VS Code", "Visual Studio Code"];

function buildLookup(list) {
  const map = new Map();
  for (const token of list) map.set(normalize(token), token);
  return map;
}
const LOOKUP = {
  languagesFw: buildLookup(LANG_FW),
  db: buildLookup(DB),
  serverOs: buildLookup(SERVER_OS),
  tools: buildLookup(TOOLS),
};

// スタック配列を、テンプレートの4列（言語・FW / DB / サーバ・OS / ツール）に分類する。
// 未知の技術名は「ツール」欄に入れる（生成結果から漏れないようにするための既定値）。
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

function monthToDate(yyyyMm) {
  return `${yyyyMm}-01`;
}

function buildDescription(body) {
  return "＜業務内容＞\n" + (body || []).map((line) => `・${line}`).join("\n");
}

/** window.PROJECTS の1件を、スキルシート案件ブロックの形に変換する。 */
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

/** サイト掲載中の案件を、スキルシート用の形に変換した配列として返す（掲載順）。 */
function listSiteProjects() {
  const win = loadWindowGlobals();
  return (win.PROJECTS || []).map(toBlock);
}

/** サイトのスキル一覧（window.SKILLS）をそのまま返す。 */
function listSkills() {
  const win = loadWindowGlobals();
  return win.SKILLS || [];
}

module.exports = { listSiteProjects, listSkills, toBlock, DATA_JS_PATH };
