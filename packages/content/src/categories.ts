export type CategoryId = 'refrigerator' | 'washer' | 'television';

/** 年ごとの市場規模（台/週）を与える折れ線の節点。節点間は線形で補間する。 */
export type DemandAnchor = { year: number; unitsPerWeek: number };

export type CategoryDefinition = {
  id: CategoryId;
  name: string;
  shortName: string;
  /** この分類の設計に必要な基礎技術。 */
  requiredTechId: string;
  /** 市場の標準的な価格（千円）。魅力度の基準になる。 */
  referencePrice: number;
  /** 標準構成の製造原価（千円）。 */
  baseUnitCost: number;
  /** 標準構成の性能指数。 */
  basePerformance: number;
  baseDevWeeks: number;
  baseDevCost: number;
  /** 推奨価格を求めるときの原価に対する倍率（万分率、17000で1.7倍）。 */
  suggestedMarginBasis: number;
  demand: DemandAnchor[];
  description: string;
};

export const categories: readonly CategoryDefinition[] = [
  {
    id: 'refrigerator',
    name: '冷蔵庫',
    shortName: '冷',
    requiredTechId: 'tech-cooling-basic',
    referencePrice: 60,
    baseUnitCost: 30,
    basePerformance: 100,
    baseDevWeeks: 10,
    baseDevCost: 600,
    suggestedMarginBasis: 17000,
    demand: [
      { year: 1960, unitsPerWeek: 120 },
      { year: 1965, unitsPerWeek: 430 },
      { year: 1970, unitsPerWeek: 900 },
      { year: 1980, unitsPerWeek: 1400 },
      { year: 1990, unitsPerWeek: 1650 },
      { year: 2010, unitsPerWeek: 1800 },
    ],
    description: '家庭の食生活を変える白物家電。価格を抑えるほど普及が早い。',
  },
  {
    id: 'washer',
    name: '洗濯機',
    shortName: '洗',
    requiredTechId: 'tech-washing-basic',
    referencePrice: 40,
    baseUnitCost: 20,
    basePerformance: 100,
    baseDevWeeks: 8,
    baseDevCost: 450,
    suggestedMarginBasis: 17000,
    demand: [
      { year: 1960, unitsPerWeek: 165 },
      { year: 1965, unitsPerWeek: 470 },
      { year: 1970, unitsPerWeek: 880 },
      { year: 1980, unitsPerWeek: 1300 },
      { year: 1990, unitsPerWeek: 1500 },
      { year: 2010, unitsPerWeek: 1600 },
    ],
    description: '家事の負担を減らす定番。原価が低く、量を出す戦い方に向く。',
  },
  {
    id: 'television',
    name: 'テレビ',
    shortName: '映',
    requiredTechId: 'tech-imaging-basic',
    referencePrice: 80,
    baseUnitCost: 41,
    basePerformance: 100,
    baseDevWeeks: 12,
    baseDevCost: 900,
    suggestedMarginBasis: 19000,
    demand: [
      { year: 1960, unitsPerWeek: 210 },
      { year: 1965, unitsPerWeek: 720 },
      { year: 1970, unitsPerWeek: 1300 },
      { year: 1980, unitsPerWeek: 1700 },
      { year: 1990, unitsPerWeek: 2000 },
      { year: 2010, unitsPerWeek: 2600 },
    ],
    description: '単価が高く開発も重いが、当たれば売上の柱になる。',
  },
];

export function findCategory(id: string): CategoryDefinition | undefined {
  return categories.find(category => category.id === id);
}

/** 指定年の市場規模（台/週）。節点の外側は端の値で頭打ちにする。 */
export function demandUnitsAt(category: CategoryDefinition, year: number): number {
  const anchors = category.demand;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (!first || !last) throw new RangeError('需要の節点が定義されていません。');
  if (year <= first.year) return first.unitsPerWeek;
  if (year >= last.year) return last.unitsPerWeek;
  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const current = anchors[index];
    if (!previous || !current || year > current.year) continue;
    const span = current.year - previous.year;
    const progressed = year - previous.year;
    const delta = current.unitsPerWeek - previous.unitsPerWeek;
    return previous.unitsPerWeek + Math.floor((delta * progressed) / span);
  }
  return last.unitsPerWeek;
}
