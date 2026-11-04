import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStaticServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const webgl = process.env.AUDIT_WEBGL === '1';
const output = process.env.AUDIT_OUTPUT;
if (output) await fs.mkdir(output, { recursive: true });
let browser;
try {
  browser = await launchBrowser(webgl ? { args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] } : {});
  for (const [name, width, height] of [['mobile', 390, 844], ['small-mobile', 320, 740], ['desktop', 1440, 1000]]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(process.env.TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    const baseline = await page.evaluate(() => { startLife(); return JSON.stringify(state); });
    const reset = age => page.evaluate(({ baseline, age }) => {
      state = normalizeState(JSON.parse(baseline));
      Object.assign(state, { age, year: age, lastSettledYear: age, gender: 'male', currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      Object.assign(state.stats, { money: 10000, physique: 95 });
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      Object.assign(view, { screen: 'game', page: 'home', tab: 'overview', mobileSection: 'life', overlay: '', toolsOpen: false });
      render();
    }, { baseline, age });
    const snapshot = () => page.evaluate(() => JSON.stringify(state));
    const capture = async label => {
      await page.$eval('[data-scene-actions]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
      const hitTargets = await page.$$eval('.scene-point', points => points.map(point => {
        const box = point.getBoundingClientRect();
        return { index: point.dataset.scenePoint, width: box.width, height: box.height, hit: document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.scene-point') === point };
      }));
      assert.ok(hitTargets.every(item => Math.round(item.width) >= 44 && Math.round(item.height) >= 44 && item.hit), `${name}: scene markers must remain tappable: ${JSON.stringify(hitTargets)}`);
      if (output) await page.screenshot({ path: path.join(output, `${name}-${label}.png`), fullPage: true });
    };
    await reset(10);
    assert.equal(await page.$$eval('.scene-point', points => points.length), 5);
    const initial = await snapshot();
    await page.focus('[data-scene-point="0"]');
    await page.keyboard.press('Enter');
    assert.ok(await page.$('.scene-inspector:not([hidden])'));
    await page.click('[data-scene-point="4"]');
    assert.equal(await page.$eval('[data-scene-confirm]', button => button.disabled), true, 'child cannot manage adult estate');
    assert.equal(await snapshot(), initial, 'comparing and locked previews never change progress');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.scenePoint), '4');
    assert.equal(await page.$eval('.scene-inspector', node => node.hidden), true);
    await page.click('[data-scene-point="0"]');
    await capture('home');
    await page.evaluate(() => { const confirm = document.querySelector('[data-scene-confirm]'); confirm.click(); confirm.click(); });
    assert.equal(await page.evaluate(() => state.age), 11, 'confirm consumes exactly one year, including rapid double activation');
    const result = await page.evaluate(() => JSON.stringify(state.eventResult));
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => JSON.stringify(state.eventResult)), result);

    await reset(10);
    await page.click('[data-scene-point="0"]');
    await page.evaluate(() => { window.detachedConfirm = document.querySelector('[data-scene-confirm]'); view.page = 'annals'; render(); });
    const afterNavigation = await snapshot();
    await page.evaluate(() => window.detachedConfirm.click());
    assert.equal(await snapshot(), afterNavigation, 'detached scene cannot execute an obsolete action');
    await reset(10);
    await page.click('[data-scene-point="0"]');
    await page.evaluate(() => { document.querySelector('[data-home-action="study"]').disabled = true; });
    const beforeLockedConfirm = await snapshot();
    await page.click('[data-scene-confirm]');
    assert.equal(await snapshot(), beforeLockedConfirm, 'conditions are checked again at confirmation');

    await reset(24);
    await page.evaluate(() => { view.page = 'place'; view.placeId = 'academy'; render(); });
    assert.ok(await page.$('.place-scene[data-scene-src]'), 'place artwork must supply its texture source');
    await page.click('.scene-point[aria-label^="备考温课"]');
    await capture('academy');
    await page.click('[data-scene-confirm]');
    assert.equal(await page.evaluate(() => state.age), 25);
    assert.equal(await page.evaluate(() => state.eventResult.illustrationKey), 'academy');

    await reset(24);
    await page.evaluate(() => { state.gender = 'female'; view.page = 'place'; view.placeId = 'academy'; render(); });
    await page.click('.scene-point[aria-label^="女子不得应科举"]');
    assert.equal(await page.$eval('[data-scene-confirm]', button => button.disabled), true, 'scene keeps exam identity rules');
    await reset(24);
    await page.evaluate(() => { view.page = 'place'; view.placeId = 'temple'; render(); });
    await page.click('.scene-point[aria-label^="求签问运"]');
    await page.click('[data-scene-confirm]');
    const fortune = await page.evaluate(() => JSON.stringify(state.templeFortune.active));
    assert.notEqual(fortune, 'null');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => JSON.stringify(state.templeFortune.active)), fortune);

    await reset(28);
    await page.evaluate(() => {
      state.career = allCareers().find(career => careerKind(career) === 'farmer');
      Object.assign(view, { page: 'main', tab: 'career' });
      startOrResumeCareerChapter('spring-water');
    });
    const chapter = await snapshot();
    await page.click('[data-scene-point="1"]');
    await page.click('[data-scene-point="0"]');
    assert.equal(await snapshot(), chapter, 'comparing story branches must not resolve them');
    await capture('chapter');
    await page.click('[data-scene-confirm]');
    assert.equal(await page.evaluate(() => state.careerChapters.active.history.length), 1);
    assert.ok(await page.$('.result-card'));

    await reset(30);
    await page.evaluate(() => {
      view.page = 'travel'; render(); travelTo(2); startTravelJourney();
      while (state.pendingTravel && state.pendingTravel.index < state.pendingTravel.events.length) resolveTravelChoice(0);
    });
    await page.click('[data-scene-point="0"]');
    await capture('arrival');
    await page.click('[data-scene-confirm]');
    assert.deepEqual(await page.evaluate(() => ({ run: state.pendingTravel, location: state.location, trips: state.travelSystem.memories.luocheng.trips })), { run: null, location: '洛城', trips: 1 });
    await reset(10);
    await page.evaluate(() => save());
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { view.page = 'home'; render(); });
    await page.click('[data-scene-point="1"]');
    await page.click('[data-scene-confirm]');
    assert.equal(await page.evaluate(() => state.age), 11, 'offline scene interaction still saves real progress');
    await page.setOfflineMode(false);

    if (webgl) {
      await reset(10);
      await page.waitForFunction(() => DynastySceneEngine.status().ready > 0 && DynastySceneEngine.status().running > 0);
      await page.evaluate(() => DynastySceneEngine.sync(document.querySelector('#app')));
      assert.equal(await page.evaluate(() => DynastySceneEngine.status().mounted), 1, 'sync is idempotent');
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.waitForFunction(() => !DynastySceneEngine.status().enabled && DynastySceneEngine.status().running === 0, { polling: 100 });
      await page.click('[data-scene-point="0"]');
      assert.ok(await page.$('.scene-inspector:not([hidden])'), 'reduced motion retains gameplay interaction');
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      await page.waitForFunction(() => DynastySceneEngine.status().enabled && DynastySceneEngine.status().running === 1, { polling: 100 });
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert.equal(await page.evaluate(() => DynastySceneEngine.status().running), 0, 'background scene must pause');
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForFunction(() => DynastySceneEngine.status().running === 1, { polling: 100 });
      if (width < 761) {
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForFunction(() => DynastySceneEngine.status().running === 0, { polling: 100 });
        await page.$eval('[data-scene-actions]', node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(() => DynastySceneEngine.status().running === 1, { polling: 100 });
      }
      await page.evaluate(() => { view.page = 'annals'; render(); });
      await page.waitForFunction(() => DynastySceneEngine.status().mounted === 0);
      assert.equal(await page.$$eval('.dynasty-scene-canvas', nodes => nodes.length), 0, 'navigation releases scene resources');
    }
    assert.deepEqual(errors, []);
    console.log(`${name}: 场景探看、真实行动、条件限制、防重复与过期操作、剧情、游历、刷新及离线通过${webgl ? '，含 WebGL 暂停恢复与资源释放' : ''}`);
    await context.close();
  }
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
