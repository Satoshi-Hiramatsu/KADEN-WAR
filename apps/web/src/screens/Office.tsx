import { scenarioOf } from '../../../../packages/simulation/src/setup';
import {
  departmentReports,
  goalProgress,
  weeklyFixedCostBreakdown,
} from '../../../../packages/simulation/src/selectors';
import { formatMoney } from '../../../../packages/simulation/src/money';
import type { GameState } from '../../../../packages/simulation/src/types';
import { ExecutiveHeader, MetricGrid, Panel, ProgressBar } from '../components/ui';
import { useGameStore } from '../store';

export function Office({ game }: { game: GameState }) {
  const setScreen = useGameStore(store => store.setScreen);
  const reports = departmentReports(game);
  const goals = goalProgress(game);
  const scenario = scenarioOf(game);
  const president = reports.find(report => report.executiveId === 'president');
  const others = reports.filter(report => report.executiveId !== 'president');
  const week = game.lastWeek;

  return (
    <>
      <Panel eyebrow="社長室" title={`${scenario.name}：目標の進み具合`}>
        {president ? <ExecutiveHeader report={president} /> : null}
        <ul className="goals">
          {goals.map(goal => (
            <li key={goal.label}>
              <p>
                <strong>{goal.label}</strong>
                <span>{goal.current} / {goal.target}</span>
                {goal.achieved ? <em className="done">達成</em> : null}
              </p>
              <ProgressBar ratio={goal.ratio} achieved={goal.achieved} />
            </li>
          ))}
        </ul>
        <small>期限は{scenario.subtitle}。3つすべてを満たすと成功、資金不足が続くと敗北です。</small>
      </Panel>

      <Panel eyebrow="先週の結果" title="週次サマリ">
        {week ? (
          <MetricGrid
            metrics={[
              { label: '生産', value: `${week.unitsProduced}台`, note: `不良${week.defectUnits}台` },
              { label: '販売', value: `${week.unitsSold}台` },
              { label: '売上', value: formatMoney(week.revenue) },
              { label: '週次損益', value: formatMoney(week.netIncome) },
            ]}
          />
        ) : (
          <p>まだ週を進めていません。各部門で方針を決めてから週を進めてください。</p>
        )}
        <MetricGrid metrics={weeklyFixedCostBreakdown(game)} />
      </Panel>

      <Panel eyebrow="部門報告" title="担当からの報告">
        <div className="reports">
          {others.map(report => (
            <article key={report.executiveId}>
              <ExecutiveHeader report={report} />
              <MetricGrid metrics={report.metrics} />
              {report.executiveId === 'design' ? (
                <button className="secondary" onClick={() => setScreen('lab')}>研究所へ</button>
              ) : null}
              {report.executiveId === 'sales' ? (
                <button className="secondary" onClick={() => setScreen('sales')}>販売本部へ</button>
              ) : null}
              {report.executiveId === 'finance' ? (
                <button className="secondary" onClick={() => setScreen('finance')}>経理部へ</button>
              ) : null}
              {report.executiveId === 'production' ? (
                <button className="secondary" onClick={() => setScreen('factory')}>工場へ</button>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="記録" title="できごと">
        <ul className="log">
          {[...game.log].slice(-12).reverse().map(entry => (
            <li key={`${entry.seq}`} className={entry.kind}>
              <span>{entry.week + 1}週</span> {entry.message}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
