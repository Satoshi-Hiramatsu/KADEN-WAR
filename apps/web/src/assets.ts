import type { ExecutiveId } from '../../../packages/content/src/executives';
import type { MeetingCastId } from '../../../packages/content/src/meetingCast';
import type { GameState } from '../../../packages/simulation/src/types';

// ==========================================
// 1. ポートレート（役員・NPC）
// ==========================================
import presidentNormal from '../../../assets/portraits/president-normal-v1.png';
import presidentSmile from '../../../assets/portraits/president-smile-v1.png';
import presidentCrisis from '../../../assets/portraits/president-crisis-v1.png';
import presidentSpeaking from '../../../assets/portraits/president-speaking-v1.png';

import designNormal from '../../../assets/portraits/design-normal-v1.png';
import designEureka from '../../../assets/portraits/design-eureka-v1.png';
import designTrouble from '../../../assets/portraits/design-trouble-v1.png';
import designPride from '../../../assets/portraits/design-pride-v1.png';

import salesNormal from '../../../assets/portraits/sales-normal-v1.png';
import salesVictory from '../../../assets/portraits/sales-victory-v1.png';
import salesSweat from '../../../assets/portraits/sales-sweat-v1.png';
import salesPassion from '../../../assets/portraits/sales-passion-v1.png';

import financeNormal from '../../../assets/portraits/finance-normal-v1.png';
import financeRelief from '../../../assets/portraits/finance-relief-v1.png';
import financeWarning from '../../../assets/portraits/finance-warning-v1.png';
import financeCalculating from '../../../assets/portraits/finance-calculating-v1.png';

import productionNormal from '../../../assets/portraits/production-normal-v1.png';
import productionProud from '../../../assets/portraits/production-proud-v1.png';
import productionAngry from '../../../assets/portraits/production-angry-v1.png';
import productionSerious from '../../../assets/portraits/production-serious-v1.png';

import personnelNormal from '../../../assets/portraits/personnel-normal-v1.png';
import personnelDelighted from '../../../assets/portraits/personnel-delighted-v1.png';
import personnelWorried from '../../../assets/portraits/personnel-worried-v1.png';
import personnelMotivate from '../../../assets/portraits/personnel-motivate-v1.png';

import designChiefNormal from '../../../assets/portraits/design-chief-normal-v1.png';
import designAssociateNormal from '../../../assets/portraits/design-associate-normal-v1.png';

import npcBanker from '../../../assets/portraits/npc-banker-v1.png';
import npcJournalist from '../../../assets/portraits/npc-journalist-v1.png';
import npcShopkeeper from '../../../assets/portraits/npc-shopkeeper-v1.png';

// ==========================================
// 2. ライバル社長
// ==========================================
import rivalHinodeNormal from '../../../assets/rivals/rival-hinode-normal-v1.png';
import rivalHinodeSmug from '../../../assets/rivals/rival-hinode-smug-v1.png';
import rivalHinodeDefeated from '../../../assets/rivals/rival-hinode-defeated-v1.png';

import rivalKowaNormal from '../../../assets/rivals/rival-kowa-normal-v1.png';
import rivalKowaSmug from '../../../assets/rivals/rival-kowa-smug-v1.png';
import rivalKowaDefeated from '../../../assets/rivals/rival-kowa-defeated-v1.png';

import rivalMineNormal from '../../../assets/rivals/rival-mine-normal-v1.png';
import rivalMineSmile from '../../../assets/rivals/rival-mine-smile-v1.png';
import rivalMineTroubled from '../../../assets/rivals/rival-mine-troubled-v1.png';

// ==========================================
// 3. 背景シーン
// ==========================================
import sceneOfficeDay from '../../../assets/scenes/scene-office-day-v1.png';
import sceneOfficeNight from '../../../assets/scenes/scene-office-night-v1.png';
import sceneOfficeCrisis from '../../../assets/scenes/scene-office-crisis-v1.png';

import sceneBoardroomNormal from '../../../assets/scenes/scene-boardroom-normal-v1.png';
import sceneBoardroomHeated from '../../../assets/scenes/scene-boardroom-heated-v1.png';
import sceneBoardroomVictory from '../../../assets/scenes/scene-boardroom-victory-v1.png';

import sceneLabWorkshop from '../../../assets/scenes/scene-lab-workshop-v1.png';
import sceneLabBreakthrough from '../../../assets/scenes/scene-lab-breakthrough-v1.png';
import sceneLabModern from '../../../assets/scenes/scene-lab-modern-v1.png';
import sceneLabMeeting from '../../../assets/scenes/scene-lab-meeting-v1.png';

import sceneFactoryEarly from '../../../assets/scenes/scene-factory-early-v1.png';
import sceneFactoryNight from '../../../assets/scenes/scene-factory-night-v1.png';
import sceneFactoryTrouble from '../../../assets/scenes/scene-factory-trouble-v1.png';
import sceneFactoryModern from '../../../assets/scenes/scene-factory-modern-v1.png';

import sceneMarketShop from '../../../assets/scenes/scene-market-shop-v1.png';
import sceneMarketAkiba from '../../../assets/scenes/scene-market-akiba-v1.png';
import sceneMarketMass from '../../../assets/scenes/scene-market-mass-v1.png';

import sceneNewsPaper from '../../../assets/scenes/scene-news-paper-v1.png';
import sceneEventBoom from '../../../assets/scenes/scene-event-boom-v1.png';
import sceneEventRecession from '../../../assets/scenes/scene-event-recession-v1.png';
import sceneEventLaunch from '../../../assets/scenes/scene-event-launch-v1.png';
import sceneEventExpo from '../../../assets/scenes/scene-event-expo-v1.png';

// ==========================================
// 4. 家電製品スプライト
// ==========================================
import tv1960BlackWhite from '../../../assets/products/tv-1960-blackwhite-v1.png';
import tv1970ColorConsole from '../../../assets/products/tv-1970-color-console-v1.png';
import tv1980CrtHifi from '../../../assets/products/tv-1980-crt-hifi-v1.png';
import tv2000FlatLcd from '../../../assets/products/tv-2000-flat-lcd-v1.png';

import wash1960Wringer from '../../../assets/products/wash-1960-wringer-v1.png';
import wash1970Twintub from '../../../assets/products/wash-1970-twintub-v1.png';
import wash1980Automatic from '../../../assets/products/wash-1980-automatic-v1.png';
import wash2000Drum from '../../../assets/products/wash-2000-drum-v1.png';

import refr19601Door from '../../../assets/products/refr-1960-1door-v1.png';
import refr19702Door from '../../../assets/products/refr-1970-2door-v1.png';
import refr19803Door from '../../../assets/products/refr-1980-3door-v1.png';
import refr2000French from '../../../assets/products/refr-2000-french-v1.png';

import audio1960TransistorRadio from '../../../assets/products/audio-1960-transistor-radio-v1.png';
import audio1970Boombox from '../../../assets/products/audio-1970-boombox-v1.png';
import audio1980Minicompo from '../../../assets/products/audio-1980-minicompo-v1.png';
import audio1980Walkman from '../../../assets/products/audio-1980-walkman-v1.png';
import audio1990PortableCd from '../../../assets/products/audio-1990-portable-cd-v1.png';

import air1970WindowAc from '../../../assets/products/air-1970-window-ac-v1.png';
import cook1970Microwave from '../../../assets/products/cook-1970-microwave-v1.png';
import cook1980Ricecooker from '../../../assets/products/cook-1980-ricecooker-v1.png';
import clean1970Vacuum from '../../../assets/products/clean-1970-vacuum-v1.png';
import clean2010Robot from '../../../assets/products/clean-2010-robot-v1.png';

import pc19808BitHobby from '../../../assets/products/pc-1980-8bit-hobby-v1.png';
import pc199016BitDesktop from '../../../assets/products/pc-1990-16bit-desktop-v1.png';
import pc1990Laptop from '../../../assets/products/pc-1990-laptop-v1.png';

import mob1990Cellular from '../../../assets/products/mob-1990-cellular-v1.png';
import mob2000FlipPhone from '../../../assets/products/mob-2000-flip-phone-v1.png';
import mob2010Smartphone from '../../../assets/products/mob-2010-smartphone-v1.png';

import vtr1970Topload from '../../../assets/products/vtr-1970-topload-v1.png';
import vtr1980HifiDeck from '../../../assets/products/vtr-1980-hifi-deck-v1.png';

// ==========================================
// 役員ポートレート判定
// ==========================================
export type ExecutiveExpression = 'normal' | 'positive' | 'negative' | 'focus';

export function getExecutivePortraitUrl(
  executiveId: ExecutiveId,
  expression: ExecutiveExpression = 'normal'
): string {
  switch (executiveId) {
    case 'president':
      if (expression === 'positive') return presidentSmile;
      if (expression === 'negative') return presidentCrisis;
      if (expression === 'focus') return presidentSpeaking;
      return presidentNormal;

    case 'design':
      if (expression === 'positive') return designEureka;
      if (expression === 'negative') return designTrouble;
      if (expression === 'focus') return designPride;
      return designNormal;

    case 'sales':
      if (expression === 'positive') return salesVictory;
      if (expression === 'negative') return salesSweat;
      if (expression === 'focus') return salesPassion;
      return salesNormal;

    case 'finance':
      if (expression === 'positive') return financeRelief;
      if (expression === 'negative') return financeWarning;
      if (expression === 'focus') return financeCalculating;
      return financeNormal;

    case 'production':
      if (expression === 'positive') return productionProud;
      if (expression === 'negative') return productionAngry;
      if (expression === 'focus') return productionSerious;
      return productionNormal;

    case 'personnel':
      if (expression === 'positive') return personnelDelighted;
      if (expression === 'negative') return personnelWorried;
      if (expression === 'focus') return personnelMotivate;
      return personnelNormal;

    default:
      return presidentNormal;
  }
}

/**
 * 会社の経営状態（資金・士気・業績）から役員の適切な表情を自動判定する
 */
export function getContextualPortrait(executiveId: ExecutiveId, game: GameState): string {
  const isCashCritical = game.company.accounts.cash <= 200;
  const isDistressed = game.company.graceWeeks > 0;
  const morale = game.company.personnel?.morale ?? 75;
  const lastWeek = game.lastWeek;

  switch (executiveId) {
    case 'president':
      if (isDistressed || isCashCritical) return presidentCrisis;
      if (lastWeek && lastWeek.netIncome > 50) return presidentSmile;
      return presidentNormal;

    case 'design':
      if (game.company.projects.length > 0) return designEureka;
      return designNormal;

    case 'sales':
      if (lastWeek && lastWeek.unitsSold > 100) return salesVictory;
      if (lastWeek && lastWeek.unitsSold === 0 && game.company.products.length > 0) return salesSweat;
      return salesNormal;

    case 'finance':
      if (isDistressed || isCashCritical) return financeWarning;
      if (game.company.accounts.cash > 1000) return financeRelief;
      return financeNormal;

    case 'production':
      if (lastWeek && lastWeek.defectUnits > 20) return productionAngry;
      if (lastWeek && lastWeek.unitsProduced > 100) return productionProud;
      return productionNormal;

    case 'personnel':
      if (morale >= 85) return personnelDelighted;
      if (morale < 60) return personnelWorried;
      return personnelNormal;

    default:
      return getExecutivePortraitUrl(executiveId, 'normal');
  }
}

// ==========================================
// 開発会議メンバー（設計課長・設計係長）ポートレート
// ==========================================
export function getMeetingCastPortraitUrl(id: MeetingCastId): string {
  switch (id) {
    case 'design-chief':
      return designChiefNormal;
    case 'design-associate':
      return designAssociateNormal;
  }
}

// ==========================================
// NPCポートレート
// ==========================================
export type NpcId = 'banker' | 'journalist' | 'shopkeeper';

export function getNpcPortraitUrl(npcId: NpcId): string {
  switch (npcId) {
    case 'banker':
      return npcBanker;
    case 'journalist':
      return npcJournalist;
    case 'shopkeeper':
      return npcShopkeeper;
  }
}

// ==========================================
// ライバル社長ポートレート
// ==========================================
export type RivalSentiment = 'normal' | 'smug' | 'defeated';

export function getRivalPortraitUrl(rivalId: string, sentiment: RivalSentiment = 'normal'): string {
  const normalized = rivalId.toLowerCase();
  if (normalized.includes('hinode') || normalized.includes('dainichi') || normalized.includes('大日')) {
    if (sentiment === 'smug') return rivalHinodeSmug;
    if (sentiment === 'defeated') return rivalHinodeDefeated;
    return rivalHinodeNormal;
  }
  if (normalized.includes('kowa') || normalized.includes('toyo') || normalized.includes('東洋')) {
    if (sentiment === 'smug') return rivalKowaSmug;
    if (sentiment === 'defeated') return rivalKowaDefeated;
    return rivalKowaNormal;
  }
  // 明星電機（mine）
  if (sentiment === 'smug') return rivalMineSmile;
  if (sentiment === 'defeated') return rivalMineTroubled;
  return rivalMineNormal;
}

// ==========================================
// 背景シーン
// ==========================================
export type SceneKey =
  | 'office'
  | 'meeting'
  | 'lab'
  | 'labMeeting'
  | 'factory'
  | 'sales'
  | 'finance'
  | 'personnel'
  | 'archive'
  | 'newspaper'
  | 'boom'
  | 'recession'
  | 'launch'
  | 'expo';

export function getSceneBackgroundUrl(sceneKey: SceneKey, game?: GameState): string {
  const isCashCritical = game ? (game.company.accounts.cash <= 200 || game.company.graceWeeks > 0) : false;
  const currentYear = game ? game.startYear + Math.floor(game.week / 48) : 1960;

  switch (sceneKey) {
    case 'office':
      if (isCashCritical) return sceneOfficeCrisis;
      // 48週の年末（決算時期）は夜景
      if (game && (game.week % 48 >= 44 || game.week % 48 === 0)) return sceneOfficeNight;
      return sceneOfficeDay;

    case 'meeting':
      if (isCashCritical) return sceneBoardroomHeated;
      // 提案が採択されて順調なら
      if (game && game.company.proposals?.some(p => p.accepted)) return sceneBoardroomVictory;
      return sceneBoardroomNormal;

    case 'lab':
      if (game && game.company.projects.length > 0) return sceneLabBreakthrough;
      if (currentYear >= 1990) return sceneLabModern;
      return sceneLabWorkshop;

    case 'labMeeting':
      return sceneLabMeeting;

    case 'factory':
      if (game && (game.lastWeek?.defectUnits ?? 0) > 15) return sceneFactoryTrouble;
      if (game && (game.lastWeek?.unitsProduced ?? 0) > 150) return sceneFactoryNight;
      if (currentYear >= 1990) return sceneFactoryModern;
      return sceneFactoryEarly;

    case 'sales':
      if (currentYear >= 1980) return sceneMarketMass;
      if (game && (game.company.channels.direct ?? 0) > 0) return sceneMarketAkiba;
      if (game && (game.company.channels.affiliate ?? 0) > 0) return sceneMarketShop;
      return sceneMarketShop;

    case 'finance':
      return sceneOfficeNight;

    case 'personnel':
      return sceneFactoryEarly;

    case 'archive':
      return sceneEventExpo;

    case 'newspaper':
      return sceneNewsPaper;

    case 'boom':
      return sceneEventBoom;

    case 'recession':
      return sceneEventRecession;

    case 'launch':
      return sceneEventLaunch;

    case 'expo':
      return sceneEventExpo;

    default:
      return sceneOfficeDay;
  }
}

// ==========================================
// 家電製品スプライト判定
// ==========================================
export function getProductSpriteUrl(categoryId: string, year: number = 1960): string {
  const cat = categoryId.toLowerCase();

  // テレビ
  if (cat === 'television' || cat === 'tv') {
    if (year >= 2000) return tv2000FlatLcd;
    if (year >= 1980) return tv1980CrtHifi;
    if (year >= 1970) return tv1970ColorConsole;
    return tv1960BlackWhite;
  }

  // 洗濯機
  if (cat === 'washer' || cat === 'washing') {
    if (year >= 2000) return wash2000Drum;
    if (year >= 1980) return wash1980Automatic;
    if (year >= 1970) return wash1970Twintub;
    return wash1960Wringer;
  }

  // 冷蔵庫
  if (cat === 'refrigerator' || cat === 'fridge' || cat === 'refr') {
    if (year >= 2000) return refr2000French;
    if (year >= 1980) return refr19803Door;
    if (year >= 1970) return refr19702Door;
    return refr19601Door;
  }

  // オーディオ・ラジオ
  if (cat.includes('audio') || cat.includes('radio') || cat.includes('sound')) {
    if (year >= 1990) return audio1990PortableCd;
    if (year >= 1985) return audio1980Walkman;
    if (year >= 1980) return audio1980Minicompo;
    if (year >= 1970) return audio1970Boombox;
    return audio1960TransistorRadio;
  }

  // エアコン
  if (cat.includes('air') || cat.includes('cooler')) {
    return air1970WindowAc;
  }

  // 調理家電（レンジ・炊飯器）
  if (cat.includes('cook') || cat.includes('microwave') || cat.includes('rice')) {
    if (year >= 1980) return cook1980Ricecooker;
    return cook1970Microwave;
  }

  // 掃除機
  if (cat.includes('clean') || cat.includes('vacuum') || cat.includes('robot')) {
    if (year >= 2005) return clean2010Robot;
    return clean1970Vacuum;
  }

  // パソコン
  if (cat.includes('pc') || cat.includes('computer')) {
    if (year >= 1995) return pc1990Laptop;
    if (year >= 1990) return pc199016BitDesktop;
    return pc19808BitHobby;
  }

  // 携帯電話
  if (cat.includes('mobile') || cat.includes('phone')) {
    if (year >= 2010) return mob2010Smartphone;
    if (year >= 2000) return mob2000FlipPhone;
    return mob1990Cellular;
  }

  // VTRビデオデッキ
  if (cat.includes('vtr') || cat.includes('video')) {
    if (year >= 1980) return vtr1980HifiDeck;
    return vtr1970Topload;
  }

  return tv1960BlackWhite;
}
