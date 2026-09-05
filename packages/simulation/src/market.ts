import { categories, demandUnitsAt, findCategory, type CategoryId } from '../../content/src/categories';
import { channels, findChannel } from '../../content/src/channels';
import { rivals } from '../../content/src/rivals';
import { economyRules } from '../../content/src/rules';
import { nextInt } from './rng';
import type { GameState, Product } from './types';

export type MarketEntry = {
  id: string;
  name: string;
  owner: 'player' | 'rival';
  performance: number;
  /** 価格（千円）。 */
  price: number;
  attractivenessBasis: number;
  shareBasis: number;
  unitsDemanded: number;
};

export type CategoryMarket = {
  categoryId: CategoryId;
  categoryName: string;
  demandUnits: number;
  entries: MarketEntry[];
};

export type MarketEvaluation = { markets: CategoryMarket[]; rng: number };

/** 販路の到達力（万分率）。販路がなければ0で、店を持たない限り売れない。 */
export function channelReachBasis(state: GameState): number {
  let weighted = 0;
  let capacity = 0;
  for (const channel of channels) {
    const count = state.company.channels[channel.id];
    if (count <= 0) continue;
    const channelCapacity = count * channel.capacityPerUnit;
    weighted += channelCapacity * channel.reachBasis;
    capacity += channelCapacity;
  }
  if (capacity === 0) return 0;
  return Math.floor(weighted / capacity);
}

export function channelCapacityUnits(state: GameState): number {
  let capacity = 0;
  for (const channel of channels) capacity += state.company.channels[channel.id] * channel.capacityPerUnit;
  return capacity;
}

/** 販売手数料の加重平均（万分率）。 */
export function channelCommissionBasis(state: GameState): number {
  let weighted = 0;
  let capacity = 0;
  for (const channel of channels) {
    const count = state.company.channels[channel.id];
    if (count <= 0) continue;
    const channelCapacity = count * channel.capacityPerUnit;
    weighted += channelCapacity * channel.commissionBasis;
    capacity += channelCapacity;
  }
  if (capacity === 0) return 0;
  return Math.floor(weighted / capacity);
}

export function channelWeeklyCost(state: GameState): number {
  let cost = 0;
  for (const channel of channels) cost += state.company.channels[channel.id] * channel.weeklyCost;
  return cost;
}

export function openChannelCost(channelId: string): number {
  return findChannel(channelId)?.openCost ?? 0;
}

/** 発売からの経過週で下がる鮮度（万分率）。 */
export function freshnessBasis(product: Product, week: number): number {
  if (product.releasedWeek === null) return economyRules.freshnessStartBasis;
  const elapsed = Math.max(0, week - product.releasedWeek);
  const decayed = economyRules.freshnessStartBasis - elapsed * economyRules.freshnessDecayPerWeekBasis;
  return Math.max(economyRules.freshnessFloorBasis, decayed);
}

function brandFactor(brandBasis: number): number {
  return (5000 + brandBasis) / 10000;
}

/**
 * 市場の需要を各社へ配分する。乗除算だけで魅力度を求め、
 * 同じ入力からは常に同じ配分になるようにする。
 */
export function evaluateMarket(state: GameState, options: { withNoise: boolean }): MarketEvaluation {
  const year = state.startYear + Math.floor(state.week / 48);
  const reach = channelReachBasis(state) / 10000;
  let rng = state.rng;
  const markets: CategoryMarket[] = [];

  for (const category of categories) {
    const demandUnits = demandUnitsAt(category, year);
    const entries: MarketEntry[] = [];

    for (const product of state.company.products) {
      if (product.categoryId !== category.id) continue;
      if (!product.onSale || product.releasedWeek === null) continue;
      if (product.price <= 0) continue;
      const priceRatio = category.referencePrice / product.price;
      const perfFactor = product.performance / category.basePerformance;
      const fresh = freshnessBasis(product, state.week) / 10000;
      const adBoost = state.company.advertising.boostWeeksRemaining > 0
        ? (10000 + state.company.advertising.boostBasis) / 10000
        : 1.0;
      let attractiveness = perfFactor * priceRatio * priceRatio
        * brandFactor(state.company.brandBasis) * reach * fresh * adBoost;
      if (options.withNoise) {
        const drawn = nextInt(rng, 9700, 10300);
        rng = drawn.state;
        attractiveness = (attractiveness * drawn.value) / 10000;
      }
      entries.push({
        id: product.id,
        name: product.name,
        owner: 'player',
        performance: product.performance,
        price: product.price,
        attractivenessBasis: Math.max(0, Math.floor(attractiveness * 10000)),
        shareBasis: 0,
        unitsDemanded: 0,
      });
    }

    for (const rival of rivals) {
      if (!rival.categoryIds.includes(category.id)) continue;
      const years = year - 1960;
      const performance = rival.basePerformance + rival.performanceGrowthPerYear * years;
      const price = Math.max(1, Math.floor((category.referencePrice * rival.priceBasis) / 10000));
      const priceRatio = category.referencePrice / price;
      let attractiveness = (performance / category.basePerformance) * priceRatio * priceRatio
        * brandFactor(rival.brand * 100);
      if (options.withNoise) {
        const drawn = nextInt(rng, 9700, 10300);
        rng = drawn.state;
        attractiveness = (attractiveness * drawn.value) / 10000;
      }
      entries.push({
        id: rival.id,
        name: rival.name,
        owner: 'rival',
        performance,
        price,
        attractivenessBasis: Math.max(0, Math.floor(attractiveness * 10000)),
        shareBasis: 0,
        unitsDemanded: 0,
      });
    }

    let total = 0;
    for (const entry of entries) total += entry.attractivenessBasis;
    if (total > 0) {
      for (const entry of entries) {
        entry.shareBasis = Math.floor((entry.attractivenessBasis * 10000) / total);
        entry.unitsDemanded = Math.floor((demandUnits * entry.attractivenessBasis) / total);
      }
    }

    markets.push({ categoryId: category.id, categoryName: category.name, demandUnits, entries });
  }

  return { markets, rng };
}

export function categoryName(categoryId: string): string {
  return findCategory(categoryId)?.name ?? categoryId;
}
