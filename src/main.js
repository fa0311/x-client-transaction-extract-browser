const { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");
const { decodeTransactionId } = require("./decode");
const { generateTransactionId } = require("./encode");

const evaluateSetup = async (indexSvg, verification) => {
  const u = undefined;
  const ondemand = Object.values(window["webpackChunk_twitter_responsive_web"].find(([[name]]) => name == "ondemand.s")[1])[0];
  const [fn, that] = await new Promise((res) =>
    ondemand(u, u, new Proxy(() => u, { get: (t, p) => (_, e) => p === "d" ? res([e["default"], e]) : u }))
  );
  document.body.appendChild(document.createElement("div")).innerHTML = indexSvg;
  if (verification) {
    document.querySelector("[name^=tw]").setAttribute("content", verification);
  }
  window.elonmusk_114514 = fn()().bind(undefined);
};

const evaluate = async (method, url) => {
  return await window.elonmusk_114514(method, url);
};

const createSession = async (browser, page) => {
  const newPage = page ?? (await browser.newPage());
  const indexPage = await newPage.goto("https://x.com/home");
  const indexRoot = parse(await indexPage.text());
  const indexSvg = indexRoot.querySelectorAll("svg").map((e) => e.outerHTML);
  await newPage.evaluate(evaluateSetup, indexSvg.join(""), undefined);
  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate, method, url),
  };
};

const createSessionOverride = async (browser, page, input) => {
  const newPage = page ?? (await browser.newPage());
  await newPage.goto("https://x.com/home");
  const indexRoot = parse(input);
  const indexSvg = indexRoot.querySelectorAll("svg").map((e) => e.outerHTML);
  const verification = indexRoot.querySelector("[name^=tw]").getAttribute("content");
  await newPage.evaluate(evaluateSetup, indexSvg.join(""), verification);

  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate, method, url),
  };
};

const createAdapter = async (cookies, options) => {
  const browser = await puppeteer.launch(options);
  const cookie = Object.entries(cookies).map(([key, value]) => ({
    name: key,
    value: value,
    domain: ".x.com",
  }));
  await browser.setCookie(...cookie);
  const session = await createSession(browser);
  return async (requestContext) => {
    requestContext.init.headers = {
      ...requestContext.init.headers,
      "x-client-transaction-id": await session.res(requestContext.context.method, requestContext.context.path),
    };
    return requestContext;
  };
};

module.exports = { createSession, createSessionOverride, createAdapter, decodeTransactionId, generateTransactionId };
