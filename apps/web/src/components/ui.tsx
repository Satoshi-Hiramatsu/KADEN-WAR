import { useEffect, useState, type ReactNode } from 'react';
import { findCategory } from '../../../../packages/content/src/categories';
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
  year = 1950,
  size = 'md',
  alt = '',
}: {
  categoryId: string;
  year?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  alt?: string;
}) {
  const src = getProductSpriteUrl(categoryId, year);
  // 原画のない分類（乾電池・照明・玩具など）は、別製品の絵を流用せず分類名の略号で示す。
  if (src === null) {
    const category = findCategory(categoryId);
    return (
      <span
        className={`product-sprite size-${size} product-sprite-fallback`}
        role="img"
        aria-label={alt || category?.name || categoryId}
        title={category?.name ?? categoryId}
      >
        {category?.shortName ?? '？'}
      </span>
    );
  }
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

/* 拠点ヘッダーの背景バナー（担当役員の顔つき）は縦を大きく占有するため、
   プレイヤーが畳めるようにして、その状態を端末に記憶する。 */
const BANNER_PREF_KEY = 'kadenwar.sceneBanner';

function readBannerPreference(): boolean {
  try {
    return window.localStorage.getItem(BANNER_PREF_KEY) !== 'collapsed';
  } catch {
    return true;
  }
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
  const [open, setOpen] = useState(readBannerPreference);

  useEffect(() => {
    try {
      window.localStorage.setItem(BANNER_PREF_KEY, open ? 'open' : 'collapsed');
    } catch {
      /* 保存できない環境では何もしない */
    }
  }, [open]);

  const bgUrl = getSceneBackgroundUrl(sceneKey, game);
  const hasBody = Boolean(children);

  /* 見出し帯は画面全体でスクロール追従させたいので、余計な包み要素は作らない。 */
  return (
    <>
      <div className="scene-header-bar">
        <div className="scene-header-text">
          {eyebrow ? <p className="scene-eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="scene-title">{title}</h2> : null}
        </div>
        {hasBody ? (
          <button
            type="button"
            className="scene-toggle"
            onClick={() => setOpen(prev => !prev)}
            aria-expanded={open}
            title={open ? '担当者パネルを畳んで作業領域を広げる' : '担当者パネルを開く'}
          >
            {open ? '担当者を畳む ▲' : '担当者を開く ▼'}
          </button>
        ) : null}
      </div>
      {hasBody && open ? (
        <div className="scene-banner" style={{ backgroundImage: `url(${bgUrl})` }}>
          <div className="scene-overlay">
            {children}
          </div>
        </div>
      ) : null}
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

/** 見出しをクリックすると本文を畳める区画。長い画面でも目的の項目へ素早く辿り着ける。 */
export function Panel({
  title,
  eyebrow,
  children,
  defaultOpen = true,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className={className ? `panel ${className}` : 'panel'}
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
    >
      <summary className="panel-summary">
        <span className="panel-summary-main">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <span className="panel-heading">{title}</span>
        </span>
        <span className="panel-chevron" aria-hidden="true" />
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

/** パネルの中でさらに項目を束ねる、小見出し付きの折りたたみ。 */
export function Collapsible({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className={className ? `collapsible ${className}` : 'collapsible'}
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
    >
      <summary className="collapsible-summary">
        <span className="collapsible-title">{title}</span>
        <span className="panel-chevron" aria-hidden="true" />
      </summary>
      <div className="collapsible-body">{children}</div>
    </details>
  );
}

/** 広い画面で左右2カラムに分けるレイアウト枠。狭い画面では自動的に1カラムへ戻る。 */
export function ScreenColumns({
  children,
  variant = 'main-first',
}: {
  children: ReactNode;
  variant?: 'main-first' | 'side-first' | 'even';
}) {
  return <div className={`screen-columns ${variant}`}>{children}</div>;
}

export function ScreenColumn({
  children,
  sticky = false,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return <div className={sticky ? 'screen-col sticky' : 'screen-col'}>{children}</div>;
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
