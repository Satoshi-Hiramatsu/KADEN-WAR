/** 担当者の定義。顔画像はS9で個別スプライト化するまで役職と名前で識別する。 */
export type ExecutiveId = 'president' | 'design' | 'sales' | 'finance' | 'production' | 'personnel';

export type ExecutiveDefinition = {
  id: ExecutiveId;
  role: string;
  name: string;
  /** 専門画面のID。社長室・研究所・販売本部・経理部・工場・人事部。 */
  screenId: string;
  /** 顔一覧原画での位置（3列×2行）。個別スプライトはS9で制作する。 */
  portrait: { column: number; row: number };
  focus: string;
};

export const executives: readonly ExecutiveDefinition[] = [
  { id: 'president', role: '経営者', name: '高峰 誠', screenId: 'office', portrait: { column: 0, row: 0 }, focus: '全社の優先順位と決裁' },
  { id: 'design', role: '設計統括', name: '三枝 凛', screenId: 'lab', portrait: { column: 1, row: 0 }, focus: '研究と製品設計' },
  { id: 'sales', role: '販売統括', name: '鳴海 達也', screenId: 'sales', portrait: { column: 2, row: 0 }, focus: '価格・販路・販売実績' },
  { id: 'finance', role: '経理統括', name: '水野 智子', screenId: 'finance', portrait: { column: 0, row: 1 }, focus: '損益・資金繰り・借入' },
  { id: 'production', role: '生産統括', name: '岩瀬 修', screenId: 'factory', portrait: { column: 1, row: 1 }, focus: '生産量・設備・在庫' },
  { id: 'personnel', role: '人事統括', name: '春野 佳代', screenId: 'office', portrait: { column: 2, row: 1 }, focus: '人員と人件費の報告' },
];

export function findExecutive(id: ExecutiveId): ExecutiveDefinition {
  const executive = executives.find(candidate => candidate.id === id);
  if (!executive) throw new RangeError(`担当者の定義がありません: ${id}`);
  return executive;
}
