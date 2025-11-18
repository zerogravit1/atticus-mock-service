import { test, expect } from './fixtures/atticus.fixtures';

test('login and record', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.fill('#username', 'alice');
  await page.fill('#password', 'password');
  await page.click('#login-btn');

  // data entry should only occur once.
  await page.fill('#new-record-text', 'from atticus test');
  await page.click('#add-btn');

  await page.waitForSelector('.record');
  const text = await page.textContent('.record strong');

  // when the mock output is edited the assertion needs to be updated
  expect(text).toContain('from atticus test');
});