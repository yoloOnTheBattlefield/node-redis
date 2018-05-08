const puppeteer = require("puppeteer");
const Buffer = require("safe-buffer").Buffer;
const Keygrip = require("keygrip");
const keys = require("../config/keys");
let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("Header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", el => el.innerHTML);

  expect(text).toEqual("Blogster");
  const a = 0;
});

test("clicking login starts OAuth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in shows logout button", async done => {
  const id = "5ac5238ff8844c16620a207e";
  const session = { passport: { user: id } };
  const sessionString = Buffer.from(JSON.stringify(session)).toString("base64");
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign("session=" + sessionString);
  const tag = 'a[href="auth/logout"]';

  await page.setCookie({ name: "session", value: sessionString });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("localhost:3000");
  await page.waitFor('a[href="auth/logout"]');

  const text = await page.$eval('a[href="auth/logout"]', el => el.innerHTML);
  expect(text).toEqual("Logout");
  done();
});
