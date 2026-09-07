import { useState } from 'react';
import { formatMoney } from '../../../../packages/simulation/src/money';
import { departmentReports } from '../../../../packages/simulation/src/selectors';
import { weeklyLaborCost } from '../../../../packages/simulation/src/week';
import type { GameState } from '../../../../packages/simulation/src/types';
import {
  ExecutiveHeader,
  MetricGrid,
  NumberField,
  Panel,
  ProgressBar,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
} from '../components/ui';
import { useGameStore } from '../store';

export function Personnel({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(r => r.executiveId === 'personnel');
  const personnel = game.company.personnel ?? { morale: 75, wageLevel: 3, trainingCount: 0 };
  const employees = game.company.employees;
  const [bonusAmount, setBonusAmount] = useState(5);

  const wageLabels = [
    '1: 徹底抑制（人件費を最小限に抑えるが士気低下）',
    '2: やや抑制（コスト重視・士気微減）',
    '3: 業界標準（標準的な給与水準）',
    '4: 優遇（手厚い待遇で士気が向上）',
    '5: 最高待遇（優秀な人材が集まり士気が最高潮）',
  ];

  return (
    <>
      <SceneBanner sceneKey="personnel" game={game} eyebrow="人事部" title="組織・給与・士気マネジメント">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
        <MetricGrid
          metrics={[
            { label: '社員数', value: `${employees}名` },
            { label: '週あたり人件費', value: formatMoney(weeklyLaborCost(game)) },
            { label: '社員士気（モラル）', value: `${Math.round(personnel.morale)}点 / 100点` },
            { label: '教育研修回数', value: `${personnel.trainingCount}回` },
          ]}
        />
      </SceneBanner>

      <ScreenColumns variant="even">
        <ScreenColumn>
          <Panel eyebrow="01 / 社員の士気" title="モラルと現場の一体感">
            <p>
              士気が高いと工場の不良率が低減し、新製品の開発速度や販売現場の熱意が向上します。
              逆に士気が低下すると作業ミスや不良品が多発し、著しく低下するとサボタージュの危機が生じます。
            </p>
            <div className="morale-gauge">
              <ProgressBar ratio={personnel.morale / 100} achieved={personnel.morale >= 80} />
              <p className="morale-status">
                現在の状態：
                {personnel.morale >= 85 ? (
                  <strong className="done">「全員が一丸となって社業に熱中しています！」（品質・開発ボーナス発生中）</strong>
                ) : personnel.morale >= 60 ? (
                  <span>「標準的な勤労意欲を維持しています。」</span>
                ) : personnel.morale >= 40 ? (
                  <strong className="warning">「給与や待遇への不満が燻っています。不良率が上昇傾向です。」</strong>
                ) : (
                  <strong className="warning">「危機的状態です！現場の士気が崩壊寸前で、生産に支障が出ています！」</strong>
                )}
              </p>
            </div>
          </Panel>

          <Panel eyebrow="02 / 給与水準" title="基本給の改定">
            <p>基本給水準を改定します。高い水準ほど毎週の士気を押し上げますが、固定人件費が増加します。</p>
            <div className="field">
              <span>給与水準</span>
              <select
                value={personnel.wageLevel}
                onChange={e => dispatch({ type: 'setWageLevel', level: Number(e.target.value) })}
              >
                {wageLabels.map((label, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          <Panel eyebrow="03 / 人材育成" title="全社品質研修（QCサークル）">
            <p>
              現場の工員や技術者を集め、品質改善・技術研修を実施します。
              1回50万円で士気が10点向上し、製造不良率が恒久的に低下します。
            </p>
            <div className="actions">
              <button
                onClick={() => dispatch({ type: 'conductTraining', cost: 50 })}
                disabled={game.company.accounts.cash < 50}
              >
                研修を実施する（費用 50万円）
              </button>
            </div>
          </Panel>

          <Panel eyebrow="04 / 決算賞与" title="特別賞与の一斉支給">
            <p>
              好業績時に全社員へ決算賞与を支給します。
              社員1人あたりの金額を設定してください。士気が一気に20点向上します。
            </p>
            <div className="field">
              <NumberField
                label="1人あたり支給額"
                value={bonusAmount}
                min={1}
                max={30}
                suffix="万円/人"
                onCommit={setBonusAmount}
              />
              <small>所要総額：{formatMoney(bonusAmount * employees)}</small>
            </div>
            <div className="actions">
              <button
                onClick={() => dispatch({ type: 'payBonus', amountPerEmployee: bonusAmount })}
                disabled={game.company.accounts.cash < bonusAmount * employees}
              >
                特別賞与を支給する（総額 {formatMoney(bonusAmount * employees)}）
              </button>
            </div>
          </Panel>
        </ScreenColumn>
      </ScreenColumns>
    </>
  );
}
