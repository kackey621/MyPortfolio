"use strict";

/* テンプレートの「実務開発経験」スキル一覧（10〜15行目）を、
   window.SKILLS（assets/data.js）から動的に組み立てる。
   各カテゴリは表の行数（5行）で容量が決まっているため、
   経験年数の多い順に並べて上位のみを反映し、はみ出した分は切り捨てる。
   「言語」は G/J・L/O の2列（計10行）を使う。 */
const ROWS = [11, 12, 13, 14, 15];

function byYearsDesc(skills, kind) {
  return skills.filter((s) => s.kind === kind).slice().sort((a, b) => (b.years || 0) - (a.years || 0));
}

// テンプレートのフレームワーク欄は13行目だけ本来のR13:T13結合が外れており、
// 名前は代わりにS13に入っている（テンプレート側の元からの不整合）。
// R13に書くとS13の古い値（"Vue.js"）と重なって表示されるため、行ごとに列を上書きできるようにする。
function bucketCells(items, nameCol, yearsCol, nameColOverrides) {
  const cells = {};
  ROWS.forEach((r, i) => {
    const item = items[i];
    const col = (nameColOverrides && nameColOverrides[r]) || nameCol;
    if (nameColOverrides && nameColOverrides[r] && col !== nameCol) {
      cells[`${nameCol}${r}`] = ""; // 通常の列は使わないので明示的に空にする
    }
    cells[`${col}${r}`] = item ? item.name : "";
    cells[`${yearsCol}${r}`] = item ? item.years : "";
  });
  return cells;
}

/** @param {Array<{name:string,kind:string,years:number}>} skills window.SKILLS */
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

module.exports = { buildSkillCells };
