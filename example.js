const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const { createSession } = require("./src/main");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const cookies = JSON.parse(await fs.readFile("cookies.json", "utf-8"));
  await browser.setCookie(
    ...cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
    }))
  );
  const a = await createSession(browser);
  console.log(await a.res("GET", "/i/api/graphql/_8aYOgEDz35BrBcBal1-_w/TweetDetail"));
  await a.close();
})();
