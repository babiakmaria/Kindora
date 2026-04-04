import React, { useState } from 'react';
import Avatar from '../common/Avatar';

const Topbar = ({
  searchable = false,
  title,
  onSearch,
  adminMode = false,
  onNavigate,
  onNewProject,
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch && onSearch(e.target.value);
  };

  return (
    <div className="topbar">
      {searchable ? (
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            style={{ paddingLeft: 14, width: 220, borderRadius: 24, background: 'var(--neu)' }}
            placeholder="Пошук проєктів…"
            value={query}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>{title}</div>
      )}

      <div className="topbar-right">
        {!adminMode && (
          <span className="badge badge-pink">Весна 2025</span>
        )}
        {adminMode && (
          <>
            <button className="btn btn-ghost btn-sm">Експорт звіту</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNewProject && onNewProject()}
            >
              + Створити проєкт
            </button>
          </>
        )}

        {adminMode && (
          <>
            <div className="notif-btn">
              <div className="notif-dot" />
            </div>

            <div
              onClick={() => onNavigate && onNavigate('profile')}
              style={{ cursor: 'pointer' }}
              title="Перейти до мого профілю"
            >
              <Avatar
                initials="МЧ"
                gradient="linear-gradient(135deg,#FF6B9D,#8B5CF6)"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Topbar;
