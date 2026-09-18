#!/usr/bin/env node
"use strict";
/* スキルシート生成ツール（ローカル専用）。
   サイトに掲載中の案件（assets/data.js の window.PROJECTS）をチェックで選択し、
   個人の履歴書フォルダにあるテンプレート（config.json の templatePath）に
   書き込んでダウンロードさせる。公開サイト（Netlify/GitHub Pages）には含まれない。
   案件データそのものはここでは編集できない（単一データソースは assets/data.js のまま）。

   使い方:
     npm install
     npm start
     http://localhost:4173 を開く
*/
const fs = require("fs");
const path = require("path");
const express = require("express");
const { fillTemplate, BLOCK_COUNT } = require("./lib/fillTemplate");
const { listSiteProjects, listSkills } = require("./lib/siteProjects");

const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, "config.json");
const PORT = process.env.PORT || 4173;

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      "config.json が見つかりません。config.example.json をコピーして templatePath を設定してください。"
    );
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(ROOT, "public")));

app.get("/api/projects", (req, res) => {
  try {
    res.json(listSiteProjects());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "出力する案件を1件以上選んでください" });
    }
    if (ids.length > BLOCK_COUNT) {
      return res.status(400).json({ error: `案件は最大${BLOCK_COUNT}件までです` });
    }

    const byId = new Map(listSiteProjects().map((p) => [p.id, p]));
    const selected = ids.map((id) => byId.get(id)).filter(Boolean);
    if (selected.length !== ids.length) {
      return res.status(400).json({ error: "選択された案件がサイトのデータと一致しません（data.js が更新された可能性があります）" });
    }

    const config = loadConfig();
    if (!fs.existsSync(config.templatePath)) {
      return res.status(400).json({
        error: `テンプレートが見つかりません: ${config.templatePath}（config.json を確認してください）`,
      });
    }

    const buffer = await fillTemplate(config.templatePath, selected, {
      skills: listSkills(),
      birthDate: config.birthDate,
    });

    const outputDir = path.resolve(ROOT, config.outputDir || "./output");
    fs.mkdirSync(outputDir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `スキルシート_AKIRA_${stamp}.xlsx`;
    fs.writeFileSync(path.join(outputDir, filename), buffer);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`スキルシート生成ツール: http://localhost:${PORT}`);
});
