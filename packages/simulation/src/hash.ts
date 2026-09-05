import type { GameState } from './types';

/** FNV-1a。状態の同一性を短い文字列で比較するために使う。 */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * 進行の再現性を確かめるためのハッシュ。
 * ログ本文や表示用の集計ではなく、シミュレーションの本体だけを対象にする。
 */
export function stateHash(state: GameState): string {
  const company = state.company;
  const core = {
    week: state.week,
    rng: state.rng,
    status: state.status,
    accounts: company.accounts,
    brandBasis: company.brandBasis,
    employees: company.employees,
    capacity: company.baseCapacityUnits,
    equipmentCost: company.equipmentCost,
    equipmentUnits: company.purchasedEquipmentUnits,
    tech: [...company.ownedTechIds].sort(),
    research: company.research,
    channels: company.channels,
    graceWeeks: company.graceWeeks,
    projects: company.projects.map(project => [project.id, project.remainingWeeks, project.paidCost]),
    products: company.products.map(product => [
      product.id, product.price, product.productionPlan, product.onSale,
      product.stockUnits, product.stockValue, product.totalUnitsSold, product.totalRevenue,
    ]),
    totals: state.totals,
  };
  return fnv1a(JSON.stringify(core));
}
