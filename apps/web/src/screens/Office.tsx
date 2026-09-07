import { scenarioOf } from '../../../../packages/simulation/src/setup';
import {
  departmentReports,
  goalProgress,
  weeklyFixedCostBreakdown,
} from '../../../../packages/simulation/src/selectors';
import { formatMoney } from '../../../../packages/simulation/src/money';
import type { GameState } from '../../../../packages/simulation/src/types';
import {
  ExecutiveHeader,
  MetricGrid,
  Panel,
  ProgressBar,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
  NpcPortrait,
  RivalPortrait,
} from '../components/ui';
import { IconMeeting, IconNews, IconArchive } from '../components/icons';
import { getSceneBackgroundUrl } from '../assets';
import { useGameStore } from '../store';

export function Office({ game }: { game: GameState }) {
  const setScreen = useGameStore(store => store.setScreen);
  const reports = departmentReports(game);
  const goals = goalProgress(game);
  const scenario = scenarioOf(game);
  const president = reports.find(report => report.executiveId === 'president');
  const others = reports.filter(report => report.executiveId !== 'president');
  const week = game.lastWeek;
  const news = game.company.newsFeed ?? [];
  const rivalActions = game.company.rivalActions ?? [];
  const unacceptedCount = (game.company.proposals ?? []).filter(p => !p.accepted).length;

  return (
    <>
      <SceneBanner sceneKey="office" game={game} eyebrow="最高司令部" title={`${scenario.name}：社長室`}>
        {president ? <ExecutiveHeader report={president} game={game} /> : null}

        <div className="command-banner">
          <div className="meeting-prompt">
            <IconMeeting size={28} />
            <div>
              <strong>定例役員会議</strong>
              <p>各部門統括から{unacceptedCount > 0 ? `${unacceptedCount}件の戦略提案が届いています` : '今期の報告があります'}。</p>
            </div>
            <button onClick={() => setScreen('meeting')}>役員会議を開く</button>
          </div>
          <button className="secondary" onClick={() => setScreen('archive')}>
            <IconArchive size={16} /> 歴代名機図鑑を見る
          </button>
        </div>
      </SceneBanner>

      <ScreenColumns>
        <ScreenColumn>
          <Panel eyebrow="全社経営目標" title="シナリオ勝利条件">
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

          <Panel eyebrow="部門報告" title="各担当からの報告">
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
                  {report.executiveId === 'personnel' ? (
                    <button className="secondary" onClick={() => setScreen('personnel')}>人事部へ</button>
                  ) : null}
                </article>
              ))}
            </div>
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          {news.length > 0 ? (
            <Panel eyebrow="電化時報" title="業界ニュース・時代速報">
              <div className="npc-callout">
                <NpcPortrait npcId="journalist" size={44} />
                <p>
                  <strong>経済通商新聞・家電担当記者</strong>：「業界の最新動向を速報でお伝えします。市場トレンドや競合の布石を見極めてください。」
                </p>
              </div>
              <div className="news-board">
                {news.slice(0, 2).map(item => {
                  const sceneType = item.id.includes('boom') || item.id.includes('shingi') ? 'boom'
                    : item.id.includes('recession') || item.id.includes('cost') ? 'recession'
                    : item.id.includes('expo') ? 'expo'
                    : 'newspaper';
                  const imgUrl = getSceneBackgroundUrl(sceneType, game);
                  return (
                    <article key={item.id} className="news-card">
                      <div className="news-card-hero">
                        <img src={imgUrl} alt="" className="news-image-thumb" />
                        <div>
                          <div className="news-header">
                            <span className="news-tag"><IconNews size={14} /> 号外</span>
                            <h4>{item.title}</h4>
                            <span className="news-impact">{item.impactText}</span>
                          </div>
                          <p className="news-lead">{item.headline}</p>
                          <p className="news-body">{item.body}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Panel>
          ) : null}

          {rivalActions.length > 0 ? (
            <Panel eyebrow="競合情報" title="ライバル企業の最新動向">
              <div className="rival-actions-list">
                {rivalActions.slice(0, 3).map(action => (
                  <div key={action.id} className="rival-action-item">
                    <RivalPortrait rivalId={action.rivalId} size={48} />
                    <div className="product-cell-info">
                      <span className="rival-name">{action.rivalName}</span>
                      <span className="action-text">{action.actionText}</span>
                    </div>
                    <small className="action-week">{action.week + 1}週</small>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel eyebrow="記録" title="できごと">
            <ul className="log">
              {[...game.log].slice(-12).reverse().map(entry => (
                <li key={`${entry.seq}`} className={entry.kind}>
                  <span>{entry.week + 1}週</span> {entry.message}
                </li>
              ))}
            </ul>
          </Panel>
        </ScreenColumn>
      </ScreenColumns>
    </>
  );
}
