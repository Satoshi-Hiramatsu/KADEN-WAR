import { findCategory, unitsFromWorkload, workloadForUnits } from '../../content/src/categories';
import { channels } from '../../content/src/channels';
import { executives, type ExecutiveId } from '../../content/src/executives';
import { economyRules } from '../../content/src/rules';
import { findResearchTheme } from '../../content/src/technology';
import { calendarAt, formatCalendar } from './calendar';
import type { CategoryUnlockContext } from './design';
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
import {
  factoryCapacityUtilization,
  weeklyRequiredProductionCash,
} from './production';
import type { GameState, Money, Product, ScenarioProgress, SystemAlert } from './types';

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

/**
 * 製品分類の解禁判定に使う文脈を、現在の会社状態から組み立てる。
 * 実績（segmentApprovedCounts）は殿堂入り前の現役製品も含め、発売にこぎ着けた
 * 全製品の archive（歴代名機図鑑）から数えるため、引退させても実績は減らない。
 */
export function buildCategoryUnlockContext(state: GameState): CategoryUnlockContext {
  const company = state.company;
  const segmentApprovedCounts: CategoryUnlockContext['segmentApprovedCounts'] = {};
  for (const archived of company.archive) {
    const category = findCategory(archived.categoryId);
    if (!category) continue;
    segmentApprovedCounts[category.segment] = (segmentApprovedCounts[category.segment] ?? 0) + 1;
  }
  const channelUnits = channels.reduce((sum, channel) => sum + company.channels[channel.id], 0);
  const rivalTargetedCategoryIds = [...new Set(company.rivalActions.map(action => action.categoryId))];
  return {
    workloadCapacity: productionCapacityWorkload(state),
    cash: company.accounts.cash,
    channelUnits,
    segmentApprovedCounts,
    rivalTargetedCategoryIds,
  };
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
        const reqCash = weeklyRequiredProductionCash(state);
        const availCash = Math.max(0, balance.cash - mandatoryWeeklyPayment(state));
        if (reqCash > availCash && reqCash > 0) {
          warnings.push(`生産資金が約${formatMoney(reqCash - availCash)}不足する見込みです。手元資金を増やすか生産計画を調整してください。`);
        }
        const util = factoryCapacityUtilization(state);
        if (util > 0.85) {
          warnings.push(`工場の稼働率が${Math.round(util * 100)}%に達しています。残業・負荷割増により生産単価が上昇しています。`);
        }
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

/**
 * 画面上部に表示すべき全社アラートの一覧。
 * 1. 【緊急（critical・赤文字）】先週の資金不足による生産停止/削減、全製品在庫切れによる販売ゼロ、未払金の発生
 * 2. 【事前警告（warning・橙/黄）】次週の生産計画を満たすための現金不足（事前察知）、固定費不足
 */
export function getActiveAlerts(state: GameState): SystemAlert[] {
  const alerts: SystemAlert[] = [];
  const accounts = state.company.accounts;
  const cash = accounts.cash;
  const fixedCost = mandatoryWeeklyPayment(state);
  const requiredProdCash = weeklyRequiredProductionCash(state);
  const availableForProd = Math.max(0, cash - fixedCost);

  // 1. 未払金（最優先の緊急）
  if (accounts.payable > 0) {
    const remaining = economyRules.maxGraceWeeks - state.company.graceWeeks;
    alerts.push({
      id: 'alert-payable',
      level: 'critical',
      title: `未払金${formatMoney(accounts.payable)}が発生しています`,
      message: `資金ショートが発生しています（倒産猶予残り${remaining}週）。直ちに経理部で融資を受けるか、支出を圧縮してください。`,
      actionScreen: 'finance',
      actionLabel: '経理部で借入する',
    });
  }

  // 2. 直近週の資金不足による生産停止・縮小（実績緊急）
  const cashShortfalls = state.lastWeek?.productionShortfalls?.filter(s => s.reason === 'cash') ?? [];
  if (cashShortfalls.length > 0) {
    const zeroProducts = cashShortfalls.filter(s => s.actualUnits === 0);
    if (zeroProducts.length > 0) {
      const names = zeroProducts.map(p => p.productName).join('・');
      alerts.push({
        id: 'alert-prod-stopped',
        level: 'critical',
        title: `資金不足により「${names}」の生産が停止しました`,
        message: `手元現金が足りず、製品を1台も製造できませんでした。店頭在庫が枯渇して販売機会を逃しています。経理部で借入を行うか、生産計画を見直してください。`,
        actionScreen: 'finance',
        actionLabel: '経理部で借入する',
      });
    } else {
      const names = cashShortfalls.map(p => p.productName).join('・');
      alerts.push({
        id: 'alert-prod-reduced',
        level: 'critical',
        title: `資金不足により「${names}」の生産量が強制削減されました`,
        message: `手元現金が足りないため、払える台数まで製造が自動削減されました。販売店での品切れリスクが高まっています。`,
        actionScreen: 'finance',
        actionLabel: '経理部で借入する',
      });
    }
  }

  // 3. 在庫枯渇による販売台数0（発売中製品があるのに在庫切れ）
  const onSaleProducts = state.company.products.filter(p => p.onSale);
  const totalStock = onSaleProducts.reduce((sum, p) => sum + p.stockUnits, 0);
  if (onSaleProducts.length > 0 && totalStock === 0 && (state.lastWeek?.unitsSold ?? 0) === 0) {
    alerts.push({
      id: 'alert-zero-sales-stock',
      level: 'critical',
      title: '店頭在庫が0台になり、先週の販売台数が0台になりました',
      message: '発売中製品の在庫が完全に底をついています。工場で生産を再開し、製品を店頭に届けてください。',
      actionScreen: 'factory',
      actionLabel: '工場で生産する',
    });
  }

  // 4. 【事前警告】次週の固定費すら払えない
  if (cash < fixedCost) {
    alerts.push({
      id: 'alert-fixed-cost-shortfall',
      level: 'critical',
      title: `手元現金（${formatMoney(cash)}）が次週の固定費（${formatMoney(fixedCost)}）を下回っています`,
      message: `人件費や販路維持費が払えず、週送りが停止するか未払金が発生します。直ちに経理部で借入を行ってください。`,
      actionScreen: 'finance',
      actionLabel: '経理部で借入する',
    });
  } else if (requiredProdCash > 0 && availableForProd < requiredProdCash) {
    // 5. 【事前察知】手元現金で生産計画を賄えない（事前予告）
    const shortfall = requiredProdCash - availableForProd;
    alerts.push({
      id: 'alert-prod-cash-shortfall-forecast',
      level: 'warning',
      title: `手元現金が不足し、次週の生産計画を満たせません`,
      message: `次週の固定費（${formatMoney(fixedCost)}）差引後の余力（${formatMoney(availableForProd)}）では、生産計画（必要${formatMoney(requiredProdCash)}）に対し約${formatMoney(shortfall)}不足します。このまま進めると生産が停止・削減され、在庫切れで売れなくなります。`,
      actionScreen: 'finance',
      actionLabel: '経理部で借入を検討',
    });
  }

  return alerts;
}

