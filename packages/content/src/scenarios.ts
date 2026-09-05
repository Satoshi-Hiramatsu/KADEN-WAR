import { weeksPerYear } from './rules';

export type ScenarioGoal = {
  cumulativeRevenue: number;
  cumulativeProfit: number;
  /** ブランド基点（10000 = 100.00）。 */
  brandBasis: number;
};

export type ScenarioDefinition = {
  id: string;
  name: string;
  subtitle: string;
  startYear: number;
  /** 期限までの週数。 */
  durationWeeks: number;
  initialCash: number;
  initialCapital: number;
  initialDebt: number;
  initialBrandBasis: number;
  initialEmployees: number;
  initialCapacityUnits: number;
  initialEquipmentCost: number;
  initialTechIds: readonly string[];
  initialChannels: { direct: number; affiliate: number };
  goal: ScenarioGoal;
  briefing: string;
  guidance: readonly string[];
};

export const scenarios: readonly ScenarioDefinition[] = [
  {
    id: 'SC01',
    name: '暮らしの電化',
    subtitle: '1960年1月〜1964年12月 / 240週',
    startYear: 1960,
    durationWeeks: weeksPerYear * 5,
    initialCash: 10000,
    initialCapital: 10000,
    initialDebt: 0,
    initialBrandBasis: 1000,
    initialEmployees: 40,
    initialCapacityUnits: 40,
    initialEquipmentCost: 0,
    initialTechIds: ['tech-cooling-basic', 'tech-washing-basic', 'tech-imaging-basic'],
    initialChannels: { direct: 1, affiliate: 0 },
    goal: { cumulativeRevenue: 30000, cumulativeProfit: 3000, brandBasis: 3000 },
    briefing:
      '町工場から始まった電機会社を、家庭に家電が入り始めた時代に育てる。5年で売上30,000万円・累計利益3,000万円・ブランド30.00を達成すれば成功。資金が尽きれば敗北。',
    guidance: [
      '研究所で研究予算を決め、冷蔵庫か洗濯機を設計して開発を始める。',
      '開発が終わったら工場で週の生産量を、販売本部で価格と販路を決める。',
      '発売すると週送りのたびに売れる。経理部で資金と損益を確認する。',
    ],
  },
];

export function findScenario(id: string): ScenarioDefinition | undefined {
  return scenarios.find(scenario => scenario.id === id);
}
