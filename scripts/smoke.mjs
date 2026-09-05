/* global document, window */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

/**
 * ローカルデモの通し操作を検証する。
 * タイトル → 研究 → 設計 → 開発完了 → 生産 → 価格・販路 → 発売 → 売上 → 決算まで、
 * 実際の画面操作で数値が動くことを確認する。
 */
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('heading', { name: '家電戦争', exact: true }).waitFor();

  // 開発用の疎通確認（APIとD1が起動している前提）。
  await page.getByRole('button', { name: '接続を確認' }).click();
  await page.getByRole('status').filter({ hasText: '接続成功' }).waitFor();

  await page.getByRole('button', { name: 'この条件で始める' }).click();
  const date = page.locator('.topbar .date');
  const nav = page.getByRole('navigation', { name: '担当' });
  assert.equal(await date.textContent(), '1960年1月 第1週');

  // 研究所：研究予算と課題、最初の設計。
  await nav.getByRole('button', { name: /研究所/ }).click();
  await page.getByLabel('研究予算').fill('40');
  await page.getByRole('row', { name: /量産・歩留まり改善/ }).getByRole('button').click();
  await page.getByRole('button', { name: 'この設計で開発を始める' }).click();
  await page.getByRole('row', { name: /あかつき冷蔵庫1号/ }).waitFor();

  // 販売本部：先に系列店を開き、販路を用意する。
  await nav.getByRole('button', { name: /販売本部/ }).click();
  await page.getByRole('row', { name: /系列店/ }).getByRole('button', { name: '増やす' }).click();

  // 開発完了まで月送りする。
  for (let month = 0; month < 3; month += 1) {
    await page.getByRole('button', { name: '1か月進める' }).click();
  }
  assert.equal(await date.textContent(), '1960年4月 第1週');

  // 工場：週の生産量を決める。
  await nav.getByRole('button', { name: /工場/ }).click();
  await page.getByLabel('あかつき冷蔵庫1号の生産量').fill('40');

  // 販売本部：価格を決めて発売する。
  await nav.getByRole('button', { name: /販売本部/ }).click();
  await page.getByLabel('あかつき冷蔵庫1号の価格').fill('55');
  await page.getByRole('button', { name: '発売する' }).click();
  await page.getByRole('button', { name: '販売を止める' }).waitFor();

  // 1か月進めて、売上と決算が発生することを確かめる。
  await page.getByRole('button', { name: '1か月進める' }).click();
  const revenue = await page.locator('.topbar-metrics div', { hasText: '累計売上' }).locator('dd').textContent();
  assert.notEqual(revenue, '0万円', `累計売上が増えていません: ${revenue}`);

  // 経理部：貸借一致と月次決算の表示。
  await nav.getByRole('button', { name: /経理部/ }).click();
  await page.getByText('資産＝負債＋純資産が一致しています。').waitFor();
  await page.getByRole('rowheader', { name: '1960年4月' }).first().waitFor();

  await mkdir('tmp', { recursive: true });
  await page.screenshot({ path: 'tmp/demo-desktop.png', fullPage: true });

  // API失敗表示（タイトル画面）。
  await page.route('**/api/health', route => route.fulfill({
    status: 503, contentType: 'application/json', body: '{"error":"database_unavailable"}',
  }));
  await nav.getByRole('button', { name: 'やめる' }).click();
  await page.getByRole('button', { name: '接続を確認' }).click();
  await page.getByRole('status').filter({ hasText: '接続できません' }).waitFor();

  // 360px幅とキーボード操作。
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('button', { name: 'この条件で始める' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await date.textContent(), '1960年1月 第1週');
  await page.getByRole('button', { name: '1週進める' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await date.textContent(), '1960年1月 第2週');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: 'tmp/demo-mobile.png', fullPage: true });

  // 再読み込みでタイトルへ戻る（保存は未実装）。
  await page.reload();
  await page.getByRole('heading', { name: '家電戦争', exact: true }).waitFor();

  assert.deepEqual(errors, []);
  process.stdout.write(`demo browser smoke passed (${browser.version()}): 研究→設計→開発→生産→発売→売上→決算、API成功/失敗、360px、キーボード、再読み込み。\n`);
} finally {
  await browser.close();
}
