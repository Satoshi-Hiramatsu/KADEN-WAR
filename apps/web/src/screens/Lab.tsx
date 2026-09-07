import { useMemo, useState } from 'react';
import {
  categories,
  categorySegments,
  findCategory,
  unitsFromWorkload,
  type CategoryId,
} from '../../../../packages/content/src/categories';
import { economyRules, weeksPerYear } from '../../../../packages/content/src/rules';
import {
  findModule,
  moduleSlots,
  modulesFor,
  researchThemes,
  techName,
} from '../../../../packages/content/src/technology';
import { defaultModuleIds, evaluateDesign, maxQualityLevel } from '../../../../packages/simulation/src/design';
import { formatMoney, formatUnitPrice, formatUnits } from '../../../../packages/simulation/src/money';
import { departmentReports } from '../../../../packages/simulation/src/selectors';
import { productionCapacityWorkload } from '../../../../packages/simulation/src/week';
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

/** その年・その技術で設計できる分類を、分野ごとにまとめて選択肢にする。 */
function designableCategories(year: number, owned: readonly string[]) {
  return categories.filter(category => category.availableFrom <= year && owned.includes(category.requiredTechId));
}

export function Lab({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const setScreen = useGameStore(store => store.setScreen);
  const setDevelopmentDraft = useGameStore(store => store.setDevelopmentDraft);
  const report = departmentReports(game).find(entry => entry.executiveId === 'design');
  const owned = game.company.ownedTechIds;
  const currentYear = game.startYear + Math.floor(game.week / weeksPerYear);

  const designable = useMemo(() => designableCategories(currentYear, owned), [currentYear, owned]);
  const firstDesignable = designable[0]?.id ?? 'battery-dry';

  const [categoryId, setCategoryId] = useState<CategoryId>(firstDesignable);
  const [moduleIds, setModuleIds] = useState<string[]>(() => defaultModuleIds(firstDesignable));
  const [quality, setQuality] = useState(1);
  const [name, setName] = useState(() => `${findCategory(firstDesignable)?.name ?? ''}1号`);

  // 年や技術が進んで今の選択が設計できなくなったら、先頭の分類へ戻す。
  const selected = designable.find(category => category.id === categoryId);
  if (!selected && designable[0] && categoryId !== designable[0].id) {
    changeCategory(designable[0].id);
  }
  const category = selected ?? designable[0] ?? findCategory('battery-dry');

  const evaluation = useMemo(
    () => evaluateDesign({ categoryId, moduleIds, qualityLevel: quality, ownedTechIds: owned, currentYear }),
    [categoryId, moduleIds, quality, owned, currentYear],
  );

  function changeCategory(next: CategoryId) {
    setCategoryId(next);
    setModuleIds(defaultModuleIds(next));
    setName(`${findCategory(next)?.name ?? ''}1号`);
  }

  function changeModule(slotIndex: number, moduleId: string) {
    setModuleIds(current => current.map((value, index) => (index === slotIndex ? moduleId : value)));
  }

  const research = game.company.research;
  const activeTheme = researchThemes.find(theme => theme.id === research.themeId);
  const releasedProducts = game.company.products.filter(p => p.releasedWeek !== null);
  const capacity = productionCapacityWorkload(game);
  const weeklyBuildable = category ? unitsFromWorkload(category, capacity) : 0;

  const upcoming = categories.filter(
    entry => entry.availableFrom > currentYear && entry.availableFrom <= currentYear + 3,
  );

  return (
    <>
      <SceneBanner sceneKey="lab" game={game} eyebrow="研究所" title="研究開発と製品設計">
        {report ? <ExecutiveHeader report={report} game={game} /> : null}
      </SceneBanner>

      <ScreenColumns variant="side-first">
        <ScreenColumn>
          <Panel eyebrow="01 / 研究" title="研究課題">
            <p>研究予算は週ごとに現金から支払い、そのまま研究ポイントになります。完了すると新しい製品分類・部品・生産技術が使えます。</p>
            <NumberField
              label="研究予算"
              value={research.weeklyBudget}
              min={0}
              max={economyRules.maxResearchBudget}
              step={5}
              suffix="万円/週"
              onCommit={amount => dispatch({ type: 'setResearchBudget', amount })}
            />
            {activeTheme ? (
              <p className="date">
                進行中：{activeTheme.name}（{research.points} / {activeTheme.requiredPoints}ポイント）
              </p>
            ) : (
              <p className="date">課題は未設定です。</p>
            )}
            <table>
              <caption>選べる研究課題</caption>
              <thead>
                <tr><th>課題</th><th>必要</th><th>効果</th><th></th></tr>
              </thead>
              <tbody>
                {researchThemes.map(theme => {
                  const done = owned.includes(theme.grantsTechId);
                  const hasPrereq = theme.requiredTechIds.every(techId => owned.includes(techId));
                  const inEra = currentYear >= theme.minYear;
                  const ready = hasPrereq && inEra;
                  return (
                    <tr key={theme.id}>
                      <th scope="row">
                        {theme.name}
                        {theme.minYear > game.startYear ? <small>{theme.minYear}年〜</small> : null}
                      </th>
                      <td>{theme.requiredPoints}pt</td>
                      <td>{theme.effect}</td>
                      <td>
                        {done ? <span className="done">獲得済み</span> : (
                          <button
                            className="secondary"
                            disabled={!ready || research.themeId === theme.id}
                            onClick={() => dispatch({ type: 'setResearchTheme', themeId: theme.id })}
                          >
                            {research.themeId === theme.id
                              ? '着手中'
                              : !inEra
                                ? `${theme.minYear}年まで待つ`
                                : ready ? 'この課題にする' : '前提技術が必要'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="tech-list">
              保有技術：{owned.map(techId => techName(techId)).join('、')}
            </p>
          </Panel>
        </ScreenColumn>

        <ScreenColumn>
          <Panel eyebrow="02 / 設計" title="新製品の設計">
            <div className="design-preview-container">
              <div className="product-pedestal">
                <ProductSprite categoryId={categoryId} year={currentYear} size="hero" alt={name} />
                <small style={{ fontWeight: 'bold', marginTop: 6 }}>{name}</small>
              </div>

              <div className="design-form">
                <label className="field">
                  <span>製品分類</span>
                  <select value={categoryId} onChange={event => changeCategory(event.target.value as CategoryId)}>
                    {categorySegments.map(segment => {
                      const options = designable.filter(entry => entry.segment === segment.id);
                      if (options.length === 0) return null;
                      return (
                        <optgroup key={segment.id} label={segment.name}>
                          {options.map(entry => (
                            <option key={entry.id} value={entry.id}>{entry.name}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </label>
                {moduleSlots.map((slot, index) => (
                  <label className="field" key={slot.id}>
                    <span>{slot.name}</span>
                    <select
                      value={moduleIds[index] ?? ''}
                      onChange={event => changeModule(index, event.target.value)}
                    >
                      {modulesFor(categoryId, slot.id).map(module => {
                        const locked = module.requiredTechId !== null && !owned.includes(module.requiredTechId);
                        return (
                          <option key={module.id} value={module.id} disabled={locked}>
                            {module.name}{locked ? '（未解禁）' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                ))}
                <label className="field">
                  <span>品質投資</span>
                  <select value={quality} onChange={event => setQuality(Number(event.target.value))}>
                    {Array.from({ length: maxQualityLevel + 1 }, (_, level) => (
                      <option key={level} value={level}>段階{level}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>製品名</span>
                  <input type="text" value={name} maxLength={24} onChange={event => setName(event.target.value)} />
                </label>
              </div>
            </div>

            {category ? (
              <p className="module-note">
                {category.description}
                （市場の標準価格{formatUnitPrice(category.referencePrice)}／100台あたり{category.workloadPer100Units}工数。
                いまの工場なら週{formatUnits(weeklyBuildable)}台まで作れます）
              </p>
            ) : null}
            <p className="module-note">
              {moduleIds.map(moduleId => findModule(moduleId)?.description).filter(Boolean).join(' / ')}
            </p>

            {evaluation.ok ? (
              <>
                <MetricGrid
                  metrics={[
                    { label: '性能', value: `${evaluation.spec.performance}` },
                    { label: '消費電力', value: `${evaluation.spec.energy}`, note: '100が標準' },
                    { label: '製造原価', value: formatUnitPrice(evaluation.spec.unitCost) },
                    { label: '開発期間', value: `${evaluation.spec.devWeeks}週` },
                    { label: '開発費', value: formatMoney(evaluation.spec.devCost) },
                    { label: '推奨価格', value: formatUnitPrice(evaluation.spec.suggestedPrice) },
                  ]}
                />
                <button
                  onClick={() => {
                    setDevelopmentDraft({ categoryId, moduleIds, qualityLevel: quality, name, featureIds: [] });
                    setScreen('developmentMeeting');
                  }}
                >
                  この設計で開発会議にかける
                </button>
              </>
            ) : (
              <p className="warning">！ {evaluation.error}</p>
            )}
            <small>
              開発費は開発期間に分けて毎週支払います。同時に進められる開発は2件までです。
              開発会議では追加の付加価値項目を選び、設計・生産・販売の各統括や社長の反応を見てから正式に着手します。
            </small>
          </Panel>

          {upcoming.length > 0 ? (
            <Panel eyebrow="03 / 時代" title="まもなく世に出る製品">
              <p>研究が進んでも、世の中に出ていない製品は作れません。近く手が届く分類は次のとおりです。</p>
              <ul className="upcoming-list">
                {upcoming.map(entry => (
                  <li key={entry.id}>
                    <strong>{entry.availableFrom}年</strong>：{entry.name}
                    <small>（必要な技術：{techName(entry.requiredTechId)}）</small>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel eyebrow="04 / 開発中" title="進行中の案件">
            {game.company.projects.length === 0 ? <p>進行中の開発はありません。</p> : (
              <table>
                <thead>
                  <tr><th>製品</th><th>残り</th><th>開発費</th><th>見込原価</th><th>先進/目新/実用</th><th></th></tr>
                </thead>
                <tbody>
                  {game.company.projects.map(project => (
                    <tr key={project.id}>
                      <th scope="row">
                        <div className="product-cell">
                          <ProductSprite categoryId={project.categoryId} year={currentYear} size="sm" />
                          <span>{project.name}</span>
                        </div>
                      </th>
                      <td>{project.remainingWeeks}週</td>
                      <td>{formatMoney(project.paidCost)} / {formatMoney(project.devCost)}</td>
                      <td>{formatUnitPrice(project.unitCost)}</td>
                      <td>{project.advancement} / {project.novelty} / {project.practicality}</td>
                      <td>
                        <button className="secondary" onClick={() => dispatch({ type: 'cancelDevelopment', projectId: project.id })}>
                          中止
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <small>中止しても支払済みの開発費は戻りません。</small>
          </Panel>

          {releasedProducts.length > 0 ? (
            <Panel eyebrow="05 / 改良" title="マイナーチェンジ（鮮度回復）">
              <p>発売から時間が経過して市場での鮮度が低下した製品に改良を加えます。50万円の費用で鮮度が全回復し、性能がわずかに向上します。</p>
              <table>
                <thead>
                  <tr><th>製品</th><th>発売週</th><th>経過週数</th><th>性能</th><th></th></tr>
                </thead>
                <tbody>
                  {releasedProducts.map(product => {
                    const elapsed = Math.max(0, game.week - (product.releasedWeek ?? 0));
                    return (
                      <tr key={product.id}>
                        <th scope="row">
                          <div className="product-cell">
                            <ProductSprite categoryId={product.categoryId} year={currentYear} size="sm" />
                            <span>{product.name}</span>
                          </div>
                        </th>
                        <td>{product.releasedWeek ? product.releasedWeek + 1 : 0}週</td>
                        <td>{elapsed}週間経過</td>
                        <td>{product.performance}</td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() => dispatch({ type: 'minorChangeProduct', productId: product.id })}
                            disabled={game.company.accounts.cash < 50}
                          >
                            改良する（50万円）
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          ) : null}
        </ScreenColumn>
      </ScreenColumns>
    </>
  );
}
