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
