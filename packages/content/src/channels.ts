export type ChannelId = 'direct' | 'affiliate';

export type ChannelDefinition = {
  id: ChannelId;
  name: string;
  /**
   * 1拠点あたりの週次販売能力（工数）。
   * 生産と同じ尺度で数えるため、乾電池なら何万本、テレビなら数十台に相当する。
   */
  capacityPerUnit: number;
  /** 1拠点あたりの週次維持費（万円）。 */
  weeklyCost: number;
  /** 開設費（万円）。 */
  openCost: number;
  /** 売上に対する手数料（万分率）。 */
  commissionBasis: number;
  /** 到達力。魅力度に掛かる（万分率）。 */
  reachBasis: number;
  maxUnits: number;
  description: string;
};

export const channels: readonly ChannelDefinition[] = [
  {
    id: 'direct',
    name: '直営店',
    capacityPerUnit: 800,
    weeklyCost: 6,
    openCost: 120,
    commissionBasis: 0,
    reachBasis: 8600,
    maxUnits: 6,
    description: '自社で抱える店。手数料はないが維持費と人手がかかる。',
  },
  {
    id: 'affiliate',
    name: '系列店',
    capacityPerUnit: 1600,
    weeklyCost: 3,
    openCost: 60,
    commissionBasis: 900,
    reachBasis: 10200,
    maxUnits: 6,
    description: '街の電器店と特約を結ぶ。数はさばけるが手数料を払う。',
  },
];

export function findChannel(id: string): ChannelDefinition | undefined {
  return channels.find(channel => channel.id === id);
}
