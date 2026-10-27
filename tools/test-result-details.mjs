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
    await page.goto(process.env.TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      startLife();
      Object.assign(state, { age: 24, year: 24, lastSettledYear: 24, currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null });
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      Object.assign(view, { page: 'main', tab: 'career', mobileSection: 'life', overlay: '' });
      state.career = allCareers().find(career => careerKind(career) === 'farmer');
      const progress = careerProgressFor();
      progress.livelihood.risk = 40;
      const deltas = [];
      changeLivelihoodMetric(progress, 'risk', -8, deltas);
      changeLivelihoodMetric(progress, 'risk', 5, deltas);
      deltas.push({ label: '钱财', value: -120, stat: 'money' });
      deltas.push(...Array.from({ length: 7 }, (_, index) => ({ label: `余项${index + 1}`, value: index + 1 })));
      deltas.push({ label: '记录', value: '<img src=x onerror=alert(1)>' });
      finishAction('修渠归来', '水闸修好了，旧账也一笔笔记清。风险下降与钱财消耗，分别列明。', deltas, 'Agriculture');
    });
    await page.waitForFunction(() => document.activeElement.matches('.result-card h2'));
    assert.equal(await page.$eval('.result-card .delta', node => node.classList.contains('good')), true, 'Reducing actual livelihood risk is beneficial');
    assert.equal(await page.$eval('.result-card .delta:nth-child(2)', node => node.classList.contains('bad')), true, 'Increasing livelihood risk is harmful even with a positive number');
    assert.equal(await page.$eval('.result-card .delta:nth-child(3)', node => node.classList.contains('bad')), true, 'Legacy money losses still use the fallback sign');
    assert.equal(await page.$$eval('.result-card .result-changes > .delta-list > .delta', nodes => nodes.length), 8);
    assert.equal(await page.$$eval('.result-more-changes .delta', nodes => nodes.length), 3);
    const snapshot = await page.evaluate(() => JSON.stringify(state.eventResult.deltas));
    await page.evaluate(() => nextYear());
    assert.equal(await page.evaluate(() => state.year), 24);
    assert.equal(await page.evaluate(() => JSON.stringify(state.eventResult.deltas)), snapshot);
    assert.equal(await page.$eval('.result-card .delta', node => node.textContent.includes('-8')), true, 'A blocked next-year action must not overwrite the displayed result');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.activeElement.matches('.result-card h2'));
    assert.equal(await page.evaluate(() => JSON.stringify(state.eventResult.deltas)), snapshot);
    await page.focus('.result-more-changes > summary');
    await page.keyboard.press('Enter');
    assert.equal(await page.$eval('.result-more-changes', node => node.open), true);
    assert.equal(await page.$('.result-more-changes img'), null, 'Text changes must remain escaped');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: long result details overflow`);
    if (output) {
      await page.evaluate(async () => { document.activeElement.blur(); window.scrollTo(0, 0); await new Promise(resolve => setTimeout(resolve, 250)); });
      await page.screenshot({ path: path.join(output, `${name}-result-details.png`), fullPage: true });
    }
    await page.evaluate(() => { view.mobileSection = 'panel'; });
    await page.click('[data-action="finish-result"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2, .detail-panel h2'));
    assert.ok(await page.evaluate(() => document.activeElement.getClientRects().length), 'Closing a result must focus the panel actually shown on mobile');
    await page.evaluate(() => {
      state.currentEvent = {
        title: '长信中的抉择', content: '灯下读信，旧事一行行浮现。\n'.repeat(45),
        children: [{ title: '翻到信尾', content: '信尾还有一问。', children: [{ title: '认真答复', content: '回信已经送出。', results: [], conditions: [] }], conditions: [], results: [] }],
      };
      render();
    });
    await page.waitForFunction(() => document.activeElement.matches('.event-card h2'));
    await page.click('[data-choice="0"]');
    await page.waitForFunction(() => document.activeElement.matches('.event-card h2') && document.activeElement.textContent === '翻到信尾');
    assert.ok(await page.$eval('.event-card h2', node => node.getBoundingClientRect().top >= 0 && node.getBoundingClientRect().bottom < innerHeight), 'Nested choices must return to the new text');
    await page.click('[data-choice="0"]');
    await page.waitForFunction(() => document.activeElement.matches('.result-card h2'));
    assert.equal(await page.$eval('.result-no-changes', node => node.textContent), '本次没有即时数值变化。');
    assert.equal(await page.$$('.result-card .delta').then(nodes => nodes.length), 0);
    await page.evaluate(() => { state.pendingAnnualEvent = { title: '流年后续', content: '还有一件事要接着处理。', children: [] }; });
    await page.click('[data-action="finish-result"]');
    await page.waitForFunction(() => document.activeElement.matches('.event-card h2') && document.activeElement.textContent === '流年后续');
    await page.click('[data-action="finish-event"]');
    await page.evaluate(() => {
      state.lastDeltas = [{ label: '旧变化', value: 99 }];
      state.pendingActivity = { id: 'academy', deltas: [{ label: '温课', value: 3 }] };
      state.currentEvent = { title: '课后闲谈', children: [{ title: '听完再走', content: '学堂散了。', conditions: [], results: [] }] };
      render();
    });
    await page.click('[data-choice="0"]');
    assert.deepEqual(await page.evaluate(() => state.eventResult.deltas), [{ label: '温课', value: 3 }], 'Activity effects must remain included in the saved result');
    await page.evaluate(() => {
      state.pendingActivity = null;
      state.eventResult = { title: '只是听闻', text: '此事没有改变眼下的数值。', deltas: [] };
      state.lastDeltas = [{ label: '旧变化', value: 99 }];
      render();
    });
    assert.equal(await page.$$('.result-card .delta').then(nodes => nodes.length), 0, 'An explicit empty result must not borrow stale deltas');
    assert.ok(await page.$eval('.result-explainer', node => node.textContent.includes('没有结算即时的数值变化')));
    await page.click('[data-overlay="profile"]');
    await page.evaluate(() => finishAction('弹窗后再读', '新结果出现时，仍先留在正在使用的弹窗。', []));
    await page.waitForFunction(() => document.activeElement.closest('dialog[open]'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.activeElement.matches('.result-card h2') && document.activeElement.textContent === '弹窗后再读');
    await page.evaluate(() => {
      state.eventResult = null;
      state.currentEvent = null;
      state.gender = 'male';
      state.exam.lastYear = -1;
      state.stats.money = 1000;
      startExam();
    });
    await page.waitForFunction(() => !document.querySelector('.result-card'));
    await page.click('[data-question="0"][data-exam-answer]');
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(await page.evaluate(() => document.activeElement.matches('.center-panel h2')), false, 'Answering the same paper must not keep jumping back to its heading');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, resultDetails: true, narrativeFocus: true, viewports: [390, 320, 1440], errors }));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
