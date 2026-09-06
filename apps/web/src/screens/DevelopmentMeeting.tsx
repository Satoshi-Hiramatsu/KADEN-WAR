import { findCategory } from '../../../../packages/content/src/categories';
import { findExecutive } from '../../../../packages/content/src/executives';
import { maxSelectableFeatures, unlockedFeaturesFor } from '../../../../packages/content/src/features';
import { findMeetingCast, type MeetingCastId } from '../../../../packages/content/src/meetingCast';
import { evaluateDesign } from '../../../../packages/simulation/src/design';
import { evaluateDevelopmentMeeting, type MeetingAttendeeId, type MeetingTone } from '../../../../packages/simulation/src/meeting';
import { formatMoney, formatThousandYen } from '../../../../packages/simulation/src/money';
import type { GameState } from '../../../../packages/simulation/src/types';
import type { ExecutiveExpression } from '../assets';
import { MeetingCastPortrait, MetricGrid, Panel, Portrait, SceneBanner } from '../components/ui';
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

function AttendeeCard({ id, tone, comment }: { id: MeetingAttendeeId; tone: MeetingTone; comment: string }) {
  const isMeetingCast = id === 'design-chief' || id === 'design-associate';
  const role = isMeetingCast ? findMeetingCast(id as MeetingCastId).role : findExecutive(id).role;
  const name = isMeetingCast ? findMeetingCast(id as MeetingCastId).name : findExecutive(id).name;

  return (
    <div className={`meeting-attendee-card tone-${tone}`}>
      <div className="meeting-attendee-header">
        {isMeetingCast ? (
          <MeetingCastPortrait id={id as MeetingCastId} size={64} />
        ) : (
          <Portrait executiveId={id} expression={expressionForTone(tone)} size={64} />
        )}
        <div>
          <p className="executive-name">
            <span className="role">{role}</span> {name}
          </p>
          <p className={`meeting-tone-badge tone-${tone}`}>{toneLabel(tone)}</p>
        </div>
      </div>
      <p className="meeting-attendee-comment">「{comment}」</p>
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

  const currentYear = game.startYear + Math.floor(game.week / 48);
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

      <Panel eyebrow="01 / 出席者の反応" title="会議の様子">
        {meetingEvaluation ? (
          <div className="meeting-attendee-grid">
            {meetingEvaluation.stances.map(stance => (
              <AttendeeCard key={stance.id} id={stance.id} tone={stance.tone} comment={stance.comment} />
            ))}
          </div>
        ) : (
          <p className="warning">！ {!evaluation.ok ? evaluation.error : '設計を評価できません。'}</p>
        )}
      </Panel>

      <Panel eyebrow="02 / 付加価値項目" title="盛り込む機能を選ぶ">
        <p>
          選択中 {draft.featureIds.length} / {maxSelectableFeatures}件。
          3件までは開発期間への影響なし、それ以降は欲張るほど開発が長引きます。
        </p>
        {groups.map(group => (
          <div className="feature-group" key={group}>
            <h4>{group}</h4>
            <div className="feature-option-list">
              {features.filter(feature => feature.group === group).map(feature => {
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
                        原価{feature.unitCost >= 0 ? '+' : ''}{feature.unitCost} /
                        開発{feature.devWeeks >= 0 ? '+' : ''}{feature.devWeeks}週 /
                        先進性{feature.advancement >= 0 ? '+' : ''}{feature.advancement} /
                        目新{feature.novelty >= 0 ? '+' : ''}{feature.novelty} /
                        実用{feature.practicality >= 0 ? '+' : ''}{feature.practicality}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        {features.length === 0 ? <p>この時代・技術水準で提案できる付加価値項目はまだありません。</p> : null}
      </Panel>

      <Panel eyebrow="03 / 想定仕様" title="現時点の見込み">
        {evaluation.ok ? (
          <MetricGrid
            metrics={[
              { label: '性能', value: `${evaluation.spec.performance}` },
              { label: '消費電力', value: `${evaluation.spec.energy}`, note: '100が標準' },
              { label: '製造原価', value: formatThousandYen(evaluation.spec.unitCost) },
              { label: '開発期間', value: `${evaluation.spec.devWeeks}週` },
              { label: '開発費', value: formatMoney(evaluation.spec.devCost) },
              { label: '推奨価格', value: formatThousandYen(evaluation.spec.suggestedPrice) },
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
            参考：{category.name}の標準原価{formatThousandYen(category.baseUnitCost)}
            ／標準開発期間{category.baseDevWeeks}週。会議の結果次第で、完成品の性能には最終的にプラスマイナスの補正がかかります。
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
    </>
  );
}
