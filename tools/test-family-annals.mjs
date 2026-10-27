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
    Object.assign(state, { name: '李知渠', gender: 'male', age: 30, year: 30, lastSettledYear: 30, currentEvent: null, eventResult: null, pendingAchievement: null, pendingSurprise: null });
    state.onboarding.seen = true;
    Object.assign(state.stats, { money: 5000, physique: 90, knowledge: 80 });
    Object.assign(view, { page: 'main', tab: 'career', overlay: '' });
    state.career = allCareers().find(career => careerKind(career) === 'farmer');
    Object.assign(careerProgressFor().livelihood, { resource: 80, readiness: 80 });
    startOrResumeCareerChapter('spring-water');
    for (const choice of ['survey-channel', 'shared-weir', 'teach-water', 'public-register']) {
      chooseOption(state.currentEvent.children.findIndex(entry => entry.id === choice));
      finishEventResult();
      if (state.careerChapters.active) {
        state.year = state.age = state.careerChapters.active.dueYear;
        state.currentEvent = annualCareerChapterEvent();
      }
    }
    if (state.careerChapters.completed[0]?.outcome !== '一渠同春') throw new Error('Archive fixture must come from a real story ending');
    state.pendingAchievement = null;
    performCareerAction('resign');
    finishEventResult();
    state.career = allCareers().find(career => careerKind(career) === 'craft');
    startOrResumeCareerChapter('workshop-promise');
    chooseOption(0);
    finishEventResult();
    state.pendingAchievement = null;
    const beforeRead = { money: state.stats.money, age: state.age, chapters: JSON.stringify(state.careerChapters), holder: state.heirlooms.holderId };
    currentLifeRecord();
    familyAnnalsView();
    const readOnly = beforeRead.money === state.stats.money && beforeRead.age === state.age && beforeRead.chapters === JSON.stringify(state.careerChapters);
    die('家史验收');
    state.legacy = { funeral: 'simple', dispute: 'none', inheritanceRate: 0.78 };
    const parent = JSON.stringify(state);
    const parentRecord = currentLifeRecord();
    state.family.children = [normalizeChild({ id: 'annals-child', name: '李知渠', gender: 'male', age: 20, physique: 80, alive: true, occupation: '木匠' }, '李')];
    inheritFromChild('annals-child');
    const first = state.lineage.ancestors[0];
    const child = {
      generation: state.lineage.generation, count: state.lineage.ancestors.length,
      original: first.name, distinct: first.personId !== state.heirlooms.holderId,
      completed: first.chapters.completed[0].outcome,
      choices: first.chapters.completed[0].history.length,
      unfinished: first.chapters.active.id, unfinishedStage: first.chapters.active.stage,
      unfinishedChoices: first.chapters.active.history.length,
      item: first.heirlooms[0].title, originalGeneration: first.generation,
      emptyNewHistory: !state.careerChapters.active && !state.careerChapters.completed.length,
    };
    const originalArchive = JSON.stringify(first);
    state.age += 1;
    state.year += 1;
    state.careerChapters.completed.push({ id: 'grain-road', outcome: '后人自己的选择', year: state.year, routes: {}, history: [] });
    state.heirlooms.items[0].status = 'donated';
    const independent = JSON.stringify(first) === originalArchive;
    const childLife = JSON.stringify(state);

    state = normalizeState(JSON.parse(parent));
    state.family.children = [normalizeChild({ id: 'annals-son', name: '李中川', gender: 'male', age: 50, physique: 80, alive: true, grandchildren: [{ id: 'annals-grandchild', name: '李远川', gender: 'male', age: 20, physique: 80, alive: true }] }, '李')];
    inheritFromChild('annals-grandchild');
    const grandchild = { generation: state.lineage.generation, originalGeneration: state.lineage.ancestors[0].generation, completed: state.lineage.ancestors[0].chapters.completed[0].outcome };

    state = normalizeState(JSON.parse(parent));
    state.family.spouse = '王知秋';
    state.family.spouseMeta = normalizePartner({ id: 'annals-wife', name: '王知秋', gender: 'female', age: 31, physique: 80, alive: true, occupation: '医者' }, '王', '妻子', 'spouse');
    inheritFromChild('spouse-heir');
    const spouse = { generation: state.lineage.generation, previousGeneration: state.lineage.ancestors[0].generation, previousName: state.lineage.ancestors[0].name, name: state.name, completed: state.lineage.ancestors[0].chapters.completed[0].outcome };
    state.family.children = [normalizeChild({ id: 'wife-child', name: '李续川', gender: 'male', age: 18, alive: true, physique: 80 }, '李')];
    die('继承验收');
    state.legacy = { funeral: 'simple', dispute: 'none', inheritanceRate: 0.78 };
    inheritFromChild('wife-child');
    const successive = state.lineage.ancestors.map(entry => ({ name: entry.name, generation: entry.generation, personId: entry.personId }));

    const old = normalizeLineage({ generation: 3, ancestors: [null, 'invalid', { name: '李旧年', age: 83, score: 20, exam: '秀才', assets: 2 }] }, '李');
    const legacy = { count: old.ancestors.length, generation: old.ancestors[0].generation, chapters: old.ancestors[0].chapters, age: old.ancestors[0].age, name: old.ancestors[0].name };
    const bounded = normalizeLineage({ ancestors: Array.from({ length: 18 }, (_, i) => ({ name: `李${i}`, age: 70 })) }, '李').ancestors.length;
    const imported = normalizeLineage({ ancestors: [{ name: '李实录', chapters: { active: { id: 'constructor' }, completed: [{ id: '__proto__' }, { id: 'toString' }, { id: 'grain-road', outcome: '<img src=x onerror="window.annalsInjection=true">', history: [{ title: '<img src=x onerror="window.annalsInjection=true">', year: 20 }] }] } }] }, '李').ancestors[0];
    const filtered = imported.chapters.active === null && imported.chapters.completed.length === 1;
    state = normalizeState(JSON.parse(childLife));
    state.lineage.ancestors.push(imported);
    Object.assign(view, { page: 'annals', tab: 'history', overlay: '' });
    render();
    document.querySelectorAll('.annals-life,.annals-chapter').forEach(node => { node.open = true; });
    const noInjection = !window.annalsInjection && !document.querySelector('.annals-chapter img');
    save();
    return { readOnly, child, grandchild, independent, spouse, successive, legacy, bounded, filtered, noInjection, originalArchive, parentSnapshot: parentRecord.name };
  });
  assert.equal(result.readOnly, true);
  assert.deepEqual(result.child, { generation: 2, count: 1, original: '李知渠', distinct: true, completed: '一渠同春', choices: 4, unfinished: 'workshop-promise', unfinishedStage: 1, unfinishedChoices: 1, item: '分水农事簿', originalGeneration: 1, emptyNewHistory: true });
  assert.equal(result.independent, true, 'An heir must not mutate the former protagonist’s snapshot');
  assert.deepEqual(result.grandchild, { generation: 3, originalGeneration: 1, completed: '一渠同春' });
  assert.deepEqual(result.spouse, { generation: 1, previousGeneration: 1, previousName: '李知渠', name: '王知秋', completed: '一渠同春' });
  assert.deepEqual(result.successive.map(({name,generation}) => ({name,generation})), [{ name: '王知秋', generation: 1 }, { name: '李知渠', generation: 1 }]);
  assert.notEqual(result.successive[0].personId, result.successive[1].personId);
  assert.deepEqual(result.legacy, { count: 1, generation: null, chapters: null, age: 83, name: '李旧年' });
  assert.equal(result.bounded, 12);
  assert.equal(result.filtered, true);
  assert.equal(result.noInjection, true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.evaluate(() => JSON.stringify(state.lineage.ancestors[0])), result.originalArchive, 'A real reload must preserve the archived story and unfinished choices');
  assert.deepEqual(errors, []);
  console.log('family annals passed: real ending, unfinished chapter, independent snapshots, child/spouse succession, old saves, limits, HTML safety and reload');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
