import assert from "node:assert/strict";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
let browser;

try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  // 固定随机数，让年龄推进测试稳定且可重复。
  await page.evaluateOnNewDocument(() => {
    let seed = 20260710;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('[data-action="start-life"]', { timeout: 10000 });

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.equal(overflow.document, overflow.viewport, "移动端页面出现横向溢出");
  assert.equal(overflow.body, overflow.viewport, "移动端 body 出现横向溢出");

  await page.click('[data-action="start-life"]');
  await page.waitForSelector('[data-action="onboarding-next-year"]', { timeout: 10000 });
  await page.click('[data-action="onboarding-next-year"]');

  async function savedAge() {
    return page.evaluate(() => {
      const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
      const slot = meta.findIndex(Boolean);
      if (slot < 0) return -1;
      return Number(JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`) || "{}").age ?? -1);
    });
  }

  async function clearBlockingUi() {
    const selectors = [
      '[data-action="close-achievement"]',
      '[data-action="close-surprise"]',
      '.choice-btn:not([disabled])',
      '[data-action="finish-result"]',
      '[data-action="finish-event"]',
      '[data-action="finish-onboarding"]',
    ];

    for (let attempt = 0; attempt < 40; attempt += 1) {
      let clicked = false;
      for (const selector of selectors) {
        const button = await page.$(selector);
        if (!button) continue;
        await button.click();
        await new Promise((resolve) => setTimeout(resolve, 60));
        clicked = true;
        break;
      }
      if (!clicked) return;
    }
    throw new Error("事件流程超过 40 个步骤，可能已卡死");
  }

  await clearBlockingUi();
  while ((await savedAge()) < 12) {
    const before = await savedAge();
    const next = await page.$('[data-action="next-year"]:not([disabled])');
    assert.ok(next, `${before} 岁时找不到可用的“下一年”按钮`);
    await next.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    await clearBlockingUi();
    const after = await savedAge();
    assert.equal(after, before + 1, `年龄推进异常：${before} -> ${after}`);
  }

  const ageBeforeReload = await savedAge();
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".game-shell", { timeout: 10000 });
  assert.equal(await savedAge(), ageBeforeReload, "刷新页面后存档年龄发生变化");

  await page.setViewport({ width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  const shell = await page.$(".game-shell");
  assert.ok(shell, "桌面端游戏主界面未渲染");
  assert.deepEqual(errors, [], `浏览器错误：\n${errors.join("\n")}`);
  assert.deepEqual(failedRequests, [], `资源请求失败：\n${failedRequests.join("\n")}`);

  console.log(`quality gate passed: mobile layout, 0→${ageBeforeReload} years, save reload, desktop render`);
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
