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
const webgl = process.env.AUDIT_WEBGL === '1';
try {
  browser = await launchBrowser(webgl ? { args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] } : {});
  for (const [name, width, height] of [['mobile', 390, 844], ['small-mobile', 320, 740], ['desktop', 1440, 1000]]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      startLife();
      Object.assign(state, { age: 28, year: 28, lastSettledYear: 28, currentEvent: null, eventResult: null, pendingAnnualEvent: null, pendingSurprise: null, pendingAchievement: null });
      state.onboarding.seen = true;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      Object.assign(state.stats, { physique: 90, money: 2000 });
      Object.assign(view, { page: 'home', tab: 'overview', overlay: '', mobileSection: 'life' });
      window.sceneAssetRequests = [];
      const load = window.PIXI.Assets.load.bind(window.PIXI.Assets);
      window.PIXI.Assets.load = async (...args) => { window.sceneAssetRequests.push(args[0]); return load(...args); };
      render();
    });
    const initial = await page.evaluate(() => JSON.stringify({ year: state.year, stats: state.stats, chapters: state.careerChapters }));
    for (const [route, asset] of [['home', 'scene-home-v1'], ['heirlooms', 'scene-heirlooms-v1'], ['annals', 'scene-heirlooms-v1']]) {
      await page.evaluate(route => { view.page = route; render(); }, route);
      const photo = await page.$eval('.center-panel .page-illustration img', async node => {
        await node.decode();
        return { src: node.currentSrc, width: node.naturalWidth, alt: node.alt, ratio: node.getBoundingClientRect().width / node.getBoundingClientRect().height };
      });
      assert.ok(photo.src.includes(asset));
      assert.equal(photo.src.endsWith('-small.webp'), width < 761, '浏览器应选择与屏幕相称的插画尺寸');
      assert.ok(photo.width > 0);
      assert.ok(photo.alt.length > 5);
      assert.ok(photo.ratio > 1.5 && photo.ratio < 2.4, '场景不能被挤压成细条或拉伸');
      assert.equal(await page.evaluate(() => JSON.stringify({ year: state.year, stats: state.stats, chapters: state.careerChapters })), initial, '看插画不改变进度');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (output) {
        await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => setTimeout(resolve, 220)); });
        await page.screenshot({ path: path.join(output, `${name}-${route}.png`), fullPage: true });
      }
    }
    for (const [id, kind, asset] of [['blank-letter', 'caravan', 'event-blank-letter-v1'], ['workshop-promise', 'craft', 'event-workshop-v1']]) {
      await page.evaluate(({ id, kind }) => {
        state.currentEvent = null; state.eventResult = null;
        state.careerChapters = normalizeCareerChapters();
        state.career = allCareers().find(career => careerKind(career) === kind);
        view.page = 'main';
        window.sceneAssetRequests = [];
        startOrResumeCareerChapter(id);
      }, { id, kind });
      const selected = await page.$eval('.event-scene img', async node => { await node.decode(); return node.currentSrc; });
      assert.ok(selected.includes(asset));
      if (webgl) {
        assert.equal(await page.evaluate(() => DynastySceneEngine.status().enabled), true, 'WebGL audit requires its software renderer');
        await page.waitForFunction(() => document.querySelector('.event-scene')?.dataset.sceneEngineState === 'ready');
        assert.ok(await page.evaluate(src => window.sceneAssetRequests.includes(src), selected), '动态画卷应复用浏览器选好的图片，手机不另取大图');
      }
      await page.click('[data-choice="0"]');
      await page.waitForFunction(() => document.activeElement.matches('.result-card h2'));
      const resultArt = await page.$eval('.result-card .page-illustration img', async node => { await node.decode(); return node.currentSrc; });
      assert.ok(resultArt.includes(asset), '长卷结果接续同一个故事画面');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (output) {
        await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => setTimeout(resolve, 220)); });
        await page.screenshot({ path: path.join(output, `${name}-${id}-result.png`), fullPage: true });
      }
    }
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const offlineArt = await page.$eval('.result-card .page-illustration img', async node => { await node.decode(); return node.naturalWidth; });
    assert.ok(offlineArt > 0, '离线刷新仍能显示本幕插画');
    const offlineAssets = await page.evaluate(async () => {
      const bases = ['scene-home-v1', 'scene-heirlooms-v1', 'event-blank-letter-v1', 'event-workshop-v1'];
      return Promise.all(bases.flatMap(base => ['', '-small'].map(async suffix => {
        const response = await fetch(`assets/${base}${suffix}.webp`);
        const bitmap = await createImageBitmap(await response.blob());
        const width = bitmap.width;
        bitmap.close();
        return { width, type: response.headers.get('content-type') };
      })));
    });
    assert.ok(offlineAssets.every(asset => asset.type?.startsWith('image/webp') && [800, 1600].includes(asset.width)), '八个离线版本必须都是真实可解码的图片');
    assert.deepEqual(errors, []);
    console.log(`${name}: 新插画路由、尺寸选择、裁切、结果衔接及八张离线资源通过${webgl ? '，含 WebGL 纹理复用' : ''}`);
    await context.close();
  }
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
