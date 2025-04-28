const { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");

const decodeTimeFromBytes = (timeBytes) => {
  const timeValue = timeBytes.reverse().reduce((acc, value) => (acc << 8) | value, 0);
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

const encodeSha256 = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));
  return hashBytes;
};

const encodeBase64 = (data) => {
  const b64 = Buffer.from(data).toString("base64");
  return b64.replace(/=/g, "");
};

const decodeBase64 = (data) => {
  return Array.from(Buffer.from(data, "base64"));
};

const generateTransactionId = async (method, path, key) => {
  const DEFAULT_KEYWORD = "obfiowerehiring";
  const ADDITIONAL_RANDOM_NUMBER = 3;
  const timeNow = Math.floor((Date.now() - 1682924400 * 1000) / 1000);
  const timeNowBytes = [timeNow & 0xff, (timeNow >> 8) & 0xff, (timeNow >> 16) & 0xff, (timeNow >> 24) & 0xff];
  const animationKey = "1594e1100100";

  const data = `${method}!${path}!${timeNow}${DEFAULT_KEYWORD}${animationKey}`;

  const hashBytes = await encodeSha256(data);
  const keyBytes = decodeBase64(key);

  const randomNum = Math.floor(Math.random() * 256);
  const bytesArr = [...keyBytes, ...timeNowBytes, ...hashBytes.slice(0, 16), ADDITIONAL_RANDOM_NUMBER];

  const out = new Uint8Array([randomNum, ...bytesArr.map((item) => item ^ randomNum)]);

  const base64 = encodeBase64(out);
  return base64;
};

module.exports = { createSession, createAdapter, decodeTransactionId, generateTransactionId };
