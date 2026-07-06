// 诊断移动端横向溢出:找出超出视口宽度的元素
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto("http://127.0.0.1:5199/", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));

const report = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const wide = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 1 || r.right > vw + 1) {
      wide.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal ? el.className.baseVal : el.className || "").toString().slice(0, 60),
        w: Math.round(r.width),
        right: Math.round(r.right),
      });
    }
  });
  return {
    vw,
    scrollW: document.documentElement.scrollWidth,
    bodyScrollW: document.body.scrollWidth,
    wide: wide.slice(0, 25),
  };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
