import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { economyRules } from '../../../packages/content/src/rules';
import { formatBrand, formatMoney } from '../../../packages/simulation/src/money';
import { currentDate, goalProgress, scenarioProgress } from '../../../packages/simulation/src/selectors';
import type { GameState } from '../../../packages/simulation/src/types';
import { Factory } from './screens/Factory';
import { Finance } from './screens/Finance';
import { Lab } from './screens/Lab';
import { Office } from './screens/Office';
import { SalesOffice } from './screens/SalesOffice';
import { Meeting } from './screens/Meeting';
import { Personnel } from './screens/Personnel';
import { Archive } from './screens/Archive';
import { Title } from './screens/Title';
import {
  IconOffice,
  IconMeeting,
  IconLab,
  IconFactory,
  IconSales,
  IconFinance,
  IconPersonnel,
  IconArchive,
} from './components/icons';
import { useGameStore, type ScreenId } from './store';
import './style.css';

const navigation: { id: ScreenId; label: string; role: string; icon: typeof IconOffice }[] = [
  { id: 'office', label: '社長室', role: '経営者', icon: IconOffice },
  { id: 'meeting', label: '役員会議', role: '経営会議', icon: IconMeeting },
  { id: 'lab', label: '研究所', role: '設計統括', icon: IconLab },
  { id: 'factory', label: '工場', role: '生産統括', icon: IconFactory },
  { id: 'sales', label: '販売本部', role: '販売統括', icon: IconSales },
  { id: 'finance', label: '経理部', role: '経理統括', icon: IconFinance },
  { id: 'personnel', label: '人事部', role: '人事統括', icon: IconPersonnel },
  { id: 'archive', label: '名機図鑑', role: '社史殿堂', icon: IconArchive },
];

function TopBar({ game }: { game: GameState }) {
  const advance = useGameStore(store => store.advance);
  const progress = scenarioProgress(game);
  const playing = game.status === 'playing';
  const morale = Math.round(game.company.personnel?.morale ?? 75);

  return (
    <div className="topbar">
      <div>
        <p className="company">{game.company.name}</p>
        <p className="date" aria-live="polite">{currentDate(game)}</p>
      </div>
      <dl className="topbar-metrics">
        <div><dt>現金</dt><dd>{formatMoney(game.company.accounts.cash)}</dd></div>
        <div><dt>ブランド</dt><dd>{formatBrand(game.company.brandBasis)}</dd></div>
        <div><dt>社員士気</dt><dd>{morale}点</dd></div>
        <div><dt>累計売上</dt><dd>{formatMoney(game.totals.revenue)}</dd></div>
        <div><dt>累計利益</dt><dd>{formatMoney(game.totals.profit)}</dd></div>
        <div><dt>残り</dt><dd>{progress.weeksRemaining}週</dd></div>
      </dl>
      <div className="actions">
        <button disabled={!playing} onClick={() => advance(1)}>1週進める</button>
        <button disabled={!playing} onClick={() => advance(4)}>1か月進める（月次実行）</button>
      </div>
    </div>
  );
}

function Notice() {
  const notice = useGameStore(store => store.notice);
  const dismiss = useGameStore(store => store.dismissNotice);
  if (!notice) return null;
  return (
    <p className={notice.kind === 'error' ? 'notice error' : 'notice'} role="status">
      {notice.text}
      <button className="link" onClick={dismiss}>閉じる</button>
    </p>
  );
}

function FundsDialog({ game }: { game: GameState }) {
  const prompt = useGameStore(store => store.fundsPrompt);
  const advance = useGameStore(store => store.advance);
  const setScreen = useGameStore(store => store.setScreen);
  const dismiss = useGameStore(store => store.dismissFundsPrompt);
  if (!prompt) return null;
  const remaining = economyRules.maxGraceWeeks - game.company.graceWeeks;
  return (
    <div className="funds" role="alertdialog" aria-label="資金不足">
      <h2>資金不足です</h2>
      <p>
        今週の必須支払いは{formatMoney(prompt.required)}ですが、現金は{formatMoney(prompt.cash)}しかありません。
        借入や支出の見直しをしてから、同じ週をやり直せます。
      </p>
      <p>
        このまま進めると不足分は未払金になり、猶予を1週使います。
        {economyRules.maxGraceWeeks}週続くと敗北します（残り{remaining}週）。
      </p>
      <div className="actions">
        <button onClick={() => { dismiss(); setScreen('finance'); }}>経理部で資金を手当てする</button>
        <button className="secondary" onClick={() => advance(Math.max(1, prompt.weeks), true)}>
          資金不足のまま進める
        </button>
        <button className="link" onClick={dismiss}>閉じる</button>
      </div>
    </div>
  );
}

function Result({ game }: { game: GameState }) {
  const quit = useGameStore(store => store.quitToTitle);
  const goals = goalProgress(game);
  return (
    <section className={game.status === 'won' ? 'result won' : 'result lost'}>
      <p className="eyebrow">結果</p>
      <h2>{game.status === 'won' ? '目標を達成しました！' : '目標を達成できませんでした'}</h2>
      <p>{game.outcome}</p>
      <ul className="goals">
        {goals.map(goal => (
          <li key={goal.label}>
            <p>
              <strong>{goal.label}</strong>
              <span>{goal.current} / {goal.target}</span>
              {goal.achieved ? <em className="done">達成</em> : <em className="warning">未達</em>}
            </p>
          </li>
        ))}
      </ul>
      <button onClick={quit}>タイトルへ戻る</button>
    </section>
  );
}

function App() {
  const game = useGameStore(store => store.game);
  const screen = useGameStore(store => store.screen);
  const setScreen = useGameStore(store => store.setScreen);
  const quit = useGameStore(store => store.quitToTitle);

  if (!game) return <Title />;

  return (
    <main>
      <header>
        <span>KADEN WAR — 家電戦争</span>
        <p>経営指令本部</p>
      </header>
      <TopBar game={game} />
      <nav aria-label="担当">
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={screen === item.id ? 'nav active' : 'nav'}
              aria-current={screen === item.id ? 'page' : undefined}
              onClick={() => setScreen(item.id)}
            >
              <span className="nav-title-line">
                <Icon size={16} />
                <span>{item.label}</span>
              </span>
              <small>{item.role}</small>
            </button>
          );
        })}
        <button className="nav quit" onClick={quit}>やめる</button>
      </nav>
      <Notice />
      <FundsDialog game={game} />
      {game.status !== 'playing' ? <Result game={game} /> : null}
      {screen === 'office' ? <Office game={game} /> : null}
      {screen === 'meeting' ? <Meeting game={game} /> : null}
      {screen === 'lab' ? <Lab game={game} /> : null}
      {screen === 'factory' ? <Factory game={game} /> : null}
      {screen === 'sales' ? <SalesOffice game={game} /> : null}
      {screen === 'finance' ? <Finance game={game} /> : null}
      {screen === 'personnel' ? <Personnel game={game} /> : null}
      {screen === 'archive' ? <Archive game={game} /> : null}
      <footer>
        月初の役員会議で方針を決定し、週送り・月送りで研究・開発・生産・販売・決算を進めます。
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
