import { findCategory, type CategoryDefinition, type CategoryId } from '../../content/src/categories';
import {
  extraDevWeeksForFeatureCount,
  featureAllowsCategory,
  findFeature,
  maxSelectableFeatures,
  type FeatureOption,
} from '../../content/src/features';
import { findModule, moduleAllowsCategory, moduleSlots, modulesFor } from '../../content/src/technology';

export type DesignSpec = {
  categoryId: CategoryId;
  moduleIds: readonly string[];
  qualityLevel: number;
  featureIds: readonly string[];
  performance: number;
  energy: number;
  /** 標準製造原価（円）。 */
  unitCost: number;
  devWeeks: number;
  devCost: number;
  /** 原価から求めた推奨価格（円）。 */
  suggestedPrice: number;
  /** 先進性：技術的な野心度。 */
  advancement: number;
  /** 目新しさ：市場での話題性。 */
  novelty: number;
  /** 実用性：日常使いでの価値。 */
  practicality: number;
};

export type DesignEvaluation = { ok: true; spec: DesignSpec } | { ok: false; error: string };

/** 品質投資の段階（0〜3）。性能・原価・開発費を押し上げる。 */
export const maxQualityLevel = 3;

export type DesignInput = {
  categoryId: string;
  moduleIds: readonly string[];
  qualityLevel: number;
  ownedTechIds: readonly string[];
  featureIds?: readonly string[];
  /** 付加価値項目と製品分類の解禁判定に使う現在年。省略時は年の判定を行わない。 */
  currentYear?: number;
};

/** 分類の標準原価に対する万分率を、円の実額へ直す。 */
function costFromBasis(category: CategoryDefinition, basis: number): number {
  return Math.round((category.baseUnitCost * basis) / 10000);
}

/** 分類の標準開発費に対する万分率を、万円の実額へ直す。 */
function devCostFromBasis(category: CategoryDefinition, basis: number): number {
  return Math.round((category.baseDevCost * basis) / 10000);
}

/**
 * 設計案から仕様・原価・開発期間を求める。プレビューと開発開始で同じ関数を使い、
 * 表示した見込みと実際の製品が食い違わないようにする。
 */
export function evaluateDesign(input: DesignInput): DesignEvaluation {
  const category = findCategory(input.categoryId);
  if (!category) return { ok: false, error: '製品分類が見つかりません。' };
  if (input.currentYear !== undefined && input.currentYear < category.availableFrom) {
    return { ok: false, error: `${category.name}が世に出るのは${category.availableFrom}年からです。` };
  }
  if (!input.ownedTechIds.includes(category.requiredTechId)) {
    return { ok: false, error: `${category.name}の設計には基礎技術が必要です。` };
  }
  if (!Number.isInteger(input.qualityLevel) || input.qualityLevel < 0 || input.qualityLevel > maxQualityLevel) {
    return { ok: false, error: `品質投資は0〜${maxQualityLevel}で指定してください。` };
  }
  if (input.moduleIds.length !== moduleSlots.length) {
    return { ok: false, error: '各スロットの部品を1つずつ選んでください。' };
  }

  let performance = category.basePerformance;
  let unitCost = category.baseUnitCost;
  let devWeeks = category.baseDevWeeks;
  let devCost = category.baseDevCost;
  let energyTotal = 0;
  let energyDelta = 0;

  for (let index = 0; index < moduleSlots.length; index += 1) {
    const slot = moduleSlots[index];
    const moduleId = input.moduleIds[index];
    if (!slot || moduleId === undefined) return { ok: false, error: '部品の指定が不足しています。' };
    const module = findModule(moduleId);
    if (!module) return { ok: false, error: `部品が見つかりません: ${moduleId}` };
    if (module.slot !== slot.id) return { ok: false, error: `${slot.name}に指定できない部品です。` };
    if (!moduleAllowsCategory(module, category.id)) {
      return { ok: false, error: `${category.name}に使えない部品です: ${module.name}` };
    }
    if (module.requiredTechId && !input.ownedTechIds.includes(module.requiredTechId)) {
      return { ok: false, error: `未解禁の部品です: ${module.name}` };
    }
    performance += module.performance;
    unitCost += module.unitCost + costFromBasis(category, module.unitCostBasis);
    devWeeks += module.devWeeks;
    devCost += devCostFromBasis(category, module.devCostBasis);
    energyTotal += module.energy;
  }

  performance += input.qualityLevel * 9;
  unitCost += costFromBasis(category, input.qualityLevel * 600);
  devWeeks += input.qualityLevel;
  devCost += devCostFromBasis(category, input.qualityLevel * 2000);
  let advancement = input.qualityLevel * 2;
  let novelty = 0;
  let practicality = input.qualityLevel * 2;

  const featureIds = input.featureIds ?? [];
  if (featureIds.length > maxSelectableFeatures) {
    return { ok: false, error: `付加価値項目は同時に${maxSelectableFeatures}件までです。` };
  }
  const seenFeatureIds = new Set<string>();
  for (const featureId of featureIds) {
    if (seenFeatureIds.has(featureId)) return { ok: false, error: `付加価値項目が重複しています: ${featureId}` };
    seenFeatureIds.add(featureId);
    const feature = findFeature(featureId);
    if (!feature) return { ok: false, error: `付加価値項目が見つかりません: ${featureId}` };
    if (!featureAllowsCategory(feature, category.id)) {
      return { ok: false, error: `${category.name}に使えない付加価値項目です: ${feature.name}` };
    }
    if (feature.requiredTechId && !input.ownedTechIds.includes(feature.requiredTechId)) {
      return { ok: false, error: `未解禁の付加価値項目です: ${feature.name}` };
    }
    if (input.currentYear !== undefined && input.currentYear < feature.minYear) {
      return { ok: false, error: `時期尚早の付加価値項目です: ${feature.name}` };
    }
    performance += feature.performance;
    unitCost += feature.unitCost + costFromBasis(category, feature.unitCostBasis);
    devWeeks += feature.devWeeks;
    devCost += feature.devCost + devCostFromBasis(category, feature.devCostBasis);
    energyDelta += feature.energy;
    advancement += feature.advancement;
    novelty += feature.novelty;
    practicality += feature.practicality;
  }
  devWeeks += extraDevWeeksForFeatureCount(featureIds.length);

  const energy = Math.round(energyTotal / moduleSlots.length) + energyDelta;
  unitCost = Math.max(1, Math.round(unitCost));
  const suggestedPrice = Math.max(1, Math.floor((unitCost * category.suggestedMarginBasis) / 10000));

  return {
    ok: true,
    spec: {
      categoryId: category.id,
      moduleIds: [...input.moduleIds],
      qualityLevel: input.qualityLevel,
      featureIds: [...featureIds],
      performance,
      energy,
      unitCost,
      devWeeks,
      devCost,
      suggestedPrice,
      advancement,
      novelty,
      practicality,
    },
  };
}

/** 付加価値項目がその分類で実際にいくら原価を押し上げるか（円）。 */
export function featureUnitCostFor(categoryId: string, feature: FeatureOption): number {
  const category = findCategory(categoryId);
  if (!category) return feature.unitCost;
  return feature.unitCost + costFromBasis(category, feature.unitCostBasis);
}

/** 付加価値項目がその分類で実際にいくら開発費を押し上げるか（万円）。 */
export function featureDevCostFor(categoryId: string, feature: FeatureOption): number {
  const category = findCategory(categoryId);
  if (!category) return feature.devCost;
  return feature.devCost + devCostFromBasis(category, feature.devCostBasis);
}

/** 各スロットを、その分類で最初から使える部品で埋めた既定の設計案。 */
export function defaultModuleIds(categoryId: CategoryId): string[] {
  return moduleSlots.map(slot => {
    const candidates = modulesFor(categoryId, slot.id);
    const basic = candidates.find(module => module.requiredTechId === null);
    const chosen = basic ?? candidates[0];
    if (!chosen) throw new RangeError(`${categoryId}の${slot.name}に使える部品がありません。`);
    return chosen.id;
  });
}
