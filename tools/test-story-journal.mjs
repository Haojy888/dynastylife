import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStaticServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await launchBrowser();
const errors = [];
const output = process.env.AUDIT_OUTPUT;
if (output) await fs.mkdir(output, { recursive: true });
async function capture(page, filename) {
  if (!output) return;
  await page.evaluate(async () => {
    await Promise.race([Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))), new Promise(resolve => setTimeout(resolve, 1500))]);
    await Promise.all([...document.querySelectorAll('.event-scene img, .chapter-journal-entry summary img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
  });
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
}
try {
  for (const [name, width, height] of [['mobile', 390, 844], ['small-mobile', 360, 740], ['desktop', 1440, 1000]]) {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width, height });
    await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      startLife();
      Object.assign(state, { age: 26, year: 26, currentEvent: null, eventResult: null });
      state.onboarding.seen = true;
      state.stats.money = 1000;
      state.career = allCareers().find(item => careerKind(item) === 'merchant');
      state.careerChapters = normalizeCareerChapters({ active: {
        ...createCareerChapter('grain-road'), flags: ['public-promise'],
        id: 'grain-road', stage: 1, dueYear: 26, startedYear: 25,
        history: [{ stageId: 'old-choice', choiceId: 'old-choice', title: '守住平价粮船', year: 25 }],
        routes: { supply: 1 }, regionId: 'qingping',
      } });
      Object.assign(view, { page: 'main', tab: 'history', overlay: '', mobileSection: 'life' });
      render();
    });
    await page.click('.story-radar-action[data-career-action="case:chapter"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2') && document.querySelector('.center-panel').getBoundingClientRect().top >= -1);
    assert.equal(await page.evaluate(() => state.currentEvent?.chapterId), 'grain-road', '眼前要事没有直接打开当前职业章节');
    assert.equal(await page.$eval('.event-scene img', el => el.getAttribute('src')), 'assets/event-grain-road.webp');
    assert.equal(await page.$$eval('.chapter-steps [aria-current="step"]', els => els.length), 1);
    await page.click('.chapter-recollection summary');
    assert.ok(await page.$eval('.chapter-choice-record', el => el.innerText.includes('守住平价粮船')));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 长篇事件横向溢出`);
    const notes = await page.$$eval('.choice-btn small', els => els.map(el => el.textContent));
    assert.ok(notes.length >= 2 && notes.every(Boolean), '职业选项的花费/条件提示缺失');
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, `${name}-grain-story.png`);
    await page.evaluate(() => {
      state.currentEvent = null;
      state.careerChapters.active = null;
      state.careerChapters.completed = [{ id: 'grain-road', year: 26, outcome: '粮路长明', summary: '平价粮船继续往来，这段经历留下了一座义仓。', routes: { supply: 2, trust: 2 }, history: [{ stageId: 'test', choiceId: 'test', title: '<img src=x onerror="window.journalInjection=true">', year: 25 }] }];
      establishRegionalLegacy('granary', 'qingping');
      state = normalizeState(JSON.parse(JSON.stringify(state)));
      Object.assign(view, { page: 'main', tab: 'history', mobileSection: 'panel' });
      render();
    });
    await page.click('.chapter-journal-entry summary');
    assert.ok(await page.$eval('.chapter-journal-body', el => el.innerText.includes('平价粮船继续往来')));
    assert.ok(await page.$eval('.chapter-route-tags', el => el.innerText.includes('2次选择')));
    assert.equal(await page.evaluate(() => !!window.journalInjection), false, '导入存档的历史文本执行了HTML');
    assert.equal(await page.$('.chapter-choice-record img'), null);
    await page.evaluate(() => {
      state.careerChapters.completed[0].history[0].title = '守住平价粮船';
      render();
      document.querySelector('.chapter-journal-entry').open = true;
    });
    assert.ok(await page.$eval('.legacy-memory', el => el.innerText.includes('义仓') && el.innerText.includes('创办')));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 人生长卷横向溢出`);
    await capture(page, `${name}-story-journal.png`);
    await page.click('.legacy-memory [data-page="regions"]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2') && document.querySelector('.center-panel').getBoundingClientRect().top >= -1);
    assert.equal(await page.evaluate(() => view.page), 'regions', '命册中的地方遗产入口不可用');
    await capture(page, `${name}-regional-memory.png`);
    await page.evaluate(() => {
      state.career = allCareers().find(item => careerKind(item) === 'medicine');
      state.careerChapters.active = createCareerChapter('epidemic-dispensary');
      state.currentEvent = buildCareerChapterEvent();
      Object.assign(view, { page: 'main', mobileSection: 'life' });
      render();
      window.scrollTo(0, 0);
    });
    assert.equal(await page.$eval('.event-scene img', el => el.getAttribute('src')), 'assets/event-dispensary.webp');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 药庐故事横向溢出`);
    await capture(page, `${name}-medicine-story.png`);
    const imprisoned = await page.evaluate(() => {
      state.currentEvent = null;
      state.prisonYears = 2;
      const journal = careerStoryJournal();
      return { hasResume: journal.includes('data-career-action="case:chapter"'), explains: journal.includes('出狱后') };
    });
    assert.equal(imprisoned.hasResume, false, '在狱时命册仍给出无效的续写按钮');
    assert.equal(imprisoned.explains, true);
    await page.close();
    console.log(`${name}: 剧情直达、前情、命册、地方记忆及场景插画通过`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
