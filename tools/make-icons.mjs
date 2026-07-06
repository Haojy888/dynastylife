// 生成 favicon / apple-touch-icon / og-image
import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// —— 印章风格 favicon:红底描金边,白色"生"字 ——
function sealSvg(size) {
  const pad = Math.round(size * 0.06);
  const inner = size - pad * 2;
  const r = Math.round(size * 0.18);
  const stroke = Math.max(2, Math.round(size * 0.028));
  const fontSize = Math.round(size * 0.62);
  const textY = Math.round(size * 0.5 + fontSize * 0.36);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c0392b"/>
      <stop offset="1" stop-color="#96281b"/>
    </linearGradient>
  </defs>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" fill="url(#bg)"/>
  <rect x="${pad + stroke * 1.6}" y="${pad + stroke * 1.6}" width="${inner - stroke * 3.2}" height="${inner - stroke * 3.2}" rx="${Math.max(2, r - stroke * 1.6)}" fill="none" stroke="#f5d78e" stroke-width="${stroke}" opacity="0.9"/>
  <text x="50%" y="${textY}" text-anchor="middle" font-family="SimSun, 'Microsoft YaHei', serif" font-weight="bold" font-size="${fontSize}" fill="#fdf6e3">生</text>
</svg>`);
}

async function makeFavicons() {
  await sharp(sealSvg(512)).png().toFile(path.join(root, "assets/favicon-512.png"));
  await sharp(sealSvg(192)).png().toFile(path.join(root, "assets/favicon-192.png"));
  await sharp(sealSvg(180)).png().toFile(path.join(root, "assets/apple-touch-icon.png"));
  await sharp(sealSvg(64)).resize(32, 32).png().toFile(path.join(root, "assets/favicon-32.png"));
  console.log("favicons done");
}

// —— og 分享图 1200x630:纸色底 + 头像 + 标题 ——
async function makeOg() {
  const W = 1200, H = 630;
  const bgSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f1e3"/>
      <stop offset="1" stop-color="#e8dcc4"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="#2f7d6d" stroke-width="3" opacity="0.55"/>
  <rect x="38" y="38" width="${W - 76}" height="${H - 76}" fill="none" stroke="#c2743f" stroke-width="1.5" opacity="0.5"/>
  <text x="96" y="300" font-family="SimSun, 'Microsoft YaHei', serif" font-weight="bold" font-size="130" fill="#2c3030">古代人生</text>
  <text x="102" y="388" font-family="'Microsoft YaHei', sans-serif" font-size="42" fill="#68706d">网页版古风人生模拟</text>
  <text x="102" y="472" font-family="'Microsoft YaHei', sans-serif" font-size="30" fill="#8a7a5c">科举 · 营生 · 姻缘 · 押镖 · 促织 · 雅戏</text>
  <text x="102" y="548" font-family="'Microsoft YaHei', sans-serif" font-size="26" fill="#2f7d6d">www.dynastylife.online</text>
</svg>`);

  const avatar = await sharp(path.join(root, "assets/player-avatar-male-1.png"))
    .resize(430, 430)
    .toBuffer();
  const seal = await sharp(sealSvg(120)).png().toBuffer();

  await sharp(bgSvg)
    .composite([
      { input: avatar, left: W - 430 - 90, top: (H - 430) / 2 },
      { input: seal, left: 560, top: 96 },
    ])
    .png()
    .toFile(path.join(root, "assets/og-image.png"));
  console.log("og-image done");
}

await makeFavicons();
await makeOg();
