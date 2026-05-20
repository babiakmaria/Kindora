import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import styles from './AnalyticsPage.module.css';
import { ProjectIcon } from '../utils/projectIcon';
import { fetchAnalyticsStats, fetchProjectsByCategory, fetchKeyMetrics, fetchReport, fetchVolunteerDistribution } from '../api/analytics';
import { fetchProjects, mapProject } from '../api/projects';
import SpendingChart from '../components/common/SpendingChart';

// Static accent colors and labels for the four overview stat cards.
// Values are replaced with live data fetched from the API.
const STATS_TEMPLATE = [
  { label: 'Всього волонтерів залучено до проєктів', key: 'totalVolunteers',   accent: '#FF6B9D' },
  { label: 'Активні проєкти',                        key: 'activeProjects',    accent: '#4CAF7D' },
  { label: 'Завершені проєкти',                      key: 'completedProjects', accent: '#F59E0B' },
  { label: 'Кількість виконаних задач',               key: 'completedTasks',    accent: '#8B5CF6' },
];

// Color assigned to each category by name — matches the design system palette.
const CATEGORY_COLORS = {
  'Довкілля':  '#4CAF7D',
  'Освіта':    '#FF6B9D',
  'Соціальне': '#F59E0B',
  'Культура':  '#8B5CF6',
  "Здоров'я":  '#06B6D4',
  'Загальне':  '#6B7280',
};


const DONUT_CIRCUMFERENCE = 2 * Math.PI * 36;

const DONUT_SEGMENTS_TEMPLATE = [
  { label: 'Нові волонтери',    key: 'newVolunteers',       color: '#FF6B9D' },
  { label: 'Постійні учасники', key: 'permanentMembers',    color: '#4CAF7D' },
  { label: 'Разові учасники',   key: 'oneTimeParticipants', color: '#F59E0B' },
];

function buildDonutSegments(dist) {
  const total = dist?.total || 0;
  let offsetAcc = 0;
  return DONUT_SEGMENTS_TEMPLATE.map((seg) => {
    const count = dist?.[seg.key] ?? 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const arc = (pct / 100) * DONUT_CIRCUMFERENCE;
    const dashArr = `${arc.toFixed(1)} ${DONUT_CIRCUMFERENCE.toFixed(1)}`;
    const offset = -offsetAcc;
    offsetAcc += arc;
    return { ...seg, pct, dashArr, offset };
  });
}

// Shapes a mapped project into the row format used by the details table.
const toInsightRow = (p) => ({
  ...p,
  volunteers: p.members,
  activities: p.activityCount,
  trend:      p.progress >= 70 ? '↑' : p.progress >= 40 ? '→' : '↓',
  trendColor: p.progress >= 70 ? '#4CAF7D' : p.progress >= 40 ? '#F59E0B' : '#FF6B9D',
});

const ProgressCell = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 11 }}>{pct}%</span>
  </div>
);

const STATUS_LABELS_UK = {
  active:      'Активний',
  new:         'Новий',
  in_progress: 'В процесі',
  completed:   'Завершено',
  archived:    'Архів',
};

const exportToCsv = (rows) => {
  const escapeCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Назва проєкту', 'Статус', 'Учасники', 'Загальний час (год)', 'Загальна сума (грн)'];
  const lines = [
    header.map(escapeCell).join(','),
    ...rows.map((r) => [
      r.title,
      STATUS_LABELS_UK[r.status] ?? r.status,
      r.members.join('; '),
      Number(r.totalHours).toFixed(2),
      Number(r.totalSpent).toFixed(2),
    ].map(escapeCell).join(',')),
  ];
  // UTF-8 BOM so Excel opens Ukrainian text without garbling
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `звіт_kindora_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AnalyticsPage = ({ onNavigate, currentUser, onLogout }) => {
  const [filtered,       setFiltered]       = useState([]);
  const [exporting,      setExporting]      = useState(false);

  const [statsData,         setStatsData]         = useState(null);
  const [categoryBars,      setCategoryBars]      = useState([]);
  const [keyMetrics,        setKeyMetrics]        = useState(null);
  const [volunteerDist,     setVolunteerDist]     = useState(null);

  useEffect(() => {
    fetchAnalyticsStats()
      .then(setStatsData)
      .catch(() => {});

    fetchProjectsByCategory()
      .then((rows) =>
        setCategoryBars(
          rows.map((r) => {
            const value = Number(r.value);
            return {
              label: r.label,
              value,
              color: value > 0 ? (CATEGORY_COLORS[r.label] ?? '#9CA3AF') : '#D1D5DB',
            };
          }),
        ),
      )
      .catch(() => {});

    fetchKeyMetrics()
      .then(setKeyMetrics)
      .catch(() => {});

    fetchVolunteerDistribution()
      .then(setVolunteerDist)
      .catch(() => {});

    fetchProjects()
      .then((raw) => {
        const userId = currentUser?.id;
        const rows = raw
          .map((p) => mapProject(p, userId))
          .filter((p) => p.createdBy === userId && p.status !== 'archived')
          .map(toInsightRow);
        setFiltered(rows);
      })
      .catch(() => {});
  }, [currentUser?.id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await fetchReport();
      exportToCsv(rows);
    } catch (err) {
      console.error('Не вдалося завантажити звіт:', err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="admin-analytics" onNavigate={onNavigate} searchable currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Аналітика</h1>
              <p className="page-sub">Відстежуйте показники волонтерської діяльності та прогрес проєктів</p>
            </div>
            <Button variant="outline" sm onClick={handleExport} disabled={exporting}>
              {exporting ? 'Завантаження…' : '↓ Експорт звіту'}
            </Button>
          </div>

          {/* Overview stats */}
          <div className="stat-row" style={{ marginBottom: 24 }}>
            {STATS_TEMPLATE.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                accent={s.accent}
                value={statsData ? String(statsData[s.key]) : '—'}
              />
            ))}
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Horizontal bar chart — projects by category */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Проєкти за категорією</div>
              </div>
              <div className={styles.hBarChart}>
                {(() => {
                  const catMax = Math.max(...categoryBars.map((b) => b.value), 1);
                  return categoryBars.map((b) => (
                    <div key={b.label} className={styles.hBarRow}>
                      <span className={styles.hBarLabel}>{b.label}</span>
                      <div className={styles.hBarTrack}>
                        <div
                          className={styles.hBarFill}
                          style={{ width: `${(b.value / catMax) * 100}%`, background: b.color }}
                        />
                      </div>
                      <span className={styles.hBarValue} style={{ color: b.value === 0 ? '#9CA3AF' : undefined }}>
                        {b.value}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <SpendingChart />
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Donut — volunteer distribution */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Розподіл волонтерів</div>
              </div>
              <div className={styles.donutWrap}>
                {(() => {
                  const segments = buildDonutSegments(volunteerDist);
                  const total = volunteerDist?.total ?? '—';
                  return (
                    <>
                      <svg width="110" height="110" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="36" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                        {segments.map((c) => (
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
                        <text x="50" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1A1A2E">{total}</text>
                        <text x="50" y="59" textAnchor="middle" fontSize="7.5" fill="#6B7280">волонтерів</text>
                      </svg>
                      <div className={styles.legend}>
                        {segments.map((c) => (
                          <div key={c.label} className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: c.color }} />
                            <span>{c.label}</span>
                            <span className={styles.legendPct}>
                              {volunteerDist ? `${c.pct}%` : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Key metrics insight grid */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Ключові показники</div>
              </div>
              <div className={styles.insightGrid}>
                <div className={styles.insightCard} style={{ borderLeftColor: '#FF6B9D' }}>
                  <p className={styles.insightValue}>
                    {keyMetrics ? `${keyMetrics.avgProgress}%` : '—'}
                  </p>
                  <p className={styles.insightLabel}>Середній прогрес</p>
                  <p className={styles.insightSub}>по всіх проєктах</p>
                </div>
                <div className={styles.insightCard} style={{ borderLeftColor: '#F59E0B' }}>
                  <p className={styles.insightValue}>
                    {keyMetrics ? keyMetrics.activeThisWeek : '—'}
                  </p>
                  <p className={styles.insightLabel}>Активних цього тижня</p>
                  <p className={styles.insightSub}>волонтерів виконали завдання</p>
                </div>
                <div className={styles.insightCard} style={{ borderLeftColor: '#4CAF7D' }}>
                  <p className={styles.insightValue}>
                    {keyMetrics ? keyMetrics.avgMembersPerProject : '—'}
                  </p>
                  <p className={styles.insightLabel}>Учасників на проєкт</p>
                  <p className={styles.insightSub}>в середньому</p>
                </div>
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
                      <td className={styles.tdName}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap: 8 }}>
                          <span style={{ background: p.iconBg, width: 26, height: 26, borderRadius: 6, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
                            <ProjectIcon name={p.icon} bg={p.iconBg} size={14} />
                          </span>
                          {p.title}
                        </span>
                      </td>
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
