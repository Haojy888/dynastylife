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
  const dialogs = [];
  let acceptConfirm = true;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    if (dialog.type() !== "confirm" || acceptConfirm) await dialog.accept();
    else await dialog.dismiss();
  });
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: "networkidle0" });
  await page.click('[data-action="start-life"]');
  const original = await page.evaluate(() => {
    state.onboarding.seen = true;
    state.currentEvent = null;
    state.eventResult = null;
    const meta = [];
    for (let slot = 0; slot < 3; slot += 1) {
      const saved = { ...JSON.parse(JSON.stringify(state)), name: `原档${slot}`, age: 12 + slot, saveSlot: slot };
      localStorage.setItem(`dynasty-life-slot-${slot}`, JSON.stringify(saved));
      meta.push({ slot, name: saved.name, age: saved.age, timestamp: 300 - slot * 100, title: "进行中" });
    }
    localStorage.setItem("dynasty-life-save-meta", JSON.stringify(meta));
    localStorage.setItem("dynasty-life-active-slot", "0");
    return [0, 1, 2].map((slot) => localStorage.getItem(`dynasty-life-slot-${slot}`));
  });
  const slotNames = () => page.evaluate(() => [0, 1, 2].map((slot) => JSON.parse(localStorage.getItem(`dynasty-life-slot-${slot}`)).name));
  const openManager = () => page.evaluate(() => { view.page = "save-manager"; view.overlay = ""; render(); });
  const loadFile = (name, target = "", patch = {}) => page.evaluate(async (name, target, patch) => {
    const input = document.querySelector("#save-import-input");
    input.dataset.importTargetSlot = target;
    const data = new DataTransfer();
    data.items.add(new File([JSON.stringify({ ...JSON.parse(JSON.stringify(state)), name, age: 42, ...patch })], "import.json", { type: "application/json" }));
    input.files = data.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 80));
  }, name, target, patch);

  console.log("save upgrade: resume selected slot and fall back to the most recent save");
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.deepEqual(await page.evaluate(() => [currentSlot, state.name]), [0, "原档0"]);
  await openManager();
  await page.click('[data-save-action="load"][data-save-slot="1"]');
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.deepEqual(await page.evaluate(() => [currentSlot, state.name]), [1, "原档1"], "读取后未操作就刷新，也应恢复所选槽位");
  await page.evaluate(() => localStorage.removeItem("dynasty-life-active-slot"));
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.deepEqual(await page.evaluate(() => [currentSlot, state.name]), [0, "原档0"], "缺少活动标记应按保存时间恢复");

  console.log("save upgrade: full slots require selection and overwrite confirmation");
  await openManager();
  await loadFile("导入人生");
  assert.equal(await page.$eval("#save-import-target", (select) => select.value), "");
  assert.deepEqual(await slotNames(), ["原档0", "原档1", "原档2"], "选择文件时不应写入任何槽位");
  await page.click('[data-action="confirm-save-import"]');
  assert.ok(dialogs.at(-1).includes("选择目标"));
  await page.select("#save-import-target", "1");
  acceptConfirm = false;
  await page.click('[data-action="confirm-save-import"]');
  assert.deepEqual(await slotNames(), ["原档0", "原档1", "原档2"], "取消覆盖确认后原档必须保留");
  acceptConfirm = true;
  await page.click('[data-action="confirm-save-import"]');
  assert.deepEqual(await slotNames(), ["原档0", "导入人生", "原档2"]);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("dynasty-life-slot-1-backup")).raw), original[1], "备份必须完整保留覆盖前原文");

  console.log("save upgrade: restore a persisted backup and preserve the displaced save");
  await page.reload({ waitUntil: "domcontentloaded" });
  await openManager();
  await page.click('[data-save-action="restore-backup"][data-save-slot="1"]');
  assert.deepEqual(await slotNames(), ["原档0", "原档1", "原档2"]);
  assert.equal(await page.evaluate(() => loadSlotBackup(1).state.name), "导入人生");
  await loadFile("当前槽导入", "0");
  assert.equal(await page.$eval("#save-import-target", (select) => select.value), "0", "FileReader 完成后应保留指定导入目标");
  await page.click('[data-action="confirm-save-import"]');
  assert.equal(await page.evaluate(() => { save(); return state.name; }), "当前槽导入");
  assert.equal((await slotNames())[0], "当前槽导入", "导入当前槽后自动保存不能写回旧内存状态");

  console.log("save upgrade: imported and restored pending surprises remain actionable");
  await loadFile("待续惊喜", "0", { pendingSurprise: { title: "导入的奇遇", text: "请处理这件往事。" } });
  await page.click('[data-action="confirm-save-import"]');
  assert.equal(await page.$eval("dialog[open] h2", (title) => title.textContent), "导入的奇遇");
  await page.click('[data-action="close-surprise"]');
  assert.equal(await page.evaluate(() => yearAdvanceBlockReason()), "", "导入当前档不能留下看不见的惊喜锁住流年");
  await page.evaluate(() => {
    const backup = { ...JSON.parse(JSON.stringify(state)), pendingSurprise: { title: "备份的奇遇", text: "旧事仍待回答。" } };
    localStorage.setItem(backupKey(currentSlot), JSON.stringify({ timestamp: Date.now(), raw: JSON.stringify(backup) }));
    render();
  });
  await page.click('[data-save-action="restore-backup"][data-save-slot="0"]');
  assert.equal(await page.$eval("dialog[open] h2", (title) => title.textContent), "备份的奇遇");
  await page.click('[data-action="close-surprise"]');
  assert.equal(await page.evaluate(() => yearAdvanceBlockReason()), "", "恢复当前档后应能处理惊喜并继续流年");

  console.log("save upgrade: failed backup prevents overwrite");
  const beforeFailure = (await slotNames())[2];
  await loadFile("不应覆盖", "2");
  await page.evaluate(() => {
    window.originalStorageSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.endsWith("-backup")) throw new DOMException("audit quota", "QuotaExceededError");
      return window.originalStorageSetItem.call(this, key, value);
    };
  });
  await page.click('[data-action="confirm-save-import"]');
  assert.equal((await slotNames())[2], beforeFailure);
  assert.ok(await page.$("#save-status-notice"));
  await page.evaluate(() => {
    Storage.prototype.setItem = function (key, value) {
      if (key === "dynasty-life-save-meta") throw new DOMException("audit metadata quota", "QuotaExceededError");
      return window.originalStorageSetItem.call(this, key, value);
    };
  });
  await page.click('[data-action="confirm-save-import"]');
  assert.equal((await slotNames())[2], beforeFailure, "索引写入失败时也不能先覆盖存档正文");
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSetItem; });
  await page.click('[data-action="confirm-save-import"]');
  assert.equal((await slotNames())[2], "不应覆盖");
  assert.equal(await page.$("#save-status-notice"), null, "成功重试导入后应移除对应失败提示");

  console.log("save upgrade: failed restore preserves its only backup even when rollback cannot write");
  const beforeRestore = await page.evaluate(() => {
    const raw = localStorage.getItem(slotKey(2));
    const backup = { ...JSON.parse(raw), name: "唯一旧备份" };
    localStorage.setItem(backupKey(2), JSON.stringify({ timestamp: Date.now(), raw: JSON.stringify(backup) }));
    render();
    let failed = false;
    Storage.prototype.setItem = function (key, value) {
      if (failed || key === slotKey(2)) {
        failed = true;
        throw new DOMException("audit persistent quota", "QuotaExceededError");
      }
      return window.originalStorageSetItem.call(this, key, value);
    };
    return raw;
  });
  await page.click('[data-save-action="restore-backup"][data-save-slot="2"]');
  assert.equal(await page.evaluate(() => localStorage.getItem(slotKey(2))), beforeRestore, "恢复失败时当前存档必须仍在");
  assert.equal(await page.evaluate(() => loadSlotBackup(2)?.state.name), "唯一旧备份", "恢复失败且回滚无法写入时，唯一备份仍须可读取");
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSetItem; render(); });
  await page.$eval('[data-save-action="restore-backup"][data-save-slot="2"]', (button) => button.scrollIntoView({ block: "center" }));
  assert.equal(await page.$eval('[data-save-action="restore-backup"][data-save-slot="2"]', (button) => {
    const rect = button.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest("button") === button;
  }), true, "固定错误条不能挡住最后一个槽位的恢复按钮");
  assert.equal(await page.evaluate(() => {
    const saved = loadSave(2);
    saved.age += 1;
    return writeSaveSlot(2, saved);
  }), true);
  assert.equal(await page.evaluate(() => loadSlotBackup(2)?.state.name), "唯一旧备份", "失败后继续自动保存也不能误丢待恢复的旧备份");
  await page.evaluate(() => render());
  await page.click('[data-save-action="restore-backup"][data-save-slot="2"]');
  assert.equal((await slotNames())[2], "唯一旧备份", "恢复写入权限后仍能重试原备份");
  assert.equal(await page.evaluate(() => loadSlotBackup(2)?.state.name), JSON.parse(beforeRestore).name);

  console.log("save upgrade: failed autosave remains visible and exports the latest in-memory progress");
  const failed = await page.evaluate(() => {
    state.age = 51;
    view.overlay = "profile";
    render();
    Storage.prototype.setItem = function () { throw new DOMException("audit quota", "QuotaExceededError"); };
    const saved = save();
    render();
    const createObjectURL = URL.createObjectURL;
    const anchorClick = HTMLAnchorElement.prototype.click;
    let exportCount = 0;
    URL.createObjectURL = (blob) => { exportCount += 1; window.exportedProgress = blob; return "blob:audit-export"; };
    HTMLAnchorElement.prototype.click = function () {};
    const button = document.querySelector('#save-status-notice [data-action="export"]');
    button.focus();
    const rect = button.getBoundingClientRect();
    const reachable = document.activeElement === button && !!document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest("#save-status-notice");
    button.click();
    URL.createObjectURL = createObjectURL;
    HTMLAnchorElement.prototype.click = anchorClick;
    return { saved, reachable, exportCount, warning: document.querySelector("#save-status-notice")?.textContent, storedAge: JSON.parse(localStorage.getItem("dynasty-life-slot-0")).age };
  });
  assert.equal(failed.saved, false);
  assert.equal(failed.reachable, true, "模态资料窗内保存失败后，警告和导出按钮不能落到 inert 背景里");
  assert.equal(failed.exportCount, 1, "模态窗内导出按钮不能被 app 和 document 重复处理");
  assert.ok(failed.warning.includes("不要刷新"));
  assert.equal(failed.storedAge, 42, "写入失败必须保留旧存档");
  assert.equal(await page.evaluate(async () => JSON.parse(await window.exportedProgress.text()).age), 51, "导出应包含最新内存进度");
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSetItem; });
  await page.click('#save-status-notice [data-action="retry-save"]');
  assert.equal(await page.$("#save-status-notice"), null);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("dynasty-life-slot-0")).age), 51);

  console.log("save upgrade: a new life with full slots stays in memory until a slot is chosen");
  const beforeNewLife = await slotNames();
  await page.evaluate(() => startLife());
  assert.equal(await page.evaluate(() => currentSlot), -1);
  assert.deepEqual(await slotNames(), beforeNewLife);
  assert.ok(await page.$('#save-status-notice [data-action="export"]'));
  const legacyMigration = await page.evaluate(() => {
    const legacy = JSON.stringify({ ...state, name: "兼容旧档" });
    localStorage.clear();
    localStorage.setItem("dynasty-life-web-modern-v1", legacy);
    Storage.prototype.setItem = function (key, value) {
      if (key === "dynasty-life-save-meta") throw new DOMException("audit migration quota", "QuotaExceededError");
      return window.originalStorageSetItem.call(this, key, value);
    };
    const restored = migrateOldSave();
    Storage.prototype.setItem = window.originalStorageSetItem;
    return { name: restored?.name, retained: localStorage.getItem("dynasty-life-web-modern-v1") === legacy, slotWritten: localStorage.getItem("dynasty-life-slot-0") !== null };
  });
  assert.deepEqual(legacyMigration, { name: "兼容旧档", retained: true, slotWritten: false }, "迁移未完整保存时必须保留旧档并允许导出页面进度");
  assert.deepEqual(errors, [], "浏览器不应出现未处理异常");
  console.log("save upgrade passed: selection, confirmation, backup, recovery, resume and failed-save export");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
