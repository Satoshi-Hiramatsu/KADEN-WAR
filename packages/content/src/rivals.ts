import type { CategorySegmentId } from './categories';

/**
 * 競合他社の簡易定義。S4で行動を選ぶAIに置き換える前提で、
 * ここでは「年ごとに性能と価格が決まった相手」として市場に置く。
 * 参入先は製品分類ごとではなく分野（セグメント）で持ち、
 * 新しい分類が増えても各社の性格が保たれるようにしている。
 */
export type RivalDefinition = {
  id: string;
  name: string;
  personality: string;
  /** 1950年時点の性能指数と、1年あたりの伸び。 */
  basePerformance: number;
  performanceGrowthPerYear: number;
  /** 標準価格に対する価格係数（万分率）。 */
  priceBasis: number;
  /** 1950年時点のブランド（0〜100）と、1年あたりの伸び。 */
  brand: number;
  brandGrowthPerYear: number;
  segments: readonly CategorySegmentId[];
  description: string;
};

export const rivals: readonly RivalDefinition[] = [
  {
    id: 'rival-kowa',
    name: '光和電機',
    personality: '量産型',
    basePerformance: 94,
    performanceGrowthPerYear: 3,
    priceBasis: 8800,
    brand: 38,
    brandGrowthPerYear: 2,
    segments: ['parts', 'lighting', 'heating', 'kitchen', 'toy'],
    description: '乾電池と電球を大量に流し、安さで数を取る。値下げ競争に持ち込まれると苦しい。',
  },
  {
    id: 'rival-hinode',
    name: '日之出工業',
    personality: '革新型',
    basePerformance: 104,
    performanceGrowthPerYear: 5,
    priceBasis: 11500,
    brand: 52,
    brandGrowthPerYear: 2,
    segments: ['audio', 'video', 'cooling', 'motor'],
    description: 'ラジオと受像機で先行する技術志向。高性能・高価格で勝負してくる。',
  },
  {
    id: 'rival-mine',
    name: '三嶺電器',
    personality: 'ニッチ型',
    basePerformance: 99,
    performanceGrowthPerYear: 4,
    priceBasis: 9800,
    brand: 27,
    brandGrowthPerYear: 3,
    segments: ['audio', 'laundry', 'motor', 'kitchen', 'lighting'],
    description: '中庸だが手堅い。地域の特約店網が強く、油断すると差を詰められる。',
  },
];

export function findRival(id: string): RivalDefinition | undefined {
  return rivals.find(rival => rival.id === id);
}

export function rivalJoinsSegment(rival: RivalDefinition, segment: CategorySegmentId): boolean {
  return rival.segments.includes(segment);
}
