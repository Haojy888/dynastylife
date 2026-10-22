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
async function capture(page, filename) {
  if (!output) return;
  await page.evaluate(async () => {
    await Promise.race([Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))), new Promise(resolve => setTimeout(resolve, 1000))]);
    await Promise.all([...document.querySelectorAll('.story-book img, .event-scene img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
  });
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
}
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
      Object.assign(state, { name: '沈知禾', age: 24, year: 24, lastSettledYear: 24, currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null });
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      state.stats.money = 1000;
      state.stats.physique = 90;
      state.career = allCareers().find(career => careerKind(career) === 'farmer');
      Object.assign(view, { screen: 'game', page: 'home', tab: 'career', overlay: '', mobileSection: 'life' });
      render();
    });
    const beforePreview = await page.evaluate(() => ({ age: state.age, year: state.year, money: state.stats.money, completed: state.careerChapters.completed.length }));
    await page.click('.center-panel [data-page="stories"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2'));
    assert.equal(await page.$$eval('.story-book', nodes => nodes.length), 5, '五条长卷应有统一入口');
    assert.equal(await page.$eval('.story-book', node => node.dataset.storyId), 'spring-water', '当前营生的长卷应排在前面');
    await page.focus('[data-story-id="spring-water"] .story-book-contents summary');
    await page.keyboard.press('Enter');
    assert.equal(await page.$eval('[data-story-id="spring-water"] details', node => node.open), true);
    assert.equal(await page.$$eval('[data-story-id="spring-water"] details li', nodes => nodes.length), 4);
    assert.equal(await page.$('[data-story-id="workshop-promise"] [data-start-chapter]'), null, '不同职业不能直接开启不符营生的故事');
    assert.deepEqual(await page.evaluate(() => ({ age: state.age, year: state.year, money: state.stats.money, completed: state.careerChapters.completed.length })), beforePreview, '翻阅和打开卷目不应耗年或支付');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 书架横向溢出`);
    await capture(page, `${name}-story-library.png`);
    await page.click('[data-start-chapter="spring-water"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2'));
    assert.equal(await page.evaluate(() => state.currentEvent?.chapterId), 'spring-water');
    assert.equal(await page.$eval('.event-scene img', node => node.getAttribute('src')), 'assets/region-qingping.webp');
    const index = await page.evaluate(() => state.currentEvent.children.findIndex(choice => !choice.disabled));
    await page.click(`[data-choice="${index}"]`);
    await page.click('[data-action="finish-result"]');
    await page.evaluate(() => { view.page = 'stories'; render(); });
    assert.equal(await page.$eval('[data-start-chapter="spring-water"]', node => node.disabled), true, '选完一幕后必须等待一年');
    assert.ok(await page.$eval('[data-story-id="spring-water"] .story-book-note', node => node.innerText.includes('1年')));
    await page.evaluate(() => {
      state.year = state.careerChapters.active.dueYear;
      state.age = state.year;
      render();
    });
    await page.click('[data-start-chapter="spring-water"]');
    assert.equal(await page.evaluate(() => state.currentEvent.stageIndex), 1);
    await page.click('.chapter-recollection summary');
    assert.ok(await page.$eval('.chapter-choice-record', node => !!node.innerText.trim()), '续写页应能回看实际前情');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 农事选项横向溢出`);
    await capture(page, `${name}-spring-water.png`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => state.currentEvent?.chapterId), 'spring-water', '刷新应保留正在读的新章节');
    assert.equal(await page.evaluate(() => state.careerChapters.active.history.length), 1, '刷新不能重复结算上一幕');
    await page.evaluate(() => {
      state.currentEvent = null;
      state.eventResult = null;
      state.careerChapters = normalizeCareerChapters();
      state.career = allCareers().find(career => careerKind(career) === 'craft');
      Object.assign(view, { page: 'menu', mobileSection: 'life' });
      render();
    });
    await page.click('.center-panel [data-page="stories"]');
    await page.click('[data-start-chapter="workshop-promise"]');
    assert.equal(await page.evaluate(() => state.currentEvent.chapterId), 'workshop-promise');
    assert.equal(await page.$eval('.event-scene img', node => node.getAttribute('src')), 'assets/event-career.webp');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 匠作选项横向溢出`);
    await capture(page, `${name}-workshop-promise.png`);
    await page.evaluate(() => {
      state.currentEvent = null;
      state.careerChapters = normalizeCareerChapters();
      state.career = null;
      state.age = 12;
      view.page = 'stories';
      render();
    });
    assert.equal(await page.$$eval('[data-start-chapter]:not([disabled])', nodes => nodes.length), 0, '少年不能越过营生年龄启卷');
    await page.click('[data-story-id="spring-water"] [data-tab="career"]');
    assert.equal(await page.evaluate(() => view.tab), 'career', '择业按钮应定位营生页');
    assert.ok(await page.$('.story-shelf-door'), '营生页应保留返回书架的入口');
    await context.close();
    console.log(`${name}: 长卷书架、卷目键盘展开、条件入口、隔年续写、前情与刷新通过`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
