import fs from "node:fs";
import puppeteer from "puppeteer-core";

const CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export function browserExecutable() {
  const executable = CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!executable) {
    throw new Error("未找到 Chrome/Edge。请设置 PUPPETEER_EXECUTABLE_PATH。 ");
  }
  return executable;
}

export function launchBrowser(options = {}) {
  return puppeteer.launch({
    executablePath: browserExecutable(),
    headless: true,
    args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
    ...options,
  });
}
