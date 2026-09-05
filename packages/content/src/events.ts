import type { CategoryId } from './categories';

export type HistoricalEventDefinition = {
  id: string;
  year: number;
  month: number;
  title: string;
  headline: string;
  description: string;
  impactType: 'boom' | 'cost_hike' | 'demand_shift' | 'recession';
  targetCategoryId?: CategoryId;
  demandMultiplierBasis?: number; // 10000が等倍、13000なら+30%
  costHikeBasis?: number; // 原価上昇
};

export const historicalEvents: readonly HistoricalEventDefinition[] = [
  {
    id: 'event-shingi-boom',
    year: 1960,
    month: 6,
    title: '三種の神器ブーム到来！',
    headline: '全国で白物家電の需要が爆発的に急増',
    description: '「白黒テレビ・洗濯機・冷蔵庫」が豊かな生活の象徴として全国の家庭に急速に普及し始めています。市場の引き合いが大幅に拡大しています。',
    impactType: 'boom',
    demandMultiplierBasis: 12500, // 需要+25%
  },
  {
    id: 'event-copper-hike',
    year: 1961,
    month: 4,
    title: '銅・鉄鋼原材料の価格高騰',
    headline: '世界的な資源需要により製造原価に上昇圧力',
    description: '重工業の発展に伴い、モーターや配線に使用する銅材および鋼板の価格が高騰しています。各社とも原価低減への取り組みが急務です。',
    impactType: 'cost_hike',
    costHikeBasis: 11000,
  },
  {
    id: 'event-olympic-special',
    year: 1964,
    month: 2,
    title: '東京五輪特需！テレビ買い替え熱狂',
    headline: '世紀の大祭典を前にテレビ需要が最高潮',
    description: '東京オリンピックの開会式を家庭で見ようと、全国の電器店に客が殺到しています。テレビの需要が空前の規模に膨らんでいます。',
    impactType: 'boom',
    targetCategoryId: 'television',
    demandMultiplierBasis: 15000, // テレビ需要+50%
  },
  {
    id: 'event-post-olympic-chill',
    year: 1965,
    month: 1,
    title: '五輪後の反動不況（40年不況）',
    headline: '家電普及の一服と過剰在庫による景気後退',
    description: 'オリンピック特需の反動から個人消費が一時的に冷え込んでいます。無理な増産を控えて資金繰りを厳格に管理する必要があります。',
    impactType: 'recession',
    demandMultiplierBasis: 8500, // 需要-15%
  },
];

export function findHistoricalEvent(year: number, month: number): HistoricalEventDefinition | undefined {
  return historicalEvents.find(event => event.year === year && event.month === month);
}

