import { useEffect, useRef, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { findCategory } from '../../../packages/content/src/categories';
import { findFeature } from '../../../packages/content/src/features';
import { economyRules } from '../../../packages/content/src/rules';
import { formatBasisAsPercent, formatBrand, formatMoney, formatUnitPrice } from '../../../packages/simulation/src/money';
import {
  currentDate,
  getActiveAlerts,
  goalProgress,
  monthlyMetrics,
  scenarioProgress,
  weeklyMetrics,
} from '../../../packages/simulation/src/selectors';
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
import { Reports } from './screens/Reports';
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
  IconReport,
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
  { id: 'reports', label: '経営報告', role: '資料室', icon: IconReport },
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
  const wMetrics = weeklyMetrics(game);
  const mMetrics = monthlyMetrics(game);

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

        {/* PC向け全メトリクス表示（週次・月次の売上高・粗利を常時表示） */}
        <dl className="topbar-metrics">
          <div className="topbar-metric-cash"><dt>現金</dt><dd>{formatMoney(game.company.accounts.cash)}</dd></div>
          <div className="topbar-metric-highlight">
            <dt>週次売上 / 粗利</dt>
            <dd>{formatMoney(wMetrics.revenue)} <small className="metric-profit">（粗利 {formatMoney(wMetrics.grossProfit)}）</small></dd>
          </div>
          <div className="topbar-metric-highlight">
            <dt>月次売上 / 粗利</dt>
            <dd>{formatMoney(mMetrics.revenue)} <small className="metric-profit">（粗利 {formatMoney(mMetrics.grossProfit)}）</small></dd>
          </div>
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

      {/* 重大注意・事前警告アラート（赤文字バナー） */}
      {(() => {
        const activeAlerts = getActiveAlerts(game);
        if (activeAlerts.length === 0) return null;
        return (
          <div className="system-alerts-container" role="alert" aria-live="assertive">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`system-alert-banner alert-${alert.level}`}>
                <div className="alert-content">
                  <span className="alert-icon" aria-hidden="true">
                    {alert.level === 'critical' ? '🚨' : '⚠️'}
                  </span>
                  <div className="alert-text">
                    <strong className="alert-title">{alert.title}</strong>
                    <span className="alert-message">{alert.message}</span>
                  </div>
                </div>
                {alert.actionScreen ? (
                  <button
                    type="button"
                    className="alert-action-btn"
                    onClick={() => handleScreenChange(alert.actionScreen!)}
                  >
                    {alert.actionLabel ?? '詳細へ'} ➔
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        );
      })()}

      {game.company.projects.length > 0 ? (
        <div className="dev-progress-banner" role="status">
          <span className="dev-progress-label">新製品開発中</span>
          <ul className="dev-progress-list">
            {game.company.projects.map(project => (
              <li key={project.id}>
                <strong>{project.name}</strong>
                <span>残り{project.remainingWeeks}週</span>
              </li>
            ))}
          </ul>
          <button type="button" className="link dev-progress-link" onClick={() => handleScreenChange('lab')}>
            研究所へ
          </button>
        </div>
      ) : null}

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
              <div><dt>週次売上</dt><dd>{formatMoney(wMetrics.revenue)}</dd></div>
              <div><dt>週次粗利</dt><dd>{formatMoney(wMetrics.grossProfit)}</dd></div>
              <div><dt>月次売上</dt><dd>{formatMoney(mMetrics.revenue)}</dd></div>
              <div><dt>月次粗利</dt><dd>{formatMoney(mMetrics.grossProfit)}</dd></div>
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

function CompletionNotice() {
  const products = useGameStore(store => store.completionNotice);
  const dismiss = useGameStore(store => store.dismissCompletionNotice);
  const setScreen = useGameStore(store => store.setScreen);
  if (!products || products.length === 0) return null;
  return (
    <div className="completion-notice" role="alertdialog" aria-label="開発完了">
      <h2>開発完了：新製品が完成しました！</h2>
      {products.map(product => {
        const category = findCategory(product.categoryId);
        const features = product.featureIds
          .map(id => findFeature(id))
          .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature));
        return (
          <div key={product.id} className="completion-product">
            <h3>
              {product.name}
              <small>（{category?.name ?? product.categoryId}）</small>
            </h3>
            <dl className="completion-spec">
              <div><dt>性能</dt><dd>{product.performance}</dd></div>
              <div><dt>消費電力指数</dt><dd>{product.energy}</dd></div>
              <div><dt>製造原価</dt><dd>{formatUnitPrice(product.unitCost)}</dd></div>
              <div><dt>参考販売価格</dt><dd>{formatUnitPrice(product.price)}</dd></div>
              <div><dt>先進性 / 目新しさ / 実用性</dt><dd>{product.advancement} / {product.novelty} / {product.practicality}</dd></div>
            </dl>
            {features.length > 0 ? (
              <>
                <p className="completion-features-label">搭載した付加価値項目</p>
                <ul className="completion-features">
                  {features.map(feature => <li key={feature.id}>{feature.name}</li>)}
                </ul>
              </>
            ) : null}
          </div>
        );
      })}
      <p>工場で生産量を、販売本部で価格と発売を決めてください。</p>
      <div className="actions">
        <button onClick={() => { dismiss(); setScreen('factory'); }}>工場で生産を計画する</button>
        <button className="secondary" onClick={() => { dismiss(); setScreen('sales'); }}>販売本部で発売準備する</button>
        <button className="link" onClick={dismiss}>閉じる</button>
      </div>
    </div>
  );
}

function MonthlyReportModal({ game }: { game: GameState }) {
  const summary = useGameStore(store => store.monthlyReportModal);
  const dismiss = useGameStore(store => store.dismissMonthlyReportModal);
  const setScreen = useGameStore(store => store.setScreen);
  const setMonthlyReportVisible = useGameStore(store => store.setMonthlyReportVisible);

  if (!summary) return null;

  const bs = summary.balanceSheet;
  const isAutoShow = game.settings?.showMonthlyBalanceSheetReport !== false;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="月次決算報告">
      <div className="modal-content report-modal">
        <div className="report-modal-header">
          <div className="report-modal-badge">月次決算報告書</div>
          <h2>{summary.label} 月次決算・貸借対照表（B/S）</h2>
          <p className="report-modal-desc">
            4週間の事業活動を締めました。当月の資産・負債・純資産および損益計算をご報告いたします。
          </p>
        </div>

        <div className="report-modal-body">
          {bs ? (
            <div className="modal-section">
              <h3>貸借対照表（バランスシート B/S）</h3>
              <table className="bs-grid-table">
                <thead>
                  <tr>
                    <th colSpan={2}>【資産の部】</th>
                    <th colSpan={2}>【負債の部】</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>手元現金</td><td>{formatMoney(bs.cash)}</td>
                    <td>借入金</td><td>{formatMoney(bs.debt)}</td>
                  </tr>
                  <tr>
                    <td>商品在庫</td><td>{formatMoney(bs.inventory)}</td>
                    <td>未払金</td><td>{formatMoney(bs.payable)}</td>
                  </tr>
                  <tr>
                    <td>生産設備</td><td>{formatMoney(bs.equipment)}</td>
                    <th scope="row">負債合計</th><th>{formatMoney(bs.liabilities)}</th>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <th colSpan={2}>【純資産の部】</th>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td>資本金</td><td>{formatMoney(bs.capital)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td>利益剰余金</td><td>{formatMoney(bs.retainedEarnings)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td>当期純利益</td><td>{formatMoney(bs.currentIncome)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <th scope="row">純資産合計</th><th>{formatMoney(bs.equity)}</th>
                  </tr>
                  <tr className="summary-row">
                    <th>資産合計</th><th>{formatMoney(bs.assets)}</th>
                    <th>負債・純資産計</th><th>{formatMoney(bs.liabilities + bs.equity)}</th>
                  </tr>
                </tbody>
              </table>
              <p className={bs.difference === 0 ? 'bs-check done' : 'bs-check warn'}>
                {bs.difference === 0 ? '✓ 貸借一致（資産 ＝ 負債 ＋ 純資産）' : `⚠️ 貸借不一致: ${formatMoney(bs.difference)}`}
              </p>
            </div>
          ) : null}

          <div className="modal-section">
            <h3>損益計算（P/L）と月間経費の概要</h3>
            <table className="modal-pl-table">
              <tbody>
                <tr><th>売上高</th><td>{formatMoney(summary.totals.revenue)}</td></tr>
                <tr><th>売上原価</th><td>{formatMoney(summary.totals.cogs)}</td></tr>
                <tr className="highlight-row"><th>売上総利益（粗利）</th><td><strong>{formatMoney(summary.totals.revenue - summary.totals.cogs)}</strong></td></tr>
                {summary.expenseBreakdown ? (
                  <>
                    <tr><th>人件費</th><td>{formatMoney(summary.expenseBreakdown.labor)}</td></tr>
                    <tr><th>販売・広告費</th><td>{formatMoney(summary.expenseBreakdown.selling)}</td></tr>
                    <tr><th>研究開発費</th><td>{formatMoney(summary.expenseBreakdown.research + summary.expenseBreakdown.development)}</td></tr>
                    <tr><th>減価償却費</th><td>{formatMoney(summary.expenseBreakdown.depreciation)}</td></tr>
                    <tr><th>支払利息</th><td>{formatMoney(summary.expenseBreakdown.interest)}</td></tr>
                  </>
                ) : null}
                <tr className="summary-row"><th>当期純損益</th><th>{formatMoney(summary.netIncome)}</th></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-modal-footer">
          <label className="toggle-setting-label">
            <input
              type="checkbox"
              checked={isAutoShow}
              onChange={e => setMonthlyReportVisible(e.target.checked)}
            />
            <span>次回以降の月次B/S報告を自動表示する（オフにするとログ通知のみになり、経営報告室でいつでも確認可能）</span>
          </label>
          <div className="actions">
            <button onClick={dismiss}>了解して業務を進める</button>
            <button className="secondary" onClick={() => { dismiss(); setScreen('reports'); }}>
              経営報告室で詳細を精査
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function YearlyReportModal() {
  const summary = useGameStore(store => store.yearlyReportModal);
  const dismiss = useGameStore(store => store.dismissYearlyReportModal);
  const setScreen = useGameStore(store => store.setScreen);

  if (!summary) return null;

  const ratios = summary.financialRatios;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="年次決算報告">
      <div className="modal-content report-modal yearly-modal">
        <div className="report-modal-header">
          <div className="report-modal-badge gold">年次総決算</div>
          <h2>{summary.label} 年次決算報告書（B/S・P/L・経営判断指標）</h2>
          <p className="report-modal-desc">
            1年間の営業期間を満了し、年次総決算を迎えました。貸借対照表・P/Lおよび経営判断材料をご報告いたします。
          </p>
        </div>

        {summary.reviewComment ? (
          <div className="npc-callout annual-review-callout">
            <div>
              <strong>経理統括・財務責任者 決算総括所見</strong>
              <p className="annual-review-text">「{summary.reviewComment}」</p>
            </div>
          </div>
        ) : null}

        {ratios ? (
          <div className="modal-section">
            <h3>重要経営判断指標（財務分析レシオ）</h3>
            <div className="ratios-grid">
              <div className="ratio-card">
                <span className="ratio-label">売上高総利益率（粗利率）</span>
                <strong className="ratio-value">{formatBasisAsPercent(ratios.grossMarginBasis)}</strong>
                <small>製品付加価値</small>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">売上高営業利益率</span>
                <strong className="ratio-value">{formatBasisAsPercent(ratios.operatingMarginBasis)}</strong>
                <small>本業の稼ぐ力</small>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">自己資本比率</span>
                <strong className="ratio-value">{formatBasisAsPercent(ratios.equityRatioBasis)}</strong>
                <small>財務健全性</small>
              </div>
              <div className="ratio-card">
                <span className="ratio-label">手元流動性</span>
                <strong className="ratio-value">{ratios.currentLiquidityMonths}か月分</strong>
                <small>手元現金の余裕度</small>
              </div>
            </div>
          </div>
        ) : null}

        <div className="report-modal-body">
          <div className="modal-section">
            <h3>損益実績（年間P/L）</h3>
            <table className="modal-pl-table">
              <tbody>
                <tr><th>年間売上高</th><td>{formatMoney(summary.totals.revenue)}</td></tr>
                <tr><th>売上原価</th><td>{formatMoney(summary.totals.cogs)}</td></tr>
                <tr className="highlight-row"><th>売上総利益（粗利）</th><td><strong>{formatMoney(summary.totals.revenue - summary.totals.cogs)}</strong></td></tr>
                <tr className="summary-row"><th>当期純損益</th><th>{formatMoney(summary.netIncome)}</th></tr>
              </tbody>
            </table>
          </div>

          {summary.balanceSheet ? (
            <div className="modal-section">
              <h3>期末貸借対照表（B/S）</h3>
              <table className="modal-pl-table">
                <tbody>
                  <tr><th>総資産</th><td>{formatMoney(summary.balanceSheet.assets)}</td></tr>
                  <tr><th>総負債（借入・未払）</th><td>{formatMoney(summary.balanceSheet.liabilities)}</td></tr>
                  <tr className="summary-row"><th>純資産合計</th><th>{formatMoney(summary.balanceSheet.equity)}</th></tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="report-modal-footer">
          <div className="actions">
            <button onClick={dismiss}>年次決算を承認して次年度へ</button>
            <button className="secondary" onClick={() => { dismiss(); setScreen('reports'); }}>
              経営報告室で全データを精査
            </button>
          </div>
        </div>
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
      <CompletionNotice />
      <MonthlyReportModal game={game} />
      <YearlyReportModal />
      {game.status !== 'playing' ? <Result game={game} /> : null}
      {screen === 'office' ? <Office game={game} /> : null}
      {screen === 'meeting' ? <Meeting game={game} /> : null}
      {screen === 'lab' ? <Lab game={game} /> : null}
      {screen === 'developmentMeeting' ? <DevelopmentMeeting game={game} /> : null}
      {screen === 'factory' ? <Factory game={game} /> : null}
      {screen === 'sales' ? <SalesOffice game={game} /> : null}
      {screen === 'finance' ? <Finance game={game} /> : null}
      {screen === 'personnel' ? <Personnel game={game} /> : null}
      {screen === 'reports' ? <Reports game={game} /> : null}
      {screen === 'archive' ? <Archive game={game} /> : null}
      <footer>
        月初の役員会議で方針を決定し、週送り・月送りで研究・開発・生産・販売・決算を進めます。
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
