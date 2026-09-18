"use strict";
/* xlsx を ExcelJS の読み込み→書き込みで丸ごと再構築すると、この案件のテンプレート
   （LibreOffice 由来・inlineStr・スタイル数が多い）では Excel が「修復」を要求する
   ファイルになってしまう（ExcelJS 側の既知の未解決不具合。読み込みだけで書き戻しても
   同じ現象が起きることを確認済み）。
   そのため、xl/worksheets/sheet1.xml の該当セルだけを文字列レベルで書き換え、
   styles.xml・workbook.xml・theme 等は一切触らずそのまま zip に戻す。 */
const JSZip = require("jszip");

const SHEET_PATH = "xl/worksheets/sheet1.xml";

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Excelの日付シリアル値（1899-12-30を0とする日数）。テンプレートの既存日付セルと同じ形式。
function excelSerialDate(date) {
  const epoch = Date.UTC(1899, 11, 30);
  return Math.round((date.getTime() - epoch) / 86400000);
}

function findCell(xml, coord) {
  const re = new RegExp(`<c r="${coord}"((?:\\s+[\\w:.-]+="[^"]*")*)\\s*(?:/>|>([\\s\\S]*?)</c>)`);
  const m = re.exec(xml);
  if (!m) return null;
  const attrs = m[1] || "";
  const styleMatch = /\ss="(\d+)"/.exec(attrs);
  return { fullMatch: m[0], index: m.index, length: m[0].length, style: styleMatch ? styleMatch[1] : null };
}

function buildCell(coord, style, inner) {
  const styleAttr = style != null ? ` s="${style}"` : "";
  if (!inner) return `<c r="${coord}"${styleAttr} t="n" />`;
  return `<c r="${coord}"${styleAttr}${inner.typeAttr || ""}>${inner.body}</c>`;
}

/**
 * @param {string} xml 現在の sheet1.xml
 * @param {string} coord 例 "I19"
 * @param {object} spec 次のいずれか1つだけ指定する
 *   { clear: true } | { string: string } | { number: number } | { date: Date } | { formula: string }
 */
function setCell(xml, coord, spec) {
  const found = findCell(xml, coord);
  if (!found) {
    // クリア指定なら「そもそもセルが存在しない」も目的達成済みとして無視する
    // （テンプレート側の構造の揺れで、R13 のように一部セルが存在しないことがある）。
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
  } else if (spec.date instanceof Date) {
    inner = { typeAttr: ' t="n"', body: `<v>${excelSerialDate(spec.date)}</v>` };
  } else if (typeof spec.formula === "string") {
    inner = { typeAttr: "", body: `<f>${escapeXml(spec.formula)}</f><v/>` };
  } else {
    throw new Error(`セル ${coord} の指定が不正です: ${JSON.stringify(spec)}`);
  }

  const replacement = buildCell(coord, found.style, inner);
  return xml.slice(0, found.index) + replacement + xml.slice(found.index + found.length);
}

/** 行の表示・非表示（hidden="1"）を切り替える。 */
function setRowHidden(xml, rowNumber, hidden) {
  const re = new RegExp(`<row r="${rowNumber}"([^>]*)>`);
  const m = re.exec(xml);
  if (!m) throw new Error(`行 ${rowNumber} がテンプレートに見つかりません`);
  let attrs = m[1].replace(/\s+hidden="[01]"/, "");
  if (hidden) attrs += ' hidden="1"';
  const replacement = `<row r="${rowNumber}"${attrs}>`;
  return xml.slice(0, m.index) + replacement + xml.slice(m.index + m[0].length);
}

/**
 * @param {Buffer|ArrayBuffer} templateData
 * @param {(xml: string) => string} mutate sheet1.xml を受け取り、書き換えた文字列を返す
 * @param {"nodebuffer"|"blob"|"arraybuffer"} outputType
 */
async function patchWorkbook(templateData, mutate, outputType) {
  const zip = await JSZip.loadAsync(templateData);
  const file = zip.file(SHEET_PATH);
  if (!file) throw new Error(`テンプレートに ${SHEET_PATH} が見つかりません`);
  const xml = await file.async("string");
  zip.file(SHEET_PATH, mutate(xml));
  return zip.generateAsync({ type: outputType, compression: "DEFLATE" });
}

module.exports = { setCell, setRowHidden, patchWorkbook, escapeXml, excelSerialDate };
