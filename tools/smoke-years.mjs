// 冒烟:开始人生并连续推进多年,验证事件系统与图标渲染
import puppeteer from "puppeteer-core";
import path from "node:path";

const here = import.meta.dirname;
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--disable-gpu"],
});
const errors = [];
const badImages = new Set();
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
page.on("requestfailed", (req) => {
  if (req.resourceType() === "image") badImages.add(req.url());
});
page.on("response", (res) => {
  if (res.status() === 404) badImages.add(res.url());
});

await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://127.0.0.1:5199/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForSelector('[data-action="start-life"]', { timeout: 20000 });
await new Promise((r) => setTimeout(r, 800));

await page.click('[data-action="start-life"]');
await new Promise((r) => setTimeout(r, 900));

// 关掉新手引导(如果有)
const dismiss = await page.$('[data-action="onboarding-start"], .onboarding-actions .primary-btn');
if (dismiss) {
  await dismiss.click();
  await new Promise((r) => setTimeout(r, 600));
}

// 连续推进 12 年,处理事件选项与结果确认
for (let i = 0; i < 12; i++) {
  for (let k = 0; k < 10; k++) {
    const btn =
      (await page.$(".choice-btn")) ||
      (await page.$('[data-action="finish-result"]')) ||
      (await page.$('[data-action="finish-event"]')) ||
      (await page.$('[data-action="close-surprise"]'));
    if (!btn) break;
    await btn.click().catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
  }
  const nextBtn = await page.$('[data-action="next-year"]:not([disabled])');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise((r) => setTimeout(r, 450));
  }
}

const age = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("dynasty-life-web-modern-v1") || "{}");
  return s.age;
});
await page.screenshot({ path: path.join(here, "shot-years.png") });

console.log("reached age:", age);
console.log("js errors:", errors.length ? errors.slice(0, 8) : "none");
console.log("failed images:", badImages.size ? [...badImages].slice(0, 10) : "none");
await browser.close();
