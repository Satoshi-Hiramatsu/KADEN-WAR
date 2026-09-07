import { describe, expect, it } from 'vitest';
import { findCategory, unitsFromWorkload, type CategoryId } from '../../content/src/categories';
import { researchThemes } from '../../content/src/technology';
import { findScenario } from '../../content/src/scenarios';
import { weeksPerYear } from '../../content/src/rules';
import { applyCommand, loanLimit, type Command } from './commands';
import { defaultModuleIds, evaluateDesign } from './design';
import { balanceSheet } from './ledger';
import { channelCapacityWorkload } from './market';
import { createGame } from './setup';
import { advanceWeek, productionCapacityWorkload } from './week';
import type { GameState } from './types';

function apply(state: GameState, command: Command): GameState {
  const result = applyCommand(state, command);
  return result.ok ? result.state : state;
}

/** 時代が来て技術も揃った分類のうち、まだ手をつけていないものを1つ選ぶ。 */
const productPlan: { categoryId: CategoryId; name: string }[] = [
  { categoryId: 'battery-dry', name: '乾電池一号' },
  { categoryId: 'radio-tube', name: 'ラヂオ一号' },
  { categoryId: 'bulb-incandescent', name: '電球一号' },
  { categoryId: 'toy-tin', name: 'ブリキ玩具一号' },
  { categoryId: 'iron', name: 'アイロン一号' },
];

/**
 * 標準的な進め方の自動試走。
 * 研究→設計→開発→生産→価格・販路→発売→決算が数値としてつながることを確かめ、
 * SC01が成立する（達成できる）かどうかを検証する。
 */
function playScripted(seed: number): GameState {
  const scenario = findScenario('SC01');
  if (!scenario) throw new Error('SC01が見つかりません。');
  let state = createGame({ scenarioId: 'SC01', seed, companyName: '試走電機' });

  state = apply(state, { type: 'setResearchBudget', amount: 20 });
  state = apply(state, { type: 'setResearchTheme', themeId: 'res-production-1' });
  state = apply(state, { type: 'openChannel', channelId: 'affiliate' });
  state = apply(state, {
    type: 'startDevelopment', name: productPlan[0]!.name, categoryId: productPlan[0]!.categoryId,
    moduleIds: defaultModuleIds(productPlan[0]!.categoryId), qualityLevel: 1,
  });

  let guard = 0;
  while (state.status === 'playing' && state.week < scenario.durationWeeks && guard < 600) {
    guard += 1;
    const year = state.startYear + Math.floor(state.week / weeksPerYear);

    // 完成した製品を発売する。
    for (const product of state.company.products) {
      if (!product.onSale) {
        state = apply(state, { type: 'setOnSale', productId: product.id, onSale: true });
      }
    }

    // 生産能力を製品数で等分し、それぞれの分類の台数に直して計画する。
    const capacity = productionCapacityWorkload(state);
    const count = Math.max(1, state.company.products.length);
    const shareWorkload = Math.floor(capacity / count);
    for (const product of state.company.products) {
      const category = findCategory(product.categoryId);
      if (!category) continue;
      const units = unitsFromWorkload(category, shareWorkload);
      if (product.productionPlan !== units) {
        state = apply(state, { type: 'setProductionPlan', productId: product.id, units });
      }
    }

    // 販路と設備を、現金に余裕があるときだけ広げる。
    if (state.company.accounts.cash > 200 && channelCapacityWorkload(state) < productionCapacityWorkload(state)) {
      state = apply(state, { type: 'openChannel', channelId: 'affiliate' });
      state = apply(state, { type: 'openChannel', channelId: 'direct' });
    }
    if (state.company.accounts.cash > 700) {
      state = apply(state, { type: 'investEquipment', units: 1 });
    }

    // 研究課題が空いたら、着手できるものを順に選ぶ。
    if (state.company.research.themeId === null) {
      const next = researchThemes.find(theme =>
        !state.company.ownedTechIds.includes(theme.grantsTechId)
        && theme.minYear <= year
        && theme.requiredTechIds.every(techId => state.company.ownedTechIds.includes(techId)));
      if (next) state = apply(state, { type: 'setResearchTheme', themeId: next.id });
      if (state.company.research.weeklyBudget < 60 && state.company.accounts.cash > 1500) {
        state = apply(state, { type: 'setResearchBudget', amount: 60 });
      }
    }

    // 手が空いていて現金に余裕があれば、次の製品を開発する。
    if (state.company.projects.length === 0 && state.company.accounts.cash > 250) {
      const made = new Set(state.company.products.map(product => product.categoryId));
      const next = productPlan.find(entry => !made.has(entry.categoryId));
      if (next) {
        const evaluation = evaluateDesign({
          categoryId: next.categoryId,
          moduleIds: defaultModuleIds(next.categoryId),
          qualityLevel: 1,
          ownedTechIds: state.company.ownedTechIds,
          currentYear: year,
        });
        if (evaluation.ok) {
          state = apply(state, {
            type: 'startDevelopment', name: next.name, categoryId: next.categoryId,
            moduleIds: defaultModuleIds(next.categoryId), qualityLevel: 1,
          });
        }
      }
    }

    const result = advanceWeek(state, {});
    if (result.ok) {
      state = result.state;
      continue;
    }
    // 資金不足は借入で埋める。借りられなければ資金不足のまま進める。
    const limit = loanLimit(state);
    const amount = Math.min(limit, Math.max(200, result.required * 8));
    state = amount > 0 ? apply(state, { type: 'borrow', amount }) : state;
    const retry = advanceWeek(state, { allowShortfall: true });
    state = retry.state;
  }
  return state;
}

describe('SC01の自動試走', () => {
  it('標準的な進め方で目標を達成でき、台帳が最後まで整合する', () => {
    const state = playScripted(20260905);
    expect(state.week).toBe(480);
    expect(balanceSheet(state).difference).toBe(0);
    expect(state.yearlySummaries).toHaveLength(10);
    expect(state.status).toBe('won');
  }, 60000);

  it('シードを変えても破綻せず、同じシードでは同じ結果になる', () => {
    for (const seed of [1, 4649, 987654]) {
      const state = playScripted(seed);
      expect(balanceSheet(state).difference).toBe(0);
      expect(state.company.accounts.inventory).toBeGreaterThanOrEqual(0);
      expect(['won', 'lost']).toContain(state.status);
      expect(playScripted(seed).totals.revenue).toBe(state.totals.revenue);
    }
  }, 120000);
});
