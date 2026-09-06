import { findCategory, type CategoryId } from '../../content/src/categories';
import { extraDevWeeksForFeatureCount, findFeature, maxSelectableFeatures } from '../../content/src/features';
import { findModule, moduleSlots } from '../../content/src/technology';

export type DesignSpec = {
  categoryId: CategoryId;
  moduleIds: readonly string[];
  qualityLevel: number;
  featureIds: readonly string[];
  performance: number;
  energy: number;
  /** 標準製造原価（千円）。 */
  unitCost: number;
  devWeeks: number;
  devCost: number;
  /** 原価から求めた推奨価格（千円）。 */
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
  /** 付加価値項目の解禁判定に使う現在年。省略時は解禁チェックを行わない。 */
  currentYear?: number;
};

/**
 * 設計案から仕様・原価・開発期間を求める。プレビューと開発開始で同じ関数を使い、
 * 表示した見込みと実際の製品が食い違わないようにする。
 */
export function evaluateDesign(input: DesignInput): DesignEvaluation {
  const category = findCategory(input.categoryId);
  if (!category) return { ok: false, error: '製品分類が見つかりません。' };
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
    if (!module.categoryIds.includes(category.id)) {
      return { ok: false, error: `${category.name}に使えない部品です: ${module.name}` };
    }
    if (module.requiredTechId && !input.ownedTechIds.includes(module.requiredTechId)) {
      return { ok: false, error: `未解禁の部品です: ${module.name}` };
    }
    performance += module.performance;
    unitCost += module.unitCost;
    devWeeks += module.devWeeks;
    devCost += module.devCost;
    energyTotal += module.energy;
  }

  performance += input.qualityLevel * 9;
  unitCost += input.qualityLevel * 2;
  devWeeks += input.qualityLevel;
  devCost += input.qualityLevel * 130;
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
    if (feature.categoryId !== category.id) {
      return { ok: false, error: `${category.name}に使えない付加価値項目です: ${feature.name}` };
    }
    if (feature.requiredTechId && !input.ownedTechIds.includes(feature.requiredTechId)) {
      return { ok: false, error: `未解禁の付加価値項目です: ${feature.name}` };
    }
    if (input.currentYear !== undefined && input.currentYear < feature.minYear) {
      return { ok: false, error: `時期尚早の付加価値項目です: ${feature.name}` };
    }
    performance += feature.performance;
    unitCost += feature.unitCost;
    devWeeks += feature.devWeeks;
    devCost += feature.devCost;
    energyDelta += feature.energy;
    advancement += feature.advancement;
    novelty += feature.novelty;
    practicality += feature.practicality;
  }
  devWeeks += extraDevWeeksForFeatureCount(featureIds.length);

  const energy = Math.round(energyTotal / moduleSlots.length) + energyDelta;
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

/** 未指定のスロットを初期部品で埋めた既定の設計案。 */
export function defaultModuleIds(categoryId: CategoryId): string[] {
  const defaults: Record<CategoryId, string[]> = {
    refrigerator: ['mod-cool-1', 'mod-eco-1', 'mod-body-1'],
    washer: ['mod-wash-1', 'mod-eco-1', 'mod-body-1'],
    television: ['mod-image-1', 'mod-eco-1', 'mod-body-1'],
  };
  return [...defaults[categoryId]];
}
