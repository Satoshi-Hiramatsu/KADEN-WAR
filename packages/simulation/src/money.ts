/** 金額はゲーム内の「万円」を整数で保持する。上限を超える計算は拒否する。 */
export const moneyLimit = 100_000_000;

export function assertMoney(value: number, label: string): number {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label}は整数で扱います: ${value}`);
  if (Math.abs(value) > moneyLimit) throw new RangeError(`${label}が上限を超えました: ${value}`);
  return value;
}

/** 単価（千円）×台数を取引金額（万円）へ変換する。端数は取引単位で切り捨てる。 */
export function amountFromUnits(units: number, priceThousandYen: number): number {
  if (!Number.isSafeInteger(units) || units < 0) throw new RangeError('台数は0以上の整数で指定してください。');
  if (!Number.isSafeInteger(priceThousandYen) || priceThousandYen < 0) {
    throw new RangeError('単価は0以上の整数（千円）で指定してください。');
  }
  return assertMoney(Math.floor((units * priceThousandYen) / 10), '取引金額');
}

/** 万分率を掛ける。端数は切り捨てる。 */
export function applyBasis(amount: number, basis: number): number {
  return Math.floor((amount * basis) / 10000);
}

/** 千円単位の金額を「6.0万円」のような表示に整える。 */
export function formatThousandYen(value: number): string {
  return `${(value / 10).toFixed(1)}万円`;
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString('ja-JP')}万円`;
}

export function formatBasisAsPercent(basis: number, fractionDigits = 1): string {
  return `${(basis / 100).toFixed(fractionDigits)}%`;
}

/** ブランド基点（10000 = 100.00）を表示に整える。 */
export function formatBrand(brandBasis: number): string {
  return (brandBasis / 100).toFixed(2);
}
