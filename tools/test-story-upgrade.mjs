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
  const result = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    const reset = () => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age: 12, year: 12, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingAchievement: null });
      state.stats.money = 500;
      state.stats.physique = 90;
      Object.assign(view, { screen: "game", page: "main", tab: "history", overlay: "" });
    };
    const meeting = (decision) => {
      const event = annualScholarStoryEvent();
      state.currentEvent = event;
      chooseOption(event.children.findIndex((choice) => choice.scholarChoice === decision));
      return { person: npcById(event.npcId), thread: state.threads.find((item) => item.sourceId === "scholar-study") };
    };
    const reunion = () => {
      state.eventResult = null;
      state.year += 3;
      state.age += 3;
      state.currentEvent = annualThreadEvent();
      return state.currentEvent;
    };

    reset();
    addLog("公正", "你让借钱的人还了钱，主持了公道");
    addLog("婉拒", "你未曾答应借款，也没有作出承诺");
    const noFalseCauses = state.threads.length === 0;
    const a = normalizeFriend({ id: "friend-a", name: "周一", age: 25, alive: true, physique: 80 });
    const b = normalizeFriend({ id: "friend-b", name: "周二", age: 25, alive: true, physique: 80 });
    state.friends.push(a, b);
    interactRelation(a.id, "borrow");
    const amountA = state.threads.find((item) => item.targetId === a.id)?.stakes;
    interactRelation(b.id, "borrow");
    interactRelation(a.id, "borrow");
    const debts = state.threads.filter((item) => item.sourceId === "relation-borrow");
    const borrow = { count: debts.length, targets: debts.map((item) => item.targetId).sort(), aggregate: debts.find((item) => item.targetId === a.id)?.stakes > amountA, noReverseDebt: a.debt === 0 && b.debt === 0 };
    state.year = debts[0].dueYear;
    state.stats.money = 2000;
    const previousMoney = state.stats.money;
    state.currentEvent = annualThreadEvent();
    const dueDebt = state.threads.find((item) => item.id === state.currentEvent.threadId);
    const creditor = npcById(dueDebt.targetId);
    const previousAffection = creditor.affection;
    chooseOption(0);
    borrow.repaid = previousMoney - state.stats.money === dueDebt.stakes;
    borrow.remembered = creditor.affection > previousAffection && creditor.memories.some((item) => item.type === "旧事了结");
    const remainingDebt = state.threads.find((item) => item.sourceId === "relation-borrow" && item.status === "active");
    state.currentEvent = annualThreadEvent();
    chooseOption(1);
    borrow.deferred = remainingDebt.status === "active" && remainingDebt.dueYear === state.year + 1;

    reset();
    state.friends = [a, b];
    state.currentEvent = cloneEvent({ content: "{0}递给{1}一封信，{0}又叫住{1}。", children: [{ title: "回信", content: "{0}与{0}同席", results: [], children: [] }] });
    const initialNames = fillPlaceholders(state.currentEvent.content, false);
    state.friends.reverse();
    const stableNames = fillPlaceholders(state.currentEvent.content, false);
    chooseOption(0);
    const placeholders = { initialNames, stableNames, result: state.eventResult.text };

    reset();
    const funded = meeting("fund");
    const fundedAtStart = { money: state.stats.money, targetId: funded.thread.targetId, personId: funded.person.id, choice: funded.thread.choiceId, debt: state.threads.some((item) => item.kind === "debt") };
    state = normalizeState(JSON.parse(JSON.stringify(state)));
    const returnEvent = reunion();
    const fundingBranches = returnEvent.children.map((item) => item.scholarChoice);
    const cashBeforeAid = state.stats.money;
    chooseOption(returnEvent.children.findIndex((item) => item.scholarChoice === "aid"));
    const fundedEnd = { gain: state.stats.money - cashBeforeAid, status: state.threads[0].status, trace: historyPanel().includes("资助束脩") && historyPanel().includes("往事回响"), memory: npcById(fundedAtStart.personId).memories.some((item) => item.type === "旧书回响") };
    fundedEnd.historyInherited = carryThreadsAcrossInheritance(state.threads, 18, state.name).some((item) => item.sourceId === "scholar-study" && item.status === "resolved");
    const afterAid = state.stats.money;
    resolveScholarStory(returnEvent, returnEvent.children[0]);
    fundedEnd.once = afterAid === state.stats.money;

    reset();
    state.stats.money = 0;
    const copied = meeting("copy");
    const copyEvent = reunion();
    const beforeStudy = state.stats.knowledge;
    chooseOption(copyEvent.children.findIndex((item) => item.scholarChoice === "study"));
    const copy = { source: copied.thread.choiceId, gain: state.stats.knowledge - beforeStudy, prep: state.study.prep, money: state.stats.money };

    reset();
    meeting("decline");
    const declined = reunion();
    const decline = { branches: declined.children.map((item) => item.scholarChoice) };
    const beforeDecline = state.stats.money;
    chooseOption(0);
    decline.noReward = state.stats.money === beforeDecline;

    reset();
    const estranged = meeting("fund");
    estranged.person.affection = 10;
    const estrangement = reunion().children.map((item) => item.scholarChoice);

    reset();
    const deceased = meeting("fund");
    deceased.person.alive = false;
    deceased.person.physique = 0;
    const deadEvent = reunion();
    const beforeDeath = state.stats.money;
    chooseOption(0);
    const death = { branches: deadEvent.children.map((item) => item.scholarChoice), noReward: state.stats.money === beforeDeath, stillDead: npcById(deceased.person.id, true).alive === false, book: state.inventory.includes("故人批注的旧书") };

    reset();
    const inherited = meeting("fund");
    state.year = 80;
    state.age = 80;
    inherited.thread.createdYear = 79;
    inherited.thread.dueYear = 82;
    const heir = normalizeChild({ id: "heir", name: "李承业", gender: "male", age: 40, alive: true, physique: 80, occupation: "木匠", ambition: "读书进身", careerStage: 3 }, "李");
    state.family.children = [heir];
    state.dead = true;
    state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
    inheritFromChild(heir.id);
    const inheritance = { remaining: state.threads[0].dueYear - state.year, contact: !!npcById(inherited.person.id), career: state.career?.name, originalWish: state.biography.includes("读书进身"), inventedAmbition: !!state.ambition };
    state.year = state.threads[0].dueYear;
    state.currentEvent = annualThreadEvent();
    inheritance.text = state.currentEvent.content.includes("先人");
    const inheritedBeforeAid = state.stats.money;
    chooseOption(0);
    inheritance.gain = state.stats.money - inheritedBeforeAid;
    const preserved = normalizeThreads([{ kind: "promise", title: "旧存档托付", dueYear: 82, status: "active" }])[0];
    const legacy = { title: preserved.title, targetId: preserved.targetId, sourceId: preserved.sourceId };

    reset();
    const widowStory = meeting("copy");
    state.age = 60;
    state.year = 90;
    widowStory.thread.dueYear = 93;
    state.dead = true;
    const widow = normalizePartner({ id: "widow", name: "王晚晴", gender: "female", age: 55, alive: true, physique: 75, occupation: "绣娘", ambition: "求安稳" }, "王", "妻子", "spouse");
    state.family.spouse = widow.name;
    state.family.spouseMeta = widow;
    inheritFromChild("spouse-heir");
    const spouseInheritance = { remaining: state.threads[0].dueYear - state.year, contact: !!npcById(widowStory.person.id), career: state.career?.name };

    const creditorInheritance = ["child", "spouse"].map((kind) => {
      reset();
      state.age = 60;
      state.year = 60;
      const creditor = kind === "child"
        ? normalizeChild({ id: "creditor-child", name: "李承信", gender: "male", age: 30, alive: true, physique: 80 }, "李")
        : normalizeFriend({ id: "creditor-spouse", name: "王知秋", gender: "female", age: 45, alive: true, physique: 80 });
      if (kind === "child") state.family.children = [creditor];
      else state.friends.push(creditor);
      interactRelation(creditor.id, "borrow");
      const outsider = normalizeFriend({ id: "outside-creditor", name: "许明远", age: 45, physique: 80, alive: true });
      state.friends.push(outsider);
      interactRelation(outsider.id, "borrow");
      if (kind === "spouse") {
        state.family.spouse = creditor.name;
        state.family.spouseMeta = normalizePartner(creditor, "王", "妻子", "spouse");
        state.friends = state.friends.filter((item) => item.id !== creditor.id);
      }
      const expectedCash = Math.max(20, Math.round(state.stats.money * (kind === "spouse" ? 0.88 : 0.78)));
      state.dead = true;
      state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
      inheritFromChild(kind === "spouse" ? "spouse-heir" : creditor.id);
      const selfDebt = state.threads.find((item) => item.targetId === creditor.id);
      const beforeAttempt = state.stats.money;
      resolveFateThread({ threadId: selfDebt.id }, { threadChoice: "honor" });
      return { kind, settled: selfDebt.status === "resolved" && selfDebt.outcome === "债权债务抵消", noDeduction: state.stats.money === expectedCash && state.stats.money === beforeAttempt, otherDebtActive: state.threads.some((item) => item.targetId === outsider.id && item.status === "active"), recorded: state.log.some((item) => item.title.includes("债权债务抵消")) };
    });

    reset();
    state.currentEvent = annualScholarStoryEvent();
    save();
    render();
    return { noFalseCauses, borrow, placeholders, fundedAtStart, fundingBranches, fundedEnd, copy, decline, estrangement, death, inheritance, legacy, spouseInheritance, creditorInheritance };
  });

  assert.equal(result.noFalseCauses, true, "日志叙述不应凭空创造债务或承诺");
  assert.deepEqual(result.borrow, { count: 2, targets: ["friend-a", "friend-b"], aggregate: true, noReverseDebt: true, repaid: true, remembered: true, deferred: true });
  assert.deepEqual(result.placeholders, { initialNames: "周一递给周二一封信，周一又叫住周二。", stableNames: "周一递给周二一封信，周一又叫住周二。", result: "周一与周一同席" });
  assert.equal(result.fundedAtStart.money, 460);
  assert.equal(result.fundedAtStart.targetId, result.fundedAtStart.personId);
  assert.equal(result.fundedAtStart.choice, "fund");
  assert.equal(result.fundedAtStart.debt, false);
  assert.deepEqual(result.fundingBranches, ["aid", "study", "reconnect"]);
  assert.deepEqual(result.fundedEnd, { gain: 100, status: "resolved", trace: true, memory: true, historyInherited: true, once: true });
  assert.deepEqual(result.copy, { source: "copy", gain: 8, prep: 6, money: 0 });
  assert.deepEqual(result.decline, { branches: ["reconcile", "part"], noReward: true });
  assert.deepEqual(result.estrangement, ["reconcile", "part"]);
  assert.deepEqual(result.death, { branches: ["remember"], noReward: true, stillDead: true, book: true });
  assert.deepEqual(result.inheritance, { remaining: 2, contact: true, career: "木匠", originalWish: true, inventedAmbition: false, text: true, gain: 100 });
  assert.deepEqual(result.legacy, { title: "旧存档托付", targetId: "", sourceId: "" });
  assert.deepEqual(result.spouseInheritance, { remaining: 3, contact: true, career: "绣娘" });
  assert.deepEqual(result.creditorInheritance, ["child", "spouse"].map((kind) => ({ kind, settled: true, noDeduction: true, otherDebtActive: true, recorded: true })), "继承人本人的债权应抵消，其他债权人仍保留债务");

  const scholarPresentation = await page.evaluate(() => ({
    notes: [...document.querySelectorAll("[data-choice] small")].map((element) => element.textContent),
    studyArt: document.querySelector('.event-scene img')?.getAttribute("src") === "assets/event-study.webp",
  }));
  assert.ok(scholarPresentation.notes.some((note) => note.includes("40")), "资助选项应显示实际费用");
  assert.ok(scholarPresentation.notes.some((note) => note.includes("学识 +2") && note.includes("心情 -2")), "抄书选项应显示属性收益与代价");
  assert.equal(scholarPresentation.studyArt, true, "书生故事应显示求学插画");

  await page.click('[data-choice="0"]');
  const savedStory = await page.evaluate(() => ({ target: state.threads[0].targetId, choice: state.threads[0].choiceId }));
  await page.reload({ waitUntil: "domcontentloaded" });
  const restored = await page.evaluate(() => ({ target: state.threads[0].targetId, choice: state.threads[0].choiceId, person: !!npcById(state.threads[0].targetId) }));
  assert.deepEqual(restored, { ...savedStory, person: true }, "具名故事应能通过真实保存和刷新恢复");
  assert.deepEqual(errors, [], "故事流程不应产生浏览器异常");
  console.log("story upgrade: causality, loans, stable names, three story routes, estrangement, death, inheritance, old saves and reload passed");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
