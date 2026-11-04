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
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    const baseline = await page.evaluate(() => { startLife(); return JSON.stringify(state); });
    const reset = age => page.evaluate(({ baseline, age }) => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { gender: 'male', age, year: age, lastSettledYear: age, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      Object.assign(state.stats, { money: 2000, physique: 95 });
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      Object.assign(view, { screen: 'game', page: 'home', placeId: '', activityId: '', tab: 'overview', mobileSection: 'life', overlay: '', toolsOpen: false });
      render();
    }, { baseline, age });
    const photo = async (selector, key, screenshot) => {
      const image = await page.$eval(selector, async node => {
        await node.decode();
        return { src: node.currentSrc, alt: node.alt, width: node.getBoundingClientRect().width };
      });
      assert.ok(image.src.includes(key), `${selector}: ${image.src}`);
      assert.ok(image.alt.length > 5 && image.width > 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 插画导致横向溢出`);
      if (output && screenshot) {
        await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => setTimeout(resolve, 250)); });
        await page.screenshot({ path: path.join(output, `${name}-${screenshot}.png`), fullPage: true });
      }
      return image;
    };
    await reset(10);
    const childhood = await photo('.home-card .page-illustration img', 'scene-childhood-v1', 'childhood');
    assert.equal(childhood.src.endsWith('-small.webp'), width < 761);
    await page.click('[data-home-action="play"]');
    assert.equal(await page.evaluate(() => state.age), 11, '玩耍仍只结算一年');
    await photo('.result-card .page-illustration img', 'scene-childhood-v1');
    const played = await page.evaluate(() => JSON.stringify(state.eventResult));
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => JSON.stringify(state.eventResult)), played, '刷新保留行动当时的插画标识与结算');
    await photo('.result-card .page-illustration img', 'scene-childhood-v1');
    await reset(14);
    await page.click('[data-home-action="play"]');
    assert.equal(await page.evaluate(() => state.age), 15);
    await photo('.result-card .page-illustration img', 'scene-childhood-v1');
    await reset(15);
    await photo('.home-card .page-illustration img', 'scene-home-v1');
    await reset(5);
    await photo('.home-card .page-illustration img', 'scene-home-v1');
    await page.click('[data-home-action="play"]');
    assert.equal(await page.$('.result-card .page-illustration'), null, '幼年行动不借用学龄画面');

    await reset(24);
    await page.evaluate(() => { view.page = 'place'; view.placeId = 'academy'; render(); });
    await photo('.place-scene img', 'scene-academy-v1', 'academy');
    await page.evaluate(() => prepareExam());
    assert.equal(await page.evaluate(() => state.year), 25);
    await photo('.result-card .page-illustration img', 'scene-academy-v1');
    await reset(24);
    await page.evaluate(() => startExam());
    assert.ok(await page.$('.question-card'));
    assert.equal(await page.$('.exam-sheet .page-illustration'), null, '正在作答的试卷保持简洁');
    await page.click('[data-question="0"][data-exam-answer]');
    const selected = await page.evaluate(() => state.exam.current.questions[0].selected);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => state.exam.current.questions[0].selected), selected);

    await reset(24);
    const beforeMatch = await page.evaluate(() => ({ year: state.year, money: state.stats.money }));
    await page.evaluate(() => { view.page = 'matchmaker'; render(); });
    await photo('.matchmaker-card > .page-illustration img', 'scene-matchmaking-v1', 'matchmaking');
    assert.deepEqual(await page.evaluate(() => ({ year: state.year, money: state.stats.money })), beforeMatch, '查看相看画面不收媒资、不耗年');

    await reset(28);
    await page.evaluate(() => {
      state.career = allCareers().find(career => careerKind(career) === 'craft');
      careerProgressFor().level = 3;
      Object.assign(view, { page: 'main', tab: 'career', mobileSection: 'panel' });
      render();
    });
    await page.click('[data-action="take-apprentice"]');
    assert.equal(await page.evaluate(() => state.apprentices.length), 1);
    await photo('.result-card .page-illustration img', 'scene-mentorship-v1', 'mentorship');
    await page.click('[data-action="finish-result"]');
    await photo('.apprentice-panel .page-illustration img', 'scene-mentorship-v1');
    const beforeTeaching = await page.evaluate(() => ({ year: state.year, money: state.stats.money }));
    await page.click('[data-apprentice-teach]');
    await photo('.result-card .page-illustration img', 'scene-mentorship-v1');
    assert.deepEqual(await page.evaluate(() => ({ year: state.year, money: state.stats.money })), { year: beforeTeaching.year, money: beforeTeaching.money - 40 }, '插画不改变亲授用度和时间');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await photo('.result-card .page-illustration img', 'scene-mentorship-v1');
    await page.evaluate(() => { state.eventResult.illustrationKey = 'constructor'; render(); });
    assert.equal(await page.$('.result-card .page-illustration'), null, '未知或原型名称不能成为图片来源');

    await reset(70);
    await page.evaluate(() => {
      state.family.children = [normalizeChild({ id: 'life-art-heir', name: '李承安', gender: 'male', age: 18, physique: 80, alive: true }, '李')];
      die('人生回顾验收'); save(); view.page = 'main'; render();
    });
    await photo('.death-card .page-illustration img', 'scene-life-closing-v1', 'life-closing');
    await page.click('[data-funeral="simple"]');
    await page.click('[data-inherit-child="life-art-heir"]');
    assert.equal(await page.evaluate(() => state.dead), false);
    await page.evaluate(() => { view.page = 'home'; render(); });
    await photo('.home-card .page-illustration img', 'scene-home-v1');
    assert.equal(await page.$('.death-card'), null, '承继后不会遗留前人的落幕画面');

    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const offline = await page.evaluate(async () => Promise.all(['scene-childhood-v1', 'scene-academy-v1', 'scene-matchmaking-v1', 'scene-mentorship-v1', 'scene-life-closing-v1'].flatMap(base => ['', '-small'].map(async suffix => {
      const response = await fetch(`assets/${base}${suffix}.webp`);
      const bitmap = await createImageBitmap(await response.blob());
      const width = bitmap.width;
      bitmap.close();
      return { width, type: response.headers.get('content-type') };
    }))));
    assert.ok(offline.every(asset => asset.type?.startsWith('image/webp') && [800, 1600].includes(asset.width)));
    assert.deepEqual(errors, []);
    console.log(`${name}: 五张人生插画、年龄边界、真实行动与刷新、试卷、承继及十张离线资源通过`);
    await context.close();
  }
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
