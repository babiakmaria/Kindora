import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/common/StatCard';
import ProjectCard from '../components/projects/ProjectCard';
import Button from '../components/common/Button';
import NewProjectModal from '../components/projects/NewProjectModal';
import { USER_STATS } from '../data/data';

const FILTER_OPTIONS = [
  { key: 'All',       label: 'Всі' },
  { key: 'Active',    label: 'Активні' },
  { key: 'Completed', label: 'Завершені' },
];

const UserDashboard = ({ onNavigate, projects, onAddProject, onToggleJoin }) => {
  const [filter, setFilter]         = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);

  const filtered = projects
    .filter((p) => {
      if (filter === 'Active')    return p.status === 'active' || p.status === 'in-progress' || p.status === 'new';
      if (filter === 'Completed') return p.status === 'completed';
      return true;
    })
    .filter((p) => p.joined);

  return (
    <div className="app-layout">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar
          searchable
          onNavigate={onNavigate}
          onNewProject={() => setModalOpen(true)}
        />

        <div className="main-content">
          <div className="page-header">
            <div>
              <div className="page-title">Доброго ранку, Анно!</div>
              <div className="page-sub">Ось що відбувається у вашій спільноті сьогодні.</div>
            </div>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + Новий проєкт
            </Button>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {USER_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text1)' }}>Ваші активні проєкти</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {FILTER_OPTIONS.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? 'primary' : 'ghost'}
                  sm
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Project grid */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 24px',
              background: '#fff', borderRadius: 16,
              border: '1.5px dashed var(--border)',
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>
                Поки що немає проєктів
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                Створіть свій перший проєкт або огляньте спільноту.
              </p>
              <Button variant="primary" sm onClick={() => setModalOpen(true)}>
                + Новий проєкт
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} view="grid" onToggleJoin={onToggleJoin} />
              ))}

              {/* Explore CTA card */}
              <div
                onClick={() => onNavigate('explore')}
                style={{
                  background: 'transparent',
                  border: '2px dashed var(--border)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 10,
                  padding: 20,
                  cursor: 'pointer',
                  minHeight: 180,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--pk1)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ fontSize: 28, color: 'var(--text3)' }}>+</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)' }}>Переглянути більше проєктів</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={onAddProject}
        currentUser="Анна К."
      />
    </div>
  );
};

export default UserDashboard;
