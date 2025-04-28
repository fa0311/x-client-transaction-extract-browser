const { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");

const decodeTimeFromBytes = (timeBytes) => {
  const timeValue = timeBytes.reduce((acc, value) => (acc << 8) | value, 0);
  const baseTime = 1682924400;
  const actualTime = timeValue + baseTime;
  const date = new Date(actualTime * 1000);
  return date;
};

const decodeTransactionId = (transactionId) => {
  const base = transactionId + "=".repeat((4 - (transactionId.length % 4)) % 4);
  const decode = Buffer.from(base, "base64");
  const rand = decode[0];
  const value = Array.from(decode.subarray(1)).reverse();

  const data = value.map((byte, i) => byte ^ rand).reverse();

  const keyBytes = data.slice(0, 48);
  const timeNowBytes = data.slice(48, 52);
  const hashBytes = data.slice(52, 68);
  const additional = data[68];

  return {
    keyBytes,
    time: decodeTimeFromBytes(timeNowBytes),
    hashBytes,
    additional,
  };
};

const createSession = async (browser, page) => {
  const newPage = page ?? (await browser.newPage());
  const indexPage = await newPage.goto("https://x.com/home");
  const indexRoot = parse(await indexPage.text());
  const indexSvg = indexRoot
    .querySelectorAll("svg")
    .map((e) => e.outerHTML)
    .join("");

  const evaluate = async (indexSvg, method, url) => {
    const u = undefined;
    const ondemand = Object.values(window["webpackChunk_twitter_responsive_web"].find(([[name]]) => name == "ondemand.s")[1])[0];
    const [fn, that] = await new Promise((res) =>
      ondemand(u, u, new Proxy(() => u, { get: (t, p) => (_, e) => p === "d" ? res([e["default"], e]) : u }))
    );

    document.body.appendChild(document.createElement("div")).innerHTML = indexSvg;

    return await fn()().bind(undefined)(url, method);
  };

  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate, indexSvg, method, url),
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

module.exports = { createSession, createAdapter, decodeTransactionId };
