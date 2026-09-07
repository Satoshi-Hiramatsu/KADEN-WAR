import { economyRules } from '../../../../packages/content/src/rules';
import { formatMoney, formatThousandYen } from '../../../../packages/simulation/src/money';
import {
  averageUnitCost,
  departmentReports,
  plannedProductionUnits,
} from '../../../../packages/simulation/src/selectors';
import { defectBasis, productionCapacityUnits } from '../../../../packages/simulation/src/week';
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
  const capacity = productionCapacityUnits(game);
  const planned = plannedProductionUnits(game);
  const products = game.company.products;
  const currentYear = game.startYear + Math.floor(game.week / 48);

  return (
    <>
      <SceneBanner sceneKey="factory" game={game} eyebrow="工場" title="生産ラインと製造設備">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
        <MetricGrid
          metrics={[
            { label: '生産能力', value: `${capacity}台/週` },
            { label: '生産計画', value: `${planned}台/週`, note: `残り${capacity - planned}台` },
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
              <table>
                <thead>
                  <tr><th>製品</th><th>標準原価</th><th>在庫</th><th>在庫平均原価</th><th>週の生産量</th></tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <th scope="row">
                        <div className="product-cell">
                          <ProductSprite categoryId={product.categoryId} year={currentYear} size="sm" />
                          <span>{product.name}</span>
                        </div>
                      </th>
                      <td>{formatThousandYen(product.unitCost)}</td>
                      <td>{product.stockUnits}台</td>
                      <td>{averageUnitCost(product.stockUnits, product.stockValue)}</td>
                      <td>
                        <NumberField
                          label={`${product.name}の生産量`}
                          value={product.productionPlan}
                          min={0}
                          max={capacity}
                          suffix="台/週"
                          onCommit={units => dispatch({ type: 'setProductionPlan', productId: product.id, units })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <small>
              生産費は在庫の資産として計上し、売れた分だけ移動平均原価で売上原価に振り替えます。
              不良品の費用も在庫原価に含まれるため、不良率が高いと平均原価が上がります。
              現金が足りない週は、払える台数まで自動的に減らします。
            </small>
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          <Panel eyebrow="02 / 設備投資" title="生産能力を増やす">
            <p>
              1口{formatMoney(economyRules.equipmentUnitCost)}で週{economyRules.equipmentUnitCapacity}台分の能力が増えます。
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
