import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../common/Avatar';
import { USER_NAV, USER_NAV_BOTTOM } from '../../data/data';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const Sidebar = ({ activePage, onNavigate, searchable = false, onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch && onSearch(e.target.value);
  };

  const openSearch = () => setSearchOpen(true);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    onSearch && onSearch('');
  };

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) closeSearch();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchOpen && containerRef.current && !containerRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    closeSearch();
  };

  return (
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

        {searchable && (
          <div ref={containerRef} className={`sb-search${searchOpen ? ' sb-search--open' : ''}`}>
            <button
              className="sb-search-icon"
              onClick={searchOpen ? closeSearch : openSearch}
              aria-label={searchOpen ? 'Закрити пошук' : 'Відкрити пошук'}
              type="button"
            >
              <SearchIcon />
            </button>
            <form onSubmit={handleSubmit} className="sb-search-form">
              <input
                ref={inputRef}
                className="sb-search-input"
                placeholder="Пошук проєктів…"
                value={query}
                onChange={handleChange}
              />
            </form>
          </div>
        )}
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
};

export default Sidebar;
