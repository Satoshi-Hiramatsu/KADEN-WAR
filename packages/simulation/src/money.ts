/** 金額はゲーム内の「万円」を整数で保持する。上限を超える計算は拒否する。 */
export const moneyLimit = 100_000_000;

export function assertMoney(value: number, label: string): number {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label}は整数で扱います: ${value}`);
  if (Math.abs(value) > moneyLimit) throw new RangeError(`${label}が上限を超えました: ${value}`);
  return value;
}

/**
 * 単価（円）×台数を取引金額（万円）へ変換する。端数は取引単位で切り捨てる。
 * 乾電池30円からテレビ175,000円までを同じ式で扱うため、単価は円で持つ。
 */
export function amountFromUnits(units: number, priceYen: number): number {
  if (!Number.isSafeInteger(units) || units < 0) throw new RangeError('台数は0以上の整数で指定してください。');
  if (!Number.isSafeInteger(priceYen) || priceYen < 0) {
    throw new RangeError('単価は0以上の整数（円）で指定してください。');
  }
  return assertMoney(Math.floor((units * priceYen) / 10000), '取引金額');
}

/** 万分率を掛ける。端数は切り捨てる。 */
export function applyBasis(amount: number, basis: number): number {
  return Math.floor((amount * basis) / 10000);
}

/** 単価（円）を「30円」「9,000円」「17.5万円」のように読みやすく整える。 */
export function formatUnitPrice(valueYen: number): string {
  if (Math.abs(valueYen) >= 10000) return `${(valueYen / 10000).toFixed(1)}万円`;
  return `${Math.round(valueYen).toLocaleString('ja-JP')}円`;
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString('ja-JP')}万円`;
}

/** 台数の桁が分類ごとに大きく違うため、区切り記号を入れて表示する。 */
export function formatUnits(units: number): string {
  return units.toLocaleString('ja-JP');
}

export function formatBasisAsPercent(basis: number, fractionDigits = 1): string {
  return `${(basis / 100).toFixed(fractionDigits)}%`;
}

/** ブランド基点（10000 = 100.00）を表示に整える。 */
export function formatBrand(brandBasis: number): string {
  return (brandBasis / 100).toFixed(2);
}
