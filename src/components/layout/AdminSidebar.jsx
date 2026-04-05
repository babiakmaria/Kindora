import React from 'react';
import { ADMIN_NAV } from '../../data/data';
import styles from './AdminSidebar.module.css';

const MANAGEMENT_NAV = [
  { label: 'Категорії',   path: 'admin-cats'      },
  { label: 'Оголошення',  path: 'admin-ann'       },
  { label: 'Аналітика',   path: 'admin-analytics' },
];

const AdminSidebar = ({ activePage, onNavigate }) => (
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
          МЧ
        </div>
        <div>
          <p className={styles.avatarName}>Марія Чен</p>
          <span className={styles.avatarRole}>Адміністратор</span>
        </div>
      </div>
    </div>
  </div>
);

export default AdminSidebar;
