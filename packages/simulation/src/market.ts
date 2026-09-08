import { categories, demandUnitsAt, findCategory, unitsFromWorkload, type CategoryId } from '../../content/src/categories';
import { channels, findChannel } from '../../content/src/channels';
import { rivals, rivalJoinsSegment } from '../../content/src/rivals';
import { calendarRules, economyRules, weeksPerYear } from '../../content/src/rules';
import { amountFromUnits } from './money';
import { nextInt } from './rng';
import type { GameState, Money, Product } from './types';

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

/** 販路が1週間にさばける販売工数。台数は製品分類ごとの工数から決まる。 */
export function channelCapacityWorkload(state: GameState): number {
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
  const year = state.startYear + Math.floor(state.week / weeksPerYear);
  const reach = channelReachBasis(state) / 10000;
  let rng = state.rng;
  const markets: CategoryMarket[] = [];

  for (const category of categories) {
    const demandUnits = demandUnitsAt(category, year);
    if (demandUnits <= 0) continue;
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
      if (!rivalJoinsSegment(rival, category.segment)) continue;
      const years = year - calendarRules.startYear;
      const performance = rival.basePerformance + rival.performanceGrowthPerYear * years;
      const price = Math.max(1, Math.floor((category.referencePrice * rival.priceBasis) / 10000));
      const priceRatio = category.referencePrice / price;
      let attractiveness = (performance / category.basePerformance) * priceRatio * priceRatio
        * brandFactor(Math.min(10000, (rival.brand + rival.brandGrowthPerYear * years) * 100));
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

export type ProductForecast = {
  categoryDemandUnits: number;
  /** 万分率。 */
  shareBasis: number;
  /** 需要ベースの見込台数（販路の余力を考慮しない）。 */
  unitsDemanded: number;
  /** 販路の残り工数で実際にさばける上限を加味した、想定週次販売台数。 */
  sellableUnits: number;
  /** 想定週次売上（万円）。 */
  revenue: Money;
  /** 想定週次粗利（万円）。標準製造原価から概算。 */
  grossProfit: Money;
};

/**
 * ある製品を、指定した価格・広告条件で「今すぐ発売したら」という前提で試算する。
 * 実際の状態は一切変更しない（在庫・生産計画・実際の発売状態には影響しない）。
 * advertisingBoostBasisOverride を省略すると現在の広告状態をそのまま使い、
 * 数値を渡すとその需要ブースト（0なら広告なし）を仮定して試算する。
 */
export function forecastProductAtPrice(
  state: GameState,
  productId: string,
  price: number,
  advertisingBoostBasisOverride?: number,
): ProductForecast | null {
  const product = state.company.products.find(candidate => candidate.id === productId);
  if (!product) return null;
  const category = findCategory(product.categoryId);
  if (!category) return null;

  const patchedState: GameState = {
    ...state,
    company: {
      ...state.company,
      products: state.company.products.map(candidate => (
        candidate.id === productId
          ? { ...candidate, price, onSale: true, releasedWeek: candidate.releasedWeek ?? state.week }
          : candidate
      )),
      advertising: advertisingBoostBasisOverride === undefined
        ? state.company.advertising
        : {
            activeCampaign: state.company.advertising.activeCampaign,
            budget: state.company.advertising.budget,
            boostWeeksRemaining: advertisingBoostBasisOverride > 0 ? 4 : 0,
            boostBasis: advertisingBoostBasisOverride,
          },
    },
  };

  const evaluation = evaluateMarket(patchedState, { withNoise: false });
  const market = evaluation.markets.find(candidate => candidate.categoryId === product.categoryId);
  if (!market) return null;
  const entry = market.entries.find(candidate => candidate.id === productId);
  if (!entry) return null;

  const sellableCap = unitsFromWorkload(category, channelCapacityWorkload(state));
  const sellableUnits = Math.max(0, Math.min(entry.unitsDemanded, sellableCap));
  const revenue = amountFromUnits(sellableUnits, price);
  const cost = amountFromUnits(sellableUnits, product.unitCost);

  return {
    categoryDemandUnits: market.demandUnits,
    shareBasis: entry.shareBasis,
    unitsDemanded: entry.unitsDemanded,
    sellableUnits,
    revenue,
    grossProfit: revenue - cost,
  };
}
