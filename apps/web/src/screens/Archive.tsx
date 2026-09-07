import { findCategory } from '../../../../packages/content/src/categories';
import { weeksPerYear } from '../../../../packages/content/src/rules';
import { formatBasisAsPercent, formatMoney, formatUnitPrice } from '../../../../packages/simulation/src/money';
import type { GameState } from '../../../../packages/simulation/src/types';
import { Panel, SceneBanner, ProductSprite } from '../components/ui';
import { IconTrophy } from '../components/icons';

export function Archive({ game }: { game: GameState }) {
  const archive = game.company.archive ?? [];
  const currentProducts = game.company.products;
  const currentYear = game.startYear + Math.floor(game.week / weeksPerYear);

  return (
    <>
      <SceneBanner sceneKey="archive" game={game} eyebrow="製品アーカイブ" title="歴代名機図鑑・社史殿堂">
        <div className="archive-hero">
          <IconTrophy size={32} />
          <div>
            <p className="lead-text">
              我が社が生み出し、日本の暮らしを変えてきた歴代製品の記録です。
              開発された名機たちの生涯販売実績、市場占有率、受賞歴がここに刻まれます。
            </p>
          </div>
        </div>
      </SceneBanner>

      <Panel eyebrow="01 / 現役ラインナップ" title="現在発売中の主力製品">
        {currentProducts.length === 0 ? (
          <p>現在販売中の製品はありません。研究所で新機種を開発してください。</p>
        ) : (
          <div className="archive-grid">
            {currentProducts.map(product => {
              const category = findCategory(product.categoryId);
              return (
                <article key={product.id} className="archive-card active">
                  <div className="archive-card-header">
                    <div className="product-pedestal">
                      <ProductSprite categoryId={product.categoryId} year={currentYear} size="md" alt={product.name} />
                    </div>
                    <div>
                      <span className="badge-active">現役主力機</span>
                      <h3>{product.name}</h3>
                      <small>{category?.name}</small>
                    </div>
                  </div>
                  <dl className="archive-specs">
                    <div><dt>性能指数</dt><dd>{product.performance}</dd></div>
                    <div><dt>先進/目新/実用</dt><dd>{product.advancement} / {product.novelty} / {product.practicality}</dd></div>
                    <div><dt>販売価格</dt><dd>{formatUnitPrice(product.price)}</dd></div>
                    <div><dt>累計販売数</dt><dd>{product.totalUnitsSold}台</dd></div>
                    <div><dt>累計売上高</dt><dd>{formatMoney(product.totalRevenue)}</dd></div>
                    <div><dt>直近占有率</dt><dd>{formatBasisAsPercent(product.lastWeekShareBasis)}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel eyebrow="02 / 殿堂入り" title="歴代名機アーカイブ">
        {archive.length === 0 ? (
          <p>まだ引退した製品はありません。製品が役目を終えて引退すると、ここに記録されます。</p>
        ) : (
          <div className="archive-grid">
            {archive.map(item => {
              const category = findCategory(item.categoryId);
              const releaseYear = game.startYear + Math.floor(item.releasedWeek / weeksPerYear);
              return (
                <article key={item.id} className={`archive-card rank-${item.rank.toLowerCase()}`}>
                  <div className="archive-card-header">
                    <div className="product-pedestal">
                      <ProductSprite categoryId={item.categoryId} year={releaseYear} size="md" alt={item.name} />
                    </div>
                    <div>
                      <div className="archive-badges">
                        <span className={`rank-badge rank-${item.rank.toLowerCase()}`}>
                          ランク {item.rank}
                        </span>
                        {item.awards.map(award => (
                          <span key={award} className="award-badge">
                            <IconTrophy size={12} /> {award}
                          </span>
                        ))}
                      </div>
                      <h3>{item.name}</h3>
                      <small>{category?.name}（{item.releasedWeek + 1}週〜{item.retiredWeek ? `${item.retiredWeek + 1}週` : '現在'}）</small>
                    </div>
                  </div>

                  <p className="archive-review">“{item.review}”</p>

                  <dl className="archive-specs">
                    <div><dt>生涯販売数</dt><dd>{item.totalUnitsSold}台</dd></div>
                    <div><dt>最高シェア</dt><dd>{formatBasisAsPercent(item.peakShareBasis)}</dd></div>
                    <div><dt>生涯売上高</dt><dd>{formatMoney(item.totalRevenue)}</dd></div>
                    <div><dt>獲得利益</dt><dd>{formatMoney(item.totalProfit)}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
