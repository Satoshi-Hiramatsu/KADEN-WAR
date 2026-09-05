import type { CategoryId } from './categories';

export type ModuleSlot = 'core' | 'eco' | 'body';

export const moduleSlots: readonly { id: ModuleSlot; name: string; description: string }[] = [
  { id: 'core', name: '中核機構', description: '製品の基本性能を決める主要部品。' },
  { id: 'eco', name: '省エネ機構', description: '消費電力と使い勝手を左右する。' },
  { id: 'body', name: '筐体', description: '外装と組み立て。原価と印象に効く。' },
];

export type ModuleDefinition = {
  id: string;
  name: string;
  slot: ModuleSlot;
  categoryIds: readonly CategoryId[];
  /** 必要な保有技術。null は初期から使える。 */
  requiredTechId: string | null;
  /** 性能指数への加算。 */
  performance: number;
  /** 製造原価への加算（千円）。 */
  unitCost: number;
  /** 開発期間への加算（週）。 */
  devWeeks: number;
  /** 開発費への加算（万円）。 */
  devCost: number;
  /** 消費電力の指数。100が標準で、小さいほど省エネ。 */
  energy: number;
  description: string;
};

export const modules: readonly ModuleDefinition[] = [
  {
    id: 'mod-cool-1', name: '直冷式ユニット', slot: 'core', categoryIds: ['refrigerator'],
    requiredTechId: null, performance: 0, unitCost: 0, devWeeks: 0, devCost: 0, energy: 100,
    description: '構造が簡単で安い。霜取りは手作業になる。',
  },
  {
    id: 'mod-cool-2', name: '間冷式ユニット', slot: 'core', categoryIds: ['refrigerator'],
    requiredTechId: 'tech-cooling-advanced', performance: 26, unitCost: 8, devWeeks: 3, devCost: 260, energy: 96,
    description: '冷気を循環させ霜が付きにくい。原価と開発期間が増える。',
  },
  {
    id: 'mod-wash-1', name: '撹拌式洗浄槽', slot: 'core', categoryIds: ['washer'],
    requiredTechId: null, performance: 0, unitCost: 0, devWeeks: 0, devCost: 0, energy: 100,
    description: '定番の洗浄機構。可もなく不可もない。',
  },
  {
    id: 'mod-wash-2', name: '二槽式洗浄機構', slot: 'core', categoryIds: ['washer'],
    requiredTechId: 'tech-washing-advanced', performance: 24, unitCost: 6, devWeeks: 3, devCost: 220, energy: 104,
    description: '洗いと脱水を分け、家事の時間を短くする。',
  },
  {
    id: 'mod-image-1', name: '真空管映像回路', slot: 'core', categoryIds: ['television'],
    requiredTechId: null, performance: 0, unitCost: 0, devWeeks: 0, devCost: 0, energy: 100,
    description: '安定して作れるが、消費電力と発熱が大きい。',
  },
  {
    id: 'mod-image-2', name: 'トランジスタ映像回路', slot: 'core', categoryIds: ['television'],
    requiredTechId: 'tech-imaging-advanced', performance: 32, unitCost: 12, devWeeks: 4, devCost: 420, energy: 84,
    description: '画質と省電力を両立するが、部品が高い。',
  },
  {
    id: 'mod-eco-1', name: '標準断熱・配線', slot: 'eco', categoryIds: ['refrigerator', 'washer', 'television'],
    requiredTechId: null, performance: 0, unitCost: 0, devWeeks: 0, devCost: 0, energy: 100,
    description: '一般的な部材。追加費用はかからない。',
  },
  {
    id: 'mod-eco-2', name: '低消費電力設計', slot: 'eco', categoryIds: ['refrigerator', 'washer', 'television'],
    requiredTechId: 'tech-efficiency-1', performance: 14, unitCost: 4, devWeeks: 2, devCost: 180, energy: 88,
    description: '待機電力と損失を抑える。電気代を気にする層に効く。',
  },
  {
    id: 'mod-eco-3', name: '高効率制御', slot: 'eco', categoryIds: ['refrigerator', 'washer', 'television'],
    requiredTechId: 'tech-efficiency-2', performance: 30, unitCost: 11, devWeeks: 3, devCost: 380, energy: 72,
    description: '運転を細かく制御し、電力を大きく削る。',
  },
  {
    id: 'mod-body-1', name: '鋼板筐体', slot: 'body', categoryIds: ['refrigerator', 'washer', 'television'],
    requiredTechId: null, performance: 0, unitCost: 0, devWeeks: 0, devCost: 0, energy: 100,
    description: '頑丈で作りやすい標準の外装。',
  },
  {
    id: 'mod-body-2', name: '軽量成型筐体', slot: 'body', categoryIds: ['refrigerator', 'washer', 'television'],
    requiredTechId: 'tech-material-1', performance: 16, unitCost: 3, devWeeks: 2, devCost: 200, energy: 98,
    description: '軽く扱いやすい。設置しやすさが評価される。',
  },
];

export function findModule(id: string): ModuleDefinition | undefined {
  return modules.find(module => module.id === id);
}

export function modulesFor(categoryId: CategoryId, slot: ModuleSlot): ModuleDefinition[] {
  return modules.filter(module => module.slot === slot && module.categoryIds.includes(categoryId));
}

export type ResearchTheme = {
  id: string;
  name: string;
  /** 完了に必要な研究ポイント。研究予算1万円で1ポイント進む。 */
  requiredPoints: number;
  /** 完了時に獲得する技術。 */
  grantsTechId: string;
  /** 着手に必要な保有技術。 */
  requiredTechIds: readonly string[];
  effect: string;
};

export const researchThemes: readonly ResearchTheme[] = [
  {
    id: 'res-efficiency-1', name: '省電力設計の基礎', requiredPoints: 420,
    grantsTechId: 'tech-efficiency-1', requiredTechIds: [],
    effect: '省エネ機構「低消費電力設計」を解禁する。',
  },
  {
    id: 'res-production-1', name: '量産・歩留まり改善', requiredPoints: 560,
    grantsTechId: 'tech-production-1', requiredTechIds: [],
    effect: '不良率を3.0%下げ、生産能力を5台/週増やす。',
  },
  {
    id: 'res-material-1', name: '軽量材料の実用化', requiredPoints: 520,
    grantsTechId: 'tech-material-1', requiredTechIds: [],
    effect: '筐体「軽量成型筐体」を解禁する。',
  },
  {
    id: 'res-cooling-advanced', name: '間冷式冷却の実用化', requiredPoints: 780,
    grantsTechId: 'tech-cooling-advanced', requiredTechIds: ['tech-cooling-basic'],
    effect: '冷蔵庫の中核機構「間冷式ユニット」を解禁する。',
  },
  {
    id: 'res-washing-advanced', name: '二槽式洗浄の実用化', requiredPoints: 700,
    grantsTechId: 'tech-washing-advanced', requiredTechIds: ['tech-washing-basic'],
    effect: '洗濯機の中核機構「二槽式洗浄機構」を解禁する。',
  },
  {
    id: 'res-imaging-advanced', name: 'トランジスタ映像回路の実用化', requiredPoints: 980,
    grantsTechId: 'tech-imaging-advanced', requiredTechIds: ['tech-imaging-basic'],
    effect: 'テレビの中核機構「トランジスタ映像回路」を解禁する。',
  },
  {
    id: 'res-efficiency-2', name: '省電力設計の応用', requiredPoints: 1100,
    grantsTechId: 'tech-efficiency-2', requiredTechIds: ['tech-efficiency-1'],
    effect: '省エネ機構「高効率制御」を解禁する。',
  },
  {
    id: 'res-production-2', name: '生産ラインの合理化', requiredPoints: 900,
    grantsTechId: 'tech-production-2', requiredTechIds: ['tech-production-1'],
    effect: '不良率をさらに2.0%下げ、生産能力を10台/週増やす。',
  },
];

export function findResearchTheme(id: string): ResearchTheme | undefined {
  return researchThemes.find(theme => theme.id === id);
}

/** 技術IDの表示名。定義漏れでも画面が壊れないようIDを返す。 */
export const techNames: Readonly<Record<string, string>> = {
  'tech-cooling-basic': '基礎冷却技術',
  'tech-washing-basic': '基礎洗浄技術',
  'tech-imaging-basic': '基礎映像技術',
  'tech-efficiency-1': '省電力設計',
  'tech-efficiency-2': '高効率制御',
  'tech-material-1': '軽量材料',
  'tech-production-1': '量産技術',
  'tech-production-2': 'ライン合理化',
  'tech-cooling-advanced': '間冷式冷却',
  'tech-washing-advanced': '二槽式洗浄',
  'tech-imaging-advanced': 'トランジスタ回路',
};

export function techName(id: string): string {
  return techNames[id] ?? id;
}

/** 保有技術から得られる生産面の補正。 */
export function productionBonus(ownedTechIds: readonly string[]): {
  defectReductionBasis: number;
  capacityBonus: number;
} {
  let defectReductionBasis = 0;
  let capacityBonus = 0;
  if (ownedTechIds.includes('tech-production-1')) {
    defectReductionBasis += 300;
    capacityBonus += 5;
  }
  if (ownedTechIds.includes('tech-production-2')) {
    defectReductionBasis += 200;
    capacityBonus += 10;
  }
  return { defectReductionBasis, capacityBonus };
}
