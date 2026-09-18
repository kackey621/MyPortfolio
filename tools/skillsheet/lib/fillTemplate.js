"use strict";
const ExcelJS = require("exceljs");
const { buildSkillCells } = require("./skillTable");
const { calcAge } = require("./age");

/* テンプレート（スキルシート_AKIRA.xlsx）の構造。
   氏名・GitHub ID・得意分野・自己PR等（個人情報）には一切触れない。
   触れるのは、案件経験テーブル（17行目以降、1件10行×最大16件）、
   実務開発経験のスキル年数（10〜15行目、window.SKILLS 由来）、
   年齢（Y3、config.json の birthDate 由来）と更新日のみ。 */
const SHEET_NAME = "スキルシート";
const UPDATED_AT_CELL = "AE2";
const AGE_CELL = "Y3";
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

function toExcelDate(isoDate) {
  // "YYYY-MM-DD" を、時刻・タイムゾーンの影響を受けない日付として扱う。
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function writeBlock(ws, r, project) {
  const set = (coord, value) => {
    ws.getCell(coord).value = value;
  };

  if (!project) {
    set(`B${r}`, null);
    set(`C${r}`, null);
    set(`G${r}`, "");
    set(`I${r}`, "");
    set(`W${r}`, "");
    set(`Y${r}`, "");
    set(`AA${r}`, "");
    set(`AC${r}`, "");
    set(`AE${r}`, "");
    set(`AG${r}`, "");
    for (const col of PHASE_COLUMNS) set(`${col}${r}`, "");
    set(`C${r + 1}`, "");
    set(`I${r + 1}`, "");
    set(`I${r + 3}`, "");
    set(`C${r + 5}`, "");
    set(`C${r + 6}`, "");
    return;
  }

  set(`C${r}`, { formula: durationFormula(r) });
  set(`G${r}`, project.industry || "");
  set(`I${r}`, project.company || "");
  set(`W${r}`, project.employmentType || "");
  set(`Y${r}`, project.teamSize || "");
  set(`AA${r}`, project.languagesFw || "");
  set(`AC${r}`, project.db || "");
  set(`AE${r}`, project.serverOs || "");
  set(`AG${r}`, project.tools || "");

  const phases = Array.isArray(project.phases) ? project.phases : [];
  PHASE_COLUMNS.forEach((col, i) => set(`${col}${r}`, phases[i] ? "●" : ""));

  set(`C${r + 1}`, project.start ? toExcelDate(project.start) : "");
  set(`I${r + 1}`, project.title || "");
  set(`I${r + 3}`, project.description || "");
  set(`C${r + 5}`, "〜");
  set(`C${r + 6}`, project.end ? toExcelDate(project.end) : { formula: "NOW()" });
}

function formatUpdatedAt(date) {
  return `更新日：　${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// スキル年数の表は行を丸ごと隠せない（1行に複数カテゴリが同居するため）。
// 空欄になったセルは、表全体の外枠（medium）だけ残し、内側の格子線（hair）を消す。
function stripInnerBorder(cell) {
  const current = cell.border || {};
  const next = {};
  for (const side of ["top", "bottom", "left", "right"]) {
    if (current[side] && current[side].style === "medium") next[side] = current[side];
  }
  cell.border = next;
}

/**
 * @param {string} templatePath 元テンプレート（個人の履歴書フォルダ内）への絶対パス
 * @param {Array<object|null>} projects 1〜16件、順番どおりに書き込む（null/undefinedは空欄）
 * @param {object} [extras]
 * @param {Array<{name:string,kind:string,years:number}>} [extras.skills] window.SKILLS
 * @param {string} [extras.birthDate] "YYYY-MM-DD"（省略時は年齢セルを変更しない）
 * @returns {Promise<Buffer>} 生成済みxlsxのバッファ
 */
async function fillTemplate(templatePath, projects, extras) {
  if (projects.length > BLOCK_COUNT) {
    throw new Error(`案件は最大${BLOCK_COUNT}件までです（${projects.length}件指定されました）`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const ws = workbook.getWorksheet(SHEET_NAME);
  if (!ws) {
    throw new Error(`テンプレートにシート「${SHEET_NAME}」が見つかりません`);
  }

  ws.getCell(UPDATED_AT_CELL).value = formatUpdatedAt(new Date());

  if (extras && extras.birthDate) {
    ws.getCell(AGE_CELL).value = calcAge(extras.birthDate, new Date());
  }

  if (extras && extras.skills) {
    const skillCells = buildSkillCells(extras.skills);
    for (const [coord, value] of Object.entries(skillCells)) {
      const cell = ws.getCell(coord);
      cell.value = value;
      if (value === "") stripInnerBorder(cell);
    }
  }

  blockRows().forEach((r, i) => writeBlock(ws, r, projects[i] || null));

  // 使っていない案件ブロックは、罫線・塗りなどのデザインが空欄のまま残らないよう非表示にする。
  const usedRowCount = projects.length * ROWS_PER_BLOCK;
  for (let i = 0; i < BLOCK_COUNT * ROWS_PER_BLOCK; i++) {
    ws.getRow(FIRST_BLOCK_ROW + i).hidden = i >= usedRowCount;
  }

  return workbook.xlsx.writeBuffer();
}

module.exports = { fillTemplate, BLOCK_COUNT };
