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
  const result = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    const definitions = [
      { id: "spring-water", kind: "farmer", item: "water-register", title: "分水农事簿", outcome: "一渠同春", cost: 40, path: ["survey-channel", "shared-weir", "teach-water", "public-register"] },
      { id: "workshop-promise", kind: "craft", item: "craft-pattern", title: "百工留样册", outcome: "百工传式", cost: 50, path: ["keep-sample", "prove-process", "teach-work", "open-pattern"] },
    ];
    let checks = 0;
    const check = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
    const item = () => state.heirlooms.items[0];
    const use = (decision) => {
      openHeirloom(item().id);
      check(state.currentEvent?.kind === "heirloom", `打开 ${item().title}`);
      const event = state.currentEvent;
      const choice = event.children.find((entry) => entry.heirloomChoice === decision);
      check(choice && !choice.disabled, `可选择 ${decision}`);
      chooseOption(event.children.indexOf(choice));
      return { event, choice };
    };
    const inherit = (who, careerName) => {
      const person = who === "child"
        ? normalizeChild({ id: "new-book-child", name: "李承安", gender: "male", age: 24, alive: true, physique: 80, occupation: careerName }, "李")
        : normalizePartner({ id: "new-book-wife", name: "王知秋", gender: "female", age: 32, alive: true, physique: 80, occupation: careerName }, "王", "妻子", "spouse");
      if (who === "child") state.family.children = [person];
      else { state.family.spouse = person.name; state.family.spouseMeta = person; }
      state.dead = true;
      state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
      inheritFromChild(who === "child" ? person.id : "spouse-heir");
      Object.assign(state.stats, { money: 500, knowledge: 40, eq: 40, physique: 50 });
      state.careerProgress = {};
      const progress = careerProgressFor();
      if (progress.livelihood) Object.assign(progress.livelihood, { resource: 40, readiness: 20, reputation: 10 });
    };
    const results = definitions.map((definition) => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { gender: "male", age: 30, year: 30, lastSettledYear: 30, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      state.onboarding.seen = true;
      Object.assign(state.stats, { money: 5000, knowledge: 90, physique: 90, eq: 90, virtue: 90 });
      state.career = allCareers().find((career) => careerKind(career) === definition.kind);
      const careerName = state.career.name;
      const progress = careerProgressFor();
      if (progress.livelihood) Object.assign(progress.livelihood, { resource: 80, readiness: 80, reputation: 60, risk: 0 });
      Object.assign(view, { screen: "game", page: "main", overlay: "" });
      startOrResumeCareerChapter(definition.id);
      for (const choiceId of definition.path) {
        const index = state.currentEvent.children.findIndex((choice) => choice.id === choiceId);
        check(index >= 0 && !state.currentEvent.children[index].disabled, `${definition.id} 的真实选项 ${choiceId} 可用`);
        chooseOption(index);
        finishEventResult();
        if (state.careerChapters.active) {
          state.year = state.age = state.careerChapters.active.dueYear;
          state.currentEvent = annualCareerChapterEvent();
        }
      }
      check(state.careerChapters.completed[0]?.outcome === definition.outcome, `${definition.id} 得到真实好结局`);
      check(state.heirlooms.items.length === 1 && item().kind === definition.item && item().title === definition.title, "好结局只发一件正确旧物");
      check(careerProgressFor().records.successes === 1, "success 元数据计入一次成功履历");
      check(item().origin.name === state.name && item().origin.generation === 1 && item().origin.regionId === "qingping", "旧物记住本代创办者与地域");
      check(!heirloomActionState(item()).canUse && item().usedBy.includes(state.heirlooms.holderId), "创办者不重复领取成业奖励");
      const origin = JSON.stringify(item().origin);
      const completed = JSON.stringify(state);
      const specialist = ["child", "spouse"].map((who) => {
        state = normalizeState(JSON.parse(completed));
        inherit(who, careerName);
        check(JSON.stringify(item().origin) === origin && heirloomActionState(item()).canUse, `${who} 承接并保留原主，取得本人首次续用资格`);
        const holder = state.heirlooms.holderId;
        check(holder === (who === "child" ? "person:new-book-child" : "person:new-book-wife"), "持有人使用稳定人物 ID");
        const before = { money: state.stats.money, exp: careerProgressFor().exp, resource: careerProgressFor().livelihood?.resource };
        const note = heirloomActionState(item()).useNote;
        const { event, choice } = use("use");
        check(state.stats.money === before.money - definition.cost && careerProgressFor().exp === before.exp + 45, "专长续用收费并增加 45 经验");
        if (definition.kind === "farmer") {
          check(careerProgressFor().livelihood.readiness === 28 && careerProgressFor().livelihood.reputation === 14 && careerProgressFor().livelihood.resource === before.resource, "农簿增加地力与乡望，不把地力误算为仓粮");
          check(note.includes("地力 +8") && note.includes("乡望 +4"), "农簿效果提示与结算一致");
        } else {
          check(!careerProgressFor().livelihood && state.stats.knowledge === 43, "工匠只加经验与学识，没有虚构行业属性");
          check(note.includes("学识 +3") && !note.includes("门路"), "留样册没有不存在的指标提示");
        }
        const once = JSON.stringify(state.stats);
        resolveHeirloom(event, choice);
        check(JSON.stringify(state.stats) === once, "旧选择不能重放领取");
        finishEventResult();
        use("seal"); finishEventResult();
        use("unseal"); finishEventResult();
        state = normalizeState(JSON.parse(JSON.stringify(state)));
        check(!heirloomActionState(item()).canUse && item().usedBy.includes(holder), "封存启封与读档均不重置续用资格");
        return { who, cost: definition.cost, exp: careerProgressFor().exp, generation: state.lineage.generation };
      });

      state = normalizeState(JSON.parse(completed));
      inherit("child", "");
      check(state.career === null, "普通继承人不自动成为原主的职业");
      use("use");
      check(state.stats.money === 500 - definition.cost && state.stats.knowledge === 43, "普通人同样付费，学识增加 3");
      check(definition.kind === "farmer" ? state.stats.physique === 52 && state.stats.eq === 40 : state.stats.eq === 42 && state.stats.physique === 50, "两类旧物的普通人收益不同且正确");
      check(Object.keys(state.careerProgress).length === 0, "普通人不会生成职业经验或行业属性");
      finishEventResult();
      use("donate");
      check(state.stats.money === 500 - definition.cost - 25 && item().status === "donated", "转赠费用为 25 铜钱，物件永久离家");
      check(state.eventResult.text.includes(definition.kind === "farmer" ? "用水农户" : "匠作同业"), "新物件交给对应乡里受赠者");
      finishEventResult();
      inherit("spouse", careerName);
      check(!heirloomActionState(item()).canUse && item().status === "donated", "捐赠后妻子承继不能取回旧物");

      state = normalizeState(JSON.parse(completed));
      inherit("child", careerName);
      state.stats.money = definition.cost - 1;
      openHeirloom(item().id);
      check(state.currentEvent.children.find((choice) => choice.heirloomChoice === "use").disabled, "不足费用时续用选项禁用");
      state.currentEvent = null;
      state.stats.money = definition.cost;
      openHeirloom(item().id);
      state.stats.money = definition.cost - 1;
      const beforeRace = JSON.stringify(item());
      chooseOption(0);
      check(state.stats.money === definition.cost - 1 && JSON.stringify(item()) === beforeRace, "打开后资金减少也不能透支续用");
      state.currentEvent = null;
      const noMigration = JSON.parse(completed);
      delete noMigration.heirlooms;
      check(normalizeState(noMigration).heirlooms.items.length === 0, "新物件不从旧档结局擅自回填");
      return { id: definition.id, outcome: definition.outcome, item: definition.item, specialist };
    });
    return { checks, results };
  });
  assert.deepEqual(errors, []);
  assert.equal(result.results.length, 2);
  console.log(JSON.stringify(result));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
