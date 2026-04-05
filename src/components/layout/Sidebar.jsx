import React from 'react';
import Avatar from '../common/Avatar';
import { USER_NAV, USER_NAV_BOTTOM } from '../../data/data';

const Sidebar = ({ activePage, onNavigate }) => (
  <div className="sidebar">
    <div className="sb-left">
      <div className="sb-logo">Kindora</div>

      {USER_NAV.map((item) => (
        <div
          key={item.path}
          className={`sb-link${activePage === item.path ? ' active' : ''}`}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </div>
      ))}
    </div>

    <div className="sb-right">
      <div className="sb-divider" />

      {USER_NAV_BOTTOM.map((item) => (
        <div
          key={item.path}
          className={`sb-link${activePage === item.path ? ' active' : ''}`}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
          {item.badge && <span className="sb-badge">{item.badge}</span>}
        </div>
      ))}

      <div
        className="sb-avatar"
        onClick={() => onNavigate('profile')}
        title="Перейти до мого профілю"
      >
        <Avatar initials="АК" />
        <div className="avatar-info">
          <p>Анна К.</p>
          <span>Учасник</span>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;
