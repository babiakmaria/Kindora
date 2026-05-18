import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SpendingChart from '../components/common/SpendingChart';
import NewProjectModal from '../components/projects/NewProjectModal';
import styles from './AdminDashboard.module.css';
import { ProjectIcon } from '../utils/projectIcon';
import { fetchPlatformStats, fetchProjectsByCategory, fetchAnalyticsStats } from '../api/analytics';

const CATEGORY_COLORS = ['#4CAF7D', '#FF6B9D', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444'];
const CIRCUMFERENCE = 2 * Math.PI * 36; // ≈ 226.2

// Build donut segments from category data
const buildDonutSegments = (categories) => {
  const total = categories.reduce((s, c) => s + c.value, 0);
  if (total === 0) return [];
  let offset = 0;
  return categories.map((cat, i) => {
    const pct   = Math.round((cat.value / total) * 100);
    const arc   = (cat.value / total) * CIRCUMFERENCE;
    const seg   = { label: cat.label, pct, value: cat.value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], arc, offset };
    offset += arc;
    return seg;
  });
};

const ProgressCell = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 11 }}>{pct}%</span>
  </div>
);

const TrendCell = ({ progress }) => {
  if (progress >= 70) return <span style={{ color: '#4CAF7D', fontWeight: 700, fontSize: 16 }}>↑</span>;
  if (progress <= 30) return <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 16 }}>↓</span>;
  return <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 16 }}>→</span>;
};

const AdminDashboard = ({ onNavigate, projects: projectsProp, onAddProject, currentUser, onLogout }) => {
  const [platformStats, setPlatformStats]   = useState(null);
  const [categories,    setCategories]      = useState([]);
  const [statsLoading,  setStatsLoading]    = useState(true);
  const [isModalOpen,   setModalOpen]       = useState(false);

  useEffect(() => {
    setStatsLoading(true);
    Promise.allSettled([
      fetchPlatformStats(),
      fetchProjectsByCategory(),
      fetchAnalyticsStats(),
    ]).then(([platformRes, catsRes, adminRes]) => {
      // Platform stats (platform-wide numbers)
      if (platformRes.status === 'fulfilled') {
        setPlatformStats(platformRes.value);
      } else if (adminRes.status === 'fulfilled') {
        // Fall back to per-admin stats if platform endpoint isn't available yet
        const s = adminRes.value;
        setPlatformStats({
          total_projects:        projects.length,
          total_users:           s.totalVolunteers ?? 0,
          pending_applications:  0,
          completion_rate:       s.completedProjects
            ? Math.round((s.completedProjects / Math.max(projects.length, 1)) * 100)
            : 0,
        });
      }
      // Categories for donut
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value.filter((c) => c.value > 0));
      }
    }).finally(() => setStatsLoading(false));
  }, []);

  const handleAddProject = (newProject) => {
    if (onAddProject) onAddProject(newProject);
  };

  // Show only projects this admin created — consistent with the analytics stats
  // which are already filtered by created_by on the backend
  const projects = currentUser
    ? (projectsProp || []).filter((p) => p.createdBy === currentUser.id)
    : [];

  const statCards = platformStats
    ? [
        {
          label:    'Всього проєктів',
          value:    platformStats.total_projects,
          icon:     'Folder',
          iconBg:   '#EAF7F0',
          trend:    '',
          trendDir: 'up',
        },
        {
          label:    'Активні користувачі',
          value:    platformStats.total_users,
          icon:     'Users',
          iconBg:   '#FFF0F6',
          trend:    '',
          trendDir: 'up',
        },
        {
          label:    'Заявки на розгляді',
          value:    platformStats.pending_applications,
          icon:     'ClipboardList',
          iconBg:   '#FFFBEA',
          trend:    '',
          trendDir: 'neutral',
        },
        {
          label:    'Відсоток завершення',
          value:    `${platformStats.completion_rate}%`,
          icon:     'CheckCircle',
          iconBg:   '#EAF7F0',
          trend:    '',
          trendDir: 'up',
        },
      ]
    : [];

  const donutSegments = buildDonutSegments(categories);
  const totalProjects = platformStats?.total_projects ?? projects.length;

  return (
    <div className="app-layout">
      <AdminSidebar activePage="admin" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar
          title="Адмін-дашборд"
          adminMode
          onNavigate={onNavigate}
          onNewProject={() => setModalOpen(true)}
        />

        <div className="main-content">

          {/* Stats */}
          <div className="stat-row" style={{ marginBottom: 24 }}>
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="stat-card" style={{ opacity: 0.4, height: 80 }} />
                ))
              : statCards.map((s) => <StatCard key={s.label} {...s} />)
            }
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            <SpendingChart />

            {/* Donut chart */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Проєкти за категорією</div>
              </div>
              <div className={styles.donutWrap}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.label}
                      cx="50" cy="50" r="36"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={`${seg.arc} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                  <text x="50" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1A1A2E">
                    {totalProjects}
                  </text>
                  <text x="50" y="59" textAnchor="middle" fontSize="8" fill="#6B7280">проєктів</text>
                </svg>
                <div className={styles.legend}>
                  {donutSegments.map((seg) => (
                    <div key={seg.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: seg.color }} />
                      {seg.label} ({seg.pct}%)
                    </div>
                  ))}
                  {donutSegments.length === 0 && !statsLoading && (
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Немає даних</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projects detail table */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title">Деталі проєктів</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{projects.length} проєктів</span>
                <Button variant="ghost" sm>Фільтр</Button>
                <Button variant="primary" sm onClick={() => setModalOpen(true)}>+ Новий</Button>
              </div>
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
                  {projects.map((p) => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('project-detail', p)}>
                      <td className={styles.tdName}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: p.iconBg, width: 26, height: 26, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ProjectIcon name={p.icon} bg={p.iconBg} size={14} />
                          </span>
                          {p.title}
                        </span>
                      </td>
                      <td style={{ color: '#6B7280', fontSize: 12 }}>{p.category || '—'}</td>
                      <td><Badge status={p.status} dot>{p.statusLabel}</Badge></td>
                      <td style={{ textAlign: 'center' }}>{p.members}</td>
                      <td style={{ textAlign: 'center' }}>{p.activityCount}</td>
                      <td style={{ minWidth: 140 }}>
                        <ProgressCell
                          pct={p.progress}
                          color={
                            p.status === 'completed'   ? '#9CA3AF' :
                            p.status === 'in_progress' ? '#F59E0B' :
                            p.status === 'new'         ? '#FF6B9D' : '#4CAF7D'
                          }
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <TrendCell progress={p.progress} />
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>
                        Проєкти відсутні
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* New Project Modal (admin variant) */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddProject}
        currentUser={currentUser?.name || 'Адмін'}
      />
    </div>
  );
};

export default AdminDashboard;
