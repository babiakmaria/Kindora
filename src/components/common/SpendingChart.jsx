import React, { useState, useEffect } from 'react';
import { fetchSpending } from '../../api/analytics';
import styles from './SpendingChart.module.css';

const PERIODS = [
  { label: '3 міс',  value: 3  },
  { label: '6 міс',  value: 6  },
  { label: '12 міс', value: 12 },
];

const UK_MONTHS = [
  'Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв',
  'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд',
];

function monthLabel(isoMonth) {
  const idx = parseInt(isoMonth.split('-')[1], 10) - 1;
  return UK_MONTHS[idx] ?? isoMonth;
}

function formatAmount(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}к`;
  return String(Math.round(value));
}

/**
 * Fritsch-Carlson monotone cubic interpolation.
 * Returns an SVG path string "M x0,y0 C ... xn,yn".
 */
function buildLinePath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)} L${pts[1].x.toFixed(2)},${pts[1].y.toFixed(2)}`;
  }

  const n = pts.length;

  const secants = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    secants.push(dx === 0 ? 0 : (pts[i + 1].y - pts[i].y) / dx);
  }

  const tangents = new Array(n);
  tangents[0]     = secants[0];
  tangents[n - 1] = secants[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangents[i] = secants[i - 1] * secants[i] <= 0
      ? 0
      : (secants[i - 1] + secants[i]) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    if (secants[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i]     / secants[i];
      const beta  = tangents[i + 1] / secants[i];
      const tau   = alpha * alpha + beta * beta;
      if (tau > 9) {
        const s = 3 / Math.sqrt(tau);
        tangents[i]     = s * alpha * secants[i];
        tangents[i + 1] = s * beta  * secants[i];
      }
    }
  }

  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx   = pts[i + 1].x - pts[i].x;
    const cp1x = pts[i].x     + dx / 3;
    const cp1y = pts[i].y     + (tangents[i]     * dx) / 3;
    const cp2x = pts[i + 1].x - dx / 3;
    const cp2y = pts[i + 1].y - (tangents[i + 1] * dx) / 3;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`;
  }
  return d;
}

const SVG_W  = 560;
const SVG_H  = 180;
const PAD_L  = 44;
const PAD_R  = 12;
const PAD_T  = 16;
const PAD_B  = 28;
const DRAW_W = SVG_W - PAD_L - PAD_R;
const DRAW_H = SVG_H - PAD_T - PAD_B;

const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

const SpendingChart = () => {
  const [period,  setPeriod]  = useState(6);
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchSpending(period)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [period]);

  const totals = data.map((d) => Number(d.total));
  const maxVal = Math.max(...totals, 1);

  const points = data.map((d, i) => {
    const total = Number(d.total);
    const x = PAD_L + (data.length > 1 ? (i / (data.length - 1)) * DRAW_W : DRAW_W / 2);
    const y = PAD_T + (1 - total / maxVal) * DRAW_H;
    return { x, y, month: d.month, total };
  });

  const linePath = buildLinePath(points);
  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x.toFixed(2)},${(PAD_T + DRAW_H).toFixed(2)} L${points[0].x.toFixed(2)},${(PAD_T + DRAW_H).toFixed(2)} Z`
    : '';

  const TOOLTIP_W  = 86;
  const TOOLTIP_H  = 36;
  const TOOLTIP_PAD = 6;

  return (
    <div className="section-card">
      <div className="section-head">
        <div className="section-title">
          Витрачені кошти за {period} місяців
        </div>
        <div className={styles.periodSelector}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodBtn} ${period === p.value ? styles.active : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap} style={{ opacity: loading ? 0.4 : 1 }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FF6B9D" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0"    />
            </linearGradient>
          </defs>

          {GRID_FRACTIONS.map((f) => {
            const y = PAD_T + f * DRAW_H;
            return (
              <g key={f}>
                <line
                  x1={PAD_L} y1={y}
                  x2={SVG_W - PAD_R} y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9CA3AF"
                >
                  {formatAmount(maxVal * (1 - f))}
                </text>
              </g>
            );
          })}

          {areaPath && (
            <path d={areaPath} fill="url(#spendAreaGrad)" />
          )}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#FF6B9D"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setTooltip(pt)}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'default' }}
            >
              <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={tooltip?.month === pt.month ? 5 : 3.5}
                fill="#FF6B9D"
                stroke="#fff"
                strokeWidth="2"
                style={{ transition: 'r 0.15s' }}
              />
              <text
                x={pt.x}
                y={PAD_T + DRAW_H + 16}
                textAnchor="middle"
                fontSize="9.5"
                fill="#9CA3AF"
              >
                {monthLabel(pt.month)}
              </text>
            </g>
          ))}

          {tooltip && (() => {
            const tipX = Math.max(
              PAD_L     + TOOLTIP_W / 2 + TOOLTIP_PAD,
              Math.min(SVG_W - PAD_R - TOOLTIP_W / 2 - TOOLTIP_PAD, tooltip.x),
            );
            const tipY = tooltip.y - TOOLTIP_H - 10;
            return (
              <g pointerEvents="none">
                <line
                  x1={tooltip.x} y1={tooltip.y + 6}
                  x2={tooltip.x} y2={PAD_T + DRAW_H}
                  stroke="#FF6B9D"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
                <rect
                  x={tipX - TOOLTIP_W / 2}
                  y={tipY}
                  width={TOOLTIP_W}
                  height={TOOLTIP_H}
                  rx="7"
                  fill="#1A1A2E"
                />
                <text
                  x={tipX}
                  y={tipY + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9CA3AF"
                >
                  {monthLabel(tooltip.month)}
                </text>
                <text
                  x={tipX}
                  y={tipY + 28}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="#FFFFFF"
                >
                  {Number(tooltip.total).toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default SpendingChart;
