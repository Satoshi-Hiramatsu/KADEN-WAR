/* global document, window */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('heading', { name: '家電戦争', exact: true }).waitFor();
  const date = page.locator('.date');
  assert.equal(await date.textContent(), '1960年 1月 第1週');
  await page.getByRole('button', { name: '1週進める', exact: true }).click();
  assert.equal(await date.textContent(), '1960年 1月 第2週');
  await page.getByRole('button', { name: '4週進める', exact: true }).click();
  assert.equal(await date.textContent(), '1960年 2月 第2週');
  await page.getByRole('button', { name: '初期日に戻す' }).click();
  assert.equal(await date.textContent(), '1960年 1月 第1週');
  await page.getByRole('button', { name: '接続を確認' }).click();
  await page.getByRole('status').filter({ hasText: '接続成功' }).waitFor();
  await mkdir('tmp', { recursive: true });
  await page.screenshot({ path: 'tmp/s0-desktop.png', fullPage: true });
  await page.route('**/api/health', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"database_unavailable"}' }));
  await page.getByRole('button', { name: '接続を確認' }).click();
  await page.getByRole('status').filter({ hasText: '接続できません' }).waitFor();
  await page.setViewportSize({ width: 360, height: 800 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.getByRole('button', { name: '1週進める', exact: true }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await date.textContent(), '1960年 1月 第2週');
  await page.screenshot({ path: 'tmp/s0-mobile.png', fullPage: true });
  await page.reload();
  assert.equal(await date.textContent(), '1960年 1月 第1週');
  assert.deepEqual(errors, []);
  process.stdout.write(`S0 browser smoke passed (${browser.version()}): calendar, reset, API success/failure, 360px, keyboard, reload.\n`);
} finally {
  await browser.close();
}
