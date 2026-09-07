import { findCategory, unitsFromWorkload } from '../../../../packages/content/src/categories';
import { weeksPerYear } from '../../../../packages/content/src/rules';
import { findExecutive } from '../../../../packages/content/src/executives';
import { maxSelectableFeatures, unlockedFeaturesFor } from '../../../../packages/content/src/features';
import { findMeetingCast, type MeetingCastId } from '../../../../packages/content/src/meetingCast';
import { evaluateDesign, featureDevCostFor, featureUnitCostFor } from '../../../../packages/simulation/src/design';
import { evaluateDevelopmentMeeting, type MeetingAttendeeId, type MeetingTone } from '../../../../packages/simulation/src/meeting';
import { productionCapacityWorkload } from '../../../../packages/simulation/src/week';
import { formatMoney, formatUnitPrice, formatUnits } from '../../../../packages/simulation/src/money';
import type { GameState } from '../../../../packages/simulation/src/types';
import type { ExecutiveExpression } from '../assets';
import {
  Collapsible,
  MeetingCastPortrait,
  MetricGrid,
  Panel,
  Portrait,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
} from '../components/ui';
import { useGameStore } from '../store';

function expressionForTone(tone: MeetingTone): ExecutiveExpression {
  if (tone === 'positive') return 'positive';
  if (tone === 'objection') return 'negative';
  if (tone === 'concern') return 'focus';
  return 'normal';
}

function toneLabel(tone: MeetingTone): string {
  if (tone === 'positive') return '賛成';
  if (tone === 'objection') return '反対';
  if (tone === 'concern') return '懸念';
  return '中立';
}

/** 付加価値項目を選ぶ横で常に見えるよう、出席者1名を1行の横長カードで表示する。 */
function AttendeeRow({ id, tone, comment }: { id: MeetingAttendeeId; tone: MeetingTone; comment: string }) {
  const isMeetingCast = id === 'design-chief' || id === 'design-associate';
  const role = isMeetingCast ? findMeetingCast(id as MeetingCastId).role : findExecutive(id).role;
  const name = isMeetingCast ? findMeetingCast(id as MeetingCastId).name : findExecutive(id).name;

  return (
    <div className={`attendee-row tone-${tone}`}>
      {isMeetingCast ? (
        <MeetingCastPortrait id={id as MeetingCastId} size={44} />
      ) : (
        <Portrait executiveId={id} expression={expressionForTone(tone)} size={44} />
      )}
      <div className="attendee-row-body">
        <p className="attendee-row-name">
          <span className="role">{role}</span>
          <span>{name}</span>
          <span className={`meeting-tone-badge tone-${tone}`}>{toneLabel(tone)}</span>
        </p>
        <p className="meeting-attendee-comment">「{comment}」</p>
      </div>
    </div>
  );
}

export function DevelopmentMeeting({ game }: { game: GameState }) {
  const draft = useGameStore(store => store.developmentDraft);
  const dispatch = useGameStore(store => store.dispatch);
  const setScreen = useGameStore(store => store.setScreen);
  const clearDevelopmentDraft = useGameStore(store => store.clearDevelopmentDraft);
  const updateDevelopmentFeatureIds = useGameStore(store => store.updateDevelopmentFeatureIds);

  if (!draft) {
    return (
      <>
        <SceneBanner sceneKey="labMeeting" game={game} eyebrow="開発会議" title="開発会議" />
        <Panel eyebrow="開発会議" title="会議にかける設計がありません">
          <p>研究所で設計を作ってから「この設計で開発会議にかける」を押してください。</p>
          <button onClick={() => setScreen('lab')}>研究所へ戻る</button>
        </Panel>
      </>
    );
  }

  const currentYear = game.startYear + Math.floor(game.week / weeksPerYear);
  const owned = game.company.ownedTechIds;
  const category = findCategory(draft.categoryId);
  const features = unlockedFeaturesFor(draft.categoryId, currentYear, owned);

  const groups: string[] = [];
  for (const feature of features) if (!groups.includes(feature.group)) groups.push(feature.group);

  const evaluation = evaluateDesign({
    categoryId: draft.categoryId,
    moduleIds: draft.moduleIds,
    qualityLevel: draft.qualityLevel,
    ownedTechIds: owned,
    featureIds: draft.featureIds,
    currentYear,
  });

  const meetingEvaluation = evaluation.ok ? evaluateDevelopmentMeeting(game, evaluation.spec) : null;
  const atCap = draft.featureIds.length >= maxSelectableFeatures;

  const tally = { positive: 0, neutral: 0, concern: 0, objection: 0 };
  for (const stance of meetingEvaluation?.stances ?? []) tally[stance.tone] += 1;

  function toggleFeature(featureId: string) {
    if (!draft) return;
    const already = draft.featureIds.includes(featureId);
    if (!already && draft.featureIds.length >= maxSelectableFeatures) return;
    const next = already
      ? draft.featureIds.filter(id => id !== featureId)
      : [...draft.featureIds, featureId];
    updateDevelopmentFeatureIds(next);
  }

  function backToLab() {
    clearDevelopmentDraft();
    setScreen('lab');
  }

  function confirm(overrideObjections: boolean) {
    if (!draft) return;
    const ok = dispatch({
      type: 'startDevelopment',
      name: draft.name,
      categoryId: draft.categoryId,
      moduleIds: draft.moduleIds,
      qualityLevel: draft.qualityLevel,
      featureIds: draft.featureIds,
      overrideObjections,
    });
    if (ok) {
      clearDevelopmentDraft();
      setScreen('lab');
    }
  }

  return (
    <>
      <SceneBanner sceneKey="labMeeting" game={game} eyebrow="研究所" title="開発会議">
        <p>
          「{draft.name}」の企画を、設計・生産・販売の各統括、そして社長が図面を囲んで検討します。
          付加価値項目を選ぶたびに、各出席者の反応が変わります。
        </p>
      </SceneBanner>

      <ScreenColumns variant="side-first">
        {/* 左側は画面に貼り付けたまま、右側で機能を選ぶたびに反応と見込みが即座に変わる */}
        <ScreenColumn sticky>
          <Panel className="dev-reactions" eyebrow="01 / 出席者の反応" title="会議の様子">
            {meetingEvaluation ? (
              <>
                <p className="attendee-tally">
                  <span className="tone-positive">賛成 {tally.positive}</span>
                  <span className="tone-neutral">中立 {tally.neutral}</span>
                  <span className="tone-concern">懸念 {tally.concern}</span>
                  <span className="tone-objection">反対 {tally.objection}</span>
                </p>
                <div className="attendee-row-list">
                  {meetingEvaluation.stances.map(stance => (
                    <AttendeeRow key={stance.id} id={stance.id} tone={stance.tone} comment={stance.comment} />
                  ))}
                </div>
              </>
            ) : (
              <p className="warning">！ {!evaluation.ok ? evaluation.error : '設計を評価できません。'}</p>
            )}
          </Panel>

          <Panel className="dev-spec" eyebrow="03 / 想定仕様" title="現時点の見込み">
            {evaluation.ok ? (
              <MetricGrid
                metrics={[
                  { label: '性能', value: `${evaluation.spec.performance}` },
                  { label: '消費電力', value: `${evaluation.spec.energy}`, note: '100が標準' },
                  { label: '製造原価', value: formatUnitPrice(evaluation.spec.unitCost) },
                  { label: '開発期間', value: `${evaluation.spec.devWeeks}週` },
                  { label: '開発費', value: formatMoney(evaluation.spec.devCost) },
                  { label: '推奨価格', value: formatUnitPrice(evaluation.spec.suggestedPrice) },
                  { label: '先進性', value: `${evaluation.spec.advancement}` },
                  { label: '目新しさ', value: `${evaluation.spec.novelty}` },
                  { label: '実用性', value: `${evaluation.spec.practicality}` },
                ]}
              />
            ) : (
              <p className="warning">！ {evaluation.error}</p>
            )}
            {category ? (
              <small>
                参考：{category.name}の標準原価{formatUnitPrice(category.baseUnitCost)}
                ／標準開発期間{category.baseDevWeeks}週／100台あたり{category.workloadPer100Units}工数
                （いまの工場なら週{formatUnits(unitsFromWorkload(category, productionCapacityWorkload(game)))}台まで）。
                会議の結果次第で、完成品の性能には最終的にプラスマイナスの補正がかかります。
              </small>
            ) : null}
          </Panel>

          <div className="actions meeting-decision-actions">
            <button className="secondary" onClick={backToLab}>設計に戻る（見直す）</button>
            {meetingEvaluation?.blocking ? (
              <button className="danger" onClick={() => confirm(true)} disabled={!evaluation.ok}>
                反対を押し切って開発を始める（社長決裁・士気低下あり）
              </button>
            ) : (
              <button onClick={() => confirm(false)} disabled={!evaluation.ok}>
                この内容で開発を始める
              </button>
            )}
          </div>
        </ScreenColumn>

        <ScreenColumn>
          <Panel className="dev-features" eyebrow="02 / 付加価値項目" title="盛り込む機能を選ぶ">
            <p className="feature-cap-note">
              選択中 <strong>{draft.featureIds.length} / {maxSelectableFeatures}</strong>件。
              3件までは開発期間への影響なし、それ以降は欲張るほど開発が長引きます。
            </p>
            {groups.map(group => {
              const groupFeatures = features.filter(feature => feature.group === group);
              const selectedInGroup = groupFeatures.filter(feature => draft.featureIds.includes(feature.id)).length;
              return (
                <Collapsible
                  key={group}
                  className="feature-group"
                  title={
                    <>
                      {group}
                      <span className="feature-group-count">
                        {selectedInGroup > 0 ? `選択${selectedInGroup}件 / ` : ''}全{groupFeatures.length}件
                      </span>
                    </>
                  }
                >
                  <div className="feature-option-list">
                    {groupFeatures.map(feature => {
                      const checked = draft.featureIds.includes(feature.id);
                      const disabled = !checked && atCap;
                      return (
                        <label className={disabled ? 'feature-option disabled' : 'feature-option'} key={feature.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleFeature(feature.id)}
                          />
                          <span className="feature-option-body">
                            <span className="feature-option-name">{feature.name}</span>
                            <small className="feature-option-desc">{feature.description}</small>
                            <small className="feature-option-stats">
                              性能{feature.performance >= 0 ? '+' : ''}{feature.performance} /
                              原価{featureUnitCostFor(draft.categoryId, feature) >= 0 ? '+' : ''}
                              {formatUnitPrice(featureUnitCostFor(draft.categoryId, feature))} /
                              開発{feature.devWeeks >= 0 ? '+' : ''}{feature.devWeeks}週
                              （{formatMoney(featureDevCostFor(draft.categoryId, feature))}） /
                              先進性{feature.advancement >= 0 ? '+' : ''}{feature.advancement} /
                              目新{feature.novelty >= 0 ? '+' : ''}{feature.novelty} /
                              実用{feature.practicality >= 0 ? '+' : ''}{feature.practicality}
                            </small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Collapsible>
              );
            })}
            {features.length === 0 ? <p>この時代・技術水準で提案できる付加価値項目はまだありません。</p> : null}
          </Panel>
        </ScreenColumn>
      </ScreenColumns>
    </>
  );
}
