import { findCategory, unitsFromWorkload, workloadForUnits } from '../../content/src/categories';
import { executives, type ExecutiveId } from '../../content/src/executives';
import { economyRules } from '../../content/src/rules';
import { findResearchTheme } from '../../content/src/technology';
import { calendarAt, formatCalendar } from './calendar';
import { balanceSheet, cashFlowStatement, incomeStatement } from './ledger';
import { formatBrand, formatMoney, formatUnitPrice, formatUnits } from './money';
import { channelCapacityWorkload, channelWeeklyCost, evaluateMarket } from './market';
import { scenarioOf } from './setup';
import {
  defectBasis,
  mandatoryWeeklyPayment,
  productionCapacityWorkload,
  weeklyDevelopmentCost,
  weeklyInterestCost,
  weeklyLaborCost,
} from './week';
import type { GameState, Money, Product, ScenarioProgress } from './types';

export type ReportMetric = { label: string; value: string; note?: string };

export type DepartmentReport = {
  executiveId: ExecutiveId;
  role: string;
  name: string;
  headline: string;
  metrics: ReportMetric[];
  warnings: string[];
};

export function currentDate(state: GameState): string {
  return formatCalendar(calendarAt(state.week, state.startYear));
}

export function scenarioProgress(state: GameState): ScenarioProgress {
  const scenario = scenarioOf(state);
  return {
    cumulativeRevenue: state.totals.revenue,
    cumulativeProfit: state.totals.profit,
    brandBasis: state.company.brandBasis,
    weeksRemaining: Math.max(0, scenario.durationWeeks - state.week),
  };
}

export type GoalProgress = { label: string; current: string; target: string; achieved: boolean; ratio: number };

export function goalProgress(state: GameState): GoalProgress[] {
  const goal = scenarioOf(state).goal;
  const totals = state.totals;
  return [
    {
      label: '累計売上',
      current: formatMoney(totals.revenue),
      target: formatMoney(goal.cumulativeRevenue),
      achieved: totals.revenue >= goal.cumulativeRevenue,
      ratio: goal.cumulativeRevenue > 0 ? Math.min(1, Math.max(0, totals.revenue / goal.cumulativeRevenue)) : 1,
    },
    {
      label: '累計利益',
      current: formatMoney(totals.profit),
      target: formatMoney(goal.cumulativeProfit),
      achieved: totals.profit >= goal.cumulativeProfit,
      ratio: goal.cumulativeProfit > 0 ? Math.min(1, Math.max(0, totals.profit / goal.cumulativeProfit)) : 1,
    },
    {
      label: 'ブランド',
      current: formatBrand(state.company.brandBasis),
      target: formatBrand(goal.brandBasis),
      achieved: state.company.brandBasis >= goal.brandBasis,
      ratio: goal.brandBasis > 0 ? Math.min(1, Math.max(0, state.company.brandBasis / goal.brandBasis)) : 1,
    },
  ];
}

export function weeklyFixedCostBreakdown(state: GameState): ReportMetric[] {
  return [
    { label: '人件費', value: formatMoney(weeklyLaborCost(state)) },
    { label: '販路維持費', value: formatMoney(channelWeeklyCost(state)) },
    { label: '借入利息', value: formatMoney(weeklyInterestCost(state)) },
    { label: '開発費', value: formatMoney(weeklyDevelopmentCost(state)) },
    { label: '研究予算', value: formatMoney(state.company.research.weeklyBudget), note: '現金の範囲で使う' },
  ];
}

/** 現金が尽きるまでの見込み週数。売上を考えない保守的な目安。 */
export function weeksOfCashRemaining(state: GameState): number | null {
  const burn = mandatoryWeeklyPayment(state) + state.company.research.weeklyBudget;
  if (burn <= 0) return null;
  return Math.floor(state.company.accounts.cash / burn);
}

export function inventoryUnits(state: GameState): number {
  return state.company.products.reduce((sum, product) => sum + product.stockUnits, 0);
}

export function plannedProductionUnits(state: GameState): number {
  return state.company.products.reduce((sum, product) => sum + product.productionPlan, 0);
}

/** 生産計画が使っている工数の合計。 */
export function plannedProductionWorkload(state: GameState): number {
  let total = 0;
  for (const product of state.company.products) {
    const category = findCategory(product.categoryId);
    if (category) total += workloadForUnits(category, product.productionPlan);
  }
  return total;
}

/** その製品にあと何台まで計画を増やせるか（他製品の計画を差し引いた残り工数から求める）。 */
export function maxProductionUnitsFor(state: GameState, product: Product): number {
  const category = findCategory(product.categoryId);
  if (!category) return 0;
  const others = plannedProductionWorkload(state) - workloadForUnits(category, product.productionPlan);
  const remaining = productionCapacityWorkload(state) - Math.max(0, others);
  return Math.max(0, unitsFromWorkload(category, remaining));
}

/** 1週間ぶんの販売能力を、その製品分類の台数に直した目安。 */
export function channelCapacityUnitsFor(state: GameState, categoryId: string): number {
  const category = findCategory(categoryId);
  if (!category) return 0;
  return unitsFromWorkload(category, channelCapacityWorkload(state));
}

export function lastWeekUnitsSold(state: GameState): number {
  return state.lastWeek?.unitsSold ?? 0;
}

function researchHeadline(state: GameState): string {
  const research = state.company.research;
  if (!research.themeId) return '研究課題が未設定です。次に伸ばす技術を決めてください。';
  const theme = findResearchTheme(research.themeId);
  if (!theme) return '研究課題の定義が見つかりません。';
  const remaining = Math.max(0, theme.requiredPoints - research.points);
  const weeks = research.weeklyBudget > 0 ? Math.ceil(remaining / research.weeklyBudget) : null;
  return weeks === null
    ? `${theme.name}に着手していますが、研究予算が0です。`
    : `${theme.name}はあと${remaining}ポイント、今の予算なら約${weeks}週です。`;
}

/** 担当ごとの報告。会社状態から作り、会計計算を重複させない。 */
export function departmentReports(state: GameState): DepartmentReport[] {
  const company = state.company;
  const balance = balanceSheet(state);
  const monthly = incomeStatement(state.monthTotals);
  const capacity = productionCapacityWorkload(state);
  const planned = plannedProductionWorkload(state);
  const channelCapacity = channelCapacityWorkload(state);
  const cashWeeks = weeksOfCashRemaining(state);
  const progress = scenarioProgress(state);

  const reports: DepartmentReport[] = [];
  for (const executive of executives) {
    const warnings: string[] = [];
    const metrics: ReportMetric[] = [];
    let headline = '';

    switch (executive.id) {
      case 'president': {
        headline = `残り${progress.weeksRemaining}週。目標に向けて全社の優先順位を決めましょう。`;
        metrics.push(
          { label: '現金', value: formatMoney(balance.cash) },
          { label: '累計売上', value: formatMoney(state.totals.revenue) },
          { label: '累計利益', value: formatMoney(state.totals.profit) },
          { label: 'ブランド', value: formatBrand(company.brandBasis) },
        );
        if (company.products.filter(product => product.onSale).length === 0) {
          warnings.push('発売中の製品がありません。売上が立ちません。');
        }
        break;
      }
      case 'design': {
        headline = researchHeadline(state);
        metrics.push(
          { label: '研究予算', value: `${formatMoney(company.research.weeklyBudget)}/週` },
          { label: '保有技術', value: `${company.ownedTechIds.length}件` },
          { label: '開発中', value: `${company.projects.length}件` },
        );
        for (const project of company.projects) {
          metrics.push({
            label: project.name,
            value: `残り${project.remainingWeeks}週`,
            note: `開発費${formatMoney(project.devCost)}（支払済${formatMoney(project.paidCost)}）`,
          });
        }
        break;
      }
      case 'sales': {
        const onSale = company.products.filter(product => product.onSale);
        headline = onSale.length === 0
          ? '発売中の製品がありません。価格と販路を決めて発売してください。'
          : `先週は${formatUnits(lastWeekUnitsSold(state))}台売れました。販路の能力は週${formatUnits(channelCapacity)}工数です。`;
        metrics.push(
          { label: '販売能力', value: `${formatUnits(channelCapacity)}工数/週` },
          { label: '直営店', value: `${company.channels.direct}店` },
          { label: '系列店', value: `${company.channels.affiliate}件` },
          { label: '在庫', value: `${formatUnits(inventoryUnits(state))}台` },
        );
        if (onSale.length > 0 && channelCapacity <= plannedProductionWorkload(state)) {
          warnings.push('販路の能力が上限に近づいています。販路を増やすと売り逃しを減らせます。');
        }
        break;
      }
      case 'finance': {
        headline = cashWeeks === null
          ? '固定費がありません。'
          : `今の支出なら現金は約${cashWeeks}週分です。`;
        metrics.push(
          { label: '現金', value: formatMoney(balance.cash) },
          { label: '借入', value: formatMoney(balance.debt) },
          { label: '未払金', value: formatMoney(balance.payable) },
          { label: '今月の純損益', value: formatMoney(monthly.netIncome) },
        );
        if (balance.payable > 0) {
          warnings.push(`未払金が${formatMoney(balance.payable)}あります。猶予は残り${economyRules.maxGraceWeeks - company.graceWeeks}週です。`);
        }
        if (cashWeeks !== null && cashWeeks <= 4) warnings.push('資金が不足しかけています。借入か支出の見直しが必要です。');
        break;
      }
      case 'production': {
        headline = planned === 0
          ? '生産計画が空です。工場で週の生産量を決めてください。'
          : `週${formatUnits(plannedProductionUnits(state))}台（${formatUnits(planned)}工数）の計画です。能力は${formatUnits(capacity)}工数/週、不良率は約${(defectBasis(state) / 100).toFixed(1)}%です。`;
        metrics.push(
          { label: '生産能力', value: `${formatUnits(capacity)}工数/週` },
          { label: '生産計画', value: `${formatUnits(planned)}工数/週` },
          { label: '在庫', value: `${formatUnits(inventoryUnits(state))}台` },
          { label: '在庫評価額', value: formatMoney(balance.inventory) },
        );
        if (planned > capacity) warnings.push('計画が生産能力を超えています。');
        break;
      }
      case 'personnel': {
        headline = `人員は${company.employees}名です。採用・教育はS6で解禁します。`;
        metrics.push(
          { label: '人員', value: `${company.employees}名` },
          { label: '週次人件費', value: formatMoney(weeklyLaborCost(state)) },
        );
        break;
      }
    }

    reports.push({
      executiveId: executive.id,
      role: executive.role,
      name: executive.name,
      headline,
      metrics,
      warnings,
    });
  }
  return reports;
}

export type FinanceView = {
  monthly: ReturnType<typeof incomeStatement>;
  yearly: ReturnType<typeof incomeStatement>;
  balance: ReturnType<typeof balanceSheet>;
  cashFlow: ReturnType<typeof cashFlowStatement>;
};

export function financeView(state: GameState): FinanceView {
  return {
    monthly: incomeStatement(state.monthTotals),
    yearly: incomeStatement(state.yearTotals),
    balance: balanceSheet(state),
    cashFlow: cashFlowStatement(state.monthTotals, state.company.accounts.cash),
  };
}

/** 需要予測。乱数を消費しないので画面から何度呼んでも進行に影響しない。 */
export function marketForecast(state: GameState) {
  return evaluateMarket(state, { withNoise: false }).markets;
}

export function averageUnitCost(stockUnits: number, stockValue: Money): string {
  if (stockUnits <= 0) return '—';
  return formatUnitPrice(Math.round((stockValue * 10000) / stockUnits));
}
