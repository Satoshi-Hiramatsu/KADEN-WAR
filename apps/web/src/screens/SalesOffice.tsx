import { channels } from '../../../../packages/content/src/channels';
import { findCategory } from '../../../../packages/content/src/categories';
import { formatBasisAsPercent, formatMoney, formatThousandYen } from '../../../../packages/simulation/src/money';
import { channelCapacityUnits } from '../../../../packages/simulation/src/market';
import { departmentReports, marketForecast } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import { ExecutiveHeader, MetricGrid, NumberField, Panel, SceneBanner, ProductSprite, NpcPortrait } from '../components/ui';
import { SharePieChart } from '../components/Charts';
import { IconAd } from '../components/icons';
import { useGameStore } from '../store';

export function SalesOffice({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'sales');
  const products = game.company.products;
  const forecast = marketForecast(game);
  const advertising = game.company.advertising ?? { activeCampaign: null, budget: 0, boostWeeksRemaining: 0, boostBasis: 0 };
  const currentYear = game.startYear + Math.floor(game.week / 48);

  return (
    <>
      <SceneBanner sceneKey="sales" game={game} eyebrow="販売本部" title="販売戦略・価格・流通チャネル">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
        <MetricGrid
          metrics={[
            { label: '販売能力', value: `${channelCapacityUnits(game)}台/週` },
            { label: '先週の販売', value: `${game.lastWeek?.unitsSold ?? 0}台` },
            { label: 'ブランド', value: (game.company.brandBasis / 100).toFixed(2) },
            {
              label: '広告宣伝状態',
              value: advertising.boostWeeksRemaining > 0
                ? `${advertising.activeCampaign?.toUpperCase()}中（残り${advertising.boostWeeksRemaining}週）`
                : 'なし',
              note: advertising.boostWeeksRemaining > 0 ? `需要+${(advertising.boostBasis / 100).toFixed(0)}%` : undefined,
            },
          ]}
        />
      </SceneBanner>

      <Panel eyebrow="01 / 価格と発売" title="製品の売り方">
        {products.length === 0 ? (
          <p>製品がありません。研究所で開発してください。</p>
        ) : (
          <table>
            <thead>
              <tr><th>製品</th><th>性能</th><th>原価</th><th>価格</th><th>先週</th><th>販売状態</th><th>操作</th></tr>
            </thead>
            <tbody>
              {products.map(product => {
                const category = findCategory(product.categoryId);
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
                    <td>
                      <button
                        className="link"
                        title="製品を引退させて歴代名機図鑑に送る"
                        onClick={() => dispatch({ type: 'retireProduct', productId: product.id })}
                      >
                        引退（殿堂入り）
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

      <Panel eyebrow="02 / 広告宣伝" title="マーケティング戦略">
        <p>
          マスメディアや店頭での広告プロモーションを実施し、お茶の間の認知度と引き合いを一気に高めます。
          ライバルの値下げに対抗し、市場シェアを奪還する切り札となります。
        </p>

        {advertising.boostWeeksRemaining > 0 ? (
          <div className="ad-active-box">
            <IconAd size={24} />
            <div>
              <strong>現在【{advertising.activeCampaign?.toUpperCase()}】広告キャンペーンを実施中！</strong>
              <p>全自社製品の市場魅力度が +{(advertising.boostBasis / 100).toFixed(0)}% ブーストされています（残り {advertising.boostWeeksRemaining} 週間）。</p>
            </div>
          </div>
        ) : null}

        <div className="ad-campaign-options">
          <div className="ad-card">
            <h4>全国テレビCM（テレビコマーシャル）</h4>
            <p>お茶の間のゴールデンタイムにテレビCMを一斉放映。認知度を爆発的に高めます。</p>
            <p className="spec">需要ブースト: <strong>+35%</strong> / 期間: 4週間 / ブランド大幅向上</p>
            <button
              onClick={() => dispatch({ type: 'setAdvertising', campaign: 'tv', budget: 150 })}
              disabled={game.company.accounts.cash < 150}
            >
              テレビCMを打つ（費用 150万円）
            </button>
          </div>

          <div className="ad-card">
            <h4>全国新聞・雑誌一面広告</h4>
            <p>全国紙の一面や週刊誌・業界誌に大々的な広告を掲載。高い信頼性をアピール。</p>
            <p className="spec">需要ブースト: <strong>+20%</strong> / 期間: 4週間 / ブランド向上</p>
            <button
              className="secondary"
              onClick={() => dispatch({ type: 'setAdvertising', campaign: 'newspaper', budget: 80 })}
              disabled={game.company.accounts.cash < 80}
            >
              新聞広告を打つ（費用 80万円）
            </button>
          </div>

          <div className="ad-card">
            <h4>全国店頭・街頭キャンペーン</h4>
            <p>系列店や量販店の店頭で実演即売会やポスター掲示を展開。購買層に直結。</p>
            <p className="spec">需要ブースト: <strong>+12%</strong> / 期間: 4週間</p>
            <button
              className="secondary"
              onClick={() => dispatch({ type: 'setAdvertising', campaign: 'store', budget: 50 })}
              disabled={game.company.accounts.cash < 50}
            >
              店頭キャンペーン（費用 50万円）
            </button>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="03 / 販路" title="売る場所を増やす（流通開拓）">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12, background: '#f5f1e5', padding: '10px 14px', borderLeft: '4px solid #758171' }}>
          <NpcPortrait npcId="shopkeeper" size={56} />
          <div>
            <strong style={{ fontSize: '.9rem' }}>街の電器特約店主</strong>
            <p style={{ margin: '2px 0 0', fontSize: '.84rem', color: '#4a5148' }}>
              「お宅の家電は町内でも評判ですよ！系列店の看板を掲げて、アフターサービスもしっかり面倒見ますんで、どんどん仕入れさせてください。」
            </p>
          </div>
        </div>
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

      <Panel eyebrow="04 / 市場シェアと競合" title="市場争奪戦（需要予測・占有率）">
        <p>自社とライバル3社（光和電機、日之出工業、三嶺電器）とのリアルタイムなシェア比較です。</p>
        <div className="market-overview-grid">
          {forecast.map(market => (
            <div key={market.categoryId} className="market-category-card">
              <h3>{market.categoryName} 市場（全体需要: {market.demandUnits}台/週）</h3>
              <div className="chart-and-table">
                <SharePieChart entries={market.entries} size={160} />
                <div className="market-table-wrap">
                  <table>
                    <thead>
                      <tr><th>会社・製品</th><th>性能</th><th>価格</th><th>占有率</th><th>見込台数</th></tr>
                    </thead>
                    <tbody>
                      {market.entries.map(entry => (
                        <tr key={entry.id} className={entry.owner === 'player' ? 'own' : undefined}>
                          <th scope="row">{entry.name}{entry.owner === 'player' ? '（自社）' : ''}</th>
                          <td>{entry.performance}</td>
                          <td>{formatThousandYen(entry.price)}</td>
                          <td><strong>{formatBasisAsPercent(entry.shareBasis)}</strong></td>
                          <td>{entry.unitsDemanded}台</td>
                        </tr>
                      ))}
                      {market.entries.length === 0 ? (
                        <tr><td colSpan={5}>この市場に参入していません。</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
