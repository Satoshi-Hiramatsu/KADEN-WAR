import { calendarRules } from '../../content/src/rules';

/** 経過週から表示用暦を導出する。状態や実時刻を変更しない。 */
export function calendarAt(elapsedWeeks: number) {
  if (!Number.isSafeInteger(elapsedWeeks) || elapsedWeeks < 0) {
    throw new RangeError('経過週は0以上の安全な整数で指定してください。');
  }
  const { startYear, weeksPerMonth, monthsPerYear } = calendarRules;
  const weeksPerYear = weeksPerMonth * monthsPerYear;
  return {
    year: startYear + Math.floor(elapsedWeeks / weeksPerYear),
    month: Math.floor((elapsedWeeks % weeksPerYear) / weeksPerMonth) + 1,
    week: elapsedWeeks % weeksPerMonth + 1,
  };
}
