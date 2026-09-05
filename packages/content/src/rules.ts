/** ゲーム内暦。週を唯一の時間軸とし、年月は経過週から導出する。 */
export const calendarRules = {
  startYear: 1960,
  endYear: 2010,
  weeksPerMonth: 4,
  monthsPerYear: 12,
} as const;

export const weeksPerYear = calendarRules.weeksPerMonth * calendarRules.monthsPerYear;

/**
 * 金額はゲーム内の「万円」を整数で保持する。
 * 単価・価格だけは調整幅を確保するため「千円」の整数で保持し、
 * 取引金額へ変換するときに切り捨てる。
 * 率は万分率（10000 = 100%）の整数で保持する。
 */
export const economyRules = {
  /** 借入の年利（万分率）。週割りで計上する。 */
  annualInterestBasis: 700,
  /** 借入枠は資本金×係数から既存借入を引いた額。 */
  loanLimitMultiplier: 2,
  /** 1人あたりの週次人件費（千円）。 */
  weeklyWagePerEmployee: 5,
  /** 設備の減価償却月数。 */
  depreciationMonths: 120,
  /** 設備投資1口あたりの生産能力（台/週）と取得価額（万円）。 */
  equipmentUnitCapacity: 20,
  equipmentUnitCost: 800,
  maxEquipmentUnits: 12,
  /** 基本不良率（万分率）。生産技術で低下する。 */
  defectBaseBasis: 700,
  /** 不良率の週次ばらつき（万分率、±）。 */
  defectNoiseBasis: 250,
  /** 週次のブランド減衰（ブランド基点＝0.01ポイント）。 */
  brandDecayBasis: 1,
  /** 資金不足のまま進行できる猶予週。超過で敗北。 */
  maxGraceWeeks: 4,
  /** 研究予算の上限（万円/週）。 */
  maxResearchBudget: 400,
  /** 発売直後の鮮度と、下限までの減衰速度（万分率）。 */
  freshnessStartBasis: 11000,
  freshnessFloorBasis: 6500,
  freshnessDecayPerWeekBasis: 40,
} as const;

export const contentVersion = '0.3.0-s1s3';
