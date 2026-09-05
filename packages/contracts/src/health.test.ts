import { expect, it } from 'vitest';
import { isHealthResponse } from './health';

it('初期化済みDBの応答だけを成功として扱う', () => {
  expect(isHealthResponse({ status: 'ok', database: 'ok', schemaVersion: 1 })).toBe(true);
  for (const value of [null, '<html>', {}, { status: 'ok' }, { status: 'ok', database: 'ok', schemaVersion: 2 }, { error: 'database_unavailable' }]) {
    expect(isHealthResponse(value)).toBe(false);
  }
});
