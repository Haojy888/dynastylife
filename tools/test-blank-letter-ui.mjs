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
      Object.assign(state, { name: '沈听澜', gender: 'male', age: 28, year: 28, lastSettledYear: 28, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      Object.assign(state.stats, { money: 2000, physique: 95, knowledge: 80, eq: 80 });
      state.career = allCareers().find(career => careerKind(career) === 'caravan');
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.filter(goal => goal.id !== 'night-passage').map(goal => goal.id);
      Object.assign(view, { screen: 'game', page: 'home', mobileSection: 'life', tab: 'career', overlay: '' });
      render();
    });
    await page.click('.center-panel [data-page="stories"]');
    assert.equal(await page.$$eval('.story-book', nodes => nodes.length), 6);
    assert.equal(await page.$eval('.story-book', node => node.dataset.storyId), 'blank-letter');
    await page.click('[data-start-chapter="blank-letter"]');
    assert.equal(await page.$eval('.event-scene img', node => node.getAttribute('src')), 'assets/event-blank-letter-v1.webp');
    assert.equal(await page.$eval('.center-panel', node => node.innerText.includes('白纸照夜')), false, '开卷不透露隐藏结局');
    await page.focus('.center-panel .chapter-clues > summary');
    await page.keyboard.press('Enter');
    assert.ok(await page.$eval('.center-panel .chapter-clues', node => node.innerText.includes('还没有')));
    const decisions = ['trace-paper', 'check-warrant', 'match-testimony', 'expose-network'];
    for (let stage = 0; stage < 4; stage += 1) {
      const index = await page.evaluate(id => state.currentEvent.children.findIndex(choice => choice.id === id), decisions[stage]);
      await page.click(`[data-choice="${index}"]`);
      await page.waitForFunction(() => document.activeElement.matches('.result-card h2'));
      assert.equal(await page.evaluate(() => state.eventResult.chapterId), 'blank-letter');
      assert.ok(await page.$('.result-card .chapter-clues'), '结果页可以直接回看本幕收下的线索');
      if (stage === 0) {
        const savedResult = await page.evaluate(() => JSON.stringify(state.eventResult));
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.evaluate(() => JSON.stringify(state.eventResult)), savedResult);
        await page.click('.result-card .chapter-clues > summary');
        assert.ok(await page.$eval('.result-card .chapter-clues', node => node.innerText.includes('纸背的针孔') && !node.innerText.includes('早了一年的关牒')), '刷新后仍只显示已得到的线索');
      }
      if (stage === 3) break;
      await page.click('[data-action="finish-result"]');
      await page.evaluate(() => { view.page = 'main'; view.mobileSection = 'life'; render(); nextYear(); });
      // A seasonal event can precede the queued chapter in the same settled year.
      for (let pending = 0; pending < 8; pending += 1) {
        if (await page.$('dialog[open]')) { await page.keyboard.press('Escape'); continue; }
        if (await page.evaluate(() => state.currentEvent?.kind === 'careerChapter')) break;
        const control = await page.$('.center-panel [data-action="finish-result"], .center-panel [data-choice]:not([disabled]), .center-panel [data-action="finish-event"]');
        if (!control) break;
        await control.click();
      }
      const advanced = await page.evaluate(() => ({ stage: state.currentEvent?.stageIndex, event: state.currentEvent?.title, year: state.year, block: yearAdvanceBlockReason(), result: state.eventResult?.title, annual: state.pendingAnnualEvent?.title, surprise: state.pendingSurprise?.title, chapter: state.careerChapters.active }));
      assert.equal(advanced.stage, stage + 1, `真实推进一年应衔接下一幕: ${JSON.stringify(advanced)}`);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.activeElement.matches('.event-card h2'));
      await page.focus('.center-panel .chapter-clues > summary');
      await page.keyboard.press('Enter');
      assert.ok(await page.$eval('.center-panel .chapter-clues', node => node.innerText.includes('纸背的针孔')));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (stage === 2 && output) {
        await page.evaluate(async () => { await document.querySelector('.event-scene img').decode(); document.activeElement.blur(); await new Promise(resolve => setTimeout(resolve, 250)); });
        await page.screenshot({ path: path.join(output, `${name}-blank-letter-clues.png`), fullPage: true });
      }
    }
    assert.ok(await page.$eval('.result-card h2', node => node.textContent.includes('白纸照夜')));
    assert.equal(await page.evaluate(() => state.heirlooms.items[0].kind), 'night-route');
    assert.equal(await page.evaluate(() => state.life.goals.includes('night-passage')), true);
    assert.equal(await page.evaluate(() => state.careerChapters.completed[0].history.length), 4);
    const notificationBounds = await page.evaluate(() => {
      const award = document.querySelector('.achievement-toast').getBoundingClientRect();
      const result = document.querySelector('.result-card').getBoundingClientRect();
      return { awardBottom: award.bottom, resultTop: result.top };
    });
    assert.ok(notificationBounds.awardBottom <= notificationBounds.resultTop, '成就提示应占据自己的位置，不盖住结果');
    await page.$eval('[data-action="finish-result"]', node => node.scrollIntoView({ block: 'center' }));
    assert.ok(await page.$eval('[data-action="finish-result"]', node => {
      const box = node.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('[data-action="finish-result"]');
    }), '未收起成就也能直接点击继续按钮');
    const pendingResult = await page.evaluate(() => JSON.stringify({ result: state.eventResult, year: state.year, money: state.stats.money }));
    await page.click('[data-action="open-achievement-codex"]');
    await page.waitForSelector('.codex-card');
    assert.ok(await page.$('.paused-life-notice'));
    assert.equal(await page.evaluate(() => JSON.stringify({ result: state.eventResult, year: state.year, money: state.stats.money })), pendingResult, '翻图鉴不结算或吃掉当前结果');
    await page.click('.paused-life-notice [data-action="back-main"]');
    assert.ok(await page.$('.result-card .chapter-clues'));
    await page.click('[data-action="finish-result"]');
    await page.evaluate(() => { view.page = 'history'; render(); });
    await page.click('.center-panel .chapter-journal-entry > summary');
    await page.focus('.center-panel .chapter-clues > summary');
    await page.keyboard.press('Enter');
    const readback = await page.$eval('.center-panel .chapter-clues', node => ({ text: node.innerText, open: node.open, parentOpen: node.closest('.chapter-journal-entry').open, html: node.innerHTML }));
    assert.ok(readback.text.includes('两份能对照的证词'), JSON.stringify(readback));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.querySelector('.center-panel .chapter-clues').open);
    await page.click('.center-panel .chapter-clues > summary');
    assert.equal(await page.$eval('.center-panel .chapter-clues', node => node.open), true, '线索簿同样可以点击展开');
    await page.evaluate(() => {
      state.family.children = [normalizeChild({ id: 'night-route-heir', name: '沈照夜', gender: 'male', age: 18, physique: 80, alive: true }, '沈')];
      die('长卷验收'); save(); view.page = 'main'; render();
    });
    await page.click('[data-funeral="simple"]');
    await page.click('[data-inherit-child="night-route-heir"]');
    await page.evaluate(() => { view.page = 'annals'; render(); });
    await page.click('.annals-ancestors .annals-life > summary');
    await page.click('.annals-chapter > summary');
    await page.click('.annals-chapter .chapter-clues > summary');
    assert.ok(await page.$eval('.annals-chapter', node => node.innerText.includes('白纸照夜') && node.innerText.includes('纸背的针孔')));
    assert.equal(await page.evaluate(() => state.heirlooms.items[0].origin.name), '沈听澜');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => state.lineage.ancestors[0].chapters.completed[0].outcome), '白纸照夜');
    assert.deepEqual(errors, []);
    console.log(`${name}: 六卷入口、真实跨年、线索簿键盘与刷新、结局奖励、家族回看及离线读档通过`);
    await context.close();
  }
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
