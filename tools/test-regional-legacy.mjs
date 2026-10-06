import assert from "node:assert/strict";
import { createStaticServer } from "./serve.mjs";
import { launchBrowser } from "./browser.mjs";

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
let browser;
try {
  browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(() => {
    startLife();
    state.name = "李济民";
    state.age = 80;
    state.year = 80;
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingAchievement = null;
    state.pendingSurprise = null;
    state.onboarding.seen = true;
    state.location = "清平县";
    state.regional = createRegionalState();
    Object.assign(view, { screen: "game", page: "regions", overlay: "" });
    const oldSave = normalizeRegionalState({ residenceId: "qingping" });
    const oldCompatible = Object.values(oldSave.regions).every((region) => region.legacies.length === 0);
    const invalid = [establishRegionalLegacy("unknown", "qingping"), establishRegionalLegacy("granary", "unknown")];
    const first = establishRegionalLegacy("granary", "qingping");
    const second = establishRegionalLegacy("dispensary", "qingping");
    const founder = JSON.parse(JSON.stringify(state.regional.regions.qingping.legacies));
    const logCount = state.log.length;
    const chronicleCount = state.regional.chronicle.length;
    state.name = "后来的人";
    const repeated = establishRegionalLegacy("granary", "qingping");
    state.name = "李济民";
    const creation = {
      first, second, repeated,
      unchanged: JSON.stringify(state.regional.regions.qingping.legacies) === JSON.stringify(founder),
      noRepeatedLog: logCount === state.log.length && chronicleCount === state.regional.chronicle.length,
      recorded: state.log.some((entry) => entry.title === "乡里遗产 · 义仓") && state.regional.chronicle.some((entry) => entry.title === "药庐落成"),
    };
    const malformed = JSON.parse(JSON.stringify(state.regional));
    malformed.regions.qingping.legacies.push({ ...founder[0], founderName: "重复者", extra: "丢弃" }, { kind: "unknown" });
    malformed.regions.qingping.legacies[1].extra = true;
    const normalized = normalizeRegionalState(malformed).regions.qingping.legacies;
    establishRegionalLegacy("granary", "yunzhou");
    state.stats.money = 100;
    state.stats.physique = 99;
    const ledgerCount = state.ledger.length;
    const deltas = [];
    advanceRegionalYear(deltas);
    const annual = { money: state.stats.money, health: state.stats.physique, ledgerGain: state.ledger.length - ledgerCount, moneyDelta: deltas.find((delta) => delta.stat === "money")?.value, healthDelta: deltas.find((delta) => delta.stat === "physique")?.value, popup: state.eventResult };
    advanceRegionalYear(deltas);
    const repeat = { money: state.stats.money, health: state.stats.physique, ledgerGain: state.ledger.length - ledgerCount };
    state.location = "云州";
    advanceRegionalYear(deltas);
    const crossRegion = { money: state.stats.money, ledgerGain: state.ledger.length - ledgerCount };
    state.year += 1;
    state.age += 1;
    state.stats.physique = 95;
    advanceRegionalYear([]);
    const nextRegion = { money: state.stats.money, health: state.stats.physique, ledgerTitle: state.ledger[0].title, ledgerLocation: state.ledger[0].text.includes("云州") };
    state.dead = true;
    state.year += 1;
    const markerBeforeDeath = state.regional.lastAnnualYear;
    advanceRegionalYear([]);
    const dead = { money: state.stats.money, health: state.stats.physique, markerUnchanged: markerBeforeDeath === state.regional.lastAnnualYear };

    // 用真实继承入口验证父辈 82 年的标记不会阻止 20 岁后人领取。
    state.location = "清平县";
    const heir = normalizeChild({ id: "legacy-heir", name: "李承业", age: 20, gender: "male", alive: true, physique: 80 }, "李");
    state.family.children = [heir];
    state.legacy = { funeral: "simple", dispute: "none", inheritanceRate: 0.78 };
    inheritFromChild(heir.id);
    const markerAfterInheritance = state.regional.lastAnnualYear;
    const inheritedFounder = JSON.parse(JSON.stringify(state.regional.regions.qingping.legacies));
    state.stats.money = 200;
    state.stats.physique = 99;
    state.year += 1;
    state.age += 1;
    advanceRegionalYear([]);
    advanceRegionalYear([]);
    const inheritance = { name: state.name, generation: state.lineage.generation, markerAfterInheritance, founderPreserved: JSON.stringify(inheritedFounder) === JSON.stringify(founder), money: state.stats.money, health: state.stats.physique };

    // 妻承夫业仍是同一代，也必须重置按自身年龄计年的标记。
    const widow = normalizePartner({ id: "legacy-widow", name: "王晚晴", age: 18, gender: "female", alive: true, physique: 88 }, "王", "妻子", "spouse");
    state.family.spouse = widow.name;
    state.family.spouseMeta = widow;
    state.dead = true;
    inheritFromChild("spouse-heir");
    state.stats.money = 300;
    state.stats.physique = 100;
    const widowMarker = state.regional.lastAnnualYear;
    state.year += 1;
    state.age += 1;
    const widowDeltas = [];
    advanceRegionalYear(widowDeltas);
    const spouse = { name: state.name, generation: state.lineage.generation, marker: widowMarker, money: state.stats.money, health: state.stats.physique, healthDelta: widowDeltas.some((delta) => delta.stat === "physique") };
    state.currentEvent = null;
    state.eventResult = null;
    state.pendingSurprise = null;
    state.onboarding.seen = true;
    state.regional.selectedId = "qingping";
    Object.assign(view, { page: "regions", overlay: "" });
    save();
    render();
    const display = document.querySelector(".regional-legacies")?.textContent || "";
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    return { oldCompatible, invalid, creation, normalized, annual, repeat, crossRegion, nextRegion, dead, inheritance, spouse, display, overflow };
  });
  assert.equal(result.oldCompatible, true);
  assert.deepEqual(result.invalid, ["", ""]);
  assert.ok(result.creation.first.includes("建起了义仓") && result.creation.second.includes("建起了药庐"));
  assert.ok(result.creation.repeated.includes("已有第 1 代李济民"));
  assert.equal(result.creation.unchanged && result.creation.noRepeatedLog && result.creation.recorded, true);
  assert.deepEqual(result.normalized, [
    { kind: "granary", founderName: "李济民", founderGeneration: 1, foundedYear: 80 },
    { kind: "dispensary", founderName: "李济民", founderGeneration: 1, foundedYear: 80 },
  ]);
  assert.deepEqual(result.annual, { money: 108, health: 100, ledgerGain: 1, moneyDelta: 8, healthDelta: 1, popup: null });
  assert.deepEqual(result.repeat, { money: 108, health: 100, ledgerGain: 1 });
  assert.deepEqual(result.crossRegion, { money: 108, ledgerGain: 1 });
  assert.deepEqual(result.nextRegion, { money: 116, health: 95, ledgerTitle: "义仓口粮", ledgerLocation: true });
  assert.deepEqual(result.dead, { money: 116, health: 95, markerUnchanged: true });
  assert.deepEqual(result.inheritance, { name: "李承业", generation: 2, markerAfterInheritance: 19, founderPreserved: true, money: 208, health: 100 });
  assert.deepEqual(result.spouse, { name: "王晚晴", generation: 2, marker: 17, money: 308, health: 100, healthDelta: false });
  assert.ok(result.display.includes("李济民") && result.display.includes("第 1 代") && result.display.includes("8 铜钱") && result.display.includes("体魄 +1"));
  assert.equal(result.overflow, false);
  await page.reload({ waitUntil: "domcontentloaded" });
  const restored = await page.evaluate(() => {
    const before = { money: state.stats.money, health: state.stats.physique };
    advanceRegionalYear([]);
    return { count: state.regional.regions.qingping.legacies.length, founder: state.regional.regions.qingping.legacies[0].founderName, unchanged: before.money === state.stats.money && before.health === state.stats.physique };
  });
  assert.deepEqual(restored, { count: 2, founder: "李济民", unchanged: true }, "存档刷新应保留创办者和领取标记");
  assert.deepEqual(errors, []);
  console.log("regional legacy passed: old saves, deduplication, annual benefits, health cap, travel limits, death, child/spouse inheritance, UI and reload");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
