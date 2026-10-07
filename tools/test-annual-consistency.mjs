import assert from "node:assert/strict";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(() => {
    startLife();
    state.gender = "male";
    Object.assign(state, { age: 20, year: 20, lastSettledYear: 20, currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null });
    state.onboarding.seen = true;
    state.stats.money = 100000;
    state.stats.physique = 90;
    state.assets = [{ ...PROPERTY_CATALOG[0], regionId: "qingping", condition: 100, level: 1, mode: "self" }];
    state.culturalCalendar.total = 1;
    state.family.father.age = 40;
    state.family.mother.age = 40;
    state.family.father.physique = state.family.mother.physique = 90;
    state.friends = [normalizeFriend({ id: "annual-friend", name: "周岁安", gender: "male", age: 25, physique: 90, alive: true, affection: 60 })];
    establishRegionalLegacy("granary", "qingping");
    const baseline = JSON.stringify(state);
    const originalRandom = Math.random;
    Math.random = () => 0.95;
    const reset = () => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(view, { screen: "game", page: "main", tab: "history", overlay: "" });
    };
    const drain = () => {
      let turns = 0;
      while ((state.eventResult || state.currentEvent) && !state.dead && turns++ < 30) {
        if (state.eventResult) finishEventResult();
        else {
          const option = viableChildren(state.currentEvent).find(({ child }) => !child.disabled);
          if (option) chooseOption(option.index);
          else finishEvent();
        }
      }
      if (turns >= 30) throw new Error("年度队列未能收尾");
      state.pendingSurprise = null;
      view.overlay = "";
    };
    const passive = () => ({
      age: state.age, year: state.year, settled: state.lastSettledYear,
      reign: state.dynasty.reignYear, rulerAge: state.dynasty.rulerAge,
      assetPayments: state.ledger.filter((entry) => entry.title === "家产进项").map((entry) => [entry.age, entry.amount]),
      legacyPayments: state.ledger.filter((entry) => entry.title === "义仓口粮").map((entry) => entry.age),
      fatherAge: state.family.father.age, motherAge: state.family.mother.age,
      friendAge: state.friends.find((item) => item.id === "annual-friend").age,
      clanYear: state.clan.lastAdvancedYear, regionYear: state.regional.lastAnnualYear,
      npcActions: state.log.filter((entry) => entry.title === "亲友近况").map((entry) => entry.age),
    });
    reset();
    for (let year = 0; year < 3; year += 1) { nextYear(); drain(); }
    const normal = passive();
    reset();
    for (let year = 0; year < 3; year += 1) { prepareExam(); drain(); }
    const study = passive();

    reset();
    openThread("debt", "借款应还", "当年借钱，如今到期。", { delay: 1, stakes: 60 });
    prepareExam();
    const debt = { beforeContinue: state.eventResult?.title, queued: state.currentEvent?.kind, age: state.age };
    const beforeBlocked = state.year;
    prepareExam();
    debt.cannotSkip = state.year === beforeBlocked;
    finishEventResult();
    debt.afterContinue = state.currentEvent?.kind;
    const beforePayment = state.stats.money;
    chooseOption(0);
    debt.paid = beforePayment - state.stats.money;
    debt.resolved = state.threads[0].status;
    finishEventResult();
    debt.noExtraYear = state.age === 21;

    reset();
    state.age = state.year = state.lastSettledYear = 21;
    state.career = allCareers().find((item) => careerKind(item) === "merchant");
    state.careerChapters.active = createCareerChapter("grain-road");
    state.careerChapters.active.stage = 1;
    state.careerChapters.active.dueYear = 22;
    prepareExam();
    const chapter = { resultTitle: state.eventResult?.title, first: state.currentEvent?.kind, second: state.pendingAnnualEvent?.kind };

    reset();
    openThread("debt", "活动后的旧账", "完成活动后应答复。", { delay: 1, stakes: 60 });
    startActivity("academy");
    const activityStartAge = state.age;
    let activityResult = false;
    for (let turn = 0; state.pendingActivity && turn < 20; turn += 1) {
      if (state.eventResult) { activityResult = true; finishEventResult(); }
      else {
        const option = viableChildren(state.currentEvent).find(({ child }) => !child.disabled);
        if (option) chooseOption(option.index); else finishEvent();
      }
    }
    const activity = { resultSeen: activityResult, startAge: activityStartAge, endAge: state.age, next: state.currentEvent?.kind, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };

    reset();
    performHomeAction("estate");
    const home = { age: state.age, result: state.eventResult?.title, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };

    reset();
    state.age = state.year = state.lastSettledYear = 99;
    state.exam.current = { type: "choice", stageIndex: 0, questions: [{ selected: "a", correct: "a" }] };
    submitExam();
    const death = { age: state.age, dead: state.dead, reason: state.deathReason, next: state.currentEvent, queued: state.pendingAnnualEvent };

    reset();
    state.prisonYears = 2;
    const prisonReign = state.dynasty.reignYear;
    prepareExam(); performHomeAction("estate"); startActivity("academy");
    const prisonBlocked = state.age === 20;
    nextYear();
    const prison = { blocked: prisonBlocked, age: state.age, remaining: state.prisonYears, reignGain: state.dynasty.reignYear - prisonReign, current: state.currentEvent?.kind, payments: state.ledger.filter((entry) => entry.title === "家产进项").length, fatherAge: state.family.father.age };
    drain();
    nextYear();
    prison.release = state.currentEvent?.releaseCandidate;
    prison.secondAge = state.age;
    drain();
    prison.finished = state.prisonYears === 0 && !state.currentEvent && !state.pendingAnnualEvent;

    reset();
    state.age = state.year = state.lastSettledYear = 90;
    state.secrets = [{ id: "bandit-tie", acquiredAge: 0, exposed: false }];
    openThread("debt", "待结旧账", "不能在入狱年覆盖狱中事件。", { delay: 1, stakes: 60 });
    prepareExam();
    const newSentence = { age: state.age, years: state.prisonYears, served: state.prison.yearsServed, current: state.currentEvent?.kind, queued: state.pendingAnnualEvent, result: state.eventResult?.title };

    const blockers = [];
    for (const field of ["pendingTravel", "pendingCaravan", "poetryRound"]) {
      reset();
      state[field] = {};
      prepareExam(); performHomeAction("estate"); startActivity("academy");
      state.exam.current = { type: "choice", stageIndex: 0, questions: [] };
      submitExam();
      state.pendingActivity = { id: "academy", deltas: [] };
      completePendingActivity();
      blockers.push({ field, year: state.year, money: state.stats.money });
    }
    reset();
    state.exam.current = { type: "choice", stageIndex: 0, questions: [] };
    prepareExam(); performHomeAction("estate"); startActivity("academy");
    const examBlocksOthers = state.age === 20;

    reset();
    delete state.lastSettledYear;
    state = normalizeState(state);
    const oldYear = state.lastSettledYear;
    const oldMoney = state.stats.money;
    runAnnualAftermath();
    const oldSave = { marker: oldYear, moneyUnchanged: state.stats.money === oldMoney };

    reset();
    state.age = state.year = state.lastSettledYear = 90;
    state.dead = true;
    const heir = normalizeChild({ id: "annual-heir", name: "李承年", age: 20, gender: "male", alive: true, physique: 90 }, "李");
    state.family.children = [heir];
    state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
    inheritFromChild(heir.id);
    const inheritance = { childMarker: state.lastSettledYear };
    nextYear();
    inheritance.childAge = state.age;
    inheritance.childPayments = state.ledger.filter((entry) => entry.title === "家产进项" && !entry.inherited).length;
    inheritance.childRegion = state.regional.lastAnnualYear;
    drain();
    state.age = state.year = state.lastSettledYear = 88;
    state.dead = true;
    state.family.spouse = "王续年";
    state.family.spouseMeta = normalizePartner({ id: "annual-spouse", name: "王续年", age: 32, gender: "female", alive: true, physique: 90 }, "王", "妻子", "spouse");
    inheritFromChild("spouse-heir");
    inheritance.spouseMarker = state.lastSettledYear;
    nextYear();
    inheritance.spouseAge = state.age;
    inheritance.spousePayments = state.ledger.filter((entry) => entry.title === "家产进项" && !entry.inherited).length;
    inheritance.spouseRegion = state.regional.lastAnnualYear;

    reset();
    state.pendingActivity = { id: "academy", deltas: [] };
    state.eventResult = { title: "活动中身亡", text: "未能归来", deltas: [] };
    die("意外身亡");
    finishEventResult();
    const fatalActivity = { age: state.age, pending: state.pendingActivity, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };

    // Leave the two-stage annual queue and its preceding study result on disk for a real reload.
    reset();
    state.age = state.year = state.lastSettledYear = 21;
    state.career = allCareers().find((item) => careerKind(item) === "merchant");
    state.careerChapters.active = createCareerChapter("grain-road");
    state.careerChapters.active.stage = 1;
    state.careerChapters.active.dueYear = 22;
    prepareExam();
    const reload = { money: state.stats.money, year: state.year, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };
    save();
    Math.random = originalRandom;
    return { normal, study, debt, chapter, activity, home, death, prison, newSentence, blockers, examBlocksOthers, oldSave, inheritance, fatalActivity, reload };
  });
  assert.deepEqual(result.study, result.normal, "连续备考和正常流年的被动系统结算不同");
  assert.equal(result.study.assetPayments.length, 3);
  assert.equal(result.study.friendAge, 28);
  assert.equal(result.study.npcActions.length, 3);
  assert.deepEqual(result.debt, { beforeContinue: "备考一年", queued: "fateThread", age: 21, cannotSkip: true, afterContinue: "fateThread", paid: 60, resolved: "resolved", noExtraYear: true });
  assert.deepEqual(result.chapter, { resultTitle: "备考一年", first: "culturalEvent", second: "careerChapter" });
  assert.deepEqual(result.activity, { resultSeen: true, startAge: 20, endAge: 21, next: "fateThread", payments: 1 });
  assert.deepEqual(result.home, { age: 21, result: "整理家业", payments: 1 });
  assert.deepEqual(result.death, { age: 100, dead: true, reason: "寿终正寝", next: null, queued: null });
  assert.deepEqual(result.prison, { blocked: true, age: 21, remaining: 1, reignGain: 1, current: "prisonYear", payments: 0, fatherAge: 41, release: true, secondAge: 22, finished: true });
  assert.deepEqual(result.newSentence, { age: 91, years: 2, served: 0, current: "prisonYear", queued: null, result: "备考一年" });
  assert.ok(result.blockers.every((item) => item.year === 20 && item.money === 100000));
  assert.equal(result.examBlocksOthers, true);
  assert.deepEqual(result.oldSave, { marker: 20, moneyUnchanged: true });
  assert.deepEqual(result.inheritance, { childMarker: 20, childAge: 21, childPayments: 1, childRegion: 21, spouseMarker: 32, spouseAge: 33, spousePayments: 1, spouseRegion: 33 });
  assert.deepEqual(result.fatalActivity, { age: 20, pending: null, payments: 0 });

  await page.reload({ waitUntil: "domcontentloaded" });
  const reload = await page.evaluate(() => {
    const before = { money: state.stats.money, year: state.year, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };
    runAnnualAftermath();
    finishYear();
    const after = { money: state.stats.money, year: state.year, payments: state.ledger.filter((entry) => entry.title === "家产进项").length };
    const resultTitle = state.eventResult?.title;
    finishEventResult();
    const first = state.currentEvent?.kind;
    // A legacy event with no remaining options must still release the queued chapter.
    state.currentEvent.children = [];
    finishEvent();
    return { before, after, resultTitle, first, second: state.currentEvent?.kind, year: state.year, queueEmpty: !state.pendingAnnualEvent };
  });
  assert.deepEqual(reload.before, result.reload);
  assert.deepEqual(reload.after, result.reload, "刷新或重复收尾又结算了一年收益");
  assert.equal(reload.resultTitle, "备考一年");
  assert.equal(reload.first, "culturalEvent");
  assert.equal(reload.second, "careerChapter");
  assert.equal(reload.year, 22);
  assert.equal(reload.queueEmpty, true);
  assert.deepEqual(errors, []);
  console.log("annual consistency: 被动系统一致、债务/职业续接、活动结果、死亡、刷新防重、旧档、两类继承与狱中限制通过");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
