import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createStaticServer } from './serve.mjs';
import { launchBrowser } from './browser.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await launchBrowser();
const output = process.env.AUDIT_OUTPUT;
if (output) await fs.mkdir(output, { recursive: true });
const errors = [];
try {
  for (const [name, width, height] of [['mobile',390,844], ['small-mobile',360,740], ['desktop',1440,900]]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({width,height,deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil:'networkidle0'});
    await page.waitForFunction(()=>!document.getElementById('boot-loader'));
    const visible = async selector => page.$eval(selector, el=>{
      const rect=el.getBoundingClientRect();
      return rect.width>0 && rect.height>0 && rect.top>=0 && rect.bottom<=innerHeight && rect.left>=0 && rect.right<=innerWidth;
    });
    assert.ok(await visible('[data-action="start-life"]'), `${name}: 开始按钮不在首屏内`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${name}: 开局横向溢出`);
    if(output) await page.screenshot({path:path.join(output,`${name}-new-life.png`)});
    await page.click('[data-action="start-life"]');
    assert.ok(await visible('[data-action="onboarding-next-year"]'), `${name}: 引导主按钮不在屏幕内`);
    assert.ok(await page.evaluate(()=>document.activeElement.closest('dialog[open]')), '引导焦点没有进入弹层');
    for(let i=0;i<5;i++) {
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(()=>document.activeElement===document.body || !!document.activeElement.closest('dialog[open]')), '弹层焦点进入了背后的游戏');
    }
    if(output) await page.screenshot({path:path.join(output,`${name}-onboarding.png`)});
    await page.click('[data-action="onboarding-next-year"]');
    await page.waitForSelector('[data-choice="2"]');
    if(width<761) assert.ok(await visible('[data-choice="2"]'), `${name}: 抓周选项未完整展示`);
    await new Promise(resolve=>setTimeout(resolve,450));
    if(output) await page.screenshot({path:path.join(output,`${name}-first-choice.png`)});
    await page.click('[data-choice="0"]');
    await page.click('[data-action="finish-result"]');
    assert.ok(await page.$('.early-life-guide'), '童年分步引导未展示');
    if(width<761) {
      await page.click('[data-action="toggle-tools"]');
      assert.ok(await visible('[data-action="open-onboarding"]'), '手机更多菜单不可访问');
    }
    await page.click('[data-action="open-onboarding"]');
    assert.ok(await page.$('dialog.onboarding-overlay[open]'), '工具菜单中的引导按钮被遮挡');
    await page.keyboard.press('Escape');
    assert.equal(await page.$('dialog[open]'),null,'Escape 未关闭引导');
    await page.click('[data-overlay="profile"]');
    assert.ok(await page.evaluate(()=>document.activeElement.closest('dialog[open]')), '人物资料未获得焦点');
    await page.keyboard.press('Escape');
    assert.ok(await page.evaluate(()=>document.activeElement.matches('[data-overlay="profile"]')), '关闭资料未归还焦点');
    await page.evaluate(()=>window.scrollTo(0,0));
    await new Promise(resolve=>setTimeout(resolve,200));
    if(output) await page.screenshot({path:path.join(output,`${name}-life.png`)});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${name}: 游戏横向溢出`);
    console.log(`${name}: 首屏、引导、选项、工具菜单、键盘焦点通过`);
    await context.close();
  }
  assert.deepEqual(errors,[], '浏览器发生脚本错误');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
