import { channels, findChannel, type ChannelId } from '../../content/src/channels';
import { economyRules } from '../../content/src/rules';
import { findResearchTheme } from '../../content/src/technology';
import { evaluateDesign } from './design';
import { payCash, post } from './ledger';
import { productionCapacityUnits } from './week';
import type { CommandResult, DevelopmentProject, GameState, Money } from './types';

export type Command =
  | { type: 'setResearchTheme'; themeId: string | null }
  | { type: 'setResearchBudget'; amount: Money }
  | { type: 'startDevelopment'; name: string; categoryId: string; moduleIds: readonly string[]; qualityLevel: number }
  | { type: 'cancelDevelopment'; projectId: string }
  | { type: 'setPrice'; productId: string; price: number }
  | { type: 'setProductionPlan'; productId: string; units: number }
  | { type: 'setOnSale'; productId: string; onSale: boolean }
  | { type: 'openChannel'; channelId: ChannelId }
  | { type: 'closeChannel'; channelId: ChannelId }
  | { type: 'investEquipment'; units: number }
  | { type: 'borrow'; amount: Money }
  | { type: 'repay'; amount: Money };

export function loanLimit(state: GameState): Money {
  const capital = state.company.accounts.capital;
  return Math.max(0, capital * economyRules.loanLimitMultiplier - state.company.accounts.debt);
}

function fail(state: GameState, error: string): CommandResult {
  return { ok: false, error, state };
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
      const evaluation = evaluateDesign({
        categoryId: command.categoryId,
        moduleIds: command.moduleIds,
        qualityLevel: command.qualityLevel,
        ownedTechIds: company.ownedTechIds,
      });
      if (!evaluation.ok) return fail(state, evaluation.error);
      const spec = evaluation.spec;
      const firstInstallment = Math.ceil(spec.devCost / spec.devWeeks);
      if (company.accounts.cash < firstInstallment) {
        return fail(state, `開発の初回費用${firstInstallment}万円を払う現金がありません。`);
      }
      const project: DevelopmentProject = {
        id: `project-${draft.commandSeq + 1}`,
        name,
        categoryId: spec.categoryId,
        moduleIds: spec.moduleIds,
        qualityLevel: spec.qualityLevel,
        performance: spec.performance,
        energy: spec.energy,
        unitCost: spec.unitCost,
        devWeeks: spec.devWeeks,
        devCost: spec.devCost,
        paidCost: 0,
        startedWeek: draft.week,
        remainingWeeks: spec.devWeeks,
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
      if (!Number.isInteger(command.price) || command.price <= 0) return fail(state, '価格は1以上の整数（千円）で指定してください。');
      if (command.price > 10000) return fail(state, '価格が上限を超えています。');
      product.price = command.price;
      break;
    }
    case 'setProductionPlan': {
      const product = company.products.find(candidate => candidate.id === command.productId);
      if (!product) return fail(state, '製品が見つかりません。');
      if (!Number.isInteger(command.units) || command.units < 0) return fail(state, '生産量は0以上の整数で指定してください。');
      const capacity = productionCapacityUnits(draft);
      let planned = 0;
      for (const candidate of company.products) {
        planned += candidate.id === product.id ? command.units : candidate.productionPlan;
      }
      if (planned > capacity) return fail(state, `週の生産能力${capacity}台を超えています。`);
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
      company.baseCapacityUnits += addedCapacity;
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
  }

  draft.commandSeq += 1;
  return { ok: true, state: draft };
}
