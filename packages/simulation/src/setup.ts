import { contentVersion } from '../../content/src/rules';
import { rivals } from '../../content/src/rivals';
import { findScenario, type ScenarioDefinition } from '../../content/src/scenarios';
import { createAccounts, emptyPeriodTotals, post } from './ledger';
import { seedRng } from './rng';
import { refreshMeetingProposals } from './week';
import type { GameState } from './types';

export const engineVersion = '0.3.0';

export type NewGameOptions = {
  scenarioId: string;
  seed: number;
  companyName?: string;
};

/** シナリオ定義から開始状態を作る。台帳は設立の仕訳から積み上げる。 */
export function createGame(options: NewGameOptions): GameState {
  const scenario = findScenario(options.scenarioId);
  if (!scenario) throw new RangeError(`シナリオが見つかりません: ${options.scenarioId}`);

  const state: GameState = {
    schemaVersion: 1,
    engineVersion,
    contentVersion,
    scenarioId: scenario.id,
    seed: options.seed,
    rng: seedRng(options.seed),
    week: 0,
    startYear: scenario.startYear,
    commandSeq: 0,
    journalSeq: 0,
    logSeq: 0,
    status: 'playing',
    outcome: null,
    company: {
      name: options.companyName?.trim() || 'あかつき電機',
      accounts: createAccounts(),
      brandBasis: scenario.initialBrandBasis,
      employees: scenario.initialEmployees,
      baseCapacityUnits: scenario.initialCapacityUnits,
      equipmentCost: scenario.initialEquipmentCost,
      purchasedEquipmentUnits: 0,
      ownedTechIds: [...scenario.initialTechIds],
      research: { themeId: null, points: 0, weeklyBudget: 0 },
      projects: [],
      products: [],
      channels: { ...scenario.initialChannels },
      graceWeeks: 0,
      nextProductNumber: 1,
      advertising: {
        activeCampaign: null,
        budget: 0,
        boostWeeksRemaining: 0,
        boostBasis: 0,
      },
      personnel: {
        morale: 75,
        wageLevel: 3,
        trainingCount: 0,
      },
      archive: [],
      proposals: [],
      rivalActions: [],
      newsFeed: [],
    },
    rivals: rivals.map(rival => ({ id: rival.id, name: rival.name, lastWeekShareBasis: 0 })),
    monthTotals: emptyPeriodTotals(0),
    yearTotals: emptyPeriodTotals(0),
    monthStartWeek: 0,
    yearStartWeek: 0,
    monthlySummaries: [],
    yearlySummaries: [],
    totals: { revenue: 0, profit: 0, unitsSold: 0 },
    journal: [],
    log: [],
    lastWeek: null,
  };

  post(state, { debit: 'cash', credit: 'capital', amount: scenario.initialCapital, reason: '設立：資本金', flow: 'financing' });
  if (scenario.initialEquipmentCost > 0) {
    post(state, { debit: 'equipment', credit: 'capital', amount: scenario.initialEquipmentCost, reason: '設立：現物出資の設備', flow: 'financing' });
  }
  if (scenario.initialDebt > 0) {
    post(state, { debit: 'cash', credit: 'debt', amount: scenario.initialDebt, reason: '設立：借入', flow: 'financing' });
  }
  const extraCash = scenario.initialCash - scenario.initialCapital - scenario.initialDebt;
  if (extraCash > 0) {
    post(state, { debit: 'cash', credit: 'capital', amount: extraCash, reason: '設立：追加出資', flow: 'financing' });
  }

  state.monthTotals = emptyPeriodTotals(state.company.accounts.cash);
  state.yearTotals = emptyPeriodTotals(state.company.accounts.cash);
  refreshMeetingProposals(state);
  state.logSeq += 1;
  state.log.push({
    week: 0,
    seq: state.logSeq,
    kind: 'info',
    message: `${state.company.name}を設立しました。${scenario.name}の目標達成を目指します。`,
  });

  return state;
}

export function scenarioOf(state: GameState): ScenarioDefinition {
  const scenario = findScenario(state.scenarioId);
  if (!scenario) throw new RangeError(`シナリオが見つかりません: ${state.scenarioId}`);
  return scenario;
}
