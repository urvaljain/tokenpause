import type { TrendPoint } from '../../data/funnel';

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 30, left: 34 };

type Props = {
  points: TrendPoint[];
};

/**
 * Illustrative 14-day trend. Series are distinguished by marker shape as well
 * as colour, and the same numbers are available as a table below the chart.
 */
export function TrendChart({ points }: Props) {
  const max = Math.ceil(Math.max(...points.map((p) => p.started)) / 5) * 5;
  const plotW = WIDTH - PADDING.left - PADDING.right;
  const plotH = HEIGHT - PADDING.top - PADDING.bottom;

  const x = (index: number) => PADDING.left + (index / (points.length - 1)) * plotW;
  const y = (value: number) => PADDING.top + plotH - (value / max) * plotH;

  const line = (key: 'started' | 'completed') =>
    points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point[key])}`).join(' ');

  const gridValues = [0, max / 2, max];

  return (
    <>
      <svg
        className="trend-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Illustrative 14-day trend. Decision rooms started ranges from ${Math.min(
          ...points.map((p) => p.started),
        )} to ${Math.max(...points.map((p) => p.started))} per day. Action boards created ranges from ${Math.min(
          ...points.map((p) => p.completed),
        )} to ${Math.max(...points.map((p) => p.completed))} per day. Exact values are in the table below.`}
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 8}
              y={y(value) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--ink-muted)"
              fontFamily="var(--font-mono)"
            >
              {value}
            </text>
          </g>
        ))}

        <path d={line('started')} fill="none" stroke="var(--forest)" strokeWidth="2" />
        <path
          d={line('completed')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />

        {points.map((point, index) => (
          <circle
            key={`s-${point.day}`}
            cx={x(index)}
            cy={y(point.started)}
            r="3"
            fill="var(--forest)"
          />
        ))}
        {points.map((point, index) => (
          <rect
            key={`c-${point.day}`}
            x={x(index) - 2.6}
            y={y(point.completed) - 2.6}
            width="5.2"
            height="5.2"
            fill="var(--accent)"
          />
        ))}

        {[0, 6, 13].map((index) => (
          <text
            key={index}
            x={x(index)}
            y={HEIGHT - 10}
            textAnchor={index === 0 ? 'start' : index === 13 ? 'end' : 'middle'}
            fontSize="10"
            fill="var(--ink-muted)"
            fontFamily="var(--font-mono)"
          >
            Day {points[index].day}
          </text>
        ))}
      </svg>

      <ul className="chart-legend">
        <li>
          <span className="legend-swatch" aria-hidden="true" /> Decision rooms started (circles,
          solid line)
        </li>
        <li>
          <span className="legend-swatch legend-swatch--completed" aria-hidden="true" /> Action
          boards created (squares, dashed line)
        </li>
      </ul>

      <details style={{ marginTop: 'var(--space-3)' }}>
        <summary className="small">View the illustrative trend as a table</summary>
        <table className="small" style={{ borderCollapse: 'collapse', marginTop: 'var(--space-3)' }}>
          <caption className="small muted" style={{ textAlign: 'left', paddingBottom: '0.4rem' }}>
            Illustrative demo data — not live performance.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={cell}>
                Day
              </th>
              <th scope="col" style={cell}>
                Rooms started
              </th>
              <th scope="col" style={cell}>
                Boards created
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.day}>
                <th scope="row" style={cell}>
                  {point.day}
                </th>
                <td style={cell}>{point.started}</td>
                <td style={cell}>{point.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

const cell: React.CSSProperties = {
  border: '1px solid var(--rule)',
  padding: '0.3rem 0.6rem',
  textAlign: 'left',
};
