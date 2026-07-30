(() => {
  "use strict";

  const ENGINE_VERSION = "pixi-8.19.0";
  const instances = new Set();
  let renderGeneration = 0;
  let webglAvailable;

  const THEMES = {
    spring: { mode: "petal", colors: [0xf4c1cf, 0xf0a7bb, 0xffe1e7], count: 18 },
    summer: { mode: "firefly", colors: [0xffe78b, 0xd7ef9b, 0xf7c966], count: 15 },
    autumn: { mode: "leaf", colors: [0xd69a43, 0xb76b35, 0xe1b765], count: 17 },
    winter: { mode: "snow", colors: [0xffffff, 0xdbeaf2, 0xbfd5e2], count: 21 },
    travel: { mode: "mist", colors: [0xe4eee7, 0xc7ddd7, 0xf4d9a4], count: 13 },
    prison: { mode: "ember", colors: [0xd69b55, 0xa96538, 0xf0c77a], count: 10 },
    jianghu: { mode: "ember", colors: [0xe0a253, 0xb54f37, 0xf1d08b], count: 14 },
    culture: { mode: "lantern", colors: [0xffd36b, 0xe98746, 0xffefbd], count: 16 },
    fortune: { mode: "incense", colors: [0xd8e5d8, 0x9fb8ad, 0xf1ddad], count: 12 },
    world: { mode: "ash", colors: [0xd8c8aa, 0xa99478, 0xead8b4], count: 14 },
    official: { mode: "dust", colors: [0xe7cb91, 0xc49a5c, 0xf1dfb5], count: 12 },
    study: { mode: "dust", colors: [0xdbe6df, 0xa9c1b7, 0xeee5c8], count: 11 },
    career: { mode: "dust", colors: [0xefc680, 0xbd9161, 0xe8d7b0], count: 12 },
    life: { mode: "dust", colors: [0xf3d9a4, 0xc7d9bd, 0xffefca], count: 12 },
    region: { mode: "mist", colors: [0xd9e8df, 0xb8d6cf, 0xf0d4a1], count: 13 },
  };

  function supportsWebGL() {
    if (webglAvailable !== undefined) return webglAvailable;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
        || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
      webglAvailable = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglAvailable = false;
    }
    return webglAvailable;
  }

  function canAnimate() {
    if (!window.PIXI?.Application || !window.PIXI?.Assets) return false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    if (navigator.connection?.saveData) return false;
    if (Number(navigator.deviceMemory || 4) <= 2) return false;
    return supportsWebGL();
  }

  function themeFor(node) {
    const season = node.dataset.sceneSeason;
    const type = node.dataset.dynastyScene;
    const key = node.dataset.sceneKey || "life";
    if (key === "culture" && THEMES[season]) return THEMES[season];
    if (type === "travel") return THEMES.travel;
    return THEMES[key] || THEMES.life;
  }

  function parseFocus(value = "50% 50%") {
    const parts = String(value).match(/[\d.]+%/g) || [];
    return {
      x: Math.max(0, Math.min(1, Number.parseFloat(parts[0] || "50") / 100)),
      y: Math.max(0, Math.min(1, Number.parseFloat(parts[1] || "50") / 100)),
    };
  }

  function fitSprite(instance) {
    const { node, app, sprite, texture, focus } = instance;
    if (!app?.renderer || !sprite || !texture) return;
    const width = Math.max(1, node.clientWidth);
    const height = Math.max(1, node.clientHeight);
    app.renderer.resize(width, height);
    const sourceWidth = Math.max(1, texture.width || texture.source?.width || width);
    const sourceHeight = Math.max(1, texture.height || texture.source?.height || height);
    const scale = Math.max(width / sourceWidth, height / sourceHeight) * 1.055;
    const renderedWidth = sourceWidth * scale;
    const renderedHeight = sourceHeight * scale;
    instance.baseScale = scale;
    instance.baseX = width / 2 + (0.5 - focus.x) * Math.max(0, renderedWidth - width);
    instance.baseY = height / 2 + (0.5 - focus.y) * Math.max(0, renderedHeight - height);
    sprite.scale.set(scale);
    sprite.position.set(instance.baseX, instance.baseY);
  }

  function drawParticle(pixi, mode, color, size) {
    const graphic = new pixi.Graphics();
    if (["rain", "incense"].includes(mode)) {
      graphic.roundRect(-size * 0.25, -size * 2.2, size * 0.5, size * 4.4, size * 0.25)
        .fill({ color, alpha: mode === "rain" ? 0.36 : 0.2 });
    } else if (["petal", "leaf"].includes(mode)) {
      graphic.ellipse(0, 0, size * 1.7, size * 0.72).fill({ color, alpha: 0.62 });
    } else {
      graphic.circle(0, 0, size).fill({ color, alpha: mode === "mist" ? 0.13 : 0.52 });
    }
    graphic.blendMode = ["firefly", "lantern", "ember"].includes(mode) ? "screen" : "normal";
    return graphic;
  }

  function resetParticle(particle, width, height, initial = false) {
    const { mode } = particle;
    particle.phase = Math.random() * Math.PI * 2;
    particle.spin = (Math.random() - 0.5) * 0.025;
    particle.speed = 0.18 + Math.random() * 0.42;
    particle.drift = (Math.random() - 0.5) * 0.32;
    particle.graphic.x = Math.random() * width;
    if (["ember", "incense"].includes(mode)) {
      particle.graphic.y = initial ? Math.random() * height : height + 12;
    } else {
      particle.graphic.y = initial ? Math.random() * height : -12;
    }
    if (mode === "mist") {
      particle.graphic.x = initial ? Math.random() * width : -30;
      particle.graphic.y = height * (0.18 + Math.random() * 0.7);
      particle.graphic.scale.set(3 + Math.random() * 5, 0.7 + Math.random());
    }
  }

  function createParticles(instance, theme) {
    const pixi = window.PIXI;
    const layer = new pixi.Container();
    const particles = [];
    const width = Math.max(1, instance.node.clientWidth);
    const height = Math.max(1, instance.node.clientHeight);
    const count = Math.min(theme.count, width < 520 ? Math.ceil(theme.count * 0.62) : theme.count);
    for (let index = 0; index < count; index += 1) {
      const size = theme.mode === "mist" ? 4 + Math.random() * 4 : 1.2 + Math.random() * 2.3;
      const color = theme.colors[index % theme.colors.length];
      const particle = { mode: theme.mode, graphic: drawParticle(pixi, theme.mode, color, size), phase: 0, spin: 0, speed: 0, drift: 0 };
      resetParticle(particle, width, height, true);
      layer.addChild(particle.graphic);
      particles.push(particle);
    }
    instance.particles = particles;
    instance.app.stage.addChild(layer);
  }

  function updateParticles(instance, delta) {
    const width = instance.node.clientWidth;
    const height = instance.node.clientHeight;
    for (const particle of instance.particles || []) {
      const item = particle.graphic;
      particle.phase += 0.018 * delta;
      if (["ember", "incense"].includes(particle.mode)) {
        item.y -= particle.speed * 0.75 * delta;
        item.x += (particle.drift + Math.sin(particle.phase) * 0.2) * delta;
        item.alpha = Math.max(0.08, Math.min(0.7, item.y / Math.max(1, height)));
        if (item.y < -16) resetParticle(particle, width, height);
      } else if (particle.mode === "mist") {
        item.x += particle.speed * 0.34 * delta;
        item.y += Math.sin(particle.phase) * 0.05 * delta;
        if (item.x > width + 40) resetParticle(particle, width, height);
      } else if (["firefly", "lantern"].includes(particle.mode)) {
        item.x += (particle.drift + Math.cos(particle.phase) * 0.2) * delta;
        item.y += Math.sin(particle.phase * 0.7) * 0.12 * delta;
        item.alpha = 0.22 + (Math.sin(particle.phase * 1.7) + 1) * 0.24;
        if (item.x < -12) item.x = width + 12;
        if (item.x > width + 12) item.x = -12;
      } else {
        item.y += particle.speed * delta;
        item.x += (particle.drift + Math.sin(particle.phase) * 0.18) * delta;
        item.rotation += particle.spin * delta;
        if (item.y > height + 16 || item.x < -20 || item.x > width + 20) resetParticle(particle, width, height);
      }
    }
  }

  function destroyInstance(instance) {
    if (!instance || instance.destroyed) return;
    instance.destroyed = true;
    instance.resizeObserver?.disconnect();
    instance.intersectionObserver?.disconnect();
    instance.node?.removeEventListener("pointermove", instance.onPointerMove);
    instance.node?.removeEventListener("pointerleave", instance.onPointerLeave);
    instance.node?.classList.remove("scene-engine-ready");
    try {
      instance.app?.destroy({ removeView: true }, { children: true, texture: false, textureSource: false });
    } catch {
      instance.app?.canvas?.remove();
    }
    instances.delete(instance);
  }

  async function mount(node, generation) {
    const src = node.dataset.sceneSrc;
    if (!src || !node.isConnected || node.clientWidth < 2 || node.clientHeight < 2) return;
    const pixi = window.PIXI;
    const app = new pixi.Application();
    const instance = {
      node,
      app,
      destroyed: false,
      focus: parseFocus(node.dataset.sceneFocus),
      targetX: 0,
      targetY: 0,
      pointerX: 0,
      pointerY: 0,
      particles: [],
    };
    instances.add(instance);
    node.dataset.sceneEngineState = "loading";
    try {
      await app.init({
        width: node.clientWidth,
        height: node.clientHeight,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: Math.min(1.5, window.devicePixelRatio || 1),
        preference: "webgl",
        powerPreference: "low-power",
        hello: false,
      });
      if (instance.destroyed || generation !== renderGeneration || !node.isConnected) return destroyInstance(instance);
      app.canvas.className = "dynasty-scene-canvas";
      app.canvas.setAttribute("aria-hidden", "true");
      node.appendChild(app.canvas);
      const texture = await pixi.Assets.load(src);
      if (instance.destroyed || generation !== renderGeneration || !node.isConnected) return destroyInstance(instance);
      const sprite = new pixi.Sprite(texture);
      sprite.anchor.set(0.5);
      instance.texture = texture;
      instance.sprite = sprite;
      app.stage.addChild(sprite);
      fitSprite(instance);
      createParticles(instance, themeFor(node));

      instance.onPointerMove = (event) => {
        const rect = node.getBoundingClientRect();
        instance.targetX = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
        instance.targetY = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
      };
      instance.onPointerLeave = () => {
        instance.targetX = 0;
        instance.targetY = 0;
      };
      node.addEventListener("pointermove", instance.onPointerMove, { passive: true });
      node.addEventListener("pointerleave", instance.onPointerLeave, { passive: true });
      instance.resizeObserver = new ResizeObserver(() => fitSprite(instance));
      instance.resizeObserver.observe(node);
      instance.intersectionObserver = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting && !document.hidden) app.ticker.start();
        else app.ticker.stop();
      }, { rootMargin: "120px" });
      instance.intersectionObserver.observe(node);
      app.ticker.add((ticker) => {
        const delta = Math.min(2.4, ticker.deltaTime || 1);
        instance.pointerX += (instance.targetX - instance.pointerX) * 0.035 * delta;
        instance.pointerY += (instance.targetY - instance.pointerY) * 0.035 * delta;
        const breathe = Math.sin(performance.now() / 4200) * 0.0025;
        sprite.scale.set(instance.baseScale * (1 + breathe));
        sprite.position.set(instance.baseX + instance.pointerX * 7, instance.baseY + instance.pointerY * 4);
        updateParticles(instance, delta);
      });
      node.dataset.sceneEngineState = "ready";
      node.classList.add("scene-engine-ready");
    } catch {
      node.dataset.sceneEngineState = "fallback";
      destroyInstance(instance);
    }
  }

  function beforeRender() {
    renderGeneration += 1;
    [...instances].forEach(destroyInstance);
  }

  function sync(root = document) {
    const generation = renderGeneration;
    const targets = [...root.querySelectorAll("[data-dynasty-scene]")];
    if (!canAnimate()) {
      targets.forEach((node) => { node.dataset.sceneEngineState = "fallback"; });
      return;
    }
    targets.slice(0, 3).forEach((node) => mount(node, generation));
  }

  function status() {
    return {
      version: ENGINE_VERSION,
      enabled: canAnimate(),
      mounted: [...instances].filter((item) => !item.destroyed).length,
      ready: document.querySelectorAll('[data-scene-engine-state="ready"]').length,
      fallbacks: document.querySelectorAll('[data-scene-engine-state="fallback"]').length,
    };
  }

  document.documentElement.dataset.sceneEngine = ENGINE_VERSION;
  window.DynastySceneEngine = Object.freeze({ version: ENGINE_VERSION, beforeRender, sync, status });
})();
