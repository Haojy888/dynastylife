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

  console.log("quality gate: verifying rank-specific official posts and cases");
  const officialSetup = await page.evaluate(() => {
    state.age = 33;
    state.year = 33;
    state.career = { name: "县衙户房", customKind: "official", careerType: 5 };
    state.careerProgress["县衙户房"] = { exp: 3021, level: 1 };
    state.official = normalizeOfficial({ ...state.official, unlocked: true, rank: 18, merit: 6462 });
    recordOfficialPost("测试任命");
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    view.page = "main";
    view.tab = "career";
    view.overlay = "";
    save();
    render();
    return {
      title: currentCareerName(),
      postCaseCount: OFFICIAL_POST_CASES.length,
      rankCount: OFFICIAL_RANKS.length,
      validCases: OFFICIAL_RANKS.every((_, rank) => {
        const item = officialPostCase(rank);
        return item?.minRank === rank && item?.maxRank === rank && item.options?.length === 3;
      }),
      panel: document.querySelector(".panel-content")?.textContent || "",
    };
  });
  assert.equal(officialSetup.title, "正一品 · 大学士", "高阶官职仍被底层营生名称覆盖");
  assert.equal(officialSetup.postCaseCount, officialSetup.rankCount, "并非每一级官职都有专属剧情");
  assert.equal(officialSetup.validCases, true, "官职专属剧情与官阶没有一一对应");
  assert.match(officialSetup.panel, /当前\s*正一品\s*·\s*大学士/, "营生面板未显示实际官职");
  const postCaseButton = await page.$('[data-career-action="case:post"]:not([disabled])');
  assert.ok(postCaseButton, "大学士专案按钮不可用");
  await postCaseButton.evaluate((element) => element.click());
  assert.equal(await page.evaluate(() => state.currentEvent?.id), "post-case-18", "未触发大学士对应的专属剧情");
  await clearBlockingUi();

  console.log("quality gate: verifying spouse and concubine interactions");
  const romanceSetup = await page.evaluate(() => {
    state.gender = "male";
    state.age = 33;
    state.year = 33;
    state.stats.money = 2000;
    state.family = normalizeFamily({
      ...state.family,
      spouse: "沈素音",
      spouseAffection: 82,
      spouseMeta: {
        name: "沈素音",
        relation: "妻子",
        gender: "female",
        age: 30,
        alive: true,
        affection: 82,
        physique: 66,
        intimacy: 35,
        lastIntimateYear: -1,
      },
      concubines: [],
      concubineCandidate: {
        name: "顾清和",
        relation: "相看之人",
        gender: "female",
        age: 24,
        alive: true,
        affection: 68,
        physique: 65,
      },
    });
    state.currentEvent = null;
    state.eventResult = null;
    view.page = "relations";
    view.overlay = "";
    save();
    render();
    return [...document.querySelectorAll('[data-relation-target="spouse"]')].map((button) => button.dataset.relationAction);
  });
  assert.deepEqual([...romanceSetup].sort(), ["care", "gift", "intimate", "outing", "talk"], "妻子互动按钮缺失");

  const spouseBefore = await page.evaluate(() => state.family.spouseAffection);
  await page.$eval('[data-relation-target="spouse"][data-relation-action="talk"]', (element) => element.click());
  const spouseTalk = await page.evaluate(() => ({
    title: state.eventResult?.title,
    affection: state.family.spouseAffection,
  }));
  assert.ok(spouseTalk.title, "点击妻子夜话后没有产生互动结果");
  assert.ok(spouseTalk.affection > spouseBefore, "妻子夜话没有提升感情");
  await clearBlockingUi();

  await page.$eval('[data-relation-target="spouse"][data-relation-action="intimate"]', (element) => element.click());
  const intimacyResult = await page.evaluate(() => ({
    title: state.eventResult?.title,
    records: state.family.romanceRecords.intimate,
    bonus: state.family.intimacyBonus,
    year: state.family.spouseMeta.lastIntimateYear,
  }));
  assert.ok(intimacyResult.title, "点击同房后没有产生剧情结果");
  assert.equal(intimacyResult.records, 1, "同房记录没有写入存档");
  assert.ok(intimacyResult.bonus > 0, "同房没有影响后续生育判定");
  assert.equal(intimacyResult.year, 33, "同房年份没有记录");
  await clearBlockingUi();

  await page.$eval('[data-action="take-concubine"]', (element) => element.click());
  const concubineResult = await page.evaluate(() => ({
    count: state.family.concubines.length,
    candidate: state.family.concubineCandidate,
    id: state.family.concubines[0]?.id,
    title: state.eventResult?.title,
  }));
  assert.equal(concubineResult.count, 1, "纳入侧室后没有写入家族状态");
  assert.equal(concubineResult.candidate, null, "已纳入的媒人名帖没有清除");
  assert.ok(concubineResult.id, "侧室缺少可交互的稳定标识");
  assert.ok(concubineResult.title, "纳妾没有产生结果剧情");
  await clearBlockingUi();

  const persistedRomance = await page.evaluate(() => {
    view.page = "relations";
    render();
    const concubine = state.family.concubines[0];
    const actions = [...document.querySelectorAll(`[data-relation-target="${concubine.id}"]`)].map((button) => button.dataset.relationAction);
    const restored = normalizeState(JSON.parse(JSON.stringify(state)));
    return {
      actions,
      count: restored.family.concubines.length,
      spouseIntimacy: restored.family.spouseMeta.intimacy,
      intimateRecords: restored.family.romanceRecords.intimate,
    };
  });
  assert.deepEqual([...persistedRomance.actions].sort(), ["care", "gift", "intimate", "outing", "talk"], "侧室互动按钮缺失");
  assert.equal(persistedRomance.count, 1, "旧档兼容流程丢失侧室");
  assert.ok(persistedRomance.spouseIntimacy > 35, "妻子亲密状态没有持久化");
  assert.equal(persistedRomance.intimateRecords, 1, "亲密互动记录没有持久化");

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
