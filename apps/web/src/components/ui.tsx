import type { ReactNode } from 'react';
import rosterUrl from '../../../../assets/portraits/executives-roster-v1.png';
import { findExecutive, type ExecutiveId } from '../../../../packages/content/src/executives';
import type { DepartmentReport } from '../../../../packages/simulation/src/selectors';

const portraitSize = 72;

/**
 * 承認済みの顔一覧原画から1人分を切り出して表示する。
 * 個別スプライトはS9で制作するため、ここでは表示位置だけで切り出す。
 */
export function Portrait({ executiveId }: { executiveId: ExecutiveId }) {
  const executive = findExecutive(executiveId);
  return (
    <span
      className="portrait"
      role="img"
      aria-label={`${executive.role} ${executive.name}`}
      style={{
        width: portraitSize,
        height: portraitSize,
        backgroundImage: `url(${rosterUrl})`,
        backgroundSize: `${portraitSize * 3}px ${portraitSize * 2}px`,
        backgroundPosition: `-${executive.portrait.column * portraitSize}px -${executive.portrait.row * portraitSize}px`,
      }}
    />
  );
}

export function ExecutiveHeader({ report }: { report: DepartmentReport }) {
  return (
    <div className="executive">
      <Portrait executiveId={report.executiveId} />
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
