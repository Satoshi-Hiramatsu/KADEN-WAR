import { findExecutive } from '../../../../packages/content/src/executives';
import { formatMoney } from '../../../../packages/simulation/src/money';
import { departmentReports } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import { Portrait, Panel, SceneBanner } from '../components/ui';
import { IconMeeting, IconCheck } from '../components/icons';
import { useGameStore, type ScreenId } from '../store';

export function Meeting({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const setScreen = useGameStore(store => store.setScreen);
  const proposals = game.company.proposals ?? [];
  const reports = departmentReports(game);
  const president = reports.find(r => r.executiveId === 'president');

  const executiveOrder: ('design' | 'sales' | 'production' | 'finance' | 'personnel')[] = [
    'design', 'sales', 'production', 'finance', 'personnel'
  ];

  return (
    <>
      <SceneBanner sceneKey="meeting" game={game} eyebrow="定例役員会議" title="定例 役員経営会議">
        <div className="meeting-header">
          <div className="meeting-lead">
            <IconMeeting size={24} />
            <p>
              各部門の統括が一堂に会し、今期の重要施策を具申します。
              社長は各役員の提案を吟味し、採択または各部門への指示を行ってください。
            </p>
          </div>
          {president ? (
            <div className="meeting-president-card">
              <Portrait executiveId="president" game={game} size={80} />
              <div>
                <p className="executive-name">
                  <span className="role">{president.role}</span> {president.name}
                </p>
                <p className="meeting-speech">
                  「諸君、今期の業績目標達成に向けて、各部門の最善策を忌憚なく述べてほしい。」
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </SceneBanner>

      <Panel eyebrow="役員からの具申" title="今月の戦略提案（プロポーザル）">
        {proposals.length === 0 ? (
          <p>現在検討中の提案はありません。各部門画面で直接指示を下してください。</p>
        ) : (
          <div className="proposals-grid">
            {executiveOrder.map(execId => {
              const execDef = findExecutive(execId);
              const proposal = proposals.find(p => p.executiveId === execId);
              const report = reports.find(r => r.executiveId === execId);
              const expression = proposal?.accepted ? 'positive' : 'focus';

              return (
                <div key={execId} className={proposal?.accepted ? 'proposal-card accepted' : 'proposal-card'}>
                  <div className="proposal-header">
                    <Portrait executiveId={execId} expression={expression} size={64} />
                    <div>
                      <p className="executive-name">
                        <span className="role">{execDef.role}</span> {execDef.name}
                      </p>
                      <p className="headline-text">{report?.headline}</p>
                    </div>
                  </div>

                  {proposal ? (
                    <div className="proposal-body">
                      <h4>{proposal.title}</h4>
                      <p className="proposal-desc">{proposal.description}</p>
                      <dl className="proposal-specs">
                        <div>
                          <dt>所要資金</dt>
                          <dd>{proposal.cost > 0 ? formatMoney(proposal.cost) : '0円（即時着手）'}</dd>
                        </div>
                        <div>
                          <dt>期待効果</dt>
                          <dd>{proposal.expectedEffect}</dd>
                        </div>
                      </dl>

                      <div className="proposal-actions">
                        {proposal.accepted ? (
                          <span className="badge-accepted">
                            <IconCheck size={16} /> 採択済み
                          </span>
                        ) : (
                          <button
                            onClick={() => dispatch({ type: 'acceptProposal', proposalId: proposal.id })}
                            disabled={proposal.cost > game.company.accounts.cash}
                          >
                            この提案を採択する
                          </button>
                        )}
                        <button
                          className="secondary"
                          onClick={() => setScreen(execDef.screenId as ScreenId)}
                        >
                          {execDef.role.replace('統括', '')}へ直接指示
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="proposal-body empty">
                      <p>特段の議案はありません。通常業務を継続しています。</p>
                      <button
                        className="secondary"
                        onClick={() => setScreen(execDef.screenId as ScreenId)}
                      >
                        {execDef.role.replace('統括', '')}へ行く
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
