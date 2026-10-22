import assert from 'node:assert/strict';
import { createStaticServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => {
    startLife();
    const baseline = JSON.stringify(state);
    const definitions = [
      { id: 'spring-water', kind: 'farmer', item: 'water-register', goal: 'water-promise', good: ['一渠同春', '轮水守约'], endings: ['一渠同春', '轮水守约', '渠成田裂', '补缺还田', '守田待春'] },
      { id: 'workshop-promise', kind: 'craft', item: 'craft-pattern', goal: 'craft-promise', good: ['百工传式', '一诺成器'], endings: ['百工传式', '一诺成器', '招牌空响', '拆旧重作', '小坊守成'] },
    ];
    let checks = 0;
    const check = (condition, label) => { checks += 1; if (!condition) throw new Error(label); };
    const reset = definition => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age: 30, year: 30, lastSettledYear: 30, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      Object.assign(state.stats, { money: 5000, physique: 95, knowledge: 70 });
      state.onboarding.seen = true;
      state.career = allCareers().find(career => careerKind(career) === definition.kind);
      const progress = careerProgressFor();
      if (progress.livelihood) Object.assign(progress.livelihood, { resource: 100, readiness: 20, reputation: 20, risk: 20 });
      Object.assign(view, { screen: 'game', page: 'main', tab: 'career', overlay: '' });
      startOrResumeCareerChapter(definition.id);
    };
    check(validateStoryContent().length === 0, '所有长卷数据应满足内容契约');
    const explored = definitions.map(definition => {
      const outcomes = new Set();
      let playable = 0;
      for (let route = 0; route < 81; route += 1) {
        reset(definition);
        const choices = [0, 1, 2, 3].map(index => Math.floor(route / 3 ** index) % 3);
        let completed = true;
        for (let stage = 0; stage < 4; stage += 1) {
          const event = state.currentEvent;
          const choice = event.children[choices[stage]];
          if (choice.disabled) { completed = false; break; }
          const before = state.stats.money;
          const grain = careerProgressFor().livelihood?.resource;
          chooseOption(choices[stage]);
          check(state.stats.money >= 0, `${definition.id}: 不得透支铜钱`);
          const outcome = state.careerChapters.completed[0];
          const ending = outcome && CAREER_STORY_PACKS[definition.id].endings.find(item => item.title === outcome.outcome);
          check(state.stats.money === before - (choice.cost || 0) + (choice.gain || 0) + (ending?.money || 0), `${definition.id}: 每次选择和结局必须按实际费用结算`);
          if (definition.kind === 'farmer') check(careerProgressFor().livelihood.resource === clamp(grain + (choice.livelihood?.resource || 0) + (ending?.livelihood?.resource || 0)), '农事选择必须真实扣除仓粮');
          const after = JSON.stringify(state);
          resolveCareerChapter(event, choice);
          check(JSON.stringify(state) === after, '旧幕不能重放');
          if (stage < 3) {
            state.eventResult = null;
            state.year = state.age = state.careerChapters.active.dueYear;
            state.currentEvent = annualCareerChapterEvent();
          }
        }
        if (!completed) continue;
        playable += 1;
        const record = state.careerChapters.completed[0];
        outcomes.add(record.outcome);
        check(record.history.length === 4 && record.history.every((entry, index) => entry.year === 30 + index), '完整路线必须保留四幕与实际年份');
        const successful = definition.good.includes(record.outcome);
        check(state.heirlooms.items.length === (successful ? 1 : 0), '只有对应好结局发放新家传物');
        check(state.life.goals.includes(definition.goal) === successful, '新成就仅匹配对应的好结局');
        check(careerProgressFor().records.successes === (successful ? 1 : 0), '成功履历按结局元数据计算');
        if (successful) check(state.heirlooms.items[0].kind === definition.item, '家传物类型与营生一致');
        state.currentEvent = null;
        state.eventResult = null;
        const cash = state.stats.money;
        startOrResumeCareerChapter(definition.id);
        check(!state.careerChapters.active && state.stats.money === cash, '完结故事不能重新领取报酬');
      }
      check(definition.endings.every(outcome => outcomes.has(outcome)), `${definition.id}: 五种结局均需真实可达`);

      reset(definition);
      const originalEvent = state.currentEvent;
      const originalState = JSON.stringify(state.careerChapters);
      state.stats.money = 0;
      resolveCareerChapter(originalEvent, originalEvent.children[0]);
      check(JSON.stringify(state.careerChapters) === originalState && state.stats.money === 0, '显示选择后资金不足也不能透支推进');
      state.stats.money = 5000;
      chooseOption(0);
      finishEventResult();
      const year = state.year;
      startOrResumeCareerChapter(definition.id);
      check(!state.currentEvent && state.eventResult.title.includes('来年待续') && state.year === year, '同年提前续写只显示等待说明');
      finishEventResult();
      const actor = npcById(state.careerChapters.active.actorId, true);
      actor.alive = false;
      actor.physique = 0;
      state.year = state.age = state.careerChapters.active.dueYear;
      state.currentEvent = annualCareerChapterEvent();
      check(state.currentEvent.content.includes('接手的同业') && npcById(actor.id, true).alive === false, '具名同业身故后不能复活，应由后来同业接手');
      state.currentEvent = null;
      performCareerAction('resign');
      check(!state.careerChapters.active && state.careerChapters.completed[0].outcome === '转业中断' && !state.heirlooms.items.length, '辞去本业后记录中断，不发结局物件');
      return { id: definition.id, theoreticalPaths: 81, playablePaths: playable, outcomes: [...outcomes] };
    });
    reset(definitions[0]);
    chooseOption(0);
    finishEventResult();
    save();
    return { checks, explored, name: state.name };
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.deepEqual(await page.evaluate(() => ({ id: state.careerChapters.active.id, stage: state.careerChapters.active.stage, history: state.careerChapters.active.history.length, money: state.stats.money, name: state.name })), { id: 'spring-water', stage: 1, history: 1, money: 4940, name: result.name }, '真实刷新保留新故事进度与已经支付的费用');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ...result, reload: true }));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
