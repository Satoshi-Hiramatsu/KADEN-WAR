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

/** 昭和25年（1950年）以降の業界史。ニュース速報として画面に流す。 */
export const historicalEvents: readonly HistoricalEventDefinition[] = [
  {
    id: 'event-korea-boom',
    year: 1950,
    month: 8,
    title: '朝鮮特需で工場に活気',
    headline: '軍需・輸出向けの引き合いが各地の町工場に殺到',
    description: '朝鮮半島の動乱にともなう特需で、金属加工と電気部品の注文が急増しています。ブリキ玩具や乾電池の輸出も伸び、資材の値段も同時に上がり始めました。',
    impactType: 'boom',
    demandMultiplierBasis: 11500,
  },
  {
    id: 'event-radio-license',
    year: 1951,
    month: 9,
    title: '民間放送が開局',
    headline: '民放ラジオの誕生で受信機の需要が一段と拡大',
    description: '民間ラジオ放送が始まり、番組の選択肢が一気に増えました。まだ一家に一台とはいかないラジオを、いよいよ茶の間へ売り込む好機です。',
    impactType: 'boom',
    targetCategoryId: 'radio-tube',
    demandMultiplierBasis: 12500,
  },
  {
    id: 'event-tv-broadcast',
    year: 1953,
    month: 2,
    title: 'テレビ本放送はじまる',
    headline: '受像機は十七万円台、街頭テレビに人だかり',
    description: 'ついにテレビの本放送が始まりました。受像機の値段は勤め人の年収を超え、当面は街頭テレビと富裕層が相手です。しかし各社が本気で開発に乗り出しました。',
    impactType: 'demand_shift',
    targetCategoryId: 'television',
    demandMultiplierBasis: 13000,
  },
  {
    id: 'event-washer-boom',
    year: 1954,
    month: 5,
    title: '噴流式洗濯機が話題に',
    headline: '「家事から解放される」と主婦層の関心が高まる',
    description: '国産の噴流式洗濯機が新聞や婦人雑誌で盛んに取り上げられています。値段はまだ高いものの、月賦での購入が広がりつつあります。',
    impactType: 'boom',
    targetCategoryId: 'washer',
    demandMultiplierBasis: 12000,
  },
  {
    id: 'event-jinmu-boom',
    year: 1955,
    month: 4,
    title: '神武景気に沸く',
    headline: '「もはや戦後ではない」——空前の好景気で消費が拡大',
    description: '設備投資と個人消費がそろって伸び、電気製品の売れ行きが目に見えて良くなっています。増産の好機ですが、資材の逼迫にも気を配る必要があります。',
    impactType: 'boom',
    demandMultiplierBasis: 12500,
  },
  {
    id: 'event-three-treasures',
    year: 1956,
    month: 6,
    title: '「三種の神器」ブーム到来',
    headline: '白黒テレビ・洗濯機・冷蔵庫が豊かさの象徴に',
    description: '三種の神器という言葉が流行し、白物家電が憧れの的になりました。手が届かない家庭ほど、月賦と積立で買おうとしています。',
    impactType: 'boom',
    demandMultiplierBasis: 12500,
  },
  {
    id: 'event-nabezoko',
    year: 1957,
    month: 7,
    title: 'なべ底不況',
    headline: '金融引き締めで消費が急速に冷え込む',
    description: '国際収支の悪化を受けた引き締めで、高額品の売れ行きが止まりました。過剰在庫と手形の期日に注意が必要です。',
    impactType: 'recession',
    demandMultiplierBasis: 8500,
  },
  {
    id: 'event-copper-hike',
    year: 1958,
    month: 4,
    title: '銅・鋼材の価格高騰',
    headline: '世界的な資源需要により製造原価に上昇圧力',
    description: 'モーターや配線に使う銅材、外装の鋼板がそろって値上がりしています。各社とも原価低減が急務です。',
    impactType: 'cost_hike',
    costHikeBasis: 11000,
  },
  {
    id: 'event-iwato-boom',
    year: 1958,
    month: 7,
    title: '岩戸景気とテレビの普及',
    headline: '受像機の値下がりで一般家庭にもテレビが入り始める',
    description: '量産で受像機の値段が下がり、契約数が急激に伸びています。テレビを持つ家に近所が集まる光景が各地で見られます。',
    impactType: 'boom',
    targetCategoryId: 'television',
    demandMultiplierBasis: 13500,
  },
  {
    id: 'event-royal-wedding',
    year: 1959,
    month: 4,
    title: 'ご成婚パレード、テレビ特需',
    headline: '中継を見ようとテレビの注文が電器店に殺到',
    description: '皇太子ご成婚の中継を家で見ようと、全国の電器店にテレビの注文が殺到しています。作っただけ売れる状況ですが、納期の遅れは信用に響きます。',
    impactType: 'boom',
    targetCategoryId: 'television',
    demandMultiplierBasis: 15000,
  },
  {
    id: 'event-color-broadcast',
    year: 1960,
    month: 9,
    title: 'カラーテレビ本放送開始',
    headline: '価格は白黒の数倍、まずは業務用と富裕層から',
    description: 'カラーの本放送が始まりました。受像機は極めて高価で、当面は限られた需要ですが、次の十年の主戦場になるのは間違いありません。',
    impactType: 'demand_shift',
    targetCategoryId: 'television-color',
    demandMultiplierBasis: 13000,
  },
  {
    id: 'event-olympic-special',
    year: 1964,
    month: 2,
    title: '東京五輪特需',
    headline: '世紀の大祭典を前にテレビ需要が最高潮',
    description: '東京オリンピックの開会式を家庭で見ようと、全国の電器店に客が殺到しています。テレビの需要が空前の規模に膨らんでいます。',
    impactType: 'boom',
    targetCategoryId: 'television',
    demandMultiplierBasis: 15000,
  },
  {
    id: 'event-post-olympic-chill',
    year: 1965,
    month: 1,
    title: '五輪後の反動不況（40年不況）',
    headline: '家電普及の一服と過剰在庫による景気後退',
    description: 'オリンピック特需の反動から個人消費が一時的に冷え込んでいます。無理な増産を控えて資金繰りを厳格に管理する必要があります。',
    impactType: 'recession',
    demandMultiplierBasis: 8500,
  },
];

export function findHistoricalEvent(year: number, month: number): HistoricalEventDefinition | undefined {
  return historicalEvents.find(event => event.year === year && event.month === month);
}
