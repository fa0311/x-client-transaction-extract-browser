const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const { createSession, decodeTransactionId } = require("./src/main");

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
  const session = await createSession(browser);
  const id = await session.res("GET", "/i/api/graphql/_8aYOgEDz35BrBcBal1-_w/TweetDetail");
  console.log(id);
  console.log(decodeTransactionId(id));

  await a.close();
})();
