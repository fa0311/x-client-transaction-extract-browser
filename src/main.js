// @ts-check

const { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");
const { decodeTransactionId, generateTransactionId } = require("x-client-transaction-id-generater");

/**
 * @param {string} indexSvg
 * @param {string | undefined} verification
 * @returns {Promise<void>}
 */
const evaluateSetup = async (indexSvg, verification) => {
  const u = undefined;
  const ondemand = Object.values(globalThis["webpackChunk_twitter_responsive_web"].find(([[name]]) => name == "ondemand.s")[1])[0];
  const [fn, that] = await new Promise((res) =>
    ondemand(u, u, new Proxy(() => u, { get: (t, p) => (_, e) => p === "d" ? res([e["default"], e]) : u }))
  );
  document.body.appendChild(document.createElement("div")).innerHTML = indexSvg;
  if (verification) {
    document.querySelector("[name^=tw]")?.setAttribute("content", verification);
  }
  globalThis.elonmusk_114514 = fn()();
};

/**
 * @param {string} method
 * @param {string} url
 * @returns {Promise<any>}
 */
const evaluate = async (method, url) => {
  return await globalThis.elonmusk_114514(url, method);
};

/**
 * @returns {Promise<void>}
 */
const hookEvaluateSetup = async () => {
  globalThis.elonmusk_1145141919810 = [];
  const originalDigest = crypto.subtle.digest.bind(crypto.subtle);
  crypto.subtle.digest = async (...args) => {
    const [algo, data] = args;
    const result = await originalDigest(...args);

    globalThis.elonmusk_1145141919810.push({ algo, data, result });
    return result;
  };
};

/**
 * @param {string} method
 * @param {string} url
 * @returns {Promise<string>}
 */
const getKeyEvaluate = async (method, url) => {
  await globalThis.elonmusk_114514(url, method);
  const last = globalThis.elonmusk_1145141919810[globalThis.elonmusk_1145141919810.length - 1];
  const toStr = (b) => new TextDecoder().decode(b instanceof ArrayBuffer ? b : b.buffer);
  return toStr(last.data);
};

/**
 * @param {import("puppeteer").Browser} browser
 * @param {import("puppeteer").Page | undefined} page
 * @returns {Promise<{close: () => Promise<void>, res: (method: string, url: string) => Promise<any>, key: (method: string, url: string) => Promise<string>, verification: string}>}
 */
const createSession = async (browser, page) => {
  const newPage = page ?? (await browser.newPage());
  const indexPage = await newPage.goto("https://x.com/home");
  const indexRoot = parse(await indexPage.text());
  const verification = indexRoot.querySelector("[name^=tw]")?.getAttribute("content");
  const indexSvg = indexRoot.querySelectorAll("svg").map((e) => e.outerHTML);
  await newPage.evaluate(evaluateSetup, indexSvg.join(""), undefined);
  await newPage.evaluate(hookEvaluateSetup);
  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate, method, url),
    key: async (method, url) => await newPage.evaluate(getKeyEvaluate, method, url),
    verification: verification,
  };
};

/**
 * @param {import("puppeteer").Browser} browser
 * @param {import("puppeteer").Page | undefined} page
 * @param {string} input
 * @returns {Promise<{close: () => Promise<void>, res: (method: string, url: string) => Promise<any>, key: (method: string, url: string) => Promise<string>}>}
 */
const createSessionOverride = async (browser, page, input) => {
  const newPage = page ?? (await browser.newPage());
  await newPage.goto("https://x.com/home");
  const indexRoot = parse(input);
  const indexSvg = indexRoot.querySelectorAll("svg").map((e) => e.outerHTML);
  const verification = indexRoot.querySelector("[name^=tw]")?.getAttribute("content");

  await newPage.evaluate(evaluateSetup, indexSvg.join(""), verification);
  await newPage.evaluate(hookEvaluateSetup);

  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate, method, url),
    key: async (method, url) => await newPage.evaluate(getKeyEvaluate, method, url),
  };
};

/**
 * @param {Record<string, string>} cookies
 * @param {import("puppeteer").LaunchOptions} options
 * @returns {Promise<({context, init}: {context: any, init: any}) => Promise<any>>}
 */
const createAdapter = async (cookies, options) => {
  const browser = await puppeteer.launch(options);
  const cookie = Object.entries(cookies).map(([key, value]) => ({
    name: key,
    value: value,
    domain: ".x.com",
  }));
  await browser.setCookie(...cookie);
  const session = await createSession(browser, undefined);
  return async ({ context, init }) => {
    init.headers = {
      ...init.headers,
      "x-client-transaction-id": await session.res(context.method, `/i/api${context.path}`),
    };
    return init;
  };
};

module.exports = { createSession, createSessionOverride, createAdapter, decodeTransactionId, generateTransactionId };
