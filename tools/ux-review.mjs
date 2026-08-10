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
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
});
page.on("requestfailed", (request) => browserErrors.push(`requestfailed: ${request.url()} · ${request.failure()?.errorText || "unknown"}`));

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

  const connectedNarrativeAudit = await page.evaluate(() => {
    state.dead = false;
    state.age = 31;
    state.prisonYears = 0;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.pendingSurprise = null;
    state.npcRequests = normalizeNpcRequests([{
      id: "ux-relative-request",
      npcId: "ux-relative",
      npcName: "符清怡",
      relation: "姐姐",
      type: "medicine",
      title: "符清怡卧病求医",
      createdYear: state.year,
      dueYear: state.year + 1,
      status: "pending",
    }]);
    state.threads = normalizeThreads([{
      id: "ux-family-thread",
      kind: "family",
      title: "家门里没有说完的话",
      summary: "三年前的一封家书仍待回响",
      createdYear: state.year - 3,
      dueYear: state.year + 2,
      status: "active",
    }]);
    view.page = "main";
    view.tab = "overview";
    view.overlay = "";
    render();
    const items = [...document.querySelectorAll(".story-radar-item")];
    const rects = items.map((item) => {
      const itemRect = item.getBoundingClientRect();
      const imageRect = item.querySelector(":scope > img")?.getBoundingClientRect();
      const actionRect = item.querySelector(".story-radar-action")?.getBoundingClientRect();
      const within = (inner) => !inner || (inner.left >= itemRect.left - 1 && inner.top >= itemRect.top - 1
        && inner.right <= itemRect.right + 1 && inner.bottom <= itemRect.bottom + 1);
      return {
        image: imageRect ? [Math.round(imageRect.width), Math.round(imageRect.height)] : null,
        imageFits: within(imageRect),
        actionFits: within(actionRect),
      };
    });
    return {
      count: items.length,
      rects,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cleanText: !/undefined|NaN/.test(document.body.innerText),
    };
  });
  await page.screenshot({ path: output("mobile-story-radar"), fullPage: true });

  const familyChoiceAudit = await page.evaluate(() => {
    state.currentEvent = {
      kind: "familyStory",
      title: "为孩子择一条路",
      content: "孩子已到开蒙立志的年纪。是走书卷功名、拜师学艺，还是留在家中慢慢教养，需要你来决定。",
      children: [
        { title: "送入书院", note: "花费 160 铜钱，重学识与科举", familyEffect: "academy", disabled: true },
        { title: "拜师学艺", note: "花费 80 铜钱，重手艺与历练", familyEffect: "craft" },
        { title: "留家教养", note: "亲自教导，重德行与亲情", familyEffect: "home" },
      ],
    };
    render();
    const choices = [...document.querySelectorAll(".scene-choice")];
    return {
      count: choices.length,
      colors: choices.map((button) => ({
        button: getComputedStyle(button).color,
        title: getComputedStyle(button.querySelector("span")).color,
        note: getComputedStyle(button.querySelector("small")).color,
        opacity: getComputedStyle(button).opacity,
      })),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cleanText: !/undefined|NaN/.test(document.body.innerText),
    };
  });
  await page.screenshot({ path: output("mobile-family-choice"), fullPage: true });
  console.log("connected narrative audit", JSON.stringify({ connectedNarrativeAudit, familyChoiceAudit }, null, 2));

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

  console.log(["onboarding", "mobile-story-radar", "mobile-family-choice", "mobile-main", "mobile-activities", "mobile-careers", "mobile-travel", "desktop-travel"].map(output).join("\n"));
  if (browserErrors.length) throw new Error(`browser errors:\n${browserErrors.join("\n")}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
