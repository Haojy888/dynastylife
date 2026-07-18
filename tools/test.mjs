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

  console.log("quality gate: verifying event illustration routing and responsive frame");
  const eventIllustrations = await page.evaluate(async () => {
    const routes = {
      familyStory: "event-life.webp",
      femaleSchool: "event-study.webp",
      officialCase: "event-official.webp",
      careerCase: "event-career.webp",
      culturalEvent: "event-culture.webp",
      prisonYear: "event-prison.webp",
      secretIntroduction: "event-jianghu.webp",
      worldArc: "event-world.webp",
      clanCouncil: "event-clan.webp",
      regionalEvent: "event-region.webp",
      fortuneEvent: "event-fortune.webp",
    };
    const mapped = Object.fromEntries(Object.keys(routes).map((kind) => [kind, eventSceneArt({ kind }).src.split("/").pop()]));
    const responses = await Promise.all(Object.values(EVENT_SCENE_ART).map(async (item) => {
      const response = await fetch(item.src);
      return { src: item.src, status: response.status, type: response.headers.get("content-type") };
    }));
    const scene = document.querySelector(".event-scene");
    const image = scene?.querySelector("img");
    return {
      routes,
      mapped,
      assetCount: Object.keys(EVENT_SCENE_ART).length,
      responses,
      rendered: !!scene && !!image && image.getAttribute("src") === "assets/event-life.webp",
      overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    };
  });
  assert.deepEqual(eventIllustrations.mapped, eventIllustrations.routes, "事件类型没有路由到对应插画");
  assert.equal(eventIllustrations.assetCount, 11, "流年事件插画数量不完整");
  assert.equal(eventIllustrations.rendered, true, "流年事件卡没有渲染插画");
  assert.equal(eventIllustrations.overflow, true, "流年事件插画导致移动端横向溢出");
  assert.ok(eventIllustrations.responses.every((item) => item.status === 200 && item.type === "image/webp"), "存在无法加载的 WebP 事件插画");

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
      '[data-action="accept-secret"]',
      '[data-action="decline-secret"]',
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
    state.dynasty = normalizeDynastyState(state.dynasty);
    state.dynasty.activeArc = null;
    state.dynasty.completedArcs = Object.keys(WORLD_ARCS);
    state.dynasty.lastArcYear = state.year;
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
  const introKinds = await page.evaluate(() => {
    const meta = JSON.parse(localStorage.getItem("dynasty-life-save-meta") || "[]");
    const slot = meta.findIndex(Boolean);
    const saved = JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`) || "{}");
    return { current: saved.currentEvent?.kind, pending: saved.pendingAnnualEvent?.kind };
  });
  assert.ok([introKinds.current, introKinds.pending].includes("familyStory"), "未触发父母疾病家事");
  assert.equal(introKinds.current, "culturalEvent", "年度文化事件未在原有家事前依序呈现");
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
    state.pendingAnnualEvent = null;
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

  console.log("quality gate: verifying advanced stories for non-official careers");
  const careerCoverage = await page.evaluate(() => {
    const names = Object.keys(CAREER_ADVANCED_CASE_DEFS);
    return {
      count: names.length,
      uniqueTitles: new Set(names.map((name) => CAREER_ADVANCED_CASE_DEFS[name].title)).size,
      valid: names.every((name) => {
        const item = CAREER_ADVANCED_CASE_DEFS[name];
        const event = careerCaseToEvent(item, name);
        return item.prompt && item.choices?.length === 3 && event?.kind === "careerCase" && event.children.every((choice) => choice.note && choice.stat && choice.support);
      }),
      smithSkills: careerSkillKeys({ name: "铁匠", customKind: "craft" }),
      cookSkills: careerSkillKeys({ name: "厨娘", customKind: "female" }),
    };
  });
  assert.equal(careerCoverage.count, 21, "非官职职业专案覆盖数量异常");
  assert.equal(careerCoverage.uniqueTitles, careerCoverage.count, "职业专案标题出现重复");
  assert.equal(careerCoverage.valid, true, "存在无法生成三选一事件的职业专案");
  assert.deepEqual(careerCoverage.smithSkills, ["physique", "knowledge"], "铁匠没有使用体魄与学识检定");
  assert.deepEqual(careerCoverage.cookSkills, ["knowledge", "eq"], "厨娘没有使用学识与处世检定");
  const completeCareerCoverage = await page.evaluate(() => {
    const careers = allCareers();
    return {
      count: careers.length,
      covered: careers.filter((career) => careerAdvancedCase(career.name)?.choices?.length === 3).length,
      generated: careers.filter((career) => !CAREER_ADVANCED_CASE_DEFS[career.name]).map((career) => careerAdvancedCase(career.name)?.title),
    };
  });
  assert.equal(completeCareerCoverage.covered, completeCareerCoverage.count, "仍有职业缺少三选一专属剧情");
  assert.equal(completeCareerCoverage.generated.every(Boolean), true, "通用职业专案生成失败");

  const carpenterSetup = await page.evaluate(() => {
    state.currentEvent = null;
    state.eventResult = null;
    state.age = 35;
    state.year = 35;
    state.stats.money = 1600;
    state.stats.knowledge = 72;
    state.stats.physique = 76;
    state.career = { name: "木匠", customKind: "craft", careerType: 1 };
    state.careerProgress.木匠 = { exp: 45, level: 2 };
    state = normalizeState(state);
    view.page = "main";
    view.tab = "career";
    view.overlay = "";
    save();
    render();
    return {
      actions: careerActions().map(([type]) => type),
      panel: document.querySelector(".panel-content")?.textContent || "",
      records: state.careerProgress.木匠.records,
    };
  });
  assert.ok(carpenterSetup.actions.includes("story:advanced"), "木匠未显示本业专案按钮");
  assert.match(carpenterSetup.panel, /专长\s*学识\s*72\s*·\s*体魄\s*76/, "职业面板未显示对应专长");
  assert.deepEqual(carpenterSetup.records, { cases: 0, successes: 0 }, "旧存档职业记录没有正确补全");

  const carpenterButton = await page.$('[data-career-action="story:advanced"]:not([disabled])');
  assert.ok(carpenterButton, "木匠专案按钮不可点击");
  await carpenterButton.evaluate((element) => element.click());
  const carpenterEvent = await page.evaluate(() => ({
    kind: state.currentEvent?.kind,
    title: state.currentEvent?.title,
    choices: state.currentEvent?.children?.length,
    notes: state.currentEvent?.children?.map((choice) => choice.note),
  }));
  assert.equal(carpenterEvent.kind, "careerCase", "点击木匠专案后没有进入职业剧情");
  assert.match(carpenterEvent.title, /木匠.*官宅危梁/, "木匠触发了错误的职业剧情");
  assert.equal(carpenterEvent.choices, 3, "木匠专案不是三选一事件");
  assert.equal(carpenterEvent.notes.every((note) => /主看/.test(note)), true, "职业选项没有说明检定属性");
  await page.$eval('.choice-btn[data-choice="0"]', (element) => element.click());
  const carpenterResult = await page.evaluate(() => ({
    title: state.eventResult?.title,
    records: state.careerProgress.木匠.records,
    exp: state.careerProgress.木匠.exp,
    logged: state.log.some((item) => /木匠.*官宅危梁/.test(item.title || "")),
  }));
  assert.ok(carpenterResult.title, "木匠专案选择后没有产生结果");
  assert.equal(carpenterResult.records.cases, 1, "木匠专案没有写入职业记录");
  assert.ok(carpenterResult.exp > 45, "木匠专案没有增加职业经验");
  assert.equal(carpenterResult.logged, true, "木匠专案没有写入命册");
  await clearBlockingUi();

  const taoistEvent = await page.evaluate(() => {
    state.career = { name: "道士", customKind: "mystic", careerType: 3 };
    state.careerProgress.道士 = { exp: 0, level: 4, records: { cases: 0, successes: 0 } };
    state.currentEvent = null;
    state.eventResult = null;
    startCareerCase();
    return {
      title: state.currentEvent?.title,
      choices: state.currentEvent?.children?.map((choice) => choice.title),
      skills: careerSkillKeys(),
    };
  });
  assert.match(taoistEvent.title, /道士.*古宅夜祟/, "道士触发了错误的职业剧情");
  assert.deepEqual(taoistEvent.choices, ["勘宅查迹", "设坛诱祟", "安抚家眷"], "道士专案选项错误");
  assert.deepEqual(taoistEvent.skills, ["virtue", "knowledge"], "道士没有使用德行与学识检定");
  await page.$eval('.choice-btn[data-choice="1"]', (element) => element.click());
  assert.equal(await page.evaluate(() => state.careerProgress.道士.records.cases), 1, "道士专案没有完成结算");
  await clearBlockingUi();

  console.log("quality gate: verifying mandatory resignation and cinematic result");
  const careerSwitching = await page.evaluate(() => {
    state.currentEvent = null;
    state.eventResult = null;
    state.career = { name: "道士", customKind: "mystic", careerType: 3 };
    const targetIndex = allCareers().findIndex((career) => career.name === "木匠");
    takeCareer(targetIndex);
    const blockedCareer = state.career?.name;
    const blockedTitle = state.eventResult?.title;
    state.eventResult = null;
    resignCareer();
    const resigned = state.career === null;
    const history = state.careerHistory.at(-1);
    const cinematic = eventResultView();
    state.eventResult = null;
    takeCareer(targetIndex);
    return { blockedCareer, blockedTitle, resigned, history, cinematic, newCareer: state.career?.name };
  });
  assert.equal(careerSwitching.blockedCareer, "道士", "未辞职时仍能直接切换职业");
  assert.equal(careerSwitching.blockedTitle, "须先辞职", "转职阻止提示不明确");
  assert.equal(careerSwitching.resigned, true, "辞职操作没有清空当前职业");
  assert.equal(careerSwitching.history.name, "道士", "辞职没有写入职业履历");
  assert.match(careerSwitching.cinematic, /cinematic-stage/, "活动结果没有渲染过场动画舞台");
  assert.equal(careerSwitching.newCareer, "木匠", "辞职后仍无法选择新职业");
  await clearBlockingUi();

  console.log("quality gate: verifying partner portraits and brothel companion flow");
  const partnerPortraits = await page.evaluate(() => ({
    wife: relativeAvatarIcon({ relation: "妻子", gender: "female" }),
    concubine: relativeAvatarIcon({ relation: "妾室", gender: "female" }),
    candidate: relativeAvatarIcon({ relation: "待纳侧室", gender: "female" }),
    husband: relativeAvatarIcon({ relation: "夫君", gender: "male" }),
    mother: relativeAvatarIcon({ relation: "母亲", gender: "female" }),
    wifePath: pathFor(relativeAvatarIcon({ relation: "妻子", gender: "female" })),
  }));
  assert.equal(partnerPortraits.wife, "FamilyWifeAvatar", "妻子仍在使用错误头像类型");
  assert.equal(partnerPortraits.concubine, "FamilyConcubineAvatar", "侧室仍在使用错误头像类型");
  assert.equal(partnerPortraits.candidate, "FamilyBetrothedAvatar", "待纳侧室仍在使用错误头像类型");
  assert.equal(partnerPortraits.husband, "FamilyHusbandAvatar", "夫君没有使用伴侣头像类型");
  assert.notEqual(partnerPortraits.wife, partnerPortraits.mother, "妻子头像仍与母亲头像相同");
  assert.match(partnerPortraits.wifePath, /courtesan-avatar-1\.webp$/, "妻子头像没有指向年轻伴侣立绘");

  const oldBrothelSave = await page.evaluate(() => {
    const saved = JSON.parse(JSON.stringify(state));
    delete saved.courtesanVisit;
    delete saved.brothelRecords;
    const restored = normalizeState(saved);
    return { visit: restored.courtesanVisit, records: restored.brothelRecords };
  });
  assert.equal(oldBrothelSave.visit, null, "旧存档未正确补全青楼雅座状态");
  assert.deepEqual(oldBrothelSave.records, { visits: 0, favorites: [] }, "旧存档未正确补全风月记录");

  const brothelSetup = await page.evaluate(() => {
    state.age = 28;
    state.year = 28;
    state.stats.money = 10000;
    state.currentEvent = null;
    state.eventResult = null;
    state.courtesanVisit = null;
    state.brothelRecords = { visits: 0, favorites: [] };
    view.overlay = "";
    startCourtesanParlor(true);
    return {
      page: view.page,
      candidates: state.courtesanVisit.candidates.map((item) => ({ id: item.id, name: item.name, portrait: item.portrait, specialty: item.specialty, age: item.age })),
      buttons: document.querySelectorAll("[data-brothel-action]").length,
      heading: document.querySelector(".brothel-card h2")?.textContent,
    };
  });
  assert.equal(brothelSetup.page, "courtesanParlor", "成年角色无法进入美人雅座");
  assert.equal(brothelSetup.heading, "美人雅座", "青楼雅座页面标题错误");
  assert.equal(brothelSetup.candidates.length, 4, "美人雅座没有生成四位可选人物");
  assert.equal(brothelSetup.buttons, 12, "每位美人没有提供三种消遣方式");
  assert.equal(brothelSetup.candidates.every((item) => item.age >= 18 && item.portrait), true, "青楼人物年龄或头像无效");
  assert.deepEqual(brothelSetup.candidates.map((item) => item.portrait), [
    "assets/brothel-pipa-v1.webp",
    "assets/brothel-dancer-v1.webp",
    "assets/brothel-poet-v1.webp",
    "assets/brothel-huakui-v1.webp",
  ], "琴姬、舞姬、诗伎和花魁头像没有按顺序接入页面");
  assert.deepEqual(brothelSetup.candidates.map((item) => item.specialty), ["琵琶", "舞袖", "诗词", "花魁"], "美人头像与人物身份没有一一对应");
  await page.waitForNetworkIdle({ idleTime: 100, timeout: 5000 }).catch(() => {});

  const firstCompanion = brothelSetup.candidates[0];
  const moneyBeforeListen = await page.evaluate(() => state.stats.money);
  await page.$eval(`[data-brothel-id="${firstCompanion.id}"][data-brothel-action="listen"]`, (element) => element.click());
  const listenResult = await page.evaluate((id) => {
    const companion = state.courtesanVisit.candidates.find((item) => item.id === id);
    return { title: state.eventResult?.title, money: state.stats.money, visits: state.brothelRecords.visits, companionVisits: companion?.visits };
  }, firstCompanion.id);
  assert.match(listenResult.title, /听曲小坐/, "选择美人听曲后没有产生结果");
  assert.ok(listenResult.money < moneyBeforeListen, "美人雅座没有扣除花费");
  assert.equal(listenResult.visits, 1, "风月往来次数没有写入记录");
  assert.equal(listenResult.companionVisits, 1, "所选美人的往来次数没有写入记录");
  await clearBlockingUi();
  await page.waitForNetworkIdle({ idleTime: 100, timeout: 5000 }).catch(() => {});

  await page.$eval(`[data-brothel-id="${firstCompanion.id}"][data-brothel-action="banquet"]`, (element) => element.click());
  const banquetResult = await page.evaluate((name) => ({
    title: state.eventResult?.title,
    visits: state.brothelRecords.visits,
    favorite: state.brothelRecords.favorites.includes(name),
    friend: state.friends.some((item) => item.name === name && item.relation === "风月知己"),
  }), firstCompanion.name);
  assert.match(banquetResult.title, /夜宴谈心/, "选择美人夜宴后没有产生结果");
  assert.equal(banquetResult.visits, 2, "第二次风月往来没有累计");
  assert.equal(banquetResult.favorite, true, "多次往来的美人没有记入知己簿");
  assert.equal(banquetResult.friend, true, "多次往来没有形成风月知己");
  await clearBlockingUi();
  await page.waitForNetworkIdle({ idleTime: 100, timeout: 5000 }).catch(() => {});

  console.log("quality gate: verifying female exam, brothel access and women school rules");
  const femaleRules = await page.evaluate(() => {
    const oldSave = JSON.parse(JSON.stringify(state));
    delete oldSave.femaleLife;
    oldSave.gender = "female";
    const normalized = normalizeState(oldSave).femaleLife;

    state.gender = "female";
    state.age = 22;
    state.year = 22;
    state.dead = false;
    state.prisonYears = 0;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingCaravan = null;
    state.career = null;
    state.tags = state.tags.filter((tag) => !["风月轻薄之名", "曾女扮男装", "青楼从业", "教坊乐户", "戏班女伶"].includes(tag));
    state.stats.money = 10000;
    state.stats.favorability = 80;
    state.stats.relationship = 80;
    state.stats.eq = 90;
    state.stats.knowledge = 90;
    state.exam = { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 };
    state.femaleLife = normalizeFemaleLife();

    view.page = "place";
    view.placeId = "theater";
    render();
    const forbidden = {
      mode: femaleTheaterAccessMode(),
      disguiseButtons: document.querySelectorAll('[data-action="female-theater-disguise"]').length,
      patronButtons: document.querySelectorAll("[data-brothel-action], [data-redeem-courtesan]").length,
      warning: document.querySelector(".female-access-panel.forbidden")?.textContent || "",
    };

    const exam = {
      open: canOpenExam(),
      prepare: canPrepareExam(),
    };
    openExamUnderworld();
    exam.underworldOpened = view.page === "examUnderworld";
    view.page = "exam";
    render();
    exam.title = document.querySelector(".female-exam-closed h2")?.textContent || "";

    view.page = "place";
    view.placeId = "theater";
    const originalRandom = Math.random;
    Math.random = () => 0.99;
    attemptFemaleTheaterDisguise();
    Math.random = originalRandom;
    const disguise = {
      mode: femaleTheaterAccessMode(),
      entries: state.femaleLife.brothelEntries,
      title: state.eventResult?.title,
    };
    state.eventResult = null;
    render();
    disguise.actionButtons = document.querySelectorAll("[data-female-theater-action]").length;
    disguise.patronButtons = document.querySelectorAll("[data-brothel-action], [data-redeem-courtesan]").length;

    state.stats.favorability = 80;
    state.stats.relationship = 80;
    exposeFemaleTheater("专项测试中身份被识破");
    const exposed = {
      count: state.femaleLife.exposures,
      favorability: state.stats.favorability,
      relationship: state.stats.relationship,
      tag: state.tags.includes("风月轻薄之名"),
    };
    state.eventResult = null;
    state.matchPool = [];
    const scandalPool = refreshMatchPool(true);
    exposed.matchTiers = scandalPool.map((item) => item.familyId);

    state.career = { name: "歌姬", customKind: "female" };
    state.femaleLife.disguiseActiveYear = -1;
    view.page = "place";
    view.placeId = "theater";
    render();
    const professional = {
      mode: femaleTheaterAccessMode(),
      workButtons: document.querySelectorAll("[data-female-theater-action]").length,
      patronButtons: document.querySelectorAll("[data-brothel-action], [data-redeem-courtesan]").length,
      legalText: document.querySelector(".female-access-panel.legal")?.textContent || "",
    };

    state.career = null;
    state.currentEvent = null;
    state.eventResult = null;
    state.femaleSkills = {};
    studyFemaleSkill(0);
    const school = {
      kind: state.currentEvent?.kind,
      choices: state.currentEvent?.children?.length,
      title: state.currentEvent?.title,
    };
    chooseOption(0);
    school.level = state.femaleSkills["女红"];
    school.stories = state.femaleLife.schoolStories;
    school.result = state.eventResult?.title;

    state.eventResult = null;
    state.exam.lastYear = -1;
    startExtraExam("female");
    const assessment = {
      type: state.exam.current?.extraType,
      attempts: state.exam.attempts,
    };
    state.exam.current = null;
    const femaleGoalIds = availableLifeGoals().map((goal) => goal.id);

    state.gender = "male";
    state.career = null;
    state.currentEvent = null;
    state.eventResult = null;
    view.page = "main";
    view.placeId = "";
    render();
    return { normalized, forbidden, exam, disguise, exposed, professional, school, assessment, femaleGoalIds };
  });
  assert.deepEqual(femaleRules.normalized, { brothelEntries: 0, disguises: 0, exposures: 0, professionalShows: 0, disguiseActiveYear: -1, schoolStories: 0, schoolLastYear: -1 }, "旧女性存档没有补全女性线状态");
  assert.equal(femaleRules.exam.open, false, "女性仍可参加正式科举");
  assert.equal(femaleRules.exam.prepare, false, "女性仍可累积科举备考进度");
  assert.equal(femaleRules.exam.underworldOpened, false, "女性仍能进入贡院作弊暗门");
  assert.match(femaleRules.exam.title, /女子不得应科举/, "女性书院页没有明确说明科举限制");
  assert.equal(femaleRules.forbidden.mode, "forbidden", "普通女性没有被瓦舍门禁拦下");
  assert.equal(femaleRules.forbidden.disguiseButtons, 1, "普通女性缺少女扮男装入口");
  assert.equal(femaleRules.forbidden.patronButtons, 0, "普通女性仍能看到美人消遣交互");
  assert.match(femaleRules.forbidden.warning, /婚嫁|名望/, "瓦舍门禁没有说明名誉与婚嫁后果");
  assert.equal(femaleRules.disguise.mode, "disguised", "女扮男装成功后没有获得当年潜入身份");
  assert.equal(femaleRules.disguise.entries, 1, "女扮男装成功没有记入进入次数");
  assert.equal(femaleRules.disguise.actionButtons, 2, "男装潜入后没有提供听曲与探看互动");
  assert.equal(femaleRules.disguise.patronButtons, 0, "男装女性错误获得了男性寻欢交互");
  assert.equal(femaleRules.exposed.tag, true, "男装败露没有留下名誉标签");
  assert.ok(femaleRules.exposed.favorability <= 64 && femaleRules.exposed.relationship <= 74, "男装败露对名望与人际惩罚过轻");
  assert.equal(femaleRules.exposed.matchTiers.every((tier) => ["humble", "small"].includes(tier)), true, "瓦舍丑闻没有压低女性相看门第");
  assert.equal(femaleRules.professional.mode, "professional", "歌姬没有取得合法工作通行身份");
  assert.equal(femaleRules.professional.workButtons, 2, "从业女性缺少登台与排演互动");
  assert.equal(femaleRules.professional.patronButtons, 0, "从业女性仍能以客人身份寻欢");
  assert.match(femaleRules.professional.legalText, /演毕|离开|不能/, "从业通行没有明确演出后离场规则");
  assert.equal(femaleRules.school.kind, "femaleSchool", "修习女学没有触发专属剧情");
  assert.equal(femaleRules.school.choices, 3, "女学剧情没有提供三个处理选择");
  assert.equal(femaleRules.school.level, 1, "完成女学剧情没有提升对应技艺");
  assert.equal(femaleRules.school.stories, 1, "女学剧情没有写入女性线记录");
  assert.equal(femaleRules.assessment.type, "female", "女医考校没有从女学入口启动");
  assert.equal(femaleRules.assessment.attempts, 0, "女医技艺考校被错误记作正式科举次数");
  assert.equal(femaleRules.femaleGoalIds.includes("first-exam"), false, "女性成就目标仍在要求参加童试");
  assert.equal(femaleRules.femaleGoalIds.includes("women-school-six"), true, "女性成就目标没有接入女学六艺");
  await clearBlockingUi();

  console.log("quality gate: verifying expanded daily stories");
  const expandedDaily = await page.evaluate(() => {
    state.age = 36;
    state.year = 36;
    state.currentEvent = null;
    state.eventResult = null;
    const pool = expandedDailyEvents().filter((event) => state.age >= event.minAge && state.age <= event.maxAge);
    state.currentEvent = pool[0];
    chooseOption(0);
    return {
      total: expandedDailyEvents().length,
      valid: expandedDailyEvents().every((event) => event.children.length === 2 && event.children.every((choice) => choice.content && choice.effects)),
      result: state.eventResult,
      logged: state.log.some((item) => item.title?.startsWith("日常 ·")),
    };
  });
  assert.ok(expandedDaily.total >= 18, "新增日常剧情数量不足");
  assert.equal(expandedDaily.valid, true, "新增日常剧情存在缺失选项或结果");
  assert.ok(expandedDaily.result?.scene, "日常剧情结果没有匹配过场动画");
  assert.equal(expandedDaily.logged, true, "新增日常剧情没有写入命册");
  await clearBlockingUi();

  console.log("quality gate: verifying descendant marriage, inheritance, remarriage, fortune and redemption");
  const familyExpansion = await page.evaluate(() => {
    state.gender = "male";
    state.age = 58;
    state.year = 58;
    state.stats.money = 10000;
    state.currentEvent = null;
    state.eventResult = null;
    const child = makeChild(state.name.slice(0, 1), 20);
    state.family.children = [child];
    marryChild(child.id);
    const grandchild = makeGrandchild(child, 4);
    child.grandchildren.push(grandchild);
    return {
      spouseRelation: child.spouse?.relation,
      marriageYear: child.marriageYear,
      grandchildRelation: grandchild.relation,
      heirs: eligibleHeirs().map((item) => ({ id: item.id, kind: item.heirKind })),
      relationHtml: relationsView(),
    };
  });
  assert.ok(["女婿", "儿媳"].includes(familyExpansion.spouseRelation), "成年子女成婚后没有生成女婿或儿媳");
  assert.equal(familyExpansion.marriageYear, 58, "子女婚年没有写入存档");
  assert.ok(["孙子", "孙女"].includes(familyExpansion.grandchildRelation), "子女婚后没有生成正确孙辈关系");
  assert.equal(familyExpansion.heirs.some((item) => item.kind === "child"), true, "子女没有进入遗产继承候选");
  assert.equal(familyExpansion.heirs.some((item) => item.kind === "grandchild"), true, "孙辈没有进入遗产继承候选");
  assert.match(familyExpansion.relationHtml, /女婿与儿媳/, "亲友页没有显示姻亲分区");
  assert.match(familyExpansion.relationHtml, /孙辈/, "亲友页没有显示孙辈分区");

  const grandInheritance = await page.evaluate(() => {
    const previous = JSON.parse(JSON.stringify(state));
    const grandchild = livingGrandchildren()[0];
    const oldGeneration = state.lineage.generation;
    state.dead = true;
    state.deathReason = "测试寿终";
    inheritFromChild(grandchild.id);
    const result = { name: state.name, generation: state.lineage.generation, expectedName: grandchild.name, expectedGeneration: oldGeneration + 2, father: state.family.father.name, mother: state.family.mother.name };
    state = normalizeState(previous);
    save();
    render();
    return result;
  });
  assert.equal(grandInheritance.name, grandInheritance.expectedName, "选择孙辈后没有切换到孙辈存档");
  assert.equal(grandInheritance.generation, grandInheritance.expectedGeneration, "隔代继承没有正确推进两代");
  assert.ok(grandInheritance.father && grandInheritance.mother, "孙辈继承后父母关系缺失");

  const spouseInheritance = await page.evaluate(() => {
    const previous = JSON.parse(JSON.stringify(state));
    state.gender = "male";
    state.family.spouse = "沈清照";
    state.family.spouseMeta = normalizePartner({ name: "沈清照", relation: "妻子", gender: "female", age: 48, physique: 72, affection: 88, study: 64, virtue: 70 }, state.name.slice(0, 1), "妻子", "spouse");
    const wifeHeir = eligibleHeirs().find((item) => item.heirKind === "spouse");
    const generation = state.lineage.generation;
    const childNames = livingChildren().map((item) => item.name);
    state.dead = true;
    state.deathReason = "测试寿终";
    inheritFromChild(wifeHeir.id);
    const result = { name: state.name, gender: state.gender, generation: state.lineage.generation, expectedGeneration: generation, children: livingChildren().map((item) => item.name), tags: state.tags, former: state.family.spouseHistory.map((item) => item.name), expectedChildren: childNames };
    state = normalizeState(previous);
    save();
    render();
    return result;
  });
  assert.equal(spouseInheritance.name, "沈清照", "选择妻子后没有切换为妻子的新人生");
  assert.equal(spouseInheritance.gender, "female", "妻子继承后的角色性别错误");
  assert.equal(spouseInheritance.generation, spouseInheritance.expectedGeneration, "妻子继承不应推进家族世代");
  assert.deepEqual(spouseInheritance.children, spouseInheritance.expectedChildren, "妻子继承后原有子女丢失");
  assert.ok(spouseInheritance.tags.includes("未亡人承业"), "妻子继承没有写入专属身份");
  assert.ok(spouseInheritance.former.length > 0, "妻子继承后亡夫没有进入故配记录");

  const remarriage = await page.evaluate(() => {
    state.eventResult = null;
    state.family.spouse = "故人甲";
    state.family.spouseMeta = normalizePartner({ name: "故人甲", relation: "妻子", gender: "female", age: 55, physique: 0, alive: false }, state.name.slice(0, 1), "妻子", "spouse");
    archiveDeceasedSpouse([]);
    const archived = state.family.spouseHistory.some((item) => item.name === "故人甲");
    state.family.lover = "新人乙";
    state.family.loverMeta = normalizeRelative({ name: "新人乙", relation: "相看之人", gender: "female", age: 36, affection: 72 }, state.name.slice(0, 1), "partner");
    marryLover();
    return { archived, spouse: state.family.spouse, history: state.family.spouseHistory.map((item) => item.name) };
  });
  assert.equal(remarriage.archived, true, "亡配没有转入故配记录");
  assert.equal(remarriage.spouse, "新人乙", "丧偶后无法再婚");
  assert.ok(remarriage.history.includes("故人甲"), "再婚后故配记录丢失");
  await clearBlockingUi();

  const fortune = await page.evaluate(() => {
    state.year = 60;
    state.templeFortune = { active: { id: "noble", drawnYear: 59, dueYear: 60 }, history: [], lastDrawYear: 59 };
    const event = annualFortuneEvent();
    state.currentEvent = event;
    chooseOption(0);
    return { kind: event?.kind, active: state.templeFortune.active, history: state.templeFortune.history, result: state.eventResult?.text };
  });
  assert.equal(fortune.kind, "fortuneEvent", "求签没有在下一流年触发专属剧情");
  assert.equal(fortune.active, null, "签运应验后仍处于待触发状态");
  assert.equal(fortune.history.length, 1, "签运应验没有写入历史");
  assert.match(fortune.result, /至此应验/, "签运结果没有明确关联此前所求之签");
  await clearBlockingUi();

  const redemption = await page.evaluate(() => {
    state.gender = "male";
    state.age = 30;
    state.year = 61;
    state.stats.money = 10000;
    state.eventResult = null;
    state.family.concubines = [];
    state.courtesanVisit = createCourtesanVisit();
    const candidate = state.courtesanVisit.candidates[0];
    candidate.affection = COURTESAN_REDEEM_AFFECTION;
    candidate.visits = COURTESAN_REDEEM_VISITS;
    const money = state.stats.money;
    redeemCourtesan(candidate.id);
    return {
      removed: !state.courtesanVisit.candidates.some((item) => item.id === candidate.id),
      housed: state.family.concubines.some((item) => item.name === candidate.name && item.redeemed),
      spent: state.stats.money < money,
    };
  });
  assert.equal(redemption.removed, true, "赎身后美人仍留在青楼候选中");
  assert.equal(redemption.housed, true, "赎身美人没有安置进家庭关系");
  assert.equal(redemption.spent, true, "赎身没有扣除赎资");
  await clearBlockingUi();

  console.log("quality gate: verifying interactive travel system");
  const oldTravelSave = await page.evaluate(() => {
    const saved = JSON.parse(JSON.stringify(state));
    delete saved.travelSystem;
    delete saved.pendingTravel;
    const restored = normalizeState(saved);
    return { level: restored.travelSystem.carriageLevel, condition: restored.travelSystem.condition, pending: restored.pendingTravel, destinations: Object.keys(restored.travelSystem.memories).length };
  });
  assert.deepEqual(oldTravelSave, { level: 1, condition: 100, pending: null, destinations: 8 }, "旧存档没有正确补全车马旅行状态");

  const travelSetup = await page.evaluate(async () => {
    state.age = 30;
    state.year = 62;
    state.stats.money = 10000;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingCaravan = null;
    state.pendingTravel = null;
    state.travelSystem = createTravelSystem();
    state.family.spouse = "沈清照";
    state.family.spouseMeta = normalizePartner({ name: "沈清照", relation: "妻子", gender: "female", age: 29, physique: 76, affection: 82 }, state.name.slice(0, 1), "妻子", "spouse");
    view.page = "travel";
    render();
    travelTo(2);
    selectTravelCompanion("spouse");
    selectTravelSupply("luxury");
    const mapping = Object.fromEntries(TRAVEL_DESTINATIONS.map((item) => [item.id, [regionSceneArt(item.id).hero.split("/").pop(), regionSceneArt(item.id).thumb.split("/").pop()]]));
    const assetResponses = await Promise.all(Object.values(REGION_SCENE_ART).flatMap((item) => [item.hero, item.thumb]).map(async (src) => {
      const response = await fetch(src);
      return { src, status: response.status, type: response.headers.get("content-type") };
    }));
    const landscapeCards = document.querySelectorAll(".destination-scene > img").length;
    const selectedLandscape = document.querySelector(".selected-route-scene img")?.getAttribute("src");
    const money = state.stats.money;
    startTravelJourney();
    return {
      destination: state.pendingTravel?.destinationId,
      companion: state.pendingTravel?.companionName,
      supply: state.pendingTravel?.supplyId,
      eventCount: state.pendingTravel?.events.length,
      spent: state.stats.money < money,
      destinationCards: document.querySelectorAll("[data-travel]").length,
      landscapeCards,
      selectedLandscape,
      mapping,
      assetResponses,
    };
  });
  assert.equal(travelSetup.destination, "luocheng", "选择目的地后没有按路线启程");
  assert.equal(travelSetup.companion, "沈清照", "旅伴选择没有写入旅程");
  assert.equal(travelSetup.supply, "luxury", "行囊选择没有写入旅程");
  assert.ok(travelSetup.eventCount >= 2, "远行没有生成多阶段途中事件");
  assert.equal(travelSetup.spent, true, "旅行没有扣除路资");
  assert.equal(travelSetup.destinationCards, 0, "启程后仍停留在旅行准备页");
  assert.equal(travelSetup.landscapeCards, 8, "车马路线没有显示八地风景缩略图");
  assert.equal(travelSetup.selectedLandscape, "assets/region-luocheng.webp", "洛城路线没有使用对应高清风景图");
  assert.deepEqual(travelSetup.mapping, {
    qingping: ["region-qingping.webp", "region-qingping-thumb.webp"],
    yunzhou: ["region-yunzhou.webp", "region-yunzhou-thumb.webp"],
    luocheng: ["region-luocheng.webp", "region-luocheng-thumb.webp"],
    jiangling: ["region-jiangling.webp", "region-jiangling-thumb.webp"],
    liangdu: ["region-liangdu.webp", "region-liangdu-thumb.webp"],
    kunbei: ["region-kunbei.webp", "region-kunbei-thumb.webp"],
    sudi: ["region-sudi.webp", "region-sudi-thumb.webp"],
    qingya: ["region-qingya.webp", "region-qingya-thumb.webp"],
  }, "八地风景图片映射发生错位");
  assert.ok(travelSetup.assetResponses.every((item) => item.status === 200 && item.type === "image/webp"), "存在无法加载的八地 WebP 风景资源");

  const travelArrival = await page.evaluate(() => {
    while (state.pendingTravel && state.pendingTravel.index < state.pendingTravel.events.length) resolveTravelChoice(0);
    const html = travelRunView();
    return { index: state.pendingTravel?.index, total: state.pendingTravel?.events.length, hasActivities: /data-travel-local/.test(html), history: state.pendingTravel?.history.length, arrivalLandscape: document.querySelector(".travel-arrival-scene img")?.getAttribute("src") };
  });
  assert.equal(travelArrival.index, travelArrival.total, "途中事件完成后没有抵达目的地");
  assert.equal(travelArrival.hasActivities, true, "抵达后没有提供当地游历活动");
  assert.ok(travelArrival.history >= travelArrival.total + 1, "旅途札记没有记录途中选择");
  assert.equal(travelArrival.arrivalLandscape, "assets/region-luocheng.webp", "洛城抵达过场没有使用对应风景图");

  const travelComplete = await page.evaluate(() => {
    completeTravelActivity("landmark");
    const memory = state.travelSystem.memories.luocheng;
    return { pending: state.pendingTravel, location: state.location, trips: memory.trips, stamp: state.travelSystem.stamps.includes("luocheng"), result: state.eventResult?.title, scene: state.eventResult?.scene };
  });
  assert.equal(travelComplete.pending, null, "目的地游历完成后仍卡在旅途中");
  assert.equal(travelComplete.location, "洛城", "完成旅程后没有改变居处");
  assert.equal(travelComplete.trips, 1, "路线熟练度没有累计");
  assert.equal(travelComplete.stamp, true, "游历印记没有收集");
  assert.match(travelComplete.result, /洛城/, "旅行结果没有写入目的地");
  assert.equal(travelComplete.scene, "travel", "旅行结果没有使用旅途过场动画");
  await clearBlockingUi();

  const travelMobileOverflow = await page.evaluate(() => {
    view.page = "travel";
    render();
    return { viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, cards: document.querySelectorAll(".travel-destination").length, landscapes: document.querySelectorAll(".destination-scene > img").length, supplies: document.querySelectorAll("[data-travel-supply]").length };
  });
  assert.equal(travelMobileOverflow.document, travelMobileOverflow.viewport, "新版车马页面在移动端横向溢出");
  assert.equal(travelMobileOverflow.cards, 8, "车马页面没有显示全部旅行目的地");
  assert.equal(travelMobileOverflow.landscapes, 8, "移动端车马页面缺少八地风景图");
  assert.equal(travelMobileOverflow.supplies, 3, "车马页面缺少行囊选择");

  console.log("quality gate: verifying exam underworld, mysteries and jianghu systems");
  const darkSaveCompatibility = await page.evaluate(() => {
    const saved = JSON.parse(JSON.stringify(state));
    delete saved.underworld;
    delete saved.mystery;
    delete saved.jianghu;
    delete saved.secretLines;
    const restored = normalizeState(saved);
    return {
      heat: restored.underworld.heat,
      attempts: restored.underworld.records.attempts,
      mystery: restored.mystery.active,
      skills: restored.jianghu.skills.length,
      prophecies: restored.jianghu.records.prophecies,
      secretIntro: restored.secretLines.introduced,
      secretLegacy: restored.secretLines.legacyEligible,
    };
  });
  assert.deepEqual(darkSaveCompatibility, { heat: 0, attempts: 0, mystery: null, skills: 0, prophecies: 0, secretIntro: false, secretLegacy: true }, "旧存档没有补全黑灰、奇案或奇闻入口状态");

  const visibleSecretHub = await page.evaluate(() => {
    state.age = 24;
    state.year = 69;
    state.eventResult = null;
    state.currentEvent = null;
    state.career = null;
    state.exam.rank = -1;
    state.exam.lastYear = -1;
    state.secretLines = createSecretLinesState();
    view.page = "main";
    render();
    const overview = {
      shortcut: document.querySelectorAll('[data-shortcut="secrets"]').length,
      door: document.querySelectorAll('[data-door="secrets"]').length,
      pulse: document.querySelectorAll(".secret-pulse").length,
    };
    openSecretHub();
    return {
      ...overview,
      cards: document.querySelectorAll(".secret-line-card").length,
      archive: document.querySelectorAll(".case-archive-strip span").length,
      examButton: Boolean(document.querySelector('[data-action="open-secret-exam"]')),
      mysteryButton: Boolean(document.querySelector('[data-action="start-secret-mystery"]')),
      jianghuButton: Boolean(document.querySelector('[data-action="open-secret-jianghu"]')),
      seen: state.secretLines.seenHub,
      mobileFits: document.documentElement.scrollWidth === document.documentElement.clientWidth,
    };
  });
  assert.deepEqual(visibleSecretHub, { shortcut: 1, door: 1, pulse: 1, cards: 3, archive: 6, examButton: true, mysteryButton: true, jianghuButton: true, seen: true, mobileFits: true }, "三套玩法没有在主界面和奇闻总览中形成明显入口");

  const examinerSecretEntry = await page.evaluate(() => {
    state.career = { name: "翰林院编修", customKind: "official", careerType: 5 };
    state.official.rank = 8;
    state.exam.rank = EXAM_STAGES.length - 1;
    view.page = "secrets";
    render();
    const button = document.querySelector('[data-action="start-secret-bribe"]');
    return { visible: Boolean(button), enabled: Boolean(button && !button.disabled), label: button?.textContent || "" };
  });
  assert.equal(examinerSecretEntry.visible, true, "高阶官员在奇闻总览中看不到反向卖题入口");
  assert.equal(examinerSecretEntry.enabled, true, "高阶官员的买题密函入口不可交互");
  assert.match(examinerSecretEntry.label, /买题密函/, "高阶官员入口文案不明确");

  const secretIntroduction = await page.evaluate(() => {
    state.age = 15;
    state.year = 15;
    state.secretLines = createSecretLinesState();
    state.currentEvent = annualSecretIntroductionEvent();
    const kind = state.currentEvent?.kind;
    chooseOption(0);
    return { kind, introduced: state.secretLines.introduced, route: view.page, result: state.eventResult?.title };
  });
  assert.deepEqual(secretIntroduction, { kind: "secretIntroduction", introduced: true, route: "secrets", result: "循帖探查" }, "十五岁没有触发黑帖引导并导向奇闻总览");
  await clearBlockingUi();

  const examUnderworld = await page.evaluate(() => {
    state.age = 24;
    state.year = 70;
    state.prisonYears = 0;
    state.stats.money = 10000;
    state.stats.eq = 100;
    state.exam.current = null;
    state.exam.lastYear = -1;
    state.underworld = createUnderworldState();
    state.underworld.broker = { name: "铁算盘", trust: 60, lastYear: state.year };
    const oldRandom = Math.random;
    Math.random = () => 0.99;
    state.underworld.activeCheat = { id: "buyExam", genuine: true, boughtYear: state.year };
    const genuine = examCheatResolution(EXAM_STAGES[0], { type: "choice", questions: [{}, {}, {}, {}, {}] }, 0, false);
    state.underworld.activeCheat = { id: "buyExam", genuine: false, boughtYear: state.year };
    const fake = examCheatResolution(EXAM_STAGES[0], { type: "choice", questions: [{}, {}, {}, {}, {}] }, 5, true);
    Math.random = oldRandom;
    state.underworld.activeCheat = null;
    view.page = "examUnderworld";
    render();
    return {
      genuinePassed: genuine.passed,
      fakePassed: fake.passed,
      fakeText: fake.prefix,
      methodButtons: document.querySelectorAll("[data-exam-cheat]").length,
      hasBack: Boolean(document.querySelector('[data-action="back-exam"]')),
    };
  });
  assert.equal(examUnderworld.genuinePassed, true, "真题买卖没有显著提高科举结果");
  assert.equal(examUnderworld.fakePassed, false, "假题骗局没有导致落榜");
  assert.match(examUnderworld.fakeText, /伪造|嘲笑/, "假题中介没有专属反馈");
  assert.equal(examUnderworld.methodButtons, 5, "贡院暗门缺少五种舞弊手段");
  assert.equal(examUnderworld.hasBack, true, "贡院暗门缺少返回明场交互");

  const mysteryResolution = await page.evaluate(() => {
    state.eventResult = null;
    state.currentEvent = null;
    state.career = { name: "县衙户房", customKind: "official", careerType: 5 };
    state.mystery = { active: { caseId: "locked-room", round: 0, clues: [], actionsUsed: [], role: "official" }, completed: [] };
    const beforeMerit = state.official.merit;
    investigateMystery("autopsy");
    investigateMystery("witness");
    investigateMystery("scene");
    const clueCount = state.mystery.active.clues.length;
    const html = mysteryCaseView();
    accuseMystery("steward");
    return {
      clueCount,
      canAccuse: /data-mystery-accuse/.test(html),
      correct: state.mystery.completed[0]?.correct,
      meritGain: state.official.merit > beforeMerit,
      cleared: state.mystery.active === null,
    };
  });
  assert.equal(mysteryResolution.clueCount, 3, "离奇案件未按轮次积累线索");
  assert.equal(mysteryResolution.canAccuse, true, "取得三条线索后仍无法指认嫌犯");
  assert.equal(mysteryResolution.correct, true, "密室案正确嫌犯没有结案");
  assert.equal(mysteryResolution.meritGain, true, "正确破案没有增加政绩");
  assert.equal(mysteryResolution.cleared, true, "结案后仍残留进行中案件");
  await clearBlockingUi();

  const civilianMystery = await page.evaluate(() => {
    state.career = null;
    state.eventResult = null;
    state.currentEvent = null;
    state.stats.money = 100;
    state.mystery = { active: { caseId: "ghost-bride", round: 3, clues: [{ action: "autopsy", label: "验尸", text: "" }, { action: "witness", label: "问证人", text: "" }, { action: "scene", label: "搜查现场", text: "" }], actionsUsed: ["autopsy", "witness", "scene"], role: "civilian" }, completed: [] };
    const money = state.stats.money;
    accuseMystery("doctor");
    return { rewarded: state.stats.money > money, correct: state.mystery.completed[0]?.correct, text: state.eventResult?.text };
  });
  assert.equal(civilianMystery.rewarded, true, "平民协破奇案没有获得赏银");
  assert.equal(civilianMystery.correct, true, "平民身份无法正确结案");
  assert.match(civilianMystery.text, /赏银|断案名声/, "平民查案没有专属结果反馈");
  await clearBlockingUi();

  const examinerBribe = await page.evaluate(() => {
    state.stats.money = 1000;
    state.currentEvent = null;
    state.eventResult = null;
    state.underworld.extortion = null;
    const soldBefore = state.underworld.records.soldQuestions;
    const moneyBefore = state.stats.money;
    const oldRandom = Math.random;
    Math.random = () => 0.99;
    startExaminerBribe();
    chooseOption(0);
    Math.random = oldRandom;
    return { sold: state.underworld.records.soldQuestions > soldBefore, money: state.stats.money > moneyBefore, heat: state.underworld.heat };
  });
  assert.equal(examinerBribe.sold, true, "官员卖题没有写入暗账");
  assert.equal(examinerBribe.money, true, "官员卖题没有取得银钱");
  assert.ok(examinerBribe.heat > 0, "官员卖题没有增加风声");
  await clearBlockingUi();

  const jianghuMeta = await page.evaluate(() => {
    state.year = 80;
    state.eventResult = null;
    state.currentEvent = null;
    state.jianghu = createJianghuState();
    state.jianghu.mentor = { name: "赛半仙", affection: 70 };
    state.jianghu.skills = ["fortune", "qian"];
    const oldRandom = Math.random;
    Math.random = () => 0.2;
    useJianghuSkill("fortune");
    const dueYear = state.jianghu.prophecy?.dueYear;
    const prophecyType = state.jianghu.prophecy?.type;
    state.eventResult = null;
    state.year = dueYear;
    const event = annualJianghuEvent();
    state.currentEvent = event;
    chooseOption(0);
    Math.random = oldRandom;
    return { dueYear, prophecyType, eventKind: event?.kind, cleared: state.jianghu.prophecy === null, trueCount: state.jianghu.records.trueProphecies };
  });
  assert.equal(jianghuMeta.dueYear, 83, "算命预言没有安排在三年后");
  assert.ok(["blood", "wealth", "noble"].includes(jianghuMeta.prophecyType), "算命没有生成有效预言类型");
  assert.equal(jianghuMeta.eventKind, "jianghuProphecy", "三年后没有触发预言事件");
  assert.equal(jianghuMeta.cleared, true, "预言应验后没有结清");
  assert.equal(jianghuMeta.trueCount, 1, "真实预言没有写入江湖旧账");
  await clearBlockingUi();

  const qianGamble = await page.evaluate(() => {
    state.age = 30;
    state.prisonYears = 0;
    state.stats.money = 1000;
    state.underworld.heat = 0;
    state.jianghu.heat = 0;
    state.jianghu.skills = ["qian"];
    state.jianghu.enabledQian = true;
    state.gamble = createGambleRound(50);
    state.gamble.playerDice = [6, 6, 6, 6, 6];
    state.gamble.opponentDice = [6, 6, 6, 6, 6];
    state.gamble.currentBid = { count: 1, face: 6 };
    state.gamble.turn = "player";
    const oldRandom = Math.random;
    Math.random = () => 0.5;
    revealGamble("player");
    Math.random = oldRandom;
    return { win: state.gamble.result.playerWin, text: state.gamble.result.text, consumed: !state.jianghu.enabledQian, heat: state.jianghu.heat };
  });
  assert.equal(qianGamble.win, true, "千术没有把博坊败局翻成胜局");
  assert.match(qianGamble.text, /暗记|胜局/, "千术翻盘缺少专属叙事");
  assert.equal(qianGamble.consumed, true, "一次千术没有在开盅后消耗");
  assert.ok(qianGamble.heat > 0, "赌场出千没有增加江湖风声");

  const underageGuard = await page.evaluate(() => {
    state.age = 17;
    state.year = 17;
    state.courtesanVisit = null;
    view.page = "place";
    startCourtesanParlor(true);
    return { page: view.page, visit: state.courtesanVisit };
  });
  assert.equal(underageGuard.page, "place", "未成年角色仍能进入美人雅座");
  assert.equal(underageGuard.visit, null, "未成年角色生成了青楼人物状态");

  console.log("quality gate: verifying latest system persistence and interrupted-flow recovery");
  const newSystemNormalization = await page.evaluate(() => {
    const source = JSON.parse(JSON.stringify(state));
    for (const key of ["poetry", "poetryRound", "travelCodex", "leisureSeason", "secrets", "matchPool", "prison", "culturalCalendar", "dynasty", "pendingAnnualEvent"]) delete source[key];
    delete source.family.father.memories;
    delete source.family.father.ambition;
    source.family.spouse = "顾清和";
    source.family.spouseMeta = { name: "顾清和", relation: "妻子", gender: "female", age: 24, physique: 80, affection: 82, alive: true };
    source.family.spouseProfile = { id: "persist-spouse", name: "顾清和", gender: "female", familyId: "scholar", personalityId: "gentle", bridePrice: 260, fertility: 72, power: 58, looks: 76, knowledge: 88 };
    const normalized = normalizeState(source);
    return {
      poetryWins: normalized.poetry?.wins,
      poetryRound: normalized.poetryRound,
      travelCount: normalized.travelCodex?.unlocked?.length,
      seasonKey: normalized.leisureSeason?.seasonKey,
      secrets: normalized.secrets?.length,
      matchPool: normalized.matchPool?.length,
      spouseFamily: normalized.family.spouseProfile?.familyId,
      prisonRecords: normalized.prison?.records?.length,
      cultureSeen: normalized.culturalCalendar?.seen?.length,
      pendingAnnualEvent: normalized.pendingAnnualEvent,
      dynastyEra: normalized.dynasty?.eraName,
      dynastyMetrics: [normalized.dynasty?.prosperity, normalized.dynasty?.local?.grainPrice, normalized.dynasty?.factions?.reformers],
      fatherMemories: normalized.family.father?.memories?.length,
      fatherAmbition: normalized.family.father?.ambition,
    };
  });
  assert.equal(newSystemNormalization.poetryWins, 0, "旧存档没有补全诗会状态");
  assert.equal(newSystemNormalization.poetryRound, null, "旧存档错误生成了诗会进行局");
  assert.equal(newSystemNormalization.travelCount, 0, "旧存档没有补全旅行图鉴");
  assert.ok(Number.isFinite(newSystemNormalization.seasonKey), "旧存档没有补全赛季状态");
  assert.equal(newSystemNormalization.secrets, 0, "旧存档没有补全秘密身份状态");
  assert.equal(newSystemNormalization.matchPool, 0, "旧存档没有补全媒人候选池");
  assert.equal(newSystemNormalization.spouseFamily, "scholar", "读档后丢失了配偶家世资料");
  assert.equal(newSystemNormalization.prisonRecords, 0, "旧存档没有补全牢狱生涯状态");
  assert.equal(newSystemNormalization.cultureSeen, 0, "旧存档没有补全华夏岁时图鉴");
  assert.equal(newSystemNormalization.pendingAnnualEvent, null, "旧存档错误生成了年度候补事件");
  assert.ok(newSystemNormalization.dynastyEra, "旧存档没有补全王朝年号");
  assert.ok(newSystemNormalization.dynastyMetrics.every(Number.isFinite), "旧存档没有补全天下与朝局数值");
  assert.equal(newSystemNormalization.fatherMemories, 0, "旧存档没有补全亲友记忆数组");
  assert.ok(newSystemNormalization.fatherAmbition, "旧存档没有补全亲友自主志向");

  const poetryFlow = await page.evaluate(() => {
    state.age = 20;
    state.year = 120;
    state.dead = false;
    state.prisonYears = 0;
    state.stats.money = 500;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingTravel = null;
    state.pendingCaravan = null;
    state.poetry = createPoetryState();
    state.poetryRound = null;
    openPoetryContest();
    const opened = Boolean(state.poetryRound);
    view.page = "main";
    const forcedBack = /data-poetry-option/.test(centerContent());
    const blocked = yearAdvanceBlockReason();
    cancelPoetryContest();
    return { opened, forcedBack, blocked, cleared: state.poetryRound === null, page: view.page };
  });
  assert.equal(poetryFlow.opened, true, "诗会未能建立文斗局面");
  assert.equal(poetryFlow.forcedBack, true, "诗会进行中仍可从顶部导航逃离并遗留幽灵局面");
  assert.match(poetryFlow.blocked, /诗会文斗/, "诗会未完成时仍可直接推进流年");
  assert.deepEqual({ cleared: poetryFlow.cleared, page: poetryFlow.page }, { cleared: true, page: "place" }, "弃局没有清理诗会状态并返回活动页");

  const matchmakingEconomy = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    const candidate = normalizeMatchCandidate({ id: "budget-match", name: "沈知意", gender: "female", familyId: "scholar", personalityId: "gentle", bridePrice: 200, fertility: 74, power: 62, looks: 80, knowledge: 84 });
    state.family.spouse = null;
    state.family.spouseMeta = null;
    state.family.spouseProfile = null;
    state.family.lover = candidate.name;
    state.family.loverMeta = normalizeRelative({ name: candidate.name, gender: "female", relation: "相看之人", age: 22, affection: 78, alive: true }, state.name.slice(0, 1), "partner");
    state.family.loverProfile = candidate;
    state.stats.money = 150;
    state.eventResult = null;
    const oldRandom = Math.random;
    Math.random = () => 0.5;
    marryLover();
    const refused = !state.family.spouse && state.stats.money === 150 && state.eventResult?.title === "婚仪未成";
    state.eventResult = null;
    state.stats.money = 500;
    marryLover();
    const married = state.family.spouse === candidate.name;
    const persistedFamily = normalizeState(JSON.parse(JSON.stringify(state))).family.spouseProfile?.familyId;
    Math.random = oldRandom;
    state = normalizeState(JSON.parse(snapshot));
    save();
    render();
    return { refused, married, persistedFamily };
  });
  assert.equal(matchmakingEconomy.refused, true, "彩礼不足时仍能以部分付款完成婚仪");
  assert.equal(matchmakingEconomy.married, true, "彩礼充足时无法完成婚仪");
  assert.equal(matchmakingEconomy.persistedFamily, "scholar", "成婚后配偶家世无法跨存档保留");

  const femaleMatchPortraits = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    state.gender = "male";
    state.age = 24;
    state.dead = false;
    state.prisonYears = 0;
    state.family.spouse = null;
    state.family.spouseMeta = null;
    state.family.spouseProfile = null;
    state.family.lover = null;
    state.family.loverMeta = null;
    state.family.loverProfile = null;
    state.stats.money = 5000;
    state.matchPool = [];
    const pool = refreshMatchPool(true);
    view.page = "matchmaker";
    render();
    const initial = {
      count: pool.length,
      uniqueArchetypes: new Set(pool.map((item) => item.archetypeId)).size,
      allMapped: pool.every((item) => item.gender === "female" && item.portrait?.startsWith("assets/match-female-") && item.title),
      imageCount: document.querySelectorAll(".match-card .match-portrait img").length,
      inquiryButtons: document.querySelectorAll("[data-match-inquire]").length,
    };
    const first = pool[0];
    inquireMatchCandidate(first.id);
    const asked = normalizeMatchCandidate(state.matchPool.find((item) => item.id === first.id));
    const inquiry = {
      inquired: asked.inquired,
      scene: asked.courtshipText.length > 20,
      score: asked.compatibility,
      visible: /媒人合帖/.test(document.querySelector(".match-courtship")?.textContent || ""),
    };
    selectMatchCandidate(first.id);
    const selected = {
      portrait: state.family.loverMeta?.portrait,
      profilePortrait: state.family.loverProfile?.portrait,
      archetypeId: state.family.loverProfile?.archetypeId,
      relationImage: false,
    };
    state.eventResult = null;
    view.page = "relations";
    render();
    selected.relationImage = Boolean(document.querySelector('.person-avatar img[src^="assets/match-female-"]'));

    state = normalizeState(JSON.parse(snapshot));
    state.gender = "female";
    state.matchPool = [];
    const malePool = refreshMatchPool(true);
    const reverseLinePreserved = malePool.every((item) => item.gender === "male" && !item.portrait && !item.archetypeId);
    state = normalizeState(JSON.parse(snapshot));
    save();
    render();
    return { initial, inquiry, selected, reverseLinePreserved };
  });
  assert.deepEqual(femaleMatchPortraits.initial, { count: 3, uniqueArchetypes: 3, allMapped: true, imageCount: 3, inquiryButtons: 3 }, "女性婚配候选头像、身份或去重映射异常");
  assert.equal(femaleMatchPortraits.inquiry.inquired, true, "托媒问话没有写入候选状态");
  assert.equal(femaleMatchPortraits.inquiry.scene, true, "身份专属相看剧情过短或缺失");
  assert.ok(femaleMatchPortraits.inquiry.score >= 12 && femaleMatchPortraits.inquiry.score <= 98, "合帖契合度越界");
  assert.equal(femaleMatchPortraits.inquiry.visible, true, "托媒问话结果没有呈现在相亲卡片中");
  assert.equal(femaleMatchPortraits.selected.portrait, femaleMatchPortraits.selected.profilePortrait, "选定相看后头像未同步至亲友关系");
  assert.ok(femaleMatchPortraits.selected.archetypeId, "选定相看后身份资料丢失");
  assert.equal(femaleMatchPortraits.selected.relationImage, true, "亲友页没有显示相看对象头像");
  assert.equal(femaleMatchPortraits.reverseLinePreserved, true, "女性主角的男性婚配候选被错误套用女性头像");

  const gambleBlacklist = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    state.age = 30;
    state.leisureSeason = createLeisureSeasonState(state.age);
    const deltas = [];
    recordGambleSeasonResult(false, deltas);
    recordGambleSeasonResult(false, deltas);
    recordGambleSeasonResult(false, deltas);
    recordGambleSeasonResult(true, deltas);
    const resetAfterWin = state.leisureSeason.gambleLosses;
    for (let i = 0; i < 4; i += 1) recordGambleSeasonResult(false, deltas);
    state.gamble = createGambleRound(50);
    const closed = /今夜不接你的局/.test(gambleView());
    const blacklistedUntil = state.leisureSeason.blacklistedUntil;
    state = normalizeState(JSON.parse(snapshot));
    save();
    render();
    return { resetAfterWin, closed, blacklistedUntil };
  });
  assert.equal(gambleBlacklist.resetAfterWin, 0, "博坊胜局没有重置连续败局计数");
  assert.equal(gambleBlacklist.closed, true, "进入黑名单后博坊仍可继续下注");
  assert.ok(gambleBlacklist.blacklistedUntil >= 31, "博坊黑名单没有设置有效期限");

  const travelCodexVisible = await page.evaluate(() => {
    state.travelCodex = { unlocked: [TRAVEL_LANDMARKS[0].id] };
    view.page = "travel";
    render();
    return {
      heading: document.body.textContent.includes("旅中奇遇图鉴"),
      unlocked: document.body.textContent.includes(TRAVEL_LANDMARKS[0].name),
      cards: document.querySelectorAll(".travel-codex-item").length,
      expectedCards: TRAVEL_LANDMARKS.length,
    };
  });
  assert.equal(travelCodexVisible.heading, true, "旅行奇遇图鉴标题没有在车马页展示");
  assert.equal(travelCodexVisible.unlocked, true, "已解锁的旅行奇遇没有显示名称");
  assert.equal(travelCodexVisible.cards, travelCodexVisible.expectedCards, "旅行奇遇图鉴没有展示完整条目");

  await page.evaluate(() => {
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.onboarding = { version: 1, seen: true };
    state.pendingSurprise = { category: "亲友", title: "读档惊喜", text: "这份礼物不应在刷新后消失。", icon: "FamilyIcon" };
    view.page = "main";
    save();
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('[data-action="close-surprise"]', { timeout: 10000 });
  const restoredSurprise = await page.evaluate(() => ({ overlay: view.overlay, title: state.pendingSurprise?.title }));
  assert.deepEqual(restoredSurprise, { overlay: "surprise", title: "读档惊喜" }, "刷新后未恢复待处理的惊喜弹窗");
  await page.click('[data-action="close-surprise"]');

  console.log("quality gate: verifying dynasty simulation, NPC memory and multi-year world arcs");
  const worldSystems = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    const oldRandom = Math.random;
    Math.random = () => 0.1;
    state.age = 30;
    state.year = 200;
    state.dead = false;
    state.prisonYears = 0;
    state.stats.money = 8000;
    state.stats.physique = 100;
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    state.dynasty = createDynastyState();
    state.dynasty.rulerAge = 40;
    const reignBefore = state.dynasty.reignYear;
    const annualDeltas = [];
    advanceDynastyYear(annualDeltas);
    const annualWorld = { advanced: state.dynasty.reignYear === reignBefore + 1, history: state.dynasty.history.length, headline: state.dynasty.headline };

    view.page = "world";
    render();
    const worldUi = {
      metrics: document.querySelectorAll(".world-metric").length,
      factions: document.querySelectorAll(".faction-card").length,
      overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    };
    state.dynasty.activeArc = { id: "flood", stage: 1, score: 3, dueYear: 205, startedYear: 199, choices: ["relief"] };
    const carriedDynasty = carryDynastyAcrossInheritance(state.dynasty, 200, 20);
    const carryCheck = { era: carriedDynasty.eraName === state.dynasty.eraName, dueYear: carriedDynasty.activeArc?.dueYear, startedYear: carriedDynasty.activeArc?.startedYear };
    const route = CARAVAN_ROUTES[0];
    state.dynasty.borderThreat = 95;
    state.dynasty.local.security = 10;
    state.dynasty.local.grainPrice = 180;
    const highWorldRisk = caravanRouteRisk(route, 1);
    const highTravelCost = travelTripCost(TRAVEL_DESTINATIONS[0]);
    state.dynasty.borderThreat = 5;
    state.dynasty.local.security = 95;
    state.dynasty.local.grainPrice = 70;
    const lowWorldRisk = caravanRouteRisk(route, 1);
    const lowTravelCost = travelTripCost(TRAVEL_DESTINATIONS[0]);
    const systemImpact = { riskHigher: highWorldRisk > lowWorldRisk, travelCostHigher: highTravelCost > lowTravelCost };

    state.career = { name: "知县", customKind: "official", careerType: 5 };
    state.dynasty.completedArcs = [];
    state.dynasty.lastArcYear = -20;
    const arcChecks = [];
    for (const id of Object.keys(WORLD_ARCS)) {
      state.dynasty.activeArc = { id, stage: 0, score: 0, dueYear: state.year, startedYear: state.year, choices: [] };
      let stages = 0;
      let sawCareerFit = false;
      while (state.dynasty.activeArc && stages < 5) {
        const event = annualWorldArcEvent();
        if (!event) break;
        sawCareerFit ||= event.children.some((choice) => /可发挥专长/.test(choice.note || ""));
        const choice = event.children.find((item) => !item.disabled);
        state.currentEvent = event;
        resolveWorldArcEvent(event, choice);
        state.eventResult = null;
        state.pendingAchievement = null;
        stages += 1;
        if (state.dynasty.activeArc) state.year = state.dynasty.activeArc.dueYear;
      }
      arcChecks.push({ id, stages, sawCareerFit, completed: state.dynasty.completedArcs.includes(id) });
      state.year += 5;
    }

    state.family.father.alive = false;
    state.family.mother.alive = false;
    state.family.siblings = [];
    state.family.spouse = null;
    state.family.spouseMeta = null;
    state.family.concubines = [];
    state.family.children = [];
    const friend = normalizeFriend({ id: "memory-friend", name: "周有恒", relation: "友人", gender: "male", age: 28, physique: 80, affection: 66, disposition: "重情", ambition: "置办家业", marriedTo: "顾清" });
    state.friends = [friend];
    state.dynasty.local.disaster = 65;
    Math.random = () => 0.3;
    advanceNpcAgencyYear([]);
    const npcAgency = { action: friend.lastAction, year: friend.lastActionYear, memories: friend.memories.length, occupation: friend.occupation };
    view.page = "relations";
    render();
    const memoryVisible = document.querySelectorAll(".npc-memory").length > 0;

    state.age = 30;
    state.year = 300;
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    state.prisonYears = 0;
    state.stats.physique = 100;
    state.culturalCalendar = createCulturalCalendar();
    state.dynasty.activeArc = { id: "flood", stage: 0, score: 0, dueYear: 301, startedYear: 301, choices: [] };
    state.dynasty.completedArcs = [];
    Math.random = () => 0.9;
    nextYear();
    const queued = { current: state.currentEvent?.kind, pending: state.pendingAnnualEvent?.kind };
    if (state.currentEvent?.kind === "culturalEvent") {
      resolveCulturalEvent(state.currentEvent, state.currentEvent.children[0]);
      finishEventResult();
    }
    queued.afterCulture = state.currentEvent?.kind;

    Math.random = oldRandom;
    state = normalizeState(JSON.parse(snapshot));
    view.page = "main";
    view.overlay = "";
    save();
    render();
    return { annualWorld, worldUi, carryCheck, systemImpact, arcChecks, completedArcs: Object.keys(WORLD_ARCS).length, npcAgency, memoryVisible, queued };
  });
  assert.equal(worldSystems.annualWorld.advanced, true, "天下状态没有随流年推进");
  assert.ok(worldSystems.annualWorld.history >= 1 && worldSystems.annualWorld.headline, "天下事件没有写入纪事与头条");
  assert.deepEqual(worldSystems.worldUi, { metrics: 10, factions: 4, overflow: true }, "天下风云界面缺少指标、朝局或发生移动端溢出");
  assert.deepEqual(worldSystems.carryCheck, { era: true, dueYear: 25, startedYear: 19 }, "家族承继没有延续王朝状态或正确换算主线年份");
  assert.deepEqual(worldSystems.systemImpact, { riskHigher: true, travelCostHigher: true }, "边患、治安与粮价没有真正影响押镖和车马系统");
  assert.equal(worldSystems.arcChecks.length, 3, "没有建立三条天下主线");
  for (const arc of worldSystems.arcChecks) {
    assert.deepEqual({ stages: arc.stages, sawCareerFit: arc.sawCareerFit, completed: arc.completed }, { stages: 3, sawCareerFit: true, completed: true }, `${arc.id} 主线没有完整跨三幕结算`);
  }
  assert.equal(worldSystems.npcAgency.year > 0, true, "重要亲友没有执行年度自主行动");
  assert.ok(worldSystems.npcAgency.action && worldSystems.npcAgency.memories >= 1 && worldSystems.npcAgency.occupation, "NPC 动向、营生或长期记忆没有保存");
  assert.equal(worldSystems.memoryVisible, true, "亲友界面没有展示 NPC 记忆与近年动向");
  assert.deepEqual(worldSystems.queued, { current: "culturalEvent", pending: "worldArc", afterCulture: "worldArc" }, "岁时事件与天下主线没有按顺序衔接");

  console.log("quality gate: verifying prison life and Chinese cultural calendar systems");
  const prisonCulture = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    const oldRandom = Math.random;
    Math.random = () => 0.91;
    state.age = 30;
    state.year = 30;
    state.dead = false;
    state.stats.physique = 100;
    state.stats.mood = 80;
    state.stats.money = 2000;
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    state.pendingTravel = null;
    state.pendingCaravan = null;
    state.poetryRound = null;
    state.prisonYears = 0;
    state.prison = createPrisonState();
    imposePrisonSentence(2, "回归测试案");
    const dashboardHasMetrics = /申诉线索/.test(prisonOverviewView()) && /同监狱友/.test(prisonOverviewView());
    nextYear();
    const firstKind = state.currentEvent?.kind;
    const firstHasChoices = (state.currentEvent?.children || []).length >= 3;
    resolvePrisonYear(state.currentEvent, state.currentEvent.children.find((choice) => !choice.disabled));
    state.eventResult = null;
    state.pendingAchievement = null;
    state.prison.inmateFavor = 72;
    nextYear();
    const releaseEvent = state.currentEvent?.releaseCandidate === true;
    resolvePrisonYear(state.currentEvent, state.currentEvent.children[1]);
    const released = state.prisonYears === 0 && state.prison.active === false && !state.tags.includes("入狱");
    const prisonFriend = state.friends.some((friend) => friend.relation === "狱中故交");
    const prisonRecords = state.prison.records.length;

    state.currentEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.culturalCalendar = createCulturalCalendar();
    const cultureEvent = createCulturalEvent(SOLAR_TERMS[0]);
    state.currentEvent = cultureEvent;
    resolveCulturalEvent(cultureEvent, cultureEvent.children[0]);
    const recordedTerm = state.culturalCalendar.seen.includes(SOLAR_TERMS[0].id) && state.culturalCalendar.familyChoices === 1;
    const cultureHtml = cultureView();
    const cultureCards = (cultureHtml.match(/class="culture-card/g) || []).length;
    state.eventResult = null;
    const queued = { id: "queued-daily", kind: "dailyStory", title: "候补日常", content: "旧剧情仍应接续。", children: [{ title: "继续", content: "旧剧情仍应接续。", effects: {} }] };
    const festivalEvent = createCulturalEvent(TRADITIONAL_FESTIVALS[0]);
    state.currentEvent = festivalEvent;
    state.pendingAnnualEvent = queued;
    resolveCulturalEvent(festivalEvent, festivalEvent.children[2]);
    finishEventResult();
    const queuedKind = state.currentEvent?.kind;
    const definitions = { terms: SOLAR_TERMS.length, festivals: TRADITIONAL_FESTIVALS.length, unique: new Set(CULTURAL_CALENDAR_ITEMS.map((item) => item.id)).size };
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    view.page = "culture";
    render();
    const cultureMobile = { cards: document.querySelectorAll(".culture-card").length, overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth };
    state.prison = createPrisonState();
    state.prisonYears = 0;
    imposePrisonSentence(2, "界面测试案");
    view.page = "main";
    render();
    const prisonMobile = { metrics: document.querySelectorAll(".prison-metric").length, overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth };
    Math.random = oldRandom;
    state = normalizeState(JSON.parse(snapshot));
    view.page = "main";
    view.overlay = "";
    save();
    render();
    return { dashboardHasMetrics, firstKind, firstHasChoices, releaseEvent, released, prisonFriend, prisonRecords, recordedTerm, cultureCards, queuedKind, definitions, cultureMobile, prisonMobile };
  });
  assert.equal(prisonCulture.dashboardHasMetrics, true, "牢狱主界面没有显示申诉、狱友等核心状态");
  assert.equal(prisonCulture.firstKind, "prisonYear", "服刑年度没有进入牢狱专属事件");
  assert.equal(prisonCulture.firstHasChoices, true, "牢狱事件缺少可交互分支");
  assert.equal(prisonCulture.releaseEvent, true, "最后一年没有进入刑满释放剧情");
  assert.equal(prisonCulture.released, true, "刑满剧情没有正确清除余刑与入狱状态");
  assert.equal(prisonCulture.prisonFriend, true, "高狱友情分没有在出狱后转化为故交");
  assert.ok(prisonCulture.prisonRecords >= 2, "牢狱经历没有写入长期记录");
  assert.equal(prisonCulture.recordedTerm, true, "节气选择没有写入图鉴和家庭体验统计");
  assert.equal(prisonCulture.cultureCards, 40, "华夏岁时图鉴没有展示完整四十则条目");
  assert.equal(prisonCulture.queuedKind, "dailyStory", "文化事件结算后没有接续原有年度剧情");
  assert.deepEqual(prisonCulture.definitions, { terms: 24, festivals: 16, unique: 40 }, "节日或二十四节气定义不完整");
  assert.deepEqual(prisonCulture.cultureMobile, { cards: 40, overflow: true }, "华夏岁时图鉴在移动端缺项或横向溢出");
  assert.deepEqual(prisonCulture.prisonMobile, { metrics: 5, overflow: true }, "牢狱主界面在移动端缺项或横向溢出");

  console.log("quality gate: verifying clan management, genealogy and NPC relationship network");
  const clanSystems = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    const oldRandom = Math.random;
    const legacy = JSON.parse(snapshot);
    delete legacy.clan;
    const normalizedLegacy = normalizeState(legacy);
    const oldSave = {
      familyName: normalizedLegacy.clan.familyName,
      branches: normalizedLegacy.clan.branches.length,
      projects: Object.keys(normalizedLegacy.clan.projects).length,
      rules: normalizedLegacy.clan.activeRules.length,
    };

    state.age = 35;
    state.year = 80;
    state.dead = false;
    state.prisonYears = 0;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.stats.money = 8000;
    state.clan = createClanState(state.lineage.familyName);
    state.family.siblings = [normalizeRelative({ id: "clan-sibling", name: `${state.lineage.familyName}仲和`, relation: "弟弟", gender: "male", age: 30, alive: true, physique: 80, affection: 72, householdSeparated: true }, state.lineage.familyName, "sibling")];
    const child = normalizeChild({ id: "child-clan-heir", name: `${state.lineage.familyName}承宗`, relation: "儿子", gender: "male", age: 22, alive: true, physique: 82, affection: 75, study: 40, spouse: { id: "clan-inlaw", name: "顾宜家", relation: "儿媳", gender: "female", age: 21, alive: true, physique: 78, affection: 70 }, grandchildren: [] }, state.lineage.familyName);
    state.family.children = [child];
    syncClanBranches();
    const branchCount = state.clan.branches.length;

    donateToClan(500);
    state.eventResult = null;
    toggleClanRule("education");
    state.eventResult = null;
    toggleClanRule("commerce");
    state.eventResult = null;
    toggleClanRule("relief");
    const rules = [...state.clan.activeRules];
    state.eventResult = null;
    state.clan.treasury = 3000;
    upgradeClanHall();
    state.eventResult = null;
    upgradeClanProject("school");
    state.eventResult = null;
    const management = { hall: state.clan.hallLevel, school: state.clan.projects.school, treasury: state.clan.treasury, rules };

    Math.random = () => 0.1;
    state.clan.lastAdvancedYear = -1;
    const childStudyBefore = child.study;
    advanceClanYear([]);
    const annual = { relationEdges: state.clan.relations.length, chronicle: state.clan.chronicle.length, childStudy: child.study - childStudyBefore, advanced: state.clan.lastAdvancedYear === state.year };

    state.currentEvent = null;
    state.eventResult = null;
    state.clan.lastCouncilYear = -1;
    const cohesionBefore = state.clan.cohesion;
    startClanCouncil();
    const councilKind = state.currentEvent?.kind;
    resolveClanCouncil(state.currentEvent, state.currentEvent.children[0]);
    const council = { kind: councilKind, settled: state.clan.lastCouncilYear === state.year, cohesionRaised: state.clan.cohesion > cohesionBefore, records: state.clan.councils };
    state.eventResult = null;

    view.page = "clan";
    render();
    const ui = {
      metrics: document.querySelectorAll(".clan-metric").length,
      branches: document.querySelectorAll(".clan-branch-card").length,
      projects: document.querySelectorAll(".clan-project-card").length,
      tree: document.querySelectorAll(".genealogy-tree").length,
      edges: document.querySelectorAll(".clan-edge").length,
      overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    };
    const carried = carryClanAcrossInheritance(state.clan, 18, child.name, state.clan.familyName);
    const inheritance = { hall: carried.hallLevel, school: carried.projects.school, relations: carried.relations.length, resetYear: carried.lastAdvancedYear, chronicle: carried.chronicle[0]?.title };

    Math.random = oldRandom;
    state = normalizeState(JSON.parse(snapshot));
    view.page = "main";
    view.overlay = "";
    save();
    render();
    return { oldSave, branchCount, management, annual, council, ui, inheritance };
  });
  assert.ok(clanSystems.oldSave.familyName && clanSystems.oldSave.branches >= 1, "旧存档没有自动补齐宗族主房与姓氏");
  assert.deepEqual({ projects: clanSystems.oldSave.projects, rules: clanSystems.oldSave.rules }, { projects: 3, rules: 0 }, "旧存档没有自动补齐公中、族产与家规状态");
  assert.equal(clanSystems.branchCount, 3, "兄弟分家和子女成婚没有转化为主房之外的支房");
  assert.equal(clanSystems.management.hall, 1, "宗祠升级没有生效");
  assert.equal(clanSystems.management.school, 1, "族学扩建没有生效");
  assert.deepEqual(clanSystems.management.rules, ["education", "commerce"], "家规没有限制为最多同时两条");
  assert.ok(clanSystems.management.treasury >= 0, "宗族建设导致公中钱成为负数");
  assert.equal(clanSystems.annual.advanced, true, "宗族年度结算没有记录当前流年");
  assert.ok(clanSystems.annual.relationEdges >= 1 && clanSystems.annual.chronicle >= 1, "族人没有形成彼此之间的长期关系或宗族纪事");
  assert.ok(clanSystems.annual.childStudy >= 2, "重教家规与族学没有作用到子女学业");
  assert.deepEqual(clanSystems.council, { kind: "clanCouncil", settled: true, cohesionRaised: true, records: 1 }, "合族议事没有完整开启并结算");
  assert.deepEqual(clanSystems.ui, { metrics: 4, branches: 3, projects: 3, tree: 1, edges: 1, overflow: true }, "宗族页面缺少指标、族谱、支房、族产、关系网或发生移动端溢出");
  assert.deepEqual(clanSystems.inheritance, { hall: 1, school: 1, relations: 1, resetYear: 17, chronicle: "门户承继" }, "跨代承继没有保留宗祠、族产、人物关系与宗族纪事");

  console.log("quality gate: verifying regional reputation, factions, settlement and local property links");
  const regionalSystems = await page.evaluate(() => {
    const snapshot = JSON.stringify(state);
    const oldRandom = Math.random;
    Math.random = () => 0.1;
    const legacy = JSON.parse(snapshot);
    legacy.location = "洛城";
    delete legacy.regional;
    const normalizedLegacy = normalizeState(legacy);
    const oldSave = { residence: normalizedLegacy.regional.residenceId, regions: Object.keys(normalizedLegacy.regional.regions).length, factions: Object.keys(normalizedLegacy.regional.regions.luocheng.factionFavor).length };

    state.age = 32;
    state.year = 90;
    state.dead = false;
    state.prisonYears = 0;
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.pendingSurprise = null;
    state.pendingCaravan = null;
    state.stats.money = 12000;
    state.stats.eq = 100;
    state.stats.knowledge = 100;
    state.location = "清平县";
    state.regional = createRegionalState("qingping");
    state.travelSystem = createTravelSystem();
    state.travelSystem.memories = normalizeTravelSystem(state.travelSystem).memories;
    state.regional.regions.yunzhou.reputation = 40;
    state.pendingTravel = normalizeTravelRun({ id: "regional-arrival", destinationId: "yunzhou", origin: "清平县", index: 0, events: [], companionId: "alone", companionName: "独行", supplyId: "steady", quality: 72, spent: 35, history: [{ title: "启程", text: "你由清平前往云州。", ok: true }] });
    completeTravelActivity("faction");
    const arrival = { current: state.regional.currentId, location: state.location, reputation: state.regional.regions.yunzhou.reputation, favor: state.regional.regions.yunzhou.factionFavor.guild, contacts: state.friends.filter((friend) => friend.regionId === "yunzhou").length };
    state.eventResult = null;
    state.pendingAchievement = null;

    const region = state.regional.regions.yunzhou;
    region.lastActionYear = -1;
    state.career = { name: "镖师行商", customKind: "caravan" };
    interactRegionalFaction("yunzhou", "guild");
    const factionVisit = { acted: region.lastActionYear === state.year, favor: region.factionFavor.guild, reputation: region.reputation };
    state.eventResult = null;
    state.pendingAchievement = null;
    region.factionFavor.guild = 65;
    region.reputation = 55;
    formRegionalAlliance("yunzhou", "guild");
    const alliance = state.regional.alliances.some((item) => item.regionId === "yunzhou" && item.factionId === "guild");
    state.eventResult = null;
    state.pendingAchievement = null;

    state.assets = [];
    buyAsset(0);
    const regionalAsset = { regionId: state.assets[0].regionId, location: state.assets[0].location };
    state.assets[0].condition = 100;
    state.assets[0].level = 1;
    state.assets[0].mode = "rent";
    state.regional.regions.yunzhou.reputation = 0;
    state.regional.alliances = [];
    const lowIncome = annualAssetIncome();
    state.regional.regions.yunzhou.reputation = 100;
    state.regional.alliances = [{ regionId: "yunzhou", factionId: "guild", year: state.year }];
    const highIncome = annualAssetIncome();

    state.pendingTravel = normalizeTravelRun({ id: "regional-settle", destinationId: "yunzhou", origin: "云州", index: 0, events: [], companionId: "alone", companionName: "独行", supplyId: "steady", quality: 80, spent: 0, history: [] });
    state.regional.regions.yunzhou.reputation = 50;
    state.eventResult = null;
    completeTravelActivity("settle");
    const settlement = { residence: state.regional.residenceId, settled: state.regional.regions.yunzhou.settled, pending: state.pendingTravel };
    state.eventResult = null;
    state.pendingAchievement = null;

    state.regional.regions.yunzhou.lastEventYear = -1;
    const repBeforeEvent = state.regional.regions.yunzhou.reputation;
    const localEvent = annualRegionalEvent();
    state.currentEvent = localEvent;
    resolveRegionalEvent(localEvent, localEvent.children[0]);
    const eventResult = { kind: localEvent.kind, recorded: state.regional.regions.yunzhou.lastEventYear === state.year, reputationRaised: state.regional.regions.yunzhou.reputation > repBeforeEvent };
    state.eventResult = null;
    state.pendingAchievement = null;

    view.page = "regions";
    render();
    const ui = { map: document.querySelectorAll(".regional-map-card").length, landscapes: document.querySelectorAll(".regional-map-scene img").length, detailLandscape: document.querySelector(".regional-detail-scene img")?.getAttribute("src"), factions: document.querySelectorAll(".regional-faction-card").length, summary: document.querySelectorAll(".regional-summary span").length, overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth };
    const carried = carryRegionalAcrossInheritance(state.regional, 18, "李承远");
    const inheritance = { residence: carried.residenceId, regions: Object.keys(carried.regions).length, alliances: carried.alliances.length, resetYear: carried.lastAnnualYear, chronicle: carried.chronicle[0]?.title };

    Math.random = oldRandom;
    state = normalizeState(JSON.parse(snapshot));
    view.page = "main";
    view.overlay = "";
    save();
    render();
    return { oldSave, arrival, factionVisit, alliance, regionalAsset, incomeLinked: highIncome > lowIncome, settlement, eventResult, ui, inheritance };
  });
  assert.deepEqual(regionalSystems.oldSave, { residence: "luocheng", regions: 8, factions: 2 }, "旧存档没有按所在地补齐八地声望与地方势力");
  assert.equal(regionalSystems.arrival.current, "yunzhou", "旅行抵达后没有更新当前地域");
  assert.equal(regionalSystems.arrival.location, "云州", "旅行抵达后没有更新所在地名称");
  assert.ok(regionalSystems.arrival.reputation > 40 && regionalSystems.arrival.favor >= 8 && regionalSystems.arrival.contacts >= 1, "抵达后拜会地方势力没有增加声望、好感或联系人");
  assert.ok(regionalSystems.factionVisit.acted && regionalSystems.factionVisit.favor > regionalSystems.arrival.favor && regionalSystems.factionVisit.reputation > regionalSystems.arrival.reputation, "本业拜会没有写入年度地方行动或势力关系");
  assert.equal(regionalSystems.alliance, true, "势力好感与地方声望达标后无法结成盟友");
  assert.deepEqual(regionalSystems.regionalAsset, { regionId: "yunzhou", location: "云州" }, "新购家产没有登记所在州府");
  assert.equal(regionalSystems.incomeLinked, true, "地方声望与盟友没有提高当地产业收益");
  assert.deepEqual(regionalSystems.settlement, { residence: "yunzhou", settled: true, pending: null }, "迁居没有更新家门、定居状态或清理旅行流程");
  assert.deepEqual(regionalSystems.eventResult, { kind: "regionalEvent", recorded: true, reputationRaised: true }, "地方年度事件没有开启、结算或改变声望");
  assert.deepEqual(regionalSystems.ui, { map: 8, landscapes: 8, detailLandscape: "assets/region-yunzhou.webp", factions: 2, summary: 4, overflow: true }, "九州声望页面缺少八地风景、势力卡片、总览或发生移动端溢出");
  assert.deepEqual(regionalSystems.inheritance, { residence: "yunzhou", regions: 8, alliances: 1, resetYear: 17, chronicle: "地方人脉承继" }, "地域声望、盟友、定居地与纪事没有跨代继承");

  console.log("quality gate: stress-testing annual flow through late life");
  const annualStress = await page.evaluate(() => {
    state.age = 18;
    state.year = 200;
    state.dead = false;
    state.deathReason = "";
    state.prisonYears = 0;
    state.stats.physique = 100;
    state.stats.money = 20000;
    state.currentEvent = null;
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    state.pendingTravel = null;
    state.pendingCaravan = null;
    state.poetryRound = null;
    const failures = [];
    const runtimeErrors = [];
    const originalConsoleError = console.error;
    console.error = (...args) => runtimeErrors.push(args.map((item) => item?.stack || String(item)).join("\n"));
    for (let step = 0; step < 55; step += 1) {
      const before = state.age;
      nextYear();
      if (state.eventResult?.title === "流年受阻") failures.push({ age: before, text: state.eventResult.text });
      state.currentEvent = null;
      state.pendingAnnualEvent = null;
      state.eventResult = null;
      state.pendingSurprise = null;
      state.pendingAchievement = null;
      state.prisonYears = 0;
      state.stats.physique = 100;
      view.overlay = "";
      view.page = "main";
    }
    console.error = originalConsoleError;
    save();
    render();
    return { age: state.age, failures, runtimeErrors };
  });
  assert.equal(annualStress.age, 73, "中晚年压力测试未能连续推进 55 个流年");
  assert.deepEqual({ failures: annualStress.failures, runtimeErrors: annualStress.runtimeErrors }, { failures: [], runtimeErrors: [] }, "中晚年流年仍出现异常兜底事件");

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
