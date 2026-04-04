import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { PROJECTS } from '../data/data';
import styles from './AnalyticsPage.module.css';

// ── Mock analytics data ───────────────────────────────────────────────────────
const ANALYTICS_STATS = [
  { label: 'Всього волонтерів',    value: '247',   change: '↑ 18 цього місяця',  accent: '#FF6B9D' },
  { label: 'Активні проєкти',      value: '12',    change: '↑ 2 цього тижня',    accent: '#4CAF7D' },
  { label: 'Завершені активності', value: '38',    change: '↑ 5 цього місяця',   accent: '#F59E0B' },
  { label: 'Тварин під опікою',    value: '1 840', change: '↑ 120 цього місяця', accent: '#8B5CF6' },
];

const CATEGORY_BARS = [
  { label: 'Довкілля',  value: 9, color: '#4CAF7D' },
  { label: 'Освіта',    value: 7, color: '#FF6B9D' },
  { label: 'Соціальне', value: 5, color: '#F59E0B' },
  { label: 'Культура',  value: 4, color: '#8B5CF6' },
  { label: "Здоров'я",  value: 2, color: '#06B6D4' },
];
const CAT_MAX = Math.max(...CATEGORY_BARS.map((b) => b.value));

const ACTIVITY_LINE = [
  { month: 'Жовт',   v: 32 },
  { month: 'Листоп', v: 48 },
  { month: 'Груд',   v: 41 },
  { month: 'Січ',    v: 63 },
  { month: 'Лют',    v: 57 },
  { month: 'Бер',    v: 89 },
];
const SVG_W = 280;
const SVG_H = 70;
const LINE_MAX = Math.max(...ACTIVITY_LINE.map((d) => d.v));

const linePoints = ACTIVITY_LINE.map((d, i) => {
  const x = (i / (ACTIVITY_LINE.length - 1)) * SVG_W;
  const y = (1 - d.v / LINE_MAX) * SVG_H;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

const areaPoints = `0,${SVG_H} ${linePoints} ${SVG_W},${SVG_H}`;

const DONUT_DATA = [
  { label: 'Нові волонтери',     pct: 42, color: '#FF6B9D', dashArr: '60 144', offset: 0    },
  { label: 'Постійні учасники',  pct: 38, color: '#4CAF7D', dashArr: '55 144', offset: -60  },
  { label: 'Разові учасники',    pct: 20, color: '#F59E0B', dashArr: '29 144', offset: -115 },
];

const KEY_METRICS = [
  { label: 'Середній прогрес',    value: '61%',   sub: 'по всіх проєктах',      color: '#FF6B9D' },
  { label: 'Учасників на проєкт', value: '42',    sub: 'в середньому',           color: '#4CAF7D' },
  { label: 'Активних цього тижня',value: '89',    sub: 'волонтерів',             color: '#F59E0B' },
  { label: 'Рівень виконання',    value: '89%',   sub: 'завершені вчасно',       color: '#8B5CF6' },
];

const BASE_INSIGHTS = PROJECTS.slice(0, 6).map((p) => ({
  ...p,
  volunteers: p.members,
  activities: Math.round(p.progress / 10 + 2),
  trend:      p.progress >= 70 ? '↑' : p.progress >= 40 ? '→' : '↓',
  trendColor: p.progress >= 70 ? '#4CAF7D' : p.progress >= 40 ? '#F59E0B' : '#FF6B9D',
}));

const PROJECT_TYPES = ['Всі типи', 'Довкілля', 'Освіта', 'Соціальне', 'Культура'];
const LOCATIONS     = ['Всі міста', 'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро'];

const ProgressCell = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 11 }}>{pct}%</span>
  </div>
);

const AnalyticsPage = ({ onNavigate }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [projType, setProjType] = useState('Всі типи');
  const [location, setLocation] = useState('Всі міста');
  const [filtered, setFiltered] = useState(BASE_INSIGHTS);

  const handleApply = () => {
    let result = [...BASE_INSIGHTS];
    if (projType !== 'Всі типи') result = result.filter((p) => p.category === projType);
    setFiltered(result);
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setProjType('Всі типи');
    setLocation('Всі міста');
    setFiltered(BASE_INSIGHTS);
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="admin-analytics" onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar
          searchable
          onNavigate={onNavigate}
        />

        <div className="main-content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Аналітика</h1>
              <p className="page-sub">Відстежуйте показники волонтерської діяльності та прогрес проєктів</p>
            </div>
            <Button variant="outline" sm>↓ Експорт звіту</Button>
          </div>

          {/* Overview stats */}
          <div className="stat-row" style={{ marginBottom: 24 }}>
            {ANALYTICS_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Filters */}
          <div className="section-card" style={{ marginBottom: 16 }}>
            <div className="section-head">
              <div className="section-title">Фільтри</div>
            </div>
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label className="input-label">Дата від</label>
                <input
                  type="date"
                  className="input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className="input-label">Дата до</label>
                <input
                  type="date"
                  className="input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className="input-label">Тип проєкту</label>
                <select
                  className="input"
                  value={projType}
                  onChange={(e) => setProjType(e.target.value)}
                >
                  {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className="input-label">Місто</label>
                <select
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={styles.filterActions}>
                <Button variant="primary" sm onClick={handleApply}>Застосувати</Button>
                <Button variant="ghost"   sm onClick={handleReset}>Скинути</Button>
              </div>
            </div>
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Horizontal bar chart — projects by category */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Проєкти за категорією</div>
              </div>
              <div className={styles.hBarChart}>
                {CATEGORY_BARS.map((b) => (
                  <div key={b.label} className={styles.hBarRow}>
                    <span className={styles.hBarLabel}>{b.label}</span>
                    <div className={styles.hBarTrack}>
                      <div
                        className={styles.hBarFill}
                        style={{ width: `${(b.value / CAT_MAX) * 100}%`, background: b.color }}
                      />
                    </div>
                    <span className={styles.hBarValue}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line chart — activity over time */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Активність за 6 місяців</div>
              </div>
              <div className={styles.lineChartWrap}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  className={styles.lineSvg}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#FF6B9D" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line
                      key={f}
                      x1="0" y1={SVG_H * (1 - f)}
                      x2={SVG_W} y2={SVG_H * (1 - f)}
                      stroke="#E5E7EB" strokeWidth="1"
                    />
                  ))}

                  {/* Area fill */}
                  <polygon points={areaPoints} fill="url(#lineGrad)" />

                  {/* Line */}
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke="#FF6B9D"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Data dots */}
                  {ACTIVITY_LINE.map((d, i) => {
                    const x = (i / (ACTIVITY_LINE.length - 1)) * SVG_W;
                    const y = (1 - d.v / LINE_MAX) * SVG_H;
                    return (
                      <circle
                        key={i}
                        cx={x.toFixed(1)}
                        cy={y.toFixed(1)}
                        r="3.5"
                        fill="#FF6B9D"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                <div className={styles.lineLabels}>
                  {ACTIVITY_LINE.map((d) => <span key={d.month}>{d.month}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Donut — volunteer distribution */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Розподіл волонтерів</div>
              </div>
              <div className={styles.donutWrap}>
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  {DONUT_DATA.map((c) => (
                    <circle
                      key={c.label}
                      cx="50" cy="50" r="36"
                      fill="none"
                      stroke={c.color}
                      strokeWidth="14"
                      strokeDasharray={c.dashArr}
                      strokeDashoffset={c.offset}
                      strokeLinecap="round"
                    />
                  ))}
                  <text x="50" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1A1A2E">247</text>
                  <text x="50" y="59" textAnchor="middle" fontSize="7.5" fill="#6B7280">волонтерів</text>
                </svg>
                <div className={styles.legend}>
                  {DONUT_DATA.map((c) => (
                    <div key={c.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: c.color }} />
                      <span>{c.label}</span>
                      <span className={styles.legendPct}>{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key metrics insight grid */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Ключові показники</div>
              </div>
              <div className={styles.insightGrid}>
                {KEY_METRICS.map((item) => (
                  <div
                    key={item.label}
                    className={styles.insightCard}
                    style={{ borderLeftColor: item.color }}
                  >
                    <p className={styles.insightValue}>{item.value}</p>
                    <p className={styles.insightLabel}>{item.label}</p>
                    <p className={styles.insightSub}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed insights table */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title">Деталі проєктів</div>
              <span className="badge badge-gray">{filtered.length} проєктів</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Проєкт</th>
                    <th>Категорія</th>
                    <th>Статус</th>
                    <th>Волонтери</th>
                    <th>Активності</th>
                    <th>Прогрес</th>
                    <th>Тренд</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className={styles.tdName}>{p.icon} {p.title}</td>
                      <td>
                        <span className="badge badge-gray">{p.category}</span>
                      </td>
                      <td>
                        <Badge status={p.status} dot>{p.statusLabel}</Badge>
                      </td>
                      <td>{p.volunteers}</td>
                      <td>{p.activities}</td>
                      <td style={{ minWidth: 140 }}>
                        <ProgressCell
                          pct={p.progress}
                          color={
                            p.status === 'completed'   ? '#9CA3AF' :
                            p.status === 'in-progress' ? '#F59E0B' :
                            p.status === 'new'         ? '#FF6B9D' : '#4CAF7D'
                          }
                        />
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 16, color: p.trendColor }}>
                        {p.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
