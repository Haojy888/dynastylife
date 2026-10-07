import assert from "node:assert/strict";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof startLife === "function");
  const result = await page.evaluate(() => {
    startLife();
    Object.assign(state, { age: 25, year: 25, currentEvent: null, eventResult: null, pendingAchievement: null });
    state.onboarding.seen = true;
    Object.assign(view, { screen: "game", page: "backpack", overlay: "" });
    state.inventory = ["家书", "布老虎", "旧书", "绣花香囊"];
    state.diseases = ["风寒", "惊悸"];
    state.femaleSkills = { 女红: 3, 琴: 2 };
    state.life.goals = [];
    const goal = LIFE_GOALS.find((item) => item.id === "inventory-five");
    unlockLifeGoals();
    const belowThreshold = !goal.done() && !state.life.goals.includes(goal.id);
    state.stats.money = 10000;
    const shopIndex = SHOP_GOODS.findIndex((item) => item.stat !== "cricket" && !state.inventory.includes(item.name));
    buyGood(shopIndex);
    unlockLifeGoals();
    save();
    const purchase = { count: inventoryUsed(), done: goal.done(), recorded: state.life.goals.includes(goal.id), saved: loadSave(currentSlot).life.goals.includes(goal.id) };

    // Older saves may contain multiple copies of an item; named counts still drive the backpack.
    state.inventory = ["家书", "旧书", "布老虎", "旧书", "绣花香囊"];
    state.eventResult = null;
    state.pendingAchievement = null;
    render();
    const namedCount = inventoryCount("旧书");
    const sellButton = document.querySelector('[data-sell-item="旧书"]');
    const stackLabel = sellButton.closest(".item-card").textContent;
    const moneyBefore = state.stats.money;
    sellButton.click();
    const sale = { count: inventoryCount("旧书"), total: inventoryUsed(), money: state.stats.money - moneyBefore, savedCount: loadSave(currentSlot).inventory.filter((name) => name === "旧书").length, retained: state.life.goals.includes(goal.id) };
    return { belowThreshold, purchase, namedCount, stackLabel, sale };
  });
  assert.equal(result.belowThreshold, true, "Diseases and learned skills must not unlock an item-collection achievement");
  assert.deepEqual(result.purchase, { count: 5, done: true, recorded: true, saved: true }, "The fifth actual item must qualify and persist at the achievement checkpoint");
  assert.equal(result.namedCount, 2);
  assert.ok(result.stackLabel.includes("2件"), "The backpack must retain named stack counts from older saves");
  assert.equal(result.sale.count, 1);
  assert.equal(result.sale.total, 4);
  assert.ok(result.sale.money > 0);
  assert.equal(result.sale.savedCount, 1, "Selling a stacked item must consume and save exactly one copy");
  assert.equal(result.sale.retained, true, "Selling an item must not revoke an earned achievement");
  assert.deepEqual(errors, []);
  console.log("inventory upgrade passed: real item threshold, purchase unlock, old-save stacks and single-item sale");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
