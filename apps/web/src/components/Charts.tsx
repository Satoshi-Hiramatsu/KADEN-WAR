import type { MarketEntry } from '../../../../packages/simulation/src/market';

type ShareChartProps = {
  entries: MarketEntry[];
  size?: number;
};

const companyColors: Record<string, string> = {
  player: '#2f6b45',       // 自社（エメラルドグリーン）
  'rival-kowa': '#d9531e',  // 光和電機（オレンジ）
  'rival-hinode': '#204a87',// 日之出工業（インディゴ）
  'rival-mine': '#b8860b',  // 三嶺電器（ゴールド）
};

/**
 * 市場シェアを可視化するSVGドーナツチャート。
 * 外部ライブラリを使わず、純粋なSVGパスで描画。
 */
export function SharePieChart({ entries, size = 180 }: ShareChartProps) {
  const total = entries.reduce((sum, e) => sum + e.shareBasis, 0);
  if (total <= 0) {
    return (
      <div className="chart-empty" style={{ width: size, height: size }}>
        <span>シェアデータなし</span>
      </div>
    );
  }

  const radius = size / 2;
  const innerRadius = radius * 0.55; // ドーナツの穴
  const center = radius;

  let currentAngle = -Math.PI / 2; // 真上から開始

  const slices = entries.map(entry => {
    const fraction = entry.shareBasis / total;
    const angle = fraction * 2 * Math.PI;
    const endAngle = currentAngle + angle;

    const x1 = center + radius * Math.cos(currentAngle);
    const y1 = center + radius * Math.sin(currentAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(currentAngle);
    const iy2 = center + innerRadius * Math.sin(currentAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;
    const color = entry.owner === 'player' ? companyColors.player : (companyColors[entry.id] ?? '#7f8c8d');

    return {
      id: entry.id,
      name: entry.name,
      share: (entry.shareBasis / 100).toFixed(1),
      pathData,
      color,
    };
  });

  return (
    <div className="share-chart-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map(slice => (
          <path
            key={slice.id}
            d={slice.pathData}
            fill={slice.color}
            stroke="#fffcf4"
            strokeWidth="1.5"
          >
            <title>{`${slice.name}: ${slice.share}%`}</title>
          </path>
        ))}
        {/* 中央テキスト */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#5e6456"
        >
          市場占有率
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#888"
        >
          全社計100%
        </text>
      </svg>
      <ul className="chart-legend">
        {slices.map(slice => (
          <li key={slice.id}>
            <span className="legend-badge" style={{ backgroundColor: slice.color }} />
            <span className="legend-name">{slice.name}</span>
            <span className="legend-val">{slice.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 簡易SVG横棒グラフ（シェア比較バー）
 */
export function ShareBarChart({ entries }: { entries: MarketEntry[] }) {
  const total = entries.reduce((sum, e) => sum + e.shareBasis, 0);
  if (total <= 0) return null;

  return (
    <div className="share-bar-container">
      <div className="share-bar-track">
        {entries.map(entry => {
          const pct = ((entry.shareBasis / total) * 100).toFixed(1);
          const color = entry.owner === 'player' ? companyColors.player : (companyColors[entry.id] ?? '#7f8c8d');
          return (
            <div
              key={entry.id}
              className="share-bar-segment"
              style={{ width: `${pct}%`, backgroundColor: color }}
              title={`${entry.name}: ${pct}%`}
            />
          );
        })}
      </div>
    </div>
  );
}
