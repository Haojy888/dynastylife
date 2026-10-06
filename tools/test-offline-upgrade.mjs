import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import vm from "node:vm";

// Execute the actual service worker with a shared CacheStorage and two releases.
const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const origin = "https://dynastylife.test";
const cacheStores = new Map();
const requests = [];
let release = "A";
let online = true;
let failingPath = "";
const urlOf = (input) => new URL(typeof input === "string" ? input : input.url, origin).href;

function responseFor(body, status = 200) {
  const response = new Response(body, { status });
  Object.defineProperty(response, "type", { value: "basic" });
  return response;
}

async function fetchResource(request) {
  if (!online) throw new TypeError("Network offline");
  const path = new URL(urlOf(request)).pathname;
  requests.push({ path, cache: request.cache });
  return responseFor(`${release}:${path}`, path === failingPath ? 503 : 200);
}

const caches = {
  async open(name) {
    if (!cacheStores.has(name)) cacheStores.set(name, new Map());
    const entries = cacheStores.get(name);
    return {
      async match(request) { return entries.get(urlOf(request))?.clone(); },
      async put(request, response) { entries.set(urlOf(request), response.clone()); },
      async addAll(inputs) {
        const responses = await Promise.all(inputs.map(fetchResource));
        if (responses.some((response) => !response.ok)) throw new TypeError("Precache failed");
        // Cache.addAll commits the entire batch only after every response succeeds.
        inputs.forEach((request, index) => entries.set(urlOf(request), responses[index].clone()));
      },
    };
  },
  async keys() { return [...cacheStores.keys()]; },
  async delete(name) { return cacheStores.delete(name); },
};

function worker(version) {
  const handlers = new Map();
  const calls = { claim: 0, skipWaiting: 0 };
  const context = vm.createContext({
    URL, Response, caches, fetch: fetchResource,
    Request: class extends Request {
      constructor(input, options) { super(urlOf(input), options); }
    },
    self: {
      location: { origin },
      addEventListener: (name, handler) => handlers.set(name, handler),
      clients: { claim: async () => { calls.claim += 1; } },
      skipWaiting: async () => { calls.skipWaiting += 1; },
    },
  });
  vm.runInContext(source.replace(/const CACHE_VERSION = "[^"]+";/, `const CACHE_VERSION = "${version}";`), context);
  return {
    calls,
    shellName: vm.runInContext("SHELL_CACHE", context),
    runtimeName: vm.runInContext("RUNTIME_CACHE", context),
    shell: Array.from(vm.runInContext("APP_SHELL", context)),
    async dispatch(name) {
      const pending = [];
      handlers.get(name)?.({ waitUntil: (promise) => pending.push(promise) });
      await Promise.all(pending);
    },
    async request(path, { navigate = false, range = false, method = "GET" } = {}) {
      const request = new Request(new URL(path, origin), {
        method, headers: range ? { range: "bytes=0-5" } : {},
      });
      if (navigate) Object.defineProperty(request, "mode", { value: "navigate" });
      const pending = [];
      let result;
      handlers.get("fetch")({
        request,
        waitUntil: (promise) => pending.push(promise),
        respondWith: (promise) => { result = promise; },
      });
      const response = await result;
      await Promise.all(pending);
      return response?.text();
    },
  };
}

const oldWorker = worker("test-A");
for (const path of oldWorker.shell) await access(new URL(`..${path}`, import.meta.url));
await caches.open("unrelated-app-cache");
await oldWorker.dispatch("install");
assert.ok(requests.every((request) => request.cache === "reload"), "Install must bypass stale HTTP cache");
await oldWorker.dispatch("activate");
assert.equal(oldWorker.calls.claim, 1, "First install must control the page for offline reload");
assert.equal(oldWorker.calls.skipWaiting, 0, "Install must never replace a worker used by a playing tab");

const corePaths = ["/index.html", "/styles.css", "/app.js", "/game-data.js", "/scene-engine.js", "/assets/vendor/pixi-8.19.0.min.js"];
release = "B";
const poisonedRuntime = await caches.open(oldWorker.runtimeName);
await poisonedRuntime.put("/app.js", responseFor("B:poisoned-runtime-app"));
const before = requests.length;
for (const path of corePaths) {
  assert.equal(await oldWorker.request(`${path}?refresh=1`), `A:${path}`, `Playing tab mixed releases at ${path}`);
}
assert.equal(await oldWorker.request("/?campaign=1", { navigate: true }), "A:/index.html");
assert.equal(requests.length, before, "Core resource reads must not refresh individual files");

const failedWorker = worker("test-failed");
failingPath = "/app.js";
await assert.rejects(failedWorker.dispatch("install"), /Precache failed/);
assert.equal(cacheStores.get(failedWorker.shellName).size, 0, "A failed upgrade must not leave partial assets");
assert.equal(await oldWorker.request("/app.js"), "A:/app.js");
failingPath = "";

const nextWorker = worker("test-B");
await nextWorker.dispatch("install");
assert.equal(nextWorker.calls.skipWaiting, 0, "An upgrade must remain waiting until old tabs close");
assert.ok(cacheStores.has(oldWorker.shellName), "Installing an upgrade deleted the active release");
assert.equal(await oldWorker.request("/styles.css"), "A:/styles.css");
online = false;
assert.equal(await oldWorker.request("/", { navigate: true }), "A:/index.html");
assert.equal(await oldWorker.request("/app.js"), "A:/app.js");

// Browser activation is simulated only after the old pages are closed.
await nextWorker.dispatch("activate");
assert.equal(cacheStores.has(oldWorker.shellName), false, "Old cache should be removed after safe activation");
assert.ok(cacheStores.has("unrelated-app-cache"), "Activation removed another app's cache");
assert.equal(await nextWorker.request("/", { navigate: true }), "B:/index.html");
for (const path of corePaths) assert.equal(await nextWorker.request(path), `B:${path}`);
assert.equal(await nextWorker.request("/assets/region-qingping.webp"), "B:/assets/region-qingping.webp");

online = true;
assert.equal(await nextWorker.request("/assets/visited-image.webp"), "B:/assets/visited-image.webp");
online = false;
assert.equal(await nextWorker.request("/assets/visited-image.webp"), "B:/assets/visited-image.webp", "Visited images must remain available offline");
assert.equal(await nextWorker.request("/sw.js"), undefined, "Worker updates must reach the network");
assert.equal(await nextWorker.request("https://other.test/image.webp"), undefined);
assert.equal(await nextWorker.request("/app.js", { range: true }), undefined);
assert.equal(await nextWorker.request("/app.js", { method: "POST" }), undefined);
console.log("offline upgrade passed: complete releases, safe activation, offline startup, independent image cache");
