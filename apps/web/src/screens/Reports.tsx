import { useState } from 'react';
import { findCategory } from '../../../../packages/content/src/categories';
import { formatBasisAsPercent, formatMoney, formatUnits } from '../../../../packages/simulation/src/money';
import type { GameState, PeriodSummary, WeeklyReport } from '../../../../packages/simulation/src/types';
import {
  MetricGrid,
  Panel,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
  Portrait,
} from '../components/ui';
import { IconReport } from '../components/icons';

type ReportTab = 'weekly' | 'monthly' | 'yearly';

export function Reports({ game }: { game: GameState }) {
  const [activeTab, setActiveTab] = useState<ReportTab>('weekly');

  const weeklyReports = game.weeklyReports ?? [];
  const monthlySummaries = game.monthlySummaries ?? [];
  const yearlySummaries = game.yearlySummaries ?? [];

  // デフォルトは最新のレポート
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(
    weeklyReports.length > 0 ? weeklyReports.length - 1 : 0,
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    monthlySummaries.length > 0 ? monthlySummaries.length - 1 : 0,
  );
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(
    yearlySummaries.length > 0 ? yearlySummaries.length - 1 : 0,
  );

  const selectedWeek: WeeklyReport | undefined = weeklyReports[selectedWeekIndex];
  const selectedMonth: PeriodSummary | undefined = monthlySummaries[selectedMonthIndex];
  const selectedYear: PeriodSummary | undefined = yearlySummaries[selectedYearIndex];

  return (
    <>
      <SceneBanner
        sceneKey="reports"
        game={game}
        eyebrow="経営資料室"
        title="経営報告書・決算書アーカイブ"
      >
        <div className="reports-header-lead">
          <IconReport size={24} />
          <p>
            創業期からのすべての<strong>週次報告</strong>・<strong>月次決算書（B/S・P/L）</strong>・
            <strong>年次決算報告書（経営判断材料・財務指標）</strong>をいつでも遡って再確認できます。
          </p>
        </div>
        <div className="reports-tab-bar" role="tablist">
          <button
            type="button"
            className={activeTab === 'weekly' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('weekly')}
            role="tab"
            aria-selected={activeTab === 'weekly'}
          >
            週次報告書 ({weeklyReports.length}週分)
          </button>
          <button
            type="button"
            className={activeTab === 'monthly' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('monthly')}
            role="tab"
            aria-selected={activeTab === 'monthly'}
          >
            月次決算書・B/S ({monthlySummaries.length}か月分)
          </button>
          <button
            type="button"
            className={activeTab === 'yearly' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('yearly')}
            role="tab"
            aria-selected={activeTab === 'yearly'}
          >
            年次決算報告書 ({yearlySummaries.length}年分)
          </button>
        </div>
      </SceneBanner>

      {/* ================= 週次報告タブ ================= */}
      {activeTab === 'weekly' ? (
        weeklyReports.length === 0 ? (
          <Panel eyebrow="週次報告" title="記録がありません">
            <p>まだ1週も進めていません。週送りを行うと週次報告が自動的に記録されます。</p>
          </Panel>
        ) : (
          <>
            <div className="report-selector-bar">
              <label htmlFor="week-select"><strong>表示する週を選択：</strong></label>
              <select
                id="week-select"
                value={selectedWeekIndex}
                onChange={e => setSelectedWeekIndex(Number(e.target.value))}
              >
                {weeklyReports.map((report, idx) => (
                  <option key={report.week} value={idx}>
                    第{report.week + 1}週 （売上: {formatMoney(report.revenue)} / 粗利: {formatMoney(report.revenue - report.cogs)}）
                  </option>
                ))}
              </select>
              <span className="report-badge">全{weeklyReports.length}週中 第{selectedWeekIndex + 1}週を表示中</span>
            </div>

            {selectedWeek ? (
              <ScreenColumns variant="even">
                <ScreenColumn>
                  <Panel eyebrow={`第${selectedWeek.week + 1}週`} title="財務・損益サマリ">
                    <MetricGrid
                      metrics={[
                        { label: '売上高', value: formatMoney(selectedWeek.revenue) },
                        { label: '売上原価', value: formatMoney(selectedWeek.cogs) },
                        {
                          label: '売上総利益（粗利）',
                          value: formatMoney(selectedWeek.revenue - selectedWeek.cogs),
                          note: selectedWeek.revenue > 0
                            ? `粗利率 ${formatBasisAsPercent(Math.floor(((selectedWeek.revenue - selectedWeek.cogs) * 10000) / selectedWeek.revenue))}`
                            : undefined,
                        },
                        { label: '週次経費', value: formatMoney(selectedWeek.expenses) },
                        {
                          label: '純損益',
                          value: formatMoney(selectedWeek.netIncome),
                          note: selectedWeek.netIncome >= 0 ? '黒字' : '赤字',
                        },
                        { label: '期末現金', value: formatMoney(selectedWeek.cashEnd) },
                      ]}
                    />
                  </Panel>

                  <Panel eyebrow="生産・販売数量" title="出荷と品質">
                    <MetricGrid
                      metrics={[
                        { label: '生産台数', value: `${formatUnits(selectedWeek.unitsProduced)}台` },
                        { label: '不良品数', value: `${formatUnits(selectedWeek.defectUnits)}台` },
                        { label: '販売台数', value: `${formatUnits(selectedWeek.unitsSold)}台` },
                      ]}
                    />

                    {selectedWeek.productionShortfalls && selectedWeek.productionShortfalls.length > 0 ? (
                      <div className="shortfall-callout warning">
                        <strong>⚠️ 生産ショートフォール発生</strong>
                        <ul>
                          {selectedWeek.productionShortfalls.map(shortfall => (
                            <li key={shortfall.productId}>
                              {shortfall.productName}: 計画{shortfall.plannedUnits}台に対し{shortfall.shortfallUnits}台不足（原因：{shortfall.reason === 'cash' ? '資金ショート' : '工数不足'}）
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Panel>
                </ScreenColumn>

                <ScreenColumn>
                  <Panel eyebrow="製品別販売実績" title="当週の売上・粗利内訳">
                    {selectedWeek.productSales && selectedWeek.productSales.length > 0 ? (
                      <div className="desktop-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>製品名</th>
                              <th>販売台数</th>
                              <th>売上高</th>
                              <th>売上原価</th>
                              <th>粗利</th>
                              <th>粗利率</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedWeek.productSales.map(ps => {
                              const marginBasis = ps.revenue > 0
                                ? Math.floor((ps.grossProfit * 10000) / ps.revenue)
                                : 0;
                              return (
                                <tr key={ps.productId}>
                                  <th scope="row">{ps.productName}</th>
                                  <td>{formatUnits(ps.unitsSold)}台</td>
                                  <td>{formatMoney(ps.revenue)}</td>
                                  <td>{formatMoney(ps.cogs)}</td>
                                  <td><strong>{formatMoney(ps.grossProfit)}</strong></td>
                                  <td>{formatBasisAsPercent(marginBasis)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>当週の製品販売はありませんでした（生産中または在庫切れ）。</p>
                    )}
                  </Panel>

                  <Panel eyebrow="市場占有率" title="製品分類別シェア">
                    {selectedWeek.categoryShares && selectedWeek.categoryShares.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>分野</th>
                            <th>市場需要</th>
                            <th>自社販売</th>
                            <th>占有率</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedWeek.categoryShares.map(cat => {
                            const category = findCategory(cat.categoryId);
                            return (
                              <tr key={cat.categoryId}>
                                <th scope="row">{category?.name ?? cat.categoryId}</th>
                                <td>{formatUnits(cat.demandUnits)}台</td>
                                <td>{formatUnits(cat.ownUnits)}台</td>
                                <td><strong>{formatBasisAsPercent(cat.shareBasis)}</strong></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p>市場データはありません。</p>
                    )}
                  </Panel>
                </ScreenColumn>
              </ScreenColumns>
            ) : null}
          </>
        )
      ) : null}

      {/* ================= 月次決算タブ ================= */}
      {activeTab === 'monthly' ? (
        monthlySummaries.length === 0 ? (
          <Panel eyebrow="月次決算書" title="記録がありません">
            <p>まだ月次決算を迎えていません。4週進むごとに月次決算書（B/S・P/L）が作成されます。</p>
          </Panel>
        ) : (
          <>
            <div className="report-selector-bar">
              <label htmlFor="month-select"><strong>表示する月次決算を選択：</strong></label>
              <select
                id="month-select"
                value={selectedMonthIndex}
                onChange={e => setSelectedMonthIndex(Number(e.target.value))}
              >
                {monthlySummaries.map((summary, idx) => (
                  <option key={`month-${summary.endWeek}`} value={idx}>
                    {summary.label} （売上: {formatMoney(summary.totals.revenue)} / 純利益: {formatMoney(summary.netIncome)}）
                  </option>
                ))}
              </select>
              <span className="report-badge">全{monthlySummaries.length}か月中 第{selectedMonthIndex + 1}か月を表示中</span>
            </div>

            {selectedMonth ? (
              <ScreenColumns variant="even">
                <ScreenColumn>
                  {selectedMonth.balanceSheet ? (
                    <Panel eyebrow="01 / 貸借対照表（B/S）" title={`${selectedMonth.label} 期末残高`}>
                      <div className="bs-table-container">
                        <table className="bs-grid-table">
                          <thead>
                            <tr>
                              <th colSpan={2}>【資産の部】</th>
                              <th colSpan={2}>【負債の部】</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>手元現金</td><td>{formatMoney(selectedMonth.balanceSheet.cash)}</td>
                              <td>借入金</td><td>{formatMoney(selectedMonth.balanceSheet.debt)}</td>
                            </tr>
                            <tr>
                              <td>商品在庫</td><td>{formatMoney(selectedMonth.balanceSheet.inventory)}</td>
                              <td>未払金</td><td>{formatMoney(selectedMonth.balanceSheet.payable)}</td>
                            </tr>
                            <tr>
                              <td>生産設備</td><td>{formatMoney(selectedMonth.balanceSheet.equipment)}</td>
                              <th scope="row">負債合計</th><th>{formatMoney(selectedMonth.balanceSheet.liabilities)}</th>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <th colSpan={2}>【純資産の部】</th>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>資本金</td><td>{formatMoney(selectedMonth.balanceSheet.capital)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>利益剰余金</td><td>{formatMoney(selectedMonth.balanceSheet.retainedEarnings)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>当期純利益</td><td>{formatMoney(selectedMonth.balanceSheet.currentIncome)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <th scope="row">純資産合計</th><th>{formatMoney(selectedMonth.balanceSheet.equity)}</th>
                            </tr>
                            <tr className="summary-row">
                              <th>資産合計</th><th>{formatMoney(selectedMonth.balanceSheet.assets)}</th>
                              <th>負債・純資産計</th><th>{formatMoney(selectedMonth.balanceSheet.liabilities + selectedMonth.balanceSheet.equity)}</th>
                            </tr>
                          </tbody>
                        </table>
                        <p className={selectedMonth.balanceSheet.difference === 0 ? 'bs-check done' : 'bs-check warn'}>
                          {selectedMonth.balanceSheet.difference === 0
                            ? '✓ 貸借一致（資産 ＝ 負債 ＋ 純資産）'
                            : `⚠️ 差額あり: ${formatMoney(selectedMonth.balanceSheet.difference)}`}
                        </p>
                      </div>
                    </Panel>
                  ) : null}

                  {selectedMonth.expenseBreakdown ? (
                    <Panel eyebrow="02 / 経費内訳（月単位）" title="人件費・広告費・固定費の分析">
                      <table>
                        <thead>
                          <tr>
                            <th>経費項目</th>
                            <th>金額</th>
                            <th>構成比</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">人件費</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.labor)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.labor * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr>
                            <th scope="row">販売・広告費</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.selling)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.selling * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr>
                            <th scope="row">研究費</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.research)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.research * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr>
                            <th scope="row">開発費</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.development)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.development * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr>
                            <th scope="row">減価償却費</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.depreciation)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.depreciation * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr>
                            <th scope="row">支払利息</th>
                            <td>{formatMoney(selectedMonth.expenseBreakdown.interest)}</td>
                            <td>{selectedMonth.expenseBreakdown.total > 0 ? `${Math.round((selectedMonth.expenseBreakdown.interest * 100) / selectedMonth.expenseBreakdown.total)}%` : '0%'}</td>
                          </tr>
                          <tr className="summary-row">
                            <th>経費合計</th>
                            <th>{formatMoney(selectedMonth.expenseBreakdown.total)}</th>
                            <th>100%</th>
                          </tr>
                        </tbody>
                      </table>
                    </Panel>
                  ) : null}
                </ScreenColumn>

                <ScreenColumn>
                  <Panel eyebrow="03 / 損益計算書（P/L）" title={`${selectedMonth.label} 損益実績`}>
                    <table>
                      <thead>
                        <tr><th>勘定科目</th><th>金額</th><th>対売上比</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">売上高</th>
                          <td>{formatMoney(selectedMonth.totals.revenue)}</td>
                          <td>100.0%</td>
                        </tr>
                        <tr>
                          <th scope="row">売上原価</th>
                          <td>{formatMoney(selectedMonth.totals.cogs)}</td>
                          <td>{selectedMonth.totals.revenue > 0 ? `${((selectedMonth.totals.cogs * 100) / selectedMonth.totals.revenue).toFixed(1)}%` : '—'}</td>
                        </tr>
                        <tr className="highlight-row">
                          <th scope="row">売上総利益（粗利）</th>
                          <td><strong>{formatMoney(selectedMonth.totals.revenue - selectedMonth.totals.cogs)}</strong></td>
                          <td><strong>{selectedMonth.totals.revenue > 0 ? `${(((selectedMonth.totals.revenue - selectedMonth.totals.cogs) * 100) / selectedMonth.totals.revenue).toFixed(1)}%` : '—'}</strong></td>
                        </tr>
                        <tr>
                          <th scope="row">販売費及び一般管理費</th>
                          <td>{formatMoney(
                            selectedMonth.totals.sellingExpense + selectedMonth.totals.researchExpense
                            + selectedMonth.totals.developmentExpense + selectedMonth.totals.laborExpense
                            + selectedMonth.totals.depreciationExpense
                          )}</td>
                          <td>{selectedMonth.totals.revenue > 0 ? `${(((selectedMonth.totals.sellingExpense + selectedMonth.totals.researchExpense + selectedMonth.totals.developmentExpense + selectedMonth.totals.laborExpense + selectedMonth.totals.depreciationExpense) * 100) / selectedMonth.totals.revenue).toFixed(1)}%` : '—'}</td>
                        </tr>
                        <tr>
                          <th scope="row">営業損益</th>
                          <td>{formatMoney(
                            (selectedMonth.totals.revenue - selectedMonth.totals.cogs)
                            - (selectedMonth.totals.sellingExpense + selectedMonth.totals.researchExpense
                              + selectedMonth.totals.developmentExpense + selectedMonth.totals.laborExpense
                              + selectedMonth.totals.depreciationExpense)
                          )}</td>
                          <td>—</td>
                        </tr>
                        <tr>
                          <th scope="row">営業外費用（支払利息）</th>
                          <td>{formatMoney(selectedMonth.totals.interestExpense)}</td>
                          <td>—</td>
                        </tr>
                        <tr className="summary-row">
                          <th scope="row">当期純損益</th>
                          <th>{formatMoney(selectedMonth.netIncome)}</th>
                          <th>{selectedMonth.totals.revenue > 0 ? `${((selectedMonth.netIncome * 100) / selectedMonth.totals.revenue).toFixed(1)}%` : '—'}</th>
                        </tr>
                      </tbody>
                    </table>
                  </Panel>

                  {selectedMonth.productSales && selectedMonth.productSales.length > 0 ? (
                    <Panel eyebrow="04 / 月間製品別実績" title="製品別売上・粗利">
                      <table>
                        <thead>
                          <tr>
                            <th>製品名</th>
                            <th>販売数</th>
                            <th>売上高</th>
                            <th>粗利</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMonth.productSales.map(ps => (
                            <tr key={ps.productId}>
                              <th scope="row">{ps.productName}</th>
                              <td>{formatUnits(ps.unitsSold)}台</td>
                              <td>{formatMoney(ps.revenue)}</td>
                              <td><strong>{formatMoney(ps.grossProfit)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Panel>
                  ) : null}
                </ScreenColumn>
              </ScreenColumns>
            ) : null}
          </>
        )
      ) : null}

      {/* ================= 年次決算タブ ================= */}
      {activeTab === 'yearly' ? (
        yearlySummaries.length === 0 ? (
          <Panel eyebrow="年次決算報告書" title="記録がありません">
            <p>まだ年次決算（48週の節目）を迎えていません。1年が経過すると、貸借対照表・P/L表・財務分析指標を含む年次決算報告書が作成されます。</p>
          </Panel>
        ) : (
          <>
            <div className="report-selector-bar">
              <label htmlFor="year-select"><strong>表示する年次決算を選択：</strong></label>
              <select
                id="year-select"
                value={selectedYearIndex}
                onChange={e => setSelectedYearIndex(Number(e.target.value))}
              >
                {yearlySummaries.map((summary, idx) => (
                  <option key={`year-${summary.endWeek}`} value={idx}>
                    {summary.label} （年間売上: {formatMoney(summary.totals.revenue)} / 年間純利益: {formatMoney(summary.netIncome)}）
                  </option>
                ))}
              </select>
              <span className="report-badge">全{yearlySummaries.length}年中 第{selectedYearIndex + 1}年を表示中</span>
            </div>

            {selectedYear ? (
              <>
                {selectedYear.reviewComment ? (
                  <div className="npc-callout annual-review-callout">
                    <Portrait executiveId="finance" size={56} />
                    <div>
                      <strong>経理統括・財務責任者 決算総括所見</strong>
                      <p className="annual-review-text">「{selectedYear.reviewComment}」</p>
                    </div>
                  </div>
                ) : null}

                {selectedYear.financialRatios ? (
                  <Panel eyebrow="経営判断材料・財務分析指標" title="重要財務レシオ一覧">
                    <MetricGrid
                      metrics={[
                        {
                          label: '売上高総利益率（粗利率）',
                          value: formatBasisAsPercent(selectedYear.financialRatios.grossMarginBasis),
                          note: '製品の付加価値力',
                        },
                        {
                          label: '売上高営業利益率',
                          value: formatBasisAsPercent(selectedYear.financialRatios.operatingMarginBasis),
                          note: '本業の稼ぐ力',
                        },
                        {
                          label: '売上高純利益率',
                          value: formatBasisAsPercent(selectedYear.financialRatios.netMarginBasis),
                          note: '最終収益性',
                        },
                        {
                          label: '自己資本比率',
                          value: formatBasisAsPercent(selectedYear.financialRatios.equityRatioBasis),
                          note: selectedYear.financialRatios.equityRatioBasis >= 5000 ? '超優良' : '標準',
                        },
                        {
                          label: '手元流動性',
                          value: `${selectedYear.financialRatios.currentLiquidityMonths}か月分`,
                          note: '月商に対する現金余裕',
                        },
                        {
                          label: '借入金依存度',
                          value: formatBasisAsPercent(selectedYear.financialRatios.debtRatioBasis),
                          note: '総資産に対する負債比率',
                        },
                        ...(selectedYear.financialRatios.roaBasis !== undefined ? [{
                          label: '総資産利益率 (ROA)',
                          value: formatBasisAsPercent(selectedYear.financialRatios.roaBasis),
                          note: '資産の活用効率',
                        }] : []),
                        ...(selectedYear.financialRatios.roeBasis !== undefined ? [{
                          label: '自己資本利益率 (ROE)',
                          value: formatBasisAsPercent(selectedYear.financialRatios.roeBasis),
                          note: '株主資本へのリターン',
                        }] : []),
                      ]}
                    />
                  </Panel>
                ) : null}

                <ScreenColumns variant="even">
                  <ScreenColumn>
                    {selectedYear.balanceSheet ? (
                      <Panel eyebrow="年次 貸借対照表（B/S）" title={`${selectedYear.label} 期末財政状態`}>
                        <table className="bs-grid-table">
                          <thead>
                            <tr>
                              <th colSpan={2}>【資産の部】</th>
                              <th colSpan={2}>【負債の部】</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>手元現金</td><td>{formatMoney(selectedYear.balanceSheet.cash)}</td>
                              <td>借入金</td><td>{formatMoney(selectedYear.balanceSheet.debt)}</td>
                            </tr>
                            <tr>
                              <td>商品在庫</td><td>{formatMoney(selectedYear.balanceSheet.inventory)}</td>
                              <td>未払金</td><td>{formatMoney(selectedYear.balanceSheet.payable)}</td>
                            </tr>
                            <tr>
                              <td>生産設備</td><td>{formatMoney(selectedYear.balanceSheet.equipment)}</td>
                              <th scope="row">負債合計</th><th>{formatMoney(selectedYear.balanceSheet.liabilities)}</th>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <th colSpan={2}>【純資産の部】</th>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>資本金</td><td>{formatMoney(selectedYear.balanceSheet.capital)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>利益剰余金</td><td>{formatMoney(selectedYear.balanceSheet.retainedEarnings)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td>当期純損益</td><td>{formatMoney(selectedYear.balanceSheet.currentIncome)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <th scope="row">純資産合計</th><th>{formatMoney(selectedYear.balanceSheet.equity)}</th>
                            </tr>
                            <tr className="summary-row">
                              <th>資産合計</th><th>{formatMoney(selectedYear.balanceSheet.assets)}</th>
                              <th>負債・純資産計</th><th>{formatMoney(selectedYear.balanceSheet.liabilities + selectedYear.balanceSheet.equity)}</th>
                            </tr>
                          </tbody>
                        </table>
                        <p className={selectedYear.balanceSheet.difference === 0 ? 'bs-check done' : 'bs-check warn'}>
                          {selectedYear.balanceSheet.difference === 0
                            ? '✓ 貸借一致（資産 ＝ 負債 ＋ 純資産）'
                            : `⚠️ 差額あり: ${formatMoney(selectedYear.balanceSheet.difference)}`}
                        </p>
                      </Panel>
                    ) : null}
                  </ScreenColumn>

                  <ScreenColumn>
                    <Panel eyebrow="年次 損益計算書（P/L）" title={`${selectedYear.label} 年間経営成績`}>
                      <table>
                        <thead>
                          <tr><th>科目</th><th>年間金額</th><th>対売上比</th></tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">売上高</th>
                            <td>{formatMoney(selectedYear.totals.revenue)}</td>
                            <td>100.0%</td>
                          </tr>
                          <tr>
                            <th scope="row">売上原価</th>
                            <td>{formatMoney(selectedYear.totals.cogs)}</td>
                            <td>{selectedYear.totals.revenue > 0 ? `${((selectedYear.totals.cogs * 100) / selectedYear.totals.revenue).toFixed(1)}%` : '—'}</td>
                          </tr>
                          <tr className="highlight-row">
                            <th scope="row">売上総利益（粗利）</th>
                            <td><strong>{formatMoney(selectedYear.totals.revenue - selectedYear.totals.cogs)}</strong></td>
                            <td><strong>{selectedYear.totals.revenue > 0 ? `${(((selectedYear.totals.revenue - selectedYear.totals.cogs) * 100) / selectedYear.totals.revenue).toFixed(1)}%` : '—'}</strong></td>
                          </tr>
                          <tr>
                            <th scope="row">販管費計</th>
                            <td>{formatMoney(
                              selectedYear.totals.sellingExpense + selectedYear.totals.researchExpense
                              + selectedYear.totals.developmentExpense + selectedYear.totals.laborExpense
                              + selectedYear.totals.depreciationExpense
                            )}</td>
                            <td>{selectedYear.totals.revenue > 0 ? `${(((selectedYear.totals.sellingExpense + selectedYear.totals.researchExpense + selectedYear.totals.developmentExpense + selectedYear.totals.laborExpense + selectedYear.totals.depreciationExpense) * 100) / selectedYear.totals.revenue).toFixed(1)}%` : '—'}</td>
                          </tr>
                          <tr className="highlight-row">
                            <th scope="row">営業利益</th>
                            <td><strong>{formatMoney(
                              (selectedYear.totals.revenue - selectedYear.totals.cogs)
                              - (selectedYear.totals.sellingExpense + selectedYear.totals.researchExpense
                                + selectedYear.totals.developmentExpense + selectedYear.totals.laborExpense
                                + selectedYear.totals.depreciationExpense)
                            )}</strong></td>
                            <td>—</td>
                          </tr>
                          <tr>
                            <th scope="row">支払利息</th>
                            <td>{formatMoney(selectedYear.totals.interestExpense)}</td>
                            <td>—</td>
                          </tr>
                          <tr className="summary-row">
                            <th scope="row">当期純損益</th>
                            <th>{formatMoney(selectedYear.netIncome)}</th>
                            <th>{selectedYear.totals.revenue > 0 ? `${((selectedYear.netIncome * 100) / selectedYear.totals.revenue).toFixed(1)}%` : '—'}</th>
                          </tr>
                        </tbody>
                      </table>
                    </Panel>

                    {selectedYear.productSales && selectedYear.productSales.length > 0 ? (
                      <Panel eyebrow="年間製品別実績" title="主力製品の貢献ランキング">
                        <table>
                          <thead>
                            <tr>
                              <th>製品名</th>
                              <th>年間販売台数</th>
                              <th>売上高</th>
                              <th>粗利貢献</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...selectedYear.productSales]
                              .sort((a, b) => b.grossProfit - a.grossProfit)
                              .map(ps => (
                                <tr key={ps.productId}>
                                  <th scope="row">{ps.productName}</th>
                                  <td>{formatUnits(ps.unitsSold)}台</td>
                                  <td>{formatMoney(ps.revenue)}</td>
                                  <td><strong>{formatMoney(ps.grossProfit)}</strong></td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </Panel>
                    ) : null}
                  </ScreenColumn>
                </ScreenColumns>
              </>
            ) : null}
          </>
        )
      ) : null}
    </>
  );
}
