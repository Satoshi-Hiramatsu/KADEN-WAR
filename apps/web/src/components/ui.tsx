import type { ReactNode } from 'react';
import { findExecutive, type ExecutiveId } from '../../../../packages/content/src/executives';
import { findMeetingCast, type MeetingCastId } from '../../../../packages/content/src/meetingCast';
import type { DepartmentReport } from '../../../../packages/simulation/src/selectors';
import type { GameState } from '../../../../packages/simulation/src/types';
import {
  getExecutivePortraitUrl,
  getContextualPortrait,
  getMeetingCastPortraitUrl,
  getProductSpriteUrl,
  getRivalPortraitUrl,
  getNpcPortraitUrl,
  getSceneBackgroundUrl,
  type ExecutiveExpression,
  type RivalSentiment,
  type NpcId,
  type SceneKey,
} from '../assets';

export function Portrait({
  executiveId,
  expression = 'normal',
  game,
  size = 72,
}: {
  executiveId: ExecutiveId;
  expression?: ExecutiveExpression;
  game?: GameState;
  size?: number;
}) {
  const executive = findExecutive(executiveId);
  const src = game
    ? getContextualPortrait(executiveId, game)
    : getExecutivePortraitUrl(executiveId, expression);

  return (
    <img
      src={src}
      alt={`${executive.role} ${executive.name}`}
      className="portrait-img"
      style={{ width: size, height: size, objectFit: 'cover' }}
    />
  );
}

export function ExecutiveHeader({
  report,
  game,
}: {
  report: DepartmentReport;
  game?: GameState;
}) {
  return (
    <div className="executive">
      <Portrait executiveId={report.executiveId} game={game} />
      <div>
        <p className="executive-name">
          <span className="role">{report.role}</span> {report.name}
        </p>
        <p className="executive-line">{report.headline}</p>
        {report.warnings.map(warning => (
          <p className="warning" key={warning}>！ {warning}</p>
        ))}
      </div>
    </div>
  );
}

export function MeetingCastPortrait({ id, size = 72 }: { id: MeetingCastId; size?: number }) {
  const cast = findMeetingCast(id);
  return (
    <img
      src={getMeetingCastPortraitUrl(id)}
      alt={`${cast.role} ${cast.name}`}
      className="portrait-img"
      style={{ width: size, height: size, objectFit: 'cover' }}
    />
  );
}

export function ProductSprite({
  categoryId,
  year = 1960,
  size = 'md',
  alt = '',
}: {
  categoryId: string;
  year?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  alt?: string;
}) {
  const src = getProductSpriteUrl(categoryId, year);
  return (
    <img
      src={src}
      alt={alt}
      className={`product-sprite size-${size}`}
      loading="lazy"
    />
  );
}

export function RivalPortrait({
  rivalId,
  sentiment = 'normal',
  size = 56,
}: {
  rivalId: string;
  sentiment?: RivalSentiment;
  size?: number;
}) {
  const src = getRivalPortraitUrl(rivalId, sentiment);
  return (
    <img
      src={src}
      alt={rivalId}
      className="rival-portrait-img"
      style={{ width: size, height: size, objectFit: 'cover' }}
      loading="lazy"
    />
  );
}

export function NpcPortrait({
  npcId,
  size = 56,
}: {
  npcId: NpcId;
  size?: number;
}) {
  const src = getNpcPortraitUrl(npcId);
  return (
    <img
      src={src}
      alt={npcId}
      className="npc-portrait-img"
      style={{ width: size, height: size, objectFit: 'cover' }}
      loading="lazy"
    />
  );
}

export function SceneBanner({
  sceneKey,
  game,
  title,
  eyebrow,
  children,
}: {
  sceneKey: SceneKey;
  game?: GameState;
  title?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  const bgUrl = getSceneBackgroundUrl(sceneKey, game);
  return (
    <>
      <div className="scene-header-bar">
        {eyebrow ? <p className="scene-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="scene-title">{title}</h2> : null}
      </div>
      <div className="scene-banner" style={{ backgroundImage: `url(${bgUrl})` }}>
        <div className="scene-overlay">
          {children}
        </div>
      </div>
    </>
  );
}

export function MetricGrid({ metrics }: { metrics: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="metrics">
      {metrics.map(metric => (
        <div key={`${metric.label}-${metric.value}`}>
          <dt>{metric.label}</dt>
          <dd>
            {metric.value}
            {metric.note ? <small>{metric.note}</small> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Panel({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ProgressBar({ ratio, achieved }: { ratio: number; achieved: boolean }) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <div className="bar" aria-hidden="true">
      <span className={achieved ? 'bar-fill done' : 'bar-fill'} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function NumberField(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onCommit: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        onChange={event => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) return;
          props.onCommit(Math.trunc(parsed));
        }}
      />
      {props.suffix ? <span className="suffix">{props.suffix}</span> : null}
    </label>
  );
}
