// 移动/桌面截图 + 游戏流程冒烟测试
import puppeteer from "puppeteer-core";
import path from "node:path";

const here = import.meta.dirname;
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--disable-gpu"],
});

const errors = [];
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
});

// 移动端
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:5199/", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: path.join(here, "shot-mobile.png") });

// 冒烟:点"开始人生"进入游戏
await page.click('[data-action="start-life"]');
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: path.join(here, "shot-mobile-game.png") });

// 桌面端游戏页
await page.setViewport({ width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: path.join(here, "shot-desktop-game.png") });

// 检查存档与继续
const hasSave = await page.evaluate(() => !!localStorage.getItem("dynasty-life-web-modern-v1"));
console.log("save written:", hasSave);
console.log("js errors:", errors.length ? errors.slice(0, 10) : "none");
await browser.close();
