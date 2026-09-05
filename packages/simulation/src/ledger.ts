import { assertMoney } from './money';
import type {
  AccountId,
  CashFlowCategory,
  GameState,
  Money,
  PeriodTotals,
} from './types';

const debitNormalAccounts: readonly AccountId[] = [
  'cash', 'inventory', 'equipment', 'cogs', 'sellingExpense', 'researchExpense',
  'developmentExpense', 'laborExpense', 'interestExpense', 'depreciationExpense',
];

export function isDebitNormal(account: AccountId): boolean {
  return debitNormalAccounts.includes(account);
}

export function createAccounts(): Record<AccountId, Money> {
  return {
    cash: 0, inventory: 0, equipment: 0, cogs: 0, sellingExpense: 0, researchExpense: 0,
    developmentExpense: 0, laborExpense: 0, interestExpense: 0, depreciationExpense: 0,
    debt: 0, payable: 0, capital: 0, retainedEarnings: 0, revenue: 0,
  };
}

export function emptyPeriodTotals(cashStart: Money): PeriodTotals {
  return {
    revenue: 0, cogs: 0, sellingExpense: 0, researchExpense: 0, developmentExpense: 0,
    laborExpense: 0, interestExpense: 0, depreciationExpense: 0,
    operatingCashFlow: 0, investingCashFlow: 0, financingCashFlow: 0,
    cashStart, unitsSold: 0,
  };
}

const periodAccountKeys = {
  revenue: 'revenue',
  cogs: 'cogs',
  sellingExpense: 'sellingExpense',
  researchExpense: 'researchExpense',
  developmentExpense: 'developmentExpense',
  laborExpense: 'laborExpense',
  interestExpense: 'interestExpense',
  depreciationExpense: 'depreciationExpense',
} as const;

type PeriodAccountId = keyof typeof periodAccountKeys;

function isPeriodAccount(account: AccountId): account is PeriodAccountId {
  return account in periodAccountKeys;
}

export type Posting = {
  debit: AccountId;
  credit: AccountId;
  amount: Money;
  reason: string;
  flow?: CashFlowCategory;
  /** 期間集計へ加算しない。決算の振替仕訳で使う。 */
  skipPeriod?: boolean;
};

/** 複式で1件記帳する。金額0は記帳しない。 */
export function post(state: GameState, posting: Posting): void {
  const amount = assertMoney(Math.floor(posting.amount), '記帳金額');
  if (amount === 0) return;
  if (amount < 0) throw new RangeError('記帳金額は0以上で指定してください。');
  if (posting.debit === posting.credit) throw new RangeError('借方と貸方に同じ勘定は指定できません。');

  const accounts = state.company.accounts;
  accounts[posting.debit] += isDebitNormal(posting.debit) ? amount : -amount;
  accounts[posting.credit] += isDebitNormal(posting.credit) ? -amount : amount;

  for (const account of posting.skipPeriod ? [] : [posting.debit, posting.credit]) {
    if (!isPeriodAccount(account)) continue;
    state.monthTotals[account] += amount;
    state.yearTotals[account] += amount;
  }

  const cashDelta = posting.debit === 'cash' ? amount : posting.credit === 'cash' ? -amount : 0;
  if (cashDelta !== 0) {
    const flow: CashFlowCategory = posting.flow ?? 'operating';
    const key = flow === 'operating' ? 'operatingCashFlow' : flow === 'investing' ? 'investingCashFlow' : 'financingCashFlow';
    state.monthTotals[key] += cashDelta;
    state.yearTotals[key] += cashDelta;
  }

  state.journalSeq += 1;
  state.journal.push({
    week: state.week,
    seq: state.journalSeq,
    debit: posting.debit,
    credit: posting.credit,
    amount,
    reason: posting.reason,
  });
}

/**
 * 現金で支払う。不足分は未払金として残し、支払えた額だけを現金から減らす。
 * 未払金は翌週以降、現金がある範囲で自動的に返済する。
 */
export function payCash(
  state: GameState,
  options: { debit: AccountId; amount: Money; reason: string; flow?: CashFlowCategory },
): { paid: Money; unpaid: Money } {
  const amount = Math.floor(options.amount);
  if (amount <= 0) return { paid: 0, unpaid: 0 };
  const cash = state.company.accounts.cash;
  const paid = Math.max(0, Math.min(cash, amount));
  const unpaid = amount - paid;
  if (paid > 0) {
    post(state, { debit: options.debit, credit: 'cash', amount: paid, reason: options.reason, flow: options.flow });
  }
  if (unpaid > 0) {
    post(state, { debit: options.debit, credit: 'payable', amount: unpaid, reason: `${options.reason}（未払）` });
  }
  return { paid, unpaid };
}

export type IncomeStatement = {
  revenue: Money;
  cogs: Money;
  grossProfit: Money;
  sellingExpense: Money;
  researchExpense: Money;
  developmentExpense: Money;
  laborExpense: Money;
  depreciationExpense: Money;
  operatingIncome: Money;
  interestExpense: Money;
  netIncome: Money;
};

export function incomeStatement(totals: PeriodTotals): IncomeStatement {
  const grossProfit = totals.revenue - totals.cogs;
  const operatingIncome = grossProfit
    - totals.sellingExpense - totals.researchExpense - totals.developmentExpense
    - totals.laborExpense - totals.depreciationExpense;
  return {
    revenue: totals.revenue,
    cogs: totals.cogs,
    grossProfit,
    sellingExpense: totals.sellingExpense,
    researchExpense: totals.researchExpense,
    developmentExpense: totals.developmentExpense,
    laborExpense: totals.laborExpense,
    depreciationExpense: totals.depreciationExpense,
    operatingIncome,
    interestExpense: totals.interestExpense,
    netIncome: operatingIncome - totals.interestExpense,
  };
}

export type BalanceSheet = {
  cash: Money;
  inventory: Money;
  equipment: Money;
  assets: Money;
  debt: Money;
  payable: Money;
  liabilities: Money;
  capital: Money;
  retainedEarnings: Money;
  currentIncome: Money;
  equity: Money;
  difference: Money;
};

/** 台帳の残高から貸借対照表を導く。当期損益は未振替の収益・費用から求める。 */
export function balanceSheet(state: GameState): BalanceSheet {
  const accounts = state.company.accounts;
  const assets = accounts.cash + accounts.inventory + accounts.equipment;
  const liabilities = accounts.debt + accounts.payable;
  const currentIncome = accounts.revenue
    - accounts.cogs - accounts.sellingExpense - accounts.researchExpense
    - accounts.developmentExpense - accounts.laborExpense - accounts.interestExpense
    - accounts.depreciationExpense;
  const equity = accounts.capital + accounts.retainedEarnings + currentIncome;
  return {
    cash: accounts.cash,
    inventory: accounts.inventory,
    equipment: accounts.equipment,
    assets,
    debt: accounts.debt,
    payable: accounts.payable,
    liabilities,
    capital: accounts.capital,
    retainedEarnings: accounts.retainedEarnings,
    currentIncome,
    equity,
    difference: assets - (liabilities + equity),
  };
}

export type CashFlowStatement = {
  cashStart: Money;
  operating: Money;
  investing: Money;
  financing: Money;
  netChange: Money;
  cashEnd: Money;
};

export function cashFlowStatement(totals: PeriodTotals, cashEnd: Money): CashFlowStatement {
  const netChange = totals.operatingCashFlow + totals.investingCashFlow + totals.financingCashFlow;
  return {
    cashStart: totals.cashStart,
    operating: totals.operatingCashFlow,
    investing: totals.investingCashFlow,
    financing: totals.financingCashFlow,
    netChange,
    cashEnd,
  };
}

/** 収益・費用を利益剰余金へ振り替える。年次決算で使う。 */
export function closeIncomeToRetainedEarnings(state: GameState): Money {
  const accounts = state.company.accounts;
  const expenses: AccountId[] = [
    'cogs', 'sellingExpense', 'researchExpense', 'developmentExpense',
    'laborExpense', 'interestExpense', 'depreciationExpense',
  ];
  const revenue = accounts.revenue;
  let totalExpense = 0;
  for (const account of expenses) totalExpense += accounts[account];
  const netIncome = revenue - totalExpense;

  if (revenue > 0) post(state, { debit: 'revenue', credit: 'retainedEarnings', amount: revenue, reason: '年次決算：収益振替', skipPeriod: true });
  for (const account of expenses) {
    const balance = accounts[account];
    if (balance > 0) post(state, { debit: 'retainedEarnings', credit: account, amount: balance, reason: '年次決算：費用振替', skipPeriod: true });
  }
  return netIncome;
}
