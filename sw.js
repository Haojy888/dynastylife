const CACHE_VERSION = "2026-07-30-1";
const CACHE_PREFIX = "dynastylife-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;

// 首次访问后即可离线进入游戏；其余同源图片会在游玩过程中自动加入运行时缓存。
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/game-data.js",
  "/app.js",
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
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
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
  const shell = await caches.open(SHELL_CACHE);
  const runtime = await caches.open(RUNTIME_CACHE);
  // 安装缓存负责离线兜底，运行时缓存保存最近一次联网拿到的新版本。
  // 优先读取运行时缓存，避免后台更新成功后仍长期命中旧的安装版本。
  const cached = await runtime.match(request) || await shell.match(request);
  const refresh = updateRuntimeCache(request);
  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }
  try {
    return await refresh;
  } catch (error) {
    if (request.mode === "navigate") return shell.match("/");
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(cachedWithRefresh(request, event));
    return;
  }

  event.respondWith(cachedWithRefresh(request, event));
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
