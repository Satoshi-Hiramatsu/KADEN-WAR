import { describe, expect, it } from 'vitest';
import { calendarAt } from './calendar';

describe('ゲーム内暦の基盤PoC', () => {
  it.each([
    [0, { year: 1950, month: 1, week: 1 }],
    [3, { year: 1950, month: 1, week: 4 }],
    [4, { year: 1950, month: 2, week: 1 }],
    [47, { year: 1950, month: 12, week: 4 }],
    [48, { year: 1951, month: 1, week: 1 }],
    [2447, { year: 2000, month: 12, week: 4 }],
  ])('%i週の暦', (weeks, expected) => expect(calendarAt(weeks)).toEqual(expected));
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('不正な週数%iを拒否', value => {
    expect(() => calendarAt(value)).toThrow(RangeError);
  });
});
