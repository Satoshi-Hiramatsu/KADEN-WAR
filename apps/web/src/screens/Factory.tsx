import { findCategory, workloadForUnits } from '../../../../packages/content/src/categories';
import { economyRules, weeksPerYear } from '../../../../packages/content/src/rules';
import { formatMoney, formatUnitPrice, formatUnits } from '../../../../packages/simulation/src/money';
import {
  averageUnitCost,
  departmentReports,
  maxProductionUnitsFor,
  plannedProductionWorkload,
} from '../../../../packages/simulation/src/selectors';
import { defectBasis, productionCapacityWorkload } from '../../../../packages/simulation/src/week';
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
              note: `残り${formatUnits(Math.max(0, capacity - plannedWorkload))}工数`,
            },
            { label: '不良率', value: `${(defectBasis(game) / 100).toFixed(1)}%`, note: '週ごとにばらつく' },
            { label: '設備', value: formatMoney(game.company.accounts.equipment), note: '簿価' },
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
                {/* PC/タブレット用テーブル表示 */}
                <div className="desktop-table-wrap">
                  <table>
                    <thead>
                      <tr><th>製品</th><th>1台の工数</th><th>標準原価</th><th>在庫</th><th>在庫平均原価</th><th>週の生産量</th></tr>
                    </thead>
                    <tbody>
                      {products.map(product => {
                        const category = findCategory(product.categoryId);
                        const per100 = category?.workloadPer100Units ?? 0;
                        const usedWorkload = category ? workloadForUnits(category, product.productionPlan) : 0;
                        const maxUnits = maxProductionUnitsFor(game, product);
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
                            <td>{formatUnitPrice(product.unitCost)}</td>
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
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                                <small>{formatUnits(usedWorkload)}工数</small>
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
                            <span className="spec-label">標準原価</span>
                            <span className="spec-value">{formatUnitPrice(product.unitCost)}</span>
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
                            <span className="card-workload-note">
                              消費工数: <strong>{formatUnits(usedWorkload)}工数</strong> / 割当可能最大: {formatUnits(maxUnits)}台
                            </span>
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
