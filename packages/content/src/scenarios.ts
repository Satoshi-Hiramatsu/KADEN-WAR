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
  /** 開始時の生産能力（工数/週）。 */
  initialWorkloadCapacity: number;
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
    name: '電化のあけぼの',
    subtitle: '1950年1月〜1959年12月 / 480週',
    startYear: 1950,
    durationWeeks: weeksPerYear * 10,
    initialCash: 1200,
    initialCapital: 1200,
    initialDebt: 0,
    initialBrandBasis: 1000,
    initialEmployees: 40,
    initialWorkloadCapacity: 1600,
    initialEquipmentCost: 0,
    initialTechIds: [
      'tech-battery-basic',
      'tech-lamp-basic',
      'tech-wiring-basic',
      'tech-radio-basic',
      'tech-heater-basic',
      'tech-motor-basic',
      'tech-toy-basic',
    ],
    initialChannels: { direct: 1, affiliate: 0 },
    goal: { cumulativeRevenue: 150000, cumulativeProfit: 15000, brandBasis: 3000 },
    briefing:
      '昭和25年。まだテレビも冷蔵庫もない家庭に、乾電池と電球とラジオを届ける町工場から始める。10年で累計売上150,000万円・累計利益15,000万円・ブランド30.00を達成すれば成功。資金が尽きれば敗北。',
    guidance: [
      'はじめは乾電池・電球・配線器具・ブリキ玩具のような小物で現金を作る。数が出るぶん工場が回る。',
      '真空管ラジオはこの時代の主力商品。研究所で五球スーパーを開発すれば単価の高い上級機が作れる。',
      '洗濯機・冷蔵庫・テレビは研究しなければ設計できない。史実どおり1953年前後から順に世に出る。',
    ],
  },
];

export function findScenario(id: string): ScenarioDefinition | undefined {
  return scenarios.find(scenario => scenario.id === id);
}
