const { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");



const createSession = async (browser, page) => {
  const newPage = page ?? await browser.newPage();
  const indexPage = await newPage.goto("https://x.com/home");
  const indexRoot = parse(await indexPage.text());
  const indexSvg = indexRoot.querySelectorAll("svg").map(e => e.outerHTML).join("");
  

  const evaluate = async (indexSvg, method, url) => {
    const u = undefined;
    const ondemand = Object.values(window["webpackChunk_twitter_responsive_web"].find(([[name]]) => name == "ondemand.s")[1])[0] ;
    const [fn, that] = (await new Promise((res) =>
      ondemand(u, u, new Proxy(() => u, { get: (t, p) => (_, e) => p === "d" ? res([e["default"], e]) : u }))
    ));

    document.body.appendChild(document.createElement("div")).innerHTML = indexSvg;

    return await fn()().bind(undefined)(url, method);
  };

  return {
    close: async () => await browser.close(),
    res: async (method, url) => await newPage.evaluate(evaluate,indexSvg, method, url),
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
      'x-client-transaction-id': await session.res(requestContext.context.method, requestContext.context.path),
    };
    return requestContext;
  };
};


module.exports = { createSession, createAdapter };
