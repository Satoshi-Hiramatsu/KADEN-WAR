import { useState } from 'react';
import { adCampaigns, findAdCampaign, type AdCampaignId } from '../../../../packages/content/src/advertising';
import { channels } from '../../../../packages/content/src/channels';
import { categories, findCategory, demandUnitsAt, unitsFromWorkload } from '../../../../packages/content/src/categories';
import { weeksPerYear } from '../../../../packages/content/src/rules';
import { formatBasisAsPercent, formatMoney, formatUnitPrice, formatUnits } from '../../../../packages/simulation/src/money';
import { channelCapacityWorkload, forecastProductAtPrice } from '../../../../packages/simulation/src/market';
import { departmentReports, marketForecast } from '../../../../packages/simulation/src/selectors';
import type { GameState, Product } from '../../../../packages/simulation/src/types';
import {
  ExecutiveHeader,
  MetricGrid,
  NumberField,
  Panel,
  SceneBanner,
  ScreenColumn,
  ScreenColumns,
  ProductSprite,
  NpcPortrait,
} from '../components/ui';
import { SharePieChart } from '../components/Charts';
import { IconAd } from '../components/icons';
import { useGameStore } from '../store';

export function SalesOffice({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'sales');
  const products = game.company.products;
  const forecast = marketForecast(game);
  const advertising = game.company.advertising ?? { activeCampaign: null, budget: 0, boostWeeksRemaining: 0, boostBasis: 0 };
  const currentYear = game.startYear + Math.floor(game.week / weeksPerYear);
  const salesWorkload = channelCapacityWorkload(game);
  const ownCategoryIds = new Set(products.map(product => product.categoryId));
  const ownMarkets = forecast.filter(market => ownCategoryIds.has(market.categoryId));
  const otherMarkets = categories
    .filter(category => !ownCategoryIds.has(category.id) && demandUnitsAt(category, currentYear) > 0);

  return (
    <>
      <SceneBanner sceneKey="sales" game={game} eyebrow="販売本部" title="販売戦略・価格・流通チャネル">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
        <MetricGrid
          metrics={[
            { label: '販売能力', value: `${formatUnits(salesWorkload)}工数/週` },
            { label: '先週の販売', value: `${formatUnits(game.lastWeek?.unitsSold ?? 0)}台` },
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

      {/* 価格表は列数が多いため、常に画面幅いっぱいで表示する */}
      <Panel eyebrow="01 / 価格と発売" title="製品の売り方">
        {products.length === 0 ? (
          <p>製品がありません。研究所で開発してください。</p>
        ) : (
          <table>
            <thead>
              <tr><th>製品</th><th>性能</th><th>先進/目新/実用</th><th>原価</th><th>価格</th><th>先週</th><th>販売状態</th><th>操作</th></tr>
            </thead>
            <tbody>
              {products.map(product => {
                const category = findCategory(product.categoryId);
                const priceForecast = forecastProductAtPrice(game, product.id, product.price);
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
                    <td>{product.advancement} / {product.novelty} / {product.practicality}</td>
                    <td>{formatUnitPrice(product.unitCost)}</td>
                    <td>
                      <NumberField
                        label={`${product.name}の価格`}
                        value={product.price}
                        min={1}
                        max={2000000}
                        step={Math.max(1, Math.round((category?.referencePrice ?? 1000) / 100))}
                        suffix="円"
                        onCommit={price => dispatch({ type: 'setPrice', productId: product.id, price })}
                      />
                      <small>
                        標準 {formatUnitPrice(category?.referencePrice ?? 0)}
                        ／販売能力 {category ? formatUnits(unitsFromWorkload(category, salesWorkload)) : 0}台/週
                      </small>
                      {priceForecast ? (
                        <small className="price-forecast">
                          この価格なら想定 <strong>{formatUnits(priceForecast.sellableUnits)}台/週</strong>
                          （占有率{formatBasisAsPercent(priceForecast.shareBasis)}）
                          ・売上{formatMoney(priceForecast.revenue)}
                          ・粗利{formatMoney(priceForecast.grossProfit)}
                        </small>
                      ) : null}
                    </td>
                    <td>
                      {formatUnits(product.lastWeekUnitsSold)}台
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
        <small>
          価格の編集はこの画面に一本化しています。市場の標準価格より安いほど売れやすく、利益は薄くなります。
          「この価格なら想定」は、今すぐこの価格で発売した場合の目安です（在庫・生産計画の制約は含みません）。
        </small>
      </Panel>

      <PricingStrategyPanel game={game} products={products} salesWorkload={salesWorkload} currentYear={currentYear} />

      <ScreenColumns variant="side-first">
        <ScreenColumn>
          <Panel eyebrow="02 / 広告宣伝" title="マーケティング戦略">
            <p>
              店頭の実演から新聞広告、やがてはラジオCM・テレビCMへ。
              打てる媒体はその年に世の中にあるものだけで、時代が進むほど手が増えていきます。
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

            {products.length === 0 ? (
              <p>宣伝する製品がまだありません。まずは研究所で製品を開発してください。</p>
            ) : (
              <div className="ad-campaign-options">
                {adCampaigns.map(campaign => {
                  const usable = currentYear >= campaign.availableFrom;
                  return (
                    <div className={usable ? 'ad-card' : 'ad-card locked'} key={campaign.id}>
                      <h4>{campaign.name}</h4>
                      <p>{campaign.description}</p>
                      <p className="spec">
                        需要ブースト: <strong>+{Math.round(campaign.boostBasis / 100)}%</strong> / 期間: 4週間
                        {usable ? '' : ` / ${campaign.availableFrom}年から`}
                      </p>
                      <button
                        className={campaign.id === 'tv' ? undefined : 'secondary'}
                        onClick={() => dispatch({ type: 'setAdvertising', campaign: campaign.id, budget: campaign.cost })}
                        disabled={!usable || game.company.accounts.cash < campaign.cost}
                      >
                        {usable
                          ? `${campaign.name}を打つ（費用 ${campaign.cost}万円）`
                          : `${campaign.availableFrom}年まで打てない`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          <Panel eyebrow="03 / 販路" title="売る場所を増やす（流通開拓）">
            <div className="npc-callout">
              <NpcPortrait npcId="shopkeeper" size={48} />
              <p>
                <strong>街の電器特約店主</strong>：「お宅の家電は町内でも評判ですよ！系列店の看板を掲げて、アフターサービスもしっかり面倒見ますんで、どんどん仕入れさせてください。」
              </p>
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
                    <td>{formatUnits(channel.capacityPerUnit)}工数/週</td>
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
            <small>
              販路の能力も生産と同じ「工数」で数えます。1店で乾電池なら数万本、白黒テレビなら数十台をさばける計算です。
              販路がないと発売できません。販売能力を超えた分は売れ残ります。
            </small>
          </Panel>
        </ScreenColumn>
      </ScreenColumns>

      <Panel eyebrow="04 / 市場シェアと競合" title="市場争奪戦（需要予測・占有率）">
        <p>自社が参入している市場での、ライバル3社（光和電機、日之出工業、三嶺電器）とのシェア比較です。</p>
        <div className="market-overview-grid">
          {ownMarkets.map(market => (
            <div key={market.categoryId} className="market-category-card">
              <h3>{market.categoryName} 市場（全体需要: {formatUnits(market.demandUnits)}台/週）</h3>
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
                          <td>{formatUnitPrice(entry.price)}</td>
                          <td><strong>{formatBasisAsPercent(entry.shareBasis)}</strong></td>
                          <td>{formatUnits(entry.unitsDemanded)}台</td>
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
          {ownMarkets.length === 0 ? <p>まだどの市場にも参入していません。研究所で製品を開発してください。</p> : null}
        </div>
      </Panel>

      <Panel eyebrow="05 / 未参入市場" title="いま世の中で売られているもの">
        <p>この年に売られている製品分類と、その市場規模です。参入していない市場は空白のまま他社に取られています。</p>
        <div className="market-table-wrap">
          <table>
            <thead>
              <tr><th>製品分類</th><th>発売年</th><th>市場規模</th><th>標準価格</th><th>100台の工数</th></tr>
            </thead>
            <tbody>
              {otherMarkets.map(category => (
                <tr key={category.id}>
                  <th scope="row">{category.name}</th>
                  <td>{category.availableFrom}年</td>
                  <td>{formatUnits(demandUnitsAt(category, currentYear))}台/週</td>
                  <td>{formatUnitPrice(category.referencePrice)}</td>
                  <td>{category.workloadPer100Units}工数</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

const priceScenarios: { label: string; delta: number }[] = [
  { label: '-20%', delta: -0.2 },
  { label: '-10%', delta: -0.1 },
  { label: '現在の価格', delta: 0 },
  { label: '+10%', delta: 0.1 },
  { label: '+20%', delta: 0.2 },
];

type AdScenarioId = 'current' | 'none' | AdCampaignId;

/** 価格帯・広告条件を変えたときの見込みをその場で比較する、実際には反映されない試算パネル。 */
function PricingStrategyPanel({
  game,
  products,
  salesWorkload,
  currentYear,
}: {
  game: GameState;
  products: Product[];
  salesWorkload: number;
  currentYear: number;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [adScenario, setAdScenario] = useState<AdScenarioId>('current');
  const product = products.find(candidate => candidate.id === productId) ?? products[0];

  if (!product) {
    return (
      <Panel eyebrow="01.5 / 戦略検討" title="価格・広告シミュレーター">
        <p>製品ができたら、価格帯や広告条件を変えたときの見込みをここで比較できます。</p>
      </Panel>
    );
  }

  const category = findCategory(product.categoryId);
  const advertisingBoostBasisOverride = adScenario === 'current'
    ? undefined
    : adScenario === 'none'
      ? 0
      : findAdCampaign(adScenario)?.boostBasis ?? 0;

  return (
    <Panel eyebrow="01.5 / 戦略検討" title="価格・広告シミュレーター">
      <p>価格を変えたとき、広告を打ったときにどれだけ変わるかをその場で試算します。ここで選んでも実際の価格・広告には反映されません。</p>
      <div className="actions strategy-controls">
        <label className="field">
          <span>比較する製品</span>
          <select value={product.id} onChange={event => setProductId(event.target.value)}>
            {products.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>広告条件の仮定</span>
          <select value={adScenario} onChange={event => setAdScenario(event.target.value as AdScenarioId)}>
            <option value="current">
              現状のまま{game.company.advertising.boostWeeksRemaining > 0 ? '（実施中）' : '（未実施）'}
            </option>
            <option value="none">広告なしと仮定</option>
            {adCampaigns.filter(campaign => campaign.availableFrom <= currentYear).map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}を打つと仮定（需要+{Math.round(campaign.boostBasis / 100)}%）
              </option>
            ))}
          </select>
        </label>
      </div>
      <table>
        <thead>
          <tr><th>価格帯</th><th>価格</th><th>占有率</th><th>想定販売台数</th><th>想定売上</th><th>想定粗利</th></tr>
        </thead>
        <tbody>
          {priceScenarios.map(scenario => {
            const price = Math.max(1, Math.round(product.price * (1 + scenario.delta)));
            const result = forecastProductAtPrice(game, product.id, price, advertisingBoostBasisOverride);
            return (
              <tr key={scenario.label} className={scenario.delta === 0 ? 'own' : undefined}>
                <th scope="row">{scenario.label}</th>
                <td>{formatUnitPrice(price)}</td>
                <td>{result ? formatBasisAsPercent(result.shareBasis) : '-'}</td>
                <td>{result ? `${formatUnits(result.sellableUnits)}台` : '-'}</td>
                <td>{result ? formatMoney(result.revenue) : '-'}</td>
                <td>{result ? formatMoney(result.grossProfit) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <small>
        標準価格{category ? formatUnitPrice(category.referencePrice) : '-'}
        ／販売能力{category ? formatUnits(unitsFromWorkload(category, salesWorkload)) : 0}台/週を踏まえた試算です。
        在庫や生産計画の上限は考慮していません。
      </small>
    </Panel>
  );
}
