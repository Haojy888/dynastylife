import os from "node:os";
import path from "node:path";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const { port } = server.address();
const browser = await launchBrowser();
const page = await browser.newPage();
const output = (name) => path.join(os.tmpdir(), `dynastylife-${name}.png`);

try {
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('[data-action="start-life"]', { timeout: 10000 });
  await page.click('[data-action="start-life"]');
  await page.waitForSelector(".onboarding-avatar", { timeout: 10000 });
  await page.screenshot({ path: output("onboarding") });
  console.log("onboarding avatar", await page.$eval(".onboarding-avatar", (image) => ({
    src: image.getAttribute("src"),
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    display: getComputedStyle(image).display,
    opacity: getComputedStyle(image).opacity,
  })));
  await page.click('[data-action="onboarding-next-year"]');
  await page.evaluate(() => {
    state.dead = false;
    state.age = 25;
    state.prisonYears = 0;
    state.currentEvent = {
      id: "ux-review",
      kind: "dailyStory",
      title: "旧友夜访",
      content: "多年未见的旧友披着暮色登门，带来一封没有落款的书信。窗外风过竹影，你要决定今夜如何待客。",
      children: [
        { title: "设宴叙旧", content: "温一壶酒，先听他说完来意。", effects: {} },
        { title: "拆信细看", content: "灯下验看字迹与封泥。", effects: {} },
        { title: "谨慎试探", content: "不动声色地问起旧年往事。", effects: {} },
      ],
    };
    state.pendingAnnualEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    view.page = "main";
    view.tab = "overview";
    view.overlay = "";
    render();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: output("mobile-main") });

  await page.evaluate(() => {
    state.currentEvent = null;
    view.tab = "activities";
    render();
  });
  await page.$eval(".detail-panel", (element) => element.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: output("mobile-activities") });

  await page.evaluate(() => {
    state.gender = "male";
    state.career = null;
    view.tab = "career";
    view.careerFilter = "female";
    render();
  });
  await page.$eval(".detail-panel", (element) => element.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: output("mobile-careers") });

  await page.evaluate(() => {
    view.page = "travel";
    render();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: output("mobile-travel") });

  await page.setViewport({ width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  await new Promise((resolve) => setTimeout(resolve, 900));
  await page.evaluate(() => {
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.pendingAchievement = null;
    view.page = "travel";
    view.overlay = "";
    render();
    window.scrollTo(0, 0);
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot({ path: output("desktop-travel") });

  console.log(["onboarding", "mobile-main", "mobile-activities", "mobile-careers", "mobile-travel", "desktop-travel"].map(output).join("\n"));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
