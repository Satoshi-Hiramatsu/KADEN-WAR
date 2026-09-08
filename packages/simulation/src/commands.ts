import { findCategory, unitsFromWorkload, workloadForUnits } from '../../content/src/categories';
import { findAdCampaign } from '../../content/src/advertising';
import { channels, findChannel, type ChannelId } from '../../content/src/channels';
import { findExecutive } from '../../content/src/executives';
import { findMeetingCast, type MeetingCastId } from '../../content/src/meetingCast';
import { economyRules, weeksPerYear } from '../../content/src/rules';
import { findResearchTheme } from '../../content/src/technology';
import { evaluateDesign, type DesignSpec } from './design';
import { payCash, post } from './ledger';
import { evaluateDevelopmentMeeting, type MeetingAttendeeId } from './meeting';
import { nextInt } from './rng';
import { buildCategoryUnlockContext } from './selectors';
import { productionCapacityWorkload, productRank } from './week';
import type { AdvertisingCampaignType, CommandResult, DevelopmentProject, GameState, Money } from './types';

export type Command =
  | { type: 'setResearchTheme'; themeId: string | null }
  | { type: 'setResearchBudget'; amount: Money }
  | {
      type: 'startDevelopment';
      name: string;
      categoryId: string;
      moduleIds: readonly string[];
      qualityLevel: number;
      featureIds?: readonly string[];
      /** 会議で反対意見が出た設計を、社長決裁で押し切って着手する。 */
      overrideObjections?: boolean;
    }
  | { type: 'cancelDevelopment'; projectId: string }
  | { type: 'setPrice'; productId: string; price: number }
  | { type: 'setProductionPlan'; productId: string; units: number }
  | { type: 'setOnSale'; productId: string; onSale: boolean }
  | { type: 'openChannel'; channelId: ChannelId }
  | { type: 'closeChannel'; channelId: ChannelId }
  | { type: 'investEquipment'; units: number }
  | { type: 'borrow'; amount: Money }
  | { type: 'repay'; amount: Money }
  | { type: 'setAdvertising'; campaign: AdvertisingCampaignType; budget: Money }
  | { type: 'setWageLevel'; level: number }
  | { type: 'conductTraining'; cost: Money }
  | { type: 'payBonus'; amountPerEmployee: Money }
  | { type: 'acceptProposal'; proposalId: string }
  | { type: 'retireProduct'; productId: string }
  | { type: 'minorChangeProduct'; productId: string }
  | { type: 'setMonthlyReportVisible'; visible: boolean };

export function loanLimit(state: GameState): Money {
  const capital = state.company.accounts.capital;
  return Math.max(0, capital * economyRules.loanLimitMultiplier - state.company.accounts.debt);
}

function fail(state: GameState, error: string): CommandResult {
  return { ok: false, error, state };
}

function meetingRoleLabel(id: MeetingAttendeeId): string {
  if (id === 'design-chief' || id === 'design-associate') {
    return findMeetingCast(id as MeetingCastId).role;
  }
  return findExecutive(id).role;
}

/**
 * 会議での議論を経た完成品への性能補正を1回だけ乱数で引く。
 * 技術の成熟度（先進性に対して保有技術がどれだけ追いついているか）と
 * 社員の士気、反対を押し切ったかどうかで振れ幅が変わる。
 */
function rollMeetingOutcome(
  draft: GameState,
  spec: DesignSpec,
  overrideObjections: boolean,
): { modifier: number; narrative: string } {
  const techReadiness = draft.company.ownedTechIds.length - spec.advancement / 5;
  const moraleFactor = (draft.company.personnel.morale - 60) / 10;
  const overrideBase = overrideObjections ? -6 : 0;
  const variance = overrideObjections ? 8 : 4;
  const base = Math.round(techReadiness * 1.5 + moraleFactor * 1.5 + overrideBase);
  const drawn = nextInt(draft.rng, -variance, variance);
  draft.rng = drawn.state;
  const modifier = Math.max(-15, Math.min(15, base + drawn.value));
  const narrative = modifier > 3
    ? `会議後、技術力と士気の後押しで完成度が高まった（性能${modifier >= 0 ? '+' : ''}${modifier}）。`
    : modifier < -3
      ? `無理を重ねた反動で仕上がりに不安が残った（性能${modifier}）。`
      : '会議の議論はおおむね想定通りの結果に落ち着いた。';
  return { modifier, narrative };
}

/**
 * プレイヤーの操作をひとつ適用する。承認の時点で資金・技術・在庫の制約を再検証し、
 * 成立した操作だけを一度だけ反映する。
 */
export function applyCommand(state: GameState, command: Command): CommandResult {
  if (state.status !== 'playing') return fail(state, 'ゲームは終了しています。');
  const draft = structuredClone(state);
  const company = draft.company;

  switch (command.type) {
    case 'setResearchTheme': {
      if (command.themeId === null) {
        company.research.themeId = null;
        company.research.points = 0;
        break;
      }
      const theme = findResearchTheme(command.themeId);
      if (!theme) return fail(state, '研究課題が見つかりません。');
      if (company.ownedTechIds.includes(theme.grantsTechId)) return fail(state, 'その技術はすでに保有しています。');
      const researchYear = draft.startYear + Math.floor(draft.week / weeksPerYear);
      if (researchYear < theme.minYear) {
        return fail(state, `${theme.name}に着手できるのは${theme.minYear}年からです。`);
      }
      const missing = theme.requiredTechIds.filter(techId => !company.ownedTechIds.includes(techId));
      if (missing.length > 0) return fail(state, '前提技術が足りません。');
      if (company.research.themeId !== command.themeId) {
        company.research.themeId = command.themeId;
        company.research.points = 0;
      }
      break;
    }
    case 'setResearchBudget': {
      if (!Number.isInteger(command.amount) || command.amount < 0) return fail(state, '研究予算は0以上の整数で指定してください。');
      if (command.amount > economyRules.maxResearchBudget) {
        return fail(state, `研究予算は週${economyRules.maxResearchBudget}万円までです。`);
      }
      company.research.weeklyBudget = command.amount;
      break;
    }
    case 'startDevelopment': {
      if (company.projects.length >= 2) return fail(state, '同時に進められる開発は2件までです。');
      const name = command.name.trim();
      if (name.length === 0 || name.length > 24) return fail(state, '製品名は1〜24文字で指定してください。');
      const currentYear = draft.startYear + Math.floor(draft.week / weeksPerYear);
      const evaluation = evaluateDesign({
        categoryId: command.categoryId,
        moduleIds: command.moduleIds,
        qualityLevel: command.qualityLevel,
        ownedTechIds: company.ownedTechIds,
        featureIds: command.featureIds ?? [],
        currentYear,
        unlockContext: buildCategoryUnlockContext(draft),
      });
      if (!evaluation.ok) return fail(state, evaluation.error);
      const spec = evaluation.spec;
      const firstInstallment = Math.ceil(spec.devCost / spec.devWeeks);
      if (company.accounts.cash < firstInstallment) {
        return fail(state, `開発の初回費用${firstInstallment}万円を払う現金がありません。`);
      }

      const meetingEvaluation = evaluateDevelopmentMeeting(draft, spec);
      const overrideObjections = command.overrideObjections ?? false;
      if (meetingEvaluation.blocking && !overrideObjections) {
        return fail(state, '開発会議で反対意見が出ています。設計を見直すか、社長決裁で押し切ってください。');
      }
      if (meetingEvaluation.blocking && overrideObjections) {
        company.personnel.morale = Math.max(10, company.personnel.morale - 5);
      }

      const outcome = rollMeetingOutcome(draft, spec, meetingEvaluation.blocking && overrideObjections);
      const finalPerformance = Math.max(1, spec.performance + outcome.modifier);
      const meetingLog: string[] = [
        `会議の結論：${
          meetingEvaluation.verdict === 'approved'
            ? '全会一致で承認'
            : meetingEvaluation.verdict === 'concern'
              ? '懸念を残しつつ承認'
              : '反対を押し切って承認'
        }。`,
        ...meetingEvaluation.stances.map(stance => `${meetingRoleLabel(stance.id)}：${stance.comment}`),
        outcome.narrative,
      ];

      const project: DevelopmentProject = {
        id: `project-${draft.commandSeq + 1}`,
        name,
        categoryId: spec.categoryId,
        moduleIds: spec.moduleIds,
        qualityLevel: spec.qualityLevel,
        featureIds: spec.featureIds,
        performance: finalPerformance,
        energy: spec.energy,
        unitCost: spec.unitCost,
        devWeeks: spec.devWeeks,
        devCost: spec.devCost,
        paidCost: 0,
        startedWeek: draft.week,
        remainingWeeks: spec.devWeeks,
        advancement: spec.advancement,
        novelty: spec.novelty,
        practicality: spec.practicality,
        meetingLog,
      };
      company.projects.push(project);
      break;
    }
    case 'cancelDevelopment': {
      const index = company.projects.findIndex(project => project.id === command.projectId);
      if (index < 0) return fail(state, '開発案件が見つかりません。');
      company.projects.splice(index, 1);
      break;
    }
    case 'setPrice': {
      const product = company.products.find(candidate => candidate.id === command.productId);
      if (!product) return fail(state, '製品が見つかりません。');
      if (!Number.isInteger(command.price) || command.price <= 0) return fail(state, '価格は1円以上の整数で指定してください。');
      if (command.price > 2_000_000) return fail(state, '価格が上限を超えています。');
      product.price = command.price;
      break;
    }
    case 'setProductionPlan': {
      const product = company.products.find(candidate => candidate.id === command.productId);
      if (!product) return fail(state, '製品が見つかりません。');
      if (!Number.isInteger(command.units) || command.units < 0) return fail(state, '生産量は0以上の整数で指定してください。');
      const capacity = productionCapacityWorkload(draft);
      let plannedWorkload = 0;
      for (const candidate of company.products) {
        const candidateCategory = findCategory(candidate.categoryId);
        if (!candidateCategory) continue;
        const units = candidate.id === product.id ? command.units : candidate.productionPlan;
        plannedWorkload += workloadForUnits(candidateCategory, units);
      }
      if (plannedWorkload > capacity) {
        return fail(state, `週の生産能力${capacity.toLocaleString('ja-JP')}工数を超えています（計画${plannedWorkload.toLocaleString('ja-JP')}工数）。`);
      }
      product.productionPlan = command.units;
      break;
    }
    case 'setOnSale': {
      const product = company.products.find(candidate => candidate.id === command.productId);
      if (!product) return fail(state, '製品が見つかりません。');
      if (command.onSale) {
        const totalChannels = channels.reduce((sum, channel) => sum + company.channels[channel.id], 0);
        if (totalChannels <= 0) return fail(state, '販路がありません。販売本部で販路を開いてください。');
        if (!product.onSale) product.releasedWeek = draft.week;
        product.onSale = true;
        // 発売時に生産計画が0かつ在庫0の場合、工場の余力工数から初期生産計画を割り当てる
        if (product.productionPlan === 0 && product.stockUnits === 0) {
          const category = findCategory(product.categoryId);
          if (category) {
            const capacity = productionCapacityWorkload(draft);
            let used = 0;
            for (const candidate of company.products) {
              const candCat = findCategory(candidate.categoryId);
              if (candCat) used += workloadForUnits(candCat, candidate.productionPlan);
            }
            const remaining = Math.max(0, capacity - used);
            if (remaining > 0) {
              product.productionPlan = unitsFromWorkload(category, remaining);
            }
          }
        }
      } else {
        product.onSale = false;
      }
      break;
    }
    case 'openChannel': {
      const definition = findChannel(command.channelId);
      if (!definition) return fail(state, '販路の定義が見つかりません。');
      if (company.channels[definition.id] >= definition.maxUnits) {
        return fail(state, `${definition.name}はこれ以上増やせません。`);
      }
      if (company.accounts.cash < definition.openCost) {
        return fail(state, `開設費${definition.openCost}万円を払う現金がありません。`);
      }
      payCash(draft, { debit: 'sellingExpense', amount: definition.openCost, reason: `${definition.name}の開設`, flow: 'operating' });
      company.channels[definition.id] += 1;
      break;
    }
    case 'closeChannel': {
      const definition = findChannel(command.channelId);
      if (!definition) return fail(state, '販路の定義が見つかりません。');
      if (company.channels[definition.id] <= 0) return fail(state, 'その販路はありません。');
      company.channels[definition.id] -= 1;
      break;
    }
    case 'investEquipment': {
      if (!Number.isInteger(command.units) || command.units <= 0) return fail(state, '設備は1口以上で指定してください。');
      const cost = command.units * economyRules.equipmentUnitCost;
      if (company.accounts.cash < cost) return fail(state, `設備投資${cost}万円を払う現金がありません。`);
      if (company.purchasedEquipmentUnits + command.units > economyRules.maxEquipmentUnits) {
        return fail(state, `設備は合計${economyRules.maxEquipmentUnits}口までです。`);
      }
      const addedCapacity = command.units * economyRules.equipmentUnitCapacity;
      post(draft, { debit: 'equipment', credit: 'cash', amount: cost, reason: '設備投資', flow: 'investing' });
      company.equipmentCost += cost;
      company.purchasedEquipmentUnits += command.units;
      company.baseWorkloadCapacity += addedCapacity;
      break;
    }
    case 'borrow': {
      if (!Number.isInteger(command.amount) || command.amount <= 0) return fail(state, '借入額は1万円以上の整数で指定してください。');
      if (command.amount > loanLimit(draft)) return fail(state, `借入枠を超えています。上限は${loanLimit(draft)}万円です。`);
      post(draft, { debit: 'cash', credit: 'debt', amount: command.amount, reason: '借入', flow: 'financing' });
      break;
    }
    case 'repay': {
      if (!Number.isInteger(command.amount) || command.amount <= 0) return fail(state, '返済額は1万円以上の整数で指定してください。');
      if (command.amount > company.accounts.debt) return fail(state, '借入残高を超える返済はできません。');
      if (command.amount > company.accounts.cash) return fail(state, '返済に必要な現金がありません。');
      post(draft, { debit: 'debt', credit: 'cash', amount: command.amount, reason: '借入返済', flow: 'financing' });
      break;
    }
    case 'setAdvertising': {
      if (company.products.length === 0) return fail(state, '宣伝する製品がありません。まずは製品を開発してください。');
      if (command.budget < 30) return fail(state, '広告予算は30万円以上で指定してください。');
      if (company.accounts.cash < command.budget) return fail(state, `広告費${command.budget}万円を支払う現金がありません。`);
      const adYear = draft.startYear + Math.floor(draft.week / weeksPerYear);
      const definition = findAdCampaign(command.campaign);
      if (!definition) return fail(state, '広告の種類が見つかりません。');
      if (adYear < definition.availableFrom) {
        return fail(state, `${definition.name}を打てるのは${definition.availableFrom}年からです。`);
      }
      payCash(draft, { debit: 'sellingExpense', amount: command.budget, reason: `広告宣伝（${definition.name}）`, flow: 'operating' });
      const boostBasis = definition.boostBasis;
      company.advertising = {
        activeCampaign: command.campaign,
        budget: command.budget,
        boostWeeksRemaining: 4,
        boostBasis,
      };
      company.brandBasis = Math.min(10000, company.brandBasis + Math.floor(command.budget / 4));
      break;
    }
    case 'setWageLevel': {
      if (command.level < 1 || command.level > 5) return fail(state, '給与水準は1〜5の間で指定してください。');
      company.personnel.wageLevel = Math.trunc(command.level);
      break;
    }
    case 'conductTraining': {
      const cost = Math.max(30, command.cost);
      if (company.accounts.cash < cost) return fail(state, `研修費用${cost}万円を支払う現金がありません。`);
      payCash(draft, { debit: 'laborExpense', amount: cost, reason: '社員教育・品質改善研修', flow: 'operating' });
      company.personnel.morale = Math.min(100, company.personnel.morale + 10);
      company.personnel.trainingCount += 1;
      break;
    }
    case 'payBonus': {
      const total = command.amountPerEmployee * company.employees;
      if (company.accounts.cash < total) return fail(state, `賞与総額${total}万円を支払う現金がありません。`);
      payCash(draft, { debit: 'laborExpense', amount: total, reason: '決算特別賞与の支給', flow: 'operating' });
      company.personnel.morale = Math.min(100, company.personnel.morale + 20);
      break;
    }
    case 'acceptProposal': {
      const proposal = company.proposals.find(p => p.id === command.proposalId);
      if (!proposal) return fail(state, '役員提案が見つかりません。');
      if (proposal.cost > 0) {
        if (company.accounts.cash < proposal.cost) return fail(state, `提案の実行資金${proposal.cost}万円が足りません。`);
        payCash(draft, { debit: 'sellingExpense', amount: proposal.cost, reason: `役員提案の実行：${proposal.title}`, flow: 'operating' });
      }
      proposal.accepted = true;
      company.personnel.morale = Math.min(100, company.personnel.morale + 5);
      break;
    }
    case 'retireProduct': {
      const index = company.products.findIndex(p => p.id === command.productId);
      if (index < 0) return fail(state, '製品が見つかりません。');
      const product = company.products[index]!;
      product.onSale = false;
      const rank = productRank(product.totalRevenue);
      const awards: string[] = [];
      if (product.totalRevenue >= 8000) awards.push('年間ベストセラー');
      if (product.performance >= 110) awards.push('通産省グッドデザイン選定');
      const archived = company.archive.find(a => a.id === product.id);
      if (archived) {
        archived.retiredWeek = draft.week;
        archived.totalUnitsSold = product.totalUnitsSold;
        archived.totalRevenue = product.totalRevenue;
        archived.totalProfit = Math.floor(product.totalRevenue * 0.22);
        archived.rank = rank;
        archived.awards = awards;
      } else {
        company.archive.push({
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          completedWeek: product.completedWeek,
          releasedWeek: product.releasedWeek ?? draft.week,
          retiredWeek: draft.week,
          performance: product.performance,
          unitCost: product.unitCost,
          price: product.price,
          totalUnitsSold: product.totalUnitsSold,
          totalRevenue: product.totalRevenue,
          totalProfit: product.totalCogs !== undefined ? (product.totalRevenue - product.totalCogs) : Math.floor(product.totalRevenue * 0.22),
          peakShareBasis: product.lastWeekShareBasis,
          rank,
          awards,
          review: `市場を彩った${product.name}。生涯販売数${product.totalUnitsSold.toLocaleString('ja-JP')}台を記録して殿堂入り。`,
        });
      }
      company.products.splice(index, 1);
      break;
    }
    case 'minorChangeProduct': {
      const product = company.products.find(p => p.id === command.productId);
      if (!product) return fail(state, '製品が見つかりません。');
      const cost = 50;
      if (company.accounts.cash < cost) return fail(state, `改良費用${cost}万円を支払う現金がありません。`);
      payCash(draft, { debit: 'developmentExpense', amount: cost, reason: `${product.name}のマイナーチェンジ`, flow: 'operating' });
      product.releasedWeek = draft.week;
      product.performance += 2;
      break;
    }
    case 'setMonthlyReportVisible': {
      draft.settings = {
        ...(draft.settings ?? { showMonthlyBalanceSheetReport: true }),
        showMonthlyBalanceSheetReport: command.visible,
      };
      break;
    }
  }

  draft.commandSeq += 1;
  return { ok: true, state: draft };
}
