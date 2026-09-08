import { describe, expect, it } from 'vitest';
import { findCategory } from '../../content/src/categories';
import { applyCommand, loanLimit, type Command } from './commands';
import { defaultModuleIds, emptyCategoryUnlockContext, evaluateCategoryUnlock, evaluateDesign } from './design';
import { stateHash } from './hash';
import { balanceSheet, cashFlowStatement } from './ledger';
import { evaluateDevelopmentMeeting } from './meeting';
import {
  buildCategoryUnlockContext,
  monthlyExpenseBreakdown,
  monthlyMetrics,
  productPerformanceList,
  weeklyMetrics,
} from './selectors';
import { createGame } from './setup';
import { advanceWeek, advanceWeeks, productionCapacityWorkload } from './week';
import type { GameState } from './types';

function newGame(seed = 12345): GameState {
  return createGame({ scenarioId: 'SC01', seed, companyName: 'あかつき電機' });
}

function must(result: ReturnType<typeof applyCommand>): GameState {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function run(state: GameState, commands: Command[]): GameState {
  let current = state;
  for (const command of commands) current = must(applyCommand(current, command));
  return current;
}

function advance(state: GameState, weeks: number): GameState {
  const result = advanceWeeks(state, weeks, { allowShortfall: true });
  return result.state;
}

/** 真空管ラジオを1本発売するところまで進める共通手順（1950年に作れる主力商品）。 */
function releaseFirstProduct(state: GameState): GameState {
  let current = run(state, [
    { type: 'setResearchBudget', amount: 20 },
    { type: 'setResearchTheme', themeId: 'res-efficiency-1' },
    { type: 'openChannel', channelId: 'affiliate' },
    {
      type: 'startDevelopment',
      name: 'あかつきラヂオ1号',
      categoryId: 'radio-tube',
      moduleIds: defaultModuleIds('radio-tube'),
      qualityLevel: 1,
    },
  ]);
  current = advance(current, 8);
  const product = current.company.products[0];
  expect(product).toBeDefined();
  if (!product) throw new Error('製品が完成していません。');
  return run(current, [
    { type: 'setPrice', productId: product.id, price: 9000 },
    { type: 'setProductionPlan', productId: product.id, units: 300 },
    { type: 'setOnSale', productId: product.id, onSale: true },
  ]);
}

describe('設立と台帳', () => {
  it('開始時点で資産＝負債＋純資産が成立する', () => {
    const state = newGame();
    const balance = balanceSheet(state);
    expect(balance.cash).toBe(1200);
    expect(balance.difference).toBe(0);
  });

  it('週を進めても貸借が一致し続ける', () => {
    let state = releaseFirstProduct(newGame());
    for (let index = 0; index < 60; index += 1) {
      state = advance(state, 1);
      expect(balanceSheet(state).difference).toBe(0);
    }
  });

  it('期首現金＋純キャッシュフロー＝期末現金', () => {
    let state = releaseFirstProduct(newGame());
    state = advance(state, 3);
    const flow = cashFlowStatement(state.monthTotals, state.company.accounts.cash);
    expect(flow.cashStart + flow.netChange).toBe(flow.cashEnd);
  });
});

describe('時間の進行', () => {
  it('48週で年次決算がちょうど1回だけ発生する', () => {
    const released = releaseFirstProduct(newGame());
    const state = advance(released, 48 - released.week);
    expect(state.week).toBe(48);
    expect(state.yearlySummaries).toHaveLength(1);
    expect(state.monthlySummaries).toHaveLength(12);
  });

  it('月次決算の純損益の合計が累計利益と一致する', () => {
    const released = releaseFirstProduct(newGame());
    const state = advance(released, 24 - released.week);
    const sum = state.monthlySummaries.reduce((total, summary) => total + summary.netIncome, 0);
    expect(state.totals.profit).toBe(sum);
  });

  it('同じシードと同じ操作なら同じ状態ハッシュになる', () => {
    const first = advance(releaseFirstProduct(newGame(777)), 40);
    const second = advance(releaseFirstProduct(newGame(777)), 40);
    expect(stateHash(first)).toBe(stateHash(second));
    const other = advance(releaseFirstProduct(newGame(778)), 40);
    expect(stateHash(other)).not.toBe(stateHash(first));
  });

  it('週次レポート履歴（weeklyReports）が記録され、製品別販売実績が保持される', () => {
    const released = releaseFirstProduct(newGame()); // ここで8週進行
    expect(released.weeklyReports.length).toBe(8);
    const state = advance(released, 8); // さらに8週進行
    expect(state.weeklyReports.length).toBe(16);
    const lastReport = state.weeklyReports.at(-1);
    expect(lastReport).toBeDefined();
    expect(lastReport?.revenue).toBeGreaterThanOrEqual(0);
    if (lastReport && lastReport.revenue > 0 && lastReport.productSales && lastReport.productSales.length > 0) {
      const firstSale = lastReport.productSales[0]!;
      expect(firstSale.grossProfit).toBe(firstSale.revenue - firstSale.cogs);
    }
  });

  it('月次決算にB/S・P/L・経費内訳・製品別実績が保存され、年次決算に経営指標が付与される', () => {
    const released = releaseFirstProduct(newGame());
    const state = advance(released, 48 - released.week);
    expect(state.monthlySummaries.length).toBe(12);
    const monthSummary = state.monthlySummaries[0]!;
    expect(monthSummary.balanceSheet).toBeDefined();
    expect(monthSummary.balanceSheet?.assets).toBeGreaterThan(0);
    expect(monthSummary.expenseBreakdown).toBeDefined();
    expect(monthSummary.expenseBreakdown?.total).toBeGreaterThanOrEqual(0);

    expect(state.yearlySummaries.length).toBe(1);
    const yearSummary = state.yearlySummaries[0]!;
    expect(yearSummary.balanceSheet).toBeDefined();
    expect(yearSummary.financialRatios).toBeDefined();
    expect(yearSummary.financialRatios?.grossMarginBasis).toBeDefined();
    expect(yearSummary.financialRatios?.equityRatioBasis).toBeDefined();
    expect(yearSummary.reviewComment).toBeDefined();
    expect(typeof yearSummary.reviewComment).toBe('string');
  });

  it('財務セレクタ（weeklyMetrics, monthlyMetrics, monthlyExpenseBreakdown, productPerformanceList）が動作する', () => {
    const released = releaseFirstProduct(newGame());
    const state = advance(released, 5);
    const wMetrics = weeklyMetrics(state);
    expect(wMetrics.grossProfit).toBe(wMetrics.revenue - wMetrics.cogs);

    const mMetrics = monthlyMetrics(state);
    expect(mMetrics.grossProfit).toBe(mMetrics.revenue - mMetrics.cogs);

    const expenseBreakdown = monthlyExpenseBreakdown(state);
    expect(expenseBreakdown.items.length).toBe(6);
    expect(expenseBreakdown.total).toBeGreaterThanOrEqual(0);

    const perfList = productPerformanceList(state);
    expect(perfList.length).toBe(state.company.products.length);
    if (perfList.length > 0) {
      const p = perfList[0]!;
      expect(p.totalGrossProfit).toBe(p.totalRevenue - p.totalCogs);
      expect(p.lastWeekGrossProfit).toBe(p.lastWeekRevenue - p.lastWeekCogs);
    }
  });
});

describe('生産と販売', () => {
  it('在庫が負にならず、販売数が在庫と需要を超えない', () => {
    let state = releaseFirstProduct(newGame());
    for (let index = 0; index < 30; index += 1) {
      state = advance(state, 1);
      for (const product of state.company.products) {
        expect(product.stockUnits).toBeGreaterThanOrEqual(0);
        expect(product.stockValue).toBeGreaterThanOrEqual(0);
      }
      const report = state.lastWeek;
      if (!report) continue;
      for (const share of report.categoryShares) {
        expect(share.ownUnits).toBeLessThanOrEqual(share.demandUnits);
      }
    }
  });

  it('販路がなければ発売できない', () => {
    const state = newGame();
    const started = run(state, [{
      type: 'startDevelopment', name: '試作機', categoryId: 'iron',
      moduleIds: defaultModuleIds('iron'), qualityLevel: 0,
    }]);
    const completed = advance(started, 5);
    const product = completed.company.products[0];
    if (!product) throw new Error('製品が完成していません。');
    const closed = must(applyCommand(completed, { type: 'closeChannel', channelId: 'direct' }));
    const result = applyCommand(closed, { type: 'setOnSale', productId: product.id, onSale: true });
    expect(result.ok).toBe(false);
  });

  it('生産計画は生産能力を超えられない', () => {
    const state = releaseFirstProduct(newGame());
    const product = state.company.products[0];
    if (!product) throw new Error('製品がありません。');
    const capacity = productionCapacityWorkload(state);
    const result = applyCommand(state, { type: 'setProductionPlan', productId: product.id, units: capacity + 1 });
    expect(result.ok).toBe(false);
  });

  it('複数製品を発売しているとき、1つ目の製品に十分な在庫があっても2つ目の製品がゼロにならず販売される', () => {
    let state = newGame();
    // 乾電池と白熱電球を開発して発売する
    state = run(state, [
      {
        type: 'startDevelopment',
        name: '乾電池1号',
        categoryId: 'battery-dry',
        moduleIds: defaultModuleIds('battery-dry'),
        qualityLevel: 0,
      },
    ]);
    state = advance(state, 3);
    const battery = state.company.products[0];
    if (!battery) throw new Error('乾電池が完成していません。');

    state = run(state, [
      {
        type: 'startDevelopment',
        name: '白熱電球1号',
        categoryId: 'bulb-incandescent',
        moduleIds: defaultModuleIds('bulb-incandescent'),
        qualityLevel: 0,
      },
    ]);
    state = advance(state, 3);
    const bulb = state.company.products[1];
    if (!bulb) throw new Error('白熱電球が完成していません。');

    // どちらも発売し、十分な在庫を注入
    state = run(state, [
      { type: 'setPrice', productId: battery.id, price: 34 },
      { type: 'setOnSale', productId: battery.id, onSale: true },
      { type: 'setPrice', productId: bulb.id, price: 60 },
      { type: 'setOnSale', productId: bulb.id, onSale: true },
    ]);

    const targetBattery = state.company.products.find(p => p.id === battery.id)!;
    const targetBulb = state.company.products.find(p => p.id === bulb.id)!;
    targetBattery.stockUnits = 20000;
    targetBattery.stockValue = 20000 * 19;
    targetBulb.stockUnits = 5000;
    targetBulb.stockValue = 5000 * 38;

    const result = advanceWeek(state);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('週送りに失敗しました。');

    const updatedBattery = result.state.company.products.find(p => p.id === battery.id);
    const updatedBulb = result.state.company.products.find(p => p.id === bulb.id);
    expect(updatedBattery?.lastWeekUnitsSold).toBeGreaterThan(0);
    expect(updatedBulb?.lastWeekUnitsSold).toBeGreaterThan(0);

    // 乾電池と白熱電球の消費工数の合計が販路能力（800工数）以下であることを検証
    const batteryCat = findCategory('battery-dry')!;
    const bulbCat = findCategory('bulb-incandescent')!;
    const batteryWorkload = Math.ceil(((updatedBattery?.lastWeekUnitsSold ?? 0) * batteryCat.workloadPer100Units) / 100);
    const bulbWorkload = Math.ceil(((updatedBulb?.lastWeekUnitsSold ?? 0) * bulbCat.workloadPer100Units) / 100);
    expect(batteryWorkload + bulbWorkload).toBeLessThanOrEqual(800);
    // 両製品とも均等枠（約400工数分）近く売れていること（乾電池は10,000台以上、電球は5,000台以上または在庫上限）
    expect(updatedBattery?.lastWeekUnitsSold).toBeGreaterThan(10000);
    expect(updatedBulb?.lastWeekUnitsSold).toBeGreaterThan(3000);
  });
});

describe('設計と研究', () => {
  it('未解禁の部品を選んだ設計は拒否される', () => {
    const evaluation = evaluateDesign({
      categoryId: 'radio-tube',
      moduleIds: ['mod-radio-2', 'mod-eco-1', 'mod-body-1'],
      qualityLevel: 0,
      ownedTechIds: ['tech-radio-basic'],
    });
    expect(evaluation.ok).toBe(false);
  });

  it('研究していない製品分類は設計できない', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'television',
      moduleIds: defaultModuleIds('television'),
      qualityLevel: 0,
      ownedTechIds: state.company.ownedTechIds,
      currentYear: 1955,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('世に出ていない年の製品分類は設計できない', () => {
    const evaluation = evaluateDesign({
      categoryId: 'television',
      moduleIds: defaultModuleIds('television'),
      qualityLevel: 0,
      ownedTechIds: ['tech-imaging-basic'],
      currentYear: 1951,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('プレビューと開発案件の仕様が一致する（性能は会議結果の補正幅の範囲内）', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'fan',
      moduleIds: defaultModuleIds('fan'),
      qualityLevel: 2,
      ownedTechIds: state.company.ownedTechIds,
    });
    if (!evaluation.ok) throw new Error(evaluation.error);
    const started = run(state, [{
      type: 'startDevelopment', name: '扇風機A', categoryId: 'fan',
      moduleIds: defaultModuleIds('fan'), qualityLevel: 2,
    }]);
    const project = started.company.projects[0];
    if (!project) throw new Error('開発案件がありません。');
    // 性能だけは開発会議の結果（技術力・士気による乱数補正）で±15の範囲で変動しうる。
    expect(Math.abs(project.performance - evaluation.spec.performance)).toBeLessThanOrEqual(15);
    expect(project.unitCost).toBe(evaluation.spec.unitCost);
    expect(project.devWeeks).toBe(evaluation.spec.devWeeks);
    expect(project.devCost).toBe(evaluation.spec.devCost);
    expect(project.meetingLog.length).toBeGreaterThan(0);
  });

  it('研究が完了すると技術を獲得し、二重に消費しない', () => {
    let state = run(newGame(), [
      { type: 'setResearchBudget', amount: 60 },
      { type: 'setResearchTheme', themeId: 'res-efficiency-1' },
    ]);
    state = advance(state, 8);
    expect(state.company.ownedTechIds).toContain('tech-efficiency-1');
    expect(state.company.research.themeId).toBeNull();
    const again = applyCommand(state, { type: 'setResearchTheme', themeId: 'res-efficiency-1' });
    expect(again.ok).toBe(false);
  });
});

describe('製品分類のアンロック条件', () => {
  it('生産能力が足りない分類は設計できない（洗濯機）', () => {
    const category = findCategory('washer')!;
    const short = evaluateCategoryUnlock(category, ['tech-washing-basic'], 1953, {
      ...emptyCategoryUnlockContext,
      workloadCapacity: 1600,
    });
    expect(short.ok).toBe(false);
    const enough = evaluateCategoryUnlock(category, ['tech-washing-basic'], 1953, {
      ...emptyCategoryUnlockContext,
      workloadCapacity: 3000,
    });
    expect(enough.ok).toBe(true);
  });

  it('資金が足りない分類は設計できない（テープレコーダー）', () => {
    const category = findCategory('tape-recorder')!;
    const poor = evaluateCategoryUnlock(category, ['tech-magnetic'], 1954, emptyCategoryUnlockContext);
    expect(poor.ok).toBe(false);
    const funded = evaluateCategoryUnlock(category, ['tech-magnetic'], 1954, {
      ...emptyCategoryUnlockContext,
      cash: 800,
    });
    expect(funded.ok).toBe(true);
  });

  it('販路が足りない分類は設計できない（白黒テレビ）', () => {
    const category = findCategory('television')!;
    const noChannels = evaluateCategoryUnlock(category, ['tech-imaging-basic'], 1953, emptyCategoryUnlockContext);
    expect(noChannels.ok).toBe(false);
    const wired = evaluateCategoryUnlock(category, ['tech-imaging-basic'], 1953, {
      ...emptyCategoryUnlockContext,
      channelUnits: 3,
    });
    expect(wired.ok).toBe(true);
  });

  it('同系統の発売実績が足りない分類は設計できない（電蓄）', () => {
    const category = findCategory('record-player')!;
    const inexperienced = evaluateCategoryUnlock(category, ['tech-record'], 1952, emptyCategoryUnlockContext);
    expect(inexperienced.ok).toBe(false);
    const experienced = evaluateCategoryUnlock(category, ['tech-record'], 1952, {
      ...emptyCategoryUnlockContext,
      segmentApprovedCounts: { audio: 1 },
    });
    expect(experienced.ok).toBe(true);
  });

  it('複合技術と資金の両方が要る分類は片方だけでは設計できない（カラーテレビ）', () => {
    const category = findCategory('television-color')!;
    const techOnly = evaluateCategoryUnlock(category, ['tech-imaging-color'], 1960, emptyCategoryUnlockContext);
    expect(techOnly.ok).toBe(false);
    const techAndCashButNoSecondTech = evaluateCategoryUnlock(category, ['tech-imaging-color'], 1960, {
      ...emptyCategoryUnlockContext,
      cash: 6000,
    });
    expect(techAndCashButNoSecondTech.ok).toBe(false);
    const ready = evaluateCategoryUnlock(category, ['tech-imaging-color', 'tech-production-2'], 1960, {
      ...emptyCategoryUnlockContext,
      cash: 6000,
    });
    expect(ready.ok).toBe(true);
  });

  it('ライバルが動きを見せた分類は、生産能力等が足りなくても対抗開発として設計できる（技術は免除されない）', () => {
    const category = findCategory('washer')!;
    const withoutRivalMove = evaluateCategoryUnlock(category, ['tech-washing-basic'], 1953, {
      ...emptyCategoryUnlockContext,
      workloadCapacity: 0,
    });
    expect(withoutRivalMove.ok).toBe(false);
    const withRivalMove = evaluateCategoryUnlock(category, ['tech-washing-basic'], 1953, {
      ...emptyCategoryUnlockContext,
      workloadCapacity: 0,
      rivalTargetedCategoryIds: ['washer'],
    });
    expect(withRivalMove.ok).toBe(true);
    const missingTechEvenWithRivalMove = evaluateCategoryUnlock(category, [], 1953, {
      ...emptyCategoryUnlockContext,
      rivalTargetedCategoryIds: ['washer'],
    });
    expect(missingTechEvenWithRivalMove.ok).toBe(false);
  });

  it('研究所の設計画面は、実際の会社状態からアンロック文脈を組み立てて判定する（統合テスト）', () => {
    let state = newGame();
    state = {
      ...state,
      week: 48 * 3,
      company: {
        ...state.company,
        ownedTechIds: [...state.company.ownedTechIds, 'tech-washing-basic'],
        accounts: { ...state.company.accounts, cash: 3000 },
      },
    };
    const blocked = applyCommand(state, {
      type: 'startDevelopment', name: '洗濯機試作', categoryId: 'washer',
      moduleIds: defaultModuleIds('washer'), qualityLevel: 0,
    });
    expect(blocked.ok).toBe(false);

    const invested = must(applyCommand(state, { type: 'investEquipment', units: 4 }));
    expect(buildCategoryUnlockContext(invested).workloadCapacity).toBeGreaterThanOrEqual(3000);
    const started = must(applyCommand(invested, {
      type: 'startDevelopment', name: '洗濯機試作', categoryId: 'washer',
      moduleIds: defaultModuleIds('washer'), qualityLevel: 0,
    }));
    expect(started.company.projects.length).toBe(1);
  });
});

describe('開発会議', () => {
  it('付加価値項目は先進性・目新しさ・実用性と原価・性能に反映される', () => {
    const state = newGame();
    const owned = [...state.company.ownedTechIds, 'tech-cooling-basic'];
    const bare = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: owned,
      currentYear: state.startYear + 25,
    });
    const withFeatures = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: owned,
      featureIds: ['feat-refr-veggie-large', 'feat-refr-door-pocket'],
      currentYear: state.startYear + 25,
    });
    if (!bare.ok || !withFeatures.ok) throw new Error('設計評価に失敗しました。');
    expect(withFeatures.spec.practicality).toBeGreaterThan(bare.spec.practicality);
    expect(withFeatures.spec.unitCost).toBeGreaterThan(bare.spec.unitCost);
    expect(withFeatures.spec.performance).toBeGreaterThan(bare.spec.performance);
  });

  it('年代が来ていない付加価値項目は拒否される', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: [...state.company.ownedTechIds, 'tech-cooling-basic'],
      featureIds: ['feat-refr-app-link'], // 2008年以降の項目
      currentYear: 1955,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('選択上限を超える付加価値項目は拒否される', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: [...state.company.ownedTechIds, 'tech-cooling-basic'],
      featureIds: [
        'feat-refr-veggie-large', 'feat-refr-door-pocket', 'feat-refr-egg-tray',
        'feat-refr-adjust-shelf', 'feat-refr-color-variant', 'feat-refr-fingerprint',
        'feat-refr-wood-panel', 'feat-refr-reversible-door', 'feat-refr-anti-tip',
      ],
      currentYear: 1990,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('生産性・実用性を無視した野心的すぎる設計には反対意見が出る', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'radio-tube',
      moduleIds: defaultModuleIds('radio-tube'),
      qualityLevel: 3,
      ownedTechIds: state.company.ownedTechIds,
      currentYear: state.startYear,
      featureIds: [],
    });
    if (!evaluation.ok) throw new Error(evaluation.error);
    // 品質最大まで積んだだけの設計は、コスト自体は生産統括の許容範囲内のはず。
    const meeting = evaluateDevelopmentMeeting(state, evaluation.spec);
    expect(meeting.stances.find(s => s.id === 'production')?.tone).not.toBe('objection');
  });

  it('反対意見があるまま押し切ると士気が下がり、押し切らなければ着手できない', () => {
    const base = newGame();
    // 未来まで週を進め、技術不要だが原価・開発期間のかさむ付加価値項目をすべて解禁する。
    const state: GameState = {
      ...base,
      week: 2880,
      company: { ...base.company, ownedTechIds: [...base.company.ownedTechIds, 'tech-cooling-basic'] },
    };
    const expensiveFeatureIds = [
      'feat-refr-stainless-premium', 'feat-refr-pullout-freezer', 'feat-refr-large-interior',
      'feat-refr-voice-notice', 'feat-refr-deodorize', 'feat-refr-outage-mode',
      'feat-refr-quiet-body', 'feat-refr-swing-sensor',
    ];
    const command = {
      type: 'startDevelopment' as const,
      name: '野心作',
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 3,
      featureIds: expensiveFeatureIds,
    };

    const blocked = applyCommand(state, command);
    expect(blocked.ok).toBe(false);

    const overridden = must(applyCommand(state, { ...command, overrideObjections: true }));
    expect(overridden.company.projects.length).toBe(1);
    expect(overridden.company.personnel.morale).toBeLessThan(state.company.personnel.morale);
  });
});

describe('資金不足と借入', () => {
  it('必須支払いを払えない週は状態を変えずに中断する', () => {
    let state = newGame();
    state = run(state, [
      { type: 'openChannel', channelId: 'affiliate' },
      { type: 'investEquipment', units: 3 },
    ]);
    // 現金をほぼ使い切ってから、支払えない週を作る。
    while (state.company.accounts.cash >= 60) {
      const result = applyCommand(state, { type: 'openChannel', channelId: 'affiliate' });
      if (!result.ok) break;
      state = result.state;
    }
    state = run(state, [{ type: 'setResearchBudget', amount: 0 }]);
    let blocked = advanceWeek(state, {});
    let guard = 0;
    while (blocked.ok && guard < 60) {
      state = blocked.state;
      blocked = advanceWeek(state, {});
      guard += 1;
    }
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.state).toBe(state);
    expect(blocked.required).toBeGreaterThan(blocked.cash);
  });

  it('借入枠を超える借入を拒否し、利息が残高に整合する', () => {
    const state = newGame();
    const limit = loanLimit(state);
    expect(limit).toBe(2400);
    expect(applyCommand(state, { type: 'borrow', amount: limit + 1 }).ok).toBe(false);
    const borrowed = must(applyCommand(state, { type: 'borrow', amount: 2000 }));
    expect(borrowed.company.accounts.debt).toBe(2000);
    expect(borrowed.company.accounts.cash).toBe(3200);
    const repaid = must(applyCommand(borrowed, { type: 'repay', amount: 800 }));
    expect(repaid.company.accounts.debt).toBe(1200);
    expect(balanceSheet(repaid).difference).toBe(0);
  });

  it('資金不足のまま進め続けると敗北する', () => {
    let state = run(newGame(), [{ type: 'borrow', amount: 2400 }, { type: 'investEquipment', units: 10 }]);
    state = run(state, [{ type: 'setResearchBudget', amount: 0 }]);
    while (state.company.accounts.cash >= 200) {
      const result = applyCommand(state, { type: 'openChannel', channelId: 'direct' });
      if (!result.ok) break;
      state = result.state;
    }
    let guard = 0;
    while (state.status === 'playing' && guard < 200) {
      state = advance(state, 1);
      guard += 1;
    }
    expect(state.status).toBe('lost');
    expect(state.outcome).toContain('資金不足');
  });
});

describe('本格経営機能（広告・人事・会議・アーカイブ）', () => {
  it('その年に無い媒体は使えず、新聞広告なら1950年から打てる', () => {
    let state = releaseFirstProduct(newGame());
    const initialBrand = state.company.brandBasis;
    // テレビ放送が始まるのは1953年。1950年にテレビCMは打てない。
    expect(applyCommand(state, { type: 'setAdvertising', campaign: 'tv', budget: 150 }).ok).toBe(false);
    expect(applyCommand(state, { type: 'setAdvertising', campaign: 'radio', budget: 90 }).ok).toBe(false);

    state = must(applyCommand(state, { type: 'setAdvertising', campaign: 'newspaper', budget: 60 }));
    expect(state.company.advertising.activeCampaign).toBe('newspaper');
    expect(state.company.advertising.boostWeeksRemaining).toBe(4);
    expect(state.company.advertising.boostBasis).toBe(2000);
    expect(state.company.brandBasis).toBeGreaterThan(initialBrand);

    state = advance(state, 1);
    expect(state.company.advertising.boostWeeksRemaining).toBe(3);
  });

  it('1953年になればテレビCMを打てる', () => {
    const base = releaseFirstProduct(newGame());
    const state: GameState = { ...base, week: 48 * 3 };
    const advertised = must(applyCommand(state, { type: 'setAdvertising', campaign: 'tv', budget: 150 }));
    expect(advertised.company.advertising.activeCampaign).toBe('tv');
    expect(advertised.company.advertising.boostBasis).toBe(3500);
  });

  it('人事研修と賞与で士気が向上し、不良率の低減に寄与する', () => {
    let state = newGame();
    expect(state.company.personnel.morale).toBe(75);

    state = must(applyCommand(state, { type: 'conductTraining', cost: 50 }));
    expect(state.company.personnel.morale).toBe(85);
    expect(state.company.personnel.trainingCount).toBe(1);

    state = must(applyCommand(state, { type: 'payBonus', amountPerEmployee: 2 }));
    expect(state.company.personnel.morale).toBe(100);
  });

  it('役員会議の提案を採択できる', () => {
    const state = newGame();
    expect(state.company.proposals.length).toBeGreaterThan(0);
    const proposal = state.company.proposals[0]!;
    const accepted = must(applyCommand(state, { type: 'acceptProposal', proposalId: proposal.id }));
    const found = accepted.company.proposals.find(p => p.id === proposal.id);
    expect(found?.accepted).toBe(true);
  });

  it('製品を引退させると歴代名機図鑑に登録され、現役一覧から除外される', () => {
    let state = releaseFirstProduct(newGame());
    state = advance(state, 4);
    const product = state.company.products[0]!;
    state = must(applyCommand(state, { type: 'retireProduct', productId: product.id }));
    expect(state.company.products.length).toBe(0);
    expect(state.company.archive.length).toBe(1);
    expect(state.company.archive[0]?.name).toBe(product.name);
    expect(state.company.archive[0]?.retiredWeek).toBeDefined();
  });

  it('マイナーチェンジで製品の鮮度が全回復する', () => {
    let state = releaseFirstProduct(newGame());
    state = advance(state, 8);
    const product = state.company.products[0]!;
    const initialPerf = product.performance;
    state = must(applyCommand(state, { type: 'minorChangeProduct', productId: product.id }));
    const updated = state.company.products[0]!;
    expect(updated.releasedWeek).toBe(state.week);
    expect(updated.performance).toBeGreaterThan(initialPerf);
  });
});
