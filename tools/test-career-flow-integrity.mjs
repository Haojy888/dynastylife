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
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof startLife === "function");
  const result = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    const checks = [];
    const check = (condition, label) => {
      if (!condition) throw new Error(label);
      checks.push(label);
    };
    const reset = (id = "grain-road") => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age: 30, year: 30, lastSettledYear: 30, gender: "male", currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null, pendingAnnualEvent: null });
      state.onboarding.seen = true;
      state.stats.money = 10000;
      state.stats.physique = 95;
      state.career = allCareers().find((item) => careerKind(item) === CAREER_STORY_PACKS[id].careerKind);
      state.careerChapters = normalizeCareerChapters();
      const progress = careerProgressFor();
      if (progress.livelihood) Object.assign(progress.livelihood, { resource: 100, readiness: 80, reputation: 50, risk: 0 });
      Object.assign(view, { screen: "game", page: "main", tab: "career", overlay: "" });
    };
    const blockers = [
      ["exam", () => { state.exam.current = { type: "choice", questions: [] }; }],
      ["travel", () => { state.pendingTravel = { id: "travel-lock" }; }],
      ["caravan", () => { state.pendingCaravan = { id: "caravan-lock" }; }],
      ["activity", () => { state.pendingActivity = { id: "academy" }; }],
      ["poetry", () => { state.poetryRound = { id: "poetry-lock" }; }],
      ["surprise", () => { state.pendingSurprise = { title: "待处理奇遇" }; }],
      ["mystery", () => { state.mystery.active = { id: "mystery-lock" }; view.page = "mystery"; }],
    ];

    reset();
    startExam();
    const exam = JSON.stringify(state.exam.current);
    document.querySelector('[data-career-action="case:chapter"]').click();
    check(!state.currentEvent && !state.careerChapters.active && JSON.stringify(state.exam.current) === exam, "Exam sidebar cannot open a simultaneous career chapter");
    for (const [name, block] of blockers) {
      reset();
      block();
      const beforeStart = JSON.stringify(state);
      startOrResumeCareerChapter("grain-road");
      check(JSON.stringify(state) === beforeStart, `${name}: blocked chapter start has no side effects`);
      reset();
      startOrResumeCareerChapter("grain-road");
      const event = state.currentEvent;
      block();
      const beforeResolve = JSON.stringify(state);
      resolveCareerChapter(event, event.children[0]);
      check(JSON.stringify(state) === beforeResolve, `${name}: blocked chapter resolution has no side effects`);
    }
    reset();
    startOrResumeCareerChapter("grain-road");
    const staleEvent = state.currentEvent;
    state = normalizeState(JSON.parse(JSON.stringify(state)));
    const restoredBefore = JSON.stringify(state);
    resolveCareerChapter(staleEvent, staleEvent.children[0]);
    check(JSON.stringify(state) === restoredBefore, "A detached event from before load cannot settle the restored chapter");
    state.pendingAnnualEvent = { title: "年度后续", children: [] };
    resolveCareerChapter(state.currentEvent, state.currentEvent.children[0]);
    check(state.careerChapters.active.stage === 1 && state.pendingAnnualEvent?.title === "年度后续", "The authoritative event may resolve with a legitimate annual follow-up waiting");
    finishEventResult();
    check(state.currentEvent?.title === "年度后续", "Chapter results preserve the annual follow-up queue");

    const newStories = ["spring-water", "workshop-promise"];
    for (const id of newStories) {
      check(!!CAREER_STORY_PACKS[id], `${id}: new story is available`);
      const pack = CAREER_STORY_PACKS[id];
      for (let stage = 0; stage < pack.stages.length; stage += 1) {
        reset(id);
        state.stats.money = 0;
        if (careerProgressFor().livelihood) careerProgressFor().livelihood.resource = 0;
        state.careerChapters.active = createCareerChapter(id);
        state.careerChapters.active.stage = stage;
        state.currentEvent = buildCareerChapterEvent();
        const index = state.currentEvent.children.findIndex((item) => !item.disabled);
        check(index >= 0, `${id}/${stage}: zero money and stock retain a choice`);
        chooseOption(index);
        check(!state.currentEvent && (state.careerChapters.active?.stage === stage + 1 || state.careerChapters.completed.length === 1), `${id}/${stage}: the zero-resource choice actually resolves`);
      }
    }

    const random = Math.random;
    const journeys = [];
    try {
      Math.random = () => 0.95;
      for (const id of newStories) {
        reset(id);
        startOrResumeCareerChapter(id);
        let finalEvent;
        let finalChoice;
        const advanceToChapter = () => {
          for (let turn = 0; turn < 25; turn += 1) {
            if (state.eventResult) finishEventResult();
            else if (state.currentEvent?.chapterId === id) return;
            else if (state.currentEvent) {
              const choice = viableChildren(state.currentEvent).find(({ child }) => !child.disabled);
              if (choice) chooseOption(choice.index); else finishEvent();
            } else throw new Error(`${id}: due chapter disappeared after an elapsed year`);
          }
          throw new Error(`${id}: annual queue did not drain`);
        };
        for (let stage = 0; stage < 4; stage += 1) {
          check(state.currentEvent?.chapterId === id && state.currentEvent.stageIndex === stage, `${id}: correct stage ${stage} resumes`);
          finalEvent = state.currentEvent;
          finalChoice = finalEvent.children.find((item) => !item.disabled);
          chooseOption(finalEvent.children.indexOf(finalChoice));
          const afterChoice = JSON.stringify(state);
          resolveCareerChapter(finalEvent, finalChoice);
          check(JSON.stringify(state) === afterChoice, `${id}/${stage}: previous choice cannot replay`);
          if (stage === 3) break;
          finishEventResult();
          startOrResumeCareerChapter(id);
          check(!state.currentEvent && state.eventResult?.title.includes("来年待续"), `${id}/${stage}: cannot advance twice in one year`);
          finishEventResult();
          if (stage === 0) {
            const beforeTripYear = state.year;
            const beforeTripStage = state.careerChapters.active.stage;
            startTravelJourney();
            const duringTrip = JSON.stringify(state);
            startOrResumeCareerChapter(id);
            check(JSON.stringify(state) === duringTrip, `${id}: travel and chapter cannot overlap`);
            while (state.pendingTravel.index < state.pendingTravel.events.length) resolveTravelChoice(0);
            completeTravelActivity("landmark");
            finishEventResult();
            check(state.year === beforeTripYear && state.careerChapters.active.stage === beforeTripStage, `${id}: travel does not accelerate the chapter year`);
          }
          prepareExam();
          check(state.year === 31 + stage, `${id}: study advances exactly one year`);
          advanceToChapter();
        }
        const completed = state.careerChapters.completed[0];
        check(completed?.history.length === 4 && state.careerChapters.completed.length === 1, `${id}: one complete four-stage record`);
        check(JSON.stringify(completed.history.map((item) => item.year)) === JSON.stringify([30, 31, 32, 33]), `${id}: four stages span exactly three elapsed years`);
        const payoutCount = () => state.ledger.filter((entry) => entry.title === `${CAREER_STORY_PACKS[id].title} · 结算`).length;
        const payoutBefore = payoutCount();
        finishEventResult();
        startOrResumeCareerChapter(id);
        check(!state.careerChapters.active && payoutCount() === payoutBefore, `${id}: completion cannot restart its payout`);
        const formerCareer = state.career.name;
        state.family.children = [normalizeChild({ id: `heir-${id}`, name: "李续章", gender: "male", age: 20, physique: 80, alive: true, occupation: formerCareer }, "李")];
        die("审计身故");
        const afterDeath = JSON.stringify(state);
        resolveCareerChapter(finalEvent, finalChoice);
        check(JSON.stringify(state) === afterDeath, `${id}: death prevents old ending settlement`);
        state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
        inheritFromChild(`heir-${id}`);
        check(!state.dead && !state.careerChapters.active && !state.careerChapters.completed.length, `${id}: inheritance starts a new personal chapter history`);
        const inherited = JSON.stringify(state);
        resolveCareerChapter(finalEvent, finalChoice);
        check(JSON.stringify(state) === inherited, `${id}: an ancestor's event cannot settle in the heir's life`);
        const heirloomsBefore = state.heirlooms.items.length;
        startOrResumeCareerChapter(id);
        check(state.careerChapters.active?.stage === 0 && state.heirlooms.items.length === heirloomsBefore && payoutCount() === payoutBefore, `${id}: heir starts at stage zero without a duplicate ending reward`);
        journeys.push({ id, outcome: completed.outcome, years: completed.history.map((item) => item.year), inheritedHeirlooms: heirloomsBefore });
      }
    } finally { Math.random = random; }
    return { count: checks.length, journeys };
  });
  assert.deepEqual(errors, []);
  assert.equal(result.journeys.length, 2);
  console.log(`career flow integrity passed: ${result.count} checks; exam/travel locks, resource fallbacks, three-year study progression, no replay and inheritance`);
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
