import { describe, expect, it } from 'vitest';
import { findCategory } from '../../content/src/categories';
import { createGame } from './setup';
import { advanceWeek } from './week';
import {
  calculateEffectiveUnitCost,
  standardBatchUnits,
  weeklyRequiredProductionCash,
} from './production';
import { getActiveAlerts } from './selectors';
import type { Product } from './types';

function createDummyProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-radio',
    name: 'テストラジオ',
    categoryId: 'radio-tube',
    moduleIds: [],
    qualityLevel: 1,
    featureIds: [],
    performance: 100,
    energy: 0,
    unitCost: 6000,
    price: 9000,
    completedWeek: 1,
    releasedWeek: 1,
    onSale: true,
    productionPlan: 100,
    stockUnits: 0,
    stockValue: 0,
    totalUnitsProduced: 0,
    totalUnitsSold: 0,
    totalRevenue: 0,
    lastWeekUnitsSold: 0,
    lastWeekShareBasis: 0,
    advancement: 1,
    novelty: 1,
    practicality: 1,
    meetingLog: [],
    ...overrides,
  };
}

describe('製造現場の原理原則に基づく生産単価計算', () => {
  it('基準ロット規模がカテゴリの工数から正しく導出される', () => {
    const batteryCat = findCategory('battery-dry')!; // 3工数/100台
    const radioCat = findCategory('radio-tube')!; // 400工数/100台
    expect(standardBatchUnits(batteryCat)).toBeGreaterThan(10000);
    expect(standardBatchUnits(radioCat)).toBe(100);
  });

  it('小ロット生産では段取り固定費の負担により単価が割高になる', () => {
    const product = createDummyProduct({ unitCost: 6000 }); // 基準ロット100台
    // 10台しか作らない小ロット
    const smallLot = calculateEffectiveUnitCost(product, 10, 0.5);
    expect(smallLot.effectiveUnitCost).toBeGreaterThan(6000);
    expect(smallLot.isSmallLotPenalty).toBe(true);
    expect(smallLot.deltaPercent).toBeGreaterThanOrEqual(15);
  });

  it('大ロット生産では段取り固定費希釈と部材割引で単価が下がる（量産効果）', () => {
    const product = createDummyProduct({ unitCost: 6000 }); // 基準ロット100台
    // 500台作る大ロット
    const largeLot = calculateEffectiveUnitCost(product, 500, 0.5);
    expect(largeLot.effectiveUnitCost).toBeLessThan(6000);
    expect(largeLot.isVolumeDiscount).toBe(true);
    expect(largeLot.deltaPercent).toBeLessThan(0);
  });

  it('工場の稼働率が過負荷（85%超）になると残業割増が発生する', () => {
    const product = createDummyProduct({ unitCost: 6000 });
    const normal = calculateEffectiveUnitCost(product, 100, 0.5);
    const overtime = calculateEffectiveUnitCost(product, 100, 0.95);
    expect(overtime.effectiveUnitCost).toBeGreaterThan(normal.effectiveUnitCost);
    expect(overtime.isOvertimePenalty).toBe(true);
  });
});

describe('生産停止および資金不足アラートシステム', () => {
  it('手元現金が不足して次週の生産計画を満たせない場合、事前警告アラートが発火する', () => {
    const state = createGame({ scenarioId: 'SC01', seed: 1, companyName: 'あかつき電機' });
    state.company.accounts.cash = 30; // 30万円（極めて少ない）
    const radio = createDummyProduct({ productionPlan: 500, unitCost: 6000 }); // 必要資金約300万円
    state.company.products.push(radio);

    const required = weeklyRequiredProductionCash(state);
    expect(required).toBeGreaterThan(state.company.accounts.cash);

    const alerts = getActiveAlerts(state);
    const warning = alerts.find(a => a.id === 'alert-prod-cash-shortfall-forecast');
    expect(warning).toBeDefined();
    expect(warning?.level).toBe('warning');
    expect(warning?.actionScreen).toBe('finance');
  });

  it('実際に現金不足で生産が停止（0台）した場合、直後の週で緊急（critical）アラートが発火する', () => {
    const state = createGame({ scenarioId: 'SC01', seed: 1, companyName: 'あかつき電機' });
    state.company.accounts.cash = 25; // 必須支払い（約14万）引いたら11万円
    // 乾電池が先に現金を吸い尽くす設定
    const battery = createDummyProduct({
      id: 'battery',
      categoryId: 'battery-dry',
      productionPlan: 10000,
      unitCost: 20,
    });
    const radio = createDummyProduct({
      id: 'radio',
      categoryId: 'radio-tube',
      productionPlan: 500,
      unitCost: 6000,
    });
    state.company.products = [battery, radio];

    const result = advanceWeek(state);
    expect(result.ok).toBe(true);
    const nextState = result.state;

    // ラジオは現金不足で0台しか作れなかったはず
    const radioInNext = nextState.company.products.find(p => p.id === 'radio');
    expect(radioInNext?.lastWeekUnitsProduced).toBe(0);

    const alerts = getActiveAlerts(nextState);
    const critical = alerts.find(a => a.id === 'alert-prod-stopped');
    expect(critical).toBeDefined();
    expect(critical?.level).toBe('critical');
    expect(critical?.title).toContain('テストラジオ');
  });

  it('手元現金が潤沢（借入後等）な場合は事前警告アラートが発火しない', () => {
    const state = createGame({ scenarioId: 'SC01', seed: 1, companyName: 'あかつき電機' });
    state.company.accounts.cash = 2000; // 2,000万円
    const radio = createDummyProduct({ productionPlan: 500, unitCost: 6000 });
    state.company.products.push(radio);

    const alerts = getActiveAlerts(state);
    const warning = alerts.find(a => a.id === 'alert-prod-cash-shortfall-forecast');
    expect(warning).toBeUndefined();
  });

  it('ユーザーの直面したシナリオ（現金39万、乾電池2.2万台＋ラジオ600台）で事前警告→生産停止アラート→借入で回復のサイクルを検証', () => {
    const state = createGame({ scenarioId: 'SC01', seed: 1, companyName: 'あかつき電機' });
    state.week = 41;
    state.company.accounts.cash = 39; // 現金39万円
    state.company.baseWorkloadCapacity = 3200;
    state.company.channels.direct = 1;
    state.company.channels.affiliate = 1; // 2400工数

    const battery = createDummyProduct({
      id: 'battery-1',
      name: '乾電池1号',
      categoryId: 'battery-dry',
      unitCost: 20,
      price: 30,
      productionPlan: 22000,
    });
    const radio = createDummyProduct({
      id: 'radio-1',
      name: '真空管ラジオ1号',
      categoryId: 'radio-tube',
      unitCost: 6235,
      price: 9352,
      productionPlan: 600,
    });
    state.company.products = [battery, radio];

    // 1. 週送り前：事前察知アラート（次週生産資金ショート予告）が発火していること
    const alertsBefore = getActiveAlerts(state);
    const forecastAlert = alertsBefore.find(a => a.id === 'alert-prod-cash-shortfall-forecast');
    expect(forecastAlert).toBeDefined();
    expect(forecastAlert?.level).toBe('warning');

    // 2. そのまま進めると、現金不足でラジオが0台になり緊急アラートが発火すること
    const step1 = advanceWeek(state);
    expect(step1.ok).toBe(true);
    const s1 = step1.state;
    expect(s1.lastWeek?.productionShortfalls?.length).toBeGreaterThan(0);
    const radioShortfall = s1.lastWeek?.productionShortfalls?.find(x => x.productId === 'radio-1');
    expect(radioShortfall?.actualUnits).toBe(0);
    expect(radioShortfall?.reason).toBe('cash');

    const alertsAfterS1 = getActiveAlerts(s1);
    const stoppedAlert = alertsAfterS1.find(a => a.id === 'alert-prod-stopped');
    expect(stoppedAlert).toBeDefined();
    expect(stoppedAlert?.level).toBe('critical');
    expect(stoppedAlert?.title).toContain('真空管ラジオ1号');

    // 3. 経理部で借入（500万円）を行い、十分な現金を確保して次週へ進めると回復すること
    s1.company.accounts.cash += 500;
    const alertsWithLoan = getActiveAlerts(s1);
    // 事前予告アラートは消えていること
    expect(alertsWithLoan.find(a => a.id === 'alert-prod-cash-shortfall-forecast')).toBeUndefined();

    const step2 = advanceWeek(s1);
    expect(step2.ok).toBe(true);
    const s2 = step2.state;
    const radioProd2 = s2.company.products.find(p => p.id === 'radio-1');
    expect(radioProd2?.lastWeekUnitsProduced).toBeGreaterThan(500); // 正常に生産された
    expect(s2.lastWeek?.unitsSold).toBeGreaterThan(0); // 販売も成立
  });
});

