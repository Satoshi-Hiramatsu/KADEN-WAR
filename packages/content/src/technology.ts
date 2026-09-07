import type { CategoryId } from './categories';

export type ModuleSlot = 'core' | 'eco' | 'body';

export const moduleSlots: readonly { id: ModuleSlot; name: string; description: string }[] = [
  { id: 'core', name: '中核機構', description: '製品の基本性能を決める主要部品。' },
  { id: 'eco', name: '効率・部材', description: '消費電力や部材の等級。原価と使い勝手を左右する。' },
  { id: 'body', name: '外装', description: '外装と組み立て。原価と印象に効く。' },
];

export type ModuleDefinition = {
  id: string;
  name: string;
  slot: ModuleSlot;
  /** 使える製品分類。'all' はすべての分類で選べる。 */
  categoryIds: readonly CategoryId[] | 'all';
  /** 必要な保有技術。null は初期から使える。 */
  requiredTechId: string | null;
  /** 性能指数への加算。 */
  performance: number;
  /** 製造原価への加算（円）。分類ごとの価格帯が違うため、原則は下の比率で持つ。 */
  unitCost: number;
  /** 製造原価への加算（分類の標準原価に対する万分率）。 */
  unitCostBasis: number;
  /** 開発期間への加算（週）。 */
  devWeeks: number;
  /** 開発費への加算（分類の標準開発費に対する万分率）。 */
  devCostBasis: number;
  /** 消費電力の指数。100が標準で、小さいほど省エネ。 */
  energy: number;
  description: string;
};

type ModuleRow = [
  id: string,
  name: string,
  slot: ModuleSlot,
  categoryIds: readonly CategoryId[] | 'all',
  requiredTechId: string | null,
  performance: number,
  unitCostBasis: number,
  devWeeks: number,
  devCostBasis: number,
  energy: number,
  description: string,
];

const moduleRows: ModuleRow[] = [
  // ── 中核機構：電池・電気部材 ──────────────────────────────────
  ['mod-batt-1', '炭素亜鉛乾電池', 'core', ['battery-dry'], null, 0, 0, 0, 0, 100,
    '当時の標準的なマンガン乾電池。安く大量に作れる。'],
  ['mod-batt-2', '高容量・長寿命電池', 'core', ['battery-dry'], 'tech-battery-advanced', 28, 2600, 1, 3000, 92,
    '電解液と炭素棒を改良し、持ちを大きく伸ばした電池。'],
  ['mod-wire-1', '陶器・ベーク配線器具', 'core', ['wiring-device'], null, 0, 0, 0, 0, 100,
    '当時ごく一般的な磁器とベークライトの器具。'],
  ['mod-wire-2', '樹脂成形配線器具', 'core', ['wiring-device'], 'tech-plastic', 22, 2200, 1, 3000, 100,
    '割れにくく、色も付けられる樹脂成形の器具。'],
  ['mod-trans-1', '積層鉄心トランス', 'core', ['transformer'], null, 0, 0, 0, 0, 100,
    '珪素鋼板を積んだ標準的な電源トランス。'],
  ['mod-trans-2', '低損失トランス', 'core', ['transformer'], 'tech-efficiency-1', 26, 2800, 1, 3200, 84,
    '鉄損・銅損を抑えた高効率型。セットメーカーに評価される。'],
  ['mod-flash-1', 'ブリキ筒・豆電球', 'core', ['flashlight'], null, 0, 0, 0, 0, 100,
    'ブリキを巻いた筒に豆電球を仕込んだ標準型。'],
  ['mod-flash-2', '集光レンズ・防水筒', 'core', ['flashlight'], 'tech-plastic', 24, 3000, 1, 3000, 96,
    'レンズで光を集め、雨でも使える樹脂筒に収めた。'],

  // ── 中核機構：照明 ────────────────────────────────────────────
  ['mod-bulb-1', '単コイルタングステン', 'core', ['bulb-incandescent'], null, 0, 0, 0, 0, 100,
    'タングステン線を一重に巻いた標準的な電球。'],
  ['mod-bulb-2', '二重コイル電球', 'core', ['bulb-incandescent'], 'tech-lamp-advanced', 26, 2800, 1, 3000, 86,
    'コイルを二重にして明るさと寿命を伸ばした電球。'],
  ['mod-fluor-1', 'グロー始動式', 'core', ['lamp-fluorescent'], null, 0, 0, 0, 0, 100,
    '点灯管を使う標準的な蛍光ランプ。'],
  ['mod-fluor-2', 'ラピッドスタート式', 'core', ['lamp-fluorescent'], 'tech-lamp-advanced', 28, 3200, 2, 3500, 90,
    '点灯管なしですぐ点く。事務所向けに強い。'],
  ['mod-desk-1', '白熱スタンド', 'core', ['desk-lamp'], null, 0, 0, 0, 0, 100,
    '白熱電球を使った素直な作りのスタンド。'],
  ['mod-desk-2', '蛍光灯スタンド', 'core', ['desk-lamp'], 'tech-fluorescent', 26, 3200, 2, 3500, 78,
    '手元が明るく目に優しい。受験生のいる家庭に売れる。'],

  // ── 中核機構：音響 ────────────────────────────────────────────
  ['mod-radio-1', '並四（再生検波）', 'core', ['radio-tube'], null, 0, 0, 0, 0, 100,
    '真空管4本の普及型。安いが感度と音質は程々。'],
  ['mod-radio-2', '五球スーパー', 'core', ['radio-tube'], 'tech-radio-advanced', 30, 2600, 2, 3000, 104,
    'スーパーヘテロダイン方式。遠距離も澄んだ音で入る。'],
  ['mod-tr-1', '六石トランジスタ回路', 'core', ['radio-transistor'], null, 0, 0, 0, 0, 100,
    'トランジスタ6石の標準構成。電池が長持ちする。'],
  ['mod-tr-2', '高感度多石回路', 'core', ['radio-transistor'], 'tech-transistor-advanced', 30, 2600, 2, 3200, 92,
    '石数を増やして感度と選択度を高めた上級機。'],
  ['mod-rec-1', 'SP専用ターンテーブル', 'core', ['record-player'], null, 0, 0, 0, 0, 100,
    '78回転のSP盤に合わせた標準的な機構。'],
  ['mod-rec-2', 'LP対応4速ターンテーブル', 'core', ['record-player'], 'tech-motor-advanced', 28, 2600, 2, 3000, 96,
    'LP・EPまで回せる4速式。回転むらの少なさが売り。'],
  ['mod-tape-1', 'オープンリール録音機構', 'core', ['tape-recorder'], null, 0, 0, 0, 0, 100,
    '紙テープ時代から続く標準的な録音機構。'],
  ['mod-tape-2', '二トラック高忠実度機構', 'core', ['tape-recorder'], 'tech-magnetic-advanced', 30, 2800, 2, 3200, 94,
    'テープを二列に使い、音質と録音時間を両立する。'],

  // ── 中核機構：映像 ────────────────────────────────────────────
  ['mod-image-1', '真空管映像回路', 'core', ['television'], null, 0, 0, 0, 0, 100,
    '安定して作れるが、消費電力と発熱が大きい。'],
  ['mod-image-2', 'トランジスタ映像回路', 'core', ['television'], 'tech-imaging-advanced', 32, 2400, 3, 3500, 84,
    '画質と省電力を両立するが、部品が高い。'],
  ['mod-color-1', 'シャドーマスク方式', 'core', ['television-color'], null, 0, 0, 0, 0, 100,
    '三色の電子銃とマスクで色を作る、初期の標準方式。'],
  ['mod-color-2', '高輝度色再現回路', 'core', ['television-color'], 'tech-imaging-advanced', 30, 2600, 3, 3500, 92,
    '明るく色の濃い画面。店頭で並べたときに差が出る。'],

  // ── 中核機構：熱器具・厨房 ────────────────────────────────────
  ['mod-heat-1', 'ニクロム線ヒーター', 'core', ['iron', 'hotplate', 'toaster'], null, 0, 0, 0, 0, 100,
    '露出したニクロム線で熱をとる、最も簡単な構造。'],
  ['mod-heat-2', 'シーズヒーター', 'core', ['iron', 'hotplate', 'toaster'], 'tech-heater-advanced', 26, 2600, 1, 3000, 94,
    '金属管に封じた発熱体。丈夫で安全、寿命も長い。'],
  ['mod-thermo-1', 'バイメタル温度調節', 'core', ['kotatsu', 'blanket', 'rice-cooker'], null, 0, 0, 0, 0, 100,
    '金属の反りで温度を切り替える標準的な仕組み。'],
  ['mod-thermo-2', '二重釜・自動保温機構', 'core', ['kotatsu', 'blanket', 'rice-cooker'], 'tech-thermostat-advanced', 28, 2800, 2, 3200, 90,
    '温度を細かく保ち、切り忘れても安全に止まる。'],

  // ── 中核機構：モーター応用 ────────────────────────────────────
  ['mod-motor-1', '単相誘導電動機', 'core', ['fan', 'mixer', 'sewing-machine', 'vacuum', 'clock-electric'], null, 0, 0, 0, 0, 100,
    '扱いやすい標準的な小型電動機。'],
  ['mod-motor-2', '高効率小型電動機', 'core', ['fan', 'mixer', 'sewing-machine', 'vacuum', 'clock-electric'], 'tech-motor-advanced', 28, 2400, 2, 3000, 84,
    '軽く静かでよく回る。上級機の要になる電動機。'],
  ['mod-wash-1', '噴流式洗浄槽', 'core', ['washer'], null, 0, 0, 0, 0, 100,
    '水流を回して洗う国産の定番方式。'],
  ['mod-wash-2', '二槽式洗浄機構', 'core', ['washer'], 'tech-washing-advanced', 26, 2400, 3, 3000, 104,
    '洗いと脱水を分け、家事の時間を短くする。'],
  ['mod-cool-1', '直冷式ユニット', 'core', ['refrigerator'], null, 0, 0, 0, 0, 100,
    '構造が簡単で安い。霜取りは手作業になる。'],
  ['mod-cool-2', '間冷式ユニット', 'core', ['refrigerator'], 'tech-cooling-advanced', 28, 2200, 3, 3000, 96,
    '冷気を循環させ霜が付きにくい。原価と開発期間が増える。'],

  // ── 中核機構：玩具 ────────────────────────────────────────────
  ['mod-toy-1', 'ぜんまい・ブリキ機構', 'core', ['toy-tin', 'toy-motor'], null, 0, 0, 0, 0, 100,
    'ぜんまいを巻いて動かす、輸出玩具の定番構造。'],
  ['mod-toy-2', '乾電池モーター駆動', 'core', ['toy-tin', 'toy-motor'], 'tech-motor-basic', 24, 3000, 1, 3000, 100,
    '小型モーターで走らせる。乾電池と一緒に売れる。'],
  ['mod-plamo-1', '射出成形キット', 'core', ['toy-plastic-model'], null, 0, 0, 0, 0, 100,
    '金型に樹脂を流して部品を抜く、標準的なキット。'],
  ['mod-plamo-2', '精密金型・可動機構', 'core', ['toy-plastic-model'], 'tech-plastic-advanced', 28, 3000, 2, 3200, 100,
    '合わせ目が目立たず、砲塔や車輪まで動く上級キット。'],
  ['mod-rail-1', 'HOゲージ動力装置', 'core', ['toy-model-railway'], null, 0, 0, 0, 0, 100,
    '標準的なHOゲージの動力台車。'],
  ['mod-rail-2', '精密ダイキャスト動力', 'core', ['toy-model-railway'], 'tech-motor-advanced', 28, 2600, 2, 3000, 92,
    '重量と粘着で滑らかに走る、模型店が唸る動力。'],

  // ── 効率・部材（全分類共通） ──────────────────────────────────
  ['mod-eco-1', '標準部材', 'eco', 'all', null, 0, 0, 0, 0, 100,
    '一般的な部材。追加費用はかからない。'],
  ['mod-eco-2', '選別部材・低損失設計', 'eco', 'all', 'tech-efficiency-1', 14, 900, 2, 3000, 88,
    '部材を選別し損失を抑える。電気代を気にする層に効く。'],
  ['mod-eco-3', '高効率設計', 'eco', 'all', 'tech-efficiency-2', 30, 2200, 3, 5000, 72,
    '構造から見直して電力の無駄を大きく削る。'],

  // ── 外装（全分類共通） ────────────────────────────────────────
  ['mod-body-1', '標準外装（鋼板・ブリキ）', 'body', 'all', null, 0, 0, 0, 0, 100,
    '頑丈で作りやすい標準の外装。'],
  ['mod-body-2', '軽量成型外装', 'body', 'all', 'tech-material-1', 16, 700, 2, 2500, 98,
    '軽く扱いやすい。設置しやすさが評価される。'],
  ['mod-body-3', '樹脂成形外装', 'body', 'all', 'tech-plastic', 18, -300, 2, 2200, 98,
    '色も形も自由で、量産すれば鋼板より安く上がる。'],
];

export const modules: readonly ModuleDefinition[] = moduleRows.map(row => ({
  id: row[0],
  name: row[1],
  slot: row[2],
  categoryIds: row[3],
  requiredTechId: row[4],
  performance: row[5],
  unitCost: 0,
  unitCostBasis: row[6],
  devWeeks: row[7],
  devCostBasis: row[8],
  energy: row[9],
  description: row[10],
}));

export function findModule(id: string): ModuleDefinition | undefined {
  return modules.find(module => module.id === id);
}

export function moduleAllowsCategory(module: ModuleDefinition, categoryId: CategoryId): boolean {
  return module.categoryIds === 'all' || module.categoryIds.includes(categoryId);
}

export function modulesFor(categoryId: CategoryId, slot: ModuleSlot): ModuleDefinition[] {
  return modules.filter(module => module.slot === slot && moduleAllowsCategory(module, categoryId));
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
  /** この年より前は着手できない。史実の実用化時期に合わせる。 */
  minYear: number;
  /** 完了で設計できるようになる製品分類。 */
  unlocksCategoryIds: readonly CategoryId[];
  effect: string;
};

type ResearchRow = [
  id: string,
  name: string,
  requiredPoints: number,
  grantsTechId: string,
  requiredTechIds: readonly string[],
  minYear: number,
  unlocksCategoryIds: readonly CategoryId[],
  effect: string,
];

const researchRows: ResearchRow[] = [
  ['res-production-1', '量産・歩留まり改善', 320, 'tech-production-1', [], 1950, [],
    '不良率を3.0%下げ、生産能力を150工数/週増やす。'],
  ['res-efficiency-1', '省電力設計の基礎', 300, 'tech-efficiency-1', [], 1950, [],
    '効率・部材「選別部材・低損失設計」と低損失トランスを解禁する。'],
  ['res-material-1', '軽量材料の実用化', 340, 'tech-material-1', [], 1951, [],
    '外装「軽量成型外装」を解禁する。'],
  ['res-radio-advanced', '五球スーパーの設計', 380, 'tech-radio-advanced', ['tech-radio-basic'], 1950, [],
    'ラジオの中核機構「五球スーパー」を解禁し、映像・トランジスタ研究の前提になる。'],
  ['res-battery-advanced', '高容量乾電池の開発', 260, 'tech-battery-advanced', ['tech-battery-basic'], 1951, [],
    '乾電池の中核機構「高容量・長寿命電池」を解禁する。'],
  ['res-lamp-advanced', '二重コイル電球の実用化', 300, 'tech-lamp-advanced', ['tech-lamp-basic'], 1951, [],
    '電球・蛍光ランプの上位機構を解禁する。'],
  ['res-record', '電蓄用駆動機構', 300, 'tech-record', ['tech-motor-basic'], 1951, ['record-player'],
    '電蓄（レコードプレーヤー）を設計できるようになる。'],
  ['res-fluorescent', '蛍光灯の実用化', 480, 'tech-fluorescent', ['tech-lamp-basic'], 1952, ['lamp-fluorescent'],
    '蛍光ランプを設計でき、蛍光灯スタンドも作れるようになる。'],
  ['res-heater-advanced', 'シーズヒーターの実用化', 300, 'tech-heater-advanced', ['tech-heater-basic'], 1952, [],
    'アイロン・電熱器・トースターの中核機構「シーズヒーター」を解禁する。'],
  ['res-washing-basic', '洗濯機の実用化', 520, 'tech-washing-basic', ['tech-motor-basic'], 1952, ['washer'],
    '電気洗濯機を設計できるようになる。'],
  ['res-cooling-basic', '家庭用冷凍機の実用化', 760, 'tech-cooling-basic', [], 1952, ['refrigerator'],
    '電気冷蔵庫を設計できるようになる。'],
  ['res-imaging-basic', '受像機（映像）技術', 900, 'tech-imaging-basic', ['tech-radio-advanced'], 1952, ['television'],
    '白黒テレビを設計できるようになる。'],
  ['res-motor-advanced', '高効率小型電動機', 420, 'tech-motor-advanced', ['tech-motor-basic'], 1953, ['vacuum'],
    '電気掃除機を解禁し、モーター応用製品の上位機構を使えるようにする。'],
  ['res-magnetic', '磁気録音技術', 640, 'tech-magnetic', ['tech-radio-basic'], 1953, ['tape-recorder'],
    'テープレコーダーを設計できるようになる。'],
  ['res-thermostat', '自動温度調節の確立', 460, 'tech-thermostat', ['tech-heater-basic'], 1954, ['rice-cooker', 'kotatsu', 'blanket'],
    '電気釜・電気こたつ・電気毛布を設計できるようになる。'],
  ['res-transistor', 'トランジスタの実用化', 980, 'tech-transistor', ['tech-radio-advanced'], 1954, ['radio-transistor'],
    'トランジスタラジオを設計できるようになる。'],
  ['res-production-2', '生産ラインの合理化', 640, 'tech-production-2', ['tech-production-1'], 1954, [],
    '不良率をさらに2.0%下げ、生産能力を300工数/週増やす。'],
  ['res-plastic', 'プラスチック成形技術', 420, 'tech-plastic', [], 1955, ['toy-plastic-model'],
    'プラモデルと樹脂成形の外装・配線器具を解禁する。'],
  ['res-efficiency-2', '省電力設計の応用', 700, 'tech-efficiency-2', ['tech-efficiency-1'], 1955, [],
    '効率・部材「高効率設計」を解禁する。'],
  ['res-washing-advanced', '二槽式洗浄の実用化', 620, 'tech-washing-advanced', ['tech-washing-basic'], 1956, [],
    '洗濯機の中核機構「二槽式洗浄機構」を解禁する。'],
  ['res-cooling-advanced', '間冷式冷却の実用化', 700, 'tech-cooling-advanced', ['tech-cooling-basic'], 1957, [],
    '冷蔵庫の中核機構「間冷式ユニット」を解禁する。'],
  ['res-transistor-advanced', '高感度トランジスタ回路', 720, 'tech-transistor-advanced', ['tech-transistor'], 1957, [],
    'トランジスタラジオの上位機構を解禁する。'],
  ['res-magnetic-advanced', '高忠実度録音機構', 680, 'tech-magnetic-advanced', ['tech-magnetic'], 1957, [],
    'テープレコーダーの上位機構を解禁する。'],
  ['res-plastic-advanced', '精密金型技術', 520, 'tech-plastic-advanced', ['tech-plastic'], 1958, [],
    'プラモデルの中核機構「精密金型・可動機構」を解禁する。'],
  ['res-imaging-advanced', 'トランジスタ映像回路の実用化', 980, 'tech-imaging-advanced', ['tech-imaging-basic', 'tech-transistor'], 1958, [],
    'テレビの中核機構「トランジスタ映像回路」を解禁する。'],
  ['res-imaging-color', 'カラー受像機の開発', 1600, 'tech-imaging-color', ['tech-imaging-advanced'], 1959, ['television-color'],
    'カラーテレビを設計できるようになる。'],
];

export const researchThemes: readonly ResearchTheme[] = researchRows.map(row => ({
  id: row[0],
  name: row[1],
  requiredPoints: row[2],
  grantsTechId: row[3],
  requiredTechIds: row[4],
  minYear: row[5],
  unlocksCategoryIds: row[6],
  effect: row[7],
}));

export function findResearchTheme(id: string): ResearchTheme | undefined {
  return researchThemes.find(theme => theme.id === id);
}

/** 技術IDの表示名。定義漏れでも画面が壊れないようIDを返す。 */
export const techNames: Readonly<Record<string, string>> = {
  'tech-battery-basic': '乾電池技術',
  'tech-battery-advanced': '高容量電池',
  'tech-lamp-basic': '電球技術',
  'tech-lamp-advanced': '高効率電球',
  'tech-fluorescent': '蛍光灯技術',
  'tech-wiring-basic': '配線器具技術',
  'tech-radio-basic': '真空管ラジオ技術',
  'tech-radio-advanced': 'スーパーヘテロダイン',
  'tech-record': '電蓄駆動技術',
  'tech-magnetic': '磁気録音技術',
  'tech-magnetic-advanced': '高忠実度録音',
  'tech-transistor': 'トランジスタ技術',
  'tech-transistor-advanced': '高感度トランジスタ',
  'tech-imaging-basic': '基礎映像技術',
  'tech-imaging-advanced': 'トランジスタ映像回路',
  'tech-imaging-color': 'カラー受像技術',
  'tech-heater-basic': '基礎電熱技術',
  'tech-heater-advanced': 'シーズヒーター',
  'tech-thermostat': '自動温度調節',
  'tech-thermostat-advanced': '高精度温度制御',
  'tech-motor-basic': '小型電動機技術',
  'tech-motor-advanced': '高効率電動機',
  'tech-washing-basic': '基礎洗浄技術',
  'tech-washing-advanced': '二槽式洗浄',
  'tech-cooling-basic': '基礎冷却技術',
  'tech-cooling-advanced': '間冷式冷却',
  'tech-toy-basic': '玩具製造技術',
  'tech-plastic': 'プラスチック成形',
  'tech-plastic-advanced': '精密金型技術',
  'tech-efficiency-1': '省電力設計',
  'tech-efficiency-2': '高効率設計',
  'tech-material-1': '軽量材料',
  'tech-production-1': '量産技術',
  'tech-production-2': 'ライン合理化',
};

export function techName(id: string): string {
  return techNames[id] ?? id;
}

/** 保有技術から得られる生産面の補正。能力の単位は工数/週。 */
export function productionBonus(ownedTechIds: readonly string[]): {
  defectReductionBasis: number;
  capacityBonus: number;
} {
  let defectReductionBasis = 0;
  let capacityBonus = 0;
  if (ownedTechIds.includes('tech-production-1')) {
    defectReductionBasis += 300;
    capacityBonus += 150;
  }
  if (ownedTechIds.includes('tech-production-2')) {
    defectReductionBasis += 200;
    capacityBonus += 300;
  }
  return { defectReductionBasis, capacityBonus };
}
