/**
 * 広告の打ち方。使える媒体は時代で変わる。
 * 1950年の時点でテレビ放送はまだ始まっておらず、
 * 民放ラジオが1951年、テレビCMが1953年から現れる。
 */
export type AdCampaignId = 'tv' | 'radio' | 'newspaper' | 'store';

export type AdCampaignDefinition = {
  id: AdCampaignId;
  name: string;
  /** この年から打てる。 */
  availableFrom: number;
  /** 標準の費用（万円）。 */
  cost: number;
  /** 4週間の需要ブースト（万分率）。 */
  boostBasis: number;
  description: string;
  pitch: string;
};

export const adCampaigns: readonly AdCampaignDefinition[] = [
  {
    id: 'store',
    name: '店頭・街頭キャンペーン',
    availableFrom: 1950,
    cost: 30,
    boostBasis: 1200,
    description: '特約店の店頭で実演即売会を開き、ポスターやのぼりを掲げる。買う人に直接届く。',
    pitch: '店先での実演販売なら、明日からでも打てます。まずは足元の売り場を固めましょう。',
  },
  {
    id: 'newspaper',
    name: '新聞・雑誌広告',
    availableFrom: 1950,
    cost: 60,
    boostBasis: 2000,
    description: '全国紙や婦人雑誌に広告を出す。高い製品ほど、活字の信頼が効いてくる。',
    pitch: '新聞広告を打ちましょう。活字で読ませれば、値の張る品でも信用してもらえます。',
  },
  {
    id: 'radio',
    name: 'ラジオCM',
    availableFrom: 1951,
    cost: 90,
    boostBasis: 2600,
    description: '民間放送のラジオ番組に提供として入る。歌入りの短い節が茶の間に残る。',
    pitch: '民放ラジオの提供枠が取れます。耳に残る節をつければ、町じゅうが口ずさみますよ！',
  },
  {
    id: 'tv',
    name: 'テレビCM',
    availableFrom: 1953,
    cost: 150,
    boostBasis: 3500,
    description: 'テレビ放送でCMを流す。まだ受像機は少ないが、話題の作り方が桁違い。',
    pitch: 'ついにテレビの時代です。お茶の間にCMを流し、一気に名前を売りましょう！',
  },
];

export function findAdCampaign(id: string): AdCampaignDefinition | undefined {
  return adCampaigns.find(campaign => campaign.id === id);
}

export function adCampaignsAt(year: number): AdCampaignDefinition[] {
  return adCampaigns.filter(campaign => campaign.availableFrom <= year);
}

/** その年に打てるいちばん強い媒体。役員提案に使う。 */
export function bestAdCampaignAt(year: number): AdCampaignDefinition {
  const available = adCampaignsAt(year);
  const strongest = available[available.length - 1];
  if (!strongest) throw new RangeError('広告の定義がありません。');
  return strongest;
}
