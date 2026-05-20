import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import styles  from './NotificationsPage.module.css';
import { fetchNotifications, markNotifRead as apiMarkRead, markAllNotifsRead as apiMarkAll } from '../api/notifications';

// ── Helpers ──────────────────────────────────────────────────
const getGroup = (isoStr) => {
  const d    = new Date(isoStr);
  const now  = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d >= today)     return 'today';
  if (d >= yesterday) return 'yesterday';
  return 'earlier';
};

const formatTime = (isoStr) => {
  const d       = new Date(isoStr);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1)  return 'щойно';
  if (diffMin < 60) return `${diffMin} хв тому`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} год тому`;
  const months = ['січ.','лют.','бер.','квіт.','трав.','черв.','лип.','серп.','вер.','жовт.','лист.','груд.'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const fmtHours = (h) => {
  if (!h || h <= 0) return '';
  const totalMin = Math.round(h * 60);
  if (totalMin < 60) return `${totalMin}хв`;
  const hrs = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return min > 0 ? `${hrs}г ${min}хв` : `${hrs}г`;
};

// ── Notification type config ──────────────────────────────────
const TYPE = {
  join: {
    icon: '+',
    bg: '#EAF7F0',
    color: '#2E7D52',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> приєднався до проєкту <em>{n.projectTitle}</em></>
    ),
  },
  task_added: {
    icon: '✦',
    bg: '#EEF2FF',
    color: '#4F46E5',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> додав завдання «{n.taskTitle}» до проєкту <em>{n.projectTitle}</em></>
    ),
  },
  task_completed: {
    icon: '✓',
    bg: '#FFF8E1',
    color: '#B45309',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> виконав завдання «{n.taskTitle}» у проєкті <em>{n.projectTitle}</em></>
    ),
  },
  task_completed_time: {
    icon: '⏱',
    bg: '#FFF0F5',
    color: '#FF6B9D',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> виконав завдання «{n.taskTitle}» у проєкті <em>{n.projectTitle}</em> · {fmtHours(n.loggedHours)}</>
    ),
  },
  task_completed_price: {
    icon: '₴',
    bg: '#FFF0F5',
    color: '#FF6B9D',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> виконав завдання «{n.taskTitle}» у проєкті <em>{n.projectTitle}</em> · ₴{n.price?.toLocaleString('uk-UA')}</>
    ),
  },
  task_completed_both: {
    icon: '✓',
    bg: '#FFF0F5',
    color: '#FF6B9D',
    buildMsg: (n) => (
      <><strong>{n.userName}</strong> виконав завдання «{n.taskTitle}» у проєкті <em>{n.projectTitle}</em> · {fmtHours(n.loggedHours)} · ₴{n.price?.toLocaleString('uk-UA')}</>
    ),
  },
};

const GROUPS = [
  { key: 'today',     label: 'Сьогодні' },
  { key: 'yesterday', label: 'Вчора'    },
  { key: 'earlier',   label: 'Раніше'   },
];

// ── Single notification item ──────────────────────────────────
const NotifItem = ({ notif, onMarkRead, onViewProject }) => {
  const t = TYPE[notif.type] || TYPE.join;

  return (
    <div
      className={`${styles.item} ${notif.read ? styles.itemRead : styles.itemUnread}`}
      onClick={() => !notif.read && onMarkRead(notif.id)}
    >
      {/* Avatar + type badge */}
      <div className={styles.avatarWrap}>
        <div className="avatar" style={{ background: notif.avatarBg, width: 42, height: 42, fontSize: 14 }}>
          {notif.initials}
        </div>
        <span className={styles.typeBadge} style={{ background: t.bg, color: t.color }}>
          {t.icon}
        </span>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.msg}>{t.buildMsg(notif)}</p>
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(notif.date)}</span>
          <span className={styles.projectTag} style={{ background: t.bg, color: t.color }}>
            {notif.projectTitle}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {!notif.read && <span className={styles.unreadDot} />}
        <button
          className={`btn btn-ghost btn-sm ${styles.viewBtn}`}
          onClick={(e) => { e.stopPropagation(); onViewProject(notif.projectTitle); }}
        >
          Переглянути
        </button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────
const NotificationsPage = ({ onNavigate, currentUser, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    apiMarkRead(id).catch(() => load());
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    apiMarkAll().catch(() => load());
  };

  const unreadCount  = notifications.filter((n) => !n.read).length;
  const visible      = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const groupedEmpty = !loading && GROUPS.every((g) => !visible.some((n) => getGroup(n.date) === g.key));

  return (
    <div className="app-layout">
      <Sidebar activePage="notifications" onNavigate={onNavigate} searchable currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <div className="page-title">Сповіщення</div>
              <div className="page-sub">
                {loading ? 'Завантаження…'
                  : unreadCount > 0 ? `${unreadCount} непрочитаних сповіщень`
                  : 'Усі сповіщення прочитано'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                ✓ Позначити всі як прочитані
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className={styles.tabs}>
            {[{ key: 'all', label: 'Всі' }, { key: 'unread', label: 'Непрочитані' }].map((t) => (
              <button
                key={t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.key === 'unread' && unreadCount > 0 && (
                  <span className={styles.tabBadge}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {groupedEmpty ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>Немає сповіщень</div>
              <div className={styles.emptyDesc}>
                {tab === 'unread'
                  ? 'Усі сповіщення вже прочитано.'
                  : 'Тут з\'являтимуться оновлення про ваші проєкти.'}
              </div>
            </div>
          ) : (
            GROUPS.map((g) => {
              const items = visible.filter((n) => getGroup(n.date) === g.key);
              if (!items.length) return null;
              return (
                <div key={g.key} className={styles.group}>
                  <div className={styles.groupLabel}>{g.label}</div>
                  <div className={styles.list}>
                    {items.map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        onMarkRead={handleMarkRead}
                        onViewProject={() => onNavigate('projects')}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
