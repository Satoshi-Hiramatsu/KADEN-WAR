/**
 * 製品分類。昭和25年（1950年）の乾電池・電球・真空管ラジオから、
 * 三種の神器（白黒テレビ・洗濯機・冷蔵庫）を経てカラーテレビまでを、
 * 実際の発売時期・価格帯・生産規模におおむね合わせて並べている。
 */
export type CategoryId =
  // 電池・部材
  | 'battery-dry' | 'wiring-device' | 'transformer' | 'flashlight'
  // 照明
  | 'bulb-incandescent' | 'lamp-fluorescent' | 'desk-lamp'
  // 音響
  | 'radio-tube' | 'radio-transistor' | 'record-player' | 'tape-recorder'
  // 映像
  | 'television' | 'television-color'
  // 熱器具
  | 'iron' | 'hotplate' | 'kotatsu' | 'blanket'
  // 厨房
  | 'toaster' | 'rice-cooker' | 'mixer'
  // モーター応用
  | 'fan' | 'sewing-machine' | 'vacuum' | 'clock-electric'
  // 白物
  | 'washer' | 'refrigerator'
  // 玩具
  | 'toy-tin' | 'toy-motor' | 'toy-plastic-model' | 'toy-model-railway';

/** 製品分類のまとまり。設計部品・付加価値項目・画面の並びを束ねる。 */
export type CategorySegmentId =
  | 'parts' | 'lighting' | 'audio' | 'video'
  | 'heating' | 'kitchen' | 'motor' | 'laundry' | 'cooling' | 'toy';

export const categorySegments: readonly { id: CategorySegmentId; name: string; description: string }[] = [
  { id: 'parts', name: '電池・電気部材', description: '乾電池や配線器具など、数を売って足腰を作る小物。' },
  { id: 'lighting', name: '照明', description: '電球から蛍光灯へ。家庭にも事務所にも売れる定番。' },
  { id: 'audio', name: '音響', description: 'ラジオを中心とした、この時代いちばんの家庭用電気製品。' },
  { id: 'video', name: '映像', description: 'テレビ。単価も開発も重いが、当たれば会社を変える。' },
  { id: 'heating', name: '熱器具', description: 'アイロン・電熱器・こたつ。構造が簡単で作りやすい。' },
  { id: 'kitchen', name: '厨房', description: '台所の電化。実用性がそのまま評価になる。' },
  { id: 'motor', name: 'モーター応用', description: '扇風機・ミシン・掃除機。小型電動機の腕が問われる。' },
  { id: 'laundry', name: '洗濯', description: '家事の負担を減らす白物家電の代表。' },
  { id: 'cooling', name: '冷蔵', description: '冷凍機技術が要る、高単価の白物家電。' },
  { id: 'toy', name: '玩具', description: 'ブリキ玩具から模型まで。輸出も含めて数が出る。' },
];

/** 年ごとの市場規模（台/週）を与える折れ線の節点。節点間は線形で補間する。 */
export type DemandAnchor = { year: number; unitsPerWeek: number };

export type CategoryDefinition = {
  id: CategoryId;
  name: string;
  shortName: string;
  segment: CategorySegmentId;
  /** 世に出た年。これより前は設計も販売もできない。 */
  availableFrom: number;
  /** この分類の設計に必要な基礎技術。 */
  requiredTechId: string;
  /** 基礎技術に加えて必要な技術（複合要件）。空なら追加なし。 */
  additionalTechIds: readonly string[];
  /** 設計に必要な週あたり生産能力（工数）。0なら制限なし。 */
  requiredWorkloadCapacity: number;
  /** 同じ系列（segment）で発売実績のある製品数の下限。0なら制限なし。 */
  requiredSegmentApprovedCount: number;
  /** 設計に必要な手元資金（万円）。0なら制限なし。 */
  requiredCash: number;
  /** 設計に必要な販路拠点数（直営店＋系列店の合計）。0なら制限なし。 */
  requiredChannelUnits: number;
  /**
   * ライバルがこの分類IDの製品で動きを見せると、上記4条件（技術は除く）を
   * 免除して対抗開発に踏み切れる。
   */
  rivalTriggerCategoryId: CategoryId | null;
  /** 市場の標準的な価格（円）。魅力度の基準になる。 */
  referencePrice: number;
  /** 標準構成の製造原価（円）。 */
  baseUnitCost: number;
  /** 標準構成の性能指数。 */
  basePerformance: number;
  baseDevWeeks: number;
  /** 標準構成の開発費（万円）。 */
  baseDevCost: number;
  /** 推奨価格を求めるときの原価に対する倍率（万分率、17000で1.7倍）。 */
  suggestedMarginBasis: number;
  /** 100台あたりの生産工数。乾電池は小さく、テレビは大きい。 */
  workloadPer100Units: number;
  demand: DemandAnchor[];
  description: string;
};

type CategoryRow = [
  id: CategoryId,
  name: string,
  shortName: string,
  segment: CategorySegmentId,
  availableFrom: number,
  requiredTechId: string,
  referencePrice: number,
  baseUnitCost: number,
  baseDevWeeks: number,
  baseDevCost: number,
  suggestedMarginBasis: number,
  workloadPer100Units: number,
  demand: [year: number, unitsPerWeek: number][],
  description: string,
];

const categoryRows: CategoryRow[] = [
  // ── 電池・電気部材 ────────────────────────────────────────────
  ['battery-dry', '乾電池', '電', 'parts', 1950, 'tech-battery-basic', 30, 19, 3, 40, 15000, 3,
    [[1950, 150000], [1955, 260000], [1960, 400000], [1970, 620000], [1990, 900000]],
    '懐中電灯やラジオに欠かせない消耗品。単価は数十円だが、桁違いの数が動く。'],
  ['wiring-device', '配線器具', '配', 'parts', 1950, 'tech-wiring-basic', 50, 32, 3, 35, 15000, 5,
    [[1950, 70000], [1955, 95000], [1960, 130000], [1970, 190000], [1990, 240000]],
    'スイッチ・コンセント・プラグ。電化が進むほど淡々と数が出る土台の商品。'],
  ['transformer', '電源トランス', '変', 'parts', 1950, 'tech-wiring-basic', 900, 580, 4, 60, 15000, 80,
    [[1950, 3000], [1955, 4200], [1960, 5000], [1970, 4000], [1990, 2500]],
    'ラジオやテレビの心臓部に収まる部品。同業他社にも売れる地味な稼ぎ頭。'],
  ['flashlight', '懐中電灯', '筒', 'parts', 1950, 'tech-battery-basic', 250, 160, 4, 45, 15000, 25,
    [[1950, 12000], [1955, 16000], [1960, 20000], [1970, 24000], [1990, 22000]],
    '乾電池と一緒に売れる定番。停電の多い時代、一家に一本が当たり前だった。'],

  // ── 照明 ──────────────────────────────────────────────────────
  ['bulb-incandescent', '白熱電球', '球', 'lighting', 1950, 'tech-lamp-basic', 60, 38, 3, 40, 15000, 6,
    [[1950, 60000], [1955, 85000], [1960, 110000], [1970, 140000], [1990, 130000]],
    '切れれば買い替える消耗品。工場さえ回れば安定して現金を生む。'],
  ['lamp-fluorescent', '蛍光ランプ', '蛍', 'lighting', 1953, 'tech-fluorescent', 350, 225, 6, 140, 15000, 30,
    [[1953, 3000], [1956, 9000], [1960, 22000], [1970, 60000], [1990, 90000]],
    '明るく電気代も安い新しい照明。事務所から家庭へ急速に広がる。'],
  ['desk-lamp', '電気スタンド', 'ス', 'lighting', 1952, 'tech-lamp-basic', 1800, 1150, 4, 70, 15000, 90,
    [[1952, 2500], [1956, 4000], [1960, 5500], [1970, 7000], [1990, 6500]],
    '受験勉強と内職を支えた一台。意匠の良し悪しがそのまま売れ行きに出る。'],

  // ── 音響 ──────────────────────────────────────────────────────
  ['radio-tube', '真空管ラジオ', 'ラ', 'audio', 1950, 'tech-radio-basic', 9000, 5800, 6, 200, 15000, 400,
    [[1950, 3500], [1955, 5500], [1960, 3000], [1965, 800], [1975, 200]],
    'まだテレビのない茶の間の主役。会社の看板になる、この時代の主力製品。'],
  ['radio-transistor', 'トランジスタラジオ', 'ト', 'audio', 1955, 'tech-transistor', 15000, 9600, 8, 420, 15500, 350,
    [[1955, 300], [1958, 1800], [1960, 5000], [1965, 12000], [1975, 15000]],
    '電池で動き、持ち歩ける。輸出でも戦える、新しい時代のラジオ。'],
  ['record-player', '電蓄（レコード）', '蓄', 'audio', 1952, 'tech-record', 16000, 10300, 7, 260, 15000, 600,
    [[1952, 500], [1956, 1200], [1960, 2500], [1970, 4000], [1985, 3000]],
    'ラジオと並ぶ音の商品。歌謡曲の広がりとともに家庭へ入っていく。'],
  ['tape-recorder', 'テープレコーダー', '録', 'audio', 1954, 'tech-magnetic', 42000, 27000, 10, 520, 15500, 1100,
    [[1954, 120], [1958, 400], [1962, 900], [1970, 2500], [1985, 4000]],
    '録れる、消せる、繰り返せる。学校や放送局から家庭へ降りてくる高級品。'],

  // ── 映像 ──────────────────────────────────────────────────────
  ['television', '白黒テレビ', '映', 'video', 1953, 'tech-imaging-basic', 175000, 115000, 14, 900, 15000, 4000,
    [[1953, 60], [1956, 350], [1959, 1600], [1964, 3000], [1970, 2000], [1985, 900]],
    '本放送が始まったばかりの高嶺の花。単価も開発も重いが、当たれば会社が変わる。'],
  ['television-color', 'カラーテレビ', '彩', 'video', 1960, 'tech-imaging-color', 450000, 295000, 16, 1600, 15000, 6000,
    [[1960, 20], [1965, 400], [1970, 2400], [1980, 3000], [1995, 2600]],
    '本放送開始とともに登場した最高級機。原価も価格も桁が違う。'],

  // ── 熱器具 ────────────────────────────────────────────────────
  ['iron', '電気アイロン', 'ア', 'heating', 1950, 'tech-heater-basic', 1200, 770, 4, 60, 15000, 70,
    [[1950, 4000], [1955, 6500], [1960, 9000], [1970, 12000], [1990, 11000]],
    'ニクロム線とおもりだけの単純な構造。最初の量産練習にちょうどよい。'],
  ['hotplate', '電熱器（電気コンロ）', '熱', 'heating', 1950, 'tech-heater-basic', 800, 515, 3, 45, 15000, 55,
    [[1950, 5000], [1955, 6200], [1960, 7000], [1970, 6000], [1985, 4000]],
    '七輪の代わりに湯を沸かす。安く作れて、どの家庭にも売れる。'],
  ['kotatsu', '電気こたつ', 'こ', 'heating', 1957, 'tech-thermostat', 2500, 1600, 5, 90, 15000, 80,
    [[1957, 3000], [1960, 6000], [1965, 12000], [1975, 16000], [1990, 12000]],
    'こたつの炭を電熱に替えた冬の主役。温度調節の出来が評判を決める。'],
  ['blanket', '電気毛布', '毛', 'heating', 1958, 'tech-thermostat', 4500, 2900, 6, 120, 15000, 140,
    [[1958, 800], [1962, 2000], [1970, 4500], [1980, 6000], [1995, 5000]],
    '寝床を温める新商品。安全への信頼がそのまま売上になる。'],

  // ── 厨房 ──────────────────────────────────────────────────────
  ['toaster', 'トースター', 'パ', 'kitchen', 1953, 'tech-heater-basic', 2200, 1420, 4, 70, 15000, 100,
    [[1953, 1200], [1958, 2500], [1965, 5000], [1975, 7000], [1990, 6500]],
    'パン食の広がりとともに売れ出した台所の小物。'],
  ['rice-cooker', '電気釜', '釜', 'kitchen', 1955, 'tech-thermostat', 3200, 2050, 6, 130, 15000, 220,
    [[1955, 1500], [1958, 5000], [1960, 9000], [1970, 12000], [1990, 11000]],
    '朝の火加減から主婦を解放した大発明。実用性がすべてを決める。'],
  ['mixer', 'ミキサー', 'ミ', 'kitchen', 1956, 'tech-motor-basic', 4800, 3100, 5, 110, 15000, 200,
    [[1956, 600], [1960, 1600], [1965, 4000], [1975, 5500], [1990, 4500]],
    '洋食化の波に乗った台所の電動器具。目新しさで売る商品。'],

  // ── モーター応用 ──────────────────────────────────────────────
  ['fan', '扇風機', '扇', 'motor', 1950, 'tech-motor-basic', 5500, 3550, 5, 110, 15000, 180,
    [[1950, 1500], [1955, 3500], [1960, 6500], [1970, 9000], [1990, 8000]],
    '夏に集中して売れる季節商品。小型電動機の作り方を覚える最初の一歩。'],
  ['sewing-machine', '電気ミシン', '縫', 'motor', 1951, 'tech-motor-basic', 18000, 11600, 8, 240, 15000, 500,
    [[1951, 700], [1955, 1400], [1960, 2200], [1970, 2600], [1985, 1800]],
    '内職と家庭裁縫を支えた高級品。月賦販売でよく動いた。'],
  ['vacuum', '電気掃除機', '掃', 'motor', 1958, 'tech-motor-advanced', 12000, 7700, 8, 260, 15000, 450,
    [[1958, 400], [1962, 1200], [1965, 3500], [1975, 6000], [1990, 6500]],
    '畳の家に売り込むのに苦労した一台。吸込力と静けさの両立が課題。'],
  ['clock-electric', '電気時計', '時', 'motor', 1955, 'tech-motor-basic', 2800, 1800, 5, 90, 15000, 160,
    [[1955, 1200], [1960, 2200], [1965, 3500], [1975, 4000], [1990, 3200]],
    'ぜんまいのいらない掛時計。同期電動機の精度が製品の値打ちになる。'],

  // ── 白物 ──────────────────────────────────────────────────────
  ['washer', '電気洗濯機', '洗', 'laundry', 1953, 'tech-washing-basic', 28000, 18000, 8, 300, 15000, 800,
    [[1953, 300], [1957, 1400], [1960, 3200], [1965, 5000], [1975, 5500], [1990, 5000]],
    '家事の負担を大きく減らす白物家電。三種の神器の一角。'],
  ['refrigerator', '電気冷蔵庫', '冷', 'cooling', 1953, 'tech-cooling-basic', 85000, 55000, 10, 480, 15000, 1400,
    [[1953, 120], [1958, 500], [1962, 2000], [1970, 3500], [1990, 4000]],
    '氷屋を要らなくする高級品。当初は一部の家庭にしか手が届かなかった。'],

  // ── 玩具 ──────────────────────────────────────────────────────
  ['toy-tin', 'ブリキ玩具', '玩', 'toy', 1950, 'tech-toy-basic', 180, 115, 3, 30, 15500, 15,
    [[1950, 18000], [1955, 26000], [1958, 32000], [1965, 20000], [1975, 8000]],
    '戦後の輸出を支えた花形。ぜんまいとブリキで数を作って稼ぐ。'],
  ['toy-motor', '電動玩具', '動', 'toy', 1955, 'tech-toy-basic', 450, 288, 4, 55, 15500, 45,
    [[1955, 5000], [1960, 9000], [1965, 14000], [1975, 16000], [1990, 12000]],
    '乾電池で走る玩具。自社の乾電池と一緒に売れる相性の良さがある。'],
  ['toy-plastic-model', 'プラモデル', 'プ', 'toy', 1958, 'tech-plastic', 150, 95, 4, 60, 16000, 10,
    [[1958, 4000], [1962, 14000], [1965, 30000], [1975, 40000], [1990, 26000]],
    '国産プラモデルの黎明期。金型さえ作れば桁違いの数が出る。'],
  ['toy-model-railway', '鉄道模型', '鉄', 'toy', 1956, 'tech-toy-basic', 2500, 1600, 6, 120, 15500, 200,
    [[1956, 900], [1960, 1500], [1965, 2200], [1975, 2800], [1990, 2400]],
    '少年の憧れの高級玩具。走行の滑らかさに小型電動機の腕が出る。'],
];

/**
 * 主要な製品分類の追加アンロック要件。ここに載らない分類は、これまでどおり
 * 「世に出た年 × 基礎技術」だけで設計できる。花形の白物・映像・玩具の一部にだけ、
 * 生産能力・累積実績・資金力・販路・ライバル動向という追加の軸を持たせている。
 */
const categoryUnlockOverrides: Partial<Record<CategoryId, {
  additionalTechIds?: readonly string[];
  requiredWorkloadCapacity?: number;
  requiredSegmentApprovedCount?: number;
  requiredCash?: number;
  requiredChannelUnits?: number;
  rivalTriggerCategoryId?: CategoryId;
}>> = {
  // 電気洗濯機：量産できる体制がなければ着手できない。ライバルが動けば体制不問で対抗できる。
  washer: { requiredWorkloadCapacity: 3000, rivalTriggerCategoryId: 'washer' },
  // 白黒テレビ：売りさばく販路がなければ着手する意味が薄い。ライバル動向でも対抗開発を認める。
  television: { requiredChannelUnits: 3, rivalTriggerCategoryId: 'television' },
  // カラーテレビ：量産技術も要る高級品。体力（現金）も問われる。
  'television-color': { additionalTechIds: ['tech-production-2'], requiredCash: 6000 },
  // 電気掃除機：モーター応用の経験（同系列で2件の発売実績）を積んでから。
  vacuum: { requiredSegmentApprovedCount: 2 },
  // テープレコーダー：高級機ゆえ手元資金が要る。
  'tape-recorder': { requiredCash: 800 },
  // 電蓄（レコード）：ラジオなどで音響の実績を1件積んでから手を出す商品。
  'record-player': { requiredSegmentApprovedCount: 1 },
  // 電気ミシン：内職需要をさばける量産体制が要る。
  'sewing-machine': { requiredWorkloadCapacity: 2400 },
  // 鉄道模型：専門店網がなければ売り歩けない高級玩具。
  'toy-model-railway': { requiredChannelUnits: 2 },
};

export const categories: readonly CategoryDefinition[] = categoryRows.map(row => {
  const extra = categoryUnlockOverrides[row[0]] ?? {};
  return {
    id: row[0],
    name: row[1],
    shortName: row[2],
    segment: row[3],
    availableFrom: row[4],
    requiredTechId: row[5],
    additionalTechIds: extra.additionalTechIds ?? [],
    requiredWorkloadCapacity: extra.requiredWorkloadCapacity ?? 0,
    requiredSegmentApprovedCount: extra.requiredSegmentApprovedCount ?? 0,
    requiredCash: extra.requiredCash ?? 0,
    requiredChannelUnits: extra.requiredChannelUnits ?? 0,
    rivalTriggerCategoryId: extra.rivalTriggerCategoryId ?? null,
    referencePrice: row[6],
    baseUnitCost: row[7],
    basePerformance: 100,
    baseDevWeeks: row[8],
    baseDevCost: row[9],
    suggestedMarginBasis: row[10],
    workloadPer100Units: row[11],
    demand: row[12].map(([year, unitsPerWeek]) => ({ year, unitsPerWeek })),
    description: row[13],
  };
});

export function findCategory(id: string): CategoryDefinition | undefined {
  return categories.find(category => category.id === id);
}

export function categoriesInSegment(segment: CategorySegmentId): CategoryDefinition[] {
  return categories.filter(category => category.segment === segment);
}

/** その年に設計・販売できる分類（技術の保有は別に判定する）。 */
export function categoriesAvailableAt(year: number): CategoryDefinition[] {
  return categories.filter(category => category.availableFrom <= year);
}

export function segmentName(segment: CategorySegmentId): string {
  return categorySegments.find(entry => entry.id === segment)?.name ?? segment;
}

/** 指定年の市場規模（台/週）。発売前は0、節点の外側は端の値で頭打ちにする。 */
export function demandUnitsAt(category: CategoryDefinition, year: number): number {
  if (year < category.availableFrom) return 0;
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

/** 生産工数から作れる台数を求める。 */
export function unitsFromWorkload(category: CategoryDefinition, workload: number): number {
  if (workload <= 0) return 0;
  return Math.floor((workload * 100) / category.workloadPer100Units);
}

/** 指定台数を作るのに必要な生産工数を求める。端数は切り上げる。 */
export function workloadForUnits(category: CategoryDefinition, units: number): number {
  if (units <= 0) return 0;
  return Math.ceil((units * category.workloadPer100Units) / 100);
}
