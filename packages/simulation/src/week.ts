import { findCategory } from '../../content/src/categories';
import { findScenario } from '../../content/src/scenarios';
import { calendarRules, economyRules, weeksPerYear } from '../../content/src/rules';
import { findHistoricalEvent } from '../../content/src/events';
import { findResearchTheme, productionBonus, techName, researchThemes } from '../../content/src/technology';
import { calendarLabel } from './calendar';
import {
  closeIncomeToRetainedEarnings,
  emptyPeriodTotals,
  incomeStatement,
  payCash,
  post,
} from './ledger';
import { amountFromUnits, applyBasis } from './money';
import {
  channelCapacityUnits,
  channelCommissionBasis,
  channelWeeklyCost,
  evaluateMarket,
} from './market';
import { nextInt } from './rng';
import type {
  AdvanceResult,
  CategoryId,
  GameState,
  MeetingProposal,
  Money,
  PeriodSummary,
  Product,
  WeeklyReport,
} from './types';

function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export function addLog(state: GameState, kind: 'info' | 'good' | 'warn' | 'bad', message: string): void {
  state.logSeq += 1;
  state.log.push({ week: state.week, seq: state.logSeq, kind, message });
  if (state.log.length > 400) state.log.splice(0, state.log.length - 400);
}

export function weeklyLaborCost(state: GameState): Money {
  const wageMultiplier = [0.8, 0.9, 1.0, 1.15, 1.3][(state.company.personnel?.wageLevel ?? 3) - 1] ?? 1.0;
  return Math.floor(amountFromUnits(state.company.employees, economyRules.weeklyWagePerEmployee) * wageMultiplier);
}

export function weeklyInterestCost(state: GameState): Money {
  return Math.floor((state.company.accounts.debt * economyRules.annualInterestBasis) / 10000 / weeksPerYear);
}

export function weeklyDevelopmentCost(state: GameState): Money {
  let total = 0;
  for (const project of state.company.projects) total += developmentInstallment(project.devCost, project.devWeeks, project.paidCost, project.remainingWeeks);
  return total;
}

function developmentInstallment(devCost: Money, devWeeks: number, paidCost: Money, remainingWeeks: number): Money {
  if (remainingWeeks <= 0) return 0;
  if (remainingWeeks === 1) return Math.max(0, devCost - paidCost);
  return Math.min(Math.max(0, devCost - paidCost), Math.ceil(devCost / devWeeks));
}

/** 週の必須支払い。これを現金で払えないときは週送りを中断する。 */
export function mandatoryWeeklyPayment(state: GameState): Money {
  return weeklyLaborCost(state) + channelWeeklyCost(state) + weeklyInterestCost(state) + weeklyDevelopmentCost(state);
}

export function productionCapacityUnits(state: GameState): number {
  return state.company.baseCapacityUnits + productionBonus(state.company.ownedTechIds).capacityBonus;
}

export function defectBasis(state: GameState): number {
  const base = Math.max(0, economyRules.defectBaseBasis - productionBonus(state.company.ownedTechIds).defectReductionBasis);
  const morale = state.company.personnel?.morale ?? 75;
  const trainingReduction = Math.min(300, (state.company.personnel?.trainingCount ?? 0) * 50);
  const moraleFactor = morale >= 80 ? 0.75 : morale >= 60 ? 1.0 : morale >= 40 ? 1.4 : 2.0;
  return Math.max(0, Math.floor((base - trainingReduction) * moraleFactor));
}

/** 収益と費用の累計。週次の損益を差分で求めるために使う。 */
function profitAndLossTotals(state: GameState): { revenue: Money; expenses: Money } {
  const accounts = state.company.accounts;
  const expenses = accounts.cogs + accounts.sellingExpense + accounts.researchExpense
    + accounts.developmentExpense + accounts.laborExpense + accounts.interestExpense
    + accounts.depreciationExpense;
  return { revenue: accounts.revenue, expenses };
}

function repayPayable(state: GameState): void {
  const payable = state.company.accounts.payable;
  if (payable <= 0) return;
  const amount = Math.min(payable, state.company.accounts.cash);
  if (amount <= 0) return;
  post(state, { debit: 'payable', credit: 'cash', amount, reason: '未払金の返済', flow: 'operating' });
}

function runResearch(state: GameState): void {
  const research = state.company.research;
  if (!research.themeId || research.weeklyBudget <= 0) return;
  const theme = findResearchTheme(research.themeId);
  if (!theme) {
    research.themeId = null;
    return;
  }
  const budget = Math.min(research.weeklyBudget, Math.max(0, state.company.accounts.cash));
  if (budget <= 0) return;
  payCash(state, { debit: 'researchExpense', amount: budget, reason: `研究：${theme.name}`, flow: 'operating' });
  research.points += budget;
  if (research.points >= theme.requiredPoints) {
    if (!state.company.ownedTechIds.includes(theme.grantsTechId)) {
      state.company.ownedTechIds.push(theme.grantsTechId);
    }
    addLog(state, 'good', `研究完了：${theme.name}（${techName(theme.grantsTechId)}を獲得）`);
    research.themeId = null;
    research.points = 0;
  }
}

function runDevelopment(state: GameState): void {
  const company = state.company;
  const finished: typeof company.projects = [];
  for (const project of company.projects) {
    const installment = developmentInstallment(project.devCost, project.devWeeks, project.paidCost, project.remainingWeeks);
    if (installment > 0) {
      payCash(state, { debit: 'developmentExpense', amount: installment, reason: `開発費：${project.name}`, flow: 'operating' });
      project.paidCost += installment;
    }
    project.remainingWeeks = Math.max(0, project.remainingWeeks - 1);
    if (project.remainingWeeks === 0) finished.push(project);
  }
  for (const project of finished) {
    const category = findCategory(project.categoryId);
    const suggested = category
      ? Math.max(1, Math.floor((project.unitCost * category.suggestedMarginBasis) / 10000))
      : project.unitCost * 2;
    const product: Product = {
      id: `product-${company.nextProductNumber}`,
      name: project.name,
      categoryId: project.categoryId,
      moduleIds: [...project.moduleIds],
      qualityLevel: project.qualityLevel,
      performance: project.performance,
      energy: project.energy,
      unitCost: project.unitCost,
      price: suggested,
      completedWeek: state.week,
      releasedWeek: null,
      onSale: false,
      productionPlan: 0,
      stockUnits: 0,
      stockValue: 0,
      totalUnitsProduced: 0,
      totalUnitsSold: 0,
      totalRevenue: 0,
      lastWeekUnitsSold: 0,
      lastWeekShareBasis: 0,
    };
    company.nextProductNumber += 1;
    company.products.push(product);
    addLog(state, 'good', `開発完了：${project.name}。工場で生産量を、販売本部で価格と発売を決めてください。`);
  }
  company.projects = company.projects.filter(project => project.remainingWeeks > 0);
}

function runProduction(state: GameState): { produced: number; defects: number } {
  const company = state.company;
  let remainingCapacity = productionCapacityUnits(state);
  let produced = 0;
  let defects = 0;
  const baseDefect = defectBasis(state);

  for (const product of company.products) {
    if (product.productionPlan <= 0 || remainingCapacity <= 0) continue;
    let units = Math.min(product.productionPlan, remainingCapacity);
    const cash = Math.max(0, company.accounts.cash);
    const affordable = product.unitCost > 0 ? Math.floor((cash * 10) / product.unitCost) : units;
    units = Math.min(units, affordable);
    if (units <= 0) continue;

    const cost = amountFromUnits(units, product.unitCost);
    post(state, { debit: 'inventory', credit: 'cash', amount: cost, reason: `製造：${product.name}`, flow: 'operating' });

    const drawn = nextInt(state.rng, -economyRules.defectNoiseBasis, economyRules.defectNoiseBasis);
    state.rng = drawn.state;
    const rate = Math.max(0, baseDefect + drawn.value);
    const defectUnits = Math.floor((units * rate) / 10000);
    const goodUnits = units - defectUnits;

    product.stockUnits += goodUnits;
    product.stockValue += cost;
    product.totalUnitsProduced += goodUnits;
    remainingCapacity -= units;
    produced += goodUnits;
    defects += defectUnits;
  }
  return { produced, defects };
}

type SalesResult = {
  unitsSold: number;
  revenue: Money;
  cogs: Money;
  categoryShares: WeeklyReport['categoryShares'];
};

function runSales(state: GameState): SalesResult {
  const company = state.company;
  const evaluation = evaluateMarket(state, { withNoise: true });
  state.rng = evaluation.rng;

  let remainingChannelCapacity = channelCapacityUnits(state);
  const commissionBasis = channelCommissionBasis(state);
  let unitsSold = 0;
  let revenue = 0;
  let cogs = 0;
  const categoryShares: WeeklyReport['categoryShares'] = [];

  for (const product of company.products) {
    product.lastWeekUnitsSold = 0;
    product.lastWeekShareBasis = 0;
  }

  for (const market of evaluation.markets) {
    let ownUnits = 0;
    for (const entry of market.entries) {
      if (entry.owner !== 'player') continue;
      const product = company.products.find(candidate => candidate.id === entry.id);
      if (!product) continue;
      const units = Math.min(entry.unitsDemanded, product.stockUnits, remainingChannelCapacity);
      product.lastWeekShareBasis = entry.shareBasis;
      if (units <= 0) continue;

      const productRevenue = amountFromUnits(units, product.price);
      const productCogs = product.stockUnits > 0
        ? Math.floor((product.stockValue * units) / product.stockUnits)
        : 0;

      post(state, { debit: 'cash', credit: 'revenue', amount: productRevenue, reason: `売上：${product.name}`, flow: 'operating' });
      post(state, { debit: 'cogs', credit: 'inventory', amount: productCogs, reason: `売上原価：${product.name}` });

      product.stockUnits -= units;
      product.stockValue = Math.max(0, product.stockValue - productCogs);
      if (product.stockUnits === 0) product.stockValue = 0;
      product.totalUnitsSold += units;
      product.totalRevenue += productRevenue;
      product.lastWeekUnitsSold = units;

      remainingChannelCapacity -= units;
      unitsSold += units;
      ownUnits += units;
      revenue += productRevenue;
      cogs += productCogs;
    }
    if (market.demandUnits > 0) {
      categoryShares.push({
        categoryId: market.categoryId,
        demandUnits: market.demandUnits,
        ownUnits,
        shareBasis: Math.floor((ownUnits * 10000) / market.demandUnits),
      });
    }
  }

  for (const rival of state.rivals) {
    let shareBasis = 0;
    for (const market of evaluation.markets) {
      const entry = market.entries.find(candidate => candidate.id === rival.id);
      if (entry) shareBasis += entry.shareBasis;
    }
    rival.lastWeekShareBasis = shareBasis;
  }

  if (revenue > 0 && commissionBasis > 0) {
    const commission = applyBasis(revenue, commissionBasis);
    payCash(state, { debit: 'sellingExpense', amount: commission, reason: '販路手数料', flow: 'operating' });
  }

  state.monthTotals.unitsSold += unitsSold;
  state.yearTotals.unitsSold += unitsSold;
  state.totals.unitsSold += unitsSold;
  state.totals.revenue += revenue;

  return { unitsSold, revenue, cogs, categoryShares };
}

function updateBrand(state: GameState, shares: WeeklyReport['categoryShares']): void {
  const company = state.company;
  const active = new Set<CategoryId>();
  for (const product of company.products) if (product.onSale) active.add(product.categoryId);

  let ownUnits = 0;
  let demandUnits = 0;
  for (const share of shares) {
    if (!active.has(share.categoryId)) continue;
    ownUnits += share.ownUnits;
    demandUnits += share.demandUnits;
  }
  const shareBasis = demandUnits > 0 ? Math.floor((ownUnits * 10000) / demandUnits) : 0;
  const premium = company.products.some(product => product.onSale && product.performance >= 130) ? 1 : 0;
  const gain = Math.floor(shareBasis / 120) + premium;
  const next = company.brandBasis + gain - economyRules.brandDecayBasis;
  company.brandBasis = Math.max(0, Math.min(10000, next));
}

function closePeriod(state: GameState, kind: 'month' | 'year'): PeriodSummary {
  const totals = kind === 'month' ? state.monthTotals : state.yearTotals;
  const startWeek = kind === 'month' ? state.monthStartWeek : state.yearStartWeek;
  const statement = incomeStatement(totals);
  const summary: PeriodSummary = {
    label: calendarLabel(state.startYear, kind === 'month' ? startWeek : startWeek, kind),
    kind,
    startWeek,
    endWeek: state.week,
    totals: { ...totals },
    netIncome: statement.netIncome,
    cashEnd: state.company.accounts.cash,
  };
  return summary;
}

function runDepreciation(state: GameState): void {
  const company = state.company;
  if (company.equipmentCost <= 0 || company.accounts.equipment <= 0) return;
  const monthly = Math.floor(company.equipmentCost / economyRules.depreciationMonths);
  const amount = Math.min(Math.max(monthly, 0), company.accounts.equipment);
  if (amount <= 0) return;
  post(state, { debit: 'depreciationExpense', credit: 'equipment', amount, reason: '減価償却（月次）' });
}

function evaluateScenario(state: GameState): void {
  const scenario = findScenario(state.scenarioId);
  if (!scenario) return;
  if (state.company.graceWeeks >= economyRules.maxGraceWeeks) {
    state.status = 'lost';
    state.outcome = `資金不足が${economyRules.maxGraceWeeks}週続き、支払いを続けられなくなりました。`;
    addLog(state, 'bad', state.outcome);
    return;
  }
  if (state.week >= scenario.durationWeeks) {
    const goal = scenario.goal;
    const achieved = state.totals.revenue >= goal.cumulativeRevenue
      && state.totals.profit >= goal.cumulativeProfit
      && state.company.brandBasis >= goal.brandBasis;
    state.status = achieved ? 'won' : 'lost';
    state.outcome = achieved
      ? `期限までに目標を達成しました。累計売上${state.totals.revenue}万円、累計利益${state.totals.profit}万円。`
      : '期限までに目標を達成できませんでした。';
    addLog(state, achieved ? 'good' : 'bad', state.outcome);
  }
}

export function refreshMeetingProposals(state: GameState): void {
  const company = state.company;
  const proposals: MeetingProposal[] = [];

  // 1. 設計統括
  const unresearched = researchThemes.find(t => !company.ownedTechIds.includes(t.grantsTechId));
  if (unresearched) {
    proposals.push({
      id: `prop-design-${state.week}`,
      executiveId: 'design',
      title: `「${unresearched.name}」の研究着手`,
      description: `次代の競争力確保のため、${unresearched.name}への集中投資を具申します。`,
      cost: 0,
      expectedEffect: unresearched.effect,
      accepted: false,
    });
  }

  // 2. 販売統括
  if (company.advertising.boostWeeksRemaining <= 0) {
    proposals.push({
      id: `prop-sales-${state.week}`,
      executiveId: 'sales',
      title: 'テレビCM放映キャンペーンの実施',
      description: 'お茶の間の認知度を一気に高め、ライバルからシェアを奪取する全国CMを打ちましょう！',
      cost: 150,
      expectedEffect: '4週間にわたり全製品の市場需要+35%、ブランド向上',
      accepted: false,
    });
  } else {
    proposals.push({
      id: `prop-sales-${state.week}`,
      executiveId: 'sales',
      title: '系列販売店の新規開拓',
      description: '地域に根ざした系列店との契約を増やし、安定した販売基盤を固めるべきです。',
      cost: 80,
      expectedEffect: '販売能力+18台/週、販路維持',
      accepted: false,
    });
  }

  // 3. 生産統括
  if (company.purchasedEquipmentUnits < 5) {
    proposals.push({
      id: `prop-prod-${state.week}`,
      executiveId: 'production',
      title: '最新鋭工作機械の導入（設備増設）',
      description: '工場のラインを増強し、週あたり生産能力を拡大して品切れを防ぎます。',
      cost: 300,
      expectedEffect: '週の生産能力+25台（設備1口増設）',
      accepted: false,
    });
  } else {
    proposals.push({
      id: `prop-prod-${state.week}`,
      executiveId: 'production',
      title: '徹底的な歩留まり改善・工場５Ｓ運動',
      description: '治具の点検と作業標準化により、不良率を極限まで低減させます。',
      cost: 40,
      expectedEffect: '不良率低減、製造原価の安定',
      accepted: false,
    });
  }

  // 4. 経理統括
  if (company.accounts.cash < 500 && company.accounts.debt < 2000) {
    proposals.push({
      id: `prop-fin-${state.week}`,
      executiveId: 'finance',
      title: 'メインバンクからの長期運転資金借入',
      description: '黒字倒産を防ぎ手元流動性を確保するため、低利での追加借入を強く進言します。',
      cost: 0,
      expectedEffect: '手元現金確保、資金ショート防止',
      accepted: false,
    });
  } else {
    proposals.push({
      id: `prop-fin-${state.week}`,
      executiveId: 'finance',
      title: '特別決算賞与の支給による士気向上',
      description: '利益を現場に還元し、全社の一体感とモチベーションを高めましょう。',
      cost: 80,
      expectedEffect: '社員士気（モラル）大幅向上',
      accepted: false,
    });
  }

  // 5. 人事統括
  proposals.push({
    id: `prop-pers-${state.week}`,
    executiveId: 'personnel',
    title: '全社品質管理研修（QCサークル）の実施',
    description: '現場の教育を強化し、社員の団結力と品質意識を底上げします。',
    cost: 50,
    expectedEffect: '社員士気+10、不良率低減、開発効率向上',
    accepted: false,
  });

  company.proposals = proposals;
}

export function simulateRivalActions(state: GameState): void {
  const week = state.week;
  if (week % 4 !== 0 || week === 0) return;
  const rivalIndex = Math.floor(week / 4) % 3;
  const candidates: { id: string; name: string; action: string; cat: CategoryId }[] = [
    {
      id: 'rival-kowa',
      name: '光和電機',
      action: '大迫社長の号令により、主力製品の大幅な値下げ攻勢を宣言！価格競争が激化しています。',
      cat: 'refrigerator',
    },
    {
      id: 'rival-hinode',
      name: '日之出工業',
      action: '神崎社長が記者会見を開き、独自開発の新技術を投入した高級フラッグシップ機を発表！',
      cat: 'television',
    },
    {
      id: 'rival-mine',
      name: '三嶺電器',
      action: '島村社長が全国特約店との結束を強化し、地域密着の販促キャンペーンを展開。',
      cat: 'washer',
    },
  ];
  const chosen = candidates[rivalIndex]!;
  state.company.rivalActions.unshift({
    id: `rival-act-${state.week}`,
    rivalId: chosen.id,
    rivalName: chosen.name,
    week: state.week,
    actionText: chosen.action,
    categoryId: chosen.cat,
  });
  if (state.company.rivalActions.length > 20) state.company.rivalActions.pop();
  addLog(state, 'warn', `【競合動向】${chosen.name}：${chosen.action}`);
}

export function checkHistoricalEvents(state: GameState): void {
  const year = state.startYear + Math.floor(state.week / weeksPerYear);
  const month = 1 + Math.floor((state.week % weeksPerYear) / calendarRules.weeksPerMonth);
  const event = findHistoricalEvent(year, month);
  if (event && !state.company.newsFeed.some(n => n.id === event.id)) {
    state.company.newsFeed.unshift({
      id: event.id,
      week: state.week,
      title: event.title,
      headline: event.headline,
      body: event.description,
      impactText: event.impactType === 'boom' ? '需要急拡大！' : event.impactType === 'cost_hike' ? '原価上昇圧力' : '景気後退',
    });
    addLog(state, event.impactType === 'boom' ? 'good' : 'bad', `【業界速報】${event.title}：${event.headline}`);
  }
}

function updateArchiveAndMorale(state: GameState, netIncome: Money): void {
  const company = state.company;
  if (company.advertising.boostWeeksRemaining > 0) {
    company.advertising.boostWeeksRemaining -= 1;
  }
  const wageDelta = ((company.personnel?.wageLevel ?? 3) - 3) * 0.4;
  const incomeDelta = netIncome > 0 ? 0.3 : -0.4;
  const currentMorale = company.personnel?.morale ?? 75;
  company.personnel.morale = Math.max(10, Math.min(100, Math.round((currentMorale + wageDelta + incomeDelta) * 10) / 10));

  for (const product of company.products) {
    let archived = company.archive.find(a => a.id === product.id);
    if (!archived && product.releasedWeek !== null) {
      archived = {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        completedWeek: product.completedWeek,
        releasedWeek: product.releasedWeek,
        retiredWeek: null,
        performance: product.performance,
        unitCost: product.unitCost,
        price: product.price,
        totalUnitsSold: 0,
        totalRevenue: 0,
        totalProfit: 0,
        peakShareBasis: 0,
        rank: 'C',
        awards: [],
        review: `市場を駆け抜ける期待の新鋭機。`,
      };
      company.archive.push(archived);
    }
    if (archived) {
      archived.totalUnitsSold = product.totalUnitsSold;
      archived.totalRevenue = product.totalRevenue;
      archived.totalProfit = Math.floor(product.totalRevenue * 0.22);
      if (product.lastWeekShareBasis > archived.peakShareBasis) {
        archived.peakShareBasis = product.lastWeekShareBasis;
      }
      if (archived.totalUnitsSold >= 2000) archived.rank = 'S';
      else if (archived.totalUnitsSold >= 1000) archived.rank = 'A';
      else if (archived.totalUnitsSold >= 500) archived.rank = 'B';
    }
  }
}

/** 1週進める。必須支払いに現金が足りない場合は状態を変えずに中断する。 */
export function advanceWeek(state: GameState, options: { allowShortfall?: boolean } = {}): AdvanceResult {
  if (state.status !== 'playing') {
    return { ok: true, state, weeksAdvanced: 0, stopped: 'ゲームは終了しています。' };
  }

  const draft = cloneState(state);
  repayPayable(draft);

  const required = mandatoryWeeklyPayment(draft);
  if (!options.allowShortfall && draft.company.accounts.cash < required) {
    return { ok: false, state, kind: 'funds', required, cash: state.company.accounts.cash, weeksAdvanced: 0 };
  }

  const before = profitAndLossTotals(draft);

  payCash(draft, { debit: 'laborExpense', amount: weeklyLaborCost(draft), reason: '人件費', flow: 'operating' });
  payCash(draft, { debit: 'sellingExpense', amount: channelWeeklyCost(draft), reason: '販路維持費', flow: 'operating' });
  payCash(draft, { debit: 'interestExpense', amount: weeklyInterestCost(draft), reason: '借入利息', flow: 'operating' });

  runDevelopment(draft);
  runResearch(draft);
  const production = runProduction(draft);
  const sales = runSales(draft);
  updateBrand(draft, sales.categoryShares);

  const after = profitAndLossTotals(draft);
  const weekExpenses = after.expenses - before.expenses;
  const weekRevenue = after.revenue - before.revenue;

  const weekReport: WeeklyReport = {
    week: draft.week,
    unitsProduced: production.produced,
    unitsSold: sales.unitsSold,
    revenue: sales.revenue,
    cogs: sales.cogs,
    expenses: weekExpenses,
    netIncome: weekRevenue - weekExpenses,
    cashEnd: draft.company.accounts.cash,
    defectUnits: production.defects,
    categoryShares: sales.categoryShares,
  };
  draft.lastWeek = weekReport;
  updateArchiveAndMorale(draft, weekRevenue - weekExpenses);

  if (draft.company.accounts.payable > 0) {
    draft.company.graceWeeks += 1;
    addLog(draft, 'warn', `資金不足：未払金${draft.company.accounts.payable}万円。猶予${draft.company.graceWeeks}/${economyRules.maxGraceWeeks}週。`);
  } else {
    draft.company.graceWeeks = 0;
  }

  draft.week += 1;

  if (draft.week % calendarRules.weeksPerMonth === 0) {
    runDepreciation(draft);
    const summary = closePeriod(draft, 'month');
    draft.monthlySummaries.push(summary);
    if (draft.monthlySummaries.length > 120) draft.monthlySummaries.shift();
    draft.totals.profit += summary.netIncome;
    draft.monthTotals = emptyPeriodTotals(draft.company.accounts.cash);
    draft.monthStartWeek = draft.week;
    refreshMeetingProposals(draft);
    simulateRivalActions(draft);
    checkHistoricalEvents(draft);
    addLog(draft, summary.netIncome >= 0 ? 'info' : 'warn',
      `月次決算：${summary.label} 売上${summary.totals.revenue}万円、純損益${summary.netIncome}万円。`);
  }

  if (draft.week % weeksPerYear === 0) {
    const summary = closePeriod(draft, 'year');
    draft.yearlySummaries.push(summary);
    closeIncomeToRetainedEarnings(draft);
    draft.yearTotals = emptyPeriodTotals(draft.company.accounts.cash);
    draft.yearStartWeek = draft.week;
    addLog(draft, summary.netIncome >= 0 ? 'good' : 'warn',
      `年次決算：${summary.label} 売上${summary.totals.revenue}万円、純損益${summary.netIncome}万円。`);
  }

  evaluateScenario(draft);

  return { ok: true, state: draft, weeksAdvanced: 1, stopped: null };
}

/** 指定週数まで進める。開発完了・資金不足・勝敗で中断する。 */
export function advanceWeeks(
  state: GameState,
  weeks: number,
  options: { allowShortfall?: boolean } = {},
): AdvanceResult {
  let current = state;
  let advanced = 0;
  for (let index = 0; index < weeks; index += 1) {
    const result = advanceWeek(current, options);
    if (!result.ok) {
      return { ...result, state: current, weeksAdvanced: advanced };
    }
    current = result.state;
    advanced += 1;
    if (current.status !== 'playing') {
      return { ok: true, state: current, weeksAdvanced: advanced, stopped: current.outcome };
    }
  }
  return { ok: true, state: current, weeksAdvanced: advanced, stopped: null };
}
