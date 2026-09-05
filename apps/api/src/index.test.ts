import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { getPlatformProxy } from 'wrangler';
import worker from './index';

let platform: Awaited<ReturnType<typeof getPlatformProxy<Env>>>;
beforeAll(async () => {
  platform = await getPlatformProxy<Env>({ configPath: 'apps/api/wrangler.jsonc', persist: false });
});
afterAll(async () => { await platform?.dispose(); });

it('未初期化DBは503、マイグレーション後は200（実D1ローカルバインディング）', async () => {
  const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const failed = await worker.fetch(new Request('http://localhost/api/health'), platform.env);
    expect(failed.status).toBe(503);
    expect(await failed.json()).toEqual({ error: 'database_unavailable' });
    expect(failed.headers.get('Cache-Control')).toBe('no-store');
  } finally {
    logger.mockRestore();
  }
  const sql = await readFile('apps/api/migrations/0001_poc.sql', 'utf8');
  const statements = sql.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
  await platform.env.DB.batch(statements.map(sql => platform.env.DB.prepare(sql)));
  const response = await worker.fetch(new Request('http://localhost/api/health'), platform.env);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', database: 'ok', schemaVersion: 1 });
});

it('未提供パスは404、更新メソッドは405', async () => {
  const missing = await worker.fetch(new Request('http://localhost/api/saves'), platform.env);
  expect(missing.status).toBe(404);
  const rejected = await worker.fetch(new Request('http://localhost/api/health', { method: 'POST' }), platform.env);
  expect(rejected.status).toBe(405);
  expect(rejected.headers.get('Allow')).toBe('GET');
});
