export type ChannelId = 'direct' | 'affiliate';

export type ChannelDefinition = {
  id: ChannelId;
  name: string;
  /** 1拠点あたりの週次販売能力（台）。 */
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
    capacityPerUnit: 26,
    weeklyCost: 14,
    openCost: 300,
    commissionBasis: 0,
    reachBasis: 8600,
    maxUnits: 6,
    description: '自社で抱える店。手数料はないが維持費と人手がかかる。',
  },
  {
    id: 'affiliate',
    name: '系列店',
    capacityPerUnit: 58,
    weeklyCost: 7,
    openCost: 200,
    commissionBasis: 900,
    reachBasis: 10200,
    maxUnits: 6,
    description: '地域の販売店と契約する。台数は伸びるが手数料を払う。',
  },
];

export function findChannel(id: string): ChannelDefinition | undefined {
  return channels.find(channel => channel.id === id);
}
