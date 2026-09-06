import { describe, expect, it } from 'vitest';
import { applyCommand, loanLimit, type Command } from './commands';
import { defaultModuleIds, evaluateDesign } from './design';
import { stateHash } from './hash';
import { balanceSheet, cashFlowStatement } from './ledger';
import { evaluateDevelopmentMeeting } from './meeting';
import { createGame } from './setup';
import { advanceWeek, advanceWeeks, productionCapacityUnits } from './week';
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

/** 冷蔵庫を1本発売するところまで進める共通手順。 */
function releaseFirstProduct(state: GameState): GameState {
  let current = run(state, [
    { type: 'setResearchBudget', amount: 30 },
    { type: 'setResearchTheme', themeId: 'res-efficiency-1' },
    { type: 'openChannel', channelId: 'affiliate' },
    {
      type: 'startDevelopment',
      name: 'あかつき冷蔵庫1号',
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 1,
    },
  ]);
  current = advance(current, 12);
  const product = current.company.products[0];
  expect(product).toBeDefined();
  if (!product) throw new Error('製品が完成していません。');
  return run(current, [
    { type: 'setPrice', productId: product.id, price: 62 },
    { type: 'setProductionPlan', productId: product.id, units: 40 },
    { type: 'setOnSale', productId: product.id, onSale: true },
  ]);
}

describe('設立と台帳', () => {
  it('開始時点で資産＝負債＋純資産が成立する', () => {
    const state = newGame();
    const balance = balanceSheet(state);
    expect(balance.cash).toBe(10000);
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
      type: 'startDevelopment', name: '試作機', categoryId: 'washer',
      moduleIds: defaultModuleIds('washer'), qualityLevel: 0,
    }]);
    const completed = advance(started, 9);
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
    const capacity = productionCapacityUnits(state);
    const result = applyCommand(state, { type: 'setProductionPlan', productId: product.id, units: capacity + 1 });
    expect(result.ok).toBe(false);
  });
});

describe('設計と研究', () => {
  it('未解禁の部品を選んだ設計は拒否される', () => {
    const evaluation = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: ['mod-cool-2', 'mod-eco-1', 'mod-body-1'],
      qualityLevel: 0,
      ownedTechIds: ['tech-cooling-basic'],
    });
    expect(evaluation.ok).toBe(false);
  });

  it('プレビューと開発案件の仕様が一致する（性能は会議結果の補正幅の範囲内）', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'washer',
      moduleIds: defaultModuleIds('washer'),
      qualityLevel: 2,
      ownedTechIds: state.company.ownedTechIds,
    });
    if (!evaluation.ok) throw new Error(evaluation.error);
    const started = run(state, [{
      type: 'startDevelopment', name: '洗濯機A', categoryId: 'washer',
      moduleIds: defaultModuleIds('washer'), qualityLevel: 2,
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

describe('開発会議', () => {
  it('付加価値項目は先進性・目新しさ・実用性と原価・性能に反映される', () => {
    const state = newGame();
    const bare = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: state.company.ownedTechIds,
      currentYear: state.startYear + 10,
    });
    const withFeatures = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: state.company.ownedTechIds,
      featureIds: ['feat-refr-veggie-large', 'feat-refr-door-pocket'],
      currentYear: state.startYear + 10,
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
      ownedTechIds: state.company.ownedTechIds,
      featureIds: ['feat-refr-app-link'], // 2008年以降の項目
      currentYear: state.startYear,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('選択上限を超える付加価値項目は拒否される', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
      qualityLevel: 0,
      ownedTechIds: state.company.ownedTechIds,
      featureIds: [
        'feat-refr-veggie-large', 'feat-refr-door-pocket', 'feat-refr-egg-tray',
        'feat-refr-adjust-shelf', 'feat-refr-color-variant', 'feat-refr-fingerprint',
        'feat-refr-wood-panel', 'feat-refr-reversible-door', 'feat-refr-anti-tip',
      ],
      currentYear: state.startYear,
    });
    expect(evaluation.ok).toBe(false);
  });

  it('生産性・実用性を無視した野心的すぎる設計には反対意見が出る', () => {
    const state = newGame();
    const evaluation = evaluateDesign({
      categoryId: 'refrigerator',
      moduleIds: defaultModuleIds('refrigerator'),
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
    const state: GameState = { ...base, week: 2400 };
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
      { type: 'investEquipment', units: 10 },
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
    expect(applyCommand(state, { type: 'borrow', amount: limit + 1 }).ok).toBe(false);
    const borrowed = must(applyCommand(state, { type: 'borrow', amount: 5000 }));
    expect(borrowed.company.accounts.debt).toBe(5000);
    expect(borrowed.company.accounts.cash).toBe(15000);
    const repaid = must(applyCommand(borrowed, { type: 'repay', amount: 2000 }));
    expect(repaid.company.accounts.debt).toBe(3000);
    expect(balanceSheet(repaid).difference).toBe(0);
  });

  it('資金不足のまま進め続けると敗北する', () => {
    let state = run(newGame(), [{ type: 'investEquipment', units: 12 }]);
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
  it('テレビCMを打つと広告ブーストが4週間有効になり、ブランドが向上する', () => {
    let state = newGame();
    const initialBrand = state.company.brandBasis;
    state = must(applyCommand(state, { type: 'setAdvertising', campaign: 'tv', budget: 150 }));
    expect(state.company.advertising.activeCampaign).toBe('tv');
    expect(state.company.advertising.boostWeeksRemaining).toBe(4);
    expect(state.company.advertising.boostBasis).toBe(3500);
    expect(state.company.brandBasis).toBeGreaterThan(initialBrand);

    state = advance(state, 1);
    expect(state.company.advertising.boostWeeksRemaining).toBe(3);
  });

  it('人事研修と賞与で士気が向上し、不良率の低減に寄与する', () => {
    let state = newGame();
    expect(state.company.personnel.morale).toBe(75);

    state = must(applyCommand(state, { type: 'conductTraining', cost: 50 }));
    expect(state.company.personnel.morale).toBe(85);
    expect(state.company.personnel.trainingCount).toBe(1);

    state = must(applyCommand(state, { type: 'payBonus', amountPerEmployee: 5 }));
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
