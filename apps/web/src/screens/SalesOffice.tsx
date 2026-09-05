import { channels } from '../../../../packages/content/src/channels';
import { findCategory } from '../../../../packages/content/src/categories';
import { formatBasisAsPercent, formatMoney, formatThousandYen } from '../../../../packages/simulation/src/money';
import { channelCapacityUnits } from '../../../../packages/simulation/src/market';
import { departmentReports, marketForecast } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import { ExecutiveHeader, MetricGrid, NumberField, Panel } from '../components/ui';
import { useGameStore } from '../store';

export function SalesOffice({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'sales');
  const products = game.company.products;
  const forecast = marketForecast(game);

  return (
    <>
      <Panel eyebrow="販売本部" title="価格・販路・市場">
        {report ? <ExecutiveHeader report={report} /> : null}
        <MetricGrid
          metrics={[
            { label: '販売能力', value: `${channelCapacityUnits(game)}台/週` },
            { label: '先週の販売', value: `${game.lastWeek?.unitsSold ?? 0}台` },
            { label: 'ブランド', value: (game.company.brandBasis / 100).toFixed(2) },
          ]}
        />
      </Panel>

      <Panel eyebrow="01 / 価格と発売" title="製品の売り方">
        {products.length === 0 ? (
          <p>製品がありません。研究所で開発してください。</p>
        ) : (
          <table>
            <thead>
              <tr><th>製品</th><th>性能</th><th>原価</th><th>価格</th><th>先週</th><th>販売状態</th></tr>
            </thead>
            <tbody>
              {products.map(product => {
                const category = findCategory(product.categoryId);
                return (
                  <tr key={product.id}>
                    <th scope="row">
                      {product.name}
                      <small>{category?.name ?? product.categoryId}</small>
                    </th>
                    <td>{product.performance}</td>
                    <td>{formatThousandYen(product.unitCost)}</td>
                    <td>
                      <NumberField
                        label={`${product.name}の価格`}
                        value={product.price}
                        min={1}
                        max={1000}
                        suffix="千円"
                        onCommit={price => dispatch({ type: 'setPrice', productId: product.id, price })}
                      />
                      <small>{formatThousandYen(product.price)}</small>
                    </td>
                    <td>
                      {product.lastWeekUnitsSold}台
                      <small>占有率 {formatBasisAsPercent(product.lastWeekShareBasis)}</small>
                    </td>
                    <td>
                      <button
                        className={product.onSale ? 'secondary' : undefined}
                        onClick={() => dispatch({ type: 'setOnSale', productId: product.id, onSale: !product.onSale })}
                      >
                        {product.onSale ? '販売を止める' : '発売する'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <small>価格の編集はこの画面に一本化しています。市場の標準価格より安いほど売れやすく、利益は薄くなります。</small>
      </Panel>

      <Panel eyebrow="02 / 販路" title="売る場所を増やす">
        <table>
          <thead>
            <tr><th>販路</th><th>能力</th><th>維持費</th><th>手数料</th><th>開設費</th><th>契約数</th></tr>
          </thead>
          <tbody>
            {channels.map(channel => (
              <tr key={channel.id}>
                <th scope="row">
                  {channel.name}
                  <small>{channel.description}</small>
                </th>
                <td>{channel.capacityPerUnit}台/週</td>
                <td>{formatMoney(channel.weeklyCost)}/週</td>
                <td>{formatBasisAsPercent(channel.commissionBasis)}</td>
                <td>{formatMoney(channel.openCost)}</td>
                <td>
                  <span className="count">{game.company.channels[channel.id]} / {channel.maxUnits}</span>
                  <span className="actions">
                    <button onClick={() => dispatch({ type: 'openChannel', channelId: channel.id })}>増やす</button>
                    <button className="secondary" onClick={() => dispatch({ type: 'closeChannel', channelId: channel.id })}>減らす</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <small>販路がないと発売できません。販売能力を超えた分は売れ残ります。</small>
      </Panel>

      <Panel eyebrow="03 / 市場" title="今週の需要予測">
        <p>乱数を含まない見込みです。実際の週次結果は多少ぶれます。</p>
        {forecast.map(market => (
          <table key={market.categoryId}>
            <caption>{market.categoryName}：市場全体 {market.demandUnits}台/週</caption>
            <thead>
              <tr><th>会社・製品</th><th>性能</th><th>価格</th><th>見込み占有率</th><th>見込み台数</th></tr>
            </thead>
            <tbody>
              {market.entries.map(entry => (
                <tr key={entry.id} className={entry.owner === 'player' ? 'own' : undefined}>
                  <th scope="row">{entry.name}{entry.owner === 'player' ? '（自社）' : ''}</th>
                  <td>{entry.performance}</td>
                  <td>{formatThousandYen(entry.price)}</td>
                  <td>{formatBasisAsPercent(entry.shareBasis)}</td>
                  <td>{entry.unitsDemanded}台</td>
                </tr>
              ))}
              {market.entries.length === 0 ? (
                <tr><td colSpan={5}>この市場に参入していません。</td></tr>
              ) : null}
            </tbody>
          </table>
        ))}
      </Panel>
    </>
  );
}
