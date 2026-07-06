// 扫描 assets 引用关系:只报告,不删除
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sources = ["game-data.js", "app.js", "index.html", "styles.css"];
const assetsDir = path.join(root, "assets");

const referenced = new Set();
const re = /assets\/[A-Za-z0-9_\-. %()]+?\.(?:png|jpg|jpeg|webp|gif|svg)/g;
for (const src of sources) {
  const text = fs.readFileSync(path.join(root, src), "utf8");
  for (const m of text.matchAll(re)) {
    referenced.add(m[0].slice("assets/".length));
  }
}

const onDisk = fs.readdirSync(assetsDir).filter((f) => fs.statSync(path.join(assetsDir, f)).isFile());
const onDiskSet = new Set(onDisk);

const missing = [...referenced].filter((f) => !onDiskSet.has(f));
const unused = onDisk.filter((f) => !referenced.has(f));

let usedBytes = 0;
let unusedBytes = 0;
for (const f of onDisk) {
  const size = fs.statSync(path.join(assetsDir, f)).size;
  if (referenced.has(f)) usedBytes += size;
  else unusedBytes += size;
}

console.log(`referenced in code : ${referenced.size}`);
console.log(`files on disk      : ${onDisk.length}`);
console.log(`missing (referenced but not on disk): ${missing.length}`);
missing.slice(0, 20).forEach((f) => console.log(`  MISSING ${f}`));
console.log(`unused (on disk but never referenced): ${unused.length}`);
console.log(`used size  : ${(usedBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`unused size: ${(unusedBytes / 1024 / 1024).toFixed(1)} MB`);

fs.writeFileSync(path.join(root, "tools", "unused-assets.txt"), unused.join("\n"));
console.log("unused list written to tools/unused-assets.txt");
