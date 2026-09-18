"use strict";
const fs = require("fs");
const { setCell, setRowHidden, patchWorkbook } = require("./xlsxPatch");
const { buildSkillCells } = require("./skillTable");
const { calcAge } = require("./age");

/* テンプレート（スキルシート_AKIRA.xlsx）の構造。
   氏名・GitHub ID・得意分野・自己PR等（個人情報）には一切触れない。
   触れるのは、案件経験テーブル（17行目以降、1件10行×最大16件）、
   実務開発経験のスキル年数（10〜15行目、window.SKILLS 由来）、
   年齢（Y3、config.json の birthDate 由来）と更新日のみ。

   xl/worksheets/sheet1.xml だけを文字列レベルで書き換える（xlsxPatch.js）。
   ExcelJS で読み込み→書き込みし直すと、このテンプレート特有の構造で
   Excel が「修復」を要求するファイルになってしまうため（読み込むだけで
   何も変更せず書き戻しても再現する、ExcelJS 側の既知の未解決の不具合）。 */
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

function toDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function writeBlock(xml, r, project, slot) {
  const set = (coord, spec) => {
    xml = setCell(xml, coord, spec);
  };

  if (!project) {
    set(`B${r}`, { clear: true });
    set(`C${r}`, { clear: true });
    set(`G${r}`, { clear: true });
    set(`I${r}`, { clear: true });
    set(`W${r}`, { clear: true });
    set(`Y${r}`, { clear: true });
    set(`AA${r}`, { clear: true });
    set(`AC${r}`, { clear: true });
    set(`AE${r}`, { clear: true });
    set(`AG${r}`, { clear: true });
    for (const col of PHASE_COLUMNS) set(`${col}${r}`, { clear: true });
    set(`C${r + 1}`, { clear: true });
    set(`I${r + 1}`, { clear: true });
    set(`I${r + 3}`, { clear: true });
    set(`C${r + 5}`, { clear: true });
    set(`C${r + 6}`, { clear: true });
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

  set(`C${r + 1}`, project.start ? { date: toDate(project.start) } : { clear: true });
  set(`I${r + 1}`, { string: project.title || "" });
  set(`I${r + 3}`, { string: project.description || "" });
  set(`C${r + 5}`, { string: "〜" });
  set(`C${r + 6}`, project.end ? { date: toDate(project.end) } : { formula: "NOW()" });

  return xml;
}

function formatUpdatedAt(date) {
  return `更新日：　${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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

  const templateData = fs.readFileSync(templatePath);

  return patchWorkbook(templateData, (xml) => {
    xml = setCell(xml, UPDATED_AT_CELL, { string: formatUpdatedAt(new Date()) });

    if (extras && extras.birthDate) {
      xml = setCell(xml, AGE_CELL, { number: calcAge(extras.birthDate, new Date()) });
    }

    if (extras && extras.skills) {
      const skillCells = buildSkillCells(extras.skills);
      for (const [coord, value] of Object.entries(skillCells)) {
        xml = setCell(xml, coord, typeof value === "number" ? { number: value } : { string: value });
      }
    }

    blockRows().forEach((r, i) => {
      xml = writeBlock(xml, r, projects[i] || null, i + 1);
    });

    // 使っていない案件ブロックは、罫線・塗りなどのデザインが空欄のまま残らないよう非表示にする。
    const usedRowCount = projects.length * ROWS_PER_BLOCK;
    for (let i = 0; i < BLOCK_COUNT * ROWS_PER_BLOCK; i++) {
      xml = setRowHidden(xml, FIRST_BLOCK_ROW + i, i >= usedRowCount);
    }

    return xml;
  }, "nodebuffer");
}

module.exports = { fillTemplate, BLOCK_COUNT };
