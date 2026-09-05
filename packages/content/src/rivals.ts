import type { CategoryId } from './categories';

/**
 * 競合他社の簡易定義。S4で行動を選ぶAIに置き換える前提で、
 * ここでは「年ごとに性能と価格が決まった相手」として市場に置く。
 */
export type RivalDefinition = {
  id: string;
  name: string;
  personality: string;
  /** 1960年時点の性能指数と、1年あたりの伸び。 */
  basePerformance: number;
  performanceGrowthPerYear: number;
  /** 標準価格に対する価格係数（万分率）。 */
  priceBasis: number;
  /** ブランド（0〜100）。 */
  brand: number;
  categoryIds: readonly CategoryId[];
  description: string;
};

export const rivals: readonly RivalDefinition[] = [
  {
    id: 'rival-kowa',
    name: '光和電機',
    personality: '量産型',
    basePerformance: 94,
    performanceGrowthPerYear: 4,
    priceBasis: 8800,
    brand: 38,
    categoryIds: ['refrigerator', 'washer', 'television'],
    description: '安さで数を取る。値下げ競争に持ち込まれると苦しい。',
  },
  {
    id: 'rival-hinode',
    name: '日之出工業',
    personality: '革新型',
    basePerformance: 108,
    performanceGrowthPerYear: 7,
    priceBasis: 11500,
    brand: 52,
    categoryIds: ['refrigerator', 'television'],
    description: '高性能・高価格。技術で先行するが値段は高い。',
  },
  {
    id: 'rival-mine',
    name: '三嶺電器',
    personality: 'ニッチ型',
    basePerformance: 100,
    performanceGrowthPerYear: 5,
    priceBasis: 9800,
    brand: 27,
    categoryIds: ['washer', 'television'],
    description: '中庸だが手堅い。油断すると差を詰められる。',
  },
];

export function findRival(id: string): RivalDefinition | undefined {
  return rivals.find(rival => rival.id === id);
}
