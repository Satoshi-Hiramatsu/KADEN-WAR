import { describe, expect, it } from 'vitest';
import { researchThemes } from '../../content/src/technology';
import { findScenario } from '../../content/src/scenarios';
import { applyCommand, loanLimit, type Command } from './commands';
import { defaultModuleIds, evaluateDesign } from './design';
import { balanceSheet } from './ledger';
import { channelCapacityUnits } from './market';
import { createGame } from './setup';
import { advanceWeek, productionCapacityUnits } from './week';
import type { GameState } from './types';

function apply(state: GameState, command: Command): GameState {
  const result = applyCommand(state, command);
  return result.ok ? result.state : state;
}

/**
 * 標準的な進め方の自動試走。
 * 研究→設計→開発→生産→価格・販路→発売→決算が数値としてつながることを確かめ、
 * SC01が成立する（達成できる）かどうかを検証する。
 */
function playScripted(seed: number): GameState {
  const scenario = findScenario('SC01');
  if (!scenario) throw new Error('SC01が見つかりません。');
  let state = createGame({ scenarioId: 'SC01', seed, companyName: '試走電機' });

  state = apply(state, { type: 'setResearchBudget', amount: 35 });
  state = apply(state, { type: 'setResearchTheme', themeId: 'res-production-1' });
  state = apply(state, { type: 'openChannel', channelId: 'affiliate' });
  state = apply(state, {
    type: 'startDevelopment', name: '冷蔵一号', categoryId: 'refrigerator',
    moduleIds: defaultModuleIds('refrigerator'), qualityLevel: 1,
  });

  let guard = 0;
  while (state.status === 'playing' && state.week < scenario.durationWeeks && guard < 400) {
    guard += 1;
    const company = state.company;

    // 完成した製品を発売し、生産と価格を整える。
    for (const product of company.products) {
      if (!product.onSale) {
        state = apply(state, { type: 'setOnSale', productId: product.id, onSale: true });
      }
    }
    const capacity = productionCapacityUnits(state);
    const perProduct = Math.max(1, Math.floor(capacity / Math.max(1, state.company.products.length)));
    for (const product of state.company.products) {
      if (product.productionPlan !== perProduct) {
        state = apply(state, { type: 'setProductionPlan', productId: product.id, units: perProduct });
      }
    }

    // 販路と設備を、現金に余裕があるときだけ広げる。
    if (state.company.accounts.cash > 1200 && channelCapacityUnits(state) < productionCapacityUnits(state) + 20) {
      state = apply(state, { type: 'openChannel', channelId: 'affiliate' });
    }
    if (state.company.accounts.cash > 3000 && productionCapacityUnits(state) < 140) {
      state = apply(state, { type: 'investEquipment', units: 1 });
    }

    // 研究課題が空いたら次を選ぶ。
    if (state.company.research.themeId === null) {
      const next = researchThemes.find(theme =>
        !state.company.ownedTechIds.includes(theme.grantsTechId)
        && theme.requiredTechIds.every(techId => state.company.ownedTechIds.includes(techId)));
      if (next) state = apply(state, { type: 'setResearchTheme', themeId: next.id });
    }

    // 2本目の製品を開発する。
    if (state.company.projects.length === 0 && state.company.products.length < 2 && state.company.accounts.cash > 2000) {
      const evaluation = evaluateDesign({
        categoryId: 'washer',
        moduleIds: defaultModuleIds('washer'),
        qualityLevel: 1,
        ownedTechIds: state.company.ownedTechIds,
      });
      if (evaluation.ok) {
        state = apply(state, {
          type: 'startDevelopment', name: '洗濯一号', categoryId: 'washer',
          moduleIds: defaultModuleIds('washer'), qualityLevel: 1,
        });
      }
    }

    const result = advanceWeek(state, {});
    if (result.ok) {
      state = result.state;
      continue;
    }
    // 資金不足は借入で埋める。借りられなければ資金不足のまま進める。
    const limit = loanLimit(state);
    const amount = Math.min(limit, Math.max(500, result.required * 8));
    state = amount > 0 ? apply(state, { type: 'borrow', amount }) : state;
    const retry = advanceWeek(state, { allowShortfall: true });
    state = retry.state;
  }
  return state;
}

describe('SC01の自動試走', () => {
  it('標準的な進め方で目標を達成でき、台帳が最後まで整合する', () => {
    const state = playScripted(20260905);
    expect(state.week).toBe(240);
    expect(balanceSheet(state).difference).toBe(0);
    expect(state.yearlySummaries).toHaveLength(5);
    expect(state.status).toBe('won');
  }, 30000);

  it('シードを変えても破綻せず、同じシードでは同じ結果になる', () => {
    for (const seed of [1, 4649, 987654]) {
      const state = playScripted(seed);
      expect(balanceSheet(state).difference).toBe(0);
      expect(state.company.accounts.inventory).toBeGreaterThanOrEqual(0);
      expect(['won', 'lost']).toContain(state.status);
      expect(playScripted(seed).totals.revenue).toBe(state.totals.revenue);
    }
  }, 30000);
});
