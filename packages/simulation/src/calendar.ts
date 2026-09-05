import { calendarRules } from '../../content/src/rules';

export type CalendarDate = { year: number; month: number; week: number };

/** 経過週から表示用暦を導出する。状態や実時刻を変更しない。 */
export function calendarAt(elapsedWeeks: number, startYear: number = calendarRules.startYear): CalendarDate {
  if (!Number.isSafeInteger(elapsedWeeks) || elapsedWeeks < 0) {
    throw new RangeError('経過週は0以上の安全な整数で指定してください。');
  }
  const { weeksPerMonth, monthsPerYear } = calendarRules;
  const weeksPerYear = weeksPerMonth * monthsPerYear;
  return {
    year: startYear + Math.floor(elapsedWeeks / weeksPerYear),
    month: Math.floor((elapsedWeeks % weeksPerYear) / weeksPerMonth) + 1,
    week: (elapsedWeeks % weeksPerMonth) + 1,
  };
}

export function formatCalendar(date: CalendarDate): string {
  return `${date.year}年${date.month}月 第${date.week}週`;
}

/** 月次・年次決算の表示名。開始週から期間の名前を作る。 */
export function calendarLabel(startYear: number, startWeek: number, kind: 'month' | 'year'): string {
  const date = calendarAt(startWeek, startYear);
  return kind === 'month' ? `${date.year}年${date.month}月` : `${date.year}年度`;
}
