import { findCategory, workloadForUnits } from '../../../../packages/content/src/categories';
import { economyRules, weeksPerYear } from '../../../../packages/content/src/rules';
import { formatMoney, formatUnitPrice, formatUnits } from '../../../../packages/simulation/src/money';
import {
  averageUnitCost,
  departmentReports,
  maxProductionUnitsFor,
  plannedProductionWorkload,
} from '../../../../packages/simulation/src/selectors';
import {
  calculateEffectiveUnitCost,
  factoryCapacityUtilization,
  requiredCashForProduct,
  weeklyRequiredProductionCash,
} from '../../../../packages/simulation/src/production';
import { defectBasis, mandatoryWeeklyPayment, productionCapacityWorkload } from '../../../../packages/simulation/src/week';
import type { GameState } from '../../../../packages/simulation/src/types';
import {
  ExecutiveHeader,
  MetricGrid,
  NumberField,
  Panel,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
  ProductSprite,
} from '../components/ui';
import { useGameStore } from '../store';

export function Factory({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'production');
  const capacity = productionCapacityWorkload(game);
  const plannedWorkload = plannedProductionWorkload(game);
  const products = game.company.products;
  const currentYear = game.startYear + Math.floor(game.week / weeksPerYear);
  const utilization = factoryCapacityUtilization(game);
  const totalRequiredCash = weeklyRequiredProductionCash(game);
  const cash = game.company.accounts.cash;
  const fixedCost = mandatoryWeeklyPayment(game);
  const availableCash = Math.max(0, cash - fixedCost);
  const isCashShortfall = totalRequiredCash > availableCash && totalRequiredCash > 0;

  return (
    <>
      <SceneBanner sceneKey="factory" game={game} eyebrow="工場" title="生産ラインと製造設備">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
        <MetricGrid
          metrics={[
            { label: '生産能力', value: `${formatUnits(capacity)}工数/週` },
            {
              label: '生産計画',
              value: `${formatUnits(plannedWorkload)}工数/週`,
              note: `稼働率${Math.round(utilization * 100)}%（残り${formatUnits(Math.max(0, capacity - plannedWorkload))}工数）`,
            },
            { label: '必要製造資金', value: `${formatMoney(totalRequiredCash)}/週`, note: isCashShortfall ? '⚠️手元資金不足' : '資金内' },
            { label: '不良率', value: `${(defectBasis(game) / 100).toFixed(1)}%`, note: '週ごとにばらつく' },
          ]}
        />
      </SceneBanner>

      <ScreenColumns>
        <ScreenColumn>
          <Panel eyebrow="01 / 生産計画" title="週あたりの生産量">
            {products.length === 0 ? (
              <p>生産できる製品がありません。研究所で製品を開発してください。</p>
            ) : (
              <>
                {/* 製造資金の過不足サマリー */}
                <div className={`production-finance-summary ${isCashShortfall ? 'has-shortfall' : 'is-ok'}`}>
                  <div className="finance-summary-line">
                    <span>週の必要製造資金: <strong>{formatMoney(totalRequiredCash)}</strong></span>
                    <span className="finance-summary-sub">（次週の余力現金: {formatMoney(availableCash)} / 手元現金: {formatMoney(cash)}）</span>
                  </div>
                  {isCashShortfall ? (
                    <div className="finance-shortfall-alert">
                      ⚠️ 次週の製造資金が約<strong>{formatMoney(totalRequiredCash - availableCash)}</strong>不足しています！このままでは週送り時に製造が自動削減・停止されます。経理部で借入を行うか計画を調整してください。
                    </div>
                  ) : null}
                </div>

                {/* PC/タブレット用テーブル表示 */}
                <div className="desktop-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>製品</th>
                        <th>1台の工数</th>
                        <th>生産単価（実効原価）</th>
                        <th>在庫</th>
                        <th>在庫平均原価</th>
                        <th>週の生産量・必要資金</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => {
                        const category = findCategory(product.categoryId);
                        const per100 = category?.workloadPer100Units ?? 0;
                        const usedWorkload = category ? workloadForUnits(category, product.productionPlan) : 0;
                        const maxUnits = maxProductionUnitsFor(game, product);
                        const costCalc = calculateEffectiveUnitCost(product, product.productionPlan, utilization);
                        const reqCash = requiredCashForProduct(product, product.productionPlan, utilization);
                        const lastShortfall = game.lastWeek?.productionShortfalls?.find(s => s.productId === product.id);
                        return (
                          <tr key={product.id}>
                            <th scope="row">
                              <div className="product-cell">
                                <ProductSprite categoryId={product.categoryId} year={currentYear} size="sm" />
                                <div className="product-cell-info">
                                  <span>{product.name}</span>
                                  <small>{category?.name ?? product.categoryId}</small>
                                </div>
                              </div>
                            </th>
                            <td>{per100}工数/100台</td>
                            <td>
                              <div className="unit-cost-cell">
                                <strong>{formatUnitPrice(costCalc.effectiveUnitCost)}</strong>
                                {costCalc.isSmallLotPenalty ? (
                                  <span className="cost-tag penalty" title="小ロットのため段取り固定費の負担が大きく割高です">
                                    +{costCalc.deltaPercent}% 小ロット割高
                                  </span>
                                ) : costCalc.isVolumeDiscount ? (
                                  <span className="cost-tag discount" title="まとまった数量のため段取り固定費が希釈され部材割引も効いています">
                                    {costCalc.deltaPercent}% 量産効果
                                  </span>
                                ) : null}
                                {costCalc.isOvertimePenalty ? (
                                  <span className="cost-tag overtime" title="工場稼働率85%超による残業割増が発生しています">
                                    ⏰残業割増
                                  </span>
                                ) : null}
                                <small className="cost-base-ref">基準: {formatUnitPrice(product.unitCost)}</small>
                              </div>
                            </td>
                            <td>{formatUnits(product.stockUnits)}台</td>
                            <td>{averageUnitCost(product.stockUnits, product.stockValue)}</td>
                            <td>
                              <NumberField
                                label={`${product.name}の生産量`}
                                value={product.productionPlan}
                                min={0}
                                max={maxUnits}
                                step={Math.max(1, Math.floor(10000 / Math.max(1, per100)))}
                                suffix="台/週"
                                onCommit={units => dispatch({ type: 'setProductionPlan', productId: product.id, units })}
                              />
                              <div className="plan-meta-row">
                                <small>{formatUnits(usedWorkload)}工数</small>
                                <span className="plan-req-cash">必要: <strong>{formatMoney(reqCash)}</strong></span>
                                <button
                                  type="button"
                                  className="quick-btn"
                                  style={{ minHeight: '22px', padding: '1px 5px', fontSize: '0.68rem' }}
                                  onClick={() => dispatch({ type: 'setProductionPlan', productId: product.id, units: maxUnits })}
                                  title="余力全量を割り当てる"
                                >
                                  最大
                                </button>
                                <button
                                  type="button"
                                  className="quick-btn secondary"
                                  style={{ minHeight: '22px', padding: '1px 5px', fontSize: '0.68rem' }}
                                  onClick={() => dispatch({ type: 'setProductionPlan', productId: product.id, units: 0 })}
                                  title="生産を停止する"
                                >
                                  停止
                                </button>
                              </div>
                              {lastShortfall && lastShortfall.reason === 'cash' ? (
                                <div className="product-shortfall-alert">
                                  {lastShortfall.actualUnits === 0
                                    ? `🚨 先週資金不足で生産停止（計画${formatUnits(lastShortfall.plannedUnits)}台→0台）`
                                    : `⚠️ 先週資金不足で${formatUnits(lastShortfall.shortfallUnits)}台削減（実績${formatUnits(lastShortfall.actualUnits)}台）`}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* スマートフォン用カード表示 */}
                <div className="mobile-cards-wrap">
                  {products.map(product => {
                    const category = findCategory(product.categoryId);
                    const per100 = category?.workloadPer100Units ?? 0;
                    const usedWorkload = category ? workloadForUnits(category, product.productionPlan) : 0;
                    const maxUnits = maxProductionUnitsFor(game, product);
                    const costCalc = calculateEffectiveUnitCost(product, product.productionPlan, utilization);
                    const reqCash = requiredCashForProduct(product, product.productionPlan, utilization);
                    const lastShortfall = game.lastWeek?.productionShortfalls?.find(s => s.productId === product.id);
                    return (
                      <div className="responsive-product-card" key={`mobile-${product.id}`}>
                        <div className="card-product-header">
                          <ProductSprite categoryId={product.categoryId} year={currentYear} size="sm" />
                          <div className="card-product-title-block">
                            <span className="card-product-name">{product.name}</span>
                            <small className="card-product-category">{category?.name ?? product.categoryId}</small>
                          </div>
                          <span className={`status-pill ${product.productionPlan > 0 ? 'active' : 'idle'}`}>
                            {product.productionPlan > 0 ? `${formatUnits(product.productionPlan)}台/週` : '生産停止中'}
                          </span>
                        </div>

                        <div className="card-spec-grid">
                          <div className="spec-item">
                            <span className="spec-label">1台の工数</span>
                            <span className="spec-value">{per100}工数/100台</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">生産単価（実効）</span>
                            <span className="spec-value">
                              <strong>{formatUnitPrice(costCalc.effectiveUnitCost)}</strong>
                              {costCalc.isSmallLotPenalty ? (
                                <small className="cost-tag penalty">+{costCalc.deltaPercent}% 小ロット割高</small>
                              ) : costCalc.isVolumeDiscount ? (
                                <small className="cost-tag discount">{costCalc.deltaPercent}% 量産効果</small>
                              ) : null}
                              {costCalc.isOvertimePenalty ? (
                                <small className="cost-tag overtime">⏰残業割増</small>
                              ) : null}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">現在の在庫</span>
                            <span className={`spec-value ${product.stockUnits === 0 ? 'highlight' : ''}`}>
                              {formatUnits(product.stockUnits)}台
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">在庫平均原価</span>
                            <span className="spec-value">{averageUnitCost(product.stockUnits, product.stockValue)}</span>
                          </div>
                        </div>

                        <div className="card-plan-section">
                          <div className="card-plan-input-row">
                            <NumberField
                              label={`${product.name}の週生産量`}
                              value={product.productionPlan}
                              min={0}
                              max={maxUnits}
                              step={Math.max(1, Math.floor(10000 / Math.max(1, per100)))}
                              suffix="台/週"
                              onCommit={units => dispatch({ type: 'setProductionPlan', productId: product.id, units })}
                            />
                            <div className="plan-meta-row" style={{ marginTop: '4px' }}>
                              <span className="card-workload-note">
                                工数: <strong>{formatUnits(usedWorkload)}工数</strong> / 必要資金: <strong>{formatMoney(reqCash)}</strong>
                              </span>
                            </div>
                            {lastShortfall && lastShortfall.reason === 'cash' ? (
                              <div className="product-shortfall-alert">
                                {lastShortfall.actualUnits === 0
                                  ? `🚨 先週資金不足で生産停止（計画${formatUnits(lastShortfall.plannedUnits)}台→0台）`
                                  : `⚠️ 先週資金不足で${formatUnits(lastShortfall.shortfallUnits)}台削減（実績${formatUnits(lastShortfall.actualUnits)}台）`}
                              </div>
                            ) : null}
                          </div>

                          <div className="quick-btn-group">
                            <span className="quick-btn-label">クイック設定:</span>
                            <button
                              type="button"
                              className="quick-btn"
                              onClick={() => dispatch({ type: 'setProductionPlan', productId: product.id, units: maxUnits })}
                            >
                              最大余力（{formatUnits(maxUnits)}台）
                            </button>
                            <button
                              type="button"
                              className="quick-btn secondary"
                              onClick={() => dispatch({ type: 'setProductionPlan', productId: product.id, units: Math.floor(maxUnits / 2) })}
                            >
                              半量
                            </button>
                            <button
                              type="button"
                              className="quick-btn secondary"
                              onClick={() => dispatch({ type: 'setProductionPlan', productId: product.id, units: 0 })}
                            >
                              停止（0台）
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <small>
              生産能力は「工数」で数えます。乾電池は100本あたり3工数、白黒テレビは100台あたり4,000工数というように、
              同じ工場でも作れる台数は製品分類でまるで違います。
              生産費は在庫の資産として計上し、売れた分だけ移動平均原価で売上原価に振り替えます。
              現金が足りない週は、払える台数まで自動的に減らします。
            </small>
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          <Panel eyebrow="02 / 設備投資" title="生産能力を増やす">
            <p>
              1口{formatMoney(economyRules.equipmentUnitCost)}で週{formatUnits(economyRules.equipmentUnitCapacity)}工数の能力が増えます。
              設備は資産に計上し、月末に{economyRules.depreciationMonths}か月の定額で償却します。
            </p>
            <MetricGrid
              metrics={[
                { label: '購入済み', value: `${game.company.purchasedEquipmentUnits} / ${economyRules.maxEquipmentUnits}口` },
                { label: '取得価額', value: formatMoney(game.company.equipmentCost) },
              ]}
            />
            <div className="actions">
              <button onClick={() => dispatch({ type: 'investEquipment', units: 1 })}>1口 導入する</button>
              <button className="secondary" onClick={() => dispatch({ type: 'investEquipment', units: 3 })}>3口 導入する</button>
            </div>
          </Panel>
        </ScreenColumn>
      </ScreenColumns>
    </>
  );
}
