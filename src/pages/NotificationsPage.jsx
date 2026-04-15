import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import styles  from './NotificationsPage.module.css';

// ── Notification data ────────────────────────────────────────
const INITIAL_NOTIFS = [
  // Today
  {
    id: 1, type: 'join', group: 'today', read: false,
    user: 'Анна Коваленко', initials: 'АК',
    avatarBg: 'linear-gradient(135deg,#4CAF7D,#06B6D4)',
    project: 'EcoTracker', time: '2 години тому',
  },
  {
    id: 2, type: 'contribution', group: 'today', read: false,
    user: 'Марк Дяченко', initials: 'МД',
    avatarBg: 'linear-gradient(135deg,#FF6B9D,#F59E0B)',
    project: 'EcoTracker', time: '5 годин тому',
  },
  {
    id: 3, type: 'leave', group: 'today', read: true,
    user: 'Іван Савченко', initials: 'ІС',
    avatarBg: 'linear-gradient(135deg,#8B5CF6,#06B6D4)',
    project: 'Громадська бібліотека', time: '6 годин тому',
  },
  // Yesterday
  {
    id: 4, type: 'join', group: 'yesterday', read: true,
    user: 'Олена Василенко', initials: 'ОВ',
    avatarBg: 'linear-gradient(135deg,#F59E0B,#FF6B9D)',
    project: 'Відновлення міського парку', time: 'Вчора, 14:30',
  },
  {
    id: 5, type: 'contribution', group: 'yesterday', read: true,
    user: 'Дмитро Кравченко', initials: 'ДК',
    avatarBg: 'linear-gradient(135deg,#4CAF7D,#8B5CF6)',
    project: 'EcoTracker', time: 'Вчора, 09:15',
  },
  // Earlier
  {
    id: 6, type: 'join', group: 'earlier', read: true,
    user: "Софія Литвин", initials: 'СЛ',
    avatarBg: 'linear-gradient(135deg,#FF6B9D,#8B5CF6)',
    project: 'Кампанія з переробки', time: '3 квіт.',
  },
  {
    id: 7, type: 'leave', group: 'earlier', read: true,
    user: 'Богдан Мельник', initials: 'БМ',
    avatarBg: 'linear-gradient(135deg,#06B6D4,#4CAF7D)',
    project: 'Відновлення міського парку', time: '1 квіт.',
  },
];

// ── Type config ──────────────────────────────────────────────
const TYPE = {
  join: {
    icon: '+',
    bg: '#EAF7F0',
    color: '#2E7D52',
    buildMsg: (user, project) => (
      <><strong>{user}</strong> приєднався до вашого проєкту <em>{project}</em></>
    ),
  },
  contribution: {
    icon: '↑',
    bg: '#FFF0F5',
    color: '#FF6B9D',
    buildMsg: (user, project) => (
      <><strong>{user}</strong> додав внесок до <em>{project}</em></>
    ),
  },
  leave: {
    icon: '→',
    bg: '#FFF8E1',
    color: '#B45309',
    buildMsg: (user, project) => (
      <><strong>{user}</strong> покинув ваш проєкт <em>{project}</em></>
    ),
  },
};

const GROUPS = [
  { key: 'today',     label: 'Сьогодні'  },
  { key: 'yesterday', label: 'Вчора'     },
  { key: 'earlier',   label: 'Раніше'    },
];

// ── Single notification item ─────────────────────────────────
const NotifItem = ({ notif, onMarkRead, onViewProject }) => {
  const t = TYPE[notif.type];

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
        <p className={styles.msg}>{t.buildMsg(notif.user, notif.project)}</p>
        <div className={styles.meta}>
          <span className={styles.time}>{notif.time}</span>
          <span className={styles.projectTag} style={{ background: t.bg, color: t.color }}>
            {notif.project}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {!notif.read && <span className={styles.unreadDot} />}
        <button
          className={`btn btn-ghost btn-sm ${styles.viewBtn}`}
          onClick={(e) => { e.stopPropagation(); onViewProject(notif.project); }}
        >
          Переглянути
        </button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────
const NotificationsPage = ({ onNavigate }) => {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [tab,    setTab]    = useState('all');

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead    = (id)  => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()    => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const visible = tab === 'unread' ? notifs.filter((n) => !n.read) : notifs;

  const groupedEmpty = GROUPS.every((g) => !visible.some((n) => n.group === g.key));

  return (
    <div className="app-layout">
      <Sidebar activePage="notifications" onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <div className="page-title">Сповіщення</div>
              <div className="page-sub">
                {unreadCount > 0
                  ? `${unreadCount} непрочитаних сповіщень`
                  : 'Усі сповіщення прочитано'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
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
              <div className={styles.emptyIcon}>🔔</div>
              <div className={styles.emptyTitle}>Немає сповіщень</div>
              <div className={styles.emptyDesc}>
                {tab === 'unread'
                  ? 'Усі сповіщення вже прочитано.'
                  : 'Тут з\'являтимуться оновлення про ваші проєкти.'}
              </div>
            </div>
          ) : (
            GROUPS.map((g) => {
              const items = visible.filter((n) => n.group === g.key);
              if (!items.length) return null;
              return (
                <div key={g.key} className={styles.group}>
                  <div className={styles.groupLabel}>{g.label}</div>
                  <div className={styles.list}>
                    {items.map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        onMarkRead={markRead}
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
