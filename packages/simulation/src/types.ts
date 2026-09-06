import type { CategoryId } from '../../content/src/categories';
import type { ChannelId } from '../../content/src/channels';

export type { CategoryId, ChannelId };

/** 金額は万円の整数。単価・価格だけ千円の整数で持つ。 */
export type Money = number;

export type DebitAccountId =
  | 'cash'
  | 'inventory'
  | 'equipment'
  | 'cogs'
  | 'sellingExpense'
  | 'researchExpense'
  | 'developmentExpense'
  | 'laborExpense'
  | 'interestExpense'
  | 'depreciationExpense';

export type CreditAccountId = 'debt' | 'payable' | 'capital' | 'retainedEarnings' | 'revenue';

export type AccountId = DebitAccountId | CreditAccountId;

export type CashFlowCategory = 'operating' | 'investing' | 'financing';

export type JournalEntry = {
  week: number;
  seq: number;
  debit: AccountId;
  credit: AccountId;
  amount: Money;
  reason: string;
};

export type PeriodTotals = {
  revenue: Money;
  cogs: Money;
  sellingExpense: Money;
  researchExpense: Money;
  developmentExpense: Money;
  laborExpense: Money;
  interestExpense: Money;
  depreciationExpense: Money;
  operatingCashFlow: Money;
  investingCashFlow: Money;
  financingCashFlow: Money;
  cashStart: Money;
  unitsSold: number;
};

export type PeriodSummary = {
  label: string;
  kind: 'month' | 'year';
  startWeek: number;
  endWeek: number;
  totals: PeriodTotals;
  netIncome: Money;
  cashEnd: Money;
};

export type ResearchState = {
  themeId: string | null;
  /** 現在の課題に投じた累計ポイント。 */
  points: number;
  weeklyBudget: Money;
};

export type DevelopmentProject = {
  id: string;
  name: string;
  categoryId: CategoryId;
  moduleIds: readonly string[];
  /** 品質への追加投資（0〜3）。 */
  qualityLevel: number;
  /** 開発会議で選んだ付加価値項目。 */
  featureIds: readonly string[];
  performance: number;
  energy: number;
  /** 標準製造原価（千円）。 */
  unitCost: number;
  devWeeks: number;
  devCost: Money;
  paidCost: Money;
  startedWeek: number;
  remainingWeeks: number;
  /** 先進性：技術的な野心度。 */
  advancement: number;
  /** 目新しさ：市場での話題性。 */
  novelty: number;
  /** 実用性：日常使いでの価値。 */
  practicality: number;
  /** 開発会議での議論の要点。 */
  meetingLog: readonly string[];
};

export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;
  moduleIds: readonly string[];
  qualityLevel: number;
  featureIds: readonly string[];
  performance: number;
  energy: number;
  /** 標準製造原価（千円）。 */
  unitCost: number;
  /** 販売価格（千円）。 */
  price: number;
  completedWeek: number;
  releasedWeek: number | null;
  onSale: boolean;
  productionPlan: number;
  stockUnits: number;
  /** 在庫の取得原価合計（万円）。移動平均原価の分子になる。 */
  stockValue: Money;
  totalUnitsProduced: number;
  totalUnitsSold: number;
  totalRevenue: Money;
  lastWeekUnitsSold: number;
  lastWeekShareBasis: number;
  advancement: number;
  novelty: number;
  practicality: number;
  meetingLog: readonly string[];
};

export type AdvertisingCampaignType = 'tv' | 'newspaper' | 'store';

export type AdvertisingState = {
  activeCampaign: AdvertisingCampaignType | null;
  budget: Money;
  boostWeeksRemaining: number;
  boostBasis: number;
};

export type PersonnelState = {
  morale: number; // 0〜100
  wageLevel: number; // 1(抑制) 〜 3(標準) 〜 5(高待遇)
  trainingCount: number;
};

export type ArchivedProduct = {
  id: string;
  name: string;
  categoryId: CategoryId;
  completedWeek: number;
  releasedWeek: number;
  retiredWeek: number | null;
  performance: number;
  unitCost: number;
  price: number;
  totalUnitsSold: number;
  totalRevenue: Money;
  totalProfit: Money;
  peakShareBasis: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  awards: string[];
  review: string;
};

export type MeetingProposal = {
  id: string;
  executiveId: 'design' | 'sales' | 'finance' | 'production' | 'personnel';
  title: string;
  description: string;
  cost: Money;
  expectedEffect: string;
  accepted: boolean;
};

export type RivalAction = {
  id: string;
  rivalId: string;
  rivalName: string;
  week: number;
  actionText: string;
  categoryId: CategoryId;
};

export type IndustryNewsEntry = {
  id: string;
  week: number;
  title: string;
  headline: string;
  body: string;
  impactText: string;
};

export type CompanyState = {
  name: string;
  accounts: Record<AccountId, Money>;
  brandBasis: number;
  employees: number;
  baseCapacityUnits: number;
  /** 設備の取得価額合計。減価償却の計算に使う。 */
  equipmentCost: Money;
  /** 追加購入した設備の口数。上限判定に使う。 */
  purchasedEquipmentUnits: number;
  ownedTechIds: string[];
  research: ResearchState;
  projects: DevelopmentProject[];
  products: Product[];
  channels: Record<ChannelId, number>;
  /** 資金不足のまま進行した週数。 */
  graceWeeks: number;
  nextProductNumber: number;
  advertising: AdvertisingState;
  personnel: PersonnelState;
  archive: ArchivedProduct[];
  proposals: MeetingProposal[];
  rivalActions: RivalAction[];
  newsFeed: IndustryNewsEntry[];
};

export type RivalState = {
  id: string;
  name: string;
  lastWeekShareBasis: number;
};

export type EventLogEntry = {
  week: number;
  seq: number;
  kind: 'info' | 'good' | 'warn' | 'bad';
  message: string;
};

export type WeeklyReport = {
  week: number;
  unitsProduced: number;
  unitsSold: number;
  revenue: Money;
  cogs: Money;
  expenses: Money;
  netIncome: Money;
  cashEnd: Money;
  defectUnits: number;
  categoryShares: { categoryId: CategoryId; demandUnits: number; ownUnits: number; shareBasis: number }[];
};

export type ScenarioProgress = {
  cumulativeRevenue: Money;
  cumulativeProfit: Money;
  brandBasis: number;
  weeksRemaining: number;
};

export type GameStatus = 'playing' | 'won' | 'lost';

export type GameState = {
  schemaVersion: 1;
  engineVersion: string;
  contentVersion: string;
  scenarioId: string;
  seed: number;
  rng: number;
  /** 開始からの経過週。0が開始週。 */
  week: number;
  startYear: number;
  commandSeq: number;
  journalSeq: number;
  logSeq: number;
  status: GameStatus;
  outcome: string | null;
  company: CompanyState;
  rivals: RivalState[];
  monthTotals: PeriodTotals;
  yearTotals: PeriodTotals;
  monthStartWeek: number;
  yearStartWeek: number;
  monthlySummaries: PeriodSummary[];
  yearlySummaries: PeriodSummary[];
  totals: { revenue: Money; profit: Money; unitsSold: number };
  journal: JournalEntry[];
  log: EventLogEntry[];
  lastWeek: WeeklyReport | null;
};

export type CommandResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string; state: GameState };

export type AdvanceResult =
  | { ok: true; state: GameState; weeksAdvanced: number; stopped: string | null }
  | { ok: false; state: GameState; kind: 'funds'; required: Money; cash: Money; weeksAdvanced: number };
