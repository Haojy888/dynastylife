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
async function capture(page, name) {
  if (!output) return;
  await page.evaluate(async () => {
    await Promise.race([Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))), new Promise(resolve => setTimeout(resolve, 1500))]);
    await Promise.all([...document.querySelectorAll('.center-panel img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
  });
  await page.screenshot({ path: path.join(output, name), fullPage: true });
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
      Object.assign(state, { name: '李承安', age: 24, year: 24, lastSettledYear: 24, currentEvent: null, eventResult: null, pendingAchievement: null, pendingSurprise: null });
      state.lineage.generation = 2;
      state.onboarding.seen = true;
      state.stats.money = 1000;
      state.stats.physique = 80;
      state.life.goals = LIFE_GOALS.map(goal => goal.id);
      for (const kind of ['annotated-book', 'grain-charter', 'medical-casebook']) {
        grantHeirloom(kind, { name: '李望川', generation: 1, sourceId: `ui:${kind}`, personId: 'first-founder', regionId: 'qingping', year: 42, summary: kind === 'annotated-book' ? '<img src=x onerror="window.heirloomInjection=true">' : '李望川把亲历的风波写进旧卷，附上来历，交给家中保存。' });
        const item = state.heirlooms.items.at(-1);
        item.history = [
          { holderId: 'first-founder', name: '李望川', generation: 1, year: 42, action: '初藏', summary: '李望川据实整理旧卷，留下来历与自己的选择。' },
          { holderId: state.heirlooms.holderId, name: state.name, generation: 2, year: 24, action: '承接', summary: '<img src=x onerror="window.heirloomInjection=true">' },
        ];
      }
      Object.assign(view, { screen: 'game', page: 'home', tab: 'overview', overlay: '', mobileSection: 'panel' });
      render();
    });
    await page.click('.center-panel .heirloom-door');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2'));
    assert.equal(await page.$$eval('.heirloom-card', nodes => nodes.length), 3);
    assert.ok(await page.$eval('.heirloom-docket', node => node.innerText.includes('第1代') && node.innerText.includes('李望川')));
    assert.equal(await page.$('.heirloom-docket img'), null, '导入的来源不得解释为 HTML');
    await page.focus('.heirloom-history summary');
    await page.keyboard.press('Enter');
    assert.ok(await page.$eval('.heirloom-history', node => node.open), '传承详情应可通过键盘打开');
    assert.equal(await page.$('.heirloom-history ol img'), null, '导入的流转记录不得解释为 HTML');
    assert.equal(await page.evaluate(() => !!window.heirloomInjection), false);
    await page.evaluate(() => {
      state.heirlooms.items[0].origin.summary = '父亲李望川收存的批注旧书，连同来源纸签传给李承安。';
      state.heirlooms.items[0].history[1].summary = '李承安从李望川留下的旧匣中承接此书，来源和续用记录一并保留。';
      render();
      document.querySelector('.heirloom-history').open = true;
      window.scrollTo(0, 0);
    });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 旧物柜横向溢出`);
    await capture(page, `${name}-heirlooms.png`);

    await page.click('.heirloom-card [data-heirloom-open]');
    await page.waitForFunction(() => document.activeElement.matches('.center-panel h2'));
    assert.equal(await page.evaluate(() => state.currentEvent?.kind), 'heirloom');
    assert.ok(await page.$eval('.choice-btn[data-choice="1"] small', node => node.innerText.includes('永久离开家门')));
    assert.ok(await page.$eval('.choice-btn[data-choice="0"] small', node => node.innerText.includes('20 铜钱') && node.innerText.includes('仅一次')));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 旧物事件横向溢出`);
    await capture(page, `${name}-heirloom-choice.png`);
    await page.click('[data-choice="2"]');
    await page.click('[data-action="finish-result"]');
    assert.ok(await page.$('.heirloom-card.is-sealed'), '封存后应回到旧物柜展示封签');
    await page.click('.heirloom-card.is-sealed [data-heirloom-open]');
    await page.click('[data-choice="0"]');
    await page.click('[data-action="finish-result"]');
    await page.click('.heirloom-card [data-heirloom-open]');
    await page.click('[data-choice="0"]');
    await page.click('[data-action="finish-result"]');
    assert.equal(await page.evaluate(() => state.stats.money), 980, '封存与启封不扣费，续用支付 20');
    await page.click('.heirloom-card [data-heirloom-open]');
    assert.ok(await page.$eval('[data-choice="0"]', node => node.disabled), '同一人已续用，应禁用重复领奖');
    await page.click('[data-choice="1"]');
    await page.click('[data-action="finish-result"]');
    assert.equal(await page.evaluate(() => state.stats.money), 965);
    assert.equal(await page.$('.heirloom-card.is-donated [data-heirloom-open]'), null, '永久赠出后不应保留操作按钮');
    assert.ok(await page.$eval('.heirloom-card.is-donated .heirloom-history', node => node.textContent.includes('转赠') || node.textContent.includes('乡学')));
    await page.click('.heirloom-cabinet [data-page="backpack"]');
    assert.ok(await page.$eval('.center-panel .heirloom-door', node => node.innerText.includes('2件')), '行囊入口应扣除已赠出的旧物');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { Object.assign(view, { page: 'heirlooms', mobileSection: 'panel', overlay: '' }); render(); });
    assert.equal(await page.$$eval('.heirloom-card.is-donated', nodes => nodes.length), 1, '刷新应保留赠出状态');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 赠出后的旧物柜横向溢出`);
    await context.close();
    console.log(`${name}: 家中/行囊入口、键盘详情、来源转义、封存启封、一次续用与永久转赠通过`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
