const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");
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
  const tag = 'a[href="/auth/logout"]';
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);
  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("localhost:3000");
  await page.waitFor(tag);

  const text = await page.$eval(tag, el => el.innerHTML);
  expect(text).toEqual("Logout");
  done();
});
