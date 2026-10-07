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
  await page.waitForFunction(() => typeof openHeirloom === "function");
  const result = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    let checks = 0;
    const check = (condition, message) => { if (!condition) throw new Error(message); checks += 1; };
    const reset = (kind = "") => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age: 30, year: 30, currentEvent: null, eventResult: null, pendingAchievement: null, pendingAnnualEvent: null });
      Object.assign(state.stats, { money: 5000, knowledge: 40, physique: 50, eq: 40, virtue: 40 });
      state.career = allCareers().find((career) => careerKind(career) === kind) || null;
      if (state.career) Object.assign(careerProgressFor().livelihood || {}, { resource: 80, readiness: 20, reputation: 10, risk: 10 });
      Object.assign(view, { screen: "game", page: "main", tab: "overview", overlay: "", mobileSection: "panel" });
    };
    const item = () => state.heirlooms.items[0];
    const choose = (decision) => {
      state.eventResult = null;
      openHeirloom(item().id);
      check(state.currentEvent?.kind === "heirloom", `应打开家传物事件：${decision}`);
      const index = state.currentEvent.children.findIndex((choice) => choice.heirloomChoice === decision);
      check(index >= 0 && !state.currentEvent.children[index].disabled, `选项可用：${decision}`);
      const oldEvent = state.currentEvent;
      const oldChoice = oldEvent.children[index];
      chooseOption(index);
      return { oldEvent, oldChoice };
    };
    const award = (kind = "annotated-book", alreadyUsed = false) => grantHeirloom(kind, {
      name: "许慎之", generation: null, personId: "scholar-original", sourceId: `test:${kind}`, regionId: "qingping", year: 20,
      summary: "许慎之亲手整理，由李家收存；原作者与后来持有人分别记下。",
    }, { alreadyUsed });
    const inherit = (kind = "child", occupation = "") => {
      const person = kind === "spouse"
        ? normalizePartner({ id: "heir-wife", name: "王知秋", gender: "female", age: 30, alive: true, physique: 80, occupation }, "王", "妻子", "spouse")
        : normalizeChild({ id: "heir-child", name: "李承安", gender: "male", age: 20, alive: true, physique: 80, occupation }, "李");
      if (kind === "spouse") { state.family.spouse = person.name; state.family.spouseMeta = person; }
      else state.family.children = [person];
      state.dead = true;
      state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
      inheritFromChild(kind === "spouse" ? "spouse-heir" : person.id);
      return person;
    };

    reset();
    award();
    const unknownKinds = ["toString", "__proto__", "constructor", "not-a-heirloom"];
    const filtered = normalizeHeirlooms({ holderId: state.heirlooms.holderId, items: [item(), ...unknownKinds.map((kind) => ({ id: `unknown:${kind}`, kind }))] });
    check(filtered.items.length === 1 && filtered.items[0].kind === "annotated-book", "原型链属性与未知 kind 都不能作为家传物件导入");
    check(unknownKinds.every((kind) => grantHeirloom(kind, {}) === "") && state.heirlooms.items.length === 1, "发放入口也拒绝未知与原型链物件类型");
    const identity = state.heirlooms.holderId;
    const startMoney = state.stats.money;
    const played = choose("use");
    check(state.stats.money === startMoney - 20 && state.stats.knowledge === 44 && state.study.prep === 6, "旧书只给一次适度学习收益，实际支付誊习成本");
    const once = JSON.stringify(state.heirlooms);
    resolveHeirloom(played.oldEvent, played.oldChoice);
    check(state.stats.money === startMoney - 20 && JSON.stringify(state.heirlooms) === once, "旧事件不能重放领奖");
    state.eventResult = null;
    check(!heirloomActionState(item()).canUse && heirloomActionState(item()).used, "当前持有人已用过");
    choose("seal");
    const sealedCash = state.stats.money;
    choose("unseal");
    state.eventResult = null;
    check(state.stats.money === sealedCash && !heirloomActionState(item()).canUse && item().usedBy.includes(identity), "封存启封无奖励，也不能刷新使用资格");
    state = normalizeState(JSON.parse(JSON.stringify(state)));
    check(state.heirlooms.holderId === identity && !heirloomActionState(item()).canUse, "存档规范化保留持有人与已用名单");
    const author = JSON.stringify(item().origin);
    inherit();
    check(state.heirlooms.holderId === "person:heir-child" && state.heirlooms.holderId !== identity, "子女承接采用具体人物的稳定 ID");
    check(JSON.stringify(item().origin) === author && item().history.some((entry) => entry.action === "承接") && heirloomActionState(item()).canUse, "继承保留作者和履历，新持有人可续用一次");
    choose("use");
    const heirMoney = state.stats.money;
    const heirHolder = state.heirlooms.holderId;
    inheritFromChild("heir-child");
    check(state.heirlooms.holderId === heirHolder && state.stats.money === heirMoney && item().usedBy.length === 2, "重复继承点击不会换 ID 或重置资格");

    reset();
    award("medical-casebook", true);
    const firstHolder = state.heirlooms.holderId;
    inherit("spouse", "医者");
    check(state.lineage.generation === 1 && state.heirlooms.holderId === "person:heir-wife" && firstHolder !== state.heirlooms.holderId, "同代妻子承接也区分持有人");
    check(heirloomActionState(item()).canUse, "妻子承接旧医案获得本人首次续用资格");
    choose("use");
    const wifeCash = state.stats.money;
    inheritFromChild("spouse-heir");
    check(state.stats.money === wifeCash && item().usedBy.includes("person:heir-wife"), "妻子继承不能重复点击领奖");

    const differences = ["grain-charter", "medical-casebook"].map((kind) => {
      reset(HEIRLOOM_DEFS[kind].careerKind);
      award(kind);
      const before = { money: state.stats.money, exp: careerProgressFor().exp, ready: careerProgressFor().livelihood.readiness, reputation: careerProgressFor().livelihood.reputation };
      choose("use");
      const specialist = { cost: before.money - state.stats.money, exp: careerProgressFor().exp - before.exp, ready: careerProgressFor().livelihood.readiness - before.ready, reputation: careerProgressFor().livelihood.reputation - before.reputation };
      reset();
      award(kind);
      choose("use");
      check(state.career === null && state.stats.knowledge === 43, "普通人有较小学识效果，不伪造职业或转职");
      check(specialist.cost === HEIRLOOM_DEFS[kind].useCost && specialist.exp === 45 && specialist.reputation === 4, "本业按真实费用增加经验与行业信誉");
      check(specialist.ready === (kind === "medical-casebook" ? 8 : 6), "医案和旧约影响各自职业门路");
      return { kind, ...specialist };
    });

    reset();
    award();
    const beforeDonate = state.stats.money;
    choose("donate");
    check(item().status === "donated" && state.stats.money === beforeDonate - 15 && state.stats.virtue === 43, "捐赠产生真实费用及德行效果");
    check(state.regional.chronicle.some((entry) => entry.regionId === "qingping" && entry.title.includes("旧物入乡")), "当地记录捐赠来源");
    state.eventResult = null;
    check(!heirloomActionState(item()).canOpen, "捐出的原件不能再次打开");
    state = normalizeState(JSON.parse(JSON.stringify(state)));
    inherit();
    check(item().status === "donated" && !heirloomActionState(item()).canUse, "捐出后继承也不能收回或重复获益");

    reset();
    award();
    choose("seal");
    inherit();
    check(item().status === "sealed" && !heirloomActionState(item()).canUse && item().usedBy.length === 0, "未用即封存完整留给下一位持有人");
    choose("unseal");
    state.eventResult = null;
    check(heirloomActionState(item()).canUse, "下一代启封后可作自己的首次选择");
    openHeirloom(item().id);
    state.stats.money = 0;
    const pending = JSON.stringify(item());
    chooseOption(0);
    check(state.stats.money === 0 && JSON.stringify(item()) === pending, "事件显示后钱不足也不能透支或偷领收益");
    state.stats.money = 100;
    state.prisonYears = 1;
    chooseOption(0);
    check(JSON.stringify(item()) === pending, "入狱后不能通过旧事件处置物件");

    for (const field of ["pendingActivity", "pendingAnnualEvent", "pendingTravel", "pendingCaravan", "poetryRound", "pendingSurprise"]) {
      reset();
      award();
      state[field] = { active: true };
      check(!heirloomActionState(item()).canOpen, `${field} 进行中不开放旧物处置`);
      openHeirloom(item().id);
      check(state.currentEvent === null, `${field} 进行中不能插入旧物事件`);
      state[field] = null;
      openHeirloom(item().id);
      state[field] = { active: true };
      chooseOption(0);
      check(item().usedBy.length === 0 && state.stats.money === 5000, `${field} 后来开始时，旧物事件不能绕过事务互斥`);
    }
    reset();
    award();
    state.exam.current = { stageIndex: 0 };
    check(!heirloomActionState(item()).canOpen, "正在考试时不开放旧物处置");
    state.exam.current = null;
    state.age = 7;
    state.stats.money = 0;
    openHeirloom(item().id);
    check(state.currentEvent.children[0].note.includes("八岁") && state.currentEvent.children[1].note.includes("暂不可选"), "年龄和费用锁定原因写进选项说明");

    reset();
    const old = JSON.parse(JSON.stringify(state));
    delete old.heirlooms;
    old.inventory.push("故人批注的旧书");
    old.careerChapters.completed = [
      { id: "grain-road", outcome: "粮路长明", originName: "李先行", regionId: "qingping", year: 44 },
      { id: "epidemic-dispensary", outcome: "医案传灯", originName: "", year: 38 },
    ];
    state = normalizeState(old);
    check(state.heirlooms.items.length === 3 && !state.inventory.includes("故人批注的旧书"), "旧档真实结局与仍持有旧书回填三种物件，并移出可变卖行囊");
    const restoredCharter = state.heirlooms.items.find((entry) => entry.kind === "grain-charter");
    const restoredBook = state.heirlooms.items.find((entry) => entry.kind === "annotated-book");
    const restoredCasebook = state.heirlooms.items.find((entry) => entry.kind === "medical-casebook");
    check(restoredCharter.origin.name === "李先行" && restoredCharter.origin.generation === null, "明确原主人保留，不猜测祖先辈分");
    check(restoredBook.origin.name === "来历未详" && restoredBook.origin.year === null && restoredCasebook.origin.name === "来历未详", "无法核查作者和年份时明示未详");
    const migrated = JSON.stringify(state.heirlooms);
    state = normalizeState(JSON.parse(JSON.stringify(state)));
    check(JSON.stringify(state.heirlooms) === migrated, "回填幂等，不会每次读档重发物件");
    const cashBeforeSale = state.stats.money;
    sellInventoryItem("故人批注的旧书");
    check(state.stats.money === cashBeforeSale && state.heirlooms.items.length === 3, "独立旧书不能从普通出售入口变现");

    const knownBook = JSON.parse(baseline);
    delete knownBook.heirlooms;
    knownBook.inventory.push("故人批注的旧书");
    knownBook.threads = [{ id: "old-book-source", kind: "favor", sourceId: "scholar-study", target: "许存真", targetId: "scholar-known", status: "resolved", outcome: "收好旧书，记下故人" }];
    state = normalizeState(knownBook);
    check(item().origin.name === "许存真" && item().origin.personId === "scholar-known" && item().origin.generation === null, "有明确旧书结局时恢复真实作者，不制造辈分");

    for (const historyLength of [51, 48]) {
      reset();
      award();
      openHeirloom(item().id);
      const legacyPending = JSON.parse(JSON.stringify(state));
      const legacyItem = legacyPending.heirlooms.items[0];
      legacyItem.history = Array.from({ length: historyLength }, () => ({ ...legacyItem.history[0] }));
      delete legacyItem.revision;
      legacyPending.currentEvent.revision = 51;
      state = normalizeState(legacyPending);
      check(item().history.length === 48 && item().revision === 51 && state.currentEvent.revision === 51, "兼容旧版超长履历或已被截短履历上的待选事件");
      chooseOption(0);
      check(state.currentEvent === null && state.stats.money === 4980 && item().revision === 52 && item().history.length === 48, "旧待选事件恢复后可继续，且只结算一次");
    }

    const outcomes = [
      ["merchant", ["advance-grain", "rescue-crew", "fair-ration", "public-charter"], "grain-charter"],
      ["medicine", ["retain-samples", "recall-batch", "share-casebook", "open-records"], "medical-casebook"],
      ["merchant", ["exclusive-order", "sell-damaged", "premium-delivery", "sell-route"], ""],
    ].map(([kind, path, expected]) => {
      reset(kind);
      performCareerAction("case:chapter");
      for (const decision of path) {
        const index = state.currentEvent.children.findIndex((choice) => choice.id === decision);
        chooseOption(index);
        if (state.careerChapters.active) {
          state.eventResult = null;
          state.year = state.careerChapters.active.dueYear;
          state.currentEvent = annualCareerChapterEvent();
        }
      }
      const actual = item()?.kind || "";
      check(actual === expected, "仅真实好结局留下职业旧物");
      if (expected) {
        state.eventResult = null;
        check(item().origin.name === state.name && item().origin.generation === 1 && !heirloomActionState(item()).canUse, "创办者已得到职业结算，物件不重复奖励本代");
      }
      return { outcome: state.careerChapters.completed[0].outcome, item: actual };
    });

    reset();
    state.age = 12;
    state.year = 12;
    state.currentEvent = annualScholarStoryEvent();
    const authorId = state.currentEvent.npcId;
    chooseOption(0);
    const scholar = npcById(authorId, true);
    scholar.alive = false;
    scholar.physique = 0;
    state.year += 3;
    state.age += 3;
    state.eventResult = null;
    state.currentEvent = annualThreadEvent();
    chooseOption(0);
    check(item().kind === "annotated-book" && item().origin.personId === authorId && item().origin.name === scholar.name && !state.inventory.includes(item().title), "书友旧书保留具体作者，且不复制普通可出售物品");
    state.eventResult = null;
    openHeirloom(item().id);
    save();
    return { checks, differences, outcomes, savedHolder: state.heirlooms.holderId, savedId: item().id };
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  const restored = await page.evaluate(() => {
    const before = state.stats.money;
    const id = state.currentEvent?.heirloomId;
    chooseOption(0);
    return { id, holder: state.heirlooms.holderId, used: state.heirlooms.items[0].usedBy.includes(state.heirlooms.holderId), paid: before - state.stats.money };
  });
  assert.deepEqual(restored, { id: result.savedId, holder: result.savedHolder, used: true, paid: 20 }, "真实刷新恢复旧物事件，并继续完成一次选择");
  const longHistory = await page.evaluate(() => {
    const item = state.heirlooms.items[0];
    const cash = state.stats.money;
    const startRevision = item.revision;
    for (let index = 0; index < 50; index += 1) {
      state.eventResult = null;
      openHeirloom(item.id);
      const action = index % 2 ? "unseal" : "seal";
      chooseOption(state.currentEvent.children.findIndex((choice) => choice.heirloomChoice === action));
      if (item.history.length > 48) throw new Error("追加履历必须立即维持 48 条上限");
    }
    state.eventResult = null;
    openHeirloom(item.id);
    save();
    return { historyLength: item.history.length, revision: item.revision, startRevision, eventRevision: state.currentEvent.revision, cash, paid: cash - state.stats.money };
  });
  assert.equal(longHistory.historyLength, 48);
  assert.equal(longHistory.revision, longHistory.startRevision + 50, "履历截断后，独立修订号仍持续增长");
  assert.equal(longHistory.eventRevision, longHistory.revision);
  assert.equal(longHistory.paid, 0, "反复封存启封没有任何现金奖励或费用");
  await page.reload({ waitUntil: "domcontentloaded" });
  const continued = await page.evaluate(() => {
    const item = state.heirlooms.items[0];
    const event = state.currentEvent;
    const selected = event.children.find((choice) => choice.heirloomChoice === "seal");
    const onceLocked = event.children.find((choice) => choice.heirloomChoice === "use").disabled;
    chooseOption(event.children.indexOf(selected));
    const after = JSON.stringify(item);
    resolveHeirloom(event, selected);
    return { onceLocked, status: item.status, cleared: state.currentEvent === null, revision: item.revision, length: item.history.length, cash: state.stats.money, replaySafe: JSON.stringify(item) === after, uses: item.usedBy.filter((id) => id === state.heirlooms.holderId).length };
  });
  assert.deepEqual(continued, { onceLocked: true, status: "sealed", cleared: true, revision: longHistory.revision + 1, length: 48, cash: longHistory.cash, replaySafe: true, uses: 1 }, "50 次流转后真实刷新仍可处理，且不能再领收益或重放事件");
  assert.deepEqual(errors, [], "家传物件流程不应产生浏览器错误");
  console.log(JSON.stringify({ checks: result.checks, differences: result.differences, outcomes: result.outcomes, reload: true, fiftyTransitionsReload: true }));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
