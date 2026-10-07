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
    const baseline = JSON.stringify(state);
    const slot = currentSlot;
    const reset = () => {
      state = normalizeState(JSON.parse(baseline));
      currentSlot = slot;
      Object.assign(state, { age: 30, year: 30, currentEvent: null, eventResult: null, pendingAchievement: null });
      state.onboarding.seen = true;
      state.stats.money = 1000;
      state.stats.physique = 90;
      Object.assign(view, { screen: "game", page: "main", overlay: "" });
    };
    const medicineChapter = (stage = 0) => {
      state.career = allCareers().find((item) => careerKind(item) === "medicine");
      state.careerChapters.active = createCareerChapter("epidemic-dispensary");
      state.careerChapters.active.stage = stage;
      state.currentEvent = buildCareerChapterEvent();
    };

    reset();
    state.stats.physique = 3;
    state.inventory = ["药囊"];
    medicineChapter(1);
    chooseOption(state.currentEvent.children.findIndex((item) => item.id === "visit-patients"));
    const chapterDeath = { health: state.stats.physique, dead: state.dead, reason: state.deathReason, saved: loadSave(slot).dead, logs: state.log.filter((item) => item.title === "身后事").length };
    const afterDeath = JSON.stringify(state);
    useInventoryItem("药囊");
    const cannotRevive = JSON.stringify(state) === afterDeath;

    state.legacy = { funeral: "rites", dispute: "sole", inheritanceRate: 0.86 };
    save();
    state = loadSave(slot);
    save();
    const savedDeath = { legacy: state.legacy, logs: state.log.filter((item) => item.title === "身后事").length, reason: state.deathReason };

    reset();
    state.stats.physique = 1;
    state.stats.knowledge = 0;
    const random = Math.random;
    try {
      Math.random = () => 0;
      performPlaceAction("alchemyBrew");
    } finally { Math.random = random; }
    const ordinaryDeath = { health: state.stats.physique, dead: state.dead, saved: loadSave(slot).dead, year: state.year };

    reset();
    currentSlot = -1;
    state.stats.physique = 0;
    const noSlotSave = save();
    const noSlotDeath = state.dead && noSlotSave === false;
    reset();
    state.age = 100;
    save();
    const oldAgeDeath = state.dead && state.deathReason === "寿终正寝";

    reset();
    const imported = normalizeState(JSON.parse(baseline));
    imported.stats.physique = 0;
    writeSaveSlot(slot + 1, imported, { activate: false });
    const importUnchanged = !imported.dead && !JSON.parse(localStorage.getItem(slotKey(slot + 1))).dead && !state.dead;

    reset();
    medicineChapter();
    state.stats.money = 70;
    careerProgressFor().livelihood.resource = 5;
    state.currentEvent = buildCareerChapterEvent();
    const blockedIndex = state.currentEvent.children.findIndex((item) => item.id === "triage-clinic");
    const blockedUi = state.currentEvent.children[blockedIndex].disabled;
    const beforeBlocked = JSON.stringify(state);
    chooseOption(blockedIndex);
    resolveCareerChapter(state.currentEvent, { id: "triage-clinic" });
    const blockedUnchanged = JSON.stringify(state) === beforeBlocked;

    careerProgressFor().livelihood.resource = 6;
    state.dynasty.local.epidemic = 60;
    state.currentEvent = buildCareerChapterEvent();
    chooseOption(state.currentEvent.children.findIndex((item) => item.id === "triage-clinic"));
    const exactResource = { money: state.stats.money, resource: careerProgressFor().livelihood.resource, stage: state.careerChapters.active.stage, epidemic: state.dynasty.local.epidemic };

    reset();
    medicineChapter();
    state.stats.money = 0;
    careerProgressFor().livelihood.resource = 0;
    state.currentEvent = buildCareerChapterEvent();
    const retreatIndex = state.currentEvent.children.findIndex((item) => !item.disabled);
    const retreat = state.currentEvent.children[retreatIndex]?.id;
    chooseOption(retreatIndex);
    const noDeadlock = retreat === "private-retainer" && state.careerChapters.active.stage === 1;
    return { chapterDeath, cannotRevive, savedDeath, ordinaryDeath, noSlotDeath, oldAgeDeath, importUnchanged, blockedUi, blockedUnchanged, exactResource, noDeadlock };
  });
  assert.deepEqual(result.chapterDeath, { health: 0, dead: true, reason: "体魄耗尽", saved: true, logs: 1 });
  assert.equal(result.cannotRevive, true, "An item must not revive a protagonist who died in a career event");
  assert.deepEqual(result.savedDeath, { legacy: { funeral: "rites", dispute: "sole", inheritanceRate: 0.86 }, logs: 1, reason: "体魄耗尽" }, "Repeated saves and reloads must preserve funeral and estate decisions");
  assert.deepEqual(result.ordinaryDeath, { health: 0, dead: true, saved: true, year: 30 }, "Non-yearly place actions must settle fatal damage before saving");
  assert.equal(result.noSlotDeath, true, "Death must settle even when the current life has no save slot");
  assert.equal(result.oldAgeDeath, true);
  assert.equal(result.importUnchanged, true, "Writing another save slot must not apply current-life actions to the imported state");
  assert.equal(result.blockedUi && result.blockedUnchanged, true, "Insufficient medicine must be rejected by both the option and resolver");
  assert.deepEqual(result.exactResource, { money: 0, resource: 0, stage: 1, epidemic: 57 });
  assert.equal(result.noDeadlock, true, "A penniless, empty-stock character must retain a usable chapter choice");

  // Legacy saves from before the fatal-action fix may already contain zero health.
  const legacy = await page.evaluate(() => {
    const old = normalizeState(JSON.parse(JSON.stringify(state)));
    Object.assign(old, { dead: false, deathReason: "", currentEvent: null, eventResult: null, pendingSurprise: null, pendingAchievement: null, inventory: ["药囊"] });
    old.stats.physique = 0;
    return old;
  });
  const assertActivatedDeath = async (path) => {
    const snapshot = await page.evaluate(() => {
      const before = JSON.stringify(state);
      useInventoryItem("药囊");
      return { health: state.stats.physique, dead: state.dead, saved: loadSave(currentSlot).dead, unchanged: before === JSON.stringify(state) };
    });
    assert.deepEqual(snapshot, { health: 0, dead: true, saved: true, unchanged: true }, `${path} must settle a legacy zero-health life before it can heal`);
  };
  await page.evaluate((old) => writeSaveSlot(currentSlot, old, { activate: true }), legacy);
  await page.reload({ waitUntil: "domcontentloaded" });
  await assertActivatedDeath("Cold start");
  const target = await page.evaluate((old) => {
    const slot = currentSlot + 1;
    writeSaveSlot(slot, old, { activate: false });
    view.page = "save-manager";
    render();
    return { slot, untouched: !loadSave(slot).dead };
  }, legacy);
  assert.equal(target.untouched, true, "A noncurrent slot must remain unchanged until activation");
  await page.click(`[data-save-action="load"][data-save-slot="${target.slot}"]`);
  await assertActivatedDeath("Slot load");

  page.on("dialog", (dialog) => dialog.accept());
  await page.evaluate((old) => {
    pendingSaveImport = { state: old, targetSlot: currentSlot };
    view.page = "save-manager";
    render();
  }, legacy);
  await page.click('[data-action="confirm-save-import"]');
  await assertActivatedDeath("Current-slot import");
  await page.evaluate((old) => {
    localStorage.setItem(backupKey(currentSlot), JSON.stringify({ timestamp: Date.now(), raw: JSON.stringify(old) }));
    view.page = "save-manager";
    render();
  }, legacy);
  await page.click(`[data-save-action="restore-backup"][data-save-slot="${target.slot}"]`);
  await assertActivatedDeath("Current-slot backup restore");

  await page.setViewport({ width: 320, height: 844 });
  const assertNoOverflow = async (selector) => {
    const fits = await page.$eval(selector, (card) => document.documentElement.scrollWidth <= innerWidth + 1 && card.scrollWidth <= card.clientWidth + 1);
    assert.equal(fits, true, `${selector} must fit a 320px viewport`);
  };
  const deathSnapshot = () => page.evaluate(() => ({ dead: state.dead, health: state.stats.physique, money: state.stats.money, legacy: state.legacy, deathLogs: state.log.filter((item) => item.title === "身后事").length }));
  await page.click('.save-manager-card [data-action="back-main"]');
  await page.click('.death-card [data-funeral="simple"]');
  const estate = await deathSnapshot();
  assert.equal(estate.legacy.funeral, "simple");
  await assertNoOverflow(".death-card");
  const healthySlot = await page.evaluate((old) => {
    const slot = currentSlot + 1;
    writeSaveSlot(slot, { ...old, name: "另一健康人生", stats: { ...old.stats, physique: 90 } });
    return slot;
  }, legacy);
  await page.click('.death-card [data-action="open-save-manager"]');
  await assertNoOverflow(".save-manager-card");
  await page.click('.save-manager-card [data-action="back-main"]');
  assert.deepEqual(await deathSnapshot(), estate, "Returning from save management must preserve death and funeral decisions");
  await page.click('.death-card [data-action="open-save-manager"]');
  await page.click(`[data-save-action="load"][data-save-slot="${healthySlot}"]`);
  assert.deepEqual(await page.evaluate(() => ({ name: state.name, dead: state.dead, health: state.stats.physique })), { name: "另一健康人生", dead: false, health: 90 }, "A dead protagonist must be able to load another healthy life through the visible entry");

  await page.click('[data-action="toggle-tools"]');
  await page.click('[data-shortcut="menu"]');
  await page.click('[data-action="open-save-manager"]');
  await page.click(`[data-save-action="load"][data-save-slot="${target.slot}"]`);
  assert.deepEqual(await deathSnapshot(), estate, "Loading the former life must not revive it or reset its funeral");
  await page.evaluate((old) => {
    const backup = { ...old, name: "伤病前的健康备份", stats: { ...old.stats, physique: 75 } };
    localStorage.setItem(backupKey(currentSlot), JSON.stringify({ timestamp: Date.now(), raw: JSON.stringify(backup) }));
  }, legacy);
  await page.click('.death-card [data-action="open-save-manager"]');
  await page.click(`[data-save-action="restore-backup"][data-save-slot="${target.slot}"]`);
  assert.deepEqual(await page.evaluate(() => ({ name: state.name, dead: state.dead, health: state.stats.physique, savedHealth: loadSave(currentSlot).stats.physique })), { name: "伤病前的健康备份", dead: false, health: 75, savedHealth: 75 }, "The death-page entry must allow restoration of a healthy backup without changing the dead protagonist first");
  const displaced = await page.evaluate(() => {
    const old = loadSlotBackup(currentSlot).state;
    return { dead: old.dead, health: old.stats.physique, money: old.stats.money, legacy: old.legacy, deathLogs: old.log.filter((item) => item.title === "身后事").length };
  });
  assert.deepEqual(displaced, estate, "Restoring a healthy backup must preserve the displaced funeral and estate state in its backup");
  assert.deepEqual(errors, []);
  console.log("action integrity passed: fatal actions, no revival, saved estate, legacy activation, 320px death-page recovery and exact medicine costs");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
