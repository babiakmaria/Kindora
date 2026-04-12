import React, { useState, useMemo } from 'react';
import Sidebar        from '../components/layout/Sidebar';
import Topbar         from '../components/layout/Topbar';
import Badge          from '../components/common/Badge';
import ProgressBar    from '../components/common/ProgressBar';
import NewProjectModal from '../components/projects/NewProjectModal';
import { PROJECTS }   from '../data/data';
import styles          from './MyProjectsPage.module.css';

// ── Extended metadata for demo projects ─────────────────────
const MY_META = {
  1: { role: 'owner',       lastUpdated: '2 дні тому'  },
  3: { role: 'contributor', lastUpdated: 'Сьогодні'    },
  8: { role: 'owner',       lastUpdated: '5 днів тому' },
};
const getMeta = (id) => MY_META[id] ?? { role: 'owner', lastUpdated: 'Щойно' };

// ── Filters / sort config ────────────────────────────────────
const ROLE_FILTERS = [
  { key: 'all',         label: 'Всі'     },
  { key: 'owner',       label: 'Власник' },
  { key: 'contributor', label: 'Учасник' },
];

const STATUS_FILTERS = [
  { key: 'all',         label: 'Всі',        dot: null        },
  { key: 'active',      label: 'Активний',   dot: '#4CAF7D'   },
  { key: 'in-progress', label: 'В процесі',  dot: '#F59E0B'   },
  { key: 'new',         label: 'Новий',      dot: '#FF6B9D'   },
  { key: 'completed',   label: 'Завершено',  dot: '#9CA3AF'   },
];

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Найновіші'   },
  { value: 'active',   label: 'Найактивніші' },
  { value: 'progress', label: 'За прогресом' },
  { value: 'az',       label: 'А → Я'        },
];

// ── Member avatars ───────────────────────────────────────────
const MemberStack = ({ colors, total }) => (
  <div className={styles.memberStack}>
    {colors.slice(0, 3).map((c, i) => (
      <div key={i} className={styles.memberAva} style={{ background: c }} />
    ))}
    <span className={styles.memberCount}>{total} учасників</span>
  </div>
);

// ── Project card ─────────────────────────────────────────────
const ProjectItem = ({ project, view, onDelete, onOpen }) => {
  const [confirmDel, setConfirmDel] = useState(false);
  const meta    = getMeta(project.id);
  const isOwner = meta.role === 'owner';

  const triggerDelete = (e) => { e.stopPropagation(); setConfirmDel(true);  };
  const cancelDelete  = (e) => { e.stopPropagation(); setConfirmDel(false); };
  const confirmDelete = (e) => { e.stopPropagation(); onDelete(project.id);  };

  // ── List view ──
  if (view === 'list') {
    return (
      <div
        className={`${styles.card} ${styles.listCard} ${confirmDel ? styles.cardWarn : ''}`}
        onClick={() => !confirmDel && onOpen()}
      >
        <div className={styles.iconBox} style={{ background: project.iconBg }}>
          {project.icon}
        </div>

        <div className={styles.listBody}>
          <div className={styles.listTop}>
            <span className={styles.title}>{project.title}</span>
            <div className={styles.listBadges}>
              <span className={`${styles.rolePill} ${isOwner ? styles.roleOwner : styles.roleContrib}`}>
                {isOwner ? 'Власник' : 'Учасник'}
              </span>
              <Badge status={project.status} dot>{project.statusLabel}</Badge>
            </div>
          </div>
          <p className={styles.listDesc}>{project.desc}</p>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📅 {project.due}</span>
            <MemberStack colors={project.memberColors} total={project.members} />
            <span className={styles.categoryTag}>{project.category}</span>
          </div>
        </div>

        <div className={styles.listRight}>
          <div className={styles.listProgress}>
            <ProgressBar value={project.progress} status={project.status} />
          </div>

          {confirmDel ? (
            <div className={styles.confirmRow} onClick={(e) => e.stopPropagation()}>
              <span className={styles.confirmText}>Видалити?</span>
              <button className={`btn btn-sm ${styles.dangerBtn}`} onClick={confirmDelete}>Так</button>
              <button className="btn btn-ghost btn-sm" onClick={cancelDelete}>Ні</button>
            </div>
          ) : (
            <div className={styles.listActions}>
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
              >
                Відкрити
              </button>
              {isOwner && (
                <>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Редагувати"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✎
                  </button>
                  <button
                    className={`btn btn-ghost btn-sm ${styles.delIcon}`}
                    title="Видалити"
                    onClick={triggerDelete}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Grid view ──
  return (
    <div
      className={`${styles.card} ${styles.gridCard} ${confirmDel ? styles.cardWarn : ''}`}
      onClick={() => !confirmDel && onOpen()}
    >
      {/* Delete confirmation overlay */}
      {confirmDel && (
        <div className={styles.confirmOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={styles.confirmWarnIcon}>⚠</div>
          <p className={styles.confirmMsg}>Видалити проєкт?</p>
          <p className={styles.confirmSub}>«{project.title}» буде безповоротно видалено.</p>
          <div className={styles.confirmBtns}>
            <button className="btn btn-ghost btn-sm" onClick={cancelDelete}>Скасувати</button>
            <button className={`btn btn-sm ${styles.dangerBtn}`} onClick={confirmDelete}>Видалити</button>
          </div>
        </div>
      )}

      {/* Card top */}
      <div className={styles.cardTop}>
        <div className={styles.iconBox} style={{ background: project.iconBg }}>
          {project.icon}
        </div>
        <div className={styles.cardBadges}>
          <span className={`${styles.rolePill} ${isOwner ? styles.roleOwner : styles.roleContrib}`}>
            {isOwner ? 'Власник' : 'Учасник'}
          </span>
          <Badge status={project.status} dot>{project.statusLabel}</Badge>
        </div>
      </div>

      {/* Content */}
      <p className={styles.title}>{project.title}</p>
      <p className={styles.desc}>{project.desc}</p>

      {/* Progress */}
      <ProgressBar value={project.progress} status={project.status} />

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>📅 {project.due}</span>
          <MemberStack colors={project.memberColors} total={project.members} />
        </div>
        <span className={styles.categoryTag}>{project.category}</span>
      </div>

      {/* Action bar */}
      <div className={styles.actionBar}>
        <span className={styles.lastUpdated}>🕐 {meta.lastUpdated}</span>
        <div className={styles.actionBtns}>
          <button
            className={`btn btn-outline btn-sm`}
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            Відкрити
          </button>
          {isOwner && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                title="Редагувати"
                onClick={(e) => e.stopPropagation()}
              >
                ✎
              </button>
              <button
                className={`btn btn-ghost btn-sm ${styles.delIcon}`}
                title="Видалити"
                onClick={triggerDelete}
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ────────────────────────────────────────────────────
const MyProjectsPage = ({ onNavigate, projects: projectsProp, onAddProject }) => {
  // Initialise from joined projects; manage locally so delete works without App changes
  const [myProjects, setMyProjects] = useState(() =>
    (projectsProp ?? PROJECTS).filter((p) => p.joined)
  );

  const [query,        setQuery]       = useState('');
  const [roleFilter,   setRoleFilter]  = useState('all');
  const [statusFilter, setStatusFilter]= useState('all');
  const [sort,         setSort]        = useState('newest');
  const [view,         setView]        = useState('grid');
  const [modalOpen,    setModalOpen]   = useState(false);

  const handleAdd = (newProject) => {
    const enriched = { ...newProject, joined: true };
    setMyProjects((prev) => [enriched, ...prev]);
    onAddProject && onAddProject(enriched);
  };

  const handleDelete = (id) =>
    setMyProjects((prev) => prev.filter((p) => p.id !== id));

  // ── Stats ──
  const totalCount     = myProjects.length;
  const activeCount    = myProjects.filter((p) => p.status === 'active').length;
  const completedCount = myProjects.filter((p) => p.status === 'completed').length;
  const ownedCount     = myProjects.filter((p) => getMeta(p.id).role === 'owner').length;

  // ── Filtered + sorted ──
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myProjects
      .filter((p) => {
        const meta        = getMeta(p.id);
        const matchRole   = roleFilter   === 'all' || meta.role    === roleFilter;
        const matchStatus = statusFilter === 'all' || p.status     === statusFilter;
        const matchQuery  = !q ||
          p.title.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)  ||
          p.category.toLowerCase().includes(q);
        return matchRole && matchStatus && matchQuery;
      })
      .sort((a, b) => {
        if (sort === 'progress') return b.progress - a.progress;
        if (sort === 'active')   return b.members  - a.members;
        if (sort === 'az')       return a.title.localeCompare(b.title, 'uk');
        return b.id - a.id; // newest first
      });
  }, [myProjects, query, roleFilter, statusFilter, sort]);

  const hasProjects = myProjects.length > 0;
  const hasResults  = filtered.length  > 0;

  return (
    <div className="app-layout">
      <Sidebar activePage="projects" onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar searchable onSearch={setQuery} onNavigate={onNavigate} />

        <div className="main-content">

          {/* ── Page header ── */}
          <div className="page-header">
            <div>
              <div className="page-title">Мої проєкти</div>
              <div className="page-sub">
                {totalCount > 0
                  ? `${totalCount} проєктів · ${ownedCount} власних`
                  : 'У вас ще немає проєктів'}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              + Новий проєкт
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className={`stat-row ${styles.statsRow}`}>
            {[
              { label: 'Всього проєктів', value: totalCount,     accent: '#FF6B9D' },
              { label: 'Активні',         value: activeCount,    accent: '#4CAF7D' },
              { label: 'Завершено',       value: completedCount, accent: '#9CA3AF' },
              { label: 'Власних',         value: ownedCount,     accent: '#8B5CF6' },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-card"
                style={{ borderLeft: `3px solid ${s.accent}` }}
              >
                <div className="stat-label">{s.label}</div>
                <div className="stat-num" style={{ color: s.accent, fontSize: 24 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {/* Role pills */}
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Роль</span>
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`${styles.pill} ${roleFilter === f.key ? styles.pillActive : ''}`}
                    onClick={() => setRoleFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className={styles.sep} />

              {/* Status pills */}
              <div className={styles.filterGroup}>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`${styles.pill} ${statusFilter === f.key ? styles.pillActive : ''}`}
                    style={statusFilter === f.key && f.dot
                      ? { borderColor: f.dot, color: f.dot, background: `${f.dot}18` }
                      : {}}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {statusFilter === f.key && f.dot && (
                      <span className={styles.pillDot} style={{ background: f.dot }} />
                    )}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toolbarRight}>
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <div className={styles.viewToggle}>
                <button
                  className={`${styles.vtBtn} ${view === 'grid' ? styles.vtActive : ''}`}
                  onClick={() => setView('grid')}
                  title="Сітка"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="0" width="6" height="6" rx="1.5"/>
                    <rect x="8" y="0" width="6" height="6" rx="1.5"/>
                    <rect x="0" y="8" width="6" height="6" rx="1.5"/>
                    <rect x="8" y="8" width="6" height="6" rx="1.5"/>
                  </svg>
                </button>
                <button
                  className={`${styles.vtBtn} ${view === 'list' ? styles.vtActive : ''}`}
                  onClick={() => setView('list')}
                  title="Список"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="0" y="1" width="14" height="2.5" rx="1.25"/>
                    <rect x="0" y="5.75" width="14" height="2.5" rx="1.25"/>
                    <rect x="0" y="10.5" width="14" height="2.5" rx="1.25"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Results meta ── */}
          {hasResults && (
            <div className={styles.resultsMeta}>
              Показано {filtered.length} з {totalCount} проєктів
            </div>
          )}

          {/* ── Content ── */}
          {!hasProjects ? (
            /* True empty state */
            <div className={styles.empty}>
              <div className={styles.emptyIllo}>
                <div className={styles.emptyIconBg}>
                  <span className={styles.emptyEmoji}>📂</span>
                </div>
              </div>
              <div className={styles.emptyTitle}>У вас ще немає проєктів</div>
              <div className={styles.emptyDesc}>
                Створіть свій перший проєкт або приєднайтесь до наявного через «Огляд».
              </div>
              <div className={styles.emptyActions}>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                  + Створити перший проєкт
                </button>
                <button className="btn btn-ghost" onClick={() => onNavigate('explore')}>
                  Переглянути проєкти
                </button>
              </div>
            </div>
          ) : !hasResults ? (
            /* Filter empty state */
            <div className={styles.empty}>
              <div className={styles.emptyIllo}>
                <div className={styles.emptyIconBg}>
                  <span className={styles.emptyEmoji}>🔍</span>
                </div>
              </div>
              <div className={styles.emptyTitle}>Нічого не знайдено</div>
              <div className={styles.emptyDesc}>
                Спробуйте змінити фільтри або пошуковий запит.
              </div>
              <button
                className="btn btn-ghost"
                style={{ marginTop: 16 }}
                onClick={() => { setQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}
              >
                Скинути фільтри
              </button>
            </div>
          ) : (
            <div className={view === 'grid' ? styles.grid : styles.list}>
              {filtered.map((p) => (
                <ProjectItem
                  key={p.id}
                  project={p}
                  view={view}
                  onDelete={handleDelete}
                  onOpen={() => onNavigate('project-detail', p)}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      <NewProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
};

export default MyProjectsPage;
