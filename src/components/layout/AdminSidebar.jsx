import React from 'react';
import { ADMIN_NAV } from '../../data/data';
import styles from './AdminSidebar.module.css';

const MANAGEMENT_NAV = [
  { label: 'Категорії',   path: 'admin-cats'      },
  { label: 'Оголошення',  path: 'admin-ann'       },
  { label: 'Аналітика',   path: 'admin-analytics' },
];

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const getInitials = (user) => {
  if (!user) return 'АД';
  const first = (user.first_name || '')[0] || '';
  const last  = (user.last_name  || '')[0] || '';
  return (first + last).toUpperCase() || 'АД';
};

const getDisplayName = (user) => {
  if (!user) return 'Адміністратор';
  return [user.first_name, user.last_name].filter(Boolean).join(' ');
};

const AdminSidebar = ({ activePage, onNavigate, currentUser, onLogout }) => (
  <div className={styles.navbar}>
    <div className={styles.left}>
      <div className={styles.logo}>Kindora</div>

      {ADMIN_NAV.map((item) => (
        <div
          key={item.path}
          className={`${styles.link} ${activePage === item.path ? styles.active : ''}`}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </div>
      ))}

      <div className={styles.divider} />

      {MANAGEMENT_NAV.map((item) => (
        <div
          key={item.path}
          className={`${styles.link} ${activePage === item.path ? styles.active : ''}`}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </div>
      ))}
    </div>

    <div className={styles.right}>
      <div
        className={styles.avatar}
        onClick={() => onNavigate('profile')}
        title="Перейти до мого профілю"
      >
        <div
          className="avatar"
          style={{ background: 'linear-gradient(135deg,#FF6B9D,#8B5CF6)', width: 30, height: 30, fontSize: 11 }}
        >
          {getInitials(currentUser)}
        </div>
        <div>
          <p className={styles.avatarName}>{getDisplayName(currentUser)}</p>
          <span className={styles.avatarRole}>Адміністратор</span>
        </div>
      </div>

      {onLogout && (
        <div
          className={styles.link}
          onClick={onLogout}
          title="Вийти"
          style={{ marginTop: 4, opacity: 0.65, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <LogoutIcon />
          Вийти
        </div>
      )}
    </div>
  </div>
);

export default AdminSidebar;
