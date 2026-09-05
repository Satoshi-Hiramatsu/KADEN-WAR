/**
 * シミュレーション用の乱数。状態を32bit整数1つで持ち、セーブへそのまま入れる。
 * 描画・演出はこの乱数を消費しない。
 */
export type RngState = number;

export function seedRng(seed: number): RngState {
  if (!Number.isSafeInteger(seed)) throw new RangeError('シードは整数で指定してください。');
  const normalized = (seed >>> 0) || 0x9e3779b9;
  return normalized;
}

/** xorshift32。次の状態と0以上1未満の値を返す純関数。 */
export function nextRandom(state: RngState): { state: RngState; value: number } {
  let x = state >>> 0;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  const next = x || 0x9e3779b9;
  return { state: next, value: next / 0x100000000 };
}

/** min以上max以下の整数を引く。 */
export function nextInt(state: RngState, min: number, max: number): { state: RngState; value: number } {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new RangeError('乱数の範囲が不正です。');
  }
  const drawn = nextRandom(state);
  return { state: drawn.state, value: min + Math.floor(drawn.value * (max - min + 1)) };
}
