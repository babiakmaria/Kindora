import React, { useState } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import NewProjectModal from '../components/projects/NewProjectModal';
import { PROJECTS, ADMIN_STATS, APPLICATIONS } from '../data/data';
import styles from './AdminDashboard.module.css';

const BAR_DATA = [
  { month: 'Жовт', h: 42 },
  { month: 'Листоп', h: 58 },
  { month: 'Груд', h: 75 },
  { month: 'Січ', h: 62 },
  { month: 'Лют', h: 88 },
  { month: 'Бер', h: 100 },
];

const DONUT_CATEGORIES = [
  { label: 'Довкілля', pct: 57, color: '#4CAF7D', dashArr: '82 144', offset: 0    },
  { label: 'Освіта',   pct: 35, color: '#FF6B9D', dashArr: '50 144', offset: -82  },
  { label: 'Соціальне',pct: 21, color: '#F59E0B', dashArr: '30 144', offset: -132 },
];

const ProgressCell = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 11 }}>{pct}%</span>
  </div>
);

const AdminDashboard = ({ onNavigate, projects: projectsProp, onAddProject }) => {
  const [tableProjects, setTableProjects] = useState(
    projectsProp ? projectsProp.slice(0, 4) : PROJECTS.slice(0, 4)
  );
  const [applications, setApplications] = useState(APPLICATIONS);
  const [isModalOpen,  setModalOpen]    = useState(false);

  const handleAddProject = (newProject) => {
    if (onAddProject) onAddProject(newProject);
    setTableProjects((prev) => [newProject, ...prev]);
  };

  const handleApp = (id) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="app-layout">
      <AdminSidebar activePage="admin" onNavigate={onNavigate} />

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
            {ADMIN_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Bar chart */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Активність проєктів (6 місяців)</div>
              </div>
              <div className={styles.barChart}>
                {BAR_DATA.map((b) => (
                  <div
                    key={b.month}
                    className={styles.bar}
                    style={{
                      height: `${b.h}%`,
                      background:
                        b.h === 100 ? 'var(--pk1)' :
                        b.h >= 80   ? 'linear-gradient(180deg,var(--gr1),var(--pk1))' :
                        b.h >= 60   ? 'var(--pk1)' :
                        b.h >= 50   ? 'var(--pk2)' : 'var(--pk3)',
                    }}
                  />
                ))}
              </div>
              <div className={styles.barLabels}>
                {BAR_DATA.map((b) => <span key={b.month}>{b.month}</span>)}
              </div>
            </div>

            {/* Donut chart */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Проєкти за категорією</div>
              </div>
              <div className={styles.donutWrap}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  {DONUT_CATEGORIES.map((c) => (
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
                  <text x="50" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1A1A2E">24</text>
                  <text x="50" y="59" textAnchor="middle" fontSize="8" fill="#6B7280">проєктів</text>
                </svg>
                <div className={styles.legend}>
                  {DONUT_CATEGORIES.map((c) => (
                    <div key={c.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: c.color }} />
                      {c.label} ({c.pct}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project management table */}
          <div className="section-card">
            <div className="section-head">
              <div className="section-title">Управління проєктами</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" sm>Фільтр</Button>
                <Button variant="primary" sm onClick={() => setModalOpen(true)}>+ Новий</Button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Проєкт</th>
                    <th>Статус</th>
                    <th>Учасники</th>
                    <th>Прогрес</th>
                    <th>Термін</th>
                    <th>Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {tableProjects.map((p) => (
                    <tr key={p.id}>
                      <td className={styles.tdName}>{p.icon} {p.title}</td>
                      <td><Badge status={p.status} dot>{p.statusLabel}</Badge></td>
                      <td>{p.members}</td>
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
                      <td>{p.due}</td>
                      <td>
                        <Button
                          variant={p.status === 'active' && p.progress >= 90 ? 'secondary' : 'ghost'}
                          sm
                        >
                          {p.status === 'active' && p.progress >= 90 ? 'Завершити' : 'Керувати'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending applications */}
          {applications.length > 0 && (
            <div className="section-card" style={{ marginTop: 16 }}>
              <div className="section-head">
                <div className="section-title">Заявки учасників на розгляді</div>
                <span className="badge badge-amber">{applications.length} очікують</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {applications.map((app) => (
                  <div key={app.id} className={styles.appRow}>
                    <div
                      className="avatar"
                      style={{ background: app.gradient, width: 36, height: 36, fontSize: 12 }}
                    >
                      {app.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{app.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)' }}>
                        Подав заявку на: {app.project} · {app.time}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" sm onClick={() => handleApp(app.id)}>✓ Прийняти</Button>
                      <Button variant="ghost"     sm onClick={() => handleApp(app.id)}>✕ Відхилити</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal (admin variant) */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddProject}
        currentUser="Марія Чен"
      />
    </div>
  );
};

export default AdminDashboard;
