// PNG → WebP 批量转换:仅在 WebP 更小时替换,并重写代码中的引用路径
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const assetsDir = path.join(root, "assets");

// 这些文件保持 PNG(favicon/分享卡需要最大兼容性)
const KEEP_PNG = new Set([
  "favicon-512.png",
  "favicon-192.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "og-image.png",
]);

const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".png") && !KEEP_PNG.has(f));
console.log(`candidates: ${files.length}`);

const converted = new Map(); // old name -> new name
let savedBytes = 0;
let skipped = 0;

const CONCURRENCY = 8;
let index = 0;
async function worker() {
  while (index < files.length) {
    const f = files[index++];
    const src = path.join(assetsDir, f);
    const origSize = fs.statSync(src).size;
    const webpName = f.replace(/\.png$/, ".webp");
    const dst = path.join(assetsDir, webpName);
    try {
      const buf = await sharp(src).webp({ quality: 85, effort: 4 }).toBuffer();
      if (buf.length < origSize * 0.95) {
        fs.writeFileSync(dst, buf);
        converted.set(f, webpName);
        savedBytes += origSize - buf.length;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`FAIL ${f}: ${err.message}`);
      skipped++;
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`converted: ${converted.size}, kept as png: ${skipped}`);
console.log(`saved: ${(savedBytes / 1024 / 1024).toFixed(1)} MB`);

// 重写引用
const sources = ["game-data.js", "app.js", "index.html", "styles.css"];
for (const srcFile of sources) {
  const p = path.join(root, srcFile);
  let text = fs.readFileSync(p, "utf8");
  let count = 0;
  text = text.replace(/assets\/([A-Za-z0-9_\-. %()]+?\.png)/g, (whole, name) => {
    const next = converted.get(name);
    if (next) {
      count++;
      return `assets/${next}`;
    }
    return whole;
  });
  fs.writeFileSync(p, text);
  console.log(`${srcFile}: rewrote ${count} refs`);
}

// 删除已转换的原 PNG
for (const oldName of converted.keys()) {
  fs.unlinkSync(path.join(assetsDir, oldName));
}
console.log(`deleted ${converted.size} original png files`);
