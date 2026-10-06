// 发布 HTML、脚本或样式改动时一起递增，触发整组升级。
const CACHE_VERSION = "2026-10-06-1";
const CACHE_PREFIX = "dynastylife-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;

// 首次访问后即可离线进入游戏；其余同源图片会在游玩过程中自动加入运行时缓存。
const APP_SHELL = [
  "/index.html",
  "/styles.css",
  "/scene-engine.js",
  "/game-data.js",
  "/app.js",
  "/assets/vendor/pixi-8.19.0.min.js",
  "/assets/vendor/PIXI-LICENSE.txt",
  "/manifest.webmanifest",
  "/assets/favicon-32.png",
  "/assets/favicon-192.png",
  "/assets/favicon-512.png",
  "/assets/apple-touch-icon.png",
  "/assets/img_uispriteatlas__Background.webp",
  "/assets/img_dialogspriteatlas__GeneralBackground.webp",
  "/assets/premium-icons/guide-book.webp",
  "/assets/premium-icons/carriage.webp",
  "/assets/premium-icons/satchel.webp",
  "/assets/premium-icons/ledger-chest.webp",
  "/assets/player-avatar-male-1.webp",
  "/assets/player-avatar-male-2.webp",
  "/assets/player-avatar-male-3.webp",
  "/assets/player-avatar-male-4.webp",
  "/assets/courtesan-avatar-1.webp",
  "/assets/courtesan-avatar-2.webp",
  "/assets/courtesan-avatar-3.webp",
  "/assets/courtesan-avatar-4.webp",
  "/assets/event-life.webp",
  "/assets/event-study.webp",
  "/assets/event-official.webp",
  "/assets/event-career.webp",
  "/assets/event-culture.webp",
  "/assets/event-prison.webp",
  "/assets/event-jianghu.webp",
  "/assets/event-world.webp",
  "/assets/event-clan.webp",
  "/assets/event-region.webp",
  "/assets/event-fortune.webp",
  "/assets/region-qingping.webp",
];
const SHELL_PATHS = new Set(APP_SHELL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // 整组下载成功才安装；绕过 HTTP 缓存，避免把旧脚本混进新版外壳。
      .then((cache) => cache.addAll(APP_SHELL.map((path) => new Request(path, { cache: "reload" })))),
  );
  // 升级等待旧页面全部关闭；正在游玩的页面始终使用原来的整组资源。
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function updateRuntimeCache(request) {
  const response = await fetch(request);
  if (response?.ok && response.type === "basic") {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function cachedWithRefresh(request, event) {
  const runtime = await caches.open(RUNTIME_CACHE);
  // 只有外壳之外的图片允许独立更新，HTML、脚本、样式不进入运行时缓存。
  const cached = await runtime.match(request);
  const refresh = updateRuntimeCache(request);
  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }
  return refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || SHELL_PATHS.has(url.pathname)) {
    const path = request.mode === "navigate" ? "/index.html" : url.pathname;
    event.respondWith(caches.open(SHELL_CACHE).then(async (cache) => (
      await cache.match(path) || Response.error()
    )));
    return;
  }

  if (request.destination === "image" || /\.(?:png|jpe?g|webp|gif|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cachedWithRefresh(request, event));
  }
});
