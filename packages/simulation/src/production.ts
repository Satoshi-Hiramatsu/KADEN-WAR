import { findCategory, unitsFromWorkload, workloadForUnits, type CategoryDefinition } from '../../content/src/categories';
import { amountFromUnits } from './money';
import type { GameState, Money, Product } from './types';

export type UnitCostCalculation = {
  effectiveUnitCost: number;
  multiplier: number;
  deltaPercent: number; // 例: +25% なら 25, -5% なら -5
  isSmallLotPenalty: boolean;
  isVolumeDiscount: boolean;
  isOvertimePenalty: boolean;
};

/**
 * 1ライン（標準400工数）で製造できる台数を基準ロット（Standard Batch）とする。
 */
export function standardBatchUnits(category: CategoryDefinition): number {
  return Math.max(1, unitsFromWorkload(category, 400));
}

/**
 * 工場全体の操業度（投入予定工数 / 工場総生産能力工数）。
 */
export function factoryCapacityUtilization(state: GameState): number {
  const capacity = state.company.baseWorkloadCapacity;
  if (capacity <= 0) return 0;
  let plannedWorkload = 0;
  for (const product of state.company.products) {
    if (product.productionPlan <= 0) continue;
    const category = findCategory(product.categoryId);
    if (category) {
      plannedWorkload += workloadForUnits(category, product.productionPlan);
    }
  }
  return plannedWorkload / capacity;
}

/**
 * 製造業の現場原理・原則に基づく生産単価（1台あたり製造原価）の算出。
 *
 * 原理・原則：
 * 1. 【段取り替え・小ロット割高（Setup Overhead）】
 *    製造ラインの立ち上げ・治具交換・試運転・初期不良調整などの段取り固定費（原価の約35%相当）が存在する。
 *    生産台数が基準ロットより著しく少ない場合、1台あたりの段取り固定費が跳ね上がり、単価が割高（最大+60%程度）になる。
 * 2. 【規模の経済・量産割引（Scale Economy & Volume Discount）】
 *    まとまった数量（基準ロット以上）を連続生産することで、固定費が希釈され、
 *    部材調達のまとめ買い効果も加わり、原価が最大約10%低減する。
 * 3. 【工場操業度・残業割増（Capacity Utilization & Overtime）】
 *    工場全体の稼働率が85%〜90%を超える過負荷になると、残業手当・夜間操業・ライン輻輳により、
 *    製造現場の限界原価が割増（最大+15%）になる。
 */
export function calculateEffectiveUnitCost(
  product: Product,
  plannedUnits: number,
  utilizationRate = 0.5,
): UnitCostCalculation {
  const baseCost = product.unitCost;
  if (baseCost <= 0 || plannedUnits <= 0) {
    return {
      effectiveUnitCost: baseCost,
      multiplier: 1.0,
      deltaPercent: 0,
      isSmallLotPenalty: false,
      isVolumeDiscount: false,
      isOvertimePenalty: false,
    };
  }

  const category = findCategory(product.categoryId);
  const refUnits = category ? standardBatchUnits(category) : 100;
  const ratio = plannedUnits / refUnits;

  // 1. 変動費比率 65%、段取り固定費比率 35%
  const variableRatio = 0.65;
  const fixedRatio = 0.35;

  // A. 段取り固定費係数
  let setupFactor: number;
  if (ratio < 1.0) {
    // 小ロット: 固定費負担が増大（最大で約2.5倍まで）
    const penalty = Math.min(1.8, (1.0 - ratio) / (ratio + 0.18));
    setupFactor = fixedRatio * (1.0 + penalty);
  } else {
    // 大ロット: 固定費が希釈（最小0.4倍まで）
    const dilution = Math.max(0.4, 1.0 / (1.0 + 0.35 * Math.log(ratio)));
    setupFactor = fixedRatio * dilution;
  }

  // B. 部材まとめ買い（ボリュームディスカウント）
  let materialFactor: number;
  if (ratio <= 1.0) {
    materialFactor = variableRatio;
  } else {
    // 基準の数倍〜10倍で最大 -10% の部材割引
    const discountRate = 0.10 * Math.min(1.0, (ratio - 1.0) / (ratio + 3.0));
    materialFactor = variableRatio * (1.0 - discountRate);
  }

  const lotMultiplier = setupFactor + materialFactor;

  // C. 工場操業度（過負荷・残業割増）
  let overtimeMultiplier = 1.0;
  let isOvertimePenalty = false;
  if (utilizationRate > 0.85) {
    const overtimeRate = Math.min(0.15, (utilizationRate - 0.85) * 0.6);
    overtimeMultiplier = 1.0 + overtimeRate;
    isOvertimePenalty = overtimeRate >= 0.02;
  }

  const totalMultiplier = lotMultiplier * overtimeMultiplier;
  const effectiveUnitCost = Math.max(1, Math.round(baseCost * totalMultiplier));
  const deltaPercent = Math.round(((effectiveUnitCost - baseCost) / baseCost) * 100);

  return {
    effectiveUnitCost,
    multiplier: totalMultiplier,
    deltaPercent,
    isSmallLotPenalty: deltaPercent >= 5,
    isVolumeDiscount: deltaPercent <= -3,
    isOvertimePenalty,
  };
}

/**
 * ある製品の週生産計画に必要な製造資金（万円）。
 */
export function requiredCashForProduct(
  product: Product,
  plannedUnits: number,
  utilizationRate: number,
): Money {
  if (plannedUnits <= 0) return 0;
  const { effectiveUnitCost } = calculateEffectiveUnitCost(product, plannedUnits, utilizationRate);
  return amountFromUnits(plannedUnits, effectiveUnitCost);
}

/**
 * 全製品の生産計画を満たすために必要な週次製造資金の合計（万円）。
 */
export function weeklyRequiredProductionCash(state: GameState): Money {
  const util = factoryCapacityUtilization(state);
  let total = 0;
  for (const product of state.company.products) {
    if (product.productionPlan <= 0) continue;
    total += requiredCashForProduct(product, product.productionPlan, util);
  }
  return total;
}
