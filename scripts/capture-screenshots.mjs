/* global document, window */
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const BASE_URL = process.env.TARGET_URL || 'https://molkz.com/';
const OUTPUT_DIR = 'docs/screenshots';

async function capture() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 860 },
      deviceScaleFactor: 2, // 高解像度（Retina）キャプチャ
    });

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 1. タイトル画面
    await page.getByRole('heading', { name: '家電戦争', exact: true }).waitFor();
    await page.screenshot({ path: `${OUTPUT_DIR}/01-title.png` });
    console.log('Captured: 01-title.png');

    // ゲーム開始
    await page.getByRole('button', { name: 'この条件で始める' }).click();
    await page.locator('.topbar .date').waitFor();

    const nav = page.getByRole('navigation', { name: '担当' });

    // 2. 社長室（初期状態）
    await page.screenshot({ path: `${OUTPUT_DIR}/02-office.png` });
    console.log('Captured: 02-office.png');

    // 3. 研究所（製品設計、研究設定）
    await nav.getByRole('button', { name: /研究所/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/04-lab.png` });
    console.log('Captured: 04-lab.png');

    // 開発を1つ開始してみる（製品スプライトや進行中リストを出すため）
    await page.getByLabel('研究予算').fill('40');
    const researchBtn = page.getByRole('row', { name: /量産・歩留まり改善/ }).getByRole('button');
    if (await researchBtn.isVisible()) {
      await researchBtn.click();
    }
    const devBtn = page.getByRole('button', { name: 'この設計で開発を始める' });
    if (await devBtn.isVisible()) {
      await devBtn.click();
    }

    // 4. 工場
    await nav.getByRole('button', { name: /工場/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/05-factory.png` });
    console.log('Captured: 05-factory.png');

    // 5. 販売本部
    await nav.getByRole('button', { name: /販売本部/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/06-sales.png` });
    console.log('Captured: 06-sales.png');

    // 6. 人事部
    await nav.getByRole('button', { name: /人事部/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/07-personnel.png` });
    console.log('Captured: 07-personnel.png');

    // 7. 経理部
    await nav.getByRole('button', { name: /経理部/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/08-finance.png` });
    console.log('Captured: 08-finance.png');

    // 8. 歴代名機図鑑
    await nav.getByRole('button', { name: /名機図鑑/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/09-archive.png` });
    console.log('Captured: 09-archive.png');

    // 9. 役員会議（1か月進めて月初の会議を開く）
    await nav.getByRole('button', { name: /社長室/ }).click();
    // 4週進める
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '1週進める' }).click();
      await page.waitForTimeout(100);
    }
    await nav.getByRole('button', { name: /役員会議/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/03-meeting.png` });
    console.log('Captured: 03-meeting.png');

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

capture().catch(err => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
