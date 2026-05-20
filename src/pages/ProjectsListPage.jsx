import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProjectCard from '../components/projects/ProjectCard';
import Button from '../components/common/Button';
import NewProjectModal from '../components/projects/NewProjectModal';
import { PROJECTS } from '../data/data';
import styles from './ProjectsListPage.module.css';

const STATUS_FILTERS = [
  { key: 'all',         label: 'Всі',        variant: 'pink'  },
  { key: 'active',      label: 'Активні',    variant: 'green', dot: '#4CAF7D' },
  { key: 'new',         label: 'Нові',       variant: 'pink',  dot: '#FF6B9D' },
  { key: 'in_progress', label: 'В процесі',  variant: 'amber', dot: '#F59E0B' },
  { key: 'completed',   label: 'Завершені',  variant: 'gray',  dot: '#9CA3AF' },
];

const SORT_OPTIONS = [
  { value: 'default',  label: 'Сортування: Популярні' },
  { value: 'members',  label: 'Найбільше учасників'   },
  { value: 'progress', label: 'Прогрес'                },
  { value: 'newest',   label: 'Спочатку нові'          },
  { value: 'az',       label: 'А → Я'                  },
];

// ── Filter pill (internal, not shared) ───────────────────
const FilterPill = ({ item, active, onClick }) => {
  const schemes = {
    green: { bg: '#EAF7F0', color: '#2E7D52', border: '#4CAF7D' },
    amber: { bg: '#FFF8E1', color: '#92400E', border: '#F59E0B' },
    pink:  { bg: '#FFF0F5', color: '#FF6B9D', border: '#FF6B9D' },
    gray:  { bg: '#F8F9FA', color: '#6B7280', border: '#9CA3AF' },
  };
  const s = schemes[item.variant] || schemes.pink;

  return (
    <button
      className={styles.filterPill}
      style={active ? { background: s.bg, color: s.color, borderColor: s.border } : {}}
      onClick={onClick}
    >
      {active && item.dot && (
        <span className={styles.filterDot} style={{ background: item.dot }} />
      )}
      {item.label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────
const ProjectsListPage = ({ onNavigate, projects: projectsProp, onAddProject, onToggleJoin, currentUser, onLogout }) => {
  const [localProjects, setLocalProjects] = useState(PROJECTS);
  const projects    = projectsProp ?? localProjects;
  const toggleJoin  = onToggleJoin ?? ((id) =>
    setLocalProjects((prev) => prev.map((p) => (p.id === id ? { ...p, joined: !p.joined } : p)))
  );

  const [query,       setQuery]      = useState('');
  const [filter,      setFilter]     = useState('all');
  const [sort,        setSort]       = useState('default');
  const [view,        setView]       = useState('grid');
  const [isModalOpen, setModalOpen]  = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // onAddProject from App.jsx handles the API call and shared state update

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        const matchSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q);
        const matchFilter = filter === 'all' || p.status === filter;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sort === 'members')  return b.members  - a.members;
        if (sort === 'progress') return b.progress - a.progress;
        if (sort === 'newest')   return (b.createdAt || '') > (a.createdAt || '') ? 1 : -1;
        if (sort === 'az')       return a.title.localeCompare(b.title);
        return 0;
      });
  }, [projects, query, filter, sort]);

  // Reset to first page whenever filter, sort, or search changes
  useEffect(() => { setVisibleCount(12); }, [query, filter, sort]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="app-layout">
      <Sidebar activePage="explore" onNavigate={onNavigate} searchable onSearch={setQuery} currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content">
          <div className="page-header">
            <div>
              <div className="page-title">Огляд</div>
              <div className="page-sub">Перегляньте всі проєкти спільноти</div>
            </div>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + Новий проєкт
            </Button>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginRight: 4 }}>
                Статус:
              </span>
              {STATUS_FILTERS.map((item) => (
                <FilterPill
                  key={item.key}
                  item={item}
                  active={filter === item.key}
                  onClick={() => setFilter(item.key)}
                />
              ))}
            </div>

            <div className={styles.toolbarRight}>
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Сортувати проєкти"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.vtBtn} ${view === 'grid' ? styles.vtActive : ''}`}
                  onClick={() => setView('grid')}
                  aria-label="Сітка"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="0" width="6" height="6" rx="1" />
                    <rect x="8" y="0" width="6" height="6" rx="1" />
                    <rect x="0" y="8" width="6" height="6" rx="1" />
                    <rect x="8" y="8" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  className={`${styles.vtBtn} ${view === 'list' ? styles.vtActive : ''}`}
                  onClick={() => setView('list')}
                  aria-label="Список"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="1" width="14" height="2" rx="1" />
                    <rect x="0" y="6" width="14" height="2" rx="1" />
                    <rect x="0" y="11" width="14" height="2" rx="1" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Results count */}
          <p className={styles.resultsMeta}>
            Показано{' '}
            <strong style={{ color: 'var(--text2)' }}>
              {visible.length} з {filtered.length} {filtered.length === 1 ? 'проєкту' : 'проєктів'}
            </strong>
            {query && ` для "${query}"`}
          </p>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}></div>
              <h3 className={styles.emptyTitle}>Проєктів не знайдено</h3>
              <p className={styles.emptyDesc}>
                Спробуйте інше слово або очистіть пошук, щоб переглянути всі проєкти.
              </p>
              <Button variant="outline" sm style={{ marginTop: 16 }} onClick={() => setQuery('')}>
                Очистити пошук
              </Button>
            </div>
          ) : (
            <div className={view === 'grid' ? styles.projGrid : styles.projList}>
              {visible.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  view={view}
                  onToggleJoin={toggleJoin}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button
                variant="ghost"
                style={{ padding: '10px 28px' }}
                onClick={() => setVisibleCount((c) => c + 12)}
              >
                Завантажити більше проєктів
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={onAddProject}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ProjectsListPage;
