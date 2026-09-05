import { useMemo, useState } from 'react';
import { categories, type CategoryId } from '../../../../packages/content/src/categories';
import { economyRules } from '../../../../packages/content/src/rules';
import {
  findModule,
  moduleSlots,
  modulesFor,
  researchThemes,
  techName,
} from '../../../../packages/content/src/technology';
import { defaultModuleIds, evaluateDesign, maxQualityLevel } from '../../../../packages/simulation/src/design';
import { formatMoney, formatThousandYen } from '../../../../packages/simulation/src/money';
import { departmentReports } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import { ExecutiveHeader, MetricGrid, NumberField, Panel } from '../components/ui';
import { useGameStore } from '../store';

export function Lab({ game }: { game: GameState }) {
  const dispatch = useGameStore(store => store.dispatch);
  const report = departmentReports(game).find(entry => entry.executiveId === 'design');
  const owned = game.company.ownedTechIds;

  const [categoryId, setCategoryId] = useState<CategoryId>('refrigerator');
  const [moduleIds, setModuleIds] = useState<string[]>(() => defaultModuleIds('refrigerator'));
  const [quality, setQuality] = useState(1);
  const [name, setName] = useState('あかつき冷蔵庫1号');

  const evaluation = useMemo(
    () => evaluateDesign({ categoryId, moduleIds, qualityLevel: quality, ownedTechIds: owned }),
    [categoryId, moduleIds, quality, owned],
  );

  function changeCategory(next: CategoryId) {
    setCategoryId(next);
    setModuleIds(defaultModuleIds(next));
  }

  function changeModule(slotIndex: number, moduleId: string) {
    setModuleIds(current => current.map((value, index) => (index === slotIndex ? moduleId : value)));
  }

  const research = game.company.research;
  const activeTheme = researchThemes.find(theme => theme.id === research.themeId);

  return (
    <>
      <Panel eyebrow="研究所" title="研究と製品設計">
        {report ? <ExecutiveHeader report={report} /> : null}
      </Panel>

      <Panel eyebrow="01 / 研究" title="研究課題">
        <p>研究予算は週ごとに現金から支払い、そのまま研究ポイントになります。完了すると新しい部品や生産技術が使えます。</p>
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
              const ready = theme.requiredTechIds.every(techId => owned.includes(techId));
              return (
                <tr key={theme.id}>
                  <th scope="row">{theme.name}</th>
                  <td>{theme.requiredPoints}pt</td>
                  <td>{theme.effect}</td>
                  <td>
                    {done ? <span className="done">獲得済み</span> : (
                      <button
                        className="secondary"
                        disabled={!ready || research.themeId === theme.id}
                        onClick={() => dispatch({ type: 'setResearchTheme', themeId: theme.id })}
                      >
                        {research.themeId === theme.id ? '着手中' : ready ? 'この課題にする' : '前提技術が必要'}
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

      <Panel eyebrow="02 / 設計" title="新製品の設計">
        <div className="design-form">
          <label className="field">
            <span>製品分類</span>
            <select value={categoryId} onChange={event => changeCategory(event.target.value as CategoryId)}>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
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

        <p className="module-note">
          {moduleIds.map(moduleId => findModule(moduleId)?.description).filter(Boolean).join(' / ')}
        </p>

        {evaluation.ok ? (
          <>
            <MetricGrid
              metrics={[
                { label: '性能', value: `${evaluation.spec.performance}` },
                { label: '消費電力', value: `${evaluation.spec.energy}`, note: '100が標準' },
                { label: '製造原価', value: formatThousandYen(evaluation.spec.unitCost) },
                { label: '開発期間', value: `${evaluation.spec.devWeeks}週` },
                { label: '開発費', value: formatMoney(evaluation.spec.devCost) },
                { label: '推奨価格', value: formatThousandYen(evaluation.spec.suggestedPrice) },
              ]}
            />
            <button onClick={() => dispatch({ type: 'startDevelopment', name, categoryId, moduleIds, qualityLevel: quality })}>
              この設計で開発を始める
            </button>
          </>
        ) : (
          <p className="warning">！ {evaluation.error}</p>
        )}
        <small>開発費は開発期間に分けて毎週支払います。同時に進められる開発は2件までです。</small>
      </Panel>

      <Panel eyebrow="03 / 開発中" title="進行中の案件">
        {game.company.projects.length === 0 ? <p>進行中の開発はありません。</p> : (
          <table>
            <thead>
              <tr><th>製品</th><th>残り</th><th>開発費</th><th>見込原価</th><th></th></tr>
            </thead>
            <tbody>
              {game.company.projects.map(project => (
                <tr key={project.id}>
                  <th scope="row">{project.name}</th>
                  <td>{project.remainingWeeks}週</td>
                  <td>{formatMoney(project.paidCost)} / {formatMoney(project.devCost)}</td>
                  <td>{formatThousandYen(project.unitCost)}</td>
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
    </>
  );
}
