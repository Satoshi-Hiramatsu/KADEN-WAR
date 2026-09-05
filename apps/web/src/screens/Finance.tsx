import { useState } from 'react';
import { loanLimit } from '../../../../packages/simulation/src/commands';
import { formatMoney } from '../../../../packages/simulation/src/money';
import { departmentReports, financeView } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import { ExecutiveHeader, MetricGrid, NumberField, Panel, SceneBanner, NpcPortrait } from '../components/ui';
import { useGameStore } from '../store';

export function Finance({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'finance');
  const view = financeView(game);
  const [amount, setAmount] = useState(1000);

  const profitAndLoss = [
    { label: '売上高', month: view.monthly.revenue, year: view.yearly.revenue },
    { label: '売上原価', month: view.monthly.cogs, year: view.yearly.cogs },
    { label: '売上総利益', month: view.monthly.grossProfit, year: view.yearly.grossProfit },
    { label: '販売費', month: view.monthly.sellingExpense, year: view.yearly.sellingExpense },
    { label: '研究費', month: view.monthly.researchExpense, year: view.yearly.researchExpense },
    { label: '開発費', month: view.monthly.developmentExpense, year: view.yearly.developmentExpense },
    { label: '人件費', month: view.monthly.laborExpense, year: view.yearly.laborExpense },
    { label: '減価償却費', month: view.monthly.depreciationExpense, year: view.yearly.depreciationExpense },
    { label: '営業利益', month: view.monthly.operatingIncome, year: view.yearly.operatingIncome },
    { label: '支払利息', month: view.monthly.interestExpense, year: view.yearly.interestExpense },
    { label: '当期純損益', month: view.monthly.netIncome, year: view.yearly.netIncome },
  ];

  return (
    <>
      <SceneBanner sceneKey="finance" game={game} eyebrow="経理部" title="財務・損益・資金管理">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
      </SceneBanner>

      <Panel eyebrow="01 / 損益計算書" title="今月と今年度">
        <table>
          <thead>
            <tr><th>項目</th><th>今月（進行中）</th><th>今年度（進行中）</th></tr>
          </thead>
          <tbody>
            {profitAndLoss.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{formatMoney(row.month)}</td>
                <td>{formatMoney(row.year)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <small>月次は4週、年次は48週の境界で締めます。締めた月の純損益の合計が累計利益になります。</small>
      </Panel>

      <Panel eyebrow="02 / 貸借対照表" title="資産・負債・純資産">
        <MetricGrid
          metrics={[
            { label: '現金', value: formatMoney(view.balance.cash) },
            { label: '在庫', value: formatMoney(view.balance.inventory) },
            { label: '設備', value: formatMoney(view.balance.equipment) },
            { label: '資産合計', value: formatMoney(view.balance.assets) },
            { label: '借入金', value: formatMoney(view.balance.debt) },
            { label: '未払金', value: formatMoney(view.balance.payable) },
            { label: '資本金', value: formatMoney(view.balance.capital) },
            { label: '利益剰余金', value: formatMoney(view.balance.retainedEarnings) },
            { label: '当期損益', value: formatMoney(view.balance.currentIncome) },
            { label: '純資産', value: formatMoney(view.balance.equity) },
          ]}
        />
        <p className={view.balance.difference === 0 ? 'done' : 'warning'}>
          {view.balance.difference === 0
            ? '資産＝負債＋純資産が一致しています。'
            : `貸借に${formatMoney(view.balance.difference)}のずれがあります。`}
        </p>
      </Panel>

      <Panel eyebrow="03 / キャッシュフロー" title="今月の現金の動き">
        <MetricGrid
          metrics={[
            { label: '期首現金', value: formatMoney(view.cashFlow.cashStart) },
            { label: '営業', value: formatMoney(view.cashFlow.operating) },
            { label: '投資', value: formatMoney(view.cashFlow.investing) },
            { label: '財務', value: formatMoney(view.cashFlow.financing) },
            { label: '期末現金', value: formatMoney(view.cashFlow.cashEnd) },
          ]}
        />
      </Panel>

      <Panel eyebrow="04 / 資金調達" title="借入と返済">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12, background: '#f5f1e5', padding: '10px 14px', borderLeft: '4px solid #758171' }}>
          <NpcPortrait npcId="banker" size={56} />
          <div>
            <strong style={{ fontSize: '.9rem' }}>メインバンク融資担当</strong>
            <p style={{ margin: '2px 0 0', fontSize: '.84rem', color: '#4a5148' }}>
              「御社の製品展開と財務規律を注視しております。設備投資や運転資金のご用立ては、枠内の範囲で迅速に応じさせていただきます。」
            </p>
          </div>
        </div>
        <p>借入枠は資本金の2倍まで。利息は年7.0%で、週ごとに支払います。</p>
        <MetricGrid
          metrics={[
            { label: '借入残高', value: formatMoney(view.balance.debt) },
            { label: '残りの枠', value: formatMoney(loanLimit(game)) },
          ]}
        />
        <NumberField label="金額" value={amount} min={100} max={20000} step={100} suffix="万円" onCommit={setAmount} />
        <div className="actions">
          <button onClick={() => dispatch({ type: 'borrow', amount })}>借り入れる</button>
          <button className="secondary" onClick={() => dispatch({ type: 'repay', amount })}>返済する</button>
        </div>
      </Panel>

      <Panel eyebrow="05 / 決算" title="締めた期間">
        <table>
          <thead>
            <tr><th>期間</th><th>売上</th><th>純損益</th><th>期末現金</th></tr>
          </thead>
          <tbody>
            {[...game.yearlySummaries].reverse().map(summary => (
              <tr key={`year-${summary.endWeek}`} className="own">
                <th scope="row">{summary.label}</th>
                <td>{formatMoney(summary.totals.revenue)}</td>
                <td>{formatMoney(summary.netIncome)}</td>
                <td>{formatMoney(summary.cashEnd)}</td>
              </tr>
            ))}
            {[...game.monthlySummaries].slice(-6).reverse().map(summary => (
              <tr key={`month-${summary.endWeek}`}>
                <th scope="row">{summary.label}</th>
                <td>{formatMoney(summary.totals.revenue)}</td>
                <td>{formatMoney(summary.netIncome)}</td>
                <td>{formatMoney(summary.cashEnd)}</td>
              </tr>
            ))}
            {game.monthlySummaries.length === 0 ? (
              <tr><td colSpan={4}>まだ決算はありません。4週進むと最初の月次決算が出ます。</td></tr>
            ) : null}
          </tbody>
        </table>
      </Panel>

      <Panel eyebrow="06 / 仕訳" title="直近の記帳">
        <table>
          <thead>
            <tr><th>週</th><th>内容</th><th>金額</th></tr>
          </thead>
          <tbody>
            {[...game.journal].slice(-14).reverse().map(entry => (
              <tr key={entry.seq}>
                <td>{entry.week + 1}</td>
                <td>{entry.reason}</td>
                <td>{formatMoney(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
