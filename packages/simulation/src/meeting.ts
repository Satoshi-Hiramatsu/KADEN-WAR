import { findCategory } from '../../content/src/categories';
import { unlockedFeaturesFor, type FeatureOption } from '../../content/src/features';
import type { DesignSpec } from './design';
import { productionCapacityUnits } from './week';
import type { GameState } from './types';

/** 開発会議の出席者。設計課長・設計係長は既存 executives.ts の統括陣とは別の脇役。 */
export type MeetingAttendeeId = 'design-chief' | 'design-associate' | 'production' | 'sales' | 'president';
export type MeetingTone = 'positive' | 'neutral' | 'concern' | 'objection';

export type MeetingStance = {
  id: MeetingAttendeeId;
  tone: MeetingTone;
  comment: string;
};

export type MeetingEvaluation = {
  stances: MeetingStance[];
  /** 明確な反対（objection）が1件でもある。押し切るか設計を見直す必要がある。 */
  blocking: boolean;
  verdict: 'approved' | 'concern' | 'blocked';
};

function pickFeature(
  candidates: readonly FeatureOption[],
  sortKey: (feature: FeatureOption) => number,
  excludeIds: readonly string[],
): FeatureOption | undefined {
  return candidates
    .filter(feature => !excludeIds.includes(feature.id))
    .slice()
    .sort((a, b) => sortKey(b) - sortKey(a))[0];
}

const designAmbitionHigh = 30;
const designAmbitionLow = 12;

/**
 * 現在の設計案に対する各出席者の反応を求める純関数。
 * 乱数を使わず、選んだ付加価値項目の集計値（DesignSpec）だけから決まるため、
 * 会議画面で項目を切り替えるたびにそのまま再計算してよい。
 */
export function evaluateDevelopmentMeeting(state: GameState, spec: DesignSpec): MeetingEvaluation {
  const category = findCategory(spec.categoryId);
  const year = state.startYear + Math.floor(state.week / 48);
  const unlocked = category ? unlockedFeaturesFor(category.id, year, state.company.ownedTechIds) : [];
  const stances: MeetingStance[] = [];

  // 設計課長：先進性を重視し、常に前向きな姿勢を崩さない。
  if (spec.advancement >= designAmbitionHigh) {
    stances.push({
      id: 'design-chief',
      tone: 'positive',
      comment: `先進性${spec.advancement}は申し分ありません。この内容なら胸を張って世に出せます。`,
    });
  } else {
    const suggestion = pickFeature(unlocked, feature => feature.advancement, spec.featureIds);
    stances.push({
      id: 'design-chief',
      tone: spec.advancement >= designAmbitionLow ? 'neutral' : 'concern',
      comment: suggestion
        ? `もう一段、野心を見せたいところです。「${suggestion.name}」を足せば先進性が上がります。`
        : 'まずまずの内容ですが、もう少し踏み込みたいですね。',
    });
  }

  // 設計係長：目新しさを重視し、こちらも反対はしない。
  if (spec.novelty >= designAmbitionHigh) {
    stances.push({
      id: 'design-associate',
      tone: 'positive',
      comment: `これは話題になります。目新しさ${spec.novelty}、他社にない切り口です。`,
    });
  } else {
    const suggestion = pickFeature(unlocked, feature => feature.novelty, spec.featureIds);
    stances.push({
      id: 'design-associate',
      tone: spec.novelty >= designAmbitionLow ? 'neutral' : 'concern',
      comment: suggestion
        ? `正直、まだ驚きが足りません。「${suggestion.name}」あたりで目新しさを出しましょう。`
        : 'このままでは代わり映えしない製品に見えてしまいます。',
    });
  }

  // 生産統括：原価・開発期間・生産能力への現実的な懸念。
  if (category) {
    const costRatio = spec.unitCost / category.baseUnitCost;
    const weeksRatio = spec.devWeeks / category.baseDevWeeks;
    const capacity = productionCapacityUnits(state);
    if (costRatio >= 1.9 || weeksRatio >= 2.2) {
      stances.push({
        id: 'production',
        tone: 'objection',
        comment: `原価${spec.unitCost}千円・開発${spec.devWeeks}週は工場が持ちません。機能を絞るか品質投資を見直してください。`,
      });
    } else if (costRatio >= 1.5 || weeksRatio >= 1.6) {
      stances.push({
        id: 'production',
        tone: 'concern',
        comment: '盛り込みすぎです。原価と開発期間が膨らんでおり、量産初期の歩留まりが心配です。',
      });
    } else {
      stances.push({
        id: 'production',
        tone: 'positive',
        comment: `原価${spec.unitCost}千円なら現在の生産能力（週${capacity}台）で無理なく回せます。`,
      });
    }
  }

  // 販売統括：実用性・価格妥当性から市場での売れ行きを主張。
  if (category) {
    const priceRatio = spec.suggestedPrice / category.referencePrice;
    const wantedFeature = pickFeature(unlocked, feature => feature.practicality, spec.featureIds);
    const weakestSelected = spec.featureIds
      .map(id => unlocked.find(feature => feature.id === id))
      .filter((feature): feature is FeatureOption => feature !== undefined)
      .sort((a, b) => (a.practicality - a.unitCost) - (b.practicality - b.unitCost))[0];

    if (spec.practicality < 10 && priceRatio >= 1.4) {
      stances.push({
        id: 'sales',
        tone: 'objection',
        comment: weakestSelected
          ? `実用性が伴わないまま価格だけ上がっています。「${weakestSelected.name}」は正直不要です。これでは売れません。`
          : '実用性が足りないうえ価格も高すぎます。このままでは店頭で選ばれません。',
      });
    } else if (spec.practicality < 18 || priceRatio >= 1.25) {
      stances.push({
        id: 'sales',
        tone: 'concern',
        comment: wantedFeature
          ? `お客様は日々の使い勝手を見ています。「${wantedFeature.name}」があると店頭で説明しやすいのですが。`
          : '価格に見合う分かりやすい実用性がもう一声欲しいところです。',
      });
    } else {
      stances.push({
        id: 'sales',
        tone: 'positive',
        comment: `実用性${spec.practicality}、価格も市場相場並みです。これなら自信を持って売り歩けます。`,
      });
    }
  }

  const blocking = stances.some(stance => stance.tone === 'objection');
  const hasConcern = stances.some(stance => stance.tone === 'concern');

  let verdict: MeetingEvaluation['verdict'];
  let presidentComment: string;
  if (blocking) {
    verdict = 'blocked';
    presidentComment = '現場から明確な反対が出ている。このまま押し通すなら、私が責任を持つ覚悟が要る。';
  } else if (hasConcern) {
    verdict = 'concern';
    presidentComment = '懸念はあるが、決められないことはない。よく検討した上で判断してほしい。';
  } else {
    verdict = 'approved';
    presidentComment = 'よかろう。この内容で進めたまえ。';
  }
  stances.push({
    id: 'president',
    tone: blocking ? 'objection' : hasConcern ? 'concern' : 'positive',
    comment: presidentComment,
  });

  return { stances, blocking, verdict };
}
