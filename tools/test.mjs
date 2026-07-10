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
  console.log("quality gate: loading create screen");
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
  console.log("quality gate: life started");

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
        // 逻辑门禁直接触发 DOM 点击，避免 Linux 无头浏览器在长页面重排时
        // 把物理点击落到浮层或已经移动的坐标上。布局手感由独立截图验证。
        await button.evaluate((element) => element.click());
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
    console.log(`quality gate: advancing age ${before}`);
    const next = await page.$('[data-action="next-year"]:not([disabled])');
    assert.ok(next, `${before} 岁时找不到可用的“下一年”按钮`);
    await next.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    await clearBlockingUi();
    const after = await savedAge();
    assert.equal(after, before + 1, `年龄推进异常：${before} -> ${after}`);
  }

  const ageBeforeReload = await savedAge();
  console.log("quality gate: verifying save reload");
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".game-shell", { timeout: 10000 });
  assert.equal(await savedAge(), ageBeforeReload, "刷新页面后存档年龄发生变化");

  console.log("quality gate: verifying family story compatibility");
  const normalizedStories = await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
    const slot = meta.findIndex(Boolean);
    const key = `dynasty-life-slot-${slot}`;
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    delete saved.familyStories;
    saved.age = 16;
    saved.year = 16;
    saved.stats.money = 1000;
    saved.currentEvent = null;
    saved.eventResult = null;
    saved.pendingSurprise = null;
    saved.pendingAchievement = null;
    saved.family.father = { ...saved.family.father, alive: true, age: 60, physique: 45 };
    state = normalizeState(saved);
    save();
    render();
    return {
      active: state.familyStories.active,
      completed: state.familyStories.completed,
      lastTriggerYear: state.familyStories.lastTriggerYear,
    };
  });
  assert.deepEqual(normalizedStories, { active: null, completed: [], lastTriggerYear: -1 }, "旧存档未正确补全家事状态");

  await page.evaluate(() => {
    state.familyStories = {
      active: {
        type: "parentIllness",
        targetId: "father",
        stage: "intro",
        choice: "",
        score: 0,
        dueYear: 17,
        key: "parent-illness-father",
      },
      completed: [],
      lastTriggerYear: 16,
    };
    save();
    render();
  });
  const storyNext = await page.$('[data-action="next-year"]:not([disabled])');
  assert.ok(storyNext, "家事测试无法推进到触发年份");
  await storyNext.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  const introKind = await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
    const slot = meta.findIndex(Boolean);
    return JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`) || "{}").currentEvent?.kind;
  });
  assert.equal(introKind, "familyStory", "未触发父母疾病家事");
  await clearBlockingUi();

  let storyState = await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
    const slot = meta.findIndex(Boolean);
    return JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`) || "{}").familyStories;
  });
  assert.equal(storyState.active?.stage, "followup", "家事选择后未进入跨年阶段");
  assert.equal(storyState.active?.choice, "doctor", "家事选择没有写入存档");

  const followupNext = await page.$('[data-action="next-year"]:not([disabled])');
  assert.ok(followupNext, "家事测试无法推进到结果年份");
  await followupNext.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  await clearBlockingUi();
  storyState = await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
    const slot = meta.findIndex(Boolean);
    return JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`) || "{}").familyStories;
  });
  assert.equal(storyState.active, null, "跨年家事完成后仍处于进行中");
  assert.ok(storyState.completed.includes("parent-illness-father"), "跨年家事未写入完成记录");

  console.log("quality gate: verifying sibling and child story paths");
  await page.evaluate(() => {
    const sibling = normalizeRelative({ name: `${state.name.slice(0, 1)}承平`, gender: "male", relation: "哥哥", age: 25, physique: 75, alive: true, affection: 65 }, state.name.slice(0, 1), "sibling");
    state.family.siblings = [sibling];
    state.familyStories.active = {
      type: "siblingDivision",
      targetId: sibling.id,
      stage: "intro",
      choice: "",
      score: 0,
      dueYear: state.year + 1,
      key: `sibling-division-${sibling.id}`,
    };
    save();
    render();
  });
  let nextStoryYear = await page.$('[data-action="next-year"]:not([disabled])');
  assert.ok(nextStoryYear, "兄弟分家测试无法推进");
  await nextStoryYear.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  await clearBlockingUi();
  storyState = await page.evaluate(() => state.familyStories);
  assert.equal(storyState.active?.choice, "mediate", "兄弟分家选择未写入存档");
  nextStoryYear = await page.$('[data-action="next-year"]:not([disabled])');
  await nextStoryYear.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  await clearBlockingUi();
  const siblingResult = await page.evaluate(() => ({ stories: state.familyStories, separated: state.family.siblings[0]?.householdSeparated }));
  assert.equal(siblingResult.stories.active, null, "兄弟分家事件未完成");
  assert.equal(siblingResult.separated, true, "兄弟分家结果未写入亲友状态");

  await page.evaluate(() => {
    const child = makeChild(state.name.slice(0, 1), 6);
    state.family.children = [child];
    state.familyStories.active = {
      type: "childEducation",
      targetId: child.id,
      stage: "intro",
      choice: "",
      score: 0,
      dueYear: state.year + 1,
      key: `child-education-${child.id}`,
    };
    save();
    render();
  });
  nextStoryYear = await page.$('[data-action="next-year"]:not([disabled])');
  assert.ok(nextStoryYear, "子女教养测试无法推进");
  await nextStoryYear.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  await clearBlockingUi();
  storyState = await page.evaluate(() => state.familyStories);
  assert.equal(storyState.active?.choice, "academy", "子女教养道路未写入存档");

  nextStoryYear = await page.$('[data-action="next-year"]:not([disabled])');
  await nextStoryYear.click();
  await new Promise((resolve) => setTimeout(resolve, 80));
  await clearBlockingUi();
  nextStoryYear = await page.$('[data-action="next-year"]:not([disabled])');
  assert.ok(nextStoryYear, "子女教养测试无法推进到结果年份");
  await nextStoryYear.click();
  await page.waitForSelector('.choice-btn:not([disabled])', { timeout: 10000 });
  await clearBlockingUi();
  const childResult = await page.evaluate(() => ({ stories: state.familyStories, child: state.family.children[0] }));
  assert.equal(childResult.stories.active, null, "子女教养事件未完成");
  assert.equal(childResult.child.educationPath, "academy", "子女教养道路未保留");
  assert.ok(childResult.child.educationOutcome, "子女教养结果未写入亲友状态");

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
