import assert from "node:assert/strict";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof startLife === "function");
  const results = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    const reset = (kind) => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age: 30, year: 30, currentEvent: null, eventResult: null, pendingAchievement: null, pendingAnnualEvent: null });
      state.stats.money = 5000;
      state.stats.knowledge = 82;
      state.stats.physique = 90;
      state.career = allCareers().find((item) => careerKind(item) === kind);
      state.official = normalizeOfficial({ unlocked: kind === "official", rank: 6, clean: 0, corruption: 0, merit: 0, retired: false });
      state.careerChapters = normalizeCareerChapters(undefined);
      state.dynasty.local.epidemic = 60;
      state.dynasty.local.grainPrice = 160;
      state.regional = createRegionalState("qingping");
      const progress = careerProgressFor();
      if (progress.livelihood) Object.assign(progress.livelihood, { resource: 60, readiness: 30, reputation: 30, risk: 20 });
      Object.assign(view, { screen: "game", page: "main", tab: "career", overlay: "", mobileSection: "panel" });
    };
    const routes = [
      ["merchant", "粮路长明", ["advance-grain", "rescue-crew", "fair-ration", "public-charter"], 4760, "granary"],
      ["merchant", "同舟商约", ["pool-shares", "open-losses", "share-loss", "workers-share"], 4780, ""],
      ["merchant", "转手粮路", ["exclusive-order", "sell-damaged", "premium-delivery", "sell-route"], 5860, ""],
      ["merchant", "财聚人散", ["advance-grain", "sell-damaged", "fair-ration", "public-charter"], 5000, ""],
      ["medicine", "医案传灯", ["retain-samples", "recall-batch", "share-casebook", "open-records"], 4800, ""],
      ["medicine", "一巷安灯", ["triage-clinic", "visit-patients", "shared-dispensary", "endow-clinic"], 4700, "dispensary"],
      ["medicine", "招牌下的隐痛", ["private-retainer", "unchecked-batch", "hide-records", "private-seal"], 5800, ""],
      ["medicine", "认过重开", ["retain-samples", "unchecked-batch", "share-casebook", "open-records"], 4900, ""],
      ["official", "清议立身", ["seal-ledgers", "refuse-letter", "trace-seals", "submit-truth"]],
      ["official", "公私两全", ["family-grain", "trade-for-witness", "use-family-proof", "share-responsibility"]],
      ["official", "权门遮案", ["detain-clerk", "rewrite-register", "make-scapegoat", "buy-inspector"]],
    ];
    const played = routes.map(([kind, expected, choices, money, landmark]) => {
      reset(kind);
      const originalName = state.name;
      const entry = careerActions().find(([action]) => action === "case:chapter");
      performCareerAction("case:chapter");
      const id = state.careerChapters.active?.id;
      let replaySafe = true;
      let waits = 0;
      let currentEvent;
      for (let index = 0; index < choices.length; index += 1) {
        currentEvent = state.currentEvent;
        const choiceIndex = currentEvent.children.findIndex((item) => item.id === choices[index]);
        if (choiceIndex < 0 || currentEvent.children[choiceIndex].disabled) throw new Error(`${expected}: 第${index + 1}幕 ${choices[index]}不可用`);
        const selected = currentEvent.children[choiceIndex];
        chooseOption(choiceIndex);
        const cash = state.stats.money;
        const historyCount = state.careerChapters.active?.history.length || state.careerChapters.completed[0]?.history.length;
        resolveCareerChapter(currentEvent, selected);
        replaySafe &&= state.stats.money === cash && (state.careerChapters.active?.history.length || state.careerChapters.completed[0]?.history.length) === historyCount;
        state = normalizeState(JSON.parse(JSON.stringify(state)));
        if (state.careerChapters.active) {
          state.currentEvent = null;
          state.eventResult = null;
          startOrResumeCareerChapter(id);
          if (!state.currentEvent && /待续/.test(state.eventResult?.title || "")) waits += 1;
          state.eventResult = null;
          state.year = state.careerChapters.active.dueYear;
          state.age = state.year;
          if (index === 2) {
            state.regional.currentId = "sudi";
            state.location = "苏堤";
          }
          state.currentEvent = annualCareerChapterEvent();
        }
      }
      const completed = state.careerChapters.completed[0];
      const cash = state.stats.money;
      state.currentEvent = null;
      state.eventResult = null;
      startOrResumeCareerChapter(id);
      const duplicateSafe = state.careerChapters.active === null && state.careerChapters.completed.length === 1 && state.stats.money === cash;
      return { expected, actual: completed.outcome, entry: !!entry, history: completed.history.length, years: completed.history.map((item) => item.year), waits, replaySafe, duplicateSafe, expectedMoney: money, money: state.stats.money, expectedLandmark: landmark, landmarks: state.regional.regions.qingping.legacies.map((item) => item.kind), awayLandmarks: state.regional.regions.sudi.legacies.length, summary: !!completed.summary, origin: completed.originName === originalName && completed.regionId === "qingping", kind: completed.careerKind, levels: careerProgressFor().level, shadow: state.threads.some((item) => item.key === "career:granary-ledger") };
    });

    reset("merchant");
    performCareerAction("case:chapter");
    const first = state.currentEvent;
    state.stats.money = 0;
    const before = JSON.stringify(state.careerChapters.active);
    resolveCareerChapter(first, first.children[0]);
    const noOverspend = before === JSON.stringify(state.careerChapters.active) && state.stats.money === 0;
    state.stats.money = 5000;
    state.careerChapters.active.stage = 2;
    state.careerChapters.active.flags = [];
    careerProgressFor().livelihood.resource = 0;
    const blockedEvent = buildCareerChapterEvent();
    const inventoryGate = blockedEvent.children.find((item) => item.id === "premium-delivery").disabled;
    const prerequisiteGate = blockedEvent.children.find((item) => item.id === "fair-ration").disabled;
    const noDeadlock = blockedEvent.children.some((item) => !item.disabled);

    reset("merchant");
    performCareerAction("case:chapter");
    const stale = state.currentEvent;
    const previousCash = state.stats.money;
    state.career = allCareers().find((item) => careerKind(item) === "medicine");
    resolveCareerChapter(stale, stale.children[0]);
    const noCrossCareerCharge = state.stats.money === previousCash && state.careerChapters.active.stage === 0;
    state.currentEvent = null;
    const interrupted = annualCareerChapterEvent();
    const switched = { noCrossCareerCharge, interrupted: interrupted === null && state.careerChapters.active === null && state.careerChapters.completed[0]?.outcome === "转业中断" };
    performCareerAction("case:chapter");
    switched.newCareer = state.careerChapters.active?.id === "epidemic-dispensary";

    reset("medicine");
    performCareerAction("case:chapter");
    chooseOption(0);
    state.eventResult = null;
    resignCareer();
    const resign = !state.career && !state.careerChapters.active && state.careerChapters.completed[0]?.outcome === "转业中断";

    reset("merchant");
    const random = Math.random;
    Math.random = () => 0;
    const annual = annualCareerChapterEvent();
    Math.random = random;
    const annualStart = annual?.chapterId === "grain-road";
    const legacySource = { active: { id: "granary-ledger", stage: 2, dueYear: 42, score: 5, routes: { law: 2, family: 0, power: 0 }, flags: ["sealed-ledgers"], history: [{ stageId: "missing-grain", choiceId: "seal-ledgers", title: "封仓验三账", year: 40 }] }, completed: [{ id: "granary-ledger", outcome: "过去的特殊结局", year: 30, routes: { power: 4 }, history: [] }], lastTriggerYear: 40 };
    const normalizedLegacy = normalizeCareerChapters(legacySource);
    const oldSave = { stage: normalizedLegacy.active.stage, flag: normalizedLegacy.active.flags[0], score: normalizedLegacy.active.score, oldOutcome: normalizedLegacy.completed[0].outcome, oldYear: normalizedLegacy.completed[0].year, oldRoute: normalizedLegacy.completed[0].routes.power };
    const fractionalStage = normalizeCareerChapters({ active: { id: "grain-road", stage: 0.5 } }).active.stage;

    reset("medicine");
    performCareerAction("case:chapter");
    const actor = careerChapterActor();
    actor.alive = false;
    actor.physique = 0;
    state.currentEvent = buildCareerChapterEvent();
    const absentColleague = state.currentEvent.content.includes("接手") && !careerChapterActor();
    chooseOption(0);
    const noResurrection = npcById(actor.id, true).alive === false;

    reset("medicine");
    performCareerAction("case:chapter");
    chooseOption(0);
    save();
    return { played, noOverspend, inventoryGate, prerequisiteGate, noDeadlock, switched, resign, annualStart, oldSave, fractionalStage, absentColleague, noResurrection, contentErrors: validateStoryContent() };
  });

  for (const route of results.played) {
    assert.equal(route.actual, route.expected, `${route.expected}结局不正确`);
    assert.equal(route.entry, true, "职业动作中缺少主动入口");
    assert.equal(route.history, 4);
    assert.deepEqual(route.years, [30, 31, 32, 33]);
    assert.equal(route.waits, 3, "应等待下一年才能继续");
    assert.equal(route.replaySafe, true, "旧幕不能重复结算");
    assert.equal(route.duplicateSafe, true, "已完成章节不能重开奖励");
    assert.equal(route.summary, true);
    assert.equal(route.origin, true);
    if (route.expectedMoney !== undefined) assert.equal(route.money, route.expectedMoney, `${route.expected}真实收支不匹配`);
    assert.deepEqual(route.landmarks, route.expectedLandmark ? [route.expectedLandmark] : [], "公益地标条件不正确");
    assert.equal(route.awayLandmarks, 0, "跨城完成不应把地标记到错误地域");
    if (route.kind !== "official") assert.ok(route.levels > 1, "职业长线应提供实际本业成长");
    if (route.expected === "权门遮案") assert.equal(route.shadow, true, "原官场延迟后果丢失");
  }
  assert.equal(results.noOverspend, true);
  assert.equal(results.inventoryGate, true);
  assert.equal(results.prerequisiteGate, true);
  assert.equal(results.noDeadlock, true, "穷困/无存货时必须有可选退路");
  assert.deepEqual(results.switched, { noCrossCareerCharge: true, interrupted: true, newCareer: true });
  assert.equal(results.resign, true);
  assert.equal(results.annualStart, true);
  assert.deepEqual(results.oldSave, { stage: 2, flag: "sealed-ledgers", score: 5, oldOutcome: "过去的特殊结局", oldYear: 30, oldRoute: 4 });
  assert.equal(results.fractionalStage, 1, "导入的分数幕次必须规范为合法整数索引，并保留原有四舍五入规则");
  assert.equal(results.absentColleague, true);
  assert.equal(results.noResurrection, true);
  assert.deepEqual(results.contentErrors, []);
  await page.reload({ waitUntil: "domcontentloaded" });
  const restored = await page.evaluate(() => ({ id: state.careerChapters.active?.id, stage: state.careerChapters.active?.stage, careerName: state.careerChapters.active?.careerName, actorPresent: !!npcById(state.careerChapters.active?.actorId), flag: state.careerChapters.active?.flags.includes("retained-samples") }));
  assert.deepEqual(restored, { id: "epidemic-dispensary", stage: 1, careerName: "医者", actorPresent: true, flag: true });
  assert.deepEqual(errors, []);
  console.log("career stories: 8 merchant/medicine endings, 3 official regressions, costs, conditions, deadlines, identity changes, origin-region legacies, old saves and reload passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
