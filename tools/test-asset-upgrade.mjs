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
    Object.assign(state, { age: 30, year: 30, prisonYears: 0, currentEvent: null, eventResult: null, pendingAchievement: null });
    state.onboarding.seen = true;
    Object.assign(view, { screen: "game", page: "assets", overlay: "" });
    const asset = { name: "测试小院", price: 200, income: 10, condition: 115, level: 1, mode: "rent", regionId: "qingping", location: "清平县" };
    state.assets = [asset];
    state.stats.money = 7;
    render();
    const quote = assetRepairQuote(asset);
    const insufficientUi = document.querySelector('[data-asset-action="repair"]').disabled;
    const insufficientBefore = JSON.stringify(state);
    manageAsset(0, "repair");
    const insufficientUnchanged = JSON.stringify(state) === insufficientBefore;

    state.stats.money = 100;
    render();
    const label = document.querySelector('[data-asset-action="repair"]').textContent;
    const random = Math.random;
    Math.random = () => 0.5;
    const incomeBefore = annualAssetIncome();
    document.querySelector('[data-asset-action="repair"]').click();
    const repaired = { condition: asset.condition, money: state.stats.money, incomeBefore, incomeAfter: annualAssetIncome(), ledger: state.ledger[0].amount, delta: state.lastDeltas.find((item) => item.label === "家产状态")?.value, text: state.eventResult.text };
    state.eventResult = null;
    state.pendingAchievement = null;
    view.page = "assets";
    render();
    const fullUi = document.querySelector('[data-asset-action="repair"]').disabled;
    const fullBefore = JSON.stringify(state);
    manageAsset(0, "repair");
    const fullUnchanged = JSON.stringify(state) === fullBefore;

    asset.condition = 115;
    state.stats.money = 1000;
    Math.random = () => 0;
    manageAsset(0, "expand");
    const expanded = { condition: asset.condition, money: state.stats.money, level: asset.level, income: asset.income };
    asset.condition = 3;
    manageAsset(0, "expand");
    const lowerBound = asset.condition;
    asset.condition = 100;
    manageAsset(0, "repair");
    const restoredCondition = loadSave(currentSlot).assets[0].condition;
    Math.random = random;
    return { quote, insufficientUi, insufficientUnchanged, label, repaired, fullUi, fullUnchanged, expanded, lowerBound, restoredCondition };
  });
  assert.deepEqual(result.quote, { condition: 115, amount: 5, cost: 8 }, "Only five remaining condition points should be billed");
  assert.equal(result.insufficientUi && result.insufficientUnchanged, true, "Unaffordable repairs must be blocked in both UI and handler");
  assert.ok(result.label.includes("+5") && result.label.includes("8"), "The repair button must disclose actual improvement and price");
  assert.equal(result.repaired.condition, 120, "Repairing condition 115 must improve it to 120, never lower it to 100");
  assert.equal(result.repaired.money, 92);
  assert.equal(result.repaired.ledger, -8);
  assert.equal(result.repaired.delta, 5);
  assert.ok(result.repaired.incomeAfter >= result.repaired.incomeBefore, "Repairing a property must not reduce its annual income under identical conditions");
  assert.ok(result.repaired.text.includes("115 → 120"));
  assert.equal(result.fullUi && result.fullUnchanged, true, "A full-condition property must not consume money or create a repair event");
  assert.deepEqual(result.expanded, { condition: 111, money: 880, level: 2, income: 21 }, "Expansion must apply its stated wear without truncating all condition above 100");
  assert.equal(result.lowerBound, 0);
  assert.equal(result.restoredCondition, 120, "Saved properties must preserve the 120 condition ceiling");
  assert.deepEqual(errors, []);
  console.log("asset upgrade passed: condition 120, proportional repair cost, no-op guard, expansion and save reload");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
