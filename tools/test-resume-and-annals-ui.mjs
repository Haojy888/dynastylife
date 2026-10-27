import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStaticServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const errors = [];
const output = process.env.AUDIT_OUTPUT;
if (output) await fs.mkdir(output, { recursive: true });
try {
  browser = await launchBrowser();
  for (const [name, width, height] of [['mobile', 390, 844], ['small-mobile', 320, 740], ['desktop', 1440, 1000]]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width, height });
    await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      startLife();
      Object.assign(state, { name: '李续川', gender: 'male', age: 24, year: 24, lastSettledYear: 24, currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null });
      state.onboarding.seen = true;
      state.stats.money = 1000;
      state.stats.physique = 80;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      Object.assign(view, { page: 'main', tab: 'career', overlay: '', mobileSection: 'life' });
      startExam();
    });
    await page.click('[data-question="0"][data-exam-answer]');
    const selected = await page.evaluate(() => state.exam.current.questions[0].selected);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.ok(await page.$('.center-panel .question-card'), 'Refreshing an exam must display the saved paper');
    assert.equal(await page.$eval('[data-question="0"].active', node => node.dataset.examAnswer), selected);
    assert.equal(await page.$('.mobile-primary-tabs'), null, 'An unfinished exam must not be hidden behind mobile panel mode');
    const exam = await page.evaluate(() => JSON.stringify(state.exam.current));
    if (width < 761) await page.click('[data-action="toggle-tools"]');
    await page.click('[data-shortcut="menu"]');
    await page.click('[data-action="open-save-manager"]');
    assert.ok(await page.$('.save-manager-card'), 'Save management must be reachable during an exam');
    assert.ok(await page.$('.paused-life-notice'), 'A saved in-progress flow needs a direct return control');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.equal(await page.evaluate(() => JSON.stringify(state.exam.current)), exam);
    assert.ok(await page.$('.question-card'));
    const locks = await page.evaluate(() => {
      const old = JSON.stringify(state.exam.current);
      startExtraExam('poem');
      return old === JSON.stringify(state.exam.current) && !canOpenExam() && !canOpenExtraExam('poem');
    });
    assert.equal(locks, true, 'Other exams cannot replace the current paper');
    if (width === 390) {
      await page.evaluate(() => { state.exam.current = null; state.exam.lastYear = -1; state.gender = 'female'; startExtraExam('female'); });
      await page.click('[data-question="0"][data-exam-answer]');
      const femaleExam = await page.evaluate(() => JSON.stringify(state.exam.current));
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.evaluate(() => JSON.stringify(state.exam.current)), femaleExam);
      assert.ok(await page.$('.question-card'), 'Female assessment must also return to the saved paper');
      await page.evaluate(() => { state.exam.current = null; state.exam.lastYear = -1; state.exam.rank = EXAM_STAGES.length - 2; state.gender = 'male'; startExam(); });
      await page.click('[data-palace-field="theme"]');
      await page.click('[data-palace-field="style"]');
      const palace = await page.evaluate(() => JSON.stringify(state.exam.current));
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.evaluate(() => JSON.stringify(state.exam.current)), palace);
      assert.equal(await page.$$eval('.exam-picks .active', nodes => nodes.length), 2, 'Palace exam selections must survive reload');
    }
    await page.evaluate(() => { state.exam.current = null; startTravelJourney(); });
    const travel = await page.evaluate(() => { if (!state.pendingTravel) throw new Error('Travel must actually start'); return JSON.stringify(state.pendingTravel); });
    await page.evaluate(() => { view.page = 'menu'; render(); });
    await page.click('[data-action="open-save-manager"]');
    assert.ok(await page.$('.save-manager-card'), 'Travel must not block save management');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.equal(await page.evaluate(() => JSON.stringify(state.pendingTravel)), travel);
    await page.evaluate(() => { state.pendingTravel = null; finishAction('尚未读完的结果', '读档入口不会吃掉这一段结果。', []); view.page = 'menu'; render(); });
    await page.click('[data-action="open-save-manager"]');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.equal(await page.$eval('.result-card h2', node => node.textContent), '尚未读完的结果');
    await page.evaluate(() => {
      state.exam.current = null;
      state.eventResult = null;
      state.currentEvent = { title: '尚待答复的旧事', content: '这件事等你回来再议。', children: [{ title: '继续商议', conditions: [], results: [] }] };
      state.pendingAnnualEvent = { title: '年度后续', content: '后续不应丢失。', children: [] };
      view.page = 'menu'; render();
    });
    const pending = await page.evaluate(() => JSON.stringify({ event: state.currentEvent, annual: state.pendingAnnualEvent, year: state.year }));
    await page.click('[data-action="open-save-manager"]');
    assert.ok(await page.$('.save-manager-card'), 'An unresolved choice must not block backups and exports');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.equal(await page.$eval('.center-panel h2', node => node.textContent), '尚待答复的旧事');
    await page.evaluate(() => { view.page = 'menu'; render(); });
    await page.click('[data-page="annals"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2'));
    assert.equal(await page.evaluate(() => JSON.stringify({ event: state.currentEvent, annual: state.pendingAnnualEvent, year: state.year })), pending);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.evaluate(() => {
      state.currentEvent = null;
      state.pendingAnnualEvent = null;
      state.lineage.generation = 2;
      state.lineage.ancestors = normalizeLineage({ ancestors: [{ name: '李知渠', generation: 1, age: 76, career: '农户', exam: '白身', score: 1860, grade: '家业绵延', location: '清平县', era: '清宁三十二年', reason: '寿尽归乡', assets: 3, money: 2800, chapters: { completed: [{ id: 'spring-water', outcome: '一渠同春', summary: '水闸、示范田和农事簿都有可查的记录，各户终于有了能互相查验的旧约。', year: 46, routes: { commons: 4 }, history: [{ year: 43, title: '量水查契，把田亩记清' }, { year: 44, title: '共修分水闸，按册轮灌' }, { year: 45, title: '分粮教灌，把成败都记下' }, { year: 46, title: '公开分水农事簿，连过失也署名' }] }], active: { id: 'workshop-promise', stage: 1, history: [{ year: 65, title: '买料试作，封存对照样' }] } }, heirlooms: [{kind:'water-register',originName:'李知渠',status:'kept'}] }] }, '李').ancestors;
      view.page = 'annals'; render();
    });
    await page.focus('.annals-ancestors .annals-life > summary');
    await page.keyboard.press('Enter');
    await page.click('.annals-chapter > summary');
    assert.equal(await page.$eval('.annals-ancestors .annals-life', node => node.open), true, 'Family history must be readable with a keyboard');
    assert.ok(await page.$eval('.annals-unfinished', node => node.innerText.includes('未竟之卷') && node.innerText.includes('试件有裂')));
    assert.ok(await page.$eval('.annals-chapter', node => node.innerText.includes('43岁') && node.innerText.includes('一渠同春')));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: annals overflow`);
    if (output) {
      await page.evaluate(async () => { document.activeElement.blur(); window.scrollTo(0, 0); await new Promise(resolve => setTimeout(resolve, 250)); });
      await page.screenshot({ path: path.join(output, `${name}-family-annals.png`), fullPage: true });
    }
    await page.evaluate(() => { die('回看验收'); view.page = 'main'; render(); });
    await page.click('.death-card [data-page="history"]');
    assert.ok(await page.$('.history-reading'), 'The ending page must open the history on mobile');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.ok(await page.$('.death-card'));
    await page.click('.death-card [data-page="annals"]');
    assert.ok(await page.$('.family-annals'));
    assert.equal(await page.evaluate(() => state.dead), true, 'Reading the archive must not revive a protagonist');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await context.close();
    console.log(`${name}: exam refresh, management while pending, preserved queues, family archive keyboard access and ending history passed`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
