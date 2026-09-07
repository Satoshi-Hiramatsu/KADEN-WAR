import { useEffect, useRef, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { economyRules } from '../../../packages/content/src/rules';
import { formatBrand, formatMoney } from '../../../packages/simulation/src/money';
import { currentDate, goalProgress, scenarioProgress } from '../../../packages/simulation/src/selectors';
import type { GameState } from '../../../packages/simulation/src/types';
import { DevelopmentMeeting } from './screens/DevelopmentMeeting';
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
import './layout.css';

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

const defaultNav = { id: 'office' as ScreenId, label: '社長室', role: '経営者', icon: IconOffice };

function StickyHeader({
  game,
  screen,
  onSelectScreen,
  onQuit,
}: {
  game: GameState;
  screen: ScreenId;
  onSelectScreen: (id: ScreenId) => void;
  onQuit: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const advance = useGameStore(store => store.advance);
  const progress = scenarioProgress(game);
  const playing = game.status === 'playing';
  const morale = Math.round(game.company.personnel?.morale ?? 75);

  const currentNav = navigation.find(n => n.id === screen) ?? defaultNav;
  const CurrentIcon = currentNav.icon;

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty('--sticky-header-height', `${el.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobileMenuOpen]);

  const handleScreenChange = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="game-sticky-header" ref={headerRef}>
      <div className="topbar">
        <div className="topbar-info">
          <p className="company">{game.company.name}</p>
          <p className="date" aria-live="polite">{currentDate(game)}</p>
        </div>

        {/* PC向け全メトリクス表示 */}
        <dl className="topbar-metrics">
          <div className="topbar-metric-cash"><dt>現金</dt><dd>{formatMoney(game.company.accounts.cash)}</dd></div>
          <div><dt>ブランド</dt><dd>{formatBrand(game.company.brandBasis)}</dd></div>
          <div><dt>社員士気</dt><dd>{morale}点</dd></div>
          <div><dt>累計売上</dt><dd>{formatMoney(game.totals.revenue)}</dd></div>
          <div><dt>累計利益</dt><dd>{formatMoney(game.totals.profit)}</dd></div>
          <div><dt>残り</dt><dd>{progress.weeksRemaining}週</dd></div>
        </dl>

        {/* PC向け週送りボタン */}
        <div className="actions topbar-actions-desktop">
          <button disabled={!playing} onClick={() => advance(1)}>1週進める</button>
          <button disabled={!playing} onClick={() => advance(4)}>1か月進める（月次実行）</button>
        </div>

        {/* スマホ向けコンパクト操作部（現金、1週進める、拠点折りたたみトグルボタン） */}
        <div className="topbar-mobile-controls">
          <span className="topbar-mobile-cash" title="現在の現金">
            {formatMoney(game.company.accounts.cash)}
          </span>
          <button
            type="button"
            className="topbar-mobile-advance"
            disabled={!playing}
            onClick={() => advance(1)}
            title="1週進める"
          >
            1週
          </button>
          <button
            type="button"
            className={mobileMenuOpen ? 'topbar-mobile-toggle active' : 'topbar-mobile-toggle'}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label="拠点メニューを開閉"
          >
            <CurrentIcon size={16} />
            <span className="current-screen-name">{currentNav.label}</span>
            <span className="toggle-chevron" aria-hidden="true">{mobileMenuOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* PC向け常時表示ナビゲーション */}
      <nav className="nav-desktop" aria-label="拠点">
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={screen === item.id ? 'nav active' : 'nav'}
              aria-current={screen === item.id ? 'page' : undefined}
              onClick={() => handleScreenChange(item.id)}
            >
              <span className="nav-title-line">
                <Icon size={16} />
                <span>{item.label}</span>
              </span>
              <small>{item.role}</small>
            </button>
          );
        })}
        <button className="nav quit" onClick={onQuit}>やめる</button>
      </nav>

      {/* スマホ向け折りたたみパネル */}
      {mobileMenuOpen && (
        <div id="mobile-nav-panel" className="mobile-nav-panel">
          <div className="mobile-panel-header">
            <span className="mobile-panel-title">拠点移動・全社詳細情報</span>
            <button
              type="button"
              className="mobile-panel-close link"
              onClick={() => setMobileMenuOpen(false)}
            >
              閉じる ✕
            </button>
          </div>

          {/* スマホ展開時の詳細メトリクス & 月送りボタン */}
          <div className="mobile-panel-metrics">
            <dl className="mobile-metrics-grid">
              <div><dt>現金</dt><dd>{formatMoney(game.company.accounts.cash)}</dd></div>
              <div><dt>ブランド</dt><dd>{formatBrand(game.company.brandBasis)}</dd></div>
              <div><dt>社員士気</dt><dd>{morale}点</dd></div>
              <div><dt>累計売上</dt><dd>{formatMoney(game.totals.revenue)}</dd></div>
              <div><dt>累計利益</dt><dd>{formatMoney(game.totals.profit)}</dd></div>
              <div><dt>残り</dt><dd>{progress.weeksRemaining}週</dd></div>
            </dl>
            <div className="mobile-panel-actions">
              <button disabled={!playing} onClick={() => { advance(4); setMobileMenuOpen(false); }}>
                1か月進める（月次実行）
              </button>
            </div>
          </div>

          <div className="mobile-panel-grid">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = screen === item.id;
              return (
                <button
                  key={item.id}
                  className={isActive ? 'mobile-panel-btn active' : 'mobile-panel-btn'}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleScreenChange(item.id)}
                >
                  <span className="mobile-panel-btn-title">
                    <Icon size={16} />
                    <strong>{item.label}</strong>
                  </span>
                  <small>{item.role}</small>
                </button>
              );
            })}
            <button
              className="mobile-panel-btn quit"
              onClick={() => {
                setMobileMenuOpen(false);
                onQuit();
              }}
            >
              <span className="mobile-panel-btn-title">
                <strong>タイトルへ戻る</strong>
              </span>
              <small>（中断・セーブなし）</small>
            </button>
          </div>
        </div>
      )}
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

  // 拠点を移ったときは必ず画面の先頭から読み始められるようにする。
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  if (!game) return <Title />;

  return (
    <main>
      <header>
        <span>KADEN WAR — 家電戦争</span>
        <p>経営指令本部</p>
      </header>
      <StickyHeader
        game={game}
        screen={screen}
        onSelectScreen={setScreen}
        onQuit={quit}
      />
      <Notice />
      <FundsDialog game={game} />
      {game.status !== 'playing' ? <Result game={game} /> : null}
      {screen === 'office' ? <Office game={game} /> : null}
      {screen === 'meeting' ? <Meeting game={game} /> : null}
      {screen === 'lab' ? <Lab game={game} /> : null}
      {screen === 'developmentMeeting' ? <DevelopmentMeeting game={game} /> : null}
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
